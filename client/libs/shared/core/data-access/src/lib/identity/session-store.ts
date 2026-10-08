import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';

type SessionStatus = 'unknown' | 'signed-in' | 'signed-out' | 'unreachable';

interface SessionState {
  status: SessionStatus;
  me: Schemas['MeResponse'] | null;
}

const unauthorized = 401;

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<SessionState>({ status: 'unknown', me: null });
  private loading: Promise<void> | null = null;

  readonly status = computed(() => this.state().status);
  readonly me = computed(() => this.state().me);

  load(): Promise<void> {
    this.loading = this.fetchMe();
    return this.loading;
  }

  whenSettled(): Promise<void> {
    return this.loading ?? this.load();
  }

  async signIn(request: Schemas['SignInRequest']): Promise<Schemas['SignInResponse']> {
    const response = await firstValueFrom(this.http.post<Schemas['SignInResponse']>(apiPaths.signIn, request));
    if (!response.nameRequired) {
      await this.load();
    }
    return response;
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<unknown>(apiPaths.signOut, null));
    } finally {
      this.markSignedOut();
    }
  }

  markSignedOut(): void {
    this.state.set({ status: 'signed-out', me: null });
  }

  private async fetchMe(): Promise<void> {
    try {
      const me = await firstValueFrom(this.http.get<Schemas['MeResponse']>(apiPaths.me));
      this.state.set({ status: 'signed-in', me });
    } catch (error) {
      const status = error instanceof HttpErrorResponse && error.status === unauthorized ? 'signed-out' : 'unreachable';
      this.state.set({ status, me: null });
    }
  }
}
