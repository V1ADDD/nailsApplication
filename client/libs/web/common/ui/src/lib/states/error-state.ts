import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px 0;
    }
  `,
  template: `
    <p role="alert">{{ title() }}</p>
    <button mat-stroked-button type="button" (click)="retry.emit()">Try again</button>
  `
})
export class ErrorState {
  readonly title = input.required<string>();
  readonly retry = output();
}
