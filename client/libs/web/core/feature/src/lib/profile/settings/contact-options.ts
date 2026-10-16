import type { Schemas } from '@nails/shared/core/data-access';

export interface ContactOption {
  readonly value: Schemas['PreferredContact'];
  readonly label: string;
  readonly hint: string;
}

export const contactOptions: readonly ContactOption[] = [
  { value: 'messages', label: 'Сообщения в чате', hint: 'Мастер напишет вам в чат на сайте' },
  { value: 'phone', label: 'Телефонный звонок', hint: 'Мастер позвонит по вашему номеру' }
];
