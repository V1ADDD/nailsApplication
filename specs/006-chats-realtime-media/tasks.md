---

description: "Task list for chats, real time and media"
---

# Tasks: Chats, real time and media

**Input**: Design documents from `/specs/006-chats-realtime-media/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chats-media-realtime.md

**Tests**: None. This project writes no tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Infrastructure: `api/Nails.Infrastructure/Modules/<Module>/{Entities,Configurations,Contracts,Repositories,Models,Options}/`, core storage `api/Nails.Infrastructure/Storage/`, migrations `api/Nails.Infrastructure/Persistence/Migrations/`
- Application: `api/Nails.Application/Modules/<Module>/{Contracts,Services,Requests,Responses,Options,Rules,Seed,Events,ExtensionPoints}/`, core `api/Nails.Application/Common/{Media,Realtime,Modules,Exceptions}/`, the catalog `api/Nails.Application/Common/Modules/ModuleCatalog.cs`
- API: `api/Nails.Api/Modules/<Module>/Controllers/`, core `api/Nails.Api/Host/{Extensions,Realtime}/`, settings `api/Nails.Api/appsettings.{Development,Docker,Production}.json`, help `api/Nails.Api/Modules/Help/Content/ru/articles/<module>.json`
- Client: `client/libs/shared/chats/data-access/`, `client/libs/web/chats/feature/`, module list `client/apps/web/src/modules.ts`, core `client/libs/{shared,web}/{core,common}/`
- Every C# type in its own file named after the type; no comments; Russian user-facing text, English code.

## Phase 1: Setup

- [x] T001 Amend the constitution to 4.4.0 (MINOR) in `.specify/memory/constitution.md` (and the matching line of `AGENTS.md`), as research R1 describes, and commit it on its own before any code:
  - Definitions: the core gains `Common/Media`, `Common/Realtime`, `Host/Realtime` and `Nails.Infrastructure/Storage`, and the client/master mode.
  - IV: a module whose dependency is off is off.
  - V: `Nails.Infrastructure/Storage/` is allowed.
  - VI: a module MAY use `Contracts`, `Events` and `ExtensionPoints` of a module it lists in `DependsOn`, never the reverse.
  - VIII: two-party data (chats, bookings) and public-by-id uploads carry user ids instead of a tenant, and the service checks the party or owner.
  - Add a Sync Impact Report entry with the version, reason, changed principles and "Templates: no change needed".
- [x] T002 Add `@microsoft/signalr` with an exact version (latest 9.x, no `^`) to `client/package.json`, run `npm install`, and confirm that `npm audit --audit-level=high` is clean.
- [x] T003 [P] Generate the two chats libraries with `nx g @nx/angular:library`:
  - `client/libs/shared/chats/data-access` (`shared-chats-data-access`, tags `scope:shared,type:data-access,name:chats`);
  - `client/libs/web/chats/feature` (`web-chats-feature`, tags `scope:web,type:feature,name:chats`).

  Add `@nails/shared/chats/data-access` and `@nails/web/chats/feature` to `client/tsconfig.base.json`, and remove the generated sample files and their exports.
- [x] T004 [P] Add the settings to `api/Nails.Api/appsettings.Development.json`, `appsettings.Docker.json` and `appsettings.Production.json`, with every section complete in all three:
  - `Media`: `MaxBytes` 10485760, `CacheSeconds` (0 in Development, 31536000 elsewhere), `ContentTypes` [`image/jpeg`, `image/png`, `image/webp`], `RateLimit` { `PermitLimit` 30, `Window` `00:01:00` }.
  - `Storage:RootPath`: `storage` in Development, `/app/storage` in Docker, `""` in Production.
  - `Realtime`: `KeepAliveInterval` `00:00:15`, `ClientTimeoutInterval` `00:00:30`.
  - `Modules:Chats`: `Enabled` true; `Messages` { `PageSize` 50, `MaxPageSize` 100, `MaxLength` 2000 }; `ReplyTime` { `WindowDays` 30, `MinPairs` 3 }.
- [x] T005 [P] Add `storage/` to the api `.gitignore`. Add a named volume `api-storage` mounted at `/app/storage` for the api service in `docker-compose.yml`.

---

## Phase 2: Foundational (Blocking Prerequisites)

### Module dependencies (core)

- [x] T006 Add `IReadOnlyList<string> DependsOn { get; }` to `api/Nails.Application/Common/Modules/IAppModule.cs`, and return `[]` from `IdentityModule`, `CatalogModule`, `HelpModule`, `MastersModule` and `SupportModule`.
- [x] T007 Change `api/Nails.Application/Common/Modules/ModuleRegistry.cs` so a module is enabled only when `AlwaysOn` or its `Modules:<Name>:Enabled` is true, and every module named in `DependsOn` is enabled. Resolve it transitively and ignore case. `EnabledModules`, `EnabledKeys` and `IsEnabled` all use the resolved set.

### Error codes (core)

- [x] T008 Add the codes of `contracts/chats-media-realtime.md` to `api/Nails.Application/Common/Exceptions/ErrorCodes.cs`:
  - `media-type`, `media-too-large`, `media-not-found`, `media-not-owned`
  - `not-a-master`, `other-role`, `chat-not-found`, `self-chat`, `not-own-client`
  - `empty-message`, `chat-blocked`, `message-not-found`, `not-author`, `message-deleted`
  - `already-blocked`, `not-blocker`

### Media (core, FR-001–003)

- [x] T009 [P] Create the pure helper `api/Nails.Application/Common/Media/ImageSignature.cs`. It returns `image/jpeg` for `FF D8 FF`, `image/png` for `89 50 4E 47 0D 0A 1A 0A`, `image/webp` for `RIFF????WEBP` (bytes 0–3 and 8–11), and null otherwise.
- [x] T010 [P] Create `api/Nails.Application/Common/Media/`:
  - `MediaOptions.cs`: `SectionName = "Media"`; `MaxBytes` [Range]; `CacheSeconds`; `ContentTypes` [MinLength(1)]; `RateLimit` (`FixedWindowLimitOptions`).
  - `MediaResponse.cs`: (`Id`, `Url`).
  - `MediaErrors.cs`: «Можно загрузить только фото (JPG, PNG, WebP)», «Фото больше 10 МБ», «Фото не найдено», «Это фото загрузил другой человек».
- [x] T011 Create the interfaces (after T013, which defines `MediaFile`):
  - in `api/Nails.Infrastructure/Storage/Contracts/` (implemented in Infrastructure, which doesn't reference Application; like `Email/Contracts/IEmailSender`):
    - `IFileStorage.cs`: `SaveAsync(key, Stream, ct)`, `OpenReadAsync(key, ct)`.
    - `IMediaRepository.cs`: `AddAsync(MediaFile)`, `FindAsync(id)` → `MediaFile?` (no-tracking), `IsOwnedByAsync(id, userId)`.
  - in `api/Nails.Application/Common/Media/`:
    - `IMediaService.cs`: `UploadAsync(Stream, long length, ct)` → `MediaResponse`; `OpenAsync(id, ct)` → `MediaContent?`.
    - `MediaContent.cs`: (`ContentType`, `ETag`, `Stream`).
    - `IMediaOwnership.cs`: `IsOwnedByAsync(string url, Guid userId, ct)`.
- [x] T012 Implement `api/Nails.Application/Common/Media/MediaService.cs` and `MediaOwnership.cs`:
  - Check the length against `MaxBytes` before reading, and read the first 12 bytes for `ImageSignature`. The type must also be in `ContentTypes`.
  - The id is `Guid.CreateVersion7()` and the key is `yyyy/MM/<id>.<ext>`, with the date from `TimeProvider`. Save through `IFileStorage`, then the row.
  - `MediaOwnership` accepts only the exact form `/api/media/{guid}`.
  - Log through `[LoggerMessage]` without file names.
- [x] T013 [P] Create the entity `api/Nails.Infrastructure/Storage/Entities/MediaFile.cs` (Id, OwnerUserId, ContentType, SizeBytes, StorageKey, CreatedAt; `IAuditable`) and `Storage/Configurations/MediaFileConfiguration.cs`:
  - table `media_files` in `DatabaseSchemas.Platform`;
  - `content_type` varchar(20), `storage_key` varchar(200);
  - index on `owner_user_id`.
- [x] T014 Create `api/Nails.Infrastructure/Storage/` (after T011):
  - `StorageOptions.cs`: `SectionName = "Storage"`, `RootPath` [Required].
  - `LocalFileStorage.cs`: rooted under `RootPath`; creates folders; rejects keys that escape the root.
  - `MediaRepository.cs`: no-tracking reads.

  Register `StorageOptions` (with `AddValidatedOptions`), `IFileStorage` and `IMediaRepository` in a new `Storage/StorageServiceCollectionExtensions.cs` called from the Infrastructure registration, and `MediaOptions`, `IMediaService` and `IMediaOwnership` in the Application registration.
- [x] T015 Create `api/Nails.Api/Host/Extensions/MediaEndpoints.cs` with `MapNailsMedia()`, and call it in `api/Nails.Api/Program.cs` after `MapNailsModules`:
  - `POST /api/media`: signed in; `DisableAntiforgery` is not used, because the middleware checks it; accepts `multipart/form-data` with field `file`; rate limit `media`; returns 201 `MediaResponse`; named `UploadMedia`.
  - `GET /api/media/{id:guid}`: `[AllowAnonymous]`; `Results.Stream` with `Cache-Control: private, max-age=<CacheSeconds>, immutable` (never `public`: chat photos must not land in shared caches) and an `ETag`; 404 `media-not-found`; named `GetMedia`.
- [x] T016 Set the body limits in `api/Nails.Api/Host/Extensions/ControllerExtensions.cs` (or the host builder): Kestrel `MaxRequestBodySize` and `FormOptions.MultipartBodyLengthLimit` = `Media:MaxBytes` + 64 KB.
- [x] T017 Add the per-user fixed-window policy `media` from `MediaOptions.RateLimit` in `api/Nails.Api/Host/Extensions/RateLimitingExtensions.cs`, partitioned by the `NameIdentifier` claim.

### Real time (core, FR-004–006)

- [x] T018 [P] Create `api/Nails.Application/Common/Realtime/`:
  - `IRealtimePublisher.cs`: `ToUsersAsync(IReadOnlyCollection<Guid> userIds, string eventName, object payload, CancellationToken)`.
  - `RealtimeEvents.cs`: constants `messageCreated`, `messageUpdated`, `chatRead`, `chatChanged`, `bookingChanged`, `unreadChanged`, `modeChanged`.
  - `RealtimeOptions.cs`: `SectionName = "Realtime"`, `KeepAliveInterval`, `ClientTimeoutInterval`.
- [x] T019 Create `api/Nails.Api/Host/Realtime/`:
  - `AppHub.cs`: `[Authorize]`.
    - `OnConnectedAsync` calls `IPresence.TouchAsync` with the user id parsed from `Context.UserIdentifier`.
    - `Heartbeat()` does the same.
  - `HubRealtimePublisher.cs`: wraps `IHubContext<AppHub>`, sends with `Clients.Users`, and logs and swallows failures through `[LoggerMessage]`.
- [x] T020 Create `api/Nails.Api/Host/Extensions/RealtimeExtensions.cs`:
  - `AddNailsRealtime`: `AddSignalR` with `RealtimeOptions` and the camelCase JSON protocol with `JsonStringEnumConverter`; registers `IRealtimePublisher`.
  - `MapNailsRealtime`: `MapHub<AppHub>("/api/hub", options => options.Transports = WebSockets)`.

  Wire both in `api/Nails.Api/Program.cs`.
- [x] T021 Publish every realtime event payload record as an OpenAPI component, through a document transformer in `api/Nails.Api/Host/Extensions/OpenApiExtensions.cs` that adds the schemas of a fixed list of types. The list is extended by T027 and T036.

### Client/master mode (Identity, FR-007)

- [x] T022 [P] Add `ActiveMode` to `api/Nails.Infrastructure/Modules/Identity/ApplicationUser.cs`, and in `ApplicationUserConfiguration.cs` map it as `active_mode` varchar(10), not null, default `client`. Create `api/Nails.Application/Modules/Identity/Rules/UserMode.cs` (`Client`, `Master`).
- [x] T023 Extend `api/Nails.Application/Modules/Identity/Responses/MeResponse.cs` with `UserMode Mode` and `int HeartbeatSeconds`:
  - `Mode` is reported as `Client` when `MasterId` is null.
  - `HeartbeatSeconds` comes from `PresenceOptions.TouchInterval`.

  Fill both in `Services/SessionService.cs`.
- [x] T024 Add `SetModeAsync(SetModeRequest, ct)` to `api/Nails.Application/Modules/Identity/Contracts/ISessionService.cs`, with `Requests/SetModeRequest.cs` (`[Required] UserMode Mode`), implemented in `SessionService.cs`:
  - `Master` without `MasterId` → `ForbiddenException(not-a-master, «Сначала создайте профиль мастера»)`.
  - Otherwise save with `ExecuteUpdate`, push `modeChanged` (`Responses/ModeChangedEvent.cs`) through `IRealtimePublisher`, and return `MeResponse`.
- [x] T025 Add `[HttpPut("mode")]` to `api/Nails.Api/Modules/Identity/Controllers/SessionController.cs`, calling `SetModeAsync`.
- [x] T026 [P] Add `PhonesAsync(IReadOnlyCollection<Guid> userIds, ct) → IReadOnlyDictionary<Guid,string>` to `api/Nails.Application/Modules/Identity/Contracts/IAccountDirectory.cs`. Implement it in `Services/AccountDirectory.cs` and `api/Nails.Infrastructure/Modules/Identity/Repositories/AccountDirectoryRepository.cs` (+ its contract), no-tracking, by primary key.
- [x] T027 Add `ModeChangedEvent` to the OpenAPI event list from T021.

### Masters contract for Chats (FR-027)

- [x] T028 [P] Create the contract in `api/Nails.Application/Modules/Masters/Contracts/`:
  - `IMasterDirectory.cs`:
    - `MasterOfUserAsync(userId)` → `Guid?`; null when the user has none or it is deleted.
    - `MastersAsync(masterIds)` → `IReadOnlyDictionary<Guid, MasterSummary>`.
    - `ClientsWithBookingsAsync(masterId, clientUserIds)` → `IReadOnlySet<Guid>`; site bookings in any status.
    - `BookingCardsAsync(bookingIds)` → `IReadOnlyList<BookingCard>`.
    - `BookingsOfPairAsync(masterId, clientUserId)` → `IReadOnlyList<PairBooking>`.
  - `MasterSummary.cs`: Id, UserId, Name, PhotoUrl?, Specialty, Online, Deleted.
  - `BookingCard.cs`: Id, MasterId, ClientUserId?, SubcategoryId, Price (`PriceResponse`), StartAt, DurationMin, Status, CreatedBy, CancelledBy?, CancelReason?, CancelMutual, Expired, ReleaseAt?.
  - `PairBooking.cs`: BookingId, CreatedBy, CreatedAt.
- [x] T029 Implement the directory:
  - `api/Nails.Infrastructure/Modules/Masters/Contracts/IMasterDirectoryRepository.cs` and `Repositories/MasterDirectoryRepository.cs`: no-tracking, index-friendly queries by ids.
  - `api/Nails.Application/Modules/Masters/Services/MasterDirectory.cs`:
    - `Online` through `MasterFacts.IsOnline` with `IPresence`;
    - `ReleaseAt` through `Bookings.PendingReleaseAt`, for pending bookings only.

  Register both in `MastersModule.cs`.
- [x] T030 Fix `api/Nails.Application/Modules/Masters/Services/BookingService.cs`: `AutoCancelled` events must carry each cancelled booking's own `MasterId` (research R2). Take each overlapping booking's `MasterId` from the client's active bookings it already loads (`active`, line 69), instead of `master!.Id`.

### Chats module skeleton

- [x] T031 Add `public const string Chats = "chats";` to `api/Nails.Infrastructure/Persistence/DatabaseSchemas.cs`.
- [x] T032 [P] Create `api/Nails.Infrastructure/Modules/Chats/Entities/Chat.cs` and `Configurations/ChatConfiguration.cs`, as in data-model.md:
  - Columns:
    - `id` uuid;
    - `master_id` uuid;
    - `client_user_id` uuid;
    - `client_read_at`, `master_read_at` timestamptz;
    - `client_cleared_at`, `master_cleared_at` timestamptz null ("set when that side deletes the chat; that side never sees messages at or before it");
    - `client_hidden`, `master_hidden` boolean, default false ("true when that side deletes the chat, false again on any new message or booking in the chat, or when that side starts the chat again");
    - `blocked_by` varchar(10) null (`client`/`master`);
    - `last_message_at` timestamptz null;
    - `version` bigint concurrency token (`IVersioned`);
    - `created_at`, `updated_at` (`IAuditable`).
  - Indexes:
    - unique `(master_id, client_user_id)`;
    - `(client_user_id, last_message_at desc)`;
    - `(master_id, last_message_at desc)`.
- [x] T033 [P] Create `api/Nails.Infrastructure/Modules/Chats/Entities/Message.cs` and `Configurations/MessageConfiguration.cs`:
  - Columns:
    - `id` uuid;
    - `chat_id` uuid FK → `chats.chats`, cascade;
    - `kind` varchar(10) (`text`/`booking`/`system`);
    - `author_role` varchar(10) null;
    - `text` varchar(2000) null;
    - `media_url` varchar(200) null;
    - `booking_id` uuid null;
    - `sent_at` timestamptz;
    - `edited_at`, `deleted_at` timestamptz null.
  - Indexes:
    - `(chat_id, sent_at, id)`;
    - `(chat_id, booking_id)` filtered `booking_id is not null`.
  - Check constraints:
    - `text` messages have `text` or `media_url` unless deleted;
    - `booking` messages have `booking_id`;
    - `system` messages have `text` and no `author_role`.
- [x] T034 [P] Create the pure rules in `api/Nails.Application/Modules/Chats/Rules/`, one type per file:
  - `ChatRole.cs` and `MessageKind.cs`.
  - `ChatVisibility.cs`: a chat is listed for a side when that side's `hidden` is false; its messages show to that side only after that side's `cleared_at`.
  - `Unread.cs`: the predicate of data-model.md.
  - `ChatPreview.cs`: «Нет сообщений», «Сообщение удалено», «Запись: <услуга>», «📷 Фото», or the text.
  - `MessageRules.cs`:
    - send: blocked → `chat-blocked`; blank text and no media → `empty-message`;
    - edit and delete: not the author → `not-author`; deleted → `message-deleted`; not `text` kind → `not-author`.
- [x] T035 [P] Create the options in `api/Nails.Application/Modules/Chats/Options/`:
  - `ChatMessagesOptions.cs`: `Modules:Chats:Messages`; `PageSize`, `MaxPageSize`, `MaxLength`.
  - `ReplyTimeOptions.cs`: `Modules:Chats:ReplyTime`; `WindowDays`, `MinPairs`.

  Create `Services/ChatsErrors.cs` with every Russian title of the chats contract.
- [x] T036 [P] Create the response records in `api/Nails.Application/Modules/Chats/Responses/`, with the shapes of `contracts/chats-media-realtime.md`:
  - `CounterpartResponse`, `MessageResponse`, `ChatSummaryResponse`, `ChatResponse`, `ChatBookingResponse`, `ChatThreadResponse`, `MessagesPageResponse`, `StartChatResponse`, `UnreadResponse`, `ReadResponse`;
  - the events `MessageCreatedEvent` (with `Preview`), `MessageUpdatedEvent` (with `Preview`), `ChatReadEvent`, `ChatChangedEvent`, `BookingChangedEvent`, `UnreadChangedEvent`.

  T021's OpenAPI list gains these events in T042, before the contract is built (one edit of `OpenApiExtensions.cs`).
- [x] T037 Create `api/Nails.Infrastructure/Modules/Chats/Contracts/IChatRepository.cs`, `IMessageRepository.cs` and `Repositories/ChatRepository.cs`, `MessageRepository.cs`, with models `Models/ChatListRow.cs`, `UnreadRow.cs` and `ReplyPairRow.cs`:
  - list by side (`<side>_hidden` false), with the last message after the side's clear time;
  - unread per chat and in total (one `GROUP BY`, the predicate of data-model.md);
  - find the pair;
  - insert a chat, with a duplicate-key retry that re-reads;
  - the page of messages with keyset `(sent_at, id)` after the side's clear time;
  - `ExecuteUpdate` for each read, clear and hidden column, and one that sets both hidden flags to false with `last_message_at`;
  - tracked load for block and unblock.
- [x] T038 Create `api/Nails.Application/Modules/Chats/Contracts/IChatAccess.cs` and `Services/ChatAccess.cs` (research R4):
  - Resolve the caller's user id from `ICurrentUser` and the master id from `IMasterDirectory.MasterOfUserAsync`, once per scope.
  - `ForRoleAsync(role)`: `Master` without a master id → `not-a-master`.
  - `ChatAsync(chatId, role)`: not a side → 404 `chat-not-found`; only the other side → 403 `other-role`.
- [x] T039 Create `api/Nails.Application/Modules/Chats/Services/ChatEvents.cs`. It builds and sends each event of research R10 through `IRealtimePublisher` to the master's user id and the client user id, fills `preview` of `messageCreated` and `messageUpdated` through `ChatPreview` (service names from `ICatalog`), and computes `unreadChanged` counts with `IChatRepository`.
- [x] T040 Create `api/Nails.Application/Modules/Chats/ChatsModule.cs`:
  - `Name = "Chats"`, `AlwaysOn = false`, `DependsOn = ["Masters"]`.
  - Register the options with `AddValidatedOptions`, the repositories, `ChatAccess`, `ChatEvents` and the services added below.

  Add it to `api/Nails.Application/Common/Modules/ModuleCatalog.cs`.
- [x] T041 Add the migration `AddChatsMedia` with `dotnet ef migrations add AddChatsMedia --project Nails.Infrastructure --startup-project Nails.Api` (run in `api/`). Check that it is additive (schema `chats`, two tables, `platform.media_files`, `identity.users.active_mode`) in `api/Nails.Infrastructure/Persistence/Migrations/`.

### Client core

- [x] T042 Add the event types of T036 to the OpenAPI list from T021 in `api/Nails.Api/Host/Extensions/OpenApiExtensions.cs`, then build the API, commit `api/Nails.Api/openapi.json`, and regenerate `client/libs/shared/core/data-access/src/lib/api/schema.ts` with `npx nx run shared-core-data-access:api-types`.
- [x] T043 [P] Create `client/libs/shared/core/data-access/src/lib/realtime/`:
  - `realtime-events.ts`: a map from each event name to `Schemas['<Name>Event']`.
  - `retry-policy.ts`: delays 0, 2000, 5000, 10000, 30000 ms, then 30000 forever.
  - `realtime-service.ts`: root; `HubConnectionBuilder().withUrl('/api/hub', { skipNegotiation: true, transport: HttpTransportType.WebSockets })`.
    - `start(heartbeatSeconds)` and `stop()`;
    - `on<K>(event)`: an `Observable` of the typed payload;
    - `reconnected$`;
    - the `heartbeat` invoke every `heartbeatSeconds`;
    - it never injects `SessionStore` (no dependency cycle);
    - no DOM globals.

  Export it from the lib's `index.ts`.
- [x] T044 Extend `client/libs/shared/core/data-access/src/lib/identity/session-store.ts`:
  - `mode` computed from `me().mode`;
  - `setMode(mode)`: `PUT /api/identity/mode`, then updates `me`;
  - follow `modeChanged` through `RealtimeService`;
  - start `RealtimeService` with `start(me().heartbeatSeconds)` when the status becomes `signed-in`, and stop it on sign-out or `markSignedOut`.

  Add `identityMode` to `api-paths.ts`.
- [x] T045 [P] Create `client/libs/shared/core/data-access/src/lib/media/media-api.ts`: `upload(file: Blob)` posts `FormData` with field `file` to `/api/media` and returns `Schemas['MediaResponse']`. Export it.
- [x] T046 [P] Add an `enabled` signal (`Signal<readonly string[]>`) to `client/libs/shared/core/data-access/src/lib/modules/enabled-modules.ts`, set by `load()`. Export `FrameBadge` from `client/libs/web/core/feature/src/index.ts` (for `ChatsBadge` in the web chats feature).
- [x] T047 [P] Add `formatChatTime(value, now)` to `client/libs/shared/common/util/src/lib/date.ts`, and export it:
  - «HH:mm» on the same Minsk day;
  - «Вчера»;
  - a short weekday («Пн») within 7 days;
  - else «12 авг».

  Add `formatDayPill(value, now)` there too: «Сегодня», «Вчера», «28 августа», and «28 августа 2025» when the year differs.
- [x] T048 Set `"ws": true` on `/api` in `client/apps/web/proxy.conf.json`. In `client/nginx.conf.template`:
  - add `map $http_upgrade $connection_upgrade { default upgrade; '' close; }`;
  - add `proxy_http_version 1.1`, `proxy_set_header Upgrade $http_upgrade`, `proxy_set_header Connection $connection_upgrade` and `proxy_read_timeout` (a template variable with a default in `client/Dockerfile`) to `location /api/`;
  - raise `client_max_body_size` to `11m`;
  - change `connect-src 'self'` to `connect-src 'self' wss://$host` in the CSP `add_header` (older Safari doesn't treat `'self'` as covering WebSockets; nginx fills `$host` per request).

