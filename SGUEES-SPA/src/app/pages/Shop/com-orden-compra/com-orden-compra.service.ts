import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComOrdenCompraRepository } from './com-orden-compra.repository';
import { ComOrdenCompra } from './models/com-orden-compra';
import { ComOrdenCompraDetaRepository } from './com-orden-compra-deta/com-orden-compra-deta.repository';
import { ComOrdenCompraAutorizacionesRepository } from './com-orden-compra-autorizaciones/com-orden-compra-autorizaciones.repository';

@Injectable({
	providedIn: 'root',
})
export class ComOrdenCompraService {
	constructor(
    private repo: ComOrdenCompraRepository,
    private repodeta: ComOrdenCompraDetaRepository,
    private repoAutorizaciones: ComOrdenCompraAutorizacionesRepository,
  ) {}

	//#region <Validadores>
	esValido(model: ComOrdenCompra, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
			{ Parameter: 'OPCION_CONSULTA', Value: param.OPCION_CONSULTA }
    ];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO }
    ];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO }
    ];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO }
    ];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'FECHA_ORDEN_COMPRA', caption: 'Fecha', width: 115, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'NUMERO_ORDEN_COMPRA', caption: 'No. Orden Compra', width: 150 },
			{ dataField: 'NOMBRE_ESTADO_ORDEN_COMPRA', caption: 'Estado', width: 150 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 250 },
      { dataField: 'AUTORIZACIONES_REALIZADAS', caption: 'Autorizaciones Realizadas', width: 350 },
			// { dataField: 'DIRECCION_PROVEEDOR', caption: 'Direccion', width: 450 },
      // { dataField: 'NOMBRE_COMERCIAL', caption: 'Nombre Comercial', width: 250 },
			// { dataField: 'ACTIVIDAD_ECONOMICA', caption: 'Actividad Economica ', width: 250 },
      { dataField: 'NOMBRE_CONTACTO', caption: 'Contacto', width: 250 },
      { dataField: 'CORREO_ELECTRONICO_PROVEEDOR', caption: 'Correo', width: 250 },
      { dataField: 'TELEFONO_PROVEEDOR', caption: 'Tel.', width: 100 },
      { dataField: 'NOMBRE_CONDICION_PAGO', caption: 'Condicion de Pago', width: 250 },
      { dataField: 'NOMBRE_FORMA_PAGO', caption: 'Forma de Pago', width: 250 },
      { dataField: 'DETALLE_FORMA_PAGO', caption: 'Detalle Pago', width: 250 },
			{ dataField: 'NUMERO_SOLI_COTIZACION', caption: 'No. Solicitud Compra', width: 250 },
			{ dataField: 'NOMBRE_DEPARTAMENTO', caption: 'Unidad Solicitante', width: 200 },
			{ dataField: 'OBSERVACIONES', caption: 'Observaciones', width: 250 },
			{ dataField: 'SUB_TOTAL', caption: 'Sumas', width: 100, format: '#,##0.00'},
			{ dataField: 'TOTAL_IMPUESO', caption: 'IVA', width: 100, format: '#,##0.00'},
			{ dataField: 'TOTAL_ORDEN', caption: 'Total', width: 100, format: '#,##0.00'},
			{ dataField: 'USUARIO_CREA_SOLI', caption: 'Usuario Crea. Soli', width: 150 },
      // { dataField: 'TOTAL_EN_LETRAS', caption: 'Total Pagar', width: 100, format: '#,##0.00'},
    ];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CUADRO_COMPARATIVO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

  getItems(): any {
    return [
      {
        dataField: 'FECHA_ORDEN_COMPRA',
        label: { text: 'Fecha' },
        editorType: 'dxDateBox',
        colSpan: 1,
        editorOptions: { placeholder: 'Fecha...', useMaskBehavior: false, displayFormat:'dd/MM/yyyy' },
      },
      {
        dataField: 'NUMERO_ORDEN_COMPRA',
        label: { text: 'No. Orden de Compra' },
        colSpan: 2,
        editorOptions: { placeholder: 'No. Orden Compra...', showClearButton: false, maxLength: 30  },
      },
      {
        dataField: 'NOMBRE_PROVEEDOR',
        label: { text: 'Proveedor' },
        colSpan: 3,
        editorOptions: { placeholder: 'Proveedor...', showClearButton: false },
      },
      {
        dataField: 'CONDICION_PAGO',
        label: { text: 'Condicion de Pago' },
        colSpan: 2,
        editorOptions: { placeholder: 'Condicion de Pago...', showClearButton: false, maxLength: 50  },
      },
      /*{
        dataField: 'NOMBRE_COMERCIAL',
        label: { text: 'Nombre Comercial' },
        colSpan: 2,
        editorOptions: { placeholder: 'Nombre Comercial...', showClearButton: false, maxLength: 500  },
      },*/
      /*{
        dataField: 'DIRECCION_PROVEEDOR',
        label: { text: 'Dirección' },
        colSpan: 3,
        editorOptions: { placeholder: 'Dirección...', showClearButton: false, maxLength: 250  },
      },*/
      /*{
        dataField: 'ACTIVIDAD_ECONOMICA',
        label: { text: 'Actividad Economica' },
        colSpan: 3,
        editorOptions: { placeholder: 'Actividad Economica...', showClearButton: false, maxLength: 50  },
      },*/
      {
        dataField: 'TELEFONO_PROVEEDOR',
        label: { text: 'Tel.' },
        colSpan: 1,
        editorOptions: { placeholder: 'Tel....', showClearButton: false, maxLength: 50  },
      },
      {
        dataField: 'NOMBRE_CONTACTO',
        label: { text: 'Contacto' },
        colSpan: 2,
        editorOptions: { placeholder: 'Contacto...', showClearButton: false, maxLength: 50  },
      },
      {
        dataField: 'CORREO_ELECTRONICO_PROVEEDOR',
        label: { text: 'Correo' },
        colSpan: 3,
        editorOptions: { placeholder: 'Correo...', showClearButton: false, maxLength: 50  },
      },
      {
        dataField: 'NUMERO_SOLI_COTIZACION',
        label: { text: 'No. Solicitud Compra' },
        colSpan: 2,
        editorOptions: { placeholder: 'No. Solicitud Compra...', showClearButton: true, maxLength: 50  },
      },
      {
        dataField: 'NOMBRE_DEPARTAMENTO',
        label: { text: 'Unidad Solicitante' },
        colSpan: 3,
        editorOptions: { placeholder: 'Unidad Solicitante...', showClearButton: true, maxLength: 50  },
      },
      {
        dataField: 'OBSERVACIONES',
        label: { text: 'Observaciones' },
        colSpan: 5,
        editorOptions: { placeholder: 'Observaciones...', showClearButton: true, maxLength: 50  },
      }
    ];
  }

  getAllCOM_ORDEN_COMPRA_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'NUMERO_ORDEN_COMPRA', Value: param.NUMERO_ORDEN_COMPRA },
    ];

		return this.repodeta.get(xWhere);
	}

  getPDF(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'NUMERO_ORDEN_COMPRA', Value: param.NUMERO_ORDEN_COMPRA },
    ];

		return this.repo.getPDF(xWhere);
	}


  getAllCOM_ORDEN_COMPRA_AUTORIZACIONES(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repoAutorizaciones.get(xWhere);
	}

}
