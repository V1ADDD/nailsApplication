import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '@nails/web/common/ui';

const hueShift = 40;

@Component({
  selector: 'app-photo-tile',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.background]': 'background()' },
  styles: `
    :host {
      position: relative;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: inherit;
      color: var(--app-color-text-inverse);
    }
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  template: `
    @if (url(); as source) {
      <img [src]="source" [alt]="alt()" loading="lazy" decoding="async" />
    } @else {
      <app-icon name="image" [label]="alt()" />
    }
  `
})
export class PhotoTile {
  readonly url = input<string | null>(null);
  readonly hue = input(0);
  readonly alt = input.required<string>();

  protected readonly background = computed(
    () => `linear-gradient(135deg, hsl(${this.hue()} 60% 75%), hsl(${this.hue() + hueShift} 65% 60%))`
  );
}
