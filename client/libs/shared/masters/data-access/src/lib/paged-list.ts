import { computed, signal } from '@angular/core';

export interface Page<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

type ListStatus = 'idle' | 'loading' | 'ready' | 'error';

export class PagedList<T> {
  private readonly itemsSignal = signal<readonly T[]>([]);
  private readonly statusSignal = signal<ListStatus>('idle');
  private readonly totalSignal = signal(0);
  private readonly loadingMoreSignal = signal(false);
  private page = 0;
  private request = 0;

  readonly items = this.itemsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly total = this.totalSignal.asReadonly();
  readonly loadingMore = this.loadingMoreSignal.asReadonly();
  readonly hasMore = computed(() => this.itemsSignal().length < this.totalSignal());

  constructor(
    private readonly fetch: (page: number) => Promise<Page<T>>,
    private readonly key: (item: T) => string
  ) {}

  async reload(): Promise<void> {
    const request = ++this.request;
    if (this.statusSignal() !== 'ready') {
      this.statusSignal.set('loading');
    }
    try {
      const page = await this.fetch(1);
      if (request === this.request) {
        this.page = 1;
        this.itemsSignal.set(page.items);
        this.totalSignal.set(page.totalCount);
        this.statusSignal.set('ready');
      }
    } catch {
      if (request === this.request) {
        this.statusSignal.set('error');
      }
    }
  }

  async loadMore(): Promise<void> {
    if (this.loadingMoreSignal() || !this.hasMore() || this.statusSignal() !== 'ready') {
      return;
    }
    const request = this.request;
    this.loadingMoreSignal.set(true);
    try {
      const page = await this.fetch(this.page + 1);
      if (request === this.request) {
        this.page += 1;
        const known = new Set(this.itemsSignal().map(this.key));
        this.itemsSignal.update((items) => [...items, ...page.items.filter((item) => !known.has(this.key(item)))]);
        this.totalSignal.set(page.totalCount);
      }
    } finally {
      this.loadingMoreSignal.set(false);
    }
  }

  has(id: string): boolean {
    return this.itemsSignal().some((item) => this.key(item) === id);
  }

  replace(item: T): void {
    const id = this.key(item);
    this.itemsSignal.update((items) => items.map((current) => (this.key(current) === id ? item : current)));
  }

  remove(id: string): T | null {
    const found = this.itemsSignal().find((item) => this.key(item) === id) ?? null;
    if (found) {
      this.itemsSignal.update((items) => items.filter((item) => this.key(item) !== id));
      this.totalSignal.update((total) => Math.max(0, total - 1));
    }
    return found;
  }

  restore(item: T, index: number): void {
    this.itemsSignal.update((items) => [...items.slice(0, index), item, ...items.slice(index)]);
    this.totalSignal.update((total) => total + 1);
  }

  indexOf(id: string): number {
    return this.itemsSignal().findIndex((item) => this.key(item) === id);
  }
}
