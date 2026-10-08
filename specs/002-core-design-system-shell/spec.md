# Feature Specification: Design system, app frame and support

**Feature Branch**: `002-core-design-system-shell`

**Modules**: core, help, support (new, switchable); platform: web

**Created**: 2026-10-08

**Status**: Done

**Input**: User description: "The look and the frame every later feature stands on, plus the first small module: the old app's visual language on top of Angular Material (warm off-white background, white cards, brand violet, Manrope, 44 px tap targets), shared UI building blocks (logo, icons, avatar, rating, tabs, segmented control, sheet, toast, swipe, breakpoint signals), formatting of prices, plurals, dates, times and durations, the app frame (a bottom tab bar on phones and a top bar from desktop width, a 404 page, the «Напишите нам» support dialog) and the `Support` module whose form stores a ticket." (the full request is `specs_requests/002-core-design-system-shell.md`, not tracked by git)

## Design references

- The old app (first priority), copied into this spec's `design/`:
  - Frame, phone: `design/phone/map-guest.png`, `design/phone/map.png` (bottom tab bar «Карта / Чаты / Профиль» with the unread badge, the vertical «Напишите нам» tab on the right edge).
  - Frame, tablet and desktop: `design/tablet/map.png`, `design/tablet/map-guest.png` (tablet keeps the bottom tab bar), `design/desktop/map.png`, `design/desktop/map-guest.png` (top bar with the logo, the three items as pills, «Напишите нам» and the avatar or «Войти»).
  - Support dialog: `design/phone/support-dialog.png`, `design/desktop/support-dialog.png`.
  - 404: `design/phone/not-found.png`.
  - Controls in use (chips, buttons, sheet, tabs, segmented control): `design/phone/map-filters.png`, `design/phone/profile-client-bookings.png`, `design/phone/cabinet-hub.png`.
- The customer's phone design: `specs/_design-references/figma/01-map-home.png` shows the tab bar most clearly; every `specs/_design-references/figma/*.png` shows it.

## User Scenarios *(mandatory)*

### User Story 1 - The product looks like «Мастера рядом» on every device (Priority: P1)

A visitor opens the site on a phone. The page has a warm off-white background, white cards, the brand violet for actions and the Manrope font; every button and control is large enough to tap with a thumb. The browser tab shows the violet map-pin icon and the title «Мастера рядом — бьюти-мастера Беларуси»; added to the home screen, the app is called «Мастера рядом». On a tablet and on a desktop the same look holds, laid out for the wider screen.

### User Story 2 - The visitor moves around the app with the frame (Priority: P1)

On a phone or tablet, a bar fixed to the bottom of the screen holds up to three items with an icon above a label: «Карта», «Чаты» (with a badge for unread messages) and «Профиль». The current item is violet. On a desktop the bottom bar is replaced by a bar at the top: the logo, which leads home, the same items as pills, a «Напишите нам» button, a «Справка» link and, on the right, the account: the visitor's avatar leading to the profile, or a «Войти» button for a guest. An item appears only when the area it leads to is switched on. Every move to another page starts at the top of that page.

### User Story 3 - The visitor writes to support (Priority: P2)

A guest or a signed-in user has a question, a complaint or an idea. They press «Напишите нам»: in the top bar on a desktop; on a phone or tablet, the tab on the right edge of the home page (where the map will be) or the «Напишите нам» row of the profile. A sheet opens (from the bottom on a phone, a centred dialog on wider screens) titled «Напишите нам» with the lead «Вопрос, жалоба или идея — ответим в течение дня.», a «Сообщение» field and a «Как с вами связаться» field with the hint «Телефон или почта». They press «Отправить»; while it is sent the button reads «Отправляем…» and cannot be pressed again. The sheet closes, the form is cleared and the toast «Сообщение отправлено, скоро ответим» appears. The message is kept for the support team.

### User Story 4 - The visitor follows a broken link (Priority: P2)

A visitor opens an address that does not exist. They see the brand mark, the heading «Страница не найдена», the text «Возможно, ссылка устарела или мастер удалил профиль.» and a «На карту» button that takes them to the home page. The frame stays around the page, so they can also go elsewhere.

### User Story 5 - Later features reuse one set of building blocks (Priority: P3)

