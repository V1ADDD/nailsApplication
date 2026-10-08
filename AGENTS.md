Project rules: `.specify/memory/constitution.md`. Layout, modules and commands: `README.md`. Client rules: `client/AGENTS.md`. Two independent roots: run `dotnet` in `api/` and `npx nx` in `client/`.

## Always

- English only: code, identifiers, UI text, help content, configuration, specs, docs and commit messages. Other languages only as translations in their own language folders.
- No tests: no test projects, no test files, no test tasks.
- No comments in code: no `//`, `///`, `/* */`, `<!-- -->`, and no `#` in scripts.
- In `api/`, every model, DTO, options class, enum and interface lives in its own file named after the type.
- No hardcoded values: URLs, limits, timeouts and sizes go to `appsettings.{Environment}.json` (`Development`, `Docker`, `Production`) plus an options class registered with `AddValidatedOptions` in the `Options/` folder of whatever reads it.
- No secrets in the repository: `.env` and user secrets locally, the environment in production; committed settings keep the key with an empty value.
- After every change, look for duplication and reuse: inside the module first, then `Common/` (api) or `libs/*/common` (client).
- Remove dead code in the same change: code, exports, settings, files and packages that nothing uses.
- Rules are checked by tools and switched off only in `api/.editorconfig`, `client/eslint.config.mjs` or `client/knip.json`, with the reason in the current spec's `plan.md`; never in code.
- User content stays private: no free text a user typed goes into logs, URLs or browser storage.

## Help is part of every change

- If a user can see or do something differently after a change, update `api/Starter.Api/Modules/Help/Content/<language>/` in the same change (articles in `articles/<module>.json`, `core` for the shell); otherwise say so in the report.
- Write for users, quote on-screen messages exactly, keep article ids stable.

## Specs

- Work happens inside one current spec; only its folder in `specs/` is edited. Earlier specs are frozen; changes to what they defined are recorded in the current spec.
- `README.md`, the help content and the code always describe the current state.
- If there is no current spec for a change, ask which spec it belongs to before editing spec files.

## Definition of done

1. In `api/`: `dotnet build Starter.slnx` has no warnings and `dotnet ef migrations has-pending-model-changes --project Starter.Infrastructure --startup-project Starter.Api` is clean. In `client/`: `npx nx run-many -t lint typecheck knip format-check build` passes.
2. `dotnet list Starter.slnx package --vulnerable --include-transitive` and `npm audit --audit-level=high` find nothing high or critical.
3. A contract change commits the rebuilt `api/Starter.Api/openapi.json` and the regenerated `client/libs/shared/core/data-access/src/lib/api/schema.ts`.
4. A model change has an additive migration.
5. Help, `README.md`, the current spec and the constitution match the code.
6. No comments, dead code, duplication, hardcoded values, secrets or non-English text were added.

## Vendor knowledge

- Look up APIs for the versions in use: .NET, ASP.NET Core and EF Core in the `microsoft-learn` MCP; Angular in `angular-cli`; Nx in `nx-mcp` and the `nx-*` skills. Where a vendor skill disagrees with this file or the constitution, this file and the constitution win.
- C#: thin `[ApiController]` controllers that call one service; services behind interfaces in `Contracts/`; repositories for queries; trust nullable annotations and validate where input enters (data annotations on requests); `[LoggerMessage]`; `TimeProvider`; `Guid.CreateVersion7()`; `CancellationToken` everywhere.
- HTTP: problem details with a stable `code` from `ErrorCodes`; resource-oriented URLs; unbounded lists are paginated with `PagedResponse<T>`.
- EF Core: no-tracking reads, `ExecuteDelete`/`ExecuteUpdate` for bulk changes, an index for every list filter, `IVersioned` for anything two people can edit.

## Core and modules

- The core: `Common/` of each project, `Host/` in `Starter.Api`, `Persistence`, `Email` and `Options` in `Starter.Infrastructure`, the always-on `Identity` module, the switchable `Help` module, `client/libs/{shared,web}/{core,common}`.
- A module lives only in `Modules/<Module>/` of each api project and `client/libs/{shared,web,mobile}/<module>/`; registering it touches only `ModuleCatalog.cs`, `modules.ts`, `tsconfig.base.json`, the settings files and a migration.
- Every module except `Identity` is switched by `Modules:<Module>:Enabled`; a disabled module exposes nothing and keeps its tables.
- Another module is used only through `Identity` contracts; no shared tables, foreign keys or queries across module schemas.
