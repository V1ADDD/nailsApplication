import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNails, NailsRoot } from '@nails/web/core/feature';
import { modules } from './modules';

bootstrapApplication(NailsRoot, {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection(), provideNails(modules)]
}).catch((error: unknown) => {
  throw error;
});
