# Feature Specification: Phone sign-in, the old app's look, and a help center like CONNECT's

**Feature Branch**: `003-identity-phone-sign-in`

**Modules**: identity, core, help, support; platform: web

**Created**: 2026-10-08

**Status**: Done

**Input**: User description: the request `specs_requests/003-identity-accounts.md` (accounts, the session, protected pages, the «Профиль» account page), changed by the user on 2026-10-08: "1) center the icons; 2) keep the size and weight of the buttons as in the old app (`https://v1addd.github.io/nailsAppAngular/login`); 3) make the help like CONNECT's (`http://localhost:4200/help`), working on phones too, with screenshots allowed, and add a rule for the agent to keep the help updated and extended; 4) text sizes and spacing as in the old app (the «Напишите нам» sheet looks bad); 5) the sign-in page differs a lot from the intended design; 6) rewrite authorization: sign-in only by phone number, no separate registration: the visitor enters the phone, gets an SMS code, enters it; with an account they are signed in, without one they are asked for the required data (the name), the account is created and they are signed in. Like Wildberries. No email and password."

## Design references

Old-app screenshots copied into `design/` (first priority):

- Sign-in card: `design/phone/login.png`, `design/tablet/login.png`, `design/desktop/login.png` (hero band with the logo and the tagline, title «Вход», lead, one field with a label above, a large violet button).
- Account card and logout: `design/phone/profile-client-settings.png` (rounded 64 px avatar, name, phone; settings rows; the soft red «Выйти из аккаунта»), `design/desktop/profile-client-bookings.png`.
- Sheet sizes and spacing: `design/phone/support-dialog.png`, `design/desktop/support-dialog.png` (title 18 px bold, lead 16 px, labels above the fields, 50 px fields, a 44 px full-width button in a footer with a top border).

Help center reference (CONNECT, a sibling product from the same template; rendered in its dark theme, ours stays light): `design/desktop/connect-help-home.png`, `design/desktop/connect-help-article.png`, `design/phone/connect-help-home.png`, `design/phone/connect-help-article.png`.

## User Scenarios *(mandatory)*

### User Story 1 - A visitor signs in with the phone (Priority: P1)

A visitor presses «Войти» (or opens a page that needs an account). The sign-in card of the old app opens: the logo and «Маникюр и не только — рядом с вами» on a lilac band, the title «Вход», the lead, and one field «Телефон» with «+375» in front of it. They type their nine digits and press «Получить код». The card now says «Введите код из SMS» and «Код отправлен на +375 (29) 123-45-67», shows six boxes and «Изменить номер». When the sixth digit is typed the code is checked at once. If an account has this phone, the visitor is signed in and returns to the page they wanted (or the profile). The next code can be requested after a minute: «Запросить код повторно через 0:59» turns into the button «Запросить код повторно».

### User Story 2 - A new visitor gets an account on the way (Priority: P1)

If no account has the phone, after the right code the card asks «Как вас зовут?» with the field «Имя» and the button «Продолжить». The account is created with that name and phone, the visitor is signed in and sees «Добро пожаловать!». There is no separate registration page.

### User Story 3 - The signed-in person manages the session (Priority: P1)

«Профиль» shows the account card (the initials on the brand gradient, the name, the phone «+375 (29) 123-45-67»), the rows «Справка» and «Напишите нам», and the soft red «Выйти из аккаунта». The session lasts on the device until they sign out. A reload keeps them signed in; after «Выйти из аккаунта» a reload shows the guest frame.

### User Story 4 - Everything looks like the old app (Priority: P1)

Buttons have the old app's sizes and weights (44 px bold 14 px buttons, the 56 px main button of the sign-in card, 36 px small top-bar buttons), icons sit centred on their buttons and rows, fields have their label above and a 50 px white box, sheets use the old app's title, lead and spacing. The «Напишите нам» sheet looks like the old app's; its «Как с вами связаться» is filled with the signed-in person's phone.

### User Story 5 - The visitor finds answers in the help center (Priority: P2)

«Справка» opens a help center like CONNECT's: «Чем мы можем помочь?» with cards of sections and their articles, a search field, and on wide screens a side list of sections that fold open. An article shows the path «Справка / section», the title, the lead, text, numbered steps, notes, pictures of the screens, related articles, «Не нашли ответ?» with the support contacts, and the previous and next articles. On a phone the section list opens from the button «Разделы справки» and nothing overflows the screen. Search shows the matching articles with the found words highlighted, or «Ничего не нашлось» with a hint.

### Edge Cases

- The phone is not nine Belarusian digits: «Введите номер в формате +375 XX XXX-XX-XX», no code is sent.
- A new code is asked before a minute passed: «Новый код можно запросить через N с.» and the countdown continues.
- A wrong code: «Неверный код»; the boxes empty and keep focus. After 5 wrong codes, or after 5 minutes: «Код устарел. Запросите новый.»
- The name is empty or longer than 120 characters: «Введите имя».
- Too many requests from one address: «Слишком много запросов. Попробуйте через минуту.»
- A signed-in person opens the sign-in page: they go to the profile (or the page they asked for).
- A guest opens «Профиль»: the sign-in card, then back to «Профиль».
- The SMS does not arrive: the help article «Не приходит SMS с кодом» explains the waiting time, «Запросить код повторно» and «Изменить номер».
- Accounts created before this spec with an email and a password cannot sign in any more (there was no production data).
- A help search with no match shows «Ничего не нашлось» and «Попробуйте другие слова, например текст, который вы видите на экране.».
- A phone 360 px wide shows the sign-in card, the profile, the sheets and every help page without horizontal scrolling.
- The help module is switched off: «Справка» disappears from the frame and the profile.

