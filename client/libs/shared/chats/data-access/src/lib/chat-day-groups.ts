import { formatDayPill, minskDateKey } from '@nails/shared/common/util';

export interface DayGroup<T> {
  key: string;
  label: string;
  messages: T[];
}

export function groupByDay<T extends { sentAt: string }>(messages: readonly T[], now: Date): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const message of messages) {
    const key = minskDateKey(message.sentAt);
    const last = groups.at(-1);
    if (last?.key === key) {
      last.messages.push(message);
    } else {
      groups.push({ key, label: formatDayPill(message.sentAt, now), messages: [message] });
    }
  }
  return groups;
}
