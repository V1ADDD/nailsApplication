import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { parseHelpInline } from '@nails/shared/help/data-access';

@Component({
  selector: 'app-help-inline-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    strong {
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text);
    }
  `,
  template: `
    @for (segment of segments(); track $index) {
      @if (segment.strong) {
        <strong>{{ segment.text }}</strong>
      } @else {
        <span>{{ segment.text }}</span>
      }
    }
  `
})
export class HelpInlineText {
  readonly text = input.required<string>();
  protected readonly segments = computed(() => parseHelpInline(this.text()));
}
