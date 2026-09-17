// Qué hace: servicio de negocio del catálogo Origen Ingreso.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón sc-frecuencia).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenOrigenIngreso } from './models/gen-origen-ingreso';
import { GenOrigenIngresoRepository } from './gen-origen-ingreso.repository';

const ESTADO_FIELD = 'ACTIVO_ORIGEN_INGRESO';

@Injectable({ providedIn: 'root' })
export class GenOrigenIngresoService {
	constructor(private repo: GenOrigenIngresoRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige nombre (máx 25).
	esValido(model: GenOrigenIngreso, msg: Function): boolean {
		if (!model.NOMBRE_ORIGEN_INGRESO || model.NOMBRE_ORIGEN_INGRESO.trim() === '') {
			msg('Debe ingresar el nombre del origen de ingreso.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_ORIGEN_INGRESO.trim().length > 25) {
			msg('El nombre no puede superar 25 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_ORIGEN_INGRESO', Value: param.CORR_ORIGEN_INGRESO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_ORIGEN_INGRESO', Value: model.CORR_ORIGEN_INGRESO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_ORIGEN_INGRESO', Value: model.CORR_ORIGEN_INGRESO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_ORIGEN_INGRESO', Value: model.CORR_ORIGEN_INGRESO },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_ORIGEN_INGRESO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_ORIGEN_INGRESO', caption: 'Origen de ingreso', width: 280, minWidth: 180 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_ORIGEN_INGRESO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_ORIGEN_INGRESO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_ORIGEN_INGRESO',
				label: { text: 'Nombre' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre origen de ingreso...', showClearButton: true, maxLength: 25 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO_ORIGEN_INGRESO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_ORIGEN_INGRESO) {
			xWhere.push({ Parameter: 'CORR_ORIGEN_INGRESO', Value: param.CORR_ORIGEN_INGRESO });
		}
		return xWhere;
	}
}
