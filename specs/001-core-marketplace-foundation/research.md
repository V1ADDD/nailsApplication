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

- **Decision**: register `@angular/common/locales/ru-BY` and provide `LOCALE_ID = 'ru-BY'`; `lang="ru"`. Prices, phones, plurals and the NBSP constant live in `libs/shared/common/util` as pure functions; `web/common/ui` wraps them in `price` and `phone` pipes. Prices use `Intl.NumberFormat('ru-BY')` with no decimals for whole amounts and two otherwise.
- **Rationale**: one formatter for every platform; pipes keep templates simple.
- **Alternatives considered**: `CurrencyPipe` (prints «BYN» or «Br», not «р»).

## Theme

- **Decision**: `mat.theme` with the rose palette, typography `Manrope Variable` from the self-hosted `@fontsource-variable/manrope`, and app tokens as CSS custom properties (`--app-space-*`, `--app-radius-*`, `--app-max-width`) next to the Material system tokens; breakpoints 480, 768, 1024, 1280 px in components' media queries.
- **Rationale**: the web app's CSP allows fonts only from `self`; Material already exposes color and type tokens.
- **Alternatives considered**: Google Fonts (third-party request, CSP change).

## Tenancy for a marketplace

- **Decision**: registration creates a personal tenant named after the person; the organization field disappears. Catalog and masters data are not tenant-owned and carry the owner's user id.
- **Rationale**: keeps the template's tenancy for future private data (client notes, bookings stats) while letting every visitor read the marketplace.
- **Alternatives considered**: removing tenancy (large core change, needed later anyway); one shared tenant (breaks the invariant that a tenant is a private space).

## Catalog as an always-on module

- **Decision**: `Catalog` is always on like `Identity`; its `Contracts` may be used by other modules; its client code lives in `core`.
- **Rationale**: every marketplace module (masters, search, bookings, statistics) refers to services and cities; a switchable catalog would break them.
- **Alternatives considered**: catalog inside Masters (bookings and search would then depend on Masters); JSON files like Help (no relational use for later search queries).

## Headline price and ordering

- **Decision**: with a chosen service, the headline is that offer's price and the list is ordered by it ascending, then newest first; otherwise the headline is the lowest non-free price of the matching offers shown as «от», or «Бесплатно» if all are free, ordered newest first. Free prices are stored as 0, so ordering by price puts free first.
- **Rationale**: "compare exact prices" needs one comparable number per master for one service.

## Phone

- **Decision**: accept `+375 (29) 123-45-67`, `375291234567`, `80291234567` and similar; normalize to `+375` plus nine digits whose first two are a Belarusian code (15, 16, 17, 21, 22, 23, 25, 29, 33, 44).
- **Rationale**: covers mobile operators and regional landlines without a phone library.
