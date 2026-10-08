import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogTitle } from '@angular/material/dialog';
import { Icon, Viewport } from '@nails/web/common/ui';

@Component({
  selector: 'app-sheet-layout',
  imports: [MatButtonModule, MatDialogClose, MatDialogTitle, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      max-height: 90dvh;
    }
    .grip {
      align-self: center;
      width: 3rem;
      height: 0.3rem;
      margin-top: var(--app-space-2);
      border-radius: var(--app-radius-full);
      background: var(--app-color-border-strong);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--app-space-2);
      padding: var(--app-space-3) var(--app-space-3) var(--app-space-2) var(--app-space-5);
    }
    h2 {
      margin: 0;
      padding: 0;
      font-size: var(--app-font-size-lg);
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
    h2::before {
      display: none;
    }
    .body {
      flex: 1;
      overflow-y: auto;
      padding: 0 var(--app-space-5) var(--app-space-4);
    }
    footer {
      padding: var(--app-space-3) var(--app-space-5) var(--app-space-4);
      border-top: 1px solid var(--app-color-border);
    }
    footer:empty {
      display: none;
    }
  `,
  template: `
    @if (!viewport.isMd()) {
      <div class="grip" aria-hidden="true"></div>
    }
    <header>
      <h2 mat-dialog-title>{{ heading() }}</h2>
      <button mat-icon-button type="button" mat-dialog-close aria-label="Закрыть">
        <app-icon name="x" />
      </button>
    </header>
    <div class="body">
      <ng-content />
    </div>
    <footer>
      <ng-content select="[sheetFooter]" />
    </footer>
  `
})
export class SheetLayout {
  readonly heading = input.required<string>();
  protected readonly viewport = inject(Viewport);
}
