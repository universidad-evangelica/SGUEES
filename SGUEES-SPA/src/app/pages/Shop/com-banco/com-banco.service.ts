import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComBancoRepository } from './com-banco.repository';
import { ComBanco } from './models/com-banco';

@Injectable({
	providedIn: 'root',
})
export class ComBancoService {
	constructor(private repo: ComBancoRepository) {}

	//#region <Validadores>
	esValido(model: ComBanco, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: param.CORR_BANCO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: param.CORR_BANCO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: model.CORR_BANCO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: model.CORR_BANCO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_BANCO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_BANCO', caption: 'Nombre Banco', width: 250 },
			{ dataField: 'NOMBRE_BANCO_CORTO', caption: 'Nombre Banco Corto', width: 250 },
			// { dataField: 'CLASE_BANCO', caption: 'Clase Banco', width: 150 },
      { dataField: 'NOMBRE_CLASE_BANCO', caption: 'Clase Banco', width: 250 },
			{ dataField: 'CODIGO_TRANSACION_UNI', caption: 'Codigo Transacion Uni', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_BANCO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_BANCO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_BANCO',
				label: { text: 'Nombre Banco' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Banco...', showClearButton: true, maxLength: 60 },
			},
      {
				dataField: 'NOMBRE_BANCO_CORTO',
				label: { text: 'Nombre Banco Corto' },
				colSpan: 1,
				editorOptions: { placeholder: 'Nombre Banco Corto...', showClearButton: true, maxLength: 60 },
			},
			{
				dataField: 'CLASE_BANCO',
				label: { text: 'Clase Banco' },
				colSpan: 1,
				editorOptions: { placeholder: 'Clase Banco...', showClearButton: false },
				template: 'CLASE_BANCOLookup',
			},
			{
				dataField: 'CODIGO_TRANSACION_UNI',
				label: { text: 'Codigo Transacion Uni' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Transacion Uni...', showClearButton: true, maxLength: 5  },
			},
		];
	}
}
