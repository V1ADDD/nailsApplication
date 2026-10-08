import { formatDecimal } from './number';
import { NBSP } from './text';

export interface Price {
  kind: 'exact' | 'from' | 'free';
  amount: number | null;
}

export function formatAmount(amount: number): string {
  return `${formatDecimal(amount)}${NBSP}р`;
}

export function formatPrice(price: Price, short = false): string {
  if (price.kind === 'free') {
    return short ? formatAmount(0) : 'Бесплатно';
  }
  const amount = formatAmount(price.amount ?? 0);
  return price.kind === 'from' ? `от${NBSP}${amount}` : amount;
}
