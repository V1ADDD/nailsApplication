import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Schemas } from '../api/api-types';
import { apiPaths } from '../http/api-paths';
import { RealtimeService } from '../realtime/realtime-service';

type SessionStatus = 'unknown' | 'signed-in' | 'signed-out' | 'unreachable';

interface SessionState {
  status: SessionStatus;
  me: Schemas['MeResponse'] | null;
}

const unauthorized = 401;

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly http = inject(HttpClient);
  private readonly realtime = inject(RealtimeService);
  private readonly state = signal<SessionState>({ status: 'unknown', me: null });
  private loading: Promise<void> | null = null;

  readonly status = computed(() => this.state().status);
  readonly me = computed(() => this.state().me);
  readonly mode = computed<Schemas['UserMode']>(() => this.state().me?.mode ?? 'client');

  constructor() {
    this.realtime.on('modeChanged').subscribe(({ mode }) => {
      const me = this.state().me;
      if (me && me.mode !== mode) {
        this.state.set({ status: 'signed-in', me: { ...me, mode } });
      }
    });
  }

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
    this.realtime.stop();
    this.state.set({ status: 'signed-out', me: null });
  }

  async setMode(mode: Schemas['UserMode']): Promise<void> {
    if (this.mode() === mode) {
      return;
    }
    const request: Schemas['SetModeRequest'] = { mode };
    const me = await firstValueFrom(this.http.put<Schemas['MeResponse']>(apiPaths.mode, request));
    this.state.set({ status: 'signed-in', me });
  }

  private async fetchMe(): Promise<void> {
    try {
      const me = await firstValueFrom(this.http.get<Schemas['MeResponse']>(apiPaths.me));
      this.state.set({ status: 'signed-in', me });
      this.realtime.start(me.heartbeatSeconds);
    } catch (error) {
      const status = error instanceof HttpErrorResponse && error.status === unauthorized ? 'signed-out' : 'unreachable';
      this.realtime.stop();
      this.state.set({ status, me: null });
    }
  }
}
