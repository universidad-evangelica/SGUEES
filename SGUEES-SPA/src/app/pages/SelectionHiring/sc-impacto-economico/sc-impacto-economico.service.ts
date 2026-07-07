import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
import { ScImpactoEconomico } from './models/sc-impacto-economico';
import { ScImpactoEconomicoRepository } from './sc-impacto-economico.repository';

const ESTADO_FIELD = 'ESTADO_IMPACTO_ECONOMICO';

@Injectable({ providedIn: 'root' })
export class ScImpactoEconomicoService {
	constructor(private repo: ScImpactoEconomicoRepository) {}

	esValido(model: ScImpactoEconomico, msg: Function): boolean {
		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion del impacto economico.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 150) {
			msg('La descripcion del impacto economico no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: param.CORR_IMPACTO_ECONOMICO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_IMPACTO_ECONOMICO',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 650 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{
				dataField: 'FECHA_CREA',
				caption: 'Fecha Crea',
				width: 200,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_CREA'),
			},
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{
				dataField: 'FECHA_ACTU',
				caption: 'Fecha Actu',
				width: 200,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_ACTU'),
			},
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_IMPACTO_ECONOMICO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_IMPACTO_ECONOMICO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 5,
				editorType: 'dxTextBox',
				editorOptions: { placeholder: 'Descripcion impacto economico...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_IMPACTO_ECONOMICO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_IMPACTO_ECONOMICO) {
			xWhere.push({ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: param.CORR_IMPACTO_ECONOMICO });
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
