import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScRequisicionObservadoresRepository } from './sc-requisicion-observadores.repository';
import { ScRequisicionObservadores } from './models/sc-requisicion-observadores';

@Injectable({
	providedIn: 'root',
})
export class ScRequisicionObservadoresService {
	constructor(private repo: ScRequisicionObservadoresRepository) {}

	//#region <Validadores>
	esValido(model: ScRequisicionObservadores, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_OBSERVADORES', Value: param.CORR_REQUISICION_OBSERVADORES }];

		return this.repo.get(xWhere);
	}

	/** Listado informativo para sc-requisicion-personal (endpoint con permiso /sc-requisicion-personal|R). */
	getForRequisicionPersonal(param?: any): Observable<IResult> {
		const xWhere: IParam[] = [];
		if (param?.CORR_REQUISICION_PERSONAL != null && param.CORR_REQUISICION_PERSONAL > 0) {
			xWhere.push({ Parameter: 'CORR_REQUISICION_PERSONAL', Value: param.CORR_REQUISICION_PERSONAL });
		}
		return this.repo.getForRequisicionPersonal(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_OBSERVADORES', Value: param.CORR_REQUISICION_OBSERVADORES }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_OBSERVADORES', Value: model.CORR_REQUISICION_OBSERVADORES }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_OBSERVADORES', Value: model.CORR_REQUISICION_OBSERVADORES }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_REQUISICION_OBSERVADORES', caption: 'Corr.', width: 100 },
			{ dataField: 'LOGIN_SISTEMA', caption: 'Usuario', width: 300 },
			{ dataField: 'TIPO_OBSERVADOR', caption: 'Tipo Observador', width: 300 },
			{ dataField: 'FECHA_ASIGNACION', caption: 'Fecha Asignación', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ACTIVO', caption: 'Activo', width: 100, dataType: 'boolean' },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 200 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_REQUISICION_OBSERVADORES', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_REQUISICION_OBSERVADORES', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			// {
			// 	dataField: 'LOGIN_SISTEMA',
			// 	label: { text: 'Usuario' },
			// 	colSpan: 3,
			// 	editorOptions: { placeholder: 'Usuario...', showClearButton: true, maxLength: 250 },
			// },
			{
				dataField: 'LOGIN_SISTEMA',
				label: { text: 'Seleccionar usuario:', },
				colSpan: 2,
				template: 'LOGIN_SISTEMALookup',
			},
		];
	}
}
