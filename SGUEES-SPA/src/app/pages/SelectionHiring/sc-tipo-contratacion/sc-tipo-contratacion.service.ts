import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScTipoContratacionRepository } from './sc-tipo-contratacion.repository';
import { ScTipoContratacion } from './models/sc-tipo-contratacion';

@Injectable({
	providedIn: 'root',
})
export class ScTipoContratacionService {
	constructor(private repo: ScTipoContratacionRepository) {}

	//#region <Validadores>
	esValido(model: ScTipoContratacion, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CONTRATACION', Value: param.CORR_TIPO_CONTRATACION }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CONTRATACION', Value: param.CORR_TIPO_CONTRATACION }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CONTRATACION', Value: model.CORR_TIPO_CONTRATACION }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_CONTRATACION', Value: model.CORR_TIPO_CONTRATACION }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_CONTRATACION', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Nombre Tipo Contratacion', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_CONTRATACION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_CONTRATACION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_CONTRATACION',
				label: { text: 'Nombre Tipo Contratacion' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Tipo Contratacion...', showClearButton: true, maxLength: 250 },
			},
		];
	}
}
