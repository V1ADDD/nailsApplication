# Data model: Catalog, masters and the map home

Catalog: code, no tables.

## `identity.users` (changes)

| Column | Type | Use |
| --- | --- | --- |
| `last_seen_at` | `timestamptz` null | presence, updated at most once a minute |
| `master_id` | `uuid` null | the account's master profile (no foreign key across schemas) |

## Schema `masters`

All ids `uuid` (v7, or name-based for demo data); `IAuditable` (`created_at`, `updated_at`) on every table except `favorites`; prices as `price_kind` (`exact|from|free`, varchar 10) + `price_amount` `numeric(10,2)` null.

| Table | Columns and rules |
| --- | --- |
| `masters` | `id`; `user_id` unique; `organization_id` null; `name` ≤ 120; `photo_url` ≤ 500 null; `specialty` ≤ 60; `category_ids` text[]; `city` ≤ 60; `district` ≤ 60; `address` ≤ 200; `lat`, `lng` double; `experience_years` 0–60; `about` ≤ 2000; `verification_status` (`none|pending|verified|rejected`); `show_online`; `phone` ≤ 13; `email` ≤ 256 null; `telegram`, `viber`, `instagram` ≤ 64 null; `deleted_at` null; `version` (`IVersioned`); indexes `(city)`, `(deleted_at)`, `(lat, lng)` |
| `services` | `id`; `master_id`; `subcategory_id` ≤ 40; price; `duration_min` 15–240; `sort_order`; unique `(master_id, subcategory_id)` |
| `courses` | `id`; `master_id`; `title` ≤ 200; `school` ≤ 200; `year`; `sort_order`; index `(master_id)` |
| `portfolio_photos` | `id`; `master_id`; `url` ≤ 500 null; `hue` 0–359; `caption` ≤ 200 null; `sort_order`; index `(master_id)` |
| `favorites` | `user_id`, `master_id` (PK), `created_at`; index `(master_id)` |
| `schedules` | `master_id` PK; `work_days` int[]; `time_from`, `time_to` (`time`); `slot_minutes`; `breaks` jsonb `[{from,to}]`; `capacity` 1–5; `auto_confirm_enabled`; `auto_confirm_after_minutes` |
| `slots` | `id`; `master_id`; `start_at`; `duration_min`; `status` (`free|pending|booked|busy`); `booking_id` null; `version`; index `(master_id, start_at)`, `(status, start_at)` |
| `bookings` | `id`; `master_id`; `client_user_id` null; `external_client_name` ≤ 120 null; `subcategory_id`; price; `start_at`; `duration_min`; `address` ≤ 200; `status` (`pending|confirmed|cancelled|completed|no_show`); `source` (`site|external`); `created_by` (`client|master`); `confirmed_at`, `cancelled_at` null; `cancelled_by` null; `cancel_reason` ≤ 300 null; `cancel_mutual`; `cancel_expired`; `note` ≤ 1000 null; `slot_id` null; `version`; indexes `(client_user_id, start_at)`, `(master_id, start_at)`, `(status, start_at)` |
| `reviews` | `id`; `booking_id` null; `master_id`; `client_user_id`; `author_role` (`client|master`); `subcategory_id`; `rating` 1–5; `text` ≤ 1000; unique `(booking_id, author_role)`; index `(master_id, author_role)` |

Derived, never stored: rating (mean of client reviews, 1 decimal), reviews count, completed bookings, headline price, distance, next free slot, online.

Migration: `AddCatalogMastersPresence` (the `identity.users` columns and the `masters` schema).
