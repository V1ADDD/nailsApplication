# Implementation Plan: Phone sign-in, the old app's look, and a help center like CONNECT's

**Branch**: `003-identity-phone-sign-in` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-identity-phone-sign-in/spec.md`

## Summary

Replace email-and-password accounts with Wildberries-like phone sign-in (SMS code, a name for a new phone, no registration), give the sign-in card, the account page, buttons, fields and sheets the old app's exact sizes, and rebuild the help center after CONNECT's (sections, blocks, pictures, search, a phone-friendly topic sheet) with an agent rule that keeps it current.

## Technical Context

**Modules touched**: identity (always-on), core, help, support

**Platforms**: web; pure helpers in `libs/shared` (phone and countdown formatting, help search)

**Module interaction**: support reads the session (`SessionStore` in core) to prefill the phone; help is reached through the frame's `accountLink`.

**Stack**: .NET 10 (ASP.NET Core controllers, EF Core 10 on PostgreSQL), Angular 22 (Nx, signals, Angular Material). No new package.

**Storage**: `identity.phone_codes` (see [data-model.md](data-model.md)); migration `AddPhoneSignIn`.

**Contracts**: see [contracts/identity-and-help.md](contracts/identity-and-help.md): `POST /api/identity/sign-in/code`, `POST /api/identity/sign-in` (changed), `GET /api/identity/me` (changed), five email endpoints removed; `GET /api/help/content` (changed), `GET /api/help/images/{language}/{articleId}/{fileName}` (new).

**Settings** (all three environments unless noted):
- `Modules:Identity:Options`: only `User:RequireUniqueEmail` false and `SignIn:RequireConfirmedEmail` false (password and lockout options removed).
- `Modules:Identity:PhoneCode`: `Length` 6, `Lifetime` 00:05:00, `ResendInterval` 00:01:00, `MaxAttempts` 5.
- `Modules:Identity:Sms:RecipientDomain`: `sms.local` (Development, Docker), empty (Production, set by the environment).
- `Modules:Help:Images`: `MaxBytes` 2097152, `CacheSeconds` 31536000 (Development 0), `ContentTypes` `{ ".png": "image/png" }`.
- Removed: `App`, `Modules:Identity:TokenLifespan`, `Registration`, `Bootstrap`; compose `OWNER_EMAIL`, `OWNER_PASSWORD`.

**Constraints**: from 360 px; old app sizes (research R3); initial bundle under 700 kB.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched: I (phones shown through the shared formatter), II (phone and code rules as pure functions), III (contract), V (layers; SMS behind an interface), VII (public routes, tokens), VIII (anonymous endpoints), IX (rate limits; the code never logged), X (help, pictures).

| Gate | Status |
|---|---|
| I. Phones stored `+375XXXXXXXXX`, shown `+375 (29) 123-45-67` through `libs/shared/common/util` | Pass: `formatPhone` added now (first user) |
| II. Rules pure | Pass: `BelarusPhone`, `PhoneCodeState` in `Modules/Identity/Rules/` |
| III. Contract regenerated | Pass |
| V. External system behind an interface | Pass: `ISmsSender` |
| VII. Public routes are exactly the home page, sign-in and module routes | Change: registration, email confirmation and the password pages are removed; constitution 4.1.0 → 4.2.0 records it |
| VIII/IX. Anonymous endpoints rate-limited, no user text in logs | Pass |
| X. Help updated with pictures | Pass |
| No dead code, no hardcoded values, one type per file | Pass: deferred items in research R6; limits in settings |

Post-design re-check: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/003-identity-phone-sign-in/
├── plan.md  research.md  data-model.md  contracts/identity-and-help.md  checklists/requirements.md  tasks.md
└── design/{phone,tablet,desktop}/*.png      old-app screens and CONNECT help references
```

### Source Code

```text
api/
├── Nails.Api/
│   ├── Modules/Identity/Controllers/SessionController.cs          sign-in/code, sign-in, sign-out, me; AccountController removed
│   ├── Modules/Help/Controllers/HelpController.cs                 content, images
│   ├── Modules/Help/Content/{company.json, ru/site.json, ru/articles/*.json, ru/images/<articleId>/*.png}
│   └── appsettings.{Development,Docker,Production}.json
├── Nails.Application/
│   ├── Common/ApplicationServiceProviderExtensions.cs              no bootstrap
│   ├── Common/Exceptions/ErrorCodes.cs                            phone and code codes; email codes removed
│   ├── Modules/Identity/{IdentityModule.cs, Rules/, Options/PhoneCodeOptions.cs, Requests/, Responses/, Services/, Contracts/}
│   └── Modules/Help/{Services/HelpService.cs, Responses/*, Models/HelpImageAddress.cs}
└── Nails.Infrastructure/
    ├── Modules/Identity/{Entities/PhoneCode.cs, Configurations/PhoneCodeConfiguration.cs, Contracts/{IPhoneCodeRepository,ISmsSender}.cs, Repositories/PhoneCodeRepository.cs, Options/SmsOptions.cs, Integrations/Sms/EmailSmsSender.cs}
    ├── Modules/Help/{Models/*, Options/HelpImageOptions.cs, Repositories/HelpContentRepository.cs}
    └── Persistence/Migrations/*_AddPhoneSignIn.cs
client/
├── apps/web/src/styles/{_controls.scss (new), _material.scss, _overlays.scss}
└── libs/
    ├── shared/common/util/                       formatPhone, formatPhoneInput, formatCountdown
    ├── shared/core/data-access/                  IdentityApi.requestCode, SessionStore.signIn
    ├── shared/help/data-access/                  help search and inline text (pure)
    ├── web/common/ui/                            icon alignment
    ├── web/common/overlays/                      SheetLayout spacing
    ├── web/core/feature/src/lib/identity/        sign-in-card, sign-in-page, code-input; register, confirm, forgot, reset pages removed
    ├── web/core/feature/src/lib/account/         account page restyled
    ├── web/help/feature/                         help page, sidebar, home, article, blocks, search results, topics sheet
    └── web/support/feature/                      native fields, phone prefill
```

