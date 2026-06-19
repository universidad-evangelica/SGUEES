import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConParametroRepository } from './con-parametro.repository';
import { ConParametro } from './models/con-parametro';

@Injectable({
	providedIn: 'root',
})
export class ConParametroService {
	constructor(private repo: ConParametroRepository) {}

	esValido(model: ConParametro, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'NOMBRE_PUESTO1', caption: 'Nombre Puesto 1', width: 200 },
			{ dataField: 'DESCRIPCION_PUESTO1', caption: 'Descripción Puesto 1', width: 200 },
			{ dataField: 'NOMBRE_PUESTO2', caption: 'Nombre Puesto 2', width: 200 },
			{ dataField: 'DESCRIPCION_PUESTO2', caption: 'Descripción Puesto 2', width: 200 },
			{ dataField: 'NOMBRE_PUESTO3', caption: 'Nombre Puesto 3', width: 200 },
			{ dataField: 'DESCRIPCION_PUESTO3', caption: 'Descripción Puesto 3', width: 200 },
			{ dataField: 'NIVEL_CUENTA_MAYOR', caption: 'Nivel Cuenta Mayor', width: 120 },
			{ dataField: 'CORR_MONEDA', caption: 'Moneda', width: 100 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'NOMBRE_PUESTO1', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'NOMBRE_PUESTO1', label: { text: 'Nombre Puesto 1' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Puesto 1...', showClearButton: true } },
			{ dataField: 'DESCRIPCION_PUESTO1', label: { text: 'Descripción Puesto 1' }, colSpan: 2, editorOptions: { placeholder: 'Descripción Puesto 1...', showClearButton: true } },
			{ dataField: 'NOMBRE_PUESTO2', label: { text: 'Nombre Puesto 2' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Puesto 2...', showClearButton: true } },
			{ dataField: 'DESCRIPCION_PUESTO2', label: { text: 'Descripción Puesto 2' }, colSpan: 2, editorOptions: { placeholder: 'Descripción Puesto 2...', showClearButton: true } },
			{ dataField: 'NOMBRE_PUESTO3', label: { text: 'Nombre Puesto 3' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Puesto 3...', showClearButton: true } },
			{ dataField: 'DESCRIPCION_PUESTO3', label: { text: 'Descripción Puesto 3' }, colSpan: 2, editorOptions: { placeholder: 'Descripción Puesto 3...', showClearButton: true } },
			{ dataField: 'NIVEL_CUENTA_MAYOR', label: { text: 'Nivel Cuenta Mayor' }, colSpan: 2, editorOptions: { placeholder: 'Nivel Cuenta Mayor...', showClearButton: true } },
			{ dataField: 'CORR_MONEDA', label: { text: 'Moneda' }, colSpan: 2, editorOptions: { placeholder: 'Moneda...', showClearButton: true } },
		];
	}
}
