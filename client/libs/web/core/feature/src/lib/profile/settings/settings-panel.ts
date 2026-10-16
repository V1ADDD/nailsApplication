import { NgComponentOutlet } from '@angular/common';
import type { ComponentType } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { formatPhone } from '@nails/shared/common/util';
import { SessionStore } from '@nails/shared/core/data-access';
import { Sheets } from '@nails/web/common/overlays';
import { Icon } from '@nails/web/common/ui';
import { frameSlots, injectFrameActionRunner } from '../../modules/frame';
import { profileSlots } from '../profile-slots';
import { contactOptions } from './contact-options';
import { ContactSheet } from './contact-sheet';
import { EditProfileSheet } from './edit-profile-sheet';
import { InfoSheet } from './info-sheet';
import { aboutInfo, type InfoSheetData, languageInfo, rulesInfo } from './info-texts';
import { NotificationSwitches } from './notification-switches';
import { PhoneSheet } from './phone-sheet';
import { SignOutOthersSheet } from './sign-out-others-sheet';

@Component({
  selector: 'app-settings-panel',
  imports: [MatButtonModule, NgComponentOutlet, RouterLink, Icon, NotificationSwitches],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
    }
    .rows {
      overflow: hidden;
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
    }
    .caption {
      padding: var(--app-space-4) var(--app-space-5) var(--app-space-1);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
      letter-spacing: var(--app-letter-spacing-caps);
      text-transform: uppercase;
      color: var(--app-color-text-muted);
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li + li {
      border-top: 1px solid var(--app-color-border);
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
      width: 100%;
      min-height: 3.5rem;
      padding: 0 var(--app-space-5);
      border: 0;
      background: none;
      color: var(--app-color-text);
      font: inherit;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    .row:hover {
      background: var(--app-color-surface-muted);
    }
    .row .label {
      flex: 1;
    }
    .row .value {
      color: var(--app-color-text-secondary);
    }
    .row app-icon {
      color: var(--app-color-text-muted);
    }
    .actions {
      display: grid;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <h1 class="visually-hidden">Настройки</h1>
    <section class="rows" aria-labelledby="settings-account">
      <h2 class="caption" id="settings-account">Аккаунт</h2>
      <ul>
        <li>
          <button class="row" type="button" (click)="open(editProfile)">
            <span class="label">Редактировать профиль</span>
            <app-icon name="chevron-right" [size]="20" />
          </button>
        </li>
        <li>
          <button class="row" type="button" (click)="open(phoneSheet)">
            <span class="label">Телефон</span>
            <span class="value">{{ phone() }}</span>
            <app-icon name="chevron-right" [size]="20" />
          </button>
        </li>
        <li>
          <button class="row" type="button" (click)="open(contactSheet)">
            <span class="label">Способ связи</span>
            <span class="value">{{ contact() }}</span>
            <app-icon name="chevron-right" [size]="20" />
          </button>
        </li>
        <li>
          <button class="row" type="button" (click)="open(signOutOthers)">
            <span class="label">Выйти на других устройствах</span>
            <app-icon name="chevron-right" [size]="20" />
          </button>
        </li>
      </ul>
    </section>
    <section class="rows" aria-labelledby="settings-notifications">
      <h2 class="caption" id="settings-notifications">Уведомления</h2>
      <app-notification-switches />
    </section>
    <section class="rows" aria-labelledby="settings-other">
      <h2 class="caption" id="settings-other">Прочее</h2>
      <ul>
        <li>
          <button class="row" type="button" (click)="info(languageInfo)">
            <span class="label">Язык</span>
            <span class="value">Русский</span>
            <app-icon name="chevron-right" [size]="20" />
          </button>
        </li>
        <li>
          <button class="row" type="button" (click)="info(aboutInfo)">
            <span class="label">О приложении</span>
            <app-icon name="chevron-right" [size]="20" />
          </button>
        </li>
        <li>
          <button class="row" type="button" (click)="info(rulesInfo)">
            <span class="label">Правила использования</span>
            <app-icon name="chevron-right" [size]="20" />
          </button>
        </li>
        @for (link of frame.accountLinks; track link.path) {
          <li>
            <a class="row" [routerLink]="link.path">
              <span class="label">{{ link.label }}</span>
              <app-icon name="chevron-right" [size]="20" />
            </a>
          </li>
        }
        @for (action of frame.actions; track action.label) {
          <li>
            <button class="row" type="button" (click)="run(action)">
              <span class="label">{{ action.label }}</span>
              <app-icon name="chevron-right" [size]="20" />
            </button>
          </li>
        }
      </ul>
    </section>
    <div class="actions">
      @for (action of profile.settingsActions; track $index) {
        <ng-container *ngComponentOutlet="action" />
      }
      <button
        mat-flat-button
        class="app-large app-block app-danger-soft"
        type="button"
        [disabled]="signingOut()"
        (click)="signOut()"
      >
        Выйти из аккаунта
      </button>
    </div>
  `
})
export class SettingsPanel {
  private readonly session = inject(SessionStore);
  private readonly sheets = inject(Sheets);
  private readonly router = inject(Router);
  protected readonly frame = inject(frameSlots);
  protected readonly profile = inject(profileSlots);
  protected readonly run = injectFrameActionRunner();
  protected readonly signingOut = signal(false);
  protected readonly editProfile = EditProfileSheet;
  protected readonly phoneSheet = PhoneSheet;
  protected readonly contactSheet = ContactSheet;
  protected readonly signOutOthers = SignOutOthersSheet;
  protected readonly languageInfo = languageInfo;
  protected readonly aboutInfo = aboutInfo;
  protected readonly rulesInfo = rulesInfo;
  protected readonly phone = computed(() => {
    const phone = this.session.me()?.phone;
    return phone ? formatPhone(phone) : '';
  });
  protected readonly contact = computed(
    () => contactOptions.find((option) => option.value === this.session.me()?.preferredContact)?.label ?? ''
  );

  protected open(sheet: ComponentType<unknown>): void {
    this.sheets.open(sheet);
  }

  protected info(data: InfoSheetData): void {
    this.sheets.open(InfoSheet, data);
  }

  protected async signOut(): Promise<void> {
    this.signingOut.set(true);
    try {
      await this.session.signOut();
      await this.router.navigate(['/']);
    } finally {
      this.signingOut.set(false);
    }
  }
}
