import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { formatDecimal, plural } from '@nails/shared/common/util';
import { CatalogStore } from '@nails/shared/core/data-access';
import { MasterSearchStore, type SearchFilters } from '@nails/shared/masters/data-access';
import { SheetLayout } from '@nails/web/common/overlays';
import { masterForms } from '../texts';
import {
  cities,
  distanceLabel,
  distanceOptions,
  parseAmount,
  ratingLabel,
  ratingOptions,
  sectionCleared,
  sectionTitles,
  windowOptions,
  type FilterSection,
  type FiltersSheetData
} from './filter-options';

const countDelay = 300;

@Component({
  selector: 'app-filters-sheet',
  imports: [MatButtonModule, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    section {
      display: grid;
      gap: var(--app-space-3);
      padding: var(--app-space-3) 0;
    }
    h3 {
      margin: 0;
      font-size: var(--app-font-size-md);
      font-weight: var(--app-font-weight-bold);
    }
    .options {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
    }
    .option {
      min-height: 2.5rem;
      padding: 0 var(--app-space-4);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      font: inherit;
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      cursor: pointer;
      transition:
        background var(--app-transition-fast),
        border-color var(--app-transition-fast);
    }
    .option:hover {
      border-color: var(--app-color-border-strong);
    }
    .option[aria-pressed='true'] {
      border-color: var(--app-color-primary);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
    }
    .prices {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: var(--app-space-3);
    }
    .toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--app-space-3);
      min-height: var(--app-tap-target);
      font-weight: var(--app-font-weight-semibold);
      cursor: pointer;
    }
    .toggle input {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: var(--app-color-primary);
    }
    .footer {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--app-space-3);
    }
  `,
  template: `
    <app-sheet-layout [heading]="heading()">
      @if (shows('service')) {
        <section aria-labelledby="filter-category">
          <h3 id="filter-category">Категория</h3>
          <div class="options">
            <button type="button" class="option" [attr.aria-pressed]="categoryId() === null" (click)="setService(null)">
              Любая
            </button>
            @for (category of catalog.categories(); track category.id) {
              <button
                type="button"
                class="option"
                [attr.aria-pressed]="categoryId() === category.id"
                (click)="setService(category.id)"
              >
                {{ category.name }}
              </button>
            }
          </div>
        </section>
        @if (selectedCategory(); as category) {
          <section aria-labelledby="filter-service">
            <h3 id="filter-service">Услуга</h3>
            <div class="options">
              <button
                type="button"
                class="option"
                [attr.aria-pressed]="draft().serviceId === category.id"
                (click)="setService(category.id)"
              >
                Все
              </button>
              @for (sub of category.subcategories; track sub.id) {
                <button
                  type="button"
                  class="option"
                  [attr.aria-pressed]="draft().serviceId === sub.id"
                  (click)="setService(sub.id)"
                >
                  {{ sub.name }}
                </button>
              }
            </div>
          </section>
        }
      }

      @if (shows('price')) {
        <section aria-labelledby="filter-price">
          <h3 id="filter-price">Цена, BYN</h3>
          <div class="prices">
            <div class="app-field">
              <label class="app-field-label" for="filter-price-from">от</label>
              <input
                id="filter-price-from"
                class="app-input"
                inputmode="decimal"
                placeholder="0"
                autocomplete="off"
                [value]="amountText(draft().priceFrom)"
                (change)="setPrice('priceFrom', $event)"
              />
            </div>
            <div class="app-field">
              <label class="app-field-label" for="filter-price-to">до</label>
              <input
                id="filter-price-to"
                class="app-input"
                inputmode="decimal"
                placeholder="Любая"
                autocomplete="off"
                [value]="amountText(draft().priceTo)"
                (change)="setPrice('priceTo', $event)"
              />
            </div>
          </div>
        </section>
      }

      @if (shows('distance')) {
        <section aria-labelledby="filter-distance">
          <h3 id="filter-distance">Расстояние от вас</h3>
          <div class="options">
            <button
              type="button"
              class="option"
              [attr.aria-pressed]="draft().maxDistanceKm === null"
              (click)="patch({ maxDistanceKm: null })"
            >
              Любое
            </button>
            @for (km of distanceOptions; track km) {
              <button
                type="button"
                class="option"
                [attr.aria-pressed]="draft().maxDistanceKm === km"
                (click)="patch({ maxDistanceKm: km })"
              >
                {{ distanceLabel(km) }}
              </button>
            }
          </div>
        </section>
      }

      @if (shows('rating')) {
        <section aria-labelledby="filter-rating">
          <h3 id="filter-rating">Рейтинг</h3>
          <div class="options">
            <button
              type="button"
              class="option"
              [attr.aria-pressed]="draft().minRating === null"
              (click)="patch({ minRating: null })"
            >
              Любой
            </button>
            @for (rating of ratingOptions; track rating) {
              <button
                type="button"
                class="option"
                [attr.aria-pressed]="draft().minRating === rating"
                (click)="patch({ minRating: rating })"
              >
                {{ ratingLabel(rating) }}
              </button>
            }
          </div>
        </section>
      }

      @if (shows('window')) {
        <section aria-labelledby="filter-window">
          <h3 id="filter-window">Свободное окно</h3>
          <div class="options">
            <button
              type="button"
              class="option"
              [attr.aria-pressed]="draft().window === null"
              (click)="patch({ window: null })"
            >
              Любое
            </button>
            @for (option of windowOptions; track option.value) {
              <button
                type="button"
                class="option"
                [attr.aria-pressed]="draft().window === option.value"
                (click)="patch({ window: option.value })"
              >
                {{ option.label }}
              </button>
            }
          </div>
        </section>
      }

      @if (shows('city')) {
        <section aria-labelledby="filter-city">
          <h3 id="filter-city">Город</h3>
          <div class="options">
            <button
              type="button"
              class="option"
              [attr.aria-pressed]="draft().city === null"
              (click)="patch({ city: null })"
            >
              Любой
            </button>
            @for (city of cities; track city) {
              <button
                type="button"
                class="option"
                [attr.aria-pressed]="draft().city === city"
                (click)="patch({ city })"
              >
                {{ city }}
              </button>
            }
          </div>
        </section>
      }

      @if (data.section === null) {
        <section aria-label="Дополнительно">
          <label class="toggle">
            Сейчас онлайн
            <input type="checkbox" [checked]="draft().online" (change)="patch({ online: !draft().online })" />
          </label>
          <label class="toggle">
            Только проверенные мастера
            <input type="checkbox" [checked]="draft().verified" (change)="patch({ verified: !draft().verified })" />
          </label>
        </section>
      }

      <div class="footer" sheetFooter>
        <button mat-stroked-button type="button" class="app-large" (click)="reset()">Сбросить</button>
        <button mat-flat-button type="button" class="app-large" [disabled]="count() === 0" (click)="apply()">
          {{ applyText() }}
        </button>
      </div>
    </app-sheet-layout>
  `
})
export class FiltersSheet {
  protected readonly data = inject<FiltersSheetData>(MAT_DIALOG_DATA);
  protected readonly catalog = inject(CatalogStore);
  private readonly store = inject(MasterSearchStore);
  private readonly ref = inject(MatDialogRef<FiltersSheet>);

  protected readonly distanceOptions = distanceOptions;
  protected readonly ratingOptions = ratingOptions;
  protected readonly windowOptions = windowOptions;
  protected readonly cities = cities;
  protected readonly distanceLabel = distanceLabel;
  protected readonly ratingLabel = ratingLabel;

  protected readonly draft = signal<SearchFilters>(this.store.filters());
  protected readonly count = signal<number | null>(null);
  protected readonly heading = computed(() => (this.data.section ? sectionTitles[this.data.section] : 'Фильтры'));
  protected readonly selectedCategory = computed(() => {
    const serviceId = this.draft().serviceId;
    return serviceId ? this.catalog.categoryOf(serviceId) : null;
  });
  protected readonly categoryId = computed(() => this.selectedCategory()?.id ?? null);
  protected readonly applyText = computed(() => {
    const count = this.count();
    if (count === null) {
      return 'Считаем…';
    }
    return count === 0 ? 'Никого не найдено' : `Показать ${plural(count, masterForms)}`;
  });

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let request = 0;
    inject(DestroyRef).onDestroy(() => clearTimeout(timer));

    effect(() => {
      const draft = this.draft();
      this.count.set(null);
      clearTimeout(timer);
      const current = ++request;
      timer = setTimeout(async () => {
        try {
          const total = await this.store.count(draft);
          if (current === request) {
            this.count.set(total);
          }
        } catch {
          if (current === request) {
            this.count.set(this.store.total());
          }
        }
      }, countDelay);
    });
  }

  protected shows(section: FilterSection): boolean {
    return this.data.section === null || this.data.section === section;
  }

  protected patch(change: Partial<SearchFilters>): void {
    this.draft.update((draft) => ({ ...draft, ...change }));
  }

  protected setService(id: string | null): void {
    this.patch({ serviceId: id });
  }

  protected setPrice(field: 'priceFrom' | 'priceTo', event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseAmount(input.value);
    input.value = this.amountText(value);
    this.patch({ [field]: value });
  }

  protected amountText(value: number | null): string {
    return value === null ? '' : formatDecimal(value);
  }

  protected reset(): void {
    this.draft.set(sectionCleared(this.draft(), this.data.section));
  }

  protected apply(): void {
    this.store.filters.set(this.draft());
    this.ref.close();
  }
}
