import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, input, TemplateRef } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { DurationPipe } from '../format/duration-pipe';
import { PricePipe } from '../format/price-pipe';
import type { OfferGroup } from './group-by-category';

@Component({
  selector: 'app-price-list',
  imports: [NgTemplateOutlet, DurationPipe, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    h3 {
      font: var(--mat-sys-title-medium);
      margin: var(--app-space-4) 0 var(--app-space-2);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--app-space-1) var(--app-space-4);
      padding: var(--app-space-3) 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .duration {
      color: var(--mat-sys-on-surface-variant);
    }
    .price {
      grid-row: 1;
      grid-column: 2;
      font-weight: 600;
      white-space: nowrap;
    }
    .actions {
      grid-column: 1 / -1;
    }
  `,
  template: `
    @for (group of groups(); track group.categoryId) {
      <section>
        <h3>{{ group.categoryName }}</h3>
        <ul>
          @for (offer of group.offers; track offer.id) {
            <li>
              <span>{{ offer.serviceName }}</span>
              <span class="price">{{ offer.price | price }}</span>
              <span class="duration">{{ offer.durationMinutes | duration }}</span>
              @if (actions(); as template) {
                <div class="actions">
                  <ng-container *ngTemplateOutlet="template; context: { $implicit: offer }" />
                </div>
              }
            </li>
          }
        </ul>
      </section>
    }
  `
})
export class PriceList {
  readonly groups = input.required<readonly OfferGroup[]>();
  protected readonly actions = contentChild<TemplateRef<{ $implicit: Schemas['OfferResponse'] }>>(TemplateRef);
}
