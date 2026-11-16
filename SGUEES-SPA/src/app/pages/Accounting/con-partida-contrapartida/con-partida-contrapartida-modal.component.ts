import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConPartidaContrapartidaRepository } from './con-partida-contrapartida.repository';
import { ConPartidaContrapartidaService } from './con-partida-contrapartida.service';
import { MESES_PERIODO } from '../con-periodo-contable/con-periodo-contable.service';

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
	filtroAnio = new Date().getFullYear();
	filtroMes = new Date().getMonth() + 1;
	periodosAbiertos: { key: string; label: string; ANIO_PERIODO: number; MES_PERIODO: number }[] = [];
	periodoDestinoKey = '';
	partidaSeleccionada: any = null;
	loadingVisible = false;
	readonly mesesPeriodo = MESES_PERIODO;
	readonly gridHeight = 400;
	readonly noDataText =
		'Indique año y mes del período cerrado y pulse Consultar. Solo se listan partidas aplicadas sin contrapartida previa.';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConPartidaContrapartidaService,
		private repo: ConPartidaContrapartidaRepository
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
	}

	ngOnInit(): void {
		this.cargarPeriodosAbiertos();
	}

	cargarPeriodosAbiertos(): void {
		this.repo
			.getPeriodosDestino()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Data || [];
					this.periodosAbiertos = rows.map((r: any) => {
						const mes = MESES_PERIODO.find((m) => m.MES_PERIODO === r.MES_PERIODO);
						return {
							key: `${r.ANIO_PERIODO}-${r.MES_PERIODO}`,
							label: `${mes?.NOMBRE_MES_PERIODO || r.MES_PERIODO} / ${r.ANIO_PERIODO}`,
							ANIO_PERIODO: r.ANIO_PERIODO,
							MES_PERIODO: r.MES_PERIODO,
						};
					});
					if (this.periodosAbiertos.length && !this.periodoDestinoKey) {
						this.periodoDestinoKey = this.periodosAbiertos[0].key;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultar(): void {
		if (!this.filtroAnio || !this.filtroMes) {
			this.notifyFx('Indique año y mes del período cerrado', NotifyType.Warning);
			return;
		}
		const fechaInicial = new Date(this.filtroAnio, this.filtroMes - 1, 1);
		const fechaFinal = new Date(this.filtroAnio, this.filtroMes, 0);
		this.loadingVisible = true;
		this.service
			.getElegibles({
				FECHA_INICIAL: fechaInicial,
				FECHA_FINAL: fechaFinal,
				FILTRO_ANIO_PERIODO: this.filtroAnio,
				FILTRO_MES_PERIODO: this.filtroMes,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response?.Result) {
						this.models = response.Data || [];
						this.partidaSeleccionada = null;
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
		this.partidaSeleccionada = e?.row?.data ?? null;
	}

	onRowDblClick(e: any): void {
		if (e?.data && this.permiteGenerar) {
			this.partidaSeleccionada = e.data;
			this.generarContrapartida();
		}
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
}
