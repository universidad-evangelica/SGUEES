// Qué hace: servicio de negocio del catálogo AFP.
// Cómo lo hace: valida, ejecuta CRUD/ActivarInactivar y arma columnas/formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { PlaAfp } from './models/pla-afp';
import { PlaAfpRepository } from './pla-afp.repository';

const ESTADO_FIELD = 'ACTIVO_AFP';

@Injectable({ providedIn: 'root' })
export class PlaAfpService {
	constructor(private repo: PlaAfpRepository) {}

	esValido(model: PlaAfp, msg: Function): boolean {
		if (!model.NOMBRE_AFP || model.NOMBRE_AFP.trim() === '') {
			msg('Debe ingresar el nombre de la AFP.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_AFP.trim().length > 150) {
			msg('El nombre no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_CORTO_AFP || model.NOMBRE_CORTO_AFP.trim() === '') {
			msg('Debe ingresar el nombre corto de la AFP.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_CORTO_AFP.trim().length > 50) {
			msg('El nombre corto no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO_SGVPP && model.CODIGO_SGVPP.trim().length > 5) {
			msg('El código SGVPP no puede superar 5 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_AFP', Value: param.CORR_AFP }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_AFP', Value: model.CORR_AFP }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_AFP', Value: model.CORR_AFP }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_AFP', Value: model.CORR_AFP }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_AFP',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_AFP', caption: 'Nombre AFP', width: 280, minWidth: 200 },
			{ dataField: 'NOMBRE_CORTO_AFP', caption: 'Nombre corto', width: 160, minWidth: 120 },
			{ dataField: 'CODIGO_SGVPP', caption: 'Código SGVPP', width: 120, minWidth: 100 },
			{
				dataField: 'INCLUYE_SEPP',
				caption: 'Incluye SEPP',
				width: 120,
				dataType: 'boolean',
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_AFP',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_AFP', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_AFP',
				label: { text: 'Nombre AFP' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre AFP...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_CORTO_AFP',
				label: { text: 'Nombre corto' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre corto...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_SGVPP',
				label: { text: 'Código SGVPP' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 5 },
			},
			{ dataField: 'INCLUYE_SEPP', label: { text: 'Incluye SEPP' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ACTIVO_AFP', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_AFP) {
			xWhere.push({ Parameter: 'CORR_AFP', Value: param.CORR_AFP });
		}
		return xWhere;
	}
}
