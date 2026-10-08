import type { ModuleManifest } from '@nails/web/core/feature';

const loadHelpPage = () => import('./help-page').then((m) => m.HelpPage);

export const manifest: ModuleManifest = {
  key: 'help',
  accountLink: { label: 'Справка', icon: 'info', path: '/help' },
  publicRoutes: [
    { path: 'help', loadComponent: loadHelpPage, title: 'Справка' },
    { path: 'help/:articleId', loadComponent: loadHelpPage, title: 'Справка' }
  ],
  routes: []
};
