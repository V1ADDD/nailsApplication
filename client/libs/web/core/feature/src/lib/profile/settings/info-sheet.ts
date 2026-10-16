import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { SheetLayout } from '@nails/web/common/overlays';
import type { InfoSheetData } from './info-texts';

@Component({
  selector: 'app-info-sheet',
  imports: [MatButtonModule, MatDialogClose, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    p {
      margin: 0 0 var(--app-space-3);
      color: var(--app-color-text-secondary);
    }
    ol {
      display: grid;
      gap: var(--app-space-3);
      margin: 0;
      padding-left: var(--app-space-5);
    }
  `,
  template: `
    <app-sheet-layout [heading]="data.heading">
      @for (paragraph of data.paragraphs; track $index) {
        <p>{{ paragraph }}</p>
      }
      @if (data.numbered; as items) {
        <ol>
          @for (item of items; track $index) {
            <li>{{ item }}</li>
          }
        </ol>
      }
      <div sheetFooter>
        <button mat-flat-button class="app-block" type="button" mat-dialog-close>Понятно</button>
      </div>
    </app-sheet-layout>
  `
})
export class InfoSheet {
  protected readonly data = inject<InfoSheetData>(MAT_DIALOG_DATA);
}
