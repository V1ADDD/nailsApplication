import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { ChatThreadStore, type DayGroup, groupByDay, type ThreadMessage } from '@nails/shared/chats/data-access';
import { toProblem } from '@nails/shared/core/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import { BookingCardView } from '../bookings/booking-card';
import { MessageBubble } from './message-bubble';

const nearEdgePx = 120;

@Component({
  selector: 'app-message-list',
  imports: [BookingCardView, MessageBubble, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: block;
      min-height: 0;
    }
    .scroller {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-2);
      height: 100%;
      padding: var(--app-space-4);
      overflow-y: auto;
    }
    .day {
      align-self: center;
      margin: var(--app-space-2) 0;
      padding: var(--app-space-1) var(--app-space-3);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface-sunken);
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-xs);
    }
    .system {
      align-self: center;
      max-width: 85%;
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-xs);
      text-align: center;
    }
    .empty {
      margin: auto;
      color: var(--app-color-text-secondary);
    }
    .new {
      position: absolute;
      bottom: var(--app-space-3);
      left: 50%;
      display: flex;
      gap: var(--app-space-1);
      align-items: center;
      padding: var(--app-space-2) var(--app-space-4);
      border: 0;
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
      font: inherit;
      box-shadow: var(--app-shadow-md);
      transform: translateX(-50%);
      cursor: pointer;
    }
  `,
  template: `
    <div class="scroller" #scroller (scroll)="scrolled()" role="log" aria-live="polite">
      @for (group of groups(); track group.key) {
        <span class="day">{{ group.label }}</span>
        @for (message of group.messages; track message.id) {
          @switch (message.kind) {
            @case ('system') {
              <p class="system">{{ message.text }}</p>
            }
            @case ('booking') {
              @if (bookingOf(message); as booking) {
                <app-booking-card [booking]="booking" [role]="role()" />
              }
            }
            @default {
              <app-message-bubble
                [message]="message"
                [mine]="message.authorRole === role()"
                [read]="isRead(message)"
                (edit)="edit.emit(message)"
                (remove)="remove(message)"
                (retry)="retry(message)"
              />
            }
          }
        }
      } @empty {
        <p class="empty">Напишите первое сообщение</p>
      }
    </div>
    @if (showNew()) {
      <button class="new" type="button" (click)="toBottom()">
        Новые сообщения <app-icon name="arrow-down" [size]="16" />
      </button>
    }
  `
})
export class MessageList {
  readonly edit = output<ThreadMessage>();
  private readonly store = inject(ChatThreadStore);
  private readonly toasts = inject(Toasts);
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private lastId: string | null = null;
  private restoreFromBottom: number | null = null;
  private nearBottom = true;
  protected readonly showNew = signal(false);
  protected readonly role = this.store.myRole;
  protected readonly groups = computed<DayGroup<ThreadMessage>[]>(() => groupByDay(this.store.messages(), new Date()));
  private readonly bookings = computed(
    () => new Map((this.store.state()?.bookings ?? []).map((booking) => [booking.id, booking]))
  );

  constructor() {
    afterRenderEffect(() => {
      const last = this.store.messages().at(-1);
      const element = this.scroller().nativeElement;
      untracked(() => {
        if (this.restoreFromBottom !== null) {
          element.scrollTop = element.scrollHeight - this.restoreFromBottom;
          this.restoreFromBottom = null;
        } else if (last && last.id !== this.lastId) {
          if (this.lastId === null || this.nearBottom || last.authorRole === this.role()) {
            element.scrollTop = element.scrollHeight;
          } else {
            this.showNew.set(true);
          }
        }
        this.lastId = last?.id ?? null;
      });
    });
  }

  protected bookingOf(message: ThreadMessage) {
    return message.bookingId ? this.bookings().get(message.bookingId) : undefined;
  }

  protected isRead(message: ThreadMessage): boolean {
    const readAt = this.store.state()?.chat.otherReadAt;
    return readAt !== undefined && Date.parse(readAt) >= Date.parse(message.sentAt);
  }

  protected scrolled(): void {
    const element = this.scroller().nativeElement;
    this.nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < nearEdgePx;
    if (this.nearBottom) {
      this.showNew.set(false);
    }
    if (element.scrollTop < nearEdgePx && this.store.state()?.hasOlder && this.restoreFromBottom === null) {
      this.restoreFromBottom = element.scrollHeight - element.scrollTop;
      this.store.loadOlder().catch(() => {
        this.restoreFromBottom = null;
      });
    }
  }

  protected toBottom(): void {
    const element = this.scroller().nativeElement;
    element.scrollTop = element.scrollHeight;
    this.showNew.set(false);
  }

  protected async remove(message: ThreadMessage): Promise<void> {
    try {
      await this.store.remove(message.id);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    }
  }

  protected async retry(message: ThreadMessage): Promise<void> {
    try {
      await this.store.retry(message.id);
    } catch {
      return;
    }
  }
}
