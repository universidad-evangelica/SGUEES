import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComPagoRepository } from './com-pago.repository';
import { ComPago } from './models/com-pago';
import { ComPagoDetaRepository } from './com-pago-deta/com-pago-deta.repository';
import { ComPagoContaRepository } from './com-pago-conta/com-pago-conta.repository';
import { ComPagoArchivoRepository } from './com-pago-archivo/com-pago-archivo.repository';

@Injectable({
	providedIn: 'root',
})
export class ComPagoService {
	constructor(
		private repo: ComPagoRepository,
		private repoDeta: ComPagoDetaRepository,
		private repoConta: ComPagoContaRepository,
		private repoArchivo: ComPagoArchivoRepository
	) {}

	//#region <Validadores>
	esValido(model: ComPago, msg: Function): boolean {
		if (!model.CORR_TIPO_DOC || model.CORR_TIPO_DOC <= 0) {
			msg('Debe seleccionar el tipo de documento', NotifyType.Error);
			return false;
		}
		if (!model.CORR_PROVEEDOR || model.CORR_PROVEEDOR <= 0) {
			msg('Debe seleccionar el proveedor', NotifyType.Error);
			return false;
		}
		if (!model.FECHA_SOLICITUD) {
			msg('Debe indicar la fecha de solicitud', NotifyType.Error);
			return false;
		}
		if (!model.FECHA_PAGO) {
			msg('Debe indicar la fecha de pago', NotifyType.Error);
			return false;
		}
		return true;
	}
	// #endregion

