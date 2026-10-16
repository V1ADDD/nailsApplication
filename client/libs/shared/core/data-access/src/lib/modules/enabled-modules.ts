import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

@Injectable({ providedIn: 'root' })
export class EnabledModules {
  private readonly http = inject(HttpClient);
  private readonly keys = signal<readonly string[]>([]);

  readonly enabled = this.keys.asReadonly();

  async load(): Promise<string[]> {
    const response = await firstValueFrom(this.http.get<Schemas['ModulesResponse']>(apiPaths.modules));
    this.keys.set(response.enabled);
    return response.enabled;
  }
}
