# Implementation Plan: Profile shell and client account

**Branch**: `007-identity-client-account` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-identity-client-account/spec.md`; approach from `specs_requests/007-identity-client-account.md`, the clarifications and the constitution 4.4.0.

## Summary

The profile becomes a shell with a client side and a master side, and the client side gets a real account.

- **Identity (core)**:
  - the account's photo, optional unique email, Telegram, Viber, contact method and notification switches, edited by `PATCH /api/identity/me`;
  - a phone change confirmed by an SMS code;
  - «Выйти на других устройствах»: the security stamp, validated on every request, plus closing the account's live connections;
  - contracts for Masters to read the account (`IAccountDirectory.ProfileAsync`) and link a master profile (`IAccountLinks`).
- **Masters**:
  - «Мои записи» (upcoming and past, paged, with `canReview`, `myReview` and the open move);
  - writing reviews (completed, 30 days, once per side);
  - «Мои отзывы» / «Отзывы обо мне»;
  - the list of favourite masters;
  - «Стать мастером» with the default schedule;
  - the move request (hold a slot, the master accepts or declines, the request lapses in the sweep);
  - new masters hidden until they have a service and a map point;
  - `bookingChanged` is published by Masters itself.
- **Chats**: the system messages of a move, «Принять перенос» / «Отклонить перенос» on the booking card, and matching `bookingChanged` by booking id.
- **Client**:
  - the core `ProfileShell` («Режим профиля», swipe, the mode from the address);
  - `ClientAccount` with the side card and the section navigation;
  - the core `SettingsPanel` and its sheets;
  - the masters sections through a new `profile` slot in the module manifest;
  - shared `CancelBookingSheet`, `SegmentedToggle`, `Swipe` and `SlotPicker`.

Details in [research.md](research.md), [data-model.md](data-model.md) and [contracts/identity-masters.md](contracts/identity-masters.md).

## Technical Context

**Modules touched**: identity, masters, chats, core (realtime, time helper, frame and manifest, overlays), help

**Platforms**: web.
- In `libs/shared`: the API methods, stores and the pure booking tag mapping.
- In `libs/web`: the shell, panels and sheets.

**Module interaction**:
- Masters uses:
  - `Identity.Contracts`: `ICurrentUser`, `IAccountDirectory` (+ `ProfileAsync`), the new `IAccountLinks`, and `ISessionService.MeAsync` for «Стать мастером»'s answer;
  - `Catalog.Contracts.ICatalog` (the category and its specialty);
- Identity uses `Common/Media` (`IMediaOwnership`) for the photo and `Common/Realtime` (`IRealtimeConnections`) for signing out other devices.
- Chats uses `Masters.Contracts.BookingCard` (+ `Move`) and `Masters.Events` (the five move kinds). It no longer publishes `bookingChanged`.
- Identity uses no switchable module.
- On the client:
  - core hosts the masters sections only through `ModuleManifest.profile`, so core imports no module library;
  - chats calls the masters move endpoints over HTTP, like confirm and cancel.

**Stack**: .NET 10 (ASP.NET Core controllers, EF Core 10 on PostgreSQL, ASP.NET Core Identity's `SecurityStampValidator`), Angular 22 (Nx, signals, Angular Material). No new packages.

**Storage**: migration `AddClientAccount`:
- `identity.users` gets `photo_url`, `telegram`, `viber`, `preferred_contact`, `notify_*`, and a unique filtered `EmailIndex`;
- new `identity.phone_change_codes`;
- `masters.masters.location_set`;
- new `masters.booking_moves` (`version` token, partial unique open index);
- the index `masters.reviews (client_user_id, author_role, created_at)`.

See [data-model.md](data-model.md).

**Contracts**: [contracts/identity-masters.md](contracts/identity-masters.md):
- Identity: `PATCH me`, `PUT me/notifications`, `POST me/phone/code`, `POST me/phone`, `POST sign-out/others`; `MeResponse` gains its profile fields.
- Masters: `GET bookings/mine`, `GET bookings/{id}`, `POST bookings/{id}/reviews`, `POST|DELETE bookings/{id}/move`, `POST bookings/{id}/move/accept|decline`, `GET reviews/mine`, `GET favorites`, `GET cities`, `POST me`.
- `BookingCard.move`, and `BookingChangedEvent` moved to Masters.

**Settings** (Development, Docker, Production):
- `Modules:Identity:Session:StampValidationInterval` `00:00:00`;
- `Modules:Masters:Reviews:WindowDays` 30;
- `Modules:Masters:MyBookings` and `Modules:Masters:Favorites` page sizes (20 and 50);
- `Modules:Masters:Cities:Items` (six centres);
- `Modules:Masters:NewMaster` (the default schedule).

Values in [data-model.md](data-model.md).

**Constraints**:
- «Мои записи» first page p95 < 300 ms with 200 bookings per client;
- a booking change reaches «Мои записи» of both sides within 1 s, also with Chats off;
- other devices are signed out on their next request and lose their live connection at once;
- signed-in responses renew the session cookie (stamp validated on every request), with its flags unchanged;
- every panel and sheet works from 360 px without horizontal scroll;
- with Masters off, the client side shows only «Настройки» and nothing else changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched:
- **I**: Minsk dates through `formatShortDate`, `formatTime` and the new server `RussianDate`; phones through `formatPhone`; plurals for counts; Russian texts written directly.
- **II**: `TelegramName`, `ReviewWindow`, `BookingTransitions.Move`, `BookingMoves.LapsesAt`, and `MyBookingScope` are pure; every permission is checked in Application.
- **III**: `openapi.json` and `schema.ts` are regenerated.
- **IV and VI**: masters sections come through the manifest, and Masters uses Identity contracts only.
- **V**: new files only in the allowed folders.
- **VII**: the frame and profile slots come through manifests, with every state of every panel.
- **VIII**: bookings, moves and reviews are two-party data, checked by side.
- **IX**: the phone change is confirmed, sessions are revoked, the email is never used to sign in, and no typed text goes into logs or URLs.
- **X**: help.

| Gate | Status |
|---|---|
| II. Rules pure, server enforces | Pass: the rules above are in `Rules/`; side, owner, window, duplicate, hold and visibility are enforced in services. The client's `bookingTag` maps a server status to a label and never decides a rule. |
| III. Contract and `/api` only | Pass: every endpoint is under `/api/identity` or `/api/masters`; both generated files are rebuilt. |
| IV. A disabled module exposes nothing | Pass. With Masters off: no sections, no «Стать мастером», no «Мастер» segment, no masters help; settings and logout work. With Chats off: moves still work for the client but lapse (spec edge case); «Написать» hides. |
| V. Allowed folders | Pass: `Identity/Rules/TelegramName`; `Masters/Rules/{ReviewWindow, BookingMoves, MyBookingScope}` and the query expression `Masters/Repositories/MasterVisibility`; `Common/Time/RussianDate`; `Common/Realtime/IRealtimeConnections` with its Host implementation. |
| VI. Cross-module via Identity, Catalog and declared dependencies | Pass: Masters → `Identity.Contracts` (`IAccountDirectory`, `IAccountLinks`, `ISessionService`); Chats → Masters' `Contracts` and `Events`. The client manifest's `profile` slot is a new way for modules to contribute, introduced by this spec (research R12). |
| VII. Frame through manifests; states; 360 px | Pass: `ModuleManifest.profile`; skeletons, «Не удалось загрузить» + «Повторить», empty states, toasts and busy buttons in every panel. The «Клиент / Мастер» switch saves the mode without a toast: the page that opens on the other side is its success feedback, as with «Режим чатов» in spec 006, and a failure shows the error toast. |
| VIII. Two-party data | Pass: `bookings/mine`, `bookings/{id}`, reviews and moves check `ClientUserId` or the master's `UserId`; reviews about a client are returned only to that client (clarification). |
| IX. Security and privacy | Pass: the phone is changed only with a code to the new number; the stamp is validated on every request; revoked devices lose their live connection; review text, reasons and contacts are never logged; nothing typed goes into URLs or storage. |
| No hardcoded values | Pass: the window, page sizes, cities, default schedule and stamp interval are settings. The rules, «Версия 1.0» and the info texts are spec texts (constants). |
| One type per file; no comments | Pass by construction. |
| Abstractions with two uses | `IAccountLinks` is a module contract (Masters cannot write Identity tables). `IRealtimeConnections` isolates the hub. `SegmentedToggle`, `Swipe`, `CancelBookingSheet` and `SlotPicker` each have two real uses. |
| Additive migration | Pass: new columns with defaults, two new tables, two indexes. Making `EmailIndex` unique is a constraint on a column that has no data yet (phone sign-in never set an email). |
| Unbounded lists paginated | Pass: bookings (both scopes), reviews and favourites are paged. `GET cities` is bounded by settings. |

Post-design re-check: Pass, with no exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/007-identity-client-account/
├── plan.md, research.md, data-model.md
├── contracts/identity-masters.md
├── checklists/requirements.md
├── design/{phone,tablet,desktop}/profile-client-*.png
└── tasks.md                                   /speckit-tasks
```

