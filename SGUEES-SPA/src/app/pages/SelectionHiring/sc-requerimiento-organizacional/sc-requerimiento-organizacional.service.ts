import { Injectable } from '@angular/core';
import dxSelectBox from 'devextreme/ui/select_box';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ScRequerimientoOrganizacional } from './models/sc-requerimiento-organizacional';
import { ScRequerimientoOrganizacionalRepository } from './sc-requerimiento-organizacional.repository';

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
		const xWhere: IParam[] = [];
		const columnFilters = ['CORR_REQUERIMIENTO_ORGANIZACIONAL', 'DESCRIPCION', 'USUARIO_CREA', 'ESTACION_CREA', 'FECHA_CREA', 'USUARIO_ACTU', 'ESTACION_ACTU', 'FECHA_ACTU'];
		if (param.BUSQUEDA) xWhere.push({ Parameter: 'BUSQUEDA', Value: param.BUSQUEDA });
		if (param.ESTADO_REQUERIMIENTO_ORGANIZACIONAL !== null && param.ESTADO_REQUERIMIENTO_ORGANIZACIONAL !== undefined) xWhere.push({ Parameter: 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL', Value: param.ESTADO_REQUERIMIENTO_ORGANIZACIONAL });
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
		return !(field === 'CORR_REQUERIMIENTO_ORGANIZACIONAL' && Number(value) === 0);
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: param.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	insert(model: any): Observable<IResult> { return this.repo.create(model); }
	update(model: any): Observable<IResult> { return this.repo.update(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]); }
	delete(model: any): Observable<IResult> { return this.repo.delete([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]); }
	activar(model: any): Observable<IResult> { return this.repo.activar(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]); }
	desactivar(model: any): Observable<IResult> { return this.repo.desactivar(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]); }

	getColumns(onEditClick: Function, onDeleteClick: Function, onActivarClick: Function, onDesactivarClick: Function): any {
		return [
			{
				type: 'buttons', name: 'btnAcciones', caption: 'Options', width: 150, minWidth: 150,
				allowResizing: false, fixed: true, fixedPosition: 'left', alignment: 'center',
				buttons: [
					{ hint: 'Editar registro', icon: 'edit', stylingMode: 'text', cssClass: 'sguees-grid-action-edit', onClick: onEditClick },
					{ hint: 'Eliminar registro', icon: 'trash', stylingMode: 'text', cssClass: 'sguees-grid-action-delete', onClick: onDeleteClick },
					{ hint: 'Activar registro', icon: 'check', stylingMode: 'text', cssClass: 'sguees-grid-action-edit', visible: (event: any) => !event.row?.data?.ESTADO_REQUERIMIENTO_ORGANIZACIONAL, onClick: onActivarClick },
					{ hint: 'Desactivar registro', icon: 'close', stylingMode: 'text', cssClass: 'sguees-grid-action-delete', visible: (event: any) => !!event.row?.data?.ESTADO_REQUERIMIENTO_ORGANIZACIONAL, onClick: onDesactivarClick },
				],
			},
			{ dataField: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', caption: 'Corr.', width: 100 },
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 300 },
			{
				dataField: 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL',
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
				editorOptions: {
					dataSource: [{ value: true, text: 'Activo' }, { value: false, text: 'Inactivo' }],
					valueExpr: 'value',
					displayExpr: 'text',
					showClearButton: true,
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

					return ['ESTADO_REQUERIMIENTO_ORGANIZACIONAL', '=', filterValue];
				},
				headerFilter: {
					dataSource: [{ text: 'Activo', value: ['ESTADO_REQUERIMIENTO_ORGANIZACIONAL', '=', true] }, { text: 'Inactivo', value: ['ESTADO_REQUERIMIENTO_ORGANIZACIONAL', '=', false] }],
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
		return { totalItems: [{ column: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }] };
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 5,
				editorOptions: { placeholder: 'Descripcion...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'La descripcion es obligatoria' }],
			},
			{ dataField: 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}
}
