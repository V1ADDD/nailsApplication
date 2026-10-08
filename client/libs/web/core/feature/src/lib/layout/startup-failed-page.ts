import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ErrorState } from '@nails/web/common/ui';

@Component({
  selector: 'app-startup-failed-page',
  imports: [ErrorState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-error-state title="Не удалось загрузить «Мастера рядом». Попробуйте ещё раз." (retry)="reload()" />'
})
export class StartupFailedPage {
  protected reload(): void {
    window.location.reload();
  }
}
