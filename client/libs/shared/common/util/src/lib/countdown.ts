const secondsPerMinute = 60;

export function formatCountdown(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(whole / secondsPerMinute);
  const rest = whole % secondsPerMinute;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}
