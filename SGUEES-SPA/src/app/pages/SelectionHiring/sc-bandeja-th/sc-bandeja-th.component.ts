import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { lastValueFrom } from 'rxjs';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import {
	ScBandejaItem,
	ScBandejaKpi,
	ScBandejaTab,
	ScBandejaTipo,
} from './models/sc-bandeja-th-item';
import { SC_BANDEJA_TH_MOCK } from './sc-bandeja-th.mock';
import { BANDEJA_ESTADOS_REQUISICION, ScBandejaThService } from './sc-bandeja-th.service';

@Component({
	selector: 'app-sc-bandeja-th',
	templateUrl: './sc-bandeja-th.component.html',
	styleUrls: ['./sc-bandeja-th.component.scss'],
})
export class ScBandejaThComponent extends CBaseComponent implements OnInit {
	/** Mock solo para etapas aún no conectadas (candidatos / contrataciones). */
	private readonly mockSource: ScBandejaItem[] = SC_BANDEJA_TH_MOCK.filter(
		(x) => x.TIPO !== 'REQUISICION'
	).map((x) => ({ ...x }));

	/** DataSource del grid: CustomStore (requisiciones) o array (mock). */
	models: any = [];

	selectedItem: ScBandejaItem | null = null;
	panelOpen = false;
	panelTab: 'RESUMEN' | 'HISTORIAL' = 'RESUMEN';
	bitacoraLoading = false;

	activeTab: ScBandejaTab = 'REQUISICIONES';

	filtroTipo: ScBandejaTipo | 'TODOS' = 'REQUISICION';
	filtroEstado = 'TODOS';
	filtroUnidad = 'TODOS';
	filtroBusqueda = '';
	fechaDesde: Date | null = null;
	fechaHasta: Date | null = null;

	kpis: ScBandejaKpi[] = [];
	totalRequisicionesApi = 0;

	readonly tabs: Array<{ id: ScBandejaTab; label: string }> = [
		{ id: 'TODAS', label: 'Todas' },
		{ id: 'REQUISICIONES', label: 'Requisiciones' },
		{ id: 'CANDIDATOS', label: 'Candidatos' },
		{ id: 'CONTRATACIONES', label: 'Contrataciones' },
	];

	readonly tiposFiltro = [
		{ VALUE: 'TODOS', TEXT: 'Todos' },
		{ VALUE: 'REQUISICION', TEXT: 'Requisición' },
		{ VALUE: 'CANDIDATO', TEXT: 'Candidato / Postulante' },
		{ VALUE: 'CONTRATACION', TEXT: 'Contratación' },
	];

	estadosFiltro: Array<{ VALUE: string; TEXT: string }> = [
		{ VALUE: 'TODOS', TEXT: 'Todos' },
		...BANDEJA_ESTADOS_REQUISICION.map((e) => ({
			VALUE: String(e.CORR_ESTADO_REQUISICION),
			TEXT: e.ESTADO_REQUISICION,
		})),
	];

	unidadesFiltro: Array<{ VALUE: string; TEXT: string }> = [{ VALUE: 'TODOS', TEXT: 'Todas' }];

	readonly remoteOperations = { paging: true, sorting: true, filtering: false };
	readonly pageSize = 10;
	readonly allowedPageSizes: (number | 'all')[] = [10, 15, 30, 'all'];

