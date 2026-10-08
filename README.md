# Nails

Nails is «Мастера рядом», a web marketplace where beauty masters in Belarus (nails, brows, lashes, cosmetology, makeup, depilation) publish their services and exact prices, and clients find and compare them. Every account is a client and can also become a master.

It is a modular monolith: a core (personal accounts, sign-in, the app shell and the help center) plus feature modules that plug into it and can be switched off by configuration. The whole user interface, every message the API shows and the help are in Russian; code and docs are in English. Product rules (locale `ru-BY`, BYN prices, `Europe/Minsk`, Russian plurals, phones) are in the constitution, principle I.

## Stack

- `api/`: .NET 10, ASP.NET Core controllers, EF Core 10 on PostgreSQL, ASP.NET Core Identity, built-in OpenAPI and validation, Serilog. Three projects: `Nails.Api → Nails.Application → Nails.Infrastructure`.
- `client/`: an Nx workspace. Today one Angular 22 web app with Angular Material themed by design tokens and the self-hosted Manrope font; the layout is ready for mobile apps next to it.
- Docker: one image per side (`api/Dockerfile`, `client/Dockerfile`) and `docker-compose.yml` for the database, the mail catcher and the whole stack.

## Repository layout

```text
nails/
├── api/                                  the .NET solution; run dotnet here
│   ├── Nails.Api/                      the host: Host/ (Extensions, Middleware, Options, Security), Modules/<Module>/Controllers/, openapi.json
│   ├── Nails.Application/              Common/ (module catalog, exceptions, tenancy, paging), Modules/<Module>/
│   ├── Nails.Infrastructure/           Common/, Options/, Email/, Persistence/ (AppDbContext, interceptors, migrations), Modules/<Module>/
│   ├── Dockerfile
│   └── Nails.slnx  global.json  Directory.Build.props  Directory.Packages.props  .editorconfig  .config/dotnet-tools.json
├── client/                               the Nx workspace; run npx nx here
│   ├── apps/
│   │   └── web/                          the Angular web app (later: mobile/)
│   ├── libs/
│   │   ├── shared/<module>/              every platform: data-access (HTTP, state, API types), contracts, util
│   │   ├── web/<module>/                 the web app: feature (pages, routes, manifest), ui
│   │   └── mobile/<module>/              the mobile apps, when they come
│   ├── Dockerfile  nginx.conf.template   nginx serving the web app and proxying /api to the API
│   └── nx.json  tsconfig.base.json  eslint.config.mjs  knip.json
├── docker-compose.yml                    postgres and mailpit; with --profile app also api and web
├── specs/                                spec-kit specs; _design-references/ holds the reference designs
├── .specify/  .claude/skills/  .mcp.json spec-kit and agent setup
└── AGENTS.md  CLAUDE.md                  rules for coding agents; CLAUDE.md imports AGENTS.md
```

`api/` and `client/` are independent: they share only the HTTP contract, `api/Nails.Api/openapi.json`, which every API build writes and from which the client generates its types.

## Core and modules

| Module | Switch | API | Client |
|---|---|---|---|
| `Identity` | always on | users with a personal tenant each, cookie sessions; `/api/identity/*` | sign-in, registration, email confirmation, password reset, account menu (in `core`) |
| `Help` | `Modules:Help:Enabled` | Russian articles from JSON files in `Content/ru/`; `GET /api/help/content` | `/help`, `/help/:articleId` |

`GET /api/modules` returns the enabled modules; the client downloads only their code.

### Module layout

```text
api/Nails.Infrastructure/Modules/<Module>/   Entities/, Configurations/, Contracts/ (repository interfaces), Repositories/, Models/, Options/
api/Nails.Application/Modules/<Module>/      <Module>Module.cs, Contracts/ (service interfaces), Services/, Requests/, Responses/, Options/, Rules/ (pure business rules)
api/Nails.Api/Modules/<Module>/              Controllers/ (one [ApiController] per resource, route /api/<module> from the namespace), Content/
client/libs/shared/<module>/data-access/       API calls and state, typed by the generated schema
client/libs/web/<module>/feature/              pages, routes and the module manifest
```

