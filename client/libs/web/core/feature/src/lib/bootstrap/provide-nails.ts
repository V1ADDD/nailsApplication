import { registerLocaleData } from '@angular/common';
import localeRuBy from '@angular/common/locales/ru-BY';
import {
  inject,
  LOCALE_ID,
  makeEnvironmentProviders,
  provideAppInitializer,
  type EnvironmentProviders
} from '@angular/core';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { appLocale } from '@nails/shared/common/util';
import { EnabledModules, provideCoreHttp, SessionStore } from '@nails/shared/core/data-access';
import type { ModuleEntry, ModuleManifest } from '../modules/module-manifest';
import { buildRoutes, startupFailedRoutes } from './routes';

function loadManifests(enabled: readonly string[], modules: readonly ModuleEntry[]): Promise<ModuleManifest[]> {
  return Promise.all(modules.filter((entry) => enabled.includes(entry.key)).map((entry) => entry.load()));
}

export function provideNails(modules: readonly ModuleEntry[]): EnvironmentProviders {
  registerLocaleData(localeRuBy, appLocale);
  return makeEnvironmentProviders([
    { provide: LOCALE_ID, useValue: appLocale },
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
