import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScTipoVacanteRepository } from './sc-tipo-vacante.repository';
import { ScTipoVacante } from './models/sc-tipo-vacante';

@Injectable({
	providedIn: 'root',
})
export class ScTipoVacanteService {
	constructor(private repo: ScTipoVacanteRepository) {}

	//#region <Validadores>
	esValido(model: ScTipoVacante, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_VACANTE', Value: param.CORR_TIPO_VACANTE }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_VACANTE', Value: param.CORR_TIPO_VACANTE }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_VACANTE', Value: model.CORR_TIPO_VACANTE }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_VACANTE', Value: model.CORR_TIPO_VACANTE }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_VACANTE', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_VACANTE', caption: 'Tipo Vacante', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_VACANTE', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_VACANTE', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_VACANTE',
				label: { text: 'Nombre Tipo Vacante' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Tipo Vacante...', showClearButton: true, maxLength: 250 },
			},
		];
	}
}
