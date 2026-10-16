import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { formatShortDate } from '@nails/shared/common/util';
import { MyReviewsStore } from '@nails/shared/masters/data-access';
import { EmptyState, ErrorState, Rating, type SegmentedOption, SegmentedToggle, Skeleton } from '@nails/web/common/ui';
import { ScrollSentinel } from './scroll-sentinel';

const aboutValue = 'about';
const skeletons = [0, 1, 2] as const;

function tabLabel(label: string, count: number): string {
  return count > 0 ? `${label} · ${count}` : label;
}

@Component({
  selector: 'app-reviews-panel',
  imports: [EmptyState, ErrorState, Rating, SegmentedToggle, Skeleton, ScrollSentinel],
  providers: [MyReviewsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
    }
    h1 {
      font-size: var(--app-font-size-xl);
      font-weight: var(--app-font-weight-bold);
    }
    .list {
      display: grid;
      gap: var(--app-space-3);
    }
    article {
      display: grid;
      gap: var(--app-space-2);
      padding: var(--app-space-4);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
    }
    .head {
      display: flex;
      justify-content: space-between;
      gap: var(--app-space-3);
    }
    .name {
      font-weight: var(--app-font-weight-bold);
      overflow-wrap: anywhere;
    }
    .service {
      color: var(--app-color-primary);
      font-size: var(--app-font-size-sm);
    }
    .date {
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-sm);
      white-space: nowrap;
    }
    p {
      margin: 0;
      overflow-wrap: anywhere;
    }
  `,
  template: `
    <h1>Отзывы</h1>
    <app-segmented-toggle
      label="Отзывы"
      [options]="tabs()"
      [value]="about() ? 'about' : 'written'"
      (changed)="switch($event)"
    />
    @switch (list().status()) {
      @case ('error') {
        <app-error-state title="Не удалось загрузить" (retry)="list().reload()" />
      }
      @case ('ready') {
        @if (list().items().length === 0) {
          @if (about()) {
            <app-empty-state title="Отзывов о вас пока нет" message="Мастера смогут оставить отзыв после визита." />
          } @else {
            <app-empty-state title="Вы пока не оставляли отзывов" message="Оценить мастера можно после визита." />
          }
        } @else {
          <div class="list">
            @for (review of list().items(); track review.id) {
              <article>
                <div class="head">
                  <span class="name">{{ review.masterName }}</span>
                  <span class="date">{{ date(review.date) }}</span>
                </div>
                <span class="service">{{ review.serviceName }}</span>
                <app-rating [value]="review.rating" [size]="16" [starsOnly]="true" />
                @if (review.text) {
                  <p>{{ review.text }}</p>
                }
              </article>
            }
          </div>
          @if (list().hasMore()) {
            <div appScrollSentinel (reached)="list().loadMore()"></div>
          }
        }
      }
      @default {
        <div class="list">
          @for (index of skeletons; track index) {
            <app-skeleton height="7rem" />
          }
        </div>
      }
    }
  `
})
export class ReviewsPanel {
  readonly sub = input<string>();
  private readonly store = inject(MyReviewsStore);
  private readonly router = inject(Router);
  protected readonly skeletons = skeletons;
  protected readonly date = formatShortDate;
  protected readonly about = computed(() => this.sub() === aboutValue);
  protected readonly list = computed(() => this.store.list(this.about()));
  protected readonly tabs = computed<readonly SegmentedOption[]>(() => {
    const counts = this.store.counts();
    return [
      { value: 'written', label: tabLabel('Мои отзывы', counts.written) },
      { value: aboutValue, label: tabLabel('Отзывы обо мне', counts.about) }
    ];
  });

  constructor() {
    effect(() => {
      const list = this.list();
      if (list.status() === 'idle') {
        void list.reload();
      }
    });
  }

  protected switch(value: string): void {
    void this.router.navigate([], {
      queryParams: { sub: value === aboutValue ? aboutValue : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
