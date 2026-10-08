---

description: "Task list for the design system, app frame and support"
---

# Tasks: Design system, app frame and support

**Input**: Design documents from `/specs/002-core-design-system-shell/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: None. This project writes no tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

## Phase 1: Setup

- [X] T001 Enable SCSS component styles: `"inlineStyleLanguage": "scss"` and `"stylePreprocessorOptions": { "includePaths": ["apps/web/src/styles"] }` in the build options of `client/apps/web/project.json`
- [X] T002 [P] Copy `specs_requests/reference/brand/favicon.svg` and `favicon.ico` to `client/apps/web/public/` (replacing the old favicon) and add `client/apps/web/public/manifest.webmanifest` (name and short_name «Мастера рядом», description «Маникюр и не только — рядом с вами», `lang` ru, `display` standalone, `background_color` `#f7f5f0`, `theme_color` `#7b2cf5`, icon `favicon.svg`)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T003 Create `client/apps/web/src/styles/_tokens.scss` with every token of `reference/styles/_tokens.scss` renamed per research R1 (`--app-color-*`, `--app-gradient-*`, `--app-space-0-5…16`, `--app-font-size-*`, `--app-font-weight-*`, `--app-line-height*`, `--app-radius-*`, `--app-shadow-*`, `--app-top-bar-height`, `--app-tab-bar-height`, `--app-content-width`, `--app-tap-target`, `--app-transition-*`, `--app-z-*`, `--app-brand-*`, `--app-font`) plus `--app-logo-from` `#b57dff`, `--app-logo-to` `#6a1fe0`, `--app-logo-highlight` `#9a5cff`
- [X] T004 [P] Create `client/apps/web/src/styles/_breakpoints.scss` with `$breakpoints` (sm 480, md 768, lg 1024, xl 1280) and the mixins `up($name)` and `down($name)`
- [X] T005 [P] Create `client/apps/web/src/styles/_base.scss`: border-box, body (font, size, line height, `--app-color-text` on `--app-color-bg`, antialiasing, `hyphens: auto`), headings and paragraphs without margins, h1 display style (28 px, 800, tight), 2 px `--app-color-primary` focus ring, `.visually-hidden`, `img` block, reduced-motion kill switch
- [X] T006 Create `client/apps/web/src/styles/_material.scss`: `mat.theme` (violet palette, light, Manrope, density 0), `mat.theme-overrides` mapping system colors and shapes to the tokens, component overrides for button, form field, chips, tabs, dialog, menu and snack bar per research R3, and the classes `.app-pill`, `.app-gradient`, `.app-sunken`
- [X] T007 [P] Create `client/apps/web/src/styles/_overlays.scss`: panel classes `app-sheet-bottom` (full width, max 90 dvh, top radius `--app-radius-xl`, slide-up), `app-sheet-dialog`, and `app-toast` / `app-toast-info|success|error` (colors, max 28 rem, above the tab bar below lg)
- [X] T008 Rewrite `client/apps/web/src/styles.scss` to `@use` the partials; drop the rose palette, `color-scheme: light dark` and the 001 tokens
- [X] T009 Update `client/apps/web/src/index.html`: title «Мастера рядом — бьюти-мастера Беларуси», `color-scheme` light, `theme-color` `#7b2cf5`, `description`, icons `favicon.ico` and `favicon.svg`, `manifest.webmanifest`
- [X] T010 [P] Add `Viewport` (signals `isMd`, `isLg` from `BreakpointObserver`) in `client/libs/web/common/ui/src/lib/layout/viewport.ts`
- [X] T011 [P] Add the icon paths (`map`, `message-square`, `user`, `x`, `info`, `log-out`, `chevron-right` from `reference/brand/icons.ts`) in `client/libs/web/common/ui/src/lib/icons/icon-paths.ts` and the `Icon` component (`name`, `label`, `size`; `role="img"` with label, `aria-hidden` without) in `client/libs/web/common/ui/src/lib/icons/icon.ts`
- [X] T012 [P] Add the `Logo` component (`variant` `full|mark`, `size`; tokens for colors; wordmark 800 `--app-color-brand-ink`, size × 0.56; `role="img"`, «Мастера рядом») in `client/libs/web/common/ui/src/lib/brand/logo.ts`
- [X] T013 [P] Add the `Avatar` component (`name`, `src`, `size`, `shape` `circle|rounded`; lazy image with alt = name; initials of the first two words on `--app-gradient-primary`) in `client/libs/web/common/ui/src/lib/avatar/avatar.ts`
- [X] T014 [P] Add the `Skeleton` component (shimmer 1.2 s, `width`, `height`, `radius`, `aria-hidden`) in `client/libs/web/common/ui/src/lib/states/skeleton.ts`
- [X] T015 Restyle `EmptyState`, `ErrorState`, `LoadingState` and `ProblemAlert` with the tokens in `client/libs/web/common/ui/src/lib/states/*.ts` and `client/libs/web/common/ui/src/lib/forms/problem-alert.ts`, and export the new blocks from `client/libs/web/common/ui/src/index.ts`
- [X] T016 Replace `NavigationItem`/`navigation` with the slots `frameItem` (`FrameItem` `{ label, icon, path, order, exact?, badge? }`, `FrameBadge` `{ count: Signal<number> }`), `accountLink` (`{ label, icon, path }`) and `frameAction` (`{ label, icon, open(injector) }`) in `client/libs/web/core/feature/src/lib/modules/module-manifest.ts`; replace `navigation.ts` with a `frameSlots` token (items, account links, actions of the loaded manifests) in `client/libs/web/core/feature/src/lib/modules/frame.ts`

