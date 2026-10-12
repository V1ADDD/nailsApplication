---

description: "Task list for spec 005: master profile and booking"
---

# Tasks: Master profile and booking

**Input**: Design documents from `/specs/005-masters-profile-booking/` (plan.md, spec.md, research.md, data-model.md, contracts/profile-and-bookings.md); approach from `specs_requests/005-masters-profile-booking.md` (not tracked by git), with the old-app sources `specs_requests/reference/{rules.ts,mock-apis.ts,mock-db.ts}`.

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: None. This project writes no tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5 from spec.md)
- Every C# type goes in its own file named after the type. No comments in code. Russian for every user-facing string, English for everything else.

## Path Conventions

- Infrastructure: `api/Nails.Infrastructure/Modules/<Module>/{Entities,Configurations,Contracts,Repositories,Models,Options}/`, migrations `api/Nails.Infrastructure/Persistence/Migrations/`
- Application: `api/Nails.Application/Modules/<Module>/{Contracts,Services,Requests,Responses,Options,Rules,Events}/`, registration `<Module>Module.cs`
- API: `api/Nails.Api/Modules/<Module>/Controllers/`, settings `api/Nails.Api/appsettings.{Development,Docker,Production}.json`, help `api/Nails.Api/Modules/Help/Content/ru/articles/masters.json`
- Client: `client/libs/shared/masters/data-access/`, `client/libs/web/masters/feature/`, core `client/libs/{shared,web}/{core,common}/`

## Phase 1: Setup

- [X] T001 Create the git branch `005-masters-profile-booking` from `master` (no other setup; no new packages).
- [X] T002 Add the following to `specs_requests/006-chats-realtime-media.md` (not tracked by git), so that spec 006 picks it up:
  - Its Chats `IBookingChangedHandler` is the first use of events across modules, so 006 amends constitution VI from 4.3.0 to 4.4.0 in a separate commit. The amendment lets a module use `Nails.Application.Modules.<Module>.Events` of a module whose spec introduced those events.
  - 006 adds `confirm` and `cancel` to the client `MastersApi`, unless 007 or 009 adds them first.

  The constitution itself is not changed in 005.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Core errors and settings**

- [X] T003 [P] In `api/Nails.Application/Common/Exceptions/ErrorCodes.cs`, add `MasterNotFound = "master-not-found"`, `BookingNotFound = "booking-not-found"`, `SlotNotFound = "slot-not-found"`, `SlotTaken = "slot-taken"`, `SelfBooking = "self-booking"`, `ServiceNotOffered = "service-not-offered"`, `NotPending = "not-pending"`, `SameSideConfirm = "same-side-confirm"`, `CannotCancel = "cannot-cancel"` and `NotBookingParty = "not-booking-party"`.
- [X] T004 [P] Give `ConflictException` and `NotFoundException` a leading `code` parameter (like `ForbiddenException(string code, string title)`) in `api/Nails.Application/Common/Exceptions/ConflictException.cs` and `NotFoundException.cs`. Update every caller, including `Nails.Application/Modules/Help/Services/HelpService.cs` (`ErrorCodes.NotFound`).
- [X] T005 Create `api/Nails.Application/Modules/Masters/Services/MastersErrors.cs`, a static class like `IdentityErrors`. It holds factories with the exact titles:
  - `MasterNotFound()` 404 «Мастер не найден»
  - `BookingNotFound()` 404 «Запись не найдена»
  - `SlotNotFound()` 404 «Окно не найдено»
  - `SlotTaken()` 409 «Это окно уже занято, выберите другое время»
  - `SelfBooking()` 409 «Нельзя записаться к самой себе»
  - `ServiceNotOffered()` 409 «Мастер не оказывает эту услугу»
  - `NotPending()` 409 «Запись уже не ожидает подтверждения»
  - `SameSideConfirm()` 409 «Запись подтверждает другая сторона»
  - `CannotCancel()` 409 «Эту запись уже нельзя отменить»
  - `NotBookingParty()` 403 «Это не ваша запись»

  Replace the `"Мастер не найден"` literals in `Services/FavoriteService.cs` and `Services/MasterSearchService.cs` with `MastersErrors.MasterNotFound()`.
- [X] T006 [P] Create the options classes in `api/Nails.Application/Modules/Masters/Options/`. Each has a `SectionName` constant and data annotations:
  - `BookingOptions` (`Modules:Masters:Booking`, `[Range(1, 31)] int SlotDays`);
  - `ReviewOptions` (`Modules:Masters:Reviews`, `[Range(1, 100)] DefaultPageSize`, `[Range(1, 100)] MaxPageSize`);
  - `BookingTimeRulesOptions` (`Modules:Masters:TimeRules`, `[Range(typeof(TimeSpan), "00:00:05", "01:00:00")] TimeSpan Interval`).
- [X] T007 Add `"Booking": { "SlotDays": 14 }`, `"Reviews": { "DefaultPageSize": 20, "MaxPageSize": 50 }` and `"TimeRules": { "Interval": "00:01:00" }` under `Modules:Masters` in `api/Nails.Api/appsettings.Development.json`, `appsettings.Docker.json` and `appsettings.Production.json`.

**Pure rules (`api/Nails.Application/Modules/Masters/Rules/`, one type per file, no clock, no I/O)**

