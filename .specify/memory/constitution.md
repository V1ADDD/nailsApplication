<!--
Sync Impact Report
Version: 4.2.0 → 4.3.0 (MINOR)
Reason: spec 004 adds the Development demo world. V allows a `Seed/` folder in `Nails.Application/Modules/<Module>/`
whose `IDemoSeeder` writes the module's own tables through `AppDbContext` (the seed reuses the module's rules, so it
cannot live in Infrastructure) and states that demo seeding never runs in Production.
Changed: V. Added, removed principles: none.
Templates: no change needed.
Follow-up: none.

Previous report
Version: 4.1.0 → 4.2.0 (MINOR)
Reason: spec 003 replaces email-and-password accounts with phone sign-in by SMS code and drops the placeholder home page. VII lists the public routes
without registration, email confirmation and the password pages; IX states how accounts are identified and signed in;
X requires extending the help and retaking its pictures.
Changed: VII, IX, X. Added, removed principles: none.
Templates: no change needed.
Follow-up: a production SMS gateway (spec 012).

Previous report
Version: 4.0.0 → 4.1.0 (MINOR)
Reason: spec 002 names where the design tokens live and adds the web app frame. Principle VII now points to
`apps/web/src/styles/_tokens.scss` (the `--app-*` tokens, Material themed from them, light only) instead of
`apps/web/src/styles.scss`, and states that the frame (tab bar below 1024 px, top bar from 1024 px) is fed by
module manifests.
Changed: VII. Added, removed principles: none.
Templates: no change needed.
Follow-up: none.

Previous report
Version: 3.1.0 → 4.0.0 (MAJOR)
Reason: ratified for «Мастера рядом», a beauty-services marketplace for Belarus. The UI language rule is
redefined (Russian user-facing text instead of English), the product principles are added (locale, time, prices,
roles, privacy, server-owned rules), Catalog joins Identity as an always-on module whose contracts other modules
may use, and marketplace data that every visitor sees is defined as not tenant-owned.
Added principles: I. Belarus market, Russian UI; II. Server owns the rules; X. Two roles, one account.
Changed: III (Rules/ folder), V (public home page, Russian states), VI (personal tenants, public data),
VII (privacy of clients), Code rules (language).
Kept from the scenario only as product rules; the stack stays the template's (.NET 10, Angular 22, Nx,
Angular Material themed with design tokens and Manrope, cookie sessions, no tests).
Templates: plan-template.md, spec-template.md, tasks-template.md: no change needed (paths and gates still match).
Follow-up: none.
-->
# Nails Constitution

Nails is «Мастера рядом», a web marketplace where beauty masters in Belarus sell their services: nails, brows, lashes, cosmetology, makeup and depilation. Clients find masters, compare exact prices, book free time and chat with the master. Every account can act as a client and as a master.

These rules apply to every spec, every change and every contributor, human or agent. Layout, modules and commands are described in `README.md`; where `README.md` and this document disagree, this document wins and `README.md` is fixed in the same change.

The key words MUST, MUST NOT, SHOULD and MAY are used as in RFC 2119. Anything not marked SHOULD or MAY is a MUST. An exception exists only where this document names it.

## Definitions

- **Core**: the `Common/` folder of each api project, `Host/` in `Nails.Api`, `Persistence`, `Email` and `Options` in `Nails.Infrastructure`, the `Identity`, `Catalog` and `Help` modules, `client/libs/<scope>/core` and `client/libs/<scope>/common`.
- **Module**: a named feature area whose code lives only in `Modules/<Module>/` of the api projects and in `client/libs/<scope>/<module>/`. The modules are the entries of `ModuleCatalog`.
- **Always-on module**: `Identity` (accounts and sessions) and `Catalog` (the categories, services and cities every other module refers to). Their client code lives in `core`.
- **Scope**: `shared`, `web` or `mobile` in `client/libs/`.
- **Tenant**: the owner of private data. Every account gets its own personal tenant when it is created.
- **Client** and **master**: the two roles of one account. Every signed-in account is a client; an account with a master profile is also a master.
- **User-facing text**: every string a user can see or hear: labels, buttons, placeholders, page titles, empty, loading and error states, alt text and aria labels, toasts, emails, help content and the problem details the UI shows.
- **User-visible change**: any change to what a user can see or do: a screen, route, control, label, setting, message (errors and empty states too), limit, timing, permission rule or edge case.
- **Spec**: a folder `specs/NNN-<module>-<short-name>/` with at least `spec.md` and `plan.md`.

## Principles

### I. Belarus market, Russian UI (non-negotiable)

