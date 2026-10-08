const countryCode = '+375';
const localDigits = 9;

export function formatPhoneInput(digits: string): string {
  const local = digits.replace(/\D/g, '').slice(0, localDigits);
  const operator = local.slice(0, 2);
  const parts = [local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter((part) => part.length > 0);
  if (local.length <= 2) {
    return local.length === 0 ? '' : `(${operator}`;
  }
  return `(${operator}) ${parts.join('-')}`;
}

export function formatPhone(phone: string): string {
  return phone.startsWith(countryCode) ? `${countryCode} ${formatPhoneInput(phone.slice(countryCode.length))}` : phone;
}
