import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
    .brand {
      color: inherit;
      text-decoration: none;
      margin-right: 16px;
    }
    nav {
      display: flex;
      gap: 8px;
      flex: 1;
    }
    main {
      box-sizing: border-box;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
    }
  `,
  template: `
    <mat-toolbar>
      <a class="brand" routerLink="/">Starter</a>
      <nav aria-label="Main">
        @for (item of navigation; track item.path) {
          <a mat-button [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
        }
      </nav>
      <app-account-menu />
    </mat-toolbar>
    <main>
      <router-outlet />
    </main>
  `
})
export class AppLayout {
  protected readonly navigation = inject(navigationItems);
}
