import { appLocale } from './app-locale';
import { NBSP } from './text';

const appTimeZone = 'Europe/Minsk';

type DateInput = string | Date;

const dayMs = 86_400_000;
const keyParts = new Intl.DateTimeFormat(appLocale, {
  timeZone: appTimeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const weekdayFormat = new Intl.DateTimeFormat(appLocale, { timeZone: appTimeZone, weekday: 'short' });
const dayMonthFormat = new Intl.DateTimeFormat(appLocale, { timeZone: appTimeZone, day: 'numeric', month: 'short' });
const dayLongMonthFormat = new Intl.DateTimeFormat(appLocale, { timeZone: appTimeZone, day: 'numeric', month: 'long' });
const yearFormat = new Intl.DateTimeFormat(appLocale, { timeZone: appTimeZone, year: 'numeric' });
const weekDays = 7;
const longFormat = new Intl.DateTimeFormat(appLocale, {
  timeZone: appTimeZone,
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const timeFormat = new Intl.DateTimeFormat(appLocale, {
  timeZone: appTimeZone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

function toDate(value: DateInput): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((item) => item.type === type)?.value ?? '';
}

export function minskDateKey(value: DateInput): string {
  const parts = keyParts.formatToParts(toDate(value));
  return `${part(parts, 'year')}-${part(parts, 'month')}-${part(parts, 'day')}`;
}

function daysBefore(value: DateInput, now: Date): number {
  return Math.round((Date.parse(minskDateKey(now)) - Date.parse(minskDateKey(value))) / dayMs);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function relativeDay(value: DateInput, now: Date): 'Сегодня' | 'Завтра' | null {
  const key = minskDateKey(value);
  if (key === minskDateKey(now)) {
    return 'Сегодня';
  }
  return key === minskDateKey(new Date(now.getTime() + dayMs)) ? 'Завтра' : null;
}

function weekday(value: DateInput): string {
  return weekdayFormat.format(toDate(value)).replace('.', '');
}

export function formatShortDate(value: DateInput): string {
  const parts = dayMonthFormat.formatToParts(toDate(value));
  return `${part(parts, 'day')}${NBSP}${part(parts, 'month').replace('.', '')}`;
}

export function formatLongDate(value: DateInput): string {
  const parts = longFormat.formatToParts(toDate(value));
  return `${part(parts, 'day')}${NBSP}${part(parts, 'month')} ${part(parts, 'year')}`;
}

export function formatTime(value: DateInput): string {
  return timeFormat.format(toDate(value));
}

export function formatDateTime(value: DateInput): string {
  return `${formatShortDate(value)}${NBSP}· ${formatTime(value)}`;
}

export function formatDayChip(value: DateInput, now: Date): string {
  return relativeDay(value, now) ?? weekday(value);
}

export function formatDayHeading(value: DateInput, now: Date): string {
  return relativeDay(value, now) ?? `${weekday(value)}, ${formatShortDate(value)}`;
}

export function formatChatTime(value: DateInput, now: Date): string {
  const days = daysBefore(value, now);
  if (days <= 0) {
    return formatTime(value);
  }
  if (days === 1) {
    return 'Вчера';
  }
  return days < weekDays ? capitalize(weekday(value)) : formatShortDate(value);
}

export function formatDayPill(value: DateInput, now: Date): string {
  const days = daysBefore(value, now);
  if (days === 0) {
    return 'Сегодня';
  }
  if (days === 1) {
    return 'Вчера';
  }
  const parts = dayLongMonthFormat.formatToParts(toDate(value));
  const day = `${part(parts, 'day')}${NBSP}${part(parts, 'month')}`;
  const year = yearFormat.format(toDate(value));
  return year === yearFormat.format(now) ? day : `${day} ${year}`;
}

export function formatDateTimeWithYear(value: DateInput): string {
  return `${formatShortDate(value)} ${yearFormat.format(toDate(value))}${NBSP}· ${formatTime(value)}`;
}
