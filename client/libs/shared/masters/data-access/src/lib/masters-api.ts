import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { firstValueFrom } from 'rxjs';
import { myMasterPath, myOfferPath, myOffersPath } from './masters-paths';

@Injectable({ providedIn: 'root' })
export class MastersApi {
  private readonly http = inject(HttpClient);

  createProfile(request: Schemas['MasterProfileRequest']): Promise<Schemas['MasterResponse']> {
    return firstValueFrom(this.http.post<Schemas['MasterResponse']>(myMasterPath, request));
  }

  updateProfile(request: Schemas['UpdateMasterProfileRequest']): Promise<Schemas['MasterResponse']> {
    return firstValueFrom(this.http.put<Schemas['MasterResponse']>(myMasterPath, request));
  }

  addOffer(request: Schemas['OfferRequest']): Promise<Schemas['OfferResponse']> {
    return firstValueFrom(this.http.post<Schemas['OfferResponse']>(myOffersPath, request));
  }

  updateOffer(id: string, request: Schemas['OfferRequest']): Promise<Schemas['OfferResponse']> {
    return firstValueFrom(this.http.put<Schemas['OfferResponse']>(myOfferPath(id), request));
  }

  async deleteOffer(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<unknown>(myOfferPath(id)));
  }
}
