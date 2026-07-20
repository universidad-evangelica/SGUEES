import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { IParam } from 'src/app/FxAPI/IParam';

import { IResult } from 'src/app/FxAPI/IResult';

import { NotifyType } from 'src/app/shared/models/NotifyType';

import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';



import {

	BanDocumentoApiScope,

	BanDocumentoProcesoScope,

	BanDocumentoRepository,

} from './ban-documento.repository';

import { BanDocumento } from './models/ban-documento';



@Injectable({

	providedIn: 'root',

})

export class BanDocumentoService {

	constructor(private repo: BanDocumentoRepository) {}



	esValido(model: BanDocumento, msg: Function, esCheque = false): boolean {

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

		if (esCheque && (!model.CORR_TIPO_CHEQUE || model.CORR_TIPO_CHEQUE <= 0)) {

			msg('Debe seleccionar el tipo de cheque', NotifyType.Error);

			return false;

		}

		return true;

	}



	getAll(scope: BanDocumentoApiScope | BanDocumentoProcesoScope, param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO ?? 0 },
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		if (param.CORR_CUENTA_BANCO) {
			xWhere.push({ Parameter: 'CORR_CUENTA_BANCO', Value: param.CORR_CUENTA_BANCO });
		}
		return this.repo.get(scope, xWhere);
	}



	insert(scope: BanDocumentoApiScope, model: any): Observable<IResult> {

		return this.repo.create(scope, model);

	}



	update(scope: BanDocumentoApiScope, model: any): Observable<IResult> {

		return this.repo.update(scope, model, this.buildKeyParams(model));

	}



	delete(scope: BanDocumentoApiScope, model: any): Observable<IResult> {

		return this.repo.delete(scope, this.buildKeyParams(model));

	}



	aplicar(scope: 'documento-aplicar' | 'cheque-aplicar', model: any): Observable<IResult> {

		return this.repo.aplicar(scope, model, this.buildKeyParams(model));

	}



	anular(scope: 'documento-anular' | 'cheque-anular', model: any): Observable<IResult> {

		return this.repo.anular(scope, model, this.buildKeyParams(model));

	}



	imprimirCheque(model: any): Observable<IResult> {

		return this.repo.imprimirCheque(model, this.buildKeyParams(model));

	}

	getChequeImprimirDatos(model: any): Observable<IResult> {

		return this.repo.getChequeImprimirDatos(this.buildKeyParams(model));

	}



	getAllContabilizar(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_DOCUMENTO', Value: 0 },
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
			{ Parameter: 'FILTRO_ESTA_CONTABILIZADO', Value: param.FILTRO_ESTA_CONTABILIZADO ?? -1 },
		];
		return this.repo.getAllContabilizar(xWhere);
	}

	contabilizar(model: any): Observable<IResult> {
		return this.repo.contabilizar(model, this.buildKeyParams(model));
	}

	getContabilizarColumns(agruparPorEstado = false): any[] {
		return [
			...this.getColumns(false),
			{ dataField: 'NOMBRE_TIPO_CHEQUE', caption: 'Tipo cheque', width: 160 },
			{ dataField: 'CANTIDAD_LETRAS', caption: 'Cantidad en letras', width: 240 },
			{
				dataField: 'ESTA_CONTABILIZADO',
				caption: 'Contabilizado',
				dataType: 'boolean',
				width: 110,
				allowFiltering: false,
				groupIndex: agruparPorEstado ? 0 : undefined,
			},
		];
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



	getColumns(esCheque: boolean): any {

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



		if (esCheque) {

			cols.splice(4, 0, { dataField: 'NOMBRE_TIPO_CHEQUE', caption: 'Tipo cheque', width: 160 });

			cols.splice(
				cols.findIndex((c) => c.dataField === 'MONTO_DOCUMENTO') + 1,
				0,
				{ dataField: 'CANTIDAD_LETRAS', caption: 'Cantidad en letras', width: 280 },
				{ dataField: 'ESTA_CONTABILIZADO', caption: 'Contabilizado', dataType: 'boolean', width: 110 }
			);

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



	getItems(esCheque: boolean): any {

		const items: any[] = [

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

		];



		if (esCheque) {

			items.push({

				dataField: 'CORR_TIPO_CHEQUE',

				label: { text: 'Tipo cheque' },

				colSpan: 2,

				template: 'CORR_TIPO_CHEQUELookup',

			});

			items.push(

				{

					dataField: 'CORR_PROVEEDOR',

					label: { text: 'Proveedor' },

					colSpan: 2,

					template: 'CORR_PROVEEDORLookup',

				},

				{

					dataField: 'CORR_EMPLEADO',

					label: { text: 'Empleado' },

					colSpan: 2,

					template: 'CORR_EMPLEADOLookup',

				},

				{

					dataField: 'CORR_CLIENTE',

					label: { text: 'Cliente' },

					colSpan: 2,

					template: 'CORR_CLIENTELookup',

				}

			);

		}



		items.push(

			{

				dataField: 'NOMBRE_BENEFICIARIO',

				label: { text: 'Beneficiario' },

				colSpan: esCheque ? 2 : 4,

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

			}

		);



		return items;

	}

	getConsultaViewItems(esCheque: boolean): any[] {
		const items: any[] = [
			{ dataField: 'ANIO_PERIODO', label: { text: 'Año' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ dataField: 'MES_PERIODO', label: { text: 'Mes' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', label: { text: 'Tipo movimiento' }, colSpan: 3, editorOptions: { readOnly: true } },
			{ dataField: 'NOMBRE_ESTADO_DOCUMENTO', label: { text: 'Estado' }, colSpan: 3, editorOptions: { readOnly: true } },
			{ dataField: 'CORR_DOCUMENTO', label: { text: 'No. documento' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ dataField: 'NUMERO_DOCUMENTO', label: { text: 'Número' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ dataField: 'NOMBRE_CUENTA_BANCO', label: { text: 'Cuenta bancaria' }, colSpan: 4, editorOptions: { readOnly: true } },
			{
				dataField: 'FECHA_EMISION',
				label: { text: 'Fecha emisión' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { readOnly: true, displayFormat: 'dd/MM/yyyy' },
			},
		];

		if (esCheque) {
			items.push({ dataField: 'NOMBRE_TIPO_CHEQUE', label: { text: 'Tipo cheque' }, colSpan: 2, editorOptions: { readOnly: true } });
			items.push({
				dataField: 'CANTIDAD_LETRAS',
				label: { text: 'Cantidad en letras' },
				colSpan: 6,
				editorOptions: { readOnly: true },
			});
		}

		items.push(
			{ dataField: 'NOMBRE_BENEFICIARIO', label: { text: 'Beneficiario' }, colSpan: esCheque ? 2 : 4, editorOptions: { readOnly: true } },
			{
				dataField: 'MONTO_DOCUMENTO',
				label: { text: 'Monto' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { readOnly: true, format: '#,##0.00' },
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
				editorOptions: { readOnly: true, height: 64 },
			}
		);

		return items;
	}

	getDetalleConsultaColumns(): any[] {
		return [
			{ dataField: 'CORR_DOCUMENTO_DETA', caption: 'Línea', width: 70 },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
			{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre cuenta', minWidth: 220 },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Centro costo', minWidth: 180 },
			{ dataField: 'NOMBRE_TRAN', caption: 'Concepto', minWidth: 240 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', width: 110, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', width: 110, format: '#,##0.00', alignment: 'right' },
		];
	}

	getChequeImprimirColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Cuenta bancaria', width: 220, groupIndex: 0 },
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 80, groupIndex: 1 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 70, groupIndex: 2 },
			{ dataField: 'FECHA_EMISION', caption: 'Fecha emisión', dataType: 'date', width: 130 },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto', width: 360 },
			{ dataField: 'NOMBRE_BENEFICIARIO', caption: 'Beneficiario', width: 220 },
			{
				dataField: 'MONTO_DOCUMENTO',
				caption: 'Monto',
				width: 130,
				dataType: 'number',
				format: '#,##0.00',
				alignment: 'right',
			},
			{ dataField: 'NOMBRE_ESTADO_DOCUMENTO', caption: 'Estado', width: 120 },
			{ dataField: 'USUARIO_CREA', caption: 'Hecho por', width: 120 },
		];
	}

	getChequeImprimirSummary(): any {
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

	descontabilizar(model: any): Observable<IResult> {
		return this.repo.descontabilizar(model, this.buildKeyParams(model));
	}

}


