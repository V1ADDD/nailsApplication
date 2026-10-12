# Contract draft: Master profile and bookings

This is a draft. The authoritative contract is `api/Nails.Api/openapi.json` after implementation. All endpoints are under `Modules:Masters:Enabled` and return problem details `{ code, title, errors? }` with Russian titles.

## Shapes

- `Price` = `{ kind: 'exact'|'from'|'free', amount }` (existing `PriceResponse`).
- `MasterProfile`:
  - who: `{ id, name, photoUrl, specialty, categoryIds, experienceYears, verified, online, about }`;
  - where: `{ city, district, address, lat, lng, distanceKm }`;
  - numbers: `{ rating, reviewsCount, headlinePrice: Price|null, bookingsCount }`;
  - courses: `[{ title, school, year }]`;
  - contacts: `{ phone, email, telegram, viber, instagram }` (absent values are null);
  - services: `[{ id, subcategoryId, categoryId, name, price: Price, durationMin }]` in the master's order;
  - portfolio: `[{ id, url, hue, caption }]`;
  - viewer: `{ isFavorite, isOwn }`.
- `SlotEntry` = `{ start, durationMin, status: 'free'|'pending'|'busy', slotId }` (`slotId` only when free).
- `Review` = `{ id, subcategoryId, serviceName, rating, text, date, authorName }`. `authorName` is «Мария К.», «Мария» or «Клиент».
- `BookingSummary` = `{ id, masterName, serviceName, start, durationMin, address }`.
- `Booking`:
  - ids: `{ id, masterId, clientUserId, slotId }`;
  - what and when: `{ subcategoryId, serviceName, price: Price, start, durationMin, address }`;
  - state: `{ status: 'pending'|'confirmed'|'cancelled'|'completed'|'noShow', source: 'site'|'external', createdBy: 'client'|'master', confirmedAt, releaseAt }` (`releaseAt` only while pending);
  - cancellation: `{ cancelledAt, cancelledBy, cancelReason, cancelMutual, cancelExpired }`;
  - names: `{ masterName, masterPhotoUrl, clientName }`.

## Endpoints

| Method and path | Access | Request | Response | Errors |
|---|---|---|---|---|
| `GET /api/masters/{id}?lat&lng` | anonymous; `isFavorite`/`isOwn` when signed in | `lat` −90…90, `lng` −180…180, default the Minsk centre | `MasterProfile` | 404 `master-not-found` «Мастер не найден» (missing or deleted) |
| `GET /api/masters/{id}/slots` | anonymous | — | `{ days, items: [SlotEntry] }`, from now through the end of Minsk day `days − 1`, sorted by start | 404 `master-not-found` |
| `GET /api/masters/{id}/reviews?page&pageSize` | anonymous | `page` ≥ 1, `pageSize` 1…`MaxPageSize` | `PagedResponse<Review>`, client reviews, newest first | 404 `master-not-found` |
| `POST /api/masters/bookings/conflicts` | signed in | `{ slotId }` | `{ overlapping: [BookingSummary], tooClose: [BookingSummary] }`: the caller's own pending and confirmed client bookings | 404 `slot-not-found` «Окно не найдено» for an unknown slot |
| `POST /api/masters/bookings` | signed in | `{ masterId, slotId, subcategoryId }` | 201 `{ booking: Booking, autoCancelled: [BookingSummary], tooClose: [BookingSummary] }` | see below |
| `POST /api/masters/bookings/{id}/confirm` | signed in, a side of the booking | — | `Booking` | see below |
| `POST /api/masters/bookings/{id}/cancel` | signed in, a side of the booking | `{ reason, mutual }` | `Booking` | see below |

### Errors of the booking actions

**Create**:
- 404 `master-not-found` (missing or deleted master);
- 409 `self-booking` «Нельзя записаться к самой себе»;
- 409 `service-not-offered` «Мастер не оказывает эту услугу»;
- 409 `slot-taken` «Это окно уже занято, выберите другое время»: the slot is not free, belongs to another master, or another booking won the race.

**Confirm**:
- 404 `booking-not-found` «Запись не найдена»;
- 403 `not-booking-party` «Это не ваша запись»;
- 409 `same-side-confirm` «Запись подтверждает другая сторона»;
- 409 `not-pending` «Запись уже не ожидает подтверждения».

**Cancel**:
- 400 field `reason` «Укажите причину отмены» (empty after trimming) or «Не больше 300 символов»;
- 404 `booking-not-found`;
- 403 `not-booking-party`;
- 409 `cannot-cancel` «Эту запись уже нельзя отменить».

The caller acts as the client when they are the booking's client, and as the master when they own its master profile. Self-booking is impossible, so a caller is never both.

## Identity contract (in-process, no endpoint)

- `IAccountDirectory.NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken)` → `IReadOnlyDictionary<Guid, string>` (display names).
