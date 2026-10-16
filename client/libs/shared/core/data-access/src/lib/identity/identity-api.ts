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

  updateProfile(request: Schemas['UpdateProfileRequest']): Promise<Schemas['MeResponse']> {
    return firstValueFrom(this.http.patch<Schemas['MeResponse']>(apiPaths.me, request));
  }

  requestPhoneCode(request: Schemas['PhoneChangeCodeRequest']): Promise<Schemas['PhoneCodeResponse']> {
    return firstValueFrom(this.http.post<Schemas['PhoneCodeResponse']>(apiPaths.phoneCode, request));
  }

  changePhone(request: Schemas['PhoneChangeRequest']): Promise<Schemas['MeResponse']> {
    return firstValueFrom(this.http.post<Schemas['MeResponse']>(apiPaths.phone, request));
  }

  async signOutOthers(): Promise<void> {
    await firstValueFrom(this.http.post<unknown>(apiPaths.signOutOthers, null));
  }
}
