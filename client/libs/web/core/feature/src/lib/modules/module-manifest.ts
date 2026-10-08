import type { Routes } from '@angular/router';

export interface NavigationItem {
  label: string;
  path: string;
}

export interface ModuleManifest {
  key: string;
  navigation: readonly NavigationItem[];
  publicRoutes: Routes;
  routes: Routes;
}

export interface ModuleEntry {
  key: string;
  load: () => Promise<ModuleManifest>;
}
