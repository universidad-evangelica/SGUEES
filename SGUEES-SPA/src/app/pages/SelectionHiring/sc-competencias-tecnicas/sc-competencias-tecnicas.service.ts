// Qué hace: servicio de negocio del catálogo Competencias Técnicas.
// Cómo: valida los datos, ejecuta el CRUD a través del repositorio y arma la configuración de grilla y formulario jerárquico.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { SC_COMPETENCIA_NIVEL, ScCompetenciasTecnicas } from './models/sc-competencias-tecnicas';
import { ScCompetenciasTecnicasRepository } from './sc-competencias-tecnicas.repository';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_TECNICAS';

export interface ScCompetenciaFormContext {
	nivel: string;
	isAdd: boolean;
	padres: any[];
	niveles?: Array<{ Key: any; Value: string }>;
	registroSeleccionadoInactivo?: boolean;
	onNivelChanged?: (e: any) => void;
	onPadreChanged?: (e: any) => void;
}

@Injectable({
	providedIn: 'root',
})
// Qué hace: servicio de competencias técnicas.
// Cómo: valida los datos y llama a ScCompetenciasTecnicasRepository para ejecutar el CRUD.
export class ScCompetenciasTecnicasService {
	constructor(private repo: ScCompetenciasTecnicasRepository) {}

