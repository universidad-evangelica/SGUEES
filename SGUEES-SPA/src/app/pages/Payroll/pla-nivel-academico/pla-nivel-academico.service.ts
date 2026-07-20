// Qué hace: agrupa las reglas de negocio del catálogo Nivel Académico.
// Cómo: valida los datos y llama al repositorio para el CRUD y el cambio de estado; define columnas y campos del formulario.
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
// Qué hace: valida los datos de nivel académico y coordina el CRUD con el repositorio.
export class PlaNivelAcademicoService {
	constructor(private repo: PlaNivelAcademicoRepository) {}

	// Qué hace: valida los datos del nivel académico antes de guardar.
	// Cómo: revisa que el nombre no esté vacío y no supere 150 caracteres.
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

	// Qué hace: lista los niveles académicos según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los parámetros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene un nivel académico por su correlativo.
	// Cómo: llama a get del repositorio con CORR_NIVEL_ACADEMICO como filtro.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: param.CORR_NIVEL_ACADEMICO }]);
	}

	// Qué hace: crea un nivel académico nuevo.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza un nivel académico existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_NIVEL_ACADEMICO como llave.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: model.CORR_NIVEL_ACADEMICO }]);
	}

	// Qué hace: elimina un nivel académico.
	// Cómo: llama a delete del repositorio con CORR_NIVEL_ACADEMICO como filtro.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: model.CORR_NIVEL_ACADEMICO }]);
	}

	// Qué hace: cambia el estado activo/inactivo de un nivel académico.
	// Cómo: llama a activarInactivar del repositorio con CORR_NIVEL_ACADEMICO como filtro.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_NIVEL_ACADEMICO', Value: model.CORR_NIVEL_ACADEMICO }]);
	}

	// Qué hace: define las columnas de la grilla de mantenimiento.
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

	// Qué hace: define el resumen (contador) de la grilla.
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

	// Qué hace: define los campos y las reglas de validación del formulario.
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

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_NIVEL_ACADEMICO) {
			xWhere.push({ Parameter: 'CORR_NIVEL_ACADEMICO', Value: param.CORR_NIVEL_ACADEMICO });
		}

		return xWhere;
	}
}
