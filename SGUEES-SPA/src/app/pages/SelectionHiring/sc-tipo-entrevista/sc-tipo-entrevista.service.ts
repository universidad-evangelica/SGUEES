import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScTipoEntrevistaRepository } from './sc-tipo-entrevista.repository';
import { ScTipoEntrevista } from './models/sc-tipo-entrevista';

@Injectable({
	providedIn: 'root',
})
export class ScTipoEntrevistaService {
	constructor(private repo: ScTipoEntrevistaRepository) {}

	//#region <Validadores>
	esValido(model: ScTipoEntrevista, msg: Function): boolean {
		if (!model.TIPO_ENTREVISTA || model.TIPO_ENTREVISTA.trim() === '') {
			msg('Debe digitar el tipo de entrevista', NotifyType.Error);
			return false;
		}

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_ENTREVISTA', Value: param.CORR_TIPO_ENTREVISTA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_ENTREVISTA', Value: param.CORR_TIPO_ENTREVISTA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_ENTREVISTA', Value: model.CORR_TIPO_ENTREVISTA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_ENTREVISTA', Value: model.CORR_TIPO_ENTREVISTA }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_ENTREVISTA', caption: 'Corr.', width: 100 },
			{ dataField: 'TIPO_ENTREVISTA', caption: 'Tipo Entrevista', width: 300 },
			{ dataField: 'DESCRIPCION_ENTREVISTA', caption: 'Descripción Entrevista', width: 350 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'ESTACION_CREA', caption: 'Estación Crea', width: 200 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estación Actu', width: 200 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_ENTREVISTA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_ENTREVISTA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'TIPO_ENTREVISTA',
				label: { text: 'Tipo Entrevista' },
				colSpan: 3,
				editorOptions: { placeholder: 'Tipo Entrevista...', showClearButton: true, maxLength: 250 },
			},
			{
				dataField: 'DESCRIPCION_ENTREVISTA',
				label: { text: 'Descripción Entrevista' },
				colSpan: 4,
				editorOptions: { placeholder: 'Descripción Entrevista...', showClearButton: true, maxLength: 500 },
			},
		];
	}
}
