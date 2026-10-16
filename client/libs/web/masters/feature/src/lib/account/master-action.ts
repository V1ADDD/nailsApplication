import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { Sheets } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import { profileLink } from '@nails/web/core/feature';
import { BecomeMasterSheet } from './become-master-sheet';

@Component({
  selector: 'app-master-action',
  imports: [MatButtonModule, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    .become {
      background: var(--app-gradient-primary);
      color: var(--app-color-primary-contrast);
    }
  `,
  template: `
    @if (isMaster()) {
      <a mat-stroked-button class="app-large app-block" [routerLink]="masterLink">
        <app-icon name="briefcase" [size]="20" />
        Перейти в кабинет мастера
      </a>
    } @else {
      <button mat-flat-button class="app-large app-block become" type="button" (click)="become()">
        Стать мастером
      </button>
    }
  `
})
export class MasterAction {
  private readonly session = inject(SessionStore);
  private readonly sheets = inject(Sheets);
  protected readonly isMaster = computed(() => this.session.me()?.masterId != null);
  protected readonly masterLink = profileLink('master');

  protected become(): void {
    this.sheets.open(BecomeMasterSheet);
  }
}
