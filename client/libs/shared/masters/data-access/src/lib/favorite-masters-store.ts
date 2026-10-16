import { inject, Injectable } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { FavoritesStore } from './favorites-store';
import { MastersApi } from './masters-api';
import { PagedList } from './paged-list';

type FavoriteMaster = Schemas['FavoriteMasterResponse'];

@Injectable()
export class FavoriteMastersStore {
  private readonly api = inject(MastersApi);
  private readonly favorites = inject(FavoritesStore);
  readonly list = new PagedList<FavoriteMaster>(
    (page) => this.api.favoriteMasters(page),
    (master) => master.id
  );

  async remove(master: FavoriteMaster): Promise<void> {
    const index = this.list.indexOf(master.id);
    this.list.remove(master.id);
    try {
      if (this.favorites.has(master.id)) {
        await this.favorites.toggle(master.id);
      } else {
        await this.api.setFavorite(master.id, false);
      }
    } catch (error) {
      this.list.restore(master, Math.max(0, index));
      throw error;
    }
  }
}
