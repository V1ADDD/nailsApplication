import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type AvatarShape = 'circle' | 'rounded';

const initialsWords = 2;

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.rounded]': "shape() === 'rounded'",
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.font-size.px]': 'size() * 0.38'
  },
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex-shrink: 0;
      border-radius: var(--app-radius-full);
      background: var(--app-gradient-primary);
      color: var(--app-color-primary-contrast);
      font-weight: var(--app-font-weight-bold);
      line-height: 1;
    }
    :host(.rounded) {
      border-radius: var(--app-radius-md);
    }
  `,
  template: `
    <span aria-hidden="true">{{ initials() }}</span>
    <span class="visually-hidden">{{ name() }}</span>
  `
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input(40);
  readonly shape = input<AvatarShape>('circle');
  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, initialsWords)
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
  );
}