### Chats client skeleton

- [x] T049 Create `client/libs/shared/chats/data-access/src/lib/chats-api.ts` with `chatsPaths` and promise methods for every chats endpoint of the contract (types from `Schemas` only). Export it.
- [x] T050 Create `client/libs/web/chats/feature/src/lib/manifest.ts`:
  - `frameItem`: `{ label: 'Чаты', icon: 'message-square', path: '/chats', order: 20 }`; `badge` is added in T076.
  - Guarded `routes`: `chats` → `ChatsPage`, `chats/new` → `StartChatPage`, `chats/:chatId` → `ChatsPage`.
  - Add `{ key: 'chats', load: … }` to `client/apps/web/src/modules.ts`.
- [x] T051 Create `client/libs/web/chats/feature/src/lib/chats-page.ts`:
  - the area fills the height between the bars;
  - phone (<768 px): the list, or the thread when `:chatId` is set;
  - from 768 px two panes, the list 18.75rem and from 1024 px 22.5rem;
  - with no chat open: a round icon, «Выберите чат» / «Здесь откроется переписка».

**Checkpoint**: Foundation ready: modules resolve dependencies, media and the hub work, the mode is saved, the chats tables and the module exist, and the client shell routes `/chats`.

---

## Phase 3: User Story 1 - A client writes to a master (Priority: P1)

