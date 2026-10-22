import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

import { SegUsuarioRepository } from './seg-usuario.repository';
import { SegUsuario } from './models/seg-usuario';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/shared/services';
import { HttpClient } from '@angular/common/http';
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
		private repodeta: SegUsuarioOpcionRepository
	) {}

	esValido(model: SegUsuario, msg: Function): boolean {
		if (!model.LOGIN_SISTEMA?.trim()) {
			msg('Debe digitar el login del usuario', NotifyType.Error);
			return false;
		}
		if (!model.NOMBRE_USUARIO?.trim()) {
			msg('Debe digitar el nombre del usuario', NotifyType.Error);
			return false;
		}
		if (!model.TIPO_USUARIO) {
			msg('Debe seleccionar el tipo de usuario', NotifyType.Error);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: param.LOGIN_SISTEMA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: param.LOGIN_SISTEMA }];

		return this.repo.get(xWhere);
	}

	getPerfil(): Observable<IResult> {
		return this.http.get<IResult>(this.urlMtto + 'perfil');
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
			{ Parameter: 'NOMBRE_USUARIO', Value: '12sdf' },
			{ Parameter: 'CORREO_ELECTRONICO', Value: '123dfd ' },
		];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'LOGIN_SISTEMA', caption: 'Login', width: 110 },
			{ dataField: 'NOMBRE_USUARIO', caption: 'Nombre Completo Usuario', width: 250 },
			{ dataField: 'CORREO_ELECTRONICO', caption: 'Correo Electrónico', width: 190 },
			{ dataField: 'NOMBRE_TIPO_USUARIO', caption: 'Tipo Usuario', width: 220 },
			{ dataField: 'NOMBRE_ESTADO_USUARIO', caption: 'Estado Usuario', width: 150 },
			{ dataField: 'IDIOMA', caption: 'Idioma', width: 80 },
			{ dataField: 'USUARIO_AD', caption: 'Usuario AD', width: 120 },
			...buildAuditGridColumns(),
		];
	}

	getOpcionDetalleColumns(): any[] {
		return [
			{ dataField: 'SELECCION', caption: '', dataType: 'boolean', width: 100 },
			{ dataField: 'NOMBRE_SISTEMA', caption: 'Sistema', width: 300, allowEditing: false },
			{ dataField: 'NOMBRE_MENU', caption: 'Menú', width: 300, allowEditing: false },
			{ dataField: 'NOMBRE_OPCION', caption: 'Opción', width: 400, allowEditing: false },
			{ dataField: 'NUEVO', caption: 'Nuevo', width: 150, dataType: 'boolean' },
			{ dataField: 'MODIFICAR', caption: 'Modificar', width: 150, dataType: 'boolean' },
			{ dataField: 'ELIMINAR', caption: 'Eliminar', width: 150, dataType: 'boolean' },
			{ dataField: 'IMPRIMIR', caption: 'Imprimir', width: 150, dataType: 'boolean' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'LOGIN_SISTEMA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'LOGIN_SISTEMA', label: { text: 'Login' }, colSpan: 2 },
			{
				dataField: 'NOMBRE_USUARIO',
				label: { text: 'Nombre Completo Usuario' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre Completo Usuario...', showClearButton: true },
			},
			{
				dataField: 'CORREO_ELECTRONICO',
				label: { text: 'Correo Electrónico' },
				colSpan: 2,
				editorOptions: { placeholder: 'Correo Electrónico...', showClearButton: true },
			},
			{
				dataField: 'USUARIO_AD',
				label: { text: 'Usuario AD' },
				colSpan: 2,
				editorOptions: { placeholder: 'Usuario AD...', showClearButton: true },
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
			},
		];
	}

	getAllSEG_USUARIO_OPCION(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA }];

		return this.repodeta.get(xWhere);
	}

	insertUpdateSEG_USUARIO_OPCION(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
			{ Parameter: 'CODIGO_SISTEMA', Value: model.CODIGO_SISTEMA },
			{ Parameter: 'CODIGO_MENU', Value: model.CODIGO_MENU },
			{ Parameter: 'CODIGO_OPCION', Value: model.CODIGO_OPCION },
		];

		return this.repodeta.update(model, xWhere);
	}

	cambioClavePerfil(model: {
		CLAVE_USUARIO: string;
		CLAVE_USUARIO_NUEVA: string;
		CLAVE_CONFIRMAR: string;
	}): Observable<IResult> {
		return this.http.post<IResult>(this.urlMtto + 'perfil/cambio-clave', model);
	}

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

	restablecerContrasena(LOGIN_SISTEMA: string): Observable<IResult> {
		return this.http.post<IResult>(this.urlMtto + 'RestablecerContrasena', { LOGIN_SISTEMA });
	}

	// Qué hace: define las columnas con anchos fijos para la grilla de persona asociada (1 a 1).
	// Cómo lo hace: retorna array de configuraciones de columna con width numérico, omitiendo CODIGO_ROL según requerimiento.
	getPersonaAsignadaColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_COMPLETO', caption: 'Nombre de la Persona', width: 320 },
			{ dataField: 'TIPO_PERSONA', caption: 'Tipo / Rol', width: 150 },
			{ dataField: 'DUI', caption: 'DUI / Identificación', width: 180 },
			{ dataField: 'SEXO', caption: 'Sexo', width: 110 },
			{
				dataField: 'FECHA_ASOCIACION',
				caption: 'Fecha Asociación',
				width: 150,
				dataType: 'date',
				format: 'dd/MM/yyyy',
			},
		];
	}

	// Qué hace: define las columnas para el selector modal de personas naturales disponibles con estado.
	// Cómo lo hace: combina anchos fijos, minWidth y el helper estándar createEstadoColumnConfig para el badge de estado.
	getPersonasDisponiblesColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_COMPLETO', caption: 'Nombre Completo', minWidth: 320 },
			{ dataField: 'TIPO_PERSONA', caption: 'Tipo / Rol', width: 180, minWidth: 150 },
			{ dataField: 'DUI', caption: 'DUI', width: 170, minWidth: 140 },
			{ dataField: 'SEXO', caption: 'Sexo', width: 130, minWidth: 110 },
			createEstadoColumnConfig('ACTIVO_PERSONA', ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
		];
	}

	// Qué hace: obtiene la persona natural asociada a un usuario del sistema (1 a 1).
	// Cómo lo hace: invoca el repositorio pasando LOGIN_SISTEMA como parámetro.
	getPersonaAsignada(loginSistema: string): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: loginSistema }];
		return this.repo.getPersonaAsignada(xWhere);
	}

	// Qué hace: obtiene el catálogo de personas naturales disponibles para asociar excluyendo la del usuario actual.
	// Cómo lo hace: invoca el repositorio con filtros de búsqueda y loginSistema.
	getPersonasDisponibles(buscar?: string, loginSistema?: string): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'buscar', Value: buscar ?? '' },
			{ Parameter: 'loginSistema', Value: loginSistema ?? '' },
		];
		return this.repo.getPersonasDisponibles(xWhere);
	}

	// Qué hace: asocia una persona natural a un usuario garantizando relación 1 a 1.
	// Cómo lo hace: envía payload con LOGIN_SISTEMA y CORR_PERSONA al repositorio.
	asociarPersona(loginSistema: string, corrPersona: number): Observable<IResult> {
		const payload = {
			LOGIN_SISTEMA: loginSistema,
			CORR_PERSONA: corrPersona,
		};
		return this.repo.asociarPersona(payload);
	}

	// Qué hace: desasocia la persona natural del usuario.
	// Cómo lo hace: envía petición delete al repositorio con LOGIN_SISTEMA.
	desasociarPersona(loginSistema: string): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'LOGIN_SISTEMA', Value: loginSistema }];
		return this.repo.desasociarPersona(xWhere);
	}
}
