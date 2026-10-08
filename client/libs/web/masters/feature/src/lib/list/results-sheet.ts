import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, model, signal } from '@angular/core';
import { Icon } from '@nails/web/common/ui';
import { ResultsSummary } from './results-summary';

export type SheetSnap = 'collapsed' | 'half' | 'full';

const snaps: readonly SheetSnap[] = ['collapsed', 'half', 'full'];
const halfShare = 0.5;
const fullShare = 0.88;
const collapsedRem = 4;
const dragThreshold = 6;
const projectionMs = 160;

@Component({
  selector: 'app-results-sheet',
  imports: [Icon, ResultsSummary],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.height]': 'height()',
    '[class.dragging]': 'dragHeight() !== null'
  },
  styles: `
    :host {
      position: absolute;
      inset: auto 0 0;
      z-index: var(--app-z-sheet);
      display: flex;
      flex-direction: column;
      border-radius: var(--app-radius-xl) var(--app-radius-xl) 0 0;
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-lg);
      transition: height var(--app-transition-slow);
    }
    :host(.dragging) {
      transition: none;
    }
    .handle {
      flex-shrink: 0;
      padding: var(--app-space-2) var(--app-space-4);
      touch-action: none;
      cursor: grab;
      user-select: none;
    }
    .grip {
      display: block;
      width: 3rem;
      height: 0.3rem;
      margin: 0 auto var(--app-space-2);
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary);
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
    }
    app-results-summary {
      flex: 1;
    }
    .toggle {
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      border: 0;
      border-radius: var(--app-radius-full);
      background: none;
      color: var(--app-color-primary);
      cursor: pointer;
    }
    .body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 0 var(--app-space-4) var(--app-space-4);
    }
  `,
  template: `
    <div
      class="handle"
      (pointerdown)="dragStart($event)"
      (pointermove)="dragMove($event)"
      (pointerup)="dragEnd($event)"
      (pointercancel)="dragCancel()"
    >
      <span class="grip" aria-hidden="true"></span>
      <div class="row">
        <app-results-summary />
        <button
          type="button"
          class="toggle"
          [attr.aria-label]="snap() === 'collapsed' ? 'Показать список мастеров' : 'Свернуть список мастеров'"
          [attr.aria-expanded]="snap() !== 'collapsed'"
          (click)="toggle()"
          (keydown)="step($event)"
        >
          <app-icon [name]="snap() === 'collapsed' ? 'chevron-up' : 'chevron-down'" />
        </button>
      </div>
    </div>
    <div class="body" [inert]="snap() === 'collapsed'">
      <ng-content />
    </div>
  `
})
export class ResultsSheet {
  readonly snap = model<SheetSnap>('collapsed');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly dragHeight = signal<number | null>(null);
  protected readonly height = computed(() => {
    const drag = this.dragHeight();
    return drag !== null ? `${drag}px` : this.cssHeight(this.snap());
  });

  private start: { y: number; height: number; time: number } | null = null;
  private moved = false;
  private last = { y: 0, time: 0 };

  protected toggle(): void {
    this.snap.set(this.snap() === 'collapsed' ? 'half' : 'collapsed');
  }

  protected step(event: KeyboardEvent): void {
    const offset = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    const next = offset === 0 ? undefined : snaps[snaps.indexOf(this.snap()) + offset];
    if (next) {
      event.preventDefault();
      this.snap.set(next);
    }
  }

  protected dragStart(event: PointerEvent): void {
    if ((event.target as Element).closest('button')) {
      return;
    }
    this.start = {
      y: event.clientY,
      height: this.host.nativeElement.getBoundingClientRect().height,
      time: event.timeStamp
    };
    this.last = { y: event.clientY, time: event.timeStamp };
    this.moved = false;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected dragMove(event: PointerEvent): void {
    if (!this.start) {
      return;
    }
    const delta = this.start.y - event.clientY;
    if (!this.moved && Math.abs(delta) < dragThreshold) {
      return;
    }
    this.moved = true;
    this.last = { y: event.clientY, time: event.timeStamp };
    this.dragHeight.set(Math.min(this.pixels('full'), Math.max(this.pixels('collapsed'), this.start.height + delta)));
  }

  protected dragEnd(event: PointerEvent): void {
    const start = this.start;
    this.start = null;
    if (!start) {
      return;
    }
    if (!this.moved) {
      this.toggle();
      return;
    }
    const elapsed = Math.max(1, event.timeStamp - this.last.time);
    const velocity = (this.last.y - event.clientY) / elapsed;
    const projected = (this.dragHeight() ?? start.height) + velocity * projectionMs;
    const nearest = snaps.reduce((best, snap) =>
      Math.abs(this.pixels(snap) - projected) < Math.abs(this.pixels(best) - projected) ? snap : best
    );
    this.dragHeight.set(null);
    this.snap.set(nearest);
  }

  protected dragCancel(): void {
    this.start = null;
    this.dragHeight.set(null);
  }

  private cssHeight(snap: SheetSnap): string {
    switch (snap) {
      case 'collapsed':
        return `${collapsedRem}rem`;
      case 'half':
        return `${halfShare * 100}%`;
      default:
        return `${fullShare * 100}%`;
    }
  }

  private pixels(snap: SheetSnap): number {
    const parent = this.host.nativeElement.parentElement?.getBoundingClientRect().height ?? window.innerHeight;
    if (snap === 'collapsed') {
      return collapsedRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    return parent * (snap === 'half' ? halfShare : fullShare);
  }
}
