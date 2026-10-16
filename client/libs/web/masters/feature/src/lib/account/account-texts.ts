import type { Schemas } from '@nails/shared/core/data-access';
import { formatShortDate, formatTime } from '@nails/shared/common/util';
import type { BookingSummary, CancelBookingTexts } from '@nails/web/common/overlays';

export const profileCancelTexts: Omit<CancelBookingTexts, 'summary'> = {
  heading: 'Отмена записи',
  reasons: ['Изменились планы', 'Плохое самочувствие', 'Не успеваю к этому времени', 'Другое'],
  otherReason: 'Другое',
  otherPlaceholder: 'Опишите причину',
  mutualLabel: 'По договорённости с мастером (без последствий)',
  mutualDefault: false,
  warning: 'Односторонняя отмена снижает рейтинг',
  backLabel: 'Назад',
  submitLabel: 'Отменить запись'
};

export function bookingSummary(booking: Schemas['BookingResponse'], withTime = true): BookingSummary {
  const date = formatShortDate(booking.start);
  return {
    name: booking.masterName,
    details: withTime
      ? `${booking.serviceName} · ${date} · ${formatTime(booking.start)}`
      : `${booking.serviceName} · ${date}`
  };
}

export function dayTime(value: string): string {
  return `${formatShortDate(value)}, ${formatTime(value)}`;
}
