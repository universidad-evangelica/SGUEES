import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { SegConfigOpcionRepository } from './seg-config-opcion.repository';
import { SegConfigOpcion } from './models/seg-config-opcion';

@Injectable({
	providedIn: 'root',
})
export class SegConfigOpcionService {
	constructor(private repo: SegConfigOpcionRepository) {}

	esValido(model: SegConfigOpcion, msg: Function): boolean {
		if (!model.CODIGO_SISTEMA?.trim()) {
			msg('Debe seleccionar el sistema.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO_MENU?.trim()) {
			msg('Debe seleccionar el menú.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO_OPCION?.trim()) {
			msg('Debe seleccionar la opción.', NotifyType.Warning);
			return false;
		}
		if (!model.ORDEN_SISTEMA) {
			msg('Debe ingresar el orden del sistema.', NotifyType.Warning);
			return false;
		}
		if (!model.ORDEN_MENU) {
			msg('Debe ingresar el orden del menú.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(): Observable<IResult> {
		return this.repo.get([]);
	}

	insert(model: SegConfigOpcion): Observable<IResult> {
		return this.repo.create(this.toTable(model));
	}

	update(model: SegConfigOpcion): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CODIGO_SISTEMA', Value: model.CODIGO_SISTEMA },
			{ Parameter: 'CODIGO_MENU', Value: model.CODIGO_MENU },
			{ Parameter: 'CODIGO_OPCION', Value: model.CODIGO_OPCION },
		];
		return this.repo.update(this.toTable(model), xWhere);
	}

	delete(model: SegConfigOpcion): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CODIGO_SISTEMA', Value: model.CODIGO_SISTEMA },
			{ Parameter: 'CODIGO_MENU', Value: model.CODIGO_MENU },
			{ Parameter: 'CODIGO_OPCION', Value: model.CODIGO_OPCION },
		];
		return this.repo.delete(xWhere);
	}

	private toTable(model: SegConfigOpcion): SegConfigOpcion {
		return {
			CODIGO_SISTEMA: model.CODIGO_SISTEMA,
			CODIGO_MENU: model.CODIGO_MENU,
			CODIGO_OPCION: model.CODIGO_OPCION,
			ORDEN_SISTEMA: model.ORDEN_SISTEMA,
			ORDEN_MENU: model.ORDEN_MENU,
			ORDEN_OPCION: model.ORDEN_OPCION ?? 0,
		};
	}

	getColumns(): any {
		return [
			{ dataField: 'CODIGO_SISTEMA', caption: 'Sistema', width: 120 },
			{ dataField: 'NOMBRE_SISTEMA', caption: 'Nombre sistema', width: 180 },
			{ dataField: 'CODIGO_MENU', caption: 'Menú', width: 100 },
			{ dataField: 'NOMBRE_MENU', caption: 'Nombre menú', width: 160 },
			{ dataField: 'CODIGO_OPCION', caption: 'Opción', width: 160 },
			{ dataField: 'NOMBRE_OPCION', caption: 'Nombre opción', width: 200 },
			{ dataField: 'URL_OPCION', caption: 'URL', width: 180 },
			{ dataField: 'ORDEN_SISTEMA', caption: 'Ord. sistema', width: 90 },
			{ dataField: 'ORDEN_MENU', caption: 'Ord. menú', width: 90 },
			{ dataField: 'ORDEN_OPCION', caption: 'Ord. opción', width: 90 },
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
				dataField: 'CODIGO_SISTEMA',
				label: { text: 'Sistema' },
				colSpan: 1,
				template: 'CODIGO_SISTEMALookup',
			},
			{
				dataField: 'CODIGO_MENU',
				label: { text: 'Menú' },
				colSpan: 1,
				template: 'CODIGO_MENULookup',
			},
			{
				dataField: 'CODIGO_OPCION',
				label: { text: 'Opción' },
				colSpan: 1,
				template: 'CODIGO_OPCIONLookup',
			},
			{
				dataField: 'ORDEN_SISTEMA',
				label: { text: 'Orden sistema' },
				colSpan: 1,
				editorType: 'dxNumberBox',
				editorOptions: { min: 1, showSpinButtons: true },
			},
			{
				dataField: 'ORDEN_MENU',
				label: { text: 'Orden menú' },
				colSpan: 1,
				editorType: 'dxNumberBox',
				editorOptions: { min: 1, showSpinButtons: true },
			},
			{
				dataField: 'ORDEN_OPCION',
				label: { text: 'Orden opción' },
				colSpan: 1,
				editorType: 'dxNumberBox',
				editorOptions: { min: 0, showSpinButtons: true },
			},
		];
	}
}
