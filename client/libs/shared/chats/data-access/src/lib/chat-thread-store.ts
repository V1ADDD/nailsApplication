import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService, type Schemas, toProblem } from '@nails/shared/core/data-access';
import { Subject } from 'rxjs';
import { type ChatRole, ChatsApi } from './chats-api';

type Message = Schemas['MessageResponse'];
type BookingCard = Schemas['BookingCard'];

type MessageStatus = 'sent' | 'pending' | 'failed';

export interface ThreadMessage extends Message {
  status: MessageStatus;
}

interface ThreadState {
  chat: Schemas['ChatResponse'];
  counterpart: Schemas['CounterpartResponse'];
  bookings: BookingCard[];
  hasOlder: boolean;
}

type ThreadStatus = 'loading' | 'ready' | 'error' | 'other-role';

const localPrefix = 'local-';

@Injectable()
export class ChatThreadStore {
  private readonly api = inject(ChatsApi);
  private readonly realtime = inject(RealtimeService);
  private readonly stateSignal = signal<ThreadState | null>(null);
  private readonly messagesSignal = signal<ThreadMessage[]>([]);
  private readonly statusSignal = signal<ThreadStatus>('loading');
  private readonly incomingSubject = new Subject<Message>();
  private chatId: string | null = null;
  private role: ChatRole = 'client';
  private request = 0;
  private localCounter = 0;
  private loadingOlder = false;

