import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenRubroRepository } from './gen-rubro.repository';
import { GenRubro } from './models/gen-rubro';
import { GenRubroImpuestoRepository } from './gen-rubro-impuesto/gen-rubro-impuesto.repository';
import { GenRubroSumaRepository } from './gen-rubro-suma/gen-rubro-suma.repository';

@Injectable({
	providedIn: 'root',
})
export class GenRubroService {
	constructor(
    private repo: GenRubroRepository,
    private repoImpuesto: GenRubroImpuestoRepository,
    private repoSumandos: GenRubroSumaRepository
  ) {}

	//#region <Validadores>
	esValido(model: GenRubro, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_RUBRO', Value: param.CORR_RUBRO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_RUBRO', Value: param.CORR_RUBRO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_RUBRO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_RUBRO', caption: 'Rubro', width: 250 },
			{ dataField: 'DESCRIPCION_RUBRO', caption: 'Descripcion Rubro', width: 150 },
			{ dataField: 'ES_IMPUESTO', caption: 'Es Impuesto', width: 150 },
			{ dataField: 'POR_IMPUESTO', caption: 'Por Impuesto', width: 150, format: '#,##0.00' },
			{ dataField: 'MUESTRA_DETALLE', caption: 'Muestra Detalle', width: 150 },
			{ dataField: 'MUESTRA_TOTAL', caption: 'Muestra Total', width: 150 },
			{ dataField: 'NOMBRE_SUMA_RESTA', caption: 'Suma Resta', width: 250 },
			{ dataField: 'NOMBRE_CLASE_RUBRO', caption: 'Clase Rubro', width: 250 },
			{ dataField: 'NOMBRE_TIPO_APLICACION', caption: 'Tipo Aplicacion', width: 250 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_RUBRO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_RUBRO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_RUBRO',
				label: { text: 'Nombre Rubro' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Rubro...', showClearButton: true },
			},
      {
				dataField: 'SUMA_RESTA',
				label: { text: 'Suma Resta' },
				colSpan: 1,
				editorOptions: { placeholder: 'Suma Resta...', showClearButton: true },
				template: 'SUMA_RESTALookup',
			},
			{
				dataField: 'CLASE_RUBRO',
				label: { text: 'Clase Rubro' },
				colSpan: 1,
				editorOptions: { placeholder: 'Clase Rubro...', showClearButton: false },
				template: 'CLASE_RUBROLookup',
			},
      {
				dataField: 'TIPO_APLICACION',
				label: { text: 'Tipo Aplicacion' },
				colSpan: 2,
				editorOptions: { placeholder: 'Tipo Aplicacion...', showClearButton: true },
				template: 'TIPO_APLICACIONLookup',
			},
			{
				dataField: 'DESCRIPCION_RUBRO',
				label: { text: 'Descripcion Rubro' },
				colSpan: 3,
				editorOptions: { placeholder: 'Descripcion Rubro...', showClearButton: true },
			},
			{
				dataField: 'MUESTRA_DETALLE',
				label: { text: 'Muestra Detalle' },
				colSpan: 1,
				editorOptions: { placeholder: 'Muestra Detalle...', showClearButton: true },
			},
			{
				dataField: 'MUESTRA_TOTAL',
				label: { text: 'Muestra Total' },
				colSpan: 1,
				editorOptions: { placeholder: 'Muestra Total...', showClearButton: true },
			},
      {
				dataField: 'ES_IMPUESTO',
				label: { text: 'Es Impuesto' },
				colSpan: 1,
				editorOptions: { placeholder: 'Es Impuesto...', showClearButton: true },
			},
			{
				dataField: 'POR_IMPUESTO',
				label: { text: 'Por Impuesto' },
				editorType: 'dxNumberBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Por Impuesto...', format: '#,##0.00' },
			},
		];
  }
  //#region <Impuestos>
  getAllGEN_RUBRO_IMPUESTO(param: any): Observable<IResult> {
    let xWhere: IParam[] = [{ Parameter: 'CORR_RUBRO', Value: param.CORR_RUBRO }];
    return this.repoImpuesto.get(xWhere);
  }

	getGEN_RUBRO_IMPUESTO(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'CORR_RUBRO', Value: param.CORR_RUBRO },
			{ Parameter: 'CORR_IMPUESTO', Value: param.CORR_IMPUESTO },
		];

		return this.repoImpuesto.get(xWhere);
	}

	insertGEN_RUBRO_IMPUESTO(model: any): Observable<IResult> {
		return this.repoImpuesto.create(model);
	}

	updateGEN_RUBRO_IMPUESTO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
			{ Parameter: 'CORR_IMPUESTO', Value: model.CORR_IMPUESTO },
		];

		return this.repoImpuesto.update(model, xWhere);
	}

	deleteGEN_RUBRO_IMPUESTO(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
			{ Parameter: 'CORR_IMPUESTO', Value: model.CORR_IMPUESTO },
		];
		return this.repoImpuesto.delete(xWhere);
	}
	//#endregion

  //#region <Sumandos>
  getAllGEN_RUBRO_SUMA(param: any): Observable<IResult> {
    let xWhere: IParam[] = [{ Parameter: 'CORR_RUBRO', Value: param.CORR_RUBRO }];
    return this.repoSumandos.get(xWhere);
  }

  getGEN_RUBRO_SUMA(param: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'CORR_RUBRO', Value: param.CORR_RUBRO },
      { Parameter: 'CORR_SUMA', Value: param.CORR_SUMA },
    ];

    return this.repoSumandos.get(xWhere);
  }
  insertGEN_RUBRO_SUMA(model: any): Observable<IResult> {
    return this.repoSumandos.create(model);
  }

  updateGEN_RUBRO_SUMA(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
      { Parameter: 'CORR_SUMA', Value: model.CORR_SUMA },
    ];
    return this.repoSumandos.update(model, xWhere);
  }

  deleteGEN_RUBRO_SUMA(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
      { Parameter: 'CORR_SUMA', Value: model.CORR_SUMA },
    ];
    return this.repoSumandos.delete(xWhere);
  }

  //#endregion
}
