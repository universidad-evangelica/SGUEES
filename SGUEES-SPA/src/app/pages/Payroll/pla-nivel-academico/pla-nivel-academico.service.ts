import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { PlaNivelAcademico } from './models/pla-nivel-academico';
import { PlaNivelAcademicoRepository } from './pla-nivel-academico.repository';

const ESTADO_FIELD = 'ESTADO_NIVEL_ACADEMICO';

@Injectable({ providedIn: 'root' })
export class PlaNivelAcademicoService {
	constructor(private repo: PlaNivelAcademicoRepository) {}

	// Valida que el nombre obligatorio respete la longitud permitida.
	esValido(model: PlaNivelAcademico, msg: Function): boolean {
		if (!model.NOMBRE_NIVEL_ACADEMICO || model.NOMBRE_NIVEL_ACADEMICO.trim() === '') {
			msg('Debe ingresar el nombre del nivel academico.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_NIVEL_ACADEMICO.trim().length > 150) {
			msg('El nombre del nivel academico no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Consulta los niveles aplicando únicamente los filtros informados.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Solicita al repositorio el detalle del nivel indicado.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: param.CORR_NIVEL_ACADEMICO }]);
	}

	// Delega en el repositorio la creación del nivel académico.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Delega en el repositorio la actualización del nivel y su clave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: model.CORR_NIVEL_ACADEMICO }]);
	}

	// Delega en el repositorio la eliminación del nivel indicado.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: model.CORR_NIVEL_ACADEMICO }]);
	}

	// Cambia el estado activo/inactivo del nivel vía el endpoint dedicado.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: model.CORR_NIVEL_ACADEMICO }]);
	}

	// Define las columnas y filtros mostrados en la grilla del mantenimiento.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_NIVEL_ACADEMICO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_NIVEL_ACADEMICO', caption: 'Nivel academico', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Configura el contador de registros mostrado en la cuadrícula.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_NIVEL_ACADEMICO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Define los campos, editores y reglas de validación del formulario.
	getItems(): any {
		return [
			{ dataField: 'CORR_NIVEL_ACADEMICO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_NIVEL_ACADEMICO',
				label: { text: 'Nombre nivel academico' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre nivel academico...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_NIVEL_ACADEMICO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	// Traduce los filtros de pantalla al formato esperado por el repositorio.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_NIVEL_ACADEMICO) {
			xWhere.push({ Parameter: 'CORR_NIVEL_ACADEMICO', Value: param.CORR_NIVEL_ACADEMICO });
		}

		return xWhere;
	}
}
