import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
import { SheetLayout } from '@nails/web/common/overlays';

@Component({
  selector: 'app-delete-chat-sheet',
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
    <app-sheet-layout heading="Удалить чат?">
      <p>Переписка удалится из вашего списка вместе с историей. Это действие нельзя отменить.</p>
      <div class="actions" sheetFooter>
        <button mat-stroked-button type="button" [mat-dialog-close]="false">Назад</button>
        <button mat-flat-button class="app-danger-soft" type="button" [mat-dialog-close]="true">Удалить</button>
      </div>
    </app-sheet-layout>
  `
})
export class DeleteChatSheet {}
