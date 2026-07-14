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
import { ConReporteRepository } from './con-reporte.repository';
import { ConReporteService } from './con-reporte.service';
import { ConParametroService } from '../con-parametro/con-parametro.service';
import { ConParametro } from '../con-parametro/models/con-parametro';
import { ConReporteDefinicion, ConReporteFiltro } from './models/con-reporte-filtro';
import { ConReporteUiConfig } from './models/con-reporte-ui.config';
import { ConReporteColumnaService } from './services/con-reporte-columna.service';
import { ConReporteShellComponent } from './shell/con-reporte-shell.component';
import { environment } from 'src/environments/environment';

@Component({
	template: '',
})
export abstract class ConReporteComponent extends CBaseComponent implements OnInit {
	@ViewChild(ConReporteShellComponent) shell?: ConReporteShellComponent;

	protected abstract readonly configUi: ConReporteUiConfig;

	definicion: ConReporteDefinicion | null = null;
	filtro: ConReporteFiltro = { CODIGO_REPORTE: '' };
	datos: unknown[] = [];
	columnas: Record<string, unknown>[] = [];
	mCuentas: unknown[] = [];
	private todasLasCuentas: unknown[] = [];
	nivelCuentaMayor = 0;
	consultaEjecutada = false;
	mostrarPdf = false;
	pdfUrl: SafeUrl | null = null;
	mMeses: unknown[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		protected repositorio: ConReporteRepository,
		protected servicio: ConReporteService,
		protected servicioParametro: ConParametroService,
		protected sanitizador: DomSanitizer,
		protected servicioColumna: ConReporteColumnaService,
	) {
		super(appInfoService, router);
		this.tituloVentana = router.snapshot.data['titulo'] || '';
	}

	get codigoReporte(): string {
		return this.configUi.codigo;
	}

	ngOnInit(): void {
		if (!this.tituloVentana) {
			this.tituloVentana = this.configUi.titulo;
		}

		this.inicializarFiltros();
		this.inicializarColumnas();
		this.llenarCombos();
		this.cargarParametrosContables();
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
		this.cargarMeses();
		this.cargarCuentasContables();
	}

