import { Injectable } from '@angular/core';
import dxSelectBox from 'devextreme/ui/select_box';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { SC_COMPETENCIA_NIVEL, ScCompetenciasTecnicas } from './models/sc-competencias-tecnicas';
import { ScCompetenciasTecnicasRepository } from './sc-competencias-tecnicas.repository';

export interface ScCompetenciaFormContext {
	nivel: string;
	isAdd: boolean;
	padres: any[];
	registroSeleccionadoInactivo?: boolean;
	onNivelChanged?: (e: any) => void;
	onPadreChanged?: (e: any) => void;
}

@Injectable({
	providedIn: 'root',
})
export class ScCompetenciasTecnicasService {
	constructor(private repo: ScCompetenciasTecnicasRepository) {}

	esValido(model: ScCompetenciasTecnicas, msg: Function, isAdd: boolean): boolean {
		if (!model.NIVEL) {
			msg('Debe seleccionar el nivel de la competencia.', NotifyType.Warning);
			return false;
		}

		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 500) {
			msg('La descripcion no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.NIVEL === SC_COMPETENCIA_NIVEL.UNO) {
			if (!model.CODIGO_COMPETENCIAS_TECNICAS || model.CODIGO_COMPETENCIAS_TECNICAS.trim() === '') {
				msg('Debe ingresar el codigo.', NotifyType.Warning);
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

		return true;
	}

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

	getAll(param: any): Observable<IResult> {
		return this.repo.get(this.buildWhere(param));
	}

	getPadres(nivelPadre: string, incluirInactivos = false): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'NIVEL_PADRE', Value: nivelPadre }];
		if (incluirInactivos) {
			xWhere.push({ Parameter: 'OPCION_CONSULTA', Value: 1 });
		}

