// Qué hace: servicio de negocio del catálogo Competencias Conductuales.
// Cómo: valida los datos, ejecuta el CRUD a través del repositorio y arma la configuración de grilla y formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { ScCompetenciasConductuales } from './models/sc-competencias-conductuales';
import { ScCompetenciasConductualesRepository } from './sc-competencias-conductuales.repository';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_CONDUCTUALES';

@Injectable({ providedIn: 'root' })
// Qué hace: servicio de competencias conductuales.
// Cómo: valida los datos y llama a ScCompetenciasConductualesRepository para ejecutar el CRUD.
export class ScCompetenciasConductualesService {
	constructor(private repo: ScCompetenciasConductualesRepository) {}

	// Qué hace: valida el formulario de competencia conductual antes de guardar.
	// Cómo: revisa CORR_TIPO_PUESTO, NOMBRE_COMPETENCIAS_CONDUCTUALES y DESCRIPCION, notificando con msg cuando falla.
	esValido(model: ScCompetenciasConductuales, msg: Function): boolean {
		if (!model.CORR_TIPO_PUESTO || model.CORR_TIPO_PUESTO <= 0) {
			msg('Debe seleccionar el tipo de puesto.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_COMPETENCIAS_CONDUCTUALES || model.NOMBRE_COMPETENCIAS_CONDUCTUALES.trim() === '') {
			msg('Debe ingresar el nombre de la competencia conductual.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_COMPETENCIAS_CONDUCTUALES.trim().length > 150) {
			msg('El nombre de la competencia conductual no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion de la competencia conductual.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 500) {
			msg('La descripcion no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: obtiene el listado de competencias conductuales.
	// Cómo: llama a getAll del repositorio con el filtro construido por buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una competencia conductual puntual.
	// Cómo: llama a get del repositorio filtrando por CORR_COMPETENCIAS_CONDUCTUALES.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: param.CORR_COMPETENCIAS_CONDUCTUALES }]);
	}

	// Qué hace: crea una nueva competencia conductual.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una competencia conductual existente.
	// Cómo: llama a update del repositorio con el modelo y su CORR_COMPETENCIAS_CONDUCTUALES.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES },
		]);
	}

	// Qué hace: elimina una competencia conductual.
	// Cómo: llama a delete del repositorio filtrando por CORR_COMPETENCIAS_CONDUCTUALES.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES }]);
	}

	// Qué hace: cambia el estado activo/inactivo de una competencia conductual.
	// Cómo: llama a activarInactivar del repositorio filtrando por CORR_COMPETENCIAS_CONDUCTUALES.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES },
		]);
	}

	// Qué hace: define columnas y formatos de la grilla de mantenimiento.
	// Cómo: arma el arreglo de columnas (correlativo, nombre, descripción, tipo puesto, estado y auditoría) usado por app-data-grid-mtto.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_COMPETENCIAS_CONDUCTUALES',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_COMPETENCIAS_CONDUCTUALES', caption: 'Nombre', width: 250 },
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 280 },
			{ dataField: 'NOMBRE_TIPO_PUESTO', caption: 'Tipo Puesto', width: 200 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: configura el contador de registros de la grilla.
	// Cómo: define el resumen totalItems que cuenta CORR_COMPETENCIAS_CONDUCTUALES.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_COMPETENCIAS_CONDUCTUALES',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Qué hace: define los campos y reglas del formulario de competencia conductual.
	// Cómo: arma el arreglo de items (correlativo, tipo puesto, nombre, estado y descripción) usado por dx-form.
	getItems(): any {
		return [
			{
				dataField: 'CORR_COMPETENCIAS_CONDUCTUALES',
				label: { text: 'Corr.' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'CORR_TIPO_PUESTO',
				label: { text: 'Tipo Puesto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Seleccione tipo de puesto...', showClearButton: false },
				template: 'CORR_TIPO_PUESTOLookup',
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) => {
							const value = Number(e.value);
							return !Number.isNaN(value) && value > 0;
						},
					},
				],
			},
			{
				dataField: 'NOMBRE_COMPETENCIAS_CONDUCTUALES',
				label: { text: 'Nombre' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre competencia conductual...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'ESTADO_COMPETENCIAS_CONDUCTUALES',
				label: { text: 'Activo' },
				editorType: 'dxCheckBox',
				colSpan: 2,
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Descripcion...', showClearButton: true, maxLength: 500, height: 90 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
		];
	}

	// Qué hace: traduce los filtros del componente al formato esperado por la API.
	// Cómo: agrega a xWhere el parámetro CORR_COMPETENCIAS_CONDUCTUALES cuando viene informado en param.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_COMPETENCIAS_CONDUCTUALES) {
			xWhere.push({ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: param.CORR_COMPETENCIAS_CONDUCTUALES });
		}

		return xWhere;
	}
}
