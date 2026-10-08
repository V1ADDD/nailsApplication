import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-card',
  imports: [MatCardModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--app-space-4);
      min-height: 100dvh;
      padding: var(--app-space-4);
      box-sizing: border-box;
    }
    .brand {
      color: inherit;
      font-weight: 700;
      text-decoration: none;
    }
    mat-card {
      width: 100%;
      max-width: 420px;
      padding: var(--app-space-4);
      box-sizing: border-box;
    }
  `,
  template: `
    <a class="brand" routerLink="/">Мастера рядом</a>
    <mat-card appearance="outlined">
      <h1>{{ heading() }}</h1>
      <ng-content />
    </mat-card>
  `
})
export class AuthCard {
  readonly heading = input.required<string>();
}
