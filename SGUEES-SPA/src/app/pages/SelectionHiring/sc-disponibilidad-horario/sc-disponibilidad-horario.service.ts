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
export class ScDisponibilidadHorarioService {
	constructor(private repo: ScDisponibilidadHorarioRepository) {}

	// Valida el nombre obligatorio y su longitud antes del guardado.
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

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: param.CORR_DISPONIBILIDAD_HORARIO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: model.CORR_DISPONIBILIDAD_HORARIO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: model.CORR_DISPONIBILIDAD_HORARIO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: model.CORR_DISPONIBILIDAD_HORARIO }]);
	}

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

	// Define los campos y reglas del formulario de disponibilidad.
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

	// Traduce los filtros del componente al formato esperado por la API.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_DISPONIBILIDAD_HORARIO) {
			xWhere.push({ Parameter: 'CORR_DISPONIBILIDAD_HORARIO', Value: param.CORR_DISPONIBILIDAD_HORARIO });
		}

		return xWhere;
	}
}
