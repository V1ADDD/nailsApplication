import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { formatPrice, formatShortDate, formatTime } from '@nails/shared/common/util';
import { type Schemas, toProblem } from '@nails/shared/core/data-access';
import { bookingLine, bookingTag, MyBookingsStore, mustConfirm } from '@nails/shared/masters/data-access';
import { type CancelBookingData, CancelBookingSheet, Sheets, Toasts } from '@nails/web/common/overlays';
import { Avatar, Rating } from '@nails/web/common/ui';
import { chatQuery, injectChatsEnabled, startChatPath } from '../write-to-master';
import { bookingSummary, dayTime, profileCancelTexts } from './account-texts';
import { type MoveBookingData, MoveBookingSheet } from './move-booking-sheet';
import { ReviewSheet, type ReviewSheetData } from './review-sheet';

@Component({
  selector: 'app-my-booking-card',
  imports: [MatButtonModule, RouterLink, Avatar, Rating],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      align-content: start;
      gap: var(--app-space-3);
      padding: var(--app-space-4);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
    }
    p {
      margin: 0;
    }
    .head {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--app-space-3);
      align-items: center;
    }
    .who {
      display: grid;
      min-width: 0;
    }
    .who a {
      color: var(--app-color-text);
      font-weight: var(--app-font-weight-bold);
      text-decoration: none;
      overflow-wrap: anywhere;
    }
    .muted {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
    .price {
      font-weight: var(--app-font-weight-bold);
      white-space: nowrap;
    }
    .tag {
      justify-self: start;
      padding: var(--app-space-0-5) var(--app-space-2);
      border-radius: var(--app-radius-full);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-semibold);
    }
    .tag.warning {
      background: var(--app-color-warning-soft);
      color: var(--app-color-warning-text);
    }
    .tag.success {
      background: var(--app-color-success-soft);
      color: var(--app-color-success-text);
    }
    .tag.danger {
      background: var(--app-color-danger-soft);
      color: var(--app-color-danger);
    }
    .tag.muted {
      background: var(--app-color-surface-muted);
      color: var(--app-color-text-muted);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
    }
  `,
  template: `
    <div class="head">
      <app-avatar [name]="booking().masterName" [photoUrl]="booking().masterPhotoUrl" [size]="48" />
      <div class="who">
        <a [routerLink]="['/masters', booking().masterId]">{{ booking().masterName }}</a>
        <span class="muted">{{ booking().serviceName }}</span>
      </div>
      <span class="price">{{ price() }}</span>
    </div>
    <p class="muted">{{ when() }}</p>
    <span class="tag" [class]="tag().tone">{{ tag().label }}</span>
    @if (line(); as line) {
      <p class="muted">{{ line }}</p>
    }
    @if (item().move; as move) {
      <p class="muted">Перенос на {{ moveWhen(move.start) }} ждёт ответа мастера</p>
    }
    @if (!item().upcoming && item().myReview; as review) {
      <app-rating [value]="review.rating" [starsOnly]="true" />
    }
    <div class="actions">
      @if (canConfirm()) {
        <button mat-flat-button class="app-small" type="button" [disabled]="busy()" (click)="confirm()">
          Подтвердить
        </button>
      }
      @if (chatsEnabled()) {
        <a mat-stroked-button class="app-small" [routerLink]="startChatPath" [queryParams]="chat()">Написать</a>
      }
      @if (item().upcoming) {
        @if (item().move) {
          <button mat-stroked-button class="app-small" type="button" [disabled]="busy()" (click)="withdrawMove()">
            Отменить перенос
          </button>
        } @else {
          <button mat-stroked-button class="app-small" type="button" [disabled]="busy()" (click)="move()">
            Перенести
          </button>
        }
        <button mat-stroked-button class="app-small" type="button" [disabled]="busy()" (click)="cancel()">
          Отменить
        </button>
      } @else {
        <a
          mat-stroked-button
          class="app-small"
          [routerLink]="['/masters', booking().masterId]"
          [queryParams]="{ book: 1, service: booking().subcategoryId }"
          >Записаться снова</a
        >
        @if (item().canReview) {
          <button mat-flat-button class="app-small" type="button" (click)="review()">Оставить отзыв</button>
        }
      }
    </div>
  `
})
export class MyBookingCard {
  readonly item = input.required<Schemas['MyBookingResponse']>();
  private readonly store = inject(MyBookingsStore);
  private readonly sheets = inject(Sheets);
  private readonly toasts = inject(Toasts);
  protected readonly chatsEnabled = injectChatsEnabled();
  protected readonly startChatPath = startChatPath;
  protected readonly busy = signal(false);
  protected readonly moveWhen = dayTime;
  protected readonly booking = computed(() => this.item().booking);
  protected readonly chat = computed(() => chatQuery(this.booking().masterId));
  protected readonly tag = computed(() => bookingTag(this.booking(), this.item().upcoming));
  protected readonly line = computed(() => bookingLine(this.booking(), this.item().upcoming));
  protected readonly canConfirm = computed(() => mustConfirm(this.booking(), this.item().upcoming));
  protected readonly price = computed(() => formatPrice(this.booking().price));
  protected readonly when = computed(() => {
    const booking = this.booking();
    return `${formatShortDate(booking.start)} · ${formatTime(booking.start)} · ${booking.address}`;
  });

  protected async confirm(): Promise<void> {
    await this.run(() => this.store.confirm(this.booking().id), 'Запись подтверждена');
  }

  protected async withdrawMove(): Promise<void> {
    await this.run(() => this.store.withdrawMove(this.booking().id), 'Перенос отменён');
  }

  protected cancel(): void {
    const booking = this.booking();
    const data: CancelBookingData = {
      texts: { ...profileCancelTexts, summary: bookingSummary(booking) },
      submit: (request) => this.store.cancel(booking.id, request),
      describeError: (error) => toProblem(error).title
    };
    this.sheets
      .open(CancelBookingSheet, data)
      .afterClosed()
      .subscribe((cancelled: unknown) => {
        if (cancelled === true) {
          this.toasts.success('Запись отменена');
        }
      });
  }

  protected move(): void {
    const booking = this.booking();
    const data: MoveBookingData = {
      booking,
      request: (slotId) => this.store.requestMove(booking.id, slotId)
    };
    this.sheets.open(MoveBookingSheet, data);
  }

  protected review(): void {
    const booking = this.booking();
    const data: ReviewSheetData = {
      booking,
      submit: (request) => this.store.review(booking.id, request)
    };
    this.sheets.open(ReviewSheet, data);
  }

  private async run(action: () => Promise<void>, success: string): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      this.toasts.success(success);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }
}
