import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '@nails/shared/core/data-access';
import { appPaths } from '../bootstrap/app-paths';
import { profilePaths } from './profile-paths';
import { profileSlots } from './profile-slots';

export const requireMasterSide: CanActivateFn = () => {
  const masterSide = inject(profileSlots).masterRoutes.length > 0 && inject(SessionStore).me()?.masterId != null;

  return masterSide || inject(Router).createUrlTree(['/', appPaths.profile, profilePaths.client]);
};
