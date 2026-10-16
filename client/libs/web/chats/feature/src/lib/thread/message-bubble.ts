import { ChangeDetectionStrategy, Component, computed, inject, input, output, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import type { ThreadMessage } from '@nails/shared/chats/data-access';
import { formatTime } from '@nails/shared/common/util';
import { Sheets } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import { PhotoSheet } from '../sheets/photo-sheet';

const longPressMs = 500;

@Component({
  selector: 'app-message-bubble',
  imports: [MatButtonModule, MatMenuModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.mine]': 'mine()' },
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: flex;
      gap: var(--app-space-1);
      align-items: flex-end;
      max-width: 85%;
      @include bp.up(md) {
        max-width: 70%;
      }
    }
    :host(.mine) {
      flex-direction: row-reverse;
      align-self: flex-end;
    }
    .bubble {
      min-width: 0;
      padding: var(--app-space-2) var(--app-space-3);
      border-radius: var(--app-radius-lg);
      background: var(--app-color-surface-muted);
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }
    :host(.mine) .bubble {
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
    }
    .deleted {
      font-style: italic;
      opacity: 0.75;
    }
    .photo {
      display: block;
      padding: 0;
      border: 0;
      background: none;
      cursor: zoom-in;
    }
    img {
      display: block;
      max-width: 100%;
      max-height: 16rem;
      margin-bottom: var(--app-space-1);
      border-radius: var(--app-radius-md);
    }
    .meta {
      display: flex;
      gap: var(--app-space-1);
      align-items: center;
      justify-content: flex-end;
      font-size: var(--app-font-size-2xs);
      opacity: 0.8;
    }
    .failed {
      border: 0;
      background: none;
      color: var(--app-color-danger);
      font: inherit;
      font-size: var(--app-font-size-xs);
      cursor: pointer;
    }
  `,
  template: `
    <div
      class="bubble"
      (contextmenu)="openMenu($event)"
      (pointerdown)="pressStart()"
      (pointerup)="pressEnd()"
      (pointerleave)="pressEnd()"
    >
      @if (message().deleted) {
        <span class="deleted">Сообщение удалено</span>
      } @else {
        @if (message().mediaUrl; as url) {
          <button class="photo" type="button" aria-label="Открыть фото" (click)="openPhoto(url)">
            <img [src]="url" alt="Фото в сообщении" />
          </button>
        }
        @if (message().text) {
          <span>{{ message().text }}</span>
        }
      }
      <span class="meta">
        @if (message().editedAt && !message().deleted) {
          <span>изменено</span>
        }
        <span>{{ time() }}</span>
        @if (mine()) {
          @switch (message().status) {
            @case ('pending') {
              <app-icon name="clock" [size]="14" label="Отправляется" />
            }
            @case ('sent') {
              <app-icon
                [name]="read() ? 'check-check' : 'check'"
                [size]="14"
                [label]="read() ? 'Прочитано' : 'Отправлено'"
              />
            }
          }
        }
      </span>
      @if (message().status === 'failed') {
        <button class="failed" type="button" (click)="retry.emit()">Не отправлено. Повторить</button>
      }
    </div>
    @if (editable()) {
      <button mat-icon-button type="button" aria-label="Действия с сообщением" [matMenuTriggerFor]="actions">
        <app-icon name="more-vertical" [size]="18" />
      </button>
      <mat-menu #actions="matMenu">
        <button mat-menu-item type="button" (click)="edit.emit()">Изменить</button>
        <button mat-menu-item type="button" (click)="remove.emit()">Удалить</button>
      </mat-menu>
    }
  `
})
export class MessageBubble {
  readonly message = input.required<ThreadMessage>();
  readonly mine = input(false);
  readonly read = input(false);
  readonly edit = output();
  readonly remove = output();
  readonly retry = output();
  private readonly sheets = inject(Sheets);
  private readonly trigger = viewChild(MatMenuTrigger);
  private pressTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly time = computed(() => formatTime(this.message().sentAt));
  protected readonly editable = computed(
    () => this.mine() && this.message().kind === 'text' && !this.message().deleted && this.message().status === 'sent'
  );

  protected openPhoto(url: string): void {
    this.sheets.open(PhotoSheet, url);
  }

  protected openMenu(event: Event): void {
    if (this.editable()) {
      event.preventDefault();
      this.trigger()?.openMenu();
    }
  }

  protected pressStart(): void {
    this.pressEnd();
    this.pressTimer = setTimeout(() => {
      this.trigger()?.openMenu();
    }, longPressMs);
  }

  protected pressEnd(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }
}
