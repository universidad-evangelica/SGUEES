// Qué hace: agrupa las reglas de negocio del catálogo Requerimiento Organizacional.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
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
// Qué hace: valida los datos de requerimiento organizacional y coordina el CRUD con el repositorio.
export class ScRequerimientoOrganizacionalService {
	constructor(private repo: ScRequerimientoOrganizacionalRepository) {}

	// Qué hace: valida los datos del requerimiento organizacional antes de guardar.
	// Cómo: revisa que la descripción no esté vacía y no supere 200 caracteres.
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

	// Qué hace: lista los requerimientos organizacionales según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los parámetros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene un requerimiento organizacional por su correlativo.
	// Cómo: llama a get del repositorio con CORR_REQUERIMIENTO_ORGANIZACIONAL como filtro.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: param.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Qué hace: crea un requerimiento organizacional nuevo.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza un requerimiento organizacional existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_REQUERIMIENTO_ORGANIZACIONAL como llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Qué hace: elimina un requerimiento organizacional.
	// Cómo: llama a delete del repositorio con CORR_REQUERIMIENTO_ORGANIZACIONAL como filtro.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Qué hace: cambia el estado activo/inactivo de un requerimiento organizacional.
	// Cómo: llama a activarInactivar del repositorio con CORR_REQUERIMIENTO_ORGANIZACIONAL como filtro.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: model.CORR_REQUERIMIENTO_ORGANIZACIONAL }]);
	}

	// Qué hace: define las columnas de la grilla de mantenimiento.
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

	// Qué hace: define el resumen (contador) de la grilla.
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

	// Qué hace: define los campos y las reglas de validación del formulario.
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

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_REQUERIMIENTO_ORGANIZACIONAL) {
			xWhere.push({ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: param.CORR_REQUERIMIENTO_ORGANIZACIONAL });
		}

		return xWhere;
	}
}
