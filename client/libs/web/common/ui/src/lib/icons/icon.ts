import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { iconPaths, type IconName } from './icon-paths';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()'
  },
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
      [innerHTML]="markup()"
    ></svg>
  `
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly label = input<string>();
  readonly size = input(24);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly markup = computed(() => this.sanitizer.bypassSecurityTrustHtml(iconPaths[this.name()]));
}
