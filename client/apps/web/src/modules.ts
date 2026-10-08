import type { ModuleEntry } from '@nails/web/core/feature';

export const modules: ModuleEntry[] = [
  { key: 'masters', load: () => import('@nails/web/masters/feature').then((m) => m.manifest) },
  { key: 'help', load: () => import('@nails/web/help/feature').then((m) => m.manifest) }
];
