# Research: Phone sign-in, the old app's look, and a help center like CONNECT's

Sources: the user's instructions of 2026-10-08, `specs_requests/003-identity-accounts.md`, the old app (measured in the browser on `https://v1addd.github.io/nailsAppAngular/login` and its «Напишите нам» sheet), CONNECT (`D:\UO\connect`, the same template: `Connect.Api/Modules/Help`, `client/libs/web/core/feature/src/lib/help/*.tsx`), the current code.

## R1. Sign-in flow (Wildberries-like)

- **Decision**: three steps on one card. (1) «Телефон» with a fixed «+375» prefix and the mask «(29) 123-45-67»; «Получить код». (2) «Введите код из SMS», «Код отправлен на +375 (29) 123-45-67», six digit boxes over one `input` (`inputmode=numeric`, `autocomplete=one-time-code`, paste and SMS autofill work), submitted when complete; the countdown «Запросить код повторно через 0:59» then the text button «Запросить код повторно»; «Изменить номер». (3) only for a new phone: «Как вас зовут?», «Имя», «Продолжить».
- **API**: `POST /api/identity/sign-in/code { phone }` → `200 { codeLength, resendAfterSeconds }`; `POST /api/identity/sign-in { phone, code, name? }` → `200 { nameRequired }`: `false` means signed in; `true` means the code is right but the phone has no account, so the client asks the name and repeats the call with it. The code is consumed only when the session starts. `POST /api/identity/sign-out` and `GET /api/identity/me` → `{ id, name, phone }` stay.
- **Code storage**: table `identity.phone_codes` (one row per phone, unique index), the code hashed with `PasswordHasher<PhoneCode>`, `expires_at`, `attempts`. A new request deletes the old row when the resend interval passed, else 429. A wrong code increments `attempts`; at the limit or after `expires_at` the answer is «Код устарел. Запросите новый.». The code is 6 digits from `RandomNumberGenerator`.
- **Rules** (pure, `Modules/Identity/Rules/`): `BelarusPhone.Normalize` (strip spaces, brackets, dashes; accept `+375`, `375`, `80` prefixes plus 9 digits; else null), `PhoneCodeState.Of(expiresAt, attempts, maxAttempts, now)` → `Usable | Expired`, `PhoneCodeState.ResendWait(createdAt, interval, now)`.
- **Accounts**: `UserName` = the normalised phone (unique index already exists), `PhoneNumber` = the same, `PhoneNumberConfirmed` = true, no password, no email; `UserFactory.CreateAsync(name, phone)` creates the tenant and the owner in one transaction (moved from the removed `AccountService`). `SignInManager.SignInAsync(user, isPersistent: true)`.
- **Removed**: registration, email confirmation, resend, forgot/reset password (endpoints, `AccountController`, `AccountService`, `IdentityEmails`, `EmailTokens`, `LinkTokenOptions`, `RegistrationOptions`, the request types), the bootstrap owner (`BootstrapOptions`, `IdentityBootstrapper`, the compose variables `OWNER_EMAIL`/`OWNER_PASSWORD`), `AppOptions.ClientUrl` (used only by email links), `AddDefaultTokenProviders`, the password and lockout Identity options, and the client pages `/register`, `/confirm-email`, `/forgot-password`, `/reset-password`.
- **Rate limits**: the `identity` per-address policy stays on both anonymous endpoints; the per-phone resend interval caps SMS cost.
- **Alternatives**: email + password (dropped by the user); a stateless signed challenge (no attempt counting).

## R2. SMS delivery

- **Decision**: `ISmsSender` in `Nails.Infrastructure/Modules/Identity/Contracts/`, one implementation `Integrations/Sms/EmailSmsSender` that sends the text «Код для входа в «Мастера рядом»: 123456. Никому его не сообщайте.» as an email to `<digits>@<RecipientDomain>` through the existing `IEmailSender` (Mailpit in Development and Docker). Options `Modules:Identity:Sms:RecipientDomain` (`sms.local`; empty and required in Production, like the email settings).
- **Rationale**: no provider was chosen; spec 012 picks a Belarusian SMS gateway and adds its implementation behind the same interface.
- The code never goes to the logs (constitution IX).

