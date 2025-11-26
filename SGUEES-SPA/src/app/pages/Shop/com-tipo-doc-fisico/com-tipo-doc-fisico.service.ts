import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComTipoDocFisicoRepository } from './com-tipo-doc-fisico.repository';
import { ComTipoDocFisico } from './models/com-tipo-doc-fisico';

@Injectable({
	providedIn: 'root',
})
export class ComTipoDocFisicoService {
	constructor(private repo: ComTipoDocFisicoRepository) {}

	//#region <Validadores>
	esValido(model: ComTipoDocFisico, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: param.CORR_TIPO_DOCUMENTO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: param.CORR_TIPO_DOCUMENTO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: model.CORR_TIPO_DOCUMENTO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: model.CORR_TIPO_DOCUMENTO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_DOCUMENTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_DOCUMENTO', caption: 'Nombre Tipo Documento', width: 250 },
			{ dataField: 'NOMBRE_CORTO_TIPO_DOC', caption: 'Nombre Corto Tipo Doc', width: 250 },
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
			totalItems: [{ column: 'CORR_TIPO_DOCUMENTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_DOCUMENTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_DOCUMENTO',
				label: { text: 'Nombre Tipo Documento' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Tipo Documento...', showClearButton: true, maxLength: 150 },
			},
      {
        dataField: 'NOMBRE_CORTO_TIPO_DOC',
        label: { text: 'Nombre Corto Tipo Doc' },
        colSpan: 1,
        editorOptions: { placeholder: 'Nombre Corto Tipo Doc...', showClearButton: true, maxLength: 50 },
      },
		];
	}
}
