# Data model: Phone sign-in

## Schema `identity`

### `identity.users` (existing `ApplicationUser`)

| Column | Use from this spec |
| --- | --- |
| `user_name`, `normalized_user_name` | the normalised phone `+375XXXXXXXXX`; unique (existing index) |
| `phone_number` | the same phone; `phone_number_confirmed` = true |
| `display_name` | the name, required, ≤ 120 (checked by the sign-in request; the column keeps its 200 limit, so no migration) |
| `email`, `password_hash` | null for new accounts; legacy accounts keep theirs but cannot sign in |

### `identity.phone_codes` (new entity `PhoneCode`, not tenant-owned: it exists before the account)

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | `Guid.CreateVersion7()` |
| `phone` | `varchar(13)` | normalised phone; unique index `ix_phone_codes_phone` |
| `code_hash` | `varchar(200)` | `PasswordHasher<PhoneCode>` hash of the 6-digit code |
| `expires_at` | `timestamptz` | sent time + `Modules:Identity:PhoneCode:Lifetime` (5 min) |
| `sent_at` | `timestamptz` | when the current code was sent; drives the resend interval (1 min) |
| `attempts` | `integer` | wrong attempts; usable while `< MaxAttempts` (5) |
| `created_at`, `updated_at` | `timestamptz` | `IAuditable` |

Lifecycle: requested → (wrong code: `attempts + 1`) → right code with an account or with a name: deleted and the session starts. A new request after the resend interval replaces the row. Expired rows are replaced by the next request for the phone.

Migration: `AddPhoneSignIn` (additive: the table and its index).
