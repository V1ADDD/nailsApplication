import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  type ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { formatCountdown, formatPhone, formatPhoneInput } from '@nails/shared/common/util';
import { IdentityApi, SessionStore, toProblem, type Schemas } from '@nails/shared/core/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { appPaths } from '../bootstrap/app-paths';
import { frameSlots, injectFrameActionRunner } from '../modules/frame';
import { CodeInput } from './code-input';
import { safeReturnTo } from './safe-return-to';
import { SignInCard } from './sign-in-card';

type SignInStep = 'phone' | 'code' | 'name';

const countryCode = '+375';
const phoneDigits = 9;
const millisecondsPerSecond = 1000;
const nameMaxLength = 120;
const errorId = 'sign-in-error';

@Component({
  selector: 'app-sign-in-page',
  imports: [MatButtonModule, CodeInput, SignInCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    form {
      display: grid;
      gap: var(--app-space-4);
    }
    .lead {
      color: var(--app-color-text-secondary);
    }
    .lead strong {
      color: var(--app-color-text);
      white-space: nowrap;
    }
    .phone {
      position: relative;
      display: block;
    }
    .phone .prefix {
      position: absolute;
      top: 50%;
      left: var(--app-space-4);
      transform: translateY(-50%);
      pointer-events: none;
    }
    .phone .app-input {
      padding-left: 3.75rem;
    }
    .lead .app-link {
      min-height: auto;
      padding: 0;
      font-size: inherit;
      vertical-align: baseline;
    }
    .error {
      text-align: center;
    }
    .resend {
      display: grid;
      place-items: center;
      min-height: var(--app-tap-target);
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
      text-align: center;
    }
    .support {
      margin-top: var(--app-space-4);
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-secondary);
      text-align: center;
    }
  `,
  template: `
    <app-sign-in-card>
      @switch (step()) {
        @case ('phone') {
          <h1>Вход</h1>
          <p class="lead">
            Записывайтесь к мастерам, переписывайтесь и храните избранное. Если вы мастер — ведите график и клиентов в
            том же аккаунте.
          </p>
          <form (submit)="requestCode($event)">
            <label class="app-field">
              <span class="app-field-label">Телефон</span>
              <span class="phone">
                <span class="prefix" aria-hidden="true">+375</span>
                <input
                  #phoneField
                  class="app-input"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel-national"
                  placeholder="(29) 123-45-67"
                  aria-label="Телефон, после +375"
                  [attr.aria-invalid]="error() !== null"
                  [attr.aria-describedby]="error() ? errorId : null"
                  [value]="phoneText()"
                  (input)="phoneChanged($event)"
                />
              </span>
              @if (error(); as message) {
                <span class="app-field-error" role="alert" [id]="errorId">{{ message }}</span>
              }
            </label>
            <button mat-flat-button class="app-large app-block" type="submit" [disabled]="busy() || !phoneComplete()">
              {{ busy() ? 'Отправляем…' : 'Получить код' }}
            </button>
          </form>
        }
        @case ('code') {
          <h1>Введите код из SMS</h1>
          <p class="lead">
            Код отправлен на <strong>{{ shownPhone() }}</strong
            >.
            <button class="app-link" type="button" [disabled]="busy()" (click)="changePhone()">Изменить номер</button>
          </p>
          <app-code-input
            [length]="codeLength()"
            [disabled]="busy()"
            [invalid]="error() !== null"
            [describedBy]="error() ? errorId : null"
            (completed)="checkCode($event)"
          />
          @if (error(); as message) {
            <p class="app-field-error error" role="alert" [id]="errorId">{{ message }}</p>
          }
          <div class="resend" aria-live="polite">
            @if (busy()) {
              <span>Проверяем…</span>
            } @else if (resendIn() > 0) {
              <span>Запросить код повторно через {{ countdown() }}</span>
            } @else {
              <button class="app-link" type="button" (click)="resend()">Запросить код повторно</button>
            }
          </div>
        }
        @case ('name') {
          <h1>Как вас зовут?</h1>
          <p class="lead">
            Аккаунта с номером <strong>{{ shownPhone() }}</strong> ещё нет. Укажите имя, и мы его создадим.
          </p>
          <form (submit)="finish($event)">
            <label class="app-field">
              <span class="app-field-label">Имя</span>
              <input
                #nameField
                class="app-input"
                autocomplete="name"
                [maxLength]="nameMaxLength"
                [attr.aria-invalid]="error() !== null"
                [attr.aria-describedby]="error() ? errorId : null"
                [value]="name()"
                (input)="nameChanged($event)"
              />
              @if (error(); as message) {
                <span class="app-field-error" role="alert" [id]="errorId">{{ message }}</span>
              }
            </label>
            <button mat-flat-button class="app-large app-block" type="submit" [disabled]="busy()">
              {{ busy() ? 'Создаём…' : 'Продолжить' }}
            </button>
          </form>
        }
      }
    </app-sign-in-card>
    @if (slots.actions.length > 0) {
      <p class="support">
        Не получается войти?
        @for (action of slots.actions; track action.label) {
          <button class="app-link" type="button" (click)="run(action)">{{ action.label }}</button>
        }
      </p>
    }
  `
})
export class SignInPage {
  readonly returnTo = input<string>();
  protected readonly errorId = errorId;
  protected readonly nameMaxLength = nameMaxLength;
  private readonly session = inject(SessionStore);
  private readonly identity = inject(IdentityApi);
  private readonly toasts = inject(Toasts);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  protected readonly slots = inject(frameSlots);
  protected readonly run = injectFrameActionRunner();
  protected readonly step = signal<SignInStep>('phone');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly digits = signal('');
  protected readonly name = signal('');
  protected readonly codeLength = signal(6);
  private readonly code = signal('');
  private readonly resendAt = signal(0);
  private readonly now = signal(Date.now());
  protected readonly phoneText = computed(() => formatPhoneInput(this.digits()));
  protected readonly phoneComplete = computed(() => this.digits().length === phoneDigits);
  protected readonly shownPhone = computed(() => formatPhone(this.phone()));
  protected readonly resendIn = computed(() => Math.max(0, (this.resendAt() - this.now()) / millisecondsPerSecond));
  protected readonly countdown = computed(() => formatCountdown(this.resendIn()));
  private readonly phoneField = viewChild<ElementRef<HTMLInputElement>>('phoneField');
  private readonly nameField = viewChild<ElementRef<HTMLInputElement>>('nameField');
  private readonly codeInput = viewChild(CodeInput);

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), millisecondsPerSecond);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    effect(() => {
      if (this.session.status() === 'signed-in' && !this.busy()) {
        void this.router.navigateByUrl(this.destination(), { replaceUrl: true });
      }
    });
    this.focusStep();
  }

  protected phoneChanged(event: Event): void {
    const field = event.target as HTMLInputElement;
    const raw = field.value.replace(/\D/g, '');
    const local = raw.length > phoneDigits && raw.startsWith('375') ? raw.slice(3) : raw;
    this.digits.set(local.slice(0, phoneDigits));
    field.value = this.phoneText();
    this.error.set(null);
  }

  protected nameChanged(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
    this.error.set(null);
  }

  protected async requestCode(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.phoneComplete()) {
      return;
    }
    const response = await this.sendCode();
    if (response === null) {
      return;
    }
    if (!response.codeRequired) {
      await this.signIn(null);
      return;
    }
    this.step.set('code');
    this.focusStep();
  }

  protected async resend(): Promise<void> {
    this.codeInput()?.clear();
    await this.sendCode();
  }

  protected changePhone(): void {
    this.error.set(null);
    this.step.set('phone');
    this.focusStep();
  }

  protected async checkCode(code: string): Promise<void> {
    this.code.set(code);
    await this.signIn(null);
  }

  protected async finish(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.name().trim();
    if (name === '') {
      this.error.set('Введите имя');
      return;
    }
    await this.signIn(name);
  }

  private async sendCode(): Promise<Schemas['PhoneCodeResponse'] | null> {
    this.busy.set(true);
    this.error.set(null);
    try {
      const response = await this.identity.requestCode({ phone: this.phone() });
      this.codeLength.set(response.codeLength);
      this.resendAt.set(Date.now() + response.resendAfterSeconds * millisecondsPerSecond);
      return response;
    } catch (error) {
      this.error.set(toProblem(error).title);
      return null;
    } finally {
      this.busy.set(false);
    }
  }

  private async signIn(name: string | null): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      const response = await this.session.signIn({ phone: this.phone(), code: this.code() || null, name });
      if (response.nameRequired) {
        this.busy.set(false);
        this.step.set('name');
        this.focusStep();
        return;
      }
      if (name !== null) {
        this.toasts.success('Добро пожаловать!');
      }
      await this.router.navigateByUrl(this.destination(), { replaceUrl: true });
    } catch (error) {
      this.busy.set(false);
      this.error.set(toProblem(error).title);
      if (this.step() === 'code') {
        this.codeInput()?.clear();
      }
    }
  }

  private phone(): string {
    return countryCode + this.digits();
  }

  private destination(): string {
    return safeReturnTo(this.returnTo(), `/${appPaths.profile}`);
  }

  private focusStep(): void {
    afterNextRender(
      () => {
        this.phoneField()?.nativeElement.focus();
        this.nameField()?.nativeElement.focus();
        this.codeInput()?.focus();
      },
      { injector: this.injector }
    );
  }
}
