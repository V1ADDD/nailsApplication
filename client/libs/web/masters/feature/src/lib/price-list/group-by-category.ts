import type { Schemas } from '@nails/shared/core/data-access';

export interface OfferGroup {
  categoryId: string;
  categoryName: string;
  offers: Schemas['OfferResponse'][];
}

export function groupByCategory(offers: readonly Schemas['OfferResponse'][]): OfferGroup[] {
  const groups: OfferGroup[] = [];
  for (const offer of offers) {
    const last = groups.at(-1);
    if (last?.categoryId === offer.categoryId) {
      last.offers.push(offer);
    } else {
      groups.push({ categoryId: offer.categoryId, categoryName: offer.categoryName, offers: [offer] });
    }
  }
  return groups;
}
