import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenDivision } from './models/gen-division';
import { GenDivisionRepository } from './gen-division.repository';

@Injectable({ providedIn: 'root' })
export class GenDivisionService {
	constructor(private repo: GenDivisionRepository) {}

	esValido(model: GenDivision, msg: Function): boolean {
		if (!model.NOMBRE_DIVISION || model.NOMBRE_DIVISION.trim() === '') {
			msg('Debe ingresar el nombre de division.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_DIVISION.trim().length > 100) {
			msg('El nombre de division no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_DIVISION || model.CODIGO_DIVISION.trim() === '') {
			msg('Debe ingresar el codigo de division.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_DIVISION.trim().length > 10) {
			msg('El codigo de division no puede superar 10 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_DIVISION', Value: model.CORR_DIVISION }]);
	}

	delete(param: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_DIVISION',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_DIVISION', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_DIVISION', caption: 'Division', minWidth: 280 },
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_DIVISION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DIVISION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_DIVISION',
				label: { text: 'Nombre division' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre division...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_DIVISION',
				label: { text: 'Codigo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Codigo...', showClearButton: true, maxLength: 10 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_DIVISION) {
			xWhere.push({ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION });
		}

		return xWhere;
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'la division';

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
