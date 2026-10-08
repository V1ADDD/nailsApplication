import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

@Injectable({ providedIn: 'root' })
export class IdentityApi {
  private readonly http = inject(HttpClient);

  requestCode(request: Schemas['PhoneCodeRequest']): Promise<Schemas['PhoneCodeResponse']> {
    return firstValueFrom(this.http.post<Schemas['PhoneCodeResponse']>(apiPaths.signInCode, request));
  }
}
