// Qué hace: servicio de negocio del catálogo Parentesco.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenParentesco } from './models/gen-parentesco';
import { GenParentescoRepository } from './gen-parentesco.repository';

const ESTADO_FIELD = 'ACTIVO_PARENTESCO';

@Injectable({ providedIn: 'root' })
export class GenParentescoService {
	constructor(private repo: GenParentescoRepository) {}

	esValido(model: GenParentesco, msg: Function): boolean {
		if (!model.NOMBRE_PARENTESCO || model.NOMBRE_PARENTESCO.trim() === '') {
			msg('Debe ingresar el nombre del parentesco.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_PARENTESCO.trim().length > 50) {
			msg('El nombre no puede superar 50 caracteres.', NotifyType.Warning);
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
		return this.repo.get([{ Parameter: 'CORR_PARENTESCO', Value: param.CORR_PARENTESCO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_PARENTESCO', Value: model.CORR_PARENTESCO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PARENTESCO', Value: model.CORR_PARENTESCO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_PARENTESCO', Value: model.CORR_PARENTESCO }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_PARENTESCO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_PARENTESCO', caption: 'Parentesco', width: 220, minWidth: 160 },
			{ dataField: 'DESCRIPCION', caption: 'Descripción', width: 320, minWidth: 200 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_PARENTESCO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_PARENTESCO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_PARENTESCO',
				label: { text: 'Nombre' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre parentesco...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripción' },
				colSpan: 6,
				editorOptions: { placeholder: 'Descripción...', showClearButton: true, maxLength: 200 },
			},
			{ dataField: 'ACTIVO_PARENTESCO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_PARENTESCO) {
			xWhere.push({ Parameter: 'CORR_PARENTESCO', Value: param.CORR_PARENTESCO });
		}
		return xWhere;
	}
}
