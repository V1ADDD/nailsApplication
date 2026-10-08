import { formatDecimal } from './number';
import { NBSP } from './text';

const metresStep = 50;
const metresPerKm = 1000;
const preciseKmLimit = 10;

export function formatDistance(km: number): string {
  if (km < 1) {
    const metres = Math.max(metresStep, Math.round((km * metresPerKm) / metresStep) * metresStep);
    return `${metres}${NBSP}м`;
  }
  const value =
    km < preciseKmLimit
      ? formatDecimal(Math.round(km * preciseKmLimit) / preciseKmLimit, 1)
      : formatDecimal(Math.round(km), 0);
  return `${value}${NBSP}км`;
}
