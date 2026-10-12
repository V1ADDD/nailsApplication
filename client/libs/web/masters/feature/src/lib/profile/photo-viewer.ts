import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import type { Schemas } from '@nails/shared/core/data-access';
import { SheetLayout } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import { PhotoTile } from './photo-tile';

export interface PhotoViewerData {
  photos: Schemas['PortfolioPhotoResponse'][];
  index: number;
  altOf: (index: number) => string;
}

const swipeDistance = 50;

@Component({
  selector: 'app-photo-viewer',
  imports: [MatButtonModule, SheetLayout, Icon, PhotoTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown.arrowleft)': 'step(-1)', '(keydown.arrowright)': 'step(1)' },
  styles: `
    .frame {
      aspect-ratio: 1;
      border-radius: var(--app-radius-lg);
      touch-action: pan-y;
    }
    app-photo-tile {
      width: 100%;
      height: 100%;
    }
    .caption {
      margin: var(--app-space-3) 0 0;
      color: var(--app-color-text-secondary);
    }
    .nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-2);
    }
  `,
  template: `
    <app-sheet-layout [heading]="heading()">
      @if (photo(); as current) {
        <div class="frame" (pointerdown)="swipeStart($event)" (pointerup)="swipeEnd($event)">
          <app-photo-tile [url]="current.url" [hue]="current.hue" [alt]="data.altOf(index())" />
        </div>
        @if (current.caption) {
          <p class="caption">{{ current.caption }}</p>
        }
      }
      <div sheetFooter class="nav">
        <button mat-stroked-button type="button" (click)="step(-1)">
          <app-icon name="chevron-left" [size]="18" />
          Назад
        </button>
        <button mat-stroked-button type="button" (click)="step(1)">
          Далее
          <app-icon name="chevron-right" [size]="18" />
        </button>
      </div>
    </app-sheet-layout>
  `
})
export class PhotoViewer {
  protected readonly data = inject<PhotoViewerData>(MAT_DIALOG_DATA);
  protected readonly index = signal(this.data.index);
  protected readonly photo = computed(() => this.data.photos[this.index()]);
  protected readonly heading = computed(() => `Фото ${this.index() + 1} из ${this.data.photos.length}`);
  private startX: number | null = null;

  protected step(delta: number): void {
    const count = this.data.photos.length;
    this.index.update((index) => (index + delta + count) % count);
  }

  protected swipeStart(event: PointerEvent): void {
    this.startX = event.clientX;
  }

  protected swipeEnd(event: PointerEvent): void {
    if (this.startX === null) {
      return;
    }
    const distance = event.clientX - this.startX;
    this.startX = null;
    if (Math.abs(distance) >= swipeDistance) {
      this.step(distance < 0 ? 1 : -1);
    }
  }
}