		return this.repo.getPadres(xWhere);
	}

	getNextCodigo(corrPadre: number): Observable<IResult> {
		return this.repo.getNextCodigo([{ Parameter: 'CORR_COMPETENCIAS_TECNICAS_PADRE', Value: corrPadre }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: model.CORR_COMPETENCIAS_TECNICAS }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: model.CORR_COMPETENCIAS_TECNICAS }];
		return this.repo.delete(xWhere);
	}

	activar(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: model.CORR_COMPETENCIAS_TECNICAS }];
		return this.repo.activar(model, xWhere);
	}

	desactivar(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: model.CORR_COMPETENCIAS_TECNICAS }];
		return this.repo.desactivar(model, xWhere);
	}

	getColumns(
		onEditClick: Function,
		onDeleteClick: Function,
		onActivarClick: Function,
		onDesactivarClick: Function,
		canEdit = true,
		canDelete = true
	): any {
		const editHint = canEdit ? 'Editar registro' : 'No tiene permiso para editar registros.';
		const deleteHint = canDelete ? 'Eliminar registro' : 'No tiene permiso para eliminar registros.';
		const activarHint = canEdit ? 'Activar registro' : 'No tiene permiso para activar registros.';
		const desactivarHint = canEdit ? 'Desactivar registro' : 'No tiene permiso para desactivar registros.';
		const editCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-edit';
		const deleteCssClass = canDelete ? 'sguees-grid-action-delete' : 'sguees-action-no-delete';
		const activateCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-activate';
		const deactivateCssClass = canEdit ? 'sguees-grid-action-delete' : 'sguees-action-no-deactivate';
		const editClick = canEdit ? onEditClick : () => undefined;
		const deleteClick = canDelete ? onDeleteClick : () => undefined;
		const activarClick = canEdit ? onActivarClick : () => undefined;
		const desactivarClick = canEdit ? onDesactivarClick : () => undefined;

		return [
			{
				type: 'buttons',
				name: 'btnAcciones',
				caption: 'Options',
				width: 150,
				minWidth: 150,
				allowResizing: false,
				fixed: true,
				fixedPosition: 'left',
				alignment: 'center',
				buttons: [
					{
						hint: editHint,
						icon: 'edit',
						stylingMode: 'text',
						cssClass: editCssClass,
						onClick: editClick,
					},
					{
						hint: deleteHint,
						icon: 'trash',
						stylingMode: 'text',
						cssClass: deleteCssClass,
						onClick: deleteClick,
					},
					{
						hint: activarHint,
						icon: 'refresh',
						stylingMode: 'text',
						cssClass: activateCssClass,
						visible: (e: any) => !e.row?.data?.ESTADO_COMPETENCIAS_TECNICAS,
						onClick: activarClick,
					},
					{
						hint: desactivarHint,
						icon: 'close',
						stylingMode: 'text',
						cssClass: deactivateCssClass,
						visible: (e: any) => !!e.row?.data?.ESTADO_COMPETENCIAS_TECNICAS,
						onClick: desactivarClick,
					},
				],
			},
			{ dataField: 'CORR_COMPETENCIAS_TECNICAS', caption: 'Corr.', width: 90 },
			{ dataField: 'CODIGO_COMPETENCIAS_TECNICAS', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_COMPETENCIAS_TECNICAS', caption: 'Competencia Tecnica', width: 260 },
			{ dataField: 'DESCRIPCION', caption: 'Definicion', width: 360 },
			{ dataField: 'NIVEL', caption: 'Nivel', width: 80, alignment: 'center' },
			{ dataField: 'CODIGO_PADRE', caption: 'Cod. Padre', width: 110 },
			{
				dataField: 'ESTADO_COMPETENCIAS_TECNICAS',
				caption: 'Estado',
				width: 140,
				allowFiltering: true,
				allowHeaderFiltering: true,
				cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					const badge = document.createElement('span');
					badge.classList.add(
						'estado-badge',
						cellInfo.value ? 'estado-badge--activo' : 'estado-badge--inactivo'
					);
					badge.textContent = cellInfo.value ? 'Activo' : 'Inactivo';
					cellElement.innerHTML = '';
					cellElement.appendChild(badge);
				},
				lookup: {
					dataSource: [
						{ value: true, text: 'Activo' },
						{ value: false, text: 'Inactivo' },
					],
					valueExpr: 'value',
					displayExpr: 'text',
				},
				filterCellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					new dxSelectBox(cellElement, {
						dataSource: [
							{ value: true, text: 'Activo' },
							{ value: false, text: 'Inactivo' },
						],
						displayExpr: 'text',
						valueExpr: 'value',
						value: cellInfo.value,
						placeholder: 'Seleccione...',
						showClearButton: false,
						onValueChanged: (e: any) => {
							cellInfo.setValue(e.value);
						},
					});
				},
				calculateFilterExpression: (filterValue: any) => {
					if (filterValue === '__ALL__' || filterValue === null || filterValue === undefined) {
						return null;
					}

					return ['ESTADO_COMPETENCIAS_TECNICAS', '=', filterValue];
				},
			},
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 160 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 160 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 170, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 160 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 160 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 170, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
		];
	}

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
				editorType: 'dxSelectBox',
				editorOptions: {
					readOnly: !ctx.isAdd,
					items: [
						{ value: SC_COMPETENCIA_NIVEL.UNO, text: 'Nivel 1' },
						{ value: SC_COMPETENCIA_NIVEL.DOS, text: 'Nivel 2' },
						{ value: SC_COMPETENCIA_NIVEL.TRES, text: 'Nivel 3' },
					],
					displayExpr: 'text',
					valueExpr: 'value',
					onValueChanged: ctx.onNivelChanged,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_COMPETENCIAS_TECNICAS_PADRE',
				label: { text: isNivel2 ? 'Padre (Nivel 1)' : 'Padre (Nivel 2)' },
				colSpan: isNivel2 ? 5 : 3,
				visible: showPadre,
				helpText: ctx.registroSeleccionadoInactivo ? 'El registro seleccionado esta inactivo.' : undefined,
				editorType: 'dxSelectBox',
				editorOptions: {
					readOnly: !ctx.isAdd,
					dataSource: ctx.padres,
					displayExpr: (item: any) =>
						item ? `${item.CODIGO_COMPETENCIAS_TECNICAS} - ${item.DESCRIPCION ?? item.NOMBRE_COMPETENCIAS_TECNICAS ?? ''}` : '',
					valueExpr: 'CORR_COMPETENCIAS_TECNICAS',
					searchEnabled: true,
					showClearButton: true,
					onValueChanged: ctx.onPadreChanged,
				},
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

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		const columnFilters = [
			'CORR_COMPETENCIAS_TECNICAS',
			'CODIGO_COMPETENCIAS_TECNICAS',
			'NOMBRE_COMPETENCIAS_TECNICAS',
			'DESCRIPCION',
			'NIVEL',
			'USUARIO_CREA',
			'ESTACION_CREA',
			'FECHA_CREA',
			'USUARIO_ACTU',
			'ESTACION_ACTU',
			'FECHA_ACTU',
		];

		if (param.BUSQUEDA) {
			xWhere.push({ Parameter: 'BUSQUEDA', Value: param.BUSQUEDA });
		}

		if (param.ESTADO_COMPETENCIAS_TECNICAS !== null && param.ESTADO_COMPETENCIAS_TECNICAS !== undefined) {
			xWhere.push({ Parameter: 'ESTADO_COMPETENCIAS_TECNICAS', Value: param.ESTADO_COMPETENCIAS_TECNICAS });
		}

		if (param.PAGE) {
			xWhere.push({ Parameter: 'PAGE', Value: param.PAGE });
		}

		if (param.PAGE_SIZE) {
			xWhere.push({ Parameter: 'PAGE_SIZE', Value: param.PAGE_SIZE });
		}

		columnFilters.forEach((field) => {
			const value = param[field];
			if (this.hasColumnFilter(value, field)) {
				xWhere.push({ Parameter: field, Value: value });
			}
		});

		return xWhere;
	}

	private hasColumnFilter(value: any, field: string): boolean {
		if (value === null || value === undefined || `${value}`.trim() === '') {
			return false;
		}

		return !(field === 'CORR_COMPETENCIAS_TECNICAS' && Number(value) === 0);
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'la competencia técnica';

export function getEmpresaWarningMessage(etiquetaRegistro = EMPRESA_REGISTRO_ETIQUETA): string {
	return `No se pudo guardar ${etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.`;
}

export function isEmpresaWarningResponse(response: any): boolean {
	return response?.ErrorCode === EMPRESA_WARNING_ERROR_CODE;
}

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
