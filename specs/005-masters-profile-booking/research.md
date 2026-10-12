# Research: Master profile and booking

The approach follows `specs_requests/005-masters-profile-booking.md`. Where that request and the code built by specs 001–004 disagree, the code wins and the change is recorded here.

## R1. Error codes on conflicts and not-found

- **Decision**: `ConflictException` and `NotFoundException` gain a `code` parameter, as `InvalidRequestException` and `ForbiddenException` already have. New stable codes go into `ErrorCodes`:
  - `master-not-found`
  - `booking-not-found`
  - `slot-not-found`
  - `slot-taken`
  - `self-booking`
  - `service-not-offered`
  - `not-pending`
  - `same-side-confirm`
  - `cannot-cancel`
  - `not-booking-party`

  A static `MastersErrors` (like `IdentityErrors`) holds the Russian titles and replaces the two existing `"Мастер не найден"` literals in `FavoriteService` and `MasterSearchService`.
- **Rationale**: the constitution requires a stable `code` per problem, but today every conflict is `conflict` and every not-found is `not-found`.
- **Alternatives**: one exception subclass per error (too many types for a single string difference).

## R2. Concurrency on the slot

- **Decision**: `Slot.Version` is already a concurrency token (`IVersioned`). Booking loads the slot tracked, checks that it is `Free`, changes it, and saves inside `IUnitOfWork.InTransactionAsync`. A `DbUpdateConcurrencyException` is translated to `slot-taken` (409). The repository (`IBookingRepository`) owns the catch and returns a result, so Application doesn't depend on EF exception types beyond the repository boundary.
- **Capacity above 1**: one slot row per place. `Slots.OnePerStart` shows one entry per start, free if any place is free, and gives the `slotId` of one free place. After that place is taken, the next read shows the next free place.
- **Alternatives**: `SELECT … FOR UPDATE` (pessimistic; it needs raw SQL and is unnecessary with the token already in place).

## R3. Booking events (FR-017, clarification 1)

- **Decision**: `Nails.Application/Modules/Masters/Events/` declares:
  - `BookingChanged(BookingId, MasterId, ClientUserId, Kind, By)`;
  - `BookingChangeKind` (`Created`, `AutoCancelled`, `Confirmed`, `AutoConfirmed`, `Cancelled`, `Expired`, `Completed`);
  - `IBookingChangedHandler`.

  `BookingEvents` (behind `IBookingEvents` in `Contracts/`) calls every registered handler after the transaction commits. A handler failure is logged with `[LoggerMessage]` and never undoes the booking. In 005 no handler is registered; 006 adds the Chats handler.
- **Constitution**: VI requires a spec to introduce any way for modules to interact; this spec introduces it. Today VI lets other modules use only the Identity and Catalog contracts, but nothing outside Masters uses the events in 005. Spec 006, where Chats first subscribes, amends VI (4.3.0 → 4.4.0, a separate change) to also allow `Nails.Application.Modules.<Module>.Events` of a module whose spec introduced events. The Events folder is already allowed by V.
- **Alternatives**: chats polling (rejected in clarification); a mediator library (forbidden).

## R4. Time rules job

- **Decision**: `BookingTimeRulesJob : BackgroundService` lives in `Masters/Services/` and is registered by `MastersModule` with `AddHostedService`, so a disabled module doesn't run it. It uses `PeriodicTimer(interval, TimeProvider)`. Each tick creates a scope and runs `IBookingTimeRules.RunAsync(now)`, which works in three steps:
  1. **Auto-confirm**: pending, `CreatedBy = Client`, the master's schedule has `AutoConfirmEnabled`, and `CreatedAt + AutoConfirmAfterMinutes ≤ now`.
  2. **Release**: pending with `StartAt ≤ now + 24 h` (no deadline is earlier than 24 h before the start), filtered in memory by `Bookings.PendingReleaseAt(start, createdAt) ≤ now`.
  3. **Complete**: confirmed with `StartAt < now`, filtered by `start + duration < now`.

  Each booking is saved in its own transaction. A concurrency conflict (the user acted at the same moment) skips that booking until the next tick. Events are published after each save. An exception in a tick is logged and the loop continues.
- **Settings**: `Modules:Masters:TimeRules:Interval` (`00:01:00` in every environment) in `BookingTimeRulesOptions`.
- **Several API instances**: the version token makes a double transition impossible, and a lost race is skipped.

## R5. Business rules (pure, `Masters/Rules/`)

- `Slots.OnePerStart`, `Slots.StatusFor` (a client sees `Booked` and `Busy` as `busy`).
- `Bookings.PendingReleaseAt`, `Bookings.Overlaps` (half-open), `Bookings.Conflicts` (`MinGapBetweenBookingsMin = 60`).
- `BookingTransitions`: the state machine of FR-015 as pure functions on a small value. Each returns the new booking state and slot state or the error code, and the service applies the result to the entities. Entities in Infrastructure stay plain, because the rules belong in Application (II).
- `ReviewerName.From(displayName)`: «Мария К.» from «Мария Ковалёва», «Мария» from one word, «Клиент» from empty.
- `Durations` is not needed: the server sends minutes, and the client formats them.
- The deadlines (2 h, 24 h) and the 60-minute gap are business constants that never differ between environments, so they are constants in the rules, not settings.

