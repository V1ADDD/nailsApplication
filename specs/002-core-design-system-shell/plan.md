# Implementation Plan: Design system, app frame and support

**Branch**: `002-core-design-system-shell` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-core-design-system-shell/spec.md`; approach from `specs_requests/002-core-design-system-shell.md` and the constitution.

## Summary

Give the web app the old app's look (the `_tokens.scss` values as `--app-*` tokens, Angular Material themed from them, light only, Manrope), the shared building blocks its screens need (logo, icons, avatar, sheet, toasts, skeleton, breakpoint signals, restyled states), the frame (bottom tab bar below 1024 px, sticky top bar from 1024 px, an account page at `/profile`, a 404 page, the brand files) fed by new manifest slots, and the first product module `Support`: `POST /api/support/tickets` stores a ticket from the «Напишите нам» sheet.

## Technical Context

**Modules touched**: core, help (manifest slot, articles), support (new, switchable)

**Platforms**: web. New `libs/shared/support/data-access` holds the HTTP call; screens stay in `libs/web`.

**Module interaction**: `Support` uses `Nails.Application.Modules.Identity.Contracts.ICurrentUser` for the sender's id. On the client, modules reach the frame only through `ModuleManifest` slots in `core`.

**Stack**: .NET 10 (ASP.NET Core controllers, EF Core 10 on PostgreSQL), Angular 22 (Nx, signals, Angular Material). No new package: `@angular/cdk/layout` and `@angular/material/{dialog,snack-bar}` are already installed.

**Storage**: schema `support`, table `tickets` (see [data-model.md](data-model.md)); migration `AddSupport`; index on `created_at`. Not tenant-owned (guests write it), no `IVersioned` (nobody edits it).

**Contracts**: `POST /api/support/tickets` `{ text, contact? }` → 201 `{ ticketId }` (see [contracts/support.md](contracts/support.md)). `openapi.json` and `schema.ts` regenerated.

**Settings**: in `appsettings.{Development,Docker,Production}.json`: `Modules:Support:Enabled` = `true`, `Modules:Support:RateLimit:PermitLimit` = `5`, `Modules:Support:RateLimit:Window` = `00:01:00`.

**Constraints**: from 360 px without horizontal scroll; tap targets ≥ 44 px; initial bundle under the 700 kB warning; component styles under 4 kB.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched: I (Russian text, locale), III (contract), IV (a new module), V (layers), VI (Identity contract only), VII (tokens, frame, states, accessibility), VIII (anonymous endpoint), IX (rate limit, privacy of the message), X (help).

| Gate | Status |
|---|---|
| I. Russian user-facing text written directly | Pass |
| III. Contract regenerated, types generated | Pass: `openapi.json`, `schema.ts` |
| IV. Module only in its folders; registration touches only `ModuleCatalog`, `modules.ts`, `tsconfig.base.json`, settings, migration | Pass: the rate-limit policy is registered by `SupportModule`; the shared per-address helper is core (`Common/RateLimiting`) |
| IV. Switchable, exposes nothing when off | Pass: controller dropped, manifest not loaded, frame action and help article gone |
| V. Thin controller, service behind interface, repository | Pass |
| VI. Only Identity contracts across modules | Pass: `ICurrentUser` |
| VII. Tokens in `apps/web/src/styles`, no hex in components, states with «Повторить», labelled controls, focus, reduced motion | Pass: logo colors are tokens; constitution VII amended (MINOR) to name `styles/_tokens.scss` and the frame |
| VIII. Endpoint level declared | Pass: `[AllowAnonymous]` |
| IX. Anonymous endpoint rate-limited; no user text in logs, URLs, storage | Pass: per-address limit; the draft lives in memory only |
| X. Help updated | Pass: `core.json` changed, `support.json` added |
| No tests, no comments, one type per file, no hardcoded values | Pass: limits in settings; the toast duration and breakpoints are design constants that never differ between environments |
| No dead code | Pass: blocks without a user are deferred ([research.md](research.md) R5) |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/002-core-design-system-shell/
├── plan.md
├── research.md
├── data-model.md
├── contracts/support.md
├── checklists/requirements.md
├── design/{phone,tablet,desktop}/*.png      old-app screenshots
└── tasks.md
specs/_design-references/figma/*.png          the customer's phone design, shared by every spec
```

### Source Code

