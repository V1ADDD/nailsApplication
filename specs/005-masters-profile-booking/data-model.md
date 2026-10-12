# Data model: Master profile and booking

All tables exist since spec 004 (schema `masters`). This spec adds no table and no column. The migration `ReviewsByMasterDate` only replaces one index.

## Changes

| Table | Change |
|---|---|
| `masters.reviews` | index `(master_id, author_role)` → `(master_id, author_role, created_at)` for the newest-first reviews page |

The other reads already have indexes: slots `(master_id, start_at)`, bookings `(client_user_id, start_at)`, `(master_id, start_at)` and `(status, start_at)`. The time-rules job reads pending bookings by `(status, start_at)` and confirmed ones by the same index.

## Entities used

- **Master**: `Id`, `UserId`, the profile fields, contacts and `DeletedAt` (a deleted master is not found by any endpoint here). `Version` is a concurrency token.
- **MasterService**: `SubcategoryId`, `PriceKind` + `PriceAmount`, `DurationMin`, `SortOrder`.
- **Course**: `Title`, `School`, `Year`, `SortOrder`. **PortfolioPhoto**: `Url?`, `Hue`, `Caption?`, `SortOrder`.
- **Schedule**: `Capacity`, `AutoConfirmEnabled`, `AutoConfirmAfterMinutes`, which the job reads.
- **Slot**: `MasterId`, `StartAt`, `DurationMin`, `Status` (`Free | Pending | Booked | Busy`), `BookingId?`, `Version` (concurrency token).
- **Booking**:
  - who and what: `MasterId`, `ClientUserId?`, `ExternalClientName?`, `SubcategoryId`, `PriceKind`, `PriceAmount?`;
  - when and where: `StartAt`, `DurationMin`, `Address`;
  - state: `Status` (`Pending | Confirmed | Cancelled | Completed | NoShow`), `Source` (`Site | External`), `CreatedBy` (`Client | Master`), `ConfirmedAt?`;
  - cancellation: `CancelledAt?`, `CancelledBy?`, `CancelReason?` (≤ 300), `CancelMutual`, `CancelExpired`;
  - also `Note?`, `SlotId?`, `Version`, `CreatedAt`.
- **Review**: `MasterId`, `ClientUserId`, `AuthorRole`, `SubcategoryId`, `Rating`, `Text`, `CreatedAt`. Only `AuthorRole = Client` is public.

## State machine (rules `BookingTransitions`)

| From | Action | To | Slot | Condition, else error |
|---|---|---|---|---|
| — | create (client, site) | Pending | Free → Pending | slot free (`slot-taken`), not own (`self-booking`), service offered (`service-not-offered`) |
| — | create (master, outside client; spec 009) | Confirmed | → Busy | |
| Pending | confirm | Confirmed, `ConfirmedAt` | → Booked | caller is not `CreatedBy` (`same-side-confirm`); status (`not-pending`) |
| Pending | auto-confirm (job) | Confirmed | → Booked | `CreatedBy = Client`, master's auto-confirm on and its delay passed |
| Pending | release (job) | Cancelled, `CancelExpired`, `CancelMutual`, `CancelledBy` = the side that had to confirm | → Free, `BookingId` cleared | `PendingReleaseAt ≤ now` |
| Pending, Confirmed | cancel | Cancelled, `CancelledBy`, reason, `CancelMutual` | → Free, `BookingId` cleared | status (`cannot-cancel`) |
| Pending, Confirmed | auto-cancel (a new overlapping booking by the same client) | Cancelled by Client, mutual, «Автоматически: новая запись на это же время» | → Free | |
| Confirmed | complete (job) | Completed | unchanged | `StartAt + DurationMin < now` |
| Confirmed, Completed | mark no-show (spec 009) | NoShow | unchanged | only after the start |

## Rules

- `Bookings.PendingReleaseAt(start, createdAt)`: lead ≤ 2 h → `start`; lead > 24 h → `start − 24 h`; otherwise `start − 2 h`.
- `Bookings.Overlaps(a, b)`: half-open intervals `[start, start + duration)`.
- `Bookings.Conflicts(candidate, bookings)`: only Pending and Confirmed bookings count. `overlapping` are those that overlap the candidate. `tooClose` are those that overlap the candidate widened by 60 min on both sides but don't overlap the candidate itself.
- `Slots.OnePerStart`: one entry per `StartAt`, a free one preferred. `Slots.StatusFor`: `Booked` and `Busy` → `busy` for clients.
- `ReviewerName.From`: first word + the first letter of the second word with a dot; one word stays as it is; empty → «Клиент».
- A new booking's duration is `max(service.DurationMin, slot.DurationMin)`. Its price is the service's current `PriceKind` and `PriceAmount`, and its address is the master's address.

## Events

`BookingChanged(BookingId, MasterId, ClientUserId?, Kind, By?)` with `Kind ∈ Created, AutoCancelled, Confirmed, AutoConfirmed, Cancelled, Expired, Completed`, published after commit.
