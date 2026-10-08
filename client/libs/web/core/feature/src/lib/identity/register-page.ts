import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { IdentityApi, toProblem, type Problem } from '@nails/shared/core/data-access';
import { ProblemAlert } from '@nails/web/common/ui';
import { appPaths } from '../bootstrap/app-paths';
import { AuthCard } from './auth-card';
import { authFormStyles } from './auth-form.styles';

const minimumPasswordLength = 12;

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AuthCard,
    ProblemAlert
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: authFormStyles,
  template: `
    <app-auth-card heading="Регистрация">
      @if (sentTo(); as email) {
        <p role="status">Мы отправили ссылку на {{ email }}. Откройте её, чтобы подтвердить адрес, а затем войдите.</p>
        <a mat-flat-button [routerLink]="['/', paths.signIn]">Войти</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <app-problem-alert [problem]="problem()" />
          <mat-form-field>
            <mat-label>Ваше имя</mat-label>
            <input matInput autocomplete="name" formControlName="displayName" required />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Электронная почта</mat-label>
            <input matInput type="email" autocomplete="email" formControlName="email" required />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Пароль</mat-label>
            <input matInput type="password" autocomplete="new-password" formControlName="password" required />
            <mat-hint>Не короче {{ minimumPasswordLength }} символов</mat-hint>
          </mat-form-field>
          <button mat-flat-button type="submit" [disabled]="submitting() || form.invalid">Создать аккаунт</button>
          <div class="links">
            <a mat-button [routerLink]="['/', paths.signIn]">У меня уже есть аккаунт</a>
          </div>
        </form>
      }
    </app-auth-card>
  `
})
export class RegisterPage {
  protected readonly paths = appPaths;
  protected readonly minimumPasswordLength = minimumPasswordLength;
  private readonly identity = inject(IdentityApi);
  private readonly router = inject(Router);
  protected readonly submitting = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly sentTo = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(minimumPasswordLength)]]
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.problem.set(null);
    try {
      const request = this.form.getRawValue();
      const response = await this.identity.register(request);
      if (response.requiresEmailConfirmation) {
        this.sentTo.set(request.email);
      } else {
        await this.router.navigate(['/', appPaths.signIn]);
      }
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
