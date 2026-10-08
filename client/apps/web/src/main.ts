import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideStarter, StarterRoot } from '@starter/web/core/feature';
import { modules } from './modules';

bootstrapApplication(StarterRoot, {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection(), provideStarter(modules)]
}).catch((error: unknown) => {
  throw error;
});
