import { NBSP } from './text';

const rules = new Intl.PluralRules('ru');

export type WordForms = readonly [one: string, few: string, many: string];

export function plural(count: number, forms: WordForms): string {
  const rule = rules.select(count);
  const word = rule === 'one' ? forms[0] : rule === 'few' ? forms[1] : forms[2];
  return `${count}${NBSP}${word}`;
}
