import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SheetLayout } from '@nails/web/common/overlays';

@Component({
  selector: 'app-photo-sheet',
  imports: [SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    img {
      display: block;
      width: 100%;
      max-height: 75dvh;
      object-fit: contain;
      border-radius: var(--app-radius-lg);
    }
  `,
  template: `
    <app-sheet-layout heading="Фото">
      <img [src]="url" alt="Фото из переписки" />
    </app-sheet-layout>
  `
})
export class PhotoSheet {
  protected readonly url = inject<string>(MAT_DIALOG_DATA);
}
