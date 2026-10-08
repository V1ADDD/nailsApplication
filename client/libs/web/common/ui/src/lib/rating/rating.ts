import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDecimal } from '@nails/shared/common/util';
import { Icon } from '../icons/icon';

const stars = [0, 1, 2, 3, 4];
const percent = 100;

@Component({
  selector: 'app-rating',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-1-5);
      font-size: var(--app-font-size-sm);
      line-height: 1;
    }
    .stars {
      display: inline-flex;
      gap: 1px;
    }
    .star {
      position: relative;
      display: inline-flex;
      color: var(--app-color-border-strong);
    }
    .fill {
      position: absolute;
      inset: 0 auto 0 0;
      overflow: hidden;
      color: var(--app-color-star);
    }
    .value {
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
    .count {
      color: var(--app-color-text-muted);
    }
  `,
  template: `
    <span class="stars" aria-hidden="true">
      @for (star of stars; track star) {
        <span class="star">
          <app-icon name="star" [size]="size()" [filled]="true" />
          <span class="fill" [style.width.%]="fillOf(star)">
            <app-icon name="star" [size]="size()" [filled]="true" />
          </span>
        </span>
      }
    </span>
    @if (value() !== null) {
      <span class="value" aria-hidden="true">{{ valueText() }}</span>
      <span class="count" aria-hidden="true">({{ count() }})</span>
    }
  `
})
export class Rating {
  readonly value = input<number | null>(null);
  readonly count = input(0);
  readonly size = input(14);
  protected readonly stars = stars;
  protected readonly valueText = computed(() => formatDecimal(this.value() ?? 0, 1));
  protected readonly label = computed(() =>
    this.value() === null ? 'Пока нет отзывов' : `Рейтинг ${this.valueText()} из 5, отзывов: ${this.count()}`
  );

  protected fillOf(star: number): number {
    return Math.min(1, Math.max(0, (this.value() ?? 0) - star)) * percent;
  }
}
