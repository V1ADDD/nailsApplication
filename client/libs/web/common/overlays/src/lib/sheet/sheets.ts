import type { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { MatDialog, type MatDialogConfig, type MatDialogRef } from '@angular/material/dialog';
import { Viewport } from '@nails/web/common/ui';

const sheetConfig = {
  autoFocus: 'dialog',
  maxWidth: '100vw'
} as const;

const dialogConfig: MatDialogConfig = {
  ...sheetConfig,
  width: 'min(32rem, calc(100% - 2rem))'
};

const bottomSheetConfig: MatDialogConfig = {
  ...sheetConfig,
  width: '100%',
  maxHeight: '90dvh',
  position: { bottom: '0' },
  panelClass: 'app-sheet-bottom'
};

@Injectable({ providedIn: 'root' })
export class Sheets {
  private readonly dialog = inject(MatDialog);
  private readonly viewport = inject(Viewport);

  open<T>(component: ComponentType<T>): MatDialogRef<T> {
    return this.dialog.open(component, this.viewport.isMd() ? dialogConfig : bottomSheetConfig);
  }
}
