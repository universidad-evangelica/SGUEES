// Qué hace: servicio de negocio del catálogo Puesto.
// Cómo: valida datos, ejecuta CRUD vía repositorio y arma columnas/items del formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { PlaPuesto } from './models/pla-puesto';
import { PlaPuestoRepository } from './pla-puesto.repository';

const ESTADO_FIELD = 'ESTADO_PUESTO';

@Injectable({ providedIn: 'root' })
export class PlaPuestoService {
	constructor(private repo: PlaPuestoRepository) {}

	esValido(model: PlaPuesto, msg: Function): boolean {
		if (!model.NOMBRE_PUESTO || model.NOMBRE_PUESTO.trim() === '') {
			msg('Debe ingresar el nombre del puesto.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_PUESTO.trim().length > 100) {
			msg('El nombre del puesto no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_PUESTO && model.CODIGO_PUESTO.trim().length > 30) {
			msg('El codigo del puesto no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.MISION_PUESTO && model.MISION_PUESTO.trim().length > 255) {
			msg('La mision del puesto no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.OTROS_ASPECTOS && model.OTROS_ASPECTOS.trim().length > 255) {
			msg('Otros aspectos no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}

		const inicial = model.SALARIO_INICIAL != null ? Number(model.SALARIO_INICIAL) : null;
		const final = model.SALARIO_FINAL != null ? Number(model.SALARIO_FINAL) : null;
		if (inicial != null && final != null && inicial > final) {
			msg('El salario inicial no puede ser mayor que el salario final.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_PUESTO', Value: param.CORR_PUESTO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_PUESTO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_PUESTO', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', minWidth: 220 },
			{ dataField: 'NOMBRE_TIPO_PUESTO', caption: 'Tipo', width: 180 },
			{ dataField: 'NOMBRE_GERENCIA', caption: 'Gerencia', width: 160 },
			{ dataField: 'NOMBRE_NIVEL_ACADEMICO', caption: 'Nivel academico', width: 160 },
			{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 160 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_PUESTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_PUESTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO_PUESTO',
				label: { text: 'Codigo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Codigo puesto...', showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'NOMBRE_PUESTO',
				label: { text: 'Nombre puesto' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre puesto...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_TIPO_PUESTO',
				label: { text: 'Tipo de puesto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Seleccione tipo...', showClearButton: true },
				template: 'CORR_TIPO_PUESTOLookup',
			},
			{
				dataField: 'CORR_GERENCIA',
				label: { text: 'Gerencia' },
				colSpan: 2,
				editorOptions: { placeholder: 'Seleccione gerencia...', showClearButton: true },
				template: 'CORR_GERENCIALookup',
			},
			{
				dataField: 'CORR_NIVEL_ACADEMICO',
				label: { text: 'Nivel academico' },
				colSpan: 2,
				editorOptions: { placeholder: 'Seleccione nivel...', showClearButton: true },
				template: 'CORR_NIVEL_ACADEMICOLookup',
			},
			{
				dataField: 'SALARIO_INICIAL',
				label: { text: 'Salario inicial' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { showClearButton: true, format: '#,##0.00', min: 0 },
			},
			{
				dataField: 'SALARIO_FINAL',
				label: { text: 'Salario final' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { showClearButton: true, format: '#,##0.00', min: 0 },
			},
			{
				dataField: 'CODIGO_FORMATO',
				label: { text: 'Codigo formato' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'VERSION_FORMATO',
				label: { text: 'Version formato' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'USUARIO_VALIDA',
				label: { text: 'Usuario valida' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'USUARIO_AUTORIZA',
				label: { text: 'Usuario autoriza' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'MISION_PUESTO',
				label: { text: 'Mision' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { height: 70, maxLength: 255, showClearButton: true },
			},
			{
				dataField: 'OTROS_ASPECTOS',
				label: { text: 'Otros aspectos' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { height: 70, maxLength: 255, showClearButton: true },
			},
			{ dataField: 'APROBACION_PUESTO', label: { text: 'Aprobado' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ESTADO_PUESTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_PUESTO) {
			xWhere.push({ Parameter: 'CORR_PUESTO', Value: param.CORR_PUESTO });
		}
		return xWhere;
	}
}
