import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '@nails/web/common/ui';

@Component({
  selector: 'app-not-found-page',
  imports: [EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-empty-state title="Такой страницы нет." />'
})
export class NotFoundPage {}
