import { inject, makeEnvironmentProviders, provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { EnabledModules, provideCoreHttp, SessionStore } from '@starter/shared/core/data-access';
import type { ModuleEntry, ModuleManifest } from '../modules/module-manifest';
import { buildRoutes, startupFailedRoutes } from './routes';

function loadManifests(enabled: readonly string[], modules: readonly ModuleEntry[]): Promise<ModuleManifest[]> {
  return Promise.all(modules.filter((entry) => enabled.includes(entry.key)).map((entry) => entry.load()));
}

export function provideStarter(modules: readonly ModuleEntry[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideCoreHttp(),
    provideRouter([], withComponentInputBinding()),
    provideAppInitializer(async () => {
      const router = inject(Router);
      const enabledModules = inject(EnabledModules);
      const session = inject(SessionStore);
      try {
        const manifests = await loadManifests(await enabledModules.load(), modules);
        router.resetConfig(buildRoutes(manifests));
        void session.load();
      } catch {
        router.resetConfig(startupFailedRoutes);
      }
    })
  ]);
}