	cargarMeses(): void {
		this.appInfoService
			.getLookUp('CON_REPORTE', 'GEN_LISTA', 'GetMES', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mMeses = (response.Data || []).map((item: any) => ({
							MES: parseInt(item.Key, 10),
							NOMBRE: item.Value,
						}));
					}
				},
			});
	}

	cargarCuentasContables(): void {
		this.appInfoService
			.getLookUp('CON_REPORTE', 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.todasLasCuentas = response.Data || [];
						this.filtrarCuentasMayor();
					}
				},
			});
	}

	tienePermisoImprimir(): boolean {
		const permiso = this.appInfoService.getPermiso(this.urlOpcion) || '';
		return permiso.includes('P');
	}

	consultar(): void {
		if (!this.servicio.esValido(this.codigoReporte, this.filtro, this.definicion, this.notifyFx)) {
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
						if (this.datos.length) {
							this.notifyFx(`Registros: ${this.datos.length}`, NotifyType.Success);
						} else {
							this.notificarSinRegistros();
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
					this.notifyFx(this.extraerMensajeError(error), NotifyType.Error);
				},
			});
	}

	limpiar(): void {
		this.inicializarFiltros();
		this.datos = [];
		this.inicializarColumnas();
		this.consultaEjecutada = false;
		this.mostrarPdf = false;
		this.limpiarPdf();
	}

	obtenerPdf(): void {
		if (!this.servicio.esValido(this.codigoReporte, this.filtro, this.definicion, this.notifyFx)) {
			return;
		}
		if (!this.muestraBotonVistaPrevia) {
			this.notifyFx(
				this.tienePermisoImprimir() ? 'PDF no disponible para este reporte' : 'No tiene permiso de impresión',
				NotifyType.Warning,
			);
			return;
		}

		this.loadingVisible = true;
		this.servicio
			.obtenerPdf(this.codigoReporte, this.filtro)
			.pipe(take(1))
			.subscribe({
				next: (archivoPdf: Blob) => {
					if (archivoPdf?.size) {
						this.limpiarPdf();
						this.pdfUrl = this.sanitizador.bypassSecurityTrustResourceUrl(
							window.URL.createObjectURL(archivoPdf),
						);
						this.mostrarPdf = true;
					} else {
						this.notifyFx('Error al generar PDF', NotifyType.Error);
						this.mostrarPdf = false;
					}
					this.loadingVisible = false;
					this.shell?.sincronizarAltoDrawer();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(this.extraerMensajeError(error), NotifyType.Error);
				},
			});
	}

	alExportar(e: any): void {
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

	private inicializarFiltros(): void {
		this.filtro = this.construirFiltroInicial();
	}

	private construirFiltroInicial(): ConReporteFiltro {
		const hoy = this.appInfoService.getDate();
		const ui = this.configUi.filtroInicial;
		const fechaCorte = ui?.fechaCorteMesAnterior ? new Date(hoy.getFullYear(), hoy.getMonth(), 0) : hoy;

		return {
			CODIGO_REPORTE: this.codigoReporte,
			FECHA_INICIAL: new Date(fechaCorte.getFullYear(), 0, 1),
			FECHA_FINAL: fechaCorte,
			FECHA_IMPRESION: hoy,
			ANIO_PERIODO: fechaCorte.getFullYear(),
			MES_PERIODO: fechaCorte.getMonth() + 1,
			PARTIDA_CIERRE: !!ui?.partidaCierreLiquidacionMayor,
			PARTIDA_LIQUIDACION: !!ui?.partidaCierreLiquidacionMayor,
			CUENTA_A_CERO: false,
			CONSOLIDADO: false,
			FOLIADO: false,
			NUMERO_FOLIO: 0,
			NIVEL: ui?.nivelDefault ?? 3,
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
						(response.Data || []).find((d: ConReporteDefinicion) => d.CODIGO_REPORTE === this.codigoReporte) ||
						null;

					if (!this.definicion) {
						this.notifyFx(`Reporte ${this.codigoReporte} no registrado en API`, NotifyType.Warning);
						return;
					}

					if (!this.definicion.SP_DISPONIBLE) {
						this.notifyFx(`El SP ${this.definicion.STORED_PROCEDURE} aún no está en SGUEES-DB`, NotifyType.Warning);
						return;
					}

					this.inicializarColumnas();
				},
			});
	}

	private cargarParametrosContables(): void {
		this.servicioParametro
			.getAll({ CORR_EMPRESA: this.appInfoService.CORR_EMPRESA })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response.Result || !response.Data?.length) {
						return;
					}

					const parametro = response.Data[0] as ConParametro;
					this.nivelCuentaMayor = parametro.NIVEL_CUENTA_MAYOR ?? 0;

					if (this.codigoReporte === 'LIBRO_DIARIO_MAYOR') {
						this.filtro.PARTIDA_CIERRE = true;
						this.filtro.PARTIDA_LIQUIDACION = true;
					} else {
						this.filtro.PARTIDA_CIERRE = parametro.INCLUIR_PARTIDA_CIERRE ?? false;
						this.filtro.PARTIDA_LIQUIDACION = parametro.INCLUIR_PARTIDA_LIQUIDACION ?? false;
					}

					this.filtrarCuentasMayor();
				},
			});
	}

	private filtrarCuentasMayor(): void {
		if (this.codigoReporte !== 'LIBRO_DIARIO_MAYOR' || !this.nivelCuentaMayor) {
			this.mCuentas = this.todasLasCuentas;
			return;
		}

		this.mCuentas = (this.todasLasCuentas as any[]).filter((cuenta) => cuenta.NIVEL === this.nivelCuentaMayor);
		this.limpiarCuentasFueraDeRango();
	}

	private limpiarCuentasFueraDeRango(): void {
		const codigosValidos = new Set((this.mCuentas as any[]).map((cuenta) => cuenta.CUENTA_CONTABLE));
		if (this.filtro.CUENTA_CONTABLE_INICIAL && !codigosValidos.has(this.filtro.CUENTA_CONTABLE_INICIAL)) {
			this.filtro.CUENTA_CONTABLE_INICIAL = null;
		}
		if (this.filtro.CUENTA_CONTABLE_FINAL && !codigosValidos.has(this.filtro.CUENTA_CONTABLE_FINAL)) {
			this.filtro.CUENTA_CONTABLE_FINAL = null;
		}
		if (this.filtro.CUENTA_CONTABLE && !codigosValidos.has(this.filtro.CUENTA_CONTABLE)) {
			this.filtro.CUENTA_CONTABLE = null;
		}
	}

	private inicializarColumnas(): void {
		if (!this.muestraGrid) {
			this.columnas = [];
			return;
		}

		this.columnas = this.servicioColumna.construirColumnasGrid(this.configUi);
	}

	private aplicarColumnasDesdeConfig(filas: unknown[]): void {
		const columnasBase = this.servicioColumna.construirColumnasGrid(this.configUi);
		this.columnas = this.servicioColumna.filtrarColumnasPorDatos(columnasBase, filas);
	}

	private notificarSinRegistros(): void {
		const sugerencias: string[] = [];
		if (this.codigoReporte === 'LIBRO_DIARIO_MAYOR') {
			sugerencias.push('use cuentas del nivel mayor configurado en parámetros contables');
			sugerencias.push('marque partidas de cierre y liquidación si aplica');
		}
		if (this.servicio.usaFiltro(this.definicion, 'CUENTA_A_CERO') && !this.filtro.CUENTA_A_CERO) {
			sugerencias.push('active "Cuenta a cero" para incluir cuentas sin movimiento');
		}
		if (
			this.servicio.usaFiltro(this.definicion, 'CUENTA_CONTABLE_INICIAL') &&
			(this.filtro.CUENTA_CONTABLE_INICIAL || this.filtro.CUENTA_CONTABLE_FINAL)
		) {
			sugerencias.push('pruebe dejar el rango de cuentas vacío');
		}

		const detalle = sugerencias.length ? ` ${sugerencias.join('; ')}.` : '';
		this.notifyFx(`No se encontraron registros con los filtros indicados.${detalle}`, NotifyType.Warning);
	}

	private limpiarPdf(): void {
		this.pdfUrl = null;
	}

	private extraerMensajeError(error: unknown): string {
		if (typeof error === 'string' && error.trim()) {
			return error.trim();
		}

		const err = error as { ErrorMessage?: string; message?: string };
		if (err?.ErrorMessage) {
			return err.ErrorMessage;
		}
		if (err?.message) {
			return err.message;
		}

		return 'No fue posible completar la operación del reporte.';
	}
}
