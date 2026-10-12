import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { formatDecimal, formatLongDate, plural } from '@nails/shared/common/util';
import { MastersApi, type MasterProfile, type Review } from '@nails/shared/masters/data-access';
import { Avatar, ErrorState, Rating, Skeleton } from '@nails/web/common/ui';
import { reviewForms } from '../texts';
import { ProfileSection } from './profile-section';

const collapsedCount = 3;
const skeletonCount = 2;

@Component({
  selector: 'app-reviews-section',
  imports: [MatButtonModule, Avatar, ErrorState, Rating, Skeleton, ProfileSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    .summary {
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
    }
    .average {
      font-size: var(--app-font-size-2xl);
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
    .total {
      display: grid;
      gap: var(--app-space-1);
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
    }
    ul {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      gap: var(--app-space-2);
      padding: var(--app-space-4) 0;
      border-top: 1px solid var(--app-color-border);
    }
    .head {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--app-space-3);
      align-items: center;
    }
    .who {
      display: grid;
      min-width: 0;
    }
    .author {
      font-weight: var(--app-font-weight-bold);
    }
    .service {
      font-size: var(--app-font-size-sm);
      color: var(--app-color-primary);
    }
    .date {
      font-size: var(--app-font-size-xs);
      color: var(--app-color-text-muted);
      white-space: nowrap;
    }
    .text {
      margin: 0;
      white-space: pre-line;
      overflow-wrap: anywhere;
      color: var(--app-color-text-secondary);
    }
    .empty {
      margin: 0;
      display: grid;
      gap: var(--app-space-1);
      color: var(--app-color-text-secondary);
    }
    .empty strong {
      color: var(--app-color-text);
    }
    .skeleton {
      display: grid;
      gap: var(--app-space-2);
      padding: var(--app-space-4) 0;
    }
    .more {
      width: 100%;
    }
  `,
  template: `
    <app-profile-section icon="star" heading="Отзывы" headingId="reviews">
      @let master = profile();
      @if (master.reviewsCount === 0) {
        <p class="empty">
          <strong>Пока нет отзывов</strong>
          <span>Отзыв можно оставить после визита к мастеру</span>
        </p>
      } @else {
        <div class="summary">
          <span class="average">{{ average() }}</span>
          <span class="total">
            <app-rating [value]="master.rating" [count]="master.reviewsCount" [starsOnly]="true" [size]="16" />
            <span>{{ totalLabel() }}</span>
          </span>
        </div>
        @if (failed()) {
          <app-error-state title="Не удалось загрузить отзывы" (retry)="loadNext()" />
        } @else {
          <ul>
            @for (review of shown(); track review.id) {
              <li>
                <div class="head">
                  <app-avatar [name]="review.authorName" [size]="40" />
                  <span class="who">
                    <span class="author">{{ review.authorName }}</span>
                    <span class="service">{{ review.serviceName }}</span>
                  </span>
                  <span class="date">{{ date(review.date) }}</span>
                </div>
                <app-rating [value]="review.rating" [starsOnly]="true" />
                @if (review.text) {
                  <p class="text">{{ review.text }}</p>
                }
              </li>
            }
          </ul>
          @if (loading()) {
            @for (item of skeletons; track item) {
              <div class="skeleton" aria-hidden="true">
                <app-skeleton width="40%" />
                <app-skeleton height="3rem" />
              </div>
            }
          }
          @if (moreLabel(); as label) {
            <button mat-stroked-button type="button" class="more" [disabled]="loading()" (click)="showMore()">
              {{ label }}
            </button>
          }
        }
      }
    </app-profile-section>
  `
})
export class ReviewsSection {
  readonly profile = input.required<MasterProfile>();

  private readonly api = inject(MastersApi);

  protected readonly skeletons = Array.from({ length: skeletonCount }, (_, index) => index);
  protected readonly date = formatLongDate;
  protected readonly items = signal<Review[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly expanded = signal(false);
  private readonly total = signal(0);
  private readonly page = signal(0);

  protected readonly average = computed(() => formatDecimal(this.profile().rating ?? 0, 1));
  protected readonly totalLabel = computed(() => plural(this.profile().reviewsCount, reviewForms));
  protected readonly shown = computed(() => (this.expanded() ? this.items() : this.items().slice(0, collapsedCount)));
  protected readonly moreLabel = computed(() => {
    if (!this.expanded()) {
      return this.total() > collapsedCount ? `Показать все ${this.total()}` : null;
    }
    return this.items().length < this.total() ? 'Показать ещё' : null;
  });

  constructor() {
    effect(() => {
      if (this.profile().reviewsCount > 0) {
        untracked(() => this.reset());
      }
    });
  }

  protected showMore(): void {
    if (!this.expanded()) {
      this.expanded.set(true);
      if (this.items().length > collapsedCount || this.items().length >= this.total()) {
        return;
      }
    }
    void this.loadNext();
  }

  protected async loadNext(): Promise<void> {
    this.loading.set(true);
    this.failed.set(false);
    try {
      const next = this.page() + 1;
      const response = await this.api.reviews(this.profile().id, next);
      this.items.update((items) => [...items, ...response.items]);
      this.total.set(response.totalCount);
      this.page.set(next);
    } catch {
      this.failed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private reset(): void {
    this.items.set([]);
    this.page.set(0);
    this.expanded.set(false);
    void this.loadNext();
  }
}
