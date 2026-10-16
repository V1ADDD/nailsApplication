import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

const fileField = 'file';

@Injectable({ providedIn: 'root' })
export class MediaApi {
  private readonly http = inject(HttpClient);

  upload(file: Blob): Promise<Schemas['MediaResponse']> {
    const form = new FormData();
    form.append(fileField, file);
    return firstValueFrom(this.http.post<Schemas['MediaResponse']>(apiPaths.media, form));
  }
}
