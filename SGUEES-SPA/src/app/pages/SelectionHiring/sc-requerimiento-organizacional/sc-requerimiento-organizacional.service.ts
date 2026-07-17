// Servicio de negocio del catálogo Requerimiento Organizacional (validación, CRUD y config de grilla/form).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScRequerimientoOrganizacional } from './models/sc-requerimiento-organizacional';
import { ScRequerimientoOrganizacionalRepository } from './sc-requerimiento-organizacional.repository';

const ESTADO_FIELD = 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL';

@Injectable({ providedIn: 'root' })
// Encapsula validaciones y delega el CRUD en el repositorio de requerimiento organizacional.
export class ScRequerimientoOrganizacionalService {
	constructor(private repo: ScRequerimientoOrganizacionalRepository) {}

	// Valida la descripción obligatoria y su longitud antes del guardado.
	esValido(model: ScRequerimientoOrganizacional, msg: Function): boolean {
		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion de requerimiento organizacional.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 200) {
			msg('La descripcion de requerimiento organizacional no puede superar 200 caracteres.', NotifyType.Warning);
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
		return this.repo.get([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: param.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Delega en el repositorio la creación del registro.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Delega en el repositorio la actualización con su llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Delega en el repositorio la eliminación por correlativo.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Delega en el repositorio el cambio de estado activo/inactivo.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Define columnas y formatos de la grilla de mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_REQUERIMIENTO_ORGANIZACIONAL',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Configura el contador de registros de la grilla.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_REQUERIMIENTO_ORGANIZACIONAL',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Define los campos y reglas del formulario del requerimiento.
	getItems(): any {
		return [
			{ dataField: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 5,
				editorOptions: { placeholder: 'Descripcion...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_REQUERIMIENTO_ORGANIZACIONAL) {
			xWhere.push({ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: param.CORR_REQUERIMIENTO_ORGANIZACIONAL });
		}

		return xWhere;
	}
}