## Requirements *(mandatory)*

### Functional Requirements

**Sign-in by phone**

- **FR-001**: The only way to sign in MUST be a Belarusian phone (`+375` and 9 digits) and a one-time code sent by SMS. Registration with an email, the password, email confirmation and password reset MUST be removed with their pages, texts and endpoints (changes spec 001 FR-003 and FR-008).
- **FR-002**: A code MUST have 6 digits, last 5 minutes, allow 5 attempts and be replaced by a new one only after 1 minute; these values come from configuration. Requesting a code MUST be rate-limited per address.
- **FR-003**: After a right code, an existing account MUST be signed in; for a new phone the visitor MUST give a name (required, up to 120 characters), and then the account (with its own private space) MUST be created and signed in. The code stays valid while the name is asked.
- **FR-004**: The session MUST stay on the device until the person signs out (a sliding 14-day cookie, as today).
- **FR-005**: The sign-in card MUST follow `design/*/login.png` and the steps of User Stories 1 and 2: phone with the «+375» prefix and the mask «(29) 123-45-67», «Получить код» / «Отправляем…»; six code boxes that accept a pasted or auto-filled code and submit by themselves, «Проверяем…» while checking, the resend countdown and «Изменить номер»; the name step. Errors appear under the field in red. The page is public; a signed-in visitor is sent on.
- **FR-006**: After signing in the visitor MUST return to the page they asked for, or to «Профиль».
- **FR-007**: The signed-in person's name and phone MUST be available to the app (the account card, the support sheet).

**Account page**

- **FR-008**: «Профиль» MUST show the account card of `design/phone/profile-client-settings.png` (64 px rounded avatar with the initials, the name, the formatted phone), the rows «Справка» and «Напишите нам» when those areas are on, and the soft red full-width «Выйти из аккаунта», disabled while signing out.

**The old app's look**

- **FR-009**: Buttons MUST match the old app: regular 44 px, 14 px, weight 700, radius 14 px; large 56 px, 16 px, weight 700, radius 18 px; small 36 px, 14 px, weight 700, radius 10 px. Icons in buttons, rows and tabs MUST be centred vertically with the text.
- **FR-010**: Form fields MUST have a 14 px muted label above, a white 50 px box with a 1 px border, radius 14 px, 16 px text and a violet border on focus; hints 12 px; errors 12 px red.
- **FR-011**: Sheets MUST use the old app's spacing: header 12/12/8/20 px with an 18 px bold title, body 0/20/16 px with 16 px gaps, footer 12/20/16 px above a border; the lead is 16 px secondary text.
- **FR-012**: The «Напишите нам» sheet MUST follow FR-010 and FR-011 and prefill «Как с вами связаться» with the signed-in person's phone (changes spec 002 FR-023).

**Help center**

- **FR-013**: Help content MUST be organised in sections with ordered articles; an article has a title, a lead, search keywords and blocks: heading, paragraph, list, numbered steps, a note (info, tip or warning), a picture with its description, and related articles. Bold text is marked with `**`.
- **FR-014**: The help home MUST show «Чем мы можем помочь?», a lead and a card per section listing its articles; an article page MUST show the path, title, lead, blocks, «Не нашли ответ?» with the support email and phone, and links to the previous and next articles; an unknown article shows «Такой статьи нет.» and «Все статьи справки».
- **FR-015**: A search field MUST filter the section list and show results ranked by title, keywords, lead and text, with the words highlighted.
- **FR-016**: From 1024 px the sections MUST be a sticky side list whose sections fold; below, they MUST open in a sheet from «Разделы справки». Every help page MUST work from 360 px.
- **FR-017**: Pictures MUST be screenshots of this app, served by the help module with a long cache, shown at their natural size up to the column width, and opened full size on tap.
- **FR-018**: The help MUST describe sign-in by phone, the new account, «Не приходит SMS с кодом», the profile and sign-out, the frame and «Напишите нам», with pictures of the sign-in card and the support sheet.
- **FR-019**: The agent rules MUST require that every user-visible change updates and extends the help in the same change, including its pictures.

### Key Entities *(include if feature involves data)*

- **Account**: a person identified by a Belarusian phone; has a name and its own private space. Legacy accounts may have an email but cannot sign in.
- **Sign-in code**: a one-time code for a phone: when it was sent, until when it is valid, how many wrong attempts were made. At most one per phone; deleted after a successful sign-in.

## Assumptions

- The request's email-and-password sign-in, registration page, password rule, email confirmation, the «Не выходить на этом устройстве» choice and the demo-account hint are replaced by phone sign-in at the user's instruction (2026-10-08).
- There is no SMS provider yet. SMS go through a replaceable sender; in Development and Docker it delivers each SMS as an email to Mailpit (`http://localhost:8025`), addressed to the phone number. Choosing a Belarusian SMS gateway for production is part of spec 012; until then Production needs the SMS settings like the email settings.
- The first-tenant bootstrap of the template (an owner with an email and a password) is removed: every phone account gets its own space when it is created.
- The remembered active role, the unread count and `patchMe` of the request have no user before specs 004–007 and come with them (the rule against unused code, as in spec 002).
- Phones are unique per account; email is no longer collected.
- The help pictures are taken by hand from the running app (phone width 390 px) by the procedure in the README; an automated tool can come later.
