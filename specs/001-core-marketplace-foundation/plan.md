# Implementation Plan: Marketplace foundation for «Мастера рядом»

**Branch**: `001-core-marketplace-foundation` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-core-marketplace-foundation/spec.md`

## Summary

Turn the initialized template into the base of «Мастера рядом»: Russian user-facing text everywhere (UI, problem details, validation and Identity messages, emails, help), a `ru-BY` client with shared formatters for prices, phones, plurals and non-breaking spaces, a Material theme with design tokens and Manrope, a public home page, personal accounts without organizations, the always-on `Catalog` module (categories, services, cities as seeded reference data), and the switchable `Masters` module (one master profile per account, a price list with exact, from and free prices, public search with headline prices and a public master page). Business rules (price normalization, headline price, Belarusian phone) are pure functions in `Masters/Rules/`.

## Technical Context

**Modules touched**: core, identity, help, catalog (new, always on), masters (new, switchable)

**Platforms**: web; formatters and data access in `client/libs/shared`

**Module interaction**: `Masters` uses `Identity` contracts (`ICurrentUser`) and `Catalog` contracts (`ICatalogService`, `CatalogDirectory`) to validate and name services, categories and cities. No table, foreign key or query crosses schemas; offers store the catalog slugs.

**Stack**: .NET 10 (ASP.NET Core controllers, EF Core 10 on PostgreSQL), Angular 22 (Nx, signals, Angular Material). New npm package: `@fontsource-variable/manrope` (self-hosted Manrope).

**Storage**: schema `catalog`: `categories`, `services`, `cities` (seeded with `HasData`, slug keys). Schema `masters`: `profiles` (unique `user_id`, index `city_id`, index `created_at`; `IVersioned`), `offers` (unique `(master_id, service_id)`, index `(service_id, price)`, index `category_id`; cascade from `profiles`; `price numeric(10,2)`). Migration `AddCatalogAndMasters`.

**Contracts**: see [contracts/](contracts/). `GET /api/catalog`; `GET /api/masters`, `GET /api/masters/{id}`; `GET|POST|PUT /api/masters/me`; `POST /api/masters/me/offers`, `PUT|DELETE /api/masters/me/offers/{id}`. Identity: `RegisterRequest` loses `organizationName`; `MeResponse` becomes `{ id, email, displayName }`.

**Settings**: `Modules:Masters` = `{ Enabled: true, DefaultPageSize: 20, MaxPageSize: 50, MaxOffers: 50 }` in Development, Docker and Production. `Modules:Help:DefaultLanguage` = `ru`. `Email:FromName` = `Мастера рядом`.

**Constraints**: price 0 < amount ≤ 100 000 with at most two decimals for exact and from; free is stored as 0. Duration 5 to 720 minutes. Display name ≤ 100, about ≤ 2 000, address ≤ 200 characters. Phone `+375` and nine digits with a Belarusian code. Layout from 360 px.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched: I (Russian UI, locale, prices, phones), II (rules in `Rules/`), III (contract, problem details), IV (new module), V (layers), VI (Catalog contracts), VII (client, public home, states, tokens), VIII (public marketplace data, ownership, master level), IX (privacy), X (help in `ru/`).

| Gate | Status |
|---|---|
| I. Russian user-facing text, ru-BY, BYN, shared formatters | Pass: every string translated; formatters in `libs/shared/common/util` |
| II. Rules are pure functions on the server | Pass: `OfferPrice`, `HeadlinePrice`, `BelarusPhone` in `Masters/Rules/` |
| III. One contract, generated types | Pass: `openapi.json` and `schema.ts` regenerated |
| IV. Module only in its folders, switch by `Enabled` | Pass: `Masters` registered in `ModuleCatalog`, `modules.ts`, `tsconfig.base.json`, settings, migration; `Catalog` is always on by definition |
| V. Three layers, allowed folders | Pass |
| VI. Interaction only through Identity and Catalog contracts | Pass |
| VII. Public routes, states, mobile-first, tokens | Pass: home public; masters list and page declared public by the module |
| VIII. Tenancy and ownership | Pass: master data is public, owned by user id; registration creates a personal tenant |
| IX. Privacy | Pass: only the master's own phone is public; no client data exposed |
| X. Help | Pass: `ru/` replaces `en/` |
| Package added only through a spec | Pass: `@fontsource-variable/manrope` recorded here |
| No tests, no comments, one type per file | Pass |

Re-check after Phase 1: no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-marketplace-foundation/
├── plan.md
├── research.md
├── data-model.md
├── contracts/            catalog.md, masters.md, identity.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
api/
├── Nails.Api/
│   ├── Host/Extensions/ControllerExtensions.cs, ProblemResults.cs, RateLimitingExtensions.cs   Russian titles
│   ├── Host/Middleware/AntiforgeryMiddleware.cs, ExceptionMiddleware.cs                      Russian titles
│   ├── Host/Validation/RussianValidationMetadataProvider.cs, ValidationMessages.cs           new
│   ├── Modules/Catalog/Controllers/CatalogController.cs                                      new
│   ├── Modules/Masters/Controllers/MastersController.cs, MyMasterController.cs, MyOffersController.cs   new
│   ├── Modules/Help/Content/ru/{site.json, articles/core.json, articles/catalog.json, articles/masters.json}   en/ removed
│   └── appsettings.{Development,Docker,Production}.json
├── Nails.Application/
│   ├── Common/Exceptions/ErrorCodes.cs                                                       new codes
│   ├── Common/Modules/ModuleCatalog.cs                                                       Catalog, Masters
│   ├── Modules/Identity/...                                                                  Russian messages, RussianIdentityErrorDescriber, register without organization
│   ├── Modules/Catalog/{CatalogModule.cs, Contracts/, Services/, Responses/}                 new
│   └── Modules/Masters/{MastersModule.cs, Contracts/, Services/, Requests/, Responses/, Options/, Rules/}   new
└── Nails.Infrastructure/
    ├── Modules/Catalog/{Entities/, Configurations/, Contracts/, Repositories/}               new
    ├── Modules/Masters/{Entities/, Configurations/, Contracts/, Repositories/, Models/}      new
    └── Persistence/DatabaseSchemas.cs, Migrations/<timestamp>_AddCatalogAndMasters.cs
client/
├── package.json                                       @fontsource-variable/manrope
├── apps/web/{project.json, src/index.html, src/styles.scss, src/modules.ts, public/favicon.svg}
└── libs/
    ├── shared/common/util/                             new: nbsp, format-price, format-phone, plural
    ├── shared/core/data-access/                        catalog store, Russian problem titles
    ├── shared/masters/data-access/                     new: paths, api, resources
    ├── web/common/ui/                                  Russian states, price pipe, phone pipe, notifier, paginator intl
    ├── web/core/feature/                               Russian pages, locale, public home, responsive layout
    └── web/masters/feature/                            new: manifest, masters page, master page, cabinet page, offer form
```

