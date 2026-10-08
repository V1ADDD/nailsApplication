import { httpResource } from '@angular/common/http';
import type { Signal } from '@angular/core';
import type { Schemas } from '@starter/shared/core/data-access';
import { notePath, notesPath } from './notes-paths';

export interface NotesQuery {
  search: string;
  page: number;
  pageSize: number;
}

export function notesResource(query: Signal<NotesQuery>) {
  return httpResource<Schemas['PagedResponseOfNoteSummaryResponse']>(() => {
    const { search, page, pageSize } = query();
    const params: Record<string, string | number> = { page, pageSize };
    if (search) {
      params['search'] = search;
    }
    return { url: notesPath, params };
  });
}

export function noteResource(id: Signal<string | undefined>) {
  return httpResource<Schemas['NoteResponse']>(() => {
    const current = id();
    return current ? notePath(current) : undefined;
  });
}