### Source Code

```text
api/
├── Nails.Api/
│   ├── Host/Realtime/{AppHub, HubRealtimeConnections}.cs          connection registry, abort by user
│   ├── Modules/Identity/Controllers/{SessionController, AccountController}.cs
│   │                                                               AccountController: me (PATCH), me/notifications, me/phone/code,
│   │                                                               me/phone, sign-out/others
│   ├── Modules/Masters/Controllers/{BookingsController, MyAccountController,
│   │                                MastersController}.cs          mine, {id}, reviews, move*, reviews/mine, favorites, cities, me
│   ├── Modules/Help/Content/ru/articles/{core.json, masters.json, chats.json}
│   ├── Modules/Help/Content/ru/images/{profile-shell, profile-settings, my-bookings, move-booking, write-review,
│   │                                   sign-out}/*.png
│   ├── openapi.json
│   └── appsettings.{Development,Docker,Production}.json            Modules:Identity:Session, Modules:Masters:{Reviews, MyBookings,
│                                                                   Favorites, Cities, NewMaster}
├── Nails.Application/
│   ├── Common/Exceptions/ErrorCodes.cs                             + 11 codes
│   ├── Common/Realtime/IRealtimeConnections.cs
│   ├── Common/Time/RussianDate.cs
│   ├── Modules/Identity/
│   │   ├── IdentityModule.cs                                       stamp validation, SessionOptions, AccountService
│   │   ├── Contracts/{IAccountService, IAccountLinks, IAccountDirectory (+ProfileAsync), AccountProfile}.cs
│   │   ├── Requests/{UpdateProfileRequest, NotificationSettingsRequest, PhoneChangeCodeRequest, PhoneChangeRequest}.cs
│   │   ├── Responses/{MeResponse (+profile fields), NotificationSettingsResponse}.cs
│   │   ├── Options/SessionOptions.cs
│   │   ├── Rules/TelegramName.cs
│   │   ├── Seed/IdentityDemoData.cs                                Анна's photo and contacts
│   │   └── Services/{AccountService, AccountLinks, AccountDirectory, SessionService (Me), IdentityErrors}.cs
│   ├── Modules/Masters/
│   │   ├── MastersModule.cs                                        new options and services; realtime BookingChangedEvent
│   │   ├── Contracts/{IMyBookingService, IReviewWriteService, IMyReviewService, IMasterOnboardingService,
│   │   │              IBookingMoveService, BookingCard (+Move), BookingMoveCard}.cs
│   │   ├── Events/BookingChangeKind.cs                             + five move kinds
│   │   ├── Requests/{MyBookingsRequest, WriteReviewRequest, MyReviewsRequest, FavoritesRequest, MoveBookingRequest,
│   │   │             BecomeMasterRequest}.cs
│   │   ├── Responses/{MyBookingResponse, MyReview, MyReviewResponse, MyReviewsResponse, FavoriteMasterResponse,
│   │   │              BookingChangedEvent}.cs
│   │   ├── Options/{MyBookingsOptions, FavoritesOptions, CityOptions, CitiesOptions, NewMasterOptions,
│   │   │            ReviewOptions (+WindowDays)}.cs
│   │   ├── Rules/{ReviewWindow, BookingMoves, MyBookingScope, BookingTransitions (+Move)}.cs
│   │   ├── Seed/{MastersDemoScenario, MastersDemoSeeder}.cs        review booking ids, a reviewable visit
│   │   └── Services/{MyBookingService, ReviewWriteService, MyReviewService, MasterOnboardingService, BookingMoveService,
│   │                 BookingChanges (+withdraw move), BookingTimeRules (+lapse), BookingEvents (+realtime),
│   │                 FavoriteService (+list), MastersErrors}.cs
│   └── Modules/Chats/
│       ├── Rules/ChatTexts.cs                                      move texts
│       ├── Services/{BookingChatHandler, ChatEvents}.cs            no bookingChanged publication
│       └── Responses/BookingChangedEvent.cs                        removed (moved to Masters)
└── Nails.Infrastructure/
    ├── Modules/Identity/{Entities/{ApplicationUser, PreferredContact, PhoneChangeCode},
    │                     Configurations/{ApplicationUserConfiguration, PhoneChangeCodeConfiguration},
    │                     Contracts/{IPhoneChangeCodeRepository, IAccountLinkRepository},
    │                     Repositories/{PhoneChangeCodeRepository, AccountLinkRepository, AccountDirectoryRepository}}.cs
    ├── Modules/Masters/{Entities/{Master (+LocationSet), BookingMove, BookingMoveStatus},
    │                    Configurations/{MasterConfiguration, BookingMoveConfiguration, ReviewConfiguration},
    │                    Contracts/{IMyBookingRepository, IReviewRepository, IBookingMoveRepository, IOnboardingRepository},
    │                    Repositories/{MyBookingRepository, ReviewRepository, BookingMoveRepository, OnboardingRepository,
    │                                  MasterSearchRepository, MasterProfileRepository, FavoriteRepository,
    │                                  BookingRepository}}.cs
    └── Persistence/Migrations/*_AddClientAccount.cs
client/
└── libs/
    ├── shared/core/data-access/src/lib/
    │   ├── api/schema.ts                                           regenerated
    │   ├── identity/{identity-api, session-store}.ts               profile, notifications, phone change, sign-out others
    │   └── realtime/{realtime-service, realtime-events}.ts         connectionLost$; bookingChanged { booking }
    ├── shared/masters/data-access/src/lib/
    │   ├── masters-api.ts                                          mine, booking, reviews, move, favorites, cities, becomeMaster
    │   ├── my-bookings/{my-bookings-store, booking-tags}.ts
    │   ├── my-reviews-store.ts, favorite-masters-store.ts
    ├── shared/chats/data-access/src/lib/{chats-api, chat-thread-store}.ts   acceptMove, declineMove; match by booking id
    ├── web/common/ui/src/lib/{segmented-toggle, swipe}.ts
    ├── web/common/overlays/src/lib/cancel-booking-sheet/{cancel-booking-sheet, cancel-booking-texts}.ts   moved from chats
    ├── web/core/feature/src/lib/
    │   ├── modules/module-manifest.ts                              + ProfileSection, ProfileContribution
    │   ├── bootstrap/routes.ts                                     profile shell routes, redirects, requireMasterSide
    │   ├── profile/{profile-shell, client-account, account-card, section-nav, client-section-redirect,
    │   │            require-master-side}.ts
    │   ├── profile/settings/{settings-panel, edit-profile-sheet, phone-sheet, contact-sheet, sign-out-others-sheet,
    │   │                     info-sheet, info-texts, notification-switches}.ts
    │   └── account/account-page.ts                                 removed
    ├── web/masters/feature/src/lib/
    │   ├── manifest.ts                                             profile: sections, master placeholder, settings action
    │   ├── booking/{booking-sheet, slot-picker}.ts                 SlotPicker extracted
    │   ├── profile/photo-viewer.ts                                 uses appSwipe
    │   └── account/{bookings-panel, my-booking-card, move-booking-sheet, review-sheet, favorites-panel,
    │                reviews-panel, master-action, become-master-sheet, master-side-placeholder, account-texts}.ts
    └── web/chats/feature/src/lib/
        ├── bookings/booking-card.ts                                move line, accept and decline
        └── list/mode-switch.ts                                     uses SegmentedToggle; cancel sheet from overlays
README.md                                                           profile shell, manifest profile slot, Identity account API,
                                                                    Masters client endpoints, moves, visibility, settings
```

