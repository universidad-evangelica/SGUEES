import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConPartidaModeloSeleccionRepository } from './con-partida-modelo-seleccion.repository';
import { ConPartidaModeloGeneracion } from './models/con-partida-modelo-seleccion';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaModeloSeleccionService {
	constructor(private repo: ConPartidaModeloSeleccionRepository) {}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA || 0 }];
		return this.repo.getModelos(xWhere);
	}

	crearPartidaModelo(model: ConPartidaModeloGeneracion): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: model.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA },
		];
		return this.repo.crearPartidaModelo(model, xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase', width: 120 },
			{ dataField: 'CORR_PARTIDA', caption: 'No. Modelo', width: 90 },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto', width: 250 },
			{ dataField: 'NOMBRE_ESTADO_PARTIDA', caption: 'Estado', width: 100 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_PARTIDA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getFormItems(): any {
		return [
			{ dataField: 'ANIO_PERIODO', label: { text: 'Año' }, colSpan: 2, editorOptions: { placeholder: 'Año...', showClearButton: true } },
			{ dataField: 'MES_PERIODO', label: { text: 'Mes' }, colSpan: 2, editorOptions: { placeholder: 'Mes...', showClearButton: true } },
			{ dataField: 'FECHA_PARTIDA', label: { text: 'Fecha Partida' }, colSpan: 2, editorOptions: { placeholder: 'Fecha...', showClearButton: true } },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', label: { text: 'Clase Modelo' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ dataField: 'CORR_PARTIDA', label: { text: 'No. Modelo' }, colSpan: 2, editorOptions: { readOnly: true } },
			{ dataField: 'CORR_PARTIDA_GENERADA', label: { text: 'No. Partida Generada' }, colSpan: 2, editorOptions: { readOnly: true } },
		];
	}
}
