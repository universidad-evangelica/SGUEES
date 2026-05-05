import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScTipoModalidadRepository } from './sc-tipo-modalidad.repository';
import { ScTipoModalidad } from './models/sc-tipo-modalidad';

@Injectable({
	providedIn: 'root',
})
export class ScTipoModalidadService {
	constructor(private repo: ScTipoModalidadRepository) {}

	//#region <Validadores>
	esValido(model: ScTipoModalidad, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BITACORA', Value: param.CORR_BITACORA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BITACORA', Value: param.CORR_BITACORA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BITACORA', Value: model.CORR_BITACORA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_BITACORA', Value: model.CORR_BITACORA }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'NOMBRE_TIPO_MODALIDAD', caption: 'Nombre Tipo Modalidad', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_BITACORA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CORR_TIPO_MODALIDAD',
				label: { text: 'Corr Tipo Modalidad' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Tipo Modalidad...', showClearButton: false },
				template: 'CORR_TIPO_MODALIDADLookup',
			},
		];
	}
}
