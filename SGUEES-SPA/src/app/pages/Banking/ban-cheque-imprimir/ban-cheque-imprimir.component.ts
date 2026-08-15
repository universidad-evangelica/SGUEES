import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { BanDocumentoService } from '../ban-documento/ban-documento.service';
import { CData } from 'src/app/FxAPI/CData';

@Component({
	selector: 'app-ban-cheque-imprimir',
	templateUrl: './ban-cheque-imprimir.component.html',
	styleUrls: ['./ban-cheque-imprimir.component.scss'],
})
export class BanChequeImprimirComponent extends CBaseComponent implements OnInit {
	private readonly lookupOpcion = 'BAN_CHEQUE_IMPRIMIR';

	models: any[] = [];
	vFECHA_INICIAL: Date = new Date();
	vFECHA_FINAL: Date = new Date();
	vCORR_CUENTA_BANCO = 0;
	mCORR_CUENTA_BANCO: any[] = [];
	chequeraActiva: any = null;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanDocumentoService,
		private objData: CData
	) {
		super(appInfoService, router);
		this.columns = this.service.getChequeImprimirColumns();
		this.summary = this.service.getChequeImprimirSummary();
	}

	ngOnInit(): void {
		this.tituloVentana = 'Impresión de Cheques';
		this.urlOpcion = '/ban-cheque-imprimir';
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));

		this.inicializarFiltros();
		this.getCORR_CUENTA_BANCO();
	}

	private inicializarFiltros(): void {
		const today = this.appInfoService.getDate();
		this.vFECHA_INICIAL = new Date(today.getFullYear(), today.getMonth(), 1);
		this.vFECHA_FINAL = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		this.vCORR_CUENTA_BANCO = 0;
		this.chequeraActiva = null;
		this.models = [];
		this.model = {};
	}

	limpiarFiltros(): void {
		this.inicializarFiltros();
	}

	getCORR_CUENTA_BANCO(): void {
		this.appInfoService
			.getLookUp(
				this.lookupOpcion,
				'BAN_CUENTA_BANCARIA',
				'GetCORR_CUENTA_BANCO',
				undefined,
				environment.UrlCONTAAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CUENTA_BANCO = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	onCuentaChanged(value: number): void {
		this.vCORR_CUENTA_BANCO = Number(value) || 0;
		this.chequeraActiva = null;
		this.models = [];
		if (this.vCORR_CUENTA_BANCO > 0) {
			this.cargarChequeraActiva();
		}
	}

	cargarChequeraActiva(): void {
		this.objData
			.Get(
				'BAN_CHEQUERA',
				'GetActivaBAN_CHEQUE_IMPRIMIR',
				[{ Parameter: 'CORR_CUENTA_BANCO', Value: this.vCORR_CUENTA_BANCO }],
				environment.UrlCONTAAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result) {
						this.chequeraActiva = null;
						this.notifyFx(response?.ErrorMessage || 'No se pudo consultar la chequera', NotifyType.Error);
						return;
					}

					this.chequeraActiva = response.Data || null;
					if (!this.chequeraActiva) {
						this.notifyFx(
							'La cuenta seleccionada no tiene chequera activa. Configure una chequera en Cuentas Bancarias.',
							NotifyType.Warning
						);
					}
				},
				error: (error: any) => {
					this.chequeraActiva = null;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	fillParam(): any {
		return {
			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),
			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),
			CORR_CUENTA_BANCO: this.vCORR_CUENTA_BANCO,
		};
	}

	consultar(): void {
		if (!this.vCORR_CUENTA_BANCO) {
			this.notifyFx('Debe seleccionar la cuenta bancaria', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.getAll('cheque-imprimir', this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.models = response.Data || [];
					} else {
						this.models = [];
						this.notifyFx(response.ErrorMessage || 'No se pudo consultar', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.models = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override focusedRowChanged(e: any): void {
		if (e?.row?.data) {
			this.model = e.row.data;
		}
	}

	imprimirCheque(): void {
		if (!this.vCORR_CUENTA_BANCO) {
			this.notifyFx('Debe seleccionar la cuenta bancaria', NotifyType.Warning);
			return;
		}
		if (!this.chequeraActiva) {
			this.notifyFx('No hay chequera activa para la cuenta seleccionada', NotifyType.Warning);
			return;
		}
		if (!this.model?.CORR_DOCUMENTO) {
			this.notifyFx('Seleccione un cheque en la grilla', NotifyType.Warning);
			return;
		}

		const numeroSiguiente = this.chequeraActiva.NUMERO_CHEQUE_ACTUAL;
		const serie = this.chequeraActiva.SERIE_CHEQUE || '';
		const confirma = custom({
			title: 'Confirmación de Impresión',
			messageHtml: `¿Imprimir el cheque seleccionado?<br/>Serie: <b>${serie}</b> — Número: <b>${numeroSiguiente}</b>`,
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.imprimirCheque(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									if (response.Result && response.ErrorCode === 0) {
										this.service
											.getChequeImprimirDatos(response.Data || this.model)
											.pipe(take(1))
											.subscribe({
												next: (printResponse: any) => {
													this.loadingVisible = false;
													if (printResponse.Result && printResponse.Data?.length) {
														this.abrirVistaImpresion(printResponse.Data);
														this.notifyFx('Cheque impreso con éxito', NotifyType.Success);
													} else {
														this.notifyFx('Cheque impreso, pero no se obtuvieron datos para la vista', NotifyType.Warning);
													}
													this.cargarChequeraActiva();
													this.consultar();
												},
												error: () => {
													this.loadingVisible = false;
													this.notifyFx('Cheque impreso, pero falló la vista de impresión', NotifyType.Warning);
													this.cargarChequeraActiva();
													this.consultar();
												},
											});
									} else {
										this.loadingVisible = false;
										this.notifyFx(response.ErrorMessage, NotifyType.Error);
									}
								},
								error: (error: any) => {
									this.loadingVisible = false;
									this.notifyFx(error, NotifyType.Error);
								},
							});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}

	private abrirVistaImpresion(filas: any[]): void {
		const encabezado = filas[0];
		const simbolo = encabezado.SIMBOLO_MONEDA || '$';
		const monto = Number(encabezado.MONTO_DOCUMENTO || 0).toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		const detalleHtml = filas
			.map(
				(f) =>
					`<tr><td>${this.escapeHtml(f.CUENTA_CONTABLE || '')}</td><td>${this.escapeHtml(
						f.NOMBRE_TRAN || f.NOMBRE_PARTIDA || ''
					)}</td><td style="text-align:right">${simbolo} ${Number(f.MONTO_CARGO || f.MONTO_ABONO || 0).toLocaleString(
						'en-US',
						{ minimumFractionDigits: 2, maximumFractionDigits: 2 }
					)}</td></tr>`
			)
			.join('');

		const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cheque ${encabezado.SERIE_CHEQUE || ''} ${encabezado.NUMERO_DOCUMENTO || ''}</title>
<style>
@page { size: letter; margin: 12mm; }
body { font-family: Arial, Helvetica, sans-serif; color: #111; }
.cheque { border: 1px solid #333; padding: 18px 22px; min-height: 220px; position: relative; }
.empresa { font-size: 14px; font-weight: bold; text-transform: uppercase; }
.lugar { margin-top: 8px; font-size: 12px; }
.fila { display: flex; justify-content: space-between; margin-top: 18px; gap: 16px; }
.etiqueta { font-size: 11px; color: #555; text-transform: uppercase; }
.valor { font-size: 16px; font-weight: bold; margin-top: 4px; }
.monto { font-size: 22px; font-weight: bold; text-align: right; }
.letras { margin-top: 14px; font-size: 13px; font-style: italic; min-height: 36px; }
.concepto { margin-top: 18px; font-size: 13px; }
.detalle { margin-top: 24px; width: 100%; border-collapse: collapse; font-size: 12px; }
.detalle th, .detalle td { border: 1px solid #ccc; padding: 6px 8px; }
.detalle th { background: #f5f5f5; text-align: left; }
.numero { position: absolute; top: 18px; right: 22px; text-align: right; }
@media print { .no-print { display: none; } }
</style></head><body>
<div class="no-print" style="margin-bottom:12px"><button onclick="window.print()">Imprimir</button></div>
<div class="cheque">
  <div class="numero">
    <div class="etiqueta">Cheque No.</div>
    <div class="valor">${this.escapeHtml(String(encabezado.SERIE_CHEQUE || ''))} ${this.escapeHtml(String(encabezado.NUMERO_DOCUMENTO || ''))}</div>
  </div>
  <div class="empresa">${this.escapeHtml(encabezado.NOMBRE_EMPRESA || '')}</div>
  <div class="lugar">${this.escapeHtml(encabezado.LUGAR_FECHA || '')}</div>
  <div class="fila">
    <div style="flex:1">
      <div class="etiqueta">Páguese a la orden de</div>
      <div class="valor">${this.escapeHtml(encabezado.NOMBRE_BENEFICIARIO || '')}</div>
    </div>
    <div style="min-width:160px">
      <div class="etiqueta">Monto</div>
      <div class="monto">${simbolo} ${monto}</div>
    </div>
  </div>
  <div class="letras">${this.escapeHtml(encabezado.CANTIDAD_LETRAS || '')}</div>
  <div class="concepto"><span class="etiqueta">Concepto: </span>${this.escapeHtml(encabezado.NOMBRE_PARTIDA || '')}</div>
  <div style="margin-top:10px;font-size:12px;color:#555">${this.escapeHtml(encabezado.NOMBRE_CUENTA_BANCO || '')} — ${this.escapeHtml(encabezado.NUMERO_CUENTA_BANCO || '')}</div>
</div>
<table class="detalle">
  <thead><tr><th>Cuenta</th><th>Detalle contable</th><th>Monto</th></tr></thead>
  <tbody>${detalleHtml}</tbody>
</table>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
</body></html>`;

		const ventana = window.open('', '_blank', 'width=900,height=700');
		if (!ventana) {
			this.notifyFx('Permita ventanas emergentes para imprimir el cheque', NotifyType.Warning);
			return;
		}
		ventana.document.open();
		ventana.document.write(html);
		ventana.document.close();
	}

	private escapeHtml(value: string): string {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}
}
