# Feature Specification: Master profile and booking

**Feature Branch**: `005-masters-profile-booking`

**Modules**: masters (switchable), identity, core, help; platform: web

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: the request `specs_requests/005-masters-profile-booking.md` (not tracked by git): the public master profile at `/masters/:id` (hero, nearest free windows, services and prices, portfolio with a lightbox, «О себе» and courses, reviews, contacts), online booking in a sheet (service → day → time → conflict check → a pending booking, created atomically, that auto-cancels the client's overlapping booking), confirm and cancel for both sides, and the time rules that auto-confirm, release unconfirmed bookings and complete past ones.

## Design references

Old-app screenshots (first priority) copied into `design/`:

- Profile: `design/phone/master.png` (full page), `design/phone/master-guest.png`, `design/tablet/master.png`, `design/desktop/master.png` (two columns, sticky sidebar).
- Booking sheet: `design/phone/booking-sheet.png`, `design/phone/booking-sheet-time.png` (a time chosen, the check and the summary), `design/desktop/booking-sheet.png`.
- The customer's design has no screen for this page; cards and sections follow `specs/_design-references/figma/09-master-cabinet-card.png`.

## Clarifications

### Session 2026-10-11

- Q: How should the chats area (006) learn about booking changes? → A: The masters area announces every booking change. Nothing listens in 005; chats subscribes in 006.
- Q: Should the public profile show who wrote each review, or only «Клиент»? → A: The first name plus the last-name initial («Мария К.»), with the photo.
- Q: With auto-confirm on and a 0-minute delay, is a new booking confirmed at the moment it's made? → A: No. Every booking starts as waiting, and only the regular check auto-confirms it, so the wait can be up to one interval.
- Q: When a master has deleted their profile, who can still open it? → A: Nobody; it is «Мастер не найден» for everyone. When deleting (request 011), the master is warned that all their upcoming bookings with clients will be cancelled. Clients then see those bookings cancelled with the reason «Мастер прекратил работу».

## User Scenarios *(mandatory)*

### User Story 1 - A visitor looks at a master's profile (Priority: P1)

From a card or a pin on the map, a guest or a signed-in person opens a master's page. The tab reads «Анна Новикова — запись онлайн». At the top they see the photo with the online dot, the name, the specialty, the stars «4,9 · 214 отзывов», «Личность подтверждена», «● онлайн», «Опыт 7 лет» and «ул. Немиги 5, Центральный, Минск · 350 м от вас». Below that come «Ближайшие свободные окна» (up to three days with free times: «Сегодня», «Завтра», «пн, 12 окт»), «Услуги и цены» grouped by category with durations («1 ч 30 мин») and prices, «Портфолио» with a full-screen viewer («Фото 3 из 12»), «О себе», «Обучение и курсы», «Отзывы» signed «Мария К.» with the reviewer's photo or initials, and «Контакты» (phone, e-mail, Telegram, Viber, Instagram). On a phone a bar at the bottom shows «от 30 р» and «Записаться». On a desktop the services, portfolio and reviews fill the main column, and the hero, free windows and contacts stay in a sticky sidebar.

### User Story 2 - A client books a visit (Priority: P1)

The client taps «Записаться», a service's pill, or a time chip in the free windows. The sheet «Запись к мастеру» opens with the service, 14 day chips («Сегодня · 11 окт · 5 окон») and that day's times. Taken times read «занято», and times someone else is waiting on read «ожидает подтверждения». When the client picks a free time, the sheet checks their other bookings. A booking at the same time is shown in red and will be cancelled automatically. A booking within an hour is shown in amber with its address, so they can judge the travel. The summary lists the master, service, time, address and price, and says when the window will free itself if the master doesn't confirm. «Забронировать · 45 р» creates the booking, which waits for the master. The toast says «Запись создана — ждём подтверждения мастера».

### User Story 3 - The other side confirms or cancels (Priority: P1)

A pending booking waits for the side that didn't create it. That side confirms it, and the time becomes taken. Either side can cancel a pending or confirmed booking with a reason, and the time becomes free again. The screens for these actions arrive with chats (006), the client account (007) and the master cabinet (009). This spec provides the actions and their rules.

### User Story 4 - Bookings move on by themselves (Priority: P2)

A master who enabled auto-confirm gets client bookings confirmed some minutes after they were made. A booking nobody confirmed in time is cancelled as expired, and its time is free again. The deadline is the start for bookings made at most 2 hours ahead, 24 hours before the start for bookings made more than 24 hours ahead, and 2 hours before the start otherwise. A confirmed booking whose time has passed becomes completed.

### User Story 5 - A master sees their own page as clients do (Priority: P3)

A master opening their own profile sees «Это ваш профиль — так его видят клиенты». The button «Открыть кабинет» is added by spec 008 together with the cabinet. The heart, booking and time chips are not available.

### Edge Cases

- A missing or deleted master, for everyone including their own clients: «Мастер не найден» / «Возможно, ссылка устарела или мастер удалил профиль.» with «Найти мастера на карте». Booking, the free times and the reviews of a deleted master are not available either.
- A guest presses «Записаться» or the heart: sign-in, then back to the profile; for booking the sheet reopens with the same service.
- `?book=1&service=` in the address opens the sheet once the profile has loaded. The parameters are then removed so that going back doesn't reopen it.
- A requested service the master doesn't offer: nothing is preselected unless the master has only one service.
- No free time in the next 14 days: «Свободных окон пока нет. Напишите мастеру — возможно, он найдёт время.»; a day without times: «В этот день мастер не работает. Выберите другую дату.»
- Two people book the same time at once: exactly one wins; the other sees «Это окно уже занято, выберите другое время» and the times reload.
- Booking yourself: «Нельзя записаться к самой себе»; a service the master doesn't offer: «Мастер не оказывает эту услугу».
- The same side tries to confirm: «Запись подтверждает другая сторона»; confirming a booking no longer pending: «Запись уже не ожидает подтверждения»; cancelling a cancelled, completed or missed booking: «Эту запись уже нельзя отменить»; cancelling with an empty reason: «Укажите причину отмены».
- Someone who isn't a side of the booking can't see, confirm or cancel it.
- The conflict check fails: booking stays possible, without the warning.
- A master with several places at one time: clients see one free place per start; once it is taken the next one appears.
- The master has no services: «Мастер пока не добавил услуги»; no reviews: «Пока нет отзывов» / «Отзыв можно оставить после визита к мастеру»; reviews fail: «Не удалось загрузить отзывы» with «Повторить».
- Empty sections («Портфолио», «О себе», «Обучение и курсы», a missing contact) are hidden.
- A phone 360 px wide shows the profile and the sheet without horizontal scrolling.
- The masters area is switched off: the profile route and its actions don't exist.

## Requirements *(mandatory)*

### Functional Requirements

**Profile**

- **FR-001**: Anyone MUST be able to open a master's public profile with: name, photo, specialty, categories, city, district, address, distance from the visitor (default the centre of Minsk), rating, review count, experience, verification, online state, about, courses, contacts, services in the master's order with price and duration, portfolio, the headline price and the completed bookings count. A signed-in visitor also learns whether the master is a favourite and whether the profile is their own.
- **FR-002**: A deleted master MUST NOT be found by anyone: the profile, the free times, the reviews and booking all answer «Мастер не найден».
- **FR-003**: The page MUST follow the old app on phone, tablet and desktop as described in User Stories 1 and 5. That covers the hero, free windows, services grouped by category (unknown → «Другое»), the portfolio (first 6, then «Показать все N» / «Свернуть»), the viewer (wraps around, supports swipe and arrow keys), «О себе» with its line breaks, courses, reviews (the first 3, then «Показать все N»), contacts as links, the phone action bar, the desktop sticky sidebar, loading skeletons, and the not-found state.
- **FR-004**: «Назад» MUST go back inside the app, else to the map.

**Free time and reviews**

- **FR-005**: Anyone MUST be able to see a master's times from now through the end of the 14th day in Minsk time, one entry per start. Each entry is free, waiting for confirmation, or taken; a site booking is never shown to clients as different from any other taken time. Only free entries can be booked, one place at a time.
- **FR-006**: Anyone MUST be able to read a master's client reviews, newest first, in pages, with the average and the total. A review names the reviewer by their first name plus the initial of their last name («Мария К.»). If there is no last name it shows the first name alone, and if the account has no name it shows «Клиент». It also shows an avatar with their initials (their photo once accounts have photos, spec 007), the service, the date, the stars and the text. The full last name, the phone and the account id are never shown.

**Booking**

- **FR-007**: A signed-in client MUST be able to check a chosen free time against their own pending and confirmed bookings. The check reports those that overlap it, and those within 60 minutes before or after it.
- **FR-008**: A signed-in client MUST be able to book a free time for one of the master's services. The booking starts as waiting for the master, at the service's current price. Its length is the longer of the service and the time slot, at the master's address. Creating it and cancelling the client's overlapping bookings MUST happen together or not at all.
- **FR-009**: Each overlapping pending or confirmed booking of the client MUST be cancelled automatically as agreed by both sides, with the reason «Автоматически: новая запись на это же время», and its time freed. The response lists them, and the client sees «Запись к <мастер> на это же время отменена автоматически» for each.
- **FR-010**: Of two attempts to book the same place, exactly one MUST succeed; the other gets «Это окно уже занято, выберите другое время».
- **FR-011**: The booking sheet MUST behave as in User Story 2 and the request:
  - **Service.** Preselect the requested service, else the only service. With a requested service, show only it plus «Другие услуги (N)».
  - **Days and times.** Start on the first day with free time. Show 14 day chips with window counts and time chips with their states.
  - **Check.** Run the conflict check with its messages, show the summary and the release deadline as a preview.
  - **Submit.** «Забронировать · <цена>» / «Бронируем…», enabled only when a service and a time are chosen, ignores double presses. Errors show inline and reload the times.
  - **Success.** Close the sheet, reload the times, show the toasts. There is no client/master mode yet; it comes with 006 or 007.

**Confirm and cancel**

- **FR-012**: Only the two sides of a booking (its client, the owner of its master profile) MUST be able to act on it.
- **FR-013**: The side that didn't create a pending booking MUST be able to confirm it, and its time becomes taken.
- **FR-014**: Either side MUST be able to cancel a pending or confirmed booking with a reason of 1–300 characters (spaces trimmed), stating whether it was agreed. Its time becomes free.
- **FR-015**: A booking moves only along: waiting → confirmed, cancelled or expired; confirmed → cancelled or completed. The time follows the booking: waiting → waiting, confirmed → taken, cancelled or expired → free. Spec 009 adds two cases with the master's bookings screen: confirmed or completed → missed (only after the start), and a booking the master enters for an outside client, which starts confirmed with its time taken.

**Time rules**

- **FR-016**: About once a minute (configurable), the system MUST auto-confirm, release and complete bookings:
  - **Auto-confirm** a client-made booking once the master's auto-confirm delay has passed, if the master enabled it. Only this check auto-confirms: booking never confirms at once, even with a 0-minute delay.
  - **Release** a booking nobody confirmed by its deadline (User Story 4). It is cancelled as expired and agreed, on behalf of the side that should have confirmed, with «Запись не подтверждена вовремя — окно освободилось».
  - **Complete** a confirmed booking whose end has passed.

  A booking may show its old state for up to one interval after its deadline.
- **FR-017**: Every create, automatic cancel, confirm, cancel, release and completion MUST be announced by the masters area through its public contract, with the booking and the kind of change, right after the change is saved. Nothing listens in this spec; chats (006) subscribes. The masters area never calls chats.

**Help**

- **FR-018**: The help MUST explain the master's profile and how booking works, quoting the screen texts: the sheet, the conflict warnings, waiting for confirmation, the release deadline, auto-confirm and cancelling. It MUST include pictures of the profile and the sheet.

### Key Entities *(include if feature involves data)*

- **Master profile**: the public face of a master (spec 004), now shown in full.
- **Slot**: a bookable start time of a master with a length and a state: free, waiting, taken, or taken by an outside booking. A start can have several places when the master's capacity is above 1.
- **Booking**: a client's or an outside visit to a master. It records the service, the price as it was, the start, the length, the address and the state, who created it and when it was confirmed. If cancelled, it also records who cancelled, the reason, whether it was agreed and whether it expired.
- **Review**: a client's rating and text for a service, shown with the reviewer's first name, last-name initial and an initials avatar.
- **Master's schedule settings**: capacity per start and auto-confirm (on/off, delay in minutes), already stored (spec 004).
- **Booking event**: a notice that a booking was created, cancelled, confirmed, released or completed.

## Assumptions

- The request's decisions are taken as recommended; `/speckit-clarify` confirms them:
  - concurrency is optimistic on the slot, the loser gets «Это окно уже занято…», and capacity above 1 exposes one free place at a time;
  - the time rules run every 60 s and reads don't re-check deadlines.
- Deleting a master profile comes with the master cabinet's «Настройки» (request 011). That request changes as follows:
  - Before deleting, the master sees the warning «Все ваши предстоящие записи с клиентами будут отменены. Клиенты увидят причину «Мастер прекратил работу».»
  - Every upcoming pending or confirmed booking is cancelled by the master, not agreed, with the reason «Мастер прекратил работу» (instead of «Мастер удалил профиль»).
  - The profile is then hidden from everyone, so the exception «visible to people with a booking or a chat» is dropped.
  - Past bookings stay in the clients' history.
- The code differs from the request in places, and the code wins:
  - auto-confirm (on/off and the delay) and capacity are part of the master's schedule settings;
  - a price is exact, «от» or free, and a booking keeps the price kind with the amount.
- The demo world from spec 004 already has schedules, slots, bookings and reviews. Анна Новикова's bookings as a master are already seeded 1, 2.5 and 4 hours after the seed runs, so the seed doesn't change.
- The names of clients, on bookings and on reviews, come from the identity area. Identity gains a lookup for them, because no such lookup exists yet. Accounts have no photo yet, so reviews show initials. The photo from clarification 2 appears once spec 007 gives accounts photos.
- A review shows the account's current name, so a client who renames themselves changes the name on their past reviews.
- «Написать», a master's reply time and navigation to a chat after booking come with chats (006). Until then «Написать» is hidden and the client stays on the profile after booking. «Открыть кабинет» on the own profile is added by spec 008, which builds the cabinet it leads to.
- The release deadline in the sheet is a preview computed the same way as on the server.
- Request 004's card links (`/masters/:id?service=`, `?book=1`) are kept as they are.
