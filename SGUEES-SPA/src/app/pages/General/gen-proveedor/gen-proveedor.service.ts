import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

import { GenProveedorRepository } from './gen-proveedor.repository';
import { GenProveedor } from './models/gen-proveedor';

const ESTADO_FIELD = 'ACTIVO_PROVEEDOR';

@Injectable({
	providedIn: 'root',
})
export class GenProveedorService {
	constructor(private repo: GenProveedorRepository) {}

	esValido(model: GenProveedor, msg: Function): boolean {
		if (!model.CORR_PERSONA || model.CORR_PERSONA <= 0) {
			msg('Debe seleccionar una persona.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO_PROVEEDOR?.trim()) {
			msg('Debe digitar el código del proveedor.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR ?? 0 }];
		return this.repo.get(xWhere);
	}

	getPersonas(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PERSONA', Value: param.CORR_PERSONA ?? 0 },
		];
		return this.repo.getPersonas(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR }];
		return this.repo.update(model, xWhere);
	}

	delete(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR }];
		return this.repo.delete(xWhere);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
		]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_PROVEEDOR', caption: 'Corr.', width: 85 },
			{ dataField: 'CODIGO_PROVEEDOR', caption: 'Código', width: 120 },
			{ dataField: 'NOMBRE_COMERCIAL', caption: 'Nombre / Razón social', width: 320 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Nombre persona', width: 280 },
			{ dataField: 'NOMBRE_TIPO_PERSONERIA', caption: 'Personería', width: 110 },
			{ dataField: 'NOMBRE_BANCO', caption: 'Banco', width: 180 },
			{ dataField: 'CUENTA_BANCARIA', caption: 'Cuenta', width: 140 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{ column: 'CORR_PROVEEDOR', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' },
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_PROVEEDOR', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_PERSONA',
				label: { text: 'Persona' },
				colSpan: 3,
				template: 'CORR_PERSONALookup',
				editorOptions: { placeholder: 'seleccionar persona...', showClearButton: true, maxLength: 20 },
				validationRules: [{ type: 'required', message: 'La persona es obligatoria' }]
			},

			{
				dataField: 'NOMBRE_COMERCIAL',
				label: { text: 'Nombre / Razón social' },
				colSpan: 4,
				editorOptions: { placeholder: 'Describa el nombre o razón social...', maxLength: 150 },
			},

			{
				dataField: 'CODIGO_PROVEEDOR',
				label: { text: 'Código proveedor' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 20 },
				validationRules: [{ type: 'required', message: 'El código es obligatorio' }],
			},

			{
				dataField: 'CORR_FORMA_PAGO',
				label: { text: 'Forma de pago' },
				colSpan: 2,
				template: 'CORR_FORMA_PAGOLookup',
			},

			{
				dataField: 'CORR_CONDICION_PAGO',
				label: { text: 'Condición de pago' },
				colSpan: 2,
				template: 'CORR_CONDICION_PAGOLookup',
			},

			{
				dataField: 'CORR_BANCO',
				label: { text: 'Banco' },
				colSpan: 2,
				template: 'CORR_BANCOLookup',
			},

			{
				dataField: 'CUENTA_BANCARIA',
				label: { text: 'Cuenta bancaria' },
				colSpan: 2,
				editorOptions: { placeholder: 'Cuenta...', showClearButton: true, maxLength: 30 },
			},

			{
				dataField: 'NOMBRE_TIPO_PERSONERIA',
				label: { text: 'Personería' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},

			{
				dataField: 'ACTIVO_PROVEEDOR',
				label: { text: 'Activo' },
				editorType: 'dxCheckBox',
				colSpan: 2,
			},
		];
	}
}
