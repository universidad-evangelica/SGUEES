// Qué hace: agrupa las reglas de negocio del catálogo Gerencias.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenGerencia } from './models/gen-gerencia';
import { GenGerenciaRepository } from './gen-gerencia.repository';

@Injectable({ providedIn: 'root' })
// Qué hace: valida los datos de gerencia y coordina el CRUD con el repositorio.
export class GenGerenciaService {
	constructor(private repo: GenGerenciaRepository) {}

	// Qué hace: valida los datos de la gerencia antes de guardar.
	esValido(model: GenGerencia, msg: Function): boolean {
		if (!model.CORR_DIVISION || model.CORR_DIVISION <= 0) {
			msg('Debe seleccionar la division.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_GERENCIA || model.NOMBRE_GERENCIA.trim() === '') {
			msg('Debe ingresar el nombre de gerencia.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_GERENCIA.trim().length > 100) {
			msg('El nombre de gerencia no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_GERENCIA || model.CODIGO_GERENCIA.trim() === '') {
			msg('Debe ingresar el codigo de gerencia.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_GERENCIA.trim().length > 10) {
			msg('El codigo de gerencia no puede superar 10 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: lista las gerencias según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los filtros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una gerencia por su correlativo.
	// Cómo: llama a get del repositorio con CORR_GERENCIA.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA }]);
	}

	// Qué hace: crea una gerencia nueva.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una gerencia existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_GERENCIA.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_GERENCIA', Value: model.CORR_GERENCIA }]);
	}

	// Qué hace: elimina una gerencia.
	// Cómo: llama a delete del repositorio con CORR_GERENCIA.
	delete(param: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA }]);
	}

	// Qué hace: define las columnas del grid de gerencias.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_GERENCIA',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_GERENCIA', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_GERENCIA', caption: 'Gerencia', minWidth: 220 },
			{ dataField: 'NOMBRE_DIVISION', caption: 'Division', width: 220 },
			{ dataField: 'CODIGO_DIVISION', caption: 'Cod. Division', width: 120 },
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define el resumen de conteo del grid de gerencias.
	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_GERENCIA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Qué hace: define los campos y validaciones del formulario de gerencia.
	getItems(): any {
		return [
			{ dataField: 'CORR_GERENCIA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_DIVISION',
				label: { text: 'Division' },
				colSpan: 2,
				editorOptions: { placeholder: 'Seleccione division...', showClearButton: false },
				template: 'CORR_DIVISIONLookup',
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) => {
							const value = Number(e.value);
							return !Number.isNaN(value) && value > 0;
						},
					},
				],
			},
			{
				dataField: 'NOMBRE_GERENCIA',
				label: { text: 'Nombre gerencia' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre gerencia...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_GERENCIA',
				label: { text: 'Codigo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Codigo...', showClearButton: true, maxLength: 10 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
		];
	}

	// Qué hace: arma los filtros enviados al repositorio.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_GERENCIA) {
			xWhere.push({ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA });
		}

		return xWhere;
	}
}
