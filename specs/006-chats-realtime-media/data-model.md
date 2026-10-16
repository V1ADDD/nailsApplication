# Data model: Chats, real time and media

One migration, `AddChatsMedia`. It is additive: a new schema `chats`, a new table in `platform`, and one new column in `identity.users`.

## platform.media_files (core, `Nails.Infrastructure/Storage/Entities/MediaFile`)

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | v7, the id in `/api/media/{id}` |
| `owner_user_id` | uuid | the uploader; no foreign key across schemas |
| `content_type` | varchar(20) | `image/jpeg`, `image/png`, `image/webp`, from the magic bytes |
| `size_bytes` | bigint | ≤ `Media:MaxBytes` |
| `storage_key` | varchar(200) | `yyyy/MM/<id>.<ext>` |
| `created_at` | timestamptz | `IAuditable` |

- Index: `owner_user_id`, for the ownership check.
- Not tenant-owned: a photo is public by its unguessable id, and only its owner may attach it.

## identity.users (Identity, `ApplicationUser`)

| Column | Type | Rules |
|---|---|---|
| `active_mode` | varchar(10) | `client` or `master`, default `client`, not null |

- Read as `client` when `master_id` is null (FR-007).

## chats.chats (`Nails.Infrastructure/Modules/Chats/Entities/Chat`)

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | v7 |
| `master_id` | uuid | the master profile (Masters), by id only |
| `client_user_id` | uuid | the client account (Identity), by id only |
| `client_read_at`, `master_read_at` | timestamptz | each side's read time; set to creation time |
| `client_cleared_at`, `master_cleared_at` | timestamptz null | set when that side deletes the chat; that side never sees messages at or before it |
| `client_hidden`, `master_hidden` | boolean | default false; true when that side deletes the chat, false again on any new message or booking in the chat, or when that side starts the chat again |
| `blocked_by` | varchar(10) null | `client`, `master` or null |
| `last_message_at` | timestamptz null | the newest message of any kind |
| `version` | bigint | `IVersioned`: block and unblock from both sides at once |
| `created_at`, `updated_at` | timestamptz | `IAuditable` |

- Indexes:
  - unique `(master_id, client_user_id)`;
  - `(client_user_id, last_message_at desc)` for the client list;
  - `(master_id, last_message_at desc)` for the master list.
- Read times, clear times and the hidden flags are written with `ExecuteUpdate` on their own columns, so they never conflict with a block change.
- "Clear" in the code means the spec's «Удалить чат» for one side: `<side>_cleared_at` = now and `<side>_hidden` = true.
- Not tenant-owned (R1): a chat belongs to two accounts, and `ChatAccess` checks the side on every request.

## chats.messages (`Entities/Message`)

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | v7 |
| `chat_id` | uuid | FK → `chats.chats` (same schema), cascade delete |
| `kind` | varchar(10) | `text`, `booking` or `system` |
| `author_role` | varchar(10) null | `client` or `master`; null for `system` |
| `text` | varchar(2000) null | trimmed; null when deleted; the system text for `system` |
| `media_url` | varchar(200) null | `/api/media/{id}` owned by the author; null when deleted |
| `booking_id` | uuid null | for `booking` messages and the system messages of a booking |
| `sent_at` | timestamptz | the server time |
| `edited_at` | timestamptz null | the last edit |
| `deleted_at` | timestamptz null | the tombstone |

- Indexes:
  - `(chat_id, sent_at, id)` for pages, unread and previews;
  - `(chat_id, booking_id)` filtered `booking_id is not null`, for the cards of a chat.
- Check constraints:
  - `text` messages have `text` or `media_url` unless deleted;
  - `booking` messages have `booking_id`;
  - `system` messages have `text` and no `author_role`.

## Rules and transitions

- **Chat**
  - **Created**: by `POST /api/chats` or the first booking of the pair. Both read times start at creation.
  - **Blocked**: `blocked_by` is null → the caller's side. Unblocking is allowed only when `blocked_by` is the caller's side, else 403 `not-blocker`.
  - **Cleared** (my side): `<side>_cleared_at` = now and `<side>_hidden` = true. Messages at or before my clear time are never returned to me, and nothing is deleted.
  - **Listed** for a side when `<side>_hidden` is false. Any new message or booking message sets both hidden flags to false, so the chat comes back with only the newer messages.
  - **Started again** by me after clearing: `<side>_hidden` = false and `<side>_cleared_at` is kept, so the chat is listed and the old messages stay hidden.
- **Message**
  - **Sent**: not when `blocked_by` is set (409 `chat-blocked`). Sending sets the author's `read_at` and `last_message_at` to `sent_at`, and both hidden flags to false.
  - **Edited**: only by the author, only `kind = text`, not deleted, including photo-only messages (the author can add a caption). The result needs text or a photo: a blank edit is refused only when the message has no photo, and a blank edit of a photo message removes the caption.
  - **Deleted**: only by the author, only `kind = text`. `deleted_at` is set and `text` and `media_url` are cleared. The media file stays, because a stored file may be referenced elsewhere later.
  - `booking` and `system` messages are immutable.
- **Unread** for side S: messages with `author_role` ≠ S, `kind` in (`text`, `booking`), `deleted_at` null, and `sent_at > greatest(S_read_at, S_cleared_at)`.
- **Phone in master mode**: shown when `IMasterDirectory.ClientsWithBookingsAsync` contains the client (clarification 1).

## Value types (Application, one per file)

- `Chats/Rules/`:
  - `ChatRole` (`Client`, `Master`);
  - `MessageKind`;
  - `ChatTexts`, `ChatPreview`, `Unread`, `ReplyTime`, `ChatVisibility` (whether a chat is listed for a side, from the hidden flag, and from which instant its messages show, from the clear time);
  - `MessageRules` (send, edit and delete checks, returning an error code or null).
- `Masters/Contracts/`: `MasterSummary`, `BookingCard`, `PairBooking`.
- `Masters/ExtensionPoints/IReplyTimeSource`.
- `Common/Media/`: `ImageSignature`, `MediaContent`.
- `Identity/Rules/`: `UserMode` (`Client`, `Master`).
