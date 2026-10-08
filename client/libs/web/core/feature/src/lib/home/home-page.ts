import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SessionStore } from '@starter/shared/core/data-access';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (session.me(); as me) {
      <h1>Welcome, {{ me.displayName }}</h1>
      <p>{{ me.tenantName }} · {{ me.email }}</p>
    }
  `
})
export class HomePage {
  protected readonly session = inject(SessionStore);
}
