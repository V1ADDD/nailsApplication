import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '@nails/web/common/ui';

@Component({
  selector: 'app-auth-card',
  imports: [RouterLink, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--app-space-6);
      min-height: 100dvh;
      padding: var(--app-space-6) var(--app-space-4);
    }
    .brand {
      display: inline-flex;
      color: inherit;
      text-decoration: none;
    }
    section {
      display: grid;
      gap: var(--app-space-4);
      width: 100%;
      max-width: 28rem;
      padding: var(--app-space-6) var(--app-space-5);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      box-shadow: var(--app-shadow-md);
    }
    h1 {
      font-size: var(--app-font-size-xl);
    }
  `,
  template: `
    <a class="brand" routerLink="/" aria-label="Мастера рядом — на главную"><app-logo [size]="40" /></a>
    <section>
      <h1>{{ heading() }}</h1>
      <ng-content />
    </section>
  `
})
export class AuthCard {
  readonly heading = input.required<string>();
}