	// Qué hace: valida el formulario de competencia técnica antes de guardar.
	// Cómo: revisa código, padre, nombre y descripción según el NIVEL (NIV1, NIV2 o NIV3), notificando con msg cuando falla.
	esValido(model: ScCompetenciasTecnicas, msg: Function, isAdd: boolean): boolean {
		if (!model.NIVEL) {
			msg('Debe seleccionar el nivel de la competencia.', NotifyType.Warning);
			return false;
		}

		if (model.NIVEL === SC_COMPETENCIA_NIVEL.UNO) {
			if (!model.CODIGO_COMPETENCIAS_TECNICAS || model.CODIGO_COMPETENCIAS_TECNICAS.trim() === '') {
				msg('Debe ingresar el codigo.', NotifyType.Warning);
				return false;
			}

			if (!/^[a-zA-Z0-9]{2,10}$/.test(model.CODIGO_COMPETENCIAS_TECNICAS.trim())) {
				msg('El codigo de nivel 1 solo puede contener letras y numeros (2 a 10 caracteres).', NotifyType.Warning);
				return false;
			}
		}

		if (model.NIVEL === SC_COMPETENCIA_NIVEL.DOS) {
			if (!model.CORR_COMPETENCIAS_TECNICAS_PADRE) {
				msg('Debe seleccionar el registro padre de nivel 1.', NotifyType.Warning);
				return false;
			}

			if (!model.CODIGO_SUFIJO || model.CODIGO_SUFIJO.trim() === '') {
				msg('Debe ingresar el sufijo del codigo.', NotifyType.Warning);
				return false;
			}

			if (model.CODIGO_SUFIJO.trim().length > 10) {
				msg('El sufijo del codigo no puede superar 10 caracteres.', NotifyType.Warning);
				return false;
			}

			if (!/^[a-zA-Z0-9]+$/.test(model.CODIGO_SUFIJO.trim())) {
				msg('El sufijo del codigo de nivel 2 solo puede contener letras y numeros.', NotifyType.Warning);
				return false;
			}
		}

		if (model.NIVEL === SC_COMPETENCIA_NIVEL.TRES) {
			if (!model.CORR_COMPETENCIAS_TECNICAS_PADRE) {
				msg('Debe seleccionar el registro padre de nivel 2.', NotifyType.Warning);
				return false;
			}

			if (!model.NOMBRE_COMPETENCIAS_TECNICAS || model.NOMBRE_COMPETENCIAS_TECNICAS.trim() === '') {
				msg('Debe ingresar el nombre de la competencia.', NotifyType.Warning);
				return false;
			}

			if (model.NOMBRE_COMPETENCIAS_TECNICAS.trim().length > 150) {
				msg('El nombre no puede superar 150 caracteres.', NotifyType.Warning);
				return false;
			}
		}

		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 500) {
			msg('La descripcion no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Qué hace: prepara el modelo para enviarlo al API según el nivel jerárquico.
	// Cómo: compone CODIGO_COMPETENCIAS_TECNICAS, normaliza campos por NIVEL y elimina propiedades auxiliares (CODIGO_PREFIJO, CODIGO_SUFIJO, CODIGO_PADRE, NOMBRE_PADRE).
	prepararModeloParaGuardar(model: ScCompetenciasTecnicas, isAdd: boolean): ScCompetenciasTecnicas {
		const payload = { ...model };
		payload.DESCRIPCION = payload.DESCRIPCION?.trim() ?? '';
		payload.NIVEL = `${payload.NIVEL}`;

		if (!payload.CORR_COMPETENCIAS_TECNICAS_PADRE) {
			payload.CORR_COMPETENCIAS_TECNICAS_PADRE = null;
		}

		if (payload.NIVEL === SC_COMPETENCIA_NIVEL.UNO) {
			payload.CORR_COMPETENCIAS_TECNICAS_PADRE = null;
			payload.NOMBRE_COMPETENCIAS_TECNICAS = null;
			payload.CODIGO_COMPETENCIAS_TECNICAS = payload.CODIGO_COMPETENCIAS_TECNICAS?.trim().toUpperCase() ?? '';
		}

		if (payload.NIVEL === SC_COMPETENCIA_NIVEL.DOS) {
			payload.NOMBRE_COMPETENCIAS_TECNICAS = null;
			if (payload.CODIGO_PREFIJO || payload.CODIGO_SUFIJO) {
				const prefijo = (payload.CODIGO_PREFIJO ?? '').trim().toUpperCase();
				const sufijo = (payload.CODIGO_SUFIJO ?? '').trim().toUpperCase();
				payload.CODIGO_COMPETENCIAS_TECNICAS = `${prefijo}${sufijo}`;
			}
		}

		if (payload.NIVEL === SC_COMPETENCIA_NIVEL.TRES) {
			payload.NOMBRE_COMPETENCIAS_TECNICAS = payload.NOMBRE_COMPETENCIAS_TECNICAS?.trim() ?? '';
		}

		delete payload.CODIGO_PREFIJO;
		delete payload.CODIGO_SUFIJO;
		delete payload.CODIGO_PADRE;
		delete payload.NOMBRE_PADRE;

		return payload;
	}

	// Qué hace: obtiene el listado de competencias técnicas.
	// Cómo: llama a getAll del repositorio con el filtro construido por buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene una competencia técnica puntual.
	// Cómo: llama a get del repositorio filtrando por CORR_COMPETENCIAS_TECNICAS.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: param.CORR_COMPETENCIAS_TECNICAS }]);
	}

	// Qué hace: obtiene el siguiente código disponible para un padre de nivel 2.
	// Cómo: llama a getNextCodigo del repositorio filtrando por CORR_COMPETENCIAS_TECNICAS_PADRE.
	getNextCodigo(corrPadre: number): Observable<IResult> {
		return this.repo.getNextCodigo([{ Parameter: 'CORR_COMPETENCIAS_TECNICAS_PADRE', Value: corrPadre }]);
	}

	// Qué hace: crea una nueva competencia técnica.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: actualiza una competencia técnica existente.
	// Cómo: llama a update del repositorio con el modelo y su CORR_COMPETENCIAS_TECNICAS.
	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: model.CORR_COMPETENCIAS_TECNICAS }]);
	}

	// Qué hace: elimina una competencia técnica.
	// Cómo: llama a delete del repositorio filtrando por CORR_COMPETENCIAS_TECNICAS.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: model.CORR_COMPETENCIAS_TECNICAS }]);
	}

	// Qué hace: cambia el estado activo/inactivo de una competencia técnica.
	// Cómo: llama a activarInactivar del repositorio filtrando por CORR_COMPETENCIAS_TECNICAS.
	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: model.CORR_COMPETENCIAS_TECNICAS }]);
	}

	// Qué hace: define columnas y formatos de la grilla de mantenimiento.
	// Cómo: arma el arreglo de columnas (correlativo, código, nombre, definición, nivel, padre, estado y auditoría) usado por app-data-grid-mtto.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_COMPETENCIAS_TECNICAS',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_COMPETENCIAS_TECNICAS', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_COMPETENCIAS_TECNICAS', caption: 'Competencia Tecnica', width: 260 },
			{ dataField: 'DESCRIPCION', caption: 'Definicion', width: 360 },
			{ dataField: 'NIVEL', caption: 'Nivel', width: 80, alignment: 'center' },
			{ dataField: 'CODIGO_PADRE', caption: 'Cod. Padre', width: 110 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: configura el contador de registros de la grilla.
	// Cómo: define el resumen totalItems que cuenta CORR_COMPETENCIAS_TECNICAS.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_COMPETENCIAS_TECNICAS',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Qué hace: define los campos y reglas del formulario según el nivel jerárquico.
	// Cómo: arma dinámicamente el arreglo de items (nivel, padre, código, nombre, estado y definición) usado por dx-form según el contexto recibido.
	getItems(ctx: ScCompetenciaFormContext): any[] {
		const isNivel1 = ctx.nivel === SC_COMPETENCIA_NIVEL.UNO;
		const isNivel2 = ctx.nivel === SC_COMPETENCIA_NIVEL.DOS;
		const isNivel3 = ctx.nivel === SC_COMPETENCIA_NIVEL.TRES;
		const showPadre = isNivel2 || isNivel3;

		const items: any[] = [
			{ dataField: 'CORR_COMPETENCIAS_TECNICAS', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NIVEL',
				label: { text: 'Nivel' },
				colSpan: isNivel1 ? 3 : 2,
				template: 'NIVELLookup',
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_COMPETENCIAS_TECNICAS_PADRE',
				label: { text: isNivel2 ? 'Padre (Nivel 1)' : 'Padre (Nivel 2)' },
				colSpan: isNivel2 ? 5 : 3,
				visible: showPadre,
				helpText: ctx.registroSeleccionadoInactivo ? 'El registro seleccionado esta inactivo.' : undefined,
				template: 'CORR_COMPETENCIAS_TECNICAS_PADRELookup',
				validationRules: showPadre ? [{ type: 'required', message: 'Este campo es obligatorio' }] : [],
			},
			{
				dataField: 'CODIGO_COMPETENCIAS_TECNICAS',
				label: { text: 'Codigo' },
				colSpan: isNivel1 ? 3 : 2,
				visible: isNivel1 || isNivel3,
				editorOptions: {
					readOnly: !ctx.isAdd || isNivel3,
					placeholder: isNivel1 ? 'Ej: AC' : 'Codigo',
					maxLength: 30,
					onInput: isNivel1
						? (e: any) => {
								const value = `${e?.event?.target?.value ?? ''}`.toUpperCase();
								if (e?.component) {
									e.component.option('value', value);
								}
							}
						: undefined,
				},
				validationRules: isNivel1 ? [{ type: 'required', message: 'Este campo es obligatorio' }] : [],
			},
			{
				dataField: 'CODIGO_PREFIJO',
				label: { text: 'Codigo padre' },
				colSpan: 2,
				visible: isNivel2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'CODIGO_SUFIJO',
				label: { text: 'Sufijo codigo' },
				colSpan: 1,
				visible: isNivel2,
				editorOptions: {
					readOnly: !ctx.isAdd,
					placeholder: 'Ej: CP',
					maxLength: 10,
					onInput: (e: any) => {
						const value = `${e?.event?.target?.value ?? ''}`.toUpperCase();
						if (e?.component) {
							e.component.option('value', value);
						}
					},
				},
				validationRules: isNivel2 ? [{ type: 'required', message: 'Este campo es obligatorio' }] : [],
			},
		];

		if (isNivel3) {
			items.push({
				dataField: 'NOMBRE_COMPETENCIAS_TECNICAS',
				label: { text: 'Competencia tecnica' },
				colSpan: 6,
				editorOptions: { placeholder: 'Nombre de la competencia...', maxLength: 150, showClearButton: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			});
		}

		items.push(
			{
				dataField: 'ESTADO_COMPETENCIAS_TECNICAS',
				label: { text: 'Activo' },
				editorType: 'dxCheckBox',
				colSpan: isNivel1 ? 1 : 2,
			},
			...(isNivel1 || isNivel3 ? [] : [{ itemType: 'empty', colSpan: isNivel2 ? 3 : 6 }]),
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Definicion' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: { placeholder: 'Definicion...', maxLength: 500, height: 120 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			}
		);

		return items;
	}

	// Qué hace: traduce los filtros del componente al formato esperado por la API.
	// Cómo: agrega a xWhere el parámetro CORR_COMPETENCIAS_TECNICAS cuando viene informado en param.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_COMPETENCIAS_TECNICAS) {
			xWhere.push({ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: param.CORR_COMPETENCIAS_TECNICAS });
		}

		return xWhere;
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'la competencia técnica';

// Qué hace: construye el mensaje de advertencia por ausencia de empresa en sesión.
// Cómo: interpola etiquetaRegistro en una cadena fija orientada al usuario.
export function getEmpresaWarningMessage(etiquetaRegistro = EMPRESA_REGISTRO_ETIQUETA): string {
	return `No se pudo guardar ${etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.`;
}

// Qué hace: identifica la respuesta controlada por ausencia de empresa en sesión.
// Cómo: compara ErrorCode de la respuesta con EMPRESA_WARNING_ERROR_CODE (4100).
export function isEmpresaWarningResponse(response: any): boolean {
	return response?.ErrorCode === EMPRESA_WARNING_ERROR_CODE;
}

// Qué hace: reconoce variantes del error de relación con la empresa.
// Cómo: busca en el mensaje textos como gen_empresa, foreign key, clave externa o ausencia de empresa asignada.
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
