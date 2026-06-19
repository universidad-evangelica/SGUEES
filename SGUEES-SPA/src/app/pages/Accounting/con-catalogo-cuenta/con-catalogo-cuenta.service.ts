import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ConCatalogoCuentaRepository } from './con-catalogo-cuenta.repository';
import { ConCatalogoCuenta } from './models/con-catalogo-cuenta';

@Injectable({
	providedIn: 'root',
})
export class ConCatalogoCuentaService {
	constructor(private repo: ConCatalogoCuentaRepository) {}

	esValido(model: ConCatalogoCuenta, msg: Function): boolean {
		if (!model.CUENTA_CONTABLE?.trim()) {
			msg('Debe indicar la cuenta contable', NotifyType.Error);
			return false;
		}
		if (!model.CODIGO_RUBRO?.trim()) {
			msg('Debe seleccionar el rubro', NotifyType.Error);
			return false;
		}
		if (!model.CLASE_RUBRO?.trim()) {
			msg('Debe seleccionar la clase de rubro', NotifyType.Error);
			return false;
		}
		if (!model.NOMBRE_CUENTA?.trim()) {
			msg('Debe indicar la descripción de la cuenta', NotifyType.Error);
			return false;
		}
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
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta' },
			{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre Cuenta' },
			{ dataField: 'ES_DEBE', caption: 'Debe', dataType: 'boolean' },
			{ dataField: 'ES_HABER', caption: 'Haber', dataType: 'boolean' },
			{ dataField: 'ES_DETALLE', caption: 'Es Detalle', dataType: 'boolean' },
			{ dataField: 'NIVEL', caption: 'Nivel' },
			{ dataField: 'CUENTA_MAYOR', caption: 'Cuenta Mayor' },
			{ dataField: 'NO_HABILITADA', caption: 'No Habilitada', dataType: 'boolean' },
			{ dataField: 'NOMBRE_CLASE_RUBRO', caption: 'Clase de Rubro' },
			{ dataField: 'NOMBRE_CLASE_VALUACION', caption: 'Clase Valuación' },
			{ dataField: 'ES_LIQUIDADORA', caption: 'Liquidadora', dataType: 'boolean' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CUENTA_CONTABLE', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CUENTA_CONTABLE', label: { text: 'Cuenta Contable' }, colSpan: 2, editorOptions: { showClearButton: true } },
			{ dataField: 'CODIGO_RUBRO', label: { text: 'Rubro' }, colSpan: 2, template: 'RUBROLookup' },
			{ dataField: 'CLASE_RUBRO', label: { text: 'Clase Rubro' }, colSpan: 2, template: 'CLASE_RUBROLookup' },
			{ itemType: 'empty', colSpan: 2 },
			{ dataField: 'NOMBRE_CUENTA', label: { text: 'Descripción' }, colSpan: 6, editorOptions: { showClearButton: true } },
			{ itemType: 'empty', colSpan: 2 },
			{ dataField: 'ES_DEBE', label: { text: 'Debe' }, editorType: 'dxCheckBox', colSpan: 1 },
			{ dataField: 'ES_HABER', label: { text: 'Haber' }, editorType: 'dxCheckBox', colSpan: 1 },
			{ dataField: 'CUENTA_MAYOR', label: { text: 'Cuenta de Mayor' }, colSpan: 2, editorOptions: { showClearButton: true } },
			{ dataField: 'NIVEL', label: { text: 'Nivel' }, colSpan: 1, editorOptions: { readOnly: true } },
			{ itemType: 'empty', colSpan: 3 },
			{ dataField: 'ES_DETALLE', label: { text: 'Cuenta de Detalle' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'NO_HABILITADA', label: { text: 'No Habilitada' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ES_LIQUIDADORA', label: { text: 'Liquidadora' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'CLASE_VALUACION', label: { text: 'Clase Valuación' }, colSpan: 2, template: 'CLASE_VALUACIONLookup' },
		];
	}
}
