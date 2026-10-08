import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  type ProviderToken
} from '@angular/core';
import type { FrameBadge } from '../modules/module-manifest';

@Component({
  selector: 'app-frame-badge-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    span.count {
      display: inline-grid;
      place-items: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 var(--app-space-1);
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
      font-size: var(--app-font-size-2xs);
      font-weight: var(--app-font-weight-bold);
      line-height: 1;
    }
  `,
  template: `
    @if (count() > 0) {
      <span class="count">{{ count() }}<span class="visually-hidden"> непрочитанных</span></span>
    }
  `
})
export class FrameBadgeView {
  readonly source = input.required<ProviderToken<FrameBadge>>();
  private readonly injector = inject(Injector);
  protected readonly count = computed(() => this.injector.get(this.source()).count());
}
