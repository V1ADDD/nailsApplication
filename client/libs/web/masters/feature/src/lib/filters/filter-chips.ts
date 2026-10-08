import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CatalogStore } from '@nails/shared/core/data-access';
import { activeFilterCount, MasterSearchStore } from '@nails/shared/masters/data-access';
import { Sheets } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import {
  distanceLabel,
  priceLabel,
  ratingLabel,
  windowOptions,
  type FilterSection,
  type FiltersSheetData
} from './filter-options';
import { FiltersSheet } from './filters-sheet';

interface SectionChip {
  section: FilterSection;
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-filter-chips',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    ul {
      display: flex;
      gap: var(--app-space-2);
      margin: 0;
      padding: 0 0 var(--app-space-1);
      overflow-x: auto;
      list-style: none;
      scrollbar-width: none;
      overscroll-behavior-x: contain;
    }
    ul::-webkit-scrollbar {
      display: none;
    }
    button {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-1-5);
      min-height: 2.5rem;
      padding: 0 var(--app-space-4);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      font: inherit;
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      white-space: nowrap;
      cursor: pointer;
      transition:
        background var(--app-transition-fast),
        border-color var(--app-transition-fast);
    }
    button:hover {
      border-color: var(--app-color-border-strong);
    }
    button.on {
      border-color: var(--app-color-primary);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
    }
    .dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: var(--app-radius-full);
      background: var(--app-color-success);
    }
    .badge {
      display: inline-grid;
      place-items: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 var(--app-space-1);
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
      font-size: var(--app-font-size-2xs);
      font-weight: var(--app-font-weight-bold);
    }
  `,
  template: `
    <ul aria-label="Фильтры поиска">
      <li>
        <button type="button" [class.on]="activeCount() > 0" (click)="open(null)">
          <app-icon name="sliders-horizontal" [size]="18" />
          Фильтры
          @if (activeCount() > 0) {
            <span class="badge"><span class="visually-hidden">активно:</span>{{ activeCount() }}</span>
          }
        </button>
      </li>
      @for (chip of leading(); track chip.section) {
        <li>
          <button type="button" [class.on]="chip.value !== null" (click)="open(chip.section)">
            {{ chip.value ?? chip.label }}
            <app-icon name="chevron-down" [size]="16" />
          </button>
        </li>
      }
      <li>
        <button
          type="button"
          [class.on]="filters().online"
          [attr.aria-pressed]="filters().online"
          (click)="toggle('online')"
        >
          <span class="dot" aria-hidden="true"></span>
          Онлайн
        </button>
      </li>
      @for (chip of trailing(); track chip.section) {
        <li>
          <button type="button" [class.on]="chip.value !== null" (click)="open(chip.section)">
            {{ chip.value ?? chip.label }}
            <app-icon name="chevron-down" [size]="16" />
          </button>
        </li>
      }
      <li>
        <button
          type="button"
          [class.on]="filters().verified"
          [attr.aria-pressed]="filters().verified"
          (click)="toggle('verified')"
        >
          <app-icon name="badge-check" [size]="18" />
          Проверенные
        </button>
      </li>
    </ul>
  `
})
export class FilterChips {
  private readonly store = inject(MasterSearchStore);
  private readonly catalog = inject(CatalogStore);
  private readonly sheets = inject(Sheets);

  protected readonly filters = this.store.filters;
  protected readonly activeCount = computed(() => activeFilterCount(this.filters()));
  protected readonly leading = computed<SectionChip[]>(() => {
    const filters = this.filters();
    return [
      { section: 'service', label: 'Услуга', value: filters.serviceId ? this.catalog.nameOf(filters.serviceId) : null },
      { section: 'price', label: 'Цена', value: priceLabel(filters) },
      {
        section: 'distance',
        label: 'Расстояние',
        value: filters.maxDistanceKm === null ? null : distanceLabel(filters.maxDistanceKm)
      },
      { section: 'rating', label: 'Рейтинг', value: filters.minRating === null ? null : ratingLabel(filters.minRating) }
    ];
  });
  protected readonly trailing = computed<SectionChip[]>(() => {
    const filters = this.filters();
    return [
      {
        section: 'window',
        label: 'Свободное окно',
        value: windowOptions.find((option) => option.value === filters.window)?.chip ?? null
      },
      { section: 'city', label: 'Город', value: filters.city }
    ];
  });

  protected open(section: FilterSection | null): void {
    const data: FiltersSheetData = { section };
    this.sheets.open(FiltersSheet, data);
  }

  protected toggle(field: 'online' | 'verified'): void {
    this.store.filters.update((filters) => ({ ...filters, [field]: !filters[field] }));
  }
}
