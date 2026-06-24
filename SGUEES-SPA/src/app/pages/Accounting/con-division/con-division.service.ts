import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConDivisionRepository } from './con-division.repository';
import { ConDivision } from './models/con-division';

@Injectable({
	providedIn: 'root',
})
export class ConDivisionService {
	constructor(private repo: ConDivisionRepository) {}

	esValido(model: ConDivision, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DIVISION', Value: model.CORR_DIVISION }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DIVISION', Value: model.CORR_DIVISION }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_DIVISION', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_DIVISION', caption: 'Nombre', width: 300 },
			{ dataField: 'CODIGO_DIVISION', caption: 'Código', width: 100 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_DIVISION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DIVISION', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { placeholder: 'Corr....', showClearButton: true } },
			{ dataField: 'NOMBRE_DIVISION', label: { text: 'Nombre' }, colSpan: 3, editorOptions: { placeholder: 'Nombre...', showClearButton: true } },
			{ dataField: 'CODIGO_DIVISION', label: { text: 'Código' }, colSpan: 1, editorOptions: { placeholder: 'Código...', showClearButton: true } },
		];
	}
}
