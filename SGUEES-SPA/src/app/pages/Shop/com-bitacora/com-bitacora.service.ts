import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComBitacoraRepository } from './com-bitacora.repository';
import { ComBitacora } from './models/com-bitacora';

@Injectable({
	providedIn: 'root',
})
export class ComBitacoraService {
	constructor(private repo: ComBitacoraRepository) {}

	//#region <Validadores>
	esValido(model: ComBitacora, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_BITACORA', Value: param.CORR_BITACORA },
      { Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
      { Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
      { Parameter: 'CODIGO_OPCION', Value: param.CODIGO_OPCION },
      { Parameter: 'CLASE_BITACORA', Value: param.CLASE_BITACORA }

    ];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BITACORA', Value: param.CORR_BITACORA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BITACORA', Value: model.CORR_BITACORA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BITACORA', Value: model.CORR_BITACORA }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_BITACORA', caption: 'Corr.', width: 85 },
			{ dataField: 'FECHA_BITACORA', caption: 'Fecha Bitacora', width: 115, dataType: 'date' },
			{ dataField: 'CODIGO_OPCION', caption: 'Codigo Opcion', width: 150 },
			{ dataField: 'NOMBRE_CODIGO_OPCION', caption: 'Nombre Codigo Opcion', width: 250 },
			{ dataField: 'CLASE_BITACORA', caption: 'Clase Bitacora', width: 150 },
			{ dataField: 'NOMBRE_CLASE_BITACORA', caption: 'Nombre Clase Bitacora', width: 250 },
			{ dataField: 'LLAVE_TRANSACCION', caption: 'Llave Transaccion', width: 150 },
			{ dataField: 'REFERENCIA_TRANSACCION', caption: 'Referencia Transaccion', width: 150 },
			{ dataField: 'USUARIO_CREA_TRANS', caption: 'Usuario Crea Trans', width: 150 },
			{ dataField: 'ESTACION_CREA_TRANS', caption: 'Estacion Crea Trans', width: 150 },
			{ dataField: 'FECHA_CREA_TRANS', caption: 'Fecha Crea Trans', width: 115, dataType: 'date' },
			{ dataField: 'USUARIO_ACTU_TRANS', caption: 'Usuario Actu Trans', width: 150 },
			{ dataField: 'ESTACION_ACTU_TRANS', caption: 'Estacion Actu Trans', width: 150 },
			{ dataField: 'FECHA_ACTU_TRANS', caption: 'Fecha Actu Trans', width: 115, dataType: 'date' },
			{ dataField: 'USUARIO_CREA_BITACORA', caption: 'Usuario Crea Bitacora', width: 150 },
			{ dataField: 'ESTACION_CREA_BITACORA', caption: 'Estacion Crea Bitacora', width: 150 },
			{ dataField: 'FECHA_CREA_BITACORA', caption: 'Fecha Crea Bitacora', width: 115, dataType: 'date' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_BITACORA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'ANIO_PERIODO',
				label: { text: 'Anio Periodo' },
				colSpan: 1,
				editorOptions: { placeholder: 'Anio Periodo...', showClearButton: true },
			},
			{ dataField: 'CORR_BITACORA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'FECHA_BITACORA',
				label: { text: 'Fecha Bitacora' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Fecha Bitacora...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
			{
				dataField: 'CODIGO_OPCION',
				label: { text: 'Codigo Opcion' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Opcion...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'CLASE_BITACORA',
				label: { text: 'Clase Bitacora' },
				colSpan: 2,
				editorOptions: { placeholder: 'Clase Bitacora...', showClearButton: false },
				template: 'CLASE_BITACORALookup',
			},
			{
				dataField: 'LLAVE_TRANSACCION',
				label: { text: 'Llave Transaccion' },
				colSpan: 1,
				editorOptions: { placeholder: 'Llave Transaccion...', showClearButton: true, maxLength: 250  },
			},
			{
				dataField: 'REFERENCIA_TRANSACCION',
				label: { text: 'Referencia Transaccion' },
				colSpan: 1,
				editorOptions: { placeholder: 'Referencia Transaccion...', showClearButton: true, maxLength: 500  },
			},
			{
				dataField: 'USUARIO_CREA_TRANS',
				label: { text: 'Usuario Crea Trans' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usuario Crea Trans...', showClearButton: true, maxLength: 50  },
			},
			{
				dataField: 'ESTACION_CREA_TRANS',
				label: { text: 'Estacion Crea Trans' },
				colSpan: 1,
				editorOptions: { placeholder: 'Estacion Crea Trans...', showClearButton: true, maxLength: 50  },
			},
			{
				dataField: 'FECHA_CREA_TRANS',
				label: { text: 'Fecha Crea Trans' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Fecha Crea Trans...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
			{
				dataField: 'USUARIO_ACTU_TRANS',
				label: { text: 'Usuario Actu Trans' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usuario Actu Trans...', showClearButton: true, maxLength: 50  },
			},
			{
				dataField: 'ESTACION_ACTU_TRANS',
				label: { text: 'Estacion Actu Trans' },
				colSpan: 1,
				editorOptions: { placeholder: 'Estacion Actu Trans...', showClearButton: true, maxLength: 50  },
			},
			{
				dataField: 'FECHA_ACTU_TRANS',
				label: { text: 'Fecha Actu Trans' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Fecha Actu Trans...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
			{
				dataField: 'USUARIO_CREA_BITACORA',
				label: { text: 'Usuario Crea Bitacora' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usuario Crea Bitacora...', showClearButton: true, maxLength: 50  },
			},
			{
				dataField: 'ESTACION_CREA_BITACORA',
				label: { text: 'Estacion Crea Bitacora' },
				colSpan: 1,
				editorOptions: { placeholder: 'Estacion Crea Bitacora...', showClearButton: true, maxLength: 50  },
			},
			{
				dataField: 'FECHA_CREA_BITACORA',
				label: { text: 'Fecha Crea Bitacora' },
				editorType: 'dxDateBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Fecha Crea Bitacora...', useMaskBehavior: true, displayFormat:'dd/MM/yyyy' },
			},
		];
	}
}
