import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupportApi {
  private readonly http = inject(HttpClient);

  createTicket(request: Schemas['CreateSupportTicketRequest']): Promise<Schemas['CreateSupportTicketResponse']> {
    return firstValueFrom(this.http.post<Schemas['CreateSupportTicketResponse']>('/api/support/tickets', request));
  }
}
