import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ConReporteRepository } from './con-reporte.repository';
import { ConReporteService } from './con-reporte.service';
import { ConCatalogoCuentaService } from '../con-catalogo-cuenta/con-catalogo-cuenta.service';
import { ConReporteDefinicion, ConReporteFiltro, ConConfiReporte } from './models/con-reporte-filtro';

@Component({
	selector: 'app-con-reporte',
	templateUrl: './con-reporte.component.html',
	styleUrls: ['./con-reporte.component.scss'],
})
export class ConReporteComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridReporte', { static: false }) gridReporte!: DxDataGridComponent;

	codigoReporte = '';
	drawerHeight = 'calc(100vh - 100px)';
	isDrawerOpen = true;
	toolbarContent = [
		{
			widget: 'dxButton',
			location: 'before',
			options: {
				icon: 'menu',
				onClick: () => (this.isDrawerOpen = !this.isDrawerOpen),
			},
		},
	];
	definicion: ConReporteDefinicion | null = null;
	filtro: ConReporteFiltro = this.buildFiltroInicial();
	datos: any[] = [];
	columnas: any[] = [];
	mCuentas: any[] = [];
	mConfiReporte: ConConfiReporte[] = [];
	popupVisiblePdf = false;
	vPDF: Blob | null = null;
	PDF!: SafeUrl;
	mMeses = [
		{ MES: 1, NOMBRE: 'Enero' },
		{ MES: 2, NOMBRE: 'Febrero' },
		{ MES: 3, NOMBRE: 'Marzo' },
		{ MES: 4, NOMBRE: 'Abril' },
		{ MES: 5, NOMBRE: 'Mayo' },
		{ MES: 6, NOMBRE: 'Junio' },
		{ MES: 7, NOMBRE: 'Julio' },
		{ MES: 8, NOMBRE: 'Agosto' },
		{ MES: 9, NOMBRE: 'Septiembre' },
		{ MES: 10, NOMBRE: 'Octubre' },
		{ MES: 11, NOMBRE: 'Noviembre' },
		{ MES: 12, NOMBRE: 'Diciembre' },
	];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private repo: ConReporteRepository,
		private service: ConReporteService,
		private cuentaService: ConCatalogoCuentaService,
		private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.tituloVentana = router.snapshot.data['titulo'] || 'Reporte Contable';
		this.codigoReporte = router.snapshot.data['codigo'] || '';
	}

	ngOnInit(): void {
		this.inicializarFiltros();
		this.cargarCatalogos();
		this.cargarDefinicion();
	}

	usa(filtro: string): boolean {
		return this.service.usaFiltro(this.definicion, filtro);
	}

	pdfDisponible(): boolean {
		return this.service.esPdfDisponible(this.definicion) && this.tienePermisoImprimir();
	}

	consultaGridDisponible(): boolean {
		return this.service.esConsultaGrid(this.definicion);
	}

	tienePermisoImprimir(): boolean {
		const permiso = this.appInfoService.getPermiso(this.urlOpcion) || '';
		return permiso.includes('P');
	}

	consultar(): void {
		if (!this.service.esValido(this.codigoReporte, this.filtro, this.definicion, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		this.repo
			.consultar(this.service.buildPayload(this.codigoReporte, this.filtro))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.datos = response.Data || [];
						this.columnas = this.buildColumnas(this.datos);
						this.notifyFx(`Registros: ${this.datos.length}`, NotifyType.Success);
					} else {
						this.datos = [];
						this.columnas = [];
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	limpiar(): void {
		this.filtro = this.buildFiltroInicial();
		this.datos = [];
		this.columnas = [];
	}

	obtenerPDF(): void {
		if (!this.service.esValido(this.codigoReporte, this.filtro, this.definicion, this.notifyFx)) {
			return;
		}
		if (!this.pdfDisponible()) {
			this.notifyFx(
				this.tienePermisoImprimir() ? 'PDF no disponible para este reporte' : 'No tiene permiso de impresion',
				NotifyType.Warning
			);
			return;
		}

		this.loadingVisible = true;
		this.service
			.getPDF(this.codigoReporte, this.filtro)
			.pipe(take(1))
			.subscribe({
				next: (vPDF: Blob) => {
					if (vPDF?.size) {
						this.vPDF = vPDF;
						this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vPDF));
						this.popupVisiblePdf = true;
					} else {
						this.notifyFx('Error al generar PDF', NotifyType.Error);
						this.popupVisiblePdf = false;
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	hidePdfPopup(): void {
		this.popupVisiblePdf = false;
		this.limpiarPdf();
	}

	limpiarPdf(): void {
		this.vPDF = null;
		this.PDF = null as unknown as SafeUrl;
	}

	onExporting(e: any): void {
		const workbook = new Workbook();
		const worksheet = workbook.addWorksheet(this.codigoReporte);
		exportDataGrid({
			component: e.component,
			worksheet,
			autoFilterEnabled: true,
		}).then(() => {
			workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
				saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${this.codigoReporte}.xlsx`);
			});
		});
		e.cancel = true;
	}

	private buildFiltroInicial(): ConReporteFiltro {
		const today = this.appInfoService.getDate();
		return {
			CODIGO_REPORTE: this.codigoReporte,
			FECHA_INICIAL: new Date(today.getFullYear(), 0, 1),
			FECHA_FINAL: today,
			FECHA_IMPRESION: today,
			ANIO_PERIODO: today.getFullYear(),
			MES_PERIODO: today.getMonth() + 1,
			PARTIDA_CIERRE: false,
			PARTIDA_LIQUIDACION: false,
			CUENTA_A_CERO: false,
			CONSOLIDADO: false,
			FOLIADO: false,
			NUMERO_FOLIO: 0,
			NIVEL: 3,
		};
	}

	private inicializarFiltros(): void {
		this.filtro = this.buildFiltroInicial();
	}

	private cargarDefinicion(): void {
		this.repo
			.getDefiniciones()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.definicion =
							(response.Data || []).find((d: ConReporteDefinicion) => d.CODIGO_REPORTE === this.codigoReporte) ||
							null;
						if (!this.definicion) {
							this.notifyFx(`Reporte ${this.codigoReporte} no registrado en API`, NotifyType.Warning);
						} else if (!this.definicion.SP_DISPONIBLE) {
							this.notifyFx(
								`El SP ${this.definicion.STORED_PROCEDURE} aun no esta en SGUEES-DB`,
								NotifyType.Warning
							);
						}
					}
				},
			});
	}

	private cargarCatalogos(): void {
		this.cuentaService
			.getAll({ CUENTA_CONTABLE: '' })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCuentas = response.Data || [];
					}
				},
			});

		if (
			this.codigoReporte === 'LIBRO_DIARIO_AUXILIAR' ||
			this.codigoReporte === 'LIBRO_DIARIO_AUXILIAR_MES'
		) {
			this.repo
				.getConfiReportes()
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.mConfiReporte = response.Data || [];
						}
					},
				});
		}
	}

	private buildColumnas(rows: any[]): any[] {
		if (!rows?.length) {
			return [];
		}
		return Object.keys(rows[0]).map((key) => ({
			dataField: key,
			caption: key.replace(/_/g, ' '),
		}));
	}
}