**Goal**: «Написать» opens or creates the chat. The client sends text and photos and sees them grouped by day, with ticks.

- [x] T052 [US1] Create `api/Nails.Application/Modules/Chats/Contracts/IChatService.cs` and `Services/ChatService.cs` with `StartAsync(StartChatRequest)` (`Requests/StartChatRequest.cs`: `MasterId?`, `ClientId?`, exactly one):
  - As client: an unknown or deleted master → `master-not-found`; your own master profile → `self-chat`.
  - As master: a client without a booking at this master (`ClientsWithBookingsAsync`) → 403 `not-own-client` «Написать можно только своему клиенту».
  - Find or create the pair. When the caller had deleted it, set their `hidden` to false and keep their `cleared_at`, so the chat is listed again and its old messages stay hidden.
  - Return `StartChatResponse(chatId)`.
- [x] T053 [US1] Add `ListAsync(role)` and `ThreadAsync(chatId, role)` to `ChatService.cs`:
  - Counterparts:
    - masters through `IMasterDirectory.MastersAsync` (subtitle = specialty, online);
    - clients through `IAccountDirectory.NamesAsync`, and `PhonesAsync` only for clients in `ClientsWithBookingsAsync` (otherwise subtitle null, online false).
    - A deleted master keeps the summary's name, with `online` false; a missing client account reads «Аккаунт удалён». `CounterpartResponse` gains `deleted` so the client hides «Профиль мастера».
  - Previews come from `ChatPreview`, with service names from `ICatalog`; `unread` from the repository.
  - The thread: the last `PageSize` messages after my clear time, oldest first; `hasOlder`; `otherReadAt`; `bookings` through `BookingCardsAsync` of the chat's booking ids mapped to `ChatBookingResponse`.
