import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { EmptyState, ErrorState, LoadingState } from '@starter/web/common/ui';
import { notesResource } from '@starter/shared/notes/data-access';

const pageSize = 20;

@Component({
  selector: 'app-notes-page',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    EmptyState,
    ErrorState,
    LoadingState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    form {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    mat-form-field {
      flex: 1;
    }
  `,
  template: `
    <header>
      <h1>Notes</h1>
      <a mat-flat-button routerLink="/notes/new">New note</a>
    </header>
    <form (ngSubmit)="applySearch()">
      <mat-form-field>
        <mat-label>Search</mat-label>
        <input matInput name="search" [(ngModel)]="searchText" />
      </mat-form-field>
      <button mat-stroked-button type="submit">Search</button>
    </form>
    @if (notes.hasValue()) {
      @if (notes.value().totalCount === 0) {
        <app-empty-state [title]="query().search ? 'No notes match your search.' : 'There are no notes yet.'" />
      } @else {
        <mat-nav-list>
          @for (note of notes.value().items; track note.id) {
            <a mat-list-item [routerLink]="['/notes', note.id]">
              <span matListItemTitle>{{ note.title }}</span>
              <span matListItemLine>{{ note.updatedAt | date: 'medium' }}</span>
            </a>
          }
        </mat-nav-list>
        <mat-paginator
          [length]="notes.value().totalCount"
          [pageIndex]="query().page - 1"
          [pageSize]="query().pageSize"
          [hidePageSize]="true"
          (page)="changePage($event)"
        />
      }
    } @else if (notes.error()) {
      <app-error-state title="Notes cannot be loaded." (retry)="notes.reload()" />
    } @else {
      <app-loading-state />
    }
  `
})
export class NotesPage {
  protected searchText = '';
  protected readonly query = signal({ search: '', page: 1, pageSize });
  protected readonly notes = notesResource(computed(() => this.query()));

  protected applySearch(): void {
    this.query.set({ search: this.searchText.trim(), page: 1, pageSize });
  }

  protected changePage(event: PageEvent): void {
    this.query.update((current) => ({ ...current, page: event.pageIndex + 1 }));
  }
}
