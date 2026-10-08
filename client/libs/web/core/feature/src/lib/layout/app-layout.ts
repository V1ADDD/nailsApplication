import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { navigationItems } from '../modules/navigation';
import { AccountMenu } from './account-menu';

@Component({
  selector: 'app-layout',
  imports: [MatToolbarModule, MatButtonModule, RouterLink, RouterLinkActive, RouterOutlet, AccountMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    mat-toolbar {
      gap: var(--app-space-2);
      padding: 0 var(--app-space-3);
    }
    .brand {
      color: inherit;
      text-decoration: none;
      font-weight: 700;
      white-space: nowrap;
      margin-right: auto;
    }
    nav {
      display: none;
      flex-direction: column;
      padding: var(--app-space-2) var(--app-space-3);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    nav.open {
      display: flex;
    }
    nav a {
      justify-content: flex-start;
    }
    .active {
      background: var(--mat-sys-secondary-container);
    }
    main {
      box-sizing: border-box;
      width: 100%;
      max-width: var(--app-content-width);
      margin: 0 auto;
      padding: var(--app-space-5) var(--app-space-4);
    }
    @media (min-width: 768px) {
      nav {
        display: flex;
        flex-direction: row;
        gap: var(--app-space-1);
      }
      .menu-button {
        display: none;
      }
      main {
        padding: var(--app-space-6) var(--app-space-5);
      }
    }
  `,
  template: `
    <mat-toolbar>
      <a class="brand" routerLink="/">Мастера рядом</a>
      @if (navigation.length > 0) {
        <button
          mat-button
          class="menu-button"
          type="button"
          aria-controls="sections"
          [attr.aria-expanded]="open()"
          (click)="open.set(!open())"
        >
          Меню
        </button>
      }
      <app-account-menu />
    </mat-toolbar>
    @if (navigation.length > 0) {
      <nav id="sections" aria-label="Разделы" [class.open]="open()">
        @for (item of navigation; track item.path) {
          <a mat-button [routerLink]="item.path" routerLinkActive="active" (click)="open.set(false)">{{
            item.label
          }}</a>
        }
      </nav>
    }
    <main>
      <router-outlet />
    </main>
  `
})
export class AppLayout {
  protected readonly navigation = inject(navigationItems);
  protected readonly open = signal(false);
}