- [x] T054 [US1] Create `api/Nails.Application/Modules/Chats/Contracts/IMessageService.cs` and `Services/MessageService.cs` with:
  - `SendAsync(chatId, role, SendMessageRequest)` (`Requests/SendMessageRequest.cs`: `Text?` [MaxLength from options, validated in the service against `MaxLength`], `MediaUrl?`):
    - trim the text;
    - `MessageRules` → `empty-message` or `chat-blocked`;
    - `IMediaOwnership` → 403 `media-not-owned`;
    - in client mode, a deleted master (`MastersAsync(...).Deleted`) → 404 `master-not-found` «Мастер не найден»;
    - save the message, the sender's `read_at`, `last_message_at` and both hidden flags = false;
    - publish `messageCreated` and `unreadChanged` through `ChatEvents`;
    - return 201 `MessageResponse`.
  - `PageAsync(chatId, role, MessagesPageRequest)` (`before` message id, `limit` ≤ `MaxPageSize`).
- [x] T055 [US1] Create `api/Nails.Api/Modules/Chats/Controllers/ChatsController.cs` (`[Route("")]`):
  - `POST` start;
  - `GET` list (`role`);
  - `GET {id:guid}` thread.

  Create `MessagesController.cs` (`[Route("")]`):
  - `GET {id:guid}/messages`;
  - `POST {id:guid}/messages` (201).

  Both are sealed, call one service and return its response.
