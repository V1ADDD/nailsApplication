import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { formatDuration, formatPrice } from '@nails/shared/common/util';
import { CatalogStore } from '@nails/shared/core/data-access';
import type { ProfileService } from '@nails/shared/masters/data-access';
import { otherCategory } from '../texts';
import { ProfileSection } from './profile-section';

interface ServiceGroup {
  key: string;
  name: string;
  services: ProfileService[];
}

@Component({
  selector: 'app-services-section',
  imports: [ProfileSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    h3 {
      margin: 0;
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
      letter-spacing: var(--app-letter-spacing-caps);
      text-transform: uppercase;
      color: var(--app-color-text-muted);
    }
    .group + .group {
      margin-top: var(--app-space-4);
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: var(--app-space-3);
      align-items: center;
      padding: var(--app-space-3) 0;
      border-bottom: 1px solid var(--app-color-border);
    }
    li:last-child {
      border-bottom: none;
    }
    .name {
      display: grid;
      gap: var(--app-space-0-5);
      min-width: 0;
      overflow-wrap: anywhere;
      color: var(--app-color-text);
    }
    .duration {
      font-size: var(--app-font-size-xs);
      color: var(--app-color-text-muted);
    }
    .price {
      font-weight: var(--app-font-weight-bold);
      white-space: nowrap;
    }
    .pill {
      min-height: 2.25rem;
      padding: 0 var(--app-space-3);
      border: none;
      border-radius: var(--app-radius-md);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font: inherit;
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      cursor: pointer;
    }
    .empty {
      margin: 0;
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <app-profile-section icon="scissors" heading="Услуги и цены" headingId="services">
      @for (group of groups(); track group.key) {
        <div class="group">
          <h3>{{ group.name }}</h3>
          <ul>
            @for (service of group.services; track service.id) {
              <li>
                <span class="name">
                  <span>{{ service.name }}</span>
                  <span class="duration">{{ duration(service.durationMin) }}</span>
                </span>
                <span class="price">{{ price(service.price) }}</span>
                @if (bookable()) {
                  <button
                    type="button"
                    class="pill"
                    [attr.aria-label]="'Записаться: ' + service.name"
                    (click)="book.emit(service.subcategoryId)"
                  >
                    Записаться
                  </button>
                } @else {
                  <span></span>
                }
              </li>
            }
          </ul>
        </div>
      } @empty {
        <p class="empty">Мастер пока не добавил услуги</p>
      }
    </app-profile-section>
  `
})
export class ServicesSection {
  readonly services = input.required<ProfileService[]>();
  readonly bookable = input(true);
  readonly book = output<string>();

  private readonly catalog = inject(CatalogStore);

  protected readonly price = formatPrice;
  protected readonly duration = formatDuration;
  protected readonly groups = computed<ServiceGroup[]>(() => {
    const groups = new Map<string, ServiceGroup>();
    for (const service of this.services()) {
      const name = this.catalog.nameOf(service.categoryId) ?? otherCategory;
      let group = groups.get(name);
      if (!group) {
        group = { key: name, name, services: [] };
        groups.set(name, group);
      }
      group.services.push(service);
    }
    return [...groups.values()];
  });
}
