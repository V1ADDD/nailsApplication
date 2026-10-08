import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { IdentityApi, SessionStore, toProblem, type Problem } from '@starter/shared/core/data-access';
import { ProblemAlert } from '@starter/web/common/ui';
import { appPaths } from '../bootstrap/app-paths';
import { AuthCard } from './auth-card';
import { authFormStyles } from './auth-form.styles';
import { safeReturnTo } from './safe-return-to';

const emailNotConfirmed = 'email-not-confirmed';

@Component({
  selector: 'app-sign-in-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    AuthCard,
    ProblemAlert
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: authFormStyles,
  template: `
    <app-auth-card heading="Sign in to Starter">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <app-problem-alert [problem]="problem()" />
        @if (problem()?.code === emailNotConfirmed) {
          <button mat-button type="button" (click)="resend()">Send the link again</button>
        }
        @if (notice()) {
          <p role="status">{{ notice() }}</p>
        }
        <mat-form-field>
          <mat-label>Email</mat-label>
          <input matInput type="email" autocomplete="username" formControlName="email" required />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Password</mat-label>
          <input matInput type="password" autocomplete="current-password" formControlName="password" required />
        </mat-form-field>
        <mat-checkbox formControlName="rememberMe">Keep me signed in</mat-checkbox>
        <button mat-flat-button type="submit" [disabled]="submitting() || form.invalid">Sign in</button>
        <div class="links">
          <a mat-button [routerLink]="['/', paths.forgotPassword]">Forgot password?</a>
          <a mat-button [routerLink]="['/', paths.register]">Create account</a>
        </div>
      </form>
    </app-auth-card>
  `
})
export class SignInPage {
  readonly returnTo = input<string>();
  protected readonly paths = appPaths;
  protected readonly emailNotConfirmed = emailNotConfirmed;
  private readonly session = inject(SessionStore);
  private readonly identity = inject(IdentityApi);
  private readonly router = inject(Router);
  protected readonly submitting = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  constructor() {
    effect(() => {
      if (this.session.status() === 'signed-in' && !this.submitting()) {
        void this.router.navigateByUrl(safeReturnTo(this.returnTo()), { replaceUrl: true });
      }
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.problem.set(null);
    this.notice.set(null);
    try {
      await this.session.signIn(this.form.getRawValue());
      await this.router.navigateByUrl(safeReturnTo(this.returnTo()), { replaceUrl: true });
    } catch (error) {
      this.problem.set(toProblem(error));
      this.submitting.set(false);
    }
  }

  protected async resend(): Promise<void> {
    const email = this.form.controls.email.value;
    try {
      await this.identity.resendConfirmation({ email });
      this.problem.set(null);
      this.notice.set(`We sent a new link to ${email}.`);
    } catch (error) {
      this.problem.set(toProblem(error));
    }
  }
}