```text
api/
├── Nails.Api/
│   ├── Host/Extensions/RateLimitingExtensions.cs                         Identity policy through the shared helper
│   ├── Modules/Support/Controllers/TicketsController.cs                  new
│   ├── Modules/Help/Content/ru/articles/{core.json, support.json}        changed, new
│   └── appsettings.{Development,Docker,Production}.json                  Modules:Support
├── Nails.Application/
│   ├── Common/Modules/ModuleCatalog.cs                                    + SupportModule
│   ├── Common/RateLimiting/{FixedWindowLimitOptions, RateLimiterOptionsExtensions}.cs   new
│   ├── Modules/Identity/Options/SignInLimitOptions.cs                    derives from FixedWindowLimitOptions
│   └── Modules/Support/
│       ├── SupportModule.cs
│       ├── Contracts/ISupportTicketService.cs
│       ├── Services/SupportTicketService.cs
│       ├── Requests/CreateSupportTicketRequest.cs
│       ├── Responses/CreateSupportTicketResponse.cs
│       └── Options/SupportLimitOptions.cs
└── Nails.Infrastructure/
    ├── Persistence/DatabaseSchemas.cs                                   + Support
    ├── Persistence/Migrations/*_AddSupport.cs
    └── Modules/Support/
        ├── Entities/{SupportTicket, SupportTicketStatus}.cs
        ├── Configurations/SupportTicketConfiguration.cs
        ├── Contracts/ISupportTicketRepository.cs
        └── Repositories/SupportTicketRepository.cs
client/
├── apps/web/
│   ├── project.json                         inlineStyleLanguage scss, includePaths
│   ├── public/{favicon.svg, favicon.ico, manifest.webmanifest}
│   └── src/
│       ├── index.html                       title, theme-color, manifest, light only
│       ├── modules.ts                       + support
│       ├── styles.scss
│       └── styles/{_tokens, _breakpoints, _base, _material, _overlays}.scss
└── libs/
    ├── shared/support/data-access/          new: SupportApi
    ├── web/common/ui/src/lib/               avatar/, brand/, icons/, layout/viewport.ts, states/skeleton.ts; states and problem alert restyled
    ├── web/common/overlays/                 new: sheet/, toasts/ (see changes during implementation)
    ├── web/core/feature/src/lib/
    │   ├── account/account-page.ts          new: /profile
    │   ├── bootstrap/{app-paths, routes, provide-nails}.ts   profile route, scrolling, frame slots
    │   ├── home/home-page.ts                hero only
    │   ├── identity/auth-card.ts            logo, new look
    │   ├── layout/{app-layout, tab-bar, top-bar, not-found-page, startup-failed-page}.ts   account-menu.ts removed
    │   └── modules/{module-manifest, frame}.ts   navigation.ts replaced
    ├── web/help/feature/src/lib/            manifest accountLink; skeleton loading
    └── web/support/feature/                 new: manifest, SupportDialog, SupportForm
```

**Module switch**: with `Modules:Support:Enabled=true` the API exposes `POST /api/support/tickets`, `/api/modules` lists `support`, the client loads the support manifest, the frame shows «Напишите нам» (top bar from lg, home-page edge tab below lg, account-page row) and help shows «Напишите нам». With `false` all of that is absent; the table stays; the frame, help and identity work unchanged.

**Help**: `ru/articles/core.json`: `sign-out` rewritten («Выйти» is in «Профиль»), new `navigation` («Разделы сайта»: the tab bar, the top bar, where «Справка» is). New `ru/articles/support.json` with `write-to-us` («Напишите нам»: where the button is, the fields, the limit of 2000 characters, what happens, the messages «Напишите, чем мы можем помочь» and «Слишком много запросов. Попробуйте через минуту.»).

**Other docs**: `README.md` (module table, the frame and the manifest slots, the token rule), `client/AGENTS.md` (tokens and Material), constitution 4.0.0 → 4.1.0 (VII names `apps/web/src/styles/_tokens.scss` and the frame).

**Structure Decision**: as listed above.

## Changes to earlier specs

- 001: the Material toolbar, its «Меню» disclosure, the account menu (name and «Выйти»), the home page cards and the rose palette are replaced; `ModuleManifest.navigation` becomes the slots `frameItem`, `accountLink` and `frameAction`; the tokens `--app-space-1…7`, `--app-radius-s/m/l`, `--app-form-width` are replaced by the old app's scale; the 404 text «Такой страницы нет.» becomes the new 404 page.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |

**Silenced rules**: none.

**Deviations from the request** (recorded here as the request allows the plan to decide):
- Rating, tabs, segmented control, swipe, the avatar's dot and badge, all client formatters and `MinskTime` are deferred to their first user (research R5); icons are ported as they are used.
- The sheet is a service plus a layout component, not a component with an `open` model (research R4).
- Below lg, «Напишите нам» is an edge tab on the home page only, plus a row on the account page (spec Assumptions).
- `support.tickets` also has `updated_at` because it reuses `IAuditable`.
- The «Напишите нам» help article lives in `support.json`, not `core.json`, so it disappears with the module.

**Changes during implementation**:
- `Sheets`, `SheetLayout` and `Toasts` live in a new library `libs/web/common/overlays` (`@nails/web/common/overlays`, tags `scope:web,type:ui,name:common`) instead of `libs/web/common/ui`: through the `ui` barrel they pulled Material dialog and snack bar into the main chunk (initial bundle 669 kB instead of 596 kB). The support manifest also lazy-imports `SupportDialog`, so the support code is downloaded on the first «Напишите нам».
- The breakpoint service is `Viewport` with only `isMd` and `isLg` (the two in use); `Toasts` has only `success` and `error`; the `info` kind and the sunken field style are deferred (research R5).
- Outline is the default form-field appearance (`MAT_FORM_FIELD_DEFAULT_OPTIONS` in `provideNails`), so the sign-in and registration forms match the support sheet.
- Sheets focus their container on open (`autoFocus: 'dialog'`), so the × button does not show a focus state and phones do not open the keyboard.
- The unsent draft lives in a root `SupportDraft` service; `SupportDialog` opens `SupportForm`; the start-up failure and «Нет связи» pages share `BrandedError` (logo mark plus the error state); the unread badge is `FrameBadgeView`.
- The Nx library generator added `@swc/helpers` and `@typescript-eslint/utils` and a different file layout; the change was reverted and the two support libraries were written in the layout of the help libraries.
- Verified in the running app (Chrome, iframes at 360, 390 and 820 px and the desktop window): no horizontal scroll; phone tab bar, edge tab, sheet, toasts; desktop top bar, dialog, account page and sign-out; a guest ticket (contact trimmed, no user) and a signed-in ticket (user id stored); the 6th request in a minute gets 429 «Слишком много запросов. Попробуйте через минуту.»; with `Modules__Support__Enabled=false` the module is absent from `/api/modules`, the endpoint answers 404, the help article and every «Напишите нам» are gone and the rest works.
