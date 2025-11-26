import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegTipoUsuarioRepository } from './seg-tipo-usuario.repository';
import { SegTipoUsuario } from './models/seg-tipo-usuario';
import { SegTipoUsuarioOpcionRepository } from './seg-tipo-usuario-opcion/seg-tipo-usuario-opcion.repository';

@Injectable({
	providedIn: 'root',
})
export class SegTipoUsuarioService {
	constructor(private repo: SegTipoUsuarioRepository,
              private repodeta: SegTipoUsuarioOpcionRepository
  ) {}

	//#region <Validadores>
	esValido(model: SegTipoUsuario, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: param.TIPO_USUARIO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: param.TIPO_USUARIO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'TIPO_USUARIO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_USUARIO', caption: 'Nombre Tipo Usuario', width: 250 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'TIPO_USUARIO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'TIPO_USUARIO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{ dataField: 'NOMBRE_TIPO_USUARIO', label: { text: 'Tipo Usuario.' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Tipo Usuario...', showClearButton: true } },
		];
	}
  //#region <Detalle Opciones>

  getAllSEG_TIPO_USUARIO_OPCION(model: any): Observable<IResult> {
    let xWhere: IParam[] = [
      { Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO },
    ];

    return this.repodeta.get(xWhere);
  }
  insertUpdateSEG_TIPO_USUARIO_OPCION(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO },
			{ Parameter: 'CODIGO_SISTEMA', Value: model.CODIGO_SISTEMA },
      { Parameter: 'CODIGO_MENU', Value: model.CODIGO_MENU },
			{ Parameter: 'CODIGO_OPCION', Value: model.CODIGO_OPCION },
		];

		return this.repodeta.update(model, xWhere);
	}

  //#endregion
}
