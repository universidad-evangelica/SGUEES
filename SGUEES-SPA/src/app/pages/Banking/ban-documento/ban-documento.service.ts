import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';

import { BanDocumentoRepository } from './ban-documento.repository';
import { BanDocumento } from './models/ban-documento';

@Injectable({
	providedIn: 'root',
})
export class BanDocumentoService {
	constructor(private repo: BanDocumentoRepository) {}

	esValido(model: BanDocumento, msg: Function): boolean {
		if (!model.ANIO_PERIODO || model.ANIO_PERIODO <= 0) {
			msg('Debe indicar el año del período', NotifyType.Error);
			return false;
		}
		if (!model.MES_PERIODO || model.MES_PERIODO <= 0) {
			msg('Debe seleccionar el mes del período', NotifyType.Error);
			return false;
		}
		if (!model.CORR_TIPO_MOVIMIENTO || model.CORR_TIPO_MOVIMIENTO <= 0) {
			msg('Debe seleccionar el tipo de movimiento', NotifyType.Error);
			return false;
		}
		if (!model.CORR_CUENTA_BANCO || model.CORR_CUENTA_BANCO <= 0) {
			msg('Debe seleccionar la cuenta bancaria', NotifyType.Error);
			return false;
		}
		if (!model.FECHA_EMISION) {
			msg('Debe indicar la fecha de emisión', NotifyType.Error);
			return false;
		}
		if (!model.NOMBRE_PARTIDA?.trim()) {
			msg('Debe digitar el concepto del documento', NotifyType.Error);
			return false;
		}
		if (!model.MONTO_DOCUMENTO || model.MONTO_DOCUMENTO <= 0) {
			msg('Debe indicar el monto del documento', NotifyType.Error);
			return false;
		}
		if (model.CLASE_MOVIMIENTO === 'CHQ' && (!model.CORR_TIPO_CHEQUE || model.CORR_TIPO_CHEQUE <= 0)) {
			msg('Debe seleccionar el tipo de cheque', NotifyType.Error);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO ?? 0 },
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
			{ Parameter: 'MUESTRA_CHEQUES', Value: param.MUESTRA_CHEQUES },
		];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = this.buildKeyParams(model);
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete(this.buildKeyParams(model));
	}

	aplicar(model: any): Observable<IResult> {
		return this.repo.aplicar(model, this.buildKeyParams(model));
	}

	anular(model: any): Observable<IResult> {
		return this.repo.anular(model, this.buildKeyParams(model));
	}

	imprimirCheque(model: any): Observable<IResult> {
		return this.repo.imprimirCheque(model, this.buildKeyParams(model));
	}

	private buildKeyParams(model: any): IParam[] {
		return [
			{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];
	}

	getColumns(muestraCheques: boolean): any {
		const cols: any[] = [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 80, groupIndex: 0 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 70, groupIndex: 1 },
			{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Tipo movimiento', width: 200 },
			{ dataField: 'CORR_DOCUMENTO', caption: 'No. Documento', width: 120 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'Número', width: 120 },
			{ dataField: 'FECHA_EMISION', caption: 'Fecha emisión', dataType: 'date', width: 130 },
			{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Cuenta bancaria', width: 220 },
			{ dataField: 'NOMBRE_BENEFICIARIO', caption: 'Beneficiario', width: 220 },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto', width: 320 },
			{
				dataField: 'MONTO_DOCUMENTO',
				caption: 'Monto',
				width: 130,
				dataType: 'number',
				format: '#,##0.00',
				alignment: 'right',
			},
			{ dataField: 'NOMBRE_ESTADO_DOCUMENTO', caption: 'Estado', width: 130 },
		];

		if (muestraCheques) {
			cols.splice(4, 0, { dataField: 'NOMBRE_TIPO_CHEQUE', caption: 'Tipo cheque', width: 160 });
		}

		return [...cols, ...buildAuditGridColumns()];
	}

	getSummary(): any {
		return {
			groupItems: [
				{
					column: 'CORR_DOCUMENTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
					alignByColumn: true,
					showInGroupFooter: true,
				},
			],
			totalItems: [
				{
					column: 'CORR_DOCUMENTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
				{
					column: 'MONTO_DOCUMENTO',
					summaryType: 'sum',
					valueFormat: '#,##0.00',
					displayFormat: '{0}',
				},
			],
		};
	}

	getItems(): any {
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
				colSpan: 3,
				template: 'CORR_TIPO_MOVIMIENTOLookup',
			},
			{
				dataField: 'ESTADO_DOCUMENTO',
				label: { text: 'Estado' },
				colSpan: 3,
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
				dataField: 'NOMBRE_BENEFICIARIO',
				label: { text: 'Beneficiario' },
				colSpan: 4,
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
}
