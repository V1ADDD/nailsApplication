import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDateTime, formatTime } from '@nails/shared/common/util';
import type { ConflictCheck } from './conflict-check';

@Component({
  selector: 'app-conflict-notes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-3);
    }
    :host:empty {
      display: none;
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
            {{ dateTime(booking.start) }}. {{ overlapNote() }}
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
  `
})
export class ConflictNotes {
  readonly check = input.required<ConflictCheck>();
  readonly overlapNote = input('');
  readonly excludeId = input<string | null>(null);
  protected readonly time = formatTime;
  protected readonly dateTime = formatDateTime;
  protected readonly overlapping = computed(() => {
    const check = this.check();
    return check.state === 'done' ? check.result.overlapping.filter((item) => item.id !== this.excludeId()) : [];
  });
  protected readonly tooClose = computed(() => {
    const check = this.check();
    return check.state === 'done' ? check.result.tooClose.filter((item) => item.id !== this.excludeId()) : [];
  });
}
