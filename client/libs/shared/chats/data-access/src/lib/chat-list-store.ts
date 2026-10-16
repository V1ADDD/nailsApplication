import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService, type Schemas, SessionStore } from '@nails/shared/core/data-access';
import { ChatsApi } from './chats-api';

type ChatSummary = Schemas['ChatSummaryResponse'];
type ListStatus = 'loading' | 'ready' | 'error';

@Injectable()
export class ChatListStore {
  private readonly api = inject(ChatsApi);
  private readonly session = inject(SessionStore);
  private readonly realtime = inject(RealtimeService);
  private readonly rowsState = signal<ChatSummary[]>([]);
  private readonly statusState = signal<ListStatus>('loading');
  private request = 0;

  readonly rows = this.rowsState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly openChatId = signal<string | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.realtime
      .on('messageCreated')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((event) => {
        this.onMessageCreated(event);
      });
    this.realtime
      .on('messageUpdated')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((event) => {
        this.patch(event.chatId, (row) =>
          row.lastMessage?.id === event.message.id
            ? { ...row, lastMessage: event.message, lastMessagePreview: event.preview }
            : row
        );
      });
    this.realtime
      .on('chatChanged')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((event) => {
        this.patch(event.chatId, (row) => ({ ...row, blockedBy: event.blockedBy }));
      });
    this.realtime
      .on('chatRead')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((event) => {
        if (event.role === this.session.mode()) {
          this.patch(event.chatId, (row) => ({ ...row, unread: 0 }));
        }
      });
    this.realtime.reconnected$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => void this.load(true));
  }

  async load(quiet = false): Promise<void> {
    const request = ++this.request;
    if (!quiet) {
      this.statusState.set('loading');
    }
    try {
      const rows = await this.api.list(this.session.mode());
      if (request === this.request) {
        this.rowsState.set(rows);
        this.statusState.set('ready');
      }
    } catch {
      if (request === this.request && !quiet) {
        this.statusState.set('error');
      }
    }
  }

  remove(chatId: string): void {
    this.rowsState.update((rows) => rows.filter((row) => row.chatId !== chatId));
  }

  markRead(chatId: string): void {
    this.patch(chatId, (row) => ({ ...row, unread: 0 }));
  }

  private onMessageCreated(event: Schemas['MessageCreatedEvent']): void {
    const role = this.session.mode();
    const me = this.session.me()?.id;
    if ((role === 'client' ? event.clientUserId : event.masterUserId) !== me) {
      return;
    }
    const row = this.rowsState().find((item) => item.chatId === event.chatId);
    if (!row) {
      void this.load(true);
      return;
    }
    const incoming =
      event.message.kind !== 'system' && event.message.authorRole !== role && event.chatId !== this.openChatId();
    const updated: ChatSummary = {
      ...row,
      lastMessage: event.message,
      lastMessagePreview: event.preview,
      lastActivityAt: event.message.sentAt,
      unread: incoming ? row.unread + 1 : row.unread
    };
    this.rowsState.update((rows) => [updated, ...rows.filter((item) => item.chatId !== event.chatId)]);
  }

  private patch(chatId: string, change: (row: ChatSummary) => ChatSummary): void {
    this.rowsState.update((rows) => rows.map((row) => (row.chatId === chatId ? change(row) : row)));
  }
}
