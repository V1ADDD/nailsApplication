import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HelpContentStore } from '@nails/shared/help/data-access';
import { SheetLayout } from '@nails/web/common/overlays';
import { HelpTopics } from './help-topics';

const articlePrefix = '/help/';

@Component({
  selector: 'app-help-topics-sheet',
  imports: [SheetLayout, HelpTopics],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet-layout heading="Разделы справки">
      @if (help.hasValue()) {
        <app-help-topics [sections]="help.value().sections" [activeId]="activeId" (opened)="ref.close()" />
      }
    </app-sheet-layout>
  `
})
export class HelpTopicsSheet {
  protected readonly help = inject(HelpContentStore).content;
  protected readonly ref = inject(MatDialogRef);
  private readonly url = inject(Router).url;
  protected readonly activeId = this.url.startsWith(articlePrefix) ? this.url.slice(articlePrefix.length) : undefined;
}
