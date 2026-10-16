import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MyBookingsStore } from '@nails/shared/masters/data-access';
import { EmptyState, ErrorState, type SegmentedOption, SegmentedToggle, Skeleton } from '@nails/web/common/ui';
import { MyBookingCard } from './my-booking-card';
import { ScrollSentinel } from './scroll-sentinel';

const pastValue = 'past';
const tabs: readonly SegmentedOption[] = [
  { value: 'upcoming', label: 'Предстоящие' },
  { value: pastValue, label: 'Прошлые' }
];
const skeletons = [0, 1, 2] as const;

@Component({
  selector: 'app-bookings-panel',
  imports: [
    MatButtonModule,
    RouterLink,
    EmptyState,
    ErrorState,
    SegmentedToggle,
    Skeleton,
    MyBookingCard,
    ScrollSentinel
  ],
  providers: [MyBookingsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      gap: var(--app-space-4);
    }
    h1 {
      font-size: var(--app-font-size-xl);
      font-weight: var(--app-font-weight-bold);
    }
    .list {
      display: grid;
      gap: var(--app-space-3);
    }
    @include bp.up(xl) {
      .list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
  template: `
    <h1>Мои записи</h1>
    <app-segmented-toggle label="Записи" [options]="tabs" [value]="scope()" (changed)="switch($event)" />
    @switch (list().status()) {
      @case ('error') {
        <app-error-state title="Не удалось загрузить" (retry)="list().reload()" />
      }
      @case ('ready') {
        @if (list().items().length === 0) {
          @if (scope() === 'upcoming') {
            <app-empty-state
              title="Нет предстоящих записей"
              message="Выберите мастера на карте и запишитесь на свободное время."
            >
              <a mat-flat-button routerLink="/">Найти мастера</a>
            </app-empty-state>
          } @else {
            <app-empty-state title="Прошлых записей пока нет" />
          }
        } @else {
          <div class="list">
            @for (item of list().items(); track item.booking.id) {
              <app-my-booking-card [item]="item" />
            }
          </div>
          @if (list().hasMore()) {
            <div appScrollSentinel (reached)="list().loadMore()"></div>
          }
        }
      }
      @default {
        <div class="list">
          @for (index of skeletons; track index) {
            <app-skeleton height="9rem" />
          }
        </div>
      }
    }
  `
})
export class BookingsPanel {
  readonly sub = input<string>();
  private readonly store = inject(MyBookingsStore);
  private readonly router = inject(Router);
  protected readonly tabs = tabs;
  protected readonly skeletons = skeletons;
  protected readonly scope = computed(() => (this.sub() === pastValue ? 'past' : 'upcoming'));
  protected readonly list = computed(() => this.store.list(this.scope()));

  constructor() {
    effect(() => {
      const list = this.list();
      if (list.status() === 'idle') {
        void list.reload();
      }
    });
  }

  protected switch(value: string): void {
    void this.router.navigate([], {
      queryParams: { sub: value === pastValue ? pastValue : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
