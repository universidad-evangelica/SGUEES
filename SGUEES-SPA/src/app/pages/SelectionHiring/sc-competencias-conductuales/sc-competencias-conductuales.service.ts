import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
import { ScCompetenciasConductuales } from './models/sc-competencias-conductuales';
import { ScCompetenciasConductualesRepository } from './sc-competencias-conductuales.repository';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_CONDUCTUALES';

@Injectable({ providedIn: 'root' })
export class ScCompetenciasConductualesService {
	constructor(private repo: ScCompetenciasConductualesRepository) {}

	esValido(model: ScCompetenciasConductuales, msg: Function): boolean {
		if (!model.CORR_TIPO_PUESTO || model.CORR_TIPO_PUESTO <= 0) {
			msg('Debe seleccionar el tipo de puesto.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_COMPETENCIAS_TECNICAS || model.CODIGO_COMPETENCIAS_TECNICAS.trim() === '') {
			msg('Debe ingresar el codigo de la competencia conductual.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_COMPETENCIAS_TECNICAS.trim().length > 30) {
			msg('El codigo de la competencia conductual no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_COMPETENCIAS_TECNICAS || model.NOMBRE_COMPETENCIAS_TECNICAS.trim() === '') {
			msg('Debe ingresar el nombre de la competencia conductual.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_COMPETENCIAS_TECNICAS.trim().length > 150) {
			msg('El nombre de la competencia conductual no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION && model.DESCRIPCION.trim().length > 500) {
			msg('La descripcion no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: param.CORR_COMPETENCIAS_CONDUCTUALES }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: model.CORR_COMPETENCIAS_CONDUCTUALES },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_COMPETENCIAS_CONDUCTUALES',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_COMPETENCIAS_TECNICAS', caption: 'Codigo', width: 140 },
			{ dataField: 'NOMBRE_COMPETENCIAS_TECNICAS', caption: 'Nombre', width: 280 },
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 320 },
			{ dataField: 'NOMBRE_TIPO_PUESTO', caption: 'Tipo Puesto', width: 220 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 180 },
			{
				dataField: 'FECHA_CREA',
				caption: 'Fecha Crea',
				width: 170,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_CREA'),
			},
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 180 },
			{
				dataField: 'FECHA_ACTU',
				caption: 'Fecha Actu',
				width: 170,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_ACTU'),
			},
		];
	}

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
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_COMPETENCIAS_TECNICAS',
				label: { text: 'Codigo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Codigo...', showClearButton: true, maxLength: 30 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_COMPETENCIAS_TECNICAS',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre competencia conductual...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 6,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Descripcion...', showClearButton: true, maxLength: 500, height: 90 },
			},
			{
				dataField: 'ESTADO_COMPETENCIAS_CONDUCTUALES',
				label: { text: 'Activo' },
				editorType: 'dxCheckBox',
				colSpan: 2,
			},
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_COMPETENCIAS_CONDUCTUALES) {
			xWhere.push({ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: param.CORR_COMPETENCIAS_CONDUCTUALES });
		}

		if (param.PAGE) {
			xWhere.push({ Parameter: 'PAGE', Value: param.PAGE });
		}

		if (param.PAGE_SIZE !== undefined && param.PAGE_SIZE !== null) {
			xWhere.push({ Parameter: 'PAGE_SIZE', Value: param.PAGE_SIZE });
		}

		if (param.SORT_FIELD) {
			xWhere.push({ Parameter: 'SORT_FIELD', Value: param.SORT_FIELD });
		}

		if (param.SORT_FIELD && param.SORT_DESC !== undefined && param.SORT_DESC !== null) {
			xWhere.push({ Parameter: 'SORT_DESC', Value: param.SORT_DESC });
		}

		return xWhere;
	}
}
