import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegUsuarioRepository } from './seg-usuario.repository';
import { SegUsuario } from './models/seg-usuario';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/shared/services';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { SegUsuarioOpcionRepository } from './seg-usuario-opcion/seg-usuario-opcion.repository';

@Injectable({
	providedIn: 'root',
})
export class SegUsuarioService {
  readonly urlMtto = environment.UrlSEGURIDADAPI + 'SEG_USUARIO/';
  jwtHelper = new JwtHelperService();
	constructor(
              private http: HttpClient,
              private authService: AuthService,
              private repo: SegUsuarioRepository,
              private repodeta: SegUsuarioOpcionRepository) {}

	//#region <Validadores>
	esValido(model: SegUsuario, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: param.LOGIN_SISTEMA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: param.LOGIN_SISTEMA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
      { Parameter: 'NOMBRE_USUARIO', Value: "12sdf" },
      { Parameter: 'CORREO_ELECTRONICO', Value: "123dfd "},
    ];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'LOGIN_SISTEMA', caption: 'Login', width: 85 },
			{ dataField: 'NOMBRE_USUARIO', caption: 'Nombre Completo Usuario', width: 250 },
			{ dataField: 'CORREO_ELECTRONICO', caption: 'Correo Electronico', width: 170 },
			{ dataField: 'NOMBRE_TIPO_USUARIO', caption: 'Tipo Usuario', width: 250 },
			{ dataField: 'NOMBRE_ESTADO_USUARIO', caption: 'Estado Usuario', width: 170 },
			{ dataField: 'IDIOMA', caption: 'Idioma', width: 75 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 125, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 125, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'LOGIN_SISTEMA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'LOGIN_SISTEMA', label: { text: 'Login.' }, colSpan: 2 },
      {
				dataField: 'NOMBRE_USUARIO',
				label: { text: 'Nombre Completo Usuario' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre Completo Usuario...', showClearButton: true },
			},
			{
				dataField: 'CORREO_ELECTRONICO',
				label: { text: 'Correo Electronico' },
				colSpan: 2,
				editorOptions: { placeholder: 'Correo Electronico...', showClearButton: true },
			},
			{
				dataField: 'TIPO_USUARIO',
				label: { text: 'Tipo Usuario' },
				colSpan: 2,
				editorOptions: { placeholder: 'Tipo Usuario...', showClearButton: true },
        template: 'TIPO_USUARIOLookup',
			},
			{
				dataField: 'ESTADO_USUARIO',
				label: { text: 'Estado Usuario' },
				colSpan: 2,
				editorOptions: { placeholder: 'Estado Usuario...', showClearButton: false },
				template: 'ESTADO_USUARIOLookup',
			}
		];
	}

   //#region <Detalle Opciones>

   getAllSEG_USUARIO_OPCION(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
    ];

    return this.repodeta.get(xWhere);
  }
  insertUpdateSEG_USUARIO_OPCION(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
			{ Parameter: 'CODIGO_SISTEMA', Value: model.CODIGO_SISTEMA },
      { Parameter: 'CODIGO_MENU', Value: model.CODIGO_MENU },
			{ Parameter: 'CODIGO_OPCION', Value: model.CODIGO_OPCION },
		];

		return this.repodeta.update(model, xWhere);
	}
  // getUsuarioOpcion(id: number, param: any): Observable<any> {
  //   let parametros = new HttpParams();

  //   if (param != null) {
  //     parametros = parametros.append('CORR_EMPRESA', param.CORR_EMPRESA);
  //     parametros = parametros.append('LOGIN_SISTEMA', param.LOGIN_SISTEMA);
  //   }

  //   return this.http.get<any>(this.urlMtto + id, { params: parametros });
  // }

  // insertUsuarioOpcion(model: any): any {
  //   return this.http.post(this.urlMtto, model).pipe(
  //     map((response: any) => response)
  //   );
  // }

  // updateUsuarioOpcion(model: any): any {
  //   return this.http.put(this.urlMtto, model).pipe(
  //     map((response: any) => response)
  //   );
  // }

  // deleteUsuarioOpcion(id: number, param: any): any {
  //   let parametros = new HttpParams();

  //   if (param != null) {
  //     parametros = parametros.append('CORR_EMPRESA', param.CORR_EMPRESA);
  //     parametros = parametros.append('LOGIN_SISTEMA', param.LOGIN_SISTEMA);
  //   }

  //   return this.http.delete(this.urlMtto + 'DeleteUsuarioOpcion/' + id, { params: parametros }).pipe(
  //     map((response: any) => response)
  //   );
  // }

  //#endregion
  cambioClave(model: any) {
    return this.http.post(this.urlMtto + 'CambioClave', model).pipe(
      map((response: any) => {
        const user = response;
        if (user) {
          localStorage.setItem('token', user.token);
          this.authService.decodedToken = this.jwtHelper.decodeToken(user.token);
        }
      })
    );
  }

  reasignarClave(model: any) {
    // return this.http.post(this.urlMtto + 'ReasignarClave', model).pipe(
    //   map((response: any) => {
    //   })
    // );
  }

}