- [X] T008 [P] Port `OnePerStart` and `StatusFor` from `specs_requests/reference/rules.ts` into `Slots.cs`:
  - `OnePerStart(IEnumerable<SlotView>)` gives one entry per `StartAt`, preferring a `Free` one, sorted by start;
  - `StatusFor(SlotStatus)` maps to `SlotEntryStatus`: `Free → free`, `Pending → pending`, `Booked`/`Busy → busy`;
  - add the value types `SlotView.cs` (`Id`, `StartAt`, `DurationMin`, `Status`) and `Responses/SlotEntryStatus.cs` (enum `Free`, `Pending`, `Busy`).
- [X] T009 [P] Port the booking time rules into `Bookings.cs`:
  - constants `ShortLeadHours = 2`, `LongLeadHours = 24`, `MinGapBetweenBookingsMin = 60`;
  - `PendingReleaseAt(DateTimeOffset start, DateTimeOffset createdAt)`: lead ≤ 2 h → `start`; lead > 24 h → `start − 24 h`; otherwise `start − 2 h`;
  - `Overlaps(TimeRange a, TimeRange b)` on half-open `[start, start + duration)`;
  - `Conflicts(TimeRange candidate, IEnumerable<BookingWindow> bookings)` returns `BookingConflicts(Overlapping, TooClose)`. Only Pending and Confirmed count. `TooClose` are bookings that overlap the candidate widened by 60 min on both sides but don't overlap the candidate itself.
  - value types `TimeRange.cs`, `BookingWindow.cs` (`Id`, `Range`, `Status`) and `BookingConflicts.cs`.
- [X] T010 [P] Create the state machine of data-model.md in `BookingTransitions.cs`, with the value types `BookingState.cs` (status, created by, start, duration) and `TransitionResult.cs` (new booking status, new slot status, or an error code from `ErrorCodes`):
  - `Confirm(state, Party by)`: not pending → `NotPending`; `by == CreatedBy` → `SameSideConfirm`; slot → `Booked`.
  - `Cancel(state)`: only Pending or Confirmed, else `CannotCancel`; slot → `Free`.
  - `Expire(state)`: Pending only; slot → `Free`. `ConfirmingSide(state)` is the side opposite to `CreatedBy`.
  - `Complete(state, now)`: Confirmed and `start + duration < now`.
  - No helper for the slot state of a new booking: a site booking always starts pending (T044 sets the slot to `Pending`). Spec 009 adds the outside-client case (`Confirmed`, slot `Busy`) with the screen that creates such bookings.
- [X] T011 [P] Create `ReviewerName.cs`: `From(string? displayName)` trims and splits on whitespace. Two or more words give `"<first> <second[0]>."` («Мария К.»); one word gives that word; empty gives «Клиент».

**Booking events (research R3)**

- [X] T012 [P] Create in `api/Nails.Application/Modules/Masters/Events/`:
  - `BookingChangeKind.cs` (`Created`, `AutoCancelled`, `Confirmed`, `AutoConfirmed`, `Cancelled`, `Expired`, `Completed`);
  - `BookingChanged.cs` (record `Guid BookingId, Guid MasterId, Guid? ClientUserId, BookingChangeKind Kind, Party? By`);
  - `IBookingChangedHandler.cs` (`Task HandleAsync(BookingChanged change, CancellationToken cancellationToken)`).
- [X] T013 Create `Contracts/IBookingEvents.cs` (`Task PublishAsync(IReadOnlyList<BookingChanged> changes, CancellationToken cancellationToken)`) and `Services/BookingEvents.cs`. It calls every `IEnumerable<IBookingChangedHandler>` in order, catches and logs each handler failure with `[LoggerMessage]` (booking id and kind only), and never rethrows. Register it in `MastersModule.cs`.

**Identity lookup (research R7)**

- [X] T014 [P] Create `api/Nails.Infrastructure/Modules/Identity/Contracts/IAccountDirectoryRepository.cs` and `Repositories/AccountDirectoryRepository.cs`. `NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken)` is a no-tracking query on `ApplicationUser` by id and returns `Id → DisplayName`; an empty input returns an empty dictionary without a query.
- [X] T015 Create `api/Nails.Application/Modules/Identity/Contracts/IAccountDirectory.cs` (`Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken)`) and `Services/AccountDirectory.cs` (delegates to the repository). Register both in `IdentityModule.cs`.

**Shared master facts**

- [X] T016 Extract the rating rounding (1 decimal, `MidpointRounding.AwayFromZero`), the headline price (`Prices.Headline` with the catalog add-on flag), the online check (`ShowOnline && online.Contains(UserId)`) and `PriceResponse` mapping from `MasterSearchService` into `api/Nails.Application/Modules/Masters/Services/MasterFacts.cs`. Make `MasterSearchService` use it, with no change to search results.

**Client core helpers**

- [X] T017 [P] Create `client/libs/shared/common/util/src/lib/date.ts`. It exports `appTimeZone = 'Europe/Minsk'` and formatters that all use `Intl.DateTimeFormat(appLocale, { timeZone: appTimeZone })`:
  - `minskDateKey(iso)`, giving `YYYY-MM-DD` of the Minsk day;
  - `formatDayChip(iso, now)`: «Сегодня», «Завтра», or the short weekday «пн»;
  - `formatDayHeading(iso, now)`: «Сегодня», «Завтра», or «пн, 12 окт»;
  - `formatShortDate(iso)`: «12 окт»;
  - `formatLongDate(iso)`: «12 октября 2026»;
  - `formatTime(iso)`: «14:30», 24 h;
  - `formatDateTime(iso)`: «12 окт · 14:30»;
  - a `NBSP` where the old app used one.
