import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      padding: 64px 0;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
  template: '<p>{{ title() }}</p>'
})
export class EmptyState {
  readonly title = input.required<string>();
}
