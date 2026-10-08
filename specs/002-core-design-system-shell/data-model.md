# Data model: Design system, app frame and support

## Schema `support`

### `support.tickets` (entity `SupportTicket`, not tenant-owned: the sender may be a guest)

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | primary key, `Guid.CreateVersion7()` |
| `text` | `varchar(2000)` | required, trimmed, not blank |
| `contact` | `varchar(200)` | null when empty; trimmed |
| `user_id` | `uuid` | null for a guest; the signed-in user's id otherwise (no foreign key: Identity is another schema) |
| `status` | `varchar(20)` | `SupportTicketStatus` as a string; `new` on creation (the only value today) |
| `created_at` | `timestamptz` | stamped by `AuditingInterceptor` (`IAuditable`) |
| `updated_at` | `timestamptz` | stamped by `AuditingInterceptor` (`IAuditable`) |

Index: `ix_tickets_created_at` on `created_at` (the order a support reader will list them in; no list endpoint yet, so no other filter exists).

Migration: `AddSupport` (additive, creates the schema and the table).

## Client state

- `SupportDialog` (root service in `libs/web/support/feature`): the unsent draft `{ text, contact }` in a signal while the page lives; never written to browser storage (constitution IX).
- No other new state: the frame reads `SessionStore`, the loaded manifests and `Breakpoints`.
