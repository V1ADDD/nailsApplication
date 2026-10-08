import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: var(--app-space-4);
      padding: var(--app-space-12) var(--app-space-6);
      text-align: center;
      color: var(--app-color-text-secondary);
    }
    p {
      margin: 0;
    }
    .title {
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
  `,
  template: `
    <div role="alert">
      <p class="title">{{ title() }}</p>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
    <button mat-stroked-button type="button" (click)="retry.emit()">Повторить</button>
  `
})
export class ErrorState {
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
  readonly retry = output();
}
