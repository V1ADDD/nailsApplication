import type { ModuleManifest } from '@nails/web/core/feature';
import { MasterAction } from './account/master-action';

export const manifest: ModuleManifest = {
  key: 'masters',
  frameItem: { label: 'Карта', icon: 'map', path: '/', order: 10, exact: true },
  profile: {
    clientSections: [
      {
        path: 'bookings',
        label: 'Записи',
        title: 'Мои записи',
        icon: 'calendar',
        order: 10,
        loadComponent: () => import('./account/bookings-panel').then((m) => m.BookingsPanel)
      },
      {
        path: 'favorites',
        label: 'Избранное',
        title: 'Избранное',
        icon: 'heart',
        order: 20,
        loadComponent: () => import('./account/favorites-panel').then((m) => m.FavoritesPanel)
      },
      {
        path: 'reviews',
        label: 'Отзывы',
        title: 'Отзывы',
        icon: 'star',
        order: 30,
        loadComponent: () => import('./account/reviews-panel').then((m) => m.ReviewsPanel)
      }
    ],
    masterRoutes: [
      {
        path: '',
        loadComponent: () => import('./account/master-side-placeholder').then((m) => m.MasterSidePlaceholder),
        title: 'Кабинет мастера'
      }
    ],
    settingsActions: [MasterAction]
  },
  publicRoutes: [
    {
      path: '',
      pathMatch: 'full',
      loadComponent: () => import('./map-page').then((m) => m.MapPage),
      title: 'Мастера рядом — карта бьюти-мастеров'
    },
    {
      path: 'masters/:id',
      loadComponent: () => import('./profile/profile-page').then((m) => m.ProfilePage),
      title: 'Профиль мастера'
    }
  ],
  routes: []
};
