import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatChatTime, plural } from '@nails/shared/common/util';
import type { Schemas } from '@nails/shared/core/data-access';
import { Avatar, Icon } from '@nails/web/common/ui';
import { unreadMessageForms } from '../texts';

@Component({
  selector: 'app-chat-row',
  imports: [RouterLink, Avatar, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    a {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--app-space-3);
      align-items: center;
      padding: var(--app-space-3) var(--app-space-4);
      color: inherit;
      text-decoration: none;
    }
    a:hover,
    a.open {
      background: var(--app-color-primary-soft);
    }
    .photo {
      position: relative;
    }
    .badge {
      position: absolute;
      right: -2px;
      bottom: -2px;
      display: grid;
      place-items: center;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--app-color-surface);
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
    }
    .line {
      display: flex;
      gap: var(--app-space-2);
      align-items: baseline;
      min-width: 0;
    }
    .name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: var(--app-font-weight-bold);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .time {
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-xs);
    }
    .preview {
      display: block;
      overflow: hidden;
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .preview.muted {
      color: var(--app-color-text-muted);
      font-style: italic;
    }
    .pill {
      display: inline-block;
      margin-top: var(--app-space-1);
      padding: 0 var(--app-space-2);
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
      font-size: var(--app-font-size-2xs);
      font-weight: var(--app-font-weight-semibold);
    }
  `,
  template: `
    <a [routerLink]="['/chats', chat().chatId]" [class.open]="open()" [attr.aria-current]="open() ? 'page' : null">
      <span class="photo">
        <app-avatar
          [name]="chat().counterpart.name"
          [photoUrl]="chat().counterpart.photoUrl"
          [online]="chat().counterpart.online"
          [size]="60"
        />
        @if (chat().counterpart.isMaster) {
          <span class="badge" aria-label="Мастер"><app-icon name="scissors" [size]="12" /></span>
        }
      </span>
      <span>
        <span class="line">
          <span class="name">{{ chat().counterpart.name }}</span>
          <span class="time">{{ time() }}</span>
        </span>
        <span class="preview" [class.muted]="chat().lastMessage?.deleted">{{ chat().lastMessagePreview }}</span>
        @if (chat().unread > 0) {
          <span class="pill">{{ unreadLabel() }}</span>
        }
      </span>
    </a>
  `
})
export class ChatRow {
  readonly chat = input.required<Schemas['ChatSummaryResponse']>();
  readonly open = input(false);
  protected readonly time = computed(() => formatChatTime(this.chat().lastActivityAt, new Date()));
  protected readonly unreadLabel = computed(() => plural(this.chat().unread, unreadMessageForms));
}
