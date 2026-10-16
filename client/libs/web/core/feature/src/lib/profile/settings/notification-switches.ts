import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { type Schemas, SessionStore } from '@nails/shared/core/data-access';
import { Toasts } from '@nails/web/common/overlays';

type NotificationKey = keyof Schemas['NotificationSettingsResponse'];

interface NotificationRow {
  readonly key: NotificationKey;
  readonly label: string;
  readonly hint?: string;
}

const rows: readonly NotificationRow[] = [
  { key: 'push', label: 'Push-уведомления' },
  { key: 'email', label: 'Email' },
  { key: 'site', label: 'На сайте' },
  { key: 'reminders', label: 'Напоминания о записях', hint: 'За 24 ч и за 2 ч до визита' }
];

@Component({
  selector: 'app-notification-switches',
  imports: [MatSlideToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--app-space-3);
      min-height: 3.5rem;
      padding: var(--app-space-2) var(--app-space-5);
    }
    li + li {
      border-top: 1px solid var(--app-color-border);
    }
    .text {
      display: grid;
    }
    .hint {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
  `,
  template: `
    @if (session.me(); as me) {
      <ul>
        @for (row of rows; track row.key) {
          <li>
            <span class="text">
              <span [id]="'notify-' + row.key">{{ row.label }}</span>
              @if (row.hint) {
                <span class="hint">{{ row.hint }}</span>
              }
            </span>
            <mat-slide-toggle
              [attr.aria-labelledby]="'notify-' + row.key"
              [checked]="me.notifications[row.key]"
              (change)="toggle(row.key, $event.checked)"
            />
          </li>
        }
      </ul>
    }
  `
})
export class NotificationSwitches {
  protected readonly session = inject(SessionStore);
  private readonly toasts = inject(Toasts);
  protected readonly rows = rows;

  protected async toggle(key: NotificationKey, value: boolean): Promise<void> {
    const current = this.session.me()?.notifications;
    if (!current) {
      return;
    }
    try {
      await this.session.setNotifications({ ...current, [key]: value });
      this.toasts.success('Сохранено');
    } catch {
      this.toasts.error('Не удалось сохранить настройку');
    }
  }
}
