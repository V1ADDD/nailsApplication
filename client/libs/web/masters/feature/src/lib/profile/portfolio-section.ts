import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { plural } from '@nails/shared/common/util';
import type { MasterProfile } from '@nails/shared/masters/data-access';
import { Sheets } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import { photoForms } from '../texts';
import { PhotoTile } from './photo-tile';
import { PhotoViewer, type PhotoViewerData } from './photo-viewer';
import { ProfileSection } from './profile-section';

const collapsedCount = 6;

@Component({
  selector: 'app-portfolio-section',
  imports: [MatButtonModule, Icon, PhotoTile, ProfileSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: block;
    }
    ul {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--app-space-2);
      margin: 0;
      padding: 0;
      list-style: none;
      @include bp.up(md) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      @include bp.up(lg) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    button.tile {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      padding: 0;
      border: none;
      border-radius: var(--app-radius-lg);
      cursor: zoom-in;
    }
    app-photo-tile {
      width: 100%;
      height: 100%;
    }
    .more {
      width: 100%;
    }
  `,
  template: `
    <app-profile-section icon="image" heading="Портфолио" headingId="portfolio" [aside]="countLabel()">
      <ul>
        @for (photo of shown(); track photo.id; let i = $index) {
          <li>
            <button type="button" class="tile" [attr.aria-label]="altOf(i)" (click)="open(i)">
              <app-photo-tile [url]="photo.url" [hue]="photo.hue" [alt]="altOf(i)" />
            </button>
          </li>
        }
      </ul>
      @if (photos().length > collapsedCount) {
        <button
          mat-stroked-button
          type="button"
          class="more"
          [attr.aria-expanded]="expanded()"
          (click)="expanded.set(!expanded())"
        >
          {{ expanded() ? 'Свернуть' : 'Показать все ' + photos().length }}
          <app-icon [name]="expanded() ? 'chevron-up' : 'chevron-down'" [size]="18" />
        </button>
      }
    </app-profile-section>
  `
})
export class PortfolioSection {
  readonly profile = input.required<MasterProfile>();

  private readonly sheets = inject(Sheets);

  protected readonly collapsedCount = collapsedCount;
  protected readonly expanded = signal(false);
  protected readonly photos = computed(() => this.profile().portfolio);
  protected readonly shown = computed(() => (this.expanded() ? this.photos() : this.photos().slice(0, collapsedCount)));
  protected readonly countLabel = computed(() => plural(this.photos().length, photoForms));

  protected altOf = (index: number): string =>
    this.photos()[index]?.caption ?? `Работа мастера ${this.profile().name}, фото ${index + 1}`;

  protected open(index: number): void {
    const data: PhotoViewerData = { photos: this.photos(), index, altOf: this.altOf };
    this.sheets.open(PhotoViewer, data);
  }
}
