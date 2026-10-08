import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '@starter/web/common/ui';

@Component({
  selector: 'app-not-found-page',
  imports: [EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-empty-state title="This page does not exist." />'
})
export class NotFoundPage {}
