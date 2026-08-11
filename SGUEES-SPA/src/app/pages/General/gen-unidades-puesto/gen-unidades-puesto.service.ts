// Qué hace: servicio de negocio de puestos por unidad.
// Cómo: valida datos, arma filtros y llama a GenUnidadesPuestoRepository; configura columnas/summary del grid de unidades.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { GenUnidadesPuesto } from './models/gen-unidades-puesto';
import { GenUnidadesPuestoRepository } from './gen-unidades-puesto.repository';

@Injectable({ providedIn: 'root' })
// Qué hace: servicio de puestos por unidad.
// Cómo: valida la unidad/puesto y delega getAll, insert y delete en el repositorio.
export class GenUnidadesPuestoService {
	constructor(private repo: GenUnidadesPuestoRepository) {}

	// Qué hace: obtiene las asignaciones (todas o por unidad).
	// Cómo: arma xWhere con CORR_UNIDAD si viene y llama a getAll del repositorio.
	getAll(corrUnidad?: number): Observable<IResult> {
		const xWhere: IParam[] = [];
		if (corrUnidad != null && corrUnidad > 0) {
			xWhere.push({ Parameter: 'CORR_UNIDAD', Value: corrUnidad });
		}
		return this.repo.getAll(xWhere);
	}

	// Qué hace: crea una asignación de puesto a una unidad.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: GenUnidadesPuesto): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: asigna a la unidad todos los puestos activos que aún no tenga.
	// Cómo: llama a asignarTodosPuestos del repositorio (INSERT...SELECT en el API).
	asignarTodosPuestos(model: Partial<GenUnidadesPuesto>): Observable<IResult> {
		return this.repo.asignarTodosPuestos(model);
	}

	// Qué hace: elimina una asignación unidad-puesto.
	// Cómo: llama a delete del repositorio filtrando por CORR_UNIDAD y CORR_PUESTO.
	delete(model: GenUnidadesPuesto): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_UNIDAD', Value: model.CORR_UNIDAD },
			{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO },
		];
		return this.repo.delete(xWhere);
	}

	// Qué hace: valida la línea de puesto antes de guardar.
	// Cómo: exige CORR_UNIDAD y CORR_PUESTO mayores a cero, notificando con msg cuando falla.
	esValidoPuesto(model: GenUnidadesPuesto, msg: Function): boolean {
		if (!model.CORR_UNIDAD || Number(model.CORR_UNIDAD) <= 0) {
			msg('Debe indicar la unidad.', NotifyType.Warning);
			return false;
		}
		if (!model.CORR_PUESTO || Number(model.CORR_PUESTO) <= 0) {
			msg('Debe seleccionar un puesto.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	// Qué hace: columnas de la grilla global de unidades (mismo patrón mtto).
	// Cómo: arma Codigo, Nombre de unidad y el contador; oculta Options (acciones van en el ribbon).
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
				dataField: 'CORR_UNIDAD',
				caption: 'Codigo',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_UNIDAD', caption: 'Codigo unidad', width: 130 },
			{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 320 },
			{
				dataField: 'CANT_PUESTOS',
				caption: 'Puestos',
				width: 120,
				dataType: 'number',
				alignment: 'center',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
		];
	}

	// Qué hace: resumen total de la grilla de unidades.
	// Cómo: cuenta filas sobre la columna CORR_UNIDAD.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_UNIDAD',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}
}
