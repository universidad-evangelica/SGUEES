// Capa de negocio territorial: validación, columnas/forms y CRUD país + hijos vía repositorios.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { GenDepto } from './gen-depto/models/gen-depto';
import { GenDeptoRepository } from './gen-depto/gen-depto.repository';
import { GenDistrito } from './gen-distrito/models/gen-distrito';
import { GenDistritoRepository } from './gen-distrito/gen-distrito.repository';
import { GenMunicipio } from './gen-municipio/models/gen-municipio';
import { GenMunicipioRepository } from './gen-municipio/gen-municipio.repository';
import { GenPais, TerritorialNivel } from './models/gen-pais';
import { GenEstructuraTerritorialRepository } from './gen-estructura-territorial.repository';

@Injectable({
	providedIn: 'root',
})
export class GenEstructuraTerritorialService {
	private readonly requiredMessage = 'Este campo es obligatorio';

	constructor(
		private repo: GenEstructuraTerritorialRepository,
		private repoDepto: GenDeptoRepository,
		private repoMunicipio: GenMunicipioRepository,
		private repoDistrito: GenDistritoRepository
	) {}

	// Valida identidad, campos obligatorios y longitudes del país antes de guardarlo.
	esValidoPais(model: GenPais, msg: Function, isUpdate = false): boolean {
		if (isUpdate && (!model?.CORR_PAIS || model.CORR_PAIS <= 0)) {
			msg('No se pudo identificar el país a modificar.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_CORTO?.trim()) {
			msg('Debe ingresar el nombre corto.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_CORTO.trim().length > 5) {
			msg('El nombre corto no puede superar 5 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_PAIS?.trim()) {
			msg('Debe ingresar el nombre del país.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_PAIS.trim().length > 100) {
			msg('El nombre del país no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NACIONALIDAD?.trim()) {
			msg('Debe ingresar la nacionalidad.', NotifyType.Warning);
			return false;
		}
		if (model.NACIONALIDAD.trim().length > 50) {
			msg('La nacionalidad no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO_PAIS?.trim()) {
			msg('Debe ingresar el código del país.', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO_PAIS.trim().length > 10) {
			msg('El código del país no puede superar 10 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Valida las claves jerárquicas y los datos obligatorios del nivel territorial antes de guardarlo.
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
			if (!row.CORR_PAIS || row.CORR_PAIS <= 0) {
				msg('Debe seleccionar el país.', NotifyType.Warning);
				return false;
			}
			if (!row.NOMBRE_DEPTO?.trim()) {
				msg('Debe ingresar el nombre del departamento.', NotifyType.Warning);
				return false;
			}
			if (row.NOMBRE_DEPTO.trim().length > 100) {
				msg('El nombre del departamento no puede superar 100 caracteres.', NotifyType.Warning);
				return false;
			}
			if (!row.CODIGO_DEPTO?.trim()) {
				msg('Debe ingresar el código del departamento.', NotifyType.Warning);
				return false;
			}
			if (row.CODIGO_DEPTO.trim().length > 10) {
				msg('El código del departamento no puede superar 10 caracteres.', NotifyType.Warning);
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
			if (!row.CORR_PAIS || row.CORR_PAIS <= 0) {
				msg('Debe seleccionar el país.', NotifyType.Warning);
				return false;
			}
			if (!row.CORR_DEPTO || row.CORR_DEPTO <= 0) {
				msg('Debe seleccionar el departamento.', NotifyType.Warning);
				return false;
			}
			if (!row.NOMBRE_MUNICIPIO?.trim()) {
				msg('Debe ingresar el nombre del municipio.', NotifyType.Warning);
				return false;
			}
			if (row.NOMBRE_MUNICIPIO.trim().length > 100) {
				msg('El nombre del municipio no puede superar 100 caracteres.', NotifyType.Warning);
				return false;
			}
			if (!row.CODIGO_MUNICIPIO?.trim()) {
				msg('Debe ingresar el código del municipio.', NotifyType.Warning);
				return false;
			}
			if (row.CODIGO_MUNICIPIO.trim().length > 10) {
				msg('El código del municipio no puede superar 10 caracteres.', NotifyType.Warning);
				return false;
			}
			return true;
		}

		const row = model as GenDistrito;
		if (isUpdate && (!row.CORR_DISTRITO || row.CORR_DISTRITO <= 0)) {
			msg('No se pudo identificar el distrito a modificar.', NotifyType.Warning);
			return false;
		}
		if (!row.CORR_PAIS || row.CORR_PAIS <= 0) {
			msg('Debe seleccionar el país.', NotifyType.Warning);
			return false;
		}
		if (!row.CORR_DEPTO || row.CORR_DEPTO <= 0) {
			msg('Debe seleccionar el departamento.', NotifyType.Warning);
			return false;
		}
		if (!row.CORR_MUNICIPIO || row.CORR_MUNICIPIO <= 0) {
			msg('Debe seleccionar el municipio.', NotifyType.Warning);
			return false;
		}
		if (!row.NOMBRE_DISTRITO?.trim()) {
			msg('Debe ingresar el nombre del distrito.', NotifyType.Warning);
			return false;
		}
		if (row.NOMBRE_DISTRITO.trim().length > 100) {
			msg('El nombre del distrito no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Solicita al repositorio el listado completo de países.
	getAllPaises(): Observable<IResult> {
		return this.repo.getAllPaises([]);
	}

	// Normaliza el país y solicita su creación al repositorio.
	insertPais(model: GenPais): Observable<IResult> {
		return this.repo.createPais(this.buildPaisPayload(model));
	}

	// Normaliza el país y solicita su actualización usando su correlativo.
	updatePais(model: GenPais): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS }];
		return this.repo.updatePais(this.buildPaisPayload(model), xWhere);
	}

	// Normaliza y limita el modelo del país a los campos aceptados por el API.
	buildPaisPayload(model: GenPais): Pick<GenPais, 'CORR_PAIS' | 'NOMBRE_PAIS' | 'CODIGO_PAIS' | 'NACIONALIDAD' | 'NOMBRE_CORTO'> {
		return {
			CORR_PAIS: Number(model.CORR_PAIS) || 0,
			NOMBRE_PAIS: (model.NOMBRE_PAIS ?? '').trim(),
			CODIGO_PAIS: (model.CODIGO_PAIS ?? '').trim(),
			NACIONALIDAD: (model.NACIONALIDAD ?? '').trim(),
			NOMBRE_CORTO: (model.NOMBRE_CORTO ?? '').trim(),
		};
	}

	// Construye la clave del país y solicita su eliminación al repositorio.
	deletePais(model: GenPais): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS }];
		return this.repo.deletePais(xWhere);
	}

	// Solicita al repositorio la creación del departamento.
	insertDepto(model: GenDepto): Observable<IResult> {
		return this.repoDepto.create(model);
	}

	// Solicita al repositorio la actualización del departamento.
	updateDepto(model: GenDepto): Observable<IResult> {
		return this.repoDepto.update(model);
	}

	// Construye la clave territorial y solicita la eliminación del departamento.
	deleteDepto(model: GenDepto): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
		];
		return this.repoDepto.delete(xWhere);
	}

	// Solicita al repositorio la creación del municipio.
	insertMunicipio(model: GenMunicipio): Observable<IResult> {
		return this.repoMunicipio.create(model);
	}

	// Solicita al repositorio la actualización del municipio.
	updateMunicipio(model: GenMunicipio): Observable<IResult> {
		return this.repoMunicipio.update(model);
	}

	// Construye la clave territorial y solicita la eliminación del municipio.
	deleteMunicipio(model: GenMunicipio): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
			{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO },
		];
		return this.repoMunicipio.delete(xWhere);
	}

	// Configura el total de países mostrado al pie de la cuadrícula.
	getPaisListSummary(): any {
		return {
			totalItems: [{ column: 'CORR_PAIS', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Crea la regla obligatoria reutilizada por los campos del formulario territorial.
	private requiredRule() {
		return [{ type: 'required', message: this.requiredMessage }];
	}

	// Solicita al repositorio la creación del distrito.
	insertDistrito(model: GenDistrito): Observable<IResult> {
		return this.repoDistrito.create(model);
	}

	// Solicita al repositorio la actualización del distrito.
	updateDistrito(model: GenDistrito): Observable<IResult> {
		return this.repoDistrito.update(model);
	}

	// Construye la clave territorial y solicita la eliminación del distrito.
	deleteDistrito(model: GenDistrito): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
			{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO },
			{ Parameter: 'CORR_DISTRITO', Value: model.CORR_DISTRITO },
		];
		return this.repoDistrito.delete(xWhere);
	}

	// Columnas del listado de países; las acciones las aporta app-data-grid-mtto.
	getPaisColumns(): any[] {
		return [
			{ dataField: 'CORR_PAIS', caption: 'Corr.', width: 100, dataType: 'number', filterOperations: ['=', '<', '>', '<=', '>='] },
			{ dataField: 'NOMBRE_PAIS', caption: 'País', minWidth: 180 },
			{ dataField: 'CODIGO_PAIS', caption: 'Código', width: 100 },
			{ dataField: 'NACIONALIDAD', caption: 'Nacionalidad', width: 140 },
			{ dataField: 'NOMBRE_CORTO', caption: 'Nombre corto', width: 140 },
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Define los campos, límites y validaciones del formulario de país.
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

	// Configura el contador de registros para una cuadrícula territorial hija.
	getChildSummary(nombreField: string): any {
		return {
			totalItems: [{ column: nombreField, summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Construye las columnas del listado de departamentos con sus acciones permitidas.
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

	// Construye las columnas del listado de municipios con sus acciones permitidas.
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

	// Construye las columnas del listado de distritos con sus acciones permitidas.
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

	// Define los campos editables del formulario de departamento.
	getDeptoItems(): any[] {
		return this.getChildItems('CORR_DEPTO', 'NOMBRE_DEPTO', 'Nombre departamento', 'CODIGO_DEPTO', 'Código departamento');
	}

	// Define los campos editables del formulario de municipio.
	getMunicipioItems(): any[] {
		return this.getChildItems('CORR_MUNICIPIO', 'NOMBRE_MUNICIPIO', 'Nombre municipio', 'CODIGO_MUNICIPIO', 'Código municipio');
	}

	// Define los campos editables del formulario de distrito.
	getDistritoItems(): any[] {
		return this.getChildItems('CORR_DISTRITO', 'NOMBRE_DISTRITO', 'Nombre distrito', null, null);
	}

	// Genera el título del formulario emergente según el nivel y la operación activa.
	getPopupTitle(nivel: TerritorialNivel, isAdd: boolean): string {
		const labels = { depto: 'departamento', municipio: 'municipio', distrito: 'distrito' };
		return isAdd ? `Nuevo ${labels[nivel]}` : `Editar ${labels[nivel]}`;
	}

	// Construye la configuración común de columnas y acciones para los niveles territoriales hijos.
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
				caption: 'Acciones',
				width: 100,
				minWidth: 100,
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

		columns.push(...buildAuditGridColumns({ withDateTimeFilter: true }));

		return columns;
	}

	// Construye la configuración común de campos y validaciones para los formularios territoriales hijos.
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

// Genera el mensaje funcional usado cuando la sesión no tiene una empresa asignada.
export function getEmpresaWarningMessage(etiquetaRegistro = EMPRESA_REGISTRO_ETIQUETA): string {
	return `No se pudo guardar ${etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.`;
}

// Identifica respuestas controladas relacionadas con la empresa de la sesión.
export function isEmpresaWarningResponse(response: any): boolean {
	return response?.ErrorCode === EMPRESA_WARNING_ERROR_CODE;
}

// Detecta errores técnicos vinculados con la empresa y permite mostrarlos como advertencia.
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
