---

description: "Task list for the marketplace foundation"
---

# Tasks: Marketplace foundation for «Мастера рядом»

**Input**: Design documents from `/specs/001-core-marketplace-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: None. This project writes no tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 to US4)

## Phase 1: Setup

- [X] T001 Initialize the template as `Nails` without the Notes example (`init.ps1 -Name Nails -WithoutExample`), finish the client API types and remove `init.ps1`
- [X] T002 Ratify the constitution 4.0.0 in `.specify/memory/constitution.md` and align `AGENTS.md`
- [X] T003 Add `@fontsource-variable/manrope` with an exact version to `client/package.json` and install it

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 [P] Create the `shared-common-util` library in `client/libs/shared/common/util/` (tags `scope:shared,type:util,name:common`) with `nbsp.ts`, `format-price.ts`, `format-phone.ts`, `plural.ts` and register `@nails/shared/common/util` in `client/tsconfig.base.json`
- [X] T005 [P] Add the `price`, `phone` and `duration` pipes, a `Notifier` toast service and a Russian `MatPaginatorIntl` (placed in `client/libs/web/masters/feature/src/lib/{format,feedback}/`, their only user)
- [X] T006 Add design tokens, the rose Material theme and Manrope in `client/apps/web/src/styles.scss` and `client/apps/web/project.json`; set `lang="ru"`, the title and a new favicon in `client/apps/web/src/index.html` and `client/apps/web/public/favicon.svg`
- [X] T007 Register the `ru-BY` locale data and provide `LOCALE_ID` in `client/libs/web/core/feature/src/lib/bootstrap/provide-nails.ts`
- [X] T008 [P] Add `Catalog` and `Masters` to `api/Nails.Infrastructure/Persistence/DatabaseSchemas.cs` and the new error codes to `api/Nails.Application/Common/Exceptions/ErrorCodes.cs`

**Checkpoint**: Foundation ready

---

## Phase 3: User Story 1 - Russian UI and personal accounts (Priority: P1)

**Goal**: everything a user sees is Russian; registration without organizations.

- [X] T009 [P] [US1] Add `RussianValidationMetadataProvider` and `ValidationMessages` in `api/Nails.Api/Host/Validation/` and register them in `api/Nails.Api/Host/Extensions/ControllerExtensions.cs` with a Russian invalid-model title and a fallback for empty messages
- [X] T010 [P] [US1] Translate the fixed titles in `api/Nails.Api/Host/Extensions/ProblemResults.cs` (by status), `RateLimitingExtensions.cs`, `api/Nails.Api/Host/Middleware/AntiforgeryMiddleware.cs` and `ExceptionMiddleware.cs`
- [X] T011 [US1] Add `RussianIdentityErrorDescriber` in `api/Nails.Application/Modules/Identity/Services/` and register it in `IdentityModule.cs`; translate `IdentityErrors.cs`, `SessionService.cs`, `AccountService.cs` and the emails in `IdentityEmails.cs`
- [X] T012 [US1] Remove `OrganizationName` from `api/Nails.Application/Modules/Identity/Requests/RegisterRequest.cs` and create the personal tenant from the display name in `AccountService.cs`; reduce `MeResponse` to id, email and display name and remove `ITenantRepository.FindNameAsync`
- [X] T013 [P] [US1] Translate `toProblem` titles in `client/libs/shared/core/data-access/src/lib/api/problem.ts`
- [X] T014 [P] [US1] Translate the empty, error and loading states in `client/libs/web/common/ui/src/lib/states/` and `problem-alert.ts`
- [X] T015 [US1] Translate the identity pages in `client/libs/web/core/feature/src/lib/identity/`, drop the organization field from `register-page.ts`, translate route titles in `routes.ts`, the not-found and startup pages
- [X] T016 [US1] Make the layout responsive with a menu below 768 px and the brand «Мастера рядом» in `client/libs/web/core/feature/src/lib/layout/app-layout.ts` and `account-menu.ts`; add an optional `description` to `NavigationItem` in `module-manifest.ts`
- [X] T017 [US1] Make the home page public with the hero and the cards of the enabled areas in `client/libs/web/core/feature/src/lib/home/home-page.ts` and `routes.ts`
- [X] T018 [US1] Replace `api/Nails.Api/Modules/Help/Content/en/` with `ru/site.json` and `ru/articles/core.json`; set the company name in `Content/company.json`; set `Modules:Help:DefaultLanguage` to `ru` and `Email:FromName` in the three settings files; translate the help pages in `client/libs/web/help/feature/src/lib/`

**Checkpoint**: User Story 1 is complete

---

## Phase 4: User Story 2 - Catalog (Priority: P1)

**Goal**: categories, services and cities readable by everyone.

- [X] T019 [P] [US2] Add `Category`, `CatalogService` and `City` entities in `api/Nails.Infrastructure/Modules/Catalog/Entities/`
- [X] T020 [US2] Add configurations with seed data in `api/Nails.Infrastructure/Modules/Catalog/Configurations/`
- [X] T021 [US2] Add `ICatalogRepository` and `CatalogRepository` in `api/Nails.Infrastructure/Modules/Catalog/{Contracts,Repositories}/`
- [X] T022 [US2] Add `CatalogResponse`, `CategoryResponse`, `CatalogServiceResponse`, `CityResponse` in `api/Nails.Application/Modules/Catalog/Responses/`; `ICatalogService` and `CatalogDirectory` in `Contracts/`; `CatalogService` in `Services/`; `CatalogModule.cs` (always on); register it in `ModuleCatalog.cs`
- [X] T023 [US2] Add `CatalogController` (`GET /api/catalog`, anonymous) in `api/Nails.Api/Modules/Catalog/Controllers/`
- [X] T024 [US2] Add `CatalogStore` in `client/libs/shared/core/data-access/src/lib/catalog/` and show the catalog on the home page
- [X] T025 [US2] Add `ru/articles/catalog.json` to the help

**Checkpoint**: User Story 2 is complete

---

## Phase 5: User Story 3 - Master profile and price list (Priority: P1)

**Goal**: a signed-in user creates a master profile and manages the price list.

- [X] T026 [P] [US3] Add `MasterProfile`, `Offer` and `PriceKind` in `api/Nails.Infrastructure/Modules/Masters/Entities/` and their configurations in `Configurations/`
- [X] T027 [US3] Add `IMasterRepository`, `IOfferRepository`, the `MasterSearch` model and the repositories in `api/Nails.Infrastructure/Modules/Masters/{Contracts,Models,Repositories}/`
- [X] T028 [P] [US3] Add the rules `OfferPrice`, `HeadlinePrice`, `Price` and `BelarusPhone` in `api/Nails.Application/Modules/Masters/Rules/`
- [X] T029 [US3] Add `MastersOptions`, requests and responses in `api/Nails.Application/Modules/Masters/{Options,Requests,Responses}/`
- [X] T030 [US3] Add `IMyMasterService` and `MyMasterService` (profile and offers, ownership, master level) in `api/Nails.Application/Modules/Masters/{Contracts,Services}/` and `MastersModule.cs`; register it in `ModuleCatalog.cs`
- [X] T031 [US3] Add `MyMasterController` and `MyOffersController` in `api/Nails.Api/Modules/Masters/Controllers/`
- [X] T032 [US3] Add `Modules:Masters` to `appsettings.{Development,Docker,Production}.json`
- [X] T033 [US3] Create `shared-masters-data-access` in `client/libs/shared/masters/data-access/` with paths, `MastersApi` and resources; register the path alias
- [X] T034 [US3] Create `web-masters-feature` in `client/libs/web/masters/feature/` with the manifest and the cabinet page (`master-cabinet-page.ts`, `master-profile-form.ts`, `offer-form.ts`); register it in `client/apps/web/src/modules.ts` and `tsconfig.base.json`
- [X] T035 [US3] Add `ru/articles/masters.json` with become-a-master and price-list

**Checkpoint**: User Story 3 is complete

---

## Phase 6: User Story 4 - Find masters and compare prices (Priority: P2)

**Goal**: public search and master page.

- [X] T036 [US4] Add `IMasterSearchService` and `MasterSearchService` with search, headline prices and the public page in `api/Nails.Application/Modules/Masters/{Contracts,Services}/`
- [X] T037 [US4] Add `MastersController` (`GET /api/masters`, `GET /api/masters/{id}`, anonymous) in `api/Nails.Api/Modules/Masters/Controllers/`
- [X] T038 [US4] Add `masters-page.ts` (filters, list, plural count, paginator) and `master-page.ts` (public profile, price list by category) in `client/libs/web/masters/feature/src/lib/` as public routes
- [X] T039 [US4] Add find-a-master and master-page to `ru/articles/masters.json`

**Checkpoint**: User Story 4 is complete

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T040 Add the migration `AddCatalogAndMasters` and check `dotnet ef migrations has-pending-model-changes`
- [X] T041 Build `api/`, commit `openapi.json`, regenerate `schema.ts` in `client/`
- [X] T042 Update `README.md` and `client/AGENTS.md` to the current state (product, modules, Catalog in core, Russian text, shared formatters)
- [X] T043 Check the changed code for duplication, comments, hardcoded values and secrets
- [X] T044 Run `npx nx run-many -t lint typecheck knip format-check build`, `dotnet build`, the vulnerability checks, and run the app end to end, also with `Modules:Masters:Enabled=false`

---

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish
- US3 needs the Catalog contracts of US2; US4 needs the entities and rules of US3.
- [P] tasks touch different files and can run together inside their phase.

---

## Phase 8: Scope change (2026-10-08)

The tasks of Phases 4 to 6 (T019–T039) were built and then removed at the user's request; see the scope change in `spec.md`.

- [X] T045 Revert the local database to `Initial` and remove the migration `AddCatalogAndMasters`
- [X] T046 Remove `Catalog` and `Masters` from `api/` (modules, controllers, `ModuleCatalog.cs`, `DatabaseSchemas.cs`, error codes, exception overloads, settings, help articles `catalog.json` and `masters.json`)
- [X] T047 Remove `libs/shared/masters`, `libs/web/masters`, `CatalogStore`, the unused formatters and the catalog section of the home page from `client/`; regenerate `openapi.json` and `schema.ts`
- [X] T048 Update `README.md`, `client/AGENTS.md`, `spec.md`, `plan.md`, `research.md`, `data-model.md` and `contracts/` to the bare foundation; run every check
