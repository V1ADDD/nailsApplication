# Research: Profile shell and client account

The approach follows `specs_requests/007-identity-client-account.md`, the clarifications of the spec and the constitution 4.4.0. Where the request and the code of specs 001–006 disagree, the code wins and the change is recorded here.

The request predates spec 003's switch to phone sign-in. Its `change-password` endpoint, the "sign-in email" and the direct phone save are replaced by the clarified email, phone and «Выйти на других устройствах» rules (R2–R4). Its «Перенести» as cancel and rebook is replaced by the move request (R9).

## R1. The account data lives on `identity.users`

- **Decision**: new columns on `ApplicationUser`, not a separate `identity.profiles` table:
  - `PhotoUrl`;
  - `Telegram`, `Viber`;
  - `PreferredContact` (`Messages` | `Phone`, default `Messages`);
  - `NotifyPush`, `NotifyEmail`, `NotifySite`, `NotifyReminders` (default true).

  The email uses `IdentityUser`'s existing `Email` and `NormalizedEmail`.
- **Rationale**:
  - The fields are one-to-one with the account and are read on every `/me`.
  - `IdentityUser` already carries `Email`, so a second table would split one record in two and need a join on every session read.
- **Alternatives**: a separate `identity.profiles` table. Rejected: it gives no isolation benefit inside one module and adds a join.

## R2. Email: optional and unique, never used to sign in

- **Decision**:
  - `IdentityOptions.User.RequireUniqueEmail` stays false, because an account may have no email.
  - `AccountService.UpdateProfileAsync` checks uniqueness itself: `users.FindByEmailAsync`, and another account with that email → 409 `email-taken` «Эта почта уже используется другим аккаунтом».
  - The configuration makes Identity's `EmailIndex` on `NormalizedEmail` unique, filtered on `normalized_email IS NOT NULL`. A race ends as a unique violation, mapped to the same 409.
  - The format check is `[EmailAddress]`, plus the field message «Проверьте адрес почты».
  - `EmailConfirmed` stays false, and nothing sends mail to the address.
  - The email is set directly (`user.Email` plus `UserManager.UpdateNormalizedEmailAsync`), not through `SetEmailAsync`, which changes the security stamp. Changing the email therefore keeps other devices signed in, like the phone change.
- **Rationale**: the clarification says optional, unique and unconfirmed. Identity's own unique-email validator would refuse an empty email, which the clarification allows.
- **Alternatives**: `RequireUniqueEmail = true`. Rejected: it makes the email required.

## R3. Changing the phone is confirmed by an SMS code

- **Decision**:
  - A new table `identity.phone_change_codes` (`PhoneChangeCode`: `UserId` unique, `Phone`, `CodeHash`, `SentAt`, `ExpiresAt`, `Attempts`) holds the pending change.
  - It uses the same `PhoneCodeOptions` and the pure `PhoneCodeState` rules as sign-in (length, lifetime, resend interval, attempts), and the same hashing.
  - `POST /api/identity/me/phone/code { phone }`:
    1. normalize with `BelarusPhone`, else 400 `phone-invalid`;
    2. the caller's own number → 409 `phone-same` «Это ваш текущий номер»;
    3. a number another account uses (`FindByNameAsync`) → 409 `phone-taken` «Этот номер уже привязан к другому аккаунту», and no SMS is sent;
    4. a resend inside the interval → 429 `code-too-soon`;
    5. otherwise send «Код для смены номера в «Мастера рядом»: {code}. Никому его не сообщайте.»
  - `POST /api/identity/me/phone { phone, code }`:
    - verifies the code like sign-in (`code-invalid`, `code-expired`);
    - sets `UserName`, `NormalizedUserName` and `PhoneNumber` together through `UserManager.UpdateAsync`, which checks `UserNameIndex` uniqueness;
    - does **not** change the security stamp, so other devices stay signed in (spec Assumptions);
    - removes the code row and returns `MeResponse`. A unique-index race maps to `phone-taken`.
  - When `PhoneCode:VerificationRequired` is false (Development), both calls behave as sign-in does: no SMS is sent, the answer has `sent: false`, the client skips the code step, and a warning is logged.
  - Both endpoints use the per-address `identity` rate-limit policy.
