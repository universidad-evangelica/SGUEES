import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { readOwnedSessionToken } from '../shared/services';

interface NotificationMessageDto {
  TITULO?: string;
  MENSAJE?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationSignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  // Qué hace: abre SignalR solo si esta pestaña tiene sesión JWT válida.
  // Cómo: lee el token con readOwnedSessionToken (misma regla que AuthService.loggedIn).
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
        console.log('ReceiveNotification', notification?.TITULO, notification?.MENSAJE);
      });
    }

    try {
      await this.hubConnection.start();
      console.log('SignalR is running ✅');
    } catch (err) {
      console.error('Error al iniciar SignalR ❌');
    }
  }

  // Qué hace: cierra el hub al cerrar sesión para no reutilizar conexión anónima/inválida.
  public async stopConnection(): Promise<void> {
    if (!this.hubConnection) {
      return;
    }

    try {
      if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
        await this.hubConnection.stop();
      }
    } catch (err) {
      console.error('Error while stopping SignalR connection: ', err);
    }
  }
}