	private requisicionesStore: CustomStore | null = null;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScBandejaThService
	) {
		super(appInfoService, router);
	}

	ngOnInit(): void {
		this.configurarDataSource();
		this.recalcularKpis();
	}

	get tabCounts(): Record<ScBandejaTab, number> {
		return {
			TODAS: this.totalRequisicionesApi + this.mockSource.length,
			REQUISICIONES: this.totalRequisicionesApi,
			CANDIDATOS: this.mockSource.filter((x) => x.TIPO === 'CANDIDATO').length,
			CONTRATACIONES: this.mockSource.filter((x) => x.TIPO === 'CONTRATACION').length,
		};
	}

	get usaApiRequisiciones(): boolean {
		return this.activeTab === 'REQUISICIONES' || this.activeTab === 'TODAS';
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

	seleccionarTab(tab: ScBandejaTab): void {
		this.activeTab = tab;
		if (tab === 'TODAS') {
			this.filtroTipo = 'TODOS';
		} else if (tab === 'REQUISICIONES') {
			this.filtroTipo = 'REQUISICION';
		} else if (tab === 'CANDIDATOS') {
			this.filtroTipo = 'CANDIDATO';
		} else {
			this.filtroTipo = 'CONTRATACION';
		}
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
		if (this.activeTab === 'TODAS') {
			this.filtroTipo = 'TODOS';
		} else if (this.activeTab === 'REQUISICIONES') {
			this.filtroTipo = 'REQUISICION';
		} else if (this.activeTab === 'CANDIDATOS') {
			this.filtroTipo = 'CANDIDATO';
		} else {
			this.filtroTipo = 'CONTRATACION';
		}
		this.configurarDataSource();
	}

	onFocusedRowChanged(e: any): void {
		const key = e?.row?.key ?? e?.component?.option?.('focusedRowKey');
		const rowData = e?.row?.data as ScBandejaItem | undefined;
		if (rowData) {
			this.abrirPanel(rowData);
			return;
		}
		if (!key) {
			return;
		}
	}

	onRowClick(e: any): void {
		const item = e?.data as ScBandejaItem | undefined;
		if (!item) {
			return;
		}
		this.abrirPanel(item);
	}

	abrirPanel(item: ScBandejaItem): void {
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
		this.notifyFx(
			`Abrirá detalle de ${this.selectedItem.CODIGO} (próxima fase · deep link).`,
			NotifyType.Warning,
			{ raw: true }
		);
	}

	accionVerFlujo(): void {
		this.panelTab = 'HISTORIAL';
	}

	accionAsociarExpediente(): void {
		if (!this.selectedItem || this.selectedItem.ESTADO_CICLO_CANDIDATO !== 'POSTULANTE') {
			return;
		}
		this.notifyFx(
			`Asociar expediente simulado para ${this.selectedItem.CODIGO} (mock).`,
			NotifyType.Success,
			{ raw: true }
		);
	}

	accionActivarSeleccion(): void {
		if (!this.selectedItem || this.selectedItem.ESTADO_CICLO_CANDIDATO !== 'CON_EXPEDIENTE') {
			return;
		}
		this.notifyFx(
			`Activar proceso de selección simulado para ${this.selectedItem.CODIGO} (mock).`,
			NotifyType.Success,
			{ raw: true }
		);
	}

	accionDictamen(aplica: boolean): void {
		if (!this.puedeDictaminar || !this.selectedItem) {
			return;
		}
		this.notifyFx(
			aplica
				? `Dictamen APLICA simulado para ${this.selectedItem.CODIGO} (mock).`
				: `Dictamen NO APLICA simulado para ${this.selectedItem.CODIGO} (mock).`,
			NotifyType.Success,
			{ raw: true }
		);
	}

	accionMovimientoStandby(): void {
		this.notifyFx(
			'Movimiento personal en standby. Se conectará en una fase posterior.',
			NotifyType.Warning,
			{ raw: true }
		);
	}

	tipoLabel(tipo: ScBandejaTipo, item?: ScBandejaItem | null): string {
		if (tipo === 'CANDIDATO' && item?.ESTADO_CICLO_CANDIDATO === 'POSTULANTE') {
			return 'Postulante';
		}
		switch (tipo) {
			case 'REQUISICION':
				return 'Requisición';
			case 'CANDIDATO':
				return 'Candidato';
			case 'CONTRATACION':
				return 'Contratación';
			default:
				return tipo;
		}
	}

	tipoIcon(tipo: ScBandejaTipo, item?: ScBandejaItem | null): string {
		if (tipo === 'CANDIDATO' && item?.ESTADO_CICLO_CANDIDATO === 'POSTULANTE') {
			return 'user';
		}
		switch (tipo) {
			case 'REQUISICION':
				return 'doc';
			case 'CANDIDATO':
				return 'user';
			case 'CONTRATACION':
				return 'card';
			default:
				return 'info';
		}
	}

	estadoChipClass(item: ScBandejaItem): string {
		if (item.TIPO === 'REQUISICION') {
			return `estado-req-chip ${this.service.getEstadoRequisicionBadgeClass(item.CORR_ESTADO_REQUISICION)}`;
		}
		return `bandeja-estado-chip bandeja-estado--${item.ESTADO_TONE || 'borrador'}`;
	}

	formatSalario(valor?: number): string {
		if (valor == null || isNaN(Number(valor))) {
			return '—';
		}
		return new Intl.NumberFormat('en-US', {
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

	private configurarDataSource(): void {
		this.cerrarPanel();

		if (this.usaApiRequisiciones) {
			this.requisicionesStore = this.crearRequisicionesStore();
			this.models = this.requisicionesStore;
			this.recalcularKpis();
			return;
		}

		this.requisicionesStore = null;
		let rows = [...this.mockSource];
		if (this.activeTab === 'CANDIDATOS') {
			rows = rows.filter((x) => x.TIPO === 'CANDIDATO');
		} else if (this.activeTab === 'CONTRATACIONES') {
			rows = rows.filter((x) => x.TIPO === 'CONTRATACION');
		}

		const q = (this.filtroBusqueda || '').trim().toLowerCase();
		if (q) {
			rows = rows.filter((x) => {
				const blob = [
					x.CODIGO,
					x.DESCRIPCION,
					x.SUBTITULO,
					x.SOLICITANTE,
					x.NOMBRE_CANDIDATO,
					x.DUI_CANDIDATO,
					x.NOMBRE_PUESTO,
					x.NOMBRE_UNIDAD,
					x.ESTADO,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				return blob.includes(q);
			});
		}

		this.models = rows;
		this.recalcularKpis();
	}

	private crearRequisicionesStore(): CustomStore {
		return new CustomStore({
			key: 'ID',
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => {
				try {
					const take = loadOptions?.take;
					const skip = loadOptions?.skip ?? 0;
					const pageSize = take == null ? 0 : take;
					const page = pageSize > 0 ? Math.floor(skip / pageSize) + 1 : 1;

					let sortField = 'FECHA_REQUISICION';
					let sortDesc = true;
					const sort = loadOptions?.sort;
					if (Array.isArray(sort) && sort.length > 0) {
						const s0 = sort[0];
						const selector = typeof s0 === 'string' ? s0 : s0?.selector;
						sortField = this.mapSortField(selector);
						sortDesc = typeof s0 === 'object' ? !!s0.desc : false;
					}

					const corrEstado =
						this.filtroEstado !== 'TODOS' && !isNaN(Number(this.filtroEstado))
							? Number(this.filtroEstado)
							: 0;

					const response = await lastValueFrom(
						this.service.getRequisiciones({
							PAGE: page,
							PAGE_SIZE: pageSize,
							SORT_FIELD: sortField,
							SORT_DESC: sortDesc,
							CORR_ESTADO_REQUISICION: corrEstado > 0 ? corrEstado : undefined,
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
					this.syncUnidadesFromRows(rows);
					this.recalcularKpis();

					return {
						data: rows,
						totalCount: response.RowsAffected || rows.length,
					};
				} catch (error: any) {
					this.notifyFx(
						error?.message || 'Error al consultar requisiciones de la bandeja.',
						NotifyType.Error,
						{ raw: true }
					);
					throw error;
				}
			},
		});
	}

	private mapSortField(selector: string | undefined): string {
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
				return 'FECHA_REQUISICION';
			default:
				return 'FECHA_REQUISICION';
		}
	}

	private syncUnidadesFromRows(rows: ScBandejaItem[]): void {
		const known = new Set(this.unidadesFiltro.map((x) => x.VALUE));
		rows.forEach((r) => {
			if (r.NOMBRE_UNIDAD && !known.has(r.NOMBRE_UNIDAD)) {
				known.add(r.NOMBRE_UNIDAD);
				this.unidadesFiltro = [
					...this.unidadesFiltro,
					{ VALUE: r.NOMBRE_UNIDAD, TEXT: r.NOMBRE_UNIDAD },
				];
			}
		});
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

	private recalcularKpis(): void {
		const cands = this.mockSource.filter((x) => x.TIPO === 'CANDIDATO');
		const cons = this.mockSource.filter((x) => x.TIPO === 'CONTRATACION');
		const postulantes = cands.filter((x) => x.ESTADO_CICLO_CANDIDATO === 'POSTULANTE').length;
		const dictamenPend = cands.filter(
			(x) => x.ESTADO_CICLO_CANDIDATO === 'EN_SELECCION' && x.ESTADO_DECISION === 'PENDIENTE'
		).length;
		const pendientes =
			this.mockSource.filter((x) => x.REQUIERE_ATENCION).length +
			(this.filtroEstado === '2' ? this.totalRequisicionesApi : 0);

		this.kpis = [
			{
				KEY: 'REQ',
				LABEL: 'Requisiciones',
				VALUE: this.totalRequisicionesApi,
				SUBLABEL: 'Desde base de datos',
				TONE: 'info',
				ICON: 'doc',
			},
			{
				KEY: 'CAN',
				LABEL: 'Candidatos',
				VALUE: cands.length,
				SUBLABEL: `${postulantes} postulantes · ${dictamenPend} por dictamen (mock)`,
				TONE: 'default',
				ICON: 'user',
			},
			{
				KEY: 'CON',
				LABEL: 'Contrataciones',
				VALUE: cons.length,
				SUBLABEL: `${cons.filter((x) => x.LISTO_CONTRATACION).length} listos (standby)`,
				TONE: 'success',
				ICON: 'card',
			},
			{
				KEY: 'PEN',
				LABEL: 'Pendientes de mi acción',
				VALUE: pendientes,
				SUBLABEL: 'Requieren atención',
				TONE: 'warning',
				ICON: 'warning',
			},
			{
				KEY: 'ACT',
				LABEL: 'Procesos activos',
				VALUE: this.totalRequisicionesApi + cands.filter((x) =>
					['CON_EXPEDIENTE', 'EN_SELECCION', 'APLICA'].includes(x.ESTADO_CICLO_CANDIDATO || '')
				).length,
				SUBLABEL: 'En etapas operativas',
				TONE: 'info',
				ICON: 'preferences',
			},
		];
	}
}