The teams building the map, the master profile, chats and the cabinets find the look, the frame and ready building blocks that already look and behave like the old app: the logo, the icons, avatars with initials, the sheet, toasts, skeletons and screen-width signals. The remaining blocks of the old app (star rating, tabs, the two-option switch, swipe) and the formatters (prices, plurals, dates, times, durations, phones) are described once in this spec's plan; each arrives with the first screen that shows it, so nothing unused ships.

### Edge Cases

- A phone 360 px wide shows the frame and every page of this spec without horizontal scrolling; the tab bar respects the phone's bottom safe area and never covers the page content.
- The «Сообщение» field is empty or contains only spaces: nothing is sent and the toast «Напишите, чем мы можем помочь» appears. If the server receives such a message anyway it answers with the same message.
- The message is longer than 2000 characters or the contact longer than 200: the field does not accept more; the server rejects longer values with a Russian field error.
- A sixth message from the same address within one minute: the server refuses it and the error toast reads «Слишком много запросов. Попробуйте через минуту.».
- Sending fails for any other reason: an error toast with the server's message; the form keeps what was typed.
- The support module is switched off: «Напишите нам» is not shown anywhere and the rest of the app works.
- The help module is switched off: «Справка» is not shown in the top bar or the profile.
- No area behind «Карта» or «Чаты» is switched on yet: those items are not shown; «Профиль» is always there.
- A guest presses «Профиль»: they are taken to sign-in and come back afterwards.
- The visitor closes the support sheet with ×, a tap on the backdrop or Esc: nothing is sent and what was typed stays until the page is reloaded.
- The visitor prefers reduced motion: sheets, toasts and skeletons do not animate.
- The server cannot be reached at start: the start-up failure page with «Повторить» keeps its behaviour in the new look.

## Requirements *(mandatory)*

### Functional Requirements

**Look**

- **FR-001**: The interface MUST use one set of design tokens taken from the old app: the colors (background `#f7f5f0`, surface white, primary violet `#7b2cf5` and its hover, soft and gradient variants, text, border, status, tint and brand-ink colors), the 4 px spacing scale, the type sizes and weights, radii, shadows, layout sizes, motion durations and layering. Components MUST take colors, spacing, radii and type only from these tokens.
- **FR-002**: The standard controls (buttons, text fields, chips, tabs, dialogs, menus, toasts) MUST look like the old app's: pill-shaped and gradient primary buttons, outlined chips with a violet selected state, sunken text fields, and tap targets of at least 44 px.
- **FR-003**: The interface MUST be light only, with a visible 2 px violet focus ring and with motion switched off for visitors who prefer reduced motion.
- **FR-004**: The browser icon MUST be the violet map pin with a white nail; the installable app MUST be named «Мастера рядом» with the description «Маникюр и не только — рядом с вами», the background `#f7f5f0` and the theme color `#7b2cf5`; the page title MUST be «Мастера рядом — бьюти-мастера Беларуси».

**Building blocks**

- **FR-005**: The logo MUST exist as the mark with the wordmark «Мастера рядом» and as the mark alone, announced to screen readers as «Мастера рядом».
- **FR-006**: Icons MUST be the old app's outline icons drawn in the current text color; an icon with a meaning is announced by its label, a decorative icon is hidden from screen readers.
- **FR-007**: An avatar MUST show the photo, or the initials of the first two words of the name on the brand gradient when there is no photo, as a circle or a rounded square.
- **FR-008**: One sheet MUST serve every sheet in the product: from the bottom on phones (at most 90 % of the screen height, with a grip bar), a centred dialog from tablet width (768 px); it closes with ×, a tap on the backdrop or Esc and has a title and a footer.
- **FR-009**: Toasts MUST come in a success (green) and an error (red) kind, stay 3.5 s, have a close button «Закрыть уведомление», appear centred above the tab bar and be announced politely to screen readers.
- **FR-010**: The existing empty, error (with «Повторить»), loading and problem states MUST take the new look; where a view has a known shape, a shimmering skeleton MUST replace the spinner.
- **FR-011**: Building blocks and formatters that no screen of this spec shows MUST NOT be added yet: the star rating, tabs, the two-option switch, horizontal swipe, the avatar's online dot and «Мастер» badge, the dark information toast, the price, plural, date, time, duration and phone formatters, and the server's Minsk-time helper. Their behaviour is recorded in this spec's plan and each is built by the first feature that shows it.

