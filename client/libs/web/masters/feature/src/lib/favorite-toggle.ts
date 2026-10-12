import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { FavoritesStore } from '@nails/shared/masters/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { goToSignIn } from './sign-in';

@Injectable({ providedIn: 'root' })
export class FavoriteToggle {
  private readonly favorites = inject(FavoritesStore);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);

  async toggle(masterId: string): Promise<void> {
    if (this.session.status() !== 'signed-in') {
      goToSignIn(this.router, this.router.url);
      return;
    }
    try {
      await this.favorites.toggle(masterId);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    }
  }
}
