import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { environment } from 'src/environments/environment';
import { BanReporteRepository } from './ban-reporte.repository';
import { BanReporteService } from './ban-reporte.service';
import { BanReporteDefinicion, BanReporteFiltro } from './models/ban-reporte-filtro';
import { BanReporteUiConfig } from './models/ban-reporte-ui.config';
import { BanReporteColumnaService } from './services/ban-reporte-columna.service';
import { BanReporteShellComponent } from './shell/ban-reporte-shell.component';

/** Base BAN_REPO — filtros compartidos como e-Admin BAN_REPO.vb */
@Component({ template: '' })
export abstract class BanReporteComponent extends CBaseComponent implements OnInit {
	@ViewChild(BanReporteShellComponent) shell?: BanReporteShellComponent;

	protected abstract readonly configUi: BanReporteUiConfig;

	definicion: BanReporteDefinicion | null = null;
	filtro: BanReporteFiltro = { CODIGO_REPORTE: '' };
	datos: unknown[] = [];
	columnas: Record<string, unknown>[] = [];
	mCuentasBanco: unknown[] = [];
	mTiposMovimiento: unknown[] = [];
	consultaEjecutada = false;
	mostrarPdf = false;
	pdfUrl: SafeUrl | null = null;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		protected repositorio: BanReporteRepository,
		protected servicio: BanReporteService,
		protected sanitizador: DomSanitizer,
		protected servicioColumna: BanReporteColumnaService
	) {
		super(appInfoService, router);
		this.tituloVentana = router.snapshot.data['titulo'] || '';
		this.urlOpcion = router.snapshot.data['urlOpcion'] || '';
	}

	get codigoReporte(): string {
		return this.configUi.codigo;
	}

	ngOnInit(): void {
		if (!this.tituloVentana) {
			this.tituloVentana = this.configUi.titulo;
		}
		if (!this.urlOpcion && this.definicion?.URL_OPCION) {
			this.urlOpcion = this.definicion.URL_OPCION;
		}

		this.inicializarFiltros();
		this.inicializarColumnas();
		this.llenarCombos();
		this.cargarDefinicion();
	}

	get muestraGrid(): boolean {
		return this.servicio.esConsultaGrid(this.definicion);
	}

	get muestraBotonConsultar(): boolean {
		return this.muestraGrid;
	}

	get muestraBotonVistaPrevia(): boolean {
		return this.servicio.esPdfDisponible(this.definicion) && this.tienePermisoImprimir();
	}

	llenarCombos(): void {
		this.cargarCuentasBanco();
		this.cargarTiposMovimiento();
	}

	cargarCuentasBanco(): void {
		this.appInfoService
			.getLookUp('BAN_REPORTE', 'BAN_CUENTA_BANCARIA', 'GetCORR_CUENTA_BANCO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCuentasBanco = response.Data || [];
					}
				},
			});
	}

	cargarTiposMovimiento(): void {
		this.appInfoService
			.getLookUp('BAN_REPORTE', 'BAN_TIPO_MOVI_BANCARIO', 'GetCORR_TIPO_MOVIMIENTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mTiposMovimiento = response.Data || [];
					}
				},
			});
	}

	tienePermisoImprimir(): boolean {
		const permiso = this.appInfoService.getPermiso(this.urlOpcion) || '';
		return permiso.includes('P');
	}

	consultar(): void {
		if (!this.servicio.esValido(this.codigoReporte, this.filtro, this.definicion, this.notifyFx.bind(this))) {
			return;
		}

		this.loadingVisible = true;
		this.consultaEjecutada = true;
		this.mostrarPdf = false;
		this.repositorio
			.consultar(this.servicio.armarFiltroEnvio(this.codigoReporte, this.filtro))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.datos = response.Data || [];
						this.aplicarColumnasDesdeConfig(this.datos);
						if (!this.datos.length) {
							this.notifyFx('No se encontraron registros con los filtros indicados.', NotifyType.Warning);
						}
					} else {
						this.datos = [];
						this.inicializarColumnas();
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
					this.loadingVisible = false;
					this.shell?.sincronizarAltoDrawer();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error?.ErrorMessage || error?.message || error, NotifyType.Error);
				},
			});
	}

	limpiar(): void {
		this.inicializarFiltros();
		this.datos = [];
		this.inicializarColumnas();
		this.consultaEjecutada = false;
		this.mostrarPdf = false;
		this.pdfUrl = null;
	}

	obtenerPdf(): void {
		if (!this.servicio.esValido(this.codigoReporte, this.filtro, this.definicion, this.notifyFx.bind(this))) {
			return;
		}
		if (!this.muestraBotonVistaPrevia) {
			this.notifyFx('PDF no disponible o sin permiso de impresión', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.servicio
			.obtenerPdf(this.codigoReporte, this.filtro)
			.pipe(take(1))
			.subscribe({
				next: (archivoPdf: Blob) => {
					if (archivoPdf?.size) {
						this.pdfUrl = this.sanitizador.bypassSecurityTrustResourceUrl(
							window.URL.createObjectURL(archivoPdf)
						);
						this.mostrarPdf = true;
					} else {
						this.notifyFx('Error al generar PDF', NotifyType.Error);
					}
					this.loadingVisible = false;
					this.shell?.sincronizarAltoDrawer();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error?.ErrorMessage || error?.message || error, NotifyType.Error);
				},
			});
	}

	alExportar(e: any): void {
		const workbook = new Workbook();
		const worksheet = workbook.addWorksheet(this.codigoReporte);
		exportDataGrid({ component: e.component, worksheet, autoFilterEnabled: true }).then(() => {
			workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
				saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${this.codigoReporte}.xlsx`);
			});
		});
		e.cancel = true;
	}

	private inicializarFiltros(): void {
		const hoy = this.appInfoService.getDate();
		this.filtro = {
			CODIGO_REPORTE: this.codigoReporte,
			FECHA_INICIAL: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
			FECHA_FINAL: hoy,
			FECHA_IMPRESION: hoy,
			CORR_CUENTA_BANCO: null,
			CORR_TIPO_MOVIMIENTO: null,
			NUMERO_DOCUMENTO_INICIAL: 0,
			NUMERO_DOCUMENTO_FINAL: 0,
		};
	}

	private cargarDefinicion(): void {
		this.repositorio
			.obtenerDefiniciones()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response.Result) {
						return;
					}
					this.definicion =
						(response.Data || []).find((d: BanReporteDefinicion) => d.CODIGO_REPORTE === this.codigoReporte) ||
						null;
					if (this.definicion?.URL_OPCION) {
						this.urlOpcion = this.definicion.URL_OPCION;
						this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
					}
					if (!this.definicion?.SP_DISPONIBLE) {
						this.notifyFx(
							`El SP ${this.definicion?.STORED_PROCEDURE ?? ''} aún no está en SGUEES-DB`,
							NotifyType.Warning
						);
					}
					this.inicializarColumnas();
				},
			});
	}

	private inicializarColumnas(): void {
		this.columnas = this.muestraGrid ? this.servicioColumna.construirColumnasGrid(this.configUi) : [];
	}

	private aplicarColumnasDesdeConfig(filas: unknown[]): void {
		const columnasBase = this.servicioColumna.construirColumnasGrid(this.configUi);
		this.columnas = this.servicioColumna.filtrarColumnasPorDatos(columnasBase, filas);
	}
}
