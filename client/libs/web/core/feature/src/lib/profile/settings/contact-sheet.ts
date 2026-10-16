import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { IdentityApi, type Schemas, SessionStore, toProblem } from '@nails/shared/core/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { contactOptions } from './contact-options';

@Component({
  selector: 'app-contact-sheet',
  imports: [MatButtonModule, MatDialogClose, MatRadioModule, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    mat-radio-group {
      display: grid;
      gap: var(--app-space-3);
    }
    .option {
      display: grid;
    }
    .hint {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <app-sheet-layout heading="Способ связи">
      <mat-radio-group
        aria-label="Как мастерам лучше связываться с вами"
        [value]="choice()"
        (change)="choice.set($event.value)"
      >
        <p class="hint">Как мастерам лучше связываться с вами</p>
        @for (option of options; track option.value) {
          <mat-radio-button [value]="option.value">
            <span class="option">
              <span>{{ option.label }}</span>
              <span class="hint">{{ option.hint }}</span>
            </span>
          </mat-radio-button>
        }
      </mat-radio-group>
      <div class="actions" sheetFooter>
        <button mat-stroked-button type="button" mat-dialog-close>Отмена</button>
        <button mat-flat-button type="button" [disabled]="busy()" (click)="save()">Сохранить</button>
      </div>
    </app-sheet-layout>
  `
})
export class ContactSheet {
  private readonly session = inject(SessionStore);
  private readonly identity = inject(IdentityApi);
  private readonly toasts = inject(Toasts);
  private readonly ref = inject(MatDialogRef);
  protected readonly options = contactOptions;
  protected readonly choice = signal<Schemas['PreferredContact']>(this.session.me()?.preferredContact ?? 'messages');
  protected readonly busy = signal(false);

  protected async save(): Promise<void> {
    this.busy.set(true);
    try {
      this.session.patchMe(await this.identity.updateProfile({ preferredContact: this.choice() }));
      this.toasts.success('Сохранено');
      this.ref.close();
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }
}
