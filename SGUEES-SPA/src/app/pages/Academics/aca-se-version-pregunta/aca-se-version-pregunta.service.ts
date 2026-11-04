// Qué hace: servicio de negocio de preguntas por versión socioeconómico.
// Cómo lo hace: valida, CRUD, columnas/formulario y GetLookUp de versión/pregunta (patrón sc-descriptor).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { environment } from 'src/environments/environment';
import { AcaSePreguntaLookup, AcaSeVersionLookup, AcaSeVersionPregunta } from './models/aca-se-version-pregunta';
import { AcaSeVersionPreguntaRepository } from './aca-se-version-pregunta.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSeVersionPreguntaService {
	constructor(
		private repo: AcaSeVersionPreguntaRepository,
		private appInfoService: AppInfoService
	) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige versión, pregunta y orden >= 0.
	esValido(model: AcaSeVersionPregunta, msg: Function): boolean {
		if (!model.CORR_VERSION || model.CORR_VERSION <= 0) {
			msg('Debe seleccionar la versión.', NotifyType.Warning);
			return false;
		}
		if (!model.CORR_PREGUNTA || model.CORR_PREGUNTA <= 0) {
			msg('Debe seleccionar la pregunta.', NotifyType.Warning);
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
		return this.repo.get([{ Parameter: 'CORR_VERSION_PREGUNTA', Value: param.CORR_VERSION_PREGUNTA }]);
	}

	// Qué hace: trae versiones para el select.
	// Cómo lo hace: getLookUp(ACA_SE_VERSION_PREGUNTA, ACA_SE_VERSION, GetCORR_VERSION).
	getCORR_VERSION(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_VERSION_PREGUNTA',
			'ACA_SE_VERSION',
			'GetCORR_VERSION',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	// Qué hace: trae preguntas activas para el select.
	// Cómo lo hace: getLookUp(ACA_SE_VERSION_PREGUNTA, ACA_SE_PREGUNTA, GetCORR_PREGUNTA).
	getCORR_PREGUNTA(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_VERSION_PREGUNTA',
			'ACA_SE_PREGUNTA',
			'GetCORR_PREGUNTA',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model), [
			{ Parameter: 'CORR_VERSION_PREGUNTA', Value: model.CORR_VERSION_PREGUNTA },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_VERSION_PREGUNTA', Value: model.CORR_VERSION_PREGUNTA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_VERSION_PREGUNTA', Value: model.CORR_VERSION_PREGUNTA },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_VERSION_PREGUNTA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_VERSION', caption: 'Cód. versión', width: 120 },
			{ dataField: 'NOMBRE_VERSION', caption: 'Versión', width: 220, minWidth: 160 },
			{ dataField: 'CODIGO_PREGUNTA', caption: 'Cód. pregunta', width: 140 },
			{ dataField: 'ENUNCIADO_PREGUNTA', caption: 'Pregunta', width: 300, minWidth: 200 },
			{
				dataField: 'ORDEN',
				caption: 'Orden',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'ES_REQUERIDO',
				caption: 'Requerido',
				width: 110,
				dataType: 'boolean',
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_VERSION_PREGUNTA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: { versiones?: AcaSeVersionLookup[]; preguntas?: AcaSePreguntaLookup[] }): any {
		const versiones = options?.versiones ?? [];
		const preguntas = options?.preguntas ?? [];
		return [
			{ dataField: 'CORR_VERSION_PREGUNTA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_VERSION',
				label: { text: 'Versión' },
				editorType: 'dxSelectBox',
				colSpan: 3,
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
				dataField: 'CORR_PREGUNTA',
				label: { text: 'Pregunta' },
				editorType: 'dxSelectBox',
				colSpan: 3,
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
				dataField: 'ORDEN',
				label: { text: 'Orden' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 0, showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ES_REQUERIDO', label: { text: 'Requerido' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private normalizarPayload(model: any): any {
		return {
			CORR_VERSION_PREGUNTA: model?.CORR_VERSION_PREGUNTA,
			CORR_VERSION: model?.CORR_VERSION,
			CORR_PREGUNTA: model?.CORR_PREGUNTA,
			ORDEN: Number(model?.ORDEN ?? 0),
			ES_REQUERIDO: !!model?.ES_REQUERIDO,
			ACTIVO: model?.ACTIVO,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_VERSION_PREGUNTA) {
			xWhere.push({ Parameter: 'CORR_VERSION_PREGUNTA', Value: param.CORR_VERSION_PREGUNTA });
		}
		if (param.CORR_VERSION) {
			xWhere.push({ Parameter: 'CORR_VERSION', Value: param.CORR_VERSION });
		}
		return xWhere;
	}
}
