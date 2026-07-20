// Orquesta validaciones, columnas/header del mtto y CRUD de detalles del descriptor.
// Delega HTTP a los repositories; el component solo consume Observables/IResult.

import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { ScDescriptorFuncionActividad } from './sc-descriptor-funcion-actividad/models/sc-descriptor-funcion-actividad';
import { ScDescriptorFuncionActividadRepository } from './sc-descriptor-funcion-actividad/sc-descriptor-funcion-actividad.repository';
import { ScDescriptorFuncion } from './sc-descriptor-funcion/models/sc-descriptor-funcion';
import { ScDescriptorFuncionRepository } from './sc-descriptor-funcion/sc-descriptor-funcion.repository';
import { ScDescriptorRelacionLaboral } from './sc-descriptor-relacion-laboral/models/sc-descriptor-relacion-laboral';
import { ScDescriptorRelacionLaboralRepository } from './sc-descriptor-relacion-laboral/sc-descriptor-relacion-laboral.repository';
import { ScDescriptorKpiFuncion } from './sc-descriptor-kpi-funcion/models/sc-descriptor-kpi-funcion';
import { ScDescriptorKpiFuncionRepository } from './sc-descriptor-kpi-funcion/sc-descriptor-kpi-funcion.repository';
import { ScDescriptorPerfilPuesto } from './sc-descriptor-perfil-puesto/models/sc-descriptor-perfil-puesto';
import { ScDescriptorPerfilPuestoRepository } from './sc-descriptor-perfil-puesto/sc-descriptor-perfil-puesto.repository';
import { ScPerfilPuestoEducacion } from './sc-perfil-puesto-educacion/models/sc-perfil-puesto-educacion';
import { ScPerfilPuestoEducacionRepository } from './sc-perfil-puesto-educacion/sc-perfil-puesto-educacion.repository';
import { ScPerfilPuestoExperiencia } from './sc-perfil-puesto-experiencia/models/sc-perfil-puesto-experiencia';
import { ScPerfilPuestoExperienciaRepository } from './sc-perfil-puesto-experiencia/sc-perfil-puesto-experiencia.repository';
import { ScPerfilPuestoCompetenciasTecnicas } from './sc-perfil-puesto-competencias-tecnicas/models/sc-perfil-puesto-competencias-tecnicas';
import { ScPerfilPuestoCompetenciasTecnicasRepository } from './sc-perfil-puesto-competencias-tecnicas/sc-perfil-puesto-competencias-tecnicas.repository';
import { ScPerfilPuestoCompetenciasConductuales } from './sc-perfil-puesto-competencias-conductuales/models/sc-perfil-puesto-competencias-conductuales';
import { ScPerfilPuestoCompetenciasConductualesRepository } from './sc-perfil-puesto-competencias-conductuales/sc-perfil-puesto-competencias-conductuales.repository';
import { ScDescriptorPuestoRequerimientoOrganizacional } from './sc-descriptor-puesto-requerimiento-organizacional/models/sc-descriptor-puesto-requerimiento-organizacional';
import { ScDescriptorPuestoRequerimientoOrganizacionalRepository } from './sc-descriptor-puesto-requerimiento-organizacional/sc-descriptor-puesto-requerimiento-organizacional.repository';
import { ScDescriptorPuestoRiesgoPuesto } from './sc-descriptor-puesto-riesgo-puesto/models/sc-descriptor-puesto-riesgo-puesto';
import { ScDescriptorPuestoRiesgoPuestoRepository } from './sc-descriptor-puesto-riesgo-puesto/sc-descriptor-puesto-riesgo-puesto.repository';
import { ScDescriptorPuestoResponsabilidadCargo } from './sc-descriptor-puesto-responsabilidad-cargo/models/sc-descriptor-puesto-responsabilidad-cargo';
import { ScDescriptorPuestoResponsabilidadCargoRepository } from './sc-descriptor-puesto-responsabilidad-cargo/sc-descriptor-puesto-responsabilidad-cargo.repository';
import {
	ESTADOS_DESCRIPTOR_BLOQUEO_CREACION,
	FORMATO_CORTO,
	FORMATO_EXTENSO,
	ScDescriptorPuesto,
	TIPO_FUNCION_CLAVE,
	TIPO_FUNCION_SECUNDARIA,
	TIPO_RELACION_EXTERNA,
	TIPO_RELACION_INTERNA,
} from './models/sc-descriptor-puesto';
import { ScDescriptorPuestoRepository } from './sc-descriptor-puesto.repository';

// Etiquetas de estado para badges del grid browse.
const ESTADO_DESCRIPTOR_LABELS: Record<string, string> = {
	BORRADOR: 'Borrador',
	ENVIADO: 'Enviado',
	REVISADO: 'En revision',
	ACTIVO: 'Activo',
	INACTIVO: 'Inactivo',
};

@Injectable({ providedIn: 'root' })
// Orquesta CRUD del descriptor y de todas sus secciones de detalle.
export class ScDescriptorPuestoService {
	// Inyecta repositorios del descriptor y de todos sus detalles.
	constructor(
		private repo: ScDescriptorPuestoRepository,
		private funcionRepo: ScDescriptorFuncionRepository,
		private actividadRepo: ScDescriptorFuncionActividadRepository,
		private kpiRepo: ScDescriptorKpiFuncionRepository,
		private perfilRepo: ScDescriptorPerfilPuestoRepository,
		private educacionRepo: ScPerfilPuestoEducacionRepository,
		private experienciaRepo: ScPerfilPuestoExperienciaRepository,
		private competenciasTecnicasRepo: ScPerfilPuestoCompetenciasTecnicasRepository,
		private competenciasConductualesRepo: ScPerfilPuestoCompetenciasConductualesRepository,
		private requerimientosOrganizacionalesRepo: ScDescriptorPuestoRequerimientoOrganizacionalRepository,
		private riesgosPuestoRepo: ScDescriptorPuestoRiesgoPuestoRepository,
		private responsabilidadesCargoRepo: ScDescriptorPuestoResponsabilidadCargoRepository,
		private relacionLaboralRepo: ScDescriptorRelacionLaboralRepository
	) {}

