import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPaths, type Schemas } from '@nails/shared/core/data-access';
import { firstValueFrom } from 'rxjs';
import type { LatLng, MasterCard } from './search-criteria';

export const mastersPaths = {
  search: '/api/masters/search',
  favoriteIds: '/api/masters/favorites/ids',
  card: (id: string) => `/api/masters/${id}/card`,
  favorite: (id: string) => `/api/masters/${id}/favorite`
} as const;

@Injectable({ providedIn: 'root' })
export class MastersApi {
  private readonly http = inject(HttpClient);

  search(params: HttpParams): Promise<Schemas['MasterSearchResponse']> {
    return firstValueFrom(this.http.get<Schemas['MasterSearchResponse']>(mastersPaths.search, { params }));
  }

  card(id: string, location: LatLng | null): Promise<MasterCard> {
    const params = new HttpParams({ fromObject: location ? { lat: location.lat, lng: location.lng } : {} });
    return firstValueFrom(this.http.get<MasterCard>(mastersPaths.card(id), { params }));
  }

  suggestions(query: string): Promise<Schemas['SuggestionResponse'][]> {
    return firstValueFrom(
      this.http.get<Schemas['SuggestionResponse'][]>(apiPaths.catalogSuggestions, { params: { q: query } })
    );
  }

  setFavorite(id: string, favorite: boolean): Promise<unknown> {
    const url = mastersPaths.favorite(id);
    return firstValueFrom(favorite ? this.http.put(url, null) : this.http.delete(url));
  }
}
