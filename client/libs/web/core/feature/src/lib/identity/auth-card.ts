import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-card',
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      place-items: center;
      min-height: 100dvh;
      padding: 16px;
      box-sizing: border-box;
    }
    mat-card {
      width: 100%;
      max-width: 420px;
      padding: 16px;
    }
  `,
  template: `
    <mat-card appearance="outlined">
      <h1>{{ heading() }}</h1>
      <ng-content />
    </mat-card>
  `
})
export class AuthCard {
  readonly heading = input.required<string>();
}
