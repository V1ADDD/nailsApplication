import { NBSP } from './nbsp';

interface PluralForms {
  one: string;
  few: string;
  many: string;
}

const rules = new Intl.PluralRules('ru');

export function plural(count: number, forms: PluralForms): string {
  const category = rules.select(count);
  const word = category === 'one' ? forms.one : category === 'few' ? forms.few : forms.many;
  return `${count}${NBSP}${word}`;
}
