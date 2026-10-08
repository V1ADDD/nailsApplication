import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: var(--app-space-2);
      padding: var(--app-space-12) var(--app-space-6);
      text-align: center;
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
  `,
  template: '<p>{{ title() }}</p>'
})
export class EmptyState {
  readonly title = input.required<string>();
}
