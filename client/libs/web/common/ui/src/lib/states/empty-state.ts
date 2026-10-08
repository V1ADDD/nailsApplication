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
      color: var(--app-color-text);
    }
    p {
      margin: 0;
    }
    .title {
      font-weight: var(--app-font-weight-bold);
    }
    .message {
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <p class="title">{{ title() }}</p>
    @if (message()) {
      <p class="message">{{ message() }}</p>
    }
    <ng-content />
  `
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
}
