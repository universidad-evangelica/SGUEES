// Qué hace: agrupa las reglas de negocio del catálogo Responsabilidad del Cargo.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScResponsabilidadCargo } from './models/sc-responsabilidad-cargo';
import { ScResponsabilidadCargoRepository } from './sc-responsabilidad-cargo.repository';

const ESTADO_FIELD = 'ESTADO_RESPONSABILIDAD';

@Injectable({ providedIn: 'root' })
// Qué hace: valida los datos de responsabilidad del cargo y coordina el CRUD con el repositorio.
export class ScResponsabilidadCargoService {
	constructor(private repo: ScResponsabilidadCargoRepository) {}

	// Qué hace: valida los datos de la responsabilidad del cargo antes de guardar.
	// Cómo: revisa que el nombre no esté vacío, no supere 150 caracteres y que APLICA_DESCRIPTOR sea CORTO, EXTENSO o AMBOS.
	esValido(model: ScResponsabilidadCargo, msg: Function): boolean {
		if (!model.NOMBRE_RESPONSABILIDAD || model.NOMBRE_RESPONSABILIDAD.trim() === '') {
			msg('Debe ingresar el nombre de la responsabilidad de cargo.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_RESPONSABILIDAD.trim().length > 150) {
			msg('El nombre de la responsabilidad de cargo no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!['CORTO', 'EXTENSO', 'AMBOS'].includes((model.APLICA_DESCRIPTOR ?? '').toUpperCase())) {
			msg('Debe indicar si la responsabilidad aplica al descriptor CORTO, EXTENSO o AMBOS.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: lista las responsabilidades del cargo según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los parámetros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una responsabilidad del cargo por su correlativo.
	// Cómo: llama a get del repositorio con CORR_RESPONSABILIDAD como filtro.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_RESPONSABILIDAD', Value: param.CORR_RESPONSABILIDAD }]);
	}

	// Qué hace: crea una responsabilidad del cargo nueva.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una responsabilidad del cargo existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_RESPONSABILIDAD como llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_RESPONSABILIDAD', Value: model.CORR_RESPONSABILIDAD }]);
	}

	// Qué hace: elimina una responsabilidad del cargo.
	// Cómo: llama a delete del repositorio con CORR_RESPONSABILIDAD como filtro.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_RESPONSABILIDAD', Value: model.CORR_RESPONSABILIDAD }]);
	}

	// Qué hace: cambia el estado activo/inactivo de una responsabilidad del cargo.
	// Cómo: llama a activarInactivar del repositorio con CORR_RESPONSABILIDAD como filtro.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_RESPONSABILIDAD', Value: model.CORR_RESPONSABILIDAD }]);
	}

	// Qué hace: define las columnas de la grilla de mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_RESPONSABILIDAD',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_RESPONSABILIDAD', caption: 'Responsabilidad', width: 300 },
			{ dataField: 'APLICA_DESCRIPTOR', caption: 'Aplica descriptor', width: 150 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define el resumen (contador) de la grilla.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_RESPONSABILIDAD',
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
			{ dataField: 'CORR_RESPONSABILIDAD', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_RESPONSABILIDAD',
				label: { text: 'Nombre responsabilidad' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre responsabilidad...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'APLICA_DESCRIPTOR',
				label: { text: 'Aplica al descriptor' },
				editorType: 'dxSelectBox',
				colSpan: 2,
				editorOptions: {
					dataSource: ['CORTO', 'EXTENSO', 'AMBOS'],
					placeholder: 'Seleccione...',
					showClearButton: false,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_RESPONSABILIDAD', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_RESPONSABILIDAD) {
			xWhere.push({ Parameter: 'CORR_RESPONSABILIDAD', Value: param.CORR_RESPONSABILIDAD });
		}

		return xWhere;
	}
}
