import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Schemas } from '@nails/shared/core/data-access';
import { EmptyState, Icon } from '@nails/web/common/ui';

@Component({
  selector: 'app-help-home',
  imports: [RouterLink, EmptyState, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      gap: var(--app-space-8);
    }
    header {
      display: grid;
      gap: var(--app-space-2);
    }
    .lead {
      color: var(--app-color-text-secondary);
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--app-space-4);
      @include bp.up(md) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    section {
      display: grid;
      align-content: start;
      gap: var(--app-space-3);
      padding: var(--app-space-5);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
    }
    h2 {
      font-size: var(--app-font-size-md);
    }
    ul {
      display: grid;
      gap: var(--app-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--app-space-2);
      min-height: var(--app-tap-target);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      text-decoration: none;
    }
    a:hover span {
      text-decoration: underline;
    }
    a app-icon {
      color: var(--app-color-text-muted);
    }
  `,
  template: `
    <header>
      <h1>Чем мы можем помочь?</h1>
      <p class="lead">{{ description() }}</p>
    </header>
    @if (sections().length === 0) {
      <app-empty-state title="Статей пока нет." />
    } @else {
      <div class="grid">
        @for (section of sections(); track section.id) {
          <section [attr.aria-labelledby]="'help-home-' + section.id">
            <h2 [id]="'help-home-' + section.id">{{ section.title }}</h2>
            <ul>
              @for (article of section.articles; track article.id) {
                <li>
                  <a [routerLink]="['/help', article.id]">
                    <span>{{ article.title }}</span>
                    <app-icon name="chevron-right" [size]="16" />
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    }
  `
})
export class HelpHome {
  readonly sections = input.required<readonly Schemas['HelpSectionResponse'][]>();
  readonly description = input.required<string>();
}
