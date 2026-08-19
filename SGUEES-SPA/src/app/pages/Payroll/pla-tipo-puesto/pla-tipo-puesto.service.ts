// Qué hace: agrupa las reglas de negocio del catálogo Tipo de Puesto.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { PlaTipoPuesto } from './models/pla-tipo-puesto';
import { PlaTipoPuestoRepository } from './pla-tipo-puesto.repository';

const ESTADO_FIELD = 'ESTADO_TIPO_PUESTO';

@Injectable({
	providedIn: 'root',
})
// Qué hace: valida los datos de tipo de puesto y coordina el CRUD con el repositorio.
export class PlaTipoPuestoService {
	constructor(private repo: PlaTipoPuestoRepository) {}

	// Qué hace: valida los datos del tipo de puesto antes de guardar.
	// Cómo: revisa que nombre y código no estén vacíos y respeten sus longitudes máximas.
	esValido(model: PlaTipoPuesto, msg: Function): boolean {
		if (!model.NOMBRE_TIPO_PUESTO || model.NOMBRE_TIPO_PUESTO.trim() === '') {
			msg('Debe ingresar el nombre del tipo de puesto.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_TIPO_PUESTO.trim().length > 100) {
			msg('El nombre del tipo de puesto no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_TIPO_PUESTO || model.CODIGO_TIPO_PUESTO.trim() === '') {
			msg('Debe ingresar el codigo del tipo de puesto.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_TIPO_PUESTO.trim().length > 30) {
			msg('El codigo del tipo de puesto no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: lista los tipos de puesto según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los parámetros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene un tipo de puesto por su correlativo.
	// Cómo: llama a get del repositorio con CORR_TIPO_PUESTO como filtro.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_TIPO_PUESTO', Value: param.CORR_TIPO_PUESTO }]);
	}

	// Qué hace: crea un tipo de puesto nuevo.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza un tipo de puesto existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_TIPO_PUESTO como llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_TIPO_PUESTO', Value: model.CORR_TIPO_PUESTO }]);
	}

	// Qué hace: elimina un tipo de puesto.
	// Cómo: llama a delete del repositorio con CORR_TIPO_PUESTO como filtro.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_TIPO_PUESTO', Value: model.CORR_TIPO_PUESTO }]);
	}

	// Qué hace: cambia el estado activo/inactivo de un tipo de puesto.
	// Cómo: llama a activarInactivar del repositorio con CORR_TIPO_PUESTO como filtro.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_TIPO_PUESTO', Value: model.CORR_TIPO_PUESTO }]);
	}

	// Qué hace: define las columnas de la grilla de mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_TIPO_PUESTO',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_TIPO_PUESTO', caption: 'Codigo', width: 140 },
			{ dataField: 'NOMBRE_TIPO_PUESTO', caption: 'Tipo de puesto', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define el resumen (contador) de la grilla.
	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_PUESTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Qué hace: define los campos y las reglas de validación del formulario.
	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_PUESTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_PUESTO',
				label: { text: 'Nombre tipo de puesto' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre tipo de puesto...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_TIPO_PUESTO',
				label: { text: 'Codigo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Codigo tipo de puesto...', showClearButton: true, maxLength: 30 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_TIPO_PUESTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_TIPO_PUESTO) {
			xWhere.push({ Parameter: 'CORR_TIPO_PUESTO', Value: param.CORR_TIPO_PUESTO });
		}

		return xWhere;
	}
}
