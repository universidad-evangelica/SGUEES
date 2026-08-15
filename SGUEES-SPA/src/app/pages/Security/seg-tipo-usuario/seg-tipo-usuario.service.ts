import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';

import { SegTipoUsuarioRepository } from './seg-tipo-usuario.repository';
import { SegTipoUsuario } from './models/seg-tipo-usuario';
import { SegTipoUsuarioOpcionRepository } from './seg-tipo-usuario-opcion/seg-tipo-usuario-opcion.repository';

@Injectable({
	providedIn: 'root',
})
export class SegTipoUsuarioService {
	constructor(
		private repo: SegTipoUsuarioRepository,
		private repodeta: SegTipoUsuarioOpcionRepository
	) {}

	esValido(model: SegTipoUsuario, msg: Function): boolean {
		if (!model.NOMBRE_TIPO_USUARIO?.trim()) {
			msg('Debe digitar el nombre del tipo de usuario', NotifyType.Error);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: param.TIPO_USUARIO }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: param.TIPO_USUARIO }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO }];

		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'TIPO_USUARIO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_TIPO_USUARIO', caption: 'Nombre Tipo Usuario', width: 280 },
			...buildAuditGridColumns(),
		];
	}

	getOpcionDetalleColumns(): any[] {
		return [
			{ dataField: 'SELECCION', caption: '', dataType: 'boolean', width: 100 },
			{ dataField: 'NOMBRE_SISTEMA', caption: 'Sistema', width: 300, allowEditing: false },
			{ dataField: 'NOMBRE_MENU', caption: 'Menú', width: 300, allowEditing: false },
			{ dataField: 'NOMBRE_OPCION', caption: 'Opción', width: 400, allowEditing: false },
			{ dataField: 'NUEVO', caption: 'Nuevo', width: 150, dataType: 'boolean' },
			{ dataField: 'MODIFICAR', caption: 'Modificar', width: 150, dataType: 'boolean' },
			{ dataField: 'ELIMINAR', caption: 'Eliminar', width: 150, dataType: 'boolean' },
			{ dataField: 'IMPRIMIR', caption: 'Imprimir', width: 150, dataType: 'boolean' },
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
			{
				dataField: 'NOMBRE_TIPO_USUARIO',
				label: { text: 'Tipo Usuario' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Tipo Usuario...', showClearButton: true },
			},
		];
	}

	getAllSEG_TIPO_USUARIO_OPCION(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO }];

		return this.repodeta.get(xWhere);
	}

	insertUpdateSEG_TIPO_USUARIO_OPCION(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'TIPO_USUARIO', Value: model.TIPO_USUARIO },
			{ Parameter: 'CODIGO_SISTEMA', Value: model.CODIGO_SISTEMA },
			{ Parameter: 'CODIGO_MENU', Value: model.CODIGO_MENU },
			{ Parameter: 'CODIGO_OPCION', Value: model.CODIGO_OPCION },
		];

		return this.repodeta.update(model, xWhere);
	}
}
