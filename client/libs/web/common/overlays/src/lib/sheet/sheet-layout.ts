import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Icon, Viewport } from '@nails/web/common/ui';

const dismissDistance = 80;
const surfaceSelector = '.mat-mdc-dialog-surface';

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
    .handle {
      touch-action: none;
    }
    .grip {
      display: block;
      width: 3rem;
      height: 0.3rem;
      margin: var(--app-space-2) auto 0;
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
    <div
      class="handle"
      (pointerdown)="dragStart($event)"
      (pointermove)="dragMove($event)"
      (pointerup)="dragEnd()"
      (pointercancel)="dragEnd()"
    >
      @if (!viewport.isMd()) {
        <span class="grip" aria-hidden="true"></span>
      }
      <header>
        <h2 mat-dialog-title>{{ heading() }}</h2>
        <button mat-icon-button type="button" mat-dialog-close aria-label="Закрыть">
          <app-icon name="x" />
        </button>
      </header>
    </div>
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ref = inject(MatDialogRef);
  private startY: number | null = null;
  private offset = 0;

  protected dragStart(event: PointerEvent): void {
    const target = event.target as Element;
    if (this.viewport.isMd() || target.closest('button')) {
      return;
    }
    this.startY = event.clientY;
    this.offset = 0;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.surface()?.style.setProperty('transition', 'none');
  }

  protected dragMove(event: PointerEvent): void {
    if (this.startY === null) {
      return;
    }
    this.offset = Math.max(0, event.clientY - this.startY);
    this.surface()?.style.setProperty('transform', `translateY(${this.offset}px)`);
  }

  protected dragEnd(): void {
    if (this.startY === null) {
      return;
    }
    this.startY = null;
    const surface = this.surface();
    surface?.style.removeProperty('transition');
    if (this.offset > dismissDistance) {
      surface?.style.setProperty('transform', 'translateY(100%)');
      this.ref.close();
      return;
    }
    surface?.style.removeProperty('transform');
  }

  private surface(): HTMLElement | null {
    return this.host.nativeElement.closest<HTMLElement>(surfaceSelector);
  }
}
