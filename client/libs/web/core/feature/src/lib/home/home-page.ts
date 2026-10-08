import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { appPaths } from '../bootstrap/app-paths';
import { navigationItems } from '../modules/navigation';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .hero {
      padding: var(--app-space-5) 0;
    }
    .hero p {
      max-width: 60ch;
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface-variant);
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--app-space-4);
    }
    .grid a {
      color: inherit;
      text-decoration: none;
    }
    mat-card {
      height: 100%;
      padding: var(--app-space-4);
      box-sizing: border-box;
    }
    h2 {
      font: var(--mat-sys-title-medium);
      margin: 0 0 var(--app-space-2);
    }
    p {
      margin: 0;
    }
    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 1024px) {
      .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `,
  template: `
    <section class="hero">
      <h1>Мастера красоты рядом с вами</h1>
      <p>
        Маникюр, брови, ресницы, косметология, макияж и депиляция по всей Беларуси. Сравнивайте точные цены и выбирайте
        мастера.
      </p>
      @if (session.status() === 'signed-out') {
        <a mat-flat-button [routerLink]="['/', paths.register]">Создать аккаунт</a>
      }
    </section>

    @if (navigation.length > 0) {
      <div class="grid">
        @for (item of navigation; track item.path) {
          <a [routerLink]="item.path">
            <mat-card appearance="outlined">
              <h2>{{ item.label }}</h2>
              <p>{{ item.description }}</p>
            </mat-card>
          </a>
        }
      </div>
    }
  `
})
export class HomePage {
  protected readonly session = inject(SessionStore);
  protected readonly navigation = inject(navigationItems);
  protected readonly paths = appPaths;
}
