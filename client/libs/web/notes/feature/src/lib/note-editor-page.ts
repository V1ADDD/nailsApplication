import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { toProblem, type Problem } from '@starter/shared/core/data-access';
import { ErrorState, LoadingState, ProblemAlert } from '@starter/web/common/ui';
import { noteResource, NotesApi } from '@starter/shared/notes/data-access';

const titleMaxLength = 200;
const contentMaxLength = 20000;

@Component({
  selector: 'app-note-editor-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ErrorState,
    LoadingState,
    ProblemAlert
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 720px;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `,
  template: `
    <a mat-button routerLink="/notes">All notes</a>
    @if (id() && note.error()) {
      <app-error-state title="This note cannot be loaded." (retry)="note.reload()" />
    } @else if (id() && !note.hasValue()) {
      <app-loading-state />
    } @else {
      <h1>{{ id() ? 'Note' : 'New note' }}</h1>
      <form [formGroup]="form" (ngSubmit)="save()">
        <app-problem-alert [problem]="problem()" />
        <mat-form-field>
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" [maxlength]="titleMaxLength" required />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Text</mat-label>
          <textarea matInput formControlName="content" rows="10" [maxlength]="contentMaxLength"></textarea>
        </mat-form-field>
        <div class="actions">
          <button mat-flat-button type="submit" [disabled]="busy() || form.invalid">Save</button>
          @if (id()) {
            @if (confirmingDelete()) {
              <button mat-flat-button type="button" class="danger" (click)="delete()" [disabled]="busy()">
                Delete for good
              </button>
              <button mat-button type="button" (click)="confirmingDelete.set(false)">Keep</button>
            } @else {
              <button mat-stroked-button type="button" (click)="confirmingDelete.set(true)">Delete</button>
            }
          }
        </div>
      </form>
    }
  `
})
export class NoteEditorPage {
  readonly id = input<string>();
  protected readonly titleMaxLength = titleMaxLength;
  protected readonly contentMaxLength = contentMaxLength;
  protected readonly note = noteResource(this.id);
  private readonly api = inject(NotesApi);
  private readonly router = inject(Router);
  protected readonly busy = signal(false);
  protected readonly confirmingDelete = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.maxLength(titleMaxLength)]],
    content: ['', Validators.maxLength(contentMaxLength)]
  });

  constructor() {
    effect(() => {
      if (this.note.hasValue()) {
        const { title, content } = this.note.value();
        this.form.setValue({ title, content });
      }
    });
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    await this.run(async () => {
      const id = this.id();
      const request = this.form.getRawValue();
      if (id && this.note.hasValue()) {
        await this.api.update(id, { ...request, version: this.note.value().version });
      } else {
        await this.api.create(request);
      }
      await this.router.navigate(['/notes']);
    });
  }

  protected async delete(): Promise<void> {
    const id = this.id();
    if (!id) {
      return;
    }
    await this.run(async () => {
      await this.api.delete(id);
      await this.router.navigate(['/notes']);
    });
  }

  private async run(work: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.problem.set(null);
    try {
      await work();
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.busy.set(false);
    }
  }
}
