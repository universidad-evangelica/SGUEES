// Qué hace: coordina validaciones, columnas del grid y operaciones del descriptor y sus detalles.
// Cómo: usa los repositorios para llamar a la API; el componente solo consume los resultados.

import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { ScDescriptorPuestoFuncionActividad } from './sc-descriptor-puesto-funcion-actividad/models/sc-descriptor-puesto-funcion-actividad';
import { ScDescriptorPuestoFuncionActividadRepository } from './sc-descriptor-puesto-funcion-actividad/sc-descriptor-puesto-funcion-actividad.repository';
import { ScDescriptorPuestoFuncion } from './sc-descriptor-puesto-funcion/models/sc-descriptor-puesto-funcion';
import { ScDescriptorPuestoFuncionRepository } from './sc-descriptor-puesto-funcion/sc-descriptor-puesto-funcion.repository';
import { ScDescriptorPuestoRelacionLaboral } from './sc-descriptor-puesto-relacion-laboral/models/sc-descriptor-puesto-relacion-laboral';
import { ScDescriptorPuestoRelacionLaboralRepository } from './sc-descriptor-puesto-relacion-laboral/sc-descriptor-puesto-relacion-laboral.repository';
import { ScDescriptorPuestoKpiFuncion } from './sc-descriptor-puesto-kpi-funcion/models/sc-descriptor-puesto-kpi-funcion';
import { ScDescriptorPuestoKpiFuncionRepository } from './sc-descriptor-puesto-kpi-funcion/sc-descriptor-puesto-kpi-funcion.repository';
import { ScPerfilPuesto } from './sc-perfil-puesto/models/sc-perfil-puesto';
import { ScPerfilPuestoRepository } from './sc-perfil-puesto/sc-perfil-puesto.repository';
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
import { ScDescriptorPuestoInduccion } from './sc-descriptor-puesto-induccion/models/sc-descriptor-puesto-induccion';
import { ScDescriptorPuestoInduccionRepository } from './sc-descriptor-puesto-induccion/sc-descriptor-puesto-induccion.repository';
import { ScDescriptorPuestoResponsabilidadCargo } from './sc-descriptor-puesto-responsabilidad-cargo/models/sc-descriptor-puesto-responsabilidad-cargo';
import { ScDescriptorPuestoResponsabilidadCargoRepository } from './sc-descriptor-puesto-responsabilidad-cargo/sc-descriptor-puesto-responsabilidad-cargo.repository';
import {
	ESTADOS_DESCRIPTOR_BLOQUEO_CREACION,
	FORMATO_AMBOS,
	FORMATO_CORTO,
	FORMATO_EXTENSO,
	ScDescriptorPuesto,
	TIPO_FUNCION_CLAVE,
	TIPO_FUNCION_SECUNDARIA,
	TIPO_RELACION_EXTERNA,
	TIPO_RELACION_INTERNA,
} from './models/sc-descriptor-puesto';
import { ScDescriptorPuestoRepository } from './sc-descriptor-puesto.repository';

// Qué hace: textos legibles de cada estado del descriptor para los badges del grid.
const ESTADO_DESCRIPTOR_LABELS: Record<string, string> = {
	BORRADOR: 'Borrador',
	ENVIADO: 'Enviado',
	REVISADO: 'En revision',
	ACTIVO: 'Activo',
	INACTIVO: 'Inactivo',
};