- [x] T056 [US1] Rebuild `api/Nails.Api/openapi.json` and regenerate `client/libs/shared/core/data-access/src/lib/api/schema.ts`.
- [x] T057 [P] [US1] Create `client/libs/shared/chats/data-access/src/lib/chat-day-groups.ts`: a pure function that groups `MessageResponse[]` by `minskDateKey` and returns `{ key, label: formatDayPill(...), messages }[]`.
- [x] T058 [US1] Create `client/libs/shared/chats/data-access/src/lib/chat-thread-store.ts` (feature-provided):
  - load by `chatId` and role once the session is known; reload on chat id or role change;
  - `loadOlder()` keeps the order and stops at `hasOlder = false`;
  - `send({ text, mediaUrl })`: adds an optimistic bubble (`pending`); the server message replaces it; on failure it is marked `failed` and `retry(id)` resends;
  - holds `otherReadAt`.
- [x] T059 [P] [US1] Create `client/libs/web/chats/feature/src/lib/start-chat-page.ts` for `/chats/new?master=<id>`: it calls `POST /api/chats`, then `router.navigateByUrl('/chats/<chatId>', { replaceUrl: true })`. On error it shows the problem `title` with «Повторить» and «К списку чатов».
- [x] T060 [US1] Create `client/libs/web/chats/feature/src/lib/list/chat-list.ts` and `chat-row.ts`:
  - header «Чаты»;
  - rows as whole links, with the open one highlighted;
  - `app-avatar` size 60 with a master badge when `counterpart.isMaster`;
  - the name and the time `formatChatTime`;
  - the preview, muted for «Сообщение удалено»;
  - the unread pill `plural(n, ['непрочитанное сообщение','непрочитанных сообщения','непрочитанных сообщений'])`.

  States:
  - 4 skeleton rows while loading;
  - «Не удалось загрузить чаты» + «Повторить»;
  - empty: «Пока нет переписок» / «Найдите мастера на карте» + «Открыть карту» (→ `/`).
- [x] T061 [US1] Create `client/libs/web/chats/feature/src/lib/thread/chat-thread.ts` and `thread-header.ts`:
  - `app-avatar` 48 with the online dot; the name; the tag «Мастер» for masters;
  - status «онлайн» / «не в сети» (client role), or the client's phone through `formatPhone` (master role, only when present);
  - on phones, «Назад к чатам».

  States:
  - skeleton;
  - «Не удалось открыть чат» + «Повторить» + «К списку чатов».
- [x] T062 [US1] Create `client/libs/web/chats/feature/src/lib/thread/message-list.ts`, `message-bubble.ts` and `day-pill.ts`:
  - day groups from T057; system messages centred;
  - my bubbles on the right (max 85 % wide on phones, 70 % from 768 px);
  - photos as images that open `sheets/photo-sheet.ts` (heading «Фото»);
  - meta: «изменено» and `formatTime`;
  - my ticks: a clock while pending, one tick «Отправлено», two ticks «Прочитано» once `otherReadAt ≥ sentAt`;
  - red «Не отправлено. Повторить» on failure;
  - empty: «Напишите первое сообщение»;
  - older pages on scroll to the top, keeping the scroll position.
- [x] T063 [US1] Create `client/libs/web/chats/feature/src/lib/thread/composer.ts` and `photo-banner.ts`:
  - a textarea «Сообщение...» with `maxlength` 2000; Enter sends, Shift+Enter breaks a line;
  - «Прикрепить фото» (`accept="image/jpeg,image/png,image/webp"`) uploads at once through `MediaApi`;
  - the banner: a thumbnail, «Загружаем фото…», then «Фото будет отправлено» and «Убрать фото»;
  - «Отправить» is enabled with text or an uploaded photo and nothing in flight;
  - upload and action errors show inline above the composer with «Скрыть ошибку»;
  - the composer is pinned and only the messages scroll.

  The draft is never written to browser storage.
- [x] T064 [P] [US1] Create `client/libs/web/masters/feature/src/lib/write-to-master.ts`. It shows the button only when `EnabledModules.enabled()` includes `chats`:
  - a guest goes through `goToSignIn` and returns;
  - otherwise `await session.setMode('client')`, then navigate to `/chats/new?master=<id>`.
