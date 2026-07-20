import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { BanConciliaBancariaRepository } from './ban-concilia-bancaria.repository';
import { BanConciliaBancaria } from './models/ban-concilia-bancaria';

@Injectable({ providedIn: 'root' })
export class BanConciliaBancariaService {
	constructor(private repo: BanConciliaBancariaRepository) {}

	esValido(model: BanConciliaBancaria, msg: Function): boolean {
		if (!model.CORR_CUENTA_BANCO || model.CORR_CUENTA_BANCO <= 0) {
			msg('Debe seleccionar la cuenta bancaria', NotifyType.Error);
			return false;
		}
		if (!model.FECHA_CONCILIACION) {
			msg('Debe indicar la fecha de conciliación', NotifyType.Error);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll([
			{ Parameter: 'CORR_CONCILIACION', Value: param.CORR_CONCILIACION ?? 0 },
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, this.buildKeyParams(model));
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete(this.buildKeyParams(model));
	}

	getPendientes(model: BanConciliaBancaria): Observable<IResult> {
		return this.repo.getPendientes(this.buildKeyParams(model));
	}

	getResumen(model: BanConciliaBancaria, aumentaDisminuye: number): Observable<IResult> {
		return this.repo.getResumen([
			...this.buildKeyParams(model),
			{ Parameter: 'AUMENTA_DISMINUYE', Value: aumentaDisminuye },
		]);
	}

	getMovi(model: BanConciliaBancaria): Observable<IResult> {
		return this.repo.getMovi(this.buildKeyParams(model));
	}

	aplicar(model: BanConciliaBancaria): Observable<IResult> {
		return this.repo.aplicar(model, this.buildKeyParams(model));
	}

	desAplicar(model: BanConciliaBancaria): Observable<IResult> {
		return this.repo.desAplicar(model, this.buildKeyParams(model));
	}

	generarConciliacion(model: BanConciliaBancaria): Observable<IResult> {
		return this.repo.generarConciliacion(model, this.buildKeyParams(model));
	}

	reconstruirMovimientos(model: BanConciliaBancaria): Observable<IResult> {
		return this.repo.reconstruirMovimientos(model, this.buildKeyParams(model));
	}

	forzarConciliacion(payload: any): Observable<IResult> {
		return this.repo.forzarConciliacion(payload);
	}

	revertirConciliacion(payload: any): Observable<IResult> {
		return this.repo.revertirConciliacion(payload);
	}

	marcarConciliado(payload: any): Observable<IResult> {
		return this.repo.marcarConciliado(payload);
	}

	importarExcel(payload: any): Observable<IResult> {
		return this.repo.importarExcel(payload);
	}

	buildKeyParams(model: any): IParam[] {
		return [
			{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
			{ Parameter: 'CORR_CUENTA_BANCO', Value: model.CORR_CUENTA_BANCO },
			{ Parameter: 'CORR_CONCILIACION', Value: model.CORR_CONCILIACION },
		];
	}

	getColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Cuenta bancaria', width: 220 },
			{ dataField: 'CORR_CONCILIACION', caption: 'No. conciliación', width: 120 },
			{ dataField: 'FECHA_CONCILIACION', caption: 'Fecha', dataType: 'date', width: 120 },
			{ dataField: 'SALDO_CUENTA_BANCO', caption: 'Saldo banco', width: 130, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'SALDO_CUENTA_CONTA', caption: 'Saldo contable', width: 130, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'SEGUN_LIBROS', caption: 'Según libros', width: 130, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'NOMBRE_ESTADO_CONCILIACION', caption: 'Estado', width: 120 },
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{ column: 'CORR_CONCILIACION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' },
			],
		};
	}

	getItems(): any[] {
		return [
			{ dataField: 'CORR_CUENTA_BANCO', label: { text: 'Cuenta bancaria' }, colSpan: 4, template: 'CORR_CUENTA_BANCOLookup' },
			{ dataField: 'CORR_CONCILIACION', label: { text: 'No. conciliación' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'FECHA_CONCILIACION',
				label: { text: 'Fecha conciliación' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy' },
			},
			{
				dataField: 'SALDO_CUENTA_BANCO',
				label: { text: 'Saldo banco' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { format: '#,##0.00' },
			},
			{
				dataField: 'SALDO_CUENTA_CONTA',
				label: { text: 'Saldo contable' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { format: '#,##0.00' },
			},
			{ dataField: 'ESTADO_CONCILIACION', label: { text: 'Estado' }, colSpan: 2, template: 'ESTADO_CONCILIACIONLookup' },
			{
				dataField: 'SEGUN_LIBROS',
				label: { text: 'Según libros' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { readOnly: true, format: '#,##0.00' },
			},
		];
	}

	getResumenColumns(): any[] {
		return [
			{ dataField: 'TIPO_RESUMEN', caption: 'Tipo', width: 120 },
			{ dataField: 'NOMBRE_LINEA_TRABAJO', caption: 'Línea trabajo', minWidth: 220 },
			{ dataField: 'MONTO', caption: 'Monto', width: 130, format: '#,##0.00', alignment: 'right' },
		];
	}

	getDetaColumns(): any[] {
		return [
			{ dataField: 'FECHA_MOVIMIENTO', caption: 'Fecha', dataType: 'date', width: 110 },
			{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Tipo movimiento', width: 160 },
			{ dataField: 'NUMERO_REFERENCIA_BANCO', caption: 'Referencia', width: 140 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', width: 110, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', width: 110, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'Doc. contable', width: 120 },
			{ dataField: 'NOMBRE_TRAN', caption: 'Descripción', minWidth: 180 },
		];
	}

	getPendienteColumns(): any[] {
		return [
			{ dataField: 'FECHA_PARTIDA', caption: 'Fecha', dataType: 'date', width: 110 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'Documento', width: 120 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase', width: 140 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', width: 110, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', width: 110, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'NOMBRE_TRAN', caption: 'Descripción', minWidth: 180 },
			{ dataField: 'ESTA_CONCILIA', caption: 'Conciliado', dataType: 'boolean', width: 90 },
		];
	}

	getMoviColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_LINEA_TRABAJO', caption: 'Línea trabajo', width: 180 },
			{ dataField: 'FECHA_MOVIMIENTO', caption: 'Fecha', dataType: 'date', width: 110 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'Documento', width: 120 },
			{ dataField: 'NUMERO_REFERENCIA_BANCO', caption: 'Referencia banco', width: 140 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', width: 110, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', width: 110, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'NOMBRE_TRAN', caption: 'Descripción', minWidth: 200 },
		];
	}
}
