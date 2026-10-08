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
      color: var(--mat-sys-error);
    }
    ul {
      margin: 4px 0 0;
      padding-left: 20px;
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
