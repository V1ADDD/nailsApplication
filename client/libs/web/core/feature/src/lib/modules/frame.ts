import { InjectionToken } from '@angular/core';
import { appPaths } from '../bootstrap/app-paths';
import type { AccountLink, FrameAction, FrameItem, ModuleManifest } from './module-manifest';

export interface FrameSlots {
  items: readonly FrameItem[];
  accountLinks: readonly AccountLink[];
  actions: readonly FrameAction[];
}

const profileItem: FrameItem = { label: 'Профиль', icon: 'user', path: `/${appPaths.profile}`, order: 30 };

export const frameSlots = new InjectionToken<FrameSlots>('frameSlots');

export function buildFrameSlots(manifests: readonly ModuleManifest[]): FrameSlots {
  return {
    items: [profileItem, ...manifests.flatMap((manifest) => (manifest.frameItem ? [manifest.frameItem] : []))].sort(
      (first, second) => first.order - second.order
    ),
    accountLinks: manifests.flatMap((manifest) => (manifest.accountLink ? [manifest.accountLink] : [])),
    actions: manifests.flatMap((manifest) => (manifest.frameAction ? [manifest.frameAction] : []))
  };
}
