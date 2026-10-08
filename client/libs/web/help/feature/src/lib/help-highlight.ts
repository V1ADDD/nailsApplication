import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { highlightSegments } from '@nails/shared/help/data-access';

@Component({
  selector: 'app-help-highlight',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    mark {
      padding: 0 1px;
      border-radius: var(--app-radius-xs);
      background: var(--app-color-primary-soft);
      color: inherit;
    }
  `,
  template: `
    @for (segment of segments(); track $index) {
      @if (segment.match) {
        <mark>{{ segment.text }}</mark>
      } @else {
        <span>{{ segment.text }}</span>
      }
    }
  `
})
export class HelpHighlight {
  readonly text = input.required<string>();
  readonly terms = input.required<readonly string[]>();
  protected readonly segments = computed(() => highlightSegments(this.text(), this.terms()));
}
