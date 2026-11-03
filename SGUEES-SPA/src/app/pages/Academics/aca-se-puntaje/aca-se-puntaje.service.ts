// Qué hace: servicio de negocio del catálogo puntajes socioeconómico.
// Cómo lo hace: valida, CRUD, columnas/formulario y lookups pregunta/opción (patrón aca-se-version-pregunta).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { environment } from 'src/environments/environment';
import { AcaSeOpcionLookup, AcaSePreguntaLookup, AcaSePuntaje } from './models/aca-se-puntaje';
import { AcaSePuntajeRepository } from './aca-se-puntaje.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSePuntajeService {
	constructor(
		private repo: AcaSePuntajeRepository,
		private appInfoService: AppInfoService
	) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige pregunta, fecha inicio y porcentaje 0–100.
	esValido(model: AcaSePuntaje, msg: Function): boolean {
		if (!model.CORR_PREGUNTA || model.CORR_PREGUNTA <= 0) {
			msg('Debe seleccionar la pregunta.', NotifyType.Warning);
			return false;
		}
		if (!model.FECHA_INICIO) {
			msg('Debe ingresar la fecha de inicio.', NotifyType.Warning);
			return false;
		}
		const porcentaje = Number(model.PORCENTAJE);
		if (model.PORCENTAJE === null || model.PORCENTAJE === undefined || isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
			msg('El porcentaje debe estar entre 0 y 100.', NotifyType.Warning);
			return false;
		}
		if (model.FECHA_INICIO && model.FECHA_FIN) {
			const ini = new Date(model.FECHA_INICIO);
			const fin = new Date(model.FECHA_FIN);
			if (!isNaN(ini.getTime()) && !isNaN(fin.getTime()) && fin < ini) {
				msg('La fecha fin no puede ser menor que la de inicio.', NotifyType.Warning);
				return false;
			}
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_PUNTAJE', Value: param.CORR_PUNTAJE }]);
	}

	// Qué hace: trae preguntas activas para el select.
	// Cómo lo hace: getLookUp(ACA_SE_PUNTAJE, ACA_SE_PREGUNTA, GetCORR_PREGUNTA).
	getCORR_PREGUNTA(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_PUNTAJE',
			'ACA_SE_PREGUNTA',
			'GetCORR_PREGUNTA',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	// Qué hace: trae opciones activas para el select.
	// Cómo lo hace: getLookUp(ACA_SE_PUNTAJE, ACA_SE_OPCION, GetCORR_OPCION).
	getCORR_OPCION(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_PUNTAJE',
			'ACA_SE_OPCION',
			'GetCORR_OPCION',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model), [
			{ Parameter: 'CORR_PUNTAJE', Value: model.CORR_PUNTAJE },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PUNTAJE', Value: model.CORR_PUNTAJE }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_PUNTAJE', Value: model.CORR_PUNTAJE }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_PUNTAJE',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_PREGUNTA', caption: 'Cód. pregunta', width: 140 },
			{ dataField: 'ENUNCIADO_PREGUNTA', caption: 'Pregunta', width: 280, minWidth: 200 },
			{ dataField: 'CODIGO_OPCION', caption: 'Cód. opción', width: 120 },
			{ dataField: 'TEXTO_OPCION', caption: 'Opción', width: 260, minWidth: 180 },
			{
				dataField: 'PUNTAJE',
				caption: 'Puntaje',
				width: 100,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'PORCENTAJE',
				caption: 'Porcentaje',
				width: 110,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'FECHA_INICIO',
				caption: 'Fecha inicio',
				width: 130,
				dataType: 'date',
				format: 'dd/MM/yyyy',
			},
			{
				dataField: 'FECHA_FIN',
				caption: 'Fecha fin',
				width: 130,
				dataType: 'date',
				format: 'dd/MM/yyyy',
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_PUNTAJE',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: {
		preguntas?: AcaSePreguntaLookup[];
		opciones?: AcaSeOpcionLookup[];
		corrPregunta?: number;
	}): any {
		const preguntas = options?.preguntas ?? [];
		const corrPregunta = Number(options?.corrPregunta ?? 0);
		const opciones = (options?.opciones ?? []).filter(
			(o) => !corrPregunta || Number(o.CORR_PREGUNTA) === corrPregunta
		);
		return [
			{ dataField: 'CORR_PUNTAJE', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_PREGUNTA',
				label: { text: 'Pregunta' },
				editorType: 'dxSelectBox',
				colSpan: 4,
				editorOptions: {
					dataSource: preguntas,
					valueExpr: 'CORR_PREGUNTA',
					displayExpr: (item: AcaSePreguntaLookup) =>
						item ? `${item.CODIGO ?? ''} - ${item.ENUNCIADO ?? ''}`.trim() : '',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Pregunta...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_OPCION',
				label: { text: 'Opción' },
				editorType: 'dxSelectBox',
				colSpan: 4,
				editorOptions: {
					dataSource: opciones,
					valueExpr: 'CORR_OPCION',
					displayExpr: (item: AcaSeOpcionLookup) =>
						item ? `${item.CODIGO ?? ''} - ${item.TEXTO ?? ''}`.trim() : '',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Opción (opcional)...',
				},
			},
			{
				dataField: 'PUNTAJE',
				label: { text: 'Puntaje' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { showSpinButtons: true, format: '#,##0.00' },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'PORCENTAJE',
				label: { text: 'Porcentaje' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 0, max: 100, showSpinButtons: true, format: '#,##0.00' },
				validationRules: [
					{ type: 'required', message: 'Este campo es obligatorio' },
					{
						type: 'range',
						min: 0,
						max: 100,
						message: 'El porcentaje debe estar entre 0 y 100',
					},
				],
			},
			{
				dataField: 'FECHA_INICIO',
				label: { text: 'Fecha inicio' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy', showClearButton: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'FECHA_FIN',
				label: { text: 'Fecha fin' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy', showClearButton: true },
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private normalizarPayload(model: any): any {
		const corrOpcion = Number(model?.CORR_OPCION ?? 0);
		return {
			CORR_PUNTAJE: model?.CORR_PUNTAJE,
			CORR_PREGUNTA: model?.CORR_PREGUNTA,
			CORR_OPCION: corrOpcion > 0 ? corrOpcion : null,
			PUNTAJE: Number(model?.PUNTAJE ?? 0),
			PORCENTAJE: Number(model?.PORCENTAJE ?? 0),
			FECHA_INICIO: model?.FECHA_INICIO || null,
			FECHA_FIN: model?.FECHA_FIN || null,
			ACTIVO: model?.ACTIVO,
			CORR_EMPRESA: Number(model?.CORR_EMPRESA ?? 0) > 0 ? Number(model.CORR_EMPRESA) : 1,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_PUNTAJE) {
			xWhere.push({ Parameter: 'CORR_PUNTAJE', Value: param.CORR_PUNTAJE });
		}
		if (param.CORR_PREGUNTA) {
			xWhere.push({ Parameter: 'CORR_PREGUNTA', Value: param.CORR_PREGUNTA });
		}
		return xWhere;
	}
}
