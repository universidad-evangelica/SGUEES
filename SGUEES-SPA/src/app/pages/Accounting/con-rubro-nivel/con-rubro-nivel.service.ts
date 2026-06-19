import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConRubroNivelRepository } from './con-rubro-nivel.repository';
import { ConRubroNivel } from './models/con-rubro-nivel';

@Injectable({
	providedIn: 'root',
})
export class ConRubroNivelService {
	constructor(private repo: ConRubroNivelRepository) {}

	esValido(model: ConRubroNivel, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CODIGO_RUBRO', Value: param.CODIGO_RUBRO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CODIGO_RUBRO', Value: param.CODIGO_RUBRO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'CODIGO_RUBRO', Value: model.CODIGO_RUBRO },
			{ Parameter: 'NIVEL', Value: model.NIVEL },
		];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'CODIGO_RUBRO', Value: model.CODIGO_RUBRO },
			{ Parameter: 'NIVEL', Value: model.NIVEL },
		];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CODIGO_RUBRO', caption: 'Código Rubro', width: 120 },
			{ dataField: 'NOMBRE_RUBRO', caption: 'Nombre Rubro', width: 200 },
			{ dataField: 'NIVEL', caption: 'Nivel', width: 80 },
			{ dataField: 'NUMERO_CARACTERES', caption: 'No. Caracteres', width: 120 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CODIGO_RUBRO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CODIGO_RUBRO', label: { text: 'Código Rubro' }, colSpan: 2, editorOptions: { placeholder: 'Código Rubro...', showClearButton: true } },
			{ dataField: 'NOMBRE_RUBRO', label: { text: 'Nombre Rubro' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Rubro...', showClearButton: true } },
			{ dataField: 'NIVEL', label: { text: 'Nivel' }, colSpan: 2, editorOptions: { placeholder: 'Nivel...', showClearButton: true } },
			{ dataField: 'NUMERO_CARACTERES', label: { text: 'No. Caracteres' }, colSpan: 2, editorOptions: { placeholder: 'No. Caracteres...', showClearButton: true } },
		];
	}
}
