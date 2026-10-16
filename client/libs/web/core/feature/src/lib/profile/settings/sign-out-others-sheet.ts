import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { IdentityApi } from '@nails/shared/core/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';

@Component({
  selector: 'app-sign-out-others-sheet',
  imports: [MatButtonModule, MatDialogClose, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    p {
      margin: 0;
      color: var(--app-color-text-secondary);
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <app-sheet-layout heading="Выйти на других устройствах?">
      <p>На всех других телефонах и браузерах нужно будет войти заново. На этом устройстве вы останетесь в аккаунте.</p>
      <div class="actions" sheetFooter>
        <button mat-stroked-button type="button" mat-dialog-close>Отмена</button>
        <button mat-flat-button class="app-danger-soft" type="button" [disabled]="busy()" (click)="confirm()">
          Выйти
        </button>
      </div>
    </app-sheet-layout>
  `
})
export class SignOutOthersSheet {
  private readonly identity = inject(IdentityApi);
  private readonly toasts = inject(Toasts);
  private readonly ref = inject(MatDialogRef);
  protected readonly busy = signal(false);

  protected async confirm(): Promise<void> {
    this.busy.set(true);
    try {
      await this.identity.signOutOthers();
      this.toasts.success('Другие устройства вышли из аккаунта');
      this.ref.close();
    } catch {
      this.toasts.error('Не удалось выйти на других устройствах');
    } finally {
      this.busy.set(false);
    }
  }
}
