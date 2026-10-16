import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { type SegmentedOption, SegmentedToggle, Swipe } from '@nails/web/common/ui';
import { filter } from 'rxjs';
import { appPaths } from '../bootstrap/app-paths';
import { profileLink, profilePaths } from './profile-paths';
import { profileSlots } from './profile-slots';

type Side = 'client' | 'master';

const sideOptions: readonly SegmentedOption[] = [
  { value: 'client', label: 'Клиент' },
  { value: 'master', label: 'Мастер' }
];
const masterPrefix = `/${appPaths.profile}/${profilePaths.master}`;

function sideOf(url: string): Side {
  return url === masterPrefix || url.startsWith(`${masterPrefix}/`) || url.startsWith(`${masterPrefix}?`)
    ? 'master'
    : 'client';
}

@Component({
  selector: 'app-profile-shell',
  imports: [RouterOutlet, SegmentedToggle, Swipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: block;
    }
    .bar {
      display: flex;
      justify-content: center;
      margin: calc(var(--app-space-6) * -1) calc(var(--app-space-4) * -1) var(--app-space-4);
      padding: var(--app-space-3) var(--app-space-4);
      background: var(--app-color-surface);
      border-bottom: 1px solid var(--app-color-border);
    }
    app-segmented-toggle {
      width: min(20rem, 100%);
    }
    .content {
      min-height: 60dvh;
      touch-action: pan-y;
    }
    @include bp.up(md) {
      .bar {
        margin: calc(var(--app-space-8) * -1) calc(var(--app-space-6) * -1) var(--app-space-5);
      }
    }
    @include bp.up(lg) {
      .bar {
        justify-content: flex-start;
        margin: 0 0 var(--app-space-5);
        padding: 0;
        background: none;
        border-bottom: 0;
      }
    }
  `,
  template: `
    @if (hasMasterSide()) {
      <div class="bar">
        <app-segmented-toggle label="Режим профиля" [options]="options" [value]="side()" (changed)="open($event)" />
      </div>
    }
    <div class="content" appSwipe (swipeLeft)="swipe('master')" (swipeRight)="swipe('client')">
      <router-outlet />
    </div>
  `
})
export class ProfileShell {
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  private readonly toasts = inject(Toasts);
  private readonly slots = inject(profileSlots);
  protected readonly options = sideOptions;
  protected readonly side = signal<Side>(sideOf(this.router.url));
  protected readonly hasMasterSide = computed(
    () => this.slots.masterRoutes.length > 0 && this.session.me()?.masterId != null
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe((event) => void this.follow(event.urlAfterRedirects));
    void this.follow(this.router.url);
  }

  protected open(value: string): void {
    void this.router.navigateByUrl(profileLink(value === 'master' ? 'master' : 'client'));
  }

  protected swipe(side: Side): void {
    if (this.hasMasterSide() && side !== sideOf(this.router.url)) {
      this.open(side);
    }
  }

  private async follow(url: string): Promise<void> {
    if (!url.startsWith(`/${appPaths.profile}`)) {
      return;
    }
    const side = sideOf(url);
    this.side.set(side);
    if (side === this.session.mode() || (side === 'master' && !this.hasMasterSide())) {
      return;
    }
    try {
      await this.session.setMode(side);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    }
  }
}