- [X] T018 [P] Create `client/libs/shared/common/util/src/lib/duration.ts` with `formatDuration(minutes)`: «45 мин», «1 ч», «1 ч 30 мин». Export it and the T017 functions from `client/libs/shared/common/util/src/index.ts`.

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - A visitor looks at a master's profile (Priority: P1)

**Goal**: `/masters/:id` shows the full public profile with free windows, services, portfolio, about, courses, reviews and contacts on phone, tablet and desktop, with every state.

**API**

- [X] T019 [P] [US1] Create the read models in `api/Nails.Infrastructure/Modules/Masters/Models/`, one per file:
  - `MasterProfileRow`: master fields, contacts, `UserId`;
  - `ProfileServiceRow`: `Id`, `SubcategoryId`, `PriceKind`, `PriceAmount`, `DurationMin`;
  - `CourseRow`, `PortfolioRow`;
  - `RatingAverage`, `ReviewsCount` and `CompletedBookings` on the row;
  - `ReviewRow`: `Id`, `ClientUserId`, `SubcategoryId`, `Rating`, `Text`, `CreatedAt`.
- [X] T020 [US1] Create `Contracts/IMasterProfileRepository.cs` and `Repositories/MasterProfileRepository.cs` in `api/Nails.Infrastructure/Modules/Masters/`, all no-tracking:
  - `FindAsync(masterId)` returns null when missing or `DeletedAt != null`. Services are ordered by `SortOrder`, courses and portfolio by `SortOrder`. Rating and counts are over client reviews and completed bookings. Uses `AsSplitQuery`; masters without services are allowed.
  - `SlotsAsync(masterId, from, to)` returns `SlotView`s with `StartAt > from && StartAt < to`.
  - `ReviewsAsync(masterId, page, pageSize)` returns client-authored reviews ordered by `CreatedAt` descending, with the total count.
- [X] T021 [P] [US1] Change the index in `api/Nails.Infrastructure/Modules/Masters/Configurations/ReviewConfiguration.cs` from `(MasterId, AuthorRole)` to `(MasterId, AuthorRole, CreatedAt)`.
- [X] T022 [P] [US1] Create the responses in `api/Nails.Application/Modules/Masters/Responses/`, records with camelCase JSON by default:
  - `MasterProfileResponse` (all fields of `MasterProfile` in the contract, including `isFavorite`, `isOwn`, `bookingsCount`, `headlinePrice`);
  - `ProfileServiceResponse(Guid Id, string SubcategoryId, string CategoryId, string Name, PriceResponse Price, int DurationMin)`;
  - `CourseResponse(string Title, string School, int Year)`;
  - `ContactsResponse(string Phone, string? Email, string? Telegram, string? Viber, string? Instagram)`;
  - `PortfolioPhotoResponse(Guid Id, string? Url, int Hue, string? Caption)`;
  - `SlotsResponse(int Days, IReadOnlyList<SlotEntryResponse> Items)` and `SlotEntryResponse(DateTimeOffset Start, int DurationMin, SlotEntryStatus Status, Guid? SlotId)`;
  - `ReviewResponse(Guid Id, string SubcategoryId, string ServiceName, int Rating, string Text, DateTimeOffset Date, string AuthorName)`.
- [X] T023 [P] [US1] Create `api/Nails.Application/Modules/Masters/Requests/ReviewsRequest.cs` with `[FromQuery(Name = "page")] [Range(1, int.MaxValue)] int Page = 1` and `[FromQuery(Name = "pageSize")] [Range(1, 100)] int? PageSize`. Reuse `CardRequest` for `lat`/`lng`.
- [X] T024 [US1] Create `Contracts/IMasterProfileService.cs` and `Services/MasterProfileService.cs` in `api/Nails.Application/Modules/Masters/`. Each method throws `MastersErrors.MasterNotFound()` for a missing or deleted master.
  - **`ProfileAsync(id, CardRequest)`**:
    - distance from `lat`/`lng`, else `MasterSearchOptions.DefaultLatitude`/`DefaultLongitude`;
    - rating, headline and online through `MasterFacts`; the category of each service through `ICatalog`;
    - `isFavorite` from `IFavoriteRepository` when signed in;
    - `isOwn` when `master.UserId == ICurrentUser.UserId`.
  - **`SlotsAsync(id)`**:
    - `now` comes from `TimeProvider`, and `to = MinskTime.StartOf(MinskTime.Today(now).AddDays(BookingOptions.SlotDays))`;
    - entries go through `Slots.OnePerStart` and `Slots.StatusFor`;
    - `SlotId` only on free entries.
  - **`ReviewsAsync(id, ReviewsRequest)`**: the page size is `min(PageSize ?? DefaultPageSize, MaxPageSize)`. Author names come from `IAccountDirectory.NamesAsync`, then `ReviewerName.From`; the service name comes from `ICatalog.SubcategoryName`. Returns `PagedResponse<ReviewResponse>` and never exposes `ClientUserId`.
