import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationSignalRService {
  private hubConnection!: signalR.HubConnection;

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.UrlGENERALAPI}hubs/notifications`, {
        accessTokenFactory: () => {
          return localStorage.getItem('token') || '';
        },
      })
      .withAutomaticReconnect()
      .build();
  }

  //funcion para iniciar la conexión
  public async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.log('SignalR connection started');
    } catch (err) {
      console.error('Error while starting SignalR connection: ', err);
      //setTimeout(() => this.startConnection(), 5000);
    }
  }
  
}
