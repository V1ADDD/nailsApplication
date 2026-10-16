import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { ErrorState } from '@nails/web/common/ui';
import { AccountCard } from './account-card';
import { profilePaths } from './profile-paths';
import { profileSlots } from './profile-slots';
import { type SectionLink, SectionNav } from './section-nav';

const settingsLink: SectionLink = { path: profilePaths.settings, label: 'Настройки', icon: 'sliders-horizontal' };

@Component({
  selector: 'app-client-account',
  imports: [RouterOutlet, ErrorState, AccountCard, SectionNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      gap: var(--app-space-4);
      align-items: start;
    }
    .side {
      display: grid;
      gap: var(--app-space-4);
    }
    @include bp.up(md) {
      :host {
        max-width: 45rem;
        margin: 0 auto;
        width: 100%;
      }
    }
    @include bp.up(lg) {
      :host {
        grid-template-columns: 20rem minmax(0, 1fr);
        max-width: none;
        gap: var(--app-space-6);
      }
      .side {
        position: sticky;
        top: calc(var(--app-top-bar-height) + var(--app-space-6));
      }
    }
  `,
  template: `
    @if (session.me(); as me) {
      <div class="side">
        <app-account-card [me]="me" />
        <app-section-nav [links]="links" />
      </div>
      <section>
        <router-outlet />
      </section>
    } @else if (session.meError()) {
      <app-error-state title="Не удалось загрузить" (retry)="session.load()" />
    }
  `
})
export class ClientAccount {
  protected readonly session = inject(SessionStore);
  protected readonly links: readonly SectionLink[] = [
    ...inject(profileSlots).clientSections.map(({ path, label, icon }) => ({ path, label, icon })),
    settingsLink
  ];
}