**Checkpoint**: Foundation ready

---

## Phase 3: User Story 1 - The product looks like «Мастера рядом» (Priority: P1)

**Goal**: every existing page has the old app's look.

- [X] T017 [US1] Migrate every use of the 001 tokens (`--app-space-1…7`, `--app-radius-s/m/l`, `--mat-sys-*` colors in components) to the new tokens in `client/libs/web/**/*.ts`
- [X] T018 [US1] Restyle `AuthCard` with the full `Logo` and a white card (`--app-radius-lg`, border) in `client/libs/web/core/feature/src/lib/identity/auth-card.ts` and the form spacing in `client/libs/web/core/feature/src/lib/identity/auth-form.styles.ts`
- [X] T019 [US1] Reduce the home page to its hero (display title, lead, «Создать аккаунт» for guests) and drop the cards in `client/libs/web/core/feature/src/lib/home/home-page.ts`
- [X] T020 [P] [US1] Use skeletons for the known-shape loading of `client/libs/web/help/feature/src/lib/help-page.ts` and `help-article-page.ts`, and restyle their cards with the tokens

---

## Phase 4: User Story 2 - The frame (Priority: P1)

**Goal**: tab bar below lg, top bar from lg, account page, scroll to top.

- [X] T021 [P] [US2] Add `TabBar` (fixed, safe area, equal items, icon over label, active violet, badge with «непрочитанных», `aria-current`) in `client/libs/web/core/feature/src/lib/layout/tab-bar.ts`
- [X] T022 [P] [US2] Add `TopBar` (sticky; logo link «Мастера рядом — на главную»; items as pills; frame actions as ghost buttons; account links; 36 px avatar link «Профиль» or «Войти» pill) in `client/libs/web/core/feature/src/lib/layout/top-bar.ts`
- [X] T023 [US2] Rewrite `AppLayout` to render `TopBar` from lg or `TabBar` plus the home-page edge tab for frame actions below lg, with matching `main` padding; delete `client/libs/web/core/feature/src/lib/layout/account-menu.ts`; in `client/libs/web/core/feature/src/lib/layout/app-layout.ts`
- [X] T024 [US2] Add `AccountPage` (avatar 64 rounded, name, email, rows of account links and frame actions, «Выйти») in `client/libs/web/core/feature/src/lib/account/account-page.ts`
- [X] T025 [US2] Add `appPaths.profile`, the core frame item «Профиль», the `/profile` route behind `requireSession`, the `frameSlots` provider and `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` in `client/libs/web/core/feature/src/lib/bootstrap/{app-paths,routes,provide-nails}.ts`; home route title «Мастера рядом — бьюти-мастера Беларуси»
- [X] T026 [US2] Declare `accountLink` «Справка» → `/help` (`info`) instead of `navigation` in `client/libs/web/help/feature/src/lib/manifest.ts`

---

## Phase 5: User Story 3 - Write to support (Priority: P2)

**Goal**: «Напишите нам» stores a ticket.

