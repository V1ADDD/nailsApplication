import { appLocale } from './app-locale';

const formatters = new Map<number, Intl.NumberFormat>();

export function formatDecimal(value: number, maxFractionDigits = 2): string {
  let formatter = formatters.get(maxFractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat(appLocale, { maximumFractionDigits: maxFractionDigits });
    formatters.set(maxFractionDigits, formatter);
  }
  return formatter.format(value);
}
