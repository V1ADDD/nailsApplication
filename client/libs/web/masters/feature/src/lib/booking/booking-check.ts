import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDateTime, formatDuration, formatPrice, formatTime } from '@nails/shared/common/util';
import type { Schemas } from '@nails/shared/core/data-access';
import {
  pendingReleaseAt,
  type MasterProfile,
  type ProfileService,
  type SlotEntry
} from '@nails/shared/masters/data-access';

export type ConflictCheck =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'failed' }
  | { state: 'done'; result: Schemas['ConflictsResponse'] };

@Component({
  selector: 'app-booking-check',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-3);
    }
    p {
      margin: 0;
    }
    .checking {
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-sm);
    }
    .alert {
      padding: var(--app-space-3);
      border: 1px solid;
      border-radius: var(--app-radius-md);
      font-size: var(--app-font-size-sm);
    }
    .overlap {
      border-color: var(--app-color-danger-border);
      background: var(--app-color-danger-soft);
      color: var(--app-color-danger);
    }
    .close {
      border-color: var(--app-color-warning-border);
      background: var(--app-color-warning-soft);
      color: var(--app-color-warning-text);
    }
    dl {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--app-space-2) var(--app-space-4);
      margin: 0;
      padding: var(--app-space-3);
      border-radius: var(--app-radius-md);
      background: var(--app-color-surface-muted);
      font-size: var(--app-font-size-sm);
    }
    dt {
      color: var(--app-color-text-muted);
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
      text-align: right;
      color: var(--app-color-text);
      font-weight: var(--app-font-weight-medium);
    }
    .note {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
  `,
  template: `
    @switch (check().state) {
      @case ('checking') {
        <p class="checking" role="status">Проверяем ваши записи на это время…</p>
      }
      @case ('done') {
        @for (booking of overlapping(); track booking.id) {
          <p class="alert overlap" role="alert">
            У вас уже есть запись на это время: {{ booking.masterName }}, {{ booking.serviceName }},
            {{ dateTime(booking.start) }}. Она будет отменена автоматически.
          </p>
        }
        @for (booking of tooClose(); track booking.id) {
          <p class="alert close" role="status">
            В этот день у вас есть запись в {{ time(booking.start) }} ({{ booking.masterName }}, {{ booking.address }})
            — проверьте, успеете ли доехать.
          </p>
        }
      }
    }
    <dl>
      <dt>Мастер</dt>
      <dd>{{ profile().name }}</dd>
      <dt>Услуга</dt>
      <dd>{{ serviceText() }}</dd>
      <dt>Когда</dt>
      <dd>{{ whenText() }}</dd>
      <dt>Адрес</dt>
      <dd>{{ profile().address }}, {{ profile().city }}</dd>
      <dt>Стоимость</dt>
      <dd>{{ priceText() }}</dd>
    </dl>
    <p class="note">Мастер подтвердит запись в чате. {{ releaseText() }}</p>
  `
})
export class BookingCheck {
  readonly profile = input.required<MasterProfile>();
  readonly service = input<ProfileService | null>(null);
  readonly slot = input<SlotEntry | null>(null);
  readonly check = input.required<ConflictCheck>();

  protected readonly time = formatTime;
  protected readonly dateTime = formatDateTime;
  protected readonly overlapping = computed(() => {
    const check = this.check();
    return check.state === 'done' ? check.result.overlapping : [];
  });
  protected readonly tooClose = computed(() => {
    const check = this.check();
    return check.state === 'done' ? check.result.tooClose : [];
  });
  protected readonly serviceText = computed(() => {
    const service = this.service();
    return service ? `${service.name}, ${formatDuration(service.durationMin)}` : 'не выбрана';
  });
  protected readonly whenText = computed(() => {
    const slot = this.slot();
    return slot ? formatDateTime(slot.start) : 'выберите время';
  });
  protected readonly priceText = computed(() => {
    const service = this.service();
    return service ? formatPrice(service.price) : '—';
  });
  protected readonly releaseText = computed(() => {
    const slot = this.slot();
    if (!slot) {
      return 'Если не подтвердит — окно освободится за 24 ч (или за 2 ч) до начала.';
    }
    const deadline = pendingReleaseAt(new Date(slot.start), new Date());
    return `Если не подтвердит до ${formatDateTime(deadline)}, окно освободится автоматически.`;
  });
}