	// Valida los campos obligatorios del encabezado y los límites que no dependen del estado visual del formulario.
	esValido(model: ScDescriptorPuesto, msg: Function): boolean {
		if (!model.FORMATO || model.FORMATO.trim() === '') {
			msg('Debe seleccionar el tipo de formato.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_UNIDAD || model.CORR_UNIDAD <= 0) {
			msg('Debe seleccionar el area.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_PUESTO || model.CORR_PUESTO <= 0) {
			msg('Debe seleccionar el titulo del puesto.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_PUESTO_REPORTA || model.CORR_PUESTO_REPORTA <= 0) {
			msg('Debe seleccionar el puesto al que reporta.', NotifyType.Warning);
			return false;
		}

		if (!model.FECHA_EMISION) {
			msg('Debe ingresar la fecha de emision.', NotifyType.Warning);
			return false;
		}

		if (model.OBJETIVO_PUESTO && model.OBJETIVO_PUESTO.trim().length > 255) {
			msg('El objetivo del puesto no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	// Busca otro descriptor del mismo puesto cuyo estado impida crear una versión paralela.
	// En edición excluye el registro actual para no reportarlo como conflicto consigo mismo.
	buscarDescriptorBloqueoPorPuesto(
		model: ScDescriptorPuesto,
		models: ScDescriptorPuesto[],
		isAdd: boolean
	): ScDescriptorPuesto | null {
		const corrPuesto = Number(model.CORR_PUESTO);
		if (!corrPuesto || corrPuesto <= 0 || !Array.isArray(models)) {
			return null;
		}

		const corrDescriptorActual = Number(model.CORR_DESCRIPTOR_PUESTO);

		return (
			models.find((row) => {
				if (Number(row.CORR_PUESTO) !== corrPuesto) {
					return false;
				}

				const estado = (row.ESTADO_DESCRIPTOR ?? '').toUpperCase();
				if (!ESTADOS_DESCRIPTOR_BLOQUEO_CREACION.includes(estado)) {
					return false;
				}

				return isAdd || Number(row.CORR_DESCRIPTOR_PUESTO) !== corrDescriptorActual;
			}) ?? null
		);
	}

	// Impide crear/usar un puesto con otro descriptor en estado bloqueante.
	validarDescriptorUnicoPorPuesto(
		model: ScDescriptorPuesto,
		models: ScDescriptorPuesto[],
		isAdd: boolean,
		msg: Function
	): boolean {
		const conflicto = this.buscarDescriptorBloqueoPorPuesto(model, models, isAdd);
		if (!conflicto) {
			return true;
		}

		msg(this.buildMensajeDescriptorExistente(conflicto), NotifyType.Warning);
		return false;
	}

	// Construye texto identificador legible del descriptor para mensajes.
	buildCodigoDescriptor(corrDescriptor: number | null | undefined): string {
		const corr = Number(corrDescriptor);
		if (!corr || corr <= 0) {
			return 'DES-0000';
		}

		return `DES-${String(corr).padStart(4, '0')}`;
	}

	// Mensaje de advertencia cuando ya existe descriptor abierto del puesto.
	buildMensajeDescriptorExistente(conflicto: ScDescriptorPuesto): string {
		const codigo = this.buildCodigoDescriptor(conflicto.CORR_DESCRIPTOR_PUESTO);
		const version = Number(conflicto.VERSION) > 0 ? Number(conflicto.VERSION) : 1;
		const estado = (conflicto.ESTADO_DESCRIPTOR ?? '').toUpperCase();
		const contexto = estado === 'ACTIVO' ? 'activo' : 'en proceso de aprobacion';

		return (
			`Ya existe un descriptor para este puesto que se encuentra ${contexto}. ` +
			`Solo sera posible crear una nueva version cuando la version actual ${codigo} version ${version} ` +
			`haya sido activada y posteriormente desactivada.`
		);
	}

	// Lista descriptores segun filtros IParam.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Obtiene un descriptor por llave.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: param.CORR_DESCRIPTOR_PUESTO }]);
	}

	// Normaliza las fechas del modelo al contrato date-only esperado por la API antes de guardar.
	insert(model: any): Observable<IResult> {
		return this.repo.create(this.toApiPayload(model));
	}

	// Actualiza el descriptor principal.
	update(model: any): Observable<IResult> {
		return this.repo.update(this.toApiPayload(model), [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: model.CORR_DESCRIPTOR_PUESTO },
		]);
	}

	// Catalogo de inducciones para el bloque de entrenamiento.
	getInduccionesLookup(): Observable<IResult> {
		return this.repo.getInducciones();
	}

	// Persiste entrenamiento; envía también nombre/semanas del model (snapshot o recatalogación explícita).
	actualizarEntrenamiento(
		corrDescriptorPuesto: number,
		corrInduccion: number | null,
		responsable: string,
		nombreInduccion: string = '',
		semanasInduccion: number | null = null
	): Observable<IResult> {
		return this.repo.updateEntrenamiento(
			{
				CORR_INDUCCION: corrInduccion,
				NOMBRE_INDUCCION: (nombreInduccion ?? '').trim(),
				SEMANAS_INDUCCION: semanasInduccion,
				RESPONSABLE: (responsable ?? '').trim(),
			},
			corrDescriptorPuesto
		);
	}

	// Elimina el descriptor por llave.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: model.CORR_DESCRIPTOR_PUESTO }]);
	}

	// Definicion de columnas del grid de consulta (incl. badges).
	getColumns(): any[] {
		return [
			{ dataField: 'CORR_DESCRIPTOR_PUESTO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_UNIDAD', caption: 'Area', width: 180 },
			{ dataField: 'NOMBRE_PUESTO', caption: 'Titulo del puesto', width: 220 },
			{
				dataField: 'FECHA_EMISION',
				caption: 'Fecha emision',
				width: 130,
				dataType: 'date',
				format: 'dd/MM/yyyy',
			},
			{
				dataField: 'FORMATO',
				caption: 'Formato',
				width: 132,
				cssClass: 'descriptor-grid-badge-col',
				allowHeaderFiltering: false,
				calculateCellValue: (row: ScDescriptorPuesto) => this.getFormatoBadgeLabel(row.FORMATO),
				cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					this.renderBadge(
						cellElement,
						[this.getFormatoBadgeClass(cellInfo.data?.FORMATO)],
						this.getFormatoBadgeLabel(cellInfo.data?.FORMATO),
						'textdocument'
					);
				},
			},
			{
				dataField: 'ESTADO_DESCRIPTOR',
				caption: 'Estado',
				width: 152,
				cssClass: 'descriptor-grid-badge-col',
				allowHeaderFiltering: false,
				calculateCellValue: (row: ScDescriptorPuesto) =>
					this.getEstadoDescriptorLabel(row.ESTADO_DESCRIPTOR),
				cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					this.renderBadge(
						cellElement,
						[this.getEstadoDescriptorBadgeClass(cellInfo.data?.ESTADO_DESCRIPTOR)],
						this.getEstadoDescriptorLabel(cellInfo.data?.ESTADO_DESCRIPTOR)
					);
				},
			},
			{
				dataField: 'VERSION',
				caption: 'Version',
				width: 142,
				cssClass: 'descriptor-grid-badge-col',
				dataType: 'number',
				allowHeaderFiltering: false,
				calculateCellValue: (row: ScDescriptorPuesto) =>
					Number(row.VERSION) > 0 ? Number(row.VERSION) : 1,
				cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					const version =
						Number(cellInfo.data?.VERSION) > 0 ? Number(cellInfo.data?.VERSION) : 1;
					this.renderBadge(cellElement, ['descriptor-badge--version'], `Version ${version}`, 'tags');
				},
			},
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Resumen/agregados del grid de consulta.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_DESCRIPTOR_PUESTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	// Items del dx-form de generalidades del descriptor.
	getHeaderItems(): any[] {
		return [
			{
				dataField: 'CORR_DESCRIPTOR_PUESTO',
				label: { text: 'Corr.' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'FORMATO',
				label: { text: 'Tipo de formato' },
				colSpan: 1,
				editorType: 'dxSelectBox',
				editorOptions: {
					dataSource: [],
					displayExpr: 'Value',
					valueExpr: 'Key',
					placeholder: 'Seleccione...',
				},
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) =>
							typeof e.value === 'string' && e.value.trim() !== '',
					},
				],
			},
			{
				dataField: 'CORR_UNIDAD',
				label: { text: 'Area' },
				colSpan: 2,
				template: 'CORR_UNIDADLookup',
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) => {
							const value = Number(e.value);
							return !Number.isNaN(value) && value > 0;
						},
					},
				],
			},
			{
				dataField: 'CORR_PUESTO',
				label: { text: 'Titulo del puesto' },
				colSpan: 2,
				template: 'CORR_PUESTOLookup',
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) => {
							const value = Number(e.value);
							return !Number.isNaN(value) && value > 0;
						},
					},
				],
			},
			{
				dataField: 'CORR_PUESTO_REPORTA',
				label: { text: 'Reporta a' },
				colSpan: 2,
				template: 'CORR_PUESTO_REPORTALookup',
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) => {
							const value = Number(e.value);
							return !Number.isNaN(value) && value > 0;
						},
					},
				],
			},
			{
				dataField: 'FECHA_EMISION',
				label: { text: 'Fecha emision' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: {
					type: 'date',
					displayFormat: 'dd/MM/yyyy',
					useMaskBehavior: true,
					dateSerializationFormat: 'yyyy-MM-dd',
				},
				validationRules: [
					{
						type: 'custom',
						message: 'Este campo es obligatorio',
						reevaluate: true,
						validationCallback: (e: { value: unknown }) => !!e.value,
					},
				],
			},
			{
				dataField: 'FECHA_REVISION',
				label: { text: 'Fecha revision' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: {
					type: 'date',
					displayFormat: 'dd/MM/yyyy',
					useMaskBehavior: true,
					dateSerializationFormat: 'yyyy-MM-dd',
				},
			},
			{
				dataField: 'NUM_PERSONAL_CARGO',
				label: { text: 'N personal a cargo' },
				colSpan: 1,
				editorType: 'dxNumberBox',
				editorOptions: { min: 0, showSpinButtons: true },
			},
			{
				dataField: 'VERSION',
				label: { text: 'Version' },
				colSpan: 1,
				editorType: 'dxNumberBox',
				editorOptions: { min: 1, showSpinButtons: true, readOnly: true },
			},
			{
				dataField: 'ESTADO_DESCRIPTOR',
				label: { text: 'Estado' },
				colSpan: 2,
				editorType: 'dxTextBox',
				editorOptions: { readOnly: true },
			},
		];
	}

	// Evita que la zona horaria convierta fechas de negocio en el día anterior al serializar el payload.
	private toApiPayload(model: ScDescriptorPuesto): any {
		return {
			...model,
			FECHA_EMISION: this.formatearDateOnly(model.FECHA_EMISION),
			FECHA_REVISION: this.formatearDateOnly(model.FECHA_REVISION),
		};
	}

	// Normaliza fechas a date-only para el form/API.
	private formatearDateOnly(fecha: Date | string | null): string | null {
		if (!fecha) {
			return null;
		}

		if (typeof fecha === 'string') {
			const soloFecha = fecha.split('T')[0];
			if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
				return soloFecha;
			}
		}

		const date = fecha instanceof Date ? fecha : new Date(fecha);
		if (isNaN(date.getTime())) {
			return null;
		}

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// Arma IParam estandar (empresa + correlativo) para CRUD.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param?.CORR_DESCRIPTOR_PUESTO) {
			xWhere.push({ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: param.CORR_DESCRIPTOR_PUESTO });
		}
		return xWhere;
	}

	// HTML de badge para formato/estado en el grid.
	private renderBadge(
		cellElement: HTMLElement,
		classNames: string[],
		text: string,
		iconClass?: string
	): void {
		cellElement.classList.add('descriptor-badge-cell');

		const badge = document.createElement('span');
		badge.classList.add('descriptor-badge', ...classNames);

		if (iconClass) {
			const icon = document.createElement('i');
			icon.classList.add('dx-icon', `dx-icon-${iconClass}`, 'descriptor-badge__icon');
			icon.setAttribute('aria-hidden', 'true');
			badge.appendChild(icon);
		}

		const label = document.createElement('span');
		label.classList.add('descriptor-badge__label');
		label.textContent = text;
		badge.appendChild(label);

		cellElement.innerHTML = '';
		cellElement.appendChild(badge);
	}

	// Etiqueta legible del formato CORTO/EXTENSO.
	private getFormatoBadgeLabel(formato: string | null | undefined): string {
		const value = (formato ?? '').toUpperCase();
		if (value === FORMATO_EXTENSO) {
			return 'Extensa';
		}
		if (value === FORMATO_CORTO) {
			return 'Corta';
		}
		return formato ?? '';
	}

	// Clase CSS del badge de formato.
	private getFormatoBadgeClass(formato: string | null | undefined): string {
		const value = (formato ?? '').toUpperCase();
		if (value === FORMATO_EXTENSO) {
			return 'descriptor-badge--formato-extensa';
		}
		if (value === FORMATO_CORTO) {
			return 'descriptor-badge--formato-corta';
		}
		return 'descriptor-badge--formato-default';
	}

	// Etiqueta legible del estado del descriptor.
	private getEstadoDescriptorLabel(estado: string | null | undefined): string {
		const value = (estado ?? '').toUpperCase();
		return ESTADO_DESCRIPTOR_LABELS[value] ?? (estado ?? '');
	}

	// Clase CSS del badge de estado.
	private getEstadoDescriptorBadgeClass(estado: string | null | undefined): string {
		const value = (estado ?? '').toUpperCase();
		switch (value) {
			case 'ACTIVO':
				return 'descriptor-badge--estado-activo';
			case 'INACTIVO':
				return 'descriptor-badge--estado-inactivo';
			case 'BORRADOR':
				return 'descriptor-badge--estado-borrador';
			case 'ENVIADO':
				return 'descriptor-badge--estado-enviado';
			case 'REVISADO':
				return 'descriptor-badge--estado-revision';
			default:
				return 'descriptor-badge--estado-default';
		}
	}

	// Los lookups de detalles envían las llaves de la relación y los discriminadores de tipo
	// para que cada grid reciba solo las filas que le corresponden.
	getFuncionesSecundariasLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.funcionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_FUNCION', Value: TIPO_FUNCION_SECUNDARIA },
		]);
	}

	// Carga funciones clave del descriptor.
	getFuncionesClaveLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.funcionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_FUNCION', Value: TIPO_FUNCION_CLAVE },
		]);
	}

	// Carga actividades de una funcion.
	getActividadesLookup(corrDescriptorPuesto: number, corrFuncion: number): Observable<IResult> {
		return this.actividadRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_FUNCION', Value: corrFuncion },
		]);
	}

	// Carga relaciones internas.
	getRelacionesInternasLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.relacionLaboralRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_RELACION', Value: TIPO_RELACION_INTERNA },
		]);
	}

	// Carga relaciones externas.
	getRelacionesExternasLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.relacionLaboralRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_RELACION', Value: TIPO_RELACION_EXTERNA },
		]);
	}

	// Construye un payload uniforme para relaciones internas y externas, y decide entre alta
	// y actualización por la existencia de la llave del detalle.
	persistirRelacionLaboral(
		corrDescriptorPuesto: number,
		relacion: ScDescriptorRelacionLaboral,
		tipoRelacion: string
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_RELACION_LABORAL: relacion.CORR_RELACION_LABORAL ?? 0,
			TIPO_RELACION: tipoRelacion,
			PUESTO_AREA: (relacion.PUESTO_AREA ?? '').trim(),
			MOTIVO_RELACION: (relacion.MOTIVO_RELACION ?? '').trim() || null,
		};

		if (!relacion.CORR_RELACION_LABORAL || relacion.CORR_RELACION_LABORAL <= 0) {
			return this.relacionLaboralRepo.create(payload);
		}

		return this.relacionLaboralRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_RELACION_LABORAL', Value: relacion.CORR_RELACION_LABORAL },
		]);
	}

	// Las eliminaciones validan las llaves antes de llamar al repositorio y devuelven un IResult
	// controlado para que el componente trate el error igual que una respuesta de la API.
	eliminarRelacionLaboral(
		corrDescriptorPuesto: number,
		corrRelacionLaboral: number
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrRelacion = Number(corrRelacionLaboral);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrRelacion || corrRelacion <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la relacion laboral a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.relacionLaboralRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_RELACION_LABORAL', Value: corrRelacion },
		]);
	}

	// Valida fila de funcion clave antes de persistir.
	esValidoFuncionesClave(_funciones: ScDescriptorFuncion[], _msg: Function): boolean {
		return true;
	}

	// Valida fila de actividad antes de persistir.
	esValidoActividades(_actividades: ScDescriptorFuncionActividad[], _msg: Function): boolean {
		return true;
	}

	// Conserva el tipo de función en el payload para que funciones clave y secundarias compartan el flujo CRUD.
	persistirFuncion(
		corrDescriptorPuesto: number,
		funcion: ScDescriptorFuncion,
		tipoFuncion: string
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_FUNCION: funcion.CORR_FUNCION ?? 0,
			NOMBRE_FUNCION: (funcion.NOMBRE_FUNCION ?? '').trim(),
			TIPO_FUNCION: tipoFuncion,
		};

		if (!funcion.CORR_FUNCION || funcion.CORR_FUNCION <= 0) {
			return this.funcionRepo.create(payload);
		}

		return this.funcionRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_FUNCION', Value: funcion.CORR_FUNCION },
		]);
	}

	// Alta de funcion (clave/secundaria) via repositorio.
	crearFuncion(corrDescriptorPuesto: number, tipoFuncion: string): Observable<IResult> {
		return this.persistirFuncion(
			corrDescriptorPuesto,
			{
				CORR_FUNCION: 0,
				NOMBRE_FUNCION: '',
				TIPO_FUNCION: tipoFuncion,
			},
			tipoFuncion
		);
	}

	// Baja de funcion por llave compuesta.
	eliminarFuncion(corrDescriptorPuesto: number, corrFuncion: number): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrFunc = Number(corrFuncion);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrFunc || corrFunc <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la funcion a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.funcionRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_FUNCION', Value: corrFunc },
		]);
	}

	// Una actividad requiere las dos llaves padre; no se envía mientras la función siga siendo temporal.
	persistirActividad(
		corrDescriptorPuesto: number,
		corrFuncion: number,
		actividad: ScDescriptorFuncionActividad
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrFunc = Number(corrFuncion);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrFunc || corrFunc <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe guardar la funcion clave antes de registrar actividades.',
				RowsAffected: 0,
			} as IResult);
		}

		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_FUNCION: corrFunc,
			CORR_ACTIVIDAD: actividad.CORR_ACTIVIDAD ?? 0,
			NOMBRE_ACTIVIDAD: (actividad.NOMBRE_ACTIVIDAD ?? '').trim(),
		};

		if (!actividad.CORR_ACTIVIDAD || actividad.CORR_ACTIVIDAD <= 0) {
			return this.actividadRepo.create(payload);
		}

		return this.actividadRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_FUNCION', Value: corrFunc },
			{ Parameter: 'CORR_ACTIVIDAD', Value: actividad.CORR_ACTIVIDAD },
		]);
	}

	// Alta de actividad de funcion.
	crearActividad(corrDescriptorPuesto: number, corrFuncion: number): Observable<IResult> {
		return this.persistirActividad(corrDescriptorPuesto, corrFuncion, {
			CORR_FUNCION: corrFuncion,
			CORR_ACTIVIDAD: 0,
			NOMBRE_ACTIVIDAD: '',
		});
	}

	// Baja de actividad por llave.
	eliminarActividad(
		corrDescriptorPuesto: number,
		corrFuncion: number,
		corrActividad: number
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrFunc = Number(corrFuncion);
		const corrAct = Number(corrActividad);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrFunc || corrFunc <= 0 || !corrAct || corrAct <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la actividad a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.actividadRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_FUNCION', Value: corrFunc },
			{ Parameter: 'CORR_ACTIVIDAD', Value: corrAct },
		]);
	}

	// Carga KPIs del descriptor (formato corto).
	getKpisLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.kpiRepo.getAll([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto }]);
	}

	// Normaliza los campos opcionales del KPI y usa su correlativo para seleccionar alta o actualización.
	persistirKpi(corrDescriptorPuesto: number, kpi: ScDescriptorKpiFuncion): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_KPI_FUNCION: kpi.CORR_KPI_FUNCION ?? 0,
			NOMBRE_INDICADOR: (kpi.NOMBRE_INDICADOR ?? '').trim(),
			CORR_FRECUENCIA: kpi.CORR_FRECUENCIA ?? null,
			META: kpi.META ?? null,
		};

		if (!kpi.CORR_KPI_FUNCION || kpi.CORR_KPI_FUNCION <= 0) {
			return this.kpiRepo.create(payload);
		}

		return this.kpiRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_KPI_FUNCION', Value: kpi.CORR_KPI_FUNCION },
		]);
	}

	// Alta de KPI.
	crearKpi(corrDescriptorPuesto: number): Observable<IResult> {
		return this.persistirKpi(corrDescriptorPuesto, {
			CORR_KPI_FUNCION: 0,
			NOMBRE_INDICADOR: '',
			CORR_FRECUENCIA: null,
			META: null,
		});
	}

	// Baja de KPI.
	eliminarKpi(corrDescriptorPuesto: number, corrKpiFuncion: number): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrKpi = Number(corrKpiFuncion);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrKpi || corrKpi <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar el KPI a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.kpiRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_KPI_FUNCION', Value: corrKpi },
		]);
	}

	// Carga el perfil padre del descriptor.
	getPerfilLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.perfilRepo.getAll([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto }]);
	}

	// Carga educacion del perfil.
	getEducacionLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.educacionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Los payloads de Perfil incluyen descriptor y perfil porque sus detalles dependen de ambas llaves.
	// Los códigos de catálogo se normalizan en mayúsculas y los textos vacíos se envían como null.
	persistirEducacion(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		educacion: ScPerfilPuestoEducacion
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_EDUCACION: educacion.CORR_EDUCACION ?? 0,
			REQUISITO: (educacion.REQUISITO ?? '').trim() || null,
			ESPECIFICACIONES: (educacion.ESPECIFICACIONES ?? '').trim() || null,
			TIPO_REQUERIDO: (educacion.TIPO_REQUERIDO ?? '').trim().toUpperCase() || null,
		};

		if (!educacion.CORR_EDUCACION || educacion.CORR_EDUCACION <= 0) {
			return this.educacionRepo.create(payload);
		}

		return this.educacionRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_EDUCACION', Value: educacion.CORR_EDUCACION },
		]);
	}

	// Baja de educacion del perfil.
	eliminarEducacion(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		corrEducacion: number
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const corrEdu = Number(corrEducacion);
		if (
			!corrDescriptor ||
			corrDescriptor <= 0 ||
			!corrPerfil ||
			corrPerfil <= 0 ||
			!corrEdu ||
			corrEdu <= 0
		) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la educacion a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.educacionRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_EDUCACION', Value: corrEdu },
		]);
	}

	// Carga experiencia del perfil.
	getExperienciaLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.experienciaRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Inserta o actualiza experiencia segun tenga correlativo.
	persistirExperiencia(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		experiencia: ScPerfilPuestoExperiencia
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_EXPERIENCIA: experiencia.CORR_EXPERIENCIA ?? 0,
			REQUISITO: (experiencia.REQUISITO ?? '').trim() || null,
			TIPO_REQUERIDO: (experiencia.TIPO_REQUERIDO ?? '').trim().toUpperCase() || null,
		};

		if (!experiencia.CORR_EXPERIENCIA || experiencia.CORR_EXPERIENCIA <= 0) {
			return this.experienciaRepo.create(payload);
		}

		return this.experienciaRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_EXPERIENCIA', Value: experiencia.CORR_EXPERIENCIA },
		]);
	}

	// Baja de experiencia del perfil.
	eliminarExperiencia(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		corrExperiencia: number
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const corrExp = Number(corrExperiencia);
		if (
			!corrDescriptor ||
			corrDescriptor <= 0 ||
			!corrPerfil ||
			corrPerfil <= 0 ||
			!corrExp ||
			corrExp <= 0
		) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la experiencia a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.experienciaRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_EXPERIENCIA', Value: corrExp },
		]);
	}

	// Carga competencias tecnicas del perfil.
	getCompetenciasTecnicasLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.competenciasTecnicasRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Las competencias conservan la llave del catálogo y el texto descriptivo capturado en el grid;
	// la actualización se identifica por la llave única del vínculo con el perfil.
	persistirCompetenciaTecnica(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		row: ScPerfilPuestoCompetenciasTecnicas
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS: row.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS ?? 0,
			NOMBRE_COMPETENCIAS_TECNICAS: (row.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim() || null,
			DESCRIPCION: (row.DESCRIPCION ?? '').trim() || null,
			NIVEL_DOMINIO: (row.NIVEL_DOMINIO ?? '').trim().toUpperCase() || null,
			CORR_COMPETENCIAS_TECNICAS: row.CORR_COMPETENCIAS_TECNICAS ?? null,
		};

		if (!row.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS || row.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS <= 0) {
			return this.competenciasTecnicasRepo.create(payload);
		}

		return this.competenciasTecnicasRepo.update(payload, [
			{
				Parameter: 'CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS',
				Value: row.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS,
			},
		]);
	}

	// Baja de competencia tecnica.
	eliminarCompetenciaTecnica(corrPerfilPuestoCompetenciasTecnicas: number): Observable<IResult> {
		const corr = Number(corrPerfilPuestoCompetenciasTecnicas);
		if (!corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la competencia tecnica a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.competenciasTecnicasRepo.delete([
			{ Parameter: 'CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS', Value: corr },
		]);
	}

	// Carga competencias conductuales del perfil.
	getCompetenciasConductualesLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.competenciasConductualesRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Inserta o actualiza competencia conductual.
	persistirCompetenciaConductual(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		row: ScPerfilPuestoCompetenciasConductuales
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES: row.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES ?? 0,
			NOMBRE_COMPETENCIAS_CONDUCTUALES: (row.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim() || null,
			DESCRIPCION: (row.DESCRIPCION ?? '').trim() || null,
			CORR_COMPETENCIAS_CONDUCTUALES: row.CORR_COMPETENCIAS_CONDUCTUALES ?? null,
		};

		if (
			!row.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES ||
			row.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES <= 0
		) {
			return this.competenciasConductualesRepo.create(payload);
		}

		return this.competenciasConductualesRepo.update(payload, [
			{
				Parameter: 'CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES',
				Value: row.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES,
			},
		]);
	}

	// Baja de competencia conductual.
	eliminarCompetenciaConductual(corrPerfilPuestoCompetenciasConductuales: number): Observable<IResult> {
		const corr = Number(corrPerfilPuestoCompetenciasConductuales);
		if (!corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la competencia conductual a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.competenciasConductualesRepo.delete([
			{ Parameter: 'CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES', Value: corr },
		]);
	}

	// Carga requerimientos del descriptor.
	getRequerimientosOrganizacionalesLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.requerimientosOrganizacionalesRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
		]);
	}

	// Requerimientos, riesgos y responsabilidades convierten selecciones de catálogo en vínculos
	// del descriptor, manteniendo null para valores realmente opcionales.
	persistirRequerimientoOrganizacional(
		corrDescriptorPuesto: number,
		row: ScDescriptorPuestoRequerimientoOrganizacional
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL: row.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL ?? 0,
			DESCRIPCION: (row.DESCRIPCION ?? '').trim() || null,
			CORR_REQUERIMIENTO_ORGANIZACIONAL: row.CORR_REQUERIMIENTO_ORGANIZACIONAL ?? null,
		};

		if (
			!row.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL ||
			row.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL <= 0
		) {
			return this.requerimientosOrganizacionalesRepo.create(payload);
		}

		return this.requerimientosOrganizacionalesRepo.update(payload, [
			{
				Parameter: 'CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL',
				Value: row.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL,
			},
		]);
	}

	// Baja de requerimiento organizacional.
	eliminarRequerimientoOrganizacional(corrDescriptorRequerimientoOrganizacional: number): Observable<IResult> {
		const corr = Number(corrDescriptorRequerimientoOrganizacional);
		if (!corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar el requerimiento organizacional a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.requerimientosOrganizacionalesRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL', Value: corr },
		]);
	}

	// Carga riesgos del descriptor.
	getRiesgosPuestoLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.riesgosPuestoRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
		]);
	}

	// Inserta o actualiza riesgo del puesto.
	persistirRiesgoPuesto(
		corrDescriptorPuesto: number,
		row: ScDescriptorPuestoRiesgoPuesto
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_DESCRIPTOR_RIESGO: row.CORR_DESCRIPTOR_RIESGO ?? 0,
			NOMBRE_RIESGO_PUESTO: (row.NOMBRE_RIESGO_PUESTO ?? '').trim() || null,
			INFORMACION: (row.INFORMACION ?? '').trim() || null,
			CORR_RIESGO_PUESTO: row.CORR_RIESGO_PUESTO ?? null,
		};

		if (!row.CORR_DESCRIPTOR_RIESGO || row.CORR_DESCRIPTOR_RIESGO <= 0) {
			return this.riesgosPuestoRepo.create(payload);
		}

		return this.riesgosPuestoRepo.update(payload, [
			{
				Parameter: 'CORR_DESCRIPTOR_RIESGO',
				Value: row.CORR_DESCRIPTOR_RIESGO,
			},
		]);
	}

	// Baja de riesgo del puesto.
	eliminarRiesgoPuesto(corrDescriptorRiesgo: number): Observable<IResult> {
		const corr = Number(corrDescriptorRiesgo);
		if (!corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar el riesgo del descriptor a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.riesgosPuestoRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_RIESGO', Value: corr },
		]);
	}

	// Carga responsabilidades del cargo.
	getResponsabilidadesCargoLookup(corrDescriptorPuesto: number, formato: string): Observable<IResult> {
		return this.responsabilidadesCargoRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'FORMATO', Value: (formato || 'CORTO').trim().toUpperCase() },
		]);
	}

	// Inserta o actualiza responsabilidad del cargo.
	persistirResponsabilidadCargo(
		corrDescriptorPuesto: number,
		row: ScDescriptorPuestoResponsabilidadCargo
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_DESCRIPTOR_RESPONSABILIDAD: row.CORR_DESCRIPTOR_RESPONSABILIDAD ?? 0,
			NOMBRE_RESPONSABILIDAD: (row.NOMBRE_RESPONSABILIDAD ?? '').trim() || null,
			INFORMACION: (row.INFORMACION ?? '').trim() || null,
			APLICA_DESCRIPTOR: (row.APLICA_DESCRIPTOR ?? 'AMBOS').trim().toUpperCase(),
			CORR_RESPONSABILIDAD: row.CORR_RESPONSABILIDAD ?? null,
		};

		if (!row.CORR_DESCRIPTOR_RESPONSABILIDAD || row.CORR_DESCRIPTOR_RESPONSABILIDAD <= 0) {
			return this.responsabilidadesCargoRepo.create(payload);
		}

		return this.responsabilidadesCargoRepo.update(payload, [
			{
				Parameter: 'CORR_DESCRIPTOR_RESPONSABILIDAD',
				Value: row.CORR_DESCRIPTOR_RESPONSABILIDAD,
			},
		]);
	}

	// Baja de responsabilidad del cargo.
	eliminarResponsabilidadCargo(corrDescriptorResponsabilidad: number): Observable<IResult> {
		const corr = Number(corrDescriptorResponsabilidad);
		if (!corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la responsabilidad del descriptor a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.responsabilidadesCargoRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_RESPONSABILIDAD', Value: corr },
		]);
	}

	// El perfil funciona como registro padre de varios detalles. La bandera existe evita duplicarlo
	// cuando ya cuenta con correlativo, pero permite crearlo al guardar por primera vez.
	persistirPerfil(
		corrDescriptorPuesto: number,
		perfil: ScDescriptorPerfilPuesto,
		existe: boolean
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(perfil.CORR_PERFIL_PUESTO ?? 0);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: corrPerfil > 0 ? corrPerfil : 0,
			EDAD_MINIMA: perfil.EDAD_MINIMA ?? null,
			EDAD_MAXIMA: perfil.EDAD_MAXIMA ?? null,
			SEXO: (perfil.SEXO ?? '').trim().toUpperCase() || null,
			ESTADO_FAMILIAR: (perfil.ESTADO_FAMILIAR ?? '').trim().toUpperCase() || null,
			CORR_DISPONIBILIDAD_HORARIO: perfil.CORR_DISPONIBILIDAD_HORARIO ?? null,
			CORR_TIPO_MODALIDAD: perfil.CORR_TIPO_MODALIDAD ?? null,
			LICENCIA: perfil.LICENCIA ?? false,
		};

		if (!existe || corrPerfil <= 0) {
			return this.perfilRepo.create(payload);
		}

		return this.perfilRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
		]);
	}

	// Sincroniza eliminaciones y filas activas en orden. Para funciones clave recién creadas,
	// encadena después sus actividades pendientes usando el correlativo devuelto por la API.
	private sincronizarFunciones(
		corrDescriptorPuesto: number,
		funciones: ScDescriptorFuncion[],
		eliminadas: number[],
		tipoFuncion: string,
		persistirActividadesPendientes: boolean
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		if (!corrDescriptor || corrDescriptor <= 0) {
			return of({ Result: true, Data: null, ErrorCode: 0, ErrorMessage: '', RowsAffected: 0 } as IResult);
		}

		const deleteCalls = (eliminadas ?? [])
			.filter((corr) => corr > 0)
			.map((corrFuncion) =>
				this.funcionRepo.delete([
					{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
					{ Parameter: 'CORR_FUNCION', Value: corrFuncion },
				])
			);

		const activas = (funciones ?? []).filter((item) => !item._marcadaEliminar);
		const deleteFlow =
			deleteCalls.length > 0
				? forkJoin(deleteCalls)
				: of([] as IResult[]);

		return deleteFlow.pipe(
			concatMap((deleteResponses) => {
				const deleteFailed = deleteResponses.find((response) => !response?.Result);
				if (deleteFailed) {
					return of(deleteFailed);
				}

				if (activas.length === 0) {
					return of({
						Result: true,
						Data: null,
						ErrorCode: 0,
						ErrorMessage: '',
						RowsAffected: deleteResponses.length,
					} as IResult);
				}

				return from(activas).pipe(
					concatMap((funcion) =>
						this.persistirFuncion(corrDescriptor, funcion, tipoFuncion).pipe(
							concatMap((response) => {
								if (!response?.Result || !persistirActividadesPendientes) {
									return of(response);
								}

								const corrFuncion =
									Number((response.Data as ScDescriptorFuncion)?.CORR_FUNCION) ||
									Number(funcion.CORR_FUNCION) ||
									0;
								const pendientes = (funcion.actividadesPendientes ?? []).filter(
									(item) => !item._marcadaEliminar
								);

								if (corrFuncion <= 0 || pendientes.length === 0) {
									return of(response);
								}

								return this.guardarActividadesFuncion(corrDescriptor, corrFuncion, pendientes, []).pipe(
									map((actividadesResponse) => (actividadesResponse.Result ? response : actividadesResponse))
								);
							})
						)
					),
					toArray(),
					map((responses) => {
						const failed = responses.find((response) => !response?.Result);
						if (failed) {
							return failed;
						}

						const saved = responses
							.filter((response) => response?.Data)
							.map((response) => response.Data as ScDescriptorFuncion);

						return {
							Result: true,
							Data: saved,
							ErrorCode: 0,
							ErrorMessage: '',
							RowsAffected: responses.length + deleteResponses.length,
						} as IResult;
					})
				);
			})
		);
	}

	// Persiste lote/cambios de funciones clave desde el componente.
	guardarFuncionesClave(
		corrDescriptorPuesto: number,
		funciones: ScDescriptorFuncion[],
		eliminadas: number[]
	): Observable<IResult> {
		return this.sincronizarFunciones(
			corrDescriptorPuesto,
			funciones,
			eliminadas,
			TIPO_FUNCION_CLAVE,
			true
		);
	}

	// Persiste lote/cambios de funciones secundarias desde el componente.
	guardarFuncionesSecundarias(
		corrDescriptorPuesto: number,
		funciones: ScDescriptorFuncion[],
		eliminadas: number[]
	): Observable<IResult> {
		return this.sincronizarFunciones(
			corrDescriptorPuesto,
			funciones,
			eliminadas,
			TIPO_FUNCION_SECUNDARIA,
			false
		);
	}

	// Ejecuta en una sola espera las altas, actualizaciones y eliminaciones de actividades,
	// y propaga la primera respuesta fallida para conservar el detalle del error.
	guardarActividadesFuncion(
		corrDescriptorPuesto: number,
		corrFuncion: number,
		actividades: ScDescriptorFuncionActividad[],
		eliminadas: number[]
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrFunc = Number(corrFuncion);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrFunc || corrFunc <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe guardar la funcion clave antes de registrar actividades.',
				RowsAffected: 0,
			} as IResult);
		}

		const deleteCalls = (eliminadas ?? [])
			.filter((corr) => corr > 0)
			.map((corrActividad) =>
				this.actividadRepo.delete([
					{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
					{ Parameter: 'CORR_FUNCION', Value: corrFunc },
					{ Parameter: 'CORR_ACTIVIDAD', Value: corrActividad },
				])
			);

		const activas = (actividades ?? []).filter((item) => !item._marcadaEliminar);
		const saveCalls = activas.map((actividad) => {
			const payload = {
				CORR_DESCRIPTOR_PUESTO: corrDescriptor,
				CORR_FUNCION: corrFunc,
				CORR_ACTIVIDAD: actividad.CORR_ACTIVIDAD ?? 0,
				NOMBRE_ACTIVIDAD: (actividad.NOMBRE_ACTIVIDAD ?? '').trim(),
			};

			if (!actividad.CORR_ACTIVIDAD || actividad.CORR_ACTIVIDAD <= 0) {
				return this.actividadRepo.create(payload);
			}

			return this.actividadRepo.update(payload, [
				{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
				{ Parameter: 'CORR_FUNCION', Value: corrFunc },
				{ Parameter: 'CORR_ACTIVIDAD', Value: actividad.CORR_ACTIVIDAD },
			]);
		});

		const allCalls = [...deleteCalls, ...saveCalls];
		if (allCalls.length === 0) {
			return of({ Result: true, Data: [], ErrorCode: 0, ErrorMessage: '', RowsAffected: 0 } as IResult);
		}

		return forkJoin(allCalls).pipe(
			map((responses) => {
				const failed = responses.find((response) => !response?.Result);
				if (failed) {
					return failed;
				}

				const saved = responses
					.filter((response) => response?.Data)
					.map((response) => response.Data as ScDescriptorFuncionActividad);

				return {
					Result: true,
					Data: saved,
					ErrorCode: 0,
					ErrorMessage: '',
					RowsAffected: responses.length,
				} as IResult;
			})
		);
	}
}
