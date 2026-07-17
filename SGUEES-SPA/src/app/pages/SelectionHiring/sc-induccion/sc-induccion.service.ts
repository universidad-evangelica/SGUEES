// Servicio de negocio del catálogo Inducción (validación, CRUD y config de grilla/form).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScInduccion } from './models/sc-induccion';
import { ScInduccionRepository } from './sc-induccion.repository';

const ESTADO_FIELD = 'ESTADO_INDUCCION';

@Injectable({ providedIn: 'root' })
// Encapsula validaciones y delega el CRUD en el repositorio de inducción.
export class ScInduccionService {
	constructor(private repo: ScInduccionRepository) {}

	// Valida nombre, longitud y semanas positivas antes del guardado.
	esValido(model: ScInduccion, msg: Function): boolean {
		if (!model.NOMBRE_INDUCCION || model.NOMBRE_INDUCCION.trim() === '') {
			msg('Debe ingresar el nombre de induccion.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_INDUCCION.trim().length > 200) {
			msg('El nombre de induccion no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.SEMANAS_INDUCCION || model.SEMANAS_INDUCCION <= 0) {
			msg('Debe ingresar semanas de induccion mayores a 0.', NotifyType.Warning);
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
		return this.repo.get([{ Parameter: 'CORR_INDUCCION', Value: param.CORR_INDUCCION }]);
	}

	// Delega en el repositorio la creación del registro.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Delega en el repositorio la actualización con su llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_INDUCCION', Value: model.CORR_INDUCCION }]);
	}

	// Delega en el repositorio la eliminación por correlativo.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_INDUCCION', Value: model.CORR_INDUCCION }]);
	}

	// Delega en el repositorio el cambio de estado activo/inactivo.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_INDUCCION', Value: model.CORR_INDUCCION }]);
	}

	// Define columnas y formatos de la grilla de mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_INDUCCION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_INDUCCION', caption: 'Induccion', width: 300 },
			{
				dataField: 'SEMANAS_INDUCCION',
				caption: 'Semanas',
				width: 120,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Configura el contador de registros de la grilla.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_INDUCCION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Define los campos y reglas del formulario de inducción.
	getItems(): any {
		return [
			{ dataField: 'CORR_INDUCCION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_INDUCCION',
				label: { text: 'Nombre induccion' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre induccion...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'SEMANAS_INDUCCION',
				label: { text: 'Semanas' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 1, showSpinButtons: true },
				validationRules: [
					{ type: 'required', message: 'Este campo es obligatorio' },
					{ type: 'range', min: 1, message: 'Las semanas deben ser mayores a 0' },
				],
			},
			{ dataField: 'ESTADO_INDUCCION', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_INDUCCION) {
			xWhere.push({ Parameter: 'CORR_INDUCCION', Value: param.CORR_INDUCCION });
		}

		return xWhere;
	}
}
