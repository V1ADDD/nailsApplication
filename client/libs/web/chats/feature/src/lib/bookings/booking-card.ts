import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ChatThreadStore } from '@nails/shared/chats/data-access';
import { formatDateTimeWithYear, formatPrice, formatShortDate, formatTime } from '@nails/shared/common/util';
import { type Schemas, toProblem } from '@nails/shared/core/data-access';
import { Sheets, Toasts } from '@nails/web/common/overlays';
import { type CancelBookingData, CancelBookingSheet } from './cancel-booking-sheet';

type BookingCard = Schemas['BookingCard'];

const statusLabels: Record<Schemas['BookingStatus'], string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
  noShow: 'Неявка'
};

@Component({
  selector: 'app-booking-card',
  imports: [MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.mine]': 'mine()' },
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-2);
      width: min(17rem, 100%);
      padding: var(--app-space-3);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-sm);
    }
    :host(.mine) {
      justify-self: end;
    }
    p {
      margin: 0;
    }
    .title {
      display: flex;
      gap: var(--app-space-2);
      align-items: center;
      font-weight: var(--app-font-weight-bold);
    }
    .dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: var(--app-radius-full);
      background: var(--app-color-warning);
    }
    .dot.confirmed,
    .dot.completed {
      background: var(--app-color-success);
    }
    .dot.cancelled,
    .dot.noShow {
      background: var(--app-color-danger);
    }
    .muted {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
    .price {
      font-weight: var(--app-font-weight-bold);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
    }
  `,
  template: `
    <p class="title"><span class="dot" [class]="booking().status"></span>Запись</p>
    <p>{{ booking().serviceName }}</p>
    <p class="muted">{{ when() }}</p>
    <p class="price">{{ price() }}</p>
    <p class="muted">{{ statusLine() }}</p>
    @if (booking().cancelExpired) {
      <p class="muted">Бронь можно восстановить: договоритесь в чате и создайте запись заново.</p>
      @if (role() === 'client') {
        <a
          mat-stroked-button
          class="app-small"
          [routerLink]="['/masters', booking().masterId]"
          [queryParams]="{ book: 1, service: booking().subcategoryId }"
          >Записаться снова</a
        >
      }
    }
    @if (canConfirm() || canCancel()) {
      <div class="actions">
        @if (canConfirm()) {
          <button mat-flat-button class="app-small" type="button" [disabled]="busy()" (click)="confirm()">
            Подтвердить
          </button>
        }
        @if (canCancel()) {
          <button mat-stroked-button class="app-small" type="button" [disabled]="busy()" (click)="cancel()">
            Отменить
          </button>
        }
      </div>
    }
  `
})
export class BookingCardView {
  readonly booking = input.required<BookingCard>();
  readonly role = input.required<'client' | 'master'>();
  private readonly store = inject(ChatThreadStore);
  private readonly sheets = inject(Sheets);
  private readonly toasts = inject(Toasts);
  protected readonly busy = signal(false);

  protected readonly mine = computed(() => this.booking().createdBy === this.role());
  protected readonly when = computed(() => formatDateTimeWithYear(this.booking().start));
  protected readonly price = computed(() => formatPrice(this.booking().price));
  protected readonly statusLine = computed(() => {
    const booking = this.booking();
    if (booking.status === 'cancelled' && booking.cancelReason) {
      return `Отменено: ${booking.cancelReason}`;
    }
    const label = statusLabels[booking.status];
    return booking.status === 'pending' && this.mine() && booking.releaseAt
      ? `${label} · освободится, если не подтвердить до ${formatShortDate(booking.releaseAt)}, ${formatTime(booking.releaseAt)}`
      : label;
  });
  protected readonly canConfirm = computed(() => this.booking().status === 'pending' && !this.mine());
  protected readonly canCancel = computed(() => {
    const booking = this.booking();
    return (booking.status === 'pending' || booking.status === 'confirmed') && Date.parse(booking.start) > Date.now();
  });

  protected async confirm(): Promise<void> {
    this.busy.set(true);
    try {
      await this.store.confirmBooking(this.booking().id);
      this.toasts.success('Запись подтверждена');
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }

  protected cancel(): void {
    const data: CancelBookingData = {
      submit: (request) => this.store.cancelBooking(this.booking().id, request)
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
}
