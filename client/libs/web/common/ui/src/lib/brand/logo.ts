import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type LogoVariant = 'full' | 'mark';

let nextLogoId = 0;

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    'aria-label': 'Мастера рядом',
    '[style.--app-logo-size.px]': 'size()'
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: calc(var(--app-logo-size) * 0.3);
    }
    svg {
      flex-shrink: 0;
    }
    .from {
      stop-color: var(--app-logo-from);
    }
    .to {
      stop-color: var(--app-logo-to);
    }
    .nail {
      fill: var(--app-color-surface);
    }
    .highlight {
      fill: none;
      stroke: var(--app-logo-highlight);
    }
    .word {
      font-size: calc(var(--app-logo-size) * 0.56);
      font-weight: var(--app-font-weight-extrabold);
      line-height: 1;
      letter-spacing: var(--app-letter-spacing-display);
      color: var(--app-color-brand-ink);
      white-space: nowrap;
    }
  `,
  template: `
    <svg viewBox="0 0 32 32" [attr.width]="size()" [attr.height]="size()" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient [attr.id]="gradientId" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop class="from" offset="0" />
          <stop class="to" offset="1" />
        </linearGradient>
      </defs>
      <path
        [attr.fill]="'url(#' + gradientId + ')'"
        d="M16 30.5C16 30.5 4.5 20 4.5 12.5a11.5 11.5 0 0 1 23 0C27.5 20 16 30.5 16 30.5Z"
      />
      <path
        class="nail"
        d="M11.8 18.2v-6.7a4.2 4.2 0 0 1 8.4 0v6.7a1.3 1.3 0 0 1-1.3 1.3h-5.8a1.3 1.3 0 0 1-1.3-1.3Z"
      />
      <path class="highlight" stroke-width="1.4" stroke-linecap="round" d="M14.3 16.6v-4.4" />
    </svg>
    @if (variant() === 'full') {
      <span class="word" aria-hidden="true">Мастера рядом</span>
    }
  `
})
export class Logo {
  readonly variant = input<LogoVariant>('full');
  readonly size = input(32);
  protected readonly gradientId = `app-logo-gradient-${nextLogoId++}`;
}
