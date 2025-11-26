import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComCuadroComparativoRepository } from './com-cuadro-comparativo.repository';
import { ComCuadroComparativo } from './models/com-cuadro-comparativo';
import { ComCuadroComparativoDetaRepository } from './com-cuadro-comparativo-deta/com-cuadro-comparativo-deta.repository';
import { ComCuadroComparativoSoliCotizacion } from './models/com-cuadro-comparativo_soli_cotizacion';
import { ComCuadroComparativoCotizacionDeta } from './com-cuadro-comparativo-deta/models/com-cuadro-comparativo-cotizacion-deta';
import { ComCuadroComparativoAutorizacionesRepository } from './com-cuadro-comparativo-autorizaciones/com-cuadro-comparativo-autorizaciones.repository';
import { ComCuadroComparativoOrdenCompraRepository } from './com-cuadro_comparativo-orden_compra/com-cuadro-comparativo-orden-compra.repository';
import { ComCuadroComparativoComentarioRepository } from './com-cuadro-comparativo-comentario/com-cuadro-comparativo-comentario.repository';
import { ComCuadroComparativoDocRepository } from './com-cuadro-comparativo-doc/com-cuadro-comparativo-doc.repository';

@Injectable({
	providedIn: 'root',
})
export class ComCuadroComparativoService {
	constructor(
    private repo: ComCuadroComparativoRepository,
    private repodeta: ComCuadroComparativoDetaRepository,
    private repoAutorizaciones: ComCuadroComparativoAutorizacionesRepository,
    private repoOrdenCompra: ComCuadroComparativoOrdenCompraRepository,
    private repoComentario: ComCuadroComparativoComentarioRepository,
    private repoDoc: ComCuadroComparativoDocRepository,
  ) {}

