// Qué hace: agrupa las reglas de negocio del catálogo Impacto Económico.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScImpactoEconomico } from './models/sc-impacto-economico';
import { ScImpactoEconomicoRepository } from './sc-impacto-economico.repository';

const ESTADO_FIELD = 'ESTADO_IMPACTO_ECONOMICO';

@Injectable({ providedIn: 'root' })
// Qué hace: valida los datos de impacto económico y coordina el CRUD con el repositorio.
export class ScImpactoEconomicoService {
	constructor(private repo: ScImpactoEconomicoRepository) {}

	// Qué hace: valida los datos del impacto económico antes de guardar.
	// Cómo: revisa que la descripción no esté vacía y no supere 150 caracteres.
	esValido(model: ScImpactoEconomico, msg: Function): boolean {
		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion del impacto economico.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 150) {
			msg('La descripcion del impacto economico no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: lista los impactos económicos según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los parámetros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene un impacto económico por su correlativo.
	// Cómo: llama a get del repositorio con CORR_IMPACTO_ECONOMICO como filtro.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: param.CORR_IMPACTO_ECONOMICO }]);
	}

	// Qué hace: crea un impacto económico nuevo.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza un impacto económico existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_IMPACTO_ECONOMICO como llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	// Qué hace: elimina un impacto económico.
	// Cómo: llama a delete del repositorio con CORR_IMPACTO_ECONOMICO como filtro.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	// Qué hace: cambia el estado activo/inactivo de un impacto económico.
	// Cómo: llama a activarInactivar del repositorio con CORR_IMPACTO_ECONOMICO como filtro.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	// Qué hace: define las columnas de la grilla de mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_IMPACTO_ECONOMICO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 650 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define el resumen (contador) de la grilla.
	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_IMPACTO_ECONOMICO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Qué hace: define los campos y las reglas de validación del formulario.
	getItems(): any {
		return [
			{ dataField: 'CORR_IMPACTO_ECONOMICO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 5,
				editorType: 'dxTextBox',
				editorOptions: { placeholder: 'Descripcion impacto economico...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_IMPACTO_ECONOMICO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_IMPACTO_ECONOMICO) {
			xWhere.push({ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: param.CORR_IMPACTO_ECONOMICO });
		}

		return xWhere;
	}
}
