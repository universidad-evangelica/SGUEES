import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { SegOpcionSistemaRepository } from './seg-opcion-sistema.repository';
import { SegOpcionSistema } from './models/seg-opcion-sistema';

@Injectable({
	providedIn: 'root',
})
export class SegOpcionSistemaService {
	constructor(private repo: SegOpcionSistemaRepository) {}

	esValido(model: SegOpcionSistema, msg: Function): boolean {
		if (!model.CODIGO_OPCION?.trim()) {
			msg('Debe ingresar el código de la opción.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_OPCION?.trim()) {
			msg('Debe ingresar el nombre de la opción.', NotifyType.Warning);
			return false;
		}
		if (!model.URL_OPCION?.trim()) {
			msg('Debe ingresar la URL de la opción.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CODIGO_OPCION', Value: param.CODIGO_OPCION ?? '' }];
		return this.repo.get(xWhere);
	}

	insert(model: SegOpcionSistema): Observable<IResult> {
		return this.repo.create({
			...model,
			IMAGEN_OPCION: model.IMAGEN_OPCION ?? '',
		});
	}

	update(model: SegOpcionSistema): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CODIGO_OPCION', Value: model.CODIGO_OPCION }];
		return this.repo.update(
			{
				...model,
				IMAGEN_OPCION: model.IMAGEN_OPCION ?? '',
			},
			xWhere
		);
	}

	delete(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CODIGO_OPCION', Value: param.CODIGO_OPCION }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CODIGO_OPCION', caption: 'Código', width: 180 },
			{ dataField: 'NOMBRE_OPCION', caption: 'Nombre opción', width: 260 },
			{ dataField: 'URL_OPCION', caption: 'URL', width: 220 },
			{ dataField: 'IMAGEN_OPCION', caption: 'Imagen', width: 120 },
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CODIGO_OPCION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CODIGO_OPCION',
				label: { text: 'Código opción' },
				colSpan: 1,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 30 },
				validationRules: [{ type: 'required', message: 'El código es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_OPCION',
				label: { text: 'Nombre opción' },
				colSpan: 2,
				editorOptions: { placeholder: 'Nombre...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
			},
			{
				dataField: 'URL_OPCION',
				label: { text: 'URL opción' },
				colSpan: 2,
				editorOptions: { placeholder: '/ruta-spa', showClearButton: true },
				validationRules: [{ type: 'required', message: 'La URL es obligatoria' }],
			},
			{
				dataField: 'IMAGEN_OPCION',
				label: { text: 'Imagen opción' },
				colSpan: 1,
				editorOptions: { placeholder: 'Icono (opcional)', showClearButton: true, maxLength: 25 },
			},
		];
	}
}
