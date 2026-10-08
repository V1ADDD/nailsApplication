import type { Routes } from '@angular/router';
import { HomePage } from '../home/home-page';
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
    { path: appPaths.signIn, component: SignInPage, title: 'Sign in' },
    { path: appPaths.register, component: RegisterPage, title: 'Create account' },
    { path: appPaths.confirmEmail, component: ConfirmEmailPage, title: 'Confirm email' },
    { path: appPaths.forgotPassword, component: ForgotPasswordPage, title: 'Forgot password' },
    { path: appPaths.resetPassword, component: ResetPasswordPage, title: 'Choose a new password' },
    { path: appPaths.unavailable, component: UnavailablePage, title: 'Unavailable' },
    {
      path: appPaths.home,
      component: AppLayout,
      providers: [{ provide: navigationItems, useValue: manifests.flatMap((manifest) => manifest.navigation) }],
      children: [
        ...manifests.flatMap((manifest) => manifest.publicRoutes),
        {
          path: '',
          canActivateChild: [requireSession],
          children: [
            { path: '', pathMatch: 'full', component: HomePage, title: 'Home' },
            ...manifests.flatMap((manifest) => manifest.routes)
          ]
        },
        { path: '**', component: NotFoundPage, title: 'Not found' }
      ]
    }
  ];
}

export const startupFailedRoutes: Routes = [{ path: '**', component: StartupFailedPage }];
