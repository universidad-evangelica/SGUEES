import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConGerenciaRepository } from './con-gerencia.repository';
import { ConGerencia } from './models/con-gerencia';

@Injectable({
	providedIn: 'root',
})
export class ConGerenciaService {
	constructor(private repo: ConGerenciaRepository) {}

	esValido(model: ConGerencia, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_GERENCIA', Value: model.CORR_GERENCIA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_GERENCIA', Value: model.CORR_GERENCIA }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_DIVISION', caption: 'División', width: 85 },
			{ dataField: 'CORR_GERENCIA', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_GERENCIA', caption: 'Nombre', width: 300 },
			{ dataField: 'CODIGO_GERENCIA', caption: 'Código', width: 100 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_GERENCIA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DIVISION', label: { text: 'División' }, colSpan: 2, editorOptions: { placeholder: 'División...', showClearButton: true } },
			{ dataField: 'CORR_GERENCIA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { placeholder: 'Corr....', showClearButton: true } },
			{ dataField: 'NOMBRE_GERENCIA', label: { text: 'Nombre' }, colSpan: 3, editorOptions: { placeholder: 'Nombre...', showClearButton: true } },
			{ dataField: 'CODIGO_GERENCIA', label: { text: 'Código' }, colSpan: 1, editorOptions: { placeholder: 'Código...', showClearButton: true } },
		];
	}
}
