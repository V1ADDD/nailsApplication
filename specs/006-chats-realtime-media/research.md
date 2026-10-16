# Research: Chats, real time and media

The approach follows `specs_requests/006-chats-realtime-media.md` and the clarifications of the spec. Where the request and the code built by specs 001–005 disagree, the code wins and the change is recorded here.

## R1. Module dependencies (FR-027, constitution VI)

- **Decision**:
  - `IAppModule` gains `IReadOnlyList<string> DependsOn { get; }`. It is `[]` for every existing module and `["Masters"]` for `ChatsModule`.
  - `ModuleRegistry` treats a module as enabled only when its own switch is on and every module it depends on is enabled, resolved transitively. `GET /api/modules` therefore omits `chats` when `masters` is off, and the client loads neither manifest.
  - A module that depends on an always-on module needs no entry, because Identity and Catalog are always usable.
- **Constitution amendment** (4.3.0 → 4.4.0, MINOR, a separate commit before the code):
  - VI: a module MAY use `Nails.Application.Modules.<Other>.Contracts`, `.Events` and `.ExtensionPoints` of a module it lists in `DependsOn`. The other module MUST NOT use it back. On the client, the rule is still "only another module's `contracts` library".
  - IV: a module whose dependency is off is off.
  - Definitions: the core gains `Media` and `Realtime` (`Common/` of Application, `Host/` of Api, `Storage/` of Infrastructure) and the client/master mode.
  - VIII: two-party data (chats, bookings) and shared uploads carry user ids, not a tenant; the service checks the party.
- **Alternatives**:
  - Chats subscribing through Identity: rejected, because Identity knows nothing of bookings.
  - Chats reading `masters.*` tables: forbidden by VI.

## R2. What Chats needs from Masters (`Masters/Contracts/IMasterDirectory`)

- **Decision**: one new contract, implemented in Masters by `MasterDirectory`, with a repository query each:

  | Method | Returns | Used for |
  |---|---|---|
  | `MasterOfUserAsync(userId)` | `Guid?` master id, null if none or deleted | the caller's master side, «Как мастер» |
  | `MastersAsync(masterIds)` | `MasterSummary(Id, UserId, Name, PhotoUrl, Specialty, Online, Deleted)`. `Online` already respects `ShowOnline` and presence (`MasterFacts.IsOnline`). | list rows, the header, live user ids |
  | `ClientsWithBookingsAsync(masterId, clientUserIds)` | the set of those clients with any site booking at this master, in any status | FR-008 (a master writes only to own clients), the phone rule (clarification 1) |
  | `BookingCardsAsync(bookingIds)` | `BookingCard(Id, MasterId, ClientUserId, SubcategoryId, Price, StartAt, DurationMin, Status, CreatedBy, CancelledBy, CancelReason, CancelMutual, Expired, ReleaseAt)` | cards, previews, system texts |
  | `BookingsOfPairAsync(masterId, clientUserId)` | `(BookingId, CreatedBy, CreatedAt)` of site bookings | the demo seeder only |

  Client names and phones come from Identity:
  - `IAccountDirectory.NamesAsync` already exists;
  - a new `PhonesAsync(userIds)` is called only for clients in `ClientsWithBookingsAsync` (clarification 1).

  `ReleaseAt` is computed by Masters (`Bookings.PendingReleaseAt`) only for pending bookings, so Chats never re-implements the rule (II). Service names come from `Catalog.Contracts.ICatalog`.
- **Fix in Masters**: `BookingService.CreateAsync` publishes `AutoCancelled` with the new booking's `MasterId` (`BookingService.cs:104`). The overlapping booking belongs to another master, so the event must carry that booking's master. `BookingConflicts` returns the ids only, but `CreateAsync` already loads the client's active bookings (`active`), so it publishes each overlapping booking with its own `MasterId` from there.

## R3. The booking handler

