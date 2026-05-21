import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenSectorEconomicoRepository } from './gen-sector-economico.repository';
import { GenSectorEconomico } from './models/gen-sector-economico';

@Injectable({
	providedIn: 'root',
})
export class GenSectorEconomicoService {
	constructor(private repo: GenSectorEconomicoRepository) {}

	//#region <Validadores>
	esValido(model: GenSectorEconomico, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: param.CORR_SECTOR_ECONOMICO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: param.CORR_SECTOR_ECONOMICO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: model.CORR_SECTOR_ECONOMICO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: model.CORR_SECTOR_ECONOMICO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_SECTOR_ECONOMICO', caption: 'Corr.', width: 100 },
			{ dataField: 'NOMBRE_SECTOR_ECONOMICO', caption: 'Nombre Sector Economico', width: 350 },
			{dataField: 'SALARIO_MINIMO', caption: 'Salario Minimo', width: 200, format: { type: 'fixedPoint', precision: 2 }, customizeText: (cellInfo: any) => `$ ${cellInfo.valueText}`,},
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 200 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 200, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_SECTOR_ECONOMICO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_SECTOR_ECONOMICO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_SECTOR_ECONOMICO',
				label: { text: 'Nombre Sector Economico' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Sector Economico...', showClearButton: true, maxLength: 150 },
			},
			{
				dataField: 'SALARIO_MINIMO',
				label: { text: 'Salario Minimo' },
				editorType: 'dxNumberBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Salario Minimo...', format: '#,##0.00' },
			},
		];
	}
}
