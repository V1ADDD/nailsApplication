# Feature Specification: Chats, real time and media

**Feature Branch**: `006-chats-realtime-media`

**Modules**: chats (new, switchable, depends on masters), masters, identity, core (media, real time, client/master mode, the frame), help; platform: web

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: the request `specs_requests/006-chats-realtime-media.md` (not tracked by git): chats between clients and masters at `/chats` and `/chats/:chatId`, one chat per master–client pair and separate lists per role; text and photo messages grouped by day with read receipts, editing and deleting own messages, blocking and deleting a chat; booking cards in the chat with confirm and cancel and the system messages of every booking change; one real-time channel that updates every open tab of both people; a photo upload used by chats now and by the portfolio and avatars later; the unread badge on «Чаты».

## Design references

Old-app screenshots (first priority) copied into `design/`:

- List: `design/phone/chats.png`, `design/phone/chats-master.png` (master mode), `design/tablet/chats.png`, `design/desktop/chats.png`.
- Thread: `design/phone/chat-thread.png`, `design/tablet/chat-thread.png`, `design/desktop/chat-thread.png` (two panes).
- Menu and sheets: `design/phone/chat-menu.png`, `design/phone/chat-cancel-sheet.png`.
- The customer's design (second priority): `specs/_design-references/figma/02-chats-list.png` (list) and `specs/_design-references/figma/03-chat-thread.png` (thread, bubbles, booking card, composer). The two-pane layout from tablet width comes from the old app; the customer's design has no such screen.

## Clarifications

### Session 2026-10-16

- Q: When a client writes to a master they have never booked with, should the master see that client's phone number in the chat? → A: Only if the client has or had a booking with that master; otherwise nothing is shown in its place.
- Q: When someone deletes a chat, should it disappear only for them or for both people? → A: Only for them; the other side keeps everything, and the chat comes back with only newer messages when the other side writes or a booking is made.
- Q: Once a chat is blocked, who can unblock it? → A: Only the side that blocked; the other side, pressing «Разблокировать», sees «Разблокировать может только тот, кто заблокировал».
- Q: Should photos be shrunk on the server when they are uploaded, or stored exactly as uploaded? → A: Stored exactly as uploaded, without resizing, within the 10 MB limit; resizing may come with the portfolio (008).
- Q: Where should the app remember whether a person is in client mode or master mode? → A: On the account, the same on every device and tab; it starts as client and changes only when the person switches.

## User Scenarios *(mandatory)*

### User Story 1 - A client writes to a master (Priority: P1)

On a search card or a master's profile the client presses «Написать». The app switches to client mode and opens the chat with that master, creating it if they have never talked. The header shows the master's photo with the online dot, the name with the tag «Мастер» and «онлайн» or «не в сети». The client types in «Сообщение...», presses Enter (Shift+Enter breaks the line) or «Отправить». The message appears at once with a clock icon, then with one tick («Отправлено»), and with two ticks («Прочитано») once the master has read it. Messages are grouped by day under «Сегодня», «Вчера» or «28 августа». The client can attach a photo with «Прикрепить фото»; it uploads at once («Загружаем фото…», then «Фото будет отправлено» with «Убрать фото») and is sent with or without text. A photo in the chat opens full size in the «Фото» sheet.

### User Story 2 - Both sides see each other live (Priority: P1)

The master has the app open in two tabs. The client's message appears in both within a second, the «Чаты» badge on the tab bar and the top bar grows, and the chat moves to the top of the list with its preview, time and «1 непрочитанное сообщение». When the master opens it, the messages are marked read: the badge drops and the client's ticks turn double. Edits, deletions, blocking and booking changes reach the other side the same way, without reloading.

### User Story 3 - Bookings live in the chat (Priority: P1)

When a client books a master, the chat between them appears (or comes back) with a booking card on the client's side: «Запись», the status, the service, the date and time and the price. The master sees «Ожидает подтверждения» with «Подтвердить» and «Отменить»; the client sees when the window will free itself if the master does not confirm. After booking, the app takes the client to this chat. Confirming, cancelling (with a reason in the «Отмена записи» sheet), auto-confirm, release and the automatic cancel of an overlapping booking each add a centred system message, and the card updates for both sides at once. A released booking explains that it can be restored by agreeing in the chat and booking again, and a client gets «Записаться снова».

### User Story 4 - One account, two lists (Priority: P1)

Анна is a client of several masters and a master herself. «Чаты» shows the chats of the current mode: as a client her masters, as a master her clients. A segmented control «Режим чатов» with «Как клиент» / «Как мастер» switches the mode for the whole app; the badge counts only the current mode. Opening a link to a chat that belongs to the other mode says «Этот чат доступен в другом режиме профиля» with «Перейти в режим мастера» or «Перейти в режим клиента». A master writes to their own clients from the chat list or, later, from the cabinet; a master cannot start a chat with someone who has never booked with them.

