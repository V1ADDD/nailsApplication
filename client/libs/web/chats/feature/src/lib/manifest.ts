import type { ModuleManifest } from '@nails/web/core/feature';
import { ChatsBadge } from './chats-badge';

export const manifest: ModuleManifest = {
  key: 'chats',
  frameItem: { label: 'Чаты', icon: 'message-square', path: '/chats', order: 20, badge: ChatsBadge },
  publicRoutes: [],
  routes: [
    {
      path: 'chats/new',
      loadComponent: () => import('./start-chat-page').then((m) => m.StartChatPage),
      title: 'Чаты'
    },
    {
      path: 'chats',
      loadComponent: () => import('./chats-page').then((m) => m.ChatsPage),
      title: 'Чаты'
    },
    {
      path: 'chats/:chatId',
      loadComponent: () => import('./chats-page').then((m) => m.ChatsPage),
      title: 'Чаты'
    }
  ]
};
