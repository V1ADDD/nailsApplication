import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { formatDistance, plural } from '@nails/shared/common/util';
import type { MasterProfile } from '@nails/shared/masters/data-access';
import { Avatar, Icon, Rating } from '@nails/web/common/ui';
import { experienceLabel, replyTimeLabel, reviewForms } from '../texts';
import { chatQuery, injectChatsEnabled, startChatPath } from '../write-to-master';

@Component({
  selector: 'app-profile-hero',
  imports: [MatButtonModule, RouterLink, Avatar, Icon, Rating],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
      padding: var(--app-space-5);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-xl);
      background: var(--app-color-surface);
    }
    .top {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--app-space-4);
      align-items: start;
    }
    .who {
      display: grid;
      gap: var(--app-space-1);
      min-width: 0;
    }
    h1 {
      margin: 0;
      font-size: var(--app-font-size-xl);
      font-weight: var(--app-font-weight-bold);
      line-height: var(--app-line-height-tight);
      overflow-wrap: anywhere;
      color: var(--app-color-text);
    }
    .specialty {
      color: var(--app-color-primary);
      font-weight: var(--app-font-weight-medium);
    }
    .heart {
      display: inline-grid;
      place-items: center;
      width: var(--app-tap-target);
      height: var(--app-tap-target);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      color: var(--app-color-text-muted);
      cursor: pointer;
    }
    .heart.on {
      border-color: var(--app-color-danger-border);
      background: var(--app-color-danger-soft);
      color: var(--app-color-danger);
    }
    .verified {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-1);
      padding: var(--app-space-0-5) var(--app-space-2);
      border: 1px solid var(--app-color-success-border);
      border-radius: var(--app-radius-full);
      background: var(--app-color-success-soft);
      color: var(--app-color-success-text);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-semibold);
    }
    ul {
      display: grid;
      gap: var(--app-space-2);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-secondary);
    }
    li {
      display: flex;
      align-items: flex-start;
      gap: var(--app-space-2);
    }
    li app-icon {
      color: var(--app-color-text-muted);
    }
    .online {
      color: var(--app-color-success-text);
      font-weight: var(--app-font-weight-semibold);
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--app-space-2);
    }
    .actions button,
    .actions a {
      height: 3rem;
    }
    .own {
      display: grid;
      gap: var(--app-space-2);
      margin: 0;
      padding: var(--app-space-3);
      border-radius: var(--app-radius-lg);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      text-align: center;
    }
  `,
  template: `
    @let master = profile();
    <div class="top">
      <app-avatar
        [name]="master.name"
        [photoUrl]="master.photoUrl"
        [online]="master.online"
        [size]="96"
        shape="rounded"
      />
      <div class="who">
        <h1>{{ master.name }}</h1>
        <span class="specialty">{{ master.specialty }}</span>
        <app-rating [value]="master.rating" [count]="master.reviewsCount" [countLabel]="reviewsLabel()" />
      </div>
      @if (!master.isOwn) {
        <button
          type="button"
          class="heart"
          [class.on]="favorite()"
          [attr.aria-pressed]="favorite()"
          [attr.aria-label]="favorite() ? 'Убрать из избранного' : 'Добавить в избранное'"
          (click)="toggleFavorite.emit()"
        >
          <app-icon name="heart" [filled]="favorite()" />
        </button>
      }
    </div>
    @if (master.verified) {
      <span class="verified"><app-icon name="badge-check" [size]="14" />Личность подтверждена</span>
    }
    <ul>
      @if (master.online) {
        <li class="online">● онлайн</li>
      } @else if (master.replyMinutes !== null && chatsEnabled()) {
        <li><app-icon name="clock" [size]="16" />{{ replyTime(master.replyMinutes) }}</li>
      }
      <li><app-icon name="briefcase" [size]="16" />{{ experience() }}</li>
      <li><app-icon name="map-pin" [size]="16" />{{ place() }}</li>
    </ul>
    @if (master.isOwn) {
      <p class="own">Это ваш профиль — так его видят клиенты</p>
    } @else {
      <div class="actions">
        <button mat-flat-button type="button" (click)="book.emit()">
          <app-icon name="calendar" [size]="18" />
          Записаться
        </button>
        @if (chatsEnabled()) {
          <a mat-stroked-button [routerLink]="startChatPath" [queryParams]="chatQuery(master.id)">
            <app-icon name="message-square" [size]="18" />
            Написать
          </a>
        }
      </div>
    }
  `
})
export class ProfileHero {
  readonly profile = input.required<MasterProfile>();
  readonly favorite = input(false);
  readonly book = output();
  readonly toggleFavorite = output();
  protected readonly chatsEnabled = injectChatsEnabled();
  protected readonly startChatPath = startChatPath;
  protected readonly chatQuery = chatQuery;
  protected readonly replyTime = replyTimeLabel;

  protected readonly reviewsLabel = computed(() => `· ${plural(this.profile().reviewsCount, reviewForms)}`);
  protected readonly experience = computed(() => experienceLabel(this.profile().experienceYears));
  protected readonly place = computed(() => {
    const master = this.profile();
    return `${master.address}, ${master.district}, ${master.city} · ${formatDistance(master.distanceKm)} от вас`;
  });
}
