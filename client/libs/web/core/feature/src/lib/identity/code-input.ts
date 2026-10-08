import {
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';

@Component({
  selector: 'app-code-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      gap: var(--app-space-2);
    }
    .cell {
      display: grid;
      place-items: center;
      height: 3.5rem;
      font-size: var(--app-font-size-xl);
      font-weight: var(--app-font-weight-bold);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-md);
      transition: border-color var(--app-transition-fast);
    }
    .cell.active {
      border-color: var(--app-color-primary);
      box-shadow: 0 0 0 1px var(--app-color-primary);
    }
    .cell.invalid {
      border-color: var(--app-color-danger);
    }
    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      font-size: var(--app-font-size-md);
    }
  `,
  template: `
    @for (cell of cells(); track $index) {
      <span
        class="cell"
        aria-hidden="true"
        [class.active]="focused() && $index === activeIndex()"
        [class.invalid]="invalid()"
        >{{ cell }}</span
      >
    }
    <input
      #field
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      aria-label="Код из SMS"
      [attr.aria-invalid]="invalid()"
      [attr.aria-describedby]="describedBy()"
      [attr.maxlength]="length()"
      [disabled]="disabled()"
      [value]="value()"
      (input)="change($event)"
      (focus)="focused.set(true)"
      (blur)="focused.set(false)"
    />
  `
})
export class CodeInput {
  readonly length = input(6);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);
  readonly completed = output<string>();
  protected readonly value = signal('');
  protected readonly focused = signal(false);
  protected readonly cells = computed(() =>
    Array.from({ length: this.length() }, (_, index) => this.value().charAt(index))
  );
  protected readonly activeIndex = computed(() => Math.min(this.value().length, this.length() - 1));
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  focus(): void {
    this.field().nativeElement.focus();
  }

  clear(): void {
    this.value.set('');
    this.field().nativeElement.value = '';
    this.focus();
  }

  protected change(event: Event): void {
    const target = event.target as HTMLInputElement;
    const digits = target.value.replace(/\D/g, '').slice(0, this.length());
    target.value = digits;
    this.value.set(digits);
    if (digits.length === this.length()) {
      this.completed.emit(digits);
    }
  }
}
