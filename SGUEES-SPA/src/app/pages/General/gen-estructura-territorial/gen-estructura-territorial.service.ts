import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildRemoteGridWhere } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
import {
	GenDepto,
	GenDistrito,
	GenMunicipio,
	GenPais,
	TerritorialNivel,
} from './models/gen-estructura-territorial';
import { GenEstructuraTerritorialRepository } from './gen-estructura-territorial.repository';

@Injectable({
	providedIn: 'root',
})
export class GenEstructuraTerritorialService {
	private readonly requiredMessage = 'Este campo es obligatorio';

	constructor(private repo: GenEstructuraTerritorialRepository) {}

	esValidoPais(model: GenPais, msg: Function, isUpdate = false): boolean {
		if (isUpdate && (!model?.CORR_PAIS || model.CORR_PAIS <= 0)) {
			msg('No se pudo identificar el país a modificar.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_CORTO?.trim()) {
			msg('Debe ingresar el nombre corto.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_PAIS?.trim()) {
			msg('Debe ingresar el nombre del país.', NotifyType.Warning);
			return false;
		}
		if (!model.NACIONALIDAD?.trim()) {
			msg('Debe ingresar la nacionalidad.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO_PAIS?.trim()) {
			msg('Debe ingresar el código del país.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_PAIS.trim().length > 100) {
			msg('El nombre del país no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	esValidoNivel(
		nivel: TerritorialNivel,
		model: GenDepto | GenMunicipio | GenDistrito,
		msg: Function,
		isUpdate = false
	): boolean {
		if (nivel === 'depto') {
			const row = model as GenDepto;
			if (isUpdate && (!row.CORR_DEPTO || row.CORR_DEPTO <= 0)) {
				msg('No se pudo identificar el departamento a modificar.', NotifyType.Warning);
				return false;
			}
			if (!row.NOMBRE_DEPTO?.trim()) {
				msg('Debe ingresar el nombre del departamento.', NotifyType.Warning);
				return false;
			}
			if (!row.CODIGO_DEPTO?.trim()) {
				msg('Debe ingresar el código del departamento.', NotifyType.Warning);
				return false;
			}
			return true;
		}

		if (nivel === 'municipio') {
			const row = model as GenMunicipio;
			if (isUpdate && (!row.CORR_MUNICIPIO || row.CORR_MUNICIPIO <= 0)) {
				msg('No se pudo identificar el municipio a modificar.', NotifyType.Warning);
				return false;
			}
			if (!row.NOMBRE_MUNICIPIO?.trim()) {
				msg('Debe ingresar el nombre del municipio.', NotifyType.Warning);
				return false;
			}
			if (!row.CODIGO_MUNICIPIO?.trim()) {
				msg('Debe ingresar el código del municipio.', NotifyType.Warning);
				return false;
			}
			return true;
		}

		const row = model as GenDistrito;
		if (isUpdate && (!row.CORR_DISTRITO || row.CORR_DISTRITO <= 0)) {
			msg('No se pudo identificar el distrito a modificar.', NotifyType.Warning);
			return false;
		}
		if (!row.NOMBRE_DISTRITO?.trim()) {
			msg('Debe ingresar el nombre del distrito.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAllPaises(param: any): Observable<IResult> {
		return this.repo.getAllPaises(this.buildRemoteWhere(param, true));
	}

	getDistinctValuesPaises(param: any): Observable<IResult> {
		return this.repo.getDistinctValuesPaises(this.buildRemoteWhere(param, true));
	}

	insertPais(model: GenPais): Observable<IResult> {
		return this.repo.createPais(this.buildPaisPayload(model));
	}

	updatePais(model: GenPais): Observable<IResult> {
		return this.repo.updatePais(this.buildPaisPayload(model));
	}

	buildPaisPayload(model: GenPais): Pick<GenPais, 'CORR_PAIS' | 'NOMBRE_PAIS' | 'CODIGO_PAIS' | 'NACIONALIDAD' | 'NOMBRE_CORTO'> {
		return {
			CORR_PAIS: Number(model.CORR_PAIS) || 0,
			NOMBRE_PAIS: (model.NOMBRE_PAIS ?? '').trim(),
			CODIGO_PAIS: (model.CODIGO_PAIS ?? '').trim(),
			NACIONALIDAD: (model.NACIONALIDAD ?? '').trim(),
			NOMBRE_CORTO: (model.NOMBRE_CORTO ?? '').trim(),
		};
	}

	deletePais(model: GenPais): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS }];
		return this.repo.deletePais(xWhere);
	}

	getAllDeptos(param: any): Observable<IResult> {
		return this.repo.getAllDeptos(this.buildRemoteWhere(param, false, ['CORR_PAIS']));
	}

	getDistinctValuesDeptos(param: any): Observable<IResult> {
		return this.repo.getDistinctValuesDeptos(this.buildRemoteWhere(param, false, ['CORR_PAIS']));
	}

	insertDepto(model: GenDepto): Observable<IResult> {
		return this.repo.createDepto(model);
	}

	updateDepto(model: GenDepto): Observable<IResult> {
		return this.repo.updateDepto(model);
	}

	deleteDepto(model: GenDepto): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
		];
		return this.repo.deleteDepto(xWhere);
	}

	getAllMunicipios(param: any): Observable<IResult> {
		return this.repo.getAllMunicipios(this.buildRemoteWhere(param, false, ['CORR_PAIS', 'CORR_DEPTO']));
	}

	getDistinctValuesMunicipios(param: any): Observable<IResult> {
		return this.repo.getDistinctValuesMunicipios(this.buildRemoteWhere(param, false, ['CORR_PAIS', 'CORR_DEPTO']));
	}

	insertMunicipio(model: GenMunicipio): Observable<IResult> {
		return this.repo.createMunicipio(model);
	}

	updateMunicipio(model: GenMunicipio): Observable<IResult> {
		return this.repo.updateMunicipio(model);
	}

	deleteMunicipio(model: GenMunicipio): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
			{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO },
		];
		return this.repo.deleteMunicipio(xWhere);
	}

	getAllDistritos(param: any): Observable<IResult> {
		return this.repo.getAllDistritos(this.buildRemoteWhere(param, false, ['CORR_PAIS', 'CORR_DEPTO', 'CORR_MUNICIPIO']));
	}

	getDistinctValuesDistritos(param: any): Observable<IResult> {
		return this.repo.getDistinctValuesDistritos(this.buildRemoteWhere(param, false, ['CORR_PAIS', 'CORR_DEPTO', 'CORR_MUNICIPIO']));
	}

	getPaisListSummary(): any {
		return {
			totalItems: [{ column: 'CORR_PAIS', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	private buildRemoteWhere(param: any, _includePaging: boolean, scopeFields: string[] = []): IParam[] {
		const xWhere = buildRemoteGridWhere(param, '');

		scopeFields.forEach((field) => {
			if (this.hasCorrKey(param[field])) {
				xWhere.push({ Parameter: field, Value: param[field] });
			}
		});

		return xWhere;
	}

	private hasCorrKey(value: any): boolean {
		if (value === null || value === undefined || `${value}`.trim() === '') {
			return false;
		}

		return !Number.isNaN(Number(value)) && Number(value) > 0;
	}

	private pushScopeFilter(xWhere: IParam[], param: any, fields: string[]): void {
		fields.forEach((field) => {
			if (this.hasCorrKey(param[field])) {
				xWhere.push({ Parameter: field, Value: param[field] });
			}
		});
	}

	private requiredRule() {
		return [{ type: 'required', message: this.requiredMessage }];
	}

	insertDistrito(model: GenDistrito): Observable<IResult> {
		return this.repo.createDistrito(model);
	}

	updateDistrito(model: GenDistrito): Observable<IResult> {
		return this.repo.updateDistrito(model);
	}

	deleteDistrito(model: GenDistrito): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
			{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO },
			{ Parameter: 'CORR_DISTRITO', Value: model.CORR_DISTRITO },
		];
		return this.repo.deleteDistrito(xWhere);
	}

	getPaisColumns(
		onEditClick: Function,
		onDeleteClick: Function,
		canEdit = true,
		canDelete = true
	): any[] {
		const editHint = canEdit ? 'Editar país' : 'No tiene permiso para editar registros.';
		const deleteHint = canDelete ? 'Eliminar país' : 'No tiene permiso para eliminar registros.';
		const editCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-edit';
		const deleteCssClass = canDelete ? 'sguees-grid-action-delete' : 'sguees-action-no-delete';
		const editClick = canEdit ? onEditClick : () => undefined;
		const deleteClick = canDelete ? onDeleteClick : () => undefined;

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
				],
			},
			{ dataField: 'CORR_PAIS', caption: 'Corr.', width: 100, dataType: 'number', filterOperations: ['=', '<', '>', '<=', '>='] },
			{ dataField: 'NOMBRE_PAIS', caption: 'País', minWidth: 180 },
			{ dataField: 'CODIGO_PAIS', caption: 'Código', width: 100 },
			{ dataField: 'NACIONALIDAD', caption: 'Nacionalidad', width: 140 },
			{ dataField: 'NOMBRE_CORTO', caption: 'Nombre corto', width: 140 },
			...this.getAuditColumns(),
		];
	}