**Module switch**:
- **Masters on**: the manifest adds «Записи», «Избранное», «Отзывы», the master placeholder and «Стать мастером» / «Перейти в кабинет мастера». The endpoints above are exposed. The sweep lapses moves, and `bookingChanged` is published.
- **Masters off** (Chats is off too):
  - `/profile/client` shows only «Настройки» and redirects there;
  - no «Мастер» segment, and `/profile/master` redirects to the client side;
  - Identity's profile, phone, notifications and sign-out endpoints keep working, and the masters tables stay.
- **Chats off**: «Написать» hides; moves can be requested and withdrawn but lapse unanswered; `bookingChanged` still reaches «Мои записи».

**Help**:
- **`core.json`**:
  - new `profile-shell` «Профиль: клиент и мастер»: «Режим профиля», the swipe, the side card, the sections, the mode shared with chats, and the master side's placeholder «Кабинет мастера появится здесь» with «Перейти в режим клиента». Picture `images/profile-shell/client.png`.
  - new `profile-settings` «Настройки профиля»:
    - «Редактировать профиль» with the photo, «Имя и фамилия», «Электронная почта» (optional; «Эта почта уже используется другим аккаунтом»; you sign in by phone, not by email), Telegram and Viber and their messages;
    - «Способ связи»;
    - the notification switches (the toast «Сохранено», the error «Не удалось сохранить настройку»; «сохраняются сейчас, заработают вместе с уведомлениями»);
    - «Язык», «О приложении» and «Правила использования» with the five rules;
    - «Справка».

    Picture `images/profile-settings/settings.png`.
  - new `change-phone` «Смена номера телефона»: «Получить код», the code step, «Этот номер уже привязан к другому аккаунту», «Это ваш текущий номер», «Неверный код», «Код устарел. Запросите новый.», «Номер изменён»; the next sign-in uses the new number; other devices stay signed in. Related: `sms-not-arriving`, `sign-out-other-devices`.
  - new `sign-out-other-devices` «Выйти на других устройствах»: the sheet, the toast, and what happens on the other phones.
  - changed `sign-out`: «Выйти из аккаунта» now sits at the bottom of «Настройки»; retake `images/sign-out/profile.png`.
  - changed `navigation`: «Профиль» opens «Записи» or «Настройки».
