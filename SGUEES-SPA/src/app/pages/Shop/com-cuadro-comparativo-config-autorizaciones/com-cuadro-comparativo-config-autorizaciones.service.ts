import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComCuadroComparativoConfigAutorizacionesRepository } from './com-cuadro-comparativo-config-autorizaciones.repository';
import { ComCuadroComparativoConfigAutorizaciones } from './models/com-cuadro-comparativo-config-autorizaciones';

@Injectable({
	providedIn: 'root',
})
export class ComCuadroComparativoConfigAutorizacionesService {
	constructor(private repo: ComCuadroComparativoConfigAutorizacionesRepository) {}

	//#region <Validadores>
	esValido(model: ComCuadroComparativoConfigAutorizaciones, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONFIGURACION', Value: param.CORR_CONFIGURACION }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONFIGURACION', Value: param.CORR_CONFIGURACION }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONFIGURACION', Value: model.CORR_CONFIGURACION }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CONFIGURACION', Value: model.CORR_CONFIGURACION }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CONFIGURACION', caption: 'Corr.', width: 85 },
			{ dataField: 'LOGIN_SISTEMA', caption: 'Login Sistema', width: 150 },
			{ dataField: 'NOMBRE_CARGO', caption: 'Cargo', width: 250 },
			{ dataField: 'MONTO_INICIAL', caption: 'Monto Inicial', width: 150, format: '#,##0.00' },
			{ dataField: 'MONTO_FINAL', caption: 'Monto Final', width: 150, format: '#,##0.00' },
			{ dataField: 'NOMBRE_CLASE_AUTORIZACION', caption: 'Clase Autorizacion', width: 150 },
			{ dataField: 'ORDEN_REVISION', caption: 'Orden Revision', width: 150 },
			{ dataField: 'PERMITE_MODIFICAR', caption: 'Permite Modificar', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CONFIGURACION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_CONFIGURACION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'LOGIN_SISTEMA',
				label: { text: 'Login Sistema' },
				colSpan: 1,
				editorOptions: { placeholder: 'Login Sistema...', showClearButton: true, maxLength: 30  },
        template: 'SEG_USUARIOLookup',
			},
      {
				dataField: 'NOMBRE_CARGO',
				label: { text: 'Cargo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Nombre Cargo...', showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'MONTO_INICIAL',
				label: { text: 'Monto Inicial' },
				editorType: 'dxNumberBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Monto Inicial...', format: '#,##0.00' },
			},
			{
				dataField: 'MONTO_FINAL',
				label: { text: 'Monto Final' },
				editorType: 'dxNumberBox',
				colSpan: 1,
				editorOptions: { placeholder: 'Monto Final...', format: '#,##0.00' },
			},
			{
				dataField: 'CLASE_AUTORIZACION',
				label: { text: 'Clase Autorizacion' },
				colSpan: 2,
				editorOptions: { placeholder: 'Clase Autorizacion...', showClearButton: false },
				template: 'CLASE_AUTORIZACIONLookup',
			},
			{
				dataField: 'ORDEN_REVISION',
				label: { text: 'Orden Revision' },
				colSpan: 1,
				editorOptions: { placeholder: 'Orden Revision...', showClearButton: true },
			},
			{
				dataField: 'PERMITE_MODIFICAR',
				label: { text: 'Permite Modificar' },
				colSpan: 1,
				editorOptions: { placeholder: 'Permite Modificar...', showClearButton: true },
			},
		];
	}
}
