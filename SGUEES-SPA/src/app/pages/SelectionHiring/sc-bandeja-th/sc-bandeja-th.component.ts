import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

@Component({
	selector: 'app-sc-bandeja-th',
	templateUrl: './sc-bandeja-th.component.html',
	styleUrls: ['./sc-bandeja-th.component.scss'],
})
export class ScBandejaThComponent extends CBaseComponent implements OnInit {
	/** Fuente mock completa (fase UIX). */
	private readonly source: ScBandejaItem[] = SC_BANDEJA_TH_MOCK.map((x) => ({ ...x }));

	/** Filas visibles según tab + filtros. */
	models: ScBandejaItem[] = [];

	selectedItem: ScBandejaItem | null = null;
	panelOpen = false;
	panelTab: 'RESUMEN' | 'HISTORIAL' = 'RESUMEN';

	activeTab: ScBandejaTab = 'TODAS';

	filtroTipo: ScBandejaTipo | 'TODOS' = 'TODOS';
	filtroEstado = 'TODOS';
	filtroUnidad = 'TODOS';
	filtroBusqueda = '';
	fechaDesde: Date | null = null;
	fechaHasta: Date | null = null;

	kpis: ScBandejaKpi[] = [];

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

	estadosFiltro: Array<{ VALUE: string; TEXT: string }> = [{ VALUE: 'TODOS', TEXT: 'Todos' }];
	unidadesFiltro: Array<{ VALUE: string; TEXT: string }> = [{ VALUE: 'TODOS', TEXT: 'Todas' }];

