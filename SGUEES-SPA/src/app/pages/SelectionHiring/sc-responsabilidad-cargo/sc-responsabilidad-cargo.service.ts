import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScResponsabilidadCargo } from './models/sc-responsabilidad-cargo';
import { ScResponsabilidadCargoRepository } from './sc-responsabilidad-cargo.repository';

const ESTADO_FIELD = 'ESTADO_RESPONSABILIDAD';

@Injectable({ providedIn: 'root' })
export class ScResponsabilidadCargoService {
	constructor(private repo: ScResponsabilidadCargoRepository) {}

	// Valida nombre y aplicación al descriptor antes del guardado.
	esValido(model: ScResponsabilidadCargo, msg: Function): boolean {
		if (!model.NOMBRE_RESPONSABILIDAD || model.NOMBRE_RESPONSABILIDAD.trim() === '') {
			msg('Debe ingresar el nombre de la responsabilidad de cargo.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_RESPONSABILIDAD.trim().length > 150) {
			msg('El nombre de la responsabilidad de cargo no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!['CORTO', 'EXTENSO', 'AMBOS'].includes((model.APLICA_DESCRIPTOR ?? '').toUpperCase())) {
			msg('Debe indicar si la responsabilidad aplica al descriptor CORTO, EXTENSO o AMBOS.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_RESPONSABILIDAD', Value: param.CORR_RESPONSABILIDAD }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_RESPONSABILIDAD', Value: model.CORR_RESPONSABILIDAD }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_RESPONSABILIDAD', Value: model.CORR_RESPONSABILIDAD }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_RESPONSABILIDAD', Value: model.CORR_RESPONSABILIDAD }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_RESPONSABILIDAD',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_RESPONSABILIDAD', caption: 'Responsabilidad', width: 300 },
			{ dataField: 'APLICA_DESCRIPTOR', caption: 'Aplica descriptor', width: 150 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_RESPONSABILIDAD',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Define los campos y opciones de aplicación al descriptor.
	getItems(): any {
		return [
			{ dataField: 'CORR_RESPONSABILIDAD', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_RESPONSABILIDAD',
				label: { text: 'Nombre responsabilidad' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre responsabilidad...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'APLICA_DESCRIPTOR',
				label: { text: 'Aplica al descriptor' },
				editorType: 'dxSelectBox',
				colSpan: 2,
				editorOptions: {
					dataSource: ['CORTO', 'EXTENSO', 'AMBOS'],
					placeholder: 'Seleccione...',
					showClearButton: false,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_RESPONSABILIDAD', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_RESPONSABILIDAD) {
			xWhere.push({ Parameter: 'CORR_RESPONSABILIDAD', Value: param.CORR_RESPONSABILIDAD });
		}

		return xWhere;
	}
}

