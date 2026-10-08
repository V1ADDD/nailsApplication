import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
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

const minimumPasswordLength = 12;

@Component({
  selector: 'app-reset-password-page',
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
    <app-auth-card heading="Choose a new password">
      @if (done()) {
        <p role="status">Your password is changed. Sign in with the new password.</p>
        <a mat-flat-button [routerLink]="['/', paths.signIn]">Sign in</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <app-problem-alert [problem]="problem()" />
          <mat-form-field>
            <mat-label>New password</mat-label>
            <input matInput type="password" autocomplete="new-password" formControlName="newPassword" required />
            <mat-hint>At least {{ minimumPasswordLength }} characters</mat-hint>
          </mat-form-field>
          <button mat-flat-button type="submit" [disabled]="submitting() || form.invalid">Change password</button>
        </form>
      }
    </app-auth-card>
  `
})
export class ResetPasswordPage {
  readonly userId = input<string>();
  readonly code = input<string>();
  protected readonly paths = appPaths;
  protected readonly minimumPasswordLength = minimumPasswordLength;
  private readonly identity = inject(IdentityApi);
  protected readonly submitting = signal(false);
  protected readonly done = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    newPassword: ['', [Validators.required, Validators.minLength(minimumPasswordLength)]]
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.problem.set(null);
    try {
      await this.identity.resetPassword({
        userId: this.userId() ?? '',
        code: this.code() ?? '',
        newPassword: this.form.controls.newPassword.value
      });
      this.done.set(true);
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
