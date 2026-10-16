import { InjectionToken, type Type } from '@angular/core';
import type { Routes } from '@angular/router';
import type { ModuleManifest, ProfileSection } from '../modules/module-manifest';

export interface ProfileSlots {
  readonly clientSections: readonly ProfileSection[];
  readonly masterRoutes: Routes;
  readonly settingsActions: readonly Type<unknown>[];
}

export const profileSlots = new InjectionToken<ProfileSlots>('profileSlots');

export function buildProfileSlots(manifests: readonly ModuleManifest[]): ProfileSlots {
  return {
    clientSections: manifests
      .flatMap((manifest) => manifest.profile?.clientSections ?? [])
      .sort((first, second) => first.order - second.order),
    masterRoutes: manifests.flatMap((manifest) => manifest.profile?.masterRoutes ?? []),
    settingsActions: manifests.flatMap((manifest) => manifest.profile?.settingsActions ?? [])
  };
}
