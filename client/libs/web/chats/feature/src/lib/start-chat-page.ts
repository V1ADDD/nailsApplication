import { ChangeDetectionStrategy, Component, inject, input, type OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { ChatsApi } from '@nails/shared/chats/data-access';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { ErrorState, Skeleton } from '@nails/web/common/ui';

@Component({
  selector: 'app-start-chat-page',
  imports: [MatButtonModule, RouterLink, ErrorState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-3);
      justify-items: center;
    }
  `,
  template: `
    @if (error(); as message) {
      <app-error-state title="Не удалось открыть чат" [message]="message" (retry)="start()" />
      <a mat-button routerLink="/chats">К списку чатов</a>
    } @else {
      <app-skeleton width="100%" height="4rem" />
      <app-skeleton width="100%" height="12rem" />
    }
  `
})
export class StartChatPage implements OnInit {
  readonly master = input<string>();
  readonly client = input<string>();
  private readonly api = inject(ChatsApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.start();
  }

  protected async start(): Promise<void> {
    this.error.set(null);
    const masterId = this.master();
    const clientId = this.client();
    try {
      await this.session.setMode(masterId ? 'client' : 'master');
      const { chatId } = await this.api.start(masterId ? { masterId } : { clientId: clientId ?? null });
      await this.router.navigateByUrl(`/chats/${chatId}`, { replaceUrl: true });
    } catch (error) {
      this.error.set(toProblem(error).title);
    }
  }
}
