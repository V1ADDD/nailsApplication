import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

@Injectable({ providedIn: 'root' })
export class EnabledModules {
  private readonly http = inject(HttpClient);

  async load(): Promise<string[]> {
    const response = await firstValueFrom(this.http.get<Schemas['ModulesResponse']>(apiPaths.modules));
    return response.enabled;
  }
}
