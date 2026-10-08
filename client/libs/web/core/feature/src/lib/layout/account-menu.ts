import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '@starter/shared/core/data-access';
import { appPaths } from '../bootstrap/app-paths';

@Component({
  selector: 'app-account-menu',
  imports: [MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
  `,
  template: `
    @if (session.me(); as me) {
      <span>{{ me.displayName }}</span>
      <button mat-button type="button" (click)="signOut()">Sign out</button>
    } @else if (session.status() === 'signed-out') {
      <a mat-stroked-button [routerLink]="['/', paths.signIn]">Sign in</a>
    }
  `
})
export class AccountMenu {
  protected readonly session = inject(SessionStore);
  protected readonly paths = appPaths;
  private readonly router = inject(Router);

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigate(['/', appPaths.signIn]);
  }
}
