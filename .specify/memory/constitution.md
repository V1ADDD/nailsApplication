# Starter Constitution

These rules apply to every spec, every change and every contributor, human or agent. Layout, modules and commands are described in `README.md`; where `README.md` and this document disagree, this document wins and `README.md` is fixed in the same change.

The key words MUST, MUST NOT, SHOULD and MAY are used as in RFC 2119. Anything not marked SHOULD or MAY is a MUST. An exception exists only where this document names it.

## Definitions

- **Core**: the `Common/` folder of each api project, `Host/` in `Starter.Api`, `Persistence`, `Email` and `Options` in `Starter.Infrastructure`, the `Identity` and `Help` modules, `client/libs/<scope>/core` and `client/libs/<scope>/common`.
- **Module**: a named feature area whose code lives only in `Modules/<Module>/` of the api projects and in `client/libs/<scope>/<module>/`. The modules are the entries of `ModuleCatalog`.
- **Scope**: `shared`, `web` or `mobile` in `client/libs/`.
- **Tenant**: the organization that owns data; every user belongs to one tenant.
- **User-visible change**: any change to what a user can see or do: a screen, route, control, label, setting, message (errors and empty states too), limit, timing, permission rule or edge case.
- **Spec**: a folder `specs/NNN-<module>-<short-name>/` with at least `spec.md` and `plan.md`.

## Principles

### I. `api/` and `client/` are independent

- The backend MUST live only in `api/`, the clients only in `client/`. They are built, containerized and deployed separately and MUST communicate only over HTTP under `/api/`.
- The contract is `api/Starter.Api/openapi.json`, written by the API build. The client MUST use types generated from it and MUST NOT hand-write request or response types; a contract change MUST regenerate both files in the same change.
- Stack: .NET 10 and EF Core 10 on PostgreSQL; Angular 22 with Nx and Angular Material. Changing a framework, the database or the UI library requires a spec.

### II. Core and pluggable modules

- A module's code MUST NOT exist outside its module folders.
- Adding a module MUST touch nothing else except one line in `ModuleCatalog`, one line in each app's module list, its paths in `client/tsconfig.base.json`, a `Modules:<Module>` section in every `appsettings.{Environment}.json`, and its migration.
- Every module except `Identity` MUST be switched by `Modules:<Module>:Enabled` alone. A disabled module MUST expose nothing (services, endpoints, navigation, routes, help articles), MUST keep its tables, and MUST NOT break the rest.
- Code shared by several modules MUST live in the core; code used by one module MUST NOT.

### III. The backend has three layers

