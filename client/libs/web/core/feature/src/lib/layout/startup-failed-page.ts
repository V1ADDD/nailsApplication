import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrandedError } from './branded-error';

@Component({
  selector: 'app-startup-failed-page',
  imports: [BrandedError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-branded-error title="Не удалось загрузить «Мастера рядом». Попробуйте ещё раз." (retry)="reload()" />'
})
export class StartupFailedPage {
  protected reload(): void {
    window.location.reload();
  }
}
