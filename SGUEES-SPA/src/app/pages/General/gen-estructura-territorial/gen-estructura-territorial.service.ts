// Qué hace: agrupa las reglas de negocio de estructura territorial (país y niveles hijos).
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
// Qué hace: valida y coordina el CRUD de país, departamento, municipio y distrito con sus repositorios.
export class GenEstructuraTerritorialService {
	private readonly requiredMessage = 'Este campo es obligatorio';

	constructor(
		private repo: GenEstructuraTerritorialRepository,
		private repoDepto: GenDeptoRepository,
		private repoMunicipio: GenMunicipioRepository,
		private repoDistrito: GenDistritoRepository
	) {}

	// Qué hace: valida los datos del país antes de guardar.
	// Cómo: revisa correlativo en edición, campos obligatorios y longitudes máximas.
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

	// Qué hace: valida depto, municipio o distrito según el nivel recibido.
	// Cómo: revisa claves padre, correlativo en edición, nombre y código cuando aplica.
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

	// Qué hace: lista todos los países.
	// Cómo: llama a getAllPaises del repositorio GenEstructuraTerritorialRepository.
	getAllPaises(): Observable<IResult> {
		return this.repo.getAllPaises([]);
	}

	// Qué hace: crea un país nuevo.
	// Cómo: llama a createPais del repositorio con buildPaisPayload.
	insertPais(model: GenPais): Observable<IResult> {
		return this.repo.createPais(this.buildPaisPayload(model));
	}

