import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ComSoliCotizacionRepository } from './com-soli-cotizacion.repository';
import { ComSoliCotizacion } from './models/com-soli-cotizacion';
import { ComSoliCotizacionDetaRepository } from './com-soli-cotizacion-deta/com-soli-cotizacion-deta.repository';
import { ComSoliCotizacionDetaEnca } from './models/com-soli-cotizacion-deta-enca';
import { ComSoliCotizacionProveedorRepository } from './com-soli-cotizacion-proveedor/com-soli-cotizacion-proveedor.repository';
import { ComSoliCotizacionProveedor } from './com-soli-cotizacion-proveedor/models/com-soli-cotizacion-proveedor';
import { ComSoliCotizacionDocRepository } from './com-soli-cotizacion-doc/com-soli-cotizacion-doc.repository';
import { ComSoliCotizacionDetaDocRepository } from './com-soli-cotizacion-deta/com-soli-cotizacion-deta-doc/com-soli-cotizacion-deta-doc.repository';

@Injectable({
	providedIn: 'root',
})
export class ComSoliCotizacionService {
	constructor(
    private repo: ComSoliCotizacionRepository,
    private repodeta: ComSoliCotizacionDetaRepository,
    private repoproveedor: ComSoliCotizacionProveedorRepository,
    private repoDoc: ComSoliCotizacionDocRepository,
    private repoDetaDoc: ComSoliCotizacionDetaDocRepository
  ) {}

