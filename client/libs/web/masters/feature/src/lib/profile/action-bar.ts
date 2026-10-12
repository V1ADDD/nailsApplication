import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { formatPrice } from '@nails/shared/common/util';
import type { Schemas } from '@nails/shared/core/data-access';

@Component({
  selector: 'app-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: fixed;
      inset: auto 0 calc(var(--app-tab-bar-height) + env(safe-area-inset-bottom)) 0;
      z-index: var(--app-z-nav);
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
      padding: var(--app-space-3) var(--app-space-4);
      border-top: 1px solid var(--app-color-border);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-md);
    }
    .price {
      font-weight: var(--app-font-weight-bold);
      white-space: nowrap;
      color: var(--app-color-text);
    }
    button {
      flex: 1;
      min-height: 3rem;
      border: none;
      border-radius: var(--app-radius-lg);
      background: var(--app-gradient-primary);
      color: var(--app-color-primary-contrast);
      font: inherit;
      font-weight: var(--app-font-weight-bold);
      box-shadow: var(--app-shadow-primary);
      cursor: pointer;
    }
  `,
  template: `
    @if (priceText(); as text) {
      <span class="price">{{ text }}</span>
    }
    <button type="button" (click)="book.emit()">Записаться</button>
  `
})
export class ActionBar {
  readonly price = input<Schemas['PriceResponse'] | null>(null);
  readonly book = output();

  protected readonly priceText = computed(() => {
    const price = this.price();
    return price ? formatPrice(price) : null;
  });
}
