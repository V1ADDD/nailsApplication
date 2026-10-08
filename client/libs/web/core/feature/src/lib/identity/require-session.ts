import { inject } from '@angular/core';
import { Router, type CanActivateChildFn } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { appPaths, returnToParameter } from '../bootstrap/app-paths';

export const requireSession: CanActivateChildFn = async (_route, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  await session.whenSettled();

  switch (session.status()) {
    case 'signed-in':
      return true;
    case 'unreachable':
      return router.createUrlTree(['/', appPaths.unavailable], { queryParams: { [returnToParameter]: state.url } });
    case 'unknown':
    case 'signed-out':
      return router.createUrlTree(['/', appPaths.signIn], { queryParams: { [returnToParameter]: state.url } });
  }
};
