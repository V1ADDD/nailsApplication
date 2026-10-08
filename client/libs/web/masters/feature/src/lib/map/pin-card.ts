import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDistance, formatPrice } from '@nails/shared/common/util';
import type { MasterCard } from '@nails/shared/masters/data-access';
import { Avatar, Icon } from '@nails/web/common/ui';

@Component({
  selector: 'app-pin-card',
  imports: [RouterLink, Avatar, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: block;
    }
    a {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--app-space-3);
      align-items: center;
      padding: var(--app-space-3) var(--app-space-10) var(--app-space-3) var(--app-space-3);
      border: 1px solid var(--app-color-primary);
      border-radius: var(--app-radius-xl);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-lg);
      color: inherit;
      text-decoration: none;
    }
    .info {
      display: grid;
      gap: var(--app-space-1);
      min-width: 0;
    }
    .name {
      display: flex;
      align-items: center;
      gap: var(--app-space-1);
      font-weight: var(--app-font-weight-bold);
    }
    .name span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .verified,
    .specialty {
      color: var(--app-color-primary);
    }
    .specialty {
      font-size: var(--app-font-size-sm);
    }
    .meta {
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-sm);
    }
    .meta strong {
      color: var(--app-color-text);
    }
    .close {
      position: absolute;
      top: calc(var(--app-space-2) * -1);
      right: calc(var(--app-space-2) * -1);
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-md);
      color: var(--app-color-text-secondary);
      cursor: pointer;
    }
  `,
  template: `
    @let card = master();
    <a
      [routerLink]="['/masters', card.id]"
      [queryParams]="card.preselectSubcategoryId ? { service: card.preselectSubcategoryId } : {}"
    >
      <app-avatar [name]="card.name" [photoUrl]="card.photoUrl" [online]="card.online" [size]="56" shape="rounded" />
      <span class="info">
        <span class="name">
          <span>{{ card.name }}</span>
          @if (card.verified) {
            <app-icon class="verified" name="badge-check" [size]="16" label="Проверенный мастер" />
          }
        </span>
        <span class="specialty">{{ card.specialty }}</span>
        <span class="meta">
          @if (price(); as price) {
            <strong>{{ price }}</strong> ·
          }
          {{ distance() }}
        </span>
      </span>
    </a>
    <button type="button" class="close" aria-label="Закрыть карточку мастера" (click)="dismiss.emit()">
      <app-icon name="x" [size]="16" />
    </button>
  `
})
export class PinCard {
  readonly master = input.required<MasterCard>();
  readonly dismiss = output();
  protected readonly price = computed(() => {
    const price = this.master().headlinePrice;
    return price ? formatPrice(price) : null;
  });
  protected readonly distance = computed(() => formatDistance(this.master().distanceKm));
}
