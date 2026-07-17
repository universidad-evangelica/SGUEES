// Servicio de negocio del catálogo Competencias Conductuales (validación, CRUD y config de grilla/form).
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
// Encapsula validaciones y delega el CRUD en el repositorio de competencia conductual.
export class ScCompetenciasConductualesService {
	constructor(private repo: ScCompetenciasConductualesRepository) {}

	// Valida tipo de puesto, nombre y descripción antes del guardado.
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

	// Solicita al repositorio el listado con los filtros construidos.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Solicita al repositorio el detalle por correlativo.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: param.CORR_COMPETENCIAS_CONDUCTUALES }]);
	}

	// Delega en el repositorio la creación del registro.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Delega en el repositorio la actualización con su llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES },
		]);
	}

	// Delega en el repositorio la eliminación por correlativo.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES }]);
	}

	// Delega en el repositorio el cambio de estado activo/inactivo.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES },
		]);
	}

	// Define columnas y formatos de la grilla de mantenimiento.
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

	// Configura el contador de registros de la grilla.
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

	// Define los campos y reglas del formulario de competencia conductual.
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

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_COMPETENCIAS_CONDUCTUALES) {
			xWhere.push({ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: param.CORR_COMPETENCIAS_CONDUCTUALES });
		}

		return xWhere;
	}
}
