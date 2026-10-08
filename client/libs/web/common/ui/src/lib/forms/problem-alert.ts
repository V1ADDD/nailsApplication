import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface ShownProblem {
  title: string;
  errors: readonly string[];
}

@Component({
  selector: 'app-problem-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    div {
      padding: var(--app-space-3) var(--app-space-4);
      border: 1px solid var(--app-color-danger-border);
      border-radius: var(--app-radius-md);
      background: var(--app-color-danger-soft);
      color: var(--app-color-danger);
      font-size: var(--app-font-size-sm);
    }
    ul {
      margin: var(--app-space-1) 0 0;
      padding-left: var(--app-space-5);
    }
  `,
  template: `
    @if (problem(); as shown) {
      <div role="alert">
        <p>{{ shown.title }}</p>
        @if (shown.errors.length > 0) {
          <ul>
            @for (error of shown.errors; track error) {
              <li>{{ error }}</li>
            }
          </ul>
        }
      </div>
    }
  `
})
export class ProblemAlert {
  readonly problem = input<ShownProblem | null>(null);
}
