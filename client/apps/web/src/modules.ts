import type { ModuleEntry } from '@starter/web/core/feature';

export const modules: ModuleEntry[] = [
  { key: 'help', load: () => import('@starter/web/help/feature').then((m) => m.manifest) },
  { key: 'notes', load: () => import('@starter/web/notes/feature').then((m) => m.manifest) }
];
