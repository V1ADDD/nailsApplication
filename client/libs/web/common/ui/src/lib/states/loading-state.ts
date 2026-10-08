import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      place-items: center;
      padding: 64px 0;
    }
  `,
  template: '<mat-spinner role="status" aria-label="Загрузка" />'
})
export class LoadingState {}
