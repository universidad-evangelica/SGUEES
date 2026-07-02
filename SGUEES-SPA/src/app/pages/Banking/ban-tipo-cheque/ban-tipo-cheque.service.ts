import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { BanTipoChequeRepository } from './ban-tipo-cheque.repository';
import { BanTipoCheque } from './models/ban-tipo-cheque';

@Injectable({
	providedIn: 'root',
})
export class BanTipoChequeService {
	constructor(private repo: BanTipoChequeRepository) {}

	esValido(model: BanTipoCheque, msg: Function): boolean {
		if (!model.NOMBRE_TIPO_CHEQUE?.trim()) {
			msg('Debe digitar el nombre del tipo de cheque', 0);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CHEQUE', Value: param.CORR_TIPO_CHEQUE }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CHEQUE', Value: param.CORR_TIPO_CHEQUE }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CHEQUE', Value: model.CORR_TIPO_CHEQUE }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CHEQUE', Value: model.CORR_TIPO_CHEQUE }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_CHEQUE', caption: 'Corr.', width: 80 },
			{ dataField: 'NOMBRE_TIPO_CHEQUE', caption: 'Nombre tipo cheque' },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta contable', width: 140 },
			{ dataField: 'NOMBRE_CLASE_TIPO_CHEQUE', caption: 'Clase tipo cheque', width: 180 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_CHEQUE', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_CHEQUE', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ itemType: 'empty', colSpan: 6 },
			{
				dataField: 'NOMBRE_TIPO_CHEQUE',
				label: { text: 'Nombre tipo cheque' },
				colSpan: 4,
				editorOptions: { showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'CUENTA_CONTABLE',
				label: { text: 'Cuenta contable' },
				colSpan: 4,
				template: 'CUENTA_CONTABLELookup',
			},
			{
				dataField: 'CLASE_TIPO_CHEQUE',
				label: { text: 'Clase tipo cheque' },
				colSpan: 4,
				template: 'CLASE_TIPO_CHEQUELookup',
			},
			{
				dataField: 'CONTABILIZAR_LUEGO_DE_IMPRIMIR',
				label: { text: 'Contabilizar luego de imprimir' },
				colSpan: 4,
				editorType: 'dxCheckBox',
			},
		];
	}
}