- **Rationale**: the phone is the sign-in identity (constitution IX). The clarification requires the code.
- **Alternatives**:
  - Reuse `identity.phone_codes`. Rejected: its unique `phone` row would be shared with a sign-in attempt for the same number.
  - `UserManager.ChangePhoneNumberAsync` with Identity tokens. Rejected: those tokens change the stamp and sign out every device.
- **Masters' copy**: a master profile keeps its own phone (spec 008 edits it). Chats show a client's current account phone.

## R4. «Выйти на других устройствах»

- **Decision**:
  - **Restore stamp validation.** `IdentityModule` replaces the cookie `Events` object, which dropped `OnValidatePrincipal`. It now sets `OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync`. `AddSignInManager` already registers `ISecurityStampValidator`.
  - **Validation interval.** `SecurityStampValidatorOptions.ValidationInterval` comes from the new option `Modules:Identity:Session:StampValidationInterval`: `00:00:00` in every environment, so the check runs on every request. "At once" in FR-020 needs this. The cost per signed-in request: the validator loads the user by key, rebuilds the claims principal through `TenantClaimsPrincipalFactory`, and renews the cookie, so every response carries a `Set-Cookie` with unchanged `HttpOnly`, `SameSite=Strict` and `Secure` flags. The interval stays a setting, so it can be raised if the cost shows.
  - **`POST /api/identity/sign-out/others`** (signed in):
    1. `UserManager.UpdateSecurityStampAsync(user)`;
    2. `SignInManager.RefreshSignInAsync(user)`, so this cookie carries the new stamp;
    3. `IRealtimeConnections.AbortAsync(userId)`;
    4. 204.
  - **New core `Common/Realtime/IRealtimeConnections`**, implemented in `Host/Realtime`:
    - `AppHub` registers each `HubCallerContext` by user on connect and removes it on disconnect. This is an in-memory map, matching the one-instance assumption of spec 006.
    - Aborting closes every connection of the user.
    - The current tab reconnects at once with its refreshed cookie. Other devices fail the WebSocket upgrade with 401.
  - **Client.** `RealtimeService` exposes `connectionLost$`, emitted on the first failed reconnect attempt while it keeps retrying. `SessionStore` re-reads `/me` then, and a 401 already marks the session signed out (`unauthorizedInterceptor`). A revoked device leaves the app within seconds, not after the whole retry sequence (about 47 s).
- **Rationale**:
  - Without the abort, a revoked device keeps receiving message previews on its open socket (constitution IX).
  - The stamp is the standard ASP.NET Core Identity mechanism.
- **Alternatives**:
  - A short interval such as 1 minute. Rejected: FR-020 says other sessions end at once.
  - A per-device session table. Rejected: more storage, and it isn't needed for "everyone but me".

## R5. Profile update, contacts and notifications

- **Decision**:
  - **`PATCH /api/identity/me`** takes `UpdateProfileRequest` with every field optional. A missing (null) field is unchanged; an empty string clears `email`, `photoUrl`, `telegram` and `viber`.
  - **Name**: trimmed, 1–120 characters, else field `name` «Введите имя» (the sign-in rule).
  - **Photo**: a non-empty `photoUrl` must pass `IMediaOwnership.IsOwnedByAsync(url, caller)`, else 403 `media-not-owned` (spec 006).
  - **Telegram**: normalized by the pure `Identity/Rules/TelegramName.Normalize` (strip «@» and spaces; `^[A-Za-z0-9_]{5,32}$`; stored as `@name`), else field `telegram` «Проверьте имя в Telegram».
  - **Viber**: normalized by `BelarusPhone`, else field `viber` «Введите белорусский номер в формате +375 XX XXX-XX-XX».
  - **Contact method**: `preferredContact` is `messages` or `phone`.
  - The update returns `MeResponse`.
  - **`PUT /api/identity/me/notifications`** takes `{ push, email, site, reminders }` and returns `NotificationSettingsResponse`. The values are only stored (clarification).
  - **`MeResponse`** gains `email`, `photoUrl`, `telegram`, `viber`, `preferredContact` and `notifications`.
