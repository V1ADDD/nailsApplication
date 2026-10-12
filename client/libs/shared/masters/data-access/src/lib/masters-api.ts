import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPaths, type Schemas } from '@nails/shared/core/data-access';
import { firstValueFrom } from 'rxjs';
import type { MasterProfile, MasterSlots, ReviewPage } from './profile';
import type { LatLng, MasterCard } from './search-criteria';

export const mastersPaths = {
  search: '/api/masters/search',
  favoriteIds: '/api/masters/favorites/ids',
  conflicts: '/api/masters/bookings/conflicts',
  bookings: '/api/masters/bookings',
  profile: (id: string) => `/api/masters/${id}`,
  slots: (id: string) => `/api/masters/${id}/slots`,
  reviews: (id: string) => `/api/masters/${id}/reviews`,
  card: (id: string) => `/api/masters/${id}/card`,
  favorite: (id: string) => `/api/masters/${id}/favorite`
} as const;

function locationParams(location: LatLng | null): HttpParams {
  return new HttpParams({ fromObject: location ? { lat: location.lat, lng: location.lng } : {} });
}

@Injectable({ providedIn: 'root' })
export class MastersApi {
  private readonly http = inject(HttpClient);

  search(params: HttpParams): Promise<Schemas['MasterSearchResponse']> {
    return firstValueFrom(this.http.get<Schemas['MasterSearchResponse']>(mastersPaths.search, { params }));
  }

  card(id: string, location: LatLng | null): Promise<MasterCard> {
    return firstValueFrom(this.http.get<MasterCard>(mastersPaths.card(id), { params: locationParams(location) }));
  }

  profile(id: string, location: LatLng | null): Promise<MasterProfile> {
    return firstValueFrom(this.http.get<MasterProfile>(mastersPaths.profile(id), { params: locationParams(location) }));
  }

  slots(id: string): Promise<MasterSlots> {
    return firstValueFrom(this.http.get<MasterSlots>(mastersPaths.slots(id)));
  }

  reviews(id: string, page: number): Promise<ReviewPage> {
    return firstValueFrom(this.http.get<ReviewPage>(mastersPaths.reviews(id), { params: { page } }));
  }

  conflicts(slotId: string): Promise<Schemas['ConflictsResponse']> {
    return firstValueFrom(this.http.post<Schemas['ConflictsResponse']>(mastersPaths.conflicts, { slotId }));
  }

  book(request: Schemas['CreateBookingRequest']): Promise<Schemas['CreateBookingResponse']> {
    return firstValueFrom(this.http.post<Schemas['CreateBookingResponse']>(mastersPaths.bookings, request));
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
