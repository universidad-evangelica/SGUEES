import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildRemoteGridWhere } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
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

	getDistinctValues(param: any): Observable<IResult> {
		return this.repo.getDistinctValues(this.buildWhere(param));
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

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DIVISION', Value: model.CORR_DIVISION }]);
	}

	getColumns(onEditClick: Function, onDeleteClick: Function, canEdit = true, canDelete = true): any {
		const editHint = canEdit ? 'Editar registro' : 'No tiene permiso para editar registros.';
		const deleteHint = canDelete ? 'Eliminar registro' : 'No tiene permiso para eliminar registros.';
		const editCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-edit';
		const deleteCssClass = canDelete ? 'sguees-grid-action-delete' : 'sguees-action-no-delete';
		const editClick = canEdit ? onEditClick : () => undefined;
		const deleteClick = canDelete ? onDeleteClick : () => undefined;

		return [
			{
				type: 'buttons',
				name: 'btnAcciones',
				caption: 'Options',
				width: 100,
				minWidth: 100,
				allowResizing: false,
				fixed: true,
				fixedPosition: 'left',
				alignment: 'center',
				buttons: [
					{ hint: editHint, icon: 'edit', stylingMode: 'text', cssClass: editCssClass, onClick: editClick },
					{ hint: deleteHint, icon: 'trash', stylingMode: 'text', cssClass: deleteCssClass, onClick: deleteClick },
				],
			},
			{
				dataField: 'CORR_DIVISION',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_DIVISION', caption: 'Division', width: 300 },
			{ dataField: 'CODIGO_DIVISION', caption: 'Codigo', width: 120 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 200 },
			{
				dataField: 'FECHA_CREA',
				caption: 'Fecha Crea',
				width: 200,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_CREA'),
			},
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
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
			totalItems: [{ column: 'CORR_DIVISION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DIVISION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_DIVISION',
				label: { text: 'Nombre division' },
				colSpan: 5,
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
		return buildRemoteGridWhere(param, '');
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
