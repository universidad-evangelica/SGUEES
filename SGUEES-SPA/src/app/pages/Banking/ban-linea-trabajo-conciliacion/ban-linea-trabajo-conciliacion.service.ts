import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { BanLineaTrabajoConciliacionRepository } from './ban-linea-trabajo-conciliacion.repository';
import { BanLineaTrabajoConciliacion } from './models/ban-linea-trabajo-conciliacion';

@Injectable({
	providedIn: 'root',
})
export class BanLineaTrabajoConciliacionService {
	constructor(private repo: BanLineaTrabajoConciliacionRepository) {}

	esValido(model: BanLineaTrabajoConciliacion, msg: Function): boolean {
		if (!model.NOMBRE_LINEA_TRABAJO?.trim()) {
			msg('Debe digitar el nombre de la línea de trabajo', 0);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_LINEA', Value: param.CORR_LINEA }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_LINEA', Value: param.CORR_LINEA }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_LINEA', Value: model.CORR_LINEA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_LINEA', Value: model.CORR_LINEA }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_LINEA', caption: 'Corr.', width: 80 },
			{ dataField: 'NOMBRE_LINEA_TRABAJO', caption: 'Nombre línea' },
			{ dataField: 'NOMBRE_AUMENTA_DISMINUYE', caption: 'Aumenta / Disminuye', width: 160 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_LINEA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_LINEA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'AUMENTA_DISMINUYE',
				label: { text: 'Aumenta / Disminuye' },
				colSpan: 2,
				template: 'AUMENTA_DISMINUYELookup',
			},
			{ itemType: 'empty', colSpan: 4 },
			{ dataField: 'NOMBRE_LINEA_TRABAJO', label: { text: 'Nombre línea' }, colSpan: 4, editorOptions: { showClearButton: true } },
			{ itemType: 'empty', colSpan: 2 },
			
		];
	}
}
