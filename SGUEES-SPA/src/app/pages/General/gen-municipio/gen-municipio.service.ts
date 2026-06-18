import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenMunicipioRepository } from './gen-municipio.repository';
import { GenMunicipio } from './models/gen-municipio';

@Injectable({
	providedIn: 'root',
})
export class GenMunicipioService {
	constructor(private repo: GenMunicipioRepository) {}

	//#region <Validadores>
	esValido(model: GenMunicipio, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_MUNICIPIO', Value: param.CORR_MUNICIPIO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_MUNICIPIO', Value: param.CORR_MUNICIPIO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_MUNICIPIO', caption: 'Corr.', width: 100 },
			{ dataField: 'NOMBRE_MUNICIPIO', caption: 'Nombre Municipio', width: 250 },
			{ dataField: 'CODIGO_MUNICIPIO', caption: 'Codigo', width: 150 },
			{ dataField: 'NOMBRE_DEPTO', caption: 'Departamento', width: 250},
			{ dataField: 'NOMBRE_PAIS', caption: 'Pais', width: 250 },
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
			totalItems: [{ column: 'CORR_MUNICIPIO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
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
			{ dataField: 'CORR_MUNICIPIO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_MUNICIPIO',
				label: { text: 'Nombre Municipio' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Municipio...', showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'CODIGO_MUNICIPIO',
				label: { text: 'Codigo Municipio' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Municipio...', showClearButton: true, maxLength: 10  },
			},
		];
	}
}
