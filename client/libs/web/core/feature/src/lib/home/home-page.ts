import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { appPaths } from '../bootstrap/app-paths';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    section {
      display: grid;
      justify-items: start;
      gap: var(--app-space-4);
      padding: var(--app-space-8) var(--app-space-5);
      border-radius: var(--app-radius-xl);
      background: var(--app-brand-hero-bg);
      @include bp.up(md) {
        padding: var(--app-space-12) var(--app-space-10);
      }
    }
    h1 {
      color: var(--app-color-brand-ink);
    }
    p {
      max-width: 60ch;
      font-size: var(--app-font-size-md);
      color: var(--app-brand-ink-soft);
    }
  `,
  template: `
    <section>
      <h1>Мастера красоты рядом с вами</h1>
      <p>
        Маникюр, брови, ресницы, косметология, макияж и депиляция по всей Беларуси. Сравнивайте точные цены и выбирайте
        мастера.
      </p>
      @if (session.status() === 'signed-out') {
        <a mat-flat-button class="app-gradient" [routerLink]="['/', paths.signIn]">Войти по номеру телефона</a>
      }
    </section>
  `
})
export class HomePage {
  protected readonly session = inject(SessionStore);
  protected readonly paths = appPaths;
}
