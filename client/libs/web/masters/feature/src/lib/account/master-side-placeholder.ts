import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState } from '@nails/web/common/ui';
import { profileLink } from '@nails/web/core/feature';

@Component({
  selector: 'app-master-side-placeholder',
  imports: [MatButtonModule, RouterLink, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-empty-state title="Кабинет мастера появится здесь">
      <a mat-stroked-button [routerLink]="clientLink">Перейти в режим клиента</a>
    </app-empty-state>
  `
})
export class MasterSidePlaceholder {
  protected readonly clientLink = profileLink('client');
}