**Module switch**: `Modules:Masters:Enabled = true` exposes the four masters controllers, the «Мастера» and «Кабинет мастера» navigation, the routes `/masters`, `/masters/:id`, `/master` and `masters.json` help. With `false` the controllers are dropped, `/api/modules` omits `masters`, the client never downloads its code, the help hides its articles, the home page shows only the remaining areas and the rest works. `Catalog` and `Identity` are always on.

**Help**: `en/` removed; `ru/site.json`, `ru/articles/core.json` (create-an-account, sign-in, reset-your-password, sign-out, client-and-master), `ru/articles/catalog.json` (catalog), `ru/articles/masters.json` (find-a-master, master-page, become-a-master, price-list).

**Structure Decision**: as listed above. Catalog client code lives in `core` because Catalog is always on, like Identity.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |

**Silenced rules**: `client/knip.json` ignores the dependency `@fontsource-variable/manrope`, because it is referenced only from the `styles` array of `apps/web/project.json`, which knip does not read.

**Changes during implementation**: the OpenAPI schema now uses the same JSON options as the API, so enums are typed as their camelCase strings (`PriceKind`); `ProblemTitles` collects the framework error titles; the toast, the Russian paginator labels and the price, phone and duration pipes live in the masters feature because only it uses them (keeping the initial bundle below the template's); the home page is lazy-loaded; the mobile navigation is a disclosure button instead of a menu overlay; `POST` endpoints of Masters return 200 with the created resource.
