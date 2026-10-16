import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { type Schemas, toProblem } from '@nails/shared/core/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import { bookingSummary } from './account-texts';

export interface ReviewSheetData {
  readonly booking: Schemas['BookingResponse'];
  readonly submit: (request: Schemas['WriteReviewRequest']) => Promise<void>;
}

const stars = [1, 2, 3, 4, 5] as const;
const textMaxLength = 1000;

@Component({
  selector: 'app-review-sheet',
  imports: [MatButtonModule, MatDialogClose, SheetLayout, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .fields {
      display: grid;
      gap: var(--app-space-4);
    }
    .summary {
      margin: 0;
      color: var(--app-color-text-secondary);
    }
    .summary strong {
      color: var(--app-color-text);
    }
    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
    }
    .stars {
      display: flex;
      gap: var(--app-space-1);
    }
    .star {
      display: grid;
      place-items: center;
      width: var(--app-tap-target);
      height: var(--app-tap-target);
      border-radius: var(--app-radius-md);
      color: var(--app-color-border-strong);
      cursor: pointer;
    }
    .star.on {
      color: var(--app-color-star);
    }
    .star input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    .star:has(input:focus-visible) {
      outline: 2px solid var(--app-color-primary);
    }
    textarea {
      resize: vertical;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <form (submit)="send($event)">
      <app-sheet-layout heading="Отзыв о мастере">
        <div class="fields">
          <p class="summary">
            <strong>{{ summary.name }}</strong> · {{ summary.details }}
          </p>
          <fieldset>
            <legend class="app-field-label">Оценка</legend>
            <div class="stars">
              @for (star of stars; track star) {
                <label class="star" [class.on]="rating() >= star">
                  <input
                    type="radio"
                    name="review-rating"
                    [value]="star"
                    [checked]="rating() === star"
                    [attr.aria-label]="star + ' из 5'"
                    (change)="pick(star)"
                  />
                  <app-icon name="star" [size]="28" [filled]="rating() >= star" />
                </label>
              }
            </div>
            @if (ratingError()) {
              <span class="app-field-error" role="alert">Поставьте оценку</span>
            }
          </fieldset>
          <label class="app-field">
            <span class="app-field-label">Комментарий</span>
            <textarea
              class="app-input"
              rows="4"
              placeholder="Что понравилось, что можно улучшить"
              [attr.maxlength]="textMaxLength"
              [value]="text()"
              (input)="text.set(value($event))"
            ></textarea>
          </label>
        </div>
        <div class="actions" sheetFooter>
          <button mat-stroked-button type="button" mat-dialog-close>Отмена</button>
          <button mat-flat-button type="submit" [disabled]="busy()">
            {{ busy() ? 'Отправляем…' : 'Отправить отзыв' }}
          </button>
        </div>
      </app-sheet-layout>
    </form>
  `
})
export class ReviewSheet {
  private readonly data = inject<ReviewSheetData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef);
  private readonly toasts = inject(Toasts);
  protected readonly stars = stars;
  protected readonly textMaxLength = textMaxLength;
  protected readonly summary = bookingSummary(this.data.booking, false);
  protected readonly rating = signal(0);
  protected readonly text = signal('');
  protected readonly ratingError = signal(false);
  protected readonly busy = signal(false);

  protected value(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  protected pick(star: number): void {
    this.rating.set(star);
    this.ratingError.set(false);
  }

  protected async send(event: Event): Promise<void> {
    event.preventDefault();
    if (this.rating() === 0) {
      this.ratingError.set(true);
      return;
    }
    this.busy.set(true);
    try {
      await this.data.submit({ rating: this.rating(), text: this.text().trim() });
      this.toasts.success('Спасибо за отзыв!');
      this.ref.close(true);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }
}
