import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '@nails/web/common/ui';
import { frameSlots } from '../modules/frame';
import { FrameBadgeView } from './frame-badge-view';

@Component({
  selector: 'app-tab-bar',
  imports: [RouterLink, RouterLinkActive, Icon, FrameBadgeView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    nav {
      position: fixed;
      inset: auto 0 0;
      z-index: var(--app-z-nav);
      display: grid;
      grid-auto-columns: minmax(0, 1fr);
      grid-auto-flow: column;
      height: calc(var(--app-tab-bar-height) + env(safe-area-inset-bottom));
      padding-bottom: env(safe-area-inset-bottom);
      background: var(--app-color-surface);
      border-top: 1px solid var(--app-color-border);
    }
    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--app-space-1);
      min-height: var(--app-tap-target);
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-semibold);
      text-decoration: none;
      transition: color var(--app-transition-fast);
    }
    a.active {
      color: var(--app-color-primary);
    }
    .icon {
      position: relative;
      display: inline-flex;
    }
    app-frame-badge-view {
      position: absolute;
      top: calc(-1 * var(--app-space-1-5));
      left: calc(100% - var(--app-space-2));
    }
  `,
  template: `
    <nav aria-label="Разделы">
      @for (item of slots.items; track item.path) {
        <a
          [routerLink]="item.path"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
          [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
        >
          <span class="icon">
            <app-icon [name]="item.icon" [size]="26" />
            @if (item.badge) {
              <app-frame-badge-view [source]="item.badge" />
            }
          </span>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `
})
export class TabBar {
  protected readonly slots = inject(frameSlots);
}
