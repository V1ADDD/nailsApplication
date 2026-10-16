import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { type Schemas, toProblem } from '@nails/shared/core/data-access';
import { SheetLayout } from '@nails/web/common/overlays';

export interface CancelBookingData {
  submit: (request: Schemas['CancelBookingRequest']) => Promise<void>;
}

const otherReason = 'Другое';
const reasons = ['Изменились планы', 'Заболела', 'Не успеваю', otherReason] as const;
const reasonMaxLength = 300;

@Component({
  selector: 'app-cancel-booking-sheet',
  imports: [MatButtonModule, MatDialogClose, MatSlideToggleModule, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
      margin-bottom: var(--app-space-4);
    }
    .chips button {
      padding: var(--app-space-2) var(--app-space-3);
      border: 1px solid var(--app-color-border-strong);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      font: inherit;
      cursor: pointer;
    }
    .chips button[aria-pressed='true'] {
      border-color: var(--app-color-primary);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
    }
    textarea {
      resize: vertical;
    }
    .warning {
      margin: var(--app-space-3) 0 0;
      color: var(--app-color-warning-text);
      font-size: var(--app-font-size-sm);
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <app-sheet-layout heading="Отмена записи">
      <div class="chips" role="group" aria-label="Причина отмены">
        @for (item of reasons; track item) {
          <button type="button" [attr.aria-pressed]="reason() === item" (click)="reason.set(item)">{{ item }}</button>
        }
      </div>
      @if (reason() === otherReason) {
        <label class="app-field">
          <span class="app-field-label">Опишите причину</span>
          <textarea
            class="app-input"
            rows="3"
            [attr.maxlength]="reasonMaxLength"
            [value]="details()"
            (input)="detailsChanged($event)"
          ></textarea>
        </label>
      }
      <mat-slide-toggle [checked]="mutual()" (change)="mutual.set($event.checked)">
        Отмена по договорённости (без последствий)
      </mat-slide-toggle>
      @if (!mutual()) {
        <p class="warning">Отмена без взаимного согласия снижает рейтинг</p>
      }
      @if (error(); as message) {
        <p class="app-field-error" role="alert">{{ message }}</p>
      }
      <div class="actions" sheetFooter>
        <button mat-stroked-button type="button" mat-dialog-close>Назад</button>
        <button mat-flat-button class="app-danger-soft" type="button" [disabled]="!text() || busy()" (click)="submit()">
          Отменить запись
        </button>
      </div>
    </app-sheet-layout>
  `
})
export class CancelBookingSheet {
  private readonly data = inject<CancelBookingData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef);
  protected readonly reasons = reasons;
  protected readonly otherReason = otherReason;
  protected readonly reasonMaxLength = reasonMaxLength;
  protected readonly reason = signal<string | null>(null);
  protected readonly details = signal('');
  protected readonly mutual = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly text = computed(() =>
    this.reason() === otherReason ? this.details().trim() : (this.reason() ?? '')
  );

  protected detailsChanged(event: Event): void {
    this.details.set((event.target as HTMLTextAreaElement).value);
  }

  protected async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.data.submit({ reason: this.text(), mutual: this.mutual() });
      this.ref.close(true);
    } catch (error) {
      this.error.set(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }
}
