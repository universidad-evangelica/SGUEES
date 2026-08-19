// Qué hace: agrupa las reglas de negocio del catálogo Inducción.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import {
	ScInduccion,
	UNIDAD_TIEMPO_MESES,
	UNIDAD_TIEMPO_SEMANAS,
} from './models/sc-induccion';
import { ScInduccionRepository } from './sc-induccion.repository';

const ESTADO_FIELD = 'ESTADO_INDUCCION';
const TIEMPO_INDUCCION_MIN = 1;
const TIEMPO_INDUCCION_MAX = 100;

type ScInduccionFormOptions = {
	unidadesTiempo?: Array<{ Key: any; Value: string }>;
};

@Injectable({ providedIn: 'root' })
// Qué hace: valida los datos de inducción y coordina el CRUD con el repositorio.
export class ScInduccionService {
	constructor(private repo: ScInduccionRepository) {}

	// Qué hace: valida los datos de la inducción antes de guardar.
	// Cómo: revisa nombre (máx. 100), tiempo entre 1 y 100 (si está fuera muestra aviso y no guarda) y unidad Semanas/Meses.
	esValido(model: ScInduccion, msg: Function): boolean {
		if (!model.NOMBRE_INDUCCION || model.NOMBRE_INDUCCION.trim() === '') {
			msg('Debe ingresar el nombre de induccion.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_INDUCCION.trim().length > 100) {
			msg('El nombre de induccion no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		const tiempo = Number(model.TIEMPO_INDUCCION);
		if (!Number.isFinite(tiempo) || tiempo < TIEMPO_INDUCCION_MIN || tiempo > TIEMPO_INDUCCION_MAX) {
			msg('El tiempo de induccion debe estar entre 1 y 100.', NotifyType.Warning);
			return false;
		}

		const unidad = (model.UNIDAD_TIEMPO ?? '').trim();
		if (unidad !== UNIDAD_TIEMPO_SEMANAS && unidad !== UNIDAD_TIEMPO_MESES) {
			msg('Debe seleccionar la unidad de tiempo (Semanas o Meses).', NotifyType.Warning);
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
	// Cómo: arma columnas de correlativo, nombre, tiempo, unidad, estado y auditoría.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_INDUCCION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_INDUCCION', caption: 'Induccion', width: 280 },
			{
				dataField: 'TIEMPO_INDUCCION',
				caption: 'Tiempo',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'UNIDAD_TIEMPO', caption: 'Unidad', width: 120 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define el resumen (contador) de la grilla.
	// Cómo: cuenta filas sobre CORR_INDUCCION con formato Cant: {0}.
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
	// Cómo: usa unidadesTiempo (getLookUp SC_LISTA) como dataSource del SelectBox de UNIDAD_TIEMPO;
	//       el tiempo se valida entre 1 y 100 al guardar (sin recortar el valor al escribir).
	getItems(options?: ScInduccionFormOptions): any {
		const unidadesTiempo = options?.unidadesTiempo ?? [];

		return [
			{ dataField: 'CORR_INDUCCION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_INDUCCION',
				label: { text: 'Nombre induccion' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre induccion...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'TIEMPO_INDUCCION',
				label: { text: 'Tiempo' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: {
					step: 1,
					showSpinButtons: true,
					format: '#0',
				},
				validationRules: [
					{ type: 'required', message: 'Este campo es obligatorio' },
					{
						type: 'range',
						min: TIEMPO_INDUCCION_MIN,
						max: TIEMPO_INDUCCION_MAX,
						message: 'El tiempo debe estar entre 1 y 100',
					},
				],
			},
			{
				dataField: 'UNIDAD_TIEMPO',
				label: { text: 'Unidad de tiempo' },
				editorType: 'dxSelectBox',
				colSpan: 2,
				editorOptions: {
					dataSource: unidadesTiempo,
					valueExpr: 'Key',
					displayExpr: 'Value',
					searchEnabled: false,
					showClearButton: false,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_INDUCCION', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	// Cómo: agrega CORR_INDUCCION a xWhere solo cuando viene informado.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_INDUCCION) {
			xWhere.push({ Parameter: 'CORR_INDUCCION', Value: param.CORR_INDUCCION });
		}

		return xWhere;
	}
}
