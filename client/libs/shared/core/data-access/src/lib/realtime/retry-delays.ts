import type { IRetryPolicy } from '@microsoft/signalr';

const delaysMs: readonly number[] = [0, 2000, 5000, 10000, 30000];
const longestDelayMs = 30000;

export function retryDelay(attempt: number): number {
  return delaysMs[attempt] ?? longestDelayMs;
}

export const retryForever: IRetryPolicy = {
  nextRetryDelayInMilliseconds: (context) => retryDelay(context.previousRetryCount)
};
