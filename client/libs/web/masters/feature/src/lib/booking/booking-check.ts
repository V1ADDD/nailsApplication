import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDateTime, formatDuration, formatPrice } from '@nails/shared/common/util';
import {
  pendingReleaseAt,
  type MasterProfile,
  type ProfileService,
  type SlotEntry
} from '@nails/shared/masters/data-access';
import type { ConflictCheck } from './conflict-check';
import { ConflictNotes } from './conflict-notes';

@Component({
  selector: 'app-booking-check',
  imports: [ConflictNotes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-3);
    }
    p {
      margin: 0;
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
    <app-conflict-notes [check]="check()" overlapNote="Она будет отменена автоматически." />
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
