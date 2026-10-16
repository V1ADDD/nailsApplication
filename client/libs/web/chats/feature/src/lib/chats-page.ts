import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { ChatListStore } from '@nails/shared/chats/data-access';
import { SessionStore } from '@nails/shared/core/data-access';
import { Icon, Viewport } from '@nails/web/common/ui';
import { ChatList } from './list/chat-list';
import { ChatThread } from './thread/chat-thread';

@Component({
  selector: 'app-chats-page',
  imports: [ChatList, ChatThread, Icon],
  providers: [ChatListStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      height: calc(100dvh - var(--app-tab-bar-height) - env(safe-area-inset-bottom) - 2 * var(--app-space-6));
      min-height: 24rem;
      overflow: hidden;
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-xl);
      background: var(--app-color-surface);
      @include bp.up(md) {
        grid-template-columns: 18.75rem minmax(0, 1fr);
        height: calc(100dvh - var(--app-tab-bar-height) - env(safe-area-inset-bottom) - 2 * var(--app-space-8));
      }
      @include bp.up(lg) {
        grid-template-columns: 22.5rem minmax(0, 1fr);
        height: calc(100dvh - var(--app-top-bar-height) - 2 * var(--app-space-8));
      }
    }
    app-chat-list {
      @include bp.up(md) {
        border-right: 1px solid var(--app-color-border);
      }
    }
    .placeholder {
      display: grid;
      place-content: center;
      justify-items: center;
      gap: var(--app-space-2);
      padding: var(--app-space-6);
      text-align: center;
      color: var(--app-color-text-secondary);
    }
    .placeholder span {
      display: grid;
      place-items: center;
      width: 4rem;
      height: 4rem;
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
    }
    .placeholder strong {
      color: var(--app-color-text);
      font-size: var(--app-font-size-lg);
    }
  `,
  template: `
    @if (viewport.isMd() || !chatId()) {
      <app-chat-list />
    }
    @if (chatId(); as id) {
      <app-chat-thread [chatId]="id" />
    } @else if (viewport.isMd()) {
      <div class="placeholder">
        <span><app-icon name="message-square" [size]="28" /></span>
        <strong>Выберите чат</strong>
        <p>Здесь откроется переписка</p>
      </div>
    }
  `
})
export class ChatsPage {
  readonly chatId = input<string>();
  protected readonly viewport = inject(Viewport);
  private readonly list = inject(ChatListStore);
  private readonly session = inject(SessionStore);

  constructor() {
    effect(() => {
      this.list.openChatId.set(this.chatId() ?? null);
    });
    effect(() => {
      this.session.mode();
      if (this.session.status() === 'signed-in') {
        untracked(() => void this.list.load());
      }
    });
  }
}
