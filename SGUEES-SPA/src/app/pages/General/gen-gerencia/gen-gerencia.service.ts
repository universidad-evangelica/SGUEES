// Capa de negocio: validación, columnas/formulario y orquestación hacia el repositorio de gerencias.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenGerencia } from './models/gen-gerencia';
import { GenGerenciaRepository } from './gen-gerencia.repository';

@Injectable({ providedIn: 'root' })
export class GenGerenciaService {
	constructor(private repo: GenGerenciaRepository) {}

	// Valida los campos obligatorios y sus longitudes antes de guardar la gerencia.
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

	// Solicita al repositorio el listado de gerencias con los filtros construidos.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Solicita al repositorio el detalle de la gerencia indicada.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA }]);
	}

	// Delega en el repositorio la creación de la gerencia.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Delega en el repositorio la actualización de la gerencia y sus claves.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_GERENCIA', Value: model.CORR_GERENCIA }]);
	}

	// Delega en el repositorio la eliminación de la gerencia indicada.
	delete(param: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA }]);
	}

	// Define las columnas y formatos usados por la cuadrícula del mantenimiento.
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

	// Configura el contador de registros mostrado en la cuadrícula.
	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_GERENCIA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Define los campos, editores y validaciones que presenta el formulario.
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

	// Transforma los parámetros del componente en filtros compatibles con el repositorio.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_GERENCIA) {
			xWhere.push({ Parameter: 'CORR_GERENCIA', Value: param.CORR_GERENCIA });
		}

		return xWhere;
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'la gerencia';

// Genera el mensaje funcional usado cuando la sesión no tiene una empresa asignada.
export function getEmpresaWarningMessage(etiquetaRegistro = EMPRESA_REGISTRO_ETIQUETA): string {
	return `No se pudo guardar ${etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.`;
}

// Identifica respuestas controladas relacionadas con la empresa de la sesión.
export function isEmpresaWarningResponse(response: any): boolean {
	return response?.ErrorCode === EMPRESA_WARNING_ERROR_CODE;
}

// Detecta errores técnicos vinculados con la empresa y permite mostrarlos como advertencia.
export function isEmpresaFkErrorMessage(message: string): boolean {
	const value = `${message ?? ''}`.toLowerCase();
	return (
		value.includes('gen_empresa') ||
		value.includes('foreign key') ||
		value.includes('clave externa') ||
		value.includes('reference constraint') ||
		value.includes('conflicted with the foreign key') ||
		value.includes('no tiene una empresa asignada')
	);
}
