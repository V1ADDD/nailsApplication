# Contract draft: Catalog and Masters

The authoritative contract is `api/Nails.Api/openapi.json` after implementation.

## Catalog (always on)

- `GET /api/catalog` (anonymous, `Cache-Control: public, max-age=3600`) → `[{ id, name, specialty, subcategories: [{ id, name, addon }] }]`.
- `GET /api/catalog/suggestions?q=` (anonymous) → up to 6 `{ kind: 'category' | 'subcategory', id, name, categoryId, categoryName }`; empty when the normalised query is shorter than 2.

## Identity

- `GET /api/identity/me` → `{ id, name, phone, masterId }`.

## Masters (`Modules:Masters:Enabled`)

- `GET /api/masters/search` (anonymous) with `q`, `categoryId`, `subcategoryId`, `priceFrom`, `priceTo`, `maxDistanceKm`, `minRating`, `online`, `verified`, `window` (`today|tomorrow|weekend`), `city`, `sort` (`distance|rating|price|nextSlot|popular`), `lat`, `lng`, `page` (1+), `pageSize` (0–50, 0 = counts only) → `{ total, onlineCount, items: [MasterCard], pins: [{ id, lat, lng, price, specialty, online }] }`.
- `MasterCard`: `{ id, name, photoUrl, specialty, rating, reviewsCount, experienceYears, distanceKm, online, verified, isFavorite, isOwn, headlinePrice, narrowed, preselectSubcategoryId, services: [{ subcategoryId, name, price, durationMin }], nextFreeSlotAt }`; `price` = `{ kind: 'exact'|'from'|'free', amount }`.
- `GET /api/masters/{id}/card?lat&lng` (anonymous) → `MasterCard`; 404 «Мастер не найден».
- `PUT` / `DELETE /api/masters/{id}/favorite` (signed in) → 204; 404 «Мастер не найден».
- `GET /api/masters/favorites/ids` (signed in) → `[id]`.
- 400 for an invalid parameter (Russian field errors).
