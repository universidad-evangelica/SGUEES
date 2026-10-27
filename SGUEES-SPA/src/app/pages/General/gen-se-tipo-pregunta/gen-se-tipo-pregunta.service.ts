// Qué hace: servicio de negocio del catálogo tipo de pregunta SE.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón gen-religion).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenSeTipoPregunta } from './models/gen-se-tipo-pregunta';
import { GenSeTipoPreguntaRepository } from './gen-se-tipo-pregunta.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class GenSeTipoPreguntaService {
	constructor(private repo: GenSeTipoPreguntaRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige código (máx 30) y nombre (máx 100).
	esValido(model: GenSeTipoPregunta, msg: Function): boolean {
		if (!model.CODIGO || model.CODIGO.trim() === '') {
			msg('Debe ingresar el código del tipo de pregunta.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO.trim().length > 30) {
			msg('El código no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE || model.NOMBRE.trim() === '') {
			msg('Debe ingresar el nombre del tipo de pregunta.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE.trim().length > 100) {
			msg('El nombre no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_TIPO_PREGUNTA', Value: param.CORR_TIPO_PREGUNTA }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_TIPO_PREGUNTA', Value: model.CORR_TIPO_PREGUNTA }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_TIPO_PREGUNTA', Value: model.CORR_TIPO_PREGUNTA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_TIPO_PREGUNTA', Value: model.CORR_TIPO_PREGUNTA }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_TIPO_PREGUNTA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO', caption: 'Código', width: 140 },
			{ dataField: 'NOMBRE', caption: 'Nombre', width: 280, minWidth: 200 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_TIPO_PREGUNTA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_PREGUNTA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 30 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre tipo de pregunta...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_TIPO_PREGUNTA) {
			xWhere.push({ Parameter: 'CORR_TIPO_PREGUNTA', Value: param.CORR_TIPO_PREGUNTA });
		}
		return xWhere;
	}
}
