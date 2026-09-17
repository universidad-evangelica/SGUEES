// Qué hace: servicio de negocio del catálogo Actividad Económica.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón sc-frecuencia).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenActividadEconomica } from './models/gen-actividad-economica';
import { GenActividadEconomicaRepository } from './gen-actividad-economica.repository';

const ESTADO_FIELD = 'ACTIVO_ACTIVIDAD_ECONOMICA';

@Injectable({ providedIn: 'root' })
export class GenActividadEconomicaService {
	constructor(private repo: GenActividadEconomicaRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige código (máx 5) y nombre (máx 255).
	esValido(model: GenActividadEconomica, msg: Function): boolean {
		if (!model.CODIGO_ACTIVIDAD_ECONOMICA || model.CODIGO_ACTIVIDAD_ECONOMICA.trim() === '') {
			msg('Debe ingresar el código de la actividad económica.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO_ACTIVIDAD_ECONOMICA.trim().length > 5) {
			msg('El código no puede superar 5 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_ACTIVIDAD_ECONOMICA || model.NOMBRE_ACTIVIDAD_ECONOMICA.trim() === '') {
			msg('Debe ingresar el nombre de la actividad económica.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_ACTIVIDAD_ECONOMICA.trim().length > 255) {
			msg('El nombre no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_ACTIVIDAD_ECONOMICA', Value: param.CORR_ACTIVIDAD_ECONOMICA }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_ACTIVIDAD_ECONOMICA', Value: model.CORR_ACTIVIDAD_ECONOMICA }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_ACTIVIDAD_ECONOMICA', Value: model.CORR_ACTIVIDAD_ECONOMICA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_ACTIVIDAD_ECONOMICA', Value: model.CORR_ACTIVIDAD_ECONOMICA },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_ACTIVIDAD_ECONOMICA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_ACTIVIDAD_ECONOMICA', caption: 'Código', width: 110, minWidth: 90 },
			{ dataField: 'NOMBRE_ACTIVIDAD_ECONOMICA', caption: 'Actividad económica', width: 360, minWidth: 220 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_ACTIVIDAD_ECONOMICA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_ACTIVIDAD_ECONOMICA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO_ACTIVIDAD_ECONOMICA',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 5 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_ACTIVIDAD_ECONOMICA',
				label: { text: 'Nombre' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre actividad económica...', showClearButton: true, maxLength: 255 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO_ACTIVIDAD_ECONOMICA', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_ACTIVIDAD_ECONOMICA) {
			xWhere.push({ Parameter: 'CORR_ACTIVIDAD_ECONOMICA', Value: param.CORR_ACTIVIDAD_ECONOMICA });
		}
		return xWhere;
	}
}
