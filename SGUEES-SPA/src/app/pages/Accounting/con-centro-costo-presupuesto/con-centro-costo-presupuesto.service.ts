import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConCentroCostoPresupuestoRepository } from './con-centro-costo-presupuesto.repository';
import { ConCentroCostoPresupuesto } from './models/con-centro-costo-presupuesto';

@Injectable({
	providedIn: 'root',
})
export class ConCentroCostoPresupuestoService {
	constructor(private repo: ConCentroCostoPresupuestoRepository) {}

	esValido(model: ConCentroCostoPresupuesto, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: param.CORR_CENTRO_COSTO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: param.CORR_CENTRO_COSTO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: model.CORR_CENTRO_COSTO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: model.CORR_CENTRO_COSTO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', caption: 'Centro Costo', width: 100 },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre Centro', width: 200 },
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 80 },
			{ dataField: 'MES_PERIODO', caption: 'Mes', width: 80 },
			{ dataField: 'MONTO_PRESUPUESTO', caption: 'Monto', width: 130, format: '#,##0.00' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CENTRO_COSTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', label: { text: 'Centro Costo' }, colSpan: 2, editorOptions: { placeholder: 'Centro Costo...', showClearButton: true } },
			{ dataField: 'NOMBRE_CENTRO', label: { text: 'Nombre Centro' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Centro...', showClearButton: true } },
			{ dataField: 'ANIO_PERIODO', label: { text: 'Año' }, colSpan: 2, editorOptions: { placeholder: 'Año...', showClearButton: true } },
			{ dataField: 'MES_PERIODO', label: { text: 'Mes' }, colSpan: 2, editorOptions: { placeholder: 'Mes...', showClearButton: true } },
			{ dataField: 'MONTO_PRESUPUESTO', label: { text: 'Monto' }, colSpan: 2, editorOptions: { placeholder: 'Monto...', showClearButton: true } },
		];
	}
}
