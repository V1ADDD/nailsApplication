import { NBSP } from './text';

const minutesPerHour = 60;

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / minutesPerHour);
  const rest = minutes % minutesPerHour;
  if (hours === 0) {
    return `${rest}${NBSP}мин`;
  }
  return rest === 0 ? `${hours}${NBSP}ч` : `${hours}${NBSP}ч ${rest}${NBSP}мин`;
}
