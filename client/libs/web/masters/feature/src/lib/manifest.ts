import type { ModuleManifest } from '@nails/web/core/feature';
import { MasterCabinetPage } from './cabinet/master-cabinet-page';
import { MasterPage } from './master/master-page';
import { MastersPage } from './search/masters-page';

export const manifest: ModuleManifest = {
  key: 'masters',
  navigation: [
    { label: 'Мастера', description: 'Найдите мастера и сравните точные цены на услуги.', path: '/masters' },
    {
      label: 'Кабинет мастера',
      description: 'Расскажите о себе и составьте прайс, чтобы клиенты нашли вас.',
      path: '/master'
    }
  ],
  publicRoutes: [
    { path: 'masters', component: MastersPage, title: 'Мастера' },
    { path: 'masters/:id', component: MasterPage, title: 'Мастер' }
  ],
  routes: [{ path: 'master', component: MasterCabinetPage, title: 'Кабинет мастера' }]
};
