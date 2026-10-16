import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  untracked
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { FavoritesStore, MasterSearchStore, MastersApi } from '@nails/shared/masters/data-access';
import { Sheets } from '@nails/web/common/overlays';
import { EmptyState, ErrorState, Icon, Skeleton, Viewport } from '@nails/web/common/ui';
import { BookingSheet, type BookingSheetData } from '../booking/booking-sheet';
import { FavoriteToggle } from '../favorite-toggle';
import { goToSignIn } from '../sign-in';
import { AboutSection } from './about-section';
import { ActionBar } from './action-bar';
import { ContactsSection } from './contacts-section';
import { FreeWindows } from './free-windows';
import { PortfolioSection } from './portfolio-section';
import { ProfileHero } from './profile-hero';
import { ReviewsSection } from './reviews-section';
import { ServicesSection } from './services-section';
import { chatQuery, injectChatsEnabled, startChatPath } from '../write-to-master';

const notFound = 404;
const firstNavigation = 1;

@Component({
  selector: 'app-profile-page',
  imports: [
    MatButtonModule,
    RouterLink,
    EmptyState,
    ErrorState,
    Icon,
    Skeleton,
    AboutSection,
    ActionBar,
    ContactsSection,
    FreeWindows,
    PortfolioSection,
    ProfileHero,
    ReviewsSection,
    ServicesSection
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      gap: var(--app-space-4);
    }
    :host(.with-bar) {
      padding-bottom: calc(var(--app-tap-target) + var(--app-space-8));
    }
    .back {
      justify-self: start;
      background: var(--app-color-surface);
    }
    .layout {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-4);
      @include bp.up(lg) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 22.5rem;
        align-items: start;
        gap: var(--app-space-5);
      }
      @include bp.up(xl) {
        grid-template-columns: minmax(0, 1fr) 24rem;
      }
    }
    .side,
    .main {
      display: contents;
      @include bp.up(lg) {
        display: grid;
        gap: var(--app-space-4);
      }
    }
    .side {
      @include bp.up(lg) {
        position: sticky;
        top: calc(var(--app-top-bar-height) + var(--app-space-4));
        grid-column: 2;
        grid-row: 1;
      }
    }
    .main {
      @include bp.up(lg) {
        grid-column: 1;
        grid-row: 1;
      }
    }
    app-profile-hero {
      order: 1;
    }
    app-free-windows {
      order: 2;
    }
    app-contacts-section {
      order: 3;
    }
    app-services-section {
      order: 4;
    }
    app-portfolio-section {
      order: 5;
    }
    app-about-section {
      order: 6;
    }
    app-reviews-section {
      order: 7;
    }
    .missing {
      display: grid;
      justify-items: center;
      padding-top: var(--app-space-8);
      color: var(--app-color-text-muted);
    }
    .missing app-empty-state {
      padding-top: var(--app-space-4);
    }
    .loading {
      display: grid;
      gap: var(--app-space-4);
    }
  `,
  host: { '[class.with-bar]': 'showActionBar()' },
  template: `
    <button mat-stroked-button type="button" class="back" (click)="back()">
      <app-icon name="arrow-left" [size]="18" />
      Назад
    </button>

    @if (profile.isLoading() && !profile.hasValue()) {
      <div class="loading" role="status" aria-label="Загрузка профиля мастера">
        <app-skeleton height="14rem" />
        <app-skeleton height="10rem" />
        <app-skeleton height="18rem" />
      </div>
    } @else if (missing()) {
      <div class="missing">
        <app-icon name="search" [size]="40" />
        <app-empty-state title="Мастер не найден" message="Возможно, ссылка устарела или мастер удалил профиль.">
          <a mat-flat-button routerLink="/">Найти мастера на карте</a>
        </app-empty-state>
      </div>
    } @else if (profile.error()) {
      <app-error-state title="Не удалось загрузить профиль" [message]="errorMessage()" (retry)="profile.reload()" />
    } @else if (profile.hasValue()) {
      @let master = profile.value();
      <div class="layout">
        <div class="side">
          <app-profile-hero
            [profile]="master"
            [favorite]="favorites.has(master.id)"
            (book)="openBooking()"
            (toggleFavorite)="toggleFavorite()"
          />
          <app-free-windows
            [slots]="slots.value()?.items ?? []"
            [disabled]="master.isOwn"
            (book)="openBooking($event)"
          />
          <app-contacts-section [profile]="master" />
        </div>
        <div class="main">
          <app-services-section
            [services]="master.services"
            [bookable]="!master.isOwn"
            (book)="openBooking(undefined, $event)"
          />
          @if (master.portfolio.length > 0) {
            <app-portfolio-section [profile]="master" />
          }
          <app-about-section [profile]="master" />
          <app-reviews-section [profile]="master" />
        </div>
      </div>
      @if (showActionBar()) {
        <app-action-bar [price]="master.headlinePrice" (book)="openBooking()" />
      }
    }
  `
})
export class ProfilePage {
  readonly id = input.required<string>();
  readonly book = input<string>();
  readonly service = input<string | undefined>();

  private readonly api = inject(MastersApi);
  private readonly search = inject(MasterSearchStore);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly chatsEnabled = injectChatsEnabled();
  private readonly location = inject(Location);
  private readonly title = inject(Title);
  private readonly sheets = inject(Sheets);
  private readonly favoriteToggle = inject(FavoriteToggle);
  private readonly viewport = inject(Viewport);
  protected readonly favorites = inject(FavoritesStore);
  private linkHandled = false;

  protected readonly profile = resource({
    params: () => ({ id: this.id(), location: untracked(() => this.search.location()) }),
    loader: ({ params }) => this.api.profile(params.id, params.location)
  });
  protected readonly slots = resource({
    params: () => this.id(),
    loader: ({ params }) => this.api.slots(params)
  });
  protected readonly missing = computed(() => {
    const error = this.profile.error();
    return error instanceof HttpErrorResponse && error.status === notFound;
  });
  protected readonly errorMessage = computed(() => toProblem(this.profile.error()).title);
  protected readonly showActionBar = computed(
    () => !this.viewport.isLg() && this.profile.hasValue() && !this.profile.value().isOwn
  );

  constructor() {
    effect(() => {
      if (this.profile.hasValue()) {
        this.title.setTitle(`${this.profile.value().name} — запись онлайн`);
      }
    });
    effect(() => {
      if (this.book() && !this.linkHandled && this.profile.hasValue() && this.slots.hasValue()) {
        this.linkHandled = true;
        const subcategoryId = this.service();
        untracked(() => void this.openFromLink(subcategoryId));
      }
    });
  }

  protected back(): void {
    const state = this.location.getState();
    const navigationId =
      typeof state === 'object' && state !== null && 'navigationId' in state
        ? Number(state.navigationId)
        : firstNavigation;
    if (navigationId > firstNavigation) {
      this.location.back();
      return;
    }
    void this.router.navigateByUrl('/');
  }

  protected openBooking(slotId?: string, subcategoryId?: string): void {
    if (!this.profile.hasValue() || this.profile.value().isOwn) {
      return;
    }
    if (this.session.status() !== 'signed-in') {
      const tree = this.router.createUrlTree(['/masters', this.id()], {
        queryParams: { book: 1, ...(subcategoryId ? { service: subcategoryId } : {}) }
      });
      goToSignIn(this.router, this.router.serializeUrl(tree));
      return;
    }
    const slots = this.slots.value();
    if (!slots) {
      return;
    }
    const data: BookingSheetData = { profile: this.profile.value(), slots, slotId, subcategoryId };
    this.sheets
      .open(BookingSheet, data)
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        if (this.chatsEnabled()) {
          void this.router.navigate([startChatPath], { queryParams: chatQuery(this.id()) });
          return;
        }
        this.slots.reload();
      });
  }

  protected toggleFavorite(): void {
    void this.favoriteToggle.toggle(this.id());
  }

  private async openFromLink(subcategoryId: string | undefined): Promise<void> {
    await this.session.whenSettled();
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { book: null, service: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.openBooking(undefined, subcategoryId);
  }
}
