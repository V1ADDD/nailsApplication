import type { Schemas } from '@nails/shared/core/data-access';

export type ConflictCheck =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'failed' }
  | { state: 'done'; result: Schemas['ConflictsResponse'] };