**Module switch**: Help off → no `Справка` in the frame or profile, no help API; Support off → as in spec 002. Identity is always on.

**Help**: `core.json` rewritten into sections «Начало работы» (`about`, `navigation`) and «Вход и аккаунт» (`sign-in`, `create-an-account`, `sms-not-arriving`, `sign-out`); `reset-your-password` removed with the feature; `support.json` keeps `write-to-us` in section «Поддержка». Pictures: the sign-in steps, the name step, the profile, the support sheet.

**Other docs**: `README.md` (sign-in by phone, SMS delivery, help content format and pictures), `AGENTS.md` (help rule), constitution 4.2.0.

**Structure Decision**: as listed above.

## Changes to earlier specs

- 002: the home page hero and the home-page edge tab «Напишите нам» (FR-016, FR-019) are removed; `/` redirects to `/profile`; «Напишите нам» is reached from the top bar, the profile and the sign-in page.
- 001: FR-003 (registration with name, email and password) and FR-008 (help about registration and password reset) are replaced by phone sign-in; the public routes `/register`, `/confirm-email`, `/forgot-password`, `/reset-password` are removed; `MeResponse` becomes `{ id, name, phone }`; the first-tenant bootstrap is removed.
- 002: the support sheet uses native fields and prefills the phone; the help module's content format and API change; `MAT_FORM_FIELD_DEFAULT_OPTIONS` and the form-field theme overrides are removed with the last `mat-form-field`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |

**Silenced rules**: none.

**Changes during implementation**:
- `PhoneCode` got a `sent_at` column: a resend updates the row in place (no delete-and-insert on the unique phone index), so `created_at` cannot drive the resend interval.
- The sign-in page lives inside the app frame (as in the old app's screenshots) and is lazy-loaded; a guest's «Профиль» and the home page's «Войти по номеру телефона» lead to it.
- `ProblemAlert`, `LoadingState`, the `log-out` icon, `MAT_FORM_FIELD_DEFAULT_OPTIONS`, the form-field theme overrides and the exported `Problem` type lost their last users and were removed; the initial bundle went from 596 kB to 423 kB.
- Help pictures are 2× phone screenshots, shown at most 24 rem wide; they were taken with headless Chrome over the DevTools protocol (README «Help content»).
- Help images are cached by the repository for the life of the process, like the JSON content; new pictures need a restart.
- Verified in the running app: a new phone (code from Mailpit, «Неверный код», name step, «Добро пожаловать!», the profile), an existing phone signing in without the name step, `phone-invalid`, `code-too-soon` («Новый код можно запросить через 59 с.»), `code-expired` after 5 wrong codes, the support sheet at the old app's exact sizes with the phone prefilled, the help on desktop and at 360 px (no horizontal scroll, the «Разделы справки» sheet, pictures, search).
- After the first build (user feedback): `optimization.styles.inlineCritical` is false in the production build, because Beasties switched the stylesheet on with an inline script blocked by `script-src 'self'`; the help spacing was tightened; the home page (`home-page.ts`), the home-page edge tab and `onHome` in `AppLayout` were removed, `/` redirects to `/profile`, and the sign-in page shows the frame actions under the card. Help: `navigation` rewritten with a picture of the help on a phone (`images/navigation/help.png`, the old `tab-bar.png` removed); `sms-not-arriving` and `write-to-us` name the new place of «Напишите нам»; every picture was retaken from the production build.
- Third round (user feedback): `.app-link` (text link button) and a centring rule for icon buttons in `_controls.scss`; `.app-pill`, `.app-gradient`, the chips/tabs/menu overrides, the `map` icon and the avatar's photo input removed as unused; `injectFrameActionRunner()` in `modules/frame.ts` replaces three copies of `action.open(injector)`; `SheetLayout` handles pointer drags on its grip and header (`touch-action: none`) and closes past 80 px; `HelpImageViewer` shows a picture over the page from `?image=<block index>` (history state marks pictures opened in place, so close goes back); `withInMemoryScrolling` is replaced by `provideScrollToTopOnPathChange()`, which scrolls to the top only when the path changes, so query changes such as `?image=` keep the position. Every help picture was retaken.
- Fourth round: `PhoneCodeOptions.VerificationRequired` (settings: Development and Docker `false`, Production `true`), `PhoneCodeResponse.codeRequired`, `SignInRequest.code` optional; `SessionService.VerifyCodeAsync` holds the code check and is skipped when verification is off; the sign-in page signs in straight after the phone when no code is required. No help change: users of a real deployment always get the code.
