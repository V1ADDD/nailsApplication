import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { ChatListStore, ChatThreadStore, type ThreadMessage } from '@nails/shared/chats/data-access';
import { formatPhone } from '@nails/shared/common/util';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { Sheets, Toasts } from '@nails/web/common/overlays';
import { Avatar, ErrorState, Icon, Skeleton, Viewport } from '@nails/web/common/ui';
import { DeleteChatSheet } from '../sheets/delete-chat-sheet';
import { Composer } from './composer';
import { MessageList } from './message-list';

@Component({
  selector: 'app-chat-thread',
  imports: [MatButtonModule, MatMenuModule, RouterLink, Avatar, ErrorState, Icon, Skeleton, Composer, MessageList],
  providers: [ChatThreadStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      grid-template-columns: minmax(0, 1fr);
      min-height: 0;
    }
    header {
      display: flex;
      gap: var(--app-space-3);
      align-items: center;
      padding: var(--app-space-3) var(--app-space-4);
      border-bottom: 1px solid var(--app-color-border);
    }
    .who {
      flex: 1;
      min-width: 0;
    }
    .name {
      display: flex;
      gap: var(--app-space-2);
      align-items: center;
      min-width: 0;
      font-weight: var(--app-font-weight-bold);
    }
    .name span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tag {
      flex-shrink: 0;
      padding: 0 var(--app-space-2);
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-2xs);
    }
    .status {
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-xs);
    }
    .status.online {
      color: var(--app-color-success-text);
    }
    .state {
      display: grid;
      gap: var(--app-space-3);
      place-content: center;
      justify-items: center;
      padding: var(--app-space-6);
      text-align: center;
    }
    .blocked {
      display: grid;
      gap: var(--app-space-2);
      justify-items: center;
      padding: var(--app-space-3);
      border-top: 1px solid var(--app-color-border);
      color: var(--app-color-text-secondary);
      text-align: center;
    }
    .blocked p {
      margin: 0;
    }
  `,
  template: `
    @switch (store.status()) {
      @case ('loading') {
        <header><app-skeleton width="12rem" height="3rem" /></header>
        <div class="state"><app-skeleton width="16rem" height="8rem" /></div>
      }
      @case ('error') {
        <span></span>
        <div class="state">
          <app-error-state title="Не удалось открыть чат" (retry)="load()" />
          <a mat-button routerLink="/chats">К списку чатов</a>
        </div>
      }
      @case ('other-role') {
        <span></span>
        <div class="state">
          <p>Этот чат доступен в другом режиме профиля</p>
          @if (session.me()?.masterId) {
            <button mat-flat-button type="button" (click)="switchMode()">
              {{ session.mode() === 'client' ? 'Перейти в режим мастера' : 'Перейти в режим клиента' }}
            </button>
          }
          <a mat-button routerLink="/chats">К списку чатов</a>
        </div>
      }
      @default {
        @if (store.state(); as state) {
          <header>
            @if (!viewport.isMd()) {
              <a mat-icon-button routerLink="/chats" aria-label="Назад к чатам"><app-icon name="arrow-left" /></a>
            }
            <app-avatar
              [name]="state.counterpart.name"
              [photoUrl]="state.counterpart.photoUrl"
              [online]="state.counterpart.online"
              [size]="48"
            />
            <div class="who">
              <div class="name">
                <span>{{ state.counterpart.name }}</span>
                @if (state.counterpart.isMaster) {
                  <span class="tag">Мастер</span>
                }
              </div>
              @if (store.myRole() === 'client') {
                <div class="status" [class.online]="state.counterpart.online">
                  {{ state.counterpart.online ? 'онлайн' : 'не в сети' }}
                </div>
              } @else if (state.counterpart.subtitle; as phone) {
                <div class="status">{{ formatPhone(phone) }}</div>
              }
            </div>
            <button mat-icon-button type="button" aria-label="Меню чата" [matMenuTriggerFor]="menu">
              <app-icon name="more-vertical" />
            </button>
            <mat-menu #menu="matMenu">
              @if (store.myRole() === 'client' && !state.counterpart.deleted) {
                <a mat-menu-item [routerLink]="['/masters', state.counterpart.id]">Профиль мастера</a>
              }
              @if (store.blockedBy()) {
                <button mat-menu-item type="button" [disabled]="busy()" (click)="unblock()">Разблокировать</button>
              } @else {
                <button mat-menu-item type="button" [disabled]="busy()" (click)="block()">Заблокировать</button>
              }
              <button mat-menu-item type="button" (click)="remove()">Удалить чат</button>
            </mat-menu>
          </header>
          <app-message-list (edit)="editing.set($event)" />
          @if (store.blockedBy()) {
            <div class="blocked">
              <p>Чат заблокирован. Писать нельзя</p>
              @if (blockError(); as message) {
                <p class="app-field-error" role="alert">{{ message }}</p>
              }
              <div>
                <button mat-stroked-button type="button" [disabled]="busy()" (click)="unblock()">Разблокировать</button>
                <button mat-button class="app-danger-soft" type="button" (click)="remove()">Удалить чат</button>
              </div>
            </div>
          } @else {
            <app-composer [editing]="editing()" (editDone)="editing.set(null)" />
          }
        }
      }
    }
  `
})
export class ChatThread {
  readonly chatId = input.required<string>();
  protected readonly store = inject(ChatThreadStore);
  protected readonly session = inject(SessionStore);
  protected readonly viewport = inject(Viewport);
  private readonly list = inject(ChatListStore);
  private readonly sheets = inject(Sheets);
  private readonly toasts = inject(Toasts);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  protected readonly editing = signal<ThreadMessage | null>(null);
  protected readonly busy = signal(false);
  protected readonly blockError = signal<string | null>(null);
  protected readonly formatPhone = formatPhone;
  private readonly ready = computed(() => this.store.status() === 'ready');

  constructor() {
    effect(() => {
      this.chatId();
      this.session.mode();
      untracked(() => {
        this.editing.set(null);
        void this.load();
      });
    });
    effect(() => {
      if (this.ready()) {
        untracked(() => void this.markRead());
      }
    });
    this.store.incoming$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => void this.markRead());
    const visible = (): void => void this.markRead();
    this.document.addEventListener('visibilitychange', visible);
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener('visibilitychange', visible);
    });
  }

  protected load(): Promise<void> {
    return this.store.load(this.chatId(), this.session.mode());
  }

  protected async switchMode(): Promise<void> {
    try {
      await this.session.setMode(this.session.mode() === 'client' ? 'master' : 'client');
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    }
  }

  protected async block(): Promise<void> {
    await this.run(() => this.store.block(), 'Чат заблокирован');
  }

  protected async unblock(): Promise<void> {
    await this.run(() => this.store.unblock(), 'Чат разблокирован');
  }

  protected remove(): void {
    this.sheets
      .open(DeleteChatSheet)
      .afterClosed()
      .subscribe((confirmed: unknown) => {
        if (confirmed === true) {
          void this.clear();
        }
      });
  }

  private async clear(): Promise<void> {
    try {
      await this.store.clear();
      this.list.remove(this.chatId());
      this.toasts.success('Чат удалён');
      await this.router.navigateByUrl('/chats');
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    }
  }

  private async run(action: () => Promise<void>, success: string): Promise<void> {
    this.busy.set(true);
    this.blockError.set(null);
    try {
      await action();
      this.toasts.success(success);
    } catch (error) {
      this.blockError.set(toProblem(error).title);
      this.toasts.error(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }

  private async markRead(): Promise<void> {
    if (!this.ready() || this.document.visibilityState !== 'visible') {
      return;
    }
    this.list.markRead(this.chatId());
    try {
      await this.store.markRead();
    } catch {
      return;
    }
  }
}
