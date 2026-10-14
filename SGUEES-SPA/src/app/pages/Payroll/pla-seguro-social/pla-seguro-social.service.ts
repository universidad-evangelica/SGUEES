// Qué hace: servicio de negocio del catálogo Seguro Social.
// Cómo lo hace: valida, ejecuta CRUD/ActivarInactivar y arma columnas/formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { PlaSeguroSocial } from './models/pla-seguro-social';
import { PlaSeguroSocialRepository } from './pla-seguro-social.repository';

const ESTADO_FIELD = 'ACTIVO_SEGURO_SOCIAL';

@Injectable({ providedIn: 'root' })
export class PlaSeguroSocialService {
	constructor(private repo: PlaSeguroSocialRepository) {}

	esValido(model: PlaSeguroSocial, msg: Function): boolean {
		if (!model.NOMBRE_SEGURO_SOCIAL || model.NOMBRE_SEGURO_SOCIAL.trim() === '') {
			msg('Debe ingresar el nombre del seguro social.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_SEGURO_SOCIAL.trim().length > 150) {
			msg('El nombre no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_CORTO_SEGURO || model.NOMBRE_CORTO_SEGURO.trim() === '') {
			msg('Debe ingresar el nombre corto del seguro social.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_CORTO_SEGURO.trim().length > 50) {
			msg('El nombre corto no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_SEGURO_SOCIAL', Value: param.CORR_SEGURO_SOCIAL }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_SEGURO_SOCIAL', Value: model.CORR_SEGURO_SOCIAL }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_SEGURO_SOCIAL', Value: model.CORR_SEGURO_SOCIAL }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_SEGURO_SOCIAL', Value: model.CORR_SEGURO_SOCIAL },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_SEGURO_SOCIAL',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_SEGURO_SOCIAL', caption: 'Nombre seguro social', width: 300, minWidth: 200 },
			{ dataField: 'NOMBRE_CORTO_SEGURO', caption: 'Nombre corto', width: 180, minWidth: 120 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_SEGURO_SOCIAL',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_SEGURO_SOCIAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_SEGURO_SOCIAL',
				label: { text: 'Nombre seguro social' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre seguro social...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_CORTO_SEGURO',
				label: { text: 'Nombre corto' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre corto...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO_SEGURO_SOCIAL', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_SEGURO_SOCIAL) {
			xWhere.push({ Parameter: 'CORR_SEGURO_SOCIAL', Value: param.CORR_SEGURO_SOCIAL });
		}
		return xWhere;
	}
}