- **`masters.json`**:
  - new `my-bookings` «Мои записи»:
    - «Предстоящие» / «Прошлые», every status tag and line, «Подтвердить», «Написать», «Записаться снова»;
    - «Отменить» with the «Отмена записи» sheet, its reasons and the switch;
    - the empty states.

    Picture `images/my-bookings/list.png`.
  - new `move-booking` «Перенос записи»:
    - the sheet, «Предложить перенос», the held time, «Перенос на … ждёт ответа мастера», «Отменить перенос»;
    - the lapse, the errors («Перенос уже ждёт ответа мастера», «В это время у вас уже есть другая запись», «Свободного времени нет — напишите мастеру», «Это окно уже занято, выберите другое время»);
    - booking another visit at the held time withdraws the request automatically, and the chat shows «Клиент отменил перенос»;
    - cancelling the booking itself ends its request and releases the held time.

    Picture `images/move-booking/sheet.png`.
  - new `write-review` «Отзыв о визите»: «Оставить отзыв», the sheet, the 30-day window, once only, final, «Напишите нам» for mistakes, and the errors. Picture `images/write-review/sheet.png`.
  - new `my-reviews` «Мои отзывы и отзывы обо мне»: the two tabs and their empty states; reviews about you are seen only by you and by masters you booked with.
  - changed `favorites`: the «Избранное» section of the profile, removing with the heart, and the empty state.
  - new `become-master` «Как стать мастером»: the sheet, its fields and errors, «Профиль мастера создан»; the profile isn't shown in search until it has services and a map point; the «Мастер» side.
