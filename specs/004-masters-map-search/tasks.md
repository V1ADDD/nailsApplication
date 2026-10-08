---

description: "Task list for the catalog, masters and the map home"
---

# Tasks: Catalog, masters and the map home

**Input**: Design documents from `/specs/004-masters-map-search/`

**Tests**: None. This project writes no tests.

## Phase 1: Setup

- [X] T001 Add `leaflet` 1.9.4 and `@types/leaflet` 1.9.20 to `client/package.json`, `leaflet/dist/leaflet.css` to the web styles, the tile and photo hosts to `client/nginx.conf.template` `img-src`

## Phase 2: Foundational

- [X] T002 [P] `MinskTime` in `api/Nails.Application/Common/Time/`
- [X] T003 [P] `IDemoSeeder`, `DemoIds`, `DemoOptions`, seeding in `PrepareApplicationAsync`, `seed --reset` in `api/Nails.Api/Program.cs`, the Production guard
- [X] T004 [P] Catalog module: data, `ICatalog`, `TextSearch` rules, `CatalogService`, responses, `CatalogController`, `ModuleCatalog` entry
- [X] T005 Identity: `LastSeenAt`, `MasterId`, `PresenceOptions`, `PresenceTracker`, `PresenceMiddleware`, `IPresence`, `/me.masterId`, `IdentityDemoSeeder`
- [X] T006 Masters entities, enums, configurations, `DatabaseSchemas.Masters`
- [X] T007 Migration `AddCatalogMastersPresence`

## Phase 3: User Stories 1–3 — search and the map (P1)

- [X] T008 Masters rules: `Geo`, `Prices`, `MasterMatch`, `SearchWindow`, `ScheduleTemplate` in `api/Nails.Application/Modules/Masters/Rules/`
- [X] T009 `MasterSearchRepository` (candidates with aggregates), `FavoriteRepository`, models
- [X] T010 `MasterSearchService` (pipeline, card), `FavoriteService`, requests, responses, options, `MastersModule`, controllers, settings
- [X] T011 `MastersDemoSeeder` (profiles, services, courses, portfolio, schedules, slots, bookings, reviews, favourites)
- [X] T012 Build, regenerate `openapi.json` and `schema.ts`; verify the API with the seeded data (filters, typos, synonyms, sorts, paging, `pageSize = 0`)
- [X] T013 [P] Client helpers: `formatPrice`, `formatDistance`, `formatDecimal`, `plural`, `NBSP`; `CatalogStore`; `Rating`; avatar photo and online dot; `FrameEdgeTab`; module routes before the core redirect
- [X] T014 `libs/shared/masters/data-access`: `MastersApi`, `MasterSearchStore`, `FavoritesStore`
- [X] T015 `libs/web/masters/feature`: manifest, map page, search bar, chips, filters sheet, sort, list, card, map with pins and clusters, phone results sheet, pin card; global map styles; `modules.ts`, `tsconfig.base.json`

## Phase 4: User Story 4 — favourites (P2)

- [X] T016 Heart on the card with sign-in redirect for guests; own card «Это ваш профиль»

## Phase 5: Polish

- [X] T017 Help `masters.json` with pictures; `core.json` navigation; README; constitution 4.3.0
- [X] T018 Checks: `dotnet build`, migrations, vulnerable packages, `npx nx run-many -t lint typecheck knip format-check build`, `npm audit`
- [X] T019 Run the stack: sign-in, sign-out, the map on phone, tablet, desktop and 360 px against `design/`; `Modules:Masters:Enabled=false`
- [X] T020 Refactor and record changes in `plan.md`
