import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { ErrorState } from '@nails/web/common/ui';
import { safeReturnTo } from './safe-return-to';

@Component({
  selector: 'app-unavailable-page',
  imports: [ErrorState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-error-state title="Нет связи с сервером. Попробуйте ещё раз." (retry)="retry()" />'
})
export class UnavailablePage {
  readonly returnTo = input<string>();
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  protected async retry(): Promise<void> {
    await this.session.load();
    await this.router.navigateByUrl(safeReturnTo(this.returnTo()));
  }
}
