# Research: Design system, app frame and support

Sources: `specs_requests/002-core-design-system-shell.md` and `specs_requests/reference/` (styles, brand, formatters of the old app; not tracked by git), the screenshots in `design/`, the current code.

## R1. Token names

- **Decision**: every token of `reference/styles/_tokens.scss` is ported with its value into `client/apps/web/src/styles/_tokens.scss` under the `--app-` prefix: `--color-*` → `--app-color-*`, `--gradient-*` → `--app-gradient-*`, `--space-*` → `--app-space-*` (same 4 px scale, `0-5` … `16`), `--font-size-*` → `--app-font-size-*`, `--font-weight-*` → `--app-font-weight-*`, `--line-height*` → `--app-line-height*`, `--radius-*` → `--app-radius-*`, `--shadow-*` → `--app-shadow-*`, `--transition-*` → `--app-transition-*`, `--z-*` → `--app-z-*`, `--brand-ink` → `--app-color-brand-ink`, `--brand-*` → `--app-brand-*`, `--header-height` → `--app-top-bar-height`, `--bottom-nav-height` → `--app-tab-bar-height`, `--content-max-width` → `--app-content-width`, `--tap-target` → `--app-tap-target`, `--font-family` → `--app-font`. The map, schedule and sheet-peek tokens are ported too, because they are part of the same design source and cost nothing until used. Added: `--app-logo-from`, `--app-logo-to`, `--app-logo-highlight` (the logo's SVG colors, so the logo component has no hex).
- **Rationale**: one prefix keeps tokens apart from Material's `--mat-sys-*`; the 001 names `--app-space-1…7` (8 px steps) and `--app-radius-s/m/l` are replaced by the old app's scale and every use is migrated.
- **Alternatives**: keeping the old app's unprefixed names (clash risk with third-party CSS, mixed conventions).

## R2. Where the theme lives

- **Decision**: `apps/web/src/styles.scss` only `@use`s partials in `apps/web/src/styles/`: `_tokens.scss`, `_breakpoints.scss` (`up()` / `down()` for sm 480, md 768, lg 1024, xl 1280), `_base.scss` (border-box, body, headings, focus ring, `.visually-hidden`, reduced motion), `_material.scss` (theme and overrides), `_overlays.scss` (sheet and toast panel classes, which live in the CDK overlay outside components). The web build gets `inlineStyleLanguage: scss` and `stylePreprocessorOptions.includePaths: ["apps/web/src/styles"]`, so component styles use `@use 'breakpoints' as bp`.
- **Rationale**: request and constitution VII name the token file; mixins need SCSS in components.

## R3. Material themed to match

- **Decision**: `mat.theme` with `mat.$violet-palette`, `theme-type: light`, Manrope, density 0; then `mat.theme-overrides` pins the system colors to the tokens (`primary` `#7b2cf5`, `on-primary` white, `primary-container` soft violet, `surface` white, `background` `#f7f5f0`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `error` danger, `surface-container*` muted/sunken) and the corner shapes. Component overrides (`mat.button-overrides`, `mat.form-field-overrides`, `mat.chips-overrides`, `mat.tabs-overrides`, `mat.dialog-overrides`, `mat.menu-overrides`, `mat.snack-bar-overrides`) give: buttons 44 px high, radius `--app-radius-md`, weight 700, 14 px; `mat-flat-button` primary violet; `mat-stroked-button` white with `--app-color-border`; `mat-button` ghost; utility classes `.app-pill` (full radius) and `.app-gradient` (gradient and primary shadow). Outlined form fields (the app default through `MAT_FORM_FIELD_DEFAULT_OPTIONS`) on white with a `--app-color-border` outline and `--app-radius-md`. Chips outlined, selected violet. Dialog radius `--app-radius-xl`.
- **Rationale**: Decision 1 of the request (Material themed to match). Dark mode is dropped (Decision 2): `color-scheme: light`, `theme-type: light`, `<meta name="color-scheme" content="light">`.
- **Alternatives**: the old app's `.btn`/`.chip` classes on native elements (a second control system next to Material).

## R4. Building blocks built now, and where

In `client/libs/web/common/ui/src/lib/`, except the overlays, which live in `client/libs/web/common/overlays` (see plan, changes during implementation):

| Block | File | Used now by |
| --- | --- | --- |
| `Logo` (`full` / `mark`, `size`) | `brand/logo.ts` | top bar, auth pages, 404 |
| `Icon` (`name`, `label`, `size`) and the icon paths | `icons/icon.ts`, `icons/icon-paths.ts` | tab bar, top bar, account page, sheet ×, toast × |
| `Avatar` (`name`, `src`, `size`, `shape`) | `avatar/avatar.ts` | top bar, account page |
| `Viewport` (`isMd`, `isLg` signals; `isSm`, `isXl` join with their first user) | `layout/viewport.ts` | frame, sheets |
| `Sheets` service and `SheetLayout` component | `libs/web/common/overlays`: `sheet/sheets.ts`, `sheet/sheet-layout.ts` | support dialog |
| `Toasts` service (`success`, `error`) and `ToastView` | `libs/web/common/overlays`: `toasts/toasts.ts`, `toasts/toast-view.ts` | support dialog |
| `Skeleton` | `states/skeleton.ts` | help list and article loading |
| restyled `EmptyState`, `ErrorState`, `LoadingState`, `ProblemAlert` | `states/`, `forms/` | existing pages |

- **Icon**: the Lucide markup of `reference/brand/icons.ts` for the names used now (`map`, `message-square`, `user`, `x`, `info`, `log-out`, `chevron-right`); a later feature adds its icons to `icon-paths.ts` from the same file. The markup is a constant, rendered with `DomSanitizer.bypassSecurityTrustHtml` into an `<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">`; with `label` the host has `role="img"` and `aria-label`, otherwise `aria-hidden="true"`.
- **Logo**: the SVG of `reference/brand/logo.ts`, colors from the logo tokens, wordmark weight 800 in `--app-color-brand-ink`, font size = size × 0.56; host `role="img"`, `aria-label="Мастера рядом"`. The in-app highlight stays `#9a5cff` at 1.4 and the favicon keeps `#c9a8ff` at 1.5 (Decision 4: keep the difference, as in the old app).
- **Avatar**: lazy `<img alt="{name}">`; on no photo or a load error, the initials of the first two words, uppercase, white on `--app-gradient-primary`; circle or rounded (`--app-radius-md`).
- **Sheets**: `Sheets.open(component, data)` opens a Material dialog: below md `position: { bottom: '0' }`, width 100 %, max height 90 dvh, panel class `app-sheet-bottom` (top radius `--app-radius-xl`, slide-up); from md width `min(32rem, calc(100% - 2rem))`, panel class `app-sheet-dialog`. Backdrop click and Esc close it (Material default). `SheetLayout` has the grip bar (below md), the title (`h2`, labelled by `mat-dialog-title`), a × icon button «Закрыть», the body and a `[sheetFooter]` slot separated by a border. The request's declarative `open` model is not built: sheets are opened from services and frame actions, so a model would have no user.
- **Toasts**: `Toasts.success/error(message)`; `MatSnackBar.openFromComponent(ToastView)` with `duration` 3500, `politeness: 'polite'`, bottom centre, panel classes `app-toast app-toast-{kind}`; info dark (`--app-color-text`), success `--app-color-success`, error `--app-color-danger`; white text; × button «Закрыть уведомление»; max width 28 rem; below lg the panel sits above the tab bar (`margin-bottom` = tab bar height + safe area + `--app-space-2`).
- **Skeleton**: a block with the 1.2 s shimmer of `reference/styles/_controls.scss` (`--app-color-surface-muted` / `--app-color-surface-sunken`), `width`, `height`, `radius` inputs, `aria-hidden`; the page around it keeps a `role="status"` label «Загрузка».

## R5. Blocks and helpers deferred (FR-011), with their behaviour

Each is built by the first spec that shows it, from the named reference file, with exactly this behaviour:

| Block | First user | Behaviour |
| --- | --- | --- |
| `Rating` (`web/common/ui`) | 004 (master cards) | five stars, partial fill by clipping, `--app-color-star`; optional value «4,8» (one decimal, ru-BY) and count «(214)»; `role="img"`, label «Рейтинг 4,5 из 5, отзывов: 214» |
| `Tabs` (`web/common/ui`) | 007 (profile sections) | custom `role="tablist"`; `pill` (chip look, active violet) and `underline` (violet 2 px underline); optional count bubble; roving tabindex, ArrowLeft/ArrowRight wrap, Home/End; `stretch` fills the width; `selected` is a model |
| `SegmentedControl` (`web/common/ui`) | 007 («Клиент / Мастер») | two-option `role="radiogroup"` on a sunken pill track, selected option white with `--app-shadow-sm`; arrows move the selection; `value` is a model |
| `Swipe` directive (`web/common/ui`) | 004/005 (lists, photos) | touch only; fires `swipeLeft`/`swipeRight` when \|dx\| ≥ 50 px and \|dx\| ≥ 1.5 × \|dy\|; nested areas: the innermost claims the gesture (a shared `WeakSet` of handled events) |
| Avatar online dot and «Мастер» badge | 004 | dot 24 % of the size, `--app-color-success` with a white ring, bottom right; violet star badge «Мастер» bottom right |
| `formatPrice` + `price` pipe | 004 | `reference/format/price.ts`: input `{ kind: 'exact' \| 'from' \| 'free', amount }` as the API returns it; «45 р», «от 30 р», «12,5 р», «Бесплатно»; short form «0 р» for map pins; amounts `1.0-2` digits in `ru-BY`, `NBSP` before «р» |
| `plural` | 004 | `reference/format/plural.ts`: `Intl.PluralRules('ru')`, forms `[one, few, many]`, «5 мастеров» with `NBSP` |
| `chatTime`, `relativeDay`, `slotDate`, month abbreviations | 005/006 | `reference/format/dates.ts`: Minsk time (`+0300`), months without dots and «фев», «сен», «ноя»; «14:30» today, «Вчера», capitalised weekday within 7 days, else «12 авг»; «Сегодня», «Завтра», «Вчера», else «пт, 2 окт»; «28 авг · 10:00» |
| `duration` | 005 | «45 мин», «1 ч», «1 ч 30 мин» |
| `formatPhone` | 003 | «+375 (29) 123-45-67» from `+375XXXXXXXXX` |
| Toast kind `info` (dark) | the first informational message | `Toasts.info`, panel class `app-toast-info` with `--app-color-text` |
| Sunken field style (`.app-sunken`) | 004 (search) | outline transparent, background `--app-color-surface-sunken` |
| `NBSP` | with the first formatter | `reference/format/text.ts` |
| `MinskTime` (`Nails.Application/Common/Time/`) | 005 | from `TimeProvider`: instant ↔ Minsk `DateOnly` and wall-clock `TimeOnly`; the zone id `Europe/Minsk` is a constant |

- **Rationale**: AGENTS.md "Remove dead code … exports … that nothing uses" and `knip` in the definition of done; the request applies the same rule to formatters. Support tickets need no Minsk time: `created_at` is a UTC instant stamped by `AuditingInterceptor`.

## R6. Frame and manifest slots

- **Decision**: `ModuleManifest.navigation` is replaced by three optional slots in `libs/web/core/feature/src/lib/modules/module-manifest.ts`:
  - `frameItem?: FrameItem` = `{ label, icon, path, order, exact?, badge? }`, where `badge` is a `ProviderToken<FrameBadge>` and `FrameBadge` is `{ count: Signal<number> }`. The frame shows the items of the loaded manifests plus the core item «Профиль» (`/profile`, `user`, order 30) sorted by `order`; «Карта» (004) uses order 10 with `exact`, «Чаты» (006) order 20 with a badge. Badge: a violet bubble with the count and the hidden text «непрочитанных».
  - `accountLink?: AccountLink` = `{ label, icon, path }`: shown in the top bar's account area from lg and as a row of the account page. Help declares «Справка» → `/help` (`info`).
  - `frameAction?: FrameAction` = `{ label, icon, open: (injector: Injector) => Promise<void> }`: the top bar's ghost button from lg, the right-edge tab on the home page below lg, and a row of the account page. Support declares «Напишите нам» (`message-square`).
- **Rendering**: `AppLayout` renders the top bar when `Breakpoints.isLg()` and the tab bar otherwise, so only one navigation is in the accessibility tree. Tab bar: fixed bottom, `--app-tab-bar-height` plus `env(safe-area-inset-bottom)`, white with a top border, equal columns, icon over a 12 px label, active `--app-color-primary`; `<nav aria-label="Разделы">`, `aria-current="page"` from `routerLinkActive`. Top bar: sticky, `--app-top-bar-height`, white with a bottom border; logo link with `aria-label="Мастера рядом — на главную"`; items as pills (active: `--app-color-primary-soft` background, violet text); right: «Напишите нам» ghost button, «Справка» ghost link, the account (36 px avatar link «Профиль» when signed in, «Войти» pill when signed out, nothing while unknown). `main` gets bottom padding equal to the tab bar below lg.
- **Scroll**: `withInMemoryScrolling({ scrollPositionRestoration: 'top' })`.
- **Account page**: `libs/web/core/feature/src/lib/account/account-page.ts` at `/profile` (session required, title «Профиль»): 64 px rounded avatar, name, email, a list of rows (account links, frame actions) with a chevron, and «Выйти» (moved from the removed account menu). Spec 007 replaces it.
- **Alternatives**: a core `SupportDialog` token (core would know a module); rendering both bars with CSS (two navigations for screen readers).

## R7. Support module

- **Decision**: API module `Support` (`Modules:Support:Enabled`), schema `support`, table `tickets`. `POST /api/support/tickets`, `[AllowAnonymous]`, `[EnableRateLimiting("support")]`, 201 `{ ticketId }`. The policy is registered by `SupportModule.Register` through `services.Configure<RateLimiterOptions>`, partitioned by the client address with a fixed window from `Modules:Support:RateLimit` (`PermitLimit` 5, `Window` 00:01:00). The fixed-window-per-address partition used by Identity and Support moves into `Nails.Application/Common/RateLimiting/` (`FixedWindowLimitOptions` base class, `AddPerAddressPolicy<TOptions>`), and `SignInLimitOptions` derives from it; the shared `OnRejected` problem («Слишком много запросов. Попробуйте через минуту.», `rate-limited`) stays in the host.
- **Validation**: `[Required(ErrorMessage = "Напишите, чем мы можем помочь")]` (rejects whitespace), `[MaxLength(2000)]` text, `[MaxLength(200)]` contact; the service trims both and stores an empty contact as null. The user id comes from `ICurrentUser` (null when anonymous). Status `New`, stored as a string. `IAuditable` gives `created_at` and `updated_at` (the interceptor already stamps them).
- **Privacy**: the text and contact are never logged (no logging in the service).
- **Client**: `libs/shared/support/data-access` (`SupportApi.createTicket`), `libs/web/support/feature` (`manifest`, `SupportDialog` service that lazy-imports `SupportForm` and keeps the unsent draft in memory while the page lives, `SupportForm` in `SheetLayout`). The form: lead, «Сообщение» (textarea, 4 rows, `maxlength` 2000), «Как с вами связаться» (placeholder «Телефон или почта», `maxlength` 200), «Отправить» / «Отправляем…» (`mat-flat-button`, full width, disabled while sending). Blank message: toast error «Напишите, чем мы можем помочь», no request. Success: clear the draft, close, toast success «Сообщение отправлено, скоро ответим». Failure: toast error with `toProblem(error).title`.
- **Help**: `ru/articles/support.json` (`"module": "support"`, article `write-to-us`), so it disappears with the module.
