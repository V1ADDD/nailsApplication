# Implementation Plan: Foundation for «Мастера рядом»

**Branch**: `001-core-marketplace-foundation` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-core-marketplace-foundation/spec.md`

## Summary

Turn the initialized template into the bare base of «Мастера рядом»: Russian user-facing text everywhere (UI, problem details, validation and Identity messages, emails, help), a `ru-BY` client, a Material theme with design tokens and Manrope, a public home page and personal accounts without organizations. No product module yet: the catalog, masters and everything after them come from the requests in `specs_requests/`.

## Technical Context

**Modules touched**: core, identity, help

**Platforms**: web

**Module interaction**: N/A

**Stack**: .NET 10 (ASP.NET Core controllers, EF Core 10 on PostgreSQL), Angular 22 (Nx, signals, Angular Material). New npm package: `@fontsource-variable/manrope` (self-hosted Manrope).

**Storage**: no new table. Registration creates a personal tenant per account.

**Contracts**: Identity only, see [contracts/identity.md](contracts/identity.md): `RegisterRequest` loses `organizationName`; `MeResponse` becomes `{ id, email, displayName }`; every problem title and field error is Russian.

**Settings**: `Modules:Help:DefaultLanguage` = `ru`. `Email:FromName` = `Мастера рядом`.

**Constraints**: layout from 360 px; no horizontal scrolling.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched: I (Russian UI, locale), III (contract, problem details), V (layers), VII (client, public home, states, tokens), VIII (personal tenants), IX (privacy), X (help in `ru/`).

| Gate | Status |
|---|---|
| I. Russian user-facing text, ru-BY | Pass: every string translated; `appLocale` in `libs/shared/common/util` |
| III. One contract, generated types | Pass: `openapi.json` and `schema.ts` regenerated |
| V. Three layers, allowed folders | Pass |
| VII. Public routes, states, mobile-first, tokens | Pass: home page public |
| VIII. Tenancy | Pass: registration creates a personal tenant |
| X. Help | Pass: `ru/` replaces `en/` |
| Package added only through a spec | Pass: `@fontsource-variable/manrope` recorded here |
| No tests, no comments, one type per file | Pass |

## Project Structure

### Documentation (this feature)

```text
specs/001-core-marketplace-foundation/
├── plan.md
├── research.md
├── data-model.md
├── contracts/identity.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
api/
├── Nails.Api/
│   ├── Host/Extensions/ControllerExtensions.cs, ProblemResults.cs, ProblemTitles.cs, RateLimitingExtensions.cs   Russian titles, shared JSON options
│   ├── Host/Middleware/AntiforgeryMiddleware.cs, ExceptionMiddleware.cs                                         Russian titles
│   ├── Host/Validation/RussianValidationMetadataProvider.cs, ValidationMessages.cs                              new
│   ├── Modules/Help/Content/{company.json, ru/site.json, ru/articles/core.json}                                 en/ removed
│   └── appsettings.{Development,Docker,Production}.json
└── Nails.Application/
    ├── Common/Exceptions/InvalidRequestException.cs                                                            DefaultTitle
    └── Modules/Identity/...                                                                                    Russian messages, RussianIdentityErrorDescriber, register without organization
client/
├── package.json                                       @fontsource-variable/manrope
├── apps/web/{project.json, src/index.html, src/styles.scss, public/favicon.svg}
└── libs/
    ├── shared/common/util/                             new: appLocale
    ├── shared/core/data-access/                        Russian problem titles
    ├── web/common/ui/                                  Russian states
    ├── web/core/feature/                               Russian pages, locale, public lazy home, responsive layout
    └── web/help/feature/                               Russian pages
```

**Module switch**: N/A for the core; `Help` keeps its switch.

**Help**: `en/` removed; `ru/site.json`, `ru/articles/core.json` (create-an-account, sign-in, reset-your-password, sign-out).

**Structure Decision**: as listed above.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |

**Silenced rules**: `client/knip.json` ignores the dependency `@fontsource-variable/manrope`, because it is referenced only from the `styles` array of `apps/web/project.json`, which knip does not read.

**Changes during implementation**:
- The OpenAPI schema uses the same JSON options as the API, so enums are typed as their camelCase strings.
- `ProblemTitles` collects the framework error titles.
- The home page is lazy-loaded and the mobile navigation is a disclosure button instead of a menu overlay, to keep the initial bundle below the template's.
- `client/package-lock.json` is refreshed in a Linux container so `npm ci` works in CI and in the web image.
- Scope change: the `Catalog` and `Masters` modules, their migration `AddCatalogAndMasters`, help articles, client libraries and formatters were built and then removed (see `spec.md`). The migration never left this branch, so it was removed instead of being undone by a new one.
