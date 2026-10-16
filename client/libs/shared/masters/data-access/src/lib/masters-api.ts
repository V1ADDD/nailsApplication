import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPaths, type Schemas } from '@nails/shared/core/data-access';
import { firstValueFrom } from 'rxjs';
import type { MasterProfile, MasterSlots, ReviewPage } from './profile';
import type { LatLng, MasterCard } from './search-criteria';

export const mastersPaths = {
  search: '/api/masters/search',
  favoriteIds: '/api/masters/favorites/ids',
  favorites: '/api/masters/favorites',
  myBookings: '/api/masters/bookings/mine',
  myReviews: '/api/masters/reviews/mine',
  cities: '/api/masters/cities',
  becomeMaster: '/api/masters/me',
  booking: (id: string) => `/api/masters/bookings/${id}`,
  confirm: (id: string) => `/api/masters/bookings/${id}/confirm`,
  cancel: (id: string) => `/api/masters/bookings/${id}/cancel`,
  review: (id: string) => `/api/masters/bookings/${id}/reviews`,
  move: (id: string) => `/api/masters/bookings/${id}/move`,
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

  myBookings(scope: Schemas['MyBookingsScope'], page: number): Promise<Schemas['PagedResponseOfMyBookingResponse']> {
    return firstValueFrom(
      this.http.get<Schemas['PagedResponseOfMyBookingResponse']>(mastersPaths.myBookings, { params: { scope, page } })
    );
  }

  myBooking(id: string): Promise<Schemas['MyBookingResponse']> {
    return firstValueFrom(this.http.get<Schemas['MyBookingResponse']>(mastersPaths.booking(id)));
  }

  confirmBooking(id: string): Promise<Schemas['BookingResponse']> {
    return firstValueFrom(this.http.post<Schemas['BookingResponse']>(mastersPaths.confirm(id), null));
  }

  cancelBooking(id: string, request: Schemas['CancelBookingRequest']): Promise<Schemas['BookingResponse']> {
    return firstValueFrom(this.http.post<Schemas['BookingResponse']>(mastersPaths.cancel(id), request));
  }

  writeReview(id: string, request: Schemas['WriteReviewRequest']): Promise<Schemas['ReviewResponse']> {
    return firstValueFrom(this.http.post<Schemas['ReviewResponse']>(mastersPaths.review(id), request));
  }

  requestMove(id: string, request: Schemas['MoveBookingRequest']): Promise<Schemas['MyBookingResponse']> {
    return firstValueFrom(this.http.post<Schemas['MyBookingResponse']>(mastersPaths.move(id), request));
  }

  withdrawMove(id: string): Promise<Schemas['MyBookingResponse']> {
    return firstValueFrom(this.http.delete<Schemas['MyBookingResponse']>(mastersPaths.move(id)));
  }

  myReviews(about: boolean, page: number): Promise<Schemas['MyReviewsResponse']> {
    return firstValueFrom(
      this.http.get<Schemas['MyReviewsResponse']>(mastersPaths.myReviews, { params: { about, page } })
    );
  }

  favoriteMasters(page: number): Promise<Schemas['PagedResponseOfFavoriteMasterResponse']> {
    return firstValueFrom(
      this.http.get<Schemas['PagedResponseOfFavoriteMasterResponse']>(mastersPaths.favorites, { params: { page } })
    );
  }

  cities(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(mastersPaths.cities));
  }

  becomeMaster(request: Schemas['BecomeMasterRequest']): Promise<Schemas['MeResponse']> {
    return firstValueFrom(this.http.post<Schemas['MeResponse']>(mastersPaths.becomeMaster, request));
  }

  setFavorite(id: string, favorite: boolean): Promise<unknown> {
    const url = mastersPaths.favorite(id);
    return firstValueFrom(favorite ? this.http.put(url, null) : this.http.delete(url));
  }
}
