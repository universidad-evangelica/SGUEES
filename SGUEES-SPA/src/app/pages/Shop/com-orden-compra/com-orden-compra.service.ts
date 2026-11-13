import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComOrdenCompraRepository } from './com-orden-compra.repository';
import { ComOrdenCompraDetaRepository } from './com-orden-compra-deta/com-orden-compra-deta.repository';
import { ComOrdenCompraAutorizacionesRepository } from './com-orden-compra-autorizaciones/com-orden-compra-autorizaciones.repository';
import { ComOrdenCompra } from './models/com-orden-compra';

@Injectable({
	providedIn: 'root',
})
export class ComOrdenCompraService {
	constructor(
		private repo: ComOrdenCompraRepository,
		private repodeta: ComOrdenCompraDetaRepository,
		private repoAutorizaciones: ComOrdenCompraAutorizacionesRepository,
	) {}

	esValido(model: ComOrdenCompra, msg: Function): boolean {
		if (!model.CORR_PROVEEDOR || model.CORR_PROVEEDOR <= 0) {
			msg('Debe seleccionar el proveedor', NotifyType.Error);
			return false;
		}
		if (!model.FECHA_ORDEN_COMPRA) {
			msg('Debe indicar la fecha de la orden', NotifyType.Error);
			return false;
		}
		return true;
	}

