import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '@nails/web/common/ui';

@Component({
  selector: 'app-sign-in-card',
  imports: [RouterLink, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 26rem;
      margin: 0 auto;
      overflow: hidden;
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
    }
    header {
      display: grid;
      justify-items: center;
      gap: var(--app-space-2);
      padding: var(--app-space-8) var(--app-space-6) var(--app-space-6);
      text-align: center;
      background:
        radial-gradient(var(--app-brand-pattern-dot) 1px, transparent 1px) 0 0 / 1rem 1rem,
        var(--app-brand-hero-bg);
    }
    header a {
      display: inline-flex;
      color: inherit;
      text-decoration: none;
      border-radius: var(--app-radius-sm);
    }
    .tagline {
      font-weight: var(--app-font-weight-semibold);
      color: var(--app-brand-ink-soft);
    }
    .body {
      display: grid;
      gap: var(--app-space-4);
      padding: var(--app-space-6);
    }
  `,
  template: `
    <header>
      <a routerLink="/" aria-label="Мастера рядом — на главную"><app-logo [size]="44" /></a>
      <p class="tagline">Маникюр и не только — рядом с вами</p>
    </header>
    <div class="body">
      <ng-content />
    </div>
  `
})
export class SignInCard {}
