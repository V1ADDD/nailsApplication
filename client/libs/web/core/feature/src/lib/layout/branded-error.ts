import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ErrorState, Logo } from '@nails/web/common/ui';

@Component({
  selector: 'app-branded-error',
  imports: [ErrorState, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      align-content: center;
      min-height: 100dvh;
      padding: var(--app-space-6) var(--app-space-4);
    }
  `,
  template: `
    <app-logo variant="mark" [size]="56" />
    <app-error-state [title]="title()" (retry)="retry.emit()" />
  `
})
export class BrandedError {
  readonly title = input.required<string>();
  readonly retry = output();
}