  readonly state = this.stateSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly incoming$ = this.incomingSubject.asObservable();
  readonly blockedBy = computed(() => this.stateSignal()?.chat.blockedBy ?? null);
  private readonly roleState = signal<ChatRole>('client');
  readonly myRole = this.roleState.asReadonly();

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.realtime
      .on('messageCreated')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(({ chatId, message }) => {
        if (chatId !== this.chatId || this.messagesSignal().some((item) => item.id === message.id)) {
          return;
        }
        this.messagesSignal.update((items) => [...items, { ...message, status: 'sent' }]);
        if (message.kind !== 'system' && message.authorRole !== this.role) {
          this.incomingSubject.next(message);
        }
      });
    this.realtime
      .on('messageUpdated')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(({ chatId, message }) => {
        if (chatId === this.chatId) {
          this.replace(message.id, message);
        }
      });
    this.realtime
      .on('chatRead')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(({ chatId, role, readAt }) => {
        if (chatId === this.chatId && role !== this.role) {
          this.patchChat({ otherReadAt: readAt });
        }
      });
    this.realtime
      .on('chatChanged')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(({ chatId, blockedBy }) => {
        if (chatId === this.chatId) {
          this.patchChat({ blockedBy });
        }
      });
    this.realtime
      .on('bookingChanged')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(({ booking }) => {
        const state = this.stateSignal();
        if (state && (state.bookings.some((item) => item.id === booking.id) || this.belongsToPair(state, booking))) {
          this.upsertBooking(booking);
        }
      });
    this.realtime.reconnected$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      if (this.chatId) {
        void this.load(this.chatId, this.role, true);
      }
    });
  }

  async load(chatId: string, role: ChatRole, quiet = false): Promise<void> {
    const request = ++this.request;
    this.chatId = chatId;
    this.role = role;
    this.roleState.set(role);
    if (!quiet) {
      this.statusSignal.set('loading');
      this.stateSignal.set(null);
      this.messagesSignal.set([]);
    }
    try {
      const thread = await this.api.thread(chatId, role);
      if (request !== this.request) {
        return;
      }
      this.stateSignal.set({
        chat: thread.chat,
        counterpart: thread.counterpart,
        bookings: [...thread.bookings],
        hasOlder: thread.hasOlder
      });
      const pending = this.messagesSignal().filter((item) => item.status !== 'sent');
      this.messagesSignal.set([...thread.messages.map((item) => sent(item)), ...pending]);
      this.statusSignal.set('ready');
    } catch (error) {
      if (request === this.request && !quiet) {
        this.statusSignal.set(toProblem(error).code === 'other-role' ? 'other-role' : 'error');
      }
    }
  }

  async loadOlder(): Promise<void> {
    const state = this.stateSignal();
    const first = this.messagesSignal().find((item) => item.status === 'sent');
    if (!this.chatId || !state?.hasOlder || !first || this.loadingOlder) {
      return;
    }
    this.loadingOlder = true;
    try {
      const page = await this.api.older(this.chatId, this.role, first.id);
      this.messagesSignal.update((items) => [...page.items.map((item) => sent(item)), ...items]);
      this.stateSignal.set({ ...state, hasOlder: page.hasOlder });
    } finally {
      this.loadingOlder = false;
    }
  }

  async send(text: string, mediaUrl: string | null): Promise<void> {
    const local: ThreadMessage = {
      id: `${localPrefix}${++this.localCounter}`,
      kind: 'text',
      authorRole: this.role,
      text: text || null,
      mediaUrl,
      bookingId: null,
      sentAt: new Date().toISOString(),
      editedAt: null,
      deleted: false,
      status: 'pending'
    };
    this.messagesSignal.update((items) => [...items, local]);
    await this.deliver(local);
  }

  async retry(localId: string): Promise<void> {
    const local = this.messagesSignal().find((item) => item.id === localId);
    if (local) {
      this.replace(localId, { ...local, status: 'pending' });
      await this.deliver(local);
    }
  }

  async edit(messageId: string, text: string): Promise<void> {
    this.replace(messageId, await this.api.edit(messageId, { text }));
  }

  async remove(messageId: string): Promise<void> {
    this.replace(messageId, await this.api.remove(messageId));
  }

  async markRead(): Promise<void> {
    if (this.chatId) {
      await this.api.read(this.chatId, this.role);
    }
  }

  async block(): Promise<void> {
    if (this.chatId) {
      this.patchChat({ blockedBy: (await this.api.block(this.chatId, this.role)).blockedBy });
    }
  }

  async unblock(): Promise<void> {
    if (this.chatId) {
      this.patchChat({ blockedBy: (await this.api.unblock(this.chatId, this.role)).blockedBy });
    }
  }

  async clear(): Promise<void> {
    if (this.chatId) {
      await this.api.clear(this.chatId, this.role);
    }
  }

  async confirmBooking(bookingId: string): Promise<void> {
    await this.api.confirmBooking(bookingId);
  }

  async cancelBooking(bookingId: string, request: Schemas['CancelBookingRequest']): Promise<void> {
    await this.api.cancelBooking(bookingId, request);
  }

  async acceptMove(bookingId: string): Promise<void> {
    await this.api.acceptMove(bookingId);
  }

  async declineMove(bookingId: string): Promise<void> {
    await this.api.declineMove(bookingId);
  }

  private async deliver(local: ThreadMessage): Promise<void> {
    const chatId = this.chatId;
    if (!chatId) {
      return;
    }
    try {
      const message = await this.api.send(chatId, this.role, { text: local.text, mediaUrl: local.mediaUrl });
      const known = this.messagesSignal().some((item) => item.id === message.id);
      this.messagesSignal.update((items) =>
        known
          ? items.filter((item) => item.id !== local.id)
          : items.map((item) => (item.id === local.id ? sent(message) : item))
      );
    } catch (error) {
      this.replace(local.id, { ...local, status: 'failed' });
      throw error;
    }
  }

  private replace(id: string, message: Message | ThreadMessage): void {
    this.messagesSignal.update((items) =>
      items.map((item) => (item.id === id ? { status: 'sent', ...message } : item))
    );
  }

  private patchChat(change: Partial<Schemas['ChatResponse']>): void {
    this.stateSignal.update((state) => (state ? { ...state, chat: { ...state.chat, ...change } } : state));
  }

  private belongsToPair(state: ThreadState, booking: BookingCard): boolean {
    return this.role === 'client'
      ? booking.masterId === state.counterpart.id
      : booking.clientUserId === state.counterpart.id;
  }

  private upsertBooking(booking: BookingCard): void {
    this.stateSignal.update((state) =>
      state
        ? {
            ...state,
            bookings: state.bookings.some((item) => item.id === booking.id)
              ? state.bookings.map((item) => (item.id === booking.id ? booking : item))
              : [...state.bookings, booking]
          }
        : state
    );
  }
}

function sent(message: Message): ThreadMessage {
  return { ...message, status: 'sent' };
}
