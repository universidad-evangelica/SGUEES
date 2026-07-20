import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { BanDocumentoService } from '../ban-documento/ban-documento.service';
import { BanSoliChequeRepository } from './ban-soli-cheque.repository';
import { BanSoliCheque } from './models/ban-soli-cheque';

@Injectable({
	providedIn: 'root',
})
export class BanSoliChequeService {
	constructor(
		private repo: BanSoliChequeRepository,
		private documentoUi: BanDocumentoService
	) {}

	esValido(model: BanSoliCheque, msg: Function): boolean {
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

	insert(model: BanSoliCheque): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: BanSoliCheque): Observable<IResult> {
		return this.repo.update(model, this.buildKeyParams(model));
	}

	delete(model: BanSoliCheque): Observable<IResult> {
		return this.repo.delete(this.buildKeyParams(model));
	}

	enviarSolicitud(model: BanSoliCheque): Observable<IResult> {
		return this.repo.enviarSolicitud(model, this.buildKeyParams(model));
	}

	cancelarSolicitud(model: BanSoliCheque): Observable<IResult> {
		return this.repo.cancelarSolicitud(model, this.buildKeyParams(model));
	}

	getAllAutorizar(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_DOCUMENTO', Value: 0 },
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.getAllAutorizar(xWhere);
	}

	autorizarSolicitud(model: BanSoliCheque): Observable<IResult> {
		return this.repo.autorizarSolicitud(model, this.buildKeyParams(model));
	}

	getAutorizarColumns(): any[] {
		// Columnas planas: no usar getColumns() (tiene groupIndex y auditoría — congela el grid).
		return [
			{
				dataField: 'SELECCION',
				caption: 'Sel.',
				dataType: 'boolean',
				width: 60,
				allowFiltering: false,
				allowSorting: false,
			},
			{ dataField: 'CORR_DOCUMENTO', caption: 'No. solicitud', width: 110 },
			{ dataField: 'FECHA_EMISION', caption: 'Fecha emisión', dataType: 'date', width: 130, format: 'dd/MM/yyyy' },
			{ dataField: 'NOMBRE_TIPO_CHEQUE', caption: 'Tipo cheque', width: 160 },
			{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Cuenta bancaria', width: 220 },
			{ dataField: 'NOMBRE_BENEFICIARIO', caption: 'Beneficiario', width: 220 },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto', width: 280 },
			{
				dataField: 'MONTO_DOCUMENTO',
				caption: 'Monto',
				width: 120,
				dataType: 'number',
				format: '#,##0.00',
				alignment: 'right',
			},
			{ dataField: 'NOMBRE_ESTADO_DOCUMENTO', caption: 'Estado solicitud', width: 130 },
			{ dataField: 'FECHA_SOLICITADO', caption: 'Fecha solicitado', dataType: 'date', width: 130, format: 'dd/MM/yyyy' },
			{ dataField: 'SOLICITADO_POR', caption: 'Solicitado por', width: 140 },
		];
	}

	getColumns(): any[] {
		const cols = this.documentoUi.getColumns(true);
		const estado = cols.find((c: any) => c.dataField === 'NOMBRE_ESTADO_DOCUMENTO');
		if (estado) {
			estado.caption = 'Estado solicitud';
		}
		return cols;
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

	private buildKeyParams(model: BanSoliCheque): IParam[] {
		return [
			{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];
	}
}
