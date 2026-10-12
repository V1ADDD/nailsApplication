# Implementation Plan: Master profile and booking

**Branch**: `005-masters-profile-booking` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-masters-profile-booking/spec.md`; approach from `specs_requests/005-masters-profile-booking.md` and the constitution.

## Summary

Spec 004 seeded masters, slots, bookings and reviews; this spec gives them behaviour.

- **API**: the public profile, free times and reviews of a master, and booking with a conflict check. A booking is created atomically: optimistic concurrency on the slot, and the client's overlapping bookings are auto-cancelled in the same transaction.
- **Confirm and cancel** for both sides of a booking.
- **A background job** auto-confirms, releases and completes bookings.
- **Booking events** that chats (006) will subscribe to.
- **Client**: the `/masters/:id` page and the booking sheet.

Details in [research.md](research.md).

## Technical Context

**Modules touched**: masters, identity (a new contract), core (error codes, date and duration helpers), help

**Platforms**: web; formatters, the API client and the release-deadline preview in `libs/shared`

**Module interaction**: Masters uses `Identity.Contracts.ICurrentUser`, `IPresence` and the new `IAccountDirectory`, and `Catalog.Contracts.ICatalog`. Masters declares `Events/` (`BookingChanged`, `IBookingChangedHandler`) for chats (006); nothing subscribes yet.

**Stack**: .NET 10 (ASP.NET Core controllers, EF Core 10 on PostgreSQL), Angular 22 (Nx, signals, Angular Material). No new packages.

**Storage**: no new tables or columns; the migration `ReviewsByMasterDate` replaces the reviews index. See [data-model.md](data-model.md).

**Contracts**: see [contracts/profile-and-bookings.md](contracts/profile-and-bookings.md). It covers the profile, slots, reviews, conflicts, create, confirm and cancel, plus `IAccountDirectory`.

**Settings** (Development, Docker, Production; same values):
- `Modules:Masters:Booking:SlotDays` 14;
- `Modules:Masters:Reviews:DefaultPageSize` 20 and `MaxPageSize` 50;
- `Modules:Masters:TimeRules:Interval` `00:01:00`.

**Constraints**:
- profile p95 < 300 ms with 26 masters and 365 days of reviews;
- exactly one winner when the same slot is booked at once;
- a booking may show its old state for at most one interval after a deadline;
- every screen works from 360 px.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched:
- I: Minsk days through `MinskTime` and the new `date.ts` helper; prices through `formatPrice`; plurals.
- II: the slot, conflict, deadline, transition and reviewer-name rules are pure. The client only previews the release deadline.
- III: contract regenerated; problem codes.
- IV: everything in Masters folders, except the core helpers and the Identity contract.
- V: `Events/` folder; the job in `Services/`.
- VI: events introduced by this spec; the amendment comes with 006.
- VII: a public route declared by Masters; every state of every screen.
- VIII: the endpoint access levels; the booking-party check in Application.
- IX: client names only to the sides of a booking; reviews show a shortened name; no free text (reasons) in logs.
- X: help.

| Gate | Status |
|---|---|
| II. Rules pure, server enforces | Pass: `Slots`, `Bookings`, `BookingTransitions` and `ReviewerName` in `Masters/Rules/`; the clock comes in as an argument |
| III. Contract regenerated | Pass: `openapi.json` and `schema.ts` in the same change |
| IV. Module only in its folders | Pass: core gains generic pieces only (`ErrorCodes`, exception codes, `date.ts`, `duration.ts`) |
| V. Allowed folders | Pass: `Events/` is listed in V |
| VI. Cross-module only via Identity/Catalog contracts | Pass. This spec introduces the booking events (VI requires a spec for that), and they live in Masters' own `Events/` folder. No other module uses them in 005. Spec 006, which first makes Chats subscribe, amends VI (4.3.0 → 4.4.0) to allow a module's `Events` namespace across modules. |
| VIII. Permissions in Application | Pass: `BookingService` checks the side of the booking; profile, slots and reviews are anonymous |
| IX. Privacy | Pass: reviews send only «Мария К.»; `clientName` only to the sides; the cancel reason is never logged |
| No hardcoded values | Pass: days, page sizes and the interval are settings. The 2 h and 24 h deadlines and the 60-minute gap are business constants in the rules. |
| No dead code, abstractions with two uses | Exception: `IBookingEvents` has six publishers and no subscriber until 006 (Complexity Tracking) |
| Additive migration | Pass: an index replacement only |

Post-design re-check: Pass, with the one tracked exception.

## Project Structure

### Documentation (this feature)

```text
specs/005-masters-profile-booking/
├── plan.md, research.md, data-model.md
├── contracts/profile-and-bookings.md
├── checklists/requirements.md
├── design/{phone,tablet,desktop}/*.png
└── tasks.md                                   /speckit-tasks
```

### Source Code

```text
api/
├── Nails.Api/
│   ├── Modules/Masters/Controllers/
│   │   ├── MastersController.cs               + GET {id}, {id}/slots, {id}/reviews
│   │   └── BookingsController.cs              new: bookings/conflicts, bookings, bookings/{id}/confirm, bookings/{id}/cancel
│   ├── Modules/Help/Content/ru/{articles/masters.json, images/master-profile/*.png, images/book-a-master/*.png}
│   ├── openapi.json
│   └── appsettings.{Development,Docker,Production}.json   Booking, Reviews, TimeRules
├── Nails.Application/
│   ├── Common/Exceptions/{ErrorCodes, ConflictException, NotFoundException}.cs   codes
│   ├── Modules/Identity/{Contracts/IAccountDirectory.cs, Services/AccountDirectory.cs, IdentityModule.cs}
│   └── Modules/Masters/
│       ├── MastersModule.cs                    registrations, AddHostedService
│       ├── Contracts/{IMasterProfileService, IBookingService, IBookingTimeRules, IBookingEvents}.cs
│       ├── Events/{BookingChanged, BookingChangeKind, IBookingChangedHandler}.cs
│       ├── Services/{MasterProfileService, BookingService, BookingTimeRules, BookingTimeRulesJob, BookingEvents, MasterFacts, MastersErrors}.cs
│       ├── Requests/{ReviewsRequest, ConflictsRequest, CreateBookingRequest, CancelBookingRequest}.cs
│       ├── Responses/{MasterProfileResponse, ProfileServiceResponse, CourseResponse, ContactsResponse, PortfolioPhotoResponse,
│       │              SlotsResponse, SlotEntryResponse, SlotEntryStatus, ReviewResponse, BookingSummaryResponse,
│       │              BookingResponse, CreateBookingResponse, ConflictsResponse}.cs
│       ├── Options/{BookingOptions, ReviewOptions, BookingTimeRulesOptions}.cs
│       └── Rules/{Slots, Bookings, BookingConflicts, BookingTransitions, BookingState, ReviewerName}.cs (+ small value types, one per file)
└── Nails.Infrastructure/
    ├── Modules/Identity/{Contracts/IAccountDirectoryRepository.cs, Repositories/AccountDirectoryRepository.cs}
    ├── Modules/Masters/
    │   ├── Configurations/ReviewConfiguration.cs           index
    │   ├── Contracts/{IMasterProfileRepository, IBookingRepository}.cs
    │   ├── Repositories/{MasterProfileRepository, BookingRepository}.cs
    │   └── Models/{MasterProfileRow, ...}.cs
    └── Persistence/Migrations/*_ReviewsByMasterDate.cs
client/libs/
├── shared/common/util/src/lib/{date.ts, duration.ts}       + index exports
├── shared/core/data-access/src/lib/api/schema.ts           regenerated
├── shared/masters/data-access/src/lib/{masters-api.ts, booking-preview.ts}
└── web/masters/feature/src/lib/
    ├── manifest.ts                                          public route masters/:id
    ├── profile/{profile-page, profile-hero, free-windows, services-section, portfolio-section, photo-viewer,
    │            about-section, reviews-section, contacts-section, action-bar}.ts
    ├── booking/{booking-sheet, booking-check}.ts
    └── texts.ts                                             the Russian texts of the page and the sheet
README.md                                                    Masters endpoints, settings, the job
```

**Module switch**: on → the profile route, the endpoints, the job and the help articles. Off → no route (the map card links aren't shown either, because the map is off), no endpoints, no job; the tables stay.

**Help** (`articles/masters.json`):
- a new article `master-profile` («Профиль мастера»): the sections, the portfolio viewer, reviews and how authors are shown, contacts, «Это ваш профиль», «Мастер не найден»;
- a new article `book-a-master` («Запись к мастеру»): the sheet; «занято» and «ожидает подтверждения»; the conflict warnings; the summary; waiting for confirmation; the release deadline (2 h and 24 h); auto-confirm; cancelling with a reason; every error quoted;
- pictures `images/master-profile/profile.png` and `images/book-a-master/{sheet,check}.png`;
- `find-on-map` gains a `related` link to `master-profile`.

**Structure Decision**: one Masters module, with booking under `/api/masters/bookings` (a new `BookingsController`). The time-rules logic (`BookingTimeRules`) is a scoped service, separate from the hosted loop (`BookingTimeRulesJob`), so the loop only creates scopes. Rating, headline and online logic is shared by search, card and profile through `MasterFacts`.

## Changes to earlier specs

- 004: «Записаться» and the card links lead to the new profile. `MasterSearchService` uses `MasterFacts` and `MastersErrors`. The reviews index changes.
- 003: Identity gains `IAccountDirectory`.
- Request 006 (not built): its Chats handler of `BookingChanged` is the first use of events across modules, so 006 amends constitution VI (4.3.0 → 4.4.0). 006 also adds the client `confirm`/`cancel` calls if its screens are the first to use them.
- Request 011 (not built): deleting a master profile warns and cancels the upcoming bookings with the reason «Мастер прекратил работу», and the profile is then hidden from everyone (spec, clarification 4).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `IBookingEvents` and `IBookingChangedHandler` with no handler until 006 (no-dead-code, two-uses rule) | Clarification 1 and FR-017 require booking changes to be announced from this spec on. The six publishing points (create, auto-cancel, confirm, cancel, expire, complete) are written once, here, with the transitions. | Adding the events in 006 would reopen every transition and the job of this spec. A direct call into Chats breaks VI. |
## Implementation notes

Decisions taken while building, in addition to [research.md](research.md):

- **Rules return error codes.** `BookingTransitions` returns the `ErrorCodes` value that forbids a change, or `null`. `BookingChanges` (in `Services/`) applies a confirm or cancel to the booking and its slot; booking, confirm, cancel and the time-rules job share it. A lost race in `BookingRepository.SaveAsync` detaches the failed changes, so the job goes on with the next booking.
- **Phone order follows the old app.** Below 1024 px the sections are hero, free windows, contacts, services, portfolio, about and courses, reviews (`design/phone/master.png`), not "contacts last" as the request listed. From 1024 px the hero, free windows and contacts are the sticky sidebar.
- **States.** A 404 shows «Мастер не найден»; any other failure shows «Не удалось загрузить профиль» with «Повторить» (constitution VII). Before the profile loads, the tab title is «Профиль мастера». Reviews beyond the first page load with «Показать ещё» after «Показать все N».
- **Texts.** Russian texts stay in the templates, like the existing masters components; `texts.ts` holds the shared word forms, «Другое» and `experienceLabel` (now used by the card and the hero).
- **Shared client pieces.** `FavoriteToggle` and `goToSignIn` replace the copies in the card; `Rating` gains `countLabel` and `starsOnly` and no longer breaks the count mid-word; `Toasts` shows queued toasts one after another (the booking toast and each auto-cancel toast); the icon set gains `arrow-left`, `calendar`, `send`, `phone`, `instagram`, `scissors`, `image`, `graduation-cap`, `briefcase`, `clock`; `shared/common/util` gains `date.ts` (Minsk dates) and `duration.ts`.
- **Verification (2026-10-12).** API against the Development seed: profile, slots (clients see `busy`, never `booked`), reviews with «Елена Ш.»-style names, `master-not-found`; two clients booking one slot at once → one 201 and one 409 «Это окно уже занято, выберите другое время»; overlapping bookings auto-cancelled and listed; `self-booking`, `service-not-offered`, `same-side-confirm`, `not-booking-party` (403), `not-pending`, the blank reason «Укажите причину отмены», `cannot-cancel`; a cancelled booking frees its slot. Browser (headless Edge, 1440, 820, 390 and 360 px): every section, the not-found state, the own profile, `?book=1&service=` focus mode, choosing a time with the check and the deadline, booking through the sheet with the toast, no horizontal scroll at 360 px. With `Modules__Masters__Enabled=false` the module, its endpoints and its help articles disappear. The time-rules job ran every 10 s (`Modules__Masters__TimeRules__Interval=00:00:10`) without errors; its auto-confirm, release and complete effects were not observed end to end, because every demo schedule has auto-confirm off and no seeded booking reaches a deadline during a short run.
