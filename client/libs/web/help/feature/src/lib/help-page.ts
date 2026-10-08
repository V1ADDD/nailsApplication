import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Schemas } from '@nails/shared/core/data-access';
import { findHelpArticle, HelpContentStore, searchHelp } from '@nails/shared/help/data-access';
import { Sheets } from '@nails/web/common/overlays';
import { EmptyState, ErrorState, Icon, Skeleton, Viewport } from '@nails/web/common/ui';
import { HelpArticleView } from './help-article-view';
import { HelpHome } from './help-home';
import { HelpSearchField } from './help-search-field';
import { HelpSearchResults } from './help-search-results';
import { HelpTopics } from './help-topics';
import { HelpTopicsSheet } from './help-topics-sheet';

const placeholderRows = [1, 2, 3, 4];

@Component({
  selector: 'app-help-page',
  imports: [
    RouterLink,
    EmptyState,
    ErrorState,
    Icon,
    Skeleton,
    HelpArticleView,
    HelpHome,
    HelpSearchField,
    HelpSearchResults,
    HelpTopics
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--app-space-6);
      @include bp.up(lg) {
        grid-template-columns: 18rem minmax(0, 1fr);
      }
    }
    aside {
      position: sticky;
      top: calc(var(--app-top-bar-height) + var(--app-space-6));
      display: grid;
      align-content: start;
      gap: var(--app-space-4);
      max-height: calc(100dvh - var(--app-top-bar-height) - var(--app-space-12));
      overflow-y: auto;
    }
    .content {
      display: grid;
      align-content: start;
      gap: var(--app-space-4);
      max-width: 48rem;
      min-width: 0;
    }
    .tools {
      display: flex;
      gap: var(--app-space-2);
    }
    .tools app-help-search-field {
      flex: 1;
      min-width: 0;
    }
    .topics {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      gap: var(--app-space-1-5);
      height: var(--app-tap-target);
      padding: 0 var(--app-space-3);
      border: 0;
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font: inherit;
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      cursor: pointer;
    }
    .missing {
      display: grid;
      justify-items: center;
      gap: var(--app-space-2);
    }
    .missing a {
      color: var(--app-color-primary);
      font-weight: var(--app-font-weight-semibold);
    }
    .loading {
      display: grid;
      gap: var(--app-space-3);
    }
  `,
  template: `
    @if (help.hasValue()) {
      @if (viewport.isLg()) {
        <aside>
          <app-help-search-field [(query)]="query" />
          <app-help-topics
            [sections]="help.value().sections"
            [activeId]="found()?.article?.id"
            [matchingIds]="matchingIds()"
            (opened)="query.set('')"
          />
        </aside>
      }
      <div class="content">
        @if (!viewport.isLg()) {
          <div class="tools">
            <app-help-search-field [(query)]="query" />
            <button class="topics" type="button" aria-label="Разделы справки" (click)="openTopics()">
              <app-icon name="list" [size]="20" />
              Разделы
            </button>
          </div>
        }
        @if (searching()) {
          <app-help-search-results [query]="query()" [results]="results()" (opened)="query.set('')" />
        } @else if (found(); as match) {
          <app-help-article-view
            [article]="match.article"
            [sectionTitle]="match.section.title"
            [siteTitle]="help.value().site.title"
            [company]="help.value().company"
            [previous]="neighbour(-1)"
            [next]="neighbour(1)"
            [titles]="titles()"
          />
        } @else if (articleId()) {
          <div class="missing">
            <app-empty-state title="Такой статьи нет." />
            <a routerLink="/help">Все статьи справки</a>
          </div>
        } @else {
          <app-help-home [sections]="help.value().sections" [description]="help.value().site.description" />
        }
      </div>
    } @else if (help.error()) {
      <app-error-state title="Не удалось загрузить справку." (retry)="help.reload()" />
    } @else {
      <div class="loading" role="status" aria-label="Загрузка">
        <app-skeleton width="16rem" height="2rem" />
        @for (row of placeholderRows; track row) {
          <app-skeleton height="5rem" />
        }
      </div>
    }
  `
})
export class HelpPage {
  readonly articleId = input<string>();
  protected readonly help = inject(HelpContentStore).content;
  protected readonly viewport = inject(Viewport);
  protected readonly placeholderRows = placeholderRows;
  protected readonly query = signal('');
  private readonly sheets = inject(Sheets);
  private readonly sections = computed(() => (this.help.hasValue() ? this.help.value().sections : []));
  private readonly ordered = computed(() => this.sections().flatMap((section) => section.articles));
  protected readonly titles = computed(
    () => new Map(this.ordered().map((article) => [article.id, article.title] as const))
  );
  protected readonly found = computed(() => findHelpArticle(this.sections(), this.articleId()));
  protected readonly searching = computed(() => this.query().trim().length > 0);
  protected readonly results = computed(() => searchHelp(this.sections(), this.query()));
  protected readonly matchingIds = computed(() =>
    this.searching() ? new Set(this.results().map((result) => result.article.id)) : null
  );

  protected neighbour(offset: number): Schemas['HelpArticleResponse'] | null {
    const position = this.ordered().findIndex((article) => article.id === this.found()?.article.id);
    return position < 0 ? null : (this.ordered()[position + offset] ?? null);
  }

  protected openTopics(): void {
    this.sheets.open(HelpTopicsSheet);
  }
}
