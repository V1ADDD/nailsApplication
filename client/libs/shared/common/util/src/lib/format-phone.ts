import { NBSP } from './nbsp';

const normalizedPhone = /^\+375\d{9}$/;

export function formatPhone(phone: string): string {
  if (!normalizedPhone.test(phone)) {
    return phone;
  }
  const code = phone.slice(4, 6);
  const first = phone.slice(6, 9);
  const second = phone.slice(9, 11);
  const third = phone.slice(11, 13);
  return `+375${NBSP}(${code})${NBSP}${first}-${second}-${third}`;
}
