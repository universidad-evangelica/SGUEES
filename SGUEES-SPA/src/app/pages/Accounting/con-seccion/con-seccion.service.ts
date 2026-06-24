import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConSeccionRepository } from './con-seccion.repository';
import { ConSeccion } from './models/con-seccion';

@Injectable({
	providedIn: 'root',
})
export class ConSeccionService {
	constructor(private repo: ConSeccionRepository) {}

	esValido(model: ConSeccion, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECCION', Value: param.CORR_SECCION }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECCION', Value: param.CORR_SECCION }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECCION', Value: model.CORR_SECCION }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECCION', Value: model.CORR_SECCION }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_DIVISION', caption: 'División', width: 85 },
			{ dataField: 'CORR_GERENCIA', caption: 'Gerencia', width: 85 },
			{ dataField: 'CORR_DEPARTAMENTO', caption: 'Depto.', width: 85 },
			{ dataField: 'CORR_SECCION', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_SECCION', caption: 'Nombre', width: 300 },
			{ dataField: 'CODIGO_SECCION', caption: 'Código', width: 100 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_SECCION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DIVISION', label: { text: 'División' }, colSpan: 1, editorOptions: { placeholder: 'División...', showClearButton: true } },
			{ dataField: 'CORR_GERENCIA', label: { text: 'Gerencia' }, colSpan: 1, editorOptions: { placeholder: 'Gerencia...', showClearButton: true } },
			{ dataField: 'CORR_DEPARTAMENTO', label: { text: 'Depto.' }, colSpan: 1, editorOptions: { placeholder: 'Depto....', showClearButton: true } },
			{ dataField: 'CORR_SECCION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { placeholder: 'Corr....', showClearButton: true } },
			{ dataField: 'NOMBRE_SECCION', label: { text: 'Nombre' }, colSpan: 3, editorOptions: { placeholder: 'Nombre...', showClearButton: true } },
			{ dataField: 'CODIGO_SECCION', label: { text: 'Código' }, colSpan: 1, editorOptions: { placeholder: 'Código...', showClearButton: true } },
		];
	}
}
