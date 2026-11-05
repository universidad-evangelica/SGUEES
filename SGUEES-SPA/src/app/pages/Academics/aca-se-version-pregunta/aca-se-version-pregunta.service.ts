// Qué hace: servicio de negocio de preguntas por versión socioeconómico.
// Cómo lo hace: valida, CRUD, columnas/formulario y lookups (versión/sección/pregunta/rol monto).
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
	AcaSePreguntaAsocLookup,
	AcaSePreguntaLookup,
	AcaSeRolMontoLookup,
	AcaSeSeccionLookup,
	AcaSeVersionLookup,
	AcaSeVersionPregunta,
} from './models/aca-se-version-pregunta';
import { AcaSeVersionPreguntaRepository } from './aca-se-version-pregunta.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSeVersionPreguntaService {
	constructor(
		private repo: AcaSeVersionPreguntaRepository,
		private appInfoService: AppInfoService
	) {}

	// Qué hace: valida el formulario; si MONTO+RANGO_MONTO exige rol; si LIQUIDO exige bruto+descuento.
	esValido(
		model: AcaSeVersionPregunta,
		msg: Function,
		ctx?: { mostrarRolMonto?: boolean }
	): boolean {
		if (!model.CORR_VERSION || model.CORR_VERSION <= 0) {
			msg('Debe seleccionar la versión.', NotifyType.Warning);
			return false;
		}
		if (!model.CORR_SECCION_SE || model.CORR_SECCION_SE <= 0) {
			msg('Debe seleccionar la sección.', NotifyType.Warning);
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
		if (model.PUNTAJE === null || model.PUNTAJE === undefined || Number.isNaN(Number(model.PUNTAJE)) || Number(model.PUNTAJE) < 0) {
			msg('El puntaje debe ser 0 o mayor.', NotifyType.Warning);
			return false;
		}
		if (ctx?.mostrarRolMonto) {
			if (!model.ROL_MONTO || String(model.ROL_MONTO).trim() === '') {
				msg('Debe seleccionar el rol de monto (Bruto, Descuento, Líquido o Monto).', NotifyType.Warning);
				return false;
			}
			if (String(model.ROL_MONTO).trim().toUpperCase() === 'LIQUIDO') {
				const bruto = Number(model.CORR_PREGUNTA_BRUTO ?? 0);
				const desc = Number(model.CORR_PREGUNTA_DESCUENTO ?? 0);
				if (!bruto || !desc) {
					msg('Si el rol es Líquido debe asociar la pregunta Bruto y la pregunta Descuento.', NotifyType.Warning);
					return false;
				}
				if (bruto === desc) {
					msg('La pregunta Bruto y Descuento deben ser distintas.', NotifyType.Warning);
					return false;
				}
				if (bruto === model.CORR_PREGUNTA || desc === model.CORR_PREGUNTA) {
					msg('Un líquido no puede asociarse a sí mismo.', NotifyType.Warning);
					return false;
				}
			}
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_VERSION_PREGUNTA', Value: param.CORR_VERSION_PREGUNTA }]);
	}

	getCORR_VERSION(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_VERSION_PREGUNTA',
			'ACA_SE_VERSION',
			'GetCORR_VERSION',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	getCORR_SECCION_SE(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_VERSION_PREGUNTA',
			'ACA_SE_SECCION',
			'GetCORR_SECCION_SE',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	getCORR_PREGUNTA(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_VERSION_PREGUNTA',
			'ACA_SE_PREGUNTA',
			'GetCORR_PREGUNTA',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	// Qué hace: trae roles de monto (CHECK ROL_MONTO en VERSION_PREGUNTA).
	getROL_MONTO(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_VERSION_PREGUNTA',
			'GEN_LISTA',
			'GetROL_MONTO',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	insert(model: any, mostrarRolMonto: boolean): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model, mostrarRolMonto));
	}

	update(model: any, mostrarRolMonto: boolean): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model, mostrarRolMonto), [
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
			{ dataField: 'NOMBRE_VERSION', caption: 'Versión', width: 200, minWidth: 140 },
			{ dataField: 'CODIGO_SECCION', caption: 'Cód. sección', width: 130 },
			{ dataField: 'NOMBRE_SECCION', caption: 'Sección', width: 200, minWidth: 140 },
			{ dataField: 'TIPO_EVALUACION', caption: 'Tipo eval.', width: 120 },
			{ dataField: 'CODIGO_PREGUNTA', caption: 'Cód. pregunta', width: 140 },
			{ dataField: 'ENUNCIADO_PREGUNTA', caption: 'Pregunta', width: 280, minWidth: 180 },
			{ dataField: 'CODIGO_TIPO_PREGUNTA', caption: 'Tipo', width: 130 },
			{ dataField: 'NOMBRE_ROL_MONTO', caption: 'Rol monto', width: 120 },
			{ dataField: 'CODIGO_PREGUNTA_BRUTO', caption: 'Bruto asoc.', width: 140 },
			{ dataField: 'CODIGO_PREGUNTA_DESCUENTO', caption: 'Desc. asoc.', width: 140 },
			{
				dataField: 'ORDEN',
				caption: 'Orden',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'PUNTAJE',
				caption: 'Puntaje',
				width: 110,
				dataType: 'number',
				format: '#0.00',
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

	getItems(options?: {
		versiones?: AcaSeVersionLookup[];
		secciones?: AcaSeSeccionLookup[];
		preguntas?: AcaSePreguntaLookup[];
		rolesMonto?: AcaSeRolMontoLookup[];
		preguntasBruto?: AcaSePreguntaAsocLookup[];
		preguntasDescuento?: AcaSePreguntaAsocLookup[];
		permitePuntaje?: boolean;
		mostrarRolMonto?: boolean;
		mostrarAsocLiquido?: boolean;
		helpTextPuntaje?: string;
		hintPuntaje?: string;
	}): any {
		const versiones = options?.versiones ?? [];
		const secciones = options?.secciones ?? [];
		const preguntas = options?.preguntas ?? [];
		const rolesMonto = options?.rolesMonto ?? [];
		const preguntasBruto = options?.preguntasBruto ?? [];
		const preguntasDescuento = options?.preguntasDescuento ?? [];
		const permitePuntaje = options?.permitePuntaje ?? false;
		const mostrarRolMonto = options?.mostrarRolMonto === true;
		const mostrarAsocLiquido = options?.mostrarAsocLiquido === true;

		const items: any[] = [
			{ dataField: 'CORR_VERSION_PREGUNTA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_VERSION',
				label: { text: 'Versión' },
				editorType: 'dxSelectBox',
				colSpan: 3,
				editorOptions: {
					dataSource: versiones,
					valueExpr: 'CORR_VERSION',
					displayExpr: 'DISPLAY',
					searchEnabled: true,
					searchExpr: ['CODIGO', 'NOMBRE', 'DISPLAY'],
					showClearButton: true,
					placeholder: 'Versión...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_SECCION_SE',
				label: { text: 'Sección' },
				editorType: 'dxSelectBox',
				colSpan: 3,
				editorOptions: {
					dataSource: secciones,
					valueExpr: 'CORR_SECCION_SE',
					displayExpr: 'DISPLAY',
					searchEnabled: true,
					searchExpr: ['CODIGO', 'NOMBRE_SECCION', 'DISPLAY'],
					showClearButton: true,
					placeholder: secciones.length ? 'Sección...' : 'Seleccione primero la versión',
					noDataText: 'No hay secciones para esta versión',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			// Fila 2: Pregunta (+ Rol de monto si aplica).
			{
				dataField: 'CORR_PREGUNTA',
				label: { text: 'Pregunta' },
				editorType: 'dxSelectBox',
				colSpan: mostrarRolMonto ? 4 : 8,
				editorOptions: {
					dataSource: preguntas,
					valueExpr: 'CORR_PREGUNTA',
					displayExpr: 'DISPLAY',
					searchEnabled: true,
					searchExpr: ['CODIGO', 'ENUNCIADO', 'DISPLAY'],
					showClearButton: true,
					placeholder: 'Pregunta...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
		];

		if (mostrarRolMonto) {
			items.push({
				dataField: 'ROL_MONTO',
				label: { text: 'Rol de monto' },
				editorType: 'dxSelectBox',
				colSpan: 4,
				helpText: 'Solo aplica a preguntas tipo MONTO en secciones RANGO_MONTO.',
				editorOptions: {
					dataSource: rolesMonto,
					valueExpr: 'Key',
					displayExpr: 'Value',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Bruto / Descuento / Líquido / Monto...',
				},
				validationRules: [{ type: 'required', message: 'Obligatorio para monto en rango' }],
			});
		}

		// Fila 3: Bruto | Descuento (solo líquido).
		if (mostrarAsocLiquido) {
			items.push(
				{
					dataField: 'CORR_PREGUNTA_BRUTO',
					label: { text: 'Pregunta Bruto (cálculo)' },
					editorType: 'dxSelectBox',
					colSpan: 4,
					editorOptions: {
						dataSource: preguntasBruto,
						valueExpr: 'CORR_PREGUNTA',
						displayExpr: 'DISPLAY',
						searchEnabled: true,
						searchExpr: ['CODIGO', 'ENUNCIADO', 'DISPLAY'],
						showClearButton: true,
						placeholder: 'Seleccione bruto de esta sección...',
						noDataText: 'No hay preguntas Bruto en esta sección',
					},
					validationRules: [{ type: 'required', message: 'Obligatorio para líquido' }],
				},
				{
					dataField: 'CORR_PREGUNTA_DESCUENTO',
					label: { text: 'Pregunta Descuento (cálculo)' },
					editorType: 'dxSelectBox',
					colSpan: 4,
					editorOptions: {
						dataSource: preguntasDescuento,
						valueExpr: 'CORR_PREGUNTA',
						displayExpr: 'DISPLAY',
						searchEnabled: true,
						searchExpr: ['CODIGO', 'ENUNCIADO', 'DISPLAY'],
						showClearButton: true,
						placeholder: 'Seleccione descuento de esta sección...',
						noDataText: 'No hay preguntas Descuento en esta sección',
					},
					validationRules: [{ type: 'required', message: 'Obligatorio para líquido' }],
				}
			);
		}

		// Fila 4: Orden, Puntaje, Requerido, Activo.
		items.push(
			{
				dataField: 'ORDEN',
				label: { text: 'Orden' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { min: 0, showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'PUNTAJE',
				label: { text: 'Puntaje' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				helpText: options?.helpTextPuntaje
					?? (permitePuntaje
						? 'Puntaje de esta pregunta al responderla. 0 = sin puntaje.'
						: 'No aplica a esta pregunta o sección.'),
				editorOptions: {
					min: 0,
					showSpinButtons: true,
					format: '#0.00',
					readOnly: !permitePuntaje,
					hint: options?.hintPuntaje
						?? (permitePuntaje
							? 'Puntaje de la pregunta al responderla (0 = sin puntaje).'
							: 'No aplica a esta pregunta o sección'),
				},
			},
			{ dataField: 'ES_REQUERIDO', label: { text: 'Requerido' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 }
		);

		return items;
	}

	esRolLiquido(rol: string | null | undefined): boolean {
		return String(rol ?? '').trim().toUpperCase() === 'LIQUIDO';
	}

	// Qué hace: candidatos bruto/descuento = otras filas de la misma versión+sección con ese rol, no usadas.
	armarCandidatosAsoc(
		models: AcaSeVersionPregunta[],
		corrVersion: number,
		corrSeccion: number,
		corrVersionPreguntaActual: number,
		corrPreguntaActual: number,
		rol: 'BRUTO' | 'DESCUENTO',
		corrSeleccionado: number | null | undefined
	): AcaSePreguntaAsocLookup[] {
		const campoUso = rol === 'BRUTO' ? 'CORR_PREGUNTA_BRUTO' : 'CORR_PREGUNTA_DESCUENTO';
		const usados = new Set(
			(models ?? [])
				.filter(
					(m) =>
						Number(m.CORR_VERSION) === corrVersion &&
						Number(m.CORR_SECCION_SE) === corrSeccion &&
						Number(m.CORR_VERSION_PREGUNTA) !== corrVersionPreguntaActual &&
						Number(m[campoUso] ?? 0) > 0
				)
				.map((m) => Number(m[campoUso]))
		);
		const seleccionado = Number(corrSeleccionado ?? 0);
		return (models ?? [])
			.filter(
				(m) =>
					Number(m.CORR_VERSION) === corrVersion &&
					Number(m.CORR_SECCION_SE) === corrSeccion &&
					Number(m.CORR_PREGUNTA) !== Number(corrPreguntaActual) &&
					String(m.ROL_MONTO ?? '').toUpperCase() === rol &&
					(!usados.has(Number(m.CORR_PREGUNTA)) || Number(m.CORR_PREGUNTA) === seleccionado)
			)
			.map((m) => ({
				CORR_PREGUNTA: Number(m.CORR_PREGUNTA),
				CODIGO: (m.CODIGO_PREGUNTA ?? '').trim(),
				ENUNCIADO: (m.ENUNCIADO_PREGUNTA ?? '').trim(),
				DISPLAY: `${(m.CODIGO_PREGUNTA ?? '').trim()} — ${(m.ENUNCIADO_PREGUNTA ?? '').trim()}`.trim(),
			}));
	}

	private normalizarPayload(model: any, mostrarRolMonto: boolean): any {
		const rol = mostrarRolMonto && model?.ROL_MONTO ? String(model.ROL_MONTO).trim().toUpperCase() : null;
		const esLiquido = rol === 'LIQUIDO';
		return {
			CORR_VERSION_PREGUNTA: model?.CORR_VERSION_PREGUNTA,
			CORR_VERSION: model?.CORR_VERSION,
			CORR_SECCION_SE: Number(model?.CORR_SECCION_SE ?? 0),
			CORR_PREGUNTA: model?.CORR_PREGUNTA,
			ORDEN: Number(model?.ORDEN ?? 0),
			PUNTAJE: Number(model?.PUNTAJE ?? 0),
			ES_REQUERIDO: !!model?.ES_REQUERIDO,
			ROL_MONTO: rol || null,
			CORR_PREGUNTA_BRUTO: esLiquido ? Number(model?.CORR_PREGUNTA_BRUTO ?? 0) || null : null,
			CORR_PREGUNTA_DESCUENTO: esLiquido ? Number(model?.CORR_PREGUNTA_DESCUENTO ?? 0) || null : null,
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
