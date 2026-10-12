import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatPhone } from '@nails/shared/common/util';
import type { MasterProfile } from '@nails/shared/masters/data-access';
import { Icon, type IconName } from '@nails/web/common/ui';
import { ProfileSection } from './profile-section';

interface ContactLink {
  label: string;
  value: string;
  href: string;
  icon: IconName;
  external: boolean;
}

function handle(value: string): string {
  return value.replace(/^@/, '');
}

@Component({
  selector: 'app-contacts-section',
  imports: [Icon, ProfileSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    ul {
      display: grid;
      gap: var(--app-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--app-space-3);
      align-items: center;
      color: var(--app-color-text);
      text-decoration: none;
    }
    a:hover .value {
      color: var(--app-color-primary);
    }
    app-icon {
      color: var(--app-color-text-muted);
    }
    .text {
      display: grid;
      min-width: 0;
    }
    .label {
      font-size: var(--app-font-size-xs);
      color: var(--app-color-text-muted);
    }
    .value {
      overflow-wrap: anywhere;
      font-weight: var(--app-font-weight-medium);
    }
  `,
  template: `
    <app-profile-section icon="phone" heading="Контакты" headingId="contacts">
      <ul>
        @for (contact of contacts(); track contact.label) {
          <li>
            <a
              [href]="contact.href"
              [attr.target]="contact.external ? '_blank' : null"
              [attr.rel]="contact.external ? 'noopener' : null"
            >
              <app-icon [name]="contact.icon" [size]="20" />
              <span class="text">
                <span class="label">{{ contact.label }}</span>
                <span class="value">{{ contact.value }}</span>
              </span>
            </a>
          </li>
        }
      </ul>
    </app-profile-section>
  `
})
export class ContactsSection {
  readonly profile = input.required<MasterProfile>();

  protected readonly contacts = computed<ContactLink[]>(() => {
    const { phone, email, telegram, viber, instagram } = this.profile().contacts;
    const links: ContactLink[] = [];
    if (phone) {
      links.push({ label: 'Телефон', value: formatPhone(phone), href: `tel:${phone}`, icon: 'phone', external: false });
    }
    if (email) {
      links.push({ label: 'E-mail', value: email, href: `mailto:${email}`, icon: 'mail', external: false });
    }
    if (telegram) {
      const name = handle(telegram);
      links.push({ label: 'Telegram', value: `@${name}`, href: `https://t.me/${name}`, icon: 'send', external: true });
    }
    if (viber) {
      links.push({
        label: 'Viber',
        value: formatPhone(viber),
        href: `viber://chat?number=${encodeURIComponent(viber)}`,
        icon: 'message-square',
        external: false
      });
    }
    if (instagram) {
      const name = handle(instagram);
      links.push({
        label: 'Instagram',
        value: `@${name}`,
        href: `https://instagram.com/${name}`,
        icon: 'instagram',
        external: true
      });
    }
    return links;
  });
}
