import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { formatDayChip, formatShortDate, formatTime, minskDateKey, plural } from '@nails/shared/common/util';
import type { MasterSlots, SlotEntry } from '@nails/shared/masters/data-access';
import { windowForms } from '../texts';

interface SlotDay {
  key: string;
  label: string;
  shortDate: string;
  slots: SlotEntry[];
  free: number;
}

const dayMs = 86_400_000;

@Component({
  selector: 'app-slot-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    .muted {
      font-size: var(--app-font-size-xs);
      color: var(--app-color-text-muted);
    }
    .days {
      display: flex;
      gap: var(--app-space-2);
      overflow-x: auto;
      padding-bottom: var(--app-space-1);
      scroll-snap-type: x proximity;
      scrollbar-width: none;
    }
    .day {
      display: grid;
      flex: 0 0 auto;
      gap: var(--app-space-0-5);
      min-width: 4.75rem;
      padding: var(--app-space-2);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-md);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      font: inherit;
      text-align: center;
      scroll-snap-align: start;
      cursor: pointer;
    }
    .day[aria-pressed='true'] {
      border-color: var(--app-color-primary);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
    }
    .day[aria-pressed='true'] .muted {
      color: inherit;
    }
    .day-label {
      font-weight: var(--app-font-weight-semibold);
    }
    .times {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
      margin-top: var(--app-space-3);
    }
    .time {
      display: grid;
      min-width: 4.5rem;
      padding: var(--app-space-2) var(--app-space-3);
      border: 1px solid var(--app-color-border-strong);
      border-radius: var(--app-radius-md);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      font: inherit;
      font-weight: var(--app-font-weight-semibold);
      cursor: pointer;
    }
    .time[aria-pressed='true'] {
      border-color: var(--app-color-primary);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
    }
    .time:disabled {
      cursor: default;
      border-color: var(--app-color-border);
      background: var(--app-color-surface-muted);
      color: var(--app-color-text-muted);
    }
    .time small {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-1);
      font-size: var(--app-font-size-2xs);
      font-weight: var(--app-font-weight-regular);
    }
    .dot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: var(--app-radius-full);
      background: var(--app-color-warning);
    }
    .empty {
      margin: var(--app-space-3) 0 0;
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <div class="days" role="group" aria-label="Дата">
      @for (day of days(); track day.key) {
        <button type="button" class="day" [attr.aria-pressed]="day.key === dayKey()" (click)="dayKey.set(day.key)">
          <span class="day-label">{{ day.label }}</span>
          <span class="muted">{{ day.shortDate }}</span>
          <span class="muted">{{ day.free > 0 ? windows(day.free) : 'нет окон' }}</span>
        </button>
      }
    </div>
    @if (selectedDay(); as day) {
      @if (day.slots.length === 0) {
        <p class="empty">В этот день мастер не работает. Выберите другую дату.</p>
      } @else {
        <div class="times" role="group" aria-label="Время">
          @for (slot of day.slots; track slot.start) {
            <button
              type="button"
              class="time"
              [disabled]="slot.status !== 'free'"
              [attr.aria-pressed]="slot.slotId !== null && slot.slotId === selected()"
              (click)="choose(slot)"
            >
              <span>{{ time(slot.start) }}</span>
              @if (slot.status === 'busy') {
                <small>занято</small>
              } @else if (slot.status === 'pending') {
                <small><span class="dot" aria-hidden="true"></span>ожидает подтверждения</small>
              }
            </button>
          }
        </div>
      }
    }
  `
})
export class SlotPicker {
  readonly slots = input.required<MasterSlots>();
  readonly selected = input<string | null>(null);
  readonly picked = output<SlotEntry>();
  protected readonly time = formatTime;
  protected readonly windows = (count: number): string => plural(count, windowForms);
  protected readonly days = computed<SlotDay[]>(() => {
    const now = new Date();
    const { days, items } = this.slots();
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(now.getTime() + index * dayMs);
      const key = minskDateKey(date);
      const slots = items.filter((slot) => minskDateKey(slot.start) === key);
      return {
        key,
        label: formatDayChip(date, now),
        shortDate: formatShortDate(date),
        slots,
        free: slots.filter((slot) => slot.status === 'free').length
      };
    });
  });
  protected readonly dayKey = linkedSignal(() => this.initialDay());
  protected readonly selectedDay = computed(() => this.days().find((day) => day.key === this.dayKey()) ?? null);

  protected choose(slot: SlotEntry): void {
    if (slot.status === 'free' && slot.slotId) {
      this.picked.emit(slot);
    }
  }

  private initialDay(): string {
    const days = this.days();
    const chosen = this.slots().items.find((item) => item.slotId !== null && item.slotId === this.selected());
    if (chosen) {
      return minskDateKey(chosen.start);
    }
    return (days.find((day) => day.free > 0) ?? days[0])?.key ?? minskDateKey(new Date());
  }
}
