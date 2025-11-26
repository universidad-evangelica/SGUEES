import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComCondicionPagoRepository } from './com-condicion-pago.repository';
import { ComCondicionPago } from './models/com-condicion-pago';

@Injectable({
	providedIn: 'root',
})
export class ComCondicionPagoService {
	constructor(private repo: ComCondicionPagoRepository) {}

	//#region <Validadores>
	esValido(model: ComCondicionPago, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONDICION_PAGO', Value: param.CORR_CONDICION_PAGO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONDICION_PAGO', Value: param.CORR_CONDICION_PAGO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONDICION_PAGO', Value: model.CORR_CONDICION_PAGO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONDICION_PAGO', Value: model.CORR_CONDICION_PAGO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CONDICION_PAGO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_CONDICION_PAGO', caption: 'Nombre Condicion Pago', width: 250 },
			{ dataField: 'DIAS_CREDITO', caption: 'Dias Credito', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CONDICION_PAGO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_CONDICION_PAGO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_CONDICION_PAGO',
				label: { text: 'Nombre Condicion Pago' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Condicion Pago...', showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'DIAS_CREDITO',
				label: { text: 'Dias Credito' },
				colSpan: 1,
				editorOptions: { placeholder: 'Dias Credito...', showClearButton: true },
			},
		];
	}
}
