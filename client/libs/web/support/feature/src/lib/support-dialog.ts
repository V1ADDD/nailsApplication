import { inject, Injectable } from '@angular/core';
import { Sheets } from '@nails/web/common/overlays';
import { SupportForm } from './support-form';

@Injectable({ providedIn: 'root' })
export class SupportDialog {
  private readonly sheets = inject(Sheets);

  open(): void {
    this.sheets.open(SupportForm);
  }
}
