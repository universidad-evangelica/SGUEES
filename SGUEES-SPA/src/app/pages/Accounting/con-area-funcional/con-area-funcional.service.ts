import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ConAreaFuncionalRepository } from './con-area-funcional.repository';
import { ConAreaFuncional } from './models/con-area-funcional';

@Injectable({
	providedIn: 'root',
})
export class ConAreaFuncionalService {
	constructor(private repo: ConAreaFuncionalRepository) {}

	//#region <Validadores>
	esValido(model: ConAreaFuncional, msg: Function): boolean {
		if (model.NOMBRE_AREA_FUNCIONAL == '') {
			msg('Debe digitar el nombre del Area Funcional', NotifyType.Error)
			return false;
		}

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_AREA_FUNCIONAL', Value: param.CORR_AREA_FUNCIONAL }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_AREA_FUNCIONAL', Value: param.CORR_AREA_FUNCIONAL }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_AREA_FUNCIONAL', Value: model.CORR_AREA_FUNCIONAL }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_AREA_FUNCIONAL', Value: model.CORR_AREA_FUNCIONAL }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_AREA_FUNCIONAL', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_AREA_FUNCIONAL', caption: 'Nombre Area Funcional', width: 250 },
			{ dataField: 'CODIGO_AREA_FUNCIONAL', caption: 'Codigo Area Funcional', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_AREA_FUNCIONAL', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_AREA_FUNCIONAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_AREA_FUNCIONAL',
				label: { text: 'Nombre Area Funcional' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Area Funcional...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'El nombre del Area Funcional es obligatorio' }],
			},
			{
				dataField: 'CODIGO_AREA_FUNCIONAL',
				label: { text: 'Codigo Area Funcional' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Area Funcional...', showClearButton: true, maxLength: 30  },
			},
		];
	}
}
