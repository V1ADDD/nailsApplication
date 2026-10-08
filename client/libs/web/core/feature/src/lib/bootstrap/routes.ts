import type { Routes } from '@angular/router';
import { ConfirmEmailPage } from '../identity/confirm-email-page';
import { ForgotPasswordPage } from '../identity/forgot-password-page';
import { RegisterPage } from '../identity/register-page';
import { requireSession } from '../identity/require-session';
import { ResetPasswordPage } from '../identity/reset-password-page';
import { SignInPage } from '../identity/sign-in-page';
import { UnavailablePage } from '../identity/unavailable-page';
import { AppLayout } from '../layout/app-layout';
import { NotFoundPage } from '../layout/not-found-page';
import { StartupFailedPage } from '../layout/startup-failed-page';
import type { ModuleManifest } from '../modules/module-manifest';
import { navigationItems } from '../modules/navigation';
import { appPaths } from './app-paths';

export function buildRoutes(manifests: readonly ModuleManifest[]): Routes {
  return [
    { path: appPaths.signIn, component: SignInPage, title: 'Вход' },
    { path: appPaths.register, component: RegisterPage, title: 'Регистрация' },
    { path: appPaths.confirmEmail, component: ConfirmEmailPage, title: 'Подтверждение адреса' },
    { path: appPaths.forgotPassword, component: ForgotPasswordPage, title: 'Восстановление пароля' },
    { path: appPaths.resetPassword, component: ResetPasswordPage, title: 'Новый пароль' },
    { path: appPaths.unavailable, component: UnavailablePage, title: 'Нет связи' },
    {
      path: appPaths.home,
      component: AppLayout,
      providers: [{ provide: navigationItems, useValue: manifests.flatMap((manifest) => manifest.navigation) }],
      children: [
        {
          path: '',
          pathMatch: 'full',
          loadComponent: () => import('../home/home-page').then((m) => m.HomePage),
          title: 'Мастера рядом'
        },
        ...manifests.flatMap((manifest) => manifest.publicRoutes),
        {
          path: '',
          canActivateChild: [requireSession],
          children: manifests.flatMap((manifest) => manifest.routes)
        },
        { path: '**', component: NotFoundPage, title: 'Страница не найдена' }
      ]
    }
  ];
}

export const startupFailedRoutes: Routes = [{ path: '**', component: StartupFailedPage }];
