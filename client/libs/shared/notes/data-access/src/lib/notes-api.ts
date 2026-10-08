import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Schemas } from '@starter/shared/core/data-access';
import { firstValueFrom } from 'rxjs';
import { notePath, notesPath } from './notes-paths';

@Injectable({ providedIn: 'root' })
export class NotesApi {
  private readonly http = inject(HttpClient);

  create(request: Schemas['CreateNoteRequest']): Promise<Schemas['NoteResponse']> {
    return firstValueFrom(this.http.post<Schemas['NoteResponse']>(notesPath, request));
  }

  update(id: string, request: Schemas['UpdateNoteRequest']): Promise<Schemas['NoteResponse']> {
    return firstValueFrom(this.http.put<Schemas['NoteResponse']>(notePath(id), request));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<unknown>(notePath(id)));
  }
}
