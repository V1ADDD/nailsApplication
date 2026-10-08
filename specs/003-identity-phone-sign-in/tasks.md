---

description: "Task list for phone sign-in, the old app's look and the help center"
---

# Tasks: Phone sign-in, the old app's look, and a help center like CONNECT's

**Input**: Design documents from `/specs/003-identity-phone-sign-in/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: None. This project writes no tests.

## Phase 1: Setup

- [X] T001 Add `formatPhone` (`+375XXXXXXXXX` → «+375 (29) 123-45-67»), `formatPhoneInput` (up to 9 digits → «(29) 123-45-67») and `formatCountdown` (seconds → «0:59») in `client/libs/shared/common/util/src/lib/` and export them

---

## Phase 2: Foundational

- [X] T002 Add `client/apps/web/src/styles/_controls.scss` (`.app-field`, `.app-field-label`, `.app-field-hint`, `.app-field-error`, `.app-input`, `textarea.app-input`, `.app-large`, `.app-small`, centred button labels) per research R3 and `@use` it from `client/apps/web/src/styles.scss`; drop the form-field overrides and the `.mdc-text-field` rule from `_material.scss`
- [X] T003 [P] Make `Icon` `inline-flex` with `vertical-align: middle` in `client/libs/web/common/ui/src/lib/icons/icon.ts`
- [X] T004 [P] Restyle `SheetLayout` per research R3 (header 12/12/8/20, title 18/700, body 0/20/16, footer 12/20/16 with a border) in `client/libs/web/common/overlays/src/lib/sheet/sheet-layout.ts`

---

## Phase 3: User Story 1 + 2 - Sign in with the phone, new account on the way (P1)

- [X] T005 [P] [US1] Add rules `BelarusPhone.Normalize` and `PhoneCodeState` in `api/Nails.Application/Modules/Identity/Rules/`
- [X] T006 [P] [US1] Add `PhoneCode` (`phone` varchar(13) unique, `code_hash` varchar(200), `expires_at`, `attempts`, `IAuditable`), `PhoneCodeConfiguration`, `IPhoneCodeRepository` (`FindAsync`, `Add`, `Remove`) and `PhoneCodeRepository` in `api/Nails.Infrastructure/Modules/Identity/`
- [X] T007 [P] [US1] Add `ISmsSender` in `api/Nails.Infrastructure/Modules/Identity/Contracts/`, `SmsOptions` (`[Required] RecipientDomain`) in `Options/` and `EmailSmsSender` in `Integrations/Sms/`
- [X] T008 [US1] Add `PhoneCodeOptions` (`Length` 4–8, `Lifetime`, `ResendInterval`, `MaxAttempts`), `PhoneCodeRequest`, `SignInRequest { Phone, Code, Name? }`, `PhoneCodeResponse`, `SignInResponse`, `MeResponse { Id, Name, Phone? }`; rewrite `ISessionService`/`SessionService` (request code, sign in or create, sign out, me) and `UserFactory.CreateAsync(name, phone)`; error codes `phone-invalid`, `code-too-soon`, `code-invalid`, `code-expired` in `api/Nails.Application/`
- [X] T009 [US1] Remove registration, email confirmation, password reset and the bootstrap: `AccountController`, `AccountService`, `IAccountService`, `IdentityEmails`, `EmailTokens`, `IdentityErrors` parts, `LinkTokenOptions`, `RegistrationOptions`, `BootstrapOptions`, `IdentityBootstrapper`, `IIdentityBootstrapper`, `AppOptions`, the request/response types, unused error codes; update `IdentityModule`, `ApplicationServiceProviderExtensions`, `ApplicationServiceCollectionExtensions`, `RussianIdentityErrorDescriber`
- [X] T010 [US1] Rewrite `SessionController` (`POST sign-in/code`, `POST sign-in`, `POST sign-out`, `GET me`) in `api/Nails.Api/Modules/Identity/Controllers/SessionController.cs`
- [X] T011 [US1] Update the three `appsettings.{Environment}.json` (Identity options, `PhoneCode`, `Sms`, removed sections), `docker-compose.yml` and `.env.example`
- [X] T012 [US1] Add the migration `AddPhoneSignIn`, build `api/`, regenerate `schema.ts`
- [X] T013 [US1] Update `api-paths.ts`, `IdentityApi` (`requestCode`) and `SessionStore` (`signIn` returning `nameRequired`, `me` with `name` and `phone`) in `client/libs/shared/core/data-access/`
- [X] T014 [US1] Replace `AuthCard` with `SignInCard` (hero band, logo 44, tagline, body) and add `CodeInput` (six boxes over one input) in `client/libs/web/core/feature/src/lib/identity/`
- [X] T015 [US1] Rewrite `SignInPage` with the phone, code and name steps, countdown, errors and «Добро пожаловать!» in `client/libs/web/core/feature/src/lib/identity/sign-in-page.ts`; load it lazily
- [X] T016 [US1] Remove `register-page.ts`, `confirm-email-page.ts`, `forgot-password-page.ts`, `reset-password-page.ts`, `auth-form.styles.ts`, their routes and paths; send a signed-in visitor on to `returnTo` or `/profile`

---

## Phase 4: User Story 3 - Account page (P1)

- [X] T017 [US3] Restyle `AccountPage` per research R3 (header card, «ПРОЧЕЕ» rows, large soft red «Выйти из аккаунта», formatted phone) in `client/libs/web/core/feature/src/lib/account/account-page.ts`

---

## Phase 5: User Story 4 - The old app's look (P1)

- [X] T018 [US4] Rewrite `SupportForm` with native fields (`.app-field`, `.app-input`), the old app's sheet spacing and the phone prefill in `client/libs/web/support/feature/src/lib/support-form.ts`
- [X] T019 [US4] Use `.app-small` for the top bar's ghost buttons and «Войти», and check every page for icon alignment in `client/libs/web/core/feature/src/lib/layout/`; remove `MAT_FORM_FIELD_DEFAULT_OPTIONS` from `provide-nails.ts`

---

## Phase 6: User Story 5 - Help center (P2)

- [X] T020 [P] [US5] Port the help content model: `HelpDocument`, `HelpSectionDocument`, `HelpArticleDocument`, `HelpBlockDocument`, `HelpImageFile`, `HelpImageOptions`, the repository with PNG reading in `api/Nails.Infrastructure/Modules/Help/`
- [X] T021 [US5] Port `HelpService` (sections merge, blocks, images, related) and the responses `HelpContentResponse`, `HelpSectionResponse`, `HelpArticleResponse`, `HelpBlockResponse`, `HelpBlockType`, `HelpNoteTone`, `HelpImageResponse`, `HelpImageAddress` in `api/Nails.Application/Modules/Help/`; `HelpController` with `content` and `images`; settings `Modules:Help:Images`
- [X] T022 [US5] Add pure `searchHelp`, `findHelpArticle`, `helpSearchTerms`, `parseHelpInline` in `client/libs/shared/help/data-access/src/lib/`
- [X] T023 [US5] Build the help screens in `client/libs/web/help/feature/src/lib/`: `HelpPage` (home, article, search, unknown article), `HelpSidebar`, `HelpHome`, `HelpArticleView`, `HelpBlocks`, `HelpInlineText`, `HelpHighlight`, `HelpSearchResults`, `HelpTopicsSheet`
- [X] T024 [US5] Rewrite the help content in `api/Nails.Api/Modules/Help/Content/ru/` (sections, blocks, the articles of plan «Help») and take the pictures into `ru/images/<articleId>/`

---

## Phase 7: Polish

- [X] T025 Add the help rule to `AGENTS.md`; update `README.md` and the constitution 4.1.0 → 4.2.0
- [X] T026 Run `dotnet build`, `has-pending-model-changes`, the vulnerable-package check, `npx nx run-many -t lint typecheck knip format-check build`, `npm audit`
- [X] T027 Check in the running app: phone sign-in for a new and an existing phone (codes in Mailpit), wrong code, resend countdown, the account page and sign-out, the support sheet prefill, the help on desktop and at 360 px, the frame icons and buttons against the old app
- [X] T028 Record changes during implementation in `plan.md`; check for duplication, comments, hardcoded values

## Dependencies

- Phase 1–2 first; API tasks T005–T012 before the client sign-in T013–T016; US3–US5 after US1; help T020–T024 independent of the sign-in.
