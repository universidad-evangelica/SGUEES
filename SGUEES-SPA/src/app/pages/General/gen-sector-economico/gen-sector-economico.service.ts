import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';

import { GenSectorEconomicoRepository } from './gen-sector-economico.repository';
import { GenSectorEconomico } from './models/gen-sector-economico';

@Injectable({
	providedIn: 'root',
})
export class GenSectorEconomicoService {
	constructor(private repo: GenSectorEconomicoRepository) {}

	esValido(model: GenSectorEconomico, msg: Function): boolean {
		if (!model.NOMBRE_SECTOR_ECONOMICO?.trim()) {
			msg('Debe digitar el nombre del sector económico.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: param.CORR_SECTOR_ECONOMICO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: param.CORR_SECTOR_ECONOMICO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: model.CORR_SECTOR_ECONOMICO }];
		return this.repo.update(model, xWhere);
	}

	delete(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_SECTOR_ECONOMICO', Value: param.CORR_SECTOR_ECONOMICO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_SECTOR_ECONOMICO', caption: 'Corr.', width: 100 },
			{ dataField: 'NOMBRE_SECTOR_ECONOMICO', caption: 'Nombre sector económico', minWidth: 280 },
			{
				dataField: 'SALARIO_MINIMO',
				caption: 'Salario mínimo',
				width: 160,
				format: { type: 'fixedPoint', precision: 2 },
				customizeText: (cellInfo: any) => `$ ${cellInfo.valueText}`,
			},
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{ column: 'CORR_SECTOR_ECONOMICO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' },
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_SECTOR_ECONOMICO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_SECTOR_ECONOMICO',
				label: { text: 'Nombre sector económico' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre del sector...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'El nombre del sector es obligatorio' }],
			},
			{
				dataField: 'SALARIO_MINIMO',
				label: { text: 'Salario mínimo' },
				editorType: 'dxNumberBox',
				colSpan: 1,
				editorOptions: { placeholder: '0.00', format: '#,##0.00' },
			},
		];
	}
}
