// Qué hace: servicio de la vista Unidades por Usuario.
// Cómo: arma filtros, delega operaciones HTTP y configura columnas y resumen del browse.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { ScUnidadesUsuario } from './models/sc-unidades-usuario';
import { ScUnidadesUsuarioRepository } from './sc-unidades-usuario.repository';

@Injectable({ providedIn: 'root' })
export class ScUnidadesUsuarioService {
	constructor(private repo: ScUnidadesUsuarioRepository) {}

	// Qué hace: obtiene asignaciones, opcionalmente por usuario.
	// Cómo: agrega LOGIN_SISTEMA al filtro y consulta GetAll.
	getAll(loginSistema?: string): Observable<IResult> {
		const xWhere: IParam[] = [];
		if ((loginSistema ?? '').trim()) {
			xWhere.push({ Parameter: 'LOGIN_SISTEMA', Value: loginSistema!.trim() });
		}
		return this.repo.getAll(xWhere);
	}

	// Qué hace: crea una asignación unidad-usuario.
	// Cómo: delega el modelo al repositorio.
	insert(model: ScUnidadesUsuario): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: elimina una asignación unidad-usuario.
	// Cómo: usa CORR_UNIDAD y LOGIN_SISTEMA como llave.
	delete(model: ScUnidadesUsuario): Observable<IResult> {
		return this.repo.delete([
			{ Parameter: 'CORR_UNIDAD', Value: model.CORR_UNIDAD },
			{ Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
		]);
	}

	// Qué hace: asigna todas las unidades activas al usuario.
	// Cómo: llama la operación masiva del repositorio.
	asignarTodasUnidades(model: Partial<ScUnidadesUsuario>): Observable<IResult> {
		return this.repo.asignarTodasUnidades(model);
	}

	// Qué hace: quita todas las unidades del usuario.
	// Cómo: llama la operación masiva del repositorio.
	quitarTodasUnidades(model: Partial<ScUnidadesUsuario>): Observable<IResult> {
		return this.repo.quitarTodasUnidades(model);
	}

	// Qué hace: configura las columnas del browse de usuarios.
	// Cómo: muestra login, nombre y cantidad de unidades sin acciones embebidas.
	getColumns(): any[] {
		return [
			{
				name: 'btnAcciones',
				type: 'buttons',
				visible: false,
				allowFiltering: false,
				allowSorting: false,
				buttons: [],
			},
			{ dataField: 'LOGIN_SISTEMA', caption: 'Usuario', width: 180 },
			{ dataField: 'NOMBRE_USUARIO', caption: 'Nombre', width: 360 },
			{
				dataField: 'CANT_UNIDADES',
				caption: 'Unidades',
				width: 120,
				dataType: 'number',
				alignment: 'center',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
		];
	}

	// Qué hace: configura el contador total del browse.
	// Cómo: cuenta filas por LOGIN_SISTEMA.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'LOGIN_SISTEMA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}
}
