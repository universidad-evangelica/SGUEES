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
			{
				dataField: 'CORR_CONCILIACION',
				label: { text: 'Correlativo' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'FECHA_CONCILIACION',
				label: { text: 'Fecha' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy' },
			},
			{
				dataField: 'CORR_CUENTA_BANCO',
				label: { text: 'Cuenta bancaria' },
				colSpan: 5,
				template: 'CORR_CUENTA_BANCOLookup',
			},
			{
				dataField: 'SALDO_CUENTA_CONTA',
				label: { text: 'Saldo contable' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { format: '#,##0.00' },
			},
			{
				dataField: 'SALDO_CUENTA_BANCO',
				label: { text: 'Saldo bancario' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { format: '#,##0.00' },
			},
			{
				dataField: 'ESTADO_CONCILIACION',
				label: { text: 'Estado' },
				colSpan: 2,
				template: 'ESTADO_CONCILIACIONLookup',
			},
			{ itemType: 'empty', colSpan: 2 },
		];
	}

	getResumenLineaColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_LINEA_TRABAJO', caption: 'Línea de trabajo', minWidth: 320 },
			{ dataField: 'MONTO', caption: 'Monto', width: 140, format: '#,##0.00', alignment: 'right' },
		];
	}

	getDetaColumns(): any[] {
		return [
			{ dataField: 'FECHA_MOVIMIENTO', caption: 'Fecha', dataType: 'date', width: 100 },
			{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Tipo mov.', width: 130 },
			{ dataField: 'NUMERO_REFERENCIA_BANCO', caption: 'Referencia', width: 110 },
			{ dataField: 'CODIGO_TRANSACCION', caption: 'Código', width: 90 },
			{ dataField: 'DESCRIPCION_TRANSACCION', caption: 'Descripción', minWidth: 140 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', width: 100, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', width: 100, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 60 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 50 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'No. doc.', width: 90 },
			{ dataField: 'NOMBRE_CORTO_CLASE', caption: 'Clase part.', width: 90 },
			{ dataField: 'NOMBRE_TRAN', caption: 'Detalle transacción', minWidth: 180 },
			{ dataField: 'MONTO_CARGO_CONTA', caption: 'Cargo conta', width: 100, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'MONTO_ABONO_CONTA', caption: 'Abono conta', width: 100, format: '#,##0.00', alignment: 'right' },
		];
	}

	getPendienteColumns(): any[] {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 60 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 50 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'No. doc.', width: 90 },
			{ dataField: 'FECHA_PARTIDA', caption: 'Fecha', dataType: 'date', width: 100 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase part.', width: 100 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', width: 100, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', width: 100, format: '#,##0.00', alignment: 'right' },
			{ dataField: 'NOMBRE_TRAN', caption: 'Descripción del movimiento', minWidth: 200 },
		];
	}

	getMoviColumns(): any[] {
		return [
			{ dataField: 'CORR_MOVIMIENTO', caption: 'Corr.', width: 60 },
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 60 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 50 },
			{ dataField: 'FECHA_MOVIMIENTO', caption: 'Fecha', dataType: 'date', width: 100 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'No. partida', width: 90 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase', width: 80 },
			{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Tipo de movimiento', width: 140 },
			{ dataField: 'NUMERO_REFERENCIA_BANCO', caption: 'No. referencia', width: 110 },
			{ dataField: 'NOMBRE_TRAN', caption: 'Detalle transacción', minWidth: 200 },
			{ dataField: 'MONTO', caption: 'Monto', width: 110, format: '#,##0.00', alignment: 'right' },
		];
	}
}
