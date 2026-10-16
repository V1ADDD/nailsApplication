import { plural, type WordForms } from '@nails/shared/common/util';

export const masterForms: WordForms = ['мастер', 'мастера', 'мастеров'];
export const serviceForms: WordForms = ['услуга', 'услуги', 'услуг'];
const yearForms: WordForms = ['год', 'года', 'лет'];
export const reviewForms: WordForms = ['отзыв', 'отзыва', 'отзывов'];
export const photoForms: WordForms = ['фото', 'фото', 'фото'];
export const windowForms: WordForms = ['окно', 'окна', 'окон'];
export const otherCategory = 'Другое';
const minuteForms: WordForms = ['минуту', 'минуты', 'минут'];
const hourForms: WordForms = ['час', 'часа', 'часов'];
const minutesPerHour = 60;
const twoHours = 120;

export function experienceLabel(years: number): string {
  return years < 1 ? 'Опыт меньше года' : `Опыт ${plural(years, yearForms)}`;
}

export function replyTimeLabel(minutes: number): string {
  if (minutes < minutesPerHour) {
    return `обычно отвечает за ${plural(Math.max(minutes, 1), minuteForms)}`;
  }
  return minutes < twoHours
    ? 'обычно отвечает за час'
    : `обычно отвечает за ${plural(Math.floor(minutes / minutesPerHour), hourForms)}`;
}
