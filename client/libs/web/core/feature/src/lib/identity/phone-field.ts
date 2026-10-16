import {
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { formatPhoneInput } from '@nails/shared/common/util';

export const phoneCountryCode = '+375';
export const phoneDigits = 9;

@Component({
  selector: 'app-phone-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: block;
    }
    .prefix {
      position: absolute;
      top: 50%;
      left: var(--app-space-4);
      transform: translateY(-50%);
      pointer-events: none;
    }
    .app-input {
      padding-left: 3.75rem;
    }
  `,
  template: `
    <span class="prefix" aria-hidden="true">{{ countryCode }}</span>
    <input
      #field
      class="app-input"
      type="tel"
      inputmode="tel"
      autocomplete="tel-national"
      placeholder="(29) 123-45-67"
      aria-label="Телефон, после +375"
      [attr.aria-invalid]="invalid()"
      [attr.aria-describedby]="describedBy()"
      [value]="text()"
      (input)="changed($event)"
      (blur)="left.emit()"
    />
  `
})
export class PhoneField {
  readonly digits = model('');
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);
  readonly left = output();
  protected readonly countryCode = phoneCountryCode;
  protected readonly text = computed(() => formatPhoneInput(this.digits()));
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  focus(): void {
    this.field().nativeElement.focus();
  }

  protected changed(event: Event): void {
    const target = event.target as HTMLInputElement;
    const raw = target.value.replace(/\D/g, '');
    const local = raw.length > phoneDigits && raw.startsWith('375') ? raw.slice(3) : raw;
    this.digits.set(local.slice(0, phoneDigits));
    target.value = this.text();
  }
}
