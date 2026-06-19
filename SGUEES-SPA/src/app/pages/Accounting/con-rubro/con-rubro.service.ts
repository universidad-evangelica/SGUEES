import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConRubroRepository } from './con-rubro.repository';
import { ConRubro } from './models/con-rubro';

@Injectable({
	providedIn: 'root',
})
export class ConRubroService {
	constructor(private repo: ConRubroRepository) {}

	esValido(model: ConRubro, msg: Function): boolean {
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
		let xWhere: IParam[] = [{ Parameter: 'CODIGO_RUBRO', Value: model.CODIGO_RUBRO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CODIGO_RUBRO', Value: model.CODIGO_RUBRO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CODIGO_RUBRO', caption: 'Rubro' },
			{ dataField: 'NOMBRE_RUBRO', caption: 'Nombre Rubro' },
			{ dataField: 'ES_DEBE', caption: 'Debe' },
			{ dataField: 'ES_HABER', caption: 'Haber' },
			{ dataField: 'NOMBRE_CLASE_RUBRO', caption: 'Clase de Rubro' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CODIGO_RUBRO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CODIGO_RUBRO', label: { text: 'Rubro' }, colSpan: 2, editorOptions: { showClearButton: true } },
			{ dataField: 'ES_DEBE', label: { text: 'Debe' }, editorType: 'dxCheckBox', colSpan: 1 },
			{ dataField: 'ES_HABER', label: { text: 'Haber' }, editorType: 'dxCheckBox', colSpan: 1 },
			{ dataField: 'CLASE_RUBRO', label: { text: 'Clase Rubro' }, colSpan: 2, editorOptions: { showClearButton: false }, template: 'CLASE_RUBROLookup' },
			{ itemType: 'empty', colSpan: 2 },
			{ dataField: 'NOMBRE_RUBRO', label: { text: 'Descripción' }, colSpan: 6, editorOptions: { showClearButton: true } },
		];
	}
}
