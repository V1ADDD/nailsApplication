import { HttpParams, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { CatalogStore, type Schemas } from '@nails/shared/core/data-access';
import { MastersApi, mastersPaths } from './masters-api';
import {
  emptyFilters,
  type LatLng,
  type MasterCard,
  type SearchCriteria,
  type SearchFilters,
  type SearchSort
} from './search-criteria';

type Params = Record<string, string | number | boolean>;

const firstPage = 1;
const countOnly = 0;

@Injectable({ providedIn: 'root' })
export class MasterSearchStore {
  private readonly api = inject(MastersApi);
  private readonly catalog = inject(CatalogStore);

  readonly query = signal('');
  readonly filters = signal<SearchFilters>(emptyFilters);
  readonly sort = signal<SearchSort>('distance');
  readonly location = signal<LatLng | null>(null);
  readonly selectedId = signal<string | null>(null);

  readonly criteria = computed<SearchCriteria>(() => ({
    query: this.query().trim(),
    filters: this.filters(),
    sort: this.sort(),
    location: this.location()
  }));

  private readonly firstPageResource = httpResource<Schemas['MasterSearchResponse']>(() => ({
    url: mastersPaths.search,
    params: this.toParams(this.criteria(), firstPage)
  }));

  private readonly more = linkedSignal<SearchCriteria, MasterCard[]>({ source: this.criteria, computation: () => [] });
  private readonly loadedPage = linkedSignal({ source: this.criteria, computation: () => firstPage });
  private readonly loadingMoreState = signal(false);

  private readonly lastResponse = linkedSignal<
    Schemas['MasterSearchResponse'] | undefined,
    Schemas['MasterSearchResponse'] | null
  >({
    source: () => (this.firstPageResource.hasValue() ? this.firstPageResource.value() : undefined),
    computation: (next, previous) => next ?? previous?.value ?? null
  });

  readonly response = this.lastResponse.asReadonly();

  readonly refreshing = this.firstPageResource.isLoading;
  readonly loading = computed(() => this.refreshing() && this.response() === null);
  readonly error = computed(() => (this.refreshing() ? null : (this.firstPageResource.error() ?? null)));
  readonly items = computed(() => [...(this.response()?.items ?? []), ...this.more()]);
  readonly pins = computed(() => this.response()?.pins ?? []);
  readonly total = computed(() => this.response()?.total ?? 0);
  readonly onlineCount = computed(() => this.response()?.onlineCount ?? 0);
  readonly hasMore = computed(() => this.items().length < this.total());
  readonly loadingMore = this.loadingMoreState.asReadonly();
  readonly hasCriteria = computed(() => {
    const criteria = this.criteria();
    return criteria.query.length > 0 || JSON.stringify(criteria.filters) !== JSON.stringify(emptyFilters);
  });

  reload(): void {
    this.firstPageResource.reload();
  }

  resetFilters(): void {
    this.query.set('');
    this.filters.set(emptyFilters);
  }

  async loadMore(): Promise<void> {
    if (this.loadingMoreState() || this.refreshing() || !this.hasMore()) {
      return;
    }
    const criteria = this.criteria();
    const page = this.loadedPage() + 1;
    this.loadingMoreState.set(true);
    try {
      const response = await this.api.search(new HttpParams({ fromObject: this.toParams(criteria, page) }));
      if (this.criteria() === criteria) {
        this.more.update((items) => [...items, ...response.items]);
        this.loadedPage.set(page);
      }
    } finally {
      this.loadingMoreState.set(false);
    }
  }

  async count(filters: SearchFilters): Promise<number> {
    const params = this.toParams({ ...this.criteria(), filters }, firstPage, countOnly);
    const response = await this.api.search(new HttpParams({ fromObject: params }));
    return response.total;
  }

  private toParams(criteria: SearchCriteria, page: number, pageSize?: number): Params {
    const { filters } = criteria;
    const params: Params = { sort: criteria.sort, page };
    const optional: Params = {};
    if (criteria.query) optional['q'] = criteria.query;
    if (filters.serviceId) {
      const isCategory = this.catalog.categories().some((category) => category.id === filters.serviceId);
      optional[isCategory ? 'categoryId' : 'subcategoryId'] = filters.serviceId;
    }
    if (filters.priceFrom !== null) optional['priceFrom'] = filters.priceFrom;
    if (filters.priceTo !== null) optional['priceTo'] = filters.priceTo;
    if (filters.maxDistanceKm !== null) optional['maxDistanceKm'] = filters.maxDistanceKm;
    if (filters.minRating !== null) optional['minRating'] = filters.minRating;
    if (filters.online) optional['online'] = true;
    if (filters.verified) optional['verified'] = true;
    if (filters.window) optional['window'] = filters.window;
    if (filters.city) optional['city'] = filters.city;
    if (criteria.location) {
      optional['lat'] = criteria.location.lat;
      optional['lng'] = criteria.location.lng;
    }
    if (pageSize !== undefined) optional['pageSize'] = pageSize;
    return { ...params, ...optional };
  }
}
