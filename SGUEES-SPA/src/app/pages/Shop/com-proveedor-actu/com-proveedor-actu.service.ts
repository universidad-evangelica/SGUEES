import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComProveedorActuRepository } from './com-proveedor-actu.repository';
import { ComProveedorActu } from './models/com-proveedor-actu';
import { ComProveedorActuDocRepository } from './com-proveedor-actu-doc/com-proveedor-actu-doc.repository';

@Injectable({
	providedIn: 'root',
})
export class ComProveedorActuService {
	constructor(
    private repo: ComProveedorActuRepository,
    private repoDoc: ComProveedorActuDocRepository
  ) {}

	//#region <Validadores>
	esValido(model: ComProveedorActu, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_PROVEEDOR', caption: 'Corr.', width: 85 },
			{ dataField: 'CODIGO_PROVEEDOR', caption: 'Código Proveedor', width: 150 },
			{ dataField: 'NOMBRE_TIPO_PERSONERIA', caption: 'Personería', width: 100 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Nombre del Proveedor', width: 250 },
			{ dataField: 'NUMERO_NRC', caption: 'No. NRC', width: 150 },
			{ dataField: 'NUMERO_NIT', caption: 'No. NIT', width: 150 },
      { dataField: 'NOMBRE_TIPO_DIP', caption: 'Tipo DIP', width: 100 },
			{ dataField: 'NUMERO_DIP', caption: 'No. DIP', width: 150 },
			{ dataField: 'NOMBRE_ACTIVIDAD_ECONOMICA', caption: 'Actividad Económica', width: 250 },
      { dataField: 'NOMBRE_COMERCIAL', caption: 'Nombre Comercial', width: 250 },
			{ dataField: 'PRIMER_NOMBRE', caption: 'Primer Nombre', width: 150 },
			{ dataField: 'SEGUNDO_NOMBRE', caption: 'Segundo Nombre', width: 150 },
			{ dataField: 'PRIMER_APELLIDO', caption: 'Primer Apellido', width: 150 },
			{ dataField: 'SEGUNDO_APELLIDO', caption: 'Segundo Apellido', width: 150 },
			{ dataField: 'DIRECCION_PROVEEDOR', caption: 'Dirección Proveedor', width: 300 },
			{ dataField: 'NOMBRE_PAIS', caption: 'Pais', width: 250 },
			{ dataField: 'NOMBRE_DEPTO', caption: 'Depto', width: 250 },
			{ dataField: 'NOMBRE_MUNICIPIO', caption: 'Municipio', width: 250 },
			{ dataField: 'NOMBRE_CONTACTO', caption: 'Contacto', width: 250 },
			{ dataField: 'TELEFONO_FIJO', caption: 'Teléfono Fijo', width: 150 },
			{ dataField: 'TELEFONO_MOVIL', caption: 'Teléfono Movil', width: 150 },
			{ dataField: 'CORREO_ELECTRONICO_1', caption: 'Correo Electrónico 1', width: 150 },
			{ dataField: 'CORREO_ELECTRONICO_2', caption: 'Correo Electrónico 2', width: 150 },
			{ dataField: 'NOMBRE_FORMA_PAGO', caption: 'Forma de Pago', width: 250 },
			{ dataField: 'CUENTA_BANCARIA', caption: 'Cuenta Bancaria', width: 150 },
			{ dataField: 'NOMBRE_BANCO', caption: 'Banco', width: 250 },
			{ dataField: 'NOMBRE_ESTADO_PROVEEDOR', caption: 'Estado Proveedor', width: 250 },
			{ dataField: 'NOMBRE_ESTADO_PROVEEDOR_WEB', caption: 'Estado Proveedor Web', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_PROVEEDOR', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

  //#region <COM_PROVEEDOR_dOC>
  getDoc(param: any): Observable<Blob> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR },
      { Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
      { Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
    ];

		return this.repoDoc.getDoc(xWhere);
	}

  getAllCOM_PROVEEDOR_DOC(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR },
    ];

		return this.repoDoc.get(xWhere);
	}

  insertDoc(model: FormData): any {
    return this.repoDoc.insertDoc(model);
  }

  deleteCOM_PROVEEDOR_DOC(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
      { Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
		];

		return this.repoDoc.delete(xWhere);
	}
  //#endregion

}