	getPaisItems(): any[] {
		return [
			{
				dataField: 'CORR_PAIS',
				label: { text: 'Corr.' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'NOMBRE_CORTO',
				label: { text: 'Nombre corto' },
				colSpan: 1,
				editorOptions: { placeholder: 'Nombre corto...', showClearButton: true, maxLength: 5 },
				validationRules: this.requiredRule(),
			},
			{
				dataField: 'NOMBRE_PAIS',
				label: { text: 'Nombre de país' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre del país...', showClearButton: true, maxLength: 100 },
				validationRules: this.requiredRule(),
			},
			{
				dataField: 'NACIONALIDAD',
				label: { text: 'Nacionalidad' },
				colSpan: 2,
				editorOptions: { placeholder: 'Nacionalidad...', showClearButton: true, maxLength: 50 },
				validationRules: this.requiredRule(),
			},
			{
				dataField: 'CODIGO_PAIS',
				label: { text: 'Código de país' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 10 },
				validationRules: this.requiredRule(),
			},
		];
	}

	getChildSummary(nombreField: string): any {
		return {
			totalItems: [{ column: nombreField, summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getDeptoColumns(onEditClick: Function, onDeleteClick: Function, canEdit = true, canDelete = true): any[] {
		return this.getChildColumns(
			'CORR_DEPTO',
			'NOMBRE_DEPTO',
			'Departamento',
			'CODIGO_DEPTO',
			'Código de depto.',
			onEditClick,
			onDeleteClick,
			canEdit,
			canDelete
		);
	}

	getMunicipioColumns(onEditClick: Function, onDeleteClick: Function, canEdit = true, canDelete = true): any[] {
		return this.getChildColumns(
			'CORR_MUNICIPIO',
			'NOMBRE_MUNICIPIO',
			'Municipio',
			'CODIGO_MUNICIPIO',
			'Código de municipio',
			onEditClick,
			onDeleteClick,
			canEdit,
			canDelete
		);
	}

	getDistritoColumns(onEditClick: Function, onDeleteClick: Function, canEdit = true, canDelete = true): any[] {
		return this.getChildColumns(
			'CORR_DISTRITO',
			'NOMBRE_DISTRITO',
			'Distrito',
			null,
			null,
			onEditClick,
			onDeleteClick,
			canEdit,
			canDelete
		);
	}

	getDeptoItems(): any[] {
		return this.getChildItems('CORR_DEPTO', 'NOMBRE_DEPTO', 'Nombre departamento', 'CODIGO_DEPTO', 'Código departamento');
	}

	getMunicipioItems(): any[] {
		return this.getChildItems('CORR_MUNICIPIO', 'NOMBRE_MUNICIPIO', 'Nombre municipio', 'CODIGO_MUNICIPIO', 'Código municipio');
	}

	getDistritoItems(): any[] {
		return this.getChildItems('CORR_DISTRITO', 'NOMBRE_DISTRITO', 'Nombre distrito', null, null);
	}

	getPopupTitle(nivel: TerritorialNivel, isAdd: boolean): string {
		const labels = { depto: 'departamento', municipio: 'municipio', distrito: 'distrito' };
		return isAdd ? `Nuevo ${labels[nivel]}` : `Editar ${labels[nivel]}`;
	}

	private getChildColumns(
		corrField: string,
		nombreField: string,
		nombreCaption: string,
		codigoField: string | null,
		codigoCaption: string | null,
		onEditClick: Function,
		onDeleteClick: Function,
		canEdit: boolean,
		canDelete: boolean
	): any[] {
		const editHint = canEdit ? 'Editar registro' : 'No tiene permiso para editar registros.';
		const deleteHint = canDelete ? 'Eliminar registro' : 'No tiene permiso para eliminar registros.';
		const editCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-edit';
		const deleteCssClass = canDelete ? 'sguees-grid-action-delete' : 'sguees-action-no-delete';
		const editClick = canEdit ? onEditClick : () => undefined;
		const deleteClick = canDelete ? onDeleteClick : () => undefined;

		const columns: any[] = [
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
				],
			},
			{ dataField: corrField, caption: 'Corr.', width: 100, dataType: 'number', filterOperations: ['=', '<', '>', '<=', '>='] },
			{ dataField: nombreField, caption: nombreCaption, minWidth: 160 },
		];

		if (codigoField && codigoCaption) {
			columns.push({ dataField: codigoField, caption: codigoCaption, width: 140 });
		}

		columns.push(...this.getAuditColumns());

		return columns;
	}

	private getAuditColumns(): any[] {
		return [
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 200 },
			{
				dataField: 'FECHA_CREA',
				caption: 'Fecha Crea',
				width: 200,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_CREA'),
			},
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
			{
				dataField: 'FECHA_ACTU',
				caption: 'Fecha Actu',
				width: 200,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_ACTU'),
			},
		];
	}

	private getChildItems(
		corrField: string,
		nombreField: string,
		nombreLabel: string,
		codigoField: string | null,
		codigoLabel: string | null
	): any[] {
		const items: any[] = [
			{ dataField: corrField, label: { text: 'Corr.' }, editorOptions: { readOnly: true } },
			{
				dataField: nombreField,
				label: { text: nombreLabel },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 100 },
				validationRules: this.requiredRule(),
			},
		];

		if (codigoField && codigoLabel) {
			items.push({
				dataField: codigoField,
				label: { text: codigoLabel },
				editorOptions: { showClearButton: true, maxLength: 10 },
				validationRules: this.requiredRule(),
			});
		}

		return items;
	}
}

export const EMPRESA_WARNING_ERROR_CODE = 4100;
export const EMPRESA_REGISTRO_ETIQUETA = 'la estructura territorial';

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