- [X] T027 [P] [US3] Add `FixedWindowLimitOptions` (`[Range(1, 100000)] PermitLimit`, `[Range(typeof(TimeSpan), "00:00:01", "01:00:00")] Window`) in `api/Nails.Application/Common/RateLimiting/FixedWindowLimitOptions.cs` and `AddPerAddressPolicy<TOptions>` in `api/Nails.Application/Common/RateLimiting/RateLimiterOptionsExtensions.cs`; derive `SignInLimitOptions` from it and use the helper in `api/Nails.Api/Host/Extensions/RateLimitingExtensions.cs`
- [X] T028 [P] [US3] Add `SupportTicketStatus` (`New`) and `SupportTicket` (`Id`, `Text` max 2000, `Contact` max 200 nullable, `UserId` nullable, `Status`, `IAuditable`) in `api/Nails.Infrastructure/Modules/Support/Entities/`, `DatabaseSchemas.Support = "support"`, and `SupportTicketConfiguration` (`tickets`, `varchar(2000)` text required, `varchar(200)` contact, status as string max 20, index on `created_at`) in `api/Nails.Infrastructure/Modules/Support/Configurations/SupportTicketConfiguration.cs`
- [X] T029 [US3] Add `ISupportTicketRepository` (`Add`) and `SupportTicketRepository` in `api/Nails.Infrastructure/Modules/Support/{Contracts,Repositories}/`
- [X] T030 [US3] Add `CreateSupportTicketRequest` (`[Required(ErrorMessage = "Напишите, чем мы можем помочь")]` `[MaxLength(2000)]` text, `[MaxLength(200)]` contact), `CreateSupportTicketResponse(Guid TicketId)`, `SupportLimitOptions` (`Modules:Support:RateLimit`), `ISupportTicketService`, `SupportTicketService` (trim, empty contact → null, `ICurrentUser` id or null, `Guid.CreateVersion7()`, save) and `SupportModule` (options, repository, service, `support` rate-limit policy) in `api/Nails.Application/Modules/Support/`
- [X] T031 [US3] Register `SupportModule` in `api/Nails.Application/Common/Modules/ModuleCatalog.cs` and add `Modules:Support` (`Enabled` true, `RateLimit` 5 / 00:01:00) to `api/Nails.Api/appsettings.{Development,Docker,Production}.json`
- [X] T032 [US3] Add `TicketsController` (`[Route("tickets")]`, `[AllowAnonymous]`, `[EnableRateLimiting(SupportModule.RateLimitPolicy)]`, `POST` → 201) in `api/Nails.Api/Modules/Support/Controllers/TicketsController.cs`
- [X] T033 [US3] Add the migration `AddSupport` in `api/Nails.Infrastructure/Persistence/Migrations/`, build `api/` (writes `api/Nails.Api/openapi.json`) and regenerate `client/libs/shared/core/data-access/src/lib/api/schema.ts`
- [X] T034 [P] [US3] Add `Sheets` (open by breakpoint per research R4) and `SheetLayout` (grip, title, × «Закрыть», body, `[sheetFooter]`) in `client/libs/web/common/overlays/src/lib/sheet/` (new library, see plan)
- [X] T035 [P] [US3] Add `Toasts` (`info`, `success`, `error`; 3500 ms; polite) and `ToastView` (message, × «Закрыть уведомление») in `client/libs/web/common/overlays/src/lib/toasts/`
- [X] T036 [US3] Generate `client/libs/shared/support/data-access` (tags `scope:shared,type:data-access,name:support`) with `SupportApi.createTicket` and its path in `client/tsconfig.base.json`
- [X] T037 [US3] Generate `client/libs/web/support/feature` (tags `scope:web,type:feature,name:support`) with `SupportForm`, `SupportDialog` (lazy form, in-memory draft) and `manifest` (`frameAction` «Напишите нам», `message-square`), its path in `client/tsconfig.base.json` and the entry in `client/apps/web/src/modules.ts`

---

## Phase 6: User Story 4 - Broken link (Priority: P2)

- [X] T038 [US4] Rewrite `NotFoundPage` (mark logo 80 px, «Страница не найдена», «Возможно, ссылка устарела или мастер удалил профиль.», primary «На карту» → `/`) in `client/libs/web/core/feature/src/lib/layout/not-found-page.ts`, and give `StartupFailedPage` and `UnavailablePage` the new look

---

## Phase 7: User Story 5 - Reusable building blocks (Priority: P3)

- [X] T039 [US5] Confirm the deferred blocks of research R5 are recorded and nothing unused is exported from `client/libs/web/common/ui/src/index.ts` and `client/libs/shared/common/util/src/index.ts` (knip)

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T040 Update the help: `sign-out` and new `navigation` in `api/Nails.Api/Modules/Help/Content/ru/articles/core.json`; new `api/Nails.Api/Modules/Help/Content/ru/articles/support.json` (`write-to-us`)
- [X] T041 [P] Update `README.md` (Support module, frame and manifest slots, token rule), `client/AGENTS.md` (tokens) and the constitution 4.0.0 → 4.1.0 (principle VII, Sync Impact Report) in `.specify/memory/constitution.md`
- [X] T042 Run `dotnet build Nails.slnx`, `dotnet ef migrations has-pending-model-changes`, `dotnet list Nails.slnx package --vulnerable --include-transitive` in `api/`
- [X] T043 Run `npx nx run-many -t lint typecheck knip format-check build` and `npm audit --audit-level=high` in `client/`
- [X] T044 Check the frame at 360 px, phone, tablet and desktop against `design/`; send a ticket as a guest and signed in; the 6th ticket in a minute gets «Слишком много запросов. Попробуйте через минуту.»; with `Modules:Support:Enabled=false` «Напишите нам» disappears and the rest works
- [X] T045 Check the changed code for duplication, comments, hardcoded values and secrets; record changes during implementation in `specs/002-core-design-system-shell/plan.md`

## Dependencies

- Phase 1 → Phase 2 → US1 and US2 (parallel) → US3 (needs the frame slots of T016 and the frame of US2) → US4 → US5 → Polish.
- API tasks T027–T033 are independent of the client tasks and can run in parallel with Phases 2–4.
- MVP: Phases 1–4 (look and frame).
