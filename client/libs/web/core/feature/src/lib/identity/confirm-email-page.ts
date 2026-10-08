import { ChangeDetectionStrategy, Component, inject, input, signal, type OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { IdentityApi, toProblem, type Problem } from '@starter/shared/core/data-access';
import { LoadingState, ProblemAlert } from '@starter/web/common/ui';
import { appPaths } from '../bootstrap/app-paths';
import { AuthCard } from './auth-card';

type ConfirmState = 'confirming' | 'confirmed' | 'failed';

@Component({
  selector: 'app-confirm-email-page',
  imports: [RouterLink, MatButtonModule, AuthCard, LoadingState, ProblemAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-card heading="Confirm email">
      @switch (state()) {
        @case ('confirming') {
          <app-loading-state />
        }
        @case ('confirmed') {
          <p role="status">Your email is confirmed. You can sign in now.</p>
        }
        @case ('failed') {
          <app-problem-alert [problem]="problem()" />
        }
      }
      <a mat-flat-button [routerLink]="['/', paths.signIn]">Sign in</a>
    </app-auth-card>
  `
})
export class ConfirmEmailPage implements OnInit {
  readonly userId = input<string>();
  readonly code = input<string>();
  protected readonly paths = appPaths;
  private readonly identity = inject(IdentityApi);
  protected readonly state = signal<ConfirmState>('confirming');
  protected readonly problem = signal<Problem | null>(null);

  ngOnInit(): void {
    void this.confirm();
  }

  private async confirm(): Promise<void> {
    try {
      await this.identity.confirmEmail({ userId: this.userId() ?? '', code: this.code() ?? '' });
      this.state.set('confirmed');
    } catch (error) {
      this.problem.set(toProblem(error));
      this.state.set('failed');
    }
  }
}
