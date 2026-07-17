import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScImpactoEconomico } from './models/sc-impacto-economico';
import { ScImpactoEconomicoRepository } from './sc-impacto-economico.repository';

const ESTADO_FIELD = 'ESTADO_IMPACTO_ECONOMICO';

@Injectable({ providedIn: 'root' })
export class ScImpactoEconomicoService {
	constructor(private repo: ScImpactoEconomicoRepository) {}

	// Valida la descripción obligatoria y su longitud antes del guardado.
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
		return this.repo.update(model, [{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_IMPACTO_ECONOMICO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 650 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_IMPACTO_ECONOMICO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Define los campos y reglas del formulario de impacto económico.
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

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_IMPACTO_ECONOMICO) {
			xWhere.push({ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: param.CORR_IMPACTO_ECONOMICO });
		}

		return xWhere;
	}
}
