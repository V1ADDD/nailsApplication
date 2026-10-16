import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService, type Schemas, SessionStore } from '@nails/shared/core/data-access';
import { MastersApi } from '../masters-api';
import { PagedList } from '../paged-list';

type MyBooking = Schemas['MyBookingResponse'];
type Scope = Schemas['MyBookingsScope'];

const bookingId = (item: MyBooking): string => item.booking.id;

@Injectable()
export class MyBookingsStore {
  private readonly api = inject(MastersApi);
  private readonly session = inject(SessionStore);
  readonly upcoming = new PagedList<MyBooking>((page) => this.api.myBookings('upcoming', page), bookingId);
  readonly past = new PagedList<MyBooking>((page) => this.api.myBookings('past', page), bookingId);

  constructor() {
    const realtime = inject(RealtimeService);
    const destroyRef = inject(DestroyRef);
    realtime
      .on('bookingChanged')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(({ booking }) => {
        if (booking.clientUserId === this.session.me()?.id) {
          void this.refresh(booking.id);
        }
      });
    realtime.reconnected$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => void this.reloadLoaded());
  }

  list(scope: Scope): PagedList<MyBooking> {
    return scope === 'upcoming' ? this.upcoming : this.past;
  }

  async refresh(id: string): Promise<void> {
    if (!this.upcoming.has(id) && !this.past.has(id)) {
      await this.upcoming.reload();
      return;
    }
    try {
      this.place(await this.api.myBooking(id));
    } catch {
      await this.reloadLoaded();
    }
  }

  async confirm(id: string): Promise<void> {
    await this.api.confirmBooking(id);
    await this.refresh(id);
  }

  async cancel(id: string, request: Schemas['CancelBookingRequest']): Promise<void> {
    await this.api.cancelBooking(id, request);
    await this.refresh(id);
  }

  async requestMove(id: string, slotId: string): Promise<void> {
    this.place(await this.api.requestMove(id, { slotId }));
  }

  async withdrawMove(id: string): Promise<void> {
    this.place(await this.api.withdrawMove(id));
  }

  async review(id: string, request: Schemas['WriteReviewRequest']): Promise<void> {
    await this.api.writeReview(id, request);
    await this.refresh(id);
  }

  private place(item: MyBooking): void {
    const target = item.upcoming ? this.upcoming : this.past;
    const other = item.upcoming ? this.past : this.upcoming;
    if (other.remove(item.booking.id)) {
      void target.reload();
      return;
    }
    if (target.has(item.booking.id)) {
      target.replace(item);
    } else {
      void target.reload();
    }
  }

  private async reloadLoaded(): Promise<void> {
    await Promise.all(
      [this.upcoming, this.past].filter((list) => list.status() !== 'idle').map((list) => list.reload())
    );
  }
}
