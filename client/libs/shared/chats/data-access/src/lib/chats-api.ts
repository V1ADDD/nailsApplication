import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { firstValueFrom } from 'rxjs';

export type ChatRole = NonNullable<Schemas['ChatRole']>;

const chatsPaths = {
  chats: '/api/chats',
  unread: '/api/chats/unread',
  chat: (id: string) => `/api/chats/${id}`,
  read: (id: string) => `/api/chats/${id}/read`,
  block: (id: string) => `/api/chats/${id}/block`,
  messages: (id: string) => `/api/chats/${id}/messages`,
  message: (id: string) => `/api/chats/messages/${id}`,
  confirmBooking: (id: string) => `/api/masters/bookings/${id}/confirm`,
  cancelBooking: (id: string) => `/api/masters/bookings/${id}/cancel`
} as const;

function roleParams(role: ChatRole, extra: Record<string, string | number> = {}): HttpParams {
  return new HttpParams({ fromObject: { role, ...extra } });
}

@Injectable({ providedIn: 'root' })
export class ChatsApi {
  private readonly http = inject(HttpClient);

  start(request: Schemas['StartChatRequest']): Promise<Schemas['StartChatResponse']> {
    return firstValueFrom(this.http.post<Schemas['StartChatResponse']>(chatsPaths.chats, request));
  }

  list(role: ChatRole): Promise<Schemas['ChatSummaryResponse'][]> {
    return firstValueFrom(
      this.http.get<Schemas['ChatSummaryResponse'][]>(chatsPaths.chats, { params: roleParams(role) })
    );
  }

  unread(role: ChatRole): Promise<Schemas['UnreadResponse']> {
    return firstValueFrom(this.http.get<Schemas['UnreadResponse']>(chatsPaths.unread, { params: roleParams(role) }));
  }

  thread(id: string, role: ChatRole): Promise<Schemas['ChatThreadResponse']> {
    return firstValueFrom(
      this.http.get<Schemas['ChatThreadResponse']>(chatsPaths.chat(id), { params: roleParams(role) })
    );
  }

  older(id: string, role: ChatRole, before: string): Promise<Schemas['MessagesPageResponse']> {
    return firstValueFrom(
      this.http.get<Schemas['MessagesPageResponse']>(chatsPaths.messages(id), { params: roleParams(role, { before }) })
    );
  }

  send(id: string, role: ChatRole, request: Schemas['SendMessageRequest']): Promise<Schemas['MessageResponse']> {
    return firstValueFrom(
      this.http.post<Schemas['MessageResponse']>(chatsPaths.messages(id), request, { params: roleParams(role) })
    );
  }

  edit(messageId: string, request: Schemas['EditMessageRequest']): Promise<Schemas['MessageResponse']> {
    return firstValueFrom(this.http.patch<Schemas['MessageResponse']>(chatsPaths.message(messageId), request));
  }

  remove(messageId: string): Promise<Schemas['MessageResponse']> {
    return firstValueFrom(this.http.delete<Schemas['MessageResponse']>(chatsPaths.message(messageId)));
  }

  read(id: string, role: ChatRole): Promise<Schemas['ReadResponse']> {
    return firstValueFrom(
      this.http.post<Schemas['ReadResponse']>(chatsPaths.read(id), null, { params: roleParams(role) })
    );
  }

  block(id: string, role: ChatRole): Promise<Schemas['ChatResponse']> {
    return firstValueFrom(
      this.http.post<Schemas['ChatResponse']>(chatsPaths.block(id), null, { params: roleParams(role) })
    );
  }

  unblock(id: string, role: ChatRole): Promise<Schemas['ChatResponse']> {
    return firstValueFrom(
      this.http.delete<Schemas['ChatResponse']>(chatsPaths.block(id), { params: roleParams(role) })
    );
  }

  clear(id: string, role: ChatRole): Promise<unknown> {
    return firstValueFrom(this.http.delete(chatsPaths.chat(id), { params: roleParams(role) }));
  }

  confirmBooking(id: string): Promise<Schemas['BookingResponse']> {
    return firstValueFrom(this.http.post<Schemas['BookingResponse']>(chatsPaths.confirmBooking(id), null));
  }

  cancelBooking(id: string, request: Schemas['CancelBookingRequest']): Promise<Schemas['BookingResponse']> {
    return firstValueFrom(this.http.post<Schemas['BookingResponse']>(chatsPaths.cancelBooking(id), request));
  }
}
