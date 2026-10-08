import { httpResource } from '@angular/common/http';
import { inject, Injectable, linkedSignal } from '@angular/core';
import { SessionStore } from '@nails/shared/core/data-access';
import { MastersApi, mastersPaths } from './masters-api';

@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly api = inject(MastersApi);
  private readonly session = inject(SessionStore);

  private readonly resource = httpResource<string[]>(
    () => (this.session.status() === 'signed-in' ? mastersPaths.favoriteIds : undefined),
    { defaultValue: [] }
  );

  private readonly ids = linkedSignal(() => new Set(this.resource.hasValue() ? this.resource.value() : []));

  has(id: string): boolean {
    return this.ids().has(id);
  }

  async toggle(id: string): Promise<void> {
    const favorite = !this.has(id);
    this.set(id, favorite);
    try {
      await this.api.setFavorite(id, favorite);
    } catch (error) {
      this.set(id, !favorite);
      throw error;
    }
  }

  private set(id: string, favorite: boolean): void {
    this.ids.update((ids) => {
      const next = new Set(ids);
      if (favorite) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
