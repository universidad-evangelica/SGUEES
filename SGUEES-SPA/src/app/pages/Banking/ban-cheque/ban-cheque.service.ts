import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { BanDocumentoService } from '../ban-documento/ban-documento.service';
import { BanChequeRepository } from './ban-cheque.repository';
import { BanCheque } from './models/ban-cheque';

@Injectable({
	providedIn: 'root',
})
export class BanChequeService {
	constructor(
		private repo: BanChequeRepository,
		private documentoUi: BanDocumentoService
	) {}

	esValido(model: BanCheque, msg: Function): boolean {
		return this.documentoUi.esValido(model, msg, true);
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO ?? 0 },
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.get(xWhere);
	}

	insert(model: BanCheque): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: BanCheque): Observable<IResult> {
		return this.repo.update(model, this.buildKeyParams(model));
	}

	delete(model: BanCheque): Observable<IResult> {
		return this.repo.delete(this.buildKeyParams(model));
	}

	getColumns(): any[] {
		return this.documentoUi.getColumns(true);
	}

	getItems(): any[] {
		return [
			{
				dataField: 'ANIO_PERIODO',
				label: { text: 'Año' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'MES_PERIODO',
				label: { text: 'Mes' },
				colSpan: 2,
				template: 'MES_PERIODOLookup',
			},
			{
				dataField: 'CORR_TIPO_MOVIMIENTO',
				label: { text: 'Tipo movimiento' },
				colSpan: 2,
				template: 'CORR_TIPO_MOVIMIENTOLookup',
			},
			{
				dataField: 'ESTADO_DOCUMENTO',
				label: { text: 'Estado' },
				colSpan: 2,
				template: 'ESTADO_DOCUMENTOLookup',
			},
			{
				dataField: 'CORR_DOCUMENTO',
				label: { text: 'No. documento' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'NUMERO_DOCUMENTO',
				label: { text: 'Número' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'CORR_CUENTA_BANCO',
				label: { text: 'Cuenta bancaria' },
				colSpan: 4,
				template: 'CORR_CUENTA_BANCOLookup',
			},
			{
				dataField: 'FECHA_EMISION',
				label: { text: 'Fecha emisión' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy' },
			},
			{
				dataField: 'CORR_TIPO_CHEQUE',
				label: { text: 'Tipo cheque' },
				colSpan: 2,
				template: 'CORR_TIPO_CHEQUELookup',
			},
			{
				dataField: 'CORR_PROVEEDOR',
				label: { text: 'Proveedor' },
				colSpan: 2,
				template: 'CORR_PROVEEDORLookup',
				visible: false,
			},
			{
				dataField: 'CORR_EMPLEADO',
				label: { text: 'Empleado' },
				colSpan: 2,
				template: 'CORR_EMPLEADOLookup',
				visible: false,
			},
			{
				dataField: 'CORR_CLIENTE',
				label: { text: 'Cliente' },
				colSpan: 2,
				template: 'CORR_CLIENTELookup',
				visible: false,
			},
			{
				dataField: 'NOMBRE_BENEFICIARIO',
				label: { text: 'Beneficiario' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 255 },
			},
			{
				dataField: 'MONTO_DOCUMENTO',
				label: { text: 'Monto' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { format: '#,##0.00', min: 0 },
			},
			{
				dataField: 'CANTIDAD_LETRAS',
				label: { text: 'Cantidad en letras' },
				colSpan: 4,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'ESTA_CONTABILIZADO',
				label: { text: 'Contabilizado' },
				colSpan: 2,
				editorType: 'dxCheckBox',
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'NOMBRE_PARTIDA',
				label: { text: 'Concepto' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: { height: 64, maxLength: 1000 },
			},
		];
	}

	getSummary(): any {
		return this.documentoUi.getSummary();
	}

	private buildKeyParams(model: BanCheque): IParam[] {
		return [
			{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];
	}
}
