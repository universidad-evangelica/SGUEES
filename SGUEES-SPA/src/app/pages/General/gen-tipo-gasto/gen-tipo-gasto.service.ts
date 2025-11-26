import { ComBanco } from './../../Shop/com-banco/models/com-banco';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenTipoGastoRepository } from './gen-tipo-gasto.repository';
import { GenTipoGasto } from './models/gen-tipo-gasto';
import { GenTipoGastoImpuestoRepository } from './gen-tipo-gasto-impuesto/gen-tipo-gasto-impuesto.repository';

@Injectable({
	providedIn: 'root',
})
export class GenTipoGastoService {
	constructor(
    private repo: GenTipoGastoRepository,
    private repoImpuesto: GenTipoGastoImpuestoRepository) {}

	//#region <Validadores>
	esValido(model: GenTipoGasto, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_GASTO', Value: param.CORR_TIPO_GASTO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_GASTO', Value: param.CORR_TIPO_GASTO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_GASTO', Value: model.CORR_TIPO_GASTO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_GASTO', Value: model.CORR_TIPO_GASTO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_GASTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_GASTO', caption: 'Tipo Gasto', width: 350 },
			{ dataField: 'ES_SERVICIO', caption: 'Es Servicio', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_GASTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_GASTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_GASTO',
				label: { text: 'Tipo Gasto' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Tipo Gasto...', showClearButton: true },
			},
			{
				dataField: 'ES_SERVICIO',
				label: { text: 'Es Servicio' },
				colSpan: 1,
				editorOptions: { placeholder: 'Es Servicio...', showClearButton: true },
			}
		];
	}
  //#region <Impuestos>
  getAllGEN_TIPO_GASTO_IMPUESTO(param: any): Observable<IResult> {
    let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_GASTO', Value: param.CORR_TIPO_GASTO }];

    return this.repoImpuesto.get(xWhere);
  }
  getGEN_TIPO_GASTO_IMPUESTO(param: any): Observable<IResult> {
    let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_GASTO', Value: param.CORR_TIPO_GASTO }];

    return this.repoImpuesto.get(xWhere);
  }
  insertGEN_TIPO_GASTO_IMPUESTO(model: any): Observable<IResult> {
    return this.repoImpuesto.create(model);
  }
  updateGEN_TIPO_GASTO_IMPUESTO(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'CORR_TIPO_GASTO', Value: model.CORR_TIPO_GASTO },
      { Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
    ];
    return this.repoImpuesto.update(model, xWhere);
  }

  deleteGEN_TIPO_GASTO_IMPUESTO(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'CORR_TIPO_GASTO', Value: model.CORR_TIPO_GASTO },
      { Parameter: 'CORR_RUBRO', Value: model.CORR_RUBRO },
    ];
    return this.repoImpuesto.delete(xWhere);
  }

  //#endregion
}
