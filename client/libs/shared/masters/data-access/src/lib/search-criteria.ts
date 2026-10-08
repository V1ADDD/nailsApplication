import type { Schemas } from '@nails/shared/core/data-access';

export type SearchSort = Schemas['SearchSort'];
export type SearchWindow = NonNullable<Schemas['SearchWindow']>;
export type MasterCard = Schemas['MasterCardResponse'];
export type MapPin = Schemas['MapPinResponse'];

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SearchFilters {
  serviceId: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  maxDistanceKm: number | null;
  minRating: number | null;
  online: boolean;
  verified: boolean;
  window: SearchWindow | null;
  city: string | null;
}

export interface SearchCriteria {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
  location: LatLng | null;
}

export const emptyFilters: SearchFilters = {
  serviceId: null,
  priceFrom: null,
  priceTo: null,
  maxDistanceKm: null,
  minRating: null,
  online: false,
  verified: false,
  window: null,
  city: null
};

export function activeFilterCount(filters: SearchFilters): number {
  return [
    filters.serviceId !== null,
    filters.priceFrom !== null || filters.priceTo !== null,
    filters.maxDistanceKm !== null,
    filters.minRating !== null,
    filters.online,
    filters.verified,
    filters.window !== null,
    filters.city !== null
  ].filter(Boolean).length;
}
