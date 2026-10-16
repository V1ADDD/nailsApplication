import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { RealtimeService, SessionStore } from '@nails/shared/core/data-access';
import { ChatsApi } from './chats-api';

@Injectable({ providedIn: 'root' })
export class UnreadStore {
  private readonly api = inject(ChatsApi);
  private readonly session = inject(SessionStore);
  private readonly realtime = inject(RealtimeService);
  private readonly total = signal(0);

  readonly count = this.total.asReadonly();

  constructor() {
    effect(() => {
      const signedIn = this.session.status() === 'signed-in';
      this.session.mode();
      untracked(() => {
        if (signedIn) {
          void this.refresh();
        } else {
          this.total.set(0);
        }
      });
    });
    this.realtime.on('unreadChanged').subscribe((event) => {
      if (event.role === this.session.mode()) {
        this.total.set(event.count);
      }
    });
    this.realtime.reconnected$.subscribe(() => void this.refresh());
  }

  async refresh(): Promise<void> {
    if (this.session.status() !== 'signed-in') {
      return;
    }
    try {
      const { count } = await this.api.unread(this.session.mode());
      this.total.set(count);
    } catch {
      return;
    }
  }
}
