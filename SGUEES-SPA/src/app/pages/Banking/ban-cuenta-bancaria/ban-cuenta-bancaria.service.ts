import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { BanCuentaBancariaRepository } from './ban-cuenta-bancaria.repository';
import { BanCuentaBancaria } from './models/ban-cuenta-bancaria';

@Injectable({
	providedIn: 'root',
})
export class BanCuentaBancariaService {
	constructor(private repo: BanCuentaBancariaRepository) {}

	esValido(model: BanCuentaBancaria, msg: Function): boolean {
		if (!model.NUMERO_CUENTA_BANCO?.trim()) {
			msg('Debe digitar el número de cuenta bancaria', 0);
			return false;
		}
		if (!model.CORR_BANCO) {
			msg('Debe seleccionar el banco', 0);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CUENTA_BANCO', Value: param.CORR_CUENTA_BANCO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CUENTA_BANCO', Value: param.CORR_CUENTA_BANCO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CUENTA_BANCO', Value: model.CORR_CUENTA_BANCO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CUENTA_BANCO', Value: model.CORR_CUENTA_BANCO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CUENTA_BANCO', caption: 'Corr.', width: 80 },
			{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Nombre cuenta' },
			{ dataField: 'NUMERO_CUENTA_BANCO', caption: 'Número cuenta', width: 140 },
			{ dataField: 'NOMBRE_BANCO', caption: 'Banco', width: 180 },
			{ dataField: 'NOMBRE_TIPO_CUENTA_BANCO', caption: 'Tipo cuenta', width: 120 },
			{ dataField: 'NOMBRE_ESTADO_CUENTA', caption: 'Estado', width: 100 },
			{ dataField: 'NOMBRE_MONEDA', caption: 'Moneda', width: 100 },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta contable', width: 130 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CUENTA_BANCO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_CUENTA_BANCO', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'NUMERO_CUENTA_BANCO',
				label: { text: 'Número cuenta' },
				colSpan: 3,
				editorOptions: { showClearButton: true, maxLength: 50 },
			},
			{
				dataField: 'NOMBRE_CUENTA',
				label: { text: 'Nombre cuenta' },
				colSpan: 3,
				editorOptions: { showClearButton: true, maxLength: 150 },
			},
			{
				dataField: 'CORR_BANCO',
				label: { text: 'Banco' },
				colSpan: 4,
				template: 'CORR_BANCOLookup',
			},
			{
				dataField: 'TIPO_CUENTA_BANCO',
				label: { text: 'Tipo cuenta' },
				colSpan: 4,
				template: 'TIPO_CUENTA_BANCOLookup',
			},
			{
				dataField: 'ESTADO_CUENTA',
				label: { text: 'Estado cuenta' },
				colSpan: 4,
				template: 'ESTADO_CUENTALookup',
			},
			{
				dataField: 'CLASE_CHEQUE',
				label: { text: 'Clase cheque' },
				colSpan: 4,
				template: 'CLASE_CHEQUELookup',
			},
			{
				dataField: 'CORR_CENTRO_COSTO',
				label: { text: 'Centro costo' },
				colSpan: 4,
				template: 'CORR_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CORR_MONEDA',
				label: { text: 'Moneda' },
				colSpan: 4,
				template: 'CORR_MONEDALookup',
			},
			{
				dataField: 'CUENTA_CONTABLE',
				label: { text: 'Cuenta contable' },
				colSpan: 4,
				template: 'CUENTA_CONTABLELookup',
			},
			{
				dataField: 'NOMBRE_REPORTE',
				label: { text: 'Nombre reporte' },
				colSpan: 4,
				editorOptions: { showClearButton: true, maxLength: 50 },
			},
			{
				dataField: 'CODIGO_EMPRESARIAL',
				label: { text: 'Código empresarial' },
				colSpan: 4,
				editorOptions: { showClearButton: true, maxLength: 25 },
			},
			{
				dataField: 'CODIGO_EMPRESARIAL_PROV',
				label: { text: 'Código empresarial prov.' },
				colSpan: 4,
				editorOptions: { showClearButton: true, maxLength: 25 },
			},
			{ dataField: 'NO_PERMITE_MODIFICAR', label: { text: 'No permite modificar' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'VALIDAR_SALDO', label: { text: 'Validar saldo' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'PAGA_PLANILLA', label: { text: 'Paga planilla' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'VALIDA_FECHA', label: { text: 'Valida fecha' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'NO_PERMITE_CHEQUES', label: { text: 'No permite cheques' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'USA_TRANSACIONES_UNI', label: { text: 'Usa transacciones uni' }, colSpan: 2, editorType: 'dxCheckBox' },
		];
	}
}