- [x] T065 [US1] Add «Написать» (icon `message-square`, `mat-stroked-button`):
  - next to «Записаться» in `client/libs/web/masters/feature/src/lib/list/master-card.ts`;
  - in `profile/profile-hero.ts` and `profile/action-bar.ts`;
  - hidden on the own profile; using `write-to-master.ts`.

**Checkpoint**: A client can open a chat from a card or the profile, send text and photos, and see day groups and ticks.

---

## Phase 4: User Story 2 - Both sides see each other live (Priority: P1)

**Goal**: Messages, reads and the unread badge reach every open tab of both people within a second.

- [x] T066 [US2] Add `ReadAsync(chatId, role)` to `ChatService.cs`. It sets my `read_at` = now with `ExecuteUpdate`, publishes `chatRead` to both and `unreadChanged` to me, and returns `ReadResponse(readAt)`. Add `UnreadAsync(role)` → `UnreadResponse(count)`.
- [x] T067 [US2] Add `POST {id:guid}/read` and `GET unread` to `api/Nails.Api/Modules/Chats/Controllers/ChatsController.cs`. Rebuild `openapi.json` and regenerate `schema.ts`.
- [x] T068 [US2] Create `client/libs/shared/chats/data-access/src/lib/unread-store.ts` (root; no reference to `FrameBadge` or the router, since `libs/shared` may not import `libs/web`):
  - `count` is a signal;
  - refetch `GET /api/chats/unread?role=<session.mode()>` on a mode change, on `RealtimeService.reconnected$` and on `refresh()`;
  - follow `unreadChanged` events whose `role` equals the current mode.
- [x] T069 [US2] Create `client/libs/shared/chats/data-access/src/lib/chat-list-store.ts`:
  - load by role;
  - on `messageCreated` and `messageUpdated`, patch the row's last message, `preview` (taken from the event; the client never builds previews) and time, raise `unread` when the message is from the other side and the chat isn't open, and move the row to the top;
  - an unknown chat id → quiet refetch;
  - `chatChanged` → patch `blockedBy`;
  - refetch on reconnect.
