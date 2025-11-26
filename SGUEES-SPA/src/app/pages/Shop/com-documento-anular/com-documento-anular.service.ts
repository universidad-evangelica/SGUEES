import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComDocumentoAnularRepository } from './com-documento-anular.repository';
import { ComDocumento } from './models/com-documento';
import { ComDocumentoTotalRepository } from './com-documento-total/com-documento-total.repository';
import { read } from 'fs';
import { group } from 'console';

@Injectable({
	providedIn: 'root',
})
export class ComDocumentoAnularService {
	constructor(
    private repo: ComDocumentoAnularRepository,
    private repoTotal: ComDocumentoTotalRepository,
  ) {}

	//#region <Validadores>
	esValido(model: ComDocumento, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 150, groupIndex: 0 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 150, groupIndex: 1 },
			{ dataField: 'CORR_DOCUMENTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_DOC', caption: 'Tipo Doc', width: 250 },
			{ dataField: 'NOMBRE_ESTADO_DOCUMENTO', caption: 'Estado', width: 250 },
			{ dataField: 'FECHA_DOCUMENTO', caption: 'Fecha Documento', width: 115, dataType: 'date' },
			{ dataField: 'FECHA_VENCIMIENTO', caption: 'Fecha Vencimiento', width: 115, dataType: 'date' },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 250 },
			// { dataField: 'NOMBRE_CORTO_TIPO_DOC', caption: 'Nombre Corto Tipo Doc', width: 250 },
			// { dataField: 'CLASE_DOCUMENTO', caption: 'Clase Documento', width: 150 },
			// { dataField: 'SUMA_RESTA', caption: 'Suma Resta', width: 150 },
			{ dataField: 'SERIE', caption: 'Serie', width: 150 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'Numero Documento', width: 150 },
			{ dataField: 'NUMERO_UNICO', caption: 'Numero Unico', width: 150 },
			{ dataField: 'CODIGO_GENERACION', caption: 'Codigo Generacion', width: 150 },
			{ dataField: 'NUMERO_CONTROL', caption: 'Numero Control', width: 150 },
			{ dataField: 'SELLO_RECEPCION', caption: 'Sello Recepcion', width: 150 },
			{ dataField: 'NOMBRE_CONDICION_PAGO', caption: 'Condicion Pago', width: 250 },
			{ dataField: 'DIAS_CREDITO', caption: 'Dias Credito', width: 150 },
			// { dataField: 'ESTADO_DOCUMENTO', caption: 'Estado Documento', width: 150 },
			// { dataField: 'ESTA_CONTABILIZADO', caption: 'Esta Contabilizado', width: 150 },
			// { dataField: 'TOTAL_DOCUMENTO', caption: 'Total Documento', width: 150, format: '#,##0.00' },
			// { dataField: 'TOTAL_NETO', caption: 'Total Neto', width: 150, format: '#,##0.00' },
			{ dataField: 'CANTIDAD', caption: 'Cantidad', width: 150, format: '#,##0.00' },
			{ dataField: 'SALDO_DOCUMENTO', caption: 'Saldo Documento', width: 150, format: '#,##0.00' },
			{ dataField: 'NOMBRE_TIPO_GASTO', caption: 'Tipo Gasto', width: 250 },
			// { dataField: 'OPERADOR', caption: 'Operador', width: 150 },
			// { dataField: 'ESTADO_ADMINISTRATIVO', caption: 'Estado Administrativo', width: 150 },
			{ dataField: 'NOMBRE_ESTADO_ADMINISTRATIVO', caption: 'Estado Administrativo', width: 250 },
			{ dataField: 'DESCRIPCION_PARTIDA', caption: 'Descripcion Partida', width: 350 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
			// { dataField: 'FACTOR_CAMBIO', caption: 'Factor Cambio', width: 150, format: '#,##0.00' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_DOCUMENTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'ANIO_PERIODO',
				label: { text: 'Año' },
				colSpan: 1,
				editorOptions: { placeholder: 'Año...', showClearButton: true,readOnly:true },
			},
			{
				dataField: 'MES_PERIODO',
				label: { text: 'Mes' },
				colSpan: 1,
				editorOptions: { placeholder: 'Mes Periodo...', showClearButton: true ,readOnly:true},
			},
			{ dataField: 'CORR_DOCUMENTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
      {
        dataField: 'ESTADO_DOCUMENTO',
        label: { text: 'Estado Documento' },
        colSpan: 1,
        editorOptions: { placeholder: 'Estado Documento...', showClearButton: false,readOnly:true },
        template: 'ESTADO_DOCUMENTOLookup',
      },
      {
        dataField: 'FECHA_DOCUMENTO',
        label: { text: 'Fecha Documento' },
        editorType: 'dxDateBox',
        colSpan: 1,
        editorOptions: { placeholder: 'Fecha Documento...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
      },
			{
        dataField: 'CORR_TIPO_DOC',
				label: { text: 'Tipo Doc' },
				colSpan: 2,
				editorOptions: { placeholder: 'Tipo Doc...', showClearButton: false },
				template: 'CORR_TIPO_DOCLookup',
			},
      {
        dataField: '',
        label: { text: '' },
        editorType: 'empty',
        colSpan: 1,
      },
      {
        dataField: 'CORR_TIPO_GASTO',
        label: { text: 'Tipo Gasto' },
        colSpan: 2,
        editorOptions: { placeholder: 'Tipo Gasto...', showClearButton: false },
        template: 'CORR_TIPO_GASTOLookup',
      },
      {
        dataField: 'CORR_PROVEEDOR',
        label: { text: 'Proveedor' },
        colSpan: 2,
        editorOptions: { placeholder: 'Proveedor...', showClearButton: false },
        template: 'CORR_PROVEEDORLookup',
      },
      {
        dataField: 'CORR_CONDICION_PAGO',
        label: { text: 'Condicion Pago' },
        colSpan: 1,
        editorOptions: { placeholder: 'Condicion Pago...', showClearButton: false },
        template: 'CORR_CONDICION_PAGOLookup',
      },
      {
        dataField: 'DIAS_CREDITO',
        label: { text: 'Dias Credito' },
        editorType: 'dxNumberBox',
        colSpan: 1,
        editorOptions: { placeholder: 'Dias Credito...',format: '#,##0', showClearButton: true ,onValueChanged: 'DIAS_CREDITOValueChange'},
        valueChange: 'DIAS_CREDITOValueChange',
      },
      {
        dataField: 'FECHA_VENCIMIENTO',
        label: { text: 'Fecha Vencimiento' },
        editorType: 'dxDateBox',
        colSpan: 1,
        editorOptions: { placeholder: 'Fecha Vencimiento...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
      },
      {
        dataField: '',
        label: { text: '' },
        editorType: 'empty',
        colSpan: 1,
      },
      {
        dataField: 'SERIE',
        label: { text: 'Serie' },
        colSpan: 1,
        editorOptions: { placeholder: 'Serie...', showClearButton: true },
      },
      {
        dataField: 'NUMERO_DOCUMENTO',
        label: { text: 'Numero Documento' },
        colSpan: 1,
        editorOptions: { placeholder: 'Numero Documento...', showClearButton: true },
      },
      {
        dataField: 'NUMERO_UNICO',
        label: { text: 'Numero Unico' },
        colSpan: 1,
        editorOptions: { placeholder: 'Numero Unico...', showClearButton: true },
      },
      {
        dataField: 'CODIGO_GENERACION',
        label: { text: 'Codigo Generacion' },
        colSpan: 2,
        editorOptions: { placeholder: 'Codigo Generacion...', showClearButton: true },
      },
      {
        dataField: 'NUMERO_CONTROL',
        label: { text: 'Numero Control' },
        colSpan: 2,
        editorOptions: { placeholder: 'Numero Control...', showClearButton: true },
      },
      {
        dataField: 'SELLO_RECEPCION',
        label: { text: 'Sello Recepcion' },
        colSpan: 2,
        editorOptions: { placeholder: 'Sello Recepcion...', showClearButton: true },
      },
      {
        dataField: 'CANTIDAD',
        label: { text: 'Cantidad' },
        editorType: 'dxNumberBox',
        colSpan: 1,
        editorOptions: { placeholder: 'Cantidad...', format: '#,##0.00' },
      },
      // {
      //   dataField: 'SALDO_DOCUMENTO',
      //   label: { text: 'Saldo' },
      //   editorType: 'dxNumberBox',
      //   colSpan: 1,
      //   editorOptions: { placeholder: 'Saldo...', format: '#,##0.00',readOnly: true,visible:false },
      // },
      // {
      //   dataField: 'ESTADO_ADMINISTRATIVO',
      //   label: { text: 'Estado Administrativo' },
      //   colSpan: 2,
      //   editorOptions: { placeholder: 'Estado Administrativo...', showClearButton: false ,readOnly:true},
      //   template: 'ESTADO_ADMINISTRATIVOLookup',
      // },
			{
				dataField: 'DESCRIPCION_PARTIDA',
				label: { text: 'Descripcion Partida' },
				colSpan: 3,
        editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Descripcion Partida...', showClearButton: true },
			},
		];
	}

  Aplicar(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
    ];
		return this.repo.Aplicar(model, xWhere);
	}
  //#region <ComDocumentoTotal>
  getAllCOM_DOCUMENTO_TOTAL(param: any): Observable<IResult> {
    let xWhere: IParam[] = [
      {Parameter:'ANIO_PERIODO', Value: param.ANIO_PERIODO},
      {Parameter:'MES_PERIODO', Value: param.MES_PERIODO},
      { Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO }];

    return this.repoTotal.get(xWhere);
  }

  insertCOM_DOCUMENTO_TOTAL(model: any): Observable<IResult> {
    return this.repoTotal.create(model);
  }

  updateCOM_DOCUMENTO_TOTAL(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      {Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO},
      {Parameter: 'MES_PERIODO', Value: model.MES_PERIODO},
      {Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
      {Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO}
    ];

    return this.repoTotal.update(model, xWhere);
  }
  deleteCOM_DOCUMENTO_TOTAL(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      {Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO},
      {Parameter: 'MES_PERIODO', Value: model.MES_PERIODO},
      {Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
      {Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO}
    ];

    return this.repoTotal.delete(xWhere);
  }
  //#endregion

  getAllAnular(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
      { Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL }
    ];

		return this.repo.getAllAnular(xWhere);
	}

  AnularCR(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
      { Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
      { Parameter: 'MOTIVO_ANULACION', Value: model.MOTIVO_ANULACION },
    ];
		return this.repo.AnularCR(model, xWhere);
	}
}