### User Story 5 - Managing own messages and chats (Priority: P2)

From «Действия с сообщением» (a button, right-click or long press) a person edits the text of their own message («Редактирование сообщения», «Сохранить», «Отменить редактирование»; the bubble then shows «изменено») or deletes it (the bubble becomes «Сообщение удалено» for both). From «Меню чата» they open the master's profile (client mode), block or unblock the chat, or delete it. A blocked chat shows «Чат заблокирован. Писать нельзя» instead of the composer for both sides; only the side that blocked can unblock it. Deleting asks «Удалить чат?» / «Переписка удалится из вашего списка вместе с историей. Это действие нельзя отменить.»; the chat disappears only from that person's list, and comes back with only the newer messages when the other side writes or a new booking is made.

### User Story 6 - Clients see how fast a master replies (Priority: P3)

A master's profile shows «обычно отвечает за 15 минут», «за час» or «за 3 часа» when the master is not online, based on how quickly the master answered clients over the last 30 days.

### Edge Cases

- Opening a chat the person is not part of: not found. Opening one that belongs to the other mode: the other-mode state above; for an account without a master profile, only «К списку чатов».
- A master tries to start a chat with a person who never booked with them: «Написать можно только своему клиенту». Writing to a deleted master: not found.
- An empty message: «Пустое сообщение»; text longer than 2000 characters cannot be typed or sent.
- Writing into a blocked chat (for example from a stale tab): «Чат заблокирован, писать нельзя». Unblocking by the side that did not block: «Разблокировать может только тот, кто заблокировал». Booking cards in a blocked chat still work.
- Editing or deleting someone else's message, a system message, a booking card or an already deleted message is refused; an edit to blank text is refused.
- A photo of another type: «Можно загрузить только фото (JPG, PNG, WebP)»; larger than 10 MB: «Фото больше 10 МБ». A file renamed to `.jpg` that is not an image is refused the same way. A message cannot reference a photo another person uploaded.
- A send fails: the bubble stays red with «Не отправлено. Повторить». Any other action fails: the error shows above the composer with «Скрыть ошибку».
- New messages arrive while the person is reading older ones: they stay in place and see «Новые сообщения ↓». Scrolling to the top loads older messages without jumping.
- A tab in the background: messages arriving there are not marked read until the tab is visible again.
- The connection drops: the app reconnects by itself and refetches the badge, the list and the open chat, so nothing is missed.
- A chat with no messages: «Напишите первое сообщение». No chats: «Пока нет переписок» / «Найдите мастера на карте» with «Открыть карту». The list fails: «Не удалось загрузить чаты» with «Повторить»; the chat fails: «Не удалось открыть чат» with «Повторить» and «К списку чатов».
- Tablet and desktop with no chat open: «Выберите чат» / «Здесь откроется переписка».
- A phone 360 px wide shows the list, the thread, the menu and the sheets without horizontal scrolling; only the messages scroll and the composer stays above the tab bar.
- The chats area is switched off, or the masters area is off (chats depends on it): «Чаты», its badge and «Написать» disappear, booking still works and the client stays on the profile after booking. Re-enabling it brings back every chat and message.
- The other side deleted their account or master profile: the chat stays readable with the last known name (a missing account reads «Аккаунт удалён»), shows no online state and no «Профиль мастера»; writing to a deleted master is refused with «Мастер не найден».

## Requirements *(mandatory)*

### Functional Requirements

**Photos (core)**

- **FR-001**: A signed-in person MUST be able to upload a JPG, PNG or WebP photo up to 10 MB, checked by its content, not its name, and stored exactly as uploaded, without resizing. Limits come from settings. The answer gives the photo's id and address.
- **FR-002**: Anyone MUST be able to open an uploaded photo by its address; it is cached for a long time by the viewer's browser only, never by shared caches or proxies, because chat photos are private while their address works for anyone who has it. An unknown photo is not found.
- **FR-003**: Any area that accepts a photo address MUST be able to check that the photo was uploaded by the signed-in person. The upload serves chats now and the portfolio and avatars later, so it belongs to the core.

**Real time (core)**

- **FR-004**: A signed-in person's every open tab MUST hold one live connection, authenticated by their session, started on sign-in and stopped on sign-out. It reconnects automatically after 0, 2, 5, 10 and 30 seconds, and refetches what it shows after reconnecting.
- **FR-005**: Any area MUST be able to push an event to every open tab of a given person. Events are small notices; screens refetch details as needed.
- **FR-006**: A live connection MUST count as activity for the online state (spec 004): when it connects and about once a minute while it stays open.

**Client and master mode (core)**