## R6. Reading a profile

- **Decision**: a new `IMasterProfileRepository.FindAsync(masterId)` (no-tracking, split query) returns the master with services in `SortOrder`, courses, portfolio, the review average and count, and the completed bookings count. Masters without services are allowed, so the page can show «Мастер пока не добавил услуги»; `FindCandidatesAsync` excludes such masters, so it isn't reused. Deleted masters return null, and the service throws `master-not-found` (clarification 4).
- **Shared rating, headline and online logic**: the rating rounding, `Prices.Headline` with add-ons and the online check move from `MasterSearchService` into one helper (`MasterFacts`, in `Services/`) used by search, the card and the profile.
- **Reviews**: `GET /api/masters/{id}/reviews` returns `PagedResponse<ReviewResponse>` (client-authored, newest first). The average and the total are already on the profile (`rating`, `reviewsCount`), so the reviews page doesn't repeat them. Page size comes from `Modules:Masters:Reviews` (`DefaultPageSize` 20, `MaxPageSize` 50).
- **Index**: reviews get `(master_id, author_role, created_at)` in place of `(master_id, author_role)`.

## R7. Names of clients (Identity lookup)

- **Decision**: a new Identity contract `IAccountDirectory.NamesAsync(userIds) → IReadOnlyDictionary<Guid, string>` returns `DisplayName`, through `IAccountDirectoryRepository` in Identity Infrastructure (no-tracking, by primary key).
- **Photos**: accounts have no photo yet (`ApplicationUser` has none), so `clientPhotoUrl` is not added to the contract. Bookings and reviews show initials until an account photo exists (spec 007 decides). This is the "initials when there is none" case of FR-006.
- **Privacy**: reviews send only `ReviewerName.From(name)`, never the id or the full name. `BookingResponse` carries the client's full name only to the two sides of the booking.

## R8. Slots read

- **Decision**: `GET /api/masters/{id}/slots` → `SlotsResponse(days, items)`. `days` comes from `Modules:Masters:Booking:SlotDays` (14), so the client builds the day chips without a constant of its own. The window runs from now through the end of Minsk day `days - 1` (`MinskTime`). `slotId` is set only on free entries.

## R9. Things in the request that don't exist yet

- **"The role switches to client" after booking**: there is no session role in the code (no client/master mode). The step is dropped from 005, and the mode comes with 006 or 007 when chats and the account need it. The spec's FR-011 is updated.
- **Seed**: `MastersDemoScenario` already places Анна's master bookings at `now + 1 h`, `+ 2.5 h` and `+ 4 h` (rounded to 30 minutes), so they are always upcoming. Late in the evening they fall on the next day, which is unavoidable. No seed change is needed, and the spec's assumption is updated.
- **`IAccountLinks`** (named in spec 004) doesn't exist; it isn't needed here.

## R10. Client

- **Data access** (`libs/shared/masters/data-access`):
  - `MastersApi` gains `profile`, `slots`, `reviews`, `conflicts` and `book`, typed by `Schemas`. `confirm` and `cancel` are added by the first screen that calls them (006, 007 or 009), so 005 adds no client code without a caller;
  - `booking-preview.ts` holds `pendingReleaseAt`, a preview of the server rule (II allows previews);
  - the profile page reads through `httpResource`.
- **Shared util** (`libs/shared/common/util`): a new `date.ts` with `appTimeZone = 'Europe/Minsk'`. It provides `formatDayChip` («Сегодня», «Завтра», «пн»), `formatShortDate` («12 окт»), `formatLongDate` («12 октября 2026»), `formatTime` («14:30») and `formatDateTime` («12 окт · 14:30»), all through `Intl.DateTimeFormat(appLocale, { timeZone })`. `duration.ts` provides `formatDuration` («45 мин», «1 ч», «1 ч 30 мин»). They live in the core because 006–011 reuse them.
- **Feature** (`libs/web/masters/feature`):
  - `profile/`: the page and its sections (hero, free windows, services, portfolio with the lightbox, about and courses, reviews, contacts, action bar);
  - `booking/booking-sheet.ts`, opened with the shared `Sheets`;
  - the manifest adds the public route `masters/:id`.
- **Reuse**: `Avatar` (initials, online dot), `Rating`, `EmptyState`, `ErrorState`, `Skeleton`, `Toasts`, `formatPrice`, `formatDistance`, `plural`.
- **Sign-in round trip**: `returnTo=/masters/:id?book=1[&service=]`, the same as the card's `book()`.
