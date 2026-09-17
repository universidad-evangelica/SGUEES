// Qué hace: servicio de negocio del catálogo Religión.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón sc-frecuencia).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenReligion } from './models/gen-religion';
import { GenReligionRepository } from './gen-religion.repository';

const ESTADO_FIELD = 'ACTIVO_RELIGION';

@Injectable({ providedIn: 'root' })
export class GenReligionService {
	constructor(private repo: GenReligionRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige nombre (máx 100); descripción opcional (máx 200).
	esValido(model: GenReligion, msg: Function): boolean {
		if (!model.NOMBRE_RELIGION || model.NOMBRE_RELIGION.trim() === '') {
			msg('Debe ingresar el nombre de la religión.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_RELIGION.trim().length > 100) {
			msg('El nombre no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}
		if (model.DESCRIPCION && model.DESCRIPCION.trim().length > 200) {
			msg('La descripción no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_RELIGION', Value: param.CORR_RELIGION }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_RELIGION', Value: model.CORR_RELIGION }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_RELIGION', Value: model.CORR_RELIGION }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_RELIGION', Value: model.CORR_RELIGION }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_RELIGION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_RELIGION', caption: 'Religión', width: 260, minWidth: 180 },
			{ dataField: 'DESCRIPCION', caption: 'Descripción', width: 320, minWidth: 200 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_RELIGION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_RELIGION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_RELIGION',
				label: { text: 'Nombre' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre religión...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripción' },
				colSpan: 6,
				editorOptions: { placeholder: 'Descripción...', showClearButton: true, maxLength: 200 },
			},
			{ dataField: 'ACTIVO_RELIGION', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_RELIGION) {
			xWhere.push({ Parameter: 'CORR_RELIGION', Value: param.CORR_RELIGION });
		}
		return xWhere;
	}
}
