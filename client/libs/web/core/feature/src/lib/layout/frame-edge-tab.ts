import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Icon } from '@nails/web/common/ui';
import { frameSlots, injectFrameActionRunner } from '../modules/frame';

@Component({
  selector: 'app-frame-edge-tab',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-2);
    }
    button {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: var(--app-space-2);
      min-width: var(--app-tap-target);
      padding: var(--app-space-3) var(--app-space-2);
      border: 1px solid var(--app-color-border);
      border-right: 0;
      border-radius: var(--app-radius-lg) 0 0 var(--app-radius-lg);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-md);
      color: var(--app-color-primary);
      font: inherit;
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
      cursor: pointer;
    }
    button:hover {
      background: var(--app-color-primary-soft);
    }
    .label {
      writing-mode: vertical-rl;
      white-space: nowrap;
    }
  `,
  template: `
    @for (action of slots.actions; track action.label) {
      <button type="button" (click)="run(action)">
        <app-icon [name]="action.icon" [size]="18" />
        <span class="label">{{ action.label }}</span>
      </button>
    }
  `
})
export class FrameEdgeTab {
  protected readonly slots = inject(frameSlots);
  protected readonly run = injectFrameActionRunner();
}
