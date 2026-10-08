import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Schemas } from '@nails/shared/core/data-access';
import { Icon } from '@nails/web/common/ui';
import { HelpBlocks } from './help-blocks';

type HelpArticle = Schemas['HelpArticleResponse'];

@Component({
  selector: 'app-help-article-view',
  imports: [RouterLink, Icon, HelpBlocks],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      gap: var(--app-space-6);
    }
    .path {
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
    }
    .path a {
      color: var(--app-color-primary);
      font-weight: var(--app-font-weight-semibold);
      text-decoration: none;
    }
    .path span {
      margin: 0 var(--app-space-2);
    }
    header {
      display: grid;
      gap: var(--app-space-2);
    }
    .lead {
      font-size: var(--app-font-size-lg);
      color: var(--app-color-text-secondary);
    }
    .contact {
      display: flex;
      align-items: flex-start;
      gap: var(--app-space-3);
      padding: var(--app-space-4);
      border-radius: var(--app-radius-lg);
      background: var(--app-color-surface-muted);
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-secondary);
    }
    .contact app-icon {
      color: var(--app-color-primary);
    }
    .contact a {
      color: var(--app-color-primary);
      font-weight: var(--app-font-weight-semibold);
    }
    .neighbours {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--app-space-3);
      @include bp.up(sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .neighbour {
      display: grid;
      gap: var(--app-space-1);
      padding: var(--app-space-4);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      text-decoration: none;
    }
    .neighbour:hover {
      border-color: var(--app-color-border-strong);
    }
    .neighbour.next {
      justify-items: end;
      text-align: right;
      grid-column: -2;
    }
    .direction {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-1);
      font-size: var(--app-font-size-xs);
      color: var(--app-color-text-muted);
    }
    .title {
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      color: var(--app-color-primary);
    }
  `,
  template: `
    <nav class="path" aria-label="Путь">
      <a routerLink="/help">{{ siteTitle() }}</a
      ><span aria-hidden="true">/</span>{{ sectionTitle() }}
    </nav>
    <header>
      <h1>{{ article().title }}</h1>
      @if (article().summary) {
        <p class="lead">{{ article().summary }}</p>
      }
    </header>
    <app-help-blocks [blocks]="article().blocks" [titles]="titles()" />
    @if (company().email) {
      <p class="contact">
        <app-icon name="mail" [size]="18" />
        <span
          >Не нашли ответ? Напишите в поддержку «{{ company().name }}»:
          <a [href]="'mailto:' + company().email">{{ company().email }}</a></span
        >
      </p>
    }
    @if (previous() || next()) {
      <nav class="neighbours" aria-label="Соседние статьи">
        @if (previous(); as article) {
          <a class="neighbour" [routerLink]="['/help', article.id]">
            <span class="direction"><app-icon name="chevron-left" [size]="14" />Предыдущая</span>
            <span class="title">{{ article.title }}</span>
          </a>
        }
        @if (next(); as article) {
          <a class="neighbour next" [routerLink]="['/help', article.id]">
            <span class="direction">Следующая<app-icon name="chevron-right" [size]="14" /></span>
            <span class="title">{{ article.title }}</span>
          </a>
        }
      </nav>
    }
  `
})
export class HelpArticleView {
  readonly article = input.required<HelpArticle>();
  readonly sectionTitle = input.required<string>();
  readonly siteTitle = input.required<string>();
  readonly company = input.required<Schemas['HelpCompanyResponse']>();
  readonly previous = input<HelpArticle | null>(null);
  readonly next = input<HelpArticle | null>(null);
  readonly titles = input.required<ReadonlyMap<string, string>>();
}
