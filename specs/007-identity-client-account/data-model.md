# Data model: Profile shell and client account

One additive migration, `AddClientAccount`. Every column has a default, so existing rows stay valid. Times are UTC `timestamptz`. Enums are stored as strings.

## Identity (`identity`)

### `users` (existing `ApplicationUser`)

| Column | Type | Rule |
|---|---|---|
| `photo_url` | `varchar(500)` null | the URL of a photo the user uploaded (`/api/media/{id}`), checked through `IMediaOwnership` |
| `telegram` | `varchar(33)` null | `@` plus 5–32 characters `[A-Za-z0-9_]` (`TelegramName`) |
| `viber` | `varchar(13)` null | `+375XXXXXXXXX` (`BelarusPhone`) |
| `preferred_contact` | `varchar(10)` not null, default `Messages` | `PreferredContact` enum: `Messages`, `Phone` |
| `notify_push` | `boolean` not null, default true | |
| `notify_email` | `boolean` not null, default true | |
| `notify_site` | `boolean` not null, default true | |
| `notify_reminders` | `boolean` not null, default true | |

Existing columns used:
- `email` and `normalized_email` (Identity): optional. The `EmailIndex` becomes **unique, filtered on `normalized_email IS NOT NULL`** (research R2).
- `user_name`, `normalized_user_name` and `phone_number` are changed together by the phone change (unique `UserNameIndex`).
- `security_stamp` is changed by «Выйти на других устройствах».
- `master_id` is set through `IAccountLinks`.

### `phone_change_codes` (new `PhoneChangeCode`, `IAuditable`)

| Column | Type | Rule |
|---|---|---|
| `id` | `uuid` PK | `Guid.CreateVersion7()` |
| `user_id` | `uuid` not null, **unique** | one pending change per account |
| `phone` | `varchar(13)` not null | the new normalized phone |
| `code_hash` | `text` not null | `PasswordHasher` hash, as `phone_codes` |
| `sent_at`, `expires_at` | `timestamptz` not null | `PhoneCodeOptions.Lifetime`, `ResendInterval` |
| `attempts` | `int` not null | `< MaxAttempts` (`PhoneCodeState.IsUsable`) |
| `created_at`, `updated_at` | `timestamptz` | auditing |

Lifecycle:
1. The code request inserts the row, or replaces it after the resend interval.
2. A right code changes the phone and deletes the row.
3. A wrong code increments `attempts`.
4. An expired row is replaced by the next request.

## Masters (`masters`)

### `masters` (existing `Master`)

| Column | Type | Rule |
|---|---|---|
| `location_set` | `boolean` not null, default **true** | false for a master created by «Стать мастером». Spec 008's map point sets it true. Listed = `deleted_at is null && location_set && exists(service)` (`MasterVisibility`) |

### `schedules` (existing)

A new master gets one row with the defaults from `Modules:Masters:NewMaster`.

### `reviews` (existing `Review`)

New index `(client_user_id, author_role, created_at)` for «Мои отзывы» and «Отзывы обо мне».

Written by `POST bookings/{id}/reviews`:

| Field | Value |
|---|---|
| `booking_id` | the booking |
| `master_id`, `client_user_id`, `subcategory_id` | taken from the booking |
| `author_role` | the caller's side |
| `rating` | 1–5 |
| `text` | trimmed, ≤ 1000, may be empty |

The existing unique `(booking_id, author_role)` index makes it once per side.

### `booking_moves` (new `BookingMove`, `IAuditable`, `IVersioned`)

| Column | Type | Rule |
|---|---|---|
| `id` | `uuid` PK | |
| `booking_id` | `uuid` not null | the moved booking (same schema; no FK to keep with the module's style) |
| `slot_id` | `uuid` not null | the held slot of the new time |
| `start_at` | `timestamptz` not null | the new start |
| `duration_min` | `int` not null | `max(service, slot)` |
| `status` | `varchar(20)` not null | `BookingMoveStatus`: `Open`, `Accepted`, `Declined`, `Withdrawn`, `Cancelled`, `Lapsed` |
| `lapses_at` | `timestamptz` not null | `BookingMoves.LapsesAt(newStart, bookingStart, now)` |
| `resolved_at` | `timestamptz` null | set when the move leaves `Open` |
| `version` | `bigint` concurrency token | |
| `created_at`, `updated_at` | `timestamptz` | |

Indexes:
- unique `(booking_id) WHERE status = 'Open'`;
- `(status, lapses_at)`.

### Booking, slot and move states

```text
Move:    Open ──accept (master)──▶ Accepted
           ├──decline (master)──▶ Declined
           ├──withdraw (client), or a new overlapping booking of the client──▶ Withdrawn
           ├──booking cancelled (either side, expire, auto-cancel)──▶ Cancelled
           └──sweep, lapses_at <= now──▶ Lapsed

Request: booking Pending|Confirmed and start > now (BookingTransitions.Move),
         new slot Free → Pending (slot.booking_id = booking.id)
Accept:  booking.start_at/duration_min/slot_id = move's; status = Confirmed; confirmed_at = now
         old slot → Free (booking_id null); new slot → Booked
Other ends: new slot → Free (booking_id null); booking unchanged
```

## Settings

| Key | Development | Docker | Production |
|---|---|---|---|
| `Modules:Identity:Session:StampValidationInterval` | `00:00:00` | `00:00:00` | `00:00:00` |
| `Modules:Masters:Reviews:WindowDays` | 30 | 30 | 30 |
| `Modules:Masters:MyBookings:{DefaultPageSize,MaxPageSize}` | 20, 50 | 20, 50 | 20, 50 |
| `Modules:Masters:Favorites:{DefaultPageSize,MaxPageSize}` | 20, 50 | 20, 50 | 20, 50 |
| `Modules:Masters:Cities:Items` | six cities with `Name`, `Latitude`, `Longitude` (research R15) | same | same |
| `Modules:Masters:NewMaster` | `WorkDays` [1,2,3,4,5], `TimeFrom` `10:00`, `TimeTo` `19:00`, `SlotMinutes` 90, `Capacity` 1, `AutoConfirmEnabled` false, `AutoConfirmAfterMinutes` 30 | same | same |

## Pure rules (new)

| Rule | Location | Purpose |
|---|---|---|
| `TelegramName.Normalize(string?) → string?` | `Identity/Rules` | `@name` or null when invalid |
| `ReviewWindow.CanWrite(status, end, now, windowDays, hasReview)` and `ReviewWindow.Check(...) → error code?` | `Masters/Rules` | `not-completed`, `review-window-closed`, `review-exists` |
| `BookingTransitions.Move(state, now) → error code?` | `Masters/Rules` | `cannot-move` |
| `BookingMoves.LapsesAt(newStart, bookingStart, now)` | `Masters/Rules` | min(`PendingReleaseAt(newStart, now)`, `bookingStart`) |
| `MyBookingScope.IsUpcoming(status, start, now)` | `Masters/Rules` | upcoming/past partition, also used by the repository filter |
| `RussianDate.DayMonthTime(instant)` | `Common/Time` | «17 окт, 14:00» for system messages |
