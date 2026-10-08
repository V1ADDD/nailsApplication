import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { toProblem } from '@nails/shared/core/data-access';
import { MasterSearchStore, type MasterCard as Card } from '@nails/shared/masters/data-access';
import { EmptyState, ErrorState, Skeleton } from '@nails/web/common/ui';
import { MasterCard } from './master-card';

const skeletons = [0, 1, 2];
const preloadMargin = '400px';

@Component({
  selector: 'app-results-list',
  imports: [MatButtonModule, EmptyState, ErrorState, Skeleton, MasterCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-3);
      align-content: start;
    }
    .loading,
    ol {
      display: grid;
      gap: var(--app-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .skeleton {
      display: grid;
      gap: var(--app-space-3);
      padding: var(--app-space-4);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-xl);
    }
    .row {
      display: flex;
      gap: var(--app-space-3);
    }
    .lines {
      display: grid;
      flex: 1;
      gap: var(--app-space-2);
    }
    .more {
      padding: var(--app-space-3);
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-sm);
      text-align: center;
    }
    .sentinel {
      height: 1px;
    }
  `,
  template: `
    @if (store.loading()) {
      <div class="loading" role="status" aria-label="Загружаем мастеров">
        @for (item of skeletons; track item) {
          <div class="skeleton" aria-hidden="true">
            <div class="row">
              <app-skeleton width="4rem" height="4rem" />
              <div class="lines">
                <app-skeleton width="70%" />
                <app-skeleton width="45%" />
                <app-skeleton width="55%" />
              </div>
            </div>
            <app-skeleton height="2.75rem" />
          </div>
        }
      </div>
    } @else if (errorTitle(); as title) {
      <app-error-state title="Не удалось загрузить мастеров" [message]="title" (retry)="store.reload()" />
    } @else if (cards().length === 0) {
      @if (store.hasCriteria()) {
        <app-empty-state title="Никого не нашли" message="Попробуйте изменить запрос или ослабить фильтры.">
          <button mat-stroked-button type="button" (click)="store.resetFilters()">Сбросить фильтры</button>
        </app-empty-state>
      } @else {
        <app-empty-state title="Рядом пока нет мастеров." />
      }
    } @else {
      <ol aria-label="Мастера">
        @for (card of cards(); track card.id) {
          <li
            [attr.data-master]="card.id"
            (mouseenter)="hover.emit(card.id)"
            (mouseleave)="hover.emit(null)"
            (focusin)="hover.emit(card.id)"
            (focusout)="hover.emit(null)"
          >
            <app-master-card [master]="card" [active]="card.id === selectedId()" />
          </li>
        }
      </ol>
      @if (store.loadingMore()) {
        <p class="more" role="status">Загружаем ещё…</p>
      }
      <div #sentinel class="sentinel" aria-hidden="true"></div>
    }
  `
})
export class ResultsList {
  readonly selectedId = input<string | null>(null);
  readonly followSelection = input(false);
  readonly pinned = input<Card | null>(null);
  readonly hover = output<string | null>();

  protected readonly store = inject(MasterSearchStore);
  protected readonly skeletons = skeletons;
  protected readonly errorTitle = computed(() => {
    const error = this.store.error();
    return error ? toProblem(error).title : null;
  });
  protected readonly cards = computed(() => {
    const pinned = this.pinned();
    const items = this.store.items();
    return pinned && !items.some((card) => card.id === pinned.id) ? [pinned, ...items] : items;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private readonly observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void this.store.loadMore();
      }
    },
    { rootMargin: preloadMargin }
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer.disconnect());

    effect(() => {
      this.observer.disconnect();
      const sentinel = this.sentinel();
      if (sentinel) {
        this.observer.observe(sentinel.nativeElement);
      }
    });

    afterRenderEffect(() => {
      const id = this.selectedId();
      if (id && this.followSelection()) {
        this.host.nativeElement
          .querySelector(`[data-master="${CSS.escape(id)}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }
}
