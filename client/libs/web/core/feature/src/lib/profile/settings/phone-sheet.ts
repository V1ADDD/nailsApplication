import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { formatCountdown, formatPhone } from '@nails/shared/common/util';
import { IdentityApi, SessionStore, toProblem } from '@nails/shared/core/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { CodeInput } from '../../identity/code-input';
import { PhoneField, phoneCountryCode, phoneDigits } from '../../identity/phone-field';

type PhoneStep = 'phone' | 'code';

const millisecondsPerSecond = 1000;
const errorId = 'phone-sheet-error';
const formatError = 'Введите белорусский номер в формате +375 XX XXX-XX-XX';

@Component({
  selector: 'app-phone-sheet',
  imports: [MatButtonModule, MatDialogClose, SheetLayout, CodeInput, PhoneField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .fields {
      display: grid;
      gap: var(--app-space-4);
    }
    .lead {
      margin: 0;
      color: var(--app-color-text-secondary);
    }
    .lead strong {
      color: var(--app-color-text);
      white-space: nowrap;
    }
    .resend {
      display: grid;
      place-items: center;
      min-height: var(--app-tap-target);
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <form (submit)="submit($event)">
      <app-sheet-layout heading="Телефон">
        <div class="fields">
          @if (step() === 'phone') {
            <p class="lead">Этот номер видят мастера, к которым вы записаны.</p>
            <div class="app-field">
              <span class="app-field-label">Телефон</span>
              <app-phone-field
                [digits]="digits()"
                [invalid]="error() !== null"
                [describedBy]="error() ? errorId : null"
                (digitsChange)="changed($event)"
                (left)="touched.set(true)"
              />
              @if (error(); as message) {
                <span class="app-field-error" role="alert" [id]="errorId">{{ message }}</span>
              } @else {
                <span class="app-field-hint">Формат: +375 29 123-45-67</span>
              }
            </div>
          } @else {
            <p class="lead">
              Введите код из SMS. Код отправлен на <strong>{{ shownPhone() }}</strong
              >.
              <button class="app-link" type="button" [disabled]="busy()" (click)="back()">Изменить номер</button>
            </p>
            <app-code-input
              [length]="codeLength()"
              [disabled]="busy()"
              [invalid]="serverError() !== null"
              [describedBy]="serverError() ? errorId : null"
              (completed)="confirm($event)"
            />
            @if (serverError(); as message) {
              <p class="app-field-error" role="alert" [id]="errorId">{{ message }}</p>
            }
            <div class="resend" aria-live="polite">
              @if (resendIn() > 0) {
                <span>Запросить код повторно через {{ countdown() }}</span>
              } @else {
                <button class="app-link" type="button" [disabled]="busy()" (click)="resend()">
                  Запросить код повторно
                </button>
              }
            </div>
          }
        </div>
        <div class="actions" sheetFooter>
          <button mat-stroked-button type="button" mat-dialog-close>Отмена</button>
          @if (step() === 'phone') {
            <button mat-flat-button type="submit" [disabled]="busy()">
              {{ busy() ? 'Отправляем…' : 'Получить код' }}
            </button>
          }
        </div>
      </app-sheet-layout>
    </form>
  `
})
export class PhoneSheet {
  private readonly session = inject(SessionStore);
  private readonly identity = inject(IdentityApi);
  private readonly toasts = inject(Toasts);
  private readonly ref = inject(MatDialogRef);
  private readonly injector = inject(Injector);
  protected readonly errorId = errorId;
  protected readonly step = signal<PhoneStep>('phone');
  protected readonly digits = signal('');
  protected readonly touched = signal(false);
  protected readonly busy = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly codeLength = signal(6);
  private readonly resendAt = signal(0);
  private readonly now = signal(Date.now());
  protected readonly complete = computed(() => this.digits().length === phoneDigits);
  protected readonly error = computed(
    () => this.serverError() ?? (this.touched() && !this.complete() ? formatError : null)
  );
  protected readonly shownPhone = computed(() => formatPhone(this.phone()));
  protected readonly resendIn = computed(() => Math.max(0, (this.resendAt() - this.now()) / millisecondsPerSecond));
  protected readonly countdown = computed(() => formatCountdown(this.resendIn()));
  private readonly codeInput = viewChild(CodeInput);

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), millisecondsPerSecond);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected changed(digits: string): void {
    this.digits.set(digits);
    this.serverError.set(null);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.touched.set(true);
    if (this.step() !== 'phone' || !this.complete()) {
      return;
    }
    const codeRequired = await this.requestCode();
    if (codeRequired === false) {
      await this.change(null);
    } else if (codeRequired) {
      this.step.set('code');
      afterNextRender(() => this.codeInput()?.focus(), { injector: this.injector });
    }
  }

  protected back(): void {
    this.serverError.set(null);
    this.step.set('phone');
  }

  protected async resend(): Promise<void> {
    this.codeInput()?.clear();
    await this.requestCode();
  }

  protected confirm(code: string): Promise<void> {
    return this.change(code);
  }

  private async requestCode(): Promise<boolean | null> {
    this.busy.set(true);
    this.serverError.set(null);
    try {
      const response = await this.identity.requestPhoneCode({ phone: this.phone() });
      this.codeLength.set(response.codeLength);
      this.resendAt.set(Date.now() + response.resendAfterSeconds * millisecondsPerSecond);
      return response.codeRequired;
    } catch (error) {
      this.serverError.set(toProblem(error).title);
      return null;
    } finally {
      this.busy.set(false);
    }
  }

  private async change(code: string | null): Promise<void> {
    this.busy.set(true);
    this.serverError.set(null);
    try {
      this.session.patchMe(await this.identity.changePhone({ phone: this.phone(), code }));
      this.toasts.success('Номер изменён');
      this.ref.close();
    } catch (error) {
      this.serverError.set(toProblem(error).title);
      this.codeInput()?.clear();
    } finally {
      this.busy.set(false);
    }
  }

  private phone(): string {
    return phoneCountryCode + this.digits();
  }
}