- **Rationale**: one PATCH serves both the edit sheet and the contact sheet. The phone has its own confirmed flow (R3).
- **Alternatives**: separate endpoints per sheet. Rejected: duplicate validation and response building.

## R6. What Masters needs from Identity

- **Decision**: two Identity contracts, in line with constitution VI (Masters may use `Identity.Contracts`):
  - `IAccountDirectory.ProfileAsync(userId)` → `AccountProfile(Name, Phone, Email, PhotoUrl, Telegram, Viber)`. This is an addition to the existing directory.
  - New `IAccountLinks.SetMasterAsync(userId, masterId)`: an `ExecuteUpdate` of `users.master_id`, inside the caller's transaction.
- **Rationale**: Masters must not touch `identity.users`, and Identity must not depend on Masters. Today only the seed writes `MasterId`.
- **Alternatives**: Identity resolving `MasterId` from `IMasterDirectory`. Rejected: it would make the always-on Identity depend on a switchable module.

## R7. «Стать мастером» (`POST /api/masters/me`)

- **Decision**: `MasterOnboardingService.CreateAsync(BecomeMasterRequest { categoryId, city, address })`, inside `unitOfWork.InTransactionAsync`.
  - **Checks**:
    - `categoryId` through `ICatalog.FindCategory`, else field `categoryId` «Выберите направление»;
    - `city` one of `Modules:Masters:Cities:Items[].Name`, else field `city` «Выберите город»;
    - `address` trimmed, 1–200 characters, else field `address` «Укажите адрес»;
    - an existing (even deleted) master for the user → 409 `master-exists` «У вас уже есть профиль мастера», also on a race (unique `masters.user_id`).
  - **The new `Master`**:
    - name, photo, phone, email, Telegram and Viber from `IAccountDirectory.ProfileAsync`;
    - `Specialty` = the category's `Specialty`, and `CategoryIds = [categoryId]`;
    - the city's centre `Lat`/`Lng` from settings, and `District` empty;
    - `ShowOnline` true, `VerificationStatus.None`, `ExperienceYears` 0, `About` empty;
    - **`LocationSet = false`** (R8).
  - **The new `Schedule`**: values from `Modules:Masters:NewMaster` (`WorkDays` [1,2,3,4,5], `TimeFrom` 10:00, `TimeTo` 19:00, `SlotMinutes` 90, `Capacity` 1, `AutoConfirmEnabled` false, `AutoConfirmAfterMinutes` 30). No slots are generated: today only the seed creates slots, and the schedule screen (spec 010) will.
  - **Link and answer**: `IAccountLinks.SetMasterAsync`, then `ISessionService.MeAsync` returns `MeResponse` with `masterId`. No token is reissued.
  - **`GET /api/masters/cities`** (anonymous) returns the six names from settings for the «Город» field. The «Направление» field uses the catalog the client already has (`CatalogStore`), shown as «Маникюр — мастер ногтей» (category name — lowercased specialty).
- **Rationale**:
  - City centres and the default schedule are settings (no hardcoded values).
  - The catalog's `Specialty` already exists for every category.
- **Alternatives**: a geocoder. Rejected by the request; spec 008 adds the map point.

## R8. A new master stays hidden until it has a service and a map point

- **Decision**:
  - New column `masters.masters.location_set` (bool, default **true**, so the existing and seeded masters stay visible). `CreateAsync` writes false, and spec 008's map point sets it true.
  - A master is *listed* when `DeletedAt is null && LocationSet && Services.Any()`. One expression, `MasterVisibility.Listed`, is used by:
    - `MasterSearchRepository.FindCandidatesAsync` (it already requires a service);
    - the suggestions query;
    - `MasterProfileRepository.FindAsync` for the profile, card, slots and reviews.

    For anyone but the owner, an unlisted master is 404 `master-not-found`. `IsOwn` keeps the owner's view.
  - Favourites and bookings can't reach an unlisted master, because adding a favourite and booking both look up the master the same way.
  - `IMasterDirectory` (chats) is unchanged: chats with the master's own clients keep working (clarification).
