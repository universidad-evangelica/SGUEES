import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConPartidaDetaService } from '../con-partida-deta/con-partida-deta.service';
import { ConPartidaContrapartidaRepository } from './con-partida-contrapartida.repository';
import { ConPartidaContrapartidaService } from './con-partida-contrapartida.service';
import { MESES_PERIODO } from '../../con-periodo-contable/con-periodo-contable.service';

type PeriodoOpcion = { key: string; label: string; ANIO_PERIODO: number; MES_PERIODO: number };

@Component({
	standalone: false,
	selector: 'app-con-partida-contrapartida-modal',
	templateUrl: './con-partida-contrapartida-modal.component.html',
	styleUrls: ['./con-partida-contrapartida-modal.component.scss'],
})
export class ConPartidaContrapartidaModalComponent extends CBaseComponent implements OnInit {
	@Input() permiteGenerar = false;
	@Output() generated = new EventEmitter<void>();
	@Output() cancelled = new EventEmitter<void>();

	models: any[] = [];
	columns: any[] = [];
	detalles: any[] = [];
	detalleColumns: any[] = [];
	detalleSummary: any;
	periodosCerrados: PeriodoOpcion[] = [];
	periodosAbiertos: PeriodoOpcion[] = [];
	periodoOrigenKey = '';
	periodoDestinoKey = '';
	partidaSeleccionada: any = null;
	loadingVisible = false;
	private detalleRequestSeq = 0;
	readonly gridHeight = 400;
	readonly noDataText =
		'Seleccione un período cerrado y pulse Consultar. Solo se listan partidas aplicadas sin contrapartida previa.';
	readonly noDataDetalleText = 'Seleccione una partida a la izquierda para ver su detalle.';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConPartidaContrapartidaService,
		private repo: ConPartidaContrapartidaRepository,
		private detaService: ConPartidaDetaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.detalleColumns = this.service.getDetalleColumns();
		this.detalleSummary = this.service.getDetalleSummary();
	}

	ngOnInit(): void {
		this.cargarPeriodos();
	}

	cargarPeriodos(): void {
		this.repo
			.getPeriodosOrigen()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.periodosCerrados = this.mapPeriodos(response?.Data || []);
					if (this.periodosCerrados.length && !this.periodoOrigenKey) {
						this.periodoOrigenKey = this.periodosCerrados[0].key;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});

		this.repo
			.getPeriodosDestino()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.periodosAbiertos = this.mapPeriodos(response?.Data || []);
					if (this.periodosAbiertos.length && !this.periodoDestinoKey) {
						this.periodoDestinoKey = this.periodosAbiertos[0].key;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultar(): void {
		const origen = this.getPeriodoOrigen();
		if (!origen) {
			this.notifyFx('Seleccione un período contable cerrado', NotifyType.Warning);
			return;
		}
		const fechaInicial = new Date(origen.ANIO_PERIODO, origen.MES_PERIODO - 1, 1);
		const fechaFinal = new Date(origen.ANIO_PERIODO, origen.MES_PERIODO, 0);
		this.loadingVisible = true;
		this.service
			.getElegibles({
				FECHA_INICIAL: fechaInicial,
				FECHA_FINAL: fechaFinal,
				FILTRO_ANIO_PERIODO: origen.ANIO_PERIODO,
				FILTRO_MES_PERIODO: origen.MES_PERIODO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response?.Result) {
						this.models = response.Data || [];
						this.limpiarSeleccionDetalle();
						if (!this.models.length) {
							this.notifyFx('No hay partidas aplicadas en ese período cerrado (o ya tienen contrapartida).', NotifyType.Warning);
						}
					} else {
						this.notifyFx(response?.ErrorMessage || 'Error al consultar', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					const msg =
						typeof error === 'string'
							? error
							: error?.error?.title || error?.ErrorMessage || error?.message || 'Error al consultar';
					this.notifyFx(msg, NotifyType.Error);
				},
			});
	}

	onFocusedRowChanged(e: any): void {
		const row = e?.row?.data ?? null;
		this.partidaSeleccionada = row;
		if (!row) {
			this.detalles = [];
			return;
		}
		this.cargarDetalle(row);
	}

	onRowDblClick(e: any): void {
		if (e?.data && this.permiteGenerar) {
			this.partidaSeleccionada = e.data;
			this.cargarDetalle(e.data);
			this.generarContrapartida();
		}
	}

	getPeriodoOrigen(): PeriodoOpcion | null {
		return this.periodosCerrados.find((x) => x.key === this.periodoOrigenKey) ?? null;
	}

	getPeriodoDestino(): { ANIO_PERIODO_DESTINO: number; MES_PERIODO_DESTINO: number } | null {
		const p = this.periodosAbiertos.find((x) => x.key === this.periodoDestinoKey);
		if (!p) return null;
		return { ANIO_PERIODO_DESTINO: p.ANIO_PERIODO, MES_PERIODO_DESTINO: p.MES_PERIODO };
	}

	generarContrapartida(): void {
		if (!this.permiteGenerar) {
			return;
		}
		if (!this.partidaSeleccionada) {
			this.notifyFx('Seleccione una partida en la grilla', NotifyType.Warning);
			return;
		}
		const destino = this.getPeriodoDestino();
		if (!destino) {
			this.notifyFx('Seleccione el período contable abierto destino', NotifyType.Warning);
			return;
		}
		const p = this.partidaSeleccionada;
		const confirma = custom({
			title: 'Generar contrapartida',
			messageHtml: `Se creará una partida en <b>${destino.MES_PERIODO_DESTINO}/${destino.ANIO_PERIODO_DESTINO}</b> con montos invertidos, estado <b>Digitado</b>.<br/><br/>Origen: partida <b>${p.CORR_PARTIDA}</b> (${p.MES_PERIODO}/${p.ANIO_PERIODO}).`,
			buttons: [
				{ text: 'Sí', onClick: () => true },
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show().then((ok: boolean) => {
			if (!ok) return;
			this.loadingVisible = true;
			this.service
				.generar(p, destino)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						this.loadingVisible = false;
						if (response?.ErrorCode === 0) {
							const d = response.Data;
							const noPartida = d?.CORR_PARTIDA ?? response?.CodeHelper;
							const mes = d?.MES_PERIODO ?? destino.MES_PERIODO_DESTINO;
							const anio = d?.ANIO_PERIODO ?? destino.ANIO_PERIODO_DESTINO;
							this.notifyFx(`Contrapartida generada: partida ${noPartida} (${mes}/${anio}), Digitado.`, NotifyType.Success);
							this.generated.emit();
						} else {
							this.notifyFx(response?.ErrorMessage || 'No se pudo generar la contrapartida', NotifyType.Error);
						}
					},
					error: (error: any) => {
						this.loadingVisible = false;
						this.notifyFx(error, NotifyType.Error);
					},
				});
		});
	}

	cerrar(): void {
		this.cancelled.emit();
	}

	private mapPeriodos(rows: any[]): PeriodoOpcion[] {
		return rows.map((r: any) => {
			const mes = MESES_PERIODO.find((m) => m.MES_PERIODO === r.MES_PERIODO);
			return {
				key: `${r.ANIO_PERIODO}-${r.MES_PERIODO}`,
				label: `${mes?.NOMBRE_MES_PERIODO || r.MES_PERIODO} / ${r.ANIO_PERIODO}`,
				ANIO_PERIODO: r.ANIO_PERIODO,
				MES_PERIODO: r.MES_PERIODO,
			};
		});
	}

	private limpiarSeleccionDetalle(): void {
		this.partidaSeleccionada = null;
		this.detalles = [];
		this.detalleRequestSeq++;
	}

	private cargarDetalle(partida: any): void {
		const requestId = ++this.detalleRequestSeq;
		this.detalles = [];
		this.detaService
			.getAll({
				ANIO_PERIODO: partida.ANIO_PERIODO,
				MES_PERIODO: partida.MES_PERIODO,
				CORR_CLASE_PARTIDA: partida.CORR_CLASE_PARTIDA,
				CORR_PARTIDA: partida.CORR_PARTIDA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (requestId !== this.detalleRequestSeq) {
						return;
					}
					if (response?.Result) {
						this.detalles = response.Data || [];
					} else {
						this.detalles = [];
						this.notifyFx(response?.ErrorMessage || 'No se pudo cargar el detalle', NotifyType.Error);
					}
				},
				error: (error: any) => {
					if (requestId !== this.detalleRequestSeq) {
						return;
					}
					this.detalles = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
}
