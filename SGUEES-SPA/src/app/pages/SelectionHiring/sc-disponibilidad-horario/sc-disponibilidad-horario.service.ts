// Qué hace: servicio de negocio del catálogo Disponibilidad de Horario.
// Cómo: valida los datos, ejecuta el CRUD a través del repositorio y arma la configuración de grilla y formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { ScDisponibilidadHorario } from './models/sc-disponibilidad-horario';
import { ScDisponibilidadHorarioRepository } from './sc-disponibilidad-horario.repository';

const ESTADO_FIELD = 'ESTADO_DISPONIBILIDAD_HORARIO';

@Injectable({ providedIn: 'root' })
// Qué hace: servicio de disponibilidad de horario.
// Cómo: valida los datos y llama a ScDisponibilidadHorarioRepository para ejecutar el CRUD.
export class ScDisponibilidadHorarioService {
	constructor(private repo: ScDisponibilidadHorarioRepository) {}

	// Qué hace: valida el formulario de disponibilidad de horario antes de guardar.
	// Cómo: revisa que NOMBRE_DISPONIBILIDAD_HORARIO no esté vacío y no supere 150 caracteres, notificando con msg cuando falla.
	esValido(model: ScDisponibilidadHorario, msg: Function): boolean {
		if (!model.NOMBRE_DISPONIBILIDAD_HORARIO || model.NOMBRE_DISPONIBILIDAD_HORARIO.trim() === '') {
			msg('Debe ingresar el nombre de la disponibilidad de horario.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_DISPONIBILIDAD_HORARIO.trim().length > 150) {
			msg('El nombre de la disponibilidad de horario no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: obtiene el listado de disponibilidades de horario.
	// Cómo: llama a getAll del repositorio con el filtro construido por buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una disponibilidad de horario puntual.
	// Cómo: llama a get del repositorio filtrando por CORR_DISPONIBILIDAD_HORARIO.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: param.CORR_DISPONIBILIDAD_HORARIO }]);
	}

	// Qué hace: crea una nueva disponibilidad de horario.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una disponibilidad de horario existente.
	// Cómo: llama a update del repositorio con el modelo y su CORR_DISPONIBILIDAD_HORARIO.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: model.CORR_DISPONIBILIDAD_HORARIO }]);
	}

	// Qué hace: elimina una disponibilidad de horario.
	// Cómo: llama a delete del repositorio filtrando por CORR_DISPONIBILIDAD_HORARIO.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: model.CORR_DISPONIBILIDAD_HORARIO }]);
	}

	// Qué hace: cambia el estado activo/inactivo de una disponibilidad de horario.
	// Cómo: llama a activarInactivar del repositorio filtrando por CORR_DISPONIBILIDAD_HORARIO.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: model.CORR_DISPONIBILIDAD_HORARIO }]);
	}

	// Qué hace: define columnas y formatos de la grilla de mantenimiento.
	// Cómo: arma el arreglo de columnas (correlativo, nombre, estado y auditoría) usado por app-data-grid-mtto.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_DISPONIBILIDAD_HORARIO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_DISPONIBILIDAD_HORARIO', caption: 'Disponibilidad de Horario', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: configura el contador de registros de la grilla.
	// Cómo: define el resumen totalItems que cuenta CORR_DISPONIBILIDAD_HORARIO.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_DISPONIBILIDAD_HORARIO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Qué hace: define los campos y reglas del formulario de disponibilidad de horario.
	// Cómo: arma el arreglo de items (correlativo, nombre y estado) usado por dx-form.
	getItems(): any {
		return [
			{ dataField: 'CORR_DISPONIBILIDAD_HORARIO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_DISPONIBILIDAD_HORARIO',
				label: { text: 'Nombre disponibilidad de horario' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre disponibilidad de horario...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_DISPONIBILIDAD_HORARIO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Qué hace: traduce los filtros del componente al formato esperado por la API.
	// Cómo: agrega a xWhere el parámetro CORR_DISPONIBILIDAD_HORARIO cuando viene informado en param.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_DISPONIBILIDAD_HORARIO) {
			xWhere.push({ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: param.CORR_DISPONIBILIDAD_HORARIO });
		}

		return xWhere;
	}
}
