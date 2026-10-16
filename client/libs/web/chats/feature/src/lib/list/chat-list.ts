import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ChatListStore, UnreadStore } from '@nails/shared/chats/data-access';
import { SessionStore } from '@nails/shared/core/data-access';
import { EmptyState, ErrorState, Skeleton } from '@nails/web/common/ui';
import { ChatRow } from './chat-row';
import { ModeSwitch } from './mode-switch';

const skeletonRows = [1, 2, 3, 4];

@Component({
  selector: 'app-chat-list',
  imports: [MatButtonModule, RouterLink, EmptyState, ErrorState, Skeleton, ChatRow, ModeSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    header {
      display: grid;
      gap: var(--app-space-3);
      padding: var(--app-space-4);
      border-bottom: 1px solid var(--app-color-border);
    }
    h1 {
      margin: 0;
      font-size: var(--app-font-size-xl);
    }
    .unread {
      margin: 0;
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
    ul {
      flex: 1;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      list-style: none;
    }
    .skeleton {
      display: flex;
      gap: var(--app-space-3);
      align-items: center;
      padding: var(--app-space-3) var(--app-space-4);
    }
    .empty {
      display: grid;
      justify-items: center;
      padding-bottom: var(--app-space-6);
    }
  `,
  template: `
    <header>
      <h1>Чаты</h1>
      @if (unread.count() > 0) {
        <p class="unread">непрочитанных: {{ unread.count() }}</p>
      }
      @if (session.me()?.masterId) {
        <app-mode-switch />
      }
    </header>
    @switch (list.status()) {
      @case ('loading') {
        <ul aria-busy="true">
          @for (row of skeletonRows; track row) {
            <li class="skeleton">
              <app-skeleton width="60px" height="60px" />
              <app-skeleton width="70%" height="2.5rem" />
            </li>
          }
        </ul>
      }
      @case ('error') {
        <app-error-state title="Не удалось загрузить чаты" (retry)="list.load()" />
      }
      @default {
        @if (list.rows().length === 0) {
          <div class="empty">
            <app-empty-state title="Пока нет переписок" message="Найдите мастера на карте" />
            <a mat-flat-button routerLink="/">Открыть карту</a>
          </div>
        } @else {
          <ul>
            @for (chat of list.rows(); track chat.chatId) {
              <li><app-chat-row [chat]="chat" [open]="chat.chatId === list.openChatId()" /></li>
            }
          </ul>
        }
      }
    }
  `
})
export class ChatList {
  protected readonly list = inject(ChatListStore);
  protected readonly unread = inject(UnreadStore);
  protected readonly session = inject(SessionStore);
  protected readonly skeletonRows = skeletonRows;
}
