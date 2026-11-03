// Qué hace: servicio de negocio del catálogo secciones socioeconómico.
// Cómo lo hace: valida, CRUD, columnas/formulario y lookup de versión (patrón aca-se-version-pregunta).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { environment } from 'src/environments/environment';
import { AcaSeSeccion, AcaSeVersionLookup } from './models/aca-se-seccion';
import { AcaSeSeccionRepository } from './aca-se-seccion.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSeSeccionService {
	constructor(
		private repo: AcaSeSeccionRepository,
		private appInfoService: AppInfoService
	) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige versión, nombre, orden >= 0 y porcentaje null o 0–100.
	esValido(model: AcaSeSeccion, msg: Function): boolean {
		if (!model.CORR_VERSION || model.CORR_VERSION <= 0) {
			msg('Debe seleccionar la versión.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_SECCION || model.NOMBRE_SECCION.trim() === '') {
			msg('Debe ingresar el nombre de la sección.', NotifyType.Warning);
			return false;
		}
		if (model.ORDEN === null || model.ORDEN === undefined || Number(model.ORDEN) < 0) {
			msg('Debe ingresar un orden válido (0 o mayor).', NotifyType.Warning);
			return false;
		}
		if (
			model.PORCENTAJE_SECCION !== null &&
			model.PORCENTAJE_SECCION !== undefined &&
			`${model.PORCENTAJE_SECCION}` !== ''
		) {
			const porcentaje = Number(model.PORCENTAJE_SECCION);
			if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
				msg('El porcentaje de sección debe estar entre 0 y 100.', NotifyType.Warning);
				return false;
			}
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_SECCION_SE', Value: param.CORR_SECCION_SE }]);
	}

	// Qué hace: trae versiones para el select.
	// Cómo lo hace: getLookUp(ACA_SE_SECCION, ACA_SE_VERSION, GetCORR_VERSION).
	getCORR_VERSION(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_SECCION',
			'ACA_SE_VERSION',
			'GetCORR_VERSION',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model), [
			{ Parameter: 'CORR_SECCION_SE', Value: model.CORR_SECCION_SE },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_SECCION_SE', Value: model.CORR_SECCION_SE }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_SECCION_SE', Value: model.CORR_SECCION_SE },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_SECCION_SE',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_VERSION', caption: 'Cód. versión', width: 120 },
			{ dataField: 'NOMBRE_VERSION', caption: 'Versión', width: 220, minWidth: 160 },
			{ dataField: 'NOMBRE_SECCION', caption: 'Sección', width: 240, minWidth: 180 },
			{ dataField: 'DESCRIPCION', caption: 'Descripción', width: 280, minWidth: 200 },
			{
				dataField: 'ORDEN',
				caption: 'Orden',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'PUNTAJE_MAXIMO',
				caption: 'Puntaje máx.',
				width: 120,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'PORCENTAJE_SECCION',
				caption: '% sección',
				width: 110,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_SECCION_SE',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Qué hace: define el formulario de sección (fila 1: corr/versión; fila 2: nombre y descripción anchos).
	// Cómo lo hace: colCount 8 — Corr(2)+Versión(6); Nombre(4)+Descripción(4); resto en fila 3.
	getItems(options?: { versiones?: AcaSeVersionLookup[] }): any {
		const versiones = options?.versiones ?? [];
		return [
			{ dataField: 'CORR_SECCION_SE', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_VERSION',
				label: { text: 'Versión' },
				editorType: 'dxSelectBox',
				colSpan: 6,
				editorOptions: {
					dataSource: versiones,
					valueExpr: 'CORR_VERSION',
					displayExpr: (item: AcaSeVersionLookup) =>
						item ? `${item.CODIGO ?? ''} - ${item.NOMBRE ?? ''}`.trim() : '',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Versión...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_SECCION',
				label: { text: 'Nombre sección' },
				colSpan: 4,
				editorOptions: {
					placeholder: 'Nombre de la sección...',
					showClearButton: true,
					maxLength: 200,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripción' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Descripción...', maxLength: 1000, height: 80, autoResizeEnabled: true },
			},
			{
				dataField: 'ORDEN',
				label: { text: 'Orden' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 0, showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'PUNTAJE_MAXIMO',
				label: { text: 'Puntaje máximo' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0.00', showSpinButtons: true, showClearButton: true },
			},
			{
				dataField: 'PORCENTAJE_SECCION',
				label: { text: '% sección' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: {
					format: '#,##0.00',
					min: 0,
					max: 100,
					showSpinButtons: true,
					showClearButton: true,
				},
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private normalizarPayload(model: any): any {
		const desc = typeof model?.DESCRIPCION === 'string' ? model.DESCRIPCION.trim() : model?.DESCRIPCION;
		const puntaje =
			model?.PUNTAJE_MAXIMO === null ||
			model?.PUNTAJE_MAXIMO === undefined ||
			`${model?.PUNTAJE_MAXIMO}` === ''
				? null
				: Number(model.PUNTAJE_MAXIMO);
		const porcentaje =
			model?.PORCENTAJE_SECCION === null ||
			model?.PORCENTAJE_SECCION === undefined ||
			`${model?.PORCENTAJE_SECCION}` === ''
				? null
				: Number(model.PORCENTAJE_SECCION);

		return {
			CORR_SECCION_SE: model?.CORR_SECCION_SE ?? 0,
			CORR_VERSION: Number(model?.CORR_VERSION ?? 0),
			NOMBRE_SECCION:
				typeof model?.NOMBRE_SECCION === 'string' ? model.NOMBRE_SECCION.trim() : model?.NOMBRE_SECCION,
			DESCRIPCION: desc && `${desc}`.trim() !== '' ? desc : null,
			ORDEN: Number(model?.ORDEN ?? 0),
			PUNTAJE_MAXIMO: puntaje !== null && !isNaN(puntaje) ? puntaje : null,
			PORCENTAJE_SECCION: porcentaje !== null && !isNaN(porcentaje) ? porcentaje : null,
			ACTIVO: model?.ACTIVO,
			CORR_EMPRESA: model?.CORR_EMPRESA ?? 1,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_SECCION_SE) {
			xWhere.push({ Parameter: 'CORR_SECCION_SE', Value: param.CORR_SECCION_SE });
		}
		if (param.CORR_VERSION) {
			xWhere.push({ Parameter: 'CORR_VERSION', Value: param.CORR_VERSION });
		}
		return xWhere;
	}
}