## R3. Button, field and sheet sizes (old app, measured)

| Element | Old app | Implementation |
| --- | --- | --- |
| Regular button | 44 px, 14/700, radius 14, padding 8 20 | Material button overrides (already 44/14/700/14) |
| Large button (sign-in, logout) | 56 px, 16/700, radius 18 | class `.app-large` |
| Small ghost button (top bar) | 36 px, 14/700, radius 10, padding 6 12 | class `.app-small` |
| Field | label 14/400 `--app-color-text-muted` above, gap 6; input 50 px, 16 px, padding 12 16, radius 14, 1 px `--app-color-border`, focus `--app-color-primary`; hint 12 | global classes `.app-field`, `.app-field-label`, `.app-field-hint`, `.app-field-error`, `.app-input` on native elements with reactive forms; `mat-form-field` is no longer used |
| Sheet | header 12 12 8 20, title 18/700; body 0 20 16, form gap 16; footer 12 20 16, top border; lead 16 secondary; panel radius 24, max width 32 rem | `SheetLayout` |
| Icons | centred | `.mdc-button__label` becomes `inline-flex` with `align-items: center` and a gap; `app-icon` is `inline-flex` |

- **Login card** (`design/*/login.png`): max width 26 rem, white, border, radius 18; a hero band (lilac gradient `--app-brand-hero-bg` with the dot pattern `--app-brand-pattern-dot`) holding the full logo at 44 px and the tagline 16/600 `--app-brand-ink-soft`; body padding 24; title 28/800; lead 16 secondary.
- **Account page** (`design/phone/profile-client-settings.png`): a white header with the 64 px rounded avatar, the name 20/700 and the phone; a card with the caption «ПРОЧЕЕ» (12/700 caps muted) and rows 56 px with a chevron; the full-width large «Выйти из аккаунта» (`--app-color-danger` text on `--app-color-danger-soft`, border `--app-color-danger-border`).

## R4. Help center like CONNECT's

- **Decision**: port CONNECT's help content model and API to this template, and rebuild its React screens in Angular with the «Мастера рядом» tokens.
- **Content** (`Content/ru/articles/<module>.json`): `{ module, sections: [{ id, title, order, articles: [{ id, title, summary, order, keywords, blocks }] }] }`; blocks `heading | paragraph | list | steps | note (tone info|tip|warning) | image (file, alt, caption) | related (articleIds)`; `**bold**` inline. Sections with the same id from several modules merge; an article id appears once. Images live in `Content/ru/images/<articleId>/<name>.png`.
- **API**: `GET /api/help/content` → `{ site { title, description }, company { name, email, website }, sections [...] }`; `GET /api/help/images/{language}/{articleId}/{fileName}?v=<hash>` serves a PNG with `Cache-Control: public, max-age=…, immutable`. Options `Modules:Help:Images` (`MaxBytes`, `CacheSeconds`, `ContentTypes`). Unusable blocks are dropped with a warning in the log.
- **Client** (`libs/shared/help/data-access`: the store and pure search; `libs/web/help/feature`: screens): home with «Чем мы можем помочь?» and section cards; article with the path, blocks, «Не нашли ответ?», previous and next; search with highlights; a sticky sidebar from lg, the «Разделы справки» sheet below lg; pictures open full size in a new tab.
- **Not ported**: CONNECT's footer columns, operating-system pictures, the automated screenshot tool and its dark theme.

## R5. Help pictures

- **Decision**: pictures are PNG screenshots of the running app at 390 px wide (phone) taken by hand through headless Chrome; the procedure is in `README.md` («Help pictures»). AGENTS.md requires retaking a picture when its screen changes.

## R6. Deferred from the request

| Item | First user |
| --- | --- |
| `SessionStore.role`, `activeRole`, `setRole`, the `nails.role` preference | 007/008 (client/master switch) |
| `SessionStore.unread` | 006 |
| `SessionStore.patchMe` | 007 (profile editing) |
| `account-disabled` (blocking an account) | the first admin feature |
