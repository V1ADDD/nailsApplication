import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { Icon } from '@nails/web/common/ui';

const pixelDensity = 2;

@Component({
  selector: 'app-help-image-viewer',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-label]': 'image().alt',
    '(document:keydown.escape)': 'closed.emit()',
    '(click)': 'backdrop($event)'
  },
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: var(--app-z-overlay);
      display: grid;
      place-items: center;
      padding: max(var(--app-space-4), env(safe-area-inset-top)) var(--app-space-4)
        max(var(--app-space-4), env(safe-area-inset-bottom));
      background: rgb(23 21 28 / 82%);
      cursor: zoom-out;
    }
    img {
      display: block;
      width: auto;
      height: auto;
      max-height: calc(100dvh - 2 * var(--app-space-4));
      border-radius: var(--app-radius-lg);
      box-shadow: var(--app-shadow-lg);
    }
    button {
      position: fixed;
      top: max(var(--app-space-3), env(safe-area-inset-top));
      right: var(--app-space-3);
      display: grid;
      place-items: center;
      width: var(--app-tap-target);
      height: var(--app-tap-target);
      padding: 0;
      border: 0;
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      box-shadow: var(--app-shadow-md);
      cursor: pointer;
    }
  `,
  template: `
    <img
      [src]="image().url"
      [alt]="image().alt"
      [width]="image().width"
      [height]="image().height"
      [style.max-width]="'min(' + image().width / pixelDensity + 'px, 100%)'"
    />
    <button #close type="button" aria-label="Закрыть картинку" (click)="closed.emit()">
      <app-icon name="x" [size]="22" />
    </button>
  `
})
export class HelpImageViewer {
  readonly image = input.required<Schemas['HelpImageResponse']>();
  readonly closed = output();
  protected readonly pixelDensity = pixelDensity;
  private readonly close = viewChild.required<ElementRef<HTMLButtonElement>>('close');

  constructor() {
    const root = inject(DOCUMENT).documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => (root.style.overflow = previousOverflow));
    afterNextRender(() => this.close().nativeElement.focus());
  }

  protected backdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget || event.target instanceof HTMLImageElement) {
      this.closed.emit();
    }
  }
}
