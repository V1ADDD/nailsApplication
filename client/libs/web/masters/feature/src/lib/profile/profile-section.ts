import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, type IconName } from '@nails/web/common/ui';

@Component({
  selector: 'app-profile-section',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-labelledby]': 'headingId()' },
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
      padding: var(--app-space-5);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-xl);
      background: var(--app-color-surface);
    }
    header {
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
    }
    .tile {
      display: inline-grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: var(--app-radius-md);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
    }
    h2 {
      flex: 1;
      margin: 0;
      font-size: var(--app-font-size-lg);
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
    .aside {
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
    }
  `,
  template: `
    <header>
      <span class="tile" aria-hidden="true"><app-icon [name]="icon()" [size]="18" /></span>
      <h2 [id]="headingId()">{{ heading() }}</h2>
      @if (aside()) {
        <span class="aside">{{ aside() }}</span>
      }
    </header>
    <ng-content />
  `
})
export class ProfileSection {
  readonly icon = input.required<IconName>();
  readonly heading = input.required<string>();
  readonly headingId = input.required<string>();
  readonly aside = input<string | null>(null);
}