### Adding a module

1. Create the folders above for the new module.
2. Register it: one line in `api/Nails.Application/Common/Modules/ModuleCatalog.cs`, a `Modules:<Module>` section with `Enabled` in every `appsettings.{Development,Docker,Production}.json`, one line in `client/apps/web/src/modules.ts`, its paths in `client/tsconfig.base.json`.
3. In `api/`: `dotnet ef migrations add Add<Module> --project Nails.Infrastructure --startup-project Nails.Api --output-dir Persistence/Migrations`, then `dotnet build`.
4. In `client/`: `npx nx run shared-core-data-access:api-types`.
5. Help: `api/Nails.Api/Modules/Help/Content/ru/articles/<module>.json` with `"module": "<module>"`.

A module uses another module only through the contracts of the always-on modules: today `Identity` (`ICurrentUser`); the constitution also reserves this for `Catalog` once it exists. Their client code lives in `core`. The first spec that needs events or extension points between modules builds that mechanism.

### Adding a mobile app

`apps/mobile` and `libs/mobile/<module>/` follow the web pattern: the mobile app reuses `libs/shared` (HTTP, state and API types) and brings its own screens. `libs/shared` never imports DOM APIs, Angular Material, the router or forms, so it stays usable by any Angular-based mobile shell (Ionic with Capacitor, NativeScript). Mobile sign-in needs a token flow next to the browser cookie; that is the first spec of the mobile app.

## Architecture rules

