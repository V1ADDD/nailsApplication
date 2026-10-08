import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ErrorState } from '@starter/web/common/ui';

@Component({
  selector: 'app-startup-failed-page',
  imports: [ErrorState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-error-state title="Starter cannot be loaded. Try again." (retry)="reload()" />'
})
export class StartupFailedPage {
  protected reload(): void {
    window.location.reload();
  }
}
