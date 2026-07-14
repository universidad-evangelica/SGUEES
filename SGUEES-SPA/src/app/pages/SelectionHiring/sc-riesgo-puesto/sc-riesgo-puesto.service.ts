import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildRemoteGridWhere, createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
import { ScRiesgoPuesto } from './models/sc-riesgo-puesto';
import { ScRiesgoPuestoRepository } from './sc-riesgo-puesto.repository';

const ESTADO_FIELD = 'ESTADO_RIESGO_PUESTO';
const ES_LISTA_FIELD = 'ES_LISTA';
const ES_LISTA_LABELS = { trueLabel: 'Lista', falseLabel: 'Texto plano' };

function createTipoInformacionColumnConfig(): Record<string, unknown> {
	return {
		dataField: ES_LISTA_FIELD,
		caption: 'Tipo informacion',
		width: 150,
		allowFiltering: true,
		allowHeaderFiltering: true,
		booleanColumnLabels: ES_LISTA_LABELS,
		calculateCellValue: (rowData: Record<string, unknown>) => rowData?.[ES_LISTA_FIELD],
		cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
			const badge = document.createElement('span');
			const isLista = cellInfo.value === true;
			badge.classList.add('tipo-info-badge', isLista ? 'tipo-info-badge--lista' : 'tipo-info-badge--texto');
			badge.textContent = isLista ? ES_LISTA_LABELS.trueLabel : ES_LISTA_LABELS.falseLabel;
			cellElement.innerHTML = '';
			cellElement.appendChild(badge);
		},
		lookup: {
			dataSource: [
				{ value: true, text: ES_LISTA_LABELS.trueLabel },
				{ value: false, text: ES_LISTA_LABELS.falseLabel },
			],
			valueExpr: 'value',
			displayExpr: 'text',
		},
		headerFilter: {
			allowSearch: false,
		},
		selectedFilterOperation: '=',
		defaultSelectedFilterOperation: '=',
		filterOperations: ['='],
		calculateFilterExpression: (filterValue: any, selectedFilterOperation?: string) => {
			if (filterValue === '__ALL__' || filterValue === null || filterValue === undefined) {
				return null;
			}

			if (selectedFilterOperation === 'anyof' && Array.isArray(filterValue)) {
				return filterValue.length ? [ES_LISTA_FIELD, 'anyof', filterValue] : null;
			}

			return [ES_LISTA_FIELD, '=', filterValue];
		},
	};
}

@Injectable({
	providedIn: 'root',
})
export class ScRiesgoPuestoService {
	constructor(private repo: ScRiesgoPuestoRepository) {}

	esValido(model: ScRiesgoPuesto, msg: Function): boolean {
		if (!model.NOMBRE_RIESGO_PUESTO || model.NOMBRE_RIESGO_PUESTO.trim() === '') {
			msg('Debe ingresar el nombre de riesgo de puesto.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_RIESGO_PUESTO.trim().length > 150) {
			msg('El nombre de riesgo de puesto no puede superar 150 caracteres.', NotifyType.Warning);
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
		const xWhere: IParam[] = [{ Parameter: 'CORR_RIESGO_PUESTO', Value: param.CORR_RIESGO_PUESTO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }];
		return this.repo.delete(xWhere);
	}

	activar(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }];
		return this.repo.activar(model, xWhere);
	}

	desactivar(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }];
		return this.repo.desactivar(model, xWhere);
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
						visible: (e: any) => !e.row?.data?.ESTADO_RIESGO_PUESTO,
						onClick: activarClick,
					},
					{
						hint: desactivarHint,
						icon: 'close',
						stylingMode: 'text',
						cssClass: deactivateCssClass,
						visible: (e: any) => !!e.row?.data?.ESTADO_RIESGO_PUESTO,
						onClick: desactivarClick,
					},
				],
			},
			{
				dataField: 'CORR_RIESGO_PUESTO',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_RIESGO_PUESTO', caption: 'Riesgo de Puesto', width: 300 },
			createTipoInformacionColumnConfig(),
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
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
			totalItems: [{ column: 'CORR_RIESGO_PUESTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_RIESGO_PUESTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_RIESGO_PUESTO',
				label: { text: 'Nombre riesgo de puesto' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre riesgo de puesto...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'ES_LISTA',
				label: { text: 'Tipo informacion' },
				editorType: 'dxSelectBox',
				colSpan: 2,
				editorOptions: {
					items: [
						{ value: false, text: 'Texto plano' },
						{ value: true, text: 'Lista' },
					],
					valueExpr: 'value',
					displayExpr: 'text',
				},
			},
			{ dataField: 'ESTADO_RIESGO_PUESTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		return buildRemoteGridWhere(param, ESTADO_FIELD);
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'el riesgo de puesto';

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
