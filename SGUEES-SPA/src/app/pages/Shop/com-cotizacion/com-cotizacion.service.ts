import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComCotizacionRepository } from './com-cotizacion.repository';
import { ComCotizacion } from './models/com-cotizacion';
import { ComCotizacionDetaRepository } from './com-cotizacion-deta/com-cotizacion-deta.repository';
import { ComCotizacionDocRepository } from './com-cotizacion-doc/com-cotizacion-doc.repository';
import { ComCotizacionDetaDocRepository } from './com-cotizacion-deta/com-cotizacion-deta-doc/com-cotizacion-deta-doc.repository';
import { ComCotizacionComentarioRepository } from './com-cotizacion-comentario/com-cotizacion-comentario.repository';
@Injectable({
	providedIn: 'root',
})
export class ComCotizacionService {
	constructor(private repo: ComCotizacionRepository,
    private repodeta: ComCotizacionDetaRepository,
    private repoDoc: ComCotizacionDocRepository,
    private repoDetaDoc: ComCotizacionDetaDocRepository,
    private repoComentario: ComCotizacionComentarioRepository,
  ) {}

	//#region <Validadores>
	esValido(model: ComCotizacion, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION }
    ];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION }
    ];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 120, visible: false},
			{ dataField: 'CORR_COTIZACION', caption: 'Corr.', width: 85, visible: false },
      { dataField: 'NUMERO_SOLI_COMPRA', caption: 'No. Sol. Compra', width: 120 },
      { dataField: 'NUMERO_SOLI_COTIZACION', caption: 'No. Sol. Cot.', width: 120 },
      { dataField: 'NUMERO_COTIZACION', caption: 'No. Cotización', width: 120 },
			{ dataField: 'FECHA_COTIZACION', caption: 'Fecha Coti', width: 120, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 350 },
      { dataField: 'NOMBRE_ESTADO_COTIZACION', caption: 'Estado Cotizacion', width: 120 },
      { dataField: 'PLAZO_ENTREGA', caption: 'Plazo Entrega', width: 150 },
			{ dataField: 'USUARIO_COTIZA', caption: 'Usuario Cotiza', width: 120 },
			{ dataField: 'OBSERVACIONES', caption: 'Observaciones', width: 350 },
			{ dataField: 'OBSERVACIONES_PROVEEDOR', caption: 'Observaciones Proveedor', width: 350 },
      { dataField: 'NOMBRE_CONDICION_PAGO', caption: 'Condición Pago', width: 250 },
      { dataField: 'NOMBRE_FORMA_PAGO', caption: 'Forma Pago', width: 300 },
      { dataField: 'DETALLE_FORMA_PAGO', caption: 'Detalle Forma Pago', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 120 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 120 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
			{ dataField: 'USUARIO_CREA_SOLI', caption: 'Usuario Crea. Soli', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_COTIZACION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
      { dataField: 'ANIO_PERIODO', label: { text: 'Año.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{ dataField: 'CORR_COTIZACION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'FECHA_COTIZACION',
				label: { text: 'F. Cotizacion' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: '', useMaskBehavior: true, displayFormat:'dd/MM/yyyy',readOnly: true },
			},
      {
				dataField: 'ESTADO_COTIZACION',
				label: { text: 'Estado' },
				colSpan: 1,
				editorOptions: { placeholder: '', showClearButton: false ,readOnly: true},
				template: 'ESTADO_COTIZACIONLookup',
			},
			{
				dataField: 'USUARIO_COTIZA',
				label: { text: 'Usuario Cotiza' },
				colSpan: 1,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 30,readOnly: true  },
			},
      {
				dataField: 'NOMBRE_PROVEEDOR',
				label: { text: 'Proveedor' },
				colSpan: 3,
				editorOptions: { placeholder: '', showClearButton: false,readOnly: true },
			},
			{
				dataField: 'OBSERVACIONES',
				label: { text: 'Observaciones' },
				colSpan: 3,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 255,readOnly: true  },
			},
      {
				dataField: 'PLAZO_ENTREGA',
				label: { text: 'Plazo Entrega' },
				colSpan: 2,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 150  },
			},
			{
				dataField: 'OBSERVACIONES_PROVEEDOR',
				label: { text: 'Observaciones Proveedor' },
				colSpan: 3,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 255  },
			},
      {
        dataField: 'CORR_CONDICION_PAGO',
        label: { text: 'Condición Pago' },
        colSpan: 1,
        editorOptions: { placeholder: '', showClearButton: false },
        template: 'CORR_CONDICION_PAGOLookup',
      },
      {
        dataField: 'CORR_FORMAR_PAGO',
        label: { text: 'Forma Pago' },
        colSpan: 1,
        editorOptions: { placeholder: '', showClearButton: false },
        template: 'CORR_FORMA_PAGOLookup',
      },
      {
				dataField: 'DETALLE_FORMA_PAGO',
				label: { text: 'Detalle Forma Pago' },
				colSpan: 3,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 250  },
			},
		];
	}

  //#region <COM_SOLI_COTIZACION_DETA>

	getAllCOM_COTIZACION_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION },
    ];

		return this.repodeta.get(xWhere);
	}

	getCOM_COTIZACION_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION },
      { Parameter: 'CORR_COTIZACION_DETA', Value: param.CORR_COTIZACION_DETA },
		];

		return this.repodeta.get(xWhere);
	}

	insertCOM_COTIZACION_DETA(model: any): Observable<IResult> {
		return this.repodeta.create(model);
	}


	updateCOM_COTIZACION_DETA(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
      { Parameter: 'CORR_COTIZACION_DETA', Value: model.CORR_COTIZACION_DETA },
		];

		return this.repodeta.update(model, xWhere);
	}

	deleteCOM_COTIZACION_DETA(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
      { Parameter: 'CORR_COTIZACION_DETA', Value: model.CORR_COTIZACION_DETA },
		];

		return this.repodeta.delete(xWhere);
	}

  Aplicar(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
    ];
		return this.repo.Aplicar(model, xWhere);
	}
	//#endregion

  //#region <COM_COTIZACION_DOC>

  getDoc(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION },
      { Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
      { Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
    ];

		return this.repoDoc.getDoc(xWhere);
	}

  getAllCOM_COTIZACION_DOC(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION },
    ];

		return this.repoDoc.get(xWhere);
	}

  insertDoc(model: FormData): any {
    return this.repoDoc.insertDoc(model);
  }

  deleteCOM_COTIZACION_DOC(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];

		return this.repoDoc.delete(xWhere);
	}
  //#endregion

  //#region <COM_COTIZACION_DETA_DOC>
  getDetaDoc(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION },
      { Parameter: 'CORR_COTIZACION_DETA', Value: param.CORR_COTIZACION_DETA },
      { Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
      { Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
    ];

		return this.repoDetaDoc.getDoc(xWhere);
	}

  getAllCOM_SOLI_COTIZACION_DETA_DOC(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION },
      { Parameter: 'CORR_COTIZACION_DETA', Value: param.CORR_COTIZACION_DETA },
    ];

		return this.repoDetaDoc.get(xWhere);
	}

  insertDetaDoc(model: FormData): any {
    return this.repoDetaDoc.insertDoc(model);
  }

  deleteCOM_COTIZACION_DETA_DOC(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
      { Parameter: 'CORR_COTIZACION_DETA', Value: model.CORR_COTIZACION_DETA },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];

		return this.repoDetaDoc.delete(xWhere);
	}
  //#endregion

  //#region <COM_SOLI_COTIZACION_COMENTARIO>
  getAllCOM_COTIZACION_COMENTARIO(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: param.CORR_COTIZACION },
    ];

		return this.repoComentario.get(xWhere);
	}

  insertCOM_COTIZACION_COMENTARIO(model: any): Observable<IResult> {
		return this.repoComentario.create(model);
	}

  updateCOM_COTIZACION_COMENTARIO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
      { Parameter: 'CORR_COMENTARIO', Value: model.CORR_COMENTARIO },
		];

		return this.repoComentario.update(model, xWhere);
	}

	deleteCOM_COTIZACION_COMENTARIO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_COTIZACION', Value: model.CORR_COTIZACION },
      { Parameter: 'CORR_COMENTARIO', Value: model.CORR_COMENTARIO },
		];

		return this.repoComentario.delete(xWhere);
	}
  //#endregion
}
