# Research: Catalog, masters and the map home

Sources: `specs_requests/004-masters-map-search.md`, `specs_requests/reference/{catalog,rules,masters.fixtures,seed}.ts`, `reference/styles/_map.scss`, the old-app screenshots in `design/`.

## R1. Catalog as code

- **Decision**: `Nails.Application/Modules/Catalog/`: `CatalogModule` (always on), `Contracts/ICatalog` with `CatalogCategory` and `CatalogSubcategory` records, `Services/CatalogData` (the static list ported from `reference/catalog.ts`), `Services/CatalogService` (the endpoints), `Rules/TextSearch` (`Normalize`, `EditDistance`, `TypoBudget`, `FuzzyIncludes`). `GET /api/catalog` sends `Cache-Control: public, max-age=3600`.
- **Alternatives**: a table (the catalog changes with releases only; slugs are part of the contract).

## R2. Search pipeline

- **Decision**: `MasterSearchRepository.FindCandidatesAsync(filter)` runs one SQL query: not deleted, at least one service, `city`, a bounding box for `maxDistanceKm`, `verified`, `window` as `EXISTS` on a free future slot in the Minsk date range; it projects the master, its services, the client-review mean and count, completed bookings and (when asked) the next free slot. `MasterSearchService` then applies presence (`IPresence.OnlineUsersAsync`), the exact distance (`Geo.DistanceKm`), `minRating`, the service filter, `MatchMaster(q)`, the price range, computes the headline price, ranks, pages and builds the pins. Rules are pure in `Masters/Rules/` (`Geo`, `Prices`, `MasterMatch`, `SearchWindow`, `ScheduleTemplate`).
- **Rationale**: matches the request; typo matching over a few thousand candidates is fast; no extension needed.
- **Window**: `SearchWindow.Dates(window, today)` gives Minsk dates (today; tomorrow; the nearest Saturday and Sunday, only Sunday on a Sunday); `MinskTime` (`Nails.Application/Common/Time/`, its first user) turns them into UTC instants.

## R3. Presence

- **Decision**: `identity.users.last_seen_at`; `PresenceMiddleware` after authentication calls `PresenceTracker.Touch(userId)` which updates the column at most once per `Modules:Identity:Presence:TouchInterval` (60 s) per user through an in-memory map and `ExecuteUpdate`; `IPresence.OnlineUsersAsync(ids)` returns those seen within `OnlineWindow` (5 min). Demo masters marked online get `last_seen_at` a year ahead so they stay online in Development.

## R4. Demo world

- **Decision**: `IDemoSeeder { Order; ResetAsync; SeedAsync }` in `Nails.Infrastructure/Persistence/Contracts/`, implementations in `Nails.Application/Modules/<Module>/Seed/` (constitution amendment; the Masters seed reuses `ScheduleTemplate` and `MinskTime`, which live in Application), registered by each module and writing only the module's own tables through `AppDbContext`. `DemoIds.For(slug)` (a name-based UUID from SHA-256 in `Nails.Infrastructure/Persistence/`; `DemoIds.User(slug)` for accounts) gives the same id in every module. `PrepareApplicationAsync` runs the seeders when `Demo:Enabled` is true; each seeder skips when its data exists. `dotnet run --project Nails.Api -- seed --reset` resets (reverse order) and reseeds, then exits. In Production `Demo:Enabled` true stops the API.
- **Identity seed**: Анна Новикова (+375291234567, master `m-me`), the six clients of `reference/seed.ts` with their phones, 25 master accounts with phones `+37544` + 7 digits from their index; users that already hold a demo phone are removed first (Development only); online masters get a future `last_seen_at`; `master_id` set for master accounts.
- **Masters seed**: the 26 fixture profiles (randomuser.me photos, contacts, courses for experience ≥ 3, portfolio placeholders with hues), services, schedules, 14 days of slots from `TemplateTimes` with mulberry32 seeds (busy chance 0.55 days 0–2, 0.3 later, 80 % of busy `booked`), the bookings and reviews of `reference/seed.ts`, client reviews per master equal to its fixture count with ratings chosen so the mean equals the fixture rating (texts by rating from the five fixture texts), Анна's favourites.

## R5. Client

- **Packages**: `leaflet` 1.9.4 and `@types/leaflet` 1.9.20 (exact); `leaflet/dist/leaflet.css` in the web app's styles; the web CSP `img-src` adds `https://*.tile.openstreetmap.org` and `https://randomuser.me`.
- **Libraries**: `libs/shared/masters/data-access` (`MastersApi`, `MasterSearchStore` with request ids so stale responses lose, `FavoritesStore`), `libs/web/masters/feature` (`MapPage`, `SearchBar`, `FilterChips`, `FiltersSheet`, `SortSelect`, `ResultsList`, `MasterCard`, `MastersMap`, `ResultsSheet` for phones, `PinCard`, `cluster.ts`), `CatalogStore` in `libs/shared/core/data-access`, formatters `formatPrice`, `formatDistance`, `formatDecimal`, `plural` in `libs/shared/common/util`, `Rating` and the avatar's online dot in `libs/web/common/ui`.
- **Layout**: the map page is `position: fixed` between the top bar (lg) and the tab bar (below lg), so the frame needs no change; the right-edge «Напишите нам» comes from a core `FrameEdgeTab` component that renders the frame actions.
- **Routing**: module public routes are placed before the core `''` redirect, so the masters map wins when the module is on.
