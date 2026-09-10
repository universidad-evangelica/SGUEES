import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { confirm, custom } from 'devextreme/ui/dialog';
import { lastValueFrom } from 'rxjs';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import {
	ScBandejaActoresItem,
	ScBandejaActoresKpi,
	ScBandejaActoresTab,
	ScBandejaActoresTipo,
} from './models/sc-bandeja-actores-item';
import {
	BANDEJA_ACTORES_ESTADOS_REQUISICION,
	OPERACION_BANDEJA_ACTORES,
	ScBandejaActoresService,
} from './sc-bandeja-actores.service';

@Component({
	selector: 'app-sc-bandeja-actores',
	templateUrl: './sc-bandeja-actores.component.html',
	styleUrls: ['./sc-bandeja-actores.component.scss'],
})
export class ScBandejaActoresComponent extends CBaseComponent implements OnInit {
	models: any = [];

	selectedItem: ScBandejaActoresItem | null = null;
	panelOpen = false;
	panelTab: 'RESUMEN' | 'HISTORIAL' = 'RESUMEN';
	bitacoraLoading = false;
	accionEnCurso = false;

	activeTab: ScBandejaActoresTab = 'REQUISICIONES';

	filtroEstado = 'TODOS';
	filtroUnidad = 'TODOS';
	filtroBusqueda = '';
	fechaDesde: Date | null = null;
	fechaHasta: Date | null = null;

	kpis: ScBandejaActoresKpi[] = [];
	totalRequisicionesApi = 0;
	totalCandidatosApi = 0;
	totalUnidadesApi = 0;

	readonly tabs: Array<{ id: ScBandejaActoresTab; label: string }> = [
		{ id: 'REQUISICIONES', label: 'Requisiciones' },
		{ id: 'CANDIDATOS', label: 'Candidatos' },
	];

	readonly estadosFiltroRequisicion: Array<{ VALUE: string; TEXT: string }> = [
		{ VALUE: 'TODOS', TEXT: 'Todos' },
		...BANDEJA_ACTORES_ESTADOS_REQUISICION.map((e) => ({
			VALUE: String(e.CORR_ESTADO_REQUISICION),
			TEXT: e.ESTADO_REQUISICION,
		})),
	];

	estadosFiltro: Array<{ VALUE: string; TEXT: string }> = this.estadosFiltroRequisicion;

	unidadesFiltro: Array<{ VALUE: string; TEXT: string }> = [{ VALUE: 'TODOS', TEXT: 'Todas' }];

	readonly remoteOperations = { paging: true, sorting: true, filtering: false };
	readonly pageSize = 10;
	readonly allowedPageSizes: (number | 'all')[] = [10, 15, 30, 'all'];

