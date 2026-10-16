---

description: "Task list for the profile shell and client account"
---

# Tasks: Profile shell and client account

**Input**: Design documents from `/specs/007-identity-client-account/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/identity-masters.md

**Tests**: None. This project writes no tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Infrastructure: `api/Nails.Infrastructure/Modules/<Module>/{Entities,Configurations,Contracts,Repositories,Models,Options}/`, migrations `api/Nails.Infrastructure/Persistence/Migrations/`
- Application: `api/Nails.Application/Modules/<Module>/{Contracts,Services,Requests,Responses,Options,Rules,Seed,Events}/`, registration `<Module>Module.cs`, core `api/Nails.Application/Common/{Exceptions,Realtime,Time}/`
- API: `api/Nails.Api/Modules/<Module>/Controllers/`, core `api/Nails.Api/Host/{Extensions,Realtime}/`, settings `api/Nails.Api/appsettings.{Development,Docker,Production}.json`, help `api/Nails.Api/Modules/Help/Content/ru/articles/<module>.json`
- Client: `client/libs/shared/<module>/data-access/`, `client/libs/web/<module>/feature/`, core `client/libs/{shared,web}/{core,common}/`
- Every C# type in its own file named after the type; no comments; Russian user-facing text, English code. Errors are `AppException` subclasses with codes from `ErrorCodes`; options use `AddValidatedOptions`.

## Phase 1: Setup

- [x] T001 Add the settings to `api/Nails.Api/appsettings.Development.json`, `appsettings.Docker.json` and `appsettings.Production.json`, complete in all three (research R15, data-model «Settings»):
  - `Modules:Identity:Session` { `StampValidationInterval` `00:00:00` };
  - `Modules:Masters:Reviews:WindowDays` 30, next to the existing page sizes;
  - `Modules:Masters:MyBookings` { `DefaultPageSize` 20, `MaxPageSize` 50 };
  - `Modules:Masters:Favorites` { `DefaultPageSize` 20, `MaxPageSize` 50 };
  - `Modules:Masters:Cities:Items`: an array of six `{ Name, Latitude, Longitude }` (the `Items` key matches `CitiesOptions.Items`):

    | Name | Latitude | Longitude |
    |---|---|---|
    | Минск | 53.9038 | 27.5567 |
    | Брест | 52.0976 | 23.7341 |
    | Витебск | 55.1904 | 30.2049 |
    | Гомель | 52.4345 | 30.9754 |
    | Гродно | 53.6694 | 23.8131 |
    | Могилёв | 53.9168 | 30.3449 |

  - `Modules:Masters:NewMaster` { `WorkDays` [1,2,3,4,5], `TimeFrom` `10:00`, `TimeTo` `19:00`, `SlotMinutes` 90, `Capacity` 1, `AutoConfirmEnabled` false, `AutoConfirmAfterMinutes` 30 }.
- [x] T002 [P] Add the error codes `email-taken`, `phone-same`, `phone-taken`, `not-completed`, `review-window-closed`, `review-exists`, `cannot-move`, `move-exists`, `move-not-open`, `move-overlaps`, `master-exists` to `api/Nails.Application/Common/Exceptions/ErrorCodes.cs`.

---

## Phase 2: Foundational (Blocking Prerequisites)

### Model changes and the migration

- [x] T003 [P] Add to `api/Nails.Infrastructure/Modules/Identity/Entities/ApplicationUser.cs`: `PhotoUrl` (string?, max 500), `Telegram` (string?, max 33), `Viber` (string?, max 13), `PreferredContact PreferredContact`, and `NotifyPush`, `NotifyEmail`, `NotifySite`, `NotifyReminders` (bool, each initialized `= true`). Add the constants `PhotoUrlMaxLength = 500`, `TelegramMaxLength = 33` and `ViberMaxLength = 13`. Create the enum `api/Nails.Infrastructure/Modules/Identity/Entities/PreferredContact.cs` (`Messages`, `Phone`).
- [x] T004 Configure the new columns in `api/Nails.Infrastructure/Modules/Identity/Configurations/ApplicationUserConfiguration.cs`:
  - `preferred_contact`: string, max 10, `HasDefaultValue(PreferredContact.Messages).HasSentinel(PreferredContact.Messages)`;
  - the four `notify_*` columns: `HasDefaultValue(true).HasSentinel(true)`, with the C# initializers `= true` on the properties (T003). EF omits a value equal to the sentinel, so `true` falls back to the database default and an explicit `false` is always written. Existing rows get `true` from the migration;
  - Identity's `EmailIndex` on `NormalizedEmail` made **unique, filtered `"normalized_email" IS NOT NULL`** (research R2).
- [x] T005 [P] Create `api/Nails.Infrastructure/Modules/Identity/Entities/PhoneChangeCode.cs` (`IAuditable`: `Id`, `UserId`, `Phone` max 13, `CodeHash`, `SentAt`, `ExpiresAt`, `Attempts`) and `Configurations/PhoneChangeCodeConfiguration.cs`:
  - table `identity.phone_change_codes`;
  - **unique index on `UserId`**.
- [x] T006 [P] Add `bool LocationSet` to `api/Nails.Infrastructure/Modules/Masters/Entities/Master.cs` and configure it in `Configurations/MasterConfiguration.cs`: `HasDefaultValue(true).HasSentinel(true)`, with the C# initializer `public bool LocationSet { get; set; } = true;`.
  - The sentinel `true` makes EF always write `false` for a master created by «Стать мастером»; with the default `false` sentinel, `false` would be omitted and the database default `true` would make the new master visible.
  - Existing and seeded masters get `true`.
- [x] T007 [P] Create `api/Nails.Infrastructure/Modules/Masters/Entities/BookingMoveStatus.cs` (`Open`, `Accepted`, `Declined`, `Withdrawn`, `Cancelled`, `Lapsed`) and `Entities/BookingMove.cs` (`IAuditable`, `IVersioned`: `Id`, `BookingId`, `SlotId`, `StartAt`, `DurationMin`, `Status`, `LapsesAt`, `ResolvedAt?`, `Version`). Configure it in `Configurations/BookingMoveConfiguration.cs`:
  - table `masters.booking_moves`;
  - status stored as a string, max `MastersColumns.EnumMaxLength` (20);
  - `Version` as the concurrency token;
  - unique index `(BookingId)` filtered `"status" = 'Open'`;
  - index `(Status, LapsesAt)`.
- [x] T008 [P] Add the index `(ClientUserId, AuthorRole, CreatedAt)` to `api/Nails.Infrastructure/Modules/Masters/Configurations/ReviewConfiguration.cs`.
- [x] T009 Add the migration `AddClientAccount` in `api/Nails.Infrastructure/Persistence/Migrations/` with `dotnet ef migrations add AddClientAccount --project Nails.Infrastructure --startup-project Nails.Api`. Check that it is additive:
  - new columns with defaults (`location_set` default true, `notify_*` default true, `preferred_contact` default `Messages`);
  - two new tables;
  - two new indexes;
  - `EmailIndex` recreated as unique filtered.

### Core time and real time

- [x] T010 [P] Create `api/Nails.Application/Common/Time/RussianDate.cs` with `static string DayMonthTime(DateTimeOffset instant)` → «17 окт, 14:00»:
  - Minsk offset from `MinskTime`;
  - `ru-RU` `AbbreviatedMonthGenitiveNames` with the trailing dot removed;
  - 24-hour time;
  - the same output as the client's `formatShortDate` + `formatTime`.
- [x] T011 [P] Create `api/Nails.Application/Common/Realtime/IRealtimeConnections.cs` (`Task AbortAsync(Guid userId, CancellationToken)`) and implement it in `api/Nails.Api/Host/Realtime/HubRealtimeConnections.cs`:
  - a singleton `ConcurrentDictionary<Guid, ConcurrentDictionary<string, HubCallerContext>>`;
  - `Abort()` on every context of the user.
- [x] T012 Register and unregister each connection in `api/Nails.Api/Host/Realtime/AppHub.cs` (`OnConnectedAsync`, `OnDisconnectedAsync`), and register `HubRealtimeConnections` as `IRealtimeConnections` in `api/Nails.Api/Host/Extensions/RealtimeExtensions.cs`.

### `bookingChanged` moves to Masters (research R10)

- [x] T013 Create `api/Nails.Application/Modules/Masters/Contracts/BookingMoveCard.cs` (`Start`, `DurationMin`, `LapsesAt`, `BookingMoveStatus Status`) and add `BookingMoveCard? Move` to `Contracts/BookingCard.cs`. Fill it in the card query of `api/Nails.Infrastructure/Modules/Masters/Repositories/MasterDirectoryRepository.cs` with the booking's **open** move only (null when none is open).
- [x] T014 Add `MoveRequested`, `MoveAccepted`, `MoveDeclined`, `MoveWithdrawn`, `MoveLapsed` to `api/Nails.Application/Modules/Masters/Events/BookingChangeKind.cs`.
- [x] T015 Create `api/Nails.Application/Modules/Masters/Responses/BookingChangedEvent.cs` (`BookingCard Booking`).
  - `api/Nails.Application/Modules/Masters/Services/BookingEvents.cs`, after the handlers: load the cards through `IMasterDirectory.BookingCardsAsync` and push `RealtimeEvents.BookingChanged` with `BookingChangedEvent` to the master's user and the client (skip a missing client), through `IRealtimePublisher`.
  - Register `AddRealtimeEvent<BookingChangedEvent>()` in `MastersModule.cs`.
- [x] T016 Remove the `bookingChanged` publication from Chats:
  - delete `api/Nails.Application/Modules/Chats/Responses/BookingChangedEvent.cs` and its registration in `ChatsModule.cs`;
  - remove `ChatEvents.BookingChangedAsync` and its call in `Services/BookingChatHandler.cs`.
- [x] T017 Change `client/libs/shared/core/data-access/src/lib/realtime/realtime-events.ts` so `bookingChanged` is `{ booking: Schemas['BookingCard'] }`. Make `client/libs/shared/chats/data-access/src/lib/chat-thread-store.ts` replace the booking whose `id` is in its `bookings`, instead of matching `chatId`.

### Client core: manifest slot, profile shell, shared pieces

- [x] T018 [P] Create `client/libs/web/common/ui/src/lib/segmented-toggle.ts` (`app-segmented-toggle`, OnPush, `mat-button-toggle-group`), and export it from the lib index:
  - inputs `options: readonly { value: string; label: string }[]`, `value`, `label` (aria-label) and `disabled`;
  - output `changed: string`.

  Make `client/libs/web/chats/feature/src/lib/list/mode-switch.ts` use it with «Как клиент» / «Как мастер», keeping its behaviour.
- [x] T019 [P] Create the directive `client/libs/web/common/ui/src/lib/swipe.ts` (`[appSwipe]`) and export it:
  - outputs `swipeLeft` and `swipeRight`;
  - reacts only to `pointerType === 'touch'`, with a threshold of 50 px;
  - ignores mostly vertical movement (|dy| > |dx|);
  - ignores gestures that start inside an element that scrolls sideways (`scrollWidth > clientWidth` with `overflow-x` auto or scroll) or inside `[data-no-swipe]`.

  Switch `client/libs/web/masters/feature/src/lib/profile/photo-viewer.ts` to it and remove its own pointer handling.
- [x] T020 [P] Move `client/libs/web/chats/feature/src/lib/bookings/cancel-booking-sheet.ts` to `client/libs/web/common/overlays/src/lib/cancel-booking-sheet/cancel-booking-sheet.ts` and export it.
  - Parameterize it with `client/libs/web/common/overlays/src/lib/cancel-booking-sheet/cancel-booking-texts.ts`: `CancelBookingTexts { heading, summary?, reasons: readonly string[], otherReason, otherPlaceholder, mutualLabel, mutualDefault, warning, backLabel, submitLabel, defaultReason? }`.
  - The data becomes `{ texts, submit }`.
  - Chats' `bookings/booking-card.ts` passes its 006 texts: «Отмена записи», «Изменились планы», «Заболела», «Не успеваю», «Другое», «Опишите причину», «Отмена по договорённости (без последствий)», «Отмена без взаимного согласия снижает рейтинг», «Назад», «Отменить запись».
- [x] T021 Add to `client/libs/web/core/feature/src/lib/modules/module-manifest.ts`, and export the types from the lib index:
  - `ProfileSection { path; label; title; icon: IconName; order: number; loadComponent: () => Promise<Type<unknown>> }`;
  - `ProfileContribution { clientSections?: readonly ProfileSection[]; masterRoutes?: Routes; settingsActions?: readonly Type<unknown>[] }`;
  - `ModuleManifest.profile?: ProfileContribution`.

  Add `profileSlots` (an `InjectionToken` with `{ clientSections, hasMasterSide, settingsActions }`) built from the manifests in `modules/frame.ts`.
- [x] T022 Create `client/libs/web/core/feature/src/lib/profile/client-section-redirect.ts`, a `CanActivateFn` or redirect function for `/profile/client`:
  - with `?tab=<section>`, it redirects to that section if it exists, dropping `tab` and keeping the other query parameters;
  - otherwise it redirects to the first section by `order` (the masters «Записи» when present, else `settings`).
- [x] T023 Create `client/libs/web/core/feature/src/lib/profile/require-master-side.ts`, a `CanActivateFn`: it redirects to `/profile/client` unless `session.me()?.masterId` is set and `profileSlots.hasMasterSide`.
- [x] T024 Replace the `profile` route in `client/libs/web/core/feature/src/lib/bootstrap/routes.ts` with the shell (research R12):

  ```text
  profile (ProfileShell, providers profileSlots)
  ├── ''      → redirect client
  ├── client  (ClientAccount)
  │   ├── ''        clientSectionRedirect
  │   ├── <each clientSections path>   loadComponent, title = section.title
  │   └── settings  SettingsPanel, title «Настройки»
  └── master  canActivate requireMasterSide, children = masterRoutes
  ```

  Keep `requireSession` around it.
- [x] T025 Create `client/libs/web/core/feature/src/lib/profile/profile-shell.ts` (`app-profile-shell`):
  - **«Режим профиля»**: `SegmentedToggle` with «Клиент» / «Мастер», shown only when `hasMasterSide && me.masterId`. On phones it is a centred white bar with a bottom border; from `bp.up(lg)` it is left-aligned in the content width.
  - **The switch**: pressing a segment or swiping (`appSwipe`: left → master, right → client) navigates to `/profile/<side>`.
  - **The mode follows the address**: on every `NavigationEnd`, the side is `master` when the URL starts with `/profile/master`, else `client`. When it differs from `session.mode()`, call `session.setMode(side)`, with a toast on failure (`toProblem(e).title`).
  - `<router-outlet>` holds the content.
- [x] T026 Create the client frame in `client/libs/web/core/feature/src/lib/profile/client-account.ts`, `account-card.ts` and `section-nav.ts`:
  - **Card**: `Avatar` 64 px rounded with `photoUrl` and the initials fallback; the name; `formatPhone(me.phone)`; «Telegram · Viber» for the filled ones, joined by « · ».
  - **Navigation**: the sections plus «Настройки», with icons, as `routerLink` with `routerLinkActive`:
    - pills on phones, four equal pills below `sm` (480 px);
    - a vertical menu with icons from `lg`.
  - **Layout**: one column; from `md` centred, max 45rem; from `lg` a 20rem sticky card next to the content.
  - **Errors**: add the signal `meError` to `client/libs/shared/core/data-access/src/lib/identity/session-store.ts` in this task: `SessionStore` exposes `meError` (set when re-reading `/me` fails while the session is still signed in; an unreachable start is already sent to `/unavailable` by `requireSession`). While it is set, the whole account shows `ErrorState` «Не удалось загрузить» with «Повторить» (`session.load()`).
- [x] T027 Create `client/libs/web/core/feature/src/lib/profile/settings/settings-panel.ts` with the groups «Аккаунт», «Уведомления», «Прочее» and the actions, filled by US5, and the `settingsActions` components rendered with `NgComponentOutlet`. Move from `account/account-page.ts`:
  - the «Прочее» rows (`slots.accountLinks` such as «Справка», and `slots.actions` such as «Напишите нам»);
  - «Выйти из аккаунта» (`mat-flat-button app-large app-block app-danger-soft`, `session.signOut()` then `/`).

  Delete `client/libs/web/core/feature/src/lib/account/account-page.ts`.
- [x] T028 Add the masters manifest's `profile` contribution skeleton in `client/libs/web/masters/feature/src/lib/manifest.ts`:
  - `clientSections`: `bookings` («Записи», title «Мои записи», icon `calendar`, order 10), `favorites` («Избранное», «Избранное», `heart`, 20), `reviews` («Отзывы», «Отзывы», `star`, 30);
  - `masterRoutes: [{ path: '', loadComponent: MasterSidePlaceholder }]`;
  - `settingsActions: [MasterAction]`.

  Components are created in the story phases; until then, stub components in `client/libs/web/masters/feature/src/lib/account/`.

**Checkpoint**: Foundation ready. `/profile` shows the shell, the client frame and «Настройки» with logout.

---

## Phase 3: User Story 1 - A client manages their bookings (Priority: P1)

**Goal**: «Записи» with «Предстоящие» / «Прошлые», the status tags and lines, «Подтвердить», «Написать», «Отменить» and «Записаться снова», updated live.

- [x] T029 [P] [US1] Create `api/Nails.Application/Modules/Masters/Rules/MyBookingScope.cs`: `IsUpcoming(BookingStatus status, DateTimeOffset start, DateTimeOffset now)` = (Pending or Confirmed) and `start > now`.
- [x] T030 [P] [US1] Create `api/Nails.Application/Modules/Masters/Options/MyBookingsOptions.cs` (`DefaultPageSize`, `MaxPageSize`, `[Range(1, 100)]`) and register it from `Modules:Masters:MyBookings` in `MastersModule.cs`.
- [x] T031 [P] [US1] Create the request and responses:
  - `api/Nails.Application/Modules/Masters/Requests/MyBookingsRequest.cs`: `Scope` (`MyBookingsScope` enum `Upcoming`, `Past`, in `Requests/MyBookingsScope.cs`), `Page` ≥ 1, `PageSize?`;
  - `Responses/MyReview.cs` (`Rating`, `Text`, `Date`);
  - `Responses/MyBookingResponse.cs`: every `BookingResponse` field plus `CanReview`, `MyReview?` and `BookingMoveCard? Move`.
- [x] T032 [US1] Create `api/Nails.Infrastructure/Modules/Masters/Contracts/IMyBookingRepository.cs`, `Models/MyBookingRow.cs` and `Repositories/MyBookingRepository.cs`, all no-tracking:
  - **`PageAsync(clientUserId, upcoming, now, page, pageSize)`** → `Page<MyBookingRow>`:
    - site bookings only (`ClientUserId == caller`);
    - upcoming = (Pending or Confirmed) && `StartAt > now`, ordered by `StartAt` ascending; past = everything else, `StartAt` descending;
    - the row also holds the master's name and photo, the client's review (`AuthorRole == Client`, by `BookingId`) and the open move.
  - **`FindAsync(bookingId)`**: the same row for one booking.
- [x] T033 [US1] Create `api/Nails.Application/Modules/Masters/Contracts/IMyBookingService.cs` and `Services/MyBookingService.cs`:
  - **`MineAsync(MyBookingsRequest)`** → `PagedResponse<MyBookingResponse>`, with page-size clamping as in reviews;
  - **`FindAsync(id)`** → `MyBookingResponse`: 404 `booking-not-found`; 403 `not-booking-party` unless the caller is the client or the master's user;
  - build the responses with the existing price, service name (`ICatalog.SubcategoryName`) and `ReleaseAt` (`Bookings.PendingReleaseAt`) mapping of `BookingService`, extracted to one shared mapper in `Services/BookingResponses.cs` (no duplication);
  - `CanReview` is false until `ReviewWindow` (T053) exists.

  Register the repository and service in `MastersModule.cs`.
- [x] T034 [US1] Add `GET bookings/mine` (`[FromQuery] MyBookingsRequest`) to a new `api/Nails.Api/Modules/Masters/Controllers/MyAccountController.cs` (`[Route("")]`, thin), and `GET {id:guid}` to `BookingsController.cs`.
- [x] T035 [P] [US1] Add to `client/libs/shared/masters/data-access/src/lib/masters-api.ts`: `myBookings(scope, page)`, `myBooking(id)`, `confirmBooking(id)` and `cancelBooking(id, request)`, with the paths in `mastersPaths`.
- [x] T036 [P] [US1] Create `client/libs/shared/masters/data-access/src/lib/my-bookings/booking-tags.ts` (pure, exported), quoting FR-008:
  - **`bookingTag(booking, scope)`** → `{ label, tone: 'warning'|'success'|'danger'|'muted' }`:

    | Booking | Upcoming | Past |
    |---|---|---|
    | pending, created by the master | «Ждёт вашего подтверждения» (warning) | «Не подтверждена» (muted) |
    | pending, created by the client | «Ожидает подтверждения» (warning) | «Не подтверждена» (muted) |
    | confirmed | «Подтверждено» (success) | «Прошла» (muted) |
    | completed | | «Завершено» (success) |
    | no-show | | «Неявка» (danger) |
    | cancelled | | «Отменено» (danger) |

  - **`bookingLine(booking, now)`**:
    - upcoming pending: «Подтвердите до {formatShortDate}, {formatTime}» or «Мастер подтвердит до …» from `releaseAt`;
    - cancelled: «Вы отменили» / «Мастер отменил», then « по договорённости» when mutual, then «. Причина: {reason}».
- [x] T037 [US1] Create `client/libs/shared/masters/data-access/src/lib/my-bookings/my-bookings-store.ts` (exported, not root-provided; provided by the panel):
  - **Per scope**: items, `loading`, `error`, `hasMore` and `loadMore()`; the upcoming scope also loads in pages.
  - **`refresh(id)`** refetches one booking with `myBooking(id)`:
    - it moves the booking between scopes when its scope changed;
    - an unknown id refetches the upcoming first page.
  - **Live**: it subscribes to `realtime.on('bookingChanged')` for bookings whose `clientUserId` is the signed-in user (`refresh(booking.id)`), and to `reconnected$` (reload).
  - **Actions**: `confirm(id)` and `cancel(id, request)` call the API and patch the item.
- [x] T038 [US1] Create `client/libs/web/masters/feature/src/lib/account/my-booking-card.ts` (`app-my-booking-card`):
  - avatar, the master's name as a link to `/masters/:id`, the service, «{formatShortDate} · {formatTime} · {address}», `formatPrice`, the tag (`bookingTag`, styled by tone with `--app-color-*-soft/text` tokens) and the line (`bookingLine`);
  - actions per FR-009:
    - «Подтвердить» when pending and `createdBy === 'master'` (toast «Запись подтверждена»);
    - «Написать» to `/chats/new?master=` only when `injectChatsEnabled()`;
    - upcoming: «Перенести» (US2) and «Отменить»;
    - past: «Записаться снова» (`['/masters', masterId]`, `{ book: 1, service: subcategoryId }`), and «Оставить отзыв» or the `Rating` stars of `myReview` (US3).
  - every button disabled while it runs.
- [x] T039 [US1] Wire «Отменить» in `my-booking-card.ts` to the shared `CancelBookingSheet` with the profile texts in `client/libs/web/masters/feature/src/lib/account/account-texts.ts`:
  - `heading` «Отмена записи», `summary` «**{masterName}** · {service} · {date} · {time}»;
  - reasons «Изменились планы», «Плохое самочувствие», «Не успеваю к этому времени», «Другое», and `otherPlaceholder` «Опишите причину» (≤ 300);
  - `mutualLabel` «По договорённости с мастером (без последствий)», `mutualDefault` false, `warning` «Односторонняя отмена снижает рейтинг»;
  - «Назад» / «Отменить запись».

  Success shows the toast «Запись отменена»; failure shows `toProblem(e).title` and the sheet stays open.
- [x] T040 [US1] Create `client/libs/web/masters/feature/src/lib/account/bookings-panel.ts` (the `bookings` section):
  - tabs «Предстоящие» / «Прошлые» bound to `?sub=past` (`replaceUrl`);
  - the past tab pages on scroll (an `IntersectionObserver` sentinel), and so does upcoming;
  - one column, two from `xl`;
  - three skeleton cards while loading; `ErrorState` «Не удалось загрузить» with «Повторить» on failure;
  - empty states: «Нет предстоящих записей» / «Выберите мастера на карте и запишитесь на свободное время.» with «Найти мастера» (`/`), and «Прошлых записей пока нет».

**Checkpoint**: User Story 1 is complete.

---

## Phase 4: User Story 2 - A client reschedules a visit (Priority: P1)

**Goal**: the client proposes a new time, the master accepts or declines it in the chat, and the request lapses otherwise.

- [x] T041 [P] [US2] Add `Move(BookingState state, DateTimeOffset now)` to `api/Nails.Application/Modules/Masters/Rules/BookingTransitions.cs`: pending or confirmed with `Start > now`, else `cannot-move`. Create `Rules/BookingMoves.cs` with `LapsesAt(newStart, bookingStart, now)` = min(`Bookings.PendingReleaseAt(newStart, now)`, `bookingStart`).
- [x] T042 [P] [US2] Add the move errors to `api/Nails.Application/Modules/Masters/Services/MastersErrors.cs`:
  - `cannot-move` 409 «Эту запись уже нельзя перенести»;
  - `move-exists` 409 «Перенос уже ждёт ответа мастера»;
  - `move-not-open` 409 «Запрос на перенос уже неактуален»;
  - `move-overlaps` 409 «В это время у вас уже есть другая запись».
- [x] T043 [US2] Create `api/Nails.Infrastructure/Modules/Masters/Contracts/IBookingMoveRepository.cs` and `Repositories/BookingMoveRepository.cs`:
  - `FindOpenAsync(bookingId)` (tracked);
  - `LapseCandidatesAsync(now)`: open moves with `LapsesAt <= now`;
  - `OpenMovesOfClientAsync(clientUserId, now)`: the client's open moves with a future held time (tracked), for the overlap checks of T044 and T045;
  - `Add`.

  Saving goes through the existing `IBookingRepository.SaveAsync` (one `DbContext`); a concurrency failure returns false.
- [x] T044 [US2] Create `api/Nails.Application/Modules/Masters/Requests/MoveBookingRequest.cs` (`[Required] Guid SlotId`), `Contracts/IBookingMoveService.cs` and `Services/BookingMoveService.cs`, each change inside `unitOfWork.InTransactionAsync`:
  - **`RequestAsync(id, request)`**:
    1. the caller must be the booking's client (403 `not-booking-party`), and the booking a site booking;
    2. `BookingTransitions.Move` must pass;
    3. no open move (`move-exists`);
    4. the slot must be the same master's, `Free` and `StartAt > now` (`slot-taken`);
    5. the service must still be offered (`service-not-offered`); the duration is `max(service, slot)`;
    6. `Bookings.Conflicts` against the client's other active bookings (excluding this one) **and the held times of the client's other open move requests** (`IBookingMoveRepository.OpenMovesOfClientAsync`, excluding this booking's) must have no overlap, else `move-overlaps`;
    7. hold: slot `Status = Pending`, `BookingId = booking.Id`; add a `BookingMove` (`Open`, `LapsesAt`);
    8. save; a concurrency failure → `slot-taken`, and a race on the open unique index → `move-exists`;
    9. publish `MoveRequested` (`By = Client`) and return `MyBookingResponse`.
  - **`WithdrawAsync(id)`** (client side): the open move, else `move-not-open`; the held slot becomes `Free` with `BookingId = null`; the move becomes `Withdrawn` with `ResolvedAt`; publish `MoveWithdrawn`.
  - **`AcceptAsync(id)`** (master side, the master's `UserId == caller`, else `not-booking-party`): the open move, else `move-not-open`.
    - The booking takes the move's `StartAt`, `DurationMin` and `SlotId`, with `Status = Confirmed` and `ConfirmedAt = now`.
    - The old slot becomes `Free` with no booking; the held slot becomes `Booked`; the move becomes `Accepted`.
    - Publish `MoveAccepted` (`By = Master`) and return `BookingResponse`.
  - **`DeclineAsync(id)`** (master side): free the held slot, the move becomes `Declined`, and publish `MoveDeclined`.

  Register them in `MastersModule.cs`.
- [x] T045 [US2] Extend the existing flows:
  - `api/Nails.Application/Modules/Masters/Services/BookingChanges.cs` `CancelAsync`: also end the booking's open move with the status `Cancelled` (free the held slot, set `ResolvedAt`), so every cancel path, including expire and auto-cancel, releases the hold. No move event is published; the booking's own `Cancelled` event is enough.
  - `Services/BookingService.cs` `CreateAsync`: treat the client's open moves like active bookings in the conflict check (`Bookings.Conflicts` over the client's active bookings plus the held times of their open moves). An open move whose held time overlaps the new booking is withdrawn (held slot `Free`, move `Withdrawn`, `ResolvedAt`), and `MoveWithdrawn` is published, so the chat shows «Клиент отменил перенос». It uses `OpenMovesOfClientAsync` from T043.
  - `Services/BookingTimeRules.cs`: add a step before expire that lapses `LapseCandidatesAsync(now)`. Each move is saved on its own: the held slot becomes `Free`, the move `Lapsed`, then publish `MoveLapsed` with `By = null`.
- [x] T046 [US2] Add to `api/Nails.Api/Modules/Masters/Controllers/BookingsController.cs`: `POST {id:guid}/move`, `DELETE {id:guid}/move`, `POST {id:guid}/move/accept` and `POST {id:guid}/move/decline`.
- [x] T047 [P] [US2] Add the move texts to `api/Nails.Application/Modules/Chats/Rules/ChatTexts.cs`, with dates from `RussianDate.DayMonthTime`:
  - `MoveRequested` «Клиент предлагает перенести запись на {d MMM, HH:mm}», from `card.Move.Start` (the open move);
  - `MoveAccepted` «Мастер принял перенос на {d MMM, HH:mm}», from `card.Start` (after acceptance the booking already has the new time, and `card.Move` is null);
  - `MoveDeclined` «Мастер отклонил перенос»;
  - `MoveWithdrawn` «Клиент отменил перенос»;
  - `MoveLapsed` «Запрос на перенос истёк».

  Pass the card into `ChatTexts.For` from `Services/BookingChatHandler.cs`.
- [x] T048 [P] [US2] Extract the day chips and time chips from `client/libs/web/masters/feature/src/lib/booking/booking-sheet.ts` into `booking/slot-picker.ts` (`app-slot-picker`), and make `BookingSheet` use it:
  - inputs `slots: MasterSlots` and `selected: string | null`; output `picked: SlotEntry`;
  - 14 day chips «Сегодня · 11 окт · 5 окон», and times with «занято» and «ожидает подтверждения».
- [x] T049 [US2] Add `requestMove(id, slotId)` and `withdrawMove(id)` to `masters-api.ts` and to `MyBookingsStore` (patch the item from the answer).
- [x] T050 [US2] Create `client/libs/web/masters/feature/src/lib/account/move-booking-sheet.ts`:
  - **Content**:
    - heading «Перенос записи»;
    - «**{masterName}** · {service} · {date} · {time}»;
    - lead «Выберите новое время. Мастер получит запрос на перенос; до его ответа запись остаётся на прежнем времени.»;
    - `SlotPicker` over `MastersApi.slots(masterId)`;
    - the spec 005 conflict check (`MastersApi.conflicts(slotId)`, red overlap and amber «within an hour», reusing `booking/booking-check.ts`).
  - **No free time**: «Свободного времени нет — напишите мастеру», with «Предложить перенос» disabled.
  - **Buttons**: «Назад» / «Предложить перенос».
  - **Results**: success shows the toast «Запрос на перенос отправлен» and closes; failure shows `toProblem(e).title`, keeps the sheet open, and reloads the slots on `slot-taken`.
- [x] T051 [US2] In `my-booking-card.ts`:
  - «Перенести» opens `MoveBookingSheet`;
  - an open `move` shows «Перенос на {formatShortDate}, {formatTime} ждёт ответа мастера» and «Отменить перенос» (toast «Перенос отменён»), and hides «Перенести».
- [x] T052 [US2] Add `acceptMove(id)` and `declineMove(id)` to `client/libs/shared/chats/data-access/src/lib/chats-api.ts` and `chat-thread-store.ts`. In `client/libs/web/chats/feature/src/lib/bookings/booking-card.ts`, for an open `booking.move`:
  - both sides see the line «Перенос на {date}, {time} ждёт ответа мастера»;
  - the master side gets «Принять перенос» (toast «Запись перенесена») and «Отклонить перенос» (toast «Перенос отклонён»), disabled while running, with errors as toasts.

**Checkpoint**: User Story 2 is complete.

---

## Phase 5: User Story 3 - A client leaves a review after a visit (Priority: P1)

**Goal**: «Оставить отзыв» on a completed visit within 30 days, once, and the rating updates at once.

- [x] T053 [P] [US3] Create `api/Nails.Application/Modules/Masters/Rules/ReviewWindow.cs`:
  - `Check(BookingStatus status, DateTimeOffset end, DateTimeOffset now, int windowDays, bool hasReview) → string?` returns `not-completed`, `review-window-closed` (`now > end + windowDays`) or `review-exists`;
  - `CanWrite(...)` is `Check(...) is null`.
- [x] T054 [P] [US3] Add `[Range(1, 365)] int WindowDays` to `api/Nails.Application/Modules/Masters/Options/ReviewOptions.cs`.
- [x] T055 [P] [US3] Add the review errors to `MastersErrors.cs`:
  - `not-completed` 409 «Отзыв можно оставить после завершённого визита»;
  - `review-window-closed` 409 «Срок для отзыва истёк»;
  - `review-exists` 409 «Вы уже оставили отзыв об этом визите».
- [x] T056 [US3] Create `api/Nails.Application/Modules/Masters/Requests/WriteReviewRequest.cs`:
  - `[Range(1, 5, ErrorMessage = "Поставьте оценку")] int? Rating`, plus `[Required(ErrorMessage = "Поставьте оценку")]`;
  - `[StringLength(1000, ErrorMessage = "Не длиннее 1000 символов")] string? Text`.
- [x] T057 [US3] Create `api/Nails.Infrastructure/Modules/Masters/Contracts/IReviewRepository.cs` and `Repositories/ReviewRepository.cs` (`ExistsAsync(bookingId, role)`, `Add`, and `SaveAsync` mapping a unique violation of `(booking_id, author_role)` to false). Create `api/Nails.Application/Modules/Masters/Contracts/IReviewWriteService.cs` and `Services/ReviewWriteService.cs`:
  - **`WriteAsync(bookingId, request)`**:
    1. load the booking (404 `booking-not-found`), and the side from the caller (else 403 `not-booking-party`; outside bookings have no client side);
    2. `ReviewWindow.Check` with `end = StartAt + DurationMin` and `WindowDays`;
    3. add a `Review` with the booking's `MasterId`, `ClientUserId` and `SubcategoryId`, `AuthorRole` = the side, the rating, and the trimmed text (empty allowed);
    4. a duplicate on save → `review-exists`;
    5. return `ReviewResponse` (the existing shape).
  - Never log the text.
- [x] T058 [US3] Use `ReviewWindow.CanWrite` for `CanReview` and fill `MyReview` in `MyBookingService.cs`. Add `POST {id:guid}/reviews` (201) to `BookingsController.cs`.
- [x] T059 [US3] Add `writeReview(id, request)` to `masters-api.ts` and `review(id, request)` to `MyBookingsStore`, which refreshes the booking.
- [x] T060 [US3] Create `client/libs/web/masters/feature/src/lib/account/review-sheet.ts`:
  - **Content**:
    - heading «Отзыв о мастере»;
    - the summary line «**{masterName}** · {service} · {date}»;
    - the star picker «Оценка»: a radio group of five stars labelled «1 из 5» … «5 из 5», keyboard accessible;
    - «Комментарий»: optional textarea, `maxlength` 1000, placeholder «Что понравилось, что можно улучшить».
  - **Buttons**: «Отмена» / «Отправить отзыв», which reads «Отправляем…» while sending.
  - **Results**: no rating shows the field error «Поставьте оценку»; success shows the toast «Спасибо за отзыв!» and closes; a failure toasts the server's title and keeps the sheet open.

  Open it from «Оставить отзыв» in `my-booking-card.ts`.

**Checkpoint**: User Story 3 is complete.

---

## Phase 6: User Story 4 - A client finds saved masters and reviews (Priority: P2)

**Goal**: «Избранное» and «Отзывы» with real data.

- [x] T061 [P] [US4] Create `api/Nails.Application/Modules/Masters/Options/FavoritesOptions.cs` (`DefaultPageSize`, `MaxPageSize`) and register it from `Modules:Masters:Favorites`. Create `Requests/FavoritesRequest.cs` (`Page`, `PageSize?`) and `Responses/FavoriteMasterResponse.cs` (`Id`, `Name`, `PhotoUrl?`, `Specialty`, `Rating?`, `ReviewsCount`, `Verified`).
- [x] T062 [US4] Add `PageAsync(userId, page, pageSize)` to `api/Nails.Infrastructure/Modules/Masters/Contracts/IFavoriteRepository.cs` and `Repositories/FavoriteRepository.cs`:
  - newest favourite first;
  - only listed masters (`MasterVisibility.Listed`, T083; until then `DeletedAt == null`);
  - rating and review count over `AuthorRole == Client` reviews, reusing the projection of `MasterSearchRepository` (extract it to a shared query expression in `api/Nails.Infrastructure/Modules/Masters/Repositories/MasterRatings.cs`).

  Add `ListAsync(FavoritesRequest)` to `api/Nails.Application/Modules/Masters/Services/FavoriteService.cs` (rating via `MasterFacts.Rating`), and `GET favorites` to `MyAccountController.cs`.
- [x] T063 [P] [US4] Create `api/Nails.Application/Modules/Masters/Requests/MyReviewsRequest.cs` (`About` bool, `Page`, `PageSize?`) and the responses `Responses/MyReviewResponse.cs` (`Id`, `MasterId`, `MasterName`, `MasterPhotoUrl?`, `ServiceName`, `Rating`, `Text`, `Date`) and `Responses/MyReviewsResponse.cs` (`WrittenCount`, `AboutCount`, `Items`, `Page`, `PageSize`, `TotalCount`).
- [x] T064 [US4] Add the queries to `IReviewRepository` / `ReviewRepository`, both no-tracking:
  - `CountsAsync(userId)`: written = `ClientUserId == caller && AuthorRole == Client`; about = `ClientUserId == caller && AuthorRole == Master`;
  - `PageAsync(userId, about, page, pageSize)`: newest first, with the master's name and photo, using the index `(client_user_id, author_role, created_at)`.

  Create `api/Nails.Application/Modules/Masters/Contracts/IMyReviewService.cs` and `Services/MyReviewService.cs` (service names via `ICatalog`; reviews about a client are returned only to that client), and `GET reviews/mine` in `MyAccountController.cs`.
- [x] T065 [P] [US4] Add `favoriteMasters(page)` and `myReviews(about, page)` to `masters-api.ts`. Create `client/libs/shared/masters/data-access/src/lib/favorite-masters-store.ts`:
  - pages with `loadMore`;
  - `remove(master)` drops the master optimistically, calls `FavoritesStore.toggle(id)` (which keeps the ids in sync), and puts the master back on failure.

  Create `my-reviews-store.ts`: two tabs with pages and both counts. Export both.
- [x] T066 [US4] Create `client/libs/web/masters/feature/src/lib/account/favorites-panel.ts` (the `favorites` section):
  - **Card**: a 60 px `Avatar`, the name with `badge-check` when verified, the specialty and `Rating`, the whole card a link to `/masters/:id`;
  - **Heart**: a filled `heart` button, aria-label «Убрать {имя} из избранного»; it removes with the toast «Удалено из избранного: {имя}», or the error title and the master back;
  - **Layout and states**: one column, two from `md`; skeletons; «Не удалось загрузить» + «Повторить»; empty «В избранном пока пусто» / «Нажмите на сердечко в профиле мастера, чтобы сохранить его здесь.» + «Найти мастера».
- [x] T067 [US4] Create `client/libs/web/masters/feature/src/lib/account/reviews-panel.ts` (the `reviews` section):
  - **Tabs**: «Мои отзывы» / «Отзывы обо мне» bound to `?sub=about` (`replaceUrl`), each with its count, a zero count hidden;
  - **Card**: the master's name, the service in `--app-color-primary`, `Rating` at size 16, `formatShortDate(date)` and the text;
  - **States**: skeletons; «Не удалось загрузить» + «Повторить»; empty «Вы пока не оставляли отзывов» / «Оценить мастера можно после визита.» and «Отзывов о вас пока нет» / «Мастера смогут оставить отзыв после визита.»; paging on scroll.

**Checkpoint**: User Story 4 is complete.

---

## Phase 7: User Story 5 - A client edits the profile and settings (Priority: P2)

**Goal**: the edit sheet with the photo, the phone change with a code, the contact method, notifications, «Выйти на других устройствах» and the info sheets.

### Backend

- [x] T068 [P] [US5] Create `api/Nails.Application/Modules/Identity/Rules/TelegramName.cs`: `Normalize(string?) → string?` strips «@» and spaces, matches `^[A-Za-z0-9_]{5,32}$`, and returns `"@" + name` or null.
- [x] T069 [P] [US5] Create the requests and responses:
  - `api/Nails.Application/Modules/Identity/Requests/UpdateProfileRequest.cs`: all optional, each attribute with a Russian `ErrorMessage` (attributes without one produce English text, because `ControllerExtensions` replaces only empty messages):
    - `[StringLength(120, ErrorMessage = "Введите имя")] Name`;
    - `[StringLength(256, ErrorMessage = "Проверьте адрес почты")] Email`;
    - `[StringLength(500, ErrorMessage = "Фото не найдено")] PhotoUrl`;
    - `[StringLength(64, ErrorMessage = "Проверьте имя в Telegram")] Telegram`;
    - `[StringLength(32, ErrorMessage = "Введите белорусский номер в формате +375 XX XXX-XX-XX")] Viber`;
    - `PreferredContact?`;
  - `Requests/NotificationSettingsRequest.cs` (`Push`, `Email`, `Site`, `Reminders`);
  - `Requests/PhoneChangeCodeRequest.cs` (`[Required] Phone`);
  - `Requests/PhoneChangeRequest.cs` (`[Required] Phone`, `Code?`);
  - `Responses/NotificationSettingsResponse.cs`.

  Extend `Responses/MeResponse.cs` with `Email?`, `PhotoUrl?`, `Telegram?`, `Viber?`, `PreferredContact` and `NotificationSettingsResponse Notifications`, and fill them in `SessionService.Me`.
- [x] T070 [P] [US5] Add to `api/Nails.Application/Modules/Identity/Services/IdentityErrors.cs`:
  - `EmailInvalid` (field `email` «Проверьте адрес почты»);
  - `EmailTaken` (409 `email-taken` «Эта почта уже используется другим аккаунтом»);
  - `TelegramInvalid` (field `telegram` «Проверьте имя в Telegram»);
  - `ViberInvalid` (field `viber` «Введите белорусский номер в формате +375 XX XXX-XX-XX»);
  - `PhoneSame` (409 `phone-same` «Это ваш текущий номер»);
  - `PhoneTaken` (409 `phone-taken` «Этот номер уже привязан к другому аккаунту»).
- [x] T071 [US5] Create `api/Nails.Infrastructure/Modules/Identity/Contracts/IPhoneChangeCodeRepository.cs` and `Repositories/PhoneChangeCodeRepository.cs` (`FindAsync(userId)`, `Add`, `Remove`). Extract the code generation, hashing and verification shared with `SessionService` into `api/Nails.Application/Modules/Identity/Services/PhoneCodes.cs` (generate, hash, verify with attempts, using `PhoneCodeState`), and make `SessionService` use it (no duplication).
- [x] T072 [US5] Create `api/Nails.Application/Modules/Identity/Contracts/IAccountService.cs` and `Services/AccountService.cs`:
  - **`UpdateProfileAsync(request)`**:
    - name trimmed, 1–120, else `NameInvalid`;
    - email: `""` clears it; otherwise `[EmailAddress]`-valid else `EmailInvalid`, and `FindByEmailAsync` of another user → `EmailTaken`; set `user.Email` directly and call `UserManager.UpdateNormalizedEmailAsync(user)` (not `SetEmailAsync`, which resets confirmation and changes the security stamp, signing out every other device); `EmailConfirmed` stays false;
    - photo: `""` clears it; otherwise `IMediaOwnership.IsOwnedByAsync` else `MediaErrors.NotOwned()`;
    - Telegram through `TelegramName`, Viber through `BelarusPhone`; `""` clears either;
    - `PreferredContact`;
    - `UpdateAsync`; a unique `EmailIndex` violation → `EmailTaken`;
    - return `MeResponse`.
  - **`SetNotificationsAsync(request)`**.
  - **`RequestPhoneCodeAsync(request)`** (research R3):
    1. normalize (`PhoneInvalid`);
    2. reject the caller's own number (`PhoneSame`) and another account's (`PhoneTaken`);
    3. `VerificationRequired` false: log a warning and return `sent: false`;
    4. the resend wait gives `CodeTooSoon`;
    5. store the hash and send «Код для смены номера в «Мастера рядом»: {code}. Никому его не сообщайте.»
  - **`ChangePhoneAsync(request)`**:
    - verify the code (skipped when verification is off), with `CodeInvalid` / `CodeExpired`;
    - re-check `PhoneTaken`;
    - set `UserName` and `PhoneNumber` and call `UpdateAsync` (the security stamp unchanged); a duplicate → `PhoneTaken`;
    - remove the row and return `MeResponse`.
  - **`SignOutOthersAsync()`**: `UpdateSecurityStampAsync`, `RefreshSignInAsync`, then `IRealtimeConnections.AbortAsync(userId)`.

  Register it in `IdentityModule.cs`.
- [x] T073 [US5] Restore session validation in `api/Nails.Application/Modules/Identity/IdentityModule.cs`:
  - set `options.Events.OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync` in the cookie events;
  - create `Options/SessionOptions.cs` (`[Required] TimeSpan StampValidationInterval`), registered from `Modules:Identity:Session`, and configure `SecurityStampValidatorOptions.ValidationInterval` from it;
  - confirm that `ISecurityStampValidator` is registered by `AddSignInManager`.
- [x] T074 [US5] Create `api/Nails.Api/Modules/Identity/Controllers/AccountController.cs` (`[Route("")]`, thin):
  - `PATCH me`;
  - `PUT me/notifications`;
  - `POST me/phone/code` and `POST me/phone`, both `[EnableRateLimiting(IdentityPolicy)]`;
  - `POST sign-out/others` (204).

### Client

- [x] T075 [US5] Add to `client/libs/shared/core/data-access/src/lib/identity/identity-api.ts` and `api-paths.ts`: `updateProfile`, `setNotifications`, `requestPhoneCode`, `changePhone` and `signOutOthers`.
  - `session-store.ts` gains `patchMe(me)`, and the `notifications` setter patches `me` optimistically and reverts on failure.
  - `realtime/realtime-service.ts` gains `connectionLost$`, emitted on the **first** failed reconnect attempt (not after the last retry), and keeps retrying.
  - `SessionStore` re-reads `/me` on `connectionLost$`; a 401 marks the session signed out and stops the realtime service, so a revoked device leaves the app within a few seconds instead of after ~47 s of retries.
- [x] T076 [US5] Create `client/libs/web/core/feature/src/lib/profile/settings/edit-profile-sheet.ts` («Редактировать профиль»):
  - **Photo row**: `Avatar`, «Изменить фото» (a hidden file input `accept="image/jpeg,image/png,image/webp"`, `MediaApi.upload`, which shows the spec 006 errors) and «Удалить фото» (clears).
  - **Fields**:
    - «Имя и фамилия»* («Введите имя»);
    - «Электронная почта» («Проверьте адрес почты» or the server's «Эта почта уже используется другим аккаунтом»);
    - «Telegram» (placeholder «@username», «Проверьте имя в Telegram»);
    - «Viber» (placeholder «+375 29 123-45-67»).
  - **Buttons**: «Отмена» / «Сохранить». Field errors come from the problem's `errors`; toasts «Сохранено» / «Не удалось сохранить» or the server's title; the sheet stays open on failure.
- [x] T077 [US5] Create `client/libs/web/core/feature/src/lib/profile/settings/phone-sheet.ts` («Телефон»):
  - **Phone step**:
    - lead «Этот номер видят мастера, к которым вы записаны.»;
    - the phone field with «+375» and the hint «Формат: +375 29 123-45-67»;
    - the error «Введите белорусский номер в формате +375 XX XXX-XX-XX» after blur or submit;
    - «Получить код».
  - **Code step**, when `sent` is true:
    - «Введите код из SMS» and «Код отправлен на {formatPhone}»;
    - the existing `identity/code-input.ts`; the sixth digit submits;
    - «Запросить код повторно через 0:59», then the button «Запросить код повторно»;
    - «Изменить номер».
  - **Results**: the server's messages for `phone-same`, `phone-taken`, `code-invalid`, `code-expired` and `code-too-soon`. Success shows the toast «Номер изменён», `patchMe` and closes.
- [x] T078 [P] [US5] Create `client/libs/web/core/feature/src/lib/profile/settings/contact-sheet.ts` («Способ связи», lead «Как мастерам лучше связываться с вами»):
  - a radio list «Сообщения в чате» — «Мастер напишет вам в чат на сайте» and «Телефонный звонок» — «Мастер позвонит по вашему номеру»;
  - saved with `updateProfile({ preferredContact })`, with the same toasts.
- [x] T079 [P] [US5] Create `client/libs/web/core/feature/src/lib/profile/settings/sign-out-others-sheet.ts`:
  - heading «Выйти на других устройствах?», lead «На всех других телефонах и браузерах нужно будет войти заново. На этом устройстве вы останетесь в аккаунте.»;
  - «Отмена» / «Выйти»;
  - toasts «Другие устройства вышли из аккаунта» / «Не удалось выйти на других устройствах».
- [x] T080 [P] [US5] Create `client/libs/web/core/feature/src/lib/profile/settings/info-sheet.ts` (heading, paragraphs or a numbered list, «Понятно») and `info-texts.ts`:
  - «Язык»: «Сейчас приложение доступно только на русском языке. Другие языки появятся позже.»
  - «О приложении»: «Карта бьюти-мастеров Беларуси с точными ценами и онлайн-записью.», «Находите мастеров рядом, сравнивайте цены на услуги, смотрите портфолио и отзывы, записывайтесь на свободное время и общайтесь с мастером в чате.», «Версия 1.0».
  - «Правила использования», numbered:
    1. «Не публикуйте оскорбления, спам, рекламу и неприемлемые фото.»
    2. «Отмена записи возможна только с указанием причины. Отмена по договорённости с мастером проходит без последствий, односторонняя — снижает рейтинг.»
    3. «Отзывы должны описывать реальный визит.»
    4. «За нарушения аккаунт блокируется по нарастающей: 1 день → 3 дня → 7 дней → 30 дней → навсегда.»
    5. «С блокировкой можно не согласиться: напишите в поддержку, и модератор пересмотрит решение.»
- [x] T081 [US5] Fill `client/libs/web/core/feature/src/lib/profile/settings/settings-panel.ts`:
  - **«Аккаунт»**: rows «Редактировать профиль», «Телефон» (with `formatPhone`), «Способ связи» (with the current choice) and «Выйти на других устройствах», each opening its sheet.
  - **«Уведомления»**: `notification-switches.ts` with «Push-уведомления», «Email», «На сайте» and «Напоминания о записях» (hint «За 24 ч и за 2 ч до визита»). Each change is optimistic, shows the toast «Сохранено» on success (constitution VII), and reverts with «Не удалось сохранить настройку» on failure.
  - **«Прочее»**: «Язык» (value «Русский»), «О приложении» and «Правила использования» open the info sheet; then the module account links («Справка») and frame actions («Напишите нам»).
  - **Actions**: the `settingsActions`, then «Выйти из аккаунта».

**Checkpoint**: User Story 5 is complete.

---

## Phase 8: User Story 6 - A client becomes a master (Priority: P2)

**Goal**: «Стать мастером» creates a hidden master profile, links it to the account, and opens the master side.

- [x] T082 [P] [US6] Add to Identity:
  - `ProfileAsync(Guid userId)` → `AccountProfile(Name, Phone, Email?, PhotoUrl?, Telegram?, Viber?)` (`api/Nails.Application/Modules/Identity/Contracts/AccountProfile.cs`), in `Contracts/IAccountDirectory.cs`, `Services/AccountDirectory.cs` and `api/Nails.Infrastructure/Modules/Identity/Repositories/AccountDirectoryRepository.cs`;
  - `Contracts/IAccountLinks.cs` (`SetMasterAsync(userId, masterId)`) with `Services/AccountLinks.cs` and `api/Nails.Infrastructure/Modules/Identity/Contracts/IAccountLinkRepository.cs` + `Repositories/AccountLinkRepository.cs` (an `ExecuteUpdate` of `MasterId`).

  Register both in `IdentityModule.cs`.
- [x] T083 [P] [US6] Create the query expression `api/Nails.Infrastructure/Modules/Masters/Repositories/MasterVisibility.cs` (`Listed = m => m.DeletedAt == null && m.LocationSet && services.Any(s => s.MasterId == m.Id)`, translatable by EF; it is a query filter, not a business rule, so it lives with the repositories). Apply it in:
  - `MasterSearchRepository.FindCandidatesAsync`;
  - the suggestions query;
  - `MasterProfileRepository.FindAsync(id, viewerUserId)` (profile, card, slots, reviews), filtered by `Listed || m.UserId == viewerUserId`, so the owner still finds their hidden profile (`viewerUserId` is `ICurrentUser.UserId`, `Guid.Empty` for a guest); search and suggestions use `Listed` only;
  - `FavoriteRepository` (T062);
  - `FavoriteService.AddAsync`;
  - `BookingService.CreateAsync`'s master lookup.

  The owner still sees their own profile (`IsOwn`); others get 404 `master-not-found`.
- [x] T084 [P] [US6] Create the options and request:
  - `api/Nails.Application/Modules/Masters/Options/CityOptions.cs` (`Name`, `Latitude`, `Longitude`) and `CitiesOptions.cs` (`[MinLength(1)] List<CityOptions> Items`, bound from the section `Modules:Masters:Cities`, whose `Items` array holds the cities);
  - `NewMasterOptions.cs` (`WorkDays`, `TimeFrom`, `TimeTo`, `SlotMinutes`, `Capacity`, `AutoConfirmEnabled`, `AutoConfirmAfterMinutes`);
  - register both in `MastersModule.cs`;
  - `Requests/BecomeMasterRequest.cs` (`[Required(ErrorMessage = "Выберите направление")] CategoryId`, `[Required(ErrorMessage = "Выберите город")] City`, `[Required(ErrorMessage = "Укажите адрес")] [StringLength(200, ErrorMessage = "Укажите адрес")] Address`). Every new request attribute in this spec carries a Russian `ErrorMessage`.
- [x] T085 [US6] Create the onboarding service and its repository (inside `unitOfWork.InTransactionAsync`):
  - **Repository**: `api/Nails.Infrastructure/Modules/Masters/Contracts/IOnboardingRepository.cs` and `Repositories/OnboardingRepository.cs`, with `MasterExistsForUserAsync(userId)` (deleted included) and `Add(master, schedule)`.
  - **Service**: `api/Nails.Application/Modules/Masters/Contracts/IMasterOnboardingService.cs` and `Services/MasterOnboardingService.cs`, `CreateAsync(request)`:
    1. `ICatalog.FindCategory`, else field `categoryId` «Выберите направление»;
    2. the city from `CitiesOptions`, else field `city` «Выберите город»;
    3. the address trimmed, else «Укажите адрес»;
    4. an existing master → 409 `master-exists` «У вас уже есть профиль мастера»;
    5. `IAccountDirectory.ProfileAsync` gives the name, photo, phone, email, Telegram and Viber;
    6. add the `Master` (`Specialty` = category specialty, `CategoryIds = [categoryId]`, city centre `Lat`/`Lng`, `District` "", `ShowOnline` true, `VerificationStatus.None`, `LocationSet = false`) and the `Schedule` from `NewMasterOptions`;
    7. `IAccountLinks.SetMasterAsync`;
    8. the unique `user_id` race → `master-exists`;
    9. return `ISessionService.MeAsync()`.

  Add `MasterExists` to `MastersErrors.cs`.
- [x] T086 [US6] Add `GET cities` (`[AllowAnonymous]`, names in settings order) and `POST me` (201 `MeResponse`) to `MyAccountController.cs`.
- [x] T087 [P] [US6] Add `cities()` and `becomeMaster(request)` to `masters-api.ts`.
- [x] T088 [US6] Create `client/libs/web/masters/feature/src/lib/account/become-master-sheet.ts`:
  - **Lead**: «Имя, телефон и фото перенесём из профиля клиента. Один аккаунт — две роли: переключайтесь между «Клиент» и «Мастер» в профиле.»
  - **Fields**:
    - «Направление»*: placeholder «Выберите направление», options from `CatalogStore` as «{name} — {specialty lowercased}» (for example «Маникюр — мастер ногтей»);
    - «Город»: from `cities()`, «Минск» by default;
    - «Адрес, где принимаете»*: placeholder «ул. Ленина, 42», hint «Услуги, цены и расписание добавите в кабинете мастера».
  - **Buttons**: «Отмена» / «Создать профиль мастера».
  - **Results**: success shows `patchMe`, the toast «Профиль мастера создан», closes, and navigates to `/profile/master`; field errors come from the problem.
- [x] T089 [US6] Create `client/libs/web/masters/feature/src/lib/account/master-action.ts` (a settings action):
  - for `me.masterId`, «Перейти в кабинет мастера» (`briefcase`, a link to `/profile/master`);
  - otherwise the gradient «Стать мастером» button opening `BecomeMasterSheet`.

**Checkpoint**: User Story 6 is complete.

---

## Phase 9: User Story 7 - One account, two sides (Priority: P2)

**Goal**: the switch and swipe change sides, the mode follows, and the master side has its placeholder.

- [x] T090 [US7] Create `client/libs/web/masters/feature/src/lib/account/master-side-placeholder.ts`: an `EmptyState` «Кабинет мастера появится здесь» with «Перейти в режим клиента» (`/profile/client`). Spec 008 replaces it.
- [x] T091 [US7] Check `ProfileShell` (T025) against FR-001–FR-003:
  - the mode changes on every navigation into or out of `/profile/master`, and other tabs follow through `modeChanged`;
  - the swipe is ignored inside the section pills and tabs (mark their scroll containers `data-no-swipe` or rely on the sideways-scroll check);
  - «Мастер» hides when Masters is off or there is no master profile.

**Checkpoint**: User Story 7 is complete.

---

## Phase 10: Polish & Cross-Cutting Concerns

- [x] T092 Update the demo world (research R11):
  - `api/Nails.Application/Modules/Identity/Seed/IdentityDemoData.cs` and `IdentityDemoSeeder.cs`: Анна (`c-me`) gets a photo URL from `Demo:PhotoUrlFormat`, Telegram «@anna_nails» and Viber «+375291234567».
  - `api/Nails.Application/Modules/Masters/Seed/MastersDemoScenario.cs` and `MastersDemoSeeder.cs`:
    - the fixed reviews of Анна ↔ `m-anna-serova` and Анна ↔ `m-oksana-lebed` get the `BookingId` of the matching completed booking;
    - add a completed booking of Анна at `m-marina-kovaleva` (`brows-correction`) 5 days ago with no review.
- [x] T093 Write the help in `api/Nails.Api/Modules/Help/Content/ru/articles/core.json`, as plan.md «Help» lists, quoting every on-screen text and error exactly:
  - new `profile-shell`, `profile-settings`, `change-phone` and `sign-out-other-devices`;
  - changed `sign-out` and `navigation`;
  - no mention of chats.
- [x] T094 Write the help in `api/Nails.Api/Modules/Help/Content/ru/articles/masters.json`:
  - new `my-bookings`, `move-booking`, `write-review`, `my-reviews` and `become-master`;
  - in `move-booking`, name the two endings explicitly: booking another visit at the held time withdraws the request automatically («Клиент отменил перенос» in the chat), and cancelling the booking ends its request and releases the held time;
  - changed `favorites`;
  - `related` links among them and to `book-a-master`; no link to chats articles.

  Update `chats.json` `chat-bookings` with the move system messages and «Принять перенос» / «Отклонить перенос».
- [x] T095 Take the pictures from the running app (phone 390×844, device scale 2, README procedure) with `alt` texts that quote the screen:
  - `api/Nails.Api/Modules/Help/Content/ru/images/profile-shell/client.png`;
  - `profile-settings/settings.png`;
  - `my-bookings/list.png`;
  - `move-booking/sheet.png`;
  - `write-review/sheet.png`;
  - retake `sign-out/profile.png`.
- [x] T096 Update `README.md`:
  - the profile shell and the manifest `profile` slot;
  - the Identity account endpoints (profile, notifications, phone change, sign-out of other devices) and session stamp validation;
  - the Masters client endpoints, moves, reviews, favourites, «Стать мастером» and visibility;
  - `bookingChanged` from Masters;
  - the new settings.
- [x] T097 Run `dotnet ef migrations has-pending-model-changes --project Nails.Infrastructure --startup-project Nails.Api` in `api/` and confirm it is clean.
- [x] T098 Run `dotnet build Nails.slnx` (no warnings) in `api/`. Commit `api/Nails.Api/openapi.json`, regenerate `client/libs/shared/core/data-access/src/lib/api/schema.ts`, and run `npx nx run-many -t lint typecheck knip format-check build` in `client/`.
- [x] T099 Run `dotnet list Nails.slnx package --vulnerable --include-transitive` and `npm audit --audit-level=high`, and confirm nothing high or critical.
- [x] T100 Check the changed code for duplication (module first, then `Common/` and `libs/*/common`), comments, hardcoded values, secrets and dead code. Remove anything unused: `AccountPage`, the chats-local cancel sheet, `ChatEvents.BookingChangedAsync`, stubs, and exports nothing imports.
- [x] T101 Verify as Анна and Анна Серова in two browsers, on phone 390 px, 360 px, tablet 820 px and desktop 1440 px, against `design/` and `specs/_design-references/figma/04–08`:
  - **Bookings**: the partition and paging; confirm; cancel with a reason; a live update from the other browser.
  - **Moves**:
    - request, accept in the chat, decline, withdraw and lapse (a short lapse by booking within 2 h);
    - `move-exists`, `move-overlaps` and `slot-taken`;
    - cancelling a booking frees its held time.
  - **Reviews**: write one, then the rating on the profile; `not-completed`, `review-window-closed` and `review-exists`.
  - **Favourites**: remove one.
  - **Account**:
    - the email taken by another account;
    - the phone change with a code, then sign-in with the new phone;
    - «Выйти на других устройствах», after which the other browser is signed out and its live connection closed;
    - with the stamp validated on every request, responses re-issue the session cookie: check that the cookie keeps `HttpOnly` and `SameSite=Strict` (and `Secure` in Docker), and record the extra time per request.
  - **«Стать мастером»**: becoming a master, and twice → 409; the new profile is hidden from search and `/masters/:id` for others.
  - **Two sides**: the «Клиент / Мастер» switch, the swipe on a touch emulation, and the mode shared with chats.
  - No horizontal scroll at 360 px.

  Record the results in plan.md «Implementation notes».
- [x] T102 Run the app with `Modules__Masters__Enabled=false`, and then with `Modules__Chats__Enabled=false`. Confirm:
  - **Masters off**: only «Настройки» remains, with no «Мастер» segment, no «Стать мастером», no masters endpoints and no masters help; profile editing, the phone change and logout work.
  - **Chats off**: no «Написать»; moves can be requested and withdrawn; «Мои записи» still updates live.
- [x] T103 After the spec is built, add `> **Built** as specs/007-identity-client-account (date). Changed from this request: …` at the top of `specs_requests/007-identity-client-account.md`. List the changes: no password (sign-out of other devices instead); an optional unique email; the phone change by SMS code; the move request instead of cancel and rebook; new masters hidden; `bookingChanged` from Masters.

---

## Dependencies

- Setup (T001–T002) → Foundational (T003–T028) → user stories → Polish.
- **Inside Foundational**:
  - T003–T008 → T009 (migration);
  - T010–T012 core;
  - T013–T017 move `bookingChanged` (T013 needs T007);
  - T018–T020 shared UI;
  - T021 → T022–T024 → T025–T027 → T028.
- **US1 (T029–T040)**: needs Foundational. It is the MVP: «Мои записи» with confirm and cancel.
- **US2 (T041–T052)**: needs US1 (card, store, repository rows with `move`), T013–T014 and T010.
- **US3 (T053–T060)**: needs US1 (`MyBookingService`, card). It is independent of US2.
- **US4 (T061–T067)**: needs only Foundational. It can run in parallel with US1–US3; T062 uses `MasterVisibility` once T083 exists.
- **US5 (T068–T081)**: needs Foundational (T003–T005, T009, T011, T027). It is independent of the masters stories.
- **US6 (T082–T089)**: needs T006/T009 and US5's `MeResponse` fields (T069). T083 also touches US4's repository.
- **US7 (T090–T091)**: needs T025 and US6 (a way to get a master profile; the demo Анна already has one).
- **Polish**: T092 needs US3 (`BookingId` on reviews); T093–T095 need the screens; T095 needs T092.
