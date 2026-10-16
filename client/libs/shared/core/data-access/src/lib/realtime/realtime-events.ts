import type { Schemas } from '../api/api-types';

export interface RealtimeEventMap {
  messageCreated: Schemas['MessageCreatedEvent'];
  messageUpdated: Schemas['MessageUpdatedEvent'];
  chatRead: Schemas['ChatReadEvent'];
  chatChanged: Schemas['ChatChangedEvent'];
  bookingChanged: Schemas['BookingChangedEvent'];
  unreadChanged: Schemas['UnreadChangedEvent'];
  modeChanged: Schemas['ModeChangedEvent'];
}

export type RealtimeEventName = keyof RealtimeEventMap;
