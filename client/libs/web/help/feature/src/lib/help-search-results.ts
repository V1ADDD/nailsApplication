import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { helpSearchTerms, type HelpSearchResult } from '@nails/shared/help/data-access';
import { EmptyState } from '@nails/web/common/ui';
import { HelpHighlight } from './help-highlight';

@Component({
  selector: 'app-help-search-results',
  imports: [RouterLink, EmptyState, HelpHighlight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
    }
    h1 {
      font-size: var(--app-font-size-xl);
    }
    ul {
      display: grid;
      gap: var(--app-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a {
      display: grid;
      gap: var(--app-space-1);
      padding: var(--app-space-3) var(--app-space-4);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      text-decoration: none;
    }
    a:hover {
      border-color: var(--app-color-border-strong);
    }
    .section {
      font-size: var(--app-font-size-xs);
      color: var(--app-color-text-muted);
    }
    .title {
      font-weight: var(--app-font-weight-semibold);
      color: var(--app-color-primary);
    }
    .snippet {
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <h1 aria-live="polite">
      @if (results().length === 0) {
        Ничего не нашлось по запросу «{{ query().trim() }}»
      } @else {
        Найдено статей: {{ results().length }}
      }
    </h1>
    @if (results().length === 0) {
      <app-empty-state title="Попробуйте другие слова, например текст, который вы видите на экране." />
    } @else {
      <ul>
        @for (result of results(); track result.article.id) {
          <li>
            <a [routerLink]="['/help', result.article.id]" (click)="opened.emit()">
              <span class="section">{{ result.section.title }}</span>
              <span class="title"><app-help-highlight [text]="result.article.title" [terms]="terms()" /></span>
              @if (result.snippet) {
                <span class="snippet"><app-help-highlight [text]="result.snippet" [terms]="terms()" /></span>
              }
            </a>
          </li>
        }
      </ul>
    }
  `
})
export class HelpSearchResults {
  readonly query = input.required<string>();
  readonly results = input.required<readonly HelpSearchResult[]>();
  readonly opened = output();
  protected readonly terms = computed(() => helpSearchTerms(this.query()));
}