	readonly gridHeight = 'calc(100vh - 430px)';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute
	) {
		super(appInfoService, router);
	}

	ngOnInit(): void {
		this.refrescarCatalogosFiltro();
		this.aplicarFiltros();
	}

	get tabCounts(): Record<ScBandejaTab, number> {
		return {
			TODAS: this.source.length,
			REQUISICIONES: this.source.filter((x) => x.TIPO === 'REQUISICION').length,
			CANDIDATOS: this.source.filter((x) => x.TIPO === 'CANDIDATO').length,
			CONTRATACIONES: this.source.filter((x) => x.TIPO === 'CONTRATACION').length,
		};
	}

	/** Dictamen jefatura vive en ciclo Candidatos (no pestaña aparte). */
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
		this.aplicarFiltros();
	}

	buscar(): void {
		this.aplicarFiltros();
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
		this.aplicarFiltros();
	}

	onFocusedRowChanged(e: any): void {
		const key = e?.row?.key ?? e?.component?.option?.('focusedRowKey');
		const item = this.models.find((x) => x.ID === key) ?? null;
		if (!item) {
			return;
		}
		this.abrirPanel(item);
	}

	onRowClick(e: any): void {
		const item = e?.data as ScBandejaItem | undefined;
		if (!item) {
			return;
		}
		this.abrirPanel(item);
	}

	abrirPanel(item: ScBandejaItem): void {
		this.selectedItem = item;
		this.panelOpen = true;
		this.panelTab = 'RESUMEN';
	}

	cerrarPanel(): void {
		this.panelOpen = false;
		this.selectedItem = null;
	}

	setPanelTab(tab: 'RESUMEN' | 'HISTORIAL'): void {
		this.panelTab = tab;
	}

	accionVerDetalle(): void {
		if (!this.selectedItem) {
			return;
		}
		this.notifyFx(
			`Abrirá detalle de ${this.selectedItem.CODIGO} (UI mock · sin API).`,
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

	estadoChipClass(tone: string): string {
		return `bandeja-estado-chip bandeja-estado--${tone || 'borrador'}`;
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

	formatFecha(valor?: string): string {
		if (!valor) {
			return '—';
		}
		const d = new Date(valor);
		if (isNaN(d.getTime())) {
			return valor;
		}
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh = String(d.getHours()).padStart(2, '0');
		const mi = String(d.getMinutes()).padStart(2, '0');
		return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
	}

	private refrescarCatalogosFiltro(): void {
		const estados = Array.from(new Set(this.source.map((x) => x.ESTADO))).sort();
		this.estadosFiltro = [
			{ VALUE: 'TODOS', TEXT: 'Todos' },
			...estados.map((e) => ({ VALUE: e, TEXT: e })),
		];

		const unidades = Array.from(
			new Set(this.source.map((x) => x.NOMBRE_UNIDAD).filter((x): x is string => !!x))
		).sort();
		this.unidadesFiltro = [
			{ VALUE: 'TODOS', TEXT: 'Todas' },
			...unidades.map((u) => ({ VALUE: u, TEXT: u })),
		];
	}

	private aplicarFiltros(): void {
		let rows = [...this.source];

		if (this.activeTab === 'REQUISICIONES') {
			rows = rows.filter((x) => x.TIPO === 'REQUISICION');
		} else if (this.activeTab === 'CANDIDATOS') {
			rows = rows.filter((x) => x.TIPO === 'CANDIDATO');
		} else if (this.activeTab === 'CONTRATACIONES') {
			rows = rows.filter((x) => x.TIPO === 'CONTRATACION');
		}

		if (this.filtroTipo !== 'TODOS') {
			rows = rows.filter((x) => x.TIPO === this.filtroTipo);
		}
		if (this.filtroEstado !== 'TODOS') {
			rows = rows.filter((x) => x.ESTADO === this.filtroEstado);
		}
		if (this.filtroUnidad !== 'TODOS') {
			rows = rows.filter((x) => x.NOMBRE_UNIDAD === this.filtroUnidad);
		}

		if (this.fechaDesde) {
			const desde = new Date(this.fechaDesde);
			desde.setHours(0, 0, 0, 0);
			rows = rows.filter((x) => new Date(x.FECHA) >= desde);
		}
		if (this.fechaHasta) {
			const hasta = new Date(this.fechaHasta);
			hasta.setHours(23, 59, 59, 999);
			rows = rows.filter((x) => new Date(x.FECHA) <= hasta);
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

		if (this.selectedItem && !this.models.some((x) => x.ID === this.selectedItem?.ID)) {
			this.cerrarPanel();
		}
	}

	private recalcularKpis(): void {
		const all = this.source;
		const reqs = all.filter((x) => x.TIPO === 'REQUISICION');
		const cands = all.filter((x) => x.TIPO === 'CANDIDATO');
		const cons = all.filter((x) => x.TIPO === 'CONTRATACION');

		const reqEnAprob = reqs.filter((x) => x.ESTADO === 'En Aprobación').length;
		const postulantes = cands.filter((x) => x.ESTADO_CICLO_CANDIDATO === 'POSTULANTE').length;
		const dictamenPend = cands.filter(
			(x) => x.ESTADO_CICLO_CANDIDATO === 'EN_SELECCION' && x.ESTADO_DECISION === 'PENDIENTE'
		).length;
		const pendientes = all.filter((x) => x.REQUIERE_ATENCION).length;
		const activos =
			reqs.filter((x) =>
				['Publicada', 'En Reclutamiento', 'En Selección', 'En Contratación', 'Parcial Cubierta'].includes(
					x.ESTADO
				)
			).length +
			cands.filter((x) =>
				['CON_EXPEDIENTE', 'EN_SELECCION', 'APLICA'].includes(x.ESTADO_CICLO_CANDIDATO || '')
			).length;

		this.kpis = [
			{
				KEY: 'REQ',
				LABEL: 'Requisiciones',
				VALUE: reqs.length,
				SUBLABEL: `${reqEnAprob} en aprobación`,
				TONE: 'info',
				ICON: 'doc',
			},
			{
				KEY: 'CAN',
				LABEL: 'Candidatos',
				VALUE: cands.length,
				SUBLABEL: `${postulantes} postulantes · ${dictamenPend} por dictamen`,
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
				VALUE: activos,
				SUBLABEL: 'En etapas operativas',
				TONE: 'info',
				ICON: 'preferences',
			},
		];
	}
}
