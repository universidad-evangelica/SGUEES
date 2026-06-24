import { Injectable } from '@angular/core';
import dxSelectBox from 'devextreme/ui/select_box';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ScDescriptorRiesgoPuesto } from './models/sc-descriptor-riesgo-puesto';
import { ScDescriptorRiesgoPuestoRepository } from './sc-descriptor-riesgo-puesto.repository';

@Injectable({ providedIn: 'root' })
export class ScDescriptorRiesgoPuestoService {
	constructor(private repo: ScDescriptorRiesgoPuestoRepository) {}

	esValido(model: ScDescriptorRiesgoPuesto, msg: Function): boolean {
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
		const xWhere: IParam[] = [];
		const columnFilters = ['CORR_RIESGO_PUESTO', 'NOMBRE_RIESGO_PUESTO', 'USUARIO_CREA', 'ESTACION_CREA', 'FECHA_CREA', 'USUARIO_ACTU', 'ESTACION_ACTU', 'FECHA_ACTU'];
		if (param.BUSQUEDA) xWhere.push({ Parameter: 'BUSQUEDA', Value: param.BUSQUEDA });
		if (param.ESTADO_RIESGO_PUESTO !== null && param.ESTADO_RIESGO_PUESTO !== undefined) xWhere.push({ Parameter: 'ESTADO_RIESGO_PUESTO', Value: param.ESTADO_RIESGO_PUESTO });
		if (param.PAGE) xWhere.push({ Parameter: 'PAGE', Value: param.PAGE });
		if (param.PAGE_SIZE) xWhere.push({ Parameter: 'PAGE_SIZE', Value: param.PAGE_SIZE });
		columnFilters.forEach((field) => {
			const value = param[field];
			if (this.hasColumnFilter(value, field)) xWhere.push({ Parameter: field, Value: value });
		});
		return this.repo.getAll(xWhere);
	}

	private hasColumnFilter(value: any, field: string): boolean {
		if (value === null || value === undefined || String(value).trim() === '') return false;
		return !(field === 'CORR_RIESGO_PUESTO' && Number(value) === 0);
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_RIESGO_PUESTO', Value: param.CORR_RIESGO_PUESTO }]);
	}

	insert(model: any): Observable<IResult> { return this.repo.create(model); }
	update(model: any): Observable<IResult> { return this.repo.update(model, [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]); }
	delete(model: any): Observable<IResult> { return this.repo.delete([{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]); }
	activar(model: any): Observable<IResult> { return this.repo.activar(model, [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]); }
	desactivar(model: any): Observable<IResult> { return this.repo.desactivar(model, [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]); }

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
				type: 'buttons', name: 'btnAcciones', caption: 'Options', width: 150, minWidth: 150,
				allowResizing: false, fixed: true, fixedPosition: 'left', alignment: 'center',
				buttons: [
					{ hint: editHint, icon: 'edit', stylingMode: 'text', cssClass: editCssClass, onClick: editClick },
					{ hint: deleteHint, icon: 'trash', stylingMode: 'text', cssClass: deleteCssClass, onClick: deleteClick },
					{ hint: activarHint, icon: 'refresh', stylingMode: 'text', cssClass: activateCssClass, visible: (event: any) => !event.row?.data?.ESTADO_RIESGO_PUESTO, onClick: activarClick },
					{ hint: desactivarHint, icon: 'close', stylingMode: 'text', cssClass: deactivateCssClass, visible: (event: any) => !!event.row?.data?.ESTADO_RIESGO_PUESTO, onClick: desactivarClick },
				],
			},
			{ dataField: 'CORR_RIESGO_PUESTO', caption: 'Corr.', width: 100 },
			{ dataField: 'NOMBRE_RIESGO_PUESTO', caption: 'Riesgo de Puesto', width: 300 },
			{
				dataField: 'ESTADO_RIESGO_PUESTO',
				caption: 'Estado',
				width: 140,
				allowFiltering: true,
				allowHeaderFiltering: true,
				cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					const badge = document.createElement('span');
					badge.classList.add('estado-badge', cellInfo.value ? 'estado-badge--activo' : 'estado-badge--inactivo');
					badge.textContent = cellInfo.value ? 'Activo' : 'Inactivo';
					cellElement.innerHTML = '';
					cellElement.appendChild(badge);
				},
				lookup: {
					dataSource: [{ value: true, text: 'Activo' }, { value: false, text: 'Inactivo' }],
					valueExpr: 'value',
					displayExpr: 'text',
				},
				filterCellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					new dxSelectBox(cellElement, {
						dataSource: [{ value: true, text: 'Activo' }, { value: false, text: 'Inactivo' }],
						displayExpr: 'text',
						valueExpr: 'value',
						value: cellInfo.value,
						placeholder: 'Seleccione...',
						showClearButton: false,
						onValueChanged: (event: any) => cellInfo.setValue(event.value),
					});
				},
				calculateFilterExpression: (filterValue: any) => {
					if (filterValue === '__ALL__' || filterValue === null || filterValue === undefined) {
						return null;
					}

					return ['ESTADO_RIESGO_PUESTO', '=', filterValue];
				},
			},
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 200 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return { totalItems: [{ column: 'CORR_RIESGO_PUESTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }] };
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_RIESGO_PUESTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_RIESGO_PUESTO',
				label: { text: 'Nombre riesgo de puesto' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre riesgo de puesto...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
			},
			{ dataField: 'ESTADO_RIESGO_PUESTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}
}