- **Rationale**: the clarification hides the profile everywhere public. Today the seed creates every master with services, so nothing visible changes.

## R9. The move request («Перенести»)

- **Decision**: a new entity `BookingMove` in table `masters.booking_moves`:
  - fields `Id`, `BookingId`, `SlotId`, `StartAt`, `DurationMin`, `Status` (`Open`, `Accepted`, `Declined`, `Withdrawn`, `Cancelled`, `Lapsed`), `LapsesAt`, `ResolvedAt`, plus `IAuditable` and `IVersioned`;
  - a unique partial index on `booking_id WHERE status = 'Open'`, and an index on `(status, lapses_at)` for the sweep.
- **Request** (`POST /api/masters/bookings/{id}/move { slotId }`). The caller must be the booking's client, else 403 `not-booking-party`. Then:
  - the booking must be a site booking that is pending or confirmed with a future start, else 409 `cannot-move` «Эту запись уже нельзя перенести»;
  - no open move, else 409 `move-exists` «Перенос уже ждёт ответа мастера»;
  - the slot must be this master's, free and in the future, else 409 `slot-taken` «Это окно уже занято, выберите другое время»;
  - the duration is `max(service.DurationMin, slot.DurationMin)`;
  - overlapping another of the client's active bookings, or the held time of another of the client's open move requests (`Bookings.Conflicts` over both, from `OpenMovesOfClientAsync`, excluding this booking) → 409 `move-overlaps` «В это время у вас уже есть другая запись». Two requests can therefore never hold the same hour.

  The new slot becomes `Pending` with `BookingId = booking.Id`, which holds it. The slot `Version` token makes two holds race safely.
- **Lapse time** (`BookingMoves.LapsesAt`, pure): the earlier of `Bookings.PendingReleaseAt(newStart, now)` and the current booking's start.
- **Accept** (`POST …/move/accept`, master side only):
  - the booking takes the move's `StartAt`, `DurationMin` and `SlotId`, with `Status = Confirmed` and `ConfirmedAt = now`;
  - the old slot becomes `Free` (with `BookingId` cleared) and the new one `Booked`; the move becomes `Accepted`.
- **Decline** (`POST …/move/decline`, master side) or **withdraw** (`DELETE …/move`, client side): the held slot becomes `Free`, and the move becomes `Declined` or `Withdrawn`. Acting on a move that isn't open, or doesn't exist → 409 `move-not-open` «Запрос на перенос уже неактуален».
- **Cancelling the booking** (either side, or automatically) ends its open move with the status `Cancelled` and frees the held slot, without a move event. This happens in `BookingChanges.CancelAsync`.
- **A new booking of the client** that overlaps the held time of one of their open moves withdraws that move (`Withdrawn`, `MoveWithdrawn`, «Клиент отменил перенос»). `BookingService.CreateAsync` adds the client's open moves to the conflict check, so a held time never ends up overlapping a booking.
- **Sweep**: `BookingTimeRules` gains a fourth step that lapses open moves with `LapsesAt <= now`, before the expire step.
- **Rules**: `BookingTransitions` gains `Move(state, now)`, which allows pending or confirmed with a future start. A move is never a cancellation and doesn't touch the rating.
- **Events**: `BookingChangeKind` gains `MoveRequested`, `MoveAccepted`, `MoveDeclined`, `MoveWithdrawn` and `MoveLapsed`. Chats' `ChatTexts` maps them to the spec's system messages:

  | Kind | Text |
  |---|---|
  | MoveRequested | «Клиент предлагает перенести запись на {d MMM, HH:mm}» |
  | MoveAccepted | «Мастер принял перенос на {d MMM, HH:mm}» |
  | MoveDeclined | «Мастер отклонил перенос» |
  | MoveWithdrawn | «Клиент отменил перенос» |
  | MoveLapsed | «Запрос на перенос истёк» |

  The date comes from a new core helper `Common/Time/RussianDate.DayMonthTime(instant)`. It uses the Minsk offset and `ru-RU` genitive month abbreviations without the dot, the same output as the client's `formatShortDate` + `formatTime`.
