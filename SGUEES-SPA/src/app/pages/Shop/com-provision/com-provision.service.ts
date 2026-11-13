import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComProvisionRepository } from './com-provision.repository';
import { ComProvisionDetaRepository } from './com-provision-deta/com-provision-deta.repository';
import { ComProvisionContaRepository } from './com-provision-conta/com-provision-conta.repository';
import { ComProvision } from './models/com-provision';

@Injectable({
	providedIn: 'root',
})
export class ComProvisionService {
	constructor(
		private repo: ComProvisionRepository,
		private repoDeta: ComProvisionDetaRepository,
		private repoConta: ComProvisionContaRepository
	) {}

	//#region <Validadores>
	esValido(model: ComProvision, msg: Function): boolean {
		if (!model.CORR_PROVEEDOR || model.CORR_PROVEEDOR <= 0) {
			msg('Debe seleccionar el proveedor', NotifyType.Error);
			return false;
		}
		if (!model.FECHA_PROVISION) {
			msg('Debe indicar la fecha de provisión', NotifyType.Error);
			return false;
		}
		if (!(model.NOMBRE_PARTIDA || '').trim()) {
			msg('Debe digitar el nombre de la partida', NotifyType.Error);
			return false;
		}
		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: param.CORR_PROVISION },
		];
		return this.repo.getOne(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: model.CORR_PROVISION },
		];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: model.CORR_PROVISION },
		];
		return this.repo.delete(xWhere);
	}

	pkWhere(model: any): IParam[] {
		return [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: model.CORR_PROVISION },
		];
	}

	Aplicar(model: any): Observable<IResult> {
		return this.repo.Aplicar(model, this.pkWhere(model));
	}

	Anular(model: any): Observable<IResult> {
		return this.repo.Anular(model, this.pkWhere(model));
	}

	DesAplicar(model: any): Observable<IResult> {
		return this.repo.DesAplicar(model, this.pkWhere(model));
	}

	BorrarDetalle(model: any): Observable<IResult> {
		return this.repo.BorrarDetalle(model, this.pkWhere(model));
	}

	GenerarConta(model: any): Observable<IResult> {
		return this.repo.GenerarConta(model, this.pkWhere(model));
	}

	getAllDesAplicar(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.getAllDesAplicar(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_PROVISION', caption: 'Corr.', width: 90 },
			{ dataField: 'FECHA_PROVISION', caption: 'Fecha', width: 110, dataType: 'date' },
			{ dataField: 'NOMBRE_ESTADO_PROVISION', caption: 'Estado', width: 110 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 280 },
			{ dataField: 'NOMBRE_BENEFICIARIO', caption: 'Beneficiario', width: 220 },
			{ dataField: 'MONTO_PAGO', caption: 'Monto', width: 120, format: '#,##0.00' },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Descripción partida', width: 320 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase partida', width: 160 },
			{ dataField: 'CORR_PARTIDA', caption: 'Partida', width: 90 },
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 80 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 70 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{ column: 'CORR_PROVISION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' },
				{ column: 'MONTO_PAGO', summaryType: 'sum', valueFormat: '#,##0.00', displayFormat: 'Total: {0}' },
			],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CORR_PROVISION',
				label: { text: 'Corr.' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'ESTADO_PROVISION',
				label: { text: 'Estado' },
				colSpan: 2,
				editorOptions: { readOnly: true },
				template: 'ESTADO_PROVISIONLookup',
			},
			{
				dataField: 'FECHA_PROVISION',
				label: { text: 'Fecha provisión' },
				editorType: 'dxDateBox',
				colSpan: 2,
				editorOptions: { placeholder: 'Fecha...', useMaskBehavior: true, displayFormat: 'dd/MM/yyyy' },
			},
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
				editorOptions: { readOnly: true },
				template: 'MES_PERIODOLookup',
			},
			{
				dataField: 'CORR_PROVEEDOR',
				label: { text: 'Proveedor' },
				colSpan: 5,
				editorOptions: { placeholder: 'Proveedor...', showClearButton: false },
				template: 'CORR_PROVEEDORLookup',
			},
			{
				dataField: 'NOMBRE_BENEFICIARIO',
				label: { text: 'Beneficiario' },
				colSpan: 5,
				editorOptions: { placeholder: 'Beneficiario...', showClearButton: true, maxLength: 255 },
			},
			{
				dataField: 'MONTO_PAGO',
				label: { text: 'Monto' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0.00', readOnly: true },
			},
			{
				dataField: 'NO_CONTABILIZAR',
				label: { text: 'No contabilizar al importar' },
				editorType: 'dxCheckBox',
				colSpan: 2,
				editorOptions: {},
			},
			{
				dataField: 'FECHA_ANULACION',
				label: { text: 'Fecha anulación' },
				editorType: 'dxDateBox',
				colSpan: 2,
				editorOptions: { useMaskBehavior: true, displayFormat: 'dd/MM/yyyy', showClearButton: true },
			},
			{
				dataField: 'NOMBRE_PARTIDA',
				label: { text: 'Descripción partida' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Descripción partida...', height: 70, maxLength: 1000 },
			},
		];
	}

	//#region <Detalle documentos>
	getAllCOM_PROVISION_DETA(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: param.CORR_PROVISION },
		];
		return this.repoDeta.get(xWhere);
	}

	getAllDisponibles(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: param.CORR_PROVISION },
			{ Parameter: 'OPCION_CONSULTA', Value: 1 },
		];
		return this.repoDeta.getAllDisponibles(xWhere);
	}

	insertCOM_PROVISION_DETA(model: any): Observable<IResult> {
		return this.repoDeta.create(model);
	}

	updateCOM_PROVISION_DETA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: model.CORR_PROVISION },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoDeta.update(model, xWhere);
	}

	deleteCOM_PROVISION_DETA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: model.CORR_PROVISION },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoDeta.delete(xWhere);
	}
	//#endregion

	//#region <Contabilidad>
	getAllCOM_PROVISION_CONTA(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: param.CORR_PROVISION },
		];
		return this.repoConta.get(xWhere);
	}

	insertCOM_PROVISION_CONTA(model: any): Observable<IResult> {
		return this.repoConta.create(model);
	}

	updateCOM_PROVISION_CONTA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: model.CORR_PROVISION },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoConta.update(model, xWhere);
	}

	deleteCOM_PROVISION_CONTA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PROVISION', Value: model.CORR_PROVISION },
			{ Parameter: 'CORR_DETA', Value: model.CORR_DETA },
		];
		return this.repoConta.delete(xWhere);
	}
	//#endregion
}