	private pagoKeys(model: any): IParam[] {
		return [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: model.CORR_PAGO },
		];
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		return this.repo.get(this.pagoKeys(param));
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, this.pagoKeys(model));
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete(this.pagoKeys(model));
	}

	Aplicar(model: any): Observable<IResult> {
		return this.repo.Aplicar(model, this.pagoKeys(model));
	}

	Anular(model: any): Observable<IResult> {
		return this.repo.Anular(model, this.pagoKeys(model));
	}

	BorrarDetalle(model: any): Observable<IResult> {
		return this.repo.BorrarDetalle(model, this.pagoKeys(model));
	}

	ActualizarCuenta(model: any): Observable<IResult> {
		return this.repo.ActualizarCuenta(model, this.pagoKeys(model));
	}

	AsignarArchivo(model: any): Observable<IResult> {
		return this.repo.AsignarArchivo(model, this.pagoKeys(model));
	}

	GenerarConta(model: any): Observable<IResult> {
		return this.repo.GenerarConta(model, this.pagoKeys(model));
	}

	getAllDoc(param: any): Observable<IResult> {
		return this.repo.getAllDoc(this.pagoKeys(param));
	}

	getBeneficiario(param: any): Observable<IResult> {
		return this.repo.getBeneficiario(this.pagoKeys(param));
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 80, groupIndex: 0 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 70, groupIndex: 1 },
			{ dataField: 'CORR_PAGO', caption: 'Corr.', width: 90 },
			{ dataField: 'NOMBRE_ESTADO_PAGO', caption: 'Estado', width: 110 },
			{ dataField: 'FECHA_SOLICITUD', caption: 'Fecha Solicitud', width: 120, dataType: 'date' },
			{ dataField: 'FECHA_PAGO', caption: 'Fecha Pago', width: 115, dataType: 'date' },
			{ dataField: 'NOMBRE_TIPO_DOC', caption: 'Tipo Documento', width: 200 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 250 },
			{ dataField: 'NOMBRE_BENEFICIARIO', caption: 'Beneficiario', width: 220 },
			{ dataField: 'MONTO_PAGO', caption: 'Monto Pago', width: 130, format: '#,##0.00' },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto', width: 280 },
			{ dataField: 'CORR_ARCHIVO', caption: 'Archivo', width: 90 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{ column: 'CORR_PAGO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' },
				{ column: 'MONTO_PAGO', summaryType: 'sum', valueFormat: '#,##0.00', displayFormat: 'Total: {0}' },
			],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CORR_PAGO',
				label: { text: 'Corr. Pago' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'ESTADO_PAGO',
				label: { text: 'Estado' },
				colSpan: 2,
				editorOptions: { readOnly: true },
				template: 'ESTADO_PAGOLookup',
			},
			{
				dataField: 'FECHA_SOLICITUD',
				label: { text: 'Fecha Solicitud' },
				editorType: 'dxDateBox',
				colSpan: 2,
				editorOptions: { useMaskBehavior: true, displayFormat: 'dd/MM/yyyy' },
			},
			{
				dataField: 'FECHA_PAGO',
				label: { text: 'Fecha Pago' },
				editorType: 'dxDateBox',
				colSpan: 2,
				editorOptions: { useMaskBehavior: true, displayFormat: 'dd/MM/yyyy' },
			},
			{
				dataField: 'CORR_TIPO_DOC',
				label: { text: 'Tipo Doc.' },
				colSpan: 4,
				template: 'CORR_TIPO_DOCLookup',
			},
			{
				dataField: 'CORR_PROVEEDOR',
				label: { text: 'Proveedor' },
				colSpan: 5,
				template: 'CORR_PROVEEDORLookup',
			},
			{
				dataField: 'NOMBRE_BENEFICIARIO',
				label: { text: 'Beneficiario' },
				colSpan: 5,
				editorOptions: { placeholder: 'Beneficiario...', showClearButton: true },
			},
			{
				dataField: 'CORR_CUENTA_BANCO',
				label: { text: 'Cuenta Banco' },
				colSpan: 4,
				template: 'CORR_CUENTA_BANCOLookup',
			},
			{
				dataField: 'CORR_TIPO_CHEQUE',
				label: { text: 'Tipo Cheque' },
				colSpan: 3,
				template: 'CORR_TIPO_CHEQUELookup',
			},
			{
				dataField: 'MONTO_PAGO',
				label: { text: 'Monto Pago' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0.00', readOnly: true },
			},
			{
				dataField: 'PAGADO_CAJA_CHICA',
				label: { text: 'Caja Chica' },
				editorType: 'dxCheckBox',
				colSpan: 2,
			},
			{
				dataField: 'CORR_TIENDA',
				label: { text: 'Tienda' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0', showClearButton: true },
			},
			{
				dataField: 'CORR_CAJA',
				label: { text: 'Caja' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0', showClearButton: true },
			},
			{
				dataField: 'CORR_ARCHIVO',
				label: { text: 'Archivo' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0', readOnly: true },
			},
			{
				dataField: 'NOMBRE_PARTIDA',
				label: { text: 'Concepto / Partida' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Concepto...', showClearButton: true, height: 70 },
			},
		];
	}

	//#region <COM_PAGO_DETA>
	getAllCOM_PAGO_DETA(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: param.CORR_PAGO },
		];
		return this.repoDeta.get(xWhere);
	}

	getAllPendientes(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: param.CORR_PAGO },
		];
		return this.repoDeta.getPendientes(xWhere);
	}

	insertCOM_PAGO_DETA(model: any): Observable<IResult> {
		return this.repoDeta.create(model);
	}

	updateCOM_PAGO_DETA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: model.CORR_PAGO },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoDeta.update(model, xWhere);
	}

	deleteCOM_PAGO_DETA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: model.CORR_PAGO },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoDeta.delete(xWhere);
	}
	//#endregion

	//#region <COM_PAGO_CONTA>
	getAllCOM_PAGO_CONTA(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: param.CORR_PAGO },
		];
		return this.repoConta.get(xWhere);
	}

	insertCOM_PAGO_CONTA(model: any): Observable<IResult> {
		return this.repoConta.create(model);
	}

	updateCOM_PAGO_CONTA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: model.CORR_PAGO },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoConta.update(model, xWhere);
	}

	deleteCOM_PAGO_CONTA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: model.CORR_PAGO },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoConta.delete(xWhere);
	}
	//#endregion

	//#region <COM_PAGO_ARCHIVO>
	getAllCOM_PAGO_ARCHIVO(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_CUENTA_BANCO', Value: param.CORR_CUENTA_BANCO ?? 0 },
		];
		return this.repoArchivo.get(xWhere);
	}

	getAllAPagar(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_CUENTA_BANCO', Value: param.CORR_CUENTA_BANCO ?? 0 },
			{ Parameter: 'CORR_ARCHIVO', Value: param.CORR_ARCHIVO ?? 0 },
		];
		return this.repoArchivo.getAllAPagar(xWhere);
	}
	//#endregion
}