- **FR-007**: A signed-in person MUST have a current mode, client or master, saved on the account and the same on every device and tab; it starts as client and changes only when the person switches, and other open tabs follow the switch. Only an account with a master profile can be in master mode; an account that loses its master profile returns to client mode. Chats, the badge and the actions in a chat follow the current mode.

**Chats**

- **FR-008**: There MUST be at most one chat per master and client. A client MAY start one with any master that has not deleted their profile; a master only with a person who has or had a booking with them.
- **FR-009**: Every action on a chat (opening, listing, writing, reading, blocking, deleting) MUST name the mode it acts in, and the person MUST be that side of the chat; editing and deleting a message act as the message's author. A chat they are only part of in the other mode answers with the other-mode error «Этот чат доступен в другом режиме профиля»; a chat they are not part of is not found.
- **FR-010**: The list MUST show the person's chats in the current mode, newest activity first, without chats they deleted that have no newer messages. Each row: the other side's name, photo and whether they are a master; for a master their specialty and online state (respecting the master's choice to hide it), for a client their phone only if they have or had a booking with this master (otherwise no subtitle) and no online state; the last message time («HH:mm» today, «Вчера», a weekday within 7 days, else «12 авг»); a preview («Нет сообщений», «Сообщение удалено», «Запись: <услуга>», «📷 Фото» or the text); the unread count with a Russian plural; and who blocked it.
- **FR-011**: The list MUST update live: a new message patches the row's preview, time, unread count and position; an unknown chat makes the list refetch quietly.
- **FR-012**: A chat MUST open with its last 50 messages after the person's delete time, the bookings shown in it, the other side and when the other side last read it. Older messages load in pages of 50 when scrolling up.
- **FR-013**: A person MUST be able to send a message with trimmed text up to 2000 characters, a photo they uploaded, or both, unless the chat is blocked. Sending marks the chat read for them.
- **FR-014**: Only the author MUST be able to edit the text of their own text or photo message (not blank, not deleted; marked «изменено») or delete it (the text and photo are removed for both and «Сообщение удалено» remains). System messages and booking cards cannot be edited or deleted.
- **FR-015**: Opening a chat, and every incoming message while it is open and the tab is visible, MUST mark it read. Unread counts only the other side's messages and booking cards after the person's read time. The sender sees «Прочитано» on their messages once the other side's read time reaches them.
- **FR-016**: Either side MUST be able to block a chat; then nobody can write in it. Only the side that blocked MUST be able to unblock it; both sides see «Разблокировать», and the other side pressing it gets «Разблокировать может только тот, кто заблокировал».
- **FR-017**: Deleting a chat MUST hide it and its history only for the person who deleted it; the other side keeps everything and bookings are untouched. The chat reappears for that person with only newer messages when a new message or booking arrives, or when they start it again.
- **FR-018**: The badge MUST show the total unread for the current mode on «Чаты» on the tab bar and the top bar, read by screen readers as «N непрочитанных» (the frame's existing badge). It updates live and refetches on a mode change, after reconnecting and on navigation.
- **FR-019**: Every new message, edit, deletion, read, block change, booking change and unread change MUST reach every open tab of both people within a second.

**Bookings in chats**

- **FR-020**: When a booking is created, the chat MUST be found or created and a booking card posted on the creator's side; it never counts as unread for the creator, and the creator's earlier unread messages stay unread. Confirm, cancel, auto-confirm, release and the automatic cancel of an overlapping booking MUST post the system messages defined in spec 005, and every booking change MUST refresh the card for both sides.
- **FR-021**: The booking card MUST show «Запись» with a status dot, the service, «d MMM y · HH:mm», the price and the status: «Ожидает подтверждения» (the creator also sees « · освободится, если не подтвердить до d MMM, HH:mm»), «Подтверждено», «Отменено: <причина>», «Завершено» or «Неявка». A released booking adds «Бронь можно восстановить: договоритесь в чате и создайте запись заново.» and, for the client, «Записаться снова», which opens the booking sheet on the master's profile with the same service.
- **FR-022**: «Подтвердить» MUST appear only for the side that did not create a pending booking, and «Отменить» on future pending or confirmed bookings for either side. Cancelling opens «Отмена записи» with the reasons «Изменились планы», «Заболела», «Не успеваю», «Другое» («Опишите причину», up to 300 characters) and the switch «Отмена по договорённости (без последствий)»; while it is off the sheet warns «Отмена без взаимного согласия снижает рейтинг». The buttons are «Назад» and «Отменить запись». The rules and errors are spec 005's.
- **FR-023**: «Написать» on search cards (spec 004) and on the master's profile (spec 005) MUST switch to client mode and open the chat; after booking (spec 005) the app MUST open the chat with the new booking.

**Screens**

- **FR-024**: The chats screens MUST follow the old app on phone, tablet and desktop as described in User Stories 1–5:
  - **Layout.** The chat fills the height between the bars, only the messages scroll and the composer is pinned. A phone shows the list or the thread with «Назад к чатам»; from tablet width two panes (a narrower list on tablet, a wider one on desktop).
  - **List.** «Чаты» with «непрочитанных: N», «Режим чатов» for masters (switching keeps no thread open), rows as whole links with a 60 px avatar and a master badge, the open one highlighted, 4 skeleton rows while loading, and the empty and failure states.
  - **Thread.** The header (48 px avatar with the online dot, «Мастер» tag, «онлайн» / «не в сети» in client mode or, in master mode, the client's phone under the same rule as the list, «Меню чата» closing on Esc or an outside click), day pills with the year when it differs, centred system messages, own bubbles on the right (at most 85 % wide on phones, 70 % from tablet), the time, «изменено», the ticks, the «Фото» sheet, «Новые сообщения ↓», the composer with the photo banner and edit mode, the blocked state and the delete sheet.
- **FR-025**: The messages and badge MUST be grouped and dated by Minsk days.

**Reply time**

- **FR-026**: A master's profile MUST show their typical reply time when they are not online: the median minutes between a client's message and the master's next reply over the last 30 days, shown as «обычно отвечает за N минут», «за час» or «за N часов»; nothing with fewer than 3 such pairs or when chats are off.

**Module dependencies**

- **FR-027**: Chats MUST depend on the masters area (its booking events and its public lookups of masters, their clients and booking cards); the masters area never depends on chats. An area whose dependency is switched off MUST be off too. This rule is new and amends the constitution (principle VI).

**Demo world**

- **FR-028**: The Development demo world MUST include the chats and messages of the old app's seed: Анна as a client with Серова, Ковалёва and Павлова, and as a master with Алина, Виктория and Ольга, including «Жду вас завтра в 10:00 ✨».

**Help**

- **FR-029**: The help MUST explain chats, quoting the screen texts: the list and the two modes, writing and photos, read ticks, editing and deleting messages, blocking and unblocking, deleting a chat, booking cards with confirm and cancel, and the errors and limits above. It MUST include pictures of the list and the thread. «Написать», opening the chat after booking and the reply time are explained in the chats help too, so no help outside chats mentions chats when the chats area is off.

### Key Entities *(include if feature involves data)*

- **Uploaded photo**: a file a person uploaded, with its owner, type, size, where it is stored and when.
- **Chat**: the one conversation between a master and a client. It records each side's read time, delete time (history before it stays hidden for that side) and whether that side's list hides it, which side blocked it, and when the last message was sent.
- **Message**: text, a photo or both by one side; a booking card by the side that created the booking; or a system message about a booking change. It records when it was sent, edited and deleted.
- **Booking card**: a view of a spec 005 booking inside a chat, owned by the masters area and shown by chats.
- **Live event**: a notice pushed to a person's open tabs: a message created or changed, a chat read, a chat blocked or unblocked, a booking changed, the unread total changed.
- **Mode**: whether the person currently acts as a client or as a master, saved on the account.
- **Reply time**: a master's median reply minutes over the last 30 days.

## Assumptions

- The request's decisions are taken as recommended; `/speckit-clarify` confirms them:
  - chats depends on masters and not the other way round, and an area whose dependency is off is off; the constitution's principle VI is amended for module dependencies and for using another module's events (4.3.0 → 4.4.0, MINOR, a separate commit);
  - masters start chats only with their own clients; clients with any master;
  - the API runs as one instance, so live events need no shared relay;
  - the live connection uses the session cookie through the same origin, never a token in the address.
- The code differs from the request in places, and the code wins: there is no client/master mode and no unread count in the app yet. This spec adds the mode (FR-007), saved on the account, used by chats now and by the client account (007) and the master cabinet (008, 009) later.
- The photo upload and the live connection are part of the core because several areas will use them. Photos are stored in a folder from settings (a volume in Docker); other storage can replace it later. The proxy in development and in Docker forwards the live connection and allows 10 MB uploads.
- Chats keep the masters area's booking texts and rules from spec 005; the client gains the confirm and cancel calls for booking cards, since no screen uses them yet.
- A system message counts for neither side's unread, and a booking card counts for the side that did not create it.
- Blocking does not cancel bookings and does not stop booking; system messages and booking cards still appear in a blocked chat.
- A client's name in a master's list is the account's current name; a master's is the profile's.
- A master's reply time is computed when the profile is read; it is not stored.
- The masters area of spec 005 already announces every booking change, so no change to booking is needed besides the client navigation after booking.
- Changes to earlier specs: 002 gains the «Чаты» item with its badge and forwarding of the live connection; 003 gains a real unread count and live online state; 004 and 005 gain «Написать», opening the chat after booking and the reply time.