- Controllers are thin: bind the request, call one service, return its response. `ModuleControllerConvention` prefixes every controller in `Nails.Api.Modules.<Module>` with `/api/<module>` and requires sign-in unless an action says `[AllowAnonymous]`; `ModuleControllerFeatureProvider` drops the controllers of a disabled module. Services hold the logic; repositories hold the queries; `IUnitOfWork` saves.
- Errors: services throw an `AppException` subclass (`InvalidRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `TooManyRequestsException`); `ExceptionMiddleware` turns it into problem details with `code` and `traceId`. Validation failures, unknown routes and authentication failures use the same shape.
- Tenancy: registration gives every account its own tenant. Every `ITenantEntity` (private data) is filtered by the signed-in user's tenant through a named EF Core query filter and stamped on insert by `TenantInterceptor`; writing another tenant's row throws.
- Rules: business rules are pure functions in `Modules/<Module>/Rules/`; the server enforces them and every permission.
- Russian messages: `AppException` titles are Russian; `RussianValidationMetadataProvider` gives data annotations Russian messages, `ProblemTitles` covers framework errors, `RussianIdentityErrorDescriber` covers Identity.
- Client formatting: the locale (`appLocale`) and, as features add them, the price, phone, date and plural helpers live only in `client/libs/shared/common/util`.
- Data: one PostgreSQL database, one `AppDbContext`, one schema per module, UUID v7 keys, snake_case names, `IAuditable` timestamps, `IVersioned` for optimistic concurrency. Migrations are additive.

## Security

- ASP.NET Core Identity: hashed passwords, lockout, confirmed email, single-use reset links, password policy in `Modules:Identity:Options`.
- Session: an `HttpOnly`, `SameSite=Strict` cookie, `Secure` when `Security:SecureCookies` is on; no tokens in JavaScript. Changes need the antiforgery header that Angular's `HttpClient` sends from the `XSRF-TOKEN` cookie. The browser always talks to one origin: the dev server and nginx proxy `/api`.
- Rate limits on the anonymous Identity endpoints (`Modules:Identity:RateLimit`); `nosniff`, `no-referrer`, a locked-down `Permissions-Policy`, CSP and `no-store` on the API; a strict CSP on the web app.
- Data protection keys live in PostgreSQL. Behind a reverse proxy, enable `Security:ForwardedHeaders` with its addresses.
- Secrets never enter git: `.env` (git-ignored) and user secrets locally, the environment or a secret store in production.

## Configuration

- `appsettings.json`: only `Serilog` and `AllowedHosts`. Every other section is complete in each `appsettings.{Development,Docker,Production}.json`, secrets left empty; options validate on start.
- Environment variables override files with `__`, e.g. `ConnectionStrings__Database`.

## Local development

```bash
docker compose up -d
cd api && dotnet run --project Nails.Api
cd client && npx nx run web:serve
```

`docker compose up -d` starts PostgreSQL and Mailpit (emails at http://localhost:8025). The API listens on http://localhost:5200 (OpenAPI reference at `/scalar`), the web app on http://localhost:4200. Sign in with the owner from `.env`.

The whole stack in containers, with the `Docker` settings: `docker compose --profile app up -d --build`, then open http://localhost:8080.

## Checks

```bash
cd api
dotnet build Nails.slnx
dotnet ef migrations has-pending-model-changes --project Nails.Infrastructure --startup-project Nails.Api
dotnet list Nails.slnx package --vulnerable --include-transitive

cd ../client
npx nx run-many -t lint typecheck knip format-check build
npm audit --audit-level=high
```

Every .NET analyzer runs in the build with warnings as errors (`api/.editorconfig` lists the rules switched off). The client runs type-checked ESLint with angular-eslint and the module boundaries, `tsc`, `knip`, Prettier and the production build. CI (`.github/workflows/ci.yml`) runs the same and builds both images.

`client/package-lock.json` must install on Linux. After adding packages on Windows, refresh it in a Linux container if `npm ci` fails in CI: `docker run --rm -v "$PWD:/w" -w /w node:24-alpine npm install --package-lock-only`.

## Deployment

- `api/Dockerfile` builds the API image (port 8080, non-root). `client/Dockerfile` builds an nginx image that serves the web app and proxies `/api` to `API_UPSTREAM`.
- Production: set `ConnectionStrings__Database`, the `Email` settings, `App__ClientUrl` and TLS in front; apply migrations before the new version (`dotnet ef migrations script --idempotent` or `Database__MigrateOnStart=true` for a single instance).
- Windows service: `dotnet publish Nails.Api -c Release -o <folder>` in `api/`, then `sc.exe create`; the host detects the service lifetime itself.

## Spec-driven workflow

Specs are built with [spec-kit](https://github.com/github/spec-kit) 1.0.8 (Claude Code integration, PowerShell scripts). The constitution is `.specify/memory/constitution.md`; every spec-kit command reads it.

1. `/speckit-specify` with what and why. Screen mockups go into `specs/NNN-<module>-<short-name>/design/`.
2. `/speckit-clarify`.
3. `/speckit-plan` with the technical context.
4. `/speckit-tasks`, then `/speckit-analyze`.
5. `/speckit-implement`, and `/speckit-converge` if something is left.

Spec folders are numbered and start with the main module. A finished spec is never rewritten: a new requirement is a new spec.

Changes to stock spec-kit: the spec template has no Acceptance Scenarios, Independent Test or Success Criteria and has a `Modules` field; the plan and tasks templates show this repository's paths and have no tests; `/speckit-specify` requires an ASCII short name that starts with the main module; `/speckit-taskstoissues` is removed. Changed files: `.specify/templates/{spec,plan,tasks}-template.md` and `.claude/skills/speckit-{specify,plan,tasks,implement}/SKILL.md`; an upgrade (`uv tool install specify-cli==1.0.8`) is merged by hand.

### Agent setup

- `AGENTS.md` holds the rules for any coding agent; `CLAUDE.md` imports it. `client/AGENTS.md` adds the client's.
- Documentation servers in `.mcp.json`: `nx-mcp`, `microsoft-learn`, `angular-cli`, pinned. If `npx` does not start a server on Windows, add a local-scope server of the same name wrapped in `cmd /c` (`claude mcp add --scope local`).
- Vendor skills in `.claude/skills/` are copied unmodified from pinned commits: `nx-workspace`, `nx-run-tasks`, `nx-generate` (`nrwl/nx-ai-agents-config` `aa363e4a`); `optimizing-ef-core-queries`, `analyzing-dotnet-performance`, `csharp-refactoring`, `msbuild-antipatterns` (`dotnet/skills` `a55fbf42`).