**Frame**

- **FR-012**: Below desktop width (1024 px) the app MUST show a bottom tab bar with up to three equal items «Карта» (home, current only on the home page), «Чаты» (with a slot for an unread badge announced as «непрочитанных») and «Профиль»; the current item is violet; the page content MUST NOT be hidden behind the bar.
- **FR-013**: From desktop width the app MUST show a sticky top bar with the logo linking home («Мастера рядом — на главную»), the same items as pills, a «Напишите нам» button, a «Справка» link and the account: a 36 px avatar linking to the profile when signed in, otherwise a «Войти» button.
- **FR-014**: An item MUST appear only when the area it belongs to is switched on: «Карта» with the masters area, «Чаты» with the chats area; «Профиль» is always shown. «Справка» MUST NOT be a tab-bar item.
- **FR-015**: Until the full profile is built, «Профиль» MUST lead to an account page with the avatar, the name and the email, the rows «Справка» and «Напишите нам» (each when its area is on) and «Выйти».
- **FR-016**: Below desktop width «Напишите нам» MUST also be a tab on the right edge of the home page; every «Напишите нам» MUST be hidden when the support area is switched off.
- **FR-017**: Every navigation MUST open the new page at the top; page titles stay Russian.
- **FR-018**: An unknown address MUST show the 404 page titled «Страница не найдена» with the mark, the heading, «Возможно, ссылка устарела или мастер удалил профиль.» and a «На карту» button to the home page.
- **FR-019**: The previous toolbar, its «Меню» disclosure, its account menu and the home page's area cards MUST be removed; the home page keeps its hero.

**Support**

- **FR-020**: Anyone, signed in or not, MUST be able to send a support message with a required text (trimmed, up to 2000 characters) and an optional contact (up to 200 characters). The message is stored with the time it was sent and, when signed in, the sender's account.
- **FR-021**: An empty or blank message MUST be rejected with «Напишите, чем мы можем помочь», in the browser before sending and on the server.
- **FR-022**: The server MUST accept at most 5 messages per minute from one address and refuse more with «Слишком много запросов. Попробуйте через минуту.»; the limit comes from configuration.
- **FR-023**: The support dialog MUST show the texts of User Story 3, disable «Отправить» and show «Отправляем…» while sending, and on success clear the form, close and show «Сообщение отправлено, скоро ответим»; on failure it shows an error toast with the server's message and keeps the form.
- **FR-024**: The support area MUST be switchable; when off, it exposes nothing and the rest of the app works.
- **FR-025**: The help center MUST explain where «Напишите нам» is and what happens to a message, and where «Выйти» and «Справка» are now.

### Key Entities *(include if feature involves data)*

- **Support ticket**: a message a visitor sent to support: the text, an optional way to contact them, the sender's account if they were signed in, a status (new) and the time it was sent. Tickets are only stored; nobody reads them in the app yet.

## Assumptions

- Decisions of the request taken as recommended (the user asked to go on to plan and implementation without a clarify round): Angular Material is themed to match and a custom component is allowed where Material cannot match (decided 2026-10-08); the interface is light only and the dark variant is dropped; «Справка» leaves the tab bar and lives in the top bar from desktop width (and in the profile with spec 007); the in-app logo and the favicon keep their slightly different highlight, as in the old app; support tickets are only stored, with no admin screen and no email.
- On phones and tablets «Напишите нам» is the vertical tab on the right edge seen in the old app's screenshots, which show it on the map only; it is shown on the home page (the map from spec 004) and not over other pages, where it would cover text on a 360 px screen. The profile row reaches it from everywhere.
- The request asked for every building block and formatter now; the repository's rule against unused code wins, so only what this spec's screens show is built (FR-011).
- Until the masters (004) and chats (006) areas exist, the tab bar shows only «Профиль»; the unread badge is an empty slot that 006 fills.
- The contact field is not prefilled until accounts have phones (spec 003).
- Tickets are kept indefinitely; reading and answering them is outside this spec.
- The rate limit counts per client address, like the existing limits on the anonymous sign-in endpoints.