- [X] T025 [US1] Register `IMasterProfileRepository`, `IMasterProfileService`, `BookingOptions` and `ReviewOptions` (`AddValidatedOptions`) in `api/Nails.Application/Modules/Masters/MastersModule.cs`.
- [X] T026 [US1] In `api/Nails.Api/Modules/Masters/Controllers/MastersController.cs`, inject `IMasterProfileService` and add three `[AllowAnonymous]` actions: `[HttpGet("{id:guid}")] Profile(id, [FromQuery] CardRequest)`, `[HttpGet("{id:guid}/slots")] Slots(id)` and `[HttpGet("{id:guid}/reviews")] Reviews(id, [FromQuery] ReviewsRequest)`.
- [X] T027 [US1] Add the migration `ReviewsByMasterDate` (`dotnet ef migrations add ReviewsByMasterDate --project Nails.Infrastructure --startup-project Nails.Api` in `api/`) and check that it only drops and creates the reviews index.
- [X] T028 [US1] Build `api/` (`dotnet build Nails.slnx`, no warnings), commit the rebuilt `api/Nails.Api/openapi.json`, and run `npx nx run shared-core-data-access:api-types` in `client/` to regenerate `client/libs/shared/core/data-access/src/lib/api/schema.ts`.

**Client**

- [X] T029 [US1] In `client/libs/shared/masters/data-access/src/lib/masters-api.ts`, add the paths `profile(id)`, `slots(id)` and `reviews(id)` to `mastersPaths`, and the methods `profile(id, location)`, `slots(id)` and `reviews(id, page)`, typed by `Schemas['MasterProfileResponse']`, `Schemas['SlotsResponse']` and `Schemas['PagedResponseOfReviewResponse']` (use the generated name). Export the new types from `client/libs/shared/masters/data-access/src/index.ts`.
- [X] T030 [US1] Add the public route `{ path: 'masters/:id', loadComponent: () => import('./profile/profile-page').then((m) => m.ProfilePage) }` to `publicRoutes` in `client/libs/web/masters/feature/src/lib/manifest.ts`. The page sets the title «<Имя> — запись онлайн» itself once loaded, through `Title`.
- [X] T031 [US1] Add every Russian text of the page and the sheet to `client/libs/web/masters/feature/src/lib/texts.ts`, exactly as in `specs_requests/005-masters-profile-booking.md` («Client»): headings, empty, loading and error states, buttons, aria labels and alt texts.
- [X] T032 [US1] Create `client/libs/web/masters/feature/src/lib/profile/profile-page.ts`:
  - **Data**: reads `:id` and the session location. Profile through `httpResource` or `MastersApi.profile`; slots and the first reviews page in parallel.
  - **Loading**: a skeleton mirroring the layout, with the aria label «Загрузка профиля мастера».
  - **404 or error**: an `EmptyState` with the search icon, «Мастер не найден», «Возможно, ссылка устарела или мастер удалил профиль.» and a button «Найти мастера на карте» (`/`).
  - **«Назад»**: `Location.back()` when the app has history, else `/`.
  - **Layout**: below 1024 px one column (hero, free windows, services, portfolio, about and courses, reviews, contacts) and the action bar. From 1024 px two columns: the main column has services, portfolio, about and reviews; a sticky sidebar of `22.5rem` (`24rem` from 1280 px) has the hero, free windows and contacts. Sizes come from the `--app-*` tokens, with no raw hex. Match `specs/005-masters-profile-booking/design/{phone,tablet,desktop}/master.png`.
- [X] T033 [P] [US1] Create `profile/profile-hero.ts`:
  - the 96 px `Avatar` with the online dot, the name as H1, the specialty;
  - `Rating` with the rating and «· N отзывов» (`plural`); the heart through `FavoritesStore` (a guest goes to sign-in with `returnTo`);
  - «Личность подтверждена» when verified;
  - facts «● онлайн», «Опыт N лет» (`plural`) and «<адрес>, <район>, <город> · <formatDistance> от вас»;
  - «Записаться» (calendar icon), which emits `book()`. «Написать» is not rendered.
- [X] T034 [P] [US1] Create `profile/free-windows.ts`, «Ближайшие свободные окна»:
  - group free entries by `minskDateKey` and show the first 3 days with up to 6 times each;
  - headings from `formatDayHeading`; each time chip emits `book(slotId)` with the aria label «Записаться: <день>, HH:mm»;
  - «Всё расписание» emits `book()`;
  - empty: «Свободных окон пока нет. Напишите мастеру — возможно, он найдёт время.»
- [X] T035 [P] [US1] Create `profile/services-section.ts`, «Услуги и цены»:
  - group by `categoryId` in the master's order, with category names from `CatalogStore` (unknown → «Другое»);
  - each row shows the name, `formatDuration`, `formatPrice` and a «Записаться» pill that emits `book(undefined, subcategoryId)`;
  - empty: «Мастер пока не добавил услуги».
- [X] T036 [P] [US1] Create `profile/portfolio-section.ts` and `profile/photo-viewer.ts`:
  - **Section**: shown only with photos; «N фото»; a grid of 3 columns, 4 from 768 px, 3 from 1024 px.
  - **Paging**: the first 6, then «Показать все N» / «Свернуть».
  - **Placeholders**: a hue gradient for photos without a URL. Alt text is the caption or «Работа мастера <Имя>, фото i».
  - **Viewer**: opened through `Sheets`. It shows «Фото i из N» with the caption; «Назад» / «Далее» wrap around; swipe and the Left/Right keys work; Escape closes.
