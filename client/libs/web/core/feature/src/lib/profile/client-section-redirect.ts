import { inject } from '@angular/core';
import { type RedirectFunction, Router } from '@angular/router';
import { appPaths } from '../bootstrap/app-paths';
import { legacyTabParameter, profilePaths } from './profile-paths';
import { profileSlots } from './profile-slots';

export const clientSectionRedirect: RedirectFunction = ({ queryParams }) => {
  const sections = [...inject(profileSlots).clientSections.map((section) => section.path), profilePaths.settings];
  const { [legacyTabParameter]: tab, ...rest } = queryParams;
  const target = typeof tab === 'string' && sections.includes(tab) ? tab : sections[0];

  return inject(Router).createUrlTree(['/', appPaths.profile, profilePaths.client, target], { queryParams: rest });
};
