import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState, ErrorState, Icon, Skeleton } from '@nails/web/common/ui';
import { HelpContentStore } from '@nails/shared/help/data-access';

const placeholderRows = [1, 2, 3, 4];

@Component({
  selector: 'app-help-page',
  imports: [RouterLink, EmptyState, ErrorState, Icon, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
      max-width: 48rem;
    }
    .lead,
    .company {
      color: var(--app-color-text-secondary);
    }
    .articles {
      display: grid;
      gap: var(--app-space-3);
    }
    a {
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
      padding: var(--app-space-4) var(--app-space-5);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      color: inherit;
      text-decoration: none;
      transition: border-color var(--app-transition-fast);
    }
    a:hover {
      border-color: var(--app-color-border-strong);
    }
    a div {
      flex: 1;
      display: grid;
      gap: var(--app-space-1);
    }
    h2 {
      font-size: var(--app-font-size-md);
    }
    a p {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
    a app-icon {
      color: var(--app-color-text-muted);
    }
  `,
  template: `
    @if (help.hasValue()) {
      <h1>{{ help.value().site.title }}</h1>
      <p class="lead">{{ help.value().site.description }}</p>
      @if (help.value().articles.length === 0) {
        <app-empty-state title="Статей пока нет." />
      } @else {
        <div class="articles">
          @for (article of help.value().articles; track article.id) {
            <a [routerLink]="['/help', article.id]">
              <div>
                <h2>{{ article.title }}</h2>
                <p>{{ article.summary }}</p>
              </div>
              <app-icon name="chevron-right" [size]="20" />
            </a>
          }
        </div>
      }
      <p class="company">{{ help.value().company.name }} · {{ help.value().company.email }}</p>
    } @else if (help.error()) {
      <app-error-state title="Не удалось загрузить справку." (retry)="help.reload()" />
    } @else {
      <div class="articles" role="status" aria-label="Загрузка">
        <app-skeleton width="12rem" height="2rem" />
        @for (row of placeholderRows; track row) {
          <app-skeleton height="4.5rem" />
        }
      </div>
    }
  `
})
export class HelpPage {
  protected readonly help = inject(HelpContentStore).content;
  protected readonly placeholderRows = placeholderRows;
}
