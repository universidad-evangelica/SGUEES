import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ComParametroRepository } from './com-parametro.repository';
import { ComParametro } from './models/com-parametro';

@Injectable({
	providedIn: 'root',
})
export class ComParametroService {
	constructor(private repo: ComParametroRepository) {}

	//#region <Validadores>
	esValido(model: ComParametro, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
      // { dataField: 'GERENTE_COMPRAS', caption: 'Gerente de Compras', width: 150 },
      // { dataField: 'GERENTE_CONTABILIDAD', caption: 'Gerente de Contabilidad', width: 150 },
      // { dataField: 'GERENTE_GENERAL', caption: 'Gerente General', width: 150 },
      // { dataField: 'RECTOR', caption: 'Rector', width: 150 },
			{ dataField: 'URL_DOCUMENTO', caption: 'Url Documento', width: 150 },
      { dataField: 'CORREO_REMITENTE', caption: 'Correo Remitente', width: 150 },
      { dataField: 'USUARIO_REMITENTE', caption: 'Usuario Remitente', width: 150 },
      { dataField: 'CONTRASENA_REMITENTE', caption: 'Contraseña Remitente', width: 150 },
      { dataField: 'SERVIDOR_CORREO', caption: 'Servidor Correo', width: 150 },
      { dataField: 'PUERTO_CORREO', caption: 'Puerto Correo', width: 150 },
      { dataField: 'USA_SSL_CORREO', caption: 'Correo usa SSL', width: 150 },
      { dataField: 'NOMBRE_USUARIO_COPIAR', caption: 'Usuario Copiar Correo', width: 150 },
      { dataField: 'CORREO_ELECTRONICO_COPIAR', caption: 'Correo Copiar', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_EMPRESA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
      {
				dataField: 'URL_DOCUMENTO',
				label: { text: 'Url Documento' },
				colSpan: 1,
				editorOptions: { placeholder: 'Url Documento...', showClearButton: true, maxLength: 255  },
			},
			{
				dataField: 'CORREO_REMITENTE',
				label: { text: 'Correo Remitente' },
				colSpan: 1,
				editorOptions: { placeholder: 'Correo Remitente...', showClearButton: true, maxLength: 150  },
			},
      {
				dataField: 'USUARIO_REMITENTE',
				label: { text: 'Usuario Remitente' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usuario Remitente...', showClearButton: true, maxLength: 150  },
			},
      {
				dataField: 'CONTRASENA_REMITENTE',
				label: { text: 'Contraseña Remitente' },
				colSpan: 1,
				editorOptions: { placeholder: 'Contraseña Remitente...', showClearButton: true, maxLength: 150  },
			},
      {
				dataField: 'SERVIDOR_CORREO',
				label: { text: 'Servidor Correo' },
				colSpan: 1,
				editorOptions: { placeholder: 'Servidor Correo...', showClearButton: true, maxLength: 150  },
			},
      {
				dataField: 'PUERTO_CORREO',
				label: { text: 'Puerto Correo' },
				colSpan: 1,
				editorOptions: { placeholder: 'Puerto Correo...', showClearButton: true, format: '#'  },
			},
      {
        dataField: 'NOMBRE_USUARIO_COPIAR',
				label: { text: 'Usuario Copiar Correo' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usuario Copiar Correo...', showClearButton: true, maxLength: 255  },
			},
      {
        dataField: 'CORREO_ELECTRONICO_COPIAR',
				label: { text: 'Correo Copiar' },
				colSpan: 1,
				editorOptions: { placeholder: 'Correo Copiar...', showClearButton: true, maxLength: 255  },
			},
      {
        dataField: 'USA_SSL_CORREO',
        label: { text: 'Correo usa SSL' },
        colSpan: 1,
        editorOptions: { placeholder: 'Correo usa SSL...', showClearButton: true },
      },
		];
	}
}
