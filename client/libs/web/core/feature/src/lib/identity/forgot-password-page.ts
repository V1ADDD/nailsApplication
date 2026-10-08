import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { IdentityApi, toProblem, type Problem } from '@starter/shared/core/data-access';
import { ProblemAlert } from '@starter/web/common/ui';
import { appPaths } from '../bootstrap/app-paths';
import { AuthCard } from './auth-card';
import { authFormStyles } from './auth-form.styles';

@Component({
  selector: 'app-forgot-password-page',
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
    <app-auth-card heading="Forgot password">
      @if (sentTo(); as email) {
        <p role="status">If {{ email }} has an account, we sent it a link to choose a new password.</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <app-problem-alert [problem]="problem()" />
          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput type="email" autocomplete="username" formControlName="email" required />
          </mat-form-field>
          <button mat-flat-button type="submit" [disabled]="submitting() || form.invalid">Send link</button>
        </form>
      }
      <div class="links">
        <a mat-button [routerLink]="['/', paths.signIn]">Back to sign in</a>
      </div>
    </app-auth-card>
  `
})
export class ForgotPasswordPage {
  protected readonly paths = appPaths;
  private readonly identity = inject(IdentityApi);
  protected readonly submitting = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly sentTo = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.problem.set(null);
    try {
      const request = this.form.getRawValue();
      await this.identity.forgotPassword(request);
      this.sentTo.set(request.email);
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