- **Decision**: `Chats/Services/BookingChatHandler : IBookingChangedHandler` (scoped), registered by `ChatsModule`. It skips any change with no `ClientUserId` (an outside booking).
  - **Created** (`By` = creator):
    - find or create the pair, using the unique `(master_id, client_user_id)` index; a duplicate-key race re-reads the row;
    - add a `booking` message with `author_role = By` and `booking_id`;
    - set `last_message_at` to the message time and both hidden flags to false, so a deleted chat shows again with only the newer messages (FR-017).
    - No `read_at` moves: the card is the creator's own message, so it never counts as unread for them, and their earlier unread messages stay unread (the client booked from the profile, not in the chat).
  - **Confirmed, Cancelled, AutoConfirmed, Expired, AutoCancelled**: a `system` message in the pair's chat, if the chat exists. The text comes from `ChatTexts` (pure, `Rules/`):

    | Kind | Text |
    |---|---|
    | Confirmed | «Мастер подтвердил запись» / «Клиент подтвердил запись» (by `By`) |
    | Cancelled | «Мастер отменил запись. Причина: <причина>» / «Клиент отменил запись. Причина: <причина>» |
    | AutoConfirmed | «Запись подтверждена автоматически» |
    | Expired | «Запись не подтвердили вовремя, окно освободилось. Её можно восстановить в чате.» |
    | AutoCancelled | «Запись отменена автоматически: клиент записался на это же время к другому мастеру» |

    These texts come from the old app (`reference/mock-apis.ts`, `mock-db.ts`). Spec 005 defined only the cancel reasons, not chat texts, so the request's "texts defined in 005" is corrected here. A system message doesn't change `read_at`.
  - **Completed**: no message.
  - **Every kind**: push `bookingChanged` to both users.
- **Timing**: `BookingEvents` calls handlers after the booking is saved, in the same scope. The handler saves its own changes. A failure is logged by `BookingEvents` and never undoes the booking (spec 005 R3). In the time-rules job the handler runs in the job's scope, with no current user, which is fine because Chats tables are not tenant-owned.

## R4. Role parameter and access

- **Decision**:
  - Every chat endpoint takes `role=client|master` in the query, a string enum `ChatRole`.
  - `ChatAccess` (`Services/`) resolves the caller's sides once per request: the user id from `ICurrentUser`, and the master id from `IMasterDirectory.MasterOfUserAsync`.
  - For a chat:
    - the caller's side under `role` → allowed;
    - the caller is only the other side → 403 `other-role` «Этот чат доступен в другом режиме профиля»;
    - neither → 404 `chat-not-found`.
  - `role=master` without a master profile → 403 `not-a-master` «Сначала создайте профиль мастера».
- **Why not the saved mode**: a stale tab or a link from another mode would act in the wrong role silently. The explicit role makes every action unambiguous (FR-009), and the saved mode only chooses what the screens ask for.

## R5. Unread, previews and reply time (pure rules, `Chats/Rules/`)

- `Unread.Counts(side)`: the other side's messages of kind `text` or `booking`, not deleted, with `sent_at > max(my read_at, my cleared_at)`. One SQL `GROUP BY chat_id` per list. The total for the badge is the same query summed. Index `(chat_id, sent_at)`.
- `ChatPreview.For(message, serviceName)`:
  - no message → «Нет сообщений»;
  - deleted → «Сообщение удалено»;
  - booking → «Запись: <услуга>»;
  - a photo without text → «📷 Фото»;
  - otherwise the text.
