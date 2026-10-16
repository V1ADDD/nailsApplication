import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { type Schemas, toProblem } from '@nails/shared/core/data-access';
import { FavoriteMastersStore } from '@nails/shared/masters/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { Avatar, EmptyState, ErrorState, Icon, Rating, Skeleton } from '@nails/web/common/ui';
import { ScrollSentinel } from './scroll-sentinel';

const skeletons = [0, 1, 2] as const;

@Component({
  selector: 'app-favorites-panel',
  imports: [MatButtonModule, RouterLink, Avatar, EmptyState, ErrorState, Icon, Rating, Skeleton, ScrollSentinel],
  providers: [FavoriteMastersStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @use 'breakpoints' as bp;

    :host {
      display: grid;
      gap: var(--app-space-4);
    }
    h1 {
      font-size: var(--app-font-size-xl);
      font-weight: var(--app-font-weight-bold);
    }
    .list {
      display: grid;
      gap: var(--app-space-3);
    }
    .item {
      position: relative;
    }
    .card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--app-space-3);
      align-items: center;
      padding: var(--app-space-4);
      padding-right: calc(var(--app-tap-target) + var(--app-space-4));
      background: var(--app-color-surface);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      color: var(--app-color-text);
      text-decoration: none;
    }
    .who {
      display: grid;
      gap: var(--app-space-1);
      min-width: 0;
    }
    .name {
      display: flex;
      align-items: center;
      gap: var(--app-space-1);
      font-weight: var(--app-font-weight-bold);
      overflow-wrap: anywhere;
    }
    .name app-icon {
      color: var(--app-color-primary);
    }
    .specialty {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
    }
    .heart {
      position: absolute;
      top: 50%;
      right: var(--app-space-2);
      transform: translateY(-50%);
      color: var(--app-color-danger);
    }
    @include bp.up(md) {
      .list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
  template: `
    <h1>Избранное</h1>
    @switch (list.status()) {
      @case ('error') {
        <app-error-state title="Не удалось загрузить" (retry)="list.reload()" />
      }
      @case ('ready') {
        @if (list.items().length === 0) {
          <app-empty-state
            title="В избранном пока пусто"
            message="Нажмите на сердечко в профиле мастера, чтобы сохранить его здесь."
          >
            <a mat-flat-button routerLink="/">Найти мастера</a>
          </app-empty-state>
        } @else {
          <div class="list">
            @for (master of list.items(); track master.id) {
              <div class="item">
                <a class="card" [routerLink]="['/masters', master.id]">
                  <app-avatar [name]="master.name" [photoUrl]="master.photoUrl" [size]="60" />
                  <span class="who">
                    <span class="name">
                      {{ master.name }}
                      @if (master.verified) {
                        <app-icon name="badge-check" [size]="16" />
                      }
                    </span>
                    <span class="specialty">{{ master.specialty }}</span>
                    <app-rating [value]="master.rating" [count]="master.reviewsCount" />
                  </span>
                </a>
                <button
                  mat-icon-button
                  class="heart"
                  type="button"
                  [attr.aria-label]="'Убрать ' + master.name + ' из избранного'"
                  (click)="remove(master)"
                >
                  <app-icon name="heart" [size]="22" [filled]="true" />
                </button>
              </div>
            }
          </div>
          @if (list.hasMore()) {
            <div appScrollSentinel (reached)="list.loadMore()"></div>
          }
        }
      }
      @default {
        <div class="list">
          @for (index of skeletons; track index) {
            <app-skeleton height="5.5rem" />
          }
        </div>
      }
    }
  `
})
export class FavoritesPanel {
  private readonly store = inject(FavoriteMastersStore);
  private readonly toasts = inject(Toasts);
  protected readonly list = this.store.list;
  protected readonly skeletons = skeletons;

  constructor() {
    void this.list.reload();
  }

  protected async remove(master: Schemas['FavoriteMasterResponse']): Promise<void> {
    try {
      await this.store.remove(master);
      this.toasts.success(`Удалено из избранного: ${master.name}`);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    }
  }
}
