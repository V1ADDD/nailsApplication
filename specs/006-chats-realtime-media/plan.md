# Implementation Plan: Chats, real time and media

**Branch**: `006-chats-realtime-media` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-chats-realtime-media/spec.md`; approach from `specs_requests/006-chats-realtime-media.md`, the clarifications and the constitution.

## Summary

Chats between clients and masters, with live updates and photo messages.

- **Core**:
  - a photo upload with a public, cached read (`/api/media`), stored on disk behind `IFileStorage`;
  - one SignalR hub at `/api/hub` (WebSockets only, session cookie) with `IRealtimePublisher`;
  - a saved client/master mode on the account;
  - module dependencies (`DependsOn`).
- **Chats** (new, switchable, depends on Masters):
  - one chat per pair, with text and photo messages, read times, editing, deleting, blocking and per-side clearing;
  - booking cards and system messages, fed by Masters' `IBookingChangedHandler`;
  - the unread badge;
  - the reply time, through a Masters extension point.
- **Client**:
  - `RealtimeService` and the mode in core;
  - `/chats` and `/chats/:chatId` with a list and a thread, two panes from 768 px;
  - «Написать» on the card and profile, and the chat after booking.
- **Constitution 4.4.0** (already amended in `.specify/memory/constitution.md` and `AGENTS.md`; commit it on its own first): module dependencies, the media and realtime core, and two-party data.

Details in [research.md](research.md), [data-model.md](data-model.md) and [contracts/chats-media-realtime.md](contracts/chats-media-realtime.md).

## Technical Context

**Modules touched**: chats (new), masters, identity, core (media, realtime, module registry, frame), help

**Platforms**: web. The API clients, the realtime service, the mode, the unread store and the date and plural helpers go in `libs/shared`; the screens go in `libs/web`.

**Module interaction**:
- Chats uses:
  - `Identity.Contracts`: `ICurrentUser`, `IAccountDirectory` (client names), and a new `IAccountDirectory.PhonesAsync`;
  - `Catalog.Contracts.ICatalog` (service names);
  - `Masters.Contracts.IMasterDirectory` (new);
  - `Masters.Events` (`IBookingChangedHandler`);
  - it implements `Masters.ExtensionPoints.IReplyTimeSource`.
- Masters never references Chats.
- Every module uses `Common/Realtime` and `Common/Media`.
- On the client:
  - chats calls the masters booking confirm and cancel endpoints over HTTP;
  - masters reaches chats only through the URL `/chats/new?master=`;
  - neither imports the other.

**Stack**: .NET 10 (ASP.NET Core controllers, minimal APIs for core endpoints, SignalR from the shared framework, EF Core 10 on PostgreSQL), Angular 22 (Nx, signals, Angular Material). The one new package is `@microsoft/signalr` (exact version); there is no new NuGet package.

**Storage**: migration `AddChatsMedia`:
- schema `chats` with `chats` and `messages`;
- `platform.media_files`;
- `identity.users.active_mode`.

Indexes, constraints and the `chats.version` token are in [data-model.md](data-model.md). Files are on disk under `Storage:RootPath` (a Docker volume).

**Contracts**: [contracts/chats-media-realtime.md](contracts/chats-media-realtime.md):
- `/api/media`;
- `/api/identity/mode` and `MeResponse.mode`/`heartbeatSeconds`;
- the hub and its seven events;
- 12 chat endpoints;
- `MasterProfileResponse.replyMinutes`.

**Settings** (Development, Docker, Production):
- `Media`: `MaxBytes` 10485760, `CacheSeconds` 31536000 (0 in Development), `ContentTypes` [`image/jpeg`, `image/png`, `image/webp`], `RateLimit` { `PermitLimit` 30, `Window` `00:01:00` }.
- `Storage`: `RootPath`, which is `storage` in Development, `/app/storage` in Docker, and `""` in Production (from the environment; validation stops the API when it is empty).
- `Realtime`: `KeepAliveInterval` `00:00:15`, `ClientTimeoutInterval` `00:00:30`.
- `Modules:Chats`: `Enabled` true; `Messages` { `PageSize` 50, `MaxPageSize` 100, `MaxLength` 2000 }; `ReplyTime` { `WindowDays` 30, `MinPairs` 3 }.

**Constraints**:
- a message reaches every open tab of both sides within 1 s on one instance;
- the chat list p95 < 300 ms with 50 chats;
- uploads ≤ 10 MB, refused before buffering;
- every screen works from 360 px;
- with Chats or Masters off, nothing of Chats is exposed and booking works.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principles touched:
- I: Minsk days for day pills and times (`minskDateKey`, `formatTime`, new `formatChatTime` and `formatDayPill` in `date.ts`); plurals for unread and reply time; phones through `formatPhone`.
- II: the visibility, unread, preview, reply-time, system-text and message rules are pure, in `Chats/Rules/`; the release deadline comes from Masters.
- III: contract regenerated; the hub stays under `/api`; event payloads are OpenAPI components.
- IV and VI: amended (4.4.0).
- V: `ExtensionPoints/` in Masters; `Rules/` in Identity.
- VII: the new tab and badge come through the manifest; every state of every screen; 360 px.
- VIII: two-party data and the party check.
- IX: the phone rule, uploads checked by content and size, no message text in logs, URLs or storage.
- X: help.

| Gate | Status |
|---|---|
| II. Rules pure, server enforces | Pass: `ChatVisibility`, `Unread`, `ChatPreview`, `ReplyTime`, `ChatTexts`, `MessageRules`, `ImageSignature`. Every permission (side, author, blocker, own client, own photo) is checked in Application. |
| III. Contract and `/api` only | Pass: the hub is at `/api/hub`, not `/hubs/app` (research R7); `openapi.json` and `schema.ts` are regenerated. |
| IV. Module only in its folders; a disabled module exposes nothing | Pass. Chats code lives only in `Modules/Chats` and `libs/*/chats`. Off (or Masters off), there is no service, handler, extension point, controller, route, tab, «Написать» or help article. Booking keeps working because `BookingEvents` has no handler. |
| V. Allowed folders | Pass: `Masters/ExtensionPoints/IReplyTimeSource`; `Identity/Rules/UserMode`; the core pieces in `Common/`, `Host/` and the new `Nails.Infrastructure/Storage/` (amendment). |
| VI. Cross-module via Identity, Catalog and declared dependencies | Pass under 4.4.0 (research R1): Chats uses Masters' `Contracts`, `Events` and `ExtensionPoints` and declares `DependsOn = ["Masters"]`. Exception: masters screens link to the `/chats/new` URL (Complexity Tracking). |
| VII. Frame through manifests | Pass: the `frameItem` «Чаты» with `badge: ChatsBadge` (web, over the shared `UnreadStore`); «Написать» is shown by masters only when `chats` is enabled, and links by URL. |
| VIII. Tenants | Pass under 4.4.0: chats, messages and media files are two-party or public-by-id data, not tenant-owned. A chat belongs to two accounts (like bookings), and a photo is public by id. The party or owner check is in Application. |
| IX. Privacy | Pass: the phone only to a master the client booked with (clarification 1); message text and reasons never logged; no message text in URLs or browser storage (the composer draft is not persisted); uploads checked by magic bytes and size; the hub uses the cookie, never a token in the URL. |
| No hardcoded values | Pass: sizes, page sizes, limits, the reply window, the storage path, the cache age, hub timeouts and the heartbeat are settings. The reconnect delays 0/2/5/10/30 s are a product rule of the spec, so they are a constant in `RealtimeService`. |
| One type per file; no comments | Pass by construction. |
| Abstractions with two uses | `IFileStorage` isolates an external system (disk now, S3 later). `IRealtimePublisher` is used by Chats and Identity. `IReplyTimeSource` inverts the only Masters→Chats need. `IMasterDirectory` has one user, but it is a module contract like `IAccountDirectory`. |
| Additive migration | Pass. |
| Unbounded lists paginated | Exception (Complexity Tracking): `GET /api/chats` returns all of a person's chats in one mode. |

Post-design re-check: Pass with the 4.4.0 amendment and the one tracked exception.

## Project Structure

### Documentation (this feature)

```text
specs/006-chats-realtime-media/
├── plan.md, research.md, data-model.md
├── contracts/chats-media-realtime.md
├── checklists/requirements.md
├── design/{phone,tablet,desktop}/*.png
└── tasks.md                                   /speckit-tasks
```

### Source Code

```text
.specify/memory/constitution.md                       4.4.0: I–X as in research R1 (separate commit)
docker-compose.yml                                    storage volume for the api
api/
├── Nails.Api/
│   ├── Program.cs                                    MapNailsMedia, MapNailsRealtime
│   ├── Host/Extensions/{MediaEndpoints, RealtimeExtensions}.cs
│   ├── Host/Realtime/{AppHub, HubRealtimePublisher}.cs
│   ├── Host/Extensions/OpenApiExtensions.cs          event payload components
│   ├── Host/Extensions/RateLimitingExtensions.cs     policy "media"
│   ├── Modules/Identity/Controllers/SessionController.cs   + PUT mode
│   ├── Modules/Chats/Controllers/{ChatsController, MessagesController}.cs
│   ├── Modules/Help/Content/ru/articles/{chats.json (new), masters.json, core.json}
│   ├── Modules/Help/Content/ru/images/{chats-list, chat-messages, chat-bookings}/*.png
│   ├── openapi.json
│   └── appsettings.{Development,Docker,Production}.json   Media, Storage, Realtime, Modules:Chats
├── Nails.Application/
│   ├── Common/Modules/{IAppModule, ModuleRegistry}.cs        DependsOn
│   ├── Common/Exceptions/ErrorCodes.cs                      media-*, chat-*, other-role, not-a-master, ...
│   ├── Common/Media/{IMediaService, MediaService, IMediaOwnership, MediaOwnership, MediaOptions,
│   │                 MediaResponse, MediaContent, ImageSignature, MediaErrors}.cs
│   ├── Common/Realtime/{IRealtimePublisher, RealtimeEvents, RealtimeOptions}.cs
│   ├── Modules/Identity/{Contracts/IAccountDirectory.cs (+PhonesAsync), Contracts/ISessionService.cs (+SetModeAsync),
│   │                     Requests/SetModeRequest.cs, Responses/{MeResponse, ModeChangedEvent}.cs, Rules/UserMode.cs,
│   │                     Services/{SessionService, AccountDirectory}.cs}
│   ├── Modules/Masters/
│   │   ├── Contracts/{IMasterDirectory, MasterSummary, BookingCard, PairBooking}.cs
│   │   ├── ExtensionPoints/IReplyTimeSource.cs
│   │   ├── Services/{MasterDirectory, MasterProfileService, BookingService}.cs   + directory, replyMinutes, AutoCancelled fix
│   │   ├── Responses/MasterProfileResponse.cs           + ReplyMinutes
│   │   └── MastersModule.cs
│   └── Modules/Chats/
│       ├── ChatsModule.cs                                DependsOn ["Masters"]
│       ├── Contracts/{IChatService, IMessageService, IChatAccess}.cs
│       ├── Services/{ChatService, MessageService, ChatAccess, BookingChatHandler, ReplyTimeSource,
│       │             ChatEvents, ChatsErrors}.cs
│       ├── Requests/{StartChatRequest, SendMessageRequest, EditMessageRequest, MessagesPageRequest}.cs
│       ├── Responses/{ChatSummaryResponse, CounterpartResponse, MessageResponse, ChatResponse, ChatThreadResponse,
│       │              ChatBookingResponse, MessagesPageResponse, StartChatResponse, UnreadResponse, ReadResponse,
│       │              MessageCreatedEvent, MessageUpdatedEvent, ChatReadEvent, ChatChangedEvent,
│       │              BookingChangedEvent, UnreadChangedEvent}.cs
│       ├── Options/{ChatMessagesOptions, ReplyTimeOptions}.cs
│       ├── Rules/{ChatRole, MessageKind, ChatVisibility, Unread, ChatPreview, ReplyTime, ChatTexts, MessageRules}.cs
│       └── Seed/{ChatsDemoData, ChatsDemoSeeder}.cs
└── Nails.Infrastructure/
    ├── Storage/{LocalFileStorage, StorageOptions, MediaRepository, StorageServiceCollectionExtensions}.cs,
    │   Storage/Contracts/{IFileStorage, IMediaRepository}.cs,
    │   Storage/Entities/MediaFile.cs, Storage/Configurations/MediaFileConfiguration.cs
    ├── Persistence/DatabaseSchemas.cs                    + Chats
    ├── Persistence/Migrations/*_AddChatsMedia.cs
    ├── Modules/Identity/{ApplicationUser, Configurations/ApplicationUserConfiguration, Repositories/AccountDirectoryRepository}.cs
    ├── Modules/Masters/{Contracts/IMasterDirectoryRepository, Repositories/MasterDirectoryRepository}.cs
    └── Modules/Chats/
        ├── Entities/{Chat, Message}.cs
        ├── Configurations/{ChatConfiguration, MessageConfiguration}.cs
        ├── Contracts/{IChatRepository, IMessageRepository}.cs
        ├── Repositories/{ChatRepository, MessageRepository}.cs
        └── Models/{ChatListRow, UnreadRow, ReplyPairRow}.cs
client/
├── package.json                                       @microsoft/signalr (exact)
├── nginx.conf.template                                WebSocket upgrade on /api/, client_max_body_size 11m
├── apps/web/proxy.conf.json                           "ws": true
├── apps/web/src/modules.ts                            + chats
├── tsconfig.base.json                                 @nails/shared/chats/data-access, @nails/web/chats/feature
└── libs/
    ├── shared/common/util/src/lib/date.ts             + formatChatTime, formatDayPill
    ├── shared/core/data-access/src/lib/
    │   ├── api/schema.ts                              regenerated
    │   ├── realtime/{realtime-service, realtime-events, retry-policy}.ts
    │   ├── media/media-api.ts
    │   ├── identity/session-store.ts                  + mode, setMode, modeChanged
    │   └── modules/enabled-modules.ts                 + enabled signal
    ├── web/core/feature/src/                          export FrameBadge
    ├── shared/masters/data-access/src/lib/masters-api.ts   (replyMinutes comes with the profile type)
    ├── web/masters/feature/src/lib/
    │   ├── list/master-card.ts, profile/{profile-hero, action-bar, profile-page}.ts   «Написать», reply time
    │   ├── booking/booking-sheet.ts                    navigate to the chat after booking when chats is on
    │   └── write-to-master.ts                          setMode('client') + /chats/new?master=
    ├── shared/chats/data-access/src/lib/
    │   ├── chats-api.ts, chat-bookings-api.ts          REST (chats; masters booking confirm/cancel)
    │   ├── unread-store.ts                             unread count for the current mode
    │   ├── chat-list-store.ts, chat-thread-store.ts    live patching, paging, optimistic send
    │   └── chat-day-groups.ts                          pure grouping by Minsk day
    └── web/chats/feature/src/lib/
        ├── manifest.ts                                 frameItem «Чаты» (order 20, badge), routes chats, chats/new, chats/:chatId
        ├── chats-badge.ts                              FrameBadge over UnreadStore, refresh on NavigationEnd
        ├── chats-page.ts                               panes, «Выберите чат»
        ├── list/{chat-list, chat-row, mode-switch}.ts
        ├── thread/{chat-thread, thread-header, chat-menu, message-list, message-bubble, message-actions,
        │           day-pill, new-messages-pill, composer, photo-banner, blocked-bar, other-role-state}.ts
        ├── bookings/{booking-card, cancel-booking-sheet}.ts
        ├── sheets/{photo-sheet, delete-chat-sheet}.ts
        └── start-chat-page.ts                          /chats/new resolver
README.md                                               core media and realtime, mode, Chats module, settings, events
```

**Module switch**:
- **On** (and Masters on): `ChatsModule` registers its services, the booking handler, `IReplyTimeSource`, the seeder and the controllers. `GET /api/modules` lists `chats`. The client loads the manifest (the «Чаты» tab with the badge, the routes), and masters shows «Написать», opens the chat after booking and shows the reply time.
- **Off**, or Masters off: none of these.
  - Booking events have no handler, so booking still works.
  - `replyMinutes` is null and the hero shows nothing.
  - The tables stay. The hub, media and mode are core and stay on.

**Help**:
- **New `articles/chats.json`** (`"module": "chats"`), section «Чаты»:
  - `chats-list` «Список чатов и режимы»: rows, unread, «Режим чатов» «Как клиент» / «Как мастер», the badge, the empty and error states, «Выберите чат». Picture `images/chats-list/list.png`.
  - `chat-messages` «Переписка»:
    - writing, Enter and Shift+Enter, 2000 characters, photos with «Прикрепить фото», «Загружаем фото…», «Фото будет отправлено», «Убрать фото»;
    - the limits «Можно загрузить только фото (JPG, PNG, WebP)» and «Фото больше 10 МБ»;
    - ticks «Отправлено» and «Прочитано», «Не отправлено. Повторить», «Новые сообщения ↓»;
    - editing and deleting («изменено», «Сообщение удалено»).

    Picture `images/chat-messages/thread.png`.
  - `chat-bookings` «Записи в чате»: the card, its statuses, «Подтвердить», «Отменить», the «Отмена записи» sheet and its reasons, the system messages, the release text and «Записаться снова». Picture `images/chat-bookings/card.png`.
  - `chat-block-delete` «Блокировка и удаление чата»: «Меню чата», «Заблокировать», «Разблокировать» and its error «Разблокировать может только тот, кто заблокировал», the toasts «Чат заблокирован» and «Чат разблокирован», «Чат заблокирован. Писать нельзя», «Удалить чат?» with its text; the chat disappears only for you and comes back on a new message or booking; «Этот чат доступен в другом режиме профиля»; a counterpart who deleted the account reads «Аккаунт удалён», and writing to a deleted master gives «Мастер не найден».
  - `write-to-master` «Написать мастеру»: «Написать» on the search card and the master's page, the chat that opens after booking, and the reply time «обычно отвечает за …» on the master's page; `related` → `master-profile`, `book-a-master`, `chat-messages`.
- Everything about chats lives only in `chats.json`, so with Chats off no help mentions it (constitution IV, X). Chats articles may link to masters articles, because Chats is on only when Masters is; masters and core articles never link to chats articles.
- **Changed `core.json`**: `navigation` loses the line «Раздел «Чаты» появится в панели, когда заработает.» and names no optional section. The alt text of `images/navigation/help.png` describes «панель с разделами» without listing them, so the picture stays correct with or without «Чаты»; it is retaken because the bar now shows «Чаты».
- **`masters.json`**: unchanged.

**Structure Decision**:
- **One switchable `Chats` module**, plus core media, realtime and the mode. Media and the hub are core because portfolio and avatars (008, 007) and other modules will push events too.
- **Media and realtime are minimal APIs and a hub in `Host/`**, because controllers are bound to modules.
- **Two controllers**: `ChatsController` (chats, read, block, clear, unread) and `MessagesController` (`chats/{id}/messages` and `chats/messages/{id}`).
- **Masters exposes `IMasterDirectory`** and declares `IReplyTimeSource`. Chats depends on Masters and never the reverse.

## Changes to earlier specs

- **002**: the frame gains «Чаты» with its badge (the existing `FrameBadge` slot, now exported). The dev proxy and nginx forward WebSockets on `/api`. nginx's body limit becomes 11 MB.
- **003**:
  - `MeResponse` gains `mode` and `heartbeatSeconds`, and `PUT /api/identity/mode` is new.
  - The hub touches presence.
  - `IAccountDirectory` gains `PhonesAsync`.
- **004**: «Написать» on search cards.
- **005**:
  - «Написать» and the reply time on the profile; after booking the app opens the chat.
  - `AutoCancelled` events carry the cancelled booking's own master (a bug fix).
  - Masters gains `IMasterDirectory` and `IReplyTimeSource`.
  - The request's "system-message texts defined in 005" are defined here (research R3).
  - The `contracts` library route of the request is replaced by HTTP calls (research R9).
- **Constitution**: 4.3.0 → 4.4.0 (research R1), as its own commit before the code.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `GET /api/chats` is not paginated (HTTP: unbounded lists are paginated) | The list has one row per counterpart in one mode, which is bounded by real relationships. Live events patch and reorder rows in place. | Paging would need a cursor that shifts with every new message and would hide chats that receive messages while off-page. |
| The masters web feature knows the `chats` module key and the `/chats/new` URL (Masters is Chats' dependency; VI: never the reverse) | «Написать» on the card and the profile, and opening the chat after booking, sit inside masters screens. Masters imports no chats code and calls no chats API; it only checks `EnabledModules.enabled()` for `chats` and navigates to a public URL. | A manifest slot through which Chats injects buttons into masters screens would be a new frame extension mechanism with one use, and it would still need masters to host the slot. |
| Hub with WebSockets only (`skipNegotiation`) | The negotiate POST would need the antiforgery header, which the shared library cannot read without `document`. | Exempting a POST from antiforgery weakens IX, and SSE or long polling also need that POST. |

## Implementation notes

Decisions taken while building, in addition to [research.md](research.md):

- **Packages.** `@microsoft/signalr` is `10.0.11`, matching the .NET 10 server, not 9.x. A fresh NuGet audit found high-severity advisories in the transitive `System.Security.Cryptography.Pkcs` and `.Xml` 10.0.0/10.0.12, so `Directory.Packages.props` pins both to `10.0.13` (transitive pinning) and the lock files are refreshed.
- **Upload body limit.** The request body limit is twice `Media:MaxBytes` (nginx `client_max_body_size 21m`), not `MaxBytes` plus 64 KB: with the tight limit an 11 MB photo ended as a dropped connection instead of «Фото больше 10 МБ». Bodies above twice the limit are still refused by the server or proxy. The minimal-API upload uses `DisableAntiforgery()` only to switch off ASP.NET's built-in form antiforgery metadata, which needs `UseAntiforgery`; the project's `AntiforgeryMiddleware` still checks every `/api` POST. `UseRateLimiter` now runs after `UseAuthentication`, so the per-user `media` policy sees the user.
- **No `proxy_read_timeout` variable.** The hub's keep-alive (`Realtime:KeepAliveInterval`, 15 s) keeps the WebSocket busy well inside nginx's default 60 s, so no timeout setting was added.
- **Settings removed.** `Modules:Chats:Messages:MaxLength` was dropped: the 2000-character limit is the column size (`Message.TextMaxLength`) and the request's `[StringLength]`; a second setting would have been unused.
- **Types.** `ChatRole`, `MessageKind` and `UserMode` are entity enums in Infrastructure, as Masters does with `BookingStatus`. Chats never names Masters' entity types: booking cards travel as `Masters.Contracts.BookingCard` (also the payload of `bookingChanged`, so clients update cards without refetching), and `BookingChanged.ByMaster` gives the side without `Party`. `StoredMedia` became `MediaContent`; `IFileStorage` and `IMediaRepository` sit in `Nails.Infrastructure/Storage/Contracts`. `Unread` is the repository's grouped query, not a separate rule; `ChatSides` holds the per-side accessors.
- **Client.** `ChatsApi` holds the masters confirm and cancel calls (no separate `chat-bookings-api.ts`). Booking cards, deleting and editing call `ChatThreadStore` directly instead of passing outputs up. The thread container holds the header and chat menu (no separate `thread-header.ts`, `chat-menu.ts`, `blocked-bar.ts`, `other-role-state.ts`, `day-pill.ts`, `new-messages-pill.ts`, `photo-banner.ts`). `/chats/new` sets the mode itself, so masters screens only link to it. The frame's existing badge view is used unchanged.
- **Verification (2026-10-16).** API: lists per mode with previews and unread counts, the phone shown only for own clients, `other-role`, `empty-message`, `chat-blocked`, `not-blocker`, edit and delete, read, `media-type`, `media-too-large`, `private` cache headers, mode switching, `has-pending-model-changes` clean. Two headless Edge browsers (Анна at 390 px, Анна Серова at 1440 px): a message reached the other browser in 0.8 s and her badge went from 1 to 2; a new booking appeared as a card on both sides within a second; confirm and cancel posted «Мастер подтвердил запись» and «Клиент отменил запись. Причина: Изменились планы» live; the other-mode state switched with «Перейти в режим клиента»; blocking showed «Чат заблокирован. Писать нельзя» on the other side and the wrong side got «Разблокировать может только тот, кто заблокировал»; deleting removed the chat for one side only and it came back with only the new message; after an API restart the open chat reconnected and received a new message. No horizontal scroll at 360 px, 390 px, 820 px and 1440 px. With `Modules__Chats__Enabled=false` the module, its endpoints and help articles disappear and the profile has no reply time; with `Modules__Masters__Enabled=false` Chats is off too. Booking through the sheet in a headless browser was not completed by the test script (the service list needed real clicks); the booking itself was created through the API from the signed-in page, and the code path that opens the chat afterwards was reviewed, not observed.