- **`chats.json`**: changed `chat-bookings` with the move system messages, and the master's «Принять перенос» / «Отклонить перенос».
- Core and masters articles never mention chats (006 rule). Moves are explained for the client in `masters.json`, and the master's answer in `chats.json`.

**Structure Decision**:
- **Identity gets an `AccountController`** for the signed-in account's own data; `SessionController` keeps sign-in, sign-out, me and mode.
- **Masters gets `MyAccountController`** (`bookings/mine`, `reviews/mine`, `favorites`, `cities`, `me`) next to the existing booking, favourites and masters controllers. Reviews and moves stay on `BookingsController` because they are booking sub-resources.
- **Client**:
  - the shell and settings live in `web/core/feature/profile`;
  - the masters panels live in `web/masters/feature/account`, reached only through the manifest;
  - pieces used by two modules move to `web/common`.

## Changes to earlier specs

- **002**: `ModuleManifest` gains the `profile` slot; `web/common` gains `SegmentedToggle`, `Swipe` and `CancelBookingSheet`.
- **003**:
  - the account page becomes the profile shell;
  - `MeResponse` gains the profile fields;
  - the phone can change (with a code);
  - sessions validate the security stamp, which also restores the `OnValidatePrincipal` hook the cookie events had dropped;
  - «Выйти на других устройствах».
