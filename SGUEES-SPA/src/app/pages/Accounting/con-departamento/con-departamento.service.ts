import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConDepartamentoRepository } from './con-departamento.repository';
import { ConDepartamento } from './models/con-departamento';

@Injectable({
	providedIn: 'root',
})
export class ConDepartamentoService {
	constructor(private repo: ConDepartamentoRepository) {}

	esValido(model: ConDepartamento, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: param.CORR_DEPARTAMENTO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: param.CORR_DEPARTAMENTO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: model.CORR_DEPARTAMENTO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: model.CORR_DEPARTAMENTO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_DIVISION', caption: 'División', width: 85 },
			{ dataField: 'CORR_GERENCIA', caption: 'Gerencia', width: 85 },
			{ dataField: 'CORR_DEPARTAMENTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_DEPARTAMENTO', caption: 'Nombre', width: 300 },
			{ dataField: 'CODIGO_DEPARTAMENTO', caption: 'Código', width: 100 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_DEPARTAMENTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DIVISION', label: { text: 'División' }, colSpan: 1, editorOptions: { placeholder: 'División...', showClearButton: true } },
			{ dataField: 'CORR_GERENCIA', label: { text: 'Gerencia' }, colSpan: 1, editorOptions: { placeholder: 'Gerencia...', showClearButton: true } },
			{ dataField: 'CORR_DEPARTAMENTO', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { placeholder: 'Corr....', showClearButton: true } },
			{ dataField: 'NOMBRE_DEPARTAMENTO', label: { text: 'Nombre' }, colSpan: 3, editorOptions: { placeholder: 'Nombre...', showClearButton: true } },
			{ dataField: 'CODIGO_DEPARTAMENTO', label: { text: 'Código' }, colSpan: 1, editorOptions: { placeholder: 'Código...', showClearButton: true } },
		];
	}
}
