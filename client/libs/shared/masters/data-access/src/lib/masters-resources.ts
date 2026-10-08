import { httpResource } from '@angular/common/http';
import type { Signal } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { masterPath, mastersPath, myMasterPath } from './masters-paths';

interface MastersQuery {
  category: string;
  service: string;
  city: string;
  page: number;
  pageSize: number;
}

export function mastersResource(query: Signal<MastersQuery>) {
  return httpResource<Schemas['PagedResponseOfMasterSummaryResponse']>(() => {
    const { category, service, city, page, pageSize } = query();
    const params: Record<string, string | number> = { page, pageSize };
    if (category) {
      params['category'] = category;
    }
    if (service) {
      params['service'] = service;
    }
    if (city) {
      params['city'] = city;
    }
    return { url: mastersPath, params };
  });
}

export function masterResource(id: Signal<string | undefined>) {
  return httpResource<Schemas['MasterResponse']>(() => {
    const current = id();
    return current ? masterPath(current) : undefined;
  });
}

export function myMasterResource() {
  return httpResource<Schemas['MasterResponse']>(() => myMasterPath);
}
