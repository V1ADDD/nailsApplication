import { NBSP } from './nbsp';

const minutesInHour = 60;

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / minutesInHour);
  const rest = minutes % minutesInHour;
  const parts = [hours > 0 ? `${hours}${NBSP}ч` : '', rest > 0 ? `${rest}${NBSP}мин` : ''];
  return parts.filter((part) => part !== '').join(NBSP);
}
