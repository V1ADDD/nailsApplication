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
      position: relative;
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
      border-radius: var(--app-radius-lg);
    }
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }
    .online {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 24%;
      height: 24%;
      min-width: 0.625rem;
      min-height: 0.625rem;
      border: 2px solid var(--app-color-surface);
      border-radius: var(--app-radius-full);
      background: var(--app-color-success);
    }
  `,
  template: `
    <span aria-hidden="true">{{ initials() }}</span>
    @if (photoUrl() && !failed()) {
      <img [src]="photoUrl()" alt="" loading="lazy" decoding="async" (error)="failed.set(true)" />
    }
    <span class="visually-hidden">{{ name() }}</span>
    @if (online()) {
      <span class="online" aria-hidden="true"></span>
    }
  `
})
export class Avatar {
  readonly name = input.required<string>();
  readonly photoUrl = input<string | null>(null);
  readonly online = input(false);
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
