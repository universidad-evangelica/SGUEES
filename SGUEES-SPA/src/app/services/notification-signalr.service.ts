import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { readOwnedSessionToken } from '../shared/services';

/** Payload alineado al DTO SignalR del API (PropertyNamingPolicy = null). */
export interface NotificationMessageDto {
  CORR_EMPRESA?: number;
  CORR_NOTIFICACION?: number;
  TITULO?: string;
  MENSAJE?: string;
  URL_DESTINO?: string | null;
  FECHA_CREA?: string | Date;
  LEIDA?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationSignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly notificationSubject = new Subject<NotificationMessageDto>();
  private readonly reconnectedSubject = new Subject<void>();

  /** Notificaciones en tiempo real (una sola suscripción al hub). */
  readonly notifications$: Observable<NotificationMessageDto> = this.notificationSubject.asObservable();

  /** Emite tras reconectar el hub (para resincronizar con la API). */
  readonly reconnected$: Observable<void> = this.reconnectedSubject.asObservable();

  // Qué hace: abre SignalR solo si esta pestaña tiene sesión JWT válida.
  public async startConnection(): Promise<void> {
    const token = readOwnedSessionToken();
    if (!token) {
      return;
    }

    if (
      this.hubConnection?.state === signalR.HubConnectionState.Connected ||
      this.hubConnection?.state === signalR.HubConnectionState.Connecting
    ) {
      return;
    }

    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.UrlGENERALAPI}hubs/notifications`, {
          accessTokenFactory: () => readOwnedSessionToken(),
        })
        .configureLogging(signalR.LogLevel.None)
        .withAutomaticReconnect()
        .build();

      // Listener una sola vez (solo al crear el HubConnection).
      this.hubConnection.on('ReceiveNotification', (notification: NotificationMessageDto) => {
        this.notificationSubject.next(notification ?? {});
      });

      this.hubConnection.onreconnected(() => {
        this.reconnectedSubject.next();
      });
    }

    try {
      await this.hubConnection.start();
    } catch {
      // Sin volcar detalles sensibles ni tokens.
    }
  }

  public async stopConnection(): Promise<void> {
    if (!this.hubConnection) {
      return;
    }

    try {
      if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
        await this.hubConnection.stop();
      }
    } catch {
      // silencioso
    }
  }
}
