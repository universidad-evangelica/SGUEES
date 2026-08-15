// Qué hace: agrupa las reglas de negocio del catálogo Riesgo del Puesto.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
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
// Qué hace: valida los datos de riesgo del puesto y coordina el CRUD con el repositorio.
export class ScRiesgoPuestoService {
	constructor(private repo: ScRiesgoPuestoRepository) {}

	// Qué hace: valida los datos del riesgo del puesto antes de guardar.
	// Cómo: revisa que el nombre no esté vacío y no supere 150 caracteres.
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

	// Qué hace: lista los riesgos del puesto según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los parámetros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene un riesgo del puesto por su correlativo.
	// Cómo: llama a get del repositorio con CORR_RIESGO_PUESTO como filtro.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_RIESGO_PUESTO', Value: param.CORR_RIESGO_PUESTO }]);
	}

	// Qué hace: crea un riesgo del puesto nuevo.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza un riesgo del puesto existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_RIESGO_PUESTO como llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]);
	}

	// Qué hace: elimina un riesgo del puesto.
	// Cómo: llama a delete del repositorio con CORR_RIESGO_PUESTO como filtro.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]);
	}

	// Qué hace: cambia el estado activo/inactivo de un riesgo del puesto.
	// Cómo: llama a activarInactivar del repositorio con CORR_RIESGO_PUESTO como filtro.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_RIESGO_PUESTO', Value: model.CORR_RIESGO_PUESTO }]);
	}

	// Qué hace: define las columnas de la grilla de mantenimiento.
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

	// Qué hace: define el resumen (contador) de la grilla.
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

	// Qué hace: define los campos y las reglas de validación del formulario.
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

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_RIESGO_PUESTO) {
			xWhere.push({ Parameter: 'CORR_RIESGO_PUESTO', Value: param.CORR_RIESGO_PUESTO });
		}

		return xWhere;
	}
}
