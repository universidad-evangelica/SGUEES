import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConTipoCentroCostoRepository } from './con-tipo-centro-costo.repository';
import { ConTipoCentroCosto } from './models/con-tipo-centro-costo';

@Injectable({
	providedIn: 'root',
})
export class ConTipoCentroCostoService {
	constructor(private repo: ConTipoCentroCostoRepository) {}

	esValido(model: ConTipoCentroCosto, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CENTRO_COSTO', Value: param.CORR_TIPO_CENTRO_COSTO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CENTRO_COSTO', Value: param.CORR_TIPO_CENTRO_COSTO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CENTRO_COSTO', Value: model.CORR_TIPO_CENTRO_COSTO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CENTRO_COSTO', Value: model.CORR_TIPO_CENTRO_COSTO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_CENTRO_COSTO', caption: 'Corr.' },
			{ dataField: 'NOMBRE_TIPO_CENTRO_COSTO', caption: 'Nombre' },
			{ dataField: 'NOMBRE_CLASE_CENTRO_COSTO', caption: 'Clase' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_CENTRO_COSTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_CENTRO_COSTO', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { placeholder: 'Corr....', showClearButton: true } },
			{ dataField: 'NOMBRE_TIPO_CENTRO_COSTO', label: { text: 'Nombre' }, colSpan: 2, editorOptions: { placeholder: 'Nombre...', showClearButton: true } },
			{ dataField: 'CLASE_CENTRO_COSTO', label: { text: 'Clase' }, colSpan: 2, editorOptions: { placeholder: 'Clase...', showClearButton: false }, template: 'CLASE_CENTRO_COSTOLookup' },
		];
	}
}
