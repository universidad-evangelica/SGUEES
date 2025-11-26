import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComUnidadMedidaRepository } from './com-unidad-medida.repository';
import { ComUnidadMedida } from './models/com-unidad-medida';

@Injectable({
	providedIn: 'root',
})
export class ComUnidadMedidaService {
	constructor(private repo: ComUnidadMedidaRepository) {}

	//#region <Validadores>
	esValido(model: ComUnidadMedida, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_UNIDAD_MEDIDA', Value: param.CORR_UNIDAD_MEDIDA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_UNIDAD_MEDIDA', Value: param.CORR_UNIDAD_MEDIDA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_UNIDAD_MEDIDA', Value: model.CORR_UNIDAD_MEDIDA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_UNIDAD_MEDIDA', Value: model.CORR_UNIDAD_MEDIDA }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_UNIDAD_MEDIDA', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_UNIDAD_MEDIDA', caption: 'Nombre Unidad Medida', width: 250 },
			{ dataField: 'NOMBRE_CORTO', caption: 'Nombre Corto', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 130, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 130, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_UNIDAD_MEDIDA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_UNIDAD_MEDIDA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_UNIDAD_MEDIDA',
				label: { text: 'Nombre Unidad Medida' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Unidad Medida...', showClearButton: true, maxLength: 100 },
			},
      {
				dataField: 'NOMBRE_CORTO',
				label: { text: 'Nombre Corto' },
				colSpan: 1,
				editorOptions: { placeholder: 'Nombre Corto...', showClearButton: true, maxLength: 5 },
			},
		];
	}
}