- User-facing text MUST be Russian, written directly in templates, server messages, emails and the help content in `Content/ru/`. There is no i18n framework. Code, identifiers, logs, configuration, specs and docs stay English.
- Locale `ru-BY`, currency BYN. The business time zone is `Europe/Minsk` (UTC+3, no daylight saving). Every instant is stored as UTC `timestamptz`; every "day", "today" and "week" is a Minsk date, computed on the server through one Minsk time helper. Time is shown in 24-hour format; weeks start on Monday.
- Prices are BYN stored as `numeric(10,2)`, never minor units. There are exactly three price kinds: exact («45 р»), from («от 30 р») and free («Бесплатно»); never ranges, never «по договорённости». The letter is «р», never «Br». Prices are shown only through the shared price formatter.
- Russian plurals come from `Intl.PluralRules('ru')` through the shared plural helper (1 отзыв, 2 отзыва, 5 отзывов). Non-breaking spaces come only from the shared `NBSP` constant. Phones are stored as `+375XXXXXXXXX` and shown as `+375 (29) 123-45-67` through the shared phone formatter.

### II. Server owns the rules

- Business rules (search matching, distance, headline prices, slot generation, booking conflicts, deadlines, auto-confirm, forecasts and the like) MUST be pure functions in `Nails.Application/Modules/<Module>/Rules/`, with no I/O, no clock and no service lookups: time comes in as an argument from `TimeProvider`.
- The server enforces every rule and every authorization check. The client MAY preview a rule for UX; the server's answer always wins, and a rule MUST NOT be re-implemented in a component.

### III. `api/` and `client/` are independent

- The backend MUST live only in `api/`, the clients only in `client/`. They are built, containerized and deployed separately and MUST communicate only over HTTP under `/api/`.
- The contract is `api/Nails.Api/openapi.json`, written by the API build. The client MUST use types generated from it and MUST NOT hand-write request or response types; a contract change MUST regenerate both files in the same change.
- REST under `/api`, JSON in camelCase, ids are UUID v7 except catalog ids, which are stable slugs such as `manicure-gel`. Errors are problem details with a stable `code` and a Russian `title` the UI may show; field errors are Russian. 400 validation, 401 not signed in, 403 not allowed, 404 not found, 409 conflict with the current state.
- Stack: .NET 10 and EF Core 10 on PostgreSQL; Angular 22 with Nx and Angular Material themed with the design tokens and the Manrope font. Changing a framework, the database or the UI library requires a spec.

### IV. Core and pluggable modules

- A module's code MUST NOT exist outside its module folders.
- Adding a module MUST touch nothing else except one line in `ModuleCatalog`, one line in each app's module list, its paths in `client/tsconfig.base.json`, a `Modules:<Module>` section in every `appsettings.{Environment}.json`, and its migration.
- Every module except `Identity` and `Catalog` MUST be switched by `Modules:<Module>:Enabled` alone. A disabled module MUST expose nothing (services, endpoints, navigation, routes, help articles), MUST keep its tables, and MUST NOT break the rest.
- Code shared by several modules MUST live in the core; code used by one module MUST NOT.

### V. The backend has three layers

- `api/` MUST contain exactly `Nails.Api → Nails.Application → Nails.Infrastructure`. Another project requires a spec.
- `Nails.Api` is the only host and is thin: one sealed `[ApiController]` per resource in `Modules/<Module>/Controllers/`; each action binds the request, calls one service and returns its response. The route prefix `/api/<module>` comes from the namespace, so a controller declares only its own segment. Outside `Modules/` it MAY contain only `Host/` and `Program.cs`. It MUST NOT access the database.
- `Nails.Application/Modules/<Module>/` MAY contain only `<Module>Module.cs` (the single place that registers the module's options and services of both layers), `Contracts/`, `Services/`, `Requests/`, `Responses/`, `Options/`, `Rules/`, `Seed/` (an `IDemoSeeder` that writes only the module's own tables with Development demo data; seeding MUST NOT run in Production), and `Events/` or `ExtensionPoints/` once the module talks to others.
- `Nails.Infrastructure/Modules/<Module>/` MAY contain only `Entities/`, `Configurations/`, `Contracts/`, `Repositories/`, `Models/`, `Options/` and `Integrations/<System>/`.
- `Nails.Infrastructure/Persistence` holds the single `AppDbContext`, its interceptors and the migrations: one database, one schema per module, configurations picked up from the assembly.
- Every external system MUST sit behind an interface in `Contracts/`.

### VI. Modules interact only through the always-on modules

- From another module's folders, a module MAY use only `Nails.Application.Modules.Identity.Contracts` and `Nails.Application.Modules.Catalog.Contracts`; on the client, only `core`, `common` and another module's `contracts` library.
- Shared tables, foreign keys, navigation properties and queries across module schemas MUST NOT exist; another module's data is referenced by id or catalog slug only.
- Events, extension points or any other way for modules to interact MUST be introduced by a spec.

### VII. One client workspace, several platforms

