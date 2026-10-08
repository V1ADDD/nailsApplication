import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { Icon } from '@nails/web/common/ui';

@Component({
  selector: 'app-help-search-field',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: block;
    }
    app-icon {
      position: absolute;
      top: 50%;
      left: var(--app-space-4);
      transform: translateY(-50%);
      color: var(--app-color-text-muted);
      pointer-events: none;
    }
    input {
      width: 100%;
      height: var(--app-tap-target);
      padding: 0 var(--app-space-10) 0 var(--app-space-10);
      font: inherit;
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border-strong);
      border-radius: var(--app-radius-full);
    }
    input:focus {
      border-color: var(--app-color-primary);
      outline: none;
    }
    input::-webkit-search-cancel-button {
      display: none;
    }
    button {
      position: absolute;
      top: 50%;
      right: var(--app-space-1);
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      border: 0;
      border-radius: var(--app-radius-full);
      background: none;
      color: var(--app-color-text-muted);
      transform: translateY(-50%);
      cursor: pointer;
    }
  `,
  template: `
    <app-icon name="search" [size]="18" />
    <input
      type="search"
      placeholder="Поиск по справке"
      aria-label="Поиск по справке"
      [value]="query()"
      (input)="changed($event)"
    />
    @if (query()) {
      <button type="button" aria-label="Очистить поиск" (click)="query.set('')">
        <app-icon name="x" [size]="16" />
      </button>
    }
  `
})
export class HelpSearchField {
  readonly query = model('');

  protected changed(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
