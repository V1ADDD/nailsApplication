# Feature Specification: Marketplace foundation for «Мастера рядом»

**Feature Branch**: `001-core-marketplace-foundation`

**Modules**: core, identity, help, catalog, masters

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "Initialize the project from the template for «Мастера рядом», a web marketplace where beauty masters in Belarus (nails, brows, lashes, cosmetology, makeup, depilation) sell their services; clients find masters, compare exact prices, book free time and chat with the master; every account acts as client and master. Use the template's technologies instead of the ones the scenario proposes and build the base of the product on the idea and the existing template."

## User Scenarios *(mandatory)*

### User Story 1 - A Russian-speaking visitor uses the product in Russian (Priority: P1)

A visitor from Belarus opens «Мастера рядом» on a phone. Everything they see is in Russian: the header, the home page, the sign-in and registration pages, the password pages, the empty, loading and error states, the messages the server returns and the emails. They create an account with their name, email and a password, confirm the email, sign in and sign out. They never meet the words "organization" or "workspace": an account belongs to one person.

### User Story 2 - A visitor browses the catalog of services (Priority: P1)

Without signing in, a visitor sees the six categories of the marketplace (Ногти, Брови, Ресницы, Косметология, Макияж, Депиляция) and the services inside each category, for example «Маникюр с покрытием гель-лак». The same list of services and the list of Belarusian cities are the shared reference for masters and for search.

### User Story 3 - A signed-in user becomes a master and publishes a price list (Priority: P1)

A signed-in client decides to offer services. They open «Кабинет мастера», fill in the public name, a short description, a phone, a city and the address of the place where they work, and save the profile. Then they add services from the catalog to their price list. For each service they choose one price kind: an exact price («45 р»), a starting price («от 30 р») or free («Бесплатно»), and the duration. They can change or remove a service later and edit the profile. The same account keeps acting as a client.

### User Story 4 - A visitor finds masters and compares exact prices (Priority: P2)

Without signing in, a visitor opens «Мастера», chooses a category or a single service and, optionally, a city, and sees the masters that offer it. When a single service is chosen, the list shows that service's price for every master and puts the cheapest first, so prices are compared at a glance. The visitor opens a master's page to see the description, the city and address, the phone and the full price list grouped by category.

### Edge Cases

- A visitor opens a master page that does not exist or whose owner removed every service: they see «Мастер не найден.».
- A master without any service in the price list does not appear in search; their own cabinet tells them to add a service.
- A user adds a service that is already in their price list: they see «Эта услуга уже есть в вашем прайсе.».
- A user saves the profile after changing it in another tab: they see «Профиль изменился в другой вкладке. Обновите страницу и попробуйте снова.».
- A user who has no master profile tries to change a price list: the server refuses with «Сначала создайте профиль мастера.».
- A user tries to create a second master profile: «Профиль мастера уже создан.».
- An exact or starting price of zero or below, a free price with an amount, a price above the limit, a duration outside 5 minutes to 12 hours, or a phone that is not a Belarusian number are rejected with a Russian message next to the field.
- The search finds nothing: «По вашему запросу мастеров пока нет.».
- The server cannot be reached: every data view shows its error with «Повторить».
- A phone 360 px wide shows every page without horizontal scrolling.
- The Masters module is switched off: «Мастера» and «Кабинет мастера» disappear from the navigation and the help, their addresses show «Такой страницы нет.», and the rest works.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The template MUST be initialized as the product Nails, without the Notes example module, and the constitution MUST be ratified with the «Мастера рядом» principles and the template's stack.
- **FR-002**: Every user-facing text MUST be Russian: pages, page titles, navigation, buttons, labels, hints, empty, loading and error states, toasts, aria labels, the problem details the server returns (including field validation messages and password rules), and the emails. The page language MUST be declared as Russian.
- **FR-003**: Registration MUST ask only for a name, an email and a password; every account MUST get its own private space without naming an organization.
- **FR-004**: The system MUST provide the six categories, their services with stable slug ids, and the main Belarusian cities, readable without signing in.
- **FR-005**: A signed-in user MUST be able to create exactly one master profile with a public name, a description, a Belarusian phone, a city from the list and an address, and later change it.
- **FR-006**: A master MUST be able to add catalog services to their price list, each once, with a price kind (exact, from, free), an amount in BYN with up to two decimals for exact and from prices, and a duration in minutes; and MUST be able to change and remove them.
- **FR-007**: Only the owner of a master profile MUST be able to change it and its price list; changing a price list MUST require a master profile.
- **FR-008**: Visitors MUST be able to list masters that have at least one service, filtered by category, by service and by city, page by page, and the list MUST show each master's name, city, categories and headline price.
- **FR-009**: The headline price MUST be the chosen service's price when a service is chosen; otherwise the lowest price of the matching services shown as a starting price, or «Бесплатно» when every matching service is free. When a service is chosen, masters MUST be ordered by that price, lowest first.
- **FR-010**: Visitors MUST be able to open a master's public page with the description, city, address, phone and price list grouped by category.
- **FR-011**: Prices MUST be shown only as «45 р», «от 30 р» or «Бесплатно» (amounts with decimals as «45,50 р»), phones as «+375 (29) 123-45-67», counts with Russian plurals, and dates and times in the ru-BY locale with a 24-hour clock.
- **FR-012**: Every change a user makes MUST show a success message or an error and disable its button while it runs; every data view MUST have loading, empty and error states with «Повторить».
- **FR-013**: The interface MUST work from 360 px wide on phones up to desktops, with visible focus, labelled controls and the Manrope font.
- **FR-014**: The home page MUST be public and lead to the areas of the product that are switched on.
- **FR-015**: The help center MUST be in Russian and MUST describe registration, sign-in, password reset, sign-out, the catalog, finding masters and the master cabinet.

### Key Entities *(include if feature involves data)*

- **Account**: a person who signs in; has a name, an email, a password and its own private space. Acts as a client always and as a master when it has a master profile.
- **Category**: one of the six areas of beauty services; slug id, Russian name, order.
- **Service**: a catalog service inside a category; slug id, Russian name, order.
- **City**: a Belarusian city a master works in; slug id, Russian name, order.
- **Master profile**: the public face of an account as a master; public name, description, phone, city, address; one per account.
- **Price list item**: a service a master offers; the catalog service, price kind (exact, from, free), amount in BYN, duration in minutes.

## Assumptions

- The stack stays the template's (.NET 10, EF Core 10, PostgreSQL, Angular 22, Nx, Angular Material themed with design tokens and Manrope, cookie sessions); the scenario's JWT tokens, SignalR, Leaflet, NgRx, Jest and the scenario's repository layout are not adopted. The template's rule "no tests" stays.
- The user decided: no tests, Russian text directly without an i18n framework, Angular Material kept and themed, and this first spec delivers the foundation only.
- Out of scope for this spec and left to later specs: the map and distance search, free time slots and bookings, chats and realtime updates, reviews, photos and media, support, the master's statistics, and the client's own profile and phone.
- Without the map, a master gives a city and a text address; coordinates come with the map spec.
- A master's phone is public on their page so visitors can contact them until chats exist.
- The catalog, the cities and their names are reference data shipped with the product; editing them in the app is out of scope.
- A price above 100 000 р is a typing error and is rejected; a duration is between 5 minutes and 12 hours.
- Error codes stay the template's kebab-case codes.
