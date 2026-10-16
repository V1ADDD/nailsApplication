import type { Injector, ProviderToken, Signal, Type } from '@angular/core';
import type { Routes } from '@angular/router';
import type { IconName } from '@nails/web/common/ui';

export interface FrameBadge {
  readonly count: Signal<number>;
}

export interface FrameItem {
  label: string;
  icon: IconName;
  path: string;
  order: number;
  exact?: boolean;
  badge?: ProviderToken<FrameBadge>;
}

export interface AccountLink {
  label: string;
  icon: IconName;
  path: string;
}

export interface FrameAction {
  label: string;
  icon: IconName;
  open: (injector: Injector) => Promise<void>;
}

export interface ProfileSection {
  path: string;
  label: string;
  title: string;
  icon: IconName;
  order: number;
  loadComponent: () => Promise<Type<unknown>>;
}

interface ProfileContribution {
  clientSections?: readonly ProfileSection[];
  masterRoutes?: Routes;
  settingsActions?: readonly Type<unknown>[];
}

export interface ModuleManifest {
  key: string;
  frameItem?: FrameItem;
  accountLink?: AccountLink;
  frameAction?: FrameAction;
  profile?: ProfileContribution;
  publicRoutes: Routes;
  routes: Routes;
}

export interface ModuleEntry {
  key: string;
  load: () => Promise<ModuleManifest>;
}
