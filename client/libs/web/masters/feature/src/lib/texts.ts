import { plural, type WordForms } from '@nails/shared/common/util';

export const masterForms: WordForms = ['мастер', 'мастера', 'мастеров'];
export const serviceForms: WordForms = ['услуга', 'услуги', 'услуг'];
const yearForms: WordForms = ['год', 'года', 'лет'];
export const reviewForms: WordForms = ['отзыв', 'отзыва', 'отзывов'];
export const photoForms: WordForms = ['фото', 'фото', 'фото'];
export const windowForms: WordForms = ['окно', 'окна', 'окон'];
export const otherCategory = 'Другое';

export function experienceLabel(years: number): string {
  return years < 1 ? 'Опыт меньше года' : `Опыт ${plural(years, yearForms)}`;
}
