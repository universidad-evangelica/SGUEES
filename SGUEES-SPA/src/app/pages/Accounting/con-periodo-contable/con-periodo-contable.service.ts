import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ConPeriodoContableRepository } from './con-periodo-contable.repository';
import { ConPeriodoContable } from './models/con-periodo-contable';

export const MESES_PERIODO = [
	{ MES_PERIODO: 1, NOMBRE_MES_PERIODO: 'Enero' },
	{ MES_PERIODO: 2, NOMBRE_MES_PERIODO: 'Febrero' },
	{ MES_PERIODO: 3, NOMBRE_MES_PERIODO: 'Marzo' },
	{ MES_PERIODO: 4, NOMBRE_MES_PERIODO: 'Abril' },
	{ MES_PERIODO: 5, NOMBRE_MES_PERIODO: 'Mayo' },
	{ MES_PERIODO: 6, NOMBRE_MES_PERIODO: 'Junio' },
	{ MES_PERIODO: 7, NOMBRE_MES_PERIODO: 'Julio' },
	{ MES_PERIODO: 8, NOMBRE_MES_PERIODO: 'Agosto' },
	{ MES_PERIODO: 9, NOMBRE_MES_PERIODO: 'Septiembre' },
	{ MES_PERIODO: 10, NOMBRE_MES_PERIODO: 'Octubre' },
	{ MES_PERIODO: 11, NOMBRE_MES_PERIODO: 'Noviembre' },
	{ MES_PERIODO: 12, NOMBRE_MES_PERIODO: 'Diciembre' },
];

@Injectable({
	providedIn: 'root',
})
export class ConPeriodoContableService {
	readonly estadosNombre: { [key: string]: string } = {
		AB: 'Abierto',
		PC: 'Proceso de Cierre',
		CE: 'Cerrado',
	};

	constructor(private repo: ConPeriodoContableRepository) {}

	enriquecer(row: any): any {
		if (!row) {
			return row;
		}
		const mes = MESES_PERIODO.find((m) => m.MES_PERIODO === row.MES_PERIODO);
		row.NOMBRE_MES_PERIODO = mes ? mes.NOMBRE_MES_PERIODO : '';
		row.NOMBRE_ESTADO_PERIODO_CON = this.estadosNombre[row.ESTADO_PERIODO_CON] || '';
		row.NOMBRE_ESTADO_PERIODO_BAN = this.estadosNombre[row.ESTADO_PERIODO_BAN] || '';
		row.NOMBRE_ESTADO_PERIODO_VEN = this.estadosNombre[row.ESTADO_PERIODO_VEN] || '';
		row.NOMBRE_ESTADO_PERIODO_ACT = this.estadosNombre[row.ESTADO_PERIODO_ACT] || '';
		row.NOMBRE_ESTADO_PERIODO_INV = this.estadosNombre[row.ESTADO_PERIODO_INV] || '';
		row.NOMBRE_ESTADO_PERIODO_PLA = this.estadosNombre[row.ESTADO_PERIODO_PLA] || '';
		row.NOMBRE_ESTADO_PERIODO_COM = this.estadosNombre[row.ESTADO_PERIODO_COM] || '';
		return row;
	}

	esValido(model: ConPeriodoContable, msg: Function): boolean {
		if (!model.ANIO_PERIODO || model.ANIO_PERIODO < 2000) {
			msg('Debe indicar un Año válido', NotifyType.Warning);
			return false;
		}
		if (!model.MES_PERIODO || model.MES_PERIODO < 1 || model.MES_PERIODO > 12) {
			msg('Debe seleccionar el Mes', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año' },
			{ dataField: 'NOMBRE_MES_PERIODO', caption: 'Mes' },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_ACT', caption: 'Estado Activo Fijo' },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_BAN', caption: 'Estado Bancos' },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_COM', caption: 'Estado Compras' },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_CON', caption: 'Estado Contabilidad' },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_INV', caption: 'Estado Inventario' },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_PLA', caption: 'Estado Planilla' },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_VEN', caption: 'Estado Ventas' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'ANIO_PERIODO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(soloLecturaClave: boolean = false): any {
		return [
			{
				dataField: 'ANIO_PERIODO',
				label: { text: 'Año' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { showClearButton: true, format: '#', min: 2000, max: 2100, readOnly: soloLecturaClave },
				validationRules: [{ type: 'required', message: 'El Año es requerido' }],
			},
			{
				dataField: 'MES_PERIODO',
				label: { text: 'Mes' },
				colSpan: 2,
				editorType: 'dxSelectBox',
				editorOptions: {
					dataSource: MESES_PERIODO,
					valueExpr: 'MES_PERIODO',
					displayExpr: 'NOMBRE_MES_PERIODO',
					searchEnabled: true,
					readOnly: soloLecturaClave,
				},
				validationRules: [{ type: 'required', message: 'El Mes es requerido' }],
			},
			{ itemType: 'empty', colSpan: 4 },
			{
				itemType: 'group',
				caption: 'Estado de Periodo Por Módulo y Fecha de Cierre',
				colSpan: 4,
				colCount: 2,
				items: [
					{ dataField: 'NOMBRE_ESTADO_PERIODO_CON', label: { text: 'Contable' }, colSpan: 2, editorOptions: { readOnly: true } },
					{ dataField: 'NOMBRE_ESTADO_PERIODO_VEN', label: { text: 'Ventas' }, colSpan: 2, editorOptions: { readOnly: true } },
					{ dataField: 'NOMBRE_ESTADO_PERIODO_INV', label: { text: 'Inventario' }, colSpan: 2, editorOptions: { readOnly: true } },
					{ dataField: 'NOMBRE_ESTADO_PERIODO_COM', label: { text: 'Compras' }, colSpan: 2, editorOptions: { readOnly: true } },
					{ dataField: 'NOMBRE_ESTADO_PERIODO_BAN', label: { text: 'Bancos' }, colSpan: 2, editorOptions: { readOnly: true } },
					{ dataField: 'NOMBRE_ESTADO_PERIODO_ACT', label: { text: 'Activo Fijo' }, colSpan: 2, editorOptions: { readOnly: true } },
					{ dataField: 'NOMBRE_ESTADO_PERIODO_PLA', label: { text: 'Planilla' }, colSpan: 2, editorOptions: { readOnly: true } },
				],
			},
		];
	}
}
