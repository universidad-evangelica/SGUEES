import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConPartidaService } from '../con-partida/con-partida.service';
import { ConPartidaDetaService } from '../con-partida-deta/con-partida-deta.service';
import { ConPartidaDocService } from '../con-partida/con-partida-doc.service';
import { ConPartidaOperacionModo, ConPartidaOperacionService } from './con-partida-operacion.service';

@Component({
	selector: 'app-con-partida-operacion',
	templateUrl: './con-partida-operacion.component.html',
	styleUrls: ['./con-partida-operacion.component.scss'],
})
export class ConPartidaOperacionComponent extends CBaseComponent implements OnInit {
	modo: ConPartidaOperacionModo = 'aplicar';
	models: any[] = [];
	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
	sinRegistrosMsg = '';
	btnImprimir = '';

	partidaConsulta: any = {};
	detallesConsulta: any[] = [];
	documentosConsulta: any[] = [];
	popupVisiblePdf = false;
	vPDF: Blob | null = null;
	PDF!: SafeUrl;

	detalleColumns: any[] = [];
	docColumns: any[] = [];
	partidaViewItems: any[] = [
		{ dataField: 'ANIO_PERIODO', label: { text: 'Año' }, colSpan: 2, editorOptions: { readOnly: true } },
		{ dataField: 'MES_PERIODO', label: { text: 'Mes' }, colSpan: 2, editorOptions: { readOnly: true } },
		{ dataField: 'NOMBRE_CORTO_CLASE', label: { text: 'Clase' }, colSpan: 2, editorOptions: { readOnly: true } },
		{ dataField: 'CORR_PARTIDA', label: { text: 'No. Partida' }, colSpan: 2, editorOptions: { readOnly: true } },
		{
			dataField: 'FECHA_PARTIDA',
			label: { text: 'Fecha' },
			colSpan: 2,
			editorType: 'dxDateBox',
			editorOptions: { readOnly: true, displayFormat: 'dd/MM/yyyy' },
		},
		{ dataField: 'NUMERO_DOCUMENTO', label: { text: 'No. Documento' }, colSpan: 2, editorOptions: { readOnly: true } },
		{ dataField: 'NOMBRE_ESTADO_PARTIDA', label: { text: 'Estado' }, colSpan: 2, editorOptions: { readOnly: true } },
		{ dataField: 'NOMBRE_PARTIDA', label: { text: 'Concepto' }, colSpan: 8, editorOptions: { readOnly: true } },
		{
			dataField: 'MONTO_CARGO',
			label: { text: 'Cargo' },
			colSpan: 4,
			editorType: 'dxNumberBox',
			editorOptions: { readOnly: true, format: '#,##0.00' },
		},
		{
			dataField: 'MONTO_ABONO',
			label: { text: 'Abono' },
			colSpan: 4,
			editorType: 'dxNumberBox',
			editorOptions: { readOnly: true, format: '#,##0.00' },
		},
	];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConPartidaOperacionService,
		private partidaService: ConPartidaService,
		private detaService: ConPartidaDetaService,
		private docService: ConPartidaDocService,
		private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.detalleColumns = this.detaService.getColumns();
		this.docColumns = this.docService.getColumns();
		this.imprimirPartidaDesdeFila = this.imprimirPartidaDesdeFila.bind(this);
		this.gridPrintButtonVisible = this.gridPrintButtonVisible.bind(this);
	}

	getAccionLabel(): string {
		return this.service.getAccionLabel(this.modo);
	}

	ngOnInit(): void {
		const routeData = this.resolveRouteData();
		this.modo = (routeData['modo'] as ConPartidaOperacionModo) || 'aplicar';
		this.tituloVentana = (routeData['titulo'] as string) || this.service.getAccionLabel(this.modo);
		this.urlOpcion =
			this.modo === 'aplicar'
				? '/con-partida-aplicar'
				: this.modo === 'desaplicar'
					? '/con-partida-desaplicar'
					: '/con-partida-anular';
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		if (this.appInfoService.getPermiso('/con-partida').includes('P')) {
			this.permitePrint = true;
		}
		this.refrescarBotones();
		this.actualizarMensajeSinRegistros();

		const today = this.appInfoService.getDate();
		this.vFECHA_INICIAL = new Date(today.getFullYear(), today.getMonth(), 1);
		this.vFECHA_FINAL = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		this.consultar();
	}

	private resolveRouteData(): Record<string, unknown> {
		let route = this.router.snapshot;
		const merged: Record<string, unknown> = { ...route.data };
		while (route.firstChild) {
			route = route.firstChild;
			Object.assign(merged, route.data);
		}
		return merged;
	}

	private actualizarMensajeSinRegistros(): void {
		if (this.modo === 'aplicar') {
			this.sinRegistrosMsg =
				'No hay partidas digitadas cuadradas en el rango de fechas. Verifique cargo/abono y que el estado sea Digitada (DI).';
			return;
		}
		if (this.modo === 'desaplicar') {
			this.sinRegistrosMsg = 'No hay partidas aplicadas en el rango de fechas seleccionado.';
			return;
		}
		this.sinRegistrosMsg = 'No hay partidas aplicadas para anular en el rango de fechas seleccionado.';
	}

	refrescarBotones(): void {
		this.btnImprimir = this.permitePrint ? 'Imprimir' : '';
	}

	fillParam(): any {
		return {
			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),
			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),
		};
	}

	consultar() {
		this.loadingVisible = true;
		this.service
			.getAll(this.modo, this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data || [];
					} else {
						this.models = [];
						this.notifyFx(response.ErrorMessage || 'No se pudo consultar las partidas', NotifyType.Error);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.models = [];
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override focusedRowChanged(e: any): void {
		if (e?.row?.data) {
			this.model = e.row.data;
		}
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		const row = e?.data || e?.row?.data;
		if (!row) {
			return;
		}
		this.model = row;
		this.partidaConsulta = { ...row };
		this.cargarDetalleYDocumentos(row);
	}

	volverAlListado(): void {
		this.AsignaStatus(UpdateType.Browse);
		this.refrescarBotones();
	}

	private cargarDetalleYDocumentos(row: any): void {
		this.detallesConsulta = [];
		this.documentosConsulta = [];

		this.detaService
			.getAll({ CORR_PARTIDA: row.CORR_PARTIDA })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detallesConsulta = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});

		this.docService
			.getAllDetaDoc({
				ANIO_PERIODO: row.ANIO_PERIODO,
				MES_PERIODO: row.MES_PERIODO,
				CORR_CLASE_PARTIDA: row.CORR_CLASE_PARTIDA,
				CORR_PARTIDA: row.CORR_PARTIDA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.documentosConsulta = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	hasPartidaSeleccionada(): boolean {
		return !!(
			this.model?.CORR_PARTIDA &&
			this.model?.ANIO_PERIODO &&
			this.model?.MES_PERIODO &&
			this.model?.CORR_CLASE_PARTIDA
		);
	}

	gridPrintButtonVisible(): boolean {
		return this.permitePrint;
	}

	imprimirPartidaDesdeFila(e: { row: { data: any } }): void {
		this.model = e.row.data;
		this.imprimirPartida();
	}

	imprimirPartidaConsulta(): void {
		this.model = this.partidaConsulta;
		this.imprimirPartida();
	}

	imprimirPartida(): void {
		if (!this.hasPartidaSeleccionada()) {
			this.notifyFx('Seleccione una partida para imprimir', NotifyType.Warning);
			return;
		}
		const fechaPartida = this.model.FECHA_PARTIDA || this.vFECHA_INICIAL;
		this.loadingVisible = true;
		this.partidaService
			.getPDF({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_CLASE_PARTIDA: this.model.CORR_CLASE_PARTIDA,
				CORR_PARTIDA: this.model.CORR_PARTIDA,
				FECHA_INICIAL: this.appInfoService.toDate(fechaPartida),
				FECHA_FINAL: this.appInfoService.toDate(fechaPartida),
			})
			.pipe(take(1))
			.subscribe({
				next: (pdf: Blob) => {
					if (pdf?.size) {
						this.vPDF = pdf;
						this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(pdf));
						this.popupVisiblePdf = true;
					} else {
						this.notifyFx('No se recibió el PDF de la partida', NotifyType.Error);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					const msg =
						typeof error === 'string'
							? error
							: error?.ErrorMessage || error?.message || 'Error al generar PDF';
					this.notifyFx(msg, NotifyType.Error);
				},
			});
	}

	selectTodos() {
		this.models.forEach((x: any) => {
			x.SELECCION = true;
		});
	}

	selectNinguno() {
		this.models.forEach((x: any) => {
			x.SELECCION = false;
		});
	}

	ejecutarOperacion() {
		const selectedModels = this.models.filter((y: { SELECCION: boolean }) => y.SELECCION === true);
		if (selectedModels.length === 0) {
			this.notifyFx('Debe seleccionar al menos una partida', NotifyType.Error);
			return;
		}

		const accion = this.service.getAccionLabel(this.modo);
		const confirma = custom({
			title: `Confirmación de ${accion}`,
			messageHtml: `¿Realmente quiere ${accion.toLowerCase()} las partidas seleccionadas?`,
			buttons: [
				{
					text: 'Si',
					onClick: () => {
						selectedModels.forEach((x: any) => {
							this.service
								.ejecutar(this.modo, x)
								.pipe(take(1))
								.subscribe({
									next: (response: any) => {
										if (response.Result) {
											this.notifyFx(`${accion} con éxito`, NotifyType.Success);
										} else {
											this.notifyFx(response.ErrorMessage, NotifyType.Error);
										}
										this.consultar();
									},
									error: (error: any) => {
										this.notifyFx(error, NotifyType.Error);
									},
								});
						});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}
}
