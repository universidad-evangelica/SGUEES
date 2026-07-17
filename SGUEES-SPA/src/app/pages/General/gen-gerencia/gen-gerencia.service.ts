import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenGerencia } from './models/gen-gerencia';
import { GenGerenciaRepository } from './gen-gerencia.repository';

@Injectable({ providedIn: 'root' })
export class GenGerenciaService {
	constructor(private repo: GenGerenciaRepository) {}

	esValido(model: GenGerencia, msg: Function): boolean {
		if (!model.NOMBRE_GERENCIA || model.NOMBRE_GERENCIA.trim() === '') {
			msg('Debe ingresar el nombre de gerencia.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_GERENCIA.trim().length > 100) {
			msg('El nombre de gerencia no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_GERENCIA || model.CODIGO_GERENCIA.trim() === '') {
			msg('Debe ingresar el codigo de gerencia.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_GERENCIA.trim().length > 10) {
			msg('El codigo de gerencia no puede superar 10 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_DIVISION) {
			msg('Debe seleccionar la division.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: {
		CORR_GERENCIA?: number;
		PAGE?: number;
		PAGE_SIZE?: number;
		SORT_FIELD?: string;
		SORT_DESC?: boolean;
	}): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA ?? 0 },
			{ Parameter: 'PAGE', Value: param.PAGE ?? 1 },
			{ Parameter: 'PAGE_SIZE', Value: param.PAGE_SIZE ?? 50 },
			{ Parameter: 'SORT_FIELD', Value: param.SORT_FIELD ?? '' },
			{ Parameter: 'SORT_DESC', Value: param.SORT_DESC ?? false },
		];
		return this.repo.getAll(xWhere);
	}

	get(param: { CORR_GERENCIA: number }): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_GERENCIA', Value: model.CORR_GERENCIA }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_GERENCIA', Value: model.CORR_GERENCIA }]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_GERENCIA', caption: 'Corr.', width: 100, dataType: 'number' },
			{ dataField: 'NOMBRE_GERENCIA', caption: 'Gerencia', width: 250 },
			{ dataField: 'CODIGO_GERENCIA', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_DIVISION', caption: 'Division', width: 250 },
			{ dataField: 'CODIGO_DIVISION', caption: 'Cod. Division', width: 120 },
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_GERENCIA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(ctx: { divisiones: any[]; readOnly: boolean }): any {
		return [
			{ dataField: 'CORR_GERENCIA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_GERENCIA',
				label: { text: 'Nombre gerencia' },
				colSpan: 3,
				editorOptions: {
					placeholder: 'Nombre gerencia...',
					showClearButton: !ctx.readOnly,
					maxLength: 100,
					readOnly: ctx.readOnly,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_GERENCIA',
				label: { text: 'Codigo' },
				colSpan: 3,
				editorOptions: {
					placeholder: 'Codigo...',
					showClearButton: !ctx.readOnly,
					maxLength: 10,
					readOnly: ctx.readOnly,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_DIVISION',
				label: { text: 'Division' },
				colSpan: 3,
				editorType: 'dxSelectBox',
				editorOptions: {
					readOnly: ctx.readOnly,
					dataSource: ctx.divisiones,
					displayExpr: (item: any) => {
						if (!item) {
							return '';
						}
						const codigo = `${item.CODIGO_DIVISION ?? ''}`.trim();
						const nombre = `${item.NOMBRE_DIVISION ?? ''}`.trim();
						return codigo && nombre ? `${codigo} - ${nombre}` : nombre || codigo;
					},
					valueExpr: 'CORR_DIVISION',
					searchEnabled: true,
					showClearButton: false,
					placeholder: 'Seleccione division...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
		];
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'la gerencia';

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

