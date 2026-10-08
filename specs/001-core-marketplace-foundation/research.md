# Research: Marketplace foundation

## Scenario technologies versus the template

- **Decision**: keep the template's stack: .NET 10 controllers, EF Core 10, cookie sessions with antiforgery, Angular 22 with Nx, `httpResource` and signals, Angular Material, no tests.
- **Rationale**: the user asked to use the latest or the template's technologies instead of the scenario's (.NET 9 minimal APIs, JWT plus refresh tokens, NgRx SignalStore, Jest, own controls); the user chose no tests, Russian text directly and Material themed.
- **Alternatives considered**: adopting the scenario's JWT flow (the template's cookie session is already safer for a browser-only client), NgRx SignalStore (the template's `httpResource` and promise-based services already cover loading and error state), dropping Material (rewrites every screen).

## Russian server messages

- **Decision**: translate every `AppException` title, the host's fixed titles, and replace framework texts: a `RussianValidationMetadataProvider` sets Russian `ErrorMessage` on every `ValidationAttribute` (including the implicit `[Required]` of non-nullable properties) unless one is set; the invalid-model factory substitutes «Значение указано неверно.» for empty messages (JSON conversion errors); `ProblemResults.Customize` sets a Russian title by status for framework problems (401, 403, 404, 405 and the like); a `RussianIdentityErrorDescriber` translates ASP.NET Core Identity errors.
- **Rationale**: one place per framework source, no message strings on every request property.
- **Alternatives considered**: `ErrorMessage` on every attribute (repetitive, easy to forget); resource files (an i18n mechanism the constitution excludes).

## Client locale and formatting

- **Decision**: register `@angular/common/locales/ru-BY` and provide `LOCALE_ID = 'ru-BY'`; `lang="ru"`. The locale constant lives in `libs/shared/common/util`; the price, phone, plural and date helpers join it with the first feature that needs them.
- **Rationale**: one place for locale-dependent formatting on every platform.
- **Alternatives considered**: `CurrencyPipe` (prints «BYN» or «Br», not «р»).

## Theme

- **Decision**: `mat.theme` with the rose palette, typography `Manrope Variable` from the self-hosted `@fontsource-variable/manrope`, and app tokens as CSS custom properties (`--app-space-*`, `--app-radius-*`, `--app-max-width`) next to the Material system tokens; breakpoints 480, 768, 1024, 1280 px in components' media queries.
- **Rationale**: the web app's CSP allows fonts only from `self`; Material already exposes color and type tokens.
- **Alternatives considered**: Google Fonts (third-party request, CSP change).

## Tenancy for a marketplace

- **Decision**: registration creates a personal tenant named after the person; the organization field disappears.
- **Rationale**: keeps the template's tenancy for future private data (client notes, bookings stats) while letting every visitor read the marketplace.
- **Alternatives considered**: removing tenancy (large core change, needed later anyway); one shared tenant (breaks the invariant that a tenant is a private space).

## Removed with the scope change

The first version also decided the catalog as an always-on module, the headline price and ordering of masters, and the Belarusian phone rule. They left this spec with the Catalog and Masters code; the requests in `specs_requests/` decide them again from the terms of reference and the earlier prototype.