	// Qué hace: actualiza un país existente.
	// Cómo: llama a updatePais del repositorio con el payload y CORR_PAIS.
	updatePais(model: GenPais): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS }];
		return this.repo.updatePais(this.buildPaisPayload(model), xWhere);
	}

	// Qué hace: arma el cuerpo enviado al API de país.
	// Cómo: toma solo los campos de negocio y aplica trim a los textos.
	buildPaisPayload(model: GenPais): Pick<GenPais, 'CORR_PAIS' | 'NOMBRE_PAIS' | 'CODIGO_PAIS' | 'NACIONALIDAD' | 'NOMBRE_CORTO'> {
		return {
			CORR_PAIS: Number(model.CORR_PAIS) || 0,
			NOMBRE_PAIS: (model.NOMBRE_PAIS ?? '').trim(),
			CODIGO_PAIS: (model.CODIGO_PAIS ?? '').trim(),
			NACIONALIDAD: (model.NACIONALIDAD ?? '').trim(),
			NOMBRE_CORTO: (model.NOMBRE_CORTO ?? '').trim(),
		};
	}

	// Qué hace: elimina un país.
	// Cómo: llama a deletePais del repositorio con CORR_PAIS.
	deletePais(model: GenPais): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS }];
		return this.repo.deletePais(xWhere);
	}

	// Qué hace: crea un departamento nuevo.
	// Cómo: llama a create del GenDeptoRepository.
	insertDepto(model: GenDepto): Observable<IResult> {
		return this.repoDepto.create(model);
	}

	// Qué hace: actualiza un departamento existente.
	// Cómo: llama a update del GenDeptoRepository.
	updateDepto(model: GenDepto): Observable<IResult> {
		return this.repoDepto.update(model);
	}

	// Qué hace: elimina un departamento.
	// Cómo: llama a delete del GenDeptoRepository con CORR_PAIS y CORR_DEPTO.
	deleteDepto(model: GenDepto): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
		];
		return this.repoDepto.delete(xWhere);
	}

	// Qué hace: crea un municipio nuevo.
	// Cómo: llama a create del GenMunicipioRepository.
	insertMunicipio(model: GenMunicipio): Observable<IResult> {
		return this.repoMunicipio.create(model);
	}

	// Qué hace: actualiza un municipio existente.
	// Cómo: llama a update del GenMunicipioRepository.
	updateMunicipio(model: GenMunicipio): Observable<IResult> {
		return this.repoMunicipio.update(model);
	}

	// Qué hace: elimina un municipio.
	// Cómo: llama a delete del GenMunicipioRepository con las claves territoriales.
	deleteMunicipio(model: GenMunicipio): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
			{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO },
		];
		return this.repoMunicipio.delete(xWhere);
	}

	// Qué hace: define el resumen de conteo del grid de países.
	getPaisListSummary(): any {
		return {
			totalItems: [{ column: 'CORR_PAIS', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Qué hace: crea la regla required reutilizada en los formularios territoriales.
	private requiredRule() {
		return [{ type: 'required', message: this.requiredMessage }];
	}

	// Qué hace: crea un distrito nuevo.
	// Cómo: llama a create del GenDistritoRepository.
	insertDistrito(model: GenDistrito): Observable<IResult> {
		return this.repoDistrito.create(model);
	}

	// Qué hace: actualiza un distrito existente.
	// Cómo: llama a update del GenDistritoRepository.
	updateDistrito(model: GenDistrito): Observable<IResult> {
		return this.repoDistrito.update(model);
	}

	// Qué hace: elimina un distrito.
	// Cómo: llama a delete del GenDistritoRepository con las claves territoriales.
	deleteDistrito(model: GenDistrito): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: model.CORR_PAIS },
			{ Parameter: 'CORR_DEPTO', Value: model.CORR_DEPTO },
			{ Parameter: 'CORR_MUNICIPIO', Value: model.CORR_MUNICIPIO },
			{ Parameter: 'CORR_DISTRITO', Value: model.CORR_DISTRITO },
		];
		return this.repoDistrito.delete(xWhere);
	}

	// Qué hace: define las columnas del grid de países.
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

	// Qué hace: define los campos y validaciones del formulario de país.
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

	// Qué hace: define el resumen de conteo de un grid hijo territorial.
	getChildSummary(nombreField: string): any {
		return {
			totalItems: [{ column: nombreField, summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	// Qué hace: define las columnas del grid de departamentos.
	// Cómo: llama a getChildColumns con los campos de GEN_DEPTO.
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

	// Qué hace: define las columnas del grid de municipios.
	// Cómo: llama a getChildColumns con los campos de GEN_MUNICIPIO.
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

	// Qué hace: define las columnas del grid de distritos.
	// Cómo: llama a getChildColumns con los campos de GEN_DISTRITO (sin código).
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

	// Qué hace: define los campos del formulario de departamento.
	// Cómo: llama a getChildItems con CORR_DEPTO, NOMBRE_DEPTO y CODIGO_DEPTO.
	getDeptoItems(): any[] {
		return this.getChildItems('CORR_DEPTO', 'NOMBRE_DEPTO', 'Nombre departamento', 'CODIGO_DEPTO', 'Código departamento');
	}

	// Qué hace: define los campos del formulario de municipio.
	// Cómo: llama a getChildItems con CORR_MUNICIPIO, NOMBRE_MUNICIPIO y CODIGO_MUNICIPIO.
	getMunicipioItems(): any[] {
		return this.getChildItems('CORR_MUNICIPIO', 'NOMBRE_MUNICIPIO', 'Nombre municipio', 'CODIGO_MUNICIPIO', 'Código municipio');
	}

	// Qué hace: define los campos del formulario de distrito.
	// Cómo: llama a getChildItems con CORR_DISTRITO y NOMBRE_DISTRITO.
	getDistritoItems(): any[] {
		return this.getChildItems('CORR_DISTRITO', 'NOMBRE_DISTRITO', 'Nombre distrito', null, null);
	}

	// Qué hace: arma el título del popup según nivel y operación.
	getPopupTitle(nivel: TerritorialNivel, isAdd: boolean): string {
		const labels = { depto: 'departamento', municipio: 'municipio', distrito: 'distrito' };
		return isAdd ? `Nuevo ${labels[nivel]}` : `Editar ${labels[nivel]}`;
	}

	// Qué hace: construye columnas comunes para grids hijos con botones editar/eliminar.
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

	// Qué hace: construye campos comunes para formularios hijos (corr, nombre y código opcional).
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

// Qué hace: genera el mensaje cuando la sesión no tiene empresa asignada.
export function getEmpresaWarningMessage(etiquetaRegistro = EMPRESA_REGISTRO_ETIQUETA): string {
	return `No se pudo guardar ${etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.`;
}

// Qué hace: identifica respuestas controladas por falta de empresa en sesión.
export function isEmpresaWarningResponse(response: any): boolean {
	return response?.ErrorCode === EMPRESA_WARNING_ERROR_CODE;
}

// Qué hace: detecta errores técnicos de empresa para mostrarlos como advertencia.
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
