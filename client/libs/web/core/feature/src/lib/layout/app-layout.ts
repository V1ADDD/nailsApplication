import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Viewport } from '@nails/web/common/ui';
import { TabBar } from './tab-bar';
import { TopBar } from './top-bar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, TabBar, TopBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    main {
      width: 100%;
      max-width: var(--app-content-width);
      margin: 0 auto;
      padding: var(--app-space-6) var(--app-space-4);
      @include bp.up(md) {
        padding: var(--app-space-8) var(--app-space-6);
      }
    }
    main.above-tab-bar {
      padding-bottom: calc(var(--app-tab-bar-height) + env(safe-area-inset-bottom) + var(--app-space-6));
    }
  `,
  template: `
    @if (viewport.isLg()) {
      <app-top-bar />
    }
    <main [class.above-tab-bar]="!viewport.isLg()">
      <router-outlet />
    </main>
    @if (!viewport.isLg()) {
      <app-tab-bar />
    }
  `
})
export class AppLayout {
  protected readonly viewport = inject(Viewport);
}
