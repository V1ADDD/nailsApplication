import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { plural } from '@nails/shared/common/util';
import { MasterSearchStore } from '@nails/shared/masters/data-access';
import { masterForms } from '../texts';

@Component({
  selector: 'app-results-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-live': 'polite' },
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--app-space-1) var(--app-space-3);
      min-width: 0;
    }
    .count {
      font-size: var(--app-font-size-md);
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
    .online {
      color: var(--app-color-success-text);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      white-space: nowrap;
    }
    .online::before {
      content: '';
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      margin-right: var(--app-space-1-5);
      border-radius: var(--app-radius-full);
      background: var(--app-color-success);
      vertical-align: 0.05em;
    }
  `,
  template: `
    @if (store.loading()) {
      <span class="count">Ищем мастеров…</span>
    } @else {
      <span class="count">{{ countText() }}</span>
      @if (store.onlineCount() > 0) {
        <span class="online">{{ store.onlineCount() }} онлайн</span>
      }
    }
  `
})
export class ResultsSummary {
  protected readonly store = inject(MasterSearchStore);
  protected readonly countText = computed(() => `${plural(this.store.total(), masterForms)} рядом`);
}