- [X] T037 [P] [US1] Create `profile/about-section.ts`: «О себе» keeps line breaks (`white-space: pre-line`); «Обучение и курсы» shows a year pill, the title and the school. Each part is hidden when empty.
- [X] T038 [P] [US1] Create `profile/reviews-section.ts`, «Отзывы», with `id="reviews"`:
  - the profile's rating, `Rating` and «N отзывов»;
  - cards with an initials `Avatar` of `authorName`, `authorName`, the service, `formatLongDate`, stars and the text;
  - the first 3, then «Показать все N», which loads further pages through `MastersApi.reviews`;
  - **loading**: 2 skeletons;
  - **error**: `ErrorState` «Не удалось загрузить отзывы» with «Повторить»;
  - **empty**: «Пока нет отзывов» / «Отзыв можно оставить после визита к мастеру».
- [X] T039 [P] [US1] Create `profile/contacts-section.ts`, «Контакты», showing only the fields present:
  - Телефон, `tel:`, shown through `formatPhone`;
  - E-mail, `mailto:`;
  - Telegram «@handle», `https://t.me/<handle>`, new tab with `rel="noopener"`;
  - Viber, `viber://chat?number=`;
  - Instagram «@handle», `https://instagram.com/<handle>`, new tab.
- [X] T040 [P] [US1] Create `profile/action-bar.ts`: below 1024 px, a bar fixed above the tab bar with «<formatPrice(headlinePrice)>» and a gradient «Записаться» that emits `book()`. It isn't rendered from 1024 px.

**Checkpoint**: User Story 1 is complete. A guest can open any seeded master and see every section and state.

---

## Phase 4: User Story 2 - A client books a visit (Priority: P1)

**Goal**: The sheet «Запись к мастеру» books a free time, with the conflict check, atomic creation, the auto-cancel of overlapping bookings and exactly one winner on a race.

**API**

- [X] T041 [P] [US2] Create the requests in `api/Nails.Application/Modules/Masters/Requests/`:
  - `ConflictsRequest` (`[Required] Guid SlotId`);
  - `CreateBookingRequest` (`[Required] Guid MasterId`, `[Required] Guid SlotId`, `[Required] [StringLength(40)] string SubcategoryId`, where 40 is `MasterService.SubcategoryMaxLength`).
- [X] T042 [P] [US2] Create the responses in `api/Nails.Application/Modules/Masters/Responses/`:
  - `BookingSummaryResponse(Guid Id, string MasterName, string ServiceName, DateTimeOffset Start, int DurationMin, string Address)`;
  - `ConflictsResponse(IReadOnlyList<BookingSummaryResponse> Overlapping, IReadOnlyList<BookingSummaryResponse> TooClose)`;
  - `BookingResponse` with all fields of `Booking` in the contract (`releaseAt` only while pending, from `Bookings.PendingReleaseAt`);
  - `CreateBookingResponse(BookingResponse Booking, IReadOnlyList<BookingSummaryResponse> AutoCancelled, IReadOnlyList<BookingSummaryResponse> TooClose)`.
- [X] T043 [US2] Create `Contracts/IBookingRepository.cs` and `Repositories/BookingRepository.cs` in `api/Nails.Infrastructure/Modules/Masters/`:
  - **Tracked loads**: `FindSlotAsync(slotId)`, `FindBookingAsync(bookingId)`, `FindMasterForBookingAsync(masterId)` (the non-deleted `Master` with its services) and `ClientActiveBookingsAsync(clientUserId, now)` (every Pending and Confirmed booking of the client with `StartAt + DurationMin > now`, with their slots; a client has a handful, so no window is needed).
  - **No-tracking**: `SummariesAsync(bookingIds)` (joined with the master names).
  - **Add and save**: `Add(Booking)` and `SaveAsync(ct)`. `SaveAsync` returns `false` on `DbUpdateConcurrencyException` (research R2) and `true` otherwise.
- [X] T044 [US2] Create `Contracts/IBookingService.cs` and `Services/BookingService.cs` in `api/Nails.Application/Modules/Masters/` with `ConflictsAsync(ConflictsRequest)` and `CreateAsync(CreateBookingRequest)`:
  - **Conflicts**: an unknown slot → `SlotNotFound`. Load the caller's upcoming active client bookings with `ClientActiveBookingsAsync(caller, now)` and apply `Bookings.Conflicts` with the slot as the candidate. The same call feeds the auto-cancel in step 4 of create.
  - **Create**, in `IUnitOfWork.InTransactionAsync`:
    1. A missing or deleted master → `MasterNotFound`.
    2. The slot is missing, belongs to another master or isn't `Free` → `SlotTaken`.
    3. `master.UserId == caller` → `SelfBooking`; the subcategory isn't among the master's services → `ServiceNotOffered`.
    4. Each overlapping Pending or Confirmed client booking is cancelled with `CancelledBy = Client`, `CancelMutual = true`, `CancelReason` «Автоматически: новая запись на это же время» and `CancelledAt = now`; its slot becomes `Free` with `BookingId = null`.
    5. Add the booking: `Guid.CreateVersion7()`, `Pending`, `Site`, `CreatedBy = Client`, the service's `PriceKind`/`PriceAmount`, `DurationMin = max(service, slot)`, `Address = master.Address`, `SlotId`. Set the slot directly to `SlotStatus.Pending` with `BookingId`; there is no `BookingTransitions` call for it.
    6. `SaveAsync` false → throw `SlotTaken`.
  - **After commit**: publish `Created` plus one `AutoCancelled` per cancelled booking through `IBookingEvents`, and return `CreateBookingResponse`. The master and client names come from the master row and `IAccountDirectory`.
