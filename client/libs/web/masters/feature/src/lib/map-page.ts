import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { MastersApi, MasterSearchStore, type MasterCard } from '@nails/shared/masters/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { Viewport } from '@nails/web/common/ui';
import { appPaths, FrameEdgeTab } from '@nails/web/core/feature';
import { FilterChips } from './filters/filter-chips';
import { ResultsList } from './list/results-list';
import { ResultsSheet, type SheetSnap } from './list/results-sheet';
import { ResultsSummary } from './list/results-summary';
import { SortSelect } from './list/sort-select';
import { MastersMap } from './map/masters-map';
import { PinCard } from './map/pin-card';
import { SearchBar } from './search/search-bar';

const locationFailed = 'Не удалось определить местоположение — показываем центр Минска';
const locationTimeoutMs = 10000;

@Component({
  selector: 'app-map-page',
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    RouterLink,
    FrameEdgeTab,
    FilterChips,
    ResultsList,
    ResultsSheet,
    ResultsSummary,
    SortSelect,
    MastersMap,
    PinCard,
    SearchBar
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.phone]': '!viewport.isMd()',
    '[class.tablet]': 'viewport.isMd() && !viewport.isLg()',
    '[class.desktop]': 'viewport.isLg()',
    '[class.pin-open]': 'pinCard() !== null',
    '[class.sheet-collapsed]': "snap() === 'collapsed'"
  },
  styles: `
    @use 'breakpoints' as bp;

    :host {
      position: fixed;
      inset: 0 0 calc(var(--app-tab-bar-height) + env(safe-area-inset-bottom));
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      background: var(--app-color-surface);
    }
    :host(.desktop) {
      inset: var(--app-top-bar-height) 0 0;
      grid-template-columns: clamp(22rem, 28vw, 27rem) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr);
    }
    .top {
      position: relative;
      z-index: calc(var(--app-z-sheet) + 1);
      display: grid;
      gap: var(--app-space-3);
      padding: var(--app-space-4) var(--app-space-4) var(--app-space-3);
      background: var(--app-color-surface);
      border-bottom: 1px solid var(--app-color-border);
    }
    :host(.tablet) app-search-bar {
      max-width: 38rem;
    }
    .stage {
      position: relative;
      min-height: 0;
    }
    app-masters-map {
      position: absolute;
      inset: 0;
    }
    :host(.phone) app-masters-map {
      --map-controls-bottom: calc(4rem + var(--app-space-4));
    }
    :host(.phone.pin-open) app-masters-map {
      --map-controls-bottom: calc(4rem + var(--app-map-card-clearance) + var(--app-space-4));
    }
    :host(.tablet) app-masters-map,
    :host(.desktop) app-masters-map {
      --map-controls-top: var(--app-space-4);
    }
    .edge {
      position: absolute;
      top: 50%;
      right: 0;
      z-index: var(--app-z-map-controls);
      transform: translateY(-50%);
    }
    :host(.phone) .edge {
      top: var(--app-space-16);
      transform: none;
    }
    .sign-in {
      position: absolute;
      left: var(--app-space-4);
      bottom: calc(4rem + var(--app-space-4));
      z-index: var(--app-z-map-controls);
      box-shadow: var(--app-shadow-primary);
    }
    .pin {
      position: absolute;
      left: var(--app-space-4);
      right: var(--app-space-4);
      bottom: calc(4rem + var(--app-space-4));
      z-index: var(--app-z-sheet);
    }
    .panel {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-height: 0;
      background: var(--app-color-surface);
    }
    :host(.tablet) .panel {
      position: absolute;
      top: var(--app-space-4);
      bottom: var(--app-space-4);
      left: var(--app-space-4);
      z-index: var(--app-z-sheet);
      width: min(22.5rem, calc(100% - 7rem));
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-xl);
      box-shadow: var(--app-shadow-lg);
      overflow: hidden;
    }
    :host(.desktop) .panel {
      grid-template-rows: auto auto minmax(0, 1fr);
      border-right: 1px solid var(--app-color-border);
    }
    :host(.desktop) .top {
      border-bottom: 1px solid var(--app-color-border);
    }
    .panel-head {
      display: grid;
      gap: var(--app-space-3);
      padding: var(--app-space-4) var(--app-space-4) var(--app-space-3);
    }
    .scroll {
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 0 var(--app-space-4) var(--app-space-4);
    }
    .sort {
      margin-bottom: var(--app-space-3);
    }
  `,
  template: `
    <h1 class="visually-hidden">Мастера рядом на карте</h1>

    @if (viewport.isLg()) {
      <aside class="panel" aria-label="Мастера">
        <div class="top">
          <app-search-bar />
          <app-filter-chips />
        </div>
        <div class="panel-head">
          <app-results-summary />
          <app-sort-select />
        </div>
        <div class="scroll">
          <ng-container *ngTemplateOutlet="list" />
        </div>
      </aside>
    } @else {
      <div class="top">
        <app-search-bar />
        <app-filter-chips />
      </div>
    }

    <div class="stage">
      <app-masters-map
        [pins]="store.pins()"
        [names]="names()"
        [selectedId]="store.selectedId()"
        [highlightedId]="hovered()"
        [userLocation]="store.location()"
        (pinSelect)="select($event)"
        (backgroundTap)="clearSelection()"
        (locate)="locate()"
      />

      @if (!viewport.isLg()) {
        <app-frame-edge-tab class="edge" />
      }

      @if (viewport.isMd() && !viewport.isLg()) {
        <aside class="panel" aria-label="Мастера">
          <div class="panel-head">
            <app-results-summary />
            <app-sort-select />
          </div>
          <div class="scroll">
            <ng-container *ngTemplateOutlet="list" />
          </div>
        </aside>
      }

      @if (!viewport.isMd()) {
        @if (pinCard(); as card) {
          <app-pin-card class="pin" [master]="card" (dismiss)="clearSelection()" />
        } @else if (guest() && snap() === 'collapsed') {
          <a mat-flat-button class="sign-in app-large" [routerLink]="['/', paths.signIn]">Войти</a>
        }
        <app-results-sheet [(snap)]="snap">
          <app-sort-select class="sort" />
          <app-results-list />
        </app-results-sheet>
      }
    </div>

    <ng-template #list>
      <app-results-list
        [selectedId]="store.selectedId()"
        [pinned]="pinned()"
        [followSelection]="true"
        (hover)="hovered.set($event)"
      />
    </ng-template>
  `
})
export class MapPage {
  readonly service = input<string>();

