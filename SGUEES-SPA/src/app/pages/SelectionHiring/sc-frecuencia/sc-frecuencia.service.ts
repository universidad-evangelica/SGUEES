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
export class ScFrecuenciaService {
	constructor(private repo: ScFrecuenciaRepository) {}

	// Valida el nombre obligatorio y su longitud antes del guardado.
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

	// Lista el catálogo; arma el where con buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Obtiene un registro por correlativo.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_FRECUENCIA', Value: param.CORR_FRECUENCIA }]);
	}

	// Delega la creación al repositorio.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Delega la actualización al repositorio con clave por correlativo.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_FRECUENCIA', Value: model.CORR_FRECUENCIA }]);
	}

	// Delega la eliminación al repositorio por correlativo.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_FRECUENCIA', Value: model.CORR_FRECUENCIA }]);
	}

	// Cambia el estado activo/inactivo vía repositorio.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_FRECUENCIA', Value: model.CORR_FRECUENCIA }]);
	}

	// Columnas, filtros y auditoría de la grilla.
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

	// Contador total mostrado en el pie de la grilla.
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

	// Define los campos y reglas del formulario de frecuencia.
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

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_FRECUENCIA) {
			xWhere.push({ Parameter: 'CORR_FRECUENCIA', Value: param.CORR_FRECUENCIA });
		}

		return xWhere;
	}
}
