import type { ModuleEntry } from '@nails/web/core/feature';

export const modules: ModuleEntry[] = [
  { key: 'help', load: () => import('@nails/web/help/feature').then((m) => m.manifest) }
];
