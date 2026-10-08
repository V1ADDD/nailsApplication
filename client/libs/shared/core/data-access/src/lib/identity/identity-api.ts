import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

@Injectable({ providedIn: 'root' })
export class IdentityApi {
  private readonly http = inject(HttpClient);

  register(request: Schemas['RegisterRequest']): Promise<Schemas['RegisterResponse']> {
    return firstValueFrom(this.http.post<Schemas['RegisterResponse']>(apiPaths.register, request));
  }

  async confirmEmail(request: Schemas['ConfirmEmailRequest']): Promise<void> {
    await firstValueFrom(this.http.post<unknown>(apiPaths.confirmEmail, request));
  }

  async resendConfirmation(request: Schemas['EmailRequest']): Promise<void> {
    await firstValueFrom(this.http.post<unknown>(apiPaths.resendConfirmation, request));
  }

  async forgotPassword(request: Schemas['EmailRequest']): Promise<void> {
    await firstValueFrom(this.http.post<unknown>(apiPaths.forgotPassword, request));
  }

  async resetPassword(request: Schemas['ResetPasswordRequest']): Promise<void> {
    await firstValueFrom(this.http.post<unknown>(apiPaths.resetPassword, request));
  }
}
