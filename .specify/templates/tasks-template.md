---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: None. This project writes no tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Infrastructure: `api/Nails.Infrastructure/Modules/<Module>/{Entities,Configurations,Contracts,Repositories,Models,Options}/`, migrations `api/Nails.Infrastructure/Persistence/Migrations/`
- Application: `api/Nails.Application/Modules/<Module>/{Contracts,Services,Requests,Responses,Options}/`, registration `<Module>Module.cs`, the catalog `api/Nails.Application/Common/Modules/ModuleCatalog.cs`
- API: `api/Nails.Api/Modules/<Module>/Controllers/`, settings `api/Nails.Api/appsettings.{Development,Docker,Production}.json`, help `api/Nails.Api/Modules/Help/Content/<language>/articles/<module>.json`
- Client: `client/libs/shared/<module>/data-access/`, `client/libs/web/<module>/feature/`, module list `client/apps/web/src/modules.ts`, core `client/libs/{shared,web}/{core,common}/`

## Phase 1: Setup

- [ ] T001 [Setup task with file path]

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T002 [Task that every user story depends on, with file path]

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1)

**Goal**: [Brief description of what this story delivers]

- [ ] T003 [US1] [Implementation task with file path]

**Checkpoint**: User Story 1 is complete

---

[Add one phase per user story in priority order, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] TXXX Add the migration and check `dotnet ef migrations has-pending-model-changes`
- [ ] TXXX Build `api/`, commit `openapi.json`, regenerate `schema.ts` in `client/`
- [ ] TXXX Update the help articles for every user-visible change, or record that there is none
- [ ] TXXX Check the changed code for duplication, comments, hardcoded values and secrets
- [ ] TXXX Check module boundaries and run the app with every switchable module touched by this spec disabled

---

## Dependencies

- Setup → Foundational → user stories in priority order → Polish
- [Story-to-story dependencies, if any]