// Qué hace: expone la lógica de negocio del descriptor y de todas sus secciones de detalle.
@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoService {
	constructor(
		private repo: ScDescriptorPuestoRepository,
		private funcionRepo: ScDescriptorPuestoFuncionRepository,
		private actividadRepo: ScDescriptorPuestoFuncionActividadRepository,
		private kpiRepo: ScDescriptorPuestoKpiFuncionRepository,
		private perfilRepo: ScPerfilPuestoRepository,
		private educacionRepo: ScPerfilPuestoEducacionRepository,
		private experienciaRepo: ScPerfilPuestoExperienciaRepository,
		private competenciasTecnicasRepo: ScPerfilPuestoCompetenciasTecnicasRepository,
		private competenciasConductualesRepo: ScPerfilPuestoCompetenciasConductualesRepository,
		private requerimientosOrganizacionalesRepo: ScDescriptorPuestoRequerimientoOrganizacionalRepository,
		private riesgosPuestoRepo: ScDescriptorPuestoRiesgoPuestoRepository,
		private responsabilidadesCargoRepo: ScDescriptorPuestoResponsabilidadCargoRepository,
		private relacionLaboralRepo: ScDescriptorPuestoRelacionLaboralRepository,
		private induccionesRepo: ScDescriptorPuestoInduccionRepository
	) {}

	// Qué hace: valida campos obligatorios del encabezado y límites de longitud.
	// Cómo: revisa formato, área, puesto, reporta a, fecha y objetivo; muestra advertencia si falla.
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
			msg('Debe seleccionar a quien reporta (jefe de la unidad).', NotifyType.Warning);
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

	// Qué hace: busca otro descriptor del mismo puesto en estado que impida crear una versión paralela.
	// Cómo: filtra la lista por puesto y estado bloqueante; en edición excluye el registro actual.
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

	// Qué hace: impide guardar si ya existe otro descriptor bloqueante para el mismo puesto.
	// Cómo: usa buscarDescriptorBloqueoPorPuesto y muestra el mensaje de conflicto si encuentra uno.
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

	// Qué hace: arma el código legible del descriptor (por ejemplo DES-0001).
	buildCodigoDescriptor(corrDescriptor: number | null | undefined): string {
		const corr = Number(corrDescriptor);
		if (!corr || corr <= 0) {
			return 'DES-0000';
		}

		return `DES-${String(corr).padStart(4, '0')}`;
	}

	// Qué hace: arma el mensaje de advertencia cuando ya existe un descriptor abierto del puesto.
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

	// Qué hace: lista descriptores según filtros.
	// Cómo: llama a la API con los filtros armados en buildWhere.
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	// Qué hace: obtiene un descriptor por su correlativo.
	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: param.CORR_DESCRIPTOR_PUESTO }]);
	}

	// Qué hace: crea un descriptor nuevo.
	// Cómo: formatea las fechas a solo día y llama a create del repositorio.
	insert(model: any): Observable<IResult> {
		return this.repo.create(this.toApiPayload(model));
	}

	// Qué hace: actualiza el descriptor principal.
	// Cómo: formatea las fechas a solo día y llama a la API con la llave del descriptor.
	update(model: any): Observable<IResult> {
		return this.repo.update(this.toApiPayload(model), [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: model.CORR_DESCRIPTOR_PUESTO },
		]);
	}

	// Qué hace: elimina un descriptor por su correlativo.
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: model.CORR_DESCRIPTOR_PUESTO }]);
	}

	// Qué hace: define las columnas del grid de consulta, incluidos badges de formato, estado y versión.
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

	// Qué hace: define el resumen de totales del grid de consulta.
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

	// Qué hace: define los campos del formulario de generalidades del descriptor.
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
				visible: false,
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

	// Qué hace: prepara el modelo para enviar a la API con fechas en formato yyyy-MM-dd.
	// Cómo: copia el modelo y convierte FECHA_EMISION y FECHA_REVISION a solo día.
	private toApiPayload(model: ScDescriptorPuesto): any {
		return {
			...model,
			FECHA_EMISION: this.formatearDateOnly(model.FECHA_EMISION),
			FECHA_REVISION: this.formatearDateOnly(model.FECHA_REVISION),
		};
	}

	// Qué hace: convierte una fecha a texto yyyy-MM-dd sin hora.
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

	// Qué hace: arma los filtros de consulta a partir de los parámetros recibidos.
	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param?.CORR_DESCRIPTOR_PUESTO) {
			xWhere.push({ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: param.CORR_DESCRIPTOR_PUESTO });
		}
		return xWhere;
	}

	// Qué hace: pinta un badge HTML en una celda del grid.
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

	// Qué hace: devuelve la etiqueta legible del formato (Corta, Extensa o Ambos).
	private getFormatoBadgeLabel(formato: string | null | undefined): string {
		const value = (formato ?? '').toUpperCase();
		if (value === FORMATO_EXTENSO) {
			return 'Extensa';
		}
		if (value === FORMATO_CORTO) {
			return 'Corta';
		}
		if (value === FORMATO_AMBOS) {
			return 'Ambos';
		}
		return formato ?? '';
	}

	// Qué hace: devuelve la clase CSS del badge según el formato.
	private getFormatoBadgeClass(formato: string | null | undefined): string {
		const value = (formato ?? '').toUpperCase();
		if (value === FORMATO_EXTENSO) {
			return 'descriptor-badge--formato-extensa';
		}
		if (value === FORMATO_CORTO) {
			return 'descriptor-badge--formato-corta';
		}
		if (value === FORMATO_AMBOS) {
			return 'descriptor-badge--formato-ambos';
		}
		return 'descriptor-badge--formato-default';
	}

	// Qué hace: devuelve la etiqueta legible del estado del descriptor.
	private getEstadoDescriptorLabel(estado: string | null | undefined): string {
		const value = (estado ?? '').toUpperCase();
		return ESTADO_DESCRIPTOR_LABELS[value] ?? (estado ?? '');
	}

	// Qué hace: devuelve la clase CSS del badge según el estado del descriptor.
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

	// Qué hace: lista funciones secundarias del descriptor.
	// Cómo: llama a la API con descriptor y TIPO_FUNCION secundaria.
	getFuncionesSecundariasLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.funcionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_FUNCION', Value: TIPO_FUNCION_SECUNDARIA },
		]);
	}

	// Qué hace: lista funciones clave del descriptor.
	// Cómo: llama a la API con descriptor y TIPO_FUNCION clave.
	getFuncionesClaveLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.funcionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_FUNCION', Value: TIPO_FUNCION_CLAVE },
		]);
	}

	// Qué hace: lista actividades de una función.
	// Cómo: llama a la API con descriptor y correlativo de función.
	getActividadesLookup(corrDescriptorPuesto: number, corrFuncion: number): Observable<IResult> {
		return this.actividadRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_FUNCION', Value: corrFuncion },
		]);
	}

	// Qué hace: lista relaciones internas del descriptor.
	// Cómo: llama a la API con descriptor y TIPO_RELACION interna.
	getRelacionesInternasLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.relacionLaboralRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_RELACION', Value: TIPO_RELACION_INTERNA },
		]);
	}

	// Qué hace: lista relaciones externas del descriptor.
	// Cómo: llama a la API con descriptor y TIPO_RELACION externa.
	getRelacionesExternasLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.relacionLaboralRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_RELACION', Value: TIPO_RELACION_EXTERNA },
		]);
	}

	// Qué hace: guarda una relación laboral (interna o externa).
	// Cómo: arma el objeto a enviar y llama a create o update según tenga correlativo.
	persistirRelacionLaboral(
		corrDescriptorPuesto: number,
		relacion: ScDescriptorPuestoRelacionLaboral,
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

	// Qué hace: elimina una relación laboral.
	// Cómo: valida las llaves; si faltan devuelve error local, si no llama a delete del repositorio.
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

	// Qué hace: valida filas de funciones clave antes de persistir (sin reglas adicionales por ahora).
	esValidoFuncionesClave(_funciones: ScDescriptorPuestoFuncion[], _msg: Function): boolean {
		return true;
	}

	// Qué hace: valida filas de actividades antes de persistir (sin reglas adicionales por ahora).
	esValidoActividades(_actividades: ScDescriptorPuestoFuncionActividad[], _msg: Function): boolean {
		return true;
	}

	// Qué hace: guarda una función (clave o secundaria).
	// Cómo: arma el objeto con TIPO_FUNCION y llama a create o update según tenga correlativo.
	persistirFuncion(
		corrDescriptorPuesto: number,
		funcion: ScDescriptorPuestoFuncion,
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

	// Qué hace: crea una función vacía (clave o secundaria).
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

	// Qué hace: elimina una función.
	// Cómo: valida las llaves; si faltan devuelve error local, si no llama a delete del repositorio.
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

	// Qué hace: guarda una actividad de una función.
	// Cómo: exige descriptor y función guardados; arma el objeto y llama a create o update.
	persistirActividad(
		corrDescriptorPuesto: number,
		corrFuncion: number,
		actividad: ScDescriptorPuestoFuncionActividad
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

	// Qué hace: crea una actividad vacía para una función.
	crearActividad(corrDescriptorPuesto: number, corrFuncion: number): Observable<IResult> {
		return this.persistirActividad(corrDescriptorPuesto, corrFuncion, {
			CORR_FUNCION: corrFuncion,
			CORR_ACTIVIDAD: 0,
			NOMBRE_ACTIVIDAD: '',
		});
	}

	// Qué hace: elimina una actividad.
	// Cómo: valida las llaves; si faltan devuelve error local, si no llama a delete del repositorio.
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

	// Qué hace: lista los KPI del descriptor (formato corto).
	getKpisLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.kpiRepo.getAll([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto }]);
	}

	// Qué hace: guarda un KPI del descriptor.
	// Cómo: arma el objeto con campos recortados y llama a create o update según tenga correlativo.
	persistirKpi(corrDescriptorPuesto: number, kpi: ScDescriptorPuestoKpiFuncion): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_KPI_FUNCION: kpi.CORR_KPI_FUNCION ?? 0,
			NOMBRE_INDICADOR: (kpi.NOMBRE_INDICADOR ?? '').trim(),
			CORR_FRECUENCIA: kpi.CORR_FRECUENCIA ?? null,
			NOMBRE_FRECUENCIA: (kpi.NOMBRE_FRECUENCIA ?? '').trim(),
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

	// Qué hace: crea un KPI vacío.
	crearKpi(corrDescriptorPuesto: number): Observable<IResult> {
		return this.persistirKpi(corrDescriptorPuesto, {
			CORR_KPI_FUNCION: 0,
			NOMBRE_INDICADOR: '',
			CORR_FRECUENCIA: null,
			NOMBRE_FRECUENCIA: '',
			META: null,
		});
	}

	// Qué hace: elimina un KPI.
	// Cómo: valida las llaves; si faltan devuelve error local, si no llama a delete del repositorio.
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

	// Qué hace: obtiene el perfil de puesto del descriptor.
	getPerfilLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.perfilRepo.getAll([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto }]);
	}

	// Qué hace: lista la educación de un perfil.
	// Cómo: llama a la API con descriptor y correlativo de perfil.
	getEducacionLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.educacionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Qué hace: guarda un registro de educación del perfil.
	// Cómo: arma el objeto con descriptor y perfil; convierte textos vacíos a null y llama a create o update.
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

	// Qué hace: elimina un registro de educación del perfil.
	// Cómo: valida las llaves; si faltan devuelve error local, si no llama a delete del repositorio.
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

	// Qué hace: lista la experiencia de un perfil.
	// Cómo: llama a la API con descriptor y correlativo de perfil.
	getExperienciaLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.experienciaRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Qué hace: guarda un registro de experiencia del perfil.
	// Cómo: arma el objeto y llama a create o update según tenga correlativo.
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

	// Qué hace: elimina un registro de experiencia del perfil.
	// Cómo: valida las llaves; si faltan devuelve error local, si no llama a delete del repositorio.
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

	// Qué hace: lista las competencias técnicas de un perfil.
	// Cómo: llama a la API con descriptor y correlativo de perfil.
	getCompetenciasTecnicasLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.competenciasTecnicasRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Qué hace: guarda una competencia técnica del perfil.
	// Cómo: arma el objeto con catálogo y descripción; decide crear o actualizar segun row._esNuevo,
	// usando descriptor + perfil + catálogo como llave natural en el update.
	persistirCompetenciaTecnica(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		row: ScPerfilPuestoCompetenciasTecnicas
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const corrCompetencia = Number(row.CORR_COMPETENCIAS_TECNICAS) || 0;
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: corrPerfil,
			CODIGO_COMPETENCIAS_TECNICAS: (row.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim() || null,
			NOMBRE_COMPETENCIAS_TECNICAS: (row.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim() || null,
			DESCRIPCION: (row.DESCRIPCION ?? '').trim() || null,
			NIVEL_DOMINIO: (row.NIVEL_DOMINIO ?? '').trim().toUpperCase() || null,
			CORR_COMPETENCIAS_TECNICAS: corrCompetencia || null,
		};

		if (row._esNuevo) {
			return this.competenciasTecnicasRepo.create(payload);
		}

		return this.competenciasTecnicasRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: corrCompetencia },
		]);
	}

	// Qué hace: elimina una competencia técnica del perfil.
	// Cómo: valida la llave natural (descriptor, perfil y catálogo); si falta devuelve error local,
	// si no llama a delete del repositorio con esa llave compuesta.
	eliminarCompetenciaTecnica(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		corrCompetenciasTecnicas: number
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const corrCompetencia = Number(corrCompetenciasTecnicas);
		if (
			!corrDescriptor ||
			corrDescriptor <= 0 ||
			!corrPerfil ||
			corrPerfil <= 0 ||
			!corrCompetencia ||
			corrCompetencia <= 0
		) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la competencia tecnica a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.competenciasTecnicasRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_COMPETENCIAS_TECNICAS', Value: corrCompetencia },
		]);
	}

	// Qué hace: lista las competencias conductuales de un perfil.
	// Cómo: llama a la API con descriptor y correlativo de perfil.
	getCompetenciasConductualesLookup(corrDescriptorPuesto: number, corrPerfilPuesto: number): Observable<IResult> {
		return this.competenciasConductualesRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfilPuesto },
		]);
	}

	// Qué hace: guarda una competencia conductual del perfil.
	// Cómo: arma el objeto y decide crear o actualizar segun row._esNuevo, usando descriptor + perfil +
	// catálogo como llave natural en el update.
	persistirCompetenciaConductual(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		row: ScPerfilPuestoCompetenciasConductuales
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const corrCompetencia = Number(row.CORR_COMPETENCIAS_CONDUCTUALES) || 0;
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: corrPerfil,
			CODIGO_TIPO_PUESTO: (row.CODIGO_TIPO_PUESTO ?? '').trim() || null,
			NOMBRE_COMPETENCIAS_CONDUCTUALES: (row.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim() || null,
			DESCRIPCION: (row.DESCRIPCION ?? '').trim() || null,
			CORR_COMPETENCIAS_CONDUCTUALES: corrCompetencia || null,
		};

		if (row._esNuevo) {
			return this.competenciasConductualesRepo.create(payload);
		}

		return this.competenciasConductualesRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: corrCompetencia },
		]);
	}

	// Qué hace: elimina una competencia conductual del perfil.
	// Cómo: valida la llave natural (descriptor, perfil y catálogo); si falta devuelve error local,
	// si no llama a delete del repositorio con esa llave compuesta.
	eliminarCompetenciaConductual(
		corrDescriptorPuesto: number,
		corrPerfilPuesto: number,
		corrCompetenciasConductuales: number
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrPerfil = Number(corrPerfilPuesto);
		const corrCompetencia = Number(corrCompetenciasConductuales);
		if (
			!corrDescriptor ||
			corrDescriptor <= 0 ||
			!corrPerfil ||
			corrPerfil <= 0 ||
			!corrCompetencia ||
			corrCompetencia <= 0
		) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la competencia conductual a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.competenciasConductualesRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_PERFIL_PUESTO', Value: corrPerfil },
			{ Parameter: 'CORR_COMPETENCIAS_CONDUCTUALES', Value: corrCompetencia },
		]);
	}

	// Qué hace: lista los requerimientos organizacionales del descriptor.
	getRequerimientosOrganizacionalesLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.requerimientosOrganizacionalesRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
		]);
	}

	// Qué hace: guarda un requerimiento organizacional del descriptor.
	// Cómo: arma el objeto con catálogo y descripción; decide crear o actualizar segun row._esNuevo,
	// usando descriptor + catálogo como llave natural en el update.
	persistirRequerimientoOrganizacional(
		corrDescriptorPuesto: number,
		row: ScDescriptorPuestoRequerimientoOrganizacional
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrRequerimiento = Number(row.CORR_REQUERIMIENTO_ORGANIZACIONAL) || 0;
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			DESCRIPCION: (row.DESCRIPCION ?? '').trim() || null,
			CORR_REQUERIMIENTO_ORGANIZACIONAL: corrRequerimiento || null,
		};

		if (row._esNuevo) {
			return this.requerimientosOrganizacionalesRepo.create(payload);
		}

		return this.requerimientosOrganizacionalesRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: corrRequerimiento },
		]);
	}

	// Qué hace: elimina un requerimiento organizacional del descriptor.
	// Cómo: valida la llave natural (descriptor y catálogo); si falta devuelve error local, si no
	// llama a delete del repositorio con esa llave compuesta.
	eliminarRequerimientoOrganizacional(
		corrDescriptorPuesto: number,
		corrRequerimientoOrganizacional: number
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corr = Number(corrRequerimientoOrganizacional);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar el requerimiento organizacional a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.requerimientosOrganizacionalesRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', Value: corr },
		]);
	}

	// Qué hace: lista los riesgos del puesto vinculados al descriptor.
	getRiesgosPuestoLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.riesgosPuestoRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
		]);
	}

	// Qué hace: guarda un riesgo del puesto vinculado al descriptor.
	// Cómo: arma el objeto y decide crear o actualizar segun row._esNuevo, usando descriptor + catálogo
	// como llave natural en el update.
	persistirRiesgoPuesto(
		corrDescriptorPuesto: number,
		row: ScDescriptorPuestoRiesgoPuesto
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrRiesgo = Number(row.CORR_RIESGO_PUESTO) || 0;
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			NOMBRE_RIESGO_PUESTO: (row.NOMBRE_RIESGO_PUESTO ?? '').trim() || null,
			INFORMACION: (row.INFORMACION ?? '').trim() || null,
			CORR_RIESGO_PUESTO: corrRiesgo || null,
		};

		if (row._esNuevo) {
			return this.riesgosPuestoRepo.create(payload);
		}

		return this.riesgosPuestoRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_RIESGO_PUESTO', Value: corrRiesgo },
		]);
	}

	// Qué hace: elimina un riesgo del puesto vinculado al descriptor.
	// Cómo: valida la llave natural (descriptor y catálogo); si falta devuelve error local, si no
	// llama a delete del repositorio con esa llave compuesta.
	eliminarRiesgoPuesto(corrDescriptorPuesto: number, corrRiesgoPuesto: number): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corr = Number(corrRiesgoPuesto);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar el riesgo del descriptor a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.riesgosPuestoRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_RIESGO_PUESTO', Value: corr },
		]);
	}

	// Qué hace: lista las inducciones vinculadas al descriptor.
	getInduccionesDescriptor(corrDescriptorPuesto: number): Observable<IResult> {
		return this.induccionesRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
		]);
	}

	// Qué hace: guarda una inducción vinculada al descriptor.
	// Cómo: arma el objeto y decide crear o actualizar segun row._esNuevo, usando descriptor + catálogo
	// como llave natural en el update.
	persistirInduccionDescriptor(
		corrDescriptorPuesto: number,
		row: ScDescriptorPuestoInduccion
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrInduccion = Number(row.CORR_INDUCCION) || 0;
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_INDUCCION: corrInduccion || null,
			NOMBRE_INDUCCION: (row.NOMBRE_INDUCCION ?? '').trim() || null,
			TIEMPO_INDUCCION: (row.TIEMPO_INDUCCION ?? '').trim() || null,
		};

		if (row._esNuevo) {
			return this.induccionesRepo.create(payload);
		}

		return this.induccionesRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_INDUCCION', Value: corrInduccion },
		]);
	}

	// Qué hace: elimina una inducción vinculada al descriptor.
	// Cómo: valida la llave natural (descriptor y catálogo); si falta devuelve error local, si no
	// llama a delete del repositorio con esa llave compuesta.
	eliminarInduccionDescriptor(corrDescriptorPuesto: number, corrInduccion: number): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corr = Number(corrInduccion);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la induccion del descriptor a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.induccionesRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_INDUCCION', Value: corr },
		]);
	}

	// Qué hace: lista las responsabilidades del cargo del descriptor.
	// Cómo: llama a la API con descriptor y formato (CORTO o EXTENSO).
	getResponsabilidadesCargoLookup(corrDescriptorPuesto: number, formato: string): Observable<IResult> {
		return this.responsabilidadesCargoRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'FORMATO', Value: (formato || 'CORTO').trim().toUpperCase() },
		]);
	}

	// Qué hace: guarda una responsabilidad del cargo vinculada al descriptor.
	// Cómo: arma el objeto y decide crear o actualizar segun row._esNuevo, usando descriptor + catálogo
	// como llave natural en el update.
	persistirResponsabilidadCargo(
		corrDescriptorPuesto: number,
		row: ScDescriptorPuestoResponsabilidadCargo
	): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corrResponsabilidad = Number(row.CORR_RESPONSABILIDAD) || 0;
		const payload = {
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			NOMBRE_RESPONSABILIDAD: (row.NOMBRE_RESPONSABILIDAD ?? '').trim() || null,
			INFORMACION: (row.INFORMACION ?? '').trim() || null,
			APLICA_DESCRIPTOR: (row.APLICA_DESCRIPTOR ?? 'AMBOS').trim().toUpperCase(),
			CORR_RESPONSABILIDAD: corrResponsabilidad || null,
		};

		if (row._esNuevo) {
			return this.responsabilidadesCargoRepo.create(payload);
		}

		return this.responsabilidadesCargoRepo.update(payload, [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_RESPONSABILIDAD', Value: corrResponsabilidad },
		]);
	}

	// Qué hace: elimina una responsabilidad del cargo vinculada al descriptor.
	// Cómo: valida la llave natural (descriptor y catálogo); si falta devuelve error local, si no
	// llama a delete del repositorio con esa llave compuesta.
	eliminarResponsabilidadCargo(corrDescriptorPuesto: number, corrResponsabilidad: number): Observable<IResult> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		const corr = Number(corrResponsabilidad);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return of({
				Result: false,
				Data: null,
				ErrorCode: 1,
				ErrorMessage: 'Debe indicar la responsabilidad del descriptor a eliminar.',
				RowsAffected: 0,
			} as IResult);
		}

		return this.responsabilidadesCargoRepo.delete([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptor },
			{ Parameter: 'CORR_RESPONSABILIDAD', Value: corr },
		]);
	}

	// Qué hace: guarda el perfil de puesto del descriptor.
	// Cómo: crea si no existe o no tiene correlativo; si ya existe, actualiza con descriptor y perfil como llave.
	persistirPerfil(
		corrDescriptorPuesto: number,
		perfil: ScPerfilPuesto,
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
			NOMBRE_DISPONIBILIDAD_HORARIO: (perfil.NOMBRE_DISPONIBILIDAD_HORARIO ?? '').trim() || null,
			CORR_TIPO_MODALIDAD: perfil.CORR_TIPO_MODALIDAD ?? null,
			NOMBRE_MODALIDAD: (perfil.NOMBRE_MODALIDAD ?? '').trim() || null,
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

	// Qué hace: sincroniza eliminaciones y filas activas de funciones en orden.
	// Cómo: elimina marcadas, guarda activas; en funciones clave nuevas encadena actividades pendientes con el correlativo devuelto.
	private sincronizarFunciones(
		corrDescriptorPuesto: number,
		funciones: ScDescriptorPuestoFuncion[],
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
									Number((response.Data as ScDescriptorPuestoFuncion)?.CORR_FUNCION) ||
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
							.map((response) => response.Data as ScDescriptorPuestoFuncion);

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

	// Qué hace: guarda en lote funciones clave y sus actividades pendientes.
	guardarFuncionesClave(
		corrDescriptorPuesto: number,
		funciones: ScDescriptorPuestoFuncion[],
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

	// Qué hace: guarda en lote funciones secundarias del descriptor.
	guardarFuncionesSecundarias(
		corrDescriptorPuesto: number,
		funciones: ScDescriptorPuestoFuncion[],
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

	// Qué hace: guarda en lote: create, update y delete de actividades de una función.
	// Cómo: ejecuta todas las llamadas en paralelo y devuelve la primera respuesta con error si alguna falla.
	guardarActividadesFuncion(
		corrDescriptorPuesto: number,
		corrFuncion: number,
		actividades: ScDescriptorPuestoFuncionActividad[],
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
					.map((response) => response.Data as ScDescriptorPuestoFuncionActividad);

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
