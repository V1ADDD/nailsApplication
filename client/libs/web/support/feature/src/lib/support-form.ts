import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { toProblem } from '@nails/shared/core/data-access';
import { SupportApi } from '@nails/shared/support/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { SupportDraft } from './support-draft';

const textMaxLength = 2000;
const contactMaxLength = 200;
const emptyText = 'Напишите, чем мы можем помочь';

@Component({
  selector: 'app-support-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .lead {
      margin-bottom: var(--app-space-4);
      color: var(--app-color-text-secondary);
    }
    mat-form-field {
      width: 100%;
    }
    button {
      width: 100%;
    }
  `,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <app-sheet-layout heading="Напишите нам">
        <p class="lead">Вопрос, жалоба или идея — ответим в течение дня.</p>
        <mat-form-field>
          <mat-label>Сообщение</mat-label>
          <textarea matInput rows="4" formControlName="text" required [maxlength]="textMaxLength"></textarea>
        </mat-form-field>
        <mat-form-field floatLabel="always">
          <mat-label>Как с вами связаться</mat-label>
          <input
            matInput
            formControlName="contact"
            placeholder="Телефон или почта"
            autocomplete="email"
            [maxlength]="contactMaxLength"
          />
        </mat-form-field>
        <div sheetFooter>
          <button mat-flat-button type="submit" [disabled]="sending()">
            {{ sending() ? 'Отправляем…' : 'Отправить' }}
          </button>
        </div>
      </app-sheet-layout>
    </form>
  `
})
export class SupportForm {
  protected readonly textMaxLength = textMaxLength;
  protected readonly contactMaxLength = contactMaxLength;
  protected readonly sending = signal(false);
  private readonly support = inject(SupportApi);
  private readonly draft = inject(SupportDraft);
  private readonly toasts = inject(Toasts);
  private readonly ref = inject(MatDialogRef);
  protected readonly form = inject(NonNullableFormBuilder).group(this.draft.value());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.draft.value.set(this.form.getRawValue()));
  }

  protected async submit(): Promise<void> {
    const text = this.form.controls.text.value.trim();
    if (text === '') {
      this.toasts.error(emptyText);
      return;
    }
    this.sending.set(true);
    try {
      const contact = this.form.controls.contact.value.trim();
      await this.support.createTicket({ text, contact: contact === '' ? null : contact });
      this.form.reset({ text: '', contact: '' });
      this.ref.close();
      this.toasts.success('Сообщение отправлено, скоро ответим');
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.sending.set(false);
    }
  }
}
