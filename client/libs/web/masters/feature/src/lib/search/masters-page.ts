import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorIntl, MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { plural } from '@nails/shared/common/util';
import { CatalogStore } from '@nails/shared/core/data-access';
import { mastersResource } from '@nails/shared/masters/data-access';
import { EmptyState, ErrorState, LoadingState } from '@nails/web/common/ui';
import { RussianPaginatorIntl } from '../feedback/russian-paginator-intl';
import { PricePipe } from '../format/price-pipe';

const pageSize = 20;
const masterForms = { one: 'мастер', few: 'мастера', many: 'мастеров' };
const serviceForms = { one: 'услуга', few: 'услуги', many: 'услуг' };

interface Filters {
  category: string;
  service: string;
  city: string;
}

@Component({
  selector: 'app-masters-page',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    RouterLink,
    EmptyState,
    ErrorState,
    LoadingState,
    PricePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useClass: RussianPaginatorIntl }],
  styles: `
    .filters,
    .list {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--app-space-3);
    }
    .list {
      gap: var(--app-space-4);
      margin: var(--app-space-4) 0;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    mat-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--app-space-2) var(--app-space-4);
      padding: var(--app-space-4);
    }
    h2 {
      margin: 0;
      font: var(--mat-sys-title-medium);
    }
    p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .price {
      grid-row: 1 / span 2;
      grid-column: 2;
      font: var(--mat-sys-title-medium);
      white-space: nowrap;
    }
    @media (min-width: 768px) {
      .filters {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `,
  template: `
    <h1>Мастера</h1>
    @if (catalog.hasValue()) {
      <div class="filters">
        <mat-form-field>
          <mat-label>Категория</mat-label>
          <mat-select [value]="filters().category" (selectionChange)="apply({ category: $event.value, service: '' })">
            <mat-option value="">Все категории</mat-option>
            @for (option of catalog.value().categories; track option.id) {
              <mat-option [value]="option.id">{{ option.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Услуга</mat-label>
          <mat-select
            [value]="filters().service"
            [disabled]="services().length === 0"
            (selectionChange)="apply({ service: $event.value })"
          >
            <mat-option value="">Все услуги категории</mat-option>
            @for (option of services(); track option.id) {
              <mat-option [value]="option.id">{{ option.name }}</mat-option>
            }
          </mat-select>
          @if (services().length === 0) {
            <mat-hint>Сначала выберите категорию</mat-hint>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label>Город</mat-label>
          <mat-select [value]="filters().city" (selectionChange)="apply({ city: $event.value })">
            <mat-option value="">Все города</mat-option>
            @for (option of catalog.value().cities; track option.id) {
              <mat-option [value]="option.id">{{ option.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    }

    @if (masters.hasValue()) {
      @if (masters.value().totalCount === 0) {
        <app-empty-state title="По вашему запросу мастеров пока нет." />
      } @else {
        <p role="status">Найдено {{ count() }}</p>
        <div class="list">
          @for (master of masters.value().items; track master.id) {
            <a [routerLink]="['/masters', master.id]">
              <mat-card appearance="outlined">
                <h2>{{ master.displayName }}</h2>
                <span class="price">{{ master.headlinePrice | price }}</span>
                <p>{{ master.cityName }} · {{ master.categoryNames.join(', ') }}</p>
                <p>{{ offers(master.offerCount) }} в прайсе</p>
              </mat-card>
            </a>
          }
        </div>
        <mat-paginator
          [length]="masters.value().totalCount"
          [pageIndex]="currentPage() - 1"
          [pageSize]="pageSize"
          [hidePageSize]="true"
          (page)="changePage($event)"
        />
      }
    } @else if (masters.error()) {
      <app-error-state title="Не удалось загрузить мастеров." (retry)="masters.reload()" />
    } @else {
      <app-loading-state />
    }
  `
})
export class MastersPage {
  readonly category = input<string>();
  readonly service = input<string>();
  readonly city = input<string>();
  readonly page = input<string>();
  protected readonly pageSize = pageSize;
  private readonly router = inject(Router);
  protected readonly catalog = inject(CatalogStore).catalog;
  protected readonly filters = computed<Filters>(() => ({
    category: this.category() ?? '',
    service: this.service() ?? '',
    city: this.city() ?? ''
  }));
  protected readonly currentPage = computed(() => Math.max(1, Math.trunc(Number(this.page() ?? 1)) || 1));
  protected readonly services = computed(() => {
    const category = this.filters().category;
    return this.catalog.hasValue()
      ? (this.catalog.value().categories.find((candidate) => candidate.id === category)?.services ?? [])
      : [];
  });
  protected readonly masters = mastersResource(
    computed(() => ({ ...this.filters(), page: this.currentPage(), pageSize }))
  );
  protected readonly count = computed(() =>
    this.masters.hasValue() ? plural(this.masters.value().totalCount, masterForms) : ''
  );

  protected offers(count: number): string {
    return plural(count, serviceForms);
  }

  protected apply(change: Partial<Filters>): void {
    const next = { ...this.filters(), ...change };
    void this.router.navigate([], {
      queryParams: { category: next.category || null, service: next.service || null, city: next.city || null }
    });
  }

  protected changePage(event: PageEvent): void {
    void this.router.navigate([], {
      queryParams: { page: event.pageIndex + 1 },
      queryParamsHandling: 'merge'
    });
  }
}
