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
			{ dataField: 'CORR_CENTRO_COSTO', caption: 'Corr.' },
			{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código' },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre del Centro' },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta Contable' },
			{ dataField: 'NOMBRE_TIPO_CENTRO_COSTO', caption: 'Tipo' },
			{ dataField: 'NOMBRE_ESTADO_CENTRO_COSTO', caption: 'Estado' },
			{ dataField: 'NOMBRE_UNIDAD_NEGOCIO', caption: 'Unidad de Negocio' },
			{ dataField: 'CODIGO_TERMINACION', caption: 'Código de Terminación' },
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
				dataField: 'ESTADO_CENTRO_COSTO',
				label: { text: 'Estado' },
				colSpan: 2,
				editorOptions: { showClearButton: false },
				template: 'ESTADO_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CORR_TIPO_CENTRO_COSTO',
				label: { text: 'Tipo' },
				colSpan: 2,
				editorOptions: { showClearButton: false },
				template: 'CORR_TIPO_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CORR_UNIDAD_NEGOCIO',
				label: { text: 'Unidad de Negocio' },
				colSpan: 3,
				editorOptions: { showClearButton: false },
				template: 'CORR_UNIDAD_NEGOCIOLookup',
			},
			{
				dataField: 'CODIGO_CENTRO_COSTO',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'CODIGO_TERMINACION',
				label: { text: 'Terminación' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'CUENTA_CONTABLE',
				label: { text: 'Cuenta Contable' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'CORR_AREA_FUNCIONAL',
				label: { text: 'Área Funcional' },
				colSpan: 2,
				editorOptions: { showClearButton: false },
				template: 'CORR_AREA_FUNCIONALLookup',
			},
			{
				dataField: 'NOMBRE_CENTRO',
				label: { text: 'Centro' },
				colSpan: 8,
				editorOptions: { showClearButton: true },
			},
		];
	}
}