- **Booking card**: `BookingCard` gains `Move: BookingMoveCard?` (`Start`, `DurationMin`, `LapsesAt`, `Status`), carrying the open move only. «Мастер принял перенос на …» takes its date from `card.Start`, because the accepted booking already has the new time; the other move messages have no date. Chats needs no Masters internals.
- **A move on a pending booking the master created**: the client proposed the new time, so accepting it confirms the booking without a separate client confirmation.
- **Rationale**: the clarification wants the master to confirm the new time, with the booking unchanged until then. Holding the slot keeps the proposal valid.
- **Alternatives**:
  - Columns on `bookings`. Rejected: the history of declined and lapsed requests matters for the system messages, and a separate row keeps the booking's concurrency simple.
  - Auto-cancelling overlaps as a new booking does. Rejected: a proposal should not destroy other bookings before the master agrees.
- **Master side without chats**: with Chats off, the master has no place to answer until spec 009, so the request lapses (spec edge case).

## R10. `bookingChanged` moves from Chats to Masters

- **Decision**:
  - `Masters/Services/BookingEvents.PublishAsync` pushes `bookingChanged { booking: BookingCard }` itself through `IRealtimePublisher`, to the master's user and the client, after the handlers ran.
  - Chats' `ChatEvents.BookingChangedAsync` and its `BookingChangedEvent(ChatId, Booking)` are removed. The payload `BookingChangedEvent(BookingCard Booking)` moves to `Masters/Responses/`.
  - On the client, `ChatThreadStore` matches the event by booking id in its `bookings` instead of by `chatId`.
- **Rationale**: «Мои записи» needs live updates when Chats is off (FR-007). Two events for one change would duplicate the work.
- **Alternatives**: a second masters event. Rejected as duplication.

## R11. Client bookings, reviews and favourites (Masters)

- **Decision**:
  - **`GET /api/masters/bookings/mine?scope=upcoming|past&page&pageSize`** → `PagedResponse<MyBookingResponse>`:
    - upcoming is pending or confirmed with `StartAt > now`, ordered by `StartAt` ascending;
    - past is the rest, ordered by `StartAt` descending;
    - only site bookings of the caller (index `(client_user_id, start_at)` exists);
    - page size from `Modules:Masters:MyBookings` (20, max 50);
    - both scopes are paginated, and the panel loads the upcoming scope in pages too.
  - **`GET /api/masters/bookings/{id}`** → `MyBookingResponse` for a party. Live updates refetch one card.
  - **`MyBookingResponse`**: the `BookingResponse` fields, plus `canReview`, `myReview` (`{ rating, text, date }`) and `move` (`BookingMoveCard?`, open only).
  - **`canReview`** is the pure `ReviewWindow.CanWrite(status, end, now, windowDays, hasReview)`: completed, the visit's end within `Modules:Masters:Reviews:WindowDays` (30) days, and no review by this side. The end is `StartAt + DurationMin`: that is when the sweep completes the booking, so no `completed_at` column is needed.
  - **`POST /api/masters/bookings/{id}/reviews { rating, text? }`** → 201 `ReviewResponse`. It works for either side:
    - not a party → 403 `not-booking-party`;
    - not completed → 409 `not-completed`;
    - the window closed → 409 `review-window-closed`;
    - this side already wrote one → 409 `review-exists` (also on a race, unique `(booking_id, author_role)`);
    - no rating, or one outside 1–5 → 400 field `rating` «Поставьте оценку»;
    - text over 1000 characters → 400 field `text` «Не длиннее 1000 символов».

    The review takes the booking's master, client and subcategory. The rating stays derived, so search and profile show it at once.
  - **`GET /api/masters/reviews/mine?about=false|true&page&pageSize`** → `MyReviewsResponse { writtenCount, aboutCount, items, page, pageSize, totalCount }`. Written means reviews with `ClientUserId = caller && AuthorRole = Client`; about means `ClientUserId = caller && AuthorRole = Master`. Items are `MyReviewResponse { id, masterId, masterName, masterPhotoUrl, serviceName, rating, text, date }`, newest first. The counts feed the tab labels (clarification: only the client sees reviews about them here).
  - **`GET /api/masters/favorites?page&pageSize`** → `PagedResponse<FavoriteMasterResponse { id, name, photoUrl, specialty, rating, reviewsCount, verified }>`, newest first, deleted and unlisted masters skipped. The rating reuses the search projection.
