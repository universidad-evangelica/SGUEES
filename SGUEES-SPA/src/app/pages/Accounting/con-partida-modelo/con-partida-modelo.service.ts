import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConPartidaModeloRepository } from './con-partida-modelo.repository';
import { ConPartidaModelo } from './models/con-partida-modelo';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaModeloService {
	constructor(private repo: ConPartidaModeloRepository) {}

	esValido(model: ConPartidaModelo, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase' },
			{ dataField: 'CORR_PARTIDA', caption: 'No. Partida' },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'No. Documento' },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto' },
			{ dataField: 'NOMBRE_ESTADO_PARTIDA', caption: 'Estado' },
			{ dataField: 'CLASE_PARTIDA', caption: 'Clase Partida' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_PARTIDA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'NOMBRE_CLASE_PARTIDA', label: { text: 'Clase' }, colSpan: 2, editorOptions: { placeholder: 'Clase...', showClearButton: true } },
			{ dataField: 'CORR_PARTIDA', label: { text: 'No. Partida' }, colSpan: 2, editorOptions: { placeholder: 'No. Partida...', showClearButton: true } },
			{ dataField: 'NUMERO_DOCUMENTO', label: { text: 'No. Documento' }, colSpan: 2, editorOptions: { placeholder: 'No. Documento...', showClearButton: true } },
			{ dataField: 'NOMBRE_PARTIDA', label: { text: 'Concepto' }, colSpan: 2, editorOptions: { placeholder: 'Concepto...', showClearButton: true } },
			{ dataField: 'ESTADO_PARTIDA', label: { text: 'Estado' }, colSpan: 2, editorOptions: { placeholder: 'Estado...', showClearButton: false }, template: 'ESTADO_PARTIDALookup' },
			{ dataField: 'CLASE_PARTIDA', label: { text: 'Clase Partida' }, colSpan: 2, editorOptions: { placeholder: 'Clase Partida...', showClearButton: true } },
		];
	}
}
