import type { ModuleManifest } from '@nails/web/core/feature';
import { HelpArticlePage } from './help-article-page';
import { HelpPage } from './help-page';

export const manifest: ModuleManifest = {
  key: 'help',
  navigation: [{ label: 'Справка', description: 'Ответы на частые вопросы о сервисе.', path: '/help' }],
  publicRoutes: [
    { path: 'help', component: HelpPage, title: 'Справка' },
    { path: 'help/:articleId', component: HelpArticlePage, title: 'Справка' }
  ],
  routes: []
};
