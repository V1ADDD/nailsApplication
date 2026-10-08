import { ChangeDetectionStrategy, Component, computed, inject, Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Icon, Viewport } from '@nails/web/common/ui';
import { filter, map } from 'rxjs';
import { frameSlots } from '../modules/frame';
import type { FrameAction } from '../modules/module-manifest';
import { TabBar } from './tab-bar';
import { TopBar } from './top-bar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Icon, TabBar, TopBar],
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
    .edge-tab {
      position: fixed;
      top: 50%;
      right: 0;
      z-index: var(--app-z-map-controls);
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      min-width: var(--app-tap-target);
      padding: var(--app-space-4) var(--app-space-2-5);
      border: 1px solid var(--app-color-border);
      border-right: 0;
      border-radius: var(--app-radius-lg) 0 0 var(--app-radius-lg);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-md);
      color: var(--app-color-primary);
      font: inherit;
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-bold);
      writing-mode: vertical-rl;
      transform: translateY(-50%);
      cursor: pointer;
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
      @if (onHome()) {
        @for (action of slots.actions; track action.label) {
          <button class="edge-tab" type="button" (click)="run(action)">
            <app-icon [name]="action.icon" [size]="20" />
            {{ action.label }}
          </button>
        }
      }
      <app-tab-bar />
    }
  `
})
export class AppLayout {
  protected readonly viewport = inject(Viewport);
  protected readonly slots = inject(frameSlots);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );
  protected readonly onHome = computed(() => this.url().split(/[?#]/)[0] === '/');

  protected run(action: FrameAction): void {
    void action.open(this.injector);
  }
}
