// Servicio de negocio del catálogo Riesgo del Puesto (validación, CRUD y config de grilla/form).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScRiesgoPuesto } from './models/sc-riesgo-puesto';
import { ScRiesgoPuestoRepository } from './sc-riesgo-puesto.repository';

const ESTADO_FIELD = 'ESTADO_RIESGO_PUESTO';

@Injectable({ providedIn: 'root' })
// Encapsula validaciones y delega el CRUD en el repositorio de riesgo del puesto.
export class ScRiesgoPuestoService {
	constructor(private repo: ScRiesgoPuestoRepository) {}

	// Valida el nombre obligatorio y su longitud antes del guardado.
	esValido(model: ScRiesgoPuesto, msg: Function): boolean {
		if (!model.NOMBRE_RIESGO_PUESTO || model.NOMBRE_RIESGO_PUESTO.trim() === '') {
			msg('Debe ingresar el nombre de riesgo de puesto.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_RIESGO_PUESTO.trim().length > 150) {
			msg('El nombre de riesgo de puesto no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Solicita al repositorio el listado con los filtros construidos.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Solicita al repositorio el detalle por correlativo.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_RIESGO_PUESTO', Value: param.CORR_RIESGO_PUESTO }]);
	}

	// Delega en el repositorio la creación del registro.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Delega en el repositorio la actualización con su llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]);
	}

	// Delega en el repositorio la eliminación por correlativo.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]);
	}

	// Delega en el repositorio el cambio de estado activo/inactivo.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]);
	}

	// Define columnas y formatos de la grilla de mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_RIESGO_PUESTO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_RIESGO_PUESTO', caption: 'Riesgo de Puesto', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Configura el contador de registros de la grilla.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_RIESGO_PUESTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Define los campos y reglas del formulario de riesgo.
	getItems(): any {
		return [
			{ dataField: 'CORR_RIESGO_PUESTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_RIESGO_PUESTO',
				label: { text: 'Nombre riesgo de puesto' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre riesgo de puesto...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_RIESGO_PUESTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_RIESGO_PUESTO) {
			xWhere.push({ Parameter: 'CORR_RIESGO_PUESTO', Value: param.CORR_RIESGO_PUESTO });
		}

		return xWhere;
	}
}