- [X] T045 [US2] Register `IBookingRepository` and `IBookingService` in `api/Nails.Application/Modules/Masters/MastersModule.cs`.
- [X] T046 [US2] Create `api/Nails.Api/Modules/Masters/Controllers/BookingsController.cs` (`[ApiController]`, `[Route("bookings")]`, signed in by default) with `[HttpPost("conflicts")]` → `ConflictsResponse` and `[HttpPost("")]` → `201 Created` with `CreateBookingResponse`.
- [X] T047 [US2] Rebuild `api/`, commit `openapi.json`, and regenerate `schema.ts` (as T028).

**Client**

- [X] T048 [P] [US2] Create `client/libs/shared/masters/data-access/src/lib/booking-preview.ts` with `pendingReleaseAt(start: Date, createdAt: Date): Date`. It previews the server rule: lead ≤ 2 h → start; > 24 h → start − 24 h; else start − 2 h. Export it.
- [X] T049 [US2] Add `conflicts(slotId)` and `book(request)` (and their `mastersPaths` entries `/api/masters/bookings/conflicts` and `/api/masters/bookings`) to `client/libs/shared/masters/data-access/src/lib/masters-api.ts`.
- [X] T050 [US2] Create `client/libs/web/masters/feature/src/lib/booking/booking-sheet.ts`, opened through `Sheets.open(BookingSheet, { profile, slots, slotId?, subcategoryId? })`:
  - **Header**: «Запись к мастеру».
  - **«Услуга»**: radio cards with the name, `formatDuration` and `formatPrice`. Preselect the requested service if offered, else the only service. With a requested service and others available, show only it plus «Другие услуги (N)» / «Скрыть другие услуги».
  - **«Дата и время»**: `slots.days` day chips, each with `formatDayChip`, `formatShortDate` and «N окон» (`plural`) or «нет окон». Start on the first day with a free time, else today.
  - **Time chips**: free ones are selectable; busy ones are disabled with «занято»; pending ones are disabled with «ожидает подтверждения» and an amber dot. An empty day shows «В этот день мастер не работает. Выберите другую дату.»
  - Match `specs/005-masters-profile-booking/design/phone/booking-sheet.png` and `design/desktop/booking-sheet.png`.
- [X] T051 [US2] Create `client/libs/web/masters/feature/src/lib/booking/booking-check.ts` («Проверьте запись») and use it in the sheet:
  - **Check**: choosing a free time calls `MastersApi.conflicts`. While it runs: «Проверяем ваши записи на это время…».
  - **Overlap** (red): «У вас уже есть запись на это время: <мастер>, <услуга>, <formatDateTime>. Она будет отменена автоматически.»
  - **Too close** (amber): «В этот день у вас есть запись в HH:mm (<мастер>, <адрес>) — проверьте, успеете ли доехать.»
  - A failed check shows nothing and doesn't block.
  - **Summary**: «Мастер»; «Услуга» with the duration, or «не выбрана»; «Когда», or «выберите время»; «Адрес» («адрес, город»); «Стоимость».
  - **Note**: «Мастер подтвердит запись в чате.» and «Если не подтвердит до <formatDateTime(pendingReleaseAt(start, now))>, окно освободится автоматически.» Without a time: «Если не подтвердит — окно освободится за 24 ч (или за 2 ч) до начала.»
  - Match `design/phone/booking-sheet-time.png`.
- [X] T052 [US2] Add submitting to the booking sheet:
  - **Button**: «Забронировать · <formatPrice>», showing «Бронируем…» while running; enabled only when a service and a time are chosen; a second press is ignored while running.
  - **Errors** show inline: «Выберите услугу и время», or the server's problem `title` (e.g. «Это окно уже занято, выберите другое время»). After an error, the slots reload.
  - **Success**: close the sheet and reload the slots on the page. Toasts: «Запись создана — ждём подтверждения мастера», then «Запись к <мастер> на это же время отменена автоматически» for each `autoCancelled`.
- [X] T053 [US2] Wire booking into `profile/profile-page.ts`:
  - `book(slotId?, subcategoryId?)` opens the sheet.
  - A guest goes to sign-in with `returnTo=/masters/:id?book=1[&service=]` (`appPaths.signIn`, `returnToParameter`).
  - With `?book=1[&service=]`, wait for the profile and `SessionStore.whenSettled()`, open the sheet once, then remove `book` and `service` with `router.navigate([], { queryParams: { book: null, service: null }, queryParamsHandling: 'merge', replaceUrl: true })`.

**Checkpoint**: User Story 2 is complete. A signed-in client books a free time, and a race gives exactly one winner.

---

## Phase 5: User Story 3 - The other side confirms or cancels (Priority: P1)

**Goal**: Confirm and cancel actions for the two sides of a booking, reused by 006, 007 and 009 (no screens in this spec).

