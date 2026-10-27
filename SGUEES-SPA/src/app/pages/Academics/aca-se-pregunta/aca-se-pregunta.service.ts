// Qué hace: servicio de negocio del catálogo preguntas socioeconómico.
// Cómo lo hace: valida, ejecuta CRUD, arma columnas/formulario y GetLookUp de tipos (patrón sc-descriptor).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { environment } from 'src/environments/environment';
import { AcaSePregunta, AcaSeTipoPreguntaLookup } from './models/aca-se-pregunta';
import { AcaSePreguntaRepository } from './aca-se-pregunta.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSePreguntaService {
	constructor(
		private repo: AcaSePreguntaRepository,
		private appInfoService: AppInfoService
	) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige tipo, código (máx 50) y enunciado (máx 500); ayuda máx 500.
	esValido(model: AcaSePregunta, msg: Function): boolean {
		if (!model.CORR_TIPO_PREGUNTA || model.CORR_TIPO_PREGUNTA <= 0) {
			msg('Debe seleccionar el tipo de pregunta.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO || model.CODIGO.trim() === '') {
			msg('Debe ingresar el código de la pregunta.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO.trim().length > 50) {
			msg('El código no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.ENUNCIADO || model.ENUNCIADO.trim() === '') {
			msg('Debe ingresar el enunciado de la pregunta.', NotifyType.Warning);
			return false;
		}
		if (model.ENUNCIADO.trim().length > 500) {
			msg('El enunciado no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}
		if (model.AYUDA && model.AYUDA.trim().length > 500) {
			msg('La ayuda no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_PREGUNTA', Value: param.CORR_PREGUNTA }]);
	}

	// Qué hace: trae tipos de pregunta activos para el select.
	// Cómo lo hace: getLookUp(ACA_SE_PREGUNTA, GEN_SE_TIPO_PREGUNTA, GetCORR_TIPO_PREGUNTA).
	getCORR_TIPO_PREGUNTA(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_PREGUNTA',
			'GEN_SE_TIPO_PREGUNTA',
			'GetCORR_TIPO_PREGUNTA',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model), [
			{ Parameter: 'CORR_PREGUNTA', Value: model.CORR_PREGUNTA },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PREGUNTA', Value: model.CORR_PREGUNTA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_PREGUNTA', Value: model.CORR_PREGUNTA }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_PREGUNTA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO', caption: 'Código', width: 160 },
			{ dataField: 'ENUNCIADO', caption: 'Enunciado', width: 320, minWidth: 220 },
			{ dataField: 'NOMBRE_TIPO_PREGUNTA', caption: 'Tipo', width: 160 },
			{ dataField: 'AYUDA', caption: 'Ayuda', width: 220, minWidth: 160 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_PREGUNTA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: { tipos?: AcaSeTipoPreguntaLookup[] }): any {
		const tipos = options?.tipos ?? [];
		return [
			{ dataField: 'CORR_PREGUNTA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_TIPO_PREGUNTA',
				label: { text: 'Tipo de pregunta' },
				editorType: 'dxSelectBox',
				colSpan: 4,
				editorOptions: {
					dataSource: tipos,
					valueExpr: 'CORR_TIPO_PREGUNTA',
					displayExpr: 'NOMBRE',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Tipo...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'ENUNCIADO',
				label: { text: 'Enunciado' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Enunciado de la pregunta...', maxLength: 500, height: 80 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'AYUDA',
				label: { text: 'Ayuda' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Texto de ayuda (opcional)...', maxLength: 500, height: 70 },
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private normalizarPayload(model: any): any {
		const ayuda = typeof model?.AYUDA === 'string' ? model.AYUDA.trim() : model?.AYUDA;
		return {
			CORR_PREGUNTA: model?.CORR_PREGUNTA,
			CORR_TIPO_PREGUNTA: model?.CORR_TIPO_PREGUNTA,
			CODIGO: typeof model?.CODIGO === 'string' ? model.CODIGO.trim() : model?.CODIGO,
			ENUNCIADO: typeof model?.ENUNCIADO === 'string' ? model.ENUNCIADO.trim() : model?.ENUNCIADO,
			AYUDA: ayuda === '' ? null : ayuda,
			ACTIVO: model?.ACTIVO,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_PREGUNTA) {
			xWhere.push({ Parameter: 'CORR_PREGUNTA', Value: param.CORR_PREGUNTA });
		}
		return xWhere;
	}
}
