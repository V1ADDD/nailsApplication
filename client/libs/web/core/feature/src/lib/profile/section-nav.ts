import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon, type IconName } from '@nails/web/common/ui';

export interface SectionLink {
  readonly path: string;
  readonly label: string;
  readonly icon: IconName;
}

@Component({
  selector: 'app-section-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: block;
    }
    ul {
      display: flex;
      gap: var(--app-space-2);
      margin: 0;
      padding: 0;
      list-style: none;
      overflow-x: auto;
      scrollbar-width: none;
    }
    a {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--app-space-2);
      min-height: var(--app-tap-target);
      padding: 0 var(--app-space-4);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      color: var(--app-color-text);
      font-weight: var(--app-font-weight-semibold);
      text-decoration: none;
      white-space: nowrap;
    }
    a.active {
      border-color: var(--app-color-primary);
      background: var(--app-color-primary);
      color: var(--app-color-primary-contrast);
    }
    app-icon {
      display: none;
    }
    @include bp.down(sm) {
      ul {
        display: grid;
        grid-auto-columns: minmax(0, 1fr);
        grid-auto-flow: column;
        overflow: visible;
      }
      a {
        padding: 0 var(--app-space-2);
        font-size: var(--app-font-size-sm);
      }
    }
    @include bp.up(lg) {
      ul {
        flex-direction: column;
        gap: 0;
        overflow: visible;
        padding: var(--app-space-2);
        border: 1px solid var(--app-color-border);
        border-radius: var(--app-radius-lg);
        background: var(--app-color-surface);
      }
      a {
        justify-content: flex-start;
        border: 0;
        border-radius: var(--app-radius-md);
        background: none;
      }
      a.active {
        background: var(--app-color-primary-soft);
        color: var(--app-color-primary);
      }
      app-icon {
        display: inline-flex;
      }
    }
  `,
  template: `
    <nav aria-label="Разделы профиля">
      <ul>
        @for (link of links(); track link.path) {
          <li>
            <a [routerLink]="link.path" routerLinkActive="active" ariaCurrentWhenActive="page">
              <app-icon [name]="link.icon" [size]="20" />
              {{ link.label }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `
})
export class SectionNav {
  readonly links = input.required<readonly SectionLink[]>();
}
