import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CData } from '../FxAPI/CData';
import { IResult } from '../FxAPI/IResult';
import { NotificationMessageDto } from './notification-signalr.service';

export type GenNotificacionItem = NotificationMessageDto;

@Injectable({
  providedIn: 'root',
})
export class GenNotificacionService {
  private readonly controller = 'GEN_NOTIFICACION';

  constructor(private objData: CData) {}

  /** Primera página de notificaciones recientes (orden FECHA_CREA DESC en API). */
  getRecientes(pageSize = 20, soloNoLeidas = false): Observable<IResult> {
    return this.objData.Get(
      this.controller,
      'GetAll',
      [
        { Parameter: 'PAGE', Value: 1 },
        { Parameter: 'PAGE_SIZE', Value: pageSize },
        { Parameter: 'SOLO_NO_LEIDAS', Value: soloNoLeidas },
      ],
      environment.UrlGENERALAPI
    );
  }

  countPendientes(): Observable<IResult> {
    return this.objData.Get(this.controller, 'CountPendientes', [], environment.UrlGENERALAPI);
  }

  marcarLeida(corrNotificacion: number): Observable<IResult> {
    return this.objData.Put(
      {},
      this.controller,
      'Leer',
      [{ Parameter: 'CORR_NOTIFICACION', Value: corrNotificacion }],
      environment.UrlGENERALAPI
    );
  }
}
