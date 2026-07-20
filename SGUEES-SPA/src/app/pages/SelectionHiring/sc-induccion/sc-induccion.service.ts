// Qué hace: agrupa las reglas de negocio del catálogo Inducción.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScInduccion } from './models/sc-induccion';
import { ScInduccionRepository } from './sc-induccion.repository';

const ESTADO_FIELD = 'ESTADO_INDUCCION';

@Injectable({ providedIn: 'root' })
// Qué hace: valida los datos de inducción y coordina el CRUD con el repositorio.
export class ScInduccionService {
	constructor(private repo: ScInduccionRepository) {}

	// Qué hace: valida los datos de la inducción antes de guardar.
	// Cómo: revisa que el nombre no esté vacío, no supere 200 caracteres y que las semanas sean mayores a 0.
	esValido(model: ScInduccion, msg: Function): boolean {
		if (!model.NOMBRE_INDUCCION || model.NOMBRE_INDUCCION.trim() === '') {
			msg('Debe ingresar el nombre de induccion.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_INDUCCION.trim().length > 200) {
			msg('El nombre de induccion no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.SEMANAS_INDUCCION || model.SEMANAS_INDUCCION <= 0) {
			msg('Debe ingresar semanas de induccion mayores a 0.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: lista las inducciones según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los parámetros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una inducción por su correlativo.
	// Cómo: llama a get del repositorio con CORR_INDUCCION como filtro.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_INDUCCION', Value: param.CORR_INDUCCION }]);
	}

	// Qué hace: crea una inducción nueva.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una inducción existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_INDUCCION como llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_INDUCCION', Value: model.CORR_INDUCCION }]);
	}

	// Qué hace: elimina una inducción.
	// Cómo: llama a delete del repositorio con CORR_INDUCCION como filtro.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_INDUCCION', Value: model.CORR_INDUCCION }]);
	}

	// Qué hace: cambia el estado activo/inactivo de una inducción.
	// Cómo: llama a activarInactivar del repositorio con CORR_INDUCCION como filtro.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_INDUCCION', Value: model.CORR_INDUCCION }]);
	}

	// Qué hace: define las columnas de la grilla de mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_INDUCCION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_INDUCCION', caption: 'Induccion', width: 300 },
			{
				dataField: 'SEMANAS_INDUCCION',
				caption: 'Semanas',
				width: 120,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define el resumen (contador) de la grilla.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_INDUCCION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Qué hace: define los campos y las reglas de validación del formulario.
	getItems(): any {
		return [
			{ dataField: 'CORR_INDUCCION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_INDUCCION',
				label: { text: 'Nombre induccion' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre induccion...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'SEMANAS_INDUCCION',
				label: { text: 'Semanas' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 1, showSpinButtons: true },
				validationRules: [
					{ type: 'required', message: 'Este campo es obligatorio' },
					{ type: 'range', min: 1, message: 'Las semanas deben ser mayores a 0' },
				],
			},
			{ dataField: 'ESTADO_INDUCCION', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_INDUCCION) {
			xWhere.push({ Parameter: 'CORR_INDUCCION', Value: param.CORR_INDUCCION });
		}

		return xWhere;
	}
}