	private pkWhere(model: any): IParam[] {
		return [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'CORR_ORDEN_COMPRA', Value: model.CORR_ORDEN_COMPRA },
		];
	}

	private toTable(model: any): any {
		return {
			ANIO_PERIODO: model.ANIO_PERIODO,
			CORR_ORDEN_COMPRA: model.CORR_ORDEN_COMPRA || 0,
			CORR_TIPO_DOC: model.CORR_TIPO_DOC || null,
			CORR_PROVEEDOR: model.CORR_PROVEEDOR,
			ATENCION_A: model.ATENCION_A || null,
			FECHA_ORDEN: model.FECHA_ORDEN_COMPRA,
			ESTADO_ORDEN: model.ESTADO_ORDEN_COMPRA || 'DI',
			OBSERVACIONES: model.OBSERVACIONES || null,
			COMPRA_TOTAL: model.TOTAL_ORDEN ?? model.COMPRA_TOTAL ?? 0,
			MONTO_EN_LETRAS: model.TOTAL_EN_LETRAS || null,
			NUMERO_ORDEN_COMPRA: model.NUMERO_ORDEN_COMPRA || null,
			CORR_CONDICION_PAGO: model.CORR_CONDICION_PAGO || null,
			CORR_FORMA_PAGO: model.CORR_FORMA_PAGO || null,
			DETALLE_FORMA_PAGO: model.DETALLE_FORMA_PAGO || null,
		};
	}

	private toDetaTable(model: any): any {
		const cantidad = model.CANTIDAD_COMPRA ?? model.CANTIDAD ?? 0;
		const precio = model.PRECIO_UNITARIO ?? 0;
		const subtotal = model.MONTO_SUBTOTAL ?? cantidad * precio;
		return {
			ANIO_PERIODO: model.ANIO_PERIODO,
			CORR_ORDEN_COMPRA: model.CORR_ORDEN_COMPRA,
			CORR_ORDEN_COMPRA_DETA: model.CORR_ORDEN_COMPRA_DETA || 0,
			CODIGO_ITEM: model.CODIGO_ITEM || '',
			CORR_UNIDAD_MEDIDA: model.CORR_UNIDAD_MEDIDA || null,
			CANTIDAD_COMPRA: cantidad,
			PRECIO_UNITARIO: precio,
			MONTO_SUBTOTAL: subtotal,
			ANIO_PERIODO_COTIZACION: model.ANIO_PERIODO_COTIZACION || null,
			CORR_COTIZACION: model.CORR_COTIZACION || null,
			CORR_COTIZACION_DETA: model.CORR_COTIZACION_DETA || null,
			CORR_CENTRO_COSTO: model.CORR_CENTRO_COSTO || null,
			CANTIDAD_RECIBIDA: model.CANTIDAD_RECIBIDA ?? 0,
		};
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
			{ Parameter: 'OPCION_CONSULTA', Value: param.OPCION_CONSULTA },
		];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		return this.repo.getOne(this.pkWhere(param));
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.toTable(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.toTable(model), this.pkWhere(model));
	}

	delete(param: any): Observable<IResult> {
		return this.repo.delete(this.pkWhere(param));
	}

	Aplicar(model: any): Observable<IResult> {
		return this.repo.Aplicar(this.toTable(model), this.pkWhere(model));
	}

	Anular(model: any): Observable<IResult> {
		return this.repo.Anular(this.toTable(model), this.pkWhere(model));
	}

	DesAplicar(model: any): Observable<IResult> {
		return this.repo.DesAplicar(this.toTable(model), this.pkWhere(model));
	}

	getPDF(param: any): Observable<Blob> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
			{ Parameter: 'NUMERO_ORDEN_COMPRA', Value: param.NUMERO_ORDEN ?? param.NUMERO_ORDEN_COMPRA },
		];
		return this.repo.getPDF(xWhere);
	}

	getAllCOM_ORDEN_COMPRA_DETA(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'CORR_ORDEN_COMPRA', Value: param.CORR_ORDEN_COMPRA },
		];
		return this.repodeta.get(xWhere);
	}

	insertDETA(model: any): Observable<IResult> {
		return this.repodeta.create(this.toDetaTable(model));
	}

	updateDETA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'CORR_ORDEN_COMPRA', Value: model.CORR_ORDEN_COMPRA },
			{ Parameter: 'CORR_ORDEN_COMPRA_DETA', Value: model.CORR_ORDEN_COMPRA_DETA },
		];
		return this.repodeta.update(this.toDetaTable(model), xWhere);
	}

	deleteDETA(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'CORR_ORDEN_COMPRA', Value: model.CORR_ORDEN_COMPRA },
			{ Parameter: 'CORR_ORDEN_COMPRA_DETA', Value: model.CORR_ORDEN_COMPRA_DETA },
		];
		return this.repodeta.delete(xWhere);
	}

	getAllCOM_ORDEN_COMPRA_AUTORIZACIONES(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
		];
		return this.repoAutorizaciones.get(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'FECHA_ORDEN_COMPRA', caption: 'Fecha', width: 115, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'NUMERO_ORDEN_COMPRA', caption: 'No. Orden Compra', width: 140 },
			{ dataField: 'CORR_ORDEN_COMPRA', caption: 'Corr.', width: 90 },
			{ dataField: 'NOMBRE_ESTADO_ORDEN_COMPRA', caption: 'Estado', width: 120 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 250 },
			{ dataField: 'CORR_CUADRO_COMPARATIVO', caption: 'No. Cuadro', width: 110 },
			{ dataField: 'AUTORIZACIONES_REALIZADAS', caption: 'Autorizaciones Realizadas', width: 280 },
			{ dataField: 'NOMBRE_CONTACTO', caption: 'Contacto', width: 200 },
			{ dataField: 'CORREO_ELECTRONICO_PROVEEDOR', caption: 'Correo', width: 220 },
			{ dataField: 'TELEFONO_PROVEEDOR', caption: 'Tel.', width: 100 },
			{ dataField: 'NOMBRE_CONDICION_PAGO', caption: 'Condición de Pago', width: 180 },
			{ dataField: 'NOMBRE_FORMA_PAGO', caption: 'Forma de Pago', width: 160 },
			{ dataField: 'DETALLE_FORMA_PAGO', caption: 'Detalle Pago', width: 180 },
			{ dataField: 'NUMERO_SOLI_COTIZACION', caption: 'No. Solicitud Compra', width: 160 },
			{ dataField: 'NOMBRE_DEPARTAMENTO', caption: 'Unidad Solicitante', width: 180 },
			{ dataField: 'OBSERVACIONES', caption: 'Observaciones', width: 220 },
			{ dataField: 'SUB_TOTAL', caption: 'Sumas', width: 110, format: '#,##0.00' },
			{ dataField: 'TOTAL_IMPUESTO', caption: 'IVA', width: 100, format: '#,##0.00' },
			{ dataField: 'TOTAL_ORDEN', caption: 'Total', width: 110, format: '#,##0.00' },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 130 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{ column: 'CORR_ORDEN_COMPRA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' },
				{ column: 'TOTAL_ORDEN', summaryType: 'sum', valueFormat: '#,##0.00', displayFormat: '{0}' },
			],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'FECHA_ORDEN_COMPRA',
				label: { text: 'Fecha' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Fecha...', useMaskBehavior: false, displayFormat: 'dd/MM/yyyy' },
			},
			{
				dataField: 'NUMERO_ORDEN_COMPRA',
				label: { text: 'No. Orden de Compra' },
				colSpan: 1,
				editorOptions: { placeholder: 'No. Orden...', showClearButton: false, readOnly: true },
			},
			{
				dataField: 'ESTADO_ORDEN_COMPRA',
				label: { text: 'Estado' },
				colSpan: 2,
				template: 'ESTADO_ORDEN_COMPRALookup',
			},
			{
				dataField: 'CORR_CUADRO_COMPARATIVO',
				label: { text: 'No. Cuadro' },
				colSpan: 1,
				editorOptions: { placeholder: 'Cuadro...', showClearButton: false, readOnly: true },
			},
			{
				dataField: 'CORR_PROVEEDOR',
				label: { text: 'Proveedor' },
				colSpan: 3,
				template: 'CORR_PROVEEDORLookup',
			},
			{
				dataField: 'ATENCION_A',
				label: { text: 'Atención a' },
				colSpan: 2,
				editorOptions: { placeholder: 'Atención a...', showClearButton: true, maxLength: 150 },
			},
			{
				dataField: 'CORR_CONDICION_PAGO',
				label: { text: 'Condición de Pago' },
				colSpan: 2,
				template: 'CORR_CONDICION_PAGOLookup',
			},
			{
				dataField: 'CORR_FORMA_PAGO',
				label: { text: 'Forma de Pago' },
				colSpan: 2,
				template: 'CORR_FORMA_PAGOLookup',
			},
			{
				dataField: 'DETALLE_FORMA_PAGO',
				label: { text: 'Detalle Forma Pago' },
				colSpan: 2,
				editorOptions: { placeholder: 'Detalle...', showClearButton: true, maxLength: 250 },
			},
			{
				dataField: 'TELEFONO_PROVEEDOR',
				label: { text: 'Tel.' },
				colSpan: 1,
				editorOptions: { placeholder: 'Tel....', showClearButton: false, readOnly: true },
			},
			{
				dataField: 'NOMBRE_CONTACTO',
				label: { text: 'Contacto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Contacto...', showClearButton: false, readOnly: true },
			},
			{
				dataField: 'CORREO_ELECTRONICO_PROVEEDOR',
				label: { text: 'Correo' },
				colSpan: 3,
				editorOptions: { placeholder: 'Correo...', showClearButton: false, readOnly: true },
			},
			{
				dataField: 'NUMERO_SOLI_COTIZACION',
				label: { text: 'No. Solicitud Compra' },
				colSpan: 2,
				editorOptions: { placeholder: 'No. Solicitud...', showClearButton: false, readOnly: true },
			},
			{
				dataField: 'NOMBRE_DEPARTAMENTO',
				label: { text: 'Unidad Solicitante' },
				colSpan: 3,
				editorOptions: { placeholder: 'Unidad Solicitante...', showClearButton: false, readOnly: true },
			},
			{
				dataField: 'OBSERVACIONES',
				label: { text: 'Observaciones' },
				colSpan: 5,
				editorOptions: { placeholder: 'Observaciones...', showClearButton: true, maxLength: 1000 },
			},
			{
				dataField: 'TOTAL_ORDEN',
				label: { text: 'Total' },
				colSpan: 1,
				editorType: 'dxNumberBox',
				editorOptions: { format: '#,##0.00', readOnly: true },
			},
		];
	}
}
