import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { appPaths } from '../bootstrap/app-paths';

@Component({
  selector: 'app-account-menu',
  imports: [MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      font: var(--mat-sys-body-medium);
    }
    .name {
      display: none;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @media (min-width: 768px) {
      .name {
        display: inline;
      }
    }
  `,
  template: `
    @if (session.me(); as me) {
      <span class="name">{{ me.displayName }}</span>
      <button mat-button type="button" (click)="signOut()">Выйти</button>
    } @else if (session.status() === 'signed-out') {
      <a mat-stroked-button [routerLink]="['/', paths.signIn]">Войти</a>
    }
  `
})
export class AccountMenu {
  protected readonly session = inject(SessionStore);
  protected readonly paths = appPaths;
  private readonly router = inject(Router);

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigate(['/']);
  }
}
