import { ChangeDetectionStrategy, Component, inject, Injector } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { Avatar, Icon, Logo } from '@nails/web/common/ui';
import { appPaths } from '../bootstrap/app-paths';
import { frameSlots } from '../modules/frame';
import type { FrameAction } from '../modules/module-manifest';
import { FrameBadgeView } from './frame-badge-view';

@Component({
  selector: 'app-top-bar',
  imports: [MatButtonModule, RouterLink, RouterLinkActive, Avatar, Icon, Logo, FrameBadgeView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    header {
      position: sticky;
      top: 0;
      z-index: var(--app-z-nav);
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: center;
      gap: var(--app-space-4);
      height: var(--app-top-bar-height);
      padding: 0 var(--app-space-6);
      background: var(--app-color-surface);
      border-bottom: 1px solid var(--app-color-border);
    }
    .brand {
      justify-self: start;
      display: inline-flex;
      color: inherit;
      text-decoration: none;
    }
    nav {
      display: flex;
      gap: var(--app-space-2);
    }
    nav a {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-2);
      min-height: var(--app-tap-target);
      padding: 0 var(--app-space-4);
      border-radius: var(--app-radius-full);
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      text-decoration: none;
      transition:
        background var(--app-transition-fast),
        color var(--app-transition-fast);
    }
    nav a:hover {
      background: var(--app-color-surface-muted);
    }
    nav a.active {
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
    }
    .end {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: var(--app-space-1);
    }
    .account {
      display: inline-flex;
      margin-left: var(--app-space-2);
      border-radius: var(--app-radius-full);
    }
  `,
  template: `
    <header>
      <a class="brand" routerLink="/" aria-label="Мастера рядом — на главную"><app-logo /></a>
      <nav aria-label="Разделы">
        @for (item of slots.items; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
          >
            <app-icon [name]="item.icon" [size]="20" />
            {{ item.label }}
            @if (item.badge) {
              <app-frame-badge-view [source]="item.badge" />
            }
          </a>
        }
      </nav>
      <div class="end">
        @for (action of slots.actions; track action.label) {
          <button mat-button class="app-small" type="button" (click)="run(action)">
            <app-icon [name]="action.icon" [size]="20" />
            {{ action.label }}
          </button>
        }
        @for (link of slots.accountLinks; track link.path) {
          <a mat-button class="app-small" [routerLink]="link.path">
            <app-icon [name]="link.icon" [size]="20" />
            {{ link.label }}
          </a>
        }
        @if (session.me(); as me) {
          <a class="account" [routerLink]="['/', paths.profile]" aria-label="Профиль">
            <app-avatar [name]="me.name" [size]="36" />
          </a>
        } @else if (session.status() === 'signed-out') {
          <a mat-flat-button class="app-pill app-small" [routerLink]="['/', paths.signIn]">Войти</a>
        }
      </div>
    </header>
  `
})
export class TopBar {
  protected readonly slots = inject(frameSlots);
  protected readonly session = inject(SessionStore);
  protected readonly paths = appPaths;
  private readonly injector = inject(Injector);

  protected run(action: FrameAction): void {
    void action.open(this.injector);
  }
}
