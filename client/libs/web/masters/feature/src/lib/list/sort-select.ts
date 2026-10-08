import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MasterSearchStore, type SearchSort } from '@nails/shared/masters/data-access';
import { Icon } from '@nails/web/common/ui';

const options: readonly { value: SearchSort; label: string }[] = [
  { value: 'distance', label: 'Ближе' },
  { value: 'rating', label: 'Рейтинг' },
  { value: 'price', label: 'Дешевле' },
  { value: 'nextSlot', label: 'Ближайшее окно' },
  { value: 'popular', label: 'Популярные' }
];

@Component({
  selector: 'app-sort-select',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      justify-self: start;
      align-items: center;
      max-width: 100%;
      color: var(--app-color-text);
    }
    select {
      appearance: none;
      max-width: 100%;
      min-height: 2.5rem;
      padding: 0 var(--app-space-10) 0 var(--app-space-10);
      border: 0;
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface-muted);
      color: inherit;
      font: inherit;
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      cursor: pointer;
    }
    app-icon {
      position: absolute;
      pointer-events: none;
    }
    .lead {
      left: var(--app-space-3);
    }
    .chevron {
      right: var(--app-space-3);
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <app-icon class="lead" name="arrow-up-down" [size]="16" />
    <select aria-label="Сортировка" [value]="store.sort()" (change)="select($event)">
      @for (option of options; track option.value) {
        <option [value]="option.value" [selected]="option.value === store.sort()">{{ option.label }}</option>
      }
    </select>
    <app-icon class="chevron" name="chevron-down" [size]="16" />
  `
})
export class SortSelect {
  protected readonly store = inject(MasterSearchStore);
  protected readonly options = options;

  protected select(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const option = options.find((candidate) => candidate.value === value);
    if (option) {
      this.store.sort.set(option.value);
    }
  }
}