- **Index**: `masters.reviews (client_user_id, author_role, created_at)` for «Мои отзывы» and «Отзывы обо мне».
- **Seed**: the scenario's fixed reviews get the `BookingId` of the matching completed booking, so «Оставить отзыв» is hidden for them. A new completed visit of Анна at Марина Ковалёва, 5 days ago and without a review, shows «Оставить отзыв». Анна also gets a demo photo URL, a Telegram name and a Viber number.

## R12. The client: the profile shell and module sections

- **Decision**: `ModuleManifest` gains an optional `profile: ProfileContribution`:

  ```ts
  interface ProfileSection { path; label; title; icon: IconName; order; loadComponent }
  interface ProfileContribution {
    clientSections?: ProfileSection[];
    masterRoutes?: Routes;
    settingsActions?: Type<unknown>[];
  }
  ```

  - **`buildRoutes`** replaces the flat `profile` route with `ProfileShell` (core) and these children:
    - `client` (`ClientAccount`, core), whose children are the manifests' `clientSections` plus the core `settings` (`SettingsPanel`, order 40). An empty path redirects with `clientSectionRedirect`: an old `?tab=` picks the section, `tab` is dropped and the other parameters are kept; otherwise the first section.
    - `master`: the manifests' `masterRoutes`, wrapped by `requireMasterSide`. Without a master profile, or with no manifest offering master routes, it redirects to `client`.
    - `''`, which redirects to `client`.
  - **«Мастер»** shows when `me.masterId` is set and some manifest offers `masterRoutes`, so core never names the masters module.
  - **Masters' manifest contributes**:
    - `bookings`, `favorites` and `reviews` (orders 10, 20, 30);
    - a master placeholder route (`MasterSidePlaceholder`, «Кабинет мастера появится здесь» with «Перейти в режим клиента»), replaced by spec 008;
    - the settings action `MasterAction`, which shows «Стать мастером» or «Перейти в кабинет мастера».
  - **The mode follows the address**: `ProfileShell` watches `NavigationEnd` and calls `session.setMode(side)` when the side differs from `session.mode()`.
  - **The segment and swipe** navigate to `/profile/<side>`, and the route applies the mode.
  - **`AccountPage` is removed**: its card, links, «Напишите нам», «Справка» and logout move into `ClientAccount` and `SettingsPanel`.
- **Rationale**: constitution VII says modules contribute to the frame only through their manifest, and the lint rules forbid `name:core` from importing any module library, `contracts` included. The manifest is the only allowed channel (constitution VI: introduced by this spec).
- **Alternatives**:
  - A masters `contracts` library with components. Rejected: core can't import it, and `type:contracts` can't depend on UI libraries.
  - Masters owning the whole `/profile`. Rejected: settings and the shell must work with Masters off.

## R13. Shared client pieces (no duplication)

