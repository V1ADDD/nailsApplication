import { Injectable } from '@angular/core';
import {
  type HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel
} from '@microsoft/signalr';
import { type Observable, Subject } from 'rxjs';
import { apiPaths } from '../http/api-paths';
import type { RealtimeEventMap, RealtimeEventName } from './realtime-events';
import { retryDelay, retryForever } from './retry-delays';

const heartbeatMethod = 'heartbeat';
const msPerSecond = 1000;

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private connection: HubConnection | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private readonly streams = new Map<RealtimeEventName, Subject<unknown>>();
  private readonly reconnectedSubject = new Subject<void>();
  private readonly connectionLostSubject = new Subject<void>();

  readonly reconnected$: Observable<void> = this.reconnectedSubject.asObservable();
  readonly connectionLost$: Observable<void> = this.connectionLostSubject.asObservable();

  start(heartbeatSeconds: number): void {
    if (this.connection) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(apiPaths.hub, { skipNegotiation: true, transport: HttpTransportType.WebSockets })
      .withAutomaticReconnect(retryForever)
      .configureLogging(LogLevel.Warning)
      .build();

    for (const [name, stream] of this.streams) {
      connection.on(name, (payload: unknown) => {
        stream.next(payload);
      });
    }
    connection.onreconnected(() => {
      this.reconnectedSubject.next();
    });
    connection.onreconnecting(() => {
      this.connectionLostSubject.next();
    });

    this.connection = connection;
    this.heartbeat = setInterval(() => {
      if (connection.state === HubConnectionState.Connected) {
        connection.invoke(heartbeatMethod).catch(() => undefined);
      }
    }, heartbeatSeconds * msPerSecond);
    void this.connect(connection, 0);
  }

  stop(): void {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
    }
    if (this.retry) {
      clearTimeout(this.retry);
    }
    this.heartbeat = null;
    this.retry = null;
    const connection = this.connection;
    this.connection = null;
    void connection?.stop();
  }

  on<K extends RealtimeEventName>(name: K): Observable<RealtimeEventMap[K]> {
    let stream = this.streams.get(name);
    if (!stream) {
      const created = new Subject<unknown>();
      this.streams.set(name, created);
      this.connection?.on(name, (payload: unknown) => {
        created.next(payload);
      });
      stream = created;
    }
    return stream.asObservable() as Observable<RealtimeEventMap[K]>;
  }

  private async connect(connection: HubConnection, attempt: number): Promise<void> {
    try {
      await connection.start();
      if (attempt > 0) {
        this.reconnectedSubject.next();
      }
    } catch {
      if (attempt === 0) {
        this.connectionLostSubject.next();
      }
      if (this.connection === connection) {
        this.retry = setTimeout(() => void this.connect(connection, attempt + 1), retryDelay(attempt + 1));
      }
    }
  }
}
