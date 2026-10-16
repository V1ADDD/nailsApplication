import type { WordForms } from '@nails/shared/common/util';
import type { CancelBookingTexts } from '@nails/web/common/overlays';

export const chatCancelTexts: CancelBookingTexts = {
  heading: 'Отмена записи',
  reasons: ['Изменились планы', 'Заболела', 'Не успеваю', 'Другое'],
  otherReason: 'Другое',
  otherPlaceholder: 'Опишите причину',
  mutualLabel: 'Отмена по договорённости (без последствий)',
  mutualDefault: false,
  warning: 'Отмена без взаимного согласия снижает рейтинг',
  backLabel: 'Назад',
  submitLabel: 'Отменить запись'
};

export const unreadMessageForms: WordForms = [
  'непрочитанное сообщение',
  'непрочитанных сообщения',
  'непрочитанных сообщений'
];