	private requisicionesStore: CustomStore | null = null;
	private candidatosStore: CustomStore | null = null;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private navRouter: Router,
		private service: ScBandejaActoresService
	) {
		super(appInfoService, router);
	}

	ngOnInit(): void {
		this.cargarUnidades();
		this.cargarKpis();
		this.configurarDataSource();
	}

	get tabCounts(): Record<ScBandejaActoresTab, number> {
		return {
			REQUISICIONES: this.totalRequisicionesApi,
			CANDIDATOS: this.totalCandidatosApi,
		};
	}

	get usaApiGrid(): boolean {
		return true;
	}

	get puedeDictaminar(): boolean {
		const item = this.selectedItem;
		return (
			!!item &&
			item.TIPO === 'CANDIDATO' &&
			item.ESTADO_CICLO_CANDIDATO === 'EN_SELECCION' &&
			item.ESTADO_DECISION === 'PENDIENTE'
		);
	}

	seleccionarTab(tab: ScBandejaActoresTab): void {
		this.activeTab = tab;
		this.filtroEstado = 'TODOS';
		this.estadosFiltro =
			tab === 'REQUISICIONES' ? this.estadosFiltroRequisicion : [{ VALUE: 'TODOS', TEXT: 'Todos' }];
		this.configurarDataSource();
	}

	buscar(): void {
		this.configurarDataSource();
	}

	limpiarFiltros(): void {
		this.filtroEstado = 'TODOS';
		this.filtroUnidad = 'TODOS';
		this.filtroBusqueda = '';
		this.fechaDesde = null;
		this.fechaHasta = null;
		this.configurarDataSource();
	}

	onFocusedRowChanged(e: any): void {
		const rowData = e?.row?.data as ScBandejaActoresItem | undefined;
		if (rowData) {
			this.abrirPanel(rowData);
		}
	}

	onRowClick(e: any): void {
		const item = e?.data as ScBandejaActoresItem | undefined;
		if (item) {
			this.abrirPanel(item);
		}
	}

	abrirPanel(item: ScBandejaActoresItem): void {
		this.selectedItem = { ...item, HISTORIAL: item.HISTORIAL ? [...item.HISTORIAL] : [] };
		this.panelOpen = true;
		this.panelTab = 'RESUMEN';

		if (item.TIPO === 'REQUISICION' && item.CORR_REQUISICION_PERSONAL) {
			this.cargarBitacoraRequisicion(item.CORR_REQUISICION_PERSONAL);
		}
	}

	cerrarPanel(): void {
		this.panelOpen = false;
		this.selectedItem = null;
		this.bitacoraLoading = false;
	}

	setPanelTab(tab: 'RESUMEN' | 'HISTORIAL'): void {
		this.panelTab = tab;
	}

	accionVerDetalle(): void {
		if (!this.selectedItem) {
			return;
		}

		if (this.selectedItem.TIPO === 'REQUISICION' && this.selectedItem.CORR_REQUISICION_PERSONAL) {
			void this.navRouter.navigate(['/sc-requisicion-personal'], {
				queryParams: { corr: this.selectedItem.CORR_REQUISICION_PERSONAL },
			});
			return;
		}

		if (this.selectedItem.CORR_EXPEDIENTE_CANDIDATO) {
			void this.navRouter.navigate(['/sc-expediente-candidato'], {
				queryParams: { corr: this.selectedItem.CORR_EXPEDIENTE_CANDIDATO },
			});
			return;
		}

		this.notifyFx('No hay ruta de detalle disponible para este ítem.', NotifyType.Warning, {
			raw: true,
		});
	}

	accionVerFlujo(): void {
		this.panelTab = 'HISTORIAL';
	}

	async accionAprobar(): Promise<void> {
		await this.ejecutarAutoriza(OPERACION_BANDEJA_ACTORES.APROBAR, 'Aprobar requisición', false);
	}

	async accionDevolver(): Promise<void> {
		await this.ejecutarAutoriza(OPERACION_BANDEJA_ACTORES.DEVOLVER, 'Devolver requisición', true);
	}

	async accionRechazar(): Promise<void> {
		await this.ejecutarAutoriza(OPERACION_BANDEJA_ACTORES.RECHAZAR, 'Rechazar requisición', true);
	}

	async accionDictamen(aplica: boolean): Promise<void> {
		if (!this.puedeDictaminar || !this.selectedItem || this.accionEnCurso) {
			return;
		}

		const item = this.selectedItem;
		let observacion: string | undefined;

		if (!aplica) {
			observacion = await this.pedirObservacion('Indique el motivo de No aplica');
			if (observacion == null) {
				return;
			}
			if (!observacion.trim()) {
				this.notifyFx('La observación es obligatoria para No aplica.', NotifyType.Warning, {
					raw: true,
				});
				return;
			}
		} else {
			const ok = await confirm(
				`¿Confirma dictamen APLICA para ${item.NOMBRE_CANDIDATO || item.CODIGO}?`,
				'Dictamen de candidato'
			);
			if (!ok) {
				return;
			}
		}

		this.accionEnCurso = true;
		try {
			const response = await lastValueFrom(
				this.service.decideCandidato({
					CORR_REQUISICION_PERSONAL: item.CORR_REQUISICION_PERSONAL || 0,
					CORR_SOLICITUD_EMPLEO: item.CORR_SOLICITUD_EMPLEO || 0,
					CORR_EXPEDIENTE_CANDIDATO: item.CORR_EXPEDIENTE_CANDIDATO || 0,
					ESTADO_DECISION: aplica ? 'APLICA' : 'NO_APLICA',
					OBSERVACION_DECISION: observacion,
				})
			);

			if (!response.Result) {
				this.notifyFx(
					response.ErrorMessage || 'No se pudo registrar el dictamen.',
					NotifyType.Error,
					{ raw: true }
				);
				return;
			}

			this.notifyFx(
				aplica ? 'Dictamen APLICA registrado.' : 'Dictamen NO APLICA registrado.',
				NotifyType.Success,
				{ raw: true }
			);
			this.cerrarPanel();
			this.cargarKpis();
			this.cargarUnidades();
			this.configurarDataSource();
		} catch (error: any) {
			const msg =
				error?.error?.ErrorMessage || error?.message || 'Error al registrar el dictamen.';
			this.notifyFx(msg, NotifyType.Error, {
				raw: true,
			});
		} finally {
			this.accionEnCurso = false;
		}
	}

	tipoLabel(tipo: ScBandejaActoresTipo, _item?: ScBandejaActoresItem | null): string {
		return tipo === 'REQUISICION' ? 'Requisición' : 'Candidato';
	}

	tipoIcon(tipo: ScBandejaActoresTipo, _item?: ScBandejaActoresItem | null): string {
		return tipo === 'REQUISICION' ? 'doc' : 'user';
	}

	estadoChipClass(item: ScBandejaActoresItem): string {
		return `bandeja-estado-chip bandeja-estado--${item.ESTADO_TONE || 'borrador'}`;
	}

	formatSalario(valor?: number): string {
		if (valor == null || isNaN(Number(valor))) {
			return '—';
		}
		return new Intl.NumberFormat('es-SV', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		}).format(Number(valor));
	}

	formatFecha(valor?: string | Date): string {
		if (!valor) {
			return '—';
		}
		const d = valor instanceof Date ? valor : new Date(valor);
		if (isNaN(d.getTime())) {
			return String(valor);
		}
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh = String(d.getHours()).padStart(2, '0');
		const mi = String(d.getMinutes()).padStart(2, '0');
		if (hh === '00' && mi === '00') {
			return `${dd}/${mm}/${yyyy}`;
		}
		return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
	}

	private async ejecutarAutoriza(
		operacion: number,
		titulo: string,
		requiereObservacion: boolean
	): Promise<void> {
		if (!this.selectedItem || this.selectedItem.TIPO !== 'REQUISICION' || this.accionEnCurso) {
			return;
		}

		const item = this.selectedItem;
		let observacion: string | undefined;

		if (requiereObservacion) {
			observacion = await this.pedirObservacion(`Observación para: ${titulo}`);
			if (observacion == null) {
				return;
			}
			if (!observacion.trim()) {
				this.notifyFx('La observación es obligatoria.', NotifyType.Warning, { raw: true });
				return;
			}
		} else {
			const ok = await confirm(
				`¿Confirma aprobar la requisición ${item.CODIGO}?`,
				titulo
			);
			if (!ok) {
				return;
			}
			observacion = `Se aprobó la requisición ${item.CODIGO}.`;
		}

		this.accionEnCurso = true;
		try {
			const response = await lastValueFrom(
				this.service.autorizaRequisicion({
					CORR_REQUISICION_PERSONAL: item.CORR_REQUISICION_PERSONAL || 0,
					OPERACION: operacion,
					OBSERVACION: observacion,
					CORR_UNIDAD_DOCUMENTO: item.CORR_UNIDAD || null,
				})
			);

			if (!response.Result) {
				this.notifyFx(
					response.ErrorMessage || 'No se pudo ejecutar la operación de flujo.',
					NotifyType.Error,
					{ raw: true }
				);
				return;
			}

			this.notifyFx(response.ErrorMessage || 'Operación ejecutada correctamente.', NotifyType.Success, {
				raw: true,
			});
			this.cerrarPanel();
			this.cargarKpis();
			this.cargarUnidades();
			this.configurarDataSource();
		} catch (error: any) {
			const msg =
				error?.error?.ErrorMessage ||
				error?.message ||
				'Error al autorizar la requisición.';
			this.notifyFx(msg, NotifyType.Error, { raw: true });
		} finally {
			this.accionEnCurso = false;
		}
	}

	private pedirObservacion(titulo: string): Promise<string | null> {
		return new Promise((resolve) => {
			const dlg = custom({
				title: titulo,
				messageHtml:
					'<div style="margin-bottom:8px">Ingrese la observación:</div>' +
					'<textarea id="bandeja-actores-obs" rows="4" style="width:100%;box-sizing:border-box"></textarea>',
				buttons: [
					{
						text: 'Cancelar',
						onClick: () => {
							resolve(null);
							return true;
						},
					},
					{
						text: 'Confirmar',
						type: 'default',
						onClick: () => {
							const el = document.getElementById(
								'bandeja-actores-obs'
							) as HTMLTextAreaElement | null;
							resolve(el?.value ?? '');
							return true;
						},
					},
				],
			});
			dlg.show();
		});
	}

	private configurarDataSource(): void {
		this.cerrarPanel();

		if (this.activeTab === 'REQUISICIONES') {
			this.candidatosStore = null;
			this.requisicionesStore = this.crearRequisicionesStore();
			this.models = this.requisicionesStore;
			return;
		}

		this.requisicionesStore = null;
		this.candidatosStore = this.crearCandidatosStore();
		this.models = this.candidatosStore;
	}

	private crearRequisicionesStore(): CustomStore {
		return new CustomStore({
			key: 'ID',
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => {
				try {
					const { page, pageSize, sortField, sortDesc } = this.parseLoadOptions(
						loadOptions,
						'FECHA_NOTIFICACION',
						(sel) => this.mapSortFieldRequisicion(sel)
					);

					const corrEstado =
						this.filtroEstado !== 'TODOS' && !isNaN(Number(this.filtroEstado))
							? Number(this.filtroEstado)
							: 0;
					const corrUnidad =
						this.filtroUnidad !== 'TODOS' && !isNaN(Number(this.filtroUnidad))
							? Number(this.filtroUnidad)
							: 0;

					const response = await lastValueFrom(
						this.service.getRequisiciones({
							PAGE: page,
							PAGE_SIZE: pageSize,
							SORT_FIELD: sortField,
							SORT_DESC: sortDesc,
							CORR_ESTADO_REQUISICION: corrEstado > 0 ? corrEstado : undefined,
							CORR_UNIDAD: corrUnidad > 0 ? corrUnidad : undefined,
							FECHA_DESDE: this.fechaDesde,
							FECHA_HASTA: this.fechaHasta,
							BUSQUEDA: this.filtroBusqueda?.trim() || undefined,
						})
					);

					if (!response.Result) {
						throw new Error(response.ErrorMessage || 'No se pudieron cargar las requisiciones.');
					}

					const rows = (response.Data || []).map((r: any) =>
						this.service.mapRequisicionToBandejaItem(r)
					);
					this.totalRequisicionesApi = response.RowsAffected || rows.length;
					this.recalcularKpisLocal();

					return {
						data: rows,
						totalCount: response.RowsAffected || rows.length,
					};
				} catch (error: any) {
					this.notifyFx(
						error?.message || 'Error al consultar requisiciones pendientes.',
						NotifyType.Error,
						{ raw: true }
					);
					throw error;
				}
			},
		});
	}

	private crearCandidatosStore(): CustomStore {
		return new CustomStore({
			key: 'ID',
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => {
				try {
					const { page, pageSize, sortField, sortDesc } = this.parseLoadOptions(
						loadOptions,
						'FECHA_GENERACION',
						(sel) => this.mapSortFieldCandidato(sel)
					);

					const corrUnidad =
						this.filtroUnidad !== 'TODOS' && !isNaN(Number(this.filtroUnidad))
							? Number(this.filtroUnidad)
							: 0;

					const response = await lastValueFrom(
						this.service.getCandidatos({
							PAGE: page,
							PAGE_SIZE: pageSize,
							SORT_FIELD: sortField,
							SORT_DESC: sortDesc,
							CORR_UNIDAD: corrUnidad > 0 ? corrUnidad : undefined,
							FECHA_DESDE: this.fechaDesde,
							FECHA_HASTA: this.fechaHasta,
							BUSQUEDA: this.filtroBusqueda?.trim() || undefined,
						})
					);

					if (!response.Result) {
						throw new Error(response.ErrorMessage || 'No se pudieron cargar los candidatos.');
					}

					const rows = (response.Data || []).map((r: any) =>
						this.service.mapCandidatoToBandejaItem(r)
					);
					this.totalCandidatosApi = response.RowsAffected || rows.length;
					this.recalcularKpisLocal();

					return {
						data: rows,
						totalCount: response.RowsAffected || rows.length,
					};
				} catch (error: any) {
					this.notifyFx(
						error?.message || 'Error al consultar candidatos pendientes.',
						NotifyType.Error,
						{ raw: true }
					);
					throw error;
				}
			},
		});
	}

	private parseLoadOptions(
		loadOptions: any,
		defaultSort: string,
		mapSort: (selector: string | undefined) => string
	): { page: number; pageSize: number; sortField: string; sortDesc: boolean } {
		const take = loadOptions?.take;
		const skip = loadOptions?.skip ?? 0;
		const pageSize = take == null ? 0 : take;
		const page = pageSize > 0 ? Math.floor(skip / pageSize) + 1 : 1;

		let sortField = defaultSort;
		let sortDesc = true;
		const sort = loadOptions?.sort;
		if (Array.isArray(sort) && sort.length > 0) {
			const s0 = sort[0];
			const selector = typeof s0 === 'string' ? s0 : s0?.selector;
			sortField = mapSort(selector);
			sortDesc = typeof s0 === 'object' ? !!s0.desc : false;
		}

		return { page, pageSize, sortField, sortDesc };
	}

	private mapSortFieldRequisicion(selector: string | undefined): string {
		switch (selector) {
			case 'CODIGO':
			case 'ID':
				return 'CORR_REQUISICION_PERSONAL';
			case 'DESCRIPCION':
				return 'NOMBRE_PUESTO';
			case 'SUBTITULO':
				return 'NOMBRE_UNIDAD';
			case 'SOLICITANTE':
				return 'NOMBRE_SOLICITANTE';
			case 'ESTADO':
				return 'CORR_ESTADO_REQUISICION';
			case 'FECHA':
				return 'FECHA_NOTIFICACION';
			default:
				return 'FECHA_NOTIFICACION';
		}
	}

	private mapSortFieldCandidato(selector: string | undefined): string {
		switch (selector) {
			case 'CODIGO':
			case 'ID':
				return 'CORR_EXPEDIENTE_CANDIDATO';
			case 'DESCRIPCION':
				return 'NOMBRE_PERSONA';
			case 'SUBTITULO':
				return 'NOMBRE_UNIDAD';
			case 'SOLICITANTE':
				return 'NOMBRE_SOLICITANTE';
			case 'FECHA':
				return 'FECHA_GENERACION';
			default:
				return 'FECHA_GENERACION';
		}
	}

	private cargarBitacoraRequisicion(corr: number): void {
		this.bitacoraLoading = true;
		this.service.getBitacoraRequisicion(corr).subscribe({
			next: (response) => {
				this.bitacoraLoading = false;
				if (!this.selectedItem || this.selectedItem.CORR_REQUISICION_PERSONAL !== corr) {
					return;
				}
				if (!response.Result) {
					this.notifyFx(
						response.ErrorMessage || 'No se pudo cargar la bitácora.',
						NotifyType.Warning,
						{ raw: true }
					);
					return;
				}
				this.selectedItem = {
					...this.selectedItem,
					HISTORIAL: this.service.mapBitacoraToHistorial(response.Data || []),
				};
			},
			error: () => {
				this.bitacoraLoading = false;
				this.notifyFx('Error al cargar bitácora de la requisición.', NotifyType.Error, {
					raw: true,
				});
			},
		});
	}

	private cargarUnidades(): void {
		this.service.getUnidades().subscribe({
			next: (response) => {
				if (!response.Result) {
					return;
				}
				const rows = (response.Data || []) as Array<{ CORR_UNIDAD: number; NOMBRE_UNIDAD: string }>;
				this.totalUnidadesApi = rows.length;
				this.unidadesFiltro = [
					{ VALUE: 'TODOS', TEXT: 'Todas' },
					...rows.map((u) => ({
						VALUE: String(u.CORR_UNIDAD),
						TEXT: u.NOMBRE_UNIDAD || String(u.CORR_UNIDAD),
					})),
				];
				this.recalcularKpisLocal();
			},
		});
	}

	private cargarKpis(): void {
		this.service.getKpis().subscribe({
			next: (response) => {
				if (!response.Result || !response.Data) {
					return;
				}
				const data = response.Data as any;
				this.totalRequisicionesApi = Number(data.TOTAL_REQUISICIONES) || 0;
				this.totalCandidatosApi = Number(data.TOTAL_CANDIDATOS) || 0;
				this.totalUnidadesApi = Number(data.TOTAL_UNIDADES) || this.totalUnidadesApi;
				this.recalcularKpisLocal();
			},
		});
	}

	private recalcularKpisLocal(): void {
		this.kpis = [
			{
				KEY: 'TOT',
				LABEL: 'Total pendientes',
				VALUE: this.totalRequisicionesApi + this.totalCandidatosApi,
				SUBLABEL: 'Requieren mi acción',
				TONE: 'warning',
				ICON: 'warning',
			},
			{
				KEY: 'REQ',
				LABEL: 'Requisiciones por autorizar',
				VALUE: this.totalRequisicionesApi,
				SUBLABEL: 'Notificación pendiente',
				TONE: 'info',
				ICON: 'doc',
			},
			{
				KEY: 'CAN',
				LABEL: 'Candidatos por dictaminar',
				VALUE: this.totalCandidatosApi,
				SUBLABEL: 'Jefatura de unidad',
				TONE: 'default',
				ICON: 'user',
			},
			{
				KEY: 'UNI',
				LABEL: 'Unidades involucradas',
				VALUE: this.totalUnidadesApi,
				SUBLABEL: 'Ámbito de mis pendientes',
				TONE: 'success',
				ICON: 'hierarchy',
			},
		];
	}
}
