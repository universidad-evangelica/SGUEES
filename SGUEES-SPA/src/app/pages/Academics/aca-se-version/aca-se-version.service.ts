// Qué hace: servicio de negocio del catálogo versiones socioeconómico.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón aca-documento-admision).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaSeVersion } from './models/aca-se-version';
import { AcaSeVersionRepository } from './aca-se-version.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSeVersionService {
	constructor(private repo: AcaSeVersionRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige código (máx 20) y nombre (máx 200); descripción máx 500.
	esValido(model: AcaSeVersion, msg: Function): boolean {
		if (!model.CODIGO || model.CODIGO.trim() === '') {
			msg('Debe ingresar el código de la versión.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO.trim().length > 20) {
			msg('El código no puede superar 20 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE || model.NOMBRE.trim() === '') {
			msg('Debe ingresar el nombre de la versión.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE.trim().length > 200) {
			msg('El nombre no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}
		if (model.DESCRIPCION && model.DESCRIPCION.trim().length > 500) {
			msg('La descripción no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}
		if (model.FECHA_VIGENCIA_INI && model.FECHA_VIGENCIA_FIN) {
			const ini = new Date(model.FECHA_VIGENCIA_INI);
			const fin = new Date(model.FECHA_VIGENCIA_FIN);
			if (!isNaN(ini.getTime()) && !isNaN(fin.getTime()) && fin < ini) {
				msg('La fecha de vigencia fin no puede ser menor que la de inicio.', NotifyType.Warning);
				return false;
			}
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_VERSION', Value: param.CORR_VERSION }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model), [
			{ Parameter: 'CORR_VERSION', Value: model.CORR_VERSION },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_VERSION', Value: model.CORR_VERSION }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_VERSION', Value: model.CORR_VERSION }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_VERSION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO', caption: 'Código', width: 120 },
			{ dataField: 'NOMBRE', caption: 'Nombre', width: 280, minWidth: 200 },
			{ dataField: 'DESCRIPCION', caption: 'Descripción', width: 260, minWidth: 180 },
			{
				dataField: 'FECHA_VIGENCIA_INI',
				caption: 'Vigencia inicio',
				width: 150,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			{
				dataField: 'FECHA_VIGENCIA_FIN',
				caption: 'Vigencia fin',
				width: 150,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_VERSION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_VERSION', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 20 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre de la versión...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripción' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Descripción...', maxLength: 500, height: 80 },
			},
			{
				dataField: 'FECHA_VIGENCIA_INI',
				label: { text: 'Vigencia inicio' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm', showClearButton: true },
			},
			{
				dataField: 'FECHA_VIGENCIA_FIN',
				label: { text: 'Vigencia fin' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm', showClearButton: true },
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private normalizarPayload(model: any): any {
		const desc = typeof model?.DESCRIPCION === 'string' ? model.DESCRIPCION.trim() : model?.DESCRIPCION;
		return {
			...model,
			CODIGO: typeof model?.CODIGO === 'string' ? model.CODIGO.trim() : model?.CODIGO,
			NOMBRE: typeof model?.NOMBRE === 'string' ? model.NOMBRE.trim() : model?.NOMBRE,
			DESCRIPCION: desc === '' ? null : desc,
			FECHA_VIGENCIA_INI: model?.FECHA_VIGENCIA_INI || null,
			FECHA_VIGENCIA_FIN: model?.FECHA_VIGENCIA_FIN || null,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_VERSION) {
			xWhere.push({ Parameter: 'CORR_VERSION', Value: param.CORR_VERSION });
		}
		return xWhere;
	}
}
