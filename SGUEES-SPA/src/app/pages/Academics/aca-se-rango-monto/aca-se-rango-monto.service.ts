// Qué hace: servicio de negocio del catálogo rangos de monto SE.
// Cómo lo hace: valida, CRUD, columnas/formulario y GetLookUp versión + sección RANGO_MONTO.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { environment } from 'src/environments/environment';
import {
	AcaSeRangoMonto,
	AcaSeSeccionRangoLookup,
	AcaSeVersionLookup,
} from './models/aca-se-rango-monto';
import { AcaSeRangoMontoRepository } from './aca-se-rango-monto.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSeRangoMontoService {
	constructor(
		private repo: AcaSeRangoMontoRepository,
		private appInfoService: AppInfoService
	) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige versión, sección RANGO_MONTO, descripción, puntaje ≤ % sección y rangos coherentes.
	esValido(
		model: AcaSeRangoMonto,
		msg: Function,
		ctx?: { secciones?: AcaSeSeccionRangoLookup[] }
	): boolean {
		if (!model.CORR_VERSION || model.CORR_VERSION <= 0) {
			msg('Debe seleccionar la versión.', NotifyType.Warning);
			return false;
		}
		if (!model.CORR_SECCION_SE || model.CORR_SECCION_SE <= 0) {
			msg('Debe seleccionar la sección (solo tipo rango).', NotifyType.Warning);
			return false;
		}
		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripción.', NotifyType.Warning);
			return false;
		}
		if (model.DESCRIPCION.trim().length > 300) {
			msg('La descripción no puede superar 300 caracteres.', NotifyType.Warning);
			return false;
		}
		if (model.PUNTAJE === null || model.PUNTAJE === undefined || Number.isNaN(Number(model.PUNTAJE))) {
			msg('Debe ingresar el puntaje.', NotifyType.Warning);
			return false;
		}
		const seccion = (ctx?.secciones ?? []).find((s) => Number(s.CORR_SECCION_SE) === Number(model.CORR_SECCION_SE));
		const tope = Number(seccion?.PORCENTAJE_MAXIMO);
		if (seccion && !Number.isNaN(tope) && Number(model.PUNTAJE) > tope + 0.0001) {
			msg(
				`El puntaje del rango (${Number(model.PUNTAJE)}) supera el % máximo de la sección (${tope}).`,
				NotifyType.Warning
			);
			return false;
		}
		if (model.RANGO_INICIAL === null || model.RANGO_INICIAL === undefined || Number.isNaN(Number(model.RANGO_INICIAL))) {
			msg('Debe ingresar el rango inicial.', NotifyType.Warning);
			return false;
		}
		if (model.RANGO_FINAL === null || model.RANGO_FINAL === undefined || Number.isNaN(Number(model.RANGO_FINAL))) {
			msg('Debe ingresar el rango final.', NotifyType.Warning);
			return false;
		}
		if (Number(model.RANGO_INICIAL) > Number(model.RANGO_FINAL)) {
			msg('El rango inicial no puede ser mayor que el rango final.', NotifyType.Warning);
			return false;
		}
		if (model.ORDEN === null || model.ORDEN === undefined || Number(model.ORDEN) < 0) {
			msg('Debe ingresar un orden válido (0 o mayor).', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_RANGO_MONTO', Value: param.CORR_RANGO_MONTO }]);
	}

	// Qué hace: trae versiones activas para el select.
	// Cómo lo hace: getLookUp(ACA_SE_RANGO_MONTO, ACA_SE_VERSION, GetCORR_VERSION).
	getCORR_VERSION(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_RANGO_MONTO',
			'ACA_SE_VERSION',
			'GetCORR_VERSION',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	// Qué hace: trae secciones solo RANGO_MONTO para el select.
	// Cómo lo hace: getLookUp(ACA_SE_RANGO_MONTO, ACA_SE_SECCION, GetCORR_SECCION_SE).
	getCORR_SECCION_SE(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_RANGO_MONTO',
			'ACA_SE_SECCION',
			'GetCORR_SECCION_SE',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model), [
			{ Parameter: 'CORR_RANGO_MONTO', Value: model.CORR_RANGO_MONTO },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_RANGO_MONTO', Value: model.CORR_RANGO_MONTO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_RANGO_MONTO', Value: model.CORR_RANGO_MONTO }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_RANGO_MONTO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_VERSION', caption: 'Versión', width: 100 },
			{ dataField: 'CODIGO_SECCION', caption: 'Cód. sección', width: 140 },
			{ dataField: 'NOMBRE_SECCION', caption: 'Sección', width: 180, minWidth: 140 },
			{ dataField: 'DESCRIPCION', caption: 'Descripción', width: 280, minWidth: 200 },
			{
				dataField: 'PUNTAJE',
				caption: 'Puntaje',
				width: 110,
				dataType: 'number',
				format: '#0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'RANGO_INICIAL',
				caption: 'Rango inicial',
				width: 140,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'RANGO_FINAL',
				caption: 'Rango final',
				width: 140,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'ORDEN',
				caption: 'Orden',
				width: 90,
				dataType: 'number',
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
					column: 'CORR_RANGO_MONTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: {
		versiones?: AcaSeVersionLookup[];
		secciones?: AcaSeSeccionRangoLookup[];
		onVersionChanged?: (corrVersion: number) => void;
	}): any {
		const versiones = options?.versiones ?? [];
		const secciones = options?.secciones ?? [];
		const onVersionChanged = options?.onVersionChanged;

		return [
			{ dataField: 'CORR_RANGO_MONTO', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_VERSION',
				label: { text: 'Versión' },
				editorType: 'dxSelectBox',
				colSpan: 2,
				editorOptions: {
					dataSource: versiones,
					valueExpr: 'CORR_VERSION',
					displayExpr: (item: AcaSeVersionLookup) =>
						item ? `${item.CODIGO ?? ''} - ${item.NOMBRE ?? ''}`.trim() : '',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Versión...',
					onValueChanged: (e: any) => {
						if (typeof onVersionChanged === 'function') {
							onVersionChanged(Number(e?.value ?? 0));
						}
					},
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_SECCION_SE',
				label: { text: 'Sección (solo rango)' },
				editorType: 'dxSelectBox',
				colSpan: 4,
				editorOptions: {
					dataSource: secciones,
					valueExpr: 'CORR_SECCION_SE',
					displayExpr: (item: AcaSeSeccionRangoLookup) =>
						item ? `${item.CODIGO ?? ''} - ${item.NOMBRE_SECCION ?? ''}`.trim() : '',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Sección RANGO_MONTO...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripción' },
				colSpan: 4,
				editorOptions: { placeholder: 'Descripción del rango...', showClearButton: true, maxLength: 300 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'PUNTAJE',
				label: { text: 'Puntaje' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				helpText: 'No puede superar el % máximo de la sección RANGO_MONTO.',
				editorOptions: { min: 0, showSpinButtons: true, format: '#0.00' },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'RANGO_INICIAL',
				label: { text: 'Rango inicial' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { showSpinButtons: true, format: '#,##0.00' },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'RANGO_FINAL',
				label: { text: 'Rango final' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { showSpinButtons: true, format: '#,##0.00' },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'ORDEN',
				label: { text: 'Orden' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 0, showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private normalizarPayload(model: any): any {
		return {
			CORR_RANGO_MONTO: model?.CORR_RANGO_MONTO,
			CORR_VERSION: Number(model?.CORR_VERSION ?? 0),
			CORR_SECCION_SE: Number(model?.CORR_SECCION_SE ?? 0),
			DESCRIPCION: typeof model?.DESCRIPCION === 'string' ? model.DESCRIPCION.trim() : model?.DESCRIPCION,
			PUNTAJE: Number(model?.PUNTAJE ?? 0),
			RANGO_INICIAL: Number(model?.RANGO_INICIAL ?? 0),
			RANGO_FINAL: Number(model?.RANGO_FINAL ?? 0),
			ORDEN: Number(model?.ORDEN ?? 0),
			ACTIVO: model?.ACTIVO,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_RANGO_MONTO) {
			xWhere.push({ Parameter: 'CORR_RANGO_MONTO', Value: param.CORR_RANGO_MONTO });
		}
		if (param.CORR_VERSION) {
			xWhere.push({ Parameter: 'CORR_VERSION', Value: param.CORR_VERSION });
		}
		if (param.CORR_SECCION_SE) {
			xWhere.push({ Parameter: 'CORR_SECCION_SE', Value: param.CORR_SECCION_SE });
		}
		return xWhere;
	}
}
