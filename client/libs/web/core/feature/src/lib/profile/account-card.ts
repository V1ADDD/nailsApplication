import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatPhone } from '@nails/shared/common/util';
import type { Schemas } from '@nails/shared/core/data-access';
import { Avatar } from '@nails/web/common/ui';

@Component({
  selector: 'app-account-card',
  imports: [Avatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--app-space-4);
      padding: var(--app-space-5);
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
    }
    .who {
      display: grid;
      gap: var(--app-space-1);
      min-width: 0;
    }
    h1 {
      font-size: var(--app-font-size-xl);
      font-weight: var(--app-font-weight-bold);
      letter-spacing: normal;
      overflow-wrap: anywhere;
    }
    p {
      margin: 0;
      color: var(--app-color-text-secondary);
    }
  `,
  template: `
    <app-avatar [name]="me().name" [photoUrl]="me().photoUrl" [size]="64" shape="rounded" />
    <div class="who">
      <h1>{{ me().name }}</h1>
      @if (phone(); as phone) {
        <p>{{ phone }}</p>
      }
      @if (contacts(); as contacts) {
        <p>{{ contacts }}</p>
      }
    </div>
  `
})
export class AccountCard {
  readonly me = input.required<Schemas['MeResponse']>();
  protected readonly phone = computed(() => {
    const phone = this.me().phone;
    return phone ? formatPhone(phone) : null;
  });
  protected readonly contacts = computed(() => {
    const me = this.me();
    const filled = [me.telegram ? 'Telegram' : null, me.viber ? 'Viber' : null].filter((item) => item !== null);
    return filled.length > 0 ? filled.join(' · ') : null;
  });
}
