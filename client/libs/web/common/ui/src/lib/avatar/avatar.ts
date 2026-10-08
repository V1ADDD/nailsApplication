import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

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
      overflow: hidden;
      border-radius: var(--app-radius-full);
      background: var(--app-gradient-primary);
      color: var(--app-color-primary-contrast);
      font-weight: var(--app-font-weight-bold);
      line-height: 1;
    }
    :host(.rounded) {
      border-radius: var(--app-radius-md);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="name()" loading="lazy" (error)="failed.set(true)" />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
      <span class="visually-hidden">{{ name() }}</span>
    }
  `
})
export class Avatar {
  readonly name = input.required<string>();
  readonly src = input<string | null>(null);
  readonly size = input(40);
  readonly shape = input<AvatarShape>('circle');
  protected readonly failed = signal(false);
  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, initialsWords)
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
  );
}
