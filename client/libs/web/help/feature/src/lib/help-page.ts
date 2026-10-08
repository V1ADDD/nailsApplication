import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { EmptyState, ErrorState, LoadingState } from '@starter/web/common/ui';
import { HelpContentStore } from '@starter/shared/help/data-access';

@Component({
  selector: 'app-help-page',
  imports: [MatCardModule, RouterLink, EmptyState, ErrorState, LoadingState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .articles {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
  `,
  template: `
    @if (help.hasValue()) {
      <h1>{{ help.value().site.title }}</h1>
      <p>{{ help.value().site.description }}</p>
      @if (help.value().articles.length === 0) {
        <app-empty-state title="There are no help articles yet." />
      } @else {
        <div class="articles">
          @for (article of help.value().articles; track article.id) {
            <a [routerLink]="['/help', article.id]">
              <mat-card appearance="outlined">
                <mat-card-header>
                  <mat-card-title>{{ article.title }}</mat-card-title>
                  <mat-card-subtitle>{{ article.summary }}</mat-card-subtitle>
                </mat-card-header>
              </mat-card>
            </a>
          }
        </div>
      }
      <p>{{ help.value().company.name }} · {{ help.value().company.email }}</p>
    } @else if (help.error()) {
      <app-error-state title="Help cannot be loaded." (retry)="help.reload()" />
    } @else {
      <app-loading-state />
    }
  `
})
export class HelpPage {
  protected readonly help = inject(HelpContentStore).content;
}
