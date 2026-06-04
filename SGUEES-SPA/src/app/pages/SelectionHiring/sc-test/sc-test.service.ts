import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScTestRepository } from './sc-test.repository';
import { ScTest } from './models/sc-test';

@Injectable({
	providedIn: 'root',
})
export class ScTestService {
	constructor(private repo: ScTestRepository) {}

	esValido(model: ScTest, msg: Function): boolean {
		if (!model.NOMBRE_TIPO_MODALIDAD?.trim()) {
			msg('Debe digitar el nombre', NotifyType.Error);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MODALIDAD', Value: param.CORR_TIPO_MODALIDAD }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MODALIDAD', Value: param.CORR_TIPO_MODALIDAD }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MODALIDAD', Value: model.CORR_TIPO_MODALIDAD }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MODALIDAD', Value: model.CORR_TIPO_MODALIDAD }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_MODALIDAD', caption: 'Corr.', width: 100 },
			{ dataField: 'NOMBRE_TIPO_MODALIDAD', caption: 'Nombre', width: 300 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario crea', minWidth: 160 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha crea', minWidth: 170, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario actualiza', minWidth: 160 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha actualiza', minWidth: 170, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_TIPO_MODALIDAD',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Registros: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			// {
			// 	dataField: 'CORR_TIPO_MODALIDAD',
			// 	label: { text: 'Correlativo' },
			// 	colSpan: 1,
			// 	editorOptions: { readOnly: true },
			// },
			{
				dataField: 'NOMBRE_TIPO_MODALIDAD',
				label: { text: 'Nombre' },
				colSpan: 1,
				editorOptions: { placeholder: 'Ingrese el nombre...', showClearButton: true, maxLength: 250 },
			},
		];
	}
}
