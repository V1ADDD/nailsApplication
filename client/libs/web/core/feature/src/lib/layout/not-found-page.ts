import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Logo } from '@nails/web/common/ui';

@Component({
  selector: 'app-not-found-page',
  imports: [MatButtonModule, RouterLink, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: var(--app-space-3);
      padding: var(--app-space-8) var(--app-space-4);
      text-align: center;
    }
    h1 {
      color: var(--app-color-text-secondary);
    }
    p {
      max-width: 28rem;
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <app-logo variant="mark" [size]="56" />
    <h1>Страница не найдена</h1>
    <p>Возможно, ссылка устарела или мастер удалил профиль.</p>
    <a mat-flat-button routerLink="/">На карту</a>
  `
})
export class NotFoundPage {}