- `client/` is one Nx workspace: `apps/<platform>` (today `web`) and `libs/<scope>/<module>/<type>`.
- `shared` MUST depend only on `shared`; `web` and `mobile` only on themselves and `shared`. The tags `scope:*`, `type:*` and `name:*` MUST be enforced by `@nx/enforce-module-boundaries`.
- `libs/shared` MUST NOT use DOM globals, Angular Material, CDK, the router or forms. Screens live only in `libs/web` and `libs/mobile`.
- Each module exports one manifest per platform; the app loads only the manifests of the modules `GET /api/modules` reports as enabled, with dynamic imports.
- Public routes are exactly sign-in and those a module declares public; every other route MUST require a session. The root path opens the profile (sign-in for a guest) until the map replaces it.
- Mobile-first: layouts work from 360 px wide without horizontal overflow, with the breakpoints 480, 768, 1024 and 1280 px. Colors, spacing, radii, type, shadows and motion come from the `--app-*` design tokens in `apps/web/src/styles/_tokens.scss`, and Angular Material is themed from them; the interface is light only; components MUST NOT use raw hex colors.
- The web app frame is a bottom tab bar below 1024 px and a top bar from 1024 px. Modules add tabs, account links and actions to it only through their manifest.
- A screen is accepted only with its empty, loading and failure states; the failure state offers «Повторить». Every change a user makes shows a success toast or an error, and its button is disabled while it runs. Controls are labelled, focus is visible, contrast meets WCAG AA and reduced motion is respected.

### VIII. Tenants, ownership and permissions

- `TenantId` MUST be on every tenant-owned (private) table, its indexes and every query, through `ITenantEntity`, the named query filter and `TenantInterceptor`.
- Marketplace data that every visitor may see (the catalog, master profiles, price lists) is not tenant-owned: it carries the owner's user id, and every change checks that the signed-in user owns it.
- Every endpoint declares one of three levels: anonymous (`[AllowAnonymous]`), signed in (the default), or has a master profile (checked by the module's service). A permission is checked in `Nails.Application`, never in the client alone.

### IX. Security and privacy

- Accounts are identified by a Belarusian phone. Sign-in is a one-time SMS code; a phone without an account gets one at its first sign-in, after the person gives a name. There are no passwords and no separate registration. Code attempts, lifetime and resend interval are limited.
- Browser sessions are ASP.NET Core Identity cookies (`HttpOnly`, `SameSite=Strict`, `Secure` in production); every state-changing request MUST carry a valid antiforgery token; the browser talks to the API through one origin.
- Anonymous Identity endpoints MUST be rate-limited. Internal messages MUST NOT reach the client.
- Clients never see other clients' personal data. Masters see a client's phone only when that client booked with them. Uploaded files are validated by type and size.
- Secrets MUST NOT be committed; options validation MUST stop the API when a required value is missing.
- No free text a user typed goes into logs, URLs or browser storage.

### X. The help center grows with the product

- Help content lives only in `api/Nails.Api/Modules/Help/Content/`, in Russian in `ru/`. Every user-visible change MUST update it in the same change; articles of an optional module live in that module's file. Every user-visible change MUST also extend it: new screens and flows get articles, new messages and edge cases are added, and pictures of changed screens are retaken.

## Code rules

- **Language**: English for code, identifiers, logs, configuration, specs, docs and commit messages; Russian for user-facing text.
- **No tests:** no test projects, no test files, no test tasks.
- **No comments in code:** no `//`, `///`, `/* */`, `<!-- -->`, and no `#` in scripts.
- **One type per file in `api/`.**
- **No hardcoded values:** environment-dependent values come from validated options; constants only for values that never differ between environments.
- **No duplication** and **no dead code.**
- Rules are silenced only in `api/.editorconfig`, `client/eslint.config.mjs` or `client/knip.json`, with the reason in the spec's `plan.md`.
- `appsettings.json` contains only `Serilog` and `AllowedHosts`; every other section is complete in every `appsettings.{Development,Docker,Production}.json`.
- .NET 10, nullable, all analyzers, warnings as errors; NuGet versions only in `api/Directory.Packages.props` with lock files; npm versions exact.
- Migrations are additive.
- Simplicity: no CQRS buses, no event sourcing, no microservices, no mapping or mediator libraries.

## Agent rules

- Architectural changes MUST go through a spec: a project, module, scope, platform, top-level folder, external system, public route, package or way for modules to interact.
- An abstraction MAY be introduced only when it has two real uses or isolates an external system.
- Before writing anything new, search the module and the core for something to reuse.
- **Definition of done** is the list in `AGENTS.md`. The final report MUST name the help articles added, changed or removed, or state that the change has no user-visible effect.

## Process

- One spec is one folder `specs/NNN-<module>-<short-name>/`, English, lowercase, hyphenated, starting with the main module. It lists the modules and platforms it touches and MUST NOT contain Acceptance Scenarios, Success Criteria or Independent Test sections. Its plan states which principles it touches.
- Mockups live in the spec's `design/`; reference designs live once in `specs/_design-references/`.
- A closed spec folder MUST NOT be rewritten; `README.md` describes the current state.

## Governance

- This constitution overrides the spec-kit templates and team habits. A plan MAY violate a principle only with a justification in its Complexity Tracking section.
- Amending the constitution is a separate change that updates this file, its version and the reason in the Sync Impact Report.

**Version**: 4.3.0 | **Ratified**: 2026-10-08 | **Last Amended**: 2026-10-08
