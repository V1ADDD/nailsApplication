import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

export interface SegmentedOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-segmented-toggle',
  imports: [MatButtonToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    mat-button-toggle-group {
      display: grid;
      grid-auto-columns: 1fr;
      grid-auto-flow: column;
      width: 100%;
    }
  `,
  template: `
    <mat-button-toggle-group
      [attr.aria-label]="label()"
      [value]="value()"
      [disabled]="disabled()"
      (change)="changed.emit($event.value)"
    >
      @for (option of options(); track option.value) {
        <mat-button-toggle [value]="option.value">{{ option.label }}</mat-button-toggle>
      }
    </mat-button-toggle-group>
  `
})
export class SegmentedToggle {
  readonly options = input.required<readonly SegmentedOption[]>();
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly changed = output<string>();
}