  protected readonly store = inject(MasterSearchStore);
  protected readonly viewport = inject(Viewport);
  protected readonly paths = appPaths;
  private readonly api = inject(MastersApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);

  protected readonly snap = signal<SheetSnap>('collapsed');
  protected readonly hovered = signal<string | null>(null);
  protected readonly pinned = signal<MasterCard | null>(null);
  protected readonly guest = computed(() => this.session.status() === 'signed-out');
  protected readonly names = computed(() => new Map(this.store.items().map((card) => [card.id, card.name])));
  protected readonly pinCard = computed(() => {
    const id = this.store.selectedId();
    if (!id || this.viewport.isMd()) {
      return null;
    }
    return this.store.items().find((card) => card.id === id) ?? (this.pinned()?.id === id ? this.pinned() : null);
  });

  constructor() {
    effect(() => {
      const service = this.service();
      untracked(() => {
        if (service && service !== this.store.filters().serviceId) {
          this.store.filters.update((filters) => ({ ...filters, serviceId: service }));
        }
      });
    });

    effect(() => {
      const service = this.store.filters().serviceId;
      untracked(() => {
        if ((service ?? undefined) !== this.service()) {
          void this.router.navigate([], { queryParams: { service }, queryParamsHandling: 'merge', replaceUrl: true });
        }
      });
    });
  }

  protected async select(id: string): Promise<void> {
    this.store.selectedId.set(id);
    if (!this.viewport.isMd()) {
      this.snap.set('collapsed');
    }
    if (this.store.items().some((card) => card.id === id)) {
      return;
    }
    try {
      const card = await this.api.card(id, this.store.location());
      if (this.store.selectedId() === id) {
        this.pinned.set(card);
      }
    } catch {
      this.store.selectedId.set(null);
    }
  }

  protected clearSelection(): void {
    this.store.selectedId.set(null);
    this.pinned.set(null);
  }

  protected locate(): void {
    if (!('geolocation' in navigator)) {
      this.toasts.info(locationFailed);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => this.store.location.set({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => {
        this.store.location.set(null);
        this.toasts.info(locationFailed);
      },
      { timeout: locationTimeoutMs }
    );
  }
}
