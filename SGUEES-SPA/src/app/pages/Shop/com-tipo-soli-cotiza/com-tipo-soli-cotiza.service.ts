import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComTipoSoliCotizaRepository } from './com-tipo-soli-cotiza.repository';
import { ComTipoSoliCotiza } from './models/com-tipo-soli-cotiza';

@Injectable({
	providedIn: 'root',
})
export class ComTipoSoliCotizaService {
	constructor(private repo: ComTipoSoliCotizaRepository) {}

	//#region <Validadores>
	esValido(model: ComTipoSoliCotiza, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_SOLI_COTIZA', Value: param.CORR_TIPO_SOLI_COTIZA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_SOLI_COTIZA', Value: param.CORR_TIPO_SOLI_COTIZA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_SOLI_COTIZA', Value: model.CORR_TIPO_SOLI_COTIZA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_SOLI_COTIZA', Value: model.CORR_TIPO_SOLI_COTIZA }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_SOLI_COTIZA', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_SOLI_COTIZA', caption: 'Nombre Tipo Soli Cotiza', width: 250 },
			// { dataField: 'CLASE_SOLI_COTIZA', caption: 'Clase Soli Cotiza', width: 150 },
			{ dataField: 'NOMBRE_CLASE_SOLI_COTIZA', caption: 'Clase Soli Cotiza', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 130, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 130, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_SOLI_COTIZA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_SOLI_COTIZA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_SOLI_COTIZA',
				label: { text: 'Nombre Tipo Soli Cotiza' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Tipo Soli Cotiza...', showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'CLASE_SOLI_COTIZA',
				label: { text: 'Clase Soli Cotiza' },
				colSpan: 2,
				editorOptions: { placeholder: 'Clase Soli Cotiza...', showClearButton: false },
				template: 'CLASE_SOLI_COTIZALookup',
			},
		];
	}
}
