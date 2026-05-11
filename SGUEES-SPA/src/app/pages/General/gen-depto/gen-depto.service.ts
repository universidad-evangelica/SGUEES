import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenDeptoRepository } from './gen-depto.repository';
import { GenDepto } from './models/gen-depto';

@Injectable({
	providedIn: 'root',
})
export class GenDeptoService {
	constructor(private repo: GenDeptoRepository) {}

	//#region <Validadores>
	esValido(model: GenDepto, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: param.CORR_DEPTO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: param.CORR_DEPTO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_DEPTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_DEPTO', caption: 'Nombre Depto', width: 250 },
			{ dataField: 'CODIGO_DEPTO', caption: 'Codigo Depto', width: 150 },
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
			totalItems: [{ column: 'CORR_DEPTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CORR_PAIS',
				label: { text: 'Corr Pais' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Pais...', showClearButton: false },
				template: 'CORR_PAISLookup',
			},
			{ dataField: 'CORR_DEPTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_DEPTO',
				label: { text: 'Nombre Depto' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Depto...', showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'CODIGO_DEPTO',
				label: { text: 'Codigo Depto' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Depto...', showClearButton: true, maxLength: 10  },
			},
		];
	}
}
