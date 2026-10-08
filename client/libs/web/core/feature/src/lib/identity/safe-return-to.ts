export function safeReturnTo(value: string | undefined, fallback = '/'): string {
  return value?.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : fallback;
}