- `ReplyTime.MedianMinutes(messages)`, over the last 30 days:
  - Each client message that starts a run (the first client message after a master message, or the chat's first) is paired with the next master message.
  - The median of the gaps is taken. Fewer than 3 pairs → null.
  - The values are computed on the server, and the profile shows the phrases.
- **Reply time without Masters depending on Chats**:
  - Masters declares `Masters/ExtensionPoints/IReplyTimeSource.MedianMinutesAsync(masterId, ct) → int?`.
  - `MasterProfileService` takes `IEnumerable<IReplyTimeSource>` and uses the first, or null when none is registered (Chats off).
  - Chats implements it. This is the only `ExtensionPoints/` use and fits V.
- `MasterProfileResponse` gains `ReplyMinutes?`. The client formats:
  - fewer than 60 → «обычно отвечает за N минут» (plural);
  - 60–119 → «обычно отвечает за час»;
  - otherwise «обычно отвечает за N часов», rounded down, with the plural.

  It is shown only when `online` is false.

## R6. Media (core, FR-001–003)

- **Endpoints**: minimal APIs in `Nails.Api/Host/Extensions/MediaEndpoints.cs`, mapped by `MapNailsMedia()` next to `MapNailsModules()`. Controllers must live in `Modules/<Module>` (the convention throws otherwise), and the core already serves `/api/modules` this way.
  - `POST /api/media` (signed in, `multipart/form-data`, field `file`, antiforgery checked by the existing middleware).
  - `GET /api/media/{id}` (anonymous, streams with `Cache-Control: private, max-age=<settings>, immutable`). `private` keeps chat photos out of shared caches and proxies while the browser still caches them; the address format stays one for chats, portfolio and avatars.
- **Service**: `Nails.Application/Common/Media/`:
  - `IMediaService`, `MediaService`;
  - `IMediaOwnership.IsOwnedByAsync(url, userId)`;
  - `MediaOptions` (`Media:MaxBytes` 10485760, `Media:CacheSeconds`, `Media:ContentTypes`);
  - `ImageSignature` (pure: JPEG `FF D8 FF`, PNG `89 50 4E 47 0D 0A 1A 0A`, WebP `RIFF....WEBP`).
- **Checks**: the content type comes from the magic bytes; the declared type and the name are ignored. The size is checked before reading.
  - Errors: 400 `media-type` «Можно загрузить только фото (JPG, PNG, WebP)», 400 `media-too-large` «Фото больше 10 МБ».
  - Kestrel `MaxRequestBodySize` and `FormOptions.MultipartBodyLengthLimit` are set from `Media:MaxBytes` plus a small allowance, so larger bodies are refused before buffering.
- **Storage**:
  - `IFileStorage` and `IMediaRepository` in `Nails.Infrastructure/Storage/Contracts/` (like `Email/Contracts/IEmailSender`): `Nails.Application` references `Nails.Infrastructure`, not the reverse, so interfaces implemented in Infrastructure are declared there. `IMediaService` and `IMediaOwnership` stay in `Application/Common/Media`.
  - `LocalFileStorage` in `Nails.Infrastructure/Storage/` with `StorageOptions` (`Storage:RootPath`). Development uses `./storage`, Docker `/app/storage` on a named volume in `docker-compose.yml`, Production an empty value supplied by the environment.
  - Keys are `yyyy/MM/<id>.<ext>`. An S3 adapter can replace it later behind the same interface (V: every external system behind an interface).
- **Table**: `platform.media_files` (data-model). Uploads aren't tenant-owned: they are public by id, and the owner is checked by `IMediaOwnership`.
- **URL**: `/api/media/{id}`. `IsOwnedByAsync` parses this exact form, and anything else is not owned (→ 403 `media-not-owned` «Это фото загрузил другой человек»).
- **Resizing**: none (clarification 4).
- **Alternatives**:
  - ImageSharp: no resizing yet, and its licence would need review.
  - Storing in PostgreSQL `bytea`: database bloat and no CDN path.

## R7. Real time (core, FR-004–006)

- **Hub**: `Nails.Api/Host/Realtime/AppHub.cs` is `[Authorize]` and mapped at **`/api/hub`**, not `/hubs/app`:
  - Constitution III limits browser traffic to `/api/`.
  - nginx and the dev proxy already forward `/api`.
- **Transport**:
  - WebSockets only, with `skipNegotiation: true` on the client, so no POST is made. A negotiate POST would fail the antiforgery check, and the shared library may not read cookies (`document`).
  - The upgrade GET carries the `SameSite=Strict` session cookie, and the hub accepts only authenticated connections.
  - `connect-src` becomes `'self' wss://$host` (nginx's request host), because older Safari doesn't treat `'self'` as covering WebSockets.
- **Addressing**: the default `IUserIdProvider` (the `NameIdentifier` claim), so `Clients.User(userId)` reaches every tab. There are no groups, and a single instance needs no backplane (spec assumption).
- **Publisher**: `IRealtimePublisher.ToUsersAsync(IReadOnlyCollection<Guid> userIds, string eventName, object payload, ct)` lives in `Application/Common/Realtime`. `HubRealtimePublisher` in `Host/Realtime` wraps `IHubContext<AppHub>`. Event names are constants in `RealtimeEvents`.
- **Presence**:
  - `AppHub.OnConnectedAsync` calls `IPresence.TouchAsync(Context.UserIdentifier)`.
  - The client invokes the hub method `heartbeat` every `Modules:Identity:Presence:TouchInterval`. The value is sent to the client as `heartbeatSeconds` on `MeResponse`, so there's no client constant.
  - `PresenceThrottle` already limits writes.
  - The hub reads the user id from the connection, not `ICurrentUser`, because each hub invocation gets a new scope that `TenantMiddleware` never sees.
  - No tenant is needed there: `ApplicationUser` is not an `ITenantEntity`, so the presence update and the account lookups have no tenant filter. The same holds for the booking handler in the time-rules job.
- **Proxies**:
  - `client/apps/web/proxy.conf.json` `/api` gains `"ws": true`.
  - `client/nginx.conf.template` `location /api/` gains `proxy_http_version 1.1`, `Upgrade $http_upgrade` and a `Connection $connection_upgrade` map (in `http`, with `default upgrade; '' close;`), and `proxy_read_timeout` from a template variable.
  - `client_max_body_size 10m` already exists. It is raised to `11m` to leave room for the multipart overhead, matching `Media:MaxBytes`.
- **Client**: `RealtimeService` in `libs/shared/core/data-access/src/lib/realtime/`:
  - `@microsoft/signalr` with an exact version, the current 9.x at implementation time, checked with `npm audit`.
  - `SessionStore` starts it with `start(heartbeatSeconds)` when the status becomes `signed-in` and stops it on sign-out. `RealtimeService` never injects `SessionStore`, so there is no dependency cycle.
  - `withAutomaticReconnect([0, 2000, 5000, 10000, 30000])`. After the last delay it keeps retrying every 30 s, through a custom `IRetryPolicy`, because the built-in one gives up.
  - `on<T>(event): Observable<T>` streams and a `reconnected` stream.
  - It uses no DOM global, because SignalR uses `WebSocket` internally, so the shared lint rule holds.
- **Visibility**: whether the tab is visible (for marking read) is read in `libs/web/chats/feature` through `DOCUMENT`, never in the shared library.

## R8. Client/master mode (FR-007, clarification 5)

- **Decision**:
  - `ApplicationUser` gains `ActiveMode` (`client|master`, string, default `client`).
  - `MeResponse` gains `mode`. It is reported as `client` when `MasterId` is null, so losing the master profile falls back without a write.
  - `PUT /api/identity/mode` with `{ mode }`:
    - `master` without a master profile → 403 `not-a-master`;
    - otherwise saves the mode and pushes `modeChanged { mode }` to the user's tabs.
  - `SessionStore` gains `mode` and `setMode()` and follows `modeChanged`. It holds no unread count; the badge belongs to Chats.
- The unread count is chats' `UnreadStore` in `libs/shared/chats/data-access`:
  - It refetches `GET /api/chats/unread?role=<mode>` on mode change, on reconnect and on `refresh()`.
  - It follows `unreadChanged` events for the current mode.
  - It doesn't reference `FrameBadge`, because `libs/shared` may not import `libs/web`.
- The badge provider is `ChatsBadge` in `libs/web/chats/feature` (root, `implements FrameBadge`, which `@nails/web/core/feature` now exports):
  - `count` is `UnreadStore.count`.
  - Its constructor subscribes to the router's `NavigationEnd` and calls `UnreadStore.refresh()` while signed in.
  - The frame resolves it from the root injector when it renders the tab, so it lives as long as the app.
- **Entry points** («Написать», after booking) call `setMode('client')` before navigating. Masters' web feature reaches chats only by the URL `/chats/new?master=<id>`:
  - The chats route resolves it with `POST /api/chats` and replaces the URL with `/chats/<chatId>`.
  - So masters never imports chats.
  - The button shows only when `EnabledModules` lists `chats`, which `EnabledModules` exposes as a signal.

## R9. Booking cards on the client

- **Decision**:
  - The chats data-access calls `POST /api/masters/bookings/{id}/confirm` and `/cancel` with the generated `Schemas` types. These are public HTTP endpoints, not masters code, so no import crosses modules.
  - The request's "masters `contracts` library" is not possible as written. ESLint lets `type:contracts` depend only on contracts and util, and the generated `Schemas` live in core data-access. A contracts lib with one HTTP call would also be an abstraction with a single use.
  - The cancel sheet («Отмена записи») lives in `libs/web/chats/feature`. Specs 007 and 009 move it to a shared place when they need it, which is their second use.
- «Записаться снова» links to `/masters/<masterId>?book=1&service=<subcategoryId>` (the spec 005 URL).
- `bookingChanged` for a booking in the open chat refetches the chat's `bookings` (the cards only).

## R10. Live events (FR-019)

| Event | Payload | To |
|---|---|---|
| `messageCreated` | `{ chatId, message, preview, masterUserId, clientUserId }` | both users |
| `messageUpdated` | `{ chatId, message, preview }` (edit or tombstone) | both |
| `chatRead` | `{ chatId, role, readAt }` | both |
| `chatChanged` | `{ chatId, blockedBy }` | both |
| `bookingChanged` | `{ bookingId, chatId?, masterId, clientUserId, status }`; `chatId` is null when the pair has no chat (a booking made before chats existed, or a chat that could not be created) | both |
| `unreadChanged` | `{ role, count }` | each affected user, once per affected role |
| `modeChanged` | `{ mode }` | the user |

- The payload records live in `Chats/Responses/` (and `Identity/Responses/ModeChangedEvent`). Their schemas are added to the OpenAPI document as components through a document transformer, so the client types them from `Schemas` (III). `RealtimeService.on<'messageCreated'>` maps event names to schema types in one table.
- `preview` is the server's `ChatPreview` of the message (with the service name for a booking card), so the client list patches rows without re-implementing the preview rule (II).
- Events are sent after the save. A failed send is logged and ignored, because clients refetch after reconnecting.
- Ordering of a person's own optimistic message: the client replaces the pending bubble by the REST response, and ignores a `messageCreated` whose id it already holds.

## R11. Paging and limits

- `GET /api/chats/{id}` returns the last 50 messages. `GET /api/chats/{id}/messages?before=<messageId>&limit=` returns older ones, keyset on `(sent_at, id)`.
- `Modules:Chats:Messages:PageSize` is 50 and `MaxPageSize` 100. `Modules:Chats:Messages:MaxLength` is 2000, applied to the request validation and exposed to the client through the generated schema (`maxLength`).
- `Modules:Chats:ReplyTime:WindowDays` is 30 and `MinPairs` 3. The list isn't paginated: one row per pair is bounded by the person's counterparts, and the old app shows the whole list. This is recorded as an exception to "unbounded lists are paginated": the list is bounded by real relationships, and a page would break the live reordering.
- Chats get no rate limit beyond the session. Uploads use a new `media` per-user fixed-window policy (`Media:RateLimit`, 30 per minute), because files cost storage.

## R12. Things in the request that don't exist yet

- **`SessionStore.unread` and the role**: neither exists. The mode is new (R8), and the badge source is chats' `ChatsBadge` (over `UnreadStore`) through the existing `FrameBadge` slot.
- **System-message texts in 005**: not defined. They are defined here (R3).
- **`IMasterDirectory`**: does not exist yet (R2).
- **The «Чаты» item**: the frame already renders badges (`frame-badge-view.ts`, « непрочитанных»). The existing view reads «N непрочитанных» to screen readers; FR-018 uses that wording, so the component isn't changed.
- **Segmented control and menu**: not in `web/common/ui`. Chats uses `mat-button-toggle-group` for «Режим чатов» and `mat-menu` for «Меню чата» and «Действия с сообщением», themed from tokens. Nothing new goes into common, because there is one use each.
- **Demo seed**: the bookings of the old seed already exist (`MastersDemoScenario`). The chats seeder (`Order` 30) creates the six chats and their text messages, and adds `booking` messages through `IMasterDirectory.BookingsOfPairAsync` (the pending Серова booking by the master, Ковалёва's and Виктория's by the client). It also adds the system message «Марина подтвердила запись» → «Мастер подтвердил запись» (the R3 text) and «Жду вас завтра в 10:00 ✨».
