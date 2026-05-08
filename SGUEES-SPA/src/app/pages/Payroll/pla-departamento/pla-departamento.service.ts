import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { PlaDepartamentoRepository } from './pla-departamento.repository';
import { PlaDepartamento } from './models/pla-departamento';

@Injectable({
	providedIn: 'root',
})
export class PlaDepartamentoService {
	constructor(private repo: PlaDepartamentoRepository) {}

	//#region <Validadores>
	esValido(model: PlaDepartamento, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: param.CORR_DEPARTAMENTO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: param.CORR_DEPARTAMENTO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: model.CORR_DEPARTAMENTO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPARTAMENTO', Value: model.CORR_DEPARTAMENTO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_DEPARTAMENTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_DEPARTAMENTO', caption: 'Nombre Departamento', width: 250 },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre Centro', width: 250 },
			{ dataField: 'CODIGO_DEPARTAMENTO', caption: 'Codigo Departamento', width: 150 },
			{ dataField: 'CLASE_DEPARTAMENTO', caption: 'Clase Departamento', width: 150 },
			{ dataField: 'NOMBRE_CLASE_DEPARTAMENTO', caption: 'Nombre Clase Departamento', width: 250 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_DEPARTAMENTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DEPARTAMENTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_DEPARTAMENTO',
				label: { text: 'Nombre Departamento' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Departamento...', showClearButton: true, maxLength: 150 },
			},
			{
				dataField: 'CORR_CENTRO_COSTO',
				label: { text: 'Corr Centro Costo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Centro Costo...', showClearButton: false },
				template: 'CORR_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CODIGO_DEPARTAMENTO',
				label: { text: 'Codigo Departamento' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Departamento...', showClearButton: true, maxLength: 15  },
			},
			{
				dataField: 'CLASE_DEPARTAMENTO',
				label: { text: 'Clase Departamento' },
				colSpan: 2,
				editorOptions: { placeholder: 'Clase Departamento...', showClearButton: false },
				template: 'CLASE_DEPARTAMENTOLookup',
			},
			{
				dataField: 'CORR_EMPLEADO_JEFE',
				label: { text: 'Corr Empleado Jefe' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Empleado Jefe...', showClearButton: false },
				template: 'CORR_EMPLEADO_JEFELookup',
			},
		];
	}
}
