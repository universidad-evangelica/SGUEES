import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildRemoteGridWhere, createEstadoColumnConfig } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
import { ScRequerimientoOrganizacional } from './models/sc-requerimiento-organizacional';
import { ScRequerimientoOrganizacionalRepository } from './sc-requerimiento-organizacional.repository';

const ESTADO_FIELD = 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL';

@Injectable({ providedIn: 'root' })
export class ScRequerimientoOrganizacionalService {
	constructor(private repo: ScRequerimientoOrganizacionalRepository) {}

	esValido(model: ScRequerimientoOrganizacional, msg: Function): boolean {
		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion de requerimiento organizacional.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 200) {
			msg('La descripcion de requerimiento organizacional no puede superar 200 caracteres.', NotifyType.Warning);
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
		return this.repo.get([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: param.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	activar(model: any): Observable<IResult> {
		return this.repo.activar(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	desactivar(model: any): Observable<IResult> {
		return this.repo.desactivar(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	getColumns(onEditClick: Function, onDeleteClick: Function, onActivarClick: Function, onDesactivarClick: Function, canEdit = true, canDelete = true): any {
		const editHint = canEdit ? 'Editar registro' : 'No tiene permiso para editar registros.';
		const deleteHint = canDelete ? 'Eliminar registro' : 'No tiene permiso para eliminar registros.';
		const activarHint = canEdit ? 'Activar registro' : 'No tiene permiso para activar registros.';
		const desactivarHint = canEdit ? 'Desactivar registro' : 'No tiene permiso para desactivar registros.';
		const editCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-edit';
		const deleteCssClass = canDelete ? 'sguees-grid-action-delete' : 'sguees-action-no-delete';
		const activateCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-activate';
		const deactivateCssClass = canEdit ? 'sguees-grid-action-delete' : 'sguees-action-no-deactivate';
		const editClick = canEdit ? onEditClick : () => undefined;
		const deleteClick = canDelete ? onDeleteClick : () => undefined;
		const activarClick = canEdit ? onActivarClick : () => undefined;
		const desactivarClick = canEdit ? onDesactivarClick : () => undefined;

		return [
			{
				type: 'buttons',
				name: 'btnAcciones',
				caption: 'Options',
				width: 150,
				minWidth: 150,
				allowResizing: false,
				fixed: true,
				fixedPosition: 'left',
				alignment: 'center',
				buttons: [
					{ hint: editHint, icon: 'edit', stylingMode: 'text', cssClass: editCssClass, onClick: editClick },
					{ hint: deleteHint, icon: 'trash', stylingMode: 'text', cssClass: deleteCssClass, onClick: deleteClick },
					{
						hint: activarHint,
						icon: 'refresh',
						stylingMode: 'text',
						cssClass: activateCssClass,
						visible: (event: any) => !event.row?.data?.ESTADO_REQUERIMIENTO_ORGANIZACIONAL,
						onClick: activarClick,
					},
					{
						hint: desactivarHint,
						icon: 'close',
						stylingMode: 'text',
						cssClass: deactivateCssClass,
						visible: (event: any) => !!event.row?.data?.ESTADO_REQUERIMIENTO_ORGANIZACIONAL,
						onClick: desactivarClick,
					},
				],
			},
			{
				dataField: 'CORR_REQUERIMIENTO_ORGANIZACIONAL',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD),
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
			totalItems: [{ column: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 5,
				editorOptions: { placeholder: 'Descripcion...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		return buildRemoteGridWhere(param, ESTADO_FIELD);
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'el requerimiento organizacional';

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
