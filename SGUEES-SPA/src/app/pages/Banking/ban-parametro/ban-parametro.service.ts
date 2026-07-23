import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { BanParametroRepository } from './ban-parametro.repository';
import { BanParametro } from './models/ban-parametro';

@Injectable({
	providedIn: 'root',
})
export class BanParametroService {
	constructor(private repo: BanParametroRepository) {}

	esValido(model: BanParametro, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'NOMBRE_EMPRESA', caption: 'Empresa', width: 260 },
			{
				dataField: 'CONTABILIZAR_LUEGO_DE_APLICAR',
				caption: 'Contabilizar al aplicar',
				dataType: 'boolean',
				width: 180,
			},
			{
				dataField: 'CONTABILIZAR_LUEGO_DE_IMPRIMIR',
				caption: 'Contabilizar al imprimir',
				dataType: 'boolean',
				width: 180,
			},
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'NOMBRE_EMPRESA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CONTABILIZAR_LUEGO_DE_APLICAR',
				label: { text: 'Contabilizar documentos bancarios al aplicar' },
				editorType: 'dxCheckBox',
				colSpan: 2,
			},
			{
				dataField: 'CONTABILIZAR_LUEGO_DE_IMPRIMIR',
				label: { text: 'Contabilizar cheques al imprimir (fallback si el tipo de cheque no define valor)' },
				editorType: 'dxCheckBox',
				colSpan: 2,
			},
		];
	}
}
