import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  readonly urlMtto =
    environment.UrlSEGURIDADAPI +
    'api/SEG_SISTEMA_MENU_FAVORITOS/';

  constructor(
    private http: HttpClient
  ) { }

  // Agregar o eliminar un favorito
  toggleFavorite(data: any) {
    return this.http.post(
      this.urlMtto + 'toggle',
      data
    );
  }

  // Obtener los favoritos del usuario
  getFavorites(
    corrEmpresa: number,
    usuario: string
  ) {
    return this.http.get<any[]>(
      this.urlMtto + 'getFavorites',
      {
        params: {
          CORR_EMPRESA: corrEmpresa.toString(),
          USUARIO: usuario
        }
      }
    );
  }

}