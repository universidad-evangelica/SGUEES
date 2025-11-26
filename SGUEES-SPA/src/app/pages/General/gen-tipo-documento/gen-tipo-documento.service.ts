import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenTipoDocumentoRepository } from './gen-tipo-documento.repository';
import { GenTipoDocumento } from './models/gen-tipo-documento';
import { GenTipoDocumentoRubroRepository } from './gen-tipo-documento-rubro/gen-tipo-documento-rubro.repository';

@Injectable({
	providedIn: 'root',
})
export class GenTipoDocumentoService {
	constructor(
    private repo: GenTipoDocumentoRepository,
    private repoRubros: GenTipoDocumentoRubroRepository,
  ) {}

	//#region <Validadores>
	esValido(model: GenTipoDocumento, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOC', Value: param.CORR_TIPO_DOC }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOC', Value: param.CORR_TIPO_DOC }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOC', Value: model.CORR_TIPO_DOC }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOC', Value: model.CORR_TIPO_DOC }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_DOC', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_DOC', caption: 'Tipo Doc', width: 250 },
			{ dataField: 'NOMBRE_CORTO_TIPO_DOC', caption: 'Nombre Corto', width: 150 },
			{ dataField: 'USAR_COMPRAS', caption: 'Compras', width: 150 },
			{ dataField: 'USAR_VENTAS', caption: 'Ventas', width: 150 },
			{ dataField: 'NOMBRE_CLASE_DOCUMENTO', caption: 'Clase Documento', width: 250 },
			{ dataField: 'NOMBRE_SUMA_RESTA', caption: 'Suma Resta', width: 250 },
			{ dataField: 'NOMBRE_LIBRO_IVA', caption: 'Libro Iva', width: 250 },
			{ dataField: 'ES_ELECTRONICO', caption: 'Es Electronico', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_DOC', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_DOC', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_DOC',
				label: { text: 'Tipo Doc' },
				colSpan: 3,
				editorOptions: { placeholder: 'Tipo Doc...', showClearButton: true },
			},
      {
				dataField: 'NOMBRE_CORTO_TIPO_DOC',
				label: { text: 'Nombre Corto' },
				colSpan: 1,
				editorOptions: { placeholder: 'Nombre Corto ...', showClearButton: true },
			},
      {
        dataField: 'CLASE_DOCUMENTO',
        label: { text: 'Clase Documento' },
        colSpan: 2,
        editorOptions: { placeholder: 'Clase Documento...', showClearButton: false },
        template: 'CLASE_DOCUMENTOLookup',
      },
      {
        dataField: 'SUMA_RESTA',
        label: { text: 'Suma Resta' },
        colSpan: 1,
        editorOptions: { placeholder: 'Suma Resta...', showClearButton: true },
				template: 'SUMA_RESTALookup',

      },
      {
        dataField: 'LIBRO_IVA',
        label: { text: 'Libro Iva' },
        colSpan: 2,
        editorOptions: { placeholder: 'Libro Iva...', showClearButton: true },
        template: 'LIBRO_IVALookup',
      },
			{
				dataField: 'USAR_VENTAS',
				label: { text: 'Usar Ventas' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usar Ventas...', showClearButton: true },
			},
			{
				dataField: 'USAR_COMPRAS',
				label: { text: 'Usar Compras' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usar Compras...', showClearButton: true },
			},
			{
				dataField: 'ES_ELECTRONICO',
				label: { text: 'Es Electronico' },
				colSpan: 1,
				editorOptions: { placeholder: 'Es Electronico...', showClearButton: true },
			},
		];
	}

  //#region <Rubros>
  getAllGEN_TIPO_DOCUMENTO_RUBRO(param: any): Observable<IResult> {
    let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOC', Value: param.CORR_TIPO_DOC }];
    return this.repoRubros.get(xWhere);
  }

  insertGEN_TIPO_DOCUMENTO_RUBRO(model: any): Observable<IResult> {
    return this.repoRubros.create(model);
  }

  updateGEN_TIPO_DOCUMENTO_RUBRO(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'CORR_TIPO_DOC', Value: model.CORR_TIPO_DOC },
      { Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
    ];
    return this.repoRubros.update(model, xWhere);
  }

  deleteGEN_TIPO_DOCUMENTO_RUBRO(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'CORR_TIPO_DOC', Value: model.CORR_TIPO_DOC },
      { Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
    ];
    return this.repoRubros.delete(xWhere);
  }
  //#endregion
}
