import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';

@Injectable({ providedIn: 'root' })
export class HelpContentStore {
  readonly content = httpResource<Schemas['HelpContentResponse']>(() => '/api/help/content');
}
