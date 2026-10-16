import type { Routes } from '@angular/router';
import { requireSession } from '../identity/require-session';
import { UnavailablePage } from '../identity/unavailable-page';
import { AppLayout } from '../layout/app-layout';
import { NotFoundPage } from '../layout/not-found-page';
import { StartupFailedPage } from '../layout/startup-failed-page';
import { buildFrameSlots, frameSlots } from '../modules/frame';
import type { ModuleManifest } from '../modules/module-manifest';
import { clientSectionRedirect } from '../profile/client-section-redirect';
import { profilePaths } from '../profile/profile-paths';
import { buildProfileSlots, profileSlots } from '../profile/profile-slots';
import { requireMasterSide } from '../profile/require-master-side';
import { appPaths } from './app-paths';

function profileRoutes(manifests: readonly ModuleManifest[]): Routes {
  const slots = buildProfileSlots(manifests);

  return [
    {
      path: appPaths.profile,
      loadComponent: () => import('../profile/profile-shell').then((m) => m.ProfileShell),
      providers: [{ provide: profileSlots, useValue: slots }],
      children: [
        { path: '', pathMatch: 'full', redirectTo: profilePaths.client },
        {
          path: profilePaths.client,
          loadComponent: () => import('../profile/client-account').then((m) => m.ClientAccount),
          children: [
            { path: '', pathMatch: 'full', redirectTo: clientSectionRedirect },
            ...slots.clientSections.map((section) => ({
              path: section.path,
              loadComponent: section.loadComponent,
              title: section.title
            })),
            {
              path: profilePaths.settings,
              loadComponent: () => import('../profile/settings/settings-panel').then((m) => m.SettingsPanel),
              title: 'Настройки'
            },
            { path: '**', redirectTo: clientSectionRedirect }
          ]
        },
        { path: profilePaths.master, canActivate: [requireMasterSide], children: slots.masterRoutes }
      ]
    }
  ];
}

export function buildRoutes(manifests: readonly ModuleManifest[]): Routes {
  return [
    { path: appPaths.unavailable, component: UnavailablePage, title: 'Нет связи' },
    {
      path: appPaths.home,
      component: AppLayout,
      providers: [{ provide: frameSlots, useValue: buildFrameSlots(manifests) }],
      children: [
        ...manifests.flatMap((manifest) => manifest.publicRoutes),
        { path: '', pathMatch: 'full', redirectTo: appPaths.profile },
        {
          path: appPaths.signIn,
          loadComponent: () => import('../identity/sign-in-page').then((m) => m.SignInPage),
          title: 'Вход'
        },
        {
          path: '',
          canActivateChild: [requireSession],
          children: [...profileRoutes(manifests), ...manifests.flatMap((manifest) => manifest.routes)]
        },
        { path: '**', component: NotFoundPage, title: 'Страница не найдена' }
      ]
    }
  ];
}

export const startupFailedRoutes: Routes = [{ path: '**', component: StartupFailedPage }];
