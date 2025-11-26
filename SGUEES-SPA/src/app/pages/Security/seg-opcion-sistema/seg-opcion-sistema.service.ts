import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SegOpcionSistemaService {
  readonly urlMtto = environment.UrlSEGURIDADAPI + 'SEG_OPCION_SISTEMA/';

  constructor(private http: HttpClient) {}

  getAll(param: any): Observable<any[]> {
    let parametros = new HttpParams();

    if (param != null) {
      parametros = parametros.append('CORR_SUSCRIPCION', param.CORR_SUSCRIPCION);
      parametros = parametros.append('CORR_CONFI_PAIS', param.CORR_CONFI_PAIS);
    }

    return this.http.get<any[]>(this.urlMtto, { params: parametros });
  }

  get(id: number, param: any): Observable<any> {
    let parametros = new HttpParams();

    if (param != null) {
      parametros = parametros.append('CORR_EMPRESA', param.CORR_EMPRESA);
    }

    return this.http.get<any>(this.urlMtto + id, { params: parametros });
  }

  insert(model: any): any {
    return this.http.post(this.urlMtto, model).pipe(
      map((response: any) => response)
    );
  }

  update(model: any): any {
    return this.http.put(this.urlMtto, model).pipe(
      map((response: any) => response)
    );
  }

  delete(id: number, param: any): any {
    let parametros = new HttpParams();

    if (param != null) {
      parametros = parametros.append('CORR_SUSCRIPCION', param.CORR_SUSCRIPCION);
      parametros = parametros.append('CORR_CONFI_PAIS', param.CORR_CONFI_PAIS);
    }

    return this.http.delete(this.urlMtto + id, { params: parametros }).pipe(
      map((response: any) => response)
    );
  }
}
