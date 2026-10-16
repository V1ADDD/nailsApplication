# Contracts: Chats, real time and media (draft)

These drafts are proposals. The authoritative contract is `api/Nails.Api/openapi.json` after implementation, and the client types are generated from it. JSON is camelCase; enums are camelCase strings. Errors are problem details with `code` and a Russian `title`.

## Media (core)

### `POST /api/media` (signed in, `multipart/form-data`, field `file`, antiforgery)

- 201 `MediaResponse { id: uuid, url: "/api/media/{id}" }`
- 400 `media-type` «Можно загрузить только фото (JPG, PNG, WebP)»
- 400 `media-too-large` «Фото больше 10 МБ»
- 429 `rate-limited` (policy `media`)

### `GET /api/media/{id}` (anonymous)

- 200 the bytes with the stored `Content-Type`, `Cache-Control: private, max-age=31536000, immutable` (browser cache only; no shared caches) and an `ETag`.
- 404 `media-not-found` «Фото не найдено».

## Mode (Identity)

### `GET /api/identity/me`

`MeResponse` gains:
- `mode: "client" | "master"`;
- `heartbeatSeconds: int`.

### `PUT /api/identity/mode`

- Body: `{ mode: "client" | "master" }`.
- 200 `MeResponse`.
- 403 `not-a-master` «Сначала создайте профиль мастера».
- Pushes `modeChanged { mode }`.

## Real time (core)

The hub is `/api/hub`. It is signed in, WebSockets only, and the client sets `skipNegotiation`.

- **Client → server**: `heartbeat()` touches presence, at most once per `TouchInterval`.
- **Server → client**: the events in research R10. `messageCreated` and `messageUpdated` carry the server's `preview` of the message. Their payload schemas are published as OpenAPI components:
  - `MessageCreatedEvent`
  - `MessageUpdatedEvent`
  - `ChatReadEvent`
  - `ChatChangedEvent`
  - `BookingChangedEvent`
  - `UnreadChangedEvent`
  - `ModeChangedEvent`

## Chats (`/api/chats`, signed in, module `chats`)

Every route with `{id}` or `role` resolves access as in research R4:
- 403 `other-role` «Этот чат доступен в другом режиме профиля»;
- 404 `chat-not-found` «Чат не найден»;
- 403 `not-a-master` «Сначала создайте профиль мастера».

### Shapes

```text
ChatRole            = "client" | "master"
CounterpartResponse { id: uuid, name, photoUrl?, isMaster, online, subtitle?, deleted }
                      master: id = masterId, subtitle = specialty, online = presence && showOnline
                      client: id = userId, subtitle = phone only with a booking at this master, online = false
                      deleted master: last name kept, online = false; missing account: name «Аккаунт удалён»
MessageResponse     { id, kind: "text"|"booking"|"system", authorRole?: ChatRole, text?, mediaUrl?,
                      bookingId?, sentAt, editedAt?, deleted: bool }
ChatSummaryResponse { chatId, counterpart, lastMessage?: MessageResponse, lastMessagePreview, unread: int,
                      blockedBy?: ChatRole }
ChatResponse        { id, blockedBy?: ChatRole, otherReadAt }
ChatBookingResponse { id, masterId, subcategoryId, serviceName, price: PriceResponse, startAt, durationMin,
                      status: "pending"|"confirmed"|"cancelled"|"completed"|"noShow", createdBy: ChatRole,
                      cancelReason?, cancelledBy?: ChatRole, expired: bool, releaseAt? }
ChatThreadResponse  { chat, counterpart, messages: MessageResponse[], bookings: ChatBookingResponse[],
                      hasOlder: bool }
```

`PriceResponse` is Masters' existing price shape. The plan reuses it through the `BookingCard` contract, so the client formats it with `formatPrice`.

### Endpoints

| Method and path | Request | 2xx | Errors |
|---|---|---|---|
| `POST /api/chats` | `{ masterId }` (as client) or `{ clientId }` (as master), exactly one | 200 `{ chatId }`; a chat the caller deleted is listed again (its old messages stay hidden) | 400 `invalid-request` (both or neither); 404 `master-not-found`; 400 `self-chat` «Нельзя написать самой себе»; 403 `not-own-client` «Написать можно только своему клиенту»; 403 `not-a-master` |
| `GET /api/chats?role=` | | 200 `ChatSummaryResponse[]`, newest activity first | |
| `GET /api/chats/unread?role=` | | 200 `{ count }` | |
| `GET /api/chats/{id}?role=` | | 200 `ChatThreadResponse` (last `PageSize` messages after my clear time, oldest first) | |
| `GET /api/chats/{id}/messages?role=&before=&limit=` | `before`: message id | 200 `{ items: MessageResponse[], hasOlder }` | 400 `limit` > `MaxPageSize` |
| `POST /api/chats/{id}/messages?role=` | `{ text?: string ≤ 2000, mediaUrl?: string }` | 201 `MessageResponse` | 400 `empty-message` «Пустое сообщение»; 409 `chat-blocked` «Чат заблокирован, писать нельзя»; 403 `media-not-owned` «Это фото загрузил другой человек» |
| `PATCH /api/chats/messages/{messageId}` | `{ text ≤ 2000 }` | 200 `MessageResponse` | 404 `message-not-found` «Сообщение не найдено»; 403 `not-author` «Можно менять только свои сообщения»; 409 `message-deleted` «Сообщение уже удалено»; 400 `empty-message` |
| `DELETE /api/chats/messages/{messageId}` | | 200 `MessageResponse` (the tombstone) | 404, 403 `not-author`, 409 `message-deleted` |
| `POST /api/chats/{id}/read?role=` | | 200 `{ readAt }` | |
| `POST /api/chats/{id}/block?role=` | | 200 `ChatResponse` | 409 `already-blocked` «Чат уже заблокирован» |
| `DELETE /api/chats/{id}/block?role=` | | 200 `ChatResponse` | 403 `not-blocker` «Разблокировать может только тот, кто заблокировал» |
| `DELETE /api/chats/{id}?role=` | | 204 | |

- **Editing and deleting** take no `role`: the author is known from the message, and the caller must be that side's account (the client account, or the user of the master profile).
- **Side effects** (all after the save, research R10):

| Action | Events |
|---|---|
| send | `messageCreated` to both, `unreadChanged` to the other side |
| edit, delete | `messageUpdated` to both, `unreadChanged` to the other side when a deleted message was unread |
| read | `chatRead` to both, `unreadChanged` to the reader |
| block, unblock | `chatChanged` to both |
| clear | `unreadChanged` to the caller |

## Masters (changes)

- `GET /api/masters/{id}`: `MasterProfileResponse` gains `replyMinutes?: int`. It is null when Chats is off or there are fewer than 3 pairs.
- `POST /api/masters/bookings`, confirm and cancel: unchanged, except that the `AutoCancelled` events now carry each cancelled booking's own master (research R2).
- New Application contract `IMasterDirectory` and extension point `IReplyTimeSource` (research R2, R5). They are not HTTP.
