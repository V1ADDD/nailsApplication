import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { formatPhone } from '@nails/shared/common/util';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { SupportApi } from '@nails/shared/support/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { SupportDraft } from './support-draft';

const textMaxLength = 2000;
const contactMaxLength = 200;
const emptyText = 'Напишите, чем мы можем помочь';

@Component({
  selector: 'app-support-form',
  imports: [ReactiveFormsModule, MatButtonModule, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .fields {
      display: grid;
      gap: var(--app-space-4);
    }
    .lead {
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <app-sheet-layout heading="Напишите нам">
        <div class="fields">
          <p class="lead">Вопрос, жалоба или идея — ответим в течение дня.</p>
          <label class="app-field">
            <span class="app-field-label">Сообщение</span>
            <textarea class="app-input" rows="4" formControlName="text" required [maxLength]="textMaxLength"></textarea>
          </label>
          <label class="app-field">
            <span class="app-field-label">Как с вами связаться</span>
            <input
              class="app-input"
              formControlName="contact"
              placeholder="Телефон или почта"
              autocomplete="tel"
              [maxLength]="contactMaxLength"
            />
          </label>
        </div>
        <div sheetFooter>
          <button mat-flat-button class="app-block" type="submit" [disabled]="sending()">
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
  private readonly session = inject(SessionStore);
  protected readonly form = inject(NonNullableFormBuilder).group({
    text: this.draft.value().text,
    contact: this.draft.value().contact || this.signedInPhone()
  });

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

  private signedInPhone(): string {
    const phone = this.session.me()?.phone;
    return phone ? formatPhone(phone) : '';
  }
}
