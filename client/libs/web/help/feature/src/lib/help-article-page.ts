import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState, ErrorState, Skeleton } from '@nails/web/common/ui';
import { HelpContentStore } from '@nails/shared/help/data-access';

const placeholderLines = [1, 2, 3];

@Component({
  selector: 'app-help-article-page',
  imports: [MatButtonModule, RouterLink, EmptyState, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      justify-items: start;
      gap: var(--app-space-4);
      max-width: 48rem;
    }
    article,
    .placeholder {
      display: grid;
      gap: var(--app-space-3);
      width: 100%;
    }
  `,
  template: `
    <a mat-button routerLink="/help">Все статьи справки</a>
    @if (help.hasValue()) {
      @if (article(); as current) {
        <article>
          <h1>{{ current.title }}</h1>
          @for (paragraph of current.body; track paragraph) {
            <p>{{ paragraph }}</p>
          }
        </article>
      } @else {
        <app-empty-state title="Такой статьи нет." />
      }
    } @else if (help.error()) {
      <app-error-state title="Не удалось загрузить справку." (retry)="help.reload()" />
    } @else {
      <div class="placeholder" role="status" aria-label="Загрузка">
        <app-skeleton width="16rem" height="2rem" />
        @for (line of placeholderLines; track line) {
          <app-skeleton height="3rem" />
        }
      </div>
    }
  `
})
export class HelpArticlePage {
  readonly articleId = input<string>();
  protected readonly help = inject(HelpContentStore).content;
  protected readonly placeholderLines = placeholderLines;
  protected readonly article = computed(() =>
    this.help.hasValue() ? this.help.value().articles.find((candidate) => candidate.id === this.articleId()) : undefined
  );
}