- [X] T054 [P] [US3] Create `api/Nails.Application/Modules/Masters/Requests/CancelBookingRequest.cs` with `[Required(ErrorMessage = "Укажите причину отмены")] [StringLength(300, ErrorMessage = "Не больше 300 символов")] string Reason` and `bool Mutual`. Whitespace-only fails `Required`; the service trims before saving.
- [X] T055 [US3] Add `ConfirmAsync(Guid bookingId)` and `CancelAsync(Guid bookingId, CancelBookingRequest)` to `IBookingService` and `BookingService`:
  - **Lookup**: load the booking (`BookingNotFound`) and decide the caller's side. `ClientUserId == caller` → `Client`; the caller owns the master profile (`master.UserId == caller`) → `Master`; otherwise `NotBookingParty` (403).
  - **Rules**: apply `BookingTransitions.Confirm` or `Cancel`, and throw `MastersErrors` for the error code.
  - **Confirm**: `Confirmed`, `ConfirmedAt = now`, the slot `Booked`.
  - **Cancel**: `Cancelled`, `CancelledAt = now`, `CancelledBy = side`, `CancelReason = reason.Trim()`, `CancelMutual = mutual`; the slot `Free` with `BookingId = null`.
  - **Save**: a lost save (`SaveAsync` false) → `NotPending` for confirm, `CannotCancel` for cancel.
  - **After save**: publish `Confirmed` or `Cancelled` with `By = side`, and return `BookingResponse`. Never log the reason.
- [X] T056 [US3] Add `[HttpPost("{id:guid}/confirm")]` and `[HttpPost("{id:guid}/cancel")]` (body `CancelBookingRequest`) to `api/Nails.Api/Modules/Masters/Controllers/BookingsController.cs`, both returning `BookingResponse`.
- [X] T057 [US3] Check `POST /api/masters/bookings/{id}/confirm` and `/cancel` against the running API with two demo accounts, sending the antiforgery token as the client does:
  - a stranger gets 403 «Это не ваша запись»;
  - the creating side gets 409 «Запись подтверждает другая сторона»;
  - the other side succeeds, and a second confirm gets «Запись уже не ожидает подтверждения»;
  - an empty or whitespace reason gets «Укажите причину отмены»;
  - cancelling a cancelled booking gets «Эту запись уже нельзя отменить».

  Add no client methods for these endpoints in 005 (T002).
- [X] T058 [US3] Rebuild `api/`, commit `openapi.json`, and regenerate `schema.ts` (as T028).

**Checkpoint**: User Story 3 is complete. Confirm and cancel work through the API for the right side and fail with the exact messages for the wrong one.

---

## Phase 6: User Story 4 - Bookings move on by themselves (Priority: P2)

**Goal**: The time-rules job auto-confirms, releases and completes bookings about once a minute.

- [X] T059 [US4] Add the time-rules queries to `IBookingRepository` and `BookingRepository`, all tracked, with their slots:
  - `AutoConfirmCandidatesAsync(now)`: Pending, `CreatedBy = Client`, the master's `Schedule.AutoConfirmEnabled`, and `CreatedAt.AddMinutes(AutoConfirmAfterMinutes) <= now`;
  - `ReleaseCandidatesAsync(now)`: Pending with `StartAt <= now + 24 h`;
  - `CompleteCandidatesAsync(now)`: Confirmed with `StartAt < now`.
- [X] T060 [US4] Create `Contracts/IBookingTimeRules.cs` and `Services/BookingTimeRules.cs`. `RunAsync(DateTimeOffset now, CancellationToken)` handles each booking with its own save, skips it when `SaveAsync` returns false, and publishes events after each save:
  1. **Auto-confirm**: `Confirmed`, `ConfirmedAt = now`, slot `Booked`, event `AutoConfirmed`.
  2. **Release** when `Bookings.PendingReleaseAt(start, createdAt) <= now`: `Cancelled`, `CancelExpired = true`, `CancelMutual = true`, `CancelledBy = BookingTransitions.ConfirmingSide`, reason «Запись не подтверждена вовремя — окно освободилось», slot `Free` with `BookingId = null`, event `Expired`.
  3. **Complete** when `start + duration < now`: `Completed`, event `Completed`.
- [X] T061 [US4] Create `api/Nails.Application/Modules/Masters/Services/BookingTimeRulesJob.cs`, a `BackgroundService`:
  - a `PeriodicTimer(options.Interval, timeProvider)`;
  - each tick creates a scope (`IServiceScopeFactory`) and calls `IBookingTimeRules.RunAsync(timeProvider.GetUtcNow(), stoppingToken)`;
  - logs and continues on any exception except cancellation (`[LoggerMessage]`).
- [X] T062 [US4] Register `BookingTimeRulesOptions` (`AddValidatedOptions`), `IBookingTimeRules` (scoped) and `services.AddHostedService<BookingTimeRulesJob>()` in `api/Nails.Application/Modules/Masters/MastersModule.cs`, so a disabled module runs no job.

**Checkpoint**: User Story 4 is complete. With `Modules__Masters__TimeRules__Interval=00:00:10`, a pending booking is auto-confirmed after the master's delay, an unconfirmed one is released at its deadline, and a past confirmed one is completed.

---

## Phase 7: User Story 5 - A master sees their own page as clients do (Priority: P3)

**Goal**: A master's own profile shows the owner banner and no booking.

