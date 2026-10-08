# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Modules touched**: [core | identity | help | <module>]

**Platforms**: [web | mobile; logic that is not tied to a platform goes to `client/libs/shared`]

**Module interaction**: [Identity contracts used, or N/A]

**Stack**: .NET 10 (ASP.NET Core controllers, EF Core 10 on PostgreSQL), Angular 22 (Nx, signals, Angular Material)

**Storage**: [module schema, tables, indexes, concurrency, or N/A]

**Contracts**: [endpoints under `/api/<module>/` with request and response shapes, or N/A]

**Settings**: [new `Modules:<Module>` keys and their values per environment, or N/A]

**Constraints**: [feature-specific limits, or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # /speckit-plan
├── research.md          # /speckit-plan, Phase 0
├── data-model.md        # /speckit-plan, Phase 1
├── contracts/           # /speckit-plan, Phase 1 (drafts; the authoritative contract is api/Nails.Api/openapi.json)
├── design/              # screen mockups of this spec
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
api/
├── Nails.Api/Modules/<Module>/                    Controllers/, Content/
├── Nails.Application/Modules/<Module>/            <Module>Module.cs, Contracts/, Services/, Requests/, Responses/, Options/
└── Nails.Infrastructure/
    ├── Modules/<Module>/                            Entities/, Configurations/, Contracts/, Repositories/, Models/, Options/
    └── Persistence/Migrations/                      the migration
client/
├── apps/web/src/modules.ts                          module list
└── libs/
    ├── shared/<module>/data-access/                 HTTP, state, resources
    └── web/<module>/feature/                        pages, routes, manifest
```

**Module switch**: [what the module exposes when `Modules:<Module>:Enabled` is true, and confirmation that the rest works when it is false, or N/A for the core]

**Help**: [articles added, changed or removed, or "no user-visible change"]

**Structure Decision**: [List the real files and folders this feature adds or changes]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