- **004 and 005**:
  - masters without a service or a map point are hidden (none exist yet);
  - ratings include new reviews at once (they were already derived);
  - booking gains moves, and a new booking withdraws an overlapping open move request;
  - `BookingCard` gains `move`;
  - `bookingChanged` comes from Masters.
- **006**:
  - Chats stops publishing `bookingChanged` and matches it by booking id;
  - the booking card gains the move line and answers;
  - `CancelBookingSheet` and the mode switch move to shared components;
  - `IRealtimeConnections` is added to the realtime core.
- **Constitution**: no amendment. The manifest `profile` slot is a way for modules to contribute that this spec introduces (VI).

## Complexity Tracking

No violations.

## Implementation notes

Decisions taken while building, in addition to [research.md](research.md):

- **Responses.** `MyBookingResponse` wraps the existing `BookingResponse` (`booking`, plus `upcoming`, `canReview`, `myReview` and `move`) instead of repeating its fields. One `IMyReviewService` writes reviews and lists «Мои отзывы»; the favourites list is `IFavoriteService.ListAsync`. A shared `BookingResponses` builds booking answers for `BookingService` and the client's account.
- **Visibility and ratings.** `MasterVisibility` is a query extension in `Masters/Repositories` (a query filter, not a business rule); profile, card, slots and reviews use `VisibleTo(viewer)` so an owner still sees a hidden profile. The favourites query computes the rating inline, as search and profile do; no separate `MasterRatings` expression.
- **Shared helpers.** `Infrastructure/Common/DatabaseErrors.IsUniqueViolation` replaces three copies of the Npgsql check. On the client: `PhoneField` (the «+375» input of sign-in and the phone sheet), `ConflictNotes` (booking sheet and move sheet), `PagedList` (bookings, reviews, favourites), `ScrollSentinel`, `profileLink` (exported from core for masters screens). Unknown `/profile/client/<x>` sections redirect to the first section.
- **Fixes found while verifying.** `IAccountLinks.SetMasterAsync` also updates the user already tracked in the request (the stamp validator loads it), so «Стать мастером» answers with `masterId`. The demo seeder links each visit to at most one review per side.
- **Texts.** The cancel sheet keeps showing a failure inline in the sheet, as in spec 006. `MoveBookingRequest` has the field message «Выберите время» (the client always sends a time). Selected rating stars and the favourites heart are filled.
- **Verification (2026-10-16).** API, as Анна, Марина Ковалёва and a new account: bookings partition and paging, `canReview` and `myReview`; reviews (`Поставьте оценку`, `not-completed`, `review-window-closed`, `review-exists`, `not-booking-party`, rating count +1 at once); favourites; a move request, `move-exists`, the held slot, withdraw and `move-not-open`, the master's accept moving the booking with the chat messages «Клиент предлагает перенести запись на 19 окт, 10:00», «Клиент отменил перенос», «Мастер принял перенос на 19 окт, 14:30»; Telegram and Viber validation, the email saved and `email-taken`, a foreign photo `media-not-owned`, notifications; `phone-same`, `phone-taken`, the phone change and sign-in with the new number; «Выйти на других устройствах» (the other session gets 401, this one stays); «Стать мастером» twice → `master-exists`, the new profile hidden from others and search but visible to its owner, the mode switch to master. Headless Edge at 360, 390, 820 and 1440 px: every panel and the move, cancel, edit and phone sheets without horizontal scroll; `?tab=favorites&x=1` → `/profile/client/favorites?x=1`. With `Modules__Masters__Enabled=false`: `/profile` shows only «Настройки», no «Мастер», `/profile/master` → client, masters endpoints and help gone. With `Modules__Chats__Enabled=false`: no «Написать», moves work. `has-pending-model-changes` clean, Release build without warnings, no vulnerable packages, `npm audit` clean, the client gate passes uncached. Not observed in a browser: a live `bookingChanged` refresh between two open tabs and the swipe on a real touch screen; both paths were reviewed in code.
