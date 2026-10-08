# Implementation Plan: Catalog, masters and the map home

**Branch**: `004-masters-map-search` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-masters-map-search/spec.md`; approach from `specs_requests/004-masters-map-search.md` and the constitution.

## Summary

Add the always-on `Catalog` (code), presence in `Identity`, the switchable `Masters` marketplace module (profiles, services, courses, portfolio, favourites, schedules, slots, bookings, reviews; search, card, favourites), a Development demo world seeded per module, and the client map page (Leaflet, own clustering, search with suggestions, chips, filters sheet, sort, list, phone bottom sheet) as the home page. Details in [research.md](research.md).

## Technical Context

**Modules touched**: catalog (new, always on), masters (new), identity, core, help

**Platforms**: web; pure helpers and stores in `libs/shared`

**Module interaction**: Masters uses `Identity.Contracts.ICurrentUser` and `IPresence`, and `Catalog.Contracts.ICatalog`; the client masters feature uses core (`SessionStore`, `CatalogStore`, frame) only.

**Stack**: .NET 10, EF Core 10 (Npgsql arrays and JSON), Angular 22. New npm packages: `leaflet` 1.9.4, `@types/leaflet` 1.9.20.

**Storage**: see [data-model.md](data-model.md); migration `AddCatalogMastersPresence`.

**Contracts**: see [contracts/catalog-and-masters.md](contracts/catalog-and-masters.md).

**Settings** (three environments): `Modules:Identity:Presence` (`TouchInterval` 00:01:00, `OnlineWindow` 00:05:00); `Modules:Masters` (`Enabled` true; `Search`: `DefaultPageSize` 20, `MaxPageSize` 50, `PinLimit` 1000, `DefaultLatitude` 53.9038, `DefaultLongitude` 27.5567, `MaxQueryLength` 100); `Demo:Enabled` (Development true, Docker and Production false).

**Constraints**: search p95 < 300 ms for 1000 masters; from 360 px; initial bundle under 700 kB (Leaflet only in the lazy masters chunk).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched: I (prices, plurals, Minsk dates through the shared helpers and `MinskTime`), II (search, distance, prices, windows as pure rules), III (contract, new packages), IV (a new module), V (layers; a `Seed/` folder), VI (Masters uses only Identity and Catalog contracts), VII (public route `/` declared by Masters, tokens, map styles), IX (no user text in logs; the query is not logged), X (help).

| Gate | Status |
|---|---|
| II. Rules pure, server enforces | Pass |
| IV. Module only in its folders | Pass; the edge tab is a core component; module routes precede the core redirect |
| V. Allowed folders | Change: `Nails.Application/Modules/<Module>/Seed/` for Development demo data; constitution 4.2.0 → 4.3.0 |
| VI. Cross-module only via Identity/Catalog contracts | Pass: ids shared through `DemoIds`, no cross-schema queries |
| Packages through a spec | Pass: `leaflet`, `@types/leaflet` recorded here |
| No dead code | Pass: `IAccountLinks`, tabs, segmented control, swipe stay deferred |

Post-design re-check: Pass.

## Project Structure

```text
api/
├── Nails.Api/
│   ├── Program.cs                                         `seed --reset`
│   ├── Host/Middleware/PresenceMiddleware.cs
│   ├── Modules/Catalog/Controllers/CatalogController.cs
│   ├── Modules/Masters/Controllers/{MastersController,FavoritesController}.cs
│   └── Modules/Help/Content/ru/{articles/masters.json, images/find-masters/*.png}
├── Nails.Application/
│   ├── Common/{Time/MinskTime.cs, ApplicationServiceProviderExtensions.cs, Options/DemoOptions.cs}
│   ├── Modules/Catalog/{CatalogModule, Contracts, Services, Responses, Rules}
│   ├── Modules/Identity/{Contracts/IPresence, Services/{Presence,PresenceTracker}, Options/PresenceOptions}
│   └── Modules/Masters/{MastersModule, Contracts, Services, Requests, Responses, Options, Rules}
└── Nails.Infrastructure/
    ├── Persistence/{DemoIds.cs, Contracts/IDemoSeeder.cs, Migrations/*_AddCatalogMastersPresence.cs}
    ├── Modules/Identity/{Entities/ApplicationUser (LastSeenAt, MasterId), Contracts/IUserPresenceRepository, Repositories/UserPresenceRepository}
    └── Modules/Masters/{Entities, Configurations, Contracts, Repositories, Models}
client/
├── package.json                                           leaflet, @types/leaflet
├── apps/web/{project.json (leaflet.css), src/modules.ts, src/styles/_map.scss}
├── nginx.conf.template                                    img-src tiles and photos
└── libs/
    ├── shared/common/util/                                formatPrice, formatDistance, formatDecimal, plural, NBSP
    ├── shared/core/data-access/                           CatalogStore, me.masterId
    ├── shared/masters/data-access/                        MastersApi, MasterSearchStore, FavoritesStore
    ├── web/common/ui/                                     Rating, avatar online dot, photo
    ├── web/core/feature/                                  FrameEdgeTab, routes order
    └── web/masters/feature/                               map page and its parts, cluster.ts, manifest
```

**Module switch**: off → no masters API, no «Карта», `/` opens «Профиль», the help article hidden; the tables stay.

**Help**: new `ru/articles/masters.json` (`find-masters` in section «Поиск мастеров») with pictures; `core.json` `navigation` mentions «Карта».

## Changes to earlier specs

- 002/003: `/` becomes the map when Masters is on; the frame shows «Карта»; the right-edge «Напишите нам» returns on the map page (phones) through `FrameEdgeTab`.
- 003: `/me` gains `masterId`; `SessionStore` keeps the user's location for the session.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |

## Implementation notes

Decisions taken while building, in addition to [research.md](research.md):

- **Seeders in Application.** `IdentityDemoSeeder` and `MastersDemoSeeder` live in `Nails.Application/Modules/<Module>/Seed/` with their demo data (`IdentityDemoData`, `MastersDemoData` generated from `reference/masters.fixtures.ts`, `MastersDemoScenario` from `reference/seed.ts`); the Masters seed builds slots with `ScheduleTemplate` and `MinskTime`. Demo master accounts sign in with +375 44 700-00-01 … 700-00-25. Photos come from `Demo:PhotoUrlFormat`.
- **Preset creation times.** `AuditingInterceptor` keeps a `CreatedAt` set before insert, so seeded reviews and bookings carry their historical dates.
- **UTC instants.** `MinskTime.StartOf` and `MinskTime.At` return UTC `DateTimeOffset`s, because Npgsql writes only offset 0 to `timestamptz`.
- **Query parameters.** `MasterSearchRequest` and `CardRequest` name their query parameters in camelCase (`[FromQuery(Name = ...)]`); model-binding errors (an unknown `sort`, a non-number) answer «Значение указано неверно.» through `DefaultModelBindingMessageProvider`.
- **The query stays out of the address.** FR-013 keeps only `?service=` in the URL; the typed query lives in `MasterSearchStore` (app lifetime). The root `AGENTS.md` forbids user free text in URLs.
- **Client additions to the core.** `Toasts.info` (the dark toast for the location message), `Sheets.open(component, data)`, `Icon` `filled`, `EmptyState`/`ErrorState` `message`, `FrameEdgeTab`, `apiPaths` and `CatalogStore` exported from `@nails/shared/core/data-access`; `appPaths`/`returnToParameter` exported from `@nails/web/core/feature` for the guest sign-in redirect.
- **Design improvements over the old app.** Clusters closer than the clustering radius merge into one, so bubbles never overlap; when a search leaves no pin in view, the map fits the found masters; the map stacks its own layers so its attribution never shows through the suggestions; on phones the «Напишите нам» tab sits high on the right edge, clear of the zoom buttons and the pin card; the verified badge flows with a wrapping name.
- **Web server.** `client/nginx.conf.template` allows pictures from `https://tile.openstreetmap.org` and `https://randomuser.me` and `geolocation=(self)`.
- **Verification (2026-10-08).** API: every filter and sort, `pageSize=0`, typo «маникбр», `isFavorite`/`isOwn`, favourites idempotency and 404, guests' 401, validation messages. Browser (headless Chrome, 1440, 820, 390 and 360 px): the map, clusters, the list sheet in three heights, the pin card, suggestions, the filters sheet with the live count, the empty state, sign-in from the heart with the return to the map, favourites, «Это ваш профиль», sign-out to the map; with `Modules__Masters__Enabled=false` «Карта» disappears and `/` opens «Профиль».
