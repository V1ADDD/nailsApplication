import { formatShortDate, formatTime } from '@nails/shared/common/util';
import type { Schemas } from '@nails/shared/core/data-access';

type Booking = Schemas['BookingResponse'];

type TagTone = 'warning' | 'success' | 'danger' | 'muted';

export interface BookingTag {
  readonly label: string;
  readonly tone: TagTone;
}

function pendingTag(booking: Booking, upcoming: boolean): BookingTag {
  if (!upcoming) {
    return { label: 'Не подтверждена', tone: 'muted' };
  }
  return booking.createdBy === 'master'
    ? { label: 'Ждёт вашего подтверждения', tone: 'warning' }
    : { label: 'Ожидает подтверждения', tone: 'warning' };
}

export function bookingTag(booking: Booking, upcoming: boolean): BookingTag {
  switch (booking.status) {
    case 'pending':
      return pendingTag(booking, upcoming);
    case 'confirmed':
      return upcoming ? { label: 'Подтверждено', tone: 'success' } : { label: 'Прошла', tone: 'muted' };
    case 'completed':
      return { label: 'Завершено', tone: 'success' };
    case 'noShow':
      return { label: 'Неявка', tone: 'danger' };
    case 'cancelled':
      return { label: 'Отменено', tone: 'danger' };
  }
}

export function bookingLine(booking: Booking, upcoming: boolean): string | null {
  if (booking.status === 'pending' && upcoming && booking.releaseAt) {
    const deadline = `${formatShortDate(booking.releaseAt)}, ${formatTime(booking.releaseAt)}`;
    return booking.createdBy === 'master' ? `Подтвердите до ${deadline}` : `Мастер подтвердит до ${deadline}`;
  }
  if (booking.status === 'cancelled') {
    const who = booking.cancelledBy === 'master' ? 'Мастер отменил' : 'Вы отменили';
    const mutual = booking.cancelMutual ? ' по договорённости' : '';
    const reason = booking.cancelReason ? `. Причина: ${booking.cancelReason}` : '';
    return `${who}${mutual}${reason}`;
  }
  return null;
}

export function mustConfirm(booking: Booking, upcoming: boolean): boolean {
  return upcoming && booking.status === 'pending' && booking.createdBy === 'master';
}
