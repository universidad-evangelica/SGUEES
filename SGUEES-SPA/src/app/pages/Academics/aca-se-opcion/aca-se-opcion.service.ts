// Qué hace: servicio de negocio del catálogo opciones socioeconómico.
// Cómo lo hace: valida, CRUD, columnas/formulario y GetLookUp de pregunta (patrón sc-descriptor).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { environment } from 'src/environments/environment';
import { AcaSeOpcion, AcaSePreguntaLookup } from './models/aca-se-opcion';
import { AcaSeOpcionRepository } from './aca-se-opcion.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSeOpcionService {
	constructor(
		private repo: AcaSeOpcionRepository,
		private appInfoService: AppInfoService
	) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige pregunta, código (máx 50), texto (máx 300) y orden >= 0.
	esValido(model: AcaSeOpcion, msg: Function): boolean {
		if (!model.CORR_PREGUNTA || model.CORR_PREGUNTA <= 0) {
			msg('Debe seleccionar la pregunta.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO || model.CODIGO.trim() === '') {
			msg('Debe ingresar el código de la opción.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO.trim().length > 50) {
			msg('El código no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.TEXTO || model.TEXTO.trim() === '') {
			msg('Debe ingresar el texto de la opción.', NotifyType.Warning);
			return false;
		}
		if (model.TEXTO.trim().length > 300) {
			msg('El texto no puede superar 300 caracteres.', NotifyType.Warning);
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
		return this.repo.get([{ Parameter: 'CORR_OPCION', Value: param.CORR_OPCION }]);
	}

	// Qué hace: trae preguntas activas para el select.
	// Cómo lo hace: getLookUp(ACA_SE_OPCION, ACA_SE_PREGUNTA, GetCORR_PREGUNTA).
	getCORR_PREGUNTA(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_OPCION',
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
			{ Parameter: 'CORR_OPCION', Value: model.CORR_OPCION },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_OPCION', Value: model.CORR_OPCION }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_OPCION', Value: model.CORR_OPCION }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_OPCION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_PREGUNTA', caption: 'Cód. pregunta', width: 140 },
			{ dataField: 'ENUNCIADO_PREGUNTA', caption: 'Pregunta', width: 280, minWidth: 200 },
			{ dataField: 'CODIGO', caption: 'Código', width: 120 },
			{ dataField: 'TEXTO', caption: 'Texto', width: 300, minWidth: 200 },
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
					column: 'CORR_OPCION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: { preguntas?: AcaSePreguntaLookup[] }): any {
		const preguntas = options?.preguntas ?? [];
		return [
			{ dataField: 'CORR_OPCION', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
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
				dataField: 'CODIGO',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'TEXTO',
				label: { text: 'Texto' },
				colSpan: 4,
				editorOptions: { placeholder: 'Texto de la opción...', showClearButton: true, maxLength: 300 },
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
			CORR_OPCION: model?.CORR_OPCION,
			CORR_PREGUNTA: model?.CORR_PREGUNTA,
			CODIGO: typeof model?.CODIGO === 'string' ? model.CODIGO.trim() : model?.CODIGO,
			TEXTO: typeof model?.TEXTO === 'string' ? model.TEXTO.trim() : model?.TEXTO,
			ORDEN: Number(model?.ORDEN ?? 0),
			ACTIVO: model?.ACTIVO,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_OPCION) {
			xWhere.push({ Parameter: 'CORR_OPCION', Value: param.CORR_OPCION });
		}
		if (param.CORR_PREGUNTA) {
			xWhere.push({ Parameter: 'CORR_PREGUNTA', Value: param.CORR_PREGUNTA });
		}
		return xWhere;
	}
}
