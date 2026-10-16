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
  readonly meError = computed(() => this.state().status === 'unreachable');

  constructor() {
    this.realtime.connectionLost$.subscribe(() => {
      void this.verify();
    });
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

  patchMe(me: Schemas['MeResponse']): void {
    this.state.set({ status: 'signed-in', me });
  }

  async setNotifications(notifications: Schemas['NotificationSettingsResponse']): Promise<void> {
    const before = this.state().me;
    if (!before) {
      return;
    }
    this.patchMe({ ...before, notifications });
    try {
      const saved = await firstValueFrom(
        this.http.put<Schemas['NotificationSettingsResponse']>(apiPaths.notifications, notifications)
      );
      const current = this.state().me;
      if (current) {
        this.patchMe({ ...current, notifications: saved });
      }
    } catch (error) {
      const current = this.state().me;
      if (current) {
        this.patchMe({ ...current, notifications: before.notifications });
      }
      throw error;
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

  private async verify(): Promise<void> {
    if (this.state().status !== 'signed-in') {
      return;
    }
    try {
      this.patchMe(await firstValueFrom(this.http.get<Schemas['MeResponse']>(apiPaths.me)));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === unauthorized) {
        this.markSignedOut();
      }
    }
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
