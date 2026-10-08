import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  readonly catalog = httpResource<Schemas['CatalogResponse']>(() => apiPaths.catalog);
}
