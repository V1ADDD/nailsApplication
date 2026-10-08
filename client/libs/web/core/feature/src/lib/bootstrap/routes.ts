import type { Routes } from '@angular/router';
import { requireSession } from '../identity/require-session';
import { UnavailablePage } from '../identity/unavailable-page';
import { AppLayout } from '../layout/app-layout';
import { NotFoundPage } from '../layout/not-found-page';
import { StartupFailedPage } from '../layout/startup-failed-page';
import { buildFrameSlots, frameSlots } from '../modules/frame';
import type { ModuleManifest } from '../modules/module-manifest';
import { appPaths } from './app-paths';

export function buildRoutes(manifests: readonly ModuleManifest[]): Routes {
  return [
    { path: appPaths.unavailable, component: UnavailablePage, title: 'Нет связи' },
    {
      path: appPaths.home,
      component: AppLayout,
      providers: [{ provide: frameSlots, useValue: buildFrameSlots(manifests) }],
      children: [
        {
          path: '',
          pathMatch: 'full',
          loadComponent: () => import('../home/home-page').then((m) => m.HomePage),
          title: 'Мастера рядом — бьюти-мастера Беларуси'
        },
        {
          path: appPaths.signIn,
          loadComponent: () => import('../identity/sign-in-page').then((m) => m.SignInPage),
          title: 'Вход'
        },
        ...manifests.flatMap((manifest) => manifest.publicRoutes),
        {
          path: '',
          canActivateChild: [requireSession],
          children: [
            {
              path: appPaths.profile,
              loadComponent: () => import('../account/account-page').then((m) => m.AccountPage),
              title: 'Профиль'
            },
            ...manifests.flatMap((manifest) => manifest.routes)
          ]
        },
        { path: '**', component: NotFoundPage, title: 'Страница не найдена' }
      ]
    }
  ];
}

export const startupFailedRoutes: Routes = [{ path: '**', component: StartupFailedPage }];
