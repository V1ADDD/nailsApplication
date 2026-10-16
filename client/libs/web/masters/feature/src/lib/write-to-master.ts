import { computed, inject, type Signal } from '@angular/core';
import { EnabledModules } from '@nails/shared/core/data-access';

const chatsModule = 'chats';
export const startChatPath = '/chats/new';

export function injectChatsEnabled(): Signal<boolean> {
  const modules = inject(EnabledModules);
  return computed(() => modules.enabled().includes(chatsModule));
}

export function chatQuery(masterId: string): { master: string } {
  return { master: masterId };
}
