import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComProveedorRepository } from './com-proveedor.repository';
import { ComProveedor } from './models/com-proveedor';
import { ComProveedorUsuarioRepository } from './com-proveedor-usuario/com-proveedor-usuario.repository';
import { ComProveedorDocRepository } from './com-proveedor-doc/com-proveedor-doc.repository';

@Injectable({
	providedIn: 'root',
})
export class ComProveedorService {
	constructor(
    private repo: ComProveedorRepository,
    private repoUsuario: ComProveedorUsuarioRepository,
    private repoDoc: ComProveedorDocRepository
  ) {}

	//#region <Validadores>
	esValido(model: ComProveedor, msg: Function): boolean {
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
			{ dataField: 'CORR_PROVEEDOR', caption: 'Corr.', width: 100 },
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
      { dataField: 'NOMBRE_CONDICION_PAGO', caption: 'Condición Pago', width: 250 },
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

	getItems(): any {
		// return [
		// 	{ dataField: 'CORR_PROVEEDOR', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
		// 	{
		// 		dataField: 'CODIGO_PROVEEDOR',
		// 		label: { text: 'Código' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false, maxLength: 20  },
		// 	},
		// 	{
		// 		dataField: 'TIPO_PERSONERIA',
		// 		label: { text: 'Tipo Personería' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false, maxLength: 1  },
    //     template: 'TIPO_PERSONERIALookup',
		// 	},
		// 	{
		// 		dataField: 'NOMBRE_PROVEEDOR',
		// 		label: { text: 'Nombre Proveedor' },
		// 		colSpan: 3,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 150 },
		// 	},
		// 	{
		// 		dataField: 'PRIMER_NOMBRE',
		// 		label: { text: 'Primer Nombre' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 50  },
		// 	},
		// 	{
		// 		dataField: 'SEGUNDO_NOMBRE',
		// 		label: { text: 'Segundo Nombre' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 50  },
		// 	},
		// 	{
		// 		dataField: 'PRIMER_APELLIDO',
		// 		label: { text: 'Primer Apellido' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 50  },
		// 	},
		// 	{
		// 		dataField: 'SEGUNDO_APELLIDO',
		// 		label: { text: 'Segundo Apellido' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 50  },
		// 	},
    //   {
		// 		dataField: 'CORR_TIPO_DIP',
		// 		label: { text: 'Tipo DIP' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'CORR_TIPO_DIPLookup',
		// 	},
		// 	{
		// 		dataField: 'NUMERO_DIP',
		// 		label: { text: 'No. DIP' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 25  },
		// 	},
    //   {
		// 		dataField: 'NOMBRE_COMERCIAL',
		// 		label: { text: 'Nombre Comercial' },
		// 		colSpan: 2,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 50  },
		// 	},
		// 	{
		// 		dataField: 'NUMERO_NRC',
		// 		label: { text: 'No. NRC' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 25  },
		// 	},
		// 	{
		// 		dataField: 'NUMERO_NIT',
		// 		label: { text: 'No. NIT' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 25  },
		// 	},
    //   {
		// 		dataField: 'ESTADO_PROVEEDOR',
		// 		label: { text: 'Estado' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'ESTADO_PROVEEDORLookup',
		// 	},
		// 	{
		// 		dataField: 'ESTADO_PROVEEDOR_WEB',
		// 		label: { text: 'Estado Web' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'ESTADO_PROVEEDOR_WEBLookup',
		// 	},
		// 	{
		// 		dataField: 'DIRECCION_PROVEEDOR',
		// 		label: { text: 'Dirección' },
		// 		colSpan: 3,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 50  },
		// 	},
		// 	{
		// 		dataField: 'CORR_PAIS',
		// 		label: { text: 'País' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'CORR_PAISLookup',
		// 	},
		// 	{
		// 		dataField: 'CORR_DEPTO',
		// 		label: { text: 'Depto.' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'CORR_DEPTOLookup',
		// 	},
		// 	{
		// 		dataField: 'CORR_MUNICIPIO',
		// 		label: { text: 'Municipio' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'CORR_MUNICIPIOLookup',
		// 	},
    //   {
		// 		dataField: 'CORR_ACTIVIDAD_ECONOMICA',
		// 		label: { text: 'Actividad Económica' },
		// 		colSpan: 2,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'CORR_ACTIVIDAD_ECONOMICALookup',
		// 	},
    //   {
		// 		dataField: 'NOMBRE_CONTACTO',
		// 		label: { text: 'Contacto' },
		// 		colSpan: 2,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 25  },
		// 	},
		// 	{
		// 		dataField: 'TELEFONO_FIJO',
		// 		label: { text: 'Teléfono Fijo' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 25  },
		// 	},
		// 	{
		// 		dataField: 'TELEFONO_MOVIL',
		// 		label: { text: 'Teléfono Móvil' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 25  },
		// 	},
		// 	{
		// 		dataField: 'CORREO_ELECTRONICO_1',
		// 		label: { text: 'Correo Electrónico 1' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 255  },
		// 	},
		// 	{
		// 		dataField: 'CORREO_ELECTRONICO_2',
		// 		label: { text: 'Correo Electrónico 2' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 255  },
		// 	},
		// 	{
		// 		dataField: 'CORR_FORMA_PAGO',
		// 		label: { text: 'Forma de Pago' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'CORR_FORMA_PAGOLookup',
		// 	},
		// 	{
		// 		dataField: 'CUENTA_BANCARIA',
		// 		label: { text: 'Cuenta Bancaria' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: true, maxLength: 30  },
		// 	},
		// 	{
		// 		dataField: 'CORR_BANCO',
		// 		label: { text: 'Banco' },
		// 		colSpan: 1,
		// 		editorOptions: { placeholder: '', showClearButton: false },
		// 		template: 'CORR_BANCOLookup',
		// 	},
		// ];
	}

  getAllCOM_PROVEEDOR_USUARIO(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR },
    ];

		return this.repoUsuario.get(xWhere);
	}

  insertCOM_PROVEEDOR_USUARIO(model: any): Observable<IResult> {
		return this.repoUsuario.create(model);
	}

	updateCOM_PROVEEDOR_USUARIO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
      { Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
		];

		return this.repoUsuario.update(model, xWhere);
	}

	deleteCOM_PROVEEDOR_USUARIO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
      { Parameter: 'LOGIN_SISTEMA', Value: model.LOGIN_SISTEMA },
      { Parameter: 'NOMBRE_USUARIO', Value: model.LOGIN_SISTEMA },
      { Parameter: 'CORREO_ELECTRONICO', Value: model.LOGIN_SISTEMA },
		];

		return this.repoUsuario.delete(xWhere);
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

  reasignarClave(model: any): Observable<IResult> {
		return this.repoUsuario.reasignarClave(model);
	}
}