- [X] T063 [US5] When `profile.isOwn`, `profile-hero.ts` shows «Это ваш профиль — так его видят клиенты». There is no «Открыть кабинет» button; spec 008 adds it with the cabinet. It shows no heart and no «Записаться». `free-windows.ts` renders the time chips and «Всё расписание» disabled, `services-section.ts` hides the «Записаться» pills, `action-bar.ts` is not rendered, and `?book=1` does nothing.

**Checkpoint**: User Story 5 is complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T064 Check `dotnet ef migrations has-pending-model-changes --project Nails.Infrastructure --startup-project Nails.Api` in `api/` (clean), and check that `ReviewsByMasterDate` is additive (an index replacement only).
- [X] T065 Build `api/` with no warnings (`dotnet build Nails.slnx`). Confirm that `api/Nails.Api/openapi.json` and `client/libs/shared/core/data-access/src/lib/api/schema.ts` match the final contract.
- [X] T066 Update the help in `api/Nails.Api/Modules/Help/Content/ru/articles/masters.json`, in a section «Мастер и запись», quoting the on-screen texts exactly and marking controls in `**bold**`:
  - **new article `master-profile` («Профиль мастера»)**:
    - the hero, «Ближайшие свободные окна», «Услуги и цены», «Портфолио» and the viewer, «О себе», «Обучение и курсы»;
    - «Отзывы», with authors shown as «Мария К.»;
    - «Контакты», «Это ваш профиль — так его видят клиенты», «Мастер не найден»;
  - **new article `book-a-master` («Запись к мастеру»)**:
    - steps: service, day, time;
    - «занято» and «ожидает подтверждения»; the red and amber warnings;
    - waiting for confirmation; the deadline (at the start, 2 h or 24 h before); auto-confirm by the master; that cancelling needs a reason;
    - every error: «Это окно уже занято, выберите другое время», «Нельзя записаться к самой себе», «Мастер не оказывает эту услугу», «Выберите услугу и время»;
    - a `note` (`info`) that confirming and cancelling screens come with chats and «Мои записи»;
  - **`related` links**: `find-on-map` ↔ `master-profile` ↔ `book-a-master`.
- [X] T067 Take the help pictures from the running app (README «Help content»: 390×844, device scale 2, demo account Анна Новикова): `api/Nails.Api/Modules/Help/Content/ru/images/master-profile/profile.png`, `images/book-a-master/sheet.png` and `images/book-a-master/check.png` (a chosen time with the summary). Add `image` blocks with `alt` texts quoting the screens.
- [X] T068 Update `README.md`: the Masters endpoints (profile, slots, reviews, bookings), the settings `Modules:Masters:{Booking,Reviews,TimeRules}`, the time-rules job, booking events and `IAccountDirectory`.
- [X] T069 Run `npx nx run-many -t lint typecheck knip format-check build` in `client/` (passes). Run `dotnet list Nails.slnx package --vulnerable --include-transitive` in `api/` and `npm audit --audit-level=high` in `client/`; neither may report anything high or critical.
- [X] T070 Check the changed code for duplication (the `"Мастер не найден"` literals are gone, and `MasterFacts` is used by search, card and profile), comments, hardcoded values (the days, page sizes and interval come from settings) and secrets. Check that no free text reaches logs, URLs or storage (the cancel reason isn't logged), and that only the sides of a booking see `clientName`.
- [X] T071 Verify in the running app (Development seed, `Modules__Masters__TimeRules__Interval=00:00:10`):
  - **Profile**: a guest sees every section and state; a missing id shows «Мастер не найден».
  - **Booking**: book a free slot. Two browsers booking the same slot: exactly one wins, and the other sees «Это окно уже занято, выберите другое время». Booking yourself gives «Нельзя записаться к самой себе». An overlapping booking is auto-cancelled with the toast.
  - **Confirm and cancel** through the API: the wrong side gets «Запись подтверждает другая сторона», the right side succeeds; cancelling without a reason gives «Укажите причину отмены».
  - **What clients see**: a client never sees `booked`.
  - **Job**: auto-confirm, release and complete.
  - **Sizes**: 1440, 820, 390 and 360 px against `design/`, with no horizontal scroll at 360 px.
  - **Module off**: `Modules__Masters__Enabled=false` gives no profile route, no endpoints, no job, and the rest works.
- [X] T072 Record in `plan.md` («Implementation notes»: decisions taken while building, verification date) any analyzer or knip exception that was needed. At the top of `specs_requests/005-masters-profile-booking.md`, add `> **Built** as specs/005-masters-profile-booking (<date>). Changed from this request: reviews show «Мария К.»; deleted masters are hidden from everyone; no role switch after booking; reviews paginated without the average; no client photos; no client confirm/cancel calls or «Открыть кабинет» yet; the constitution VI amendment moves to 006.`

---

## Dependencies

- Setup (T001–T002) → Foundational (T003–T018) → US1 (T019–T040) → US2 (T041–T053) → US3 (T054–T058) → US4 (T059–T062) → US5 (T063) → Polish (T064–T072).
- US2 needs the US1 page (the sheet opens from it) and the slots endpoint. US3 and US4 need the `BookingRepository` from US2. US5 needs the US1 sections.
- US3 and US4 are independent of each other once US2 is done, and US5 can be done any time after US1.
- Inside phases, tasks marked [P] touch different files: T003/T004/T006/T008–T012/T014/T017/T018 in Foundational; T019/T021–T023 and T033–T040 in US1; T041/T042/T048 in US2.
