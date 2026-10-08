import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { formatDistance, formatPrice, plural } from '@nails/shared/common/util';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { FavoritesStore, type MasterCard as Card } from '@nails/shared/masters/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { Avatar, Icon, Rating } from '@nails/web/common/ui';
import { appPaths, returnToParameter } from '@nails/web/core/feature';
import { serviceForms, yearForms } from '../texts';

@Component({
  selector: 'app-master-card',
  imports: [MatButtonModule, RouterLink, Avatar, Icon, Rating],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.active]': 'active()' },
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-3);
      padding: var(--app-space-4);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-xl);
      background: var(--app-color-surface);
      transition:
        border-color var(--app-transition-fast),
        box-shadow var(--app-transition-fast);
    }
    :host(.active) {
      border-color: var(--app-color-primary);
      box-shadow: 0 0 0 3px var(--app-color-map-halo);
    }
    .top {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--app-space-3);
      align-items: start;
    }
    .info {
      display: grid;
      gap: var(--app-space-1);
      min-width: 0;
    }
    .name {
      display: block;
      min-width: 0;
      font-size: var(--app-font-size-md);
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
      text-decoration: none;
    }
    .name span {
      overflow-wrap: anywhere;
    }
    .name app-icon {
      margin-left: var(--app-space-1);
      vertical-align: -0.2em;
    }
    .name:hover span {
      text-decoration: underline;
    }
    .verified {
      color: var(--app-color-primary);
    }
    .specialty {
      color: var(--app-color-primary);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-1) var(--app-space-2);
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-xs);
    }
    .meta span + span:not(.online)::before {
      content: '·';
      margin-right: var(--app-space-2);
    }
    .online {
      color: var(--app-color-success-text);
      font-weight: var(--app-font-weight-semibold);
    }
    .heart {
      display: grid;
      place-items: center;
      width: var(--app-tap-target);
      height: var(--app-tap-target);
      margin: calc(var(--app-space-2) * -1) calc(var(--app-space-2) * -1) 0 0;
      border: 0;
      border-radius: var(--app-radius-full);
      background: none;
      color: var(--app-color-text-secondary);
      cursor: pointer;
    }
    .heart:hover {
      background: var(--app-color-surface-muted);
    }
    .heart.on {
      color: var(--app-color-danger);
    }
    .services {
      border-radius: var(--app-radius-lg);
      background: var(--app-color-surface-sunken);
    }
    .summary {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      width: 100%;
      min-height: var(--app-tap-target);
      padding: var(--app-space-2) var(--app-space-3);
      border: 0;
      background: none;
      color: var(--app-color-text-secondary);
      font: inherit;
      font-size: var(--app-font-size-sm);
      text-align: left;
    }
    button.summary {
      cursor: pointer;
    }
    .summary .label {
      flex: 1;
      min-width: 0;
    }
    .price {
      color: var(--app-color-text);
      font-weight: var(--app-font-weight-bold);
      white-space: nowrap;
    }
    .chevron {
      transition: transform var(--app-transition-fast);
    }
    .chevron.open {
      transform: rotate(180deg);
    }
    ul {
      display: grid;
      gap: var(--app-space-2);
      margin: 0;
      padding: 0 var(--app-space-3) var(--app-space-3);
      list-style: none;
      font-size: var(--app-font-size-sm);
    }
    li {
      display: flex;
      justify-content: space-between;
      gap: var(--app-space-3);
      padding-top: var(--app-space-2);
      border-top: 1px solid var(--app-color-border);
      color: var(--app-color-text-secondary);
    }
    .actions {
      display: grid;
    }
    .own {
      margin: 0;
      padding: var(--app-space-2) var(--app-space-3);
      border-radius: var(--app-radius-lg);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      text-align: center;
    }
  `,
  template: `
    @let card = master();
    <div class="top">
      <app-avatar [name]="card.name" [photoUrl]="card.photoUrl" [online]="card.online" [size]="64" shape="rounded" />
      <div class="info">
        <a class="name" [routerLink]="profileLink()" [queryParams]="serviceParams()">
          <span>{{ card.name }}</span>
          @if (card.verified) {
            <app-icon class="verified" name="badge-check" [size]="18" label="Проверенный мастер" />
          }
        </a>
        <span class="specialty">{{ card.specialty }}</span>
        <app-rating [value]="card.rating" [count]="card.reviewsCount" />
        <span class="meta">
          <span>{{ experience() }}</span>
          <span>{{ distance() }}</span>
          @if (card.online) {
            <span class="online">● онлайн</span>
          }
        </span>
      </div>
      @if (!card.isOwn) {
        <button
          type="button"
          class="heart"
          [class.on]="favorite()"
          [attr.aria-pressed]="favorite()"
          [attr.aria-label]="favorite() ? 'Убрать из избранного' : 'Добавить в избранное'"
          (click)="toggleFavorite()"
        >
          <app-icon name="heart" [filled]="favorite()" />
        </button>
      }
    </div>

    <div class="services">
      @if (singleService(); as service) {
        <div class="summary">
          <span class="label">{{ service.name }}</span>
          <span class="price">{{ price(service.price) }}</span>
        </div>
      } @else {
        <button type="button" class="summary" [attr.aria-expanded]="expanded()" (click)="expanded.set(!expanded())">
          <span class="label">{{ servicesLabel() }}</span>
          @if (card.headlinePrice) {
            <span class="price">{{ price(card.headlinePrice) }}</span>
          }
          <app-icon class="chevron" [class.open]="expanded()" name="chevron-down" [size]="18" />
        </button>
        @if (expanded()) {
          <ul>
            @for (service of card.services; track service.subcategoryId) {
              <li>
                <span>{{ service.name }}</span>
                <span class="price">{{ price(service.price) }}</span>
              </li>
            }
          </ul>
        }
      }
    </div>

    @if (card.isOwn) {
      <p class="own">Это ваш профиль</p>
    } @else {
      <div class="actions">
        <button mat-flat-button type="button" (click)="book()">Записаться</button>
      </div>
    }
  `
})
export class MasterCard {
  readonly master = input.required<Card>();
  readonly active = input(false);

  private readonly favorites = inject(FavoritesStore);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);

  protected readonly expanded = signal(false);
  protected readonly price = formatPrice;
  protected readonly favorite = computed(() => this.favorites.has(this.master().id));
  protected readonly profileLink = computed(() => ['/masters', this.master().id]);
  protected readonly serviceParams = computed(() => {
    const service = this.master().preselectSubcategoryId;
    return service ? { service } : {};
  });
  protected readonly singleService = computed(() => {
    const services = this.master().services;
    return services.length === 1 ? services[0] : null;
  });
  protected readonly distance = computed(() => formatDistance(this.master().distanceKm));
  protected readonly experience = computed(() => {
    const years = this.master().experienceYears;
    return years < 1 ? 'Опыт меньше года' : `Опыт ${plural(years, yearForms)}`;
  });
  protected readonly servicesLabel = computed(() => {
    const card = this.master();
    return `${card.narrowed ? 'Подходящие' : 'Все услуги'}: ${plural(card.services.length, serviceForms)}`;
  });

  protected async toggleFavorite(): Promise<void> {
    if (this.session.status() !== 'signed-in') {
      this.signIn(this.router.url);
      return;
    }
    try {
      await this.favorites.toggle(this.master().id);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    }
  }

  protected book(): void {
    const tree = this.router.createUrlTree(this.profileLink(), { queryParams: { book: 1, ...this.serviceParams() } });
    if (this.session.status() !== 'signed-in') {
      this.signIn(this.router.serializeUrl(tree));
      return;
    }
    void this.router.navigateByUrl(tree);
  }

  private signIn(returnTo: string): void {
    void this.router.navigate(['/', appPaths.signIn], { queryParams: { [returnToParameter]: returnTo } });
  }
}
