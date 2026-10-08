import { formatDecimal, formatAmount, NBSP } from '@nails/shared/common/util';
import { emptyFilters, type SearchFilters, type SearchWindow } from '@nails/shared/masters/data-access';

export type FilterSection = 'service' | 'price' | 'distance' | 'rating' | 'window' | 'city';

export interface FiltersSheetData {
  section: FilterSection | null;
}

export const sectionTitles: Record<FilterSection, string> = {
  service: 'Услуга',
  price: 'Цена',
  distance: 'Расстояние',
  rating: 'Рейтинг',
  window: 'Свободное окно',
  city: 'Город'
};

export const distanceOptions = [1, 3, 5, 10] as const;
export const ratingOptions = [3, 4, 4.5] as const;
export const cities = ['Минск', 'Брест', 'Витебск', 'Гомель', 'Гродно', 'Могилёв'] as const;

export const windowOptions: readonly { value: SearchWindow; label: string; chip: string }[] = [
  { value: 'today', label: 'Сегодня', chip: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра', chip: 'Завтра' },
  { value: 'weekend', label: 'Ближайшие выходные', chip: 'Выходные' }
];

export function distanceLabel(km: number): string {
  return `до ${km}${NBSP}км`;
}

export function ratingLabel(rating: number): string {
  return `от ${formatDecimal(rating, 1)}${NBSP}★`;
}

export function priceLabel(filters: SearchFilters): string | null {
  const { priceFrom, priceTo } = filters;
  if (priceFrom !== null && priceTo !== null) {
    return `${formatDecimal(priceFrom)}–${formatAmount(priceTo)}`;
  }
  if (priceFrom !== null) {
    return `от ${formatAmount(priceFrom)}`;
  }
  return priceTo !== null ? `до ${formatAmount(priceTo)}` : null;
}

export function sectionCleared(filters: SearchFilters, section: FilterSection | null): SearchFilters {
  switch (section) {
    case 'service':
      return { ...filters, serviceId: null };
    case 'price':
      return { ...filters, priceFrom: null, priceTo: null };
    case 'distance':
      return { ...filters, maxDistanceKm: null };
    case 'rating':
      return { ...filters, minRating: null };
    case 'window':
      return { ...filters, window: null };
    case 'city':
      return { ...filters, city: null };
    default:
      return emptyFilters;
  }
}

export function parseAmount(text: string): number | null {
  const normalized = text.replace(',', '.').replace(/\s/g, '');
  if (normalized === '') {
    return null;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.max(0, value) : null;
}
