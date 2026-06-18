import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenPaisRepository } from './gen-pais.repository';
import { GenPais } from './models/gen-pais';

@Injectable({
	providedIn: 'root',
})
export class GenPaisService {
	constructor(private repo: GenPaisRepository) {}

	//#region <Validadores>
	esValido(model: GenPais, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: param.CORR_PAIS }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: param.CORR_PAIS }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_PAIS', caption: 'Corr.', width: 100 },
			{ dataField: 'NOMBRE_PAIS', caption: 'Nombre Pais', width: 250 },
			{ dataField: 'CODIGO_PAIS', caption: 'Codigo Pais', width: 150 },
			{ dataField: 'NACIONALIDAD', caption: 'Nacionalidad', width: 200 },
			
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
			totalItems: [{ column: 'CORR_PAIS', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_PAIS', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_PAIS',
				label: { text: 'Nombre Pais' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Pais...', showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'CODIGO_PAIS',
				label: { text: 'Codigo Pais' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Pais...', showClearButton: true, maxLength: 10  },
			},
			{
				dataField: 'NACIONALIDAD',
				label: { text: 'Nacionalidad' },
				colSpan: 1,
				editorOptions: { placeholder: 'Nacionalidad...', showClearButton: true, maxLength: 50  },
			},
		];
	}
}
