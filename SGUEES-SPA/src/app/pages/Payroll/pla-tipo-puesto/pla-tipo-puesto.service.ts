import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { PlaTipoPuesto } from './models/pla-tipo-puesto';
import { PlaTipoPuestoRepository } from './pla-tipo-puesto.repository';

const ESTADO_FIELD = 'ESTADO_TIPO_PUESTO';

@Injectable({
	providedIn: 'root',
})
export class PlaTipoPuestoService {
	constructor(private repo: PlaTipoPuestoRepository) {}

	esValido(model: PlaTipoPuesto, msg: Function): boolean {
		if (!model.NOMBRE_TIPO_PUESTO || model.NOMBRE_TIPO_PUESTO.trim() === '') {
			msg('Debe ingresar el nombre del tipo de puesto.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_TIPO_PUESTO.trim().length > 100) {
			msg('El nombre del tipo de puesto no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_TIPO_PUESTO || model.CODIGO_TIPO_PUESTO.trim() === '') {
			msg('Debe ingresar el codigo del tipo de puesto.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_TIPO_PUESTO.trim().length > 30) {
			msg('El codigo del tipo de puesto no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_TIPO_PUESTO', Value: param.CORR_TIPO_PUESTO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_TIPO_PUESTO', Value: model.CORR_TIPO_PUESTO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_TIPO_PUESTO', Value: model.CORR_TIPO_PUESTO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_TIPO_PUESTO', Value: model.CORR_TIPO_PUESTO }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_TIPO_PUESTO',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_TIPO_PUESTO', caption: 'Codigo', width: 140 },
			{ dataField: 'NOMBRE_TIPO_PUESTO', caption: 'Tipo de puesto', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_PUESTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_PUESTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_PUESTO',
				label: { text: 'Nombre tipo de puesto' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre tipo de puesto...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_TIPO_PUESTO',
				label: { text: 'Codigo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Codigo tipo de puesto...', showClearButton: true, maxLength: 30 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_TIPO_PUESTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_TIPO_PUESTO) {
			xWhere.push({ Parameter: 'CORR_TIPO_PUESTO', Value: param.CORR_TIPO_PUESTO });
		}

		return xWhere;
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'el tipo de puesto';

export function getEmpresaWarningMessage(etiquetaRegistro = EMPRESA_REGISTRO_ETIQUETA): string {
	return `No se pudo guardar ${etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.`;
}

export function isEmpresaWarningResponse(response: any): boolean {
	return response?.ErrorCode === EMPRESA_WARNING_ERROR_CODE;
}

export function isEmpresaFkErrorMessage(message: string): boolean {
	const value = `${message ?? ''}`.toLowerCase();
	return (
		value.includes('gen_empresa') ||
		value.includes('foreign key') ||
		value.includes('clave externa') ||
		value.includes('reference constraint') ||
		value.includes('conflicted with the foreign key') ||
		value.includes('no tiene una empresa asignada')
	);
}
