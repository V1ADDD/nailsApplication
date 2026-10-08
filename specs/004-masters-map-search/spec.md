# Feature Specification: Catalog, masters and the map home

**Feature Branch**: `004-masters-map-search`

**Modules**: catalog (new, always on), masters (new, switchable), identity, core, help; platform: web

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: the request `specs_requests/004-masters-map-search.md` (not tracked by git): the home screen `/` lets people find beauty masters near them on a map — the service catalog, the `Masters` marketplace module with search, filters, sorting, favourites and presence, a Development demo world, a Leaflet map with price pins and clustering, a search bar with suggestions, filter chips and a filters sheet, and the results list in a bottom sheet (phone), a floating panel (tablet) or a left column (desktop). The user asked to run the whole cycle, test and refactor, check sign-in, sign-out and the map, match the terms of reference and the design, and improve the design where needed.

## Design references

Old-app screenshots (first priority) copied into `design/`:

- Phone: `design/phone/map-guest.png`, `map.png`, `map-suggestions.png`, `map-filters.png`, `map-filter-price.png`, `map-pin-card.png`, `map-list-half.png`.
- Tablet: `design/tablet/map.png`, `map-guest.png`.
- Desktop: `design/desktop/map.png`, `map-guest.png`, `map-suggestions.png`, `map-filters.png`.
- The customer's phone design: `specs/_design-references/figma/01-map-home.png` (pins, chips, the tab bar).

## User Scenarios *(mandatory)*

### User Story 1 - A visitor finds masters near them on the map (Priority: P1)

A guest or a signed-in person opens the site. The map of Minsk fills the screen with violet price pins («от 30 р»); nearby pins merge into numbered clusters. On a phone a sheet at the bottom says «26 мастеров рядом · ● 12 онлайн»; pulled up, it lists master cards, nearest first. A card shows the photo with an online dot, the name with «Проверенный мастер», the specialty, stars «4,9 (214)», «Опыт 7 лет · 350 м · ● онлайн», the services with the headline price and the buttons «Записаться» and a heart. On a tablet the list floats on the left of the map; on a desktop it is a column with the search and the chips.

### User Story 2 - The visitor narrows the search (Priority: P1)

They type «маникбр» or «шеллак» in «Мастер, услуга, район...»: suggestions («Услуги») offer the matching categories and services; picking one filters the masters. Chips «Услуга», «Цена», «Расстояние», «Рейтинг», «Онлайн», «Свободное окно», «Город», «Проверенные» narrow the list; «Фильтры» opens a sheet with all sections and a button that counts live («Показать 12 мастеров»). The sort «Ближе / Рейтинг / Дешевле / Ближайшее окно / Популярные» reorders the list. The pins always show exactly the masters that match.

### User Story 3 - The visitor uses the map (Priority: P1)

They zoom with «Приблизить» / «Отдалить», tap a cluster to zoom into it, tap a pin to see a small card of that master (phone) or to jump to the card in the list (tablet, desktop). «Моё местоположение» asks the browser for the location, centres the map there and re-sorts by distance; if the location is not available the map stays in the centre of Minsk with «Не удалось определить местоположение — показываем центр Минска».

### User Story 4 - The signed-in person keeps favourites (Priority: P2)

A heart on the card adds the master to favourites («Добавить в избранное» / «Убрать из избранного»). A guest pressing the heart or «Записаться» goes to sign-in and comes back. The person's own master card shows «Это ваш профиль» instead of the buttons.

### User Story 5 - The team sees real data in development (Priority: P2)

In Development the API fills the database with the old app's demo world: 26 masters across Belarus with services, ratings, reviews, schedules and free time, Анна Новикова (+375 29 123-45-67) as a client and a master, and six clients. A command resets and reseeds it.

### Edge Cases

- No master matches: «Никого не нашли» / «Попробуйте изменить запрос или ослабить фильтры.» with «Сбросить фильтры»; without criteria: «Рядом пока нет мастеров.».
- The search fails: «Не удалось загрузить мастеров», the message and «Повторить».
- A query shorter than 2 letters gives no suggestions; Escape closes the list or clears the text.
- A price range keeps only the services inside it; a master without such services disappears.
- «Свободное окно» on a Sunday: «Выходные» means only that Sunday.
- A deleted master never appears; a master without services never appears.
- Many masters at one place: a cluster «N мастеров рядом, приблизить»; from zoom 18 pins are never merged.
- The heart of a missing master: «Мастер не найден».
- A phone 360 px wide shows the map page without horizontal scrolling.
- The masters area is switched off: «Карта» disappears and `/` opens «Профиль» as before.

