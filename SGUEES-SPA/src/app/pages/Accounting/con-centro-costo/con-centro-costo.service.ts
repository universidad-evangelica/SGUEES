import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ConCentroCostoRepository } from './con-centro-costo.repository';
import { ConCentroCosto } from './models/con-centro-costo';

@Injectable({
	providedIn: 'root',
})
export class ConCentroCostoService {
	constructor(private repo: ConCentroCostoRepository) {}

	//#region <Validadores>
	esValido(model: ConCentroCosto, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: param.CORR_CENTRO_COSTO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: param.CORR_CENTRO_COSTO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: model.CORR_CENTRO_COSTO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: model.CORR_CENTRO_COSTO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre Centro', width: 250 },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta Contable', width: 150 },
			{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Codigo Centro Costo', width: 150 },
			{ dataField: 'NOMBRE_TIPO_CENTRO_COSTO', caption: 'Nombre Tipo Centro Costo', width: 250 },
			{ dataField: 'CLASE_CENTRO_COSTO', caption: 'Clase Centro Costo', width: 150 },
			{ dataField: 'ESTADO_CENTRO_COSTO', caption: 'Estado Centro Costo', width: 150 },
			{ dataField: 'NOMBRE_ESTADO_CENTRO_COSTO', caption: 'Nombre Estado Centro Costo', width: 250 },
			{ dataField: 'NOMBRE_UNIDAD_NEGOCIO', caption: 'Nombre Unidad Negocio', width: 250 },
			{ dataField: 'CODIGO_UNIDAD_NEGOCIO', caption: 'Codigo Unidad Negocio', width: 150 },
			{ dataField: 'NOMBRE_AREA_FUNCIONAL', caption: 'Nombre Area Funcional', width: 250 },
			{ dataField: 'CODIGO_TERMINACION', caption: 'Codigo Terminacion', width: 150 },
			{ dataField: 'NOMBRE_EMPLEADO', caption: 'Nombre Empleado', width: 250 },
			{ dataField: 'FECHA_INICIAL', caption: 'Fecha Inicial', width: 115, dataType: 'date' },
			{ dataField: 'FECHA_FINAL', caption: 'Fecha Final', width: 115, dataType: 'date' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CENTRO_COSTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CUENTA_CONTABLE',
				label: { text: 'Cuenta Contable' },
				colSpan: 1,
				editorOptions: { placeholder: 'Cuenta Contable...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'CODIGO_CENTRO_COSTO',
				label: { text: 'Codigo Centro Costo' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Centro Costo...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'CORR_TIPO_CENTRO_COSTO',
				label: { text: 'Corr Tipo Centro Costo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Tipo Centro Costo...', showClearButton: false },
				template: 'CORR_TIPO_CENTRO_COSTOLookup',
			},
			{
				dataField: 'ESTADO_CENTRO_COSTO',
				label: { text: 'Estado Centro Costo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Estado Centro Costo...', showClearButton: false },
				template: 'ESTADO_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CORR_UNIDAD_NEGOCIO',
				label: { text: 'Corr Unidad Negocio' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Unidad Negocio...', showClearButton: false },
				template: 'CORR_UNIDAD_NEGOCIOLookup',
			},
			{
				dataField: 'CORR_AREA_FUNCIONAL',
				label: { text: 'Corr Area Funcional' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Area Funcional...', showClearButton: false },
				template: 'CORR_AREA_FUNCIONALLookup',
			},
			{
				dataField: 'CODIGO_TERMINACION',
				label: { text: 'Codigo Terminacion' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Terminacion...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'CORR_EMPLEADO_JEFE',
				label: { text: 'Corr Empleado Jefe' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Empleado Jefe...', showClearButton: false },
				template: 'CORR_EMPLEADO_JEFELookup',
			},
			{
				dataField: 'CORR_CLIENTE',
				label: { text: 'Corr Cliente' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Cliente...', showClearButton: false },
				template: 'CORR_CLIENTELookup',
			},
			{
				dataField: 'FECHA_INICIAL',
				label: { text: 'Fecha Inicial' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Fecha Inicial...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
			{
				dataField: 'FECHA_FINAL',
				label: { text: 'Fecha Final' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Fecha Final...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
		];
	}
}
