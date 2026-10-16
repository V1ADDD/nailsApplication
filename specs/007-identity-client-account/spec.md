# Feature Specification: Profile shell and client account

**Feature Branch**: `007-identity-client-account`

**Modules**: identity, masters, core (the profile shell, media for avatars), help; platform: web

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: the request `specs_requests/007-identity-client-account.md` (not tracked by git): the profile shell at `/profile` with the «Клиент / Мастер» switch that also works by swipe and sets the current mode; the client account at `/profile/client/<section>` with real data: bookings (upcoming and past: confirm, cancel with a reason, «Перенести», «Написать», «Записаться снова», and leaving a review for a completed visit), favourites, reviews («Мои отзывы» and «Отзывы обо мне») and settings (the profile with a photo, phone, contact method, password, notification switches, info sheets, «Стать мастером», logout).

## Design references

Old-app screenshots (first priority) copied into `design/`:

- Bookings: `design/phone/profile-client-bookings.png`, `design/phone/profile-client-bookings-past.png`, `design/tablet/profile-client-bookings.png`, `design/desktop/profile-client-bookings.png`.
- Cancel and reschedule: `design/phone/profile-client-cancel-sheet.png`, `design/phone/profile-client-reschedule-sheet.png` (its layout only: the old app's cancel-and-rebook texts are replaced by the move request of FR-010a).
- Favourites: `design/phone/profile-client-favorites.png`, `design/tablet/profile-client-favorites.png`, `design/desktop/profile-client-favorites.png`.
- Reviews: `design/phone/profile-client-reviews.png`, `design/phone/profile-client-reviews-about.png`, `design/tablet/profile-client-reviews.png`, `design/desktop/profile-client-reviews.png`.
- Settings and its sheets: `design/phone/profile-client-settings.png`, `design/tablet/profile-client-settings.png`, `design/desktop/profile-client-settings.png`, `design/phone/profile-client-edit-sheet.png`, `design/phone/profile-client-phone-sheet.png`, `design/phone/profile-client-contact-sheet.png`, `design/phone/profile-client-rules-sheet.png`.
- The customer's design (second priority, phone layouts): `specs/_design-references/figma/04-client-bookings.png`, `specs/_design-references/figma/05-client-favorites.png`, `specs/_design-references/figma/06-client-reviews.png`, `specs/_design-references/figma/07-client-settings.png`, `specs/_design-references/figma/08-client-settings-bottom.png`.
- The new pieces (the review sheet, the photo row and any new settings sheet) have no reference and use the existing sheet and form style.

## Clarifications

### Session 2026-10-16

- Q: Sign-in is by phone and SMS code since spec 003, so there is no sign-in email. What is the email in the profile? → A: Optional, but unique across accounts; not confirmed and not used to sign in.
- Q: The phone is the sign-in identity. How does changing it work? → A: An SMS code is sent to the new number and must be entered; a number another account uses is refused.
- Q: Accounts have no password. What replaces the request's «Пароль» sheet? → A: «Выйти на других устройствах», which signs out every other device and keeps this one.
- Q: Who can read the reviews masters write about a client? → A: The client, and any master who has or had a booking with that client (the masters' view comes with spec 009).
- Q: Does a master profile created by «Стать мастером» appear in search right away? → A: No; it is hidden from search, the map and its public profile page until it has at least one service and a real map point (spec 008).
- Q: When a client presses «Перенести», is the old booking cancelled first or kept? → A: Neither cancel nor rebook: the client proposes a new time and the master confirms or declines it; until then the booking stays where it was.
- Q: Do the notification switches send anything yet? → A: No; they are only saved, and sending (including reminders 24 h and 2 h before a visit) comes in a later spec.
- Q: Can the author change or delete a review after sending it? → A: No; one review per side per completed visit within 30 days, final once sent; mistakes go through «Напишите нам».

## User Scenarios *(mandatory)*

### User Story 1 - A client manages their bookings (Priority: P1)

A signed-in client opens «Профиль». Above the content is the segmented control «Режим профиля» with «Клиент» and «Мастер»; the client side is open on «Записи», tab «Предстоящие». Each card shows the master's photo and name (a link to the profile), the service, «d MMM · HH:mm · адрес», the price and a status tag. A booking the master made shows «Ждёт вашего подтверждения» and «Подтвердите до d MMM, HH:mm» with «Подтвердить» (toast «Запись подтверждена»); one the client made shows «Ожидает подтверждения» and «Мастер подтвердит до …». «Написать» opens the chat with the master. «Отменить» opens «Отмена записи» with the booking line, the reasons «Изменились планы», «Плохое самочувствие», «Не успеваю к этому времени», «Другое» («Опишите причину»), the switch «По договорённости с мастером (без последствий)» and, while it is off, «Односторонняя отмена снижает рейтинг»; «Отменить запись» cancels with the toast «Запись отменена». «Прошлые» lists earlier visits newest first, loading more as the client scrolls, with «Записаться снова».

### User Story 2 - A client reschedules a visit (Priority: P1)

On an upcoming booking the client presses «Перенести». «Перенос записи» shows the booking line, explains «Выберите новое время. Мастер получит запрос на перенос; до его ответа запись остаётся на прежнем времени.» and offers the master's free times for the same service (the day chips and times of spec 005's booking sheet). «Предложить перенос» holds the chosen time, shows «Запрос на перенос отправлен», and the card adds «Перенос на d MMM, HH:mm ждёт ответа мастера» with «Отменить перенос». The master answers on the booking card in the chat with «Принять перенос» or «Отклонить перенос». If accepted, the booking moves to the new time, confirmed, and the old time is free. If declined, cancelled by the client or left unanswered in time, the booking stays where it was and the held time is released.

### User Story 3 - A client leaves a review after a visit (Priority: P1)

On a completed visit from the last 30 days that has no review from the client, the card shows «Оставить отзыв». The sheet «Отзыв о мастере» shows the visit line, the star picker «Оценка» (read as «1 из 5» … «5 из 5»), the optional «Комментарий» («Что понравилось, что можно улучшить», up to 1000 characters) and «Отмена» / «Отправить отзыв» («Отправляем…» while sending). After «Спасибо за отзыв!» the card shows the client's stars instead of the button, the review appears in «Мои отзывы» and in the master's profile, and the master's rating and review count change at once.

### User Story 4 - A client finds saved masters and reviews (Priority: P2)

«Избранное» lists the saved masters: a 60 px photo, the name with the verified badge, the specialty and stars, each a link to the profile. The filled heart «Убрать <имя> из избранного» removes a master at once with «Удалено из избранного: <имя>»; if the removal fails the master comes back. «Отзывы» has «Мои отзывы» and «Отзывы обо мне» with their counts; each card shows the master's name, the service, the stars, the date and the text.

### User Story 5 - A client edits the profile and settings (Priority: P2)

«Настройки» has «Аккаунт», «Уведомления», «Прочее» and the actions. «Редактировать профиль» edits the photo («Изменить фото», «Удалить фото»), «Имя и фамилия», «Электронная почта», «Telegram» and «Viber»; the side card shows the new photo, name and contacts at once. «Телефон» changes the phone used to sign in and seen by masters: the client enters the new number, presses «Получить код» and types the code from the SMS sent to it. «Выйти на других устройствах» signs out every other phone and browser and keeps this one. «Способ связи» chooses «Сообщения в чате» or «Телефонный звонок». Four switches («Push-уведомления», «Email», «На сайте», «Напоминания о записях») save at once with the toast «Сохранено» and revert with «Не удалось сохранить настройку». «Язык», «О приложении» and «Правила использования» open info sheets with «Понятно»; «Справка» opens the help center. «Выйти из аккаунта» signs out and goes to the home page.

### User Story 6 - A client becomes a master (Priority: P2)

A client without a master profile presses «Стать мастером». The sheet explains «Имя, телефон и фото перенесём из профиля клиента. Один аккаунт — две роли: переключайтесь между «Клиент» и «Мастер» в профиле.» and asks for «Направление», «Город» (Минск by default) and «Адрес, где принимаете». «Создать профиль мастера» creates the master profile from the account's name, photo, phone, email and contacts, shows «Профиль мастера создан» and opens the master side of the profile. From then on the settings show «Перейти в кабинет мастера» instead, and «Мастер» appears in «Режим профиля».

### User Story 7 - One account, two sides (Priority: P2)

A person with a master profile switches «Клиент» / «Мастер» by pressing a segment or by swiping left (master) or right (client) on a touch screen. The visible side is the current mode of spec 006, so chats and the badge follow it on every tab and device; opening an address under the master side switches to master mode. The master side's content is spec 008's; until then it shows a placeholder.

### Edge Cases

- A guest opens any `/profile` address: the sign-in card, then back to that address. `/profile` opens `/profile/client`; an old address with `?tab=favorites` (or another section) opens that section and keeps the other parameters.
- A person without a master profile, or with the masters area switched off, sees no «Мастер» segment, no swipe, and an address under the master side opens the client side.
- The masters area is switched off: the client side shows only «Настройки» (the profile, phone, contact method, notifications, info sheets, «Справка», logout); «Записи», «Избранное», «Отзывы» and «Стать мастером» disappear.
- The whole account fails to load: «Не удалось загрузить» with «Повторить»; one panel fails: its skeleton cards turn into the same block.
- Nothing to show: «Нет предстоящих записей» / «Выберите мастера на карте и запишитесь на свободное время.» with «Найти мастера»; «Прошлых записей пока нет»; «В избранном пока пусто» / «Нажмите на сердечко в профиле мастера, чтобы сохранить его здесь.» with «Найти мастера»; «Вы пока не оставляли отзывов» / «Оценить мастера можно после визита.»; «Отзывов о вас пока нет» / «Мастера смогут оставить отзыв после визита.»
- A booking changes elsewhere (the master confirms or cancels, a chat card is used, another tab): the card updates without a reload.
- Cancelling a booking that has already started, was cancelled or is otherwise not cancellable: spec 005's error as a toast, the sheet stays open. «Другое» without a reason: «Опишите причину»; longer than 300 characters cannot be typed.
- A move request: the master has no free time for the service in the next 14 days, so the sheet says «Свободного времени нет — напишите мастеру» and «Предложить перенос» is off; a second request while one is open, «Перенос уже ждёт ответа мастера»; the master answers a request that was already withdrawn, lapsed or answered, «Запрос на перенос уже неактуален»; the sheet shows spec 005's conflict check for the chosen time, and a time that overlaps another active booking of the client is refused with «В это время у вас уже есть другая запись» (nothing is cancelled automatically, unlike a new booking); a booking the master entered for an outside client cannot be moved from here; with chats off the master cannot answer until spec 009, so the request lapses.
- The client books another visit that overlaps the time held by their open move request: the request is withdrawn automatically, the held time is released, and the chat shows «Клиент отменил перенос». Cancelling the booking itself ends its request too.
- A review for a visit that is not completed: «Отзыв можно оставить после завершённого визита»; after 30 days: «Срок для отзыва истёк»; a second review: «Вы уже оставили отзыв об этом визите»; no stars: «Поставьте оценку»; a comment over 1000 characters cannot be typed («Не длиннее 1000 символов» if sent anyway); a booking the person is not part of: not found. Reviews cannot be edited or deleted.
- Profile errors: an empty name «Введите имя»; a bad email «Проверьте адрес почты»; a bad phone «Введите белорусский номер в формате +375 XX XXX-XX-XX» after leaving the field or submitting; an email another account uses «Эта почта уже используется другим аккаунтом»; a photo of another type or over 10 MB: spec 006's messages; a photo someone else uploaded is refused. A failed save keeps the sheet open with «Не удалось сохранить» or the server's message.
- Changing the phone: a number another account uses «Этот номер уже привязан к другому аккаунту», and no code is sent; the current number «Это ваш текущий номер»; a wrong code «Неверный код»; after 5 wrong codes or 5 minutes «Код устарел. Запросите новый.»; a new code only after a minute, as in spec 003. Until the right code is entered the old number stays.
- A Telegram name that is not 5–32 Latin letters, digits or underscores (with or without «@»): «Проверьте имя в Telegram»; a Viber number that is not Belarusian: «Введите белорусский номер в формате +375 XX XXX-XX-XX».
- Empty «Telegram» or «Viber» clears it, and the side card stops showing it.
- «Стать мастером» twice (another tab, a double press): «У вас уже есть профиль мастера». No direction: «Выберите направление»; no city from the list: «Выберите город»; no address: «Укажите адрес».
- A favourite master who deleted their profile disappears from «Избранное».
- A swipe inside an area that scrolls sideways (tabs, pills, a carousel) scrolls that area and does not switch the side.
- A phone 360 px wide shows every panel and sheet without horizontal scrolling; below 480 px the four section pills share the width equally.

## Requirements *(mandatory)*

### Functional Requirements

**Profile shell (core)**

- **FR-001**: `/profile` MUST require sign-in and show the segmented control «Режим профиля» with «Клиент» and «Мастер»: on phones a centred white bar with a bottom border, from desktop width left-aligned in the content width. «Мастер» MUST appear only for an account with a master profile while the masters area is on.
- **FR-002**: The address MUST decide the side: an address under `/profile/master` is the master side, anything else the client side, applied on every navigation. Pressing a segment, or a horizontal swipe on a touch screen (left → master, right → client; an inner area that scrolls sideways wins), MUST open `/profile/<side>`. The visible side MUST set the current mode of spec 006, so chats, the badge and other tabs follow it.
- **FR-003**: `/profile` MUST open `/profile/client`; `/profile/client` MUST open the section named by an old `?tab=` (default «Записи»), dropping `tab` and keeping the other parameters. The master side's content belongs to spec 008; until then it shows a placeholder «Кабинет мастера появится здесь» with «Перейти в режим клиента».

**Client account frame**

- **FR-004**: The client side MUST have the sections «Записи» (`bookings`, title «Мои записи»), «Избранное» (`favorites`, «Избранное»), «Отзывы» (`reviews`, «Отзывы») and «Настройки» (`settings`, «Настройки»), each with its own address. Sections of the masters area MUST come from that area and disappear when it is off; «Настройки» belongs to the core and is always there.
- **FR-005**: The frame MUST show a side card (a 64 px rounded photo or the initials, the name, the phone «+375 (29) 123-45-67», «Telegram · Viber» for those filled) and the section navigation: pills on phones, four equal pills below 480 px, a vertical menu with icons from desktop width. Layout: one column on phones; from tablet centred at most 45rem wide; from desktop a 20rem sticky card next to the content.
- **FR-006**: Each panel MUST show skeleton cards while loading and «Не удалось загрузить» with «Повторить» on failure; the same block replaces the whole account if the account itself fails.

**My bookings (masters)**

- **FR-007**: The person MUST be able to list their bookings as a client in two scopes: «Предстоящие» (pending or confirmed with a future start, soonest first) and «Прошлые» (everything else, newest first, in pages of 20 loaded on scroll). The scope is in the address (`?sub=past`, replacing history). One column, two from wide desktop. A booking change pushed live (spec 006) for one of the person's bookings MUST refresh it.
- **FR-008**: A card MUST show the master's photo and name (a link to the profile), the service, «d MMM · HH:mm · адрес» in Minsk time and the price, and one status tag (upcoming / past): pending created by the master «Ждёт вашего подтверждения» (warning) / «Не подтверждена» (muted); pending created by the client «Ожидает подтверждения» (warning) / «Не подтверждена» (muted); confirmed «Подтверждено» (success) / «Прошла» (muted); completed «Завершено» (success); no-show «Неявка» (danger); cancelled «Отменено» (danger). Upcoming pending adds «Подтвердите до d MMM, HH:mm» or «Мастер подтвердит до d MMM, HH:mm»; cancelled adds «Вы отменили» or «Мастер отменил», « по договорённости» when mutual, and «. Причина: …».
- **FR-009**: Actions MUST be: «Подтвердить» when the client must confirm (toast «Запись подтверждена»); «Написать» (opens the chat, spec 006, only while chats are on); on upcoming «Перенести» and «Отменить»; on past «Записаться снова» (the master's booking sheet with the same service), «Оставить отзыв» when the visit can be reviewed, otherwise the stars of the client's review if there is one. Confirm and cancel follow spec 005's rules and errors.
- **FR-010**: The cancel sheet «Отмена записи» MUST show «**Мастер** · услуга · d MMM · HH:mm», the reasons of User Story 1, «Опишите причину» up to 300 characters for «Другое», the switch «По договорённости с мастером (без последствий)», the warning «Односторонняя отмена снижает рейтинг» while the switch is off, and «Назад» / «Отменить запись». A failure shows an error toast and keeps the sheet open.
- **FR-010a**: A client MUST be able to ask to move an upcoming pending or confirmed booking to another free time of the same master and service, through the sheet «Перенос записи» of User Story 2 («Назад» / «Предложить перенос»). The chosen time is held for the client like a pending booking, so nobody else can take it; a time taken meanwhile is «Это окно уже занято, выберите другое время». A booking has at most one open move request («Перенос уже ждёт ответа мастера»). The booking keeps its time and status until the master answers.
- **FR-010b**: The master MUST be able to accept or decline a move request with «Принять перенос» / «Отклонить перенос» on the chat booking card (spec 006); the master's bookings screen (spec 009) adds the same actions. Accepting moves the booking to the new time as confirmed and frees the old time; declining releases the held time and keeps the booking. The client MAY withdraw it with «Отменить перенос». An unanswered request MUST lapse at the earlier of spec 005's confirmation deadline for the new time and the start of the current booking, keeping the booking as it was. Cancelling the booking by either side ends its request.
- **FR-010c**: Each step of a move request MUST post a system message in the chat and refresh the booking for both sides live: «Клиент предлагает перенести запись на d MMM, HH:mm», «Мастер принял перенос на d MMM, HH:mm», «Мастер отклонил перенос», «Клиент отменил перенос», «Запрос на перенос истёк». Toasts for the client: «Запрос на перенос отправлен», «Перенос отменён»; for the master: «Запись перенесена», «Перенос отклонён». A move is never counted as a cancellation and does not affect the rating.

**Reviews (masters)**

- **FR-011**: A side of a booking MUST be able to write one review about the other side: a rating 1–5 and an optional text up to 1000 characters. Allowed only for a completed visit («Отзыв можно оставить после завершённого визита»), within 30 days of its completion («Срок для отзыва истёк»), once per side («Вы уже оставили отзыв об этом визите»); a missing rating is «Поставьте оценку». The window comes from settings. A review is final once sent: nobody can edit or delete it; the help points to «Напишите нам» for mistakes. This spec builds the client side; the master side (a master about a client) is used by spec 009.
- **FR-012**: A master's rating and review count MUST include a new review at once, on search (spec 004), the card and the profile (spec 005).
- **FR-013**: Each past booking MUST say whether the client can still review it and carry the client's review if written.
- **FR-014**: «Отзывы» MUST show «Мои отзывы» (written by the person as a client) and «Отзывы обо мне» (written about the person by masters), newest first, with their counts in the tabs (a zero count is hidden) and `?sub=about` for the second. A card shows the master's name, the service in the primary colour, 16 px stars, «d MMM» and the text. Reviews about a client MUST be readable only by that client and by masters who have or had a booking with that client (spec 009 shows them to masters); they never appear on public pages.

**Favourites (masters)**

- **FR-015**: «Избранное» MUST list the person's favourite masters with the name, photo, specialty, rating, review count and the verified badge, skipping deleted masters; one column, two from tablet. Removing is optimistic with «Удалено из избранного: <имя>» and comes back on failure.

**Profile and settings (identity)**

- **FR-016**: The account MUST gain a photo, an email, a Telegram name, a Viber number, a preferred contact method («Сообщения в чате» or «Телефонный звонок», chat by default) and four notification switches (all on by default). The app MUST know them as soon as the person is signed in.
- **FR-017**: «Редактировать профиль» MUST edit the photo (upload through the core photo upload of spec 006; only the person's own photo is accepted; «Удалить фото» clears it), «Имя и фамилия» (required, «Введите имя»), «Электронная почта» (optional, «Проверьте адрес почты»; unique across accounts, otherwise «Эта почта уже используется другим аккаунтом»; not confirmed, not used to sign in and without the request's hint about signing in; an empty field clears it), «Telegram» («@username») and «Viber» («+375 29 123-45-67»); an empty Telegram or Viber clears it. «Отмена» / «Сохранить»; toasts «Сохранено» / «Не удалось сохранить» or the server's message; the sheet stays open on failure.
- **FR-018**: The «Телефон» sheet MUST explain «Этот номер видят мастера, к которым вы записаны.», hint «Формат: +375 29 123-45-67» and show «Введите белорусский номер в формате +375 XX XXX-XX-XX» after leaving the field or submitting. Because the phone is the sign-in identity, «Получить код» MUST send an SMS code to the new number under the sign-in code rules of spec 003 (today's settings: six digits, 5 minutes, 5 attempts, a new code after a minute; the same messages), and the number changes only after the right code. A number another account uses MUST be refused with «Этот номер уже привязан к другому аккаунту» before any code is sent, and the current number with «Это ваш текущий номер». On success the toast «Номер изменён» shows, the side card shows the new number, and the next sign-in on any device uses it.
- **FR-019**: The «Способ связи» sheet «Как мастерам лучше связываться с вами» MUST offer «Сообщения в чате» — «Мастер напишет вам в чат на сайте» and «Телефонный звонок» — «Мастер позвонит по вашему номеру».
- **FR-020**: «Аккаунт» MUST have «Выйти на других устройствах» instead of the request's password sheet: the sheet «Выйти на других устройствах?» / «На всех других телефонах и браузерах нужно будет войти заново. На этом устройстве вы останетесь в аккаунте.» with «Отмена» / «Выйти». On success every other session ends at once (including their live connections), this one stays, and the toast «Другие устройства вышли из аккаунта» shows; on failure «Не удалось выйти на других устройствах».
- **FR-021**: The notification switches «Push-уведомления», «Email», «На сайте», «Напоминания о записях» (hint «За 24 ч и за 2 ч до визита») MUST save each change optimistically, show the toast «Сохранено» on success and revert with «Не удалось сохранить настройку» on failure. They are only stored; nothing is sent in this spec, and sending, including reminders 24 h and 2 h before a visit, comes in a later spec. The help MUST say that the switches take effect when notifications arrive.
- **FR-022**: «Прочее» MUST open info sheets with «Понятно»: «Язык» (Русский) with «Сейчас приложение доступно только на русском языке. Другие языки появятся позже.»; «О приложении» with «Карта бьюти-мастеров Беларуси с точными ценами и онлайн-записью.», «Находите мастеров рядом, сравнивайте цены на услуги, смотрите портфолио и отзывы, записывайтесь на свободное время и общайтесь с мастером в чате.» and «Версия 1.0»; «Правила использования» with the five numbered rules of the request, quoted exactly; and «Справка», which opens the help center (only while help is on).
- **FR-023**: «Выйти из аккаунта» (soft red) MUST sign out and open the home page.

**Becoming a master (masters)**

- **FR-024**: A signed-in person without a master profile MUST be able to create one with a direction (a category, «Выберите направление»), a city (Минск, Брест, Витебск, Гомель, Гродно, Могилёв from settings, Минск by default) and an address («Укажите адрес»). The profile copies the account's name, photo, phone, email, Telegram and Viber; the specialty comes from the category; the location is the city centre until spec 008 adds a map point; no rating yet, not verified, online state shown, no services, the default schedule (Monday–Friday 10:00–19:00, 90-minute steps, no breaks, one client at a time) and auto-confirm off with 30 minutes. The account is linked to the master profile, and the app sees it without signing in again. A second attempt is «У вас уже есть профиль мастера». Such a profile MUST stay hidden from search, the map, suggestions and the public profile page (others get not found) until it has at least one service and a map point set by the master (spec 008); its owner, the master side and chats with the master's own clients still work.
- **FR-025**: The settings MUST show «Перейти в кабинет мастера» (briefcase) for a master and the gradient «Стать мастером» otherwise; the sheet uses the texts of User Story 6, the placeholders «Выберите направление» and «ул. Ленина, 42», the hint «Услуги, цены и расписание добавите в кабинете мастера», «Отмена» / «Создать профиль мастера», then «Профиль мастера создан» and the master side.

**Module boundaries**

- **FR-026**: The masters area MUST read the account's name, phone, email, photo and contacts only through a public identity contract, and link a new master profile to the account through one; identity never depends on the masters area.

**Demo world**

- **FR-027**: The Development demo world MUST give Анна a photo, contacts and the old app's bookings in both scopes, favourites and reviews in both directions, including at least one completed visit she can still review.

**Help**

- **FR-028**: The help MUST explain, quoting the screen texts: in the core section the profile shell and the two sides, editing the profile, photo and email, changing the phone with an SMS code, «Выйти на других устройствах», the contact method, notifications, the info sheets, the rules and logout; in the masters section my bookings with their statuses, confirm, cancel, the move request and its answers (also in the chats section for the master's «Принять перенос» / «Отклонить перенос»), writing reviews and their limits, «Мои отзывы» / «Отзывы обо мне», favourites and becoming a master. It MUST include pictures of «Записи», «Настройки» and the review sheet, and retake the existing pictures of the profile page that this spec changes.

### Key Entities *(include if feature involves data)*

- **Account profile** (identity): the photo, email, Telegram, Viber, preferred contact method and four notification switches of an account.
- **Client booking view** (masters): a spec 005 booking seen by its client, with its scope, status tag, whether it can be reviewed and the client's review.
- **Review** (masters): a rating 1–5 and optional text by one side of a completed booking about the other side, at most one per side per booking, with its date.
- **Move request** (masters): a client's proposal to move a booking to another time, with the held new time, its state (open, accepted, declined, withdrawn, cancelled with the booking, lapsed) and when it lapses; at most one open per booking.
- **Favourite master** (masters): a saved master as the client's list shows it.
- **New master profile** (masters): the minimal profile created by «Стать мастером» from the account and the chosen direction, city and address.

## Assumptions

- The request's remaining decisions are taken as recommended (the others are settled in Clarifications):
  - a client photo upload is new and uses the photo upload of spec 006;
  - a new master's location is the city centre until spec 008's map point; no geocoder; the profile stays hidden until then (Clarifications);
  - the shell and settings belong to the core and identity; bookings, favourites and reviews come from the masters area; `/speckit-plan` decides how the core hosts them.
- The code differs from the request, and the code wins: since spec 003 there is no email and no password; sign-in is by phone and SMS code. The Clarifications settle the email, the phone and the password sheet.
- Changing the phone does not sign other devices out; the person can do that with «Выйти на других устройствах». Spec 003's phone code request and sign-in limits also apply to the phone change.
- The «Клиент / Мастер» switch reuses the current mode of spec 006 (saved on the account), so no second notion of role is added.
- Spec 006's chat cancel sheet keeps its own texts; the profile's sheets use the old app's profile texts above. `/speckit-plan` may share one sheet with both sets.
- A hidden master profile can still be reached in chats by someone who knows its id (spec 006 lets a client start a chat with any master that has not deleted the profile); the id is not shown anywhere public, so this is accepted.
- The «Мастер» side's content, the master cabinet and «Перейти в кабинет мастера»'s destination belong to spec 008; this spec shows a placeholder there.
- Changes to earlier specs: 003's account page becomes the profile shell and the client account; 004 and 005 show ratings and review counts that include new reviews and hide a master profile without a service or a map point; 005 gains the move request (a held time, a new booking transition and its lapse), and a new booking withdraws an overlapping open move request; 006's booking card gains the move request line, «Принять перенос» / «Отклонить перенос» and the move system messages, and «Написать» is also reachable from bookings, and the current mode is also set by the profile switch.