- `api/` MUST contain exactly `Starter.Api → Starter.Application → Starter.Infrastructure`. Another project requires a spec.
- `Starter.Api` is the only host and is thin: one sealed `[ApiController]` per resource in `Modules/<Module>/Controllers/`; each action binds the request, calls one service and returns its response. The route prefix `/api/<module>` comes from the namespace, so a controller declares only its own segment. Outside `Modules/` it MAY contain only `Host/` and `Program.cs`. It MUST NOT access the database.
- `Starter.Application/Modules/<Module>/` MAY contain only `<Module>Module.cs` (the single place that registers the module's options and services of both layers), `Contracts/`, `Services/`, `Requests/`, `Responses/`, `Options/`, and `Events/` or `ExtensionPoints/` once the module talks to others.
- `Starter.Infrastructure/Modules/<Module>/` MAY contain only `Entities/`, `Configurations/`, `Contracts/`, `Repositories/`, `Models/`, `Options/` and `Integrations/<System>/`.
- `Starter.Infrastructure/Persistence` holds the single `AppDbContext`, its interceptors and the migrations: one database, one schema per module, configurations picked up from the assembly.
- Every external system MUST sit behind an interface in `Contracts/`.

### IV. Modules interact only through Identity

- From another module's folders, a module MAY use only `Starter.Application.Modules.Identity.Contracts`; on the client, only another module's `contracts` library.
- Shared tables, foreign keys, navigation properties and queries across module schemas MUST NOT exist; another module's data is referenced by id only.
- Events, extension points or any other way for modules to interact MUST be introduced by a spec.

### V. One client workspace, several platforms

- `client/` is one Nx workspace: `apps/<platform>` (today `web`) and `libs/<scope>/<module>/<type>`.
- `shared` MUST depend only on `shared`; `web` and `mobile` only on themselves and `shared`. The tags `scope:*`, `type:*` and `name:*` MUST be enforced by `@nx/enforce-module-boundaries`.
- `libs/shared` MUST NOT use DOM globals, Angular Material, CDK, the router or forms. Screens live only in `libs/web` and `libs/mobile`.
- Each module exports one manifest per platform; the app loads only the manifests of the modules `GET /api/modules` reports as enabled, with dynamic imports.
- Public routes are exactly sign-in, registration, email confirmation, the password pages and those a module declares public; every other route MUST require a session.
- A screen is accepted only with its empty, loading and failure states.

### VI. Tenants and permissions

- `TenantId` MUST be on every tenant-owned table, its indexes and every query, through `ITenantEntity`, the named query filter and `TenantInterceptor`.
- A permission is checked in `Starter.Application` from the user's role, never in the client alone.

### VII. Security

- Browser sessions are ASP.NET Core Identity cookies (`HttpOnly`, `SameSite=Strict`, `Secure` in production); every state-changing request MUST carry a valid antiforgery token; the browser talks to the API through one origin.
- Anonymous Identity endpoints MUST be rate-limited. Errors MUST be problem details with a stable `code`; internal messages MUST NOT reach the client.
- Secrets MUST NOT be committed; options validation MUST stop the API when a required value is missing.
- No free text a user typed goes into logs, URLs or browser storage.

### VIII. The help center grows with the product

- Help content lives only in `api/Starter.Api/Modules/Help/Content/`. Every user-visible change MUST update it in the same change, in every language folder; articles of an optional module live in that module's file.

## Code rules

- **English only**, except translations in their own language folders.
- **No tests:** no test projects, no test files, no test tasks.
- **No comments in code:** no `//`, `///`, `/* */`, `<!-- -->`, and no `#` in scripts.
- **One type per file in `api/`.**
- **No hardcoded values:** environment-dependent values come from validated options; constants only for values that never differ between environments.
- **No duplication** and **no dead code.**
- Rules are silenced only in `api/.editorconfig`, `client/eslint.config.mjs` or `client/knip.json`, with the reason in the spec's `plan.md`.
- `appsettings.json` contains only `Serilog` and `AllowedHosts`; every other section is complete in every `appsettings.{Development,Docker,Production}.json`.
- .NET 10, nullable, all analyzers, warnings as errors; NuGet versions only in `api/Directory.Packages.props` with lock files; npm versions exact.
- Migrations are additive.

## Agent rules

- Architectural changes MUST go through a spec: a project, module, scope, platform, top-level folder, external system, public route, package or way for modules to interact.
- An abstraction MAY be introduced only when it has two real uses or isolates an external system.
- Before writing anything new, search the module and the core for something to reuse; `Notes` shows the shape of a module.
- **Definition of done** is the list in `AGENTS.md`. The final report MUST name the help articles added, changed or removed, or state that the change has no user-visible effect.

## Process

- One spec is one folder `specs/NNN-<module>-<short-name>/`, English, lowercase, hyphenated, starting with the main module. It lists the modules and platforms it touches and MUST NOT contain Acceptance Scenarios, Success Criteria or Independent Test sections.
- Mockups live in the spec's `design/`; reference designs live once in `specs/_design-references/`.
- A closed spec folder MUST NOT be rewritten; `README.md` describes the current state.

## Governance

- This constitution overrides the spec-kit templates and team habits. A plan MAY violate a principle only with a justification in its Complexity Tracking section.
- Amending the constitution is a separate pull request that changes this file and its version.

**Version**: 3.1.0 | **Ratified**: TODO(RATIFICATION_DATE): adopt with `/speckit-constitution` | **Last Amended**: 2026-10-08
