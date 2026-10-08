import { appLocale } from './app-locale';
import { NBSP } from './nbsp';

export interface PriceValue {
  kind: 'exact' | 'from' | 'free';
  amount: number;
}

const rouble = 'р';
const wholeAmount = new Intl.NumberFormat(appLocale, { maximumFractionDigits: 0 });
const fractionalAmount = new Intl.NumberFormat(appLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatAmount(amount: number): string {
  const formatter = Number.isInteger(amount) ? wholeAmount : fractionalAmount;
  return `${formatter.format(amount)}${NBSP}${rouble}`;
}

export function formatPrice(price: PriceValue): string {
  switch (price.kind) {
    case 'free':
      return 'Бесплатно';
    case 'from':
      return `от${NBSP}${formatAmount(price.amount)}`;
    case 'exact':
      return formatAmount(price.amount);
  }
}
