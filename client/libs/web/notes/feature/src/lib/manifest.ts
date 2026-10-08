import type { ModuleManifest } from '@starter/web/core/feature';
import { NoteEditorPage } from './note-editor-page';
import { NotesPage } from './notes-page';

export const manifest: ModuleManifest = {
  key: 'notes',
  navigation: [{ label: 'Notes', path: '/notes' }],
  publicRoutes: [],
  routes: [
    { path: 'notes', component: NotesPage, title: 'Notes' },
    { path: 'notes/new', component: NoteEditorPage, title: 'New note' },
    { path: 'notes/:id', component: NoteEditorPage, title: 'Note' }
  ]
};
