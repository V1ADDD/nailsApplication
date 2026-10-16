# Contracts: Profile shell and client account (draft)

These drafts are proposals. The authoritative contract is `api/Nails.Api/openapi.json` after implementation, and the client types are generated from it. JSON is camelCase; enums are camelCase strings. Errors are problem details with `code` and a Russian `title`; field errors are Russian. Every non-GET request carries the antiforgery header.

## Identity (`/api/identity`, signed in unless noted)

### Shapes

```text
PreferredContact      = "messages" | "phone"
NotificationSettings  { push: bool, email: bool, site: bool, reminders: bool }
MeResponse            { id, name, phone?, masterId?, mode, heartbeatSeconds,
                        email?, photoUrl?, telegram?, viber?, preferredContact, notifications: NotificationSettings }
```

### `PATCH /api/identity/me`

- Body `UpdateProfileRequest { name?, email?, photoUrl?, telegram?, viber?, preferredContact? }`. A missing field is unchanged; `""` clears `email`, `photoUrl`, `telegram` and `viber`.
- 200 `MeResponse`.
- Errors:
  - 400 field `name` «Введите имя»;
  - 400 field `email` «Проверьте адрес почты»;
  - 400 field `telegram` «Проверьте имя в Telegram»;
  - 400 field `viber` «Введите белорусский номер в формате +375 XX XXX-XX-XX»;
  - 409 `email-taken` «Эта почта уже используется другим аккаунтом»;
  - 403 `media-not-owned` «Это фото загрузил другой человек».

### `PUT /api/identity/me/notifications`

- Body `NotificationSettings`. 200 `NotificationSettings`.

### `POST /api/identity/me/phone/code` (rate limit `identity`)

- Body `{ phone }`.
- 200 `PhoneCodeResponse { sent, length, resendSeconds }`, the same shape as sign-in.
- Errors:
  - 400 `phone-invalid` (field `phone`);
  - 409 `phone-same` «Это ваш текущий номер»;
  - 409 `phone-taken` «Этот номер уже привязан к другому аккаунту»;
  - 429 `code-too-soon` «Новый код можно запросить через N с.».

### `POST /api/identity/me/phone` (rate limit `identity`)

- Body `{ phone, code? }`. `code` is required when verification is on.
- 200 `MeResponse` with the new phone.
- Errors: 400 `phone-invalid`, 400 `code-invalid` «Неверный код», 400 `code-expired` «Код устарел. Запросите новый.», 409 `phone-taken`.

### `POST /api/identity/sign-out/others`

- 204. The stamp changes, this cookie is refreshed, and every live connection of the account is closed (this tab reconnects).

## Masters (`/api/masters`, signed in unless noted; the module `masters`)

### Shapes

```text
BookingMoveStatus   = "open" | "accepted" | "declined" | "withdrawn" | "cancelled" | "lapsed"
BookingMoveCard     { start, durationMin, lapsesAt, status: BookingMoveStatus }
MyReview            { rating: int, text, date }
MyBookingResponse   = BookingResponse fields
                      + { canReview: bool, myReview?: MyReview, move?: BookingMoveCard }
BookingCard         + { move?: BookingMoveCard }           (the open move only; used by chats and by the realtime event)
BookingChangedEvent { booking: BookingCard }                (moved from Chats; no chatId)
MyReviewResponse    { id, masterId, masterName, masterPhotoUrl?, serviceName, rating, text, date }
MyReviewsResponse   { writtenCount, aboutCount, items: MyReviewResponse[], page, pageSize, totalCount }
FavoriteMasterResponse { id, name, photoUrl?, specialty, rating?, reviewsCount, verified }
```

### `GET /api/masters/bookings/mine?scope=upcoming|past&page=1&pageSize=20`

- 200 `PagedResponse<MyBookingResponse>`: the caller's site bookings as a client. Upcoming is pending or confirmed with a future start, ascending; past is the rest, descending.

### `GET /api/masters/bookings/{id}`

- 200 `MyBookingResponse`. 404 `booking-not-found`; 403 `not-booking-party`.

### `POST /api/masters/bookings/{id}/reviews`

- Body `{ rating: 1–5, text?: string ≤ 1000 }`.
- 201 `ReviewResponse`.
- Errors:
  - 400 field `rating` «Поставьте оценку»;
  - 400 field `text` «Не длиннее 1000 символов»;
  - 403 `not-booking-party`;
  - 404 `booking-not-found`;
  - 409 `not-completed` «Отзыв можно оставить после завершённого визита»;
  - 409 `review-window-closed` «Срок для отзыва истёк»;
  - 409 `review-exists` «Вы уже оставили отзыв об этом визите».

### `POST /api/masters/bookings/{id}/move` (the client side)

- Body `{ slotId }`.
- 200 `MyBookingResponse` with `move.status = open`.
- Errors:
  - 403 `not-booking-party`;
  - 409 `cannot-move` «Эту запись уже нельзя перенести»;
  - 409 `move-exists` «Перенос уже ждёт ответа мастера»;
  - 409 `slot-taken` «Это окно уже занято, выберите другое время»;
  - 409 `move-overlaps` «В это время у вас уже есть другая запись».

### `DELETE /api/masters/bookings/{id}/move` (the client side; withdraw)

- 200 `MyBookingResponse`. 409 `move-not-open` «Запрос на перенос уже неактуален».

### `POST /api/masters/bookings/{id}/move/accept` and `/move/decline` (the master side)

- 200 `BookingResponse`. 403 `not-booking-party` for the client side; 409 `move-not-open`.

### `POST /api/masters/bookings/{id}/cancel` (existing)

- Also ends an open move with `status = cancelled`.

### `POST /api/masters/bookings` (existing)

- Also withdraws an open move of the client whose held time overlaps the new booking (`status = withdrawn`).

### `GET /api/masters/reviews/mine?about=false&page=1&pageSize=20`

- 200 `MyReviewsResponse`: written by the caller as a client (`about=false`), or written about the caller by masters (`about=true`), newest first, with both counts.

### `GET /api/masters/favorites?page=1&pageSize=20`

- 200 `PagedResponse<FavoriteMasterResponse>`, newest first; deleted and unlisted masters skipped.

### `GET /api/masters/cities` (anonymous)

- 200 `string[]`: the names from `Modules:Masters:Cities:Items`, in settings order.

### `POST /api/masters/me` («Стать мастером»)

- Body `BecomeMasterRequest { categoryId, city, address }`.
- 201 `MeResponse` (with `masterId`).
- Errors:
  - 400 field `categoryId` «Выберите направление»;
  - 400 field `city` «Выберите город»;
  - 400 field `address` «Укажите адрес»;
  - 409 `master-exists` «У вас уже есть профиль мастера».

### Visibility change (existing endpoints)

- `GET search`, `GET suggestions`, `GET {id}`, `GET {id}/card`, `GET {id}/slots` and `GET {id}/reviews` skip, or answer 404 `master-not-found` for, a master without a service or with `locationSet = false`, except to its owner (`isOwn`).

## Real time

- `bookingChanged { booking: BookingCard }` is now sent by Masters for every booking change, including the five move kinds, to the master's user and the client, whether Chats is on or off.
- On revocation, «Выйти на других устройствах» closes every live connection of the account. No new event: a client re-reads `/api/identity/me` on its first failed reconnect, and a 401 there signs it out.

## New error codes (`ErrorCodes`)

`email-taken`, `phone-same`, `phone-taken`, `not-completed`, `review-window-closed`, `review-exists`, `cannot-move`, `move-exists`, `move-not-open`, `move-overlaps`, `master-exists`.
