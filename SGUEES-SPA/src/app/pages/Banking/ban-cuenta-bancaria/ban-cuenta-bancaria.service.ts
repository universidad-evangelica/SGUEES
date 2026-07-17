import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

import { BanCuentaBancariaRepository } from './ban-cuenta-bancaria.repository';
import { BanCuentaBancaria } from './models/ban-cuenta-bancaria';

const ESTADO_FIELD = 'ESTADO_CUENTA_BANCARIA';

@Injectable({
	providedIn: 'root',
})
export class BanCuentaBancariaService {
	constructor(private repo: BanCuentaBancariaRepository) {}

	esValido(model: BanCuentaBancaria, msg: Function): boolean {
		if (!model.NUMERO_CUENTA_BANCO?.trim()) {
			msg('Debe digitar el número de cuenta bancaria', NotifyType.Warning);
			return false;
		}
		if (!model.CORR_BANCO) {
			msg('Debe seleccionar el banco', NotifyType.Warning);
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

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_CUENTA_BANCO', Value: model.CORR_CUENTA_BANCO },
		]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CUENTA_BANCO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Nombre cuenta' , width: 350},
			{ dataField: 'NUMERO_CUENTA_BANCO', caption: 'Número cuenta', width: 350 },
			{ dataField: 'NOMBRE_BANCO', caption: 'Banco', width: 300 },
			{ dataField: 'NOMBRE_TIPO_CUENTA_BANCO', caption: 'Tipo cuenta', width: 200 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			{ dataField: 'NOMBRE_MONEDA', caption: 'Moneda', width: 180 },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta contable', width: 200 },
			...buildAuditGridColumns(),
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
				colSpan: 3,
				template: 'CORR_BANCOLookup',
			},
			{
				dataField: 'TIPO_CUENTA_BANCO',
				label: { text: 'Tipo cuenta' },
				colSpan: 3,
				template: 'TIPO_CUENTA_BANCOLookup',
			},
			{
				dataField: 'CLASE_CHEQUE',
				label: { text: 'Clase cheque' },
				colSpan: 2,
				template: 'CLASE_CHEQUELookup',
			},
			{
				dataField: 'CORR_CENTRO_COSTO',
				label: { text: 'Centro costo' },
				colSpan: 3,
				template: 'CORR_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CUENTA_CONTABLE',
				label: { text: 'Cuenta contable' },
				colSpan: 3,
				template: 'CUENTA_CONTABLELookup',
			},
			{
				dataField: 'CORR_MONEDA',
				label: { text: 'Moneda' },
				colSpan: 2,
				template: 'CORR_MONEDALookup',
			},
			{
				dataField: 'NOMBRE_REPORTE',
				label: { text: 'Nombre reporte' },
				colSpan: 3,
				editorOptions: { showClearButton: true, maxLength: 50 },
			},
			{
				dataField: 'CODIGO_EMPRESARIAL',
				label: { text: 'Código empresarial' },
				colSpan: 3,
				editorOptions: { showClearButton: true, maxLength: 25 },
			},
			{
				dataField: 'CODIGO_EMPRESARIAL_PROV',
				label: { text: 'Código empresarial prov.' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 25 },
			},
			{ dataField: 'NO_PERMITE_MODIFICAR', label: { text: 'No permite modificar' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'VALIDAR_SALDO', label: { text: 'Validar saldo' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'PAGA_PLANILLA', label: { text: 'Paga planilla' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'VALIDA_FECHA', label: { text: 'Valida fecha' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'NO_PERMITE_CHEQUES', label: { text: 'No permite cheques' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'USA_TRANSACIONES_UNI', label: { text: 'Usa transacciones uni' }, colSpan: 2, editorType: 'dxCheckBox' },
			{ dataField: 'ESTADO_CUENTA_BANCARIA', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}
}
