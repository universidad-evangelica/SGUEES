import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConClasePartidaRepository } from './con-clase-partida.repository';
import { ConClasePartida } from './models/con-clase-partida';

@Injectable({
	providedIn: 'root',
})
export class ConClasePartidaService {
	constructor(private repo: ConClasePartidaRepository) {}

	esValido(model: ConClasePartida, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CLASE_PARTIDA', Value: param.CORR_CLASE_PARTIDA }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CLASE_PARTIDA', Value: param.CORR_CLASE_PARTIDA }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CLASE_PARTIDA', Value: model.CORR_CLASE_PARTIDA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CLASE_PARTIDA', Value: model.CORR_CLASE_PARTIDA }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CLASE_PARTIDA', caption: 'Clase Partida', width: 100 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Nombre Clase Partida' },
			{ dataField: 'NOMBRE_CORTO_CLASE', caption: 'Nombre Corto', width: 120 },
			{ dataField: 'NOMBRE_LINEA_DISMINUYE', caption: 'Linea Disminuye' },
			{ dataField: 'NOMBRE_LINEA_AUMENTA', caption: 'Linea Aumenta' },
			{ dataField: 'ACEPTA_MODIFICACION', caption: 'Acepta Modif.', dataType: 'boolean', width: 110 },
			{ dataField: 'PARTIDA_CIERRE', caption: 'Partidas de Cierre', dataType: 'boolean', width: 130 },
			{ dataField: 'NOMBRE_REPORTE', caption: 'Nombre Reporte' },
			{ dataField: 'CODIGO_ODS', caption: 'Código ODS', width: 110 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CLASE_PARTIDA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_CLASE_PARTIDA', label: { text: 'Código' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ itemType: 'empty', colSpan: 6 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', label: { text: 'Nombre Clase' }, colSpan: 4, editorOptions: { showClearButton: true } },
			{ itemType: 'empty', colSpan: 4 },
			{ dataField: 'NOMBRE_CORTO_CLASE', label: { text: 'Nombre Corto Clase' }, colSpan: 4, editorOptions: { showClearButton: true } },
			{ itemType: 'empty', colSpan: 4 },
			{ dataField: 'NOMBRE_LINEA_AUMENTA', label: { text: 'Linea Aumenta' }, colSpan: 4, editorOptions: { readOnly: true } },
			{ itemType: 'empty', colSpan: 4 },
			{ dataField: 'NOMBRE_LINEA_DISMINUYE', label: { text: 'Linea Disminuye' }, colSpan: 4, editorOptions: { readOnly: true } },
			{ itemType: 'empty', colSpan: 4 },
			{ dataField: 'NOMBRE_REPORTE', label: { text: 'Nombre Reporte' }, colSpan: 4, editorOptions: { showClearButton: true } },
			{ itemType: 'empty', colSpan: 4 },
			{ dataField: 'CODIGO_ODS', label: { text: 'Código ODS' }, colSpan: 2, editorOptions: { showClearButton: true } },
			{ itemType: 'empty', colSpan: 6 },
			{ dataField: 'ACEPTA_MODIFICACION', label: { text: 'Acepta Modificación' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ itemType: 'empty', colSpan: 6 },
			{ dataField: 'PARTIDA_CIERRE', label: { text: 'Partidas de Cierre' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}
}
