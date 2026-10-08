# Data Model: Marketplace foundation

## Schema `identity` (changed behavior, no schema change)

- **Tenant**: created at registration for every account, `Name` = the person's display name.
- **ApplicationUser**: unchanged.

## Schema `catalog` (new, reference data seeded by the migration)

### Category `catalog.categories`

| Field | Type | Rules |
|---|---|---|
| Id | varchar(64), key | slug: `nails`, `brows`, `lashes`, `cosmetology`, `makeup`, `depilation` |
| Name | varchar(100) | Russian name |
| SortOrder | int | display order |

### Service `catalog.services`

| Field | Type | Rules |
|---|---|---|
| Id | varchar(64), key | slug, e.g. `manicure-gel` |
| CategoryId | varchar(64) | FK to `categories` (same schema), indexed |
| Name | varchar(100) | Russian name |
| SortOrder | int | order inside the category |

### City `catalog.cities`

| Field | Type | Rules |
|---|---|---|
| Id | varchar(64), key | slug, e.g. `minsk` |
| Name | varchar(100) | Russian name |
| SortOrder | int | Minsk first, then regional centers, then other cities |

## Schema `masters` (new)

### MasterProfile `masters.profiles` (IAuditable, IVersioned)

| Field | Type | Rules |
|---|---|---|
| Id | uuid v7, key | |
| UserId | uuid | the owner, unique |
| DisplayName | varchar(100) | required |
| About | varchar(2000) | may be empty |
| Phone | varchar(13) | `+375` and nine digits |
| CityId | varchar(64) | a catalog city slug, indexed |
| Address | varchar(200) | required |
| CreatedAt, UpdatedAt | timestamptz | indexed `created_at` |
| Version | bigint | concurrency token |

### Offer `masters.offers` (IAuditable)

| Field | Type | Rules |
|---|---|---|
| Id | uuid v7, key | |
| MasterId | uuid | FK to `profiles` (same schema), cascade delete |
| ServiceId | varchar(64) | a catalog service slug; unique with `MasterId`; index `(service_id, price)` |
| CategoryId | varchar(64) | the service's category at the time of saving, indexed |
| PriceKind | varchar(10) | `Exact`, `From`, `Free` |
| Price | numeric(10,2) | exact and from: 0 < price ≤ 100 000, two decimals at most; free: 0 |
| DurationMinutes | int | 5 to 720 |
| CreatedAt, UpdatedAt | timestamptz | |

## Rules (pure functions, `Nails.Application/Modules/Masters/Rules/`)

- `OfferPrice.Normalize(kind, amount)`: free → 0; exact and from → the amount when it is positive and has at most two decimals, otherwise no value.
- `HeadlinePrice.For(prices, serviceChosen)`: see research.md.
- `BelarusPhone.Normalize(text)`: `+375XXXXXXXXX` or no value.

## Visibility

- A master appears in search and has a public page only while they have at least one offer.
- Only the owner reads `me` and changes the profile and offers.
