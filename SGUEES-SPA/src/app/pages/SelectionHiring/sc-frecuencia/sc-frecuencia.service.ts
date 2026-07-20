// Qué hace: servicio de negocio del catálogo Frecuencia.
// Cómo: valida los datos, ejecuta el CRUD a través del repositorio y arma la configuración de grilla y formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScFrecuencia } from './models/sc-frecuencia';
import { ScFrecuenciaRepository } from './sc-frecuencia.repository';

const ESTADO_FIELD = 'ESTADO_FRECUENCIA';

@Injectable({ providedIn: 'root' })
// Qué hace: servicio de frecuencia.
// Cómo: valida los datos y llama a ScFrecuenciaRepository para ejecutar el CRUD.
export class ScFrecuenciaService {
	constructor(private repo: ScFrecuenciaRepository) {}

	// Qué hace: valida el formulario de frecuencia antes de guardar.
	// Cómo: revisa que NOMBRE_FRECUENCIA no esté vacío y no supere 50 caracteres, notificando con msg cuando falla.
	esValido(model: ScFrecuencia, msg: Function): boolean {
		if (!model.NOMBRE_FRECUENCIA || model.NOMBRE_FRECUENCIA.trim() === '') {
			msg('Debe ingresar el nombre de la frecuencia.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_FRECUENCIA.trim().length > 50) {
			msg('El nombre de la frecuencia no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: obtiene el listado de frecuencias.
	// Cómo: llama a getAll del repositorio con el filtro construido por buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una frecuencia puntual.
	// Cómo: llama a get del repositorio filtrando por CORR_FRECUENCIA.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_FRECUENCIA', Value: param.CORR_FRECUENCIA }]);
	}

	// Qué hace: crea una nueva frecuencia.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una frecuencia existente.
	// Cómo: llama a update del repositorio con el modelo y su CORR_FRECUENCIA.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_FRECUENCIA', Value: model.CORR_FRECUENCIA }]);
	}

	// Qué hace: elimina una frecuencia.
	// Cómo: llama a delete del repositorio filtrando por CORR_FRECUENCIA.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_FRECUENCIA', Value: model.CORR_FRECUENCIA }]);
	}

	// Qué hace: cambia el estado activo/inactivo de una frecuencia.
	// Cómo: llama a activarInactivar del repositorio filtrando por CORR_FRECUENCIA.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_FRECUENCIA', Value: model.CORR_FRECUENCIA }]);
	}

	// Qué hace: define columnas y formatos de la grilla de mantenimiento.
	// Cómo: arma el arreglo de columnas (correlativo, nombre, estado y auditoría) usado por app-data-grid-mtto.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_FRECUENCIA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_FRECUENCIA', caption: 'Frecuencia', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: configura el contador de registros de la grilla.
	// Cómo: define el resumen totalItems que cuenta CORR_FRECUENCIA.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_FRECUENCIA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Qué hace: define los campos y reglas del formulario de frecuencia.
	// Cómo: arma el arreglo de items (correlativo, nombre y estado) usado por dx-form.
	getItems(): any {
		return [
			{ dataField: 'CORR_FRECUENCIA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_FRECUENCIA',
				label: { text: 'Nombre frecuencia' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre frecuencia...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_FRECUENCIA', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Qué hace: traduce los filtros del componente al formato esperado por la API.
	// Cómo: agrega a xWhere el parámetro CORR_FRECUENCIA cuando viene informado en param.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_FRECUENCIA) {
			xWhere.push({ Parameter: 'CORR_FRECUENCIA', Value: param.CORR_FRECUENCIA });
		}

		return xWhere;
	}
}
