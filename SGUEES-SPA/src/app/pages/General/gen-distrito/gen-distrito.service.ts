import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenDistritoRepository } from './gen-distrito.repository';
import { GenDistrito } from './models/gen-distrito';

@Injectable({
	providedIn: 'root',
})
export class GenDistritoService {
	constructor(private repo: GenDistritoRepository) {}

	//#region <Validadores>
	esValido(model: GenDistrito, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DISTRITO', Value: param.CORR_DISTRITO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DISTRITO', Value: param.CORR_DISTRITO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DISTRITO', Value: model.CORR_DISTRITO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DISTRITO', Value: model.CORR_DISTRITO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_DISTRITO', caption: 'Corr.', width: 100  },
			{ dataField: 'NOMBRE_DISTRITO', caption: 'Nombre Distrito', width: 250 },
			{ dataField: 'NOMBRE_PAIS', caption: 'Nombre Pais', width: 250 },
			{ dataField: 'NOMBRE_DEPTO', caption: 'Nombre Depto', width: 250 },
			{ dataField: 'NOMBRE_MUNICIPIO', caption: 'Nombre Municipio', width: 250 },
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
			totalItems: [{ column: 'CORR_DISTRITO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
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
			{
				dataField: 'CORR_DEPTO',
				label: { text: 'Corr Depto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Depto...', showClearButton: false },
				template: 'CORR_DEPTOLookup',
			},
			{
				dataField: 'CORR_MUNICIPIO',
				label: { text: 'Corr Municipio' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Municipio...', showClearButton: false },
				template: 'CORR_MUNICIPIOLookup',
			},
			{ dataField: 'CORR_DISTRITO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_DISTRITO',
				label: { text: 'Nombre Distrito' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Distrito...', showClearButton: true, maxLength: 100 },
			},
		];
	}
}
