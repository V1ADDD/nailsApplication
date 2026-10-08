# Feature Specification: Foundation for «Мастера рядом»

**Feature Branch**: `001-core-marketplace-foundation`

**Modules**: core, identity, help

**Created**: 2026-10-08

**Status**: Done

**Input**: User description: "Initialize the project from the template for «Мастера рядом», a web marketplace where beauty masters in Belarus (nails, brows, lashes, cosmetology, makeup, depilation) sell their services; clients find masters, compare exact prices, book free time and chat with the master; every account acts as client and master. Use the template's technologies instead of the ones the scenario proposes and build the base of the product on the idea and the existing template."

**Scope change (2026-10-08)**: the first version of this spec also built a catalog of services and a Masters module (master profile, price list, search). They were invented before the customer's terms of reference, draft specs and the earlier prototype were available, and they did not match them. At the user's request they were removed again in this spec: the app stays a bare foundation, and the catalog, masters, search, booking, chats and cabinets come from the requests in `specs_requests/` (not tracked by git), one spec each.

## User Scenarios *(mandatory)*

### User Story 1 - A Russian-speaking visitor uses the product in Russian (Priority: P1)

A visitor from Belarus opens «Мастера рядом» on a phone. Everything they see is in Russian: the header, the home page, the sign-in and registration pages, the password pages, the empty, loading and error states, the messages the server returns and the emails. They create an account with their name, email and a password, confirm the email, sign in and sign out. They never meet the words "organization" or "workspace": an account belongs to one person.

### Edge Cases

- The server cannot be reached: the shell shows its error with «Повторить».
- A field is left empty or too long, or the password is too short: the server answers with a Russian message next to the field.
- The email is already registered: «Этот адрес электронной почты уже зарегистрирован.».
- An unknown address: «Такой страницы нет.».
- A phone 360 px wide shows every page without horizontal scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The template MUST be initialized as the product Nails, without the Notes example module, and the constitution MUST be ratified with the «Мастера рядом» principles and the template's stack.
- **FR-002**: Every user-facing text MUST be Russian: pages, page titles, navigation, buttons, labels, hints, empty, loading and error states, aria labels, the problem details the server returns (including field validation messages and password rules), and the emails. The page language MUST be declared as Russian.
- **FR-003**: Registration MUST ask only for a name, an email and a password; every account MUST get its own private space without naming an organization.
- **FR-004**: Dates and times MUST use the ru-BY locale with a 24-hour clock.
- **FR-005**: Every change a user makes MUST show its result or an error and disable its button while it runs; every data view MUST have loading, empty and error states with «Повторить».
- **FR-006**: The interface MUST work from 360 px wide on phones up to desktops, with visible focus, labelled controls and the Manrope font.
- **FR-007**: The home page MUST be public and lead to the areas of the product that are switched on.
- **FR-008**: The help center MUST be in Russian and MUST describe registration, sign-in, password reset and sign-out.

### Key Entities *(include if feature involves data)*

- **Account**: a person who signs in; has a name, an email, a password and its own private space.

## Assumptions

- The stack stays the template's (.NET 10, EF Core 10, PostgreSQL, Angular 22, Nx, Angular Material themed with design tokens and Manrope, cookie sessions); the scenario's JWT tokens, NgRx, Jest and repository layout are not adopted. The template's rule "no tests" stays.
- The user decided: no tests, Russian text directly without an i18n framework, Angular Material kept and themed, and this first spec delivers the foundation only.
- Everything product-specific (catalog, masters, search and map, booking, chats, client account, master cabinet, delivery) is specified in later specs from the requests in `specs_requests/`.
- Error codes stay the template's kebab-case codes.
