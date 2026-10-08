import { ChangeDetectionStrategy, Component, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { formatPhone } from '@nails/shared/common/util';
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
      margin: 0 auto;
    }
    .card,
    .rows {
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
    .who {
      display: grid;
      gap: var(--app-space-1);
      min-width: 0;
    }
    h1 {
      font-size: var(--app-font-size-xl);
      font-weight: var(--app-font-weight-bold);
      letter-spacing: normal;
    }
    .phone {
      color: var(--app-color-text-secondary);
    }
    .rows {
      overflow: hidden;
    }
    .caption {
      padding: var(--app-space-4) var(--app-space-5) var(--app-space-1);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
      letter-spacing: var(--app-letter-spacing-caps);
      text-transform: uppercase;
      color: var(--app-color-text-muted);
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
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
      padding: 0 var(--app-space-5);
      border: 0;
      background: none;
      color: var(--app-color-text);
      font: inherit;
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
    .row app-icon {
      color: var(--app-color-text-muted);
    }
  `,
  template: `
    @if (session.me(); as me) {
      <section class="card">
        <app-avatar [name]="me.name" [size]="64" shape="rounded" />
        <div class="who">
          <h1>{{ me.name }}</h1>
          @if (me.phone) {
            <p class="phone">{{ phone(me.phone) }}</p>
          }
        </div>
      </section>
    }
    @if (slots.accountLinks.length > 0 || slots.actions.length > 0) {
      <section class="rows" aria-labelledby="account-other">
        <h2 class="caption" id="account-other">Прочее</h2>
        <ul>
          @for (link of slots.accountLinks; track link.path) {
            <li>
              <a class="row" [routerLink]="link.path">
                <span>{{ link.label }}</span>
                <app-icon name="chevron-right" [size]="20" />
              </a>
            </li>
          }
          @for (action of slots.actions; track action.label) {
            <li>
              <button class="row" type="button" (click)="run(action)">
                <span>{{ action.label }}</span>
                <app-icon name="chevron-right" [size]="20" />
              </button>
            </li>
          }
        </ul>
      </section>
    }
    <button
      mat-flat-button
      class="app-large app-block app-danger-soft"
      type="button"
      [disabled]="signingOut()"
      (click)="signOut()"
    >
      Выйти из аккаунта
    </button>
  `
})
export class AccountPage {
  protected readonly session = inject(SessionStore);
  protected readonly slots = inject(frameSlots);
  protected readonly signingOut = signal(false);
  protected readonly phone = formatPhone;
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
