import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConCatalogoPresupuestoRepository } from './con-catalogo-presupuesto.repository';
import { ConCatalogoPresupuesto } from './models/con-catalogo-presupuesto';

@Injectable({
	providedIn: 'root',
})
export class ConCatalogoPresupuestoService {
	constructor(private repo: ConCatalogoPresupuestoRepository) {}

	esValido(model: ConCatalogoPresupuesto, msg: Function): boolean {
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CUENTA_CONTABLE', Value: param.CUENTA_CONTABLE }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CUENTA_CONTABLE', Value: param.CUENTA_CONTABLE }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CUENTA_CONTABLE', Value: model.CUENTA_CONTABLE }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CUENTA_CONTABLE', Value: model.CUENTA_CONTABLE }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 130 },
			{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre Cuenta', width: 200 },
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 80 },
			{ dataField: 'MONTO_PRESUPUESTO_1', caption: 'Ene', width: 100, format: '#,##0.00' },
			{ dataField: 'MONTO_PRESUPUESTO_2', caption: 'Feb', width: 100, format: '#,##0.00' },
			{ dataField: 'MONTO_PRESUPUESTO_3', caption: 'Mar', width: 100, format: '#,##0.00' },
			{ dataField: 'MONTO_PRESUPUESTO_4', caption: 'Abr', width: 100, format: '#,##0.00' },
			{ dataField: 'MONTO_PRESUPUESTO_5', caption: 'May', width: 100, format: '#,##0.00' },
			{ dataField: 'MONTO_PRESUPUESTO_6', caption: 'Jun', width: 100, format: '#,##0.00' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CUENTA_CONTABLE', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CUENTA_CONTABLE', label: { text: 'Cuenta' }, colSpan: 2, editorOptions: { placeholder: 'Cuenta...', showClearButton: true } },
			{ dataField: 'NOMBRE_CUENTA', label: { text: 'Nombre Cuenta' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Cuenta...', showClearButton: true } },
			{ dataField: 'ANIO_PERIODO', label: { text: 'Año' }, colSpan: 2, editorOptions: { placeholder: 'Año...', showClearButton: true } },
			{ dataField: 'MONTO_PRESUPUESTO_1', label: { text: 'Ene' }, colSpan: 2, editorOptions: { placeholder: 'Ene...', showClearButton: true } },
			{ dataField: 'MONTO_PRESUPUESTO_2', label: { text: 'Feb' }, colSpan: 2, editorOptions: { placeholder: 'Feb...', showClearButton: true } },
			{ dataField: 'MONTO_PRESUPUESTO_3', label: { text: 'Mar' }, colSpan: 2, editorOptions: { placeholder: 'Mar...', showClearButton: true } },
			{ dataField: 'MONTO_PRESUPUESTO_4', label: { text: 'Abr' }, colSpan: 2, editorOptions: { placeholder: 'Abr...', showClearButton: true } },
			{ dataField: 'MONTO_PRESUPUESTO_5', label: { text: 'May' }, colSpan: 2, editorOptions: { placeholder: 'May...', showClearButton: true } },
			{ dataField: 'MONTO_PRESUPUESTO_6', label: { text: 'Jun' }, colSpan: 2, editorOptions: { placeholder: 'Jun...', showClearButton: true } },
		];
	}
}
