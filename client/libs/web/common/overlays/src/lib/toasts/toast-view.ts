import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef
} from '@angular/material/snack-bar';
import { Icon } from '@nails/web/common/ui';

@Component({
  selector: 'app-toast-view',
  imports: [MatButtonModule, MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      align-items: center;
      color: var(--app-color-text-inverse);
      --mat-icon-button-icon-color: var(--app-color-text-inverse);
    }
  `,
  template: `
    <div matSnackBarLabel>{{ message }}</div>
    <div matSnackBarActions>
      <button mat-icon-button matSnackBarAction type="button" aria-label="Закрыть уведомление" (click)="ref.dismiss()">
        <app-icon name="x" [size]="20" />
      </button>
    </div>
  `
})
export class ToastView {
  protected readonly message = inject<string>(MAT_SNACK_BAR_DATA);
  protected readonly ref = inject(MatSnackBarRef);
}
