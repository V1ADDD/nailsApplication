import type { ModuleManifest } from '@nails/web/core/feature';

export const manifest: ModuleManifest = {
  key: 'support',
  frameAction: {
    label: 'Напишите нам',
    icon: 'message-square',
    open: async (injector) => {
      const { SupportDialog } = await import('./support-dialog');
      injector.get(SupportDialog).open();
    }
  },
  publicRoutes: [],
  routes: []
};
