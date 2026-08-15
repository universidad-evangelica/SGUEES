// Qué hace: agrupa las reglas de negocio del catálogo Divisiones.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenDivision } from './models/gen-division';
import { GenDivisionRepository } from './gen-division.repository';

@Injectable({ providedIn: 'root' })
// Qué hace: valida los datos de división y coordina el CRUD con el repositorio.
export class GenDivisionService {
	constructor(private repo: GenDivisionRepository) {}

	// Qué hace: valida los datos de la división antes de guardar.
	esValido(model: GenDivision, msg: Function): boolean {
		if (!model.NOMBRE_DIVISION || model.NOMBRE_DIVISION.trim() === '') {
			msg('Debe ingresar el nombre de division.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_DIVISION.trim().length > 100) {
			msg('El nombre de division no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CODIGO_DIVISION || model.CODIGO_DIVISION.trim() === '') {
			msg('Debe ingresar el codigo de division.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_DIVISION.trim().length > 10) {
			msg('El codigo de division no puede superar 10 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: lista las divisiones según los filtros recibidos.
	// Cómo: llama a getAll del repositorio con los filtros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una división por su correlativo.
	// Cómo: llama a get del repositorio con CORR_DIVISION.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION }]);
	}

	// Qué hace: crea una división nueva.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una división existente.
	// Cómo: llama a update del repositorio con el modelo y CORR_DIVISION.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_DIVISION', Value: model.CORR_DIVISION }]);
	}

	// Qué hace: elimina una división.
	// Cómo: llama a delete del repositorio con CORR_DIVISION.
	delete(param: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION }]);
	}

	// Qué hace: define las columnas del grid de divisiones.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_DIVISION',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_DIVISION', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_DIVISION', caption: 'Division', minWidth: 280 },
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: define el resumen de conteo del grid de divisiones.
	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_DIVISION', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Qué hace: define los campos y validaciones del formulario de división.
	getItems(): any {
		return [
			{ dataField: 'CORR_DIVISION', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_DIVISION',
				label: { text: 'Nombre division' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre division...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CODIGO_DIVISION',
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

		if (param.CORR_DIVISION) {
			xWhere.push({ Parameter: 'CORR_DIVISION', Value: param.CORR_DIVISION });
		}

		return xWhere;
	}
}