- **Decision**:
  - **`CancelBookingSheet`** moves from `web/chats/feature/bookings` to `web/common/overlays`, parameterized by `CancelBookingTexts`:
    - heading, summary, reasons, «Другое», the mutual label and its default, the warning, and the submit label.

    Chats keeps its 006 texts and the profile passes the old app's (spec Assumptions).
  - **`SegmentedToggle`** (new, `web/common/ui`, over `mat-button-toggle-group`) has the inputs `options`, `value`, `label` and `disabled`, and the output `changed`. Chats' `ModeSwitch` and the profile's «Режим профиля» both use it.
  - **`Swipe`** (new directive `appSwipe`, `web/common/ui`) has the outputs `swipeLeft` and `swipeRight`, with a threshold of 50 px.
    - It reacts only to pointers of type `touch`.
    - It ignores gestures that start inside an element that scrolls sideways (`scrollWidth > clientWidth`) or inside `[data-no-swipe]`.
    - It ignores mostly vertical movement.
    - The masters `PhotoViewer` switches to it.
  - **`SlotPicker`** (new, masters feature) holds the day chips and time chips extracted from `BookingSheet`. `BookingSheet` and the new `MoveBookingSheet` both use it.
  - **`CodeInput`** (core identity) is reused unchanged by the phone sheet.
  - **The `bookingTag` and `bookingLines` mapping** is pure, in `shared/masters/data-access/my-bookings/booking-tags.ts`. It covers the tags and lines of FR-008.
- **Rationale**: «Отмена записи» exists in chats and the profile, and the mode switch in chats and the profile. The constitution says code used by several modules lives in the core.

## R14. Client stores

- **Decision**:
  - `shared/core/data-access`:
    - `IdentityApi` gains `updateProfile`, `setNotifications`, `requestPhoneCode`, `changePhone` and `signOutOthers`;
    - `SessionStore` gains `patchMe(me)` and `meError`, and re-reads `/me` on `realtime.connectionLost$`;
    - `RealtimeService` gains `connectionLost$`.
  - `shared/masters/data-access`:
    - `MyBookingsStore`: per scope, `resource` pages, `loadMore`, `refresh(id)` on `bookingChanged`, `confirm`, `cancel`, `requestMove`, `withdrawMove`, `review`;
    - `MyReviewsStore` (two tabs with counts);
    - `FavoriteMastersStore` (pages; removal through `FavoritesStore.toggle` keeps the ids in sync, optimistic, rolled back on failure);
    - `CitiesApi` (in `MastersApi`).
  - `ChatsApi` gains `acceptMove` and `declineMove`. `BookingCardView` shows the move line and, for the master, «Принять перенос» / «Отклонить перенос».
- **Rationale**: the stores follow the existing pattern of a promise API, `resource` and signals.

## R15. Settings and options

- **Decision** (all three environments unless noted):
  - **`Modules:Identity:Session`**: `StampValidationInterval` `00:00:00`. Options class `SessionOptions`.
  - **`Modules:Masters:Reviews`**: adds `WindowDays` 30.
  - **`Modules:Masters:MyBookings`**: `DefaultPageSize` 20, `MaxPageSize` 50.
  - **`Modules:Masters:Favorites`**: `DefaultPageSize` 20, `MaxPageSize` 50.
  - **`Modules:Masters:Cities:Items`**: the city centres:

    | City | Lat | Lng |
    |---|---|---|
    | Минск | 53.9038 | 27.5567 |
    | Брест | 52.0976 | 23.7341 |
    | Витебск | 55.1904 | 30.2049 |
    | Гомель | 52.4345 | 30.9754 |
    | Гродно | 53.6694 | 23.8131 |
    | Могилёв | 53.9168 | 30.3449 |

    Validated as non-empty.
  - **`Modules:Masters:NewMaster`**: the schedule defaults of R7.
- The app version «Версия 1.0» and the five rules are user-facing texts of the spec, so they are constants in the core settings panel, not settings.

## R16. Help

- **Decision**: what changes in which file is in the plan's Help section. Pictures are taken by the README procedure at 390×844, scale 2, from the demo world:
  - new: «Записи», the review sheet, «Настройки» and the move sheet;
  - retaken: `sign-out/profile.png`, which now shows the settings.