	//#region <Validadores>
	esValido(model: ComCuadroComparativo, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL }
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
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'JUSTIFICACION_ELIMINAR', Value: model.JUSTIFICACION_ELIMINAR }
    ];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 100, visible: false  },
			{ dataField: 'CORR_CUADRO_COMPARATIVO', caption: 'Corr.', width: 85, visible: false },
      { dataField: 'NUMERO_SOLI_COMPRA', caption: 'No. Sol. Compra', width: 120 },
			{ dataField: 'NUMERO_SOLI_COTIZACION', caption: 'No. Sol. Cotización ', width: 120 },
      { dataField: 'NUMERO_COTIZACION', caption: 'No. Cotización', width: 120 },
      { dataField: 'NUMERO_CUADRO_COMPARA', caption: 'No. Cuadro', width: 120 },
      { dataField: 'NUMERO_ORDEN', caption: 'No. Orden Compra', width: 120 },
      { dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedores', width: 450 },
			{ dataField: 'FECHA_CUADRO_COMPARATIVO', caption: 'Fecha Comparativo', width: 120, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'NOMBRE_ESTADO_CUADRO_COMPARATIVO', caption: 'Estado', width: 120 },
			{ dataField: 'USUARIO_CUADRO_COMPARATIVO', caption: 'Usuario Cuadro', width: 120 },
      { dataField: 'OBSERVACIONES', caption: 'Observaciones', width: 350 },
			{ dataField: 'ES_MEJOR_PRECIO', caption: 'Es Mejor Precio', width: 150 },
			{ dataField: 'TIENE_CREDITO_30_DIAS', caption: 'Tiene Credito 30 Dias', width: 175 },
			{ dataField: 'TIENE_BUEN_SOPORTE_TECNICO', caption: 'Tiene Buen Soporte Tecnico', width: 200 },
			{ dataField: 'TIENE_BUENA_CALIDAD_PRODUCTO', caption: 'Tiene Buena Calidad Producto', width: 200 },
			{ dataField: 'TIENE_MEJOR_TIEMPO_ENTREGA', caption: 'Tiene Mejor Tiempo Entrega', width: 250 },
			{ dataField: 'BRINDA_BUENA_EXPERIENCIA_PROVEEDOR', caption: 'Brinda Buena Experiencia Proveedor', width: 150 },
			{ dataField: 'ES_PROVEEDOR_UNICO', caption: 'Es Proveedor Unico', width: 175 },
			{ dataField: 'EXISTE_OTRA_RAZON', caption: 'Existe Otra Razon', width: 175 },
			{ dataField: 'NOMBRE_OTRA_RAZON', caption: 'Nombre Otra Razon', width: 350 },
      { dataField: 'AUTORIZACIONES_PENDIENTES', caption: 'Autorizaciones Pendientes', width: 350 },
      { dataField: 'AUTORIZACIONES_REALIZADAS', caption: 'Autorizaciones Realizadas', width: 350 },
			{ dataField: 'ANIO_PERIODO_SOLI_COTI', caption: 'Anio Periodo Soli Coti', width: 150, visible: false },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
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
            itemType: 'group',
            caption: 'Información General',
            colCount: 4,
            items: [
              {
                dataField: 'ANIO_PERIODO',
                label: { text: 'Año Periodo' },
                colSpan: 1,
                editorOptions: { placeholder: '', showClearButton: true, readOnly: true },
              },
              {
                dataField: 'CORR_CUADRO_COMPARATIVO',
                label: { text: 'Corr.' },
                colSpan: 1,
                editorOptions: { readOnly: true },
              },
              {
                dataField: 'FECHA_CUADRO_COMPARATIVO',
                label: { text: 'Fecha' },
                editorType: 'dxDateBox',
                colSpan: 1,
                editorOptions: { placeholder: '', useMaskBehavior: true, displayFormat: 'dd/MM/yyyy' },
              },
              {
                dataField: 'ESTADO_CUADRO_COMPARATIVO',
                label: { text: 'Estado' },
                colSpan: 1,
                editorOptions: { placeholder: '', showClearButton: false },
                template: 'ESTADO_CUADRO_COMPARATIVOLookup',
              },
              {
                dataField: 'USUARIO_CUADRO_COMPARATIVO',
                label: { text: 'Usuario' },
                colSpan: 1,
                editorOptions: { placeholder: '', showClearButton: true, maxLength: 30 },
              },
              {
                dataField: 'OBSERVACIONES',
                label: { text: 'Observaciones' },
                colSpan: 3,
                editorOptions: { placeholder: '', showClearButton: true, maxLength: 255 },
              }
            ]
        },
        {
            itemType: 'group',
            caption: 'Esta cotización fue aprobada en razón de:',
            colCount: 3,
            items: [
              {
                dataField: 'ES_MEJOR_PRECIO',
                label: { text: ' '},
                colSpan: 1,
                editorType: 'dxCheckBox',
                editorOptions: {
                  text: 'Mejor precio', // Etiqueta a la derecha
                  elementAttr: { class: 'checkbox-label-right' }
                },
              },
              {
                  dataField: 'TIENE_CREDITO_30_DIAS',
                  label: { text: ' '},
                  colSpan: 1,
                  editorOptions: {
                    text: 'Crédito 30 días', // Etiqueta a la derecha
                    elementAttr: { class: 'checkbox-label-right' }
                  },
              },
              {
                  dataField: 'TIENE_BUEN_SOPORTE_TECNICO',
                  label: { text: ' '},
                  colSpan: 1,
                  editorOptions: {
                    text: 'Buen soporte técnico', // Etiqueta a la derecha
                    elementAttr: { class: 'checkbox-label-right' }
                  },
              },
              {
                  dataField: 'TIENE_BUENA_CALIDAD_PRODUCTO',
                  label: { text: ' ', location: 'left' },
                  colSpan: 1,
                  editorOptions: {
                    text: 'Buena calidad producto', // Etiqueta a la derecha
                    elementAttr: { class: 'checkbox-label-right' }
                  },
              },
              {
                  dataField: 'TIENE_MEJOR_TIEMPO_ENTREGA',
                  label: { text: ' ', location: 'left' },
                  colSpan: 1,
                  editorOptions: {
                    text: 'Mejor tiempo entrega', // Etiqueta a la derecha
                    elementAttr: { class: 'checkbox-label-right' }
                  },
              },
              {
                  dataField: 'BRINDA_BUENA_EXPERIENCIA_PROVEEDOR',
                  label: { text: ' ', location: 'left' },
                  colSpan: 1,
                  editorOptions: {
                    text: 'Buena experiencia con proveedor', // Etiqueta a la derecha
                    elementAttr: { class: 'checkbox-label-right' }
                  },
              },
              {
                  dataField: 'ES_PROVEEDOR_UNICO',
                  label: { text: ' ', location: 'left' },
                  colSpan: 1,
                  editorOptions: {
                    text: 'Proveedor único', // Etiqueta a la derecha
                    elementAttr: { class: 'checkbox-label-right' }
                  },
              },
              {
                  dataField: 'EXISTE_OTRA_RAZON',
                  label: { text: ' ', location: 'left' },
                  colSpan: 1,
                  editorOptions: {
                    text: 'Otras razones', // Etiqueta a la derecha
                    elementAttr: { class: 'checkbox-label-right' }
                  },
              },
              {
                dataField: 'NOMBRE_OTRA_RAZON',
                colSpan: 1,
                label: { visible: false },
                editorOptions: { placeholder: 'Otra Razón', showClearButton: true, maxLength: 255 }
              }
            ]
        }
    ];
  }

  getAllSOLICITUD_COMPRA_DISPONIBLE(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
      { Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO }
		];
		return this.repo.getSolicitudCompraDisponible(xWhere);
	}

	getAllCOM_SOLI_COTIZACION_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
    ];

		return this.repo.getAllCOM_SOLI_COTIZACION_DETA(xWhere);
	}

  getAllCOM_CUADRO_COMPARATIVO_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repodeta.get(xWhere);
	}

  getAllCOM_SOLI_COTIZACION_PROVEEDOR(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
    ];

		return this.repo.getAllCOM_SOLI_COTIZACION_PROVEEDOR(xWhere);
	}

  getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repo.getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(xWhere);
	}


  GenerarCuadroCompartivo(model: ComCuadroComparativoSoliCotizacion): Observable<IResult> {
		return this.repo.GenerarCuadroCompartivo(model);
	}

  Solicitar(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO },
    ];
		return this.repo.Solicitar(model, xWhere);
	}

  getPDF(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repo.getPDF(xWhere);
	}

  updateCOM_CUADRO_COMPARATIVO_DETA(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
      { Parameter: 'CORR_COTIZACION_DETA', Value: model.CORR_COTIZACION_DETA },
		];

		return this.repodeta.update(model, xWhere);
	}

  GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repo.GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA(xWhere);
	}

  Aplicar(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO },
    ];
		return this.repo.Aplicar(model, xWhere);
	}

  UpdateCuadroCompartivoDeta(model: ComCuadroComparativoCotizacionDeta): Observable<IResult> {
		return this.repo.UpdateCuadroCompartivoDeta(model);
	}

  getAllCOM_CUADRO_COMPARATIVO_AUTORIZACIONES(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repoAutorizaciones.get(xWhere);
	}

  getAllCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repoOrdenCompra.get(xWhere);
	}
  getPDFOrdenCompra(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'NUMERO_ORDEN', Value: param.NUMERO_ORDEN },
      // { Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR },
    ];

		return this.repoOrdenCompra.getDoc(xWhere);
	}
  //#region <COM_CUADRO_COMPARATIVO_COMENTARIO>
   getAllCOM_CUADRO_COMPARATIVO_COMENTARIO(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repoComentario.get(xWhere);
	}

  insertCOM_CUADRO_COMPARATIVO_COMENTARIO(model: any): Observable<IResult> {
		return this.repoComentario.create(model);
	}

  updateCOM_CUADRO_COMPARATIVO_COMENTARIO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'CORR_COMENTARIO', Value: model.CORR_COMENTARIO },
		];

		return this.repoComentario.update(model, xWhere);
	}

	deleteCUADRO_COMPARATIVO_COMENTARIO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'CORR_COMENTARIO', Value: model.CORR_COMENTARIO },
		];

		return this.repoComentario.delete(xWhere);
	}
  //#endregion
  //#region <COM_COTIZACION_DOC>
  getDoc(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
      { Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
    ];

		return this.repoDoc.getDoc(xWhere);
	}

  getAllCOM_COTIZACION_DOC(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: param.CORR_CUADRO_COMPARATIVO },
    ];

		return this.repoDoc.get(xWhere);
	}

  insertDoc(model: FormData): any {
    return this.repoDoc.insertDoc(model);
  }

  deleteCOM_COTIZACION_DOC(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_CUADRO_COMPARATIVO', Value: model.CORR_CUADRO_COMPARATIVO },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];

		return this.repoDoc.delete(xWhere);
	}
  //#endregion
}
