// Qué hace: servicio de negocio de unidades por tipo de usuario.
// Cómo: valida datos, arma filtros y llama a ScUnidadesTipoUsuarioRepository; configura columnas/summary del grid de roles.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ScUnidadesTipoUsuario } from './models/sc-unidades-tipo-usuario';
import { ScUnidadesTipoUsuarioRepository } from './sc-unidades-tipo-usuario.repository';

@Injectable({ providedIn: 'root' })
// Qué hace: servicio de unidades por tipo de usuario.
// Cómo: valida la unidad/rol y delega getAll, insert, delete y activarInactivar en el repositorio.
export class ScUnidadesTipoUsuarioService {
	constructor(private repo: ScUnidadesTipoUsuarioRepository) {}

	// Qué hace: obtiene las asignaciones (todas o por rol).
	// Cómo: arma xWhere con TIPO_USUARIO si viene y llama a getAll del repositorio.
	getAll(tipoUsuario?: number): Observable<IResult> {
		const xWhere: IParam[] = [];
		if (tipoUsuario != null && tipoUsuario > 0) {
			xWhere.push({ Parameter: 'TIPO_USUARIO', Value: tipoUsuario });
		}
		return this.repo.getAll(xWhere);
	}

	// Qué hace: crea una asignación de unidad a un rol.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: ScUnidadesTipoUsuario): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: elimina una asignación unidad-rol.
	// Cómo: llama a delete del repositorio filtrando por CORR_UNIDAD y TIPO_USUARIO.
	delete(model: ScUnidadesTipoUsuario): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_UNIDAD', Value: model.CORR_UNIDAD },
			{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO },
		];
		return this.repo.delete(xWhere);
	}

	// Qué hace: cambia el estado activo/inactivo de la asignación intermedia.
	// Cómo: llama a activarInactivar del repositorio con CORR_UNIDAD y TIPO_USUARIO.
	activarInactivar(model: ScUnidadesTipoUsuario): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_UNIDAD', Value: model.CORR_UNIDAD },
			{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO },
		];
		return this.repo.activarInactivar(model, xWhere);
	}

	// Qué hace: valida la línea de unidad antes de guardar.
	// Cómo: exige CORR_UNIDAD y TIPO_USUARIO mayores a cero, notificando con msg cuando falla.
	esValidoUnidad(model: ScUnidadesTipoUsuario, msg: Function): boolean {
		if (!model.CORR_UNIDAD || Number(model.CORR_UNIDAD) <= 0) {
			msg('Debe seleccionar una unidad.', NotifyType.Warning);
			return false;
		}
		if (!model.TIPO_USUARIO || Number(model.TIPO_USUARIO) <= 0) {
			msg('Debe indicar el rol.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	// Qué hace: columnas de la grilla global de roles (mismo patrón mtto).
	// Cómo: arma Codigo, Nombre del rol y el contador; oculta Options (acciones van en el ribbon).
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
			{
				dataField: 'TIPO_USUARIO',
				caption: 'Codigo',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_TIPO_USUARIO', caption: 'Rol / Tipo de usuario', width: 320 },
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

	// Qué hace: resumen total de la grilla de roles.
	// Cómo: cuenta filas sobre la columna TIPO_USUARIO.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'TIPO_USUARIO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}
}