- [x] T070 [US2] In `chat-thread-store.ts`:
  - follow `messageCreated` for the open chat, ignoring ids it already holds;
  - follow `messageUpdated` (replace by id) and `chatRead` (update `otherReadAt` when the role is the other side's);
  - refetch on reconnect.
- [x] T071 [US2] In `client/libs/web/chats/feature/src/lib/thread/chat-thread.ts`, mark read:
  - on open;
  - on each incoming message while the thread is open and `DOCUMENT.visibilityState === 'visible'`;
  - when the tab becomes visible again.
- [x] T072 [US2] In `message-list.ts`:
  - new messages scroll to the bottom when the view is within 120 px of it;
  - otherwise show `thread/new-messages-pill.ts` «Новые сообщения ↓», which scrolls down and hides.
- [x] T073 [US2] Wire `chat-list.ts` to `ChatListStore` so rows reorder live, and show the header counter «непрочитанных: N» from `UnreadStore`.
- [x] T074 [US2] Create `client/libs/web/chats/feature/src/lib/chats-badge.ts` (`@Injectable({ providedIn: 'root' })`, `implements FrameBadge`): `count` = `UnreadStore.count`; its constructor subscribes to the router's `NavigationEnd` and calls `UnreadStore.refresh()` while `session.status() === 'signed-in'`.
- [x] T075 [US2] Check that reads by the other side update my ticks live: `chatRead` drives `otherReadAt` in `message-bubble.ts`.
- [x] T076 [US2] Set `badge: ChatsBadge` on the chats `frameItem` in `client/libs/web/chats/feature/src/lib/manifest.ts`. The existing `frame-badge-view.ts` shows it on the tab bar and the top bar.

**Checkpoint**: Two browsers see each other's messages, ticks and badge change within a second.

---

## Phase 5: User Story 3 - Bookings live in the chat (Priority: P1)

**Goal**: Booking cards and system messages for every booking change, with confirm and cancel in the chat.

- [x] T077 [P] [US3] Create `api/Nails.Application/Modules/Chats/Rules/ChatTexts.cs`. It maps `BookingChangeKind`, `Party? by` and the reason to the texts of research R3:
  - «Мастер подтвердил запись» / «Клиент подтвердил запись»;
  - «Мастер отменил запись. Причина: <причина>» / «Клиент отменил запись. Причина: <причина>»;
  - «Запись подтверждена автоматически»;
  - «Запись не подтвердили вовремя, окно освободилось. Её можно восстановить в чате.»;
  - «Запись отменена автоматически: клиент записался на это же время к другому мастеру»;
  - null for `Created` and `Completed`.
- [x] T078 [US3] Create `api/Nails.Application/Modules/Chats/Services/BookingChatHandler.cs : IBookingChangedHandler` and register it as scoped in `ChatsModule.cs`:
  - skip a change without `ClientUserId`;
  - **Created**: find or create the pair; add a `booking` message (`author_role` = `By`, `booking_id`); set `last_message_at` and both hidden flags = false; do not move any `read_at` (the card is the creator's own message, and their earlier unread messages stay unread); publish `messageCreated` and `unreadChanged` to the other side;
  - **other kinds**: read the reason through `BookingCardsAsync`; add a `system` message from `ChatTexts` when the chat exists and the text isn't null; publish `messageCreated`;
  - **always**: publish `bookingChanged { bookingId, chatId?, masterId, clientUserId, status }` to both users; `chatId` is null when the pair has no chat.

  Never log the reason.
- [x] T079 [P] [US3] Create `client/libs/shared/chats/data-access/src/lib/chat-bookings-api.ts`:
  - `confirm(id)` → `POST /api/masters/bookings/{id}/confirm`;
  - `cancel(id, { reason, mutual })` → `POST /api/masters/bookings/{id}/cancel`;
  - types from `Schemas`.
- [x] T080 [US3] In `chat-thread-store.ts`:
  - follow `bookingChanged` whose `chatId` is the open chat, or whose `bookingId` is one of its cards, and refetch the thread's `bookings`; ignore it when `chatId` is null and the booking isn't shown;
  - after a confirm or cancel, refetch the bookings too.
- [x] T081 [US3] Create `client/libs/web/chats/feature/src/lib/bookings/booking-card.ts`:
  - max 17rem, aligned to the creator's side;
  - «Запись» with a status dot; the service; «d MMM y · HH:mm» built from `formatShortDate`, the year and `formatTime`; the price through `formatPrice`.
  - Status lines:
    - «Ожидает подтверждения» (+ « · освободится, если не подтвердить до d MMM, HH:mm» for the creator, from `releaseAt`);
    - «Подтверждено»;
    - «Отменено: <причина>»;
    - «Завершено»;
    - «Неявка».
  - Released (`expired`): «Бронь можно восстановить: договоритесь в чате и создайте запись заново.» and, in client mode, «Записаться снова» → `/masters/<masterId>?book=1&service=<subcategoryId>`.
  - Buttons:
    - «Подтвердить» only for the side that did not create a pending booking;
    - «Отменить» on future pending or confirmed bookings;
    - both disabled while running, with a success toast or an error toast.
- [x] T082 [US3] Create `client/libs/web/chats/feature/src/lib/bookings/cancel-booking-sheet.ts` (`Sheets` + `SheetLayout`, heading «Отмена записи»):
  - reason chips «Изменились планы», «Заболела», «Не успеваю», «Другое»;
  - «Другое» shows «Опишите причину» (`maxlength` 300);
  - the switch «Отмена по договорённости (без последствий)», with «Отмена без взаимного согласия снижает рейтинг» shown while it is off;
  - buttons «Назад» and «Отменить запись»;
  - server errors inline.
- [x] T083 [US3] Render booking messages as `booking-card` in `message-list.ts`, through the thread's `bookings` by `bookingId`.
- [x] T084 [US3] In `client/libs/web/masters/feature/src/lib/booking/booking-sheet.ts` (or `profile/profile-page.ts` `afterClosed`), after a successful booking with `chats` enabled: `setMode('client')` and navigate to `/chats/new?master=<masterId>`. Otherwise keep today's behaviour.

**Checkpoint**: Booking from the profile opens the chat with the card, and confirm or cancel in the other browser updates the card and adds the system message on both sides.

---

## Phase 6: User Story 4 - One account, two lists (Priority: P1)

**Goal**: Client and master modes with separate lists, the other-mode state, and masters starting chats with their own clients.

- [x] T085 [US4] Create `client/libs/web/chats/feature/src/lib/list/mode-switch.ts` («Режим чатов», `mat-button-toggle-group` «Как клиент» / «Как мастер»):
  - shown only when `session.me().masterId`;
  - calls `session.setMode`, then navigates to `/chats`, leaving any open thread;
  - disabled while the change runs; an error toast on failure.

  Add it to `chat-list.ts`.
- [x] T086 [US4] Make the list, the thread and the unread store read `session.mode()` and reload when it changes, including a change pushed by `modeChanged` from another tab.
- [x] T087 [US4] Create `client/libs/web/chats/feature/src/lib/thread/other-role-state.ts`, shown on problem code `other-role`: «Этот чат доступен в другом режиме профиля».
  - With a master profile: «Перейти в режим мастера» or «Перейти в режим клиента» (calls `setMode` and reloads the thread).
  - Always: «К списку чатов».
- [x] T088 [US4] Support `/chats/new?client=<userId>` in `start-chat-page.ts` (master mode: `setMode('master')`, then `POST /api/chats { clientId }`), and show «Написать можно только своему клиенту» on `not-own-client`. Spec 009 adds the cabinet's entry point to this URL.

**Checkpoint**: Анна switches between «Как клиент» and «Как мастер», each with its own list and badge. A link to a chat of the other mode offers the switch.

---

## Phase 7: User Story 5 - Managing own messages and chats (Priority: P2)

**Goal**: Edit and delete own messages; block, unblock and delete a chat for oneself.

- [x] T089 [US5] Add `EditAsync(messageId, EditMessageRequest)` (`Requests/EditMessageRequest.cs`: text, max `MaxLength`; trimmed; blank → `empty-message` only when the message has no photo, otherwise the caption is removed) and `DeleteAsync(messageId)` to `MessageService.cs`:
  - The caller must be the author's account; otherwise `not-author`. A missing message → `message-not-found`.
  - Rules come from `MessageRules`.
  - Edit sets `edited_at`. Delete sets `deleted_at` and clears `text` and `media_url`.
  - Publish `messageUpdated` to both, and `unreadChanged` to the other side when a deleted message was unread.
- [x] T090 [US5] Add `BlockAsync(chatId, role)` and `UnblockAsync(chatId, role)` to `ChatService.cs`:
  - Block on an already blocked chat → 409 `already-blocked`.
  - Unblock by the side that did not block → 403 `not-blocker` «Разблокировать может только тот, кто заблокировал».
  - Use the `version` token; a concurrency conflict → reload and re-check.
  - Publish `chatChanged`.

  Add `ClearAsync(chatId, role)`, which sets my `cleared_at` = now and my `hidden` = true, and publishes `unreadChanged` to me.
- [x] T091 [US5] Add the endpoints and rebuild `openapi.json` and `schema.ts`:
  - in `MessagesController.cs`: `PATCH messages/{messageId:guid}`, `DELETE messages/{messageId:guid}`;
  - in `ChatsController.cs`: `POST {id:guid}/block`, `DELETE {id:guid}/block`, `DELETE {id:guid}` (204).
- [x] T092 [US5] Create `client/libs/web/chats/feature/src/lib/thread/message-actions.ts` («Действия с сообщением», `mat-menu`). It opens from a button on own text messages, from right-click and from a 500 ms long press:
  - «Изменить» (any own text-kind message, including a photo without a caption);
  - «Удалить», after which the bubble shows «Сообщение удалено».
- [x] T093 [US5] Add edit mode to `composer.ts`:
  - the banner «Редактирование сообщения» and «Отменить редактирование»;
  - the field prefilled;
  - «Сохранить» enabled when changed, and not blank unless the message has a photo.
- [x] T094 [US5] Create `client/libs/web/chats/feature/src/lib/thread/chat-menu.ts` («Меню чата», `mat-menu`, closes on Esc or an outside click):
  - «Профиль мастера» (client mode → `/masters/<id>`; hidden when `counterpart.deleted`);
  - «Заблокировать» / «Разблокировать»: disabled while running; success toast «Чат заблокирован» / «Чат разблокирован», or an error toast with the server's title;
  - «Удалить чат» (danger).
- [x] T095 [US5] Create `client/libs/web/chats/feature/src/lib/thread/blocked-bar.ts`, which replaces the composer when `blockedBy` is set: «Чат заблокирован. Писать нельзя», «Разблокировать» (both sides; disabled while running; success toast «Чат разблокирован», or the server's error, such as «Разблокировать может только тот, кто заблокировал», inline) and «Удалить чат».
- [x] T096 [US5] Create `client/libs/web/chats/feature/src/lib/sheets/delete-chat-sheet.ts`: «Удалить чат?» / «Переписка удалится из вашего списка вместе с историей. Это действие нельзя отменить.», with «Назад» and «Удалить». On success, navigate to `/chats`, show a success toast and drop the row from `ChatListStore`.

**Checkpoint**: Edits and deletions show for both sides; a blocked chat shows the bar on both sides; only the blocker can unblock; a deleted chat leaves only my list and returns on a new message.

---

## Phase 8: User Story 6 - Clients see how fast a master replies (Priority: P3)

**Goal**: «обычно отвечает за …» on the master's profile.

- [x] T097 [P] [US6] Create `api/Nails.Application/Modules/Masters/ExtensionPoints/IReplyTimeSource.cs`: `Task<int?> MedianMinutesAsync(Guid masterId, CancellationToken)`.
- [x] T098 [P] [US6] Create the pure rule `api/Nails.Application/Modules/Chats/Rules/ReplyTime.cs`:
  - pair each client message that starts a run with the next master message;
  - take the median minutes of the gaps;
  - null with fewer than `minPairs` pairs.
- [x] T099 [US6] Create `api/Nails.Application/Modules/Chats/Services/ReplyTimeSource.cs : IReplyTimeSource`. It reads the `text` and `booking` messages of the master's chats over `ReplyTimeOptions.WindowDays`, through `IMessageRepository` (`ReplyPairRow`). Register it in `ChatsModule.cs`.
- [x] T100 [US6] Add `int? ReplyMinutes` to `api/Nails.Application/Modules/Masters/Responses/MasterProfileResponse.cs`. Fill it in `Services/MasterProfileService.cs` from the first `IEnumerable<IReplyTimeSource>`, or null when none is registered. Rebuild `openapi.json` and `schema.ts`.
- [x] T101 [US6] Show the reply time in `client/libs/web/masters/feature/src/lib/profile/profile-hero.ts` when `!online && replyMinutes != null`:
  - under 60 → «обычно отвечает за N минут» (`plural`);
  - 60–119 → «обычно отвечает за час»;
  - otherwise «обычно отвечает за N часов» (whole hours, `plural`).

  Put the word forms in `texts.ts`.

**Checkpoint**: A master with at least 3 reply pairs shows the reply time when offline; with Chats off nothing shows.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T102 Create `api/Nails.Application/Modules/Chats/Seed/ChatsDemoData.cs` and `ChatsDemoSeeder.cs` (`IDemoSeeder`, `Order` 30, registered in `ChatsModule.cs`), with the chats of research R12:
  - As the client «c-me»:
    - with `m-anna-serova`: messages −22, −17, −12 min; the master's `booking` message for the pending booking (from `BookingsOfPairAsync`); «Жду вас завтра в 10:00 ✨» at −7 min; client read −15 min.
    - with `m-marina-kovaleva`: the client message, the `booking` message, «Мастер подтвердил запись», «Спасибо за доверие!».
    - with `m-yulia-pavlova`: two messages 3 days ago; client read 4 days ago.
  - As the master `m-me`:
    - with `c-alina`: two messages 2 days ago.
    - with `c-viktoria`: the client message −41 min and her `booking` message; master read −60 min.
    - with `c-olga`: «Спасибо, до завтра!» −5 h.
  - `ResetAsync` deletes the chats of these pairs with `ExecuteDelete`. Seeding never runs in Production.
- [x] T103 Write `api/Nails.Api/Modules/Help/Content/ru/articles/chats.json` (`"module": "chats"`, section «Чаты») with the articles `chats-list`, `chat-messages`, `chat-bookings`, `chat-block-delete` and `write-to-master`, as plan.md «Help» lists:
  - quote every on-screen text and error exactly, including the toasts «Чат заблокирован» and «Чат разблокирован», «Аккаунт удалён» and «Мастер не найден» when writing;
  - `write-to-master` covers «Написать» on the card and the master's page, opening the chat after booking and «обычно отвечает за …»;
  - chats articles may link to `master-profile` and `book-a-master`; no masters or core article links back;
  - use the blocks `heading`, `paragraph`, `list`, `steps`, `note`, `image` and `related`, with `**bold**` for controls.
- [x] T104 Take the pictures `api/Nails.Api/Modules/Help/Content/ru/images/chats-list/list.png`, `chat-messages/thread.png` and `chat-bookings/card.png` from the running app (phone 390×844, device scale 2, by the README procedure), with `alt` texts that quote the screen.
- [x] T105 Update `api/Nails.Api/Modules/Help/Content/ru/articles/core.json` `navigation`: remove «Раздел «Чаты» появится в панели, когда заработает.» and name no optional section. Retake `images/navigation/help.png`, and make its `alt` say «панель с разделами» without listing them, so it stays true with Chats on or off. Leave `masters.json` unchanged: nothing about chats goes outside `chats.json` (constitution IV, X).
- [x] T106 Update `README.md`:
  - the core media endpoints and storage;
  - the hub, its path, transport and events;
  - the mode;
  - module dependencies (`DependsOn`);
  - the Chats module with its endpoints and settings;
  - the new settings sections and the Docker volume.
- [x] T107 Run `dotnet ef migrations has-pending-model-changes --project Nails.Infrastructure --startup-project Nails.Api` in `api/` and confirm it is clean.
- [x] T108 Run `dotnet build Nails.slnx` (no warnings) in `api/`. Commit `api/Nails.Api/openapi.json`, regenerate `client/libs/shared/core/data-access/src/lib/api/schema.ts`, and run `npx nx run-many -t lint typecheck knip format-check build` in `client/`.
- [x] T109 Run `dotnet list Nails.slnx package --vulnerable --include-transitive` and `npm audit --audit-level=high`, and confirm nothing high or critical.
- [x] T110 Check the changed code for duplication (inside Chats first, then `Common/` and `libs/*/common`), comments, hardcoded values, secrets and dead code. Remove anything unused, including the line the sample lib files.
- [x] T111 Verify in two browsers, as Анна (client, `c-me`) and Анна Серова (master), on phone 390 px, 360 px, tablet 820 px and desktop 1440 px:
  - a message appears in the other browser within 1 s and the badge updates;
  - confirming a booking updates the card on both sides;
  - the `other-role` state;
  - blocking, and unblocking by the wrong side;
  - deleting a chat for one side and its return on a new message;
  - the photo type and 10 MB limits;
  - a reconnect after restarting the API.

  Record the results in plan.md «Implementation notes».
- [x] T112 Run the app with `Modules__Chats__Enabled=false`, and then with `Modules__Masters__Enabled=false`. Confirm (including that no help article mentions chats):
  - «Чаты», the badge, «Написать», the chats endpoints and the chats help articles disappear;
  - booking still works with Chats off, and the profile shows no reply time;
  - the tables stay.

---

## Dependencies

- Setup (T001 first, committed alone) → Foundational (T006–T051) → user stories → Polish.
- **Inside Foundational**: T006–T007 → T040. T008–T017 media. T018–T021 realtime → T024 and T039. T022–T027 mode → T044. T028–T030 → T038. T031–T040 → T041 → T042 → client T043–T051.
- **US1 (T052–T065)**: needs Foundational. MVP: a client opens a chat and sends text and photos.
- **US2 (T066–T076)**: needs US1's services and stores.
- **US3 (T077–T084)**: needs US1 (thread, list) and the Masters directory (T028–T030). It is independent of US2 except for live card refresh (T080 uses `RealtimeService`).
- **US4 (T085–T088)**: needs US1 and the mode (T022–T025, T044).
- **US5 (T089–T096)**: needs US1. Its live parts reuse US2's events.
- **US6 (T097–T101)**: needs only the chats tables and Foundational; it can run in parallel with US2–US5.
- **Polish**: T102 needs T028–T029 (`BookingsOfPairAsync`) and US3 (booking messages). T103–T105 need the screens done. T104 needs T102.
