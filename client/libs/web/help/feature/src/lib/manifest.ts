import type { ModuleManifest } from '@starter/web/core/feature';
import { HelpArticlePage } from './help-article-page';
import { HelpPage } from './help-page';

export const manifest: ModuleManifest = {
  key: 'help',
  navigation: [{ label: 'Help', path: '/help' }],
  publicRoutes: [
    { path: 'help', component: HelpPage, title: 'Help' },
    { path: 'help/:articleId', component: HelpArticlePage, title: 'Help' }
  ],
  routes: []
};
