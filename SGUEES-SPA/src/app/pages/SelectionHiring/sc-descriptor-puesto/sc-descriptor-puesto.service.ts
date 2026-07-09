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
import { ScDescriptorPuesto } from './models/sc-descriptor-puesto';
import {
	ESTADOS_DESCRIPTOR_BLOQUEO_CREACION,
	FORMATO_CORTA,
	FORMATO_EXTENSA,
	TIPO_FUNCION_CLAVE,
	TIPO_FUNCION_SECUNDARIA,
} from './sc-descriptor-puesto.mock-data';
import { ScDescriptorPuestoRepository } from './sc-descriptor-puesto.repository';

const ESTADO_DESCRIPTOR_LABELS: Record<string, string> = {
	BORRADOR: 'Borrador',
	ENVIADO: 'Enviado',
	REVISADO: 'En revision',
	ACTIVO: 'Activo',
	INACTIVO: 'Inactivo',
};

@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoService {
	constructor(
		private repo: ScDescriptorPuestoRepository,
		private funcionRepo: ScDescriptorFuncionRepository,
		private actividadRepo: ScDescriptorFuncionActividadRepository
	) {}

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

	buildCodigoDescriptor(corrDescriptor: number | null | undefined): string {
		const corr = Number(corrDescriptor);
		if (!corr || corr <= 0) {
			return 'DES-0000';
		}

		return `DES-${String(corr).padStart(4, '0')}`;
	}

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

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: param.CORR_DESCRIPTOR_PUESTO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.toApiPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.toApiPayload(model), [
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: model.CORR_DESCRIPTOR_PUESTO },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: model.CORR_DESCRIPTOR_PUESTO }]);
	}

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
					dataSource: [
						{ value: FORMATO_CORTA, label: 'Version corta' },
						{ value: FORMATO_EXTENSA, label: 'Version extensa' },
					],
					displayExpr: 'label',
					valueExpr: 'value',
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

	getBitacoraColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_ESTADO', caption: 'Estado', width: 160 },
			{ dataField: 'USUARIO', caption: 'Usuario', width: 160 },
			{ dataField: 'OBSERVACIONES', caption: 'Observaciones', width: 320 },
			{
				dataField: 'FECHA',
				caption: 'Fecha',
				width: 180,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
		];
	}

	getBitacoraSummary(): any {
		return {
			totalItems: [{ column: 'NOMBRE_ESTADO', summaryType: 'count', displayFormat: 'Cant: {0}' }],
		};
	}

	getFormatoLabel(formato: string): string {
		if (formato === FORMATO_EXTENSA) {
			return 'Version extensa';
		}
		if (formato === FORMATO_CORTA) {
			return 'Version corta';
		}
		return formato ?? '';
	}

	private toApiPayload(model: ScDescriptorPuesto): any {
		return {
			...model,
			FECHA_EMISION: this.formatearDateOnly(model.FECHA_EMISION),
			FECHA_REVISION: this.formatearDateOnly(model.FECHA_REVISION),
		};
	}

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

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param?.CORR_DESCRIPTOR_PUESTO) {
			xWhere.push({ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: param.CORR_DESCRIPTOR_PUESTO });
		}
		return xWhere;
	}

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

	private getFormatoBadgeLabel(formato: string | null | undefined): string {
		const value = (formato ?? '').toUpperCase();
		if (value === FORMATO_EXTENSA || value === 'EXTENSA') {
			return 'Extensa';
		}
		if (value === FORMATO_CORTA || value === 'CORTA') {
			return 'Corta';
		}
		return formato ?? '';
	}

	private getFormatoBadgeClass(formato: string | null | undefined): string {
		const value = (formato ?? '').toUpperCase();
		if (value === FORMATO_EXTENSA || value === 'EXTENSA') {
			return 'descriptor-badge--formato-extensa';
		}
		if (value === FORMATO_CORTA || value === 'CORTA') {
			return 'descriptor-badge--formato-corta';
		}
		return 'descriptor-badge--formato-default';
	}

	private getEstadoDescriptorLabel(estado: string | null | undefined): string {
		const value = (estado ?? '').toUpperCase();
		return ESTADO_DESCRIPTOR_LABELS[value] ?? (estado ?? '');
	}

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

	getFuncionesSecundariasLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.funcionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_FUNCION', Value: TIPO_FUNCION_SECUNDARIA },
		]);
	}

	getFuncionesClaveLookup(corrDescriptorPuesto: number): Observable<IResult> {
		return this.funcionRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'TIPO_FUNCION', Value: TIPO_FUNCION_CLAVE },
		]);
	}

	getActividadesLookup(corrDescriptorPuesto: number, corrFuncion: number): Observable<IResult> {
		return this.actividadRepo.getAll([
			{ Parameter: 'CORR_DESCRIPTOR_PUESTO', Value: corrDescriptorPuesto },
			{ Parameter: 'CORR_FUNCION', Value: corrFuncion },
		]);
	}

	esValidoFuncionesClave(_funciones: ScDescriptorFuncion[], _msg: Function): boolean {
		return true;
	}

	esValidoActividades(_actividades: ScDescriptorFuncionActividad[], _msg: Function): boolean {
		return true;
	}

	private guardarFuncion(
		corrDescriptor: number,
		funcion: ScDescriptorFuncion,
		tipoFuncion: string
	): Observable<IResult> {
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
						this.guardarFuncion(corrDescriptor, funcion, tipoFuncion).pipe(
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
