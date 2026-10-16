import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UnreadStore } from '@nails/shared/chats/data-access';
import type { FrameBadge } from '@nails/web/core/feature';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatsBadge implements FrameBadge {
  private readonly unread = inject(UnreadStore);

  readonly count = this.unread.count;

  constructor() {
    inject(Router)
      .events.pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => void this.unread.refresh());
  }
}
