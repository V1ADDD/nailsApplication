import { ChangeDetectionStrategy, Component, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { Avatar, Icon } from '@nails/web/common/ui';
import { frameSlots } from '../modules/frame';
import type { FrameAction } from '../modules/module-manifest';

@Component({
  selector: 'app-account-page',
  imports: [MatButtonModule, RouterLink, Avatar, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
      max-width: 40rem;
    }
    .card,
    ul {
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
    }
    .card {
      display: flex;
      align-items: center;
      gap: var(--app-space-4);
      padding: var(--app-space-5);
    }
    h1 {
      font-size: var(--app-font-size-xl);
    }
    .email {
      color: var(--app-color-text-secondary);
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      overflow: hidden;
    }
    li + li {
      border-top: 1px solid var(--app-color-border);
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
      width: 100%;
      min-height: 3.5rem;
      padding: 0 var(--app-space-4);
      border: 0;
      background: none;
      color: var(--app-color-text);
      font: inherit;
      font-weight: var(--app-font-weight-semibold);
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    .row:hover {
      background: var(--app-color-surface-muted);
    }
    .row span {
      flex: 1;
    }
    .row app-icon:first-child {
      color: var(--app-color-primary);
    }
    .row app-icon:last-child {
      color: var(--app-color-text-muted);
    }
    .sign-out {
      justify-self: start;
      gap: var(--app-space-2);
    }
  `,
  template: `
    @if (session.me(); as me) {
      <section class="card">
        <app-avatar [name]="me.displayName" [size]="64" shape="rounded" />
        <div>
          <h1>{{ me.displayName }}</h1>
          <p class="email">{{ me.email }}</p>
        </div>
      </section>
    }
    @if (slots.accountLinks.length > 0 || slots.actions.length > 0) {
      <ul>
        @for (link of slots.accountLinks; track link.path) {
          <li>
            <a class="row" [routerLink]="link.path">
              <app-icon [name]="link.icon" />
              <span>{{ link.label }}</span>
              <app-icon name="chevron-right" [size]="20" />
            </a>
          </li>
        }
        @for (action of slots.actions; track action.label) {
          <li>
            <button class="row" type="button" (click)="run(action)">
              <app-icon [name]="action.icon" />
              <span>{{ action.label }}</span>
              <app-icon name="chevron-right" [size]="20" />
            </button>
          </li>
        }
      </ul>
    }
    <button mat-stroked-button class="sign-out" type="button" [disabled]="signingOut()" (click)="signOut()">
      <app-icon name="log-out" [size]="20" />
      Выйти
    </button>
  `
})
export class AccountPage {
  protected readonly session = inject(SessionStore);
  protected readonly slots = inject(frameSlots);
  protected readonly signingOut = signal(false);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  protected run(action: FrameAction): void {
    void action.open(this.injector);
  }

  protected async signOut(): Promise<void> {
    this.signingOut.set(true);
    try {
      await this.session.signOut();
      await this.router.navigate(['/']);
    } finally {
      this.signingOut.set(false);
    }
  }
}
