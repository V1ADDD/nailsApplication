import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()'
  },
  styles: `
    :host {
      display: block;
      border-radius: var(--app-radius-sm);
      background: linear-gradient(
        90deg,
        var(--app-color-surface-muted) 25%,
        var(--app-color-surface-sunken) 50%,
        var(--app-color-surface-muted) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.2s linear infinite;
    }
    @keyframes shimmer {
      to {
        background-position: -200% 0;
      }
    }
  `,
  template: ''
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
}
