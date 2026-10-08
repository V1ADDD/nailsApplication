import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

type Category = Schemas['CategoryResponse'];

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly resource = httpResource<Category[]>(() => apiPaths.catalog, { defaultValue: [] });

  readonly categories = this.resource.value.asReadonly();

  private readonly names = computed(() => {
    const names = new Map<string, string>();
    for (const category of this.categories()) {
      names.set(category.id, category.name);
      for (const sub of category.subcategories) {
        names.set(sub.id, sub.name);
      }
    }
    return names;
  });

  nameOf(id: string): string | null {
    return this.names().get(id) ?? null;
  }

  categoryOf(serviceId: string): Category | null {
    return (
      this.categories().find(
        (category) => category.id === serviceId || category.subcategories.some((sub) => sub.id === serviceId)
      ) ?? null
    );
  }
}
