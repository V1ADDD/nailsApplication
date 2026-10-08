import type { ModuleManifest } from '@nails/web/core/feature';

export const manifest: ModuleManifest = {
  key: 'masters',
  frameItem: { label: 'Карта', icon: 'map', path: '/', order: 10, exact: true },
  publicRoutes: [
    {
      path: '',
      pathMatch: 'full',
      loadComponent: () => import('./map-page').then((m) => m.MapPage),
      title: 'Мастера рядом — карта бьюти-мастеров'
    }
  ],
  routes: []
};
