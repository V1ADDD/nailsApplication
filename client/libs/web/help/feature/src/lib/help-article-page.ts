import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState, ErrorState, LoadingState } from '@starter/web/common/ui';
import { HelpContentStore } from '@starter/shared/help/data-access';

@Component({
  selector: 'app-help-article-page',
  imports: [MatButtonModule, RouterLink, EmptyState, ErrorState, LoadingState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a mat-button routerLink="/help">All help articles</a>
    @if (help.hasValue()) {
      @if (article(); as current) {
        <h1>{{ current.title }}</h1>
        @for (paragraph of current.body; track paragraph) {
          <p>{{ paragraph }}</p>
        }
      } @else {
        <app-empty-state title="This help article does not exist." />
      }
    } @else if (help.error()) {
      <app-error-state title="Help cannot be loaded." (retry)="help.reload()" />
    } @else {
      <app-loading-state />
    }
  `
})
export class HelpArticlePage {
  readonly articleId = input<string>();
  protected readonly help = inject(HelpContentStore).content;
  protected readonly article = computed(() =>
    this.help.hasValue() ? this.help.value().articles.find((candidate) => candidate.id === this.articleId()) : undefined
  );
}
