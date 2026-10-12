import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { formatDayHeading, formatTime, minskDateKey } from '@nails/shared/common/util';
import type { SlotEntry } from '@nails/shared/masters/data-access';
import { ProfileSection } from './profile-section';

const shownDays = 3;
const timesPerDay = 6;

interface WindowDay {
  key: string;
  heading: string;
  slots: SlotEntry[];
}

@Component({
  selector: 'app-free-windows',
  imports: [MatButtonModule, ProfileSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    .days {
      display: grid;
      gap: var(--app-space-4);
    }
    h3 {
      margin: 0 0 var(--app-space-2);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
      letter-spacing: var(--app-letter-spacing-caps);
      text-transform: uppercase;
      color: var(--app-color-text-muted);
    }
    .times {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
    }
    .time {
      min-width: 4.5rem;
      min-height: 2.5rem;
      padding: 0 var(--app-space-3);
      border: 1px solid var(--app-color-border-strong);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      font: inherit;
      font-weight: var(--app-font-weight-semibold);
      cursor: pointer;
    }
    .time:hover:not(:disabled) {
      border-color: var(--app-color-primary);
      color: var(--app-color-primary);
    }
    .time:disabled {
      cursor: default;
      border-color: var(--app-color-border);
      background: var(--app-color-surface-muted);
      color: var(--app-color-text-muted);
    }
    .empty {
      margin: 0;
      color: var(--app-color-text-secondary);
    }
    .all {
      width: 100%;
    }
  `,
  template: `
    <app-profile-section icon="calendar" heading="Ближайшие свободные окна" headingId="free-windows">
      @if (days().length === 0) {
        <p class="empty">Свободных окон пока нет. Напишите мастеру — возможно, он найдёт время.</p>
      } @else {
        <div class="days">
          @for (day of days(); track day.key) {
            <div>
              <h3>{{ day.heading }}</h3>
              <div class="times">
                @for (slot of day.slots; track slot.start) {
                  <button
                    type="button"
                    class="time"
                    [disabled]="disabled()"
                    [attr.aria-label]="'Записаться: ' + day.heading + ', ' + time(slot.start)"
                    (click)="book.emit(slot.slotId ?? undefined)"
                  >
                    {{ time(slot.start) }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
        <button mat-stroked-button type="button" class="all" [disabled]="disabled()" (click)="book.emit(undefined)">
          Всё расписание
        </button>
      }
    </app-profile-section>
  `
})
export class FreeWindows {
  readonly slots = input.required<SlotEntry[]>();
  readonly disabled = input(false);
  readonly book = output<string | undefined>();

  protected readonly time = formatTime;
  protected readonly days = computed<WindowDay[]>(() => {
    const now = new Date();
    const days = new Map<string, WindowDay>();
    for (const slot of this.slots()) {
      if (slot.status !== 'free') {
        continue;
      }
      const key = minskDateKey(slot.start);
      let day = days.get(key);
      if (!day) {
        if (days.size === shownDays) {
          break;
        }
        day = { key, heading: formatDayHeading(slot.start, now), slots: [] };
        days.set(key, day);
      }
      if (day.slots.length < timesPerDay) {
        day.slots.push(slot);
      }
    }
    return [...days.values()];
  });
}