	//#region <Validadores>
	esValido(model: ComSoliCotizacion, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
      { Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
    ];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
    ];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'JUSTIFICACION_ELIMINAR', Value: model.JUSTIFICACION_ELIMINAR }
    ];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 120, visible: false },
			{ dataField: 'CORR_SOLI_COTIZACION', caption: 'Corr.', width: 85, visible: false },
      { dataField: 'NUMERO_SOLI_COMPRA', caption: 'No. Sol. Compra', width: 120 },
      { dataField: 'NUMERO_SOLI_COTIZACION', caption: 'No. Sol. Cot.', width: 120 },
			{ dataField: 'FECHA_SOLI_COTIZACION', caption: 'Fecha Soli.', width: 120, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'FECHA_LIMITE_COTIZACION', caption: 'Fecha Límite', width: 120, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'CODIGO_DEPTO', caption: 'Código Depto', width: 150, visible: false },
      { dataField: 'NOMBRE_DEPTO', caption: 'Depto', width: 200 },
      { dataField: 'NOMBRE_ESTADO_SOLI_COTIZACION', caption: 'Estado', width: 120 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedores', width: 300 },
      { dataField: 'NOMBRE_TIPO_SOLI_COTIZA', caption: 'Tipo Solicitud', width: 120 },
      { dataField: 'USUARIO_SOLI', caption: 'Usuario Solitud', width: 120 },
			{ dataField: 'OBSERVACIONES', caption: 'Observaciones', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 120 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 120 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_SOLI_COTIZACION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
      { dataField: 'ANIO_PERIODO', label: { text: 'Año' }, colSpan: 1, editorOptions: { readOnly: true } },
			{ dataField: 'CORR_SOLI_COTIZACION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'FECHA_SOLI_COTIZACION',
				label: { text: 'Fecha' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: '', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
      {
				dataField: 'ESTADO_SOLI_COTIZACION',
				label: { text: 'Estado' },
				colSpan: 1,
				editorOptions: { placeholder: '', showClearButton: false ,readOnly: true },
				template: 'ESTADO_SOLI_COTIZACIONLookup',
			},
			{
				dataField: 'CODIGO_DEPTO',
				label: { text: 'Codigo Depto' },
				colSpan: 1,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 10,readOnly: true   },
			},
      {
				dataField: 'NOMBRE_DEPTO',
				label: { text: 'Nombre Depto' },
				colSpan: 2,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 10,readOnly: true   },
			},
      {
				dataField: 'FECHA_LIMITE_COTIZACION',
				label: { text: 'Fecha Limite' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: '', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
      {
				dataField: 'OBSERVACIONES',
				label: { text: 'Observaciones' },
				colSpan: 4,
				editorOptions: { placeholder: '', showClearButton: true, maxLength: 255  },
			},
      {
      	dataField: 'CORR_TIPO_SOLI_COTIZA',
      	label: { text: 'Tipo Solicitud' },
      	colSpan: 1,
      	editorOptions: { placeholder: '', showClearButton: false },
      	template: 'CORR_TIPO_SOLI_COTIZALookup',
      },
		];
	}

  getAllSOLICITUD_COMPRA_DISPONIBLE(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
      { Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
      { Parameter: 'ANIO_PERIODO_SOLI_COMPRA', Value: param.ANIO_PERIODO_SOLI_COMPRA },
      { Parameter: 'CORR_SOLI_COMPRA', Value: param.CORR_SOLI_COMPRA }
		];
		return this.repo.getSolicitudCompraDisponible(xWhere);
	}

  getAllSOLICITUD_COMPRA_DETA_DISPONIBLE(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO_SOLI_COMPRA', Value: param.ANIO_PERIODO_SOLI_COMPRA },
      { Parameter: 'CORR_SOLI_COMPRA', Value: param.CORR_SOLI_COMPRA },
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
		];
		return this.repo.getSolicitudCompraDetaDisponible(xWhere);
	}

  insertCOM_SOLI_COTIZACION_ENCA_DETA(model: ComSoliCotizacionDetaEnca): Observable<IResult> {
		return this.repo.createencadeta(model);
	}

  UpdateCOM_SOLI_COTIZACION_ENCA_DETA(model: ComSoliCotizacionDetaEnca): Observable<IResult> {
		return this.repo.Updateencadeta(model);
	}

  //#region <COM_SOLI_COTIZACION_DETA>

	getAllCOM_SOLI_COTIZACION_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
    ];

		return this.repodeta.get(xWhere);
	}

	getCOM_SOLI_COTIZACION_DETA(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_SOLI_COTIZACION_DETA', Value: param.CORR_SOLI_COTIZACION_DETA },
		];

		return this.repodeta.get(xWhere);
	}

	insertCOM_SOLI_COTIZACION_DETA(model: any): Observable<IResult> {
		return this.repodeta.create(model);
	}


	updateCOM_SOLI_COTIZACION_DETA(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_SOLI_COTIZACION_DETA', Value: model.CORR_SOLI_COTIZACION_DETA },
		];

		return this.repodeta.update(model, xWhere);
	}

	deleteCOM_SOLI_COTIZACION_DETA(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_SOLI_COTIZACION_DETA', Value: model.CORR_SOLI_COTIZACION_DETA },
		];

		return this.repodeta.delete(xWhere);
	}
  AnularDeta(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_SOLI_COTIZACION_DETA', Value: model.CORR_SOLI_COTIZACION_DETA },
    ];
		return this.repodeta.Anular(model, xWhere);
	}
	//#endregion

  //#region <COM_SOLI_COTIZACION_PROVEEDOR>

	getAllCOM_SOLI_COTIZACION_PROVEEDOR(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
    ];

		return this.repoproveedor.get(xWhere);
	}

	getCOM_SOLI_COTIZACION_PROVEEDOR(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR },
		];

		return this.repoproveedor.get(xWhere);
	}

	insertCOM_SOLI_COTIZACION_PROVEEDOR(model: ComSoliCotizacionProveedor): Observable<IResult> {
		return this.repoproveedor.create(model);
	}

	updateCOM_SOLI_COTIZACION_PROVEEDOR(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
		];

		return this.repoproveedor.update(model, xWhere);
	}

	deleteCOM_SOLI_COTIZACION_PROVEEDOR(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
		];

		return this.repoproveedor.delete(xWhere);
	}

  getAll_PROVEEDOR_DISPONIBLES(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
    ];

		return this.repoproveedor.getProveedoresDisponible(xWhere);
	}

  HabilitarCOM_SOLI_COTIZACION_PROVEEDOR(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
    ];
		return this.repoproveedor.Habilitar(model, xWhere);
	}

  AnularCOM_SOLI_COTIZACION_PROVEEDOR(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
    ];
		return this.repoproveedor.Anular(model, xWhere);
	}
	//#endregion

  Solicitar(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
    ];
		return this.repo.Solicitar(model, xWhere);
	}

  getPDF(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
    ];

		return this.repo.getPDF(xWhere);
	}

  getDoc(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
      { Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
    ];

		return this.repoDoc.getDoc(xWhere);
	}

  getAllCOM_SOLI_COTIZACION_DOC(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
    ];

		return this.repoDoc.get(xWhere);
	}

  insertDoc(model: FormData): any {
    return this.repoDoc.insertDoc(model);
  }

  deleteCOM_SOLI_COTIZACION_DOC(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];

		return this.repoDoc.delete(xWhere);
	}

  Anular(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
    ];
		return this.repo.Anular(model, xWhere);
	}

  Aplicar(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
    ];
		return this.repo.Aplicar(model, xWhere);
	}

  //#region <COM_SOLI_COTIZACION_DETA_DOC>
  getDetaDoc(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_SOLI_COTIZACION_DETA', Value: param.CORR_SOLI_COTIZACION_DETA },
      { Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
      { Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
    ];

		return this.repoDetaDoc.getDoc(xWhere);
	}

  getAllCOM_SOLI_COTIZACION_DETA_DOC(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: param.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_SOLI_COTIZACION_DETA', Value: param.CORR_SOLI_COTIZACION},
    ];

		return this.repoDetaDoc.get(xWhere);
	}

  insertDetaDoc(model: FormData): any {
    return this.repoDetaDoc.insertDoc(model);
  }

  deleteCOM_SOLI_COTIZACION_DETA_DOC(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'CORR_SOLI_COTIZACION', Value: model.CORR_SOLI_COTIZACION },
      { Parameter: 'CORR_SOLI_COTIZACION_DETA', Value: model.CORR_SOLI_COTIZACION_DETA },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];

		return this.repoDetaDoc.delete(xWhere);
	}
  //#endregion
}
