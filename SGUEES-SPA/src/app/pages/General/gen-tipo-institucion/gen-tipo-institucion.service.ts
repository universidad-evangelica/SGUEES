// Qué hace: servicio de negocio del catálogo tipo de institución.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón gen-religion).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenTipoInstitucion } from './models/gen-tipo-institucion';
import { GenTipoInstitucionRepository } from './gen-tipo-institucion.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class GenTipoInstitucionService {
	constructor(private repo: GenTipoInstitucionRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige nombre (máx 50).
	esValido(model: GenTipoInstitucion, msg: Function): boolean {
		if (!model.NOMBRE || model.NOMBRE.trim() === '') {
			msg('Debe ingresar el nombre del tipo de institución.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE.trim().length > 50) {
			msg('El nombre no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_TIPO_INSTITUCION', Value: param.CORR_TIPO_INSTITUCION }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_TIPO_INSTITUCION', Value: model.CORR_TIPO_INSTITUCION }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_TIPO_INSTITUCION', Value: model.CORR_TIPO_INSTITUCION }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_TIPO_INSTITUCION', Value: model.CORR_TIPO_INSTITUCION }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_TIPO_INSTITUCION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE', caption: 'Nombre', width: 320, minWidth: 200 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_TIPO_INSTITUCION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_INSTITUCION', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre tipo de institución...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_TIPO_INSTITUCION) {
			xWhere.push({ Parameter: 'CORR_TIPO_INSTITUCION', Value: param.CORR_TIPO_INSTITUCION });
		}
		return xWhere;
	}
}