## Requirements *(mandatory)*

### Functional Requirements

**Catalog**

- **FR-001**: The service catalog (7 categories, their subcategories, add-ons and synonyms, exactly as the old app's) MUST be available to everyone with stable ids.
- **FR-002**: Typing at least 2 letters MUST suggest up to 6 categories and services, exact name matches first, then typo-tolerant and synonym matches.

**Search**

- **FR-003**: Search MUST match services, master names, specialties, districts and cities, tolerate typos (0 for words up to 3 letters, 1 up to 6, 2 longer) and synonyms; exact service matches rank before fuzzy ones.
- **FR-004**: Filters: service (category or subcategory), price from/to, distance (1/3/5/10 km), minimum rating (3/4/4,5), online now, verified, free time (today, tomorrow, the nearest weekend), city. A filter on services keeps only the matching services on the card, and the card's price is the cheapest of them.
- **FR-005**: Sorts: nearest (default), rating, cheapest, earliest free time, popular; ties by distance.
- **FR-006**: Results come in pages of 20 with every match on the map (up to 1000 pins) and the counts «N мастеров рядом» and «K онлайн».
- **FR-007**: The headline price MUST be the cheapest non-add-on service: exact for one service, «от X» otherwise, «Бесплатно» when the cheapest is free.
- **FR-008**: Rating MUST be the mean of clients' reviews to one decimal; the review count and the completed bookings are counted, never stored.
- **FR-009**: «Онлайн» MUST mean the master shows it and used the site in the last 5 minutes.

**Favourites**

- **FR-010**: A signed-in person MUST be able to add and remove a master from favourites; the card shows the state; a guest is sent to sign-in.

**Map page**

- **FR-011**: With the masters area on, `/` MUST be the map page titled «Мастера рядом — карта бьюти-мастеров», and the frame MUST show «Карта».
- **FR-012**: The page MUST follow the old app on phone, tablet and desktop (User Stories 1–3): search with suggestions, filter chips, the filters sheet with a live count, the sort, the list with infinite scroll, loading skeletons, empty and error states, price pins with online dots and clustering, zoom and location controls, the phone bottom sheet with three heights and the pin card, the tablet floating panel, the desktop column.
- **FR-013**: The chosen service MUST be kept in the address (`?service=`) and restored from it; the typed query, the other filters and the sort survive navigation inside the app but never enter the address (a typed query is free text, which the project's privacy rule keeps out of URLs).
- **FR-014**: On phones the map page MUST show «Напишите нам» as a tab on the right edge and, for a guest, a «Войти» button.

**Demo world**

- **FR-015**: In Development the database MUST be filled with the demo world once, and a command MUST reset and refill it; it MUST be impossible to switch on in Production.

**Help**

- **FR-016**: The help MUST explain how to find a master on the map: search, suggestions, filters, sort, the map controls, the pins, favourites, with pictures.

### Key Entities *(include if feature involves data)*

- **Category / service (subcategory)**: the fixed catalog with names, synonyms and add-on flags.
- **Master**: a public profile linked to one account: name, photo, specialty, categories, city, district, address and coordinates, experience, about, verification, contacts, whether to show «онлайн».
- **Master's service**: a catalog service with a price (exact, from, free) and a duration.
- **Course, portfolio photo**: shown on the profile (spec 005).
- **Favourite**: a person's saved master.
- **Schedule, slot, booking, review**: seeded now; their behaviour comes in specs 005–011.
- **Presence**: when the account last used the site.

## Assumptions

- The request's decisions are taken as recommended: filtering and ranking on the server with typo matching in the application (fine to about 5000 masters); Masters owns profiles, services, favourites, schedules, slots, bookings and reviews; a Development-only demo seed per module with deterministic ids; 20 per page and up to 1000 pins; location only on «Моё местоположение»; our own clustering; the map is the home page.
- Accounts sign in by phone (spec 003), so the demo accounts have phones and no password; in Development the SMS code is off. Demo master accounts get their own phones, because the fixture's phone of the first master equals Анна Новикова's.
- With the masters area off, `/` keeps opening «Профиль» (spec 003 removed the hero page).
- «Написать» (chats, 006) and the profile page `/masters/:id` (005) are not built yet: «Написать» is hidden, and the card's links lead to the profile route that 005 adds.
- `IAccountLinks.SetMaster` has no caller until the master cabinet (008); only `/me.masterId` is added now, set by the demo seed.
- Demo masters marked online stay online in Development (their last-seen time is set in the future by the seed), so the «онлайн» filter has data.
