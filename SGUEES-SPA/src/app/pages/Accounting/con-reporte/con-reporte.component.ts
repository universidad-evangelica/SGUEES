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
import { ConParametroService } from '../con-parametro/con-parametro.service';
import { ConParametro } from '../con-parametro/models/con-parametro';
import { ConReporteDefinicion, ConReporteFiltro } from './models/con-reporte-filtro';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-con-reporte',
	templateUrl: './con-reporte.component.html',
	styleUrls: ['./con-reporte.component.scss'],
})
export class ConReporteComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridReporte', { static: false }) gridReporte!: DxDataGridComponent;

	codigoReporte = '';
	isDrawerOpen = true;

	toggleFiltros(): void {
		this.isDrawerOpen = !this.isDrawerOpen;
	}

	definicion: ConReporteDefinicion | null = null;
	filtro: ConReporteFiltro = this.buildFiltroInicial();
	datos: any[] = [];
	columnas: any[] = [];
	mCuentas: any[] = [];
	private allCuentas: any[] = [];
	nivelCuentaMayor = 0;
	consultaEjecutada = false;
	mostrarPdf = false;
	vPDF: Blob | null = null;
	PDF!: SafeUrl;
	mMeses: any[] = [];

	cuentaDisplayExpr = (item: any) => (item ? `${item.CUENTA_CONTABLE} · ${item.NOMBRE_CUENTA}` : '');

	private readonly hiddenColumns = new Set([
		'CORR_EMPRESA',
		'CORR_PARTIDA',
		'CORR_PARTIDA_DETA',
		'CORR_CLASE_PARTIDA',
		'NOMBRE_EMPRESA',
		'PERIODO',
		'LOGO1',
		'LOGO2',
		'TITULO_REPORTE',
		'NOMBRE_SISTEMA',
		'FECHA_IMPRESION',
		'DESCRIPCION_MONEDA',
		'NOMBRE_MONEDA',
		'SIMBOLO_MONEDA',
		'FOLIADO',
		'NUMERO_FOLIO',
		'CUENTA_A_CERO',
		'NIVEL',
		'NIVEL_CUENTA_MAYOR',
		'CODIGO_RUBRO',
		'MUESTRA_FIRMA',
		'MOSTRAR_FECHA_IMPRESION',
		'CLASE_RUBRO',
		'CONSOLIDADO',
		'CUENTA_DEPARTAMENTO',
		'CUENTA_MAYOR_2',
		'CUENTA_MAYOR_3',
		'CUENTA_MAYOR_4',
	]);

	private readonly columnLabels: Record<string, string> = {
		FECHA_PARTIDA: 'Fecha',
		CUENTA_CONTABLE: 'Cuenta',
		NOMBRE_CUENTA: 'Descripción',
		NUMERO_DOCUMENTO: 'Documento',
		NOMBRE_CLASE_PARTIDA: 'Clase',
		MONTO_CARGO: 'Cargo',
		MONTO_ABONO: 'Abono',
		SALDO_INICIAL: 'Saldo inicial',
		SALDO_FINAL: 'Saldo final',
		SALDO_MES: 'Saldo mes',
		SALDO_FINAL_MES: 'Saldo mes',
		SALDO_FINAL_2: 'Saldo acum.',
		NOMBRE_CENTRO: 'Centro costo',
		NOMBRE_TRAN: 'Transacción',
		ANIO_PERIODO: 'Año',
		MES_PERIODO: 'Mes',
		CUENTA_MAYOR_2: 'Mayor 2',
		CUENTA_MAYOR_3: 'Mayor 3',
		CUENTA_MAYOR_4: 'Mayor 4',
		CUENTA_DEPARTAMENTO: 'Departamento',
		CARGO_PERIODO: 'Cargos',
		ABONO_PERIODO: 'Abonos',
	};

	private readonly columnOrder = [
		'CUENTA_CONTABLE',
		'NOMBRE_CUENTA',
		'FECHA_PARTIDA',
		'NUMERO_DOCUMENTO',
		'NOMBRE_CLASE_PARTIDA',
		'SALDO_INICIAL',
		'CARGO_PERIODO',
		'MONTO_CARGO',
		'ABONO_PERIODO',
		'MONTO_ABONO',
		'SALDO_FINAL',
		'SALDO_FINAL_MES',
		'SALDO_MES',
		'NOMBRE_CENTRO',
		'NOMBRE_TRAN',
		'ANIO_PERIODO',
		'MES_PERIODO',
	];

	private readonly columnWidths: Record<string, number> = {
		CUENTA_CONTABLE: 95,
		FECHA_PARTIDA: 105,
		NUMERO_DOCUMENTO: 115,
		NOMBRE_CLASE_PARTIDA: 85,
		NOMBRE_CENTRO: 160,
		NOMBRE_TRAN: 160,
		ANIO_PERIODO: 70,
		MES_PERIODO: 60,
		MONTO_CARGO: 120,
		MONTO_ABONO: 120,
		SALDO_INICIAL: 120,
		SALDO_FINAL: 120,
		SALDO_FINAL_MES: 120,
		CARGO_PERIODO: 120,
		ABONO_PERIODO: 120,
	};

	private readonly flexColumns = new Set(['NOMBRE_CUENTA']);

	private readonly wrapColumns = new Set(['NOMBRE_CUENTA', 'NOMBRE_CENTRO', 'NOMBRE_TRAN', 'CUENTA_DEPARTAMENTO']);

	private readonly defaultColumnKeys: Record<string, string[]> = {
		LIBRO_DIARIO_AUXILIAR: [
			'CUENTA_CONTABLE',
			'NOMBRE_CUENTA',
			'FECHA_PARTIDA',
			'NUMERO_DOCUMENTO',
			'NOMBRE_CLASE_PARTIDA',
			'MONTO_CARGO',
			'MONTO_ABONO',
			'SALDO_FINAL',
		],
		LIBRO_DIARIO_AUXILIAR_MES: [
			'CUENTA_CONTABLE',
			'NOMBRE_CUENTA',
			'FECHA_PARTIDA',
			'NUMERO_DOCUMENTO',
			'NOMBRE_CLASE_PARTIDA',
			'MONTO_CARGO',
			'MONTO_ABONO',
			'SALDO_FINAL_MES',
		],
		LIBRO_DIARIO_MAYOR: [
			'CUENTA_CONTABLE',
			'NOMBRE_CUENTA',
			'SALDO_INICIAL',
			'CARGO_PERIODO',
			'ABONO_PERIODO',
			'SALDO_FINAL',
		],
		BALANCE_COMPROBACION: [
			'CUENTA_CONTABLE',
			'NOMBRE_CUENTA',
			'SALDO_INICIAL',
			'CARGO_PERIODO',
			'ABONO_PERIODO',
			'SALDO_FINAL',
		],
		BALANCE_COMPROBACION_MES: [
			'CUENTA_CONTABLE',
			'NOMBRE_CUENTA',
			'SALDO_INICIAL',
			'CARGO_PERIODO',
			'ABONO_PERIODO',
			'SALDO_FINAL_MES',
		],
		BALANCE_GENERAL: [
			'CUENTA_CONTABLE1',
			'NOMBRE_CUENTA1',
			'SALDO_FINAL1',
			'CUENTA_CONTABLE2',
			'NOMBRE_CUENTA2',
			'SALDO_FINAL2',
		],
		ESTADO_RESULTADOS: [
			'CUENTA_MAYOR_1',
			'NOMBRE_CUENTA_MAYOR_1',
			'CUENTA_CONTABLE',
			'NOMBRE_CUENTA',
			'SALDO_MES',
			'SALDO_FINAL',
		],
		BALANCE_GENERAL_VERTICAL: [
			'CUENTA_CONTABLE',
			'NOMBRE_CUENTA',
			'SALDO_INICIAL',
			'CARGO_PERIODO',
			'ABONO_PERIODO',
			'SALDO_FINAL',
		],
	};

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private repo: ConReporteRepository,
		private service: ConReporteService,
		private parametroService: ConParametroService,
		private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.tituloVentana = router.snapshot.data['titulo'] || 'Reporte Contable';
		this.codigoReporte = router.snapshot.data['codigo'] || '';
	}

	ngOnInit(): void {
		this.inicializarFiltros();
		this.llenaComboBox();
		this.cargarParametrosContables();
		this.cargarDefinicion();
	}

	llenaComboBox(): void {
		this.getMES();
		this.getCUENTA_CONTABLE();
	}

	getMES(): void {
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

	getCUENTA_CONTABLE(): void {
		this.appInfoService
			.getLookUp('CON_REPORTE', 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.allCuentas = response.Data || [];
						this.filtrarCuentasMayor();
					}
				},
			});
	}

	usa(filtro: string): boolean {
		return this.service.usaFiltro(this.definicion, filtro);
	}

	usaGrupoPeriodo(): boolean {
		return ['FECHA_INICIAL', 'FECHA_FINAL', 'ANIO_PERIODO', 'MES_PERIODO'].some((f) => this.usa(f));
	}

	usaGrupoCuentas(): boolean {
		return ['CUENTA_CONTABLE_INICIAL', 'CUENTA_CONTABLE_FINAL', 'CUENTA_CONTABLE', 'CUENTA_DEPARTAMENTO', 'NIVEL'].some(
			(f) => this.usa(f)
		);
	}

	usaGrupoOpciones(): boolean {
		return ['PARTIDA_CIERRE', 'PARTIDA_LIQUIDACION', 'CONSOLIDADO', 'CUENTA_A_CERO', 'FOLIADO', 'NUMERO_FOLIO'].some((f) =>
			this.usa(f)
		);
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
		this.consultaEjecutada = true;
		this.mostrarPdf = false;
		this.repo
			.consultar(this.service.buildPayload(this.codigoReporte, this.filtro))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.datos = response.Data || [];
						this.columnas = this.buildColumnas(this.datos);
						if (this.datos.length) {
							this.notifyFx(`Registros: ${this.datos.length}`, NotifyType.Success);
						} else {
							this.notifySinRegistros();
						}
					} else {
						this.datos = [];
						this.inicializarColumnasPorDefecto();
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(this.extractErrorMessage(error), NotifyType.Error);
				},
			});
	}

	limpiar(): void {
		this.filtro = this.buildFiltroInicial();
		this.datos = [];
		this.inicializarColumnasPorDefecto();
		this.consultaEjecutada = false;
		this.mostrarPdf = false;
		this.limpiarPdf();
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
						this.limpiarPdf();
						this.vPDF = vPDF;
						this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vPDF));
						this.mostrarPdf = true;
					} else {
						this.notifyFx('Error al generar PDF', NotifyType.Error);
						this.mostrarPdf = false;
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(this.extractErrorMessage(error), NotifyType.Error);
				},
			});
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
		const esLibroMayor = this.codigoReporte === 'LIBRO_DIARIO_MAYOR';
		const usaSoloFechaCorte = ['BALANCE_GENERAL', 'ESTADO_RESULTADOS', 'BALANCE_GENERAL_VERTICAL', 'BALANCE_COMPROBACION', 'BALANCE_COMPROBACION_MES'].includes(
			this.codigoReporte
		);
		// Contabilidad migrada por periodos: usar cierre del mes anterior (ej. mayo si estamos en junio)
		const fechaCorte = usaSoloFechaCorte
			? new Date(today.getFullYear(), today.getMonth(), 0)
			: today;
		return {
			CODIGO_REPORTE: this.codigoReporte,
			FECHA_INICIAL: new Date(fechaCorte.getFullYear(), 0, 1),
			FECHA_FINAL: fechaCorte,
			FECHA_IMPRESION: today,
			ANIO_PERIODO: fechaCorte.getFullYear(),
			MES_PERIODO: fechaCorte.getMonth() + 1,
			PARTIDA_CIERRE: esLibroMayor,
			PARTIDA_LIQUIDACION: esLibroMayor,
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
						} else {
							this.inicializarColumnasPorDefecto();
						}
					}
				},
			});
	}

	private cargarParametrosContables(): void {
		this.parametroService
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
			this.mCuentas = this.allCuentas;
			return;
		}

		this.mCuentas = this.allCuentas.filter((cuenta) => cuenta.NIVEL === this.nivelCuentaMayor);
		this.limpiarCuentasFueraDeRango();
	}

	private limpiarCuentasFueraDeRango(): void {
		const codigosValidos = new Set(this.mCuentas.map((cuenta) => cuenta.CUENTA_CONTABLE));
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

	private notifySinRegistros(): void {
		const hints: string[] = [];
		if (this.codigoReporte === 'LIBRO_DIARIO_MAYOR') {
			hints.push('use cuentas del nivel mayor configurado en parametros contables');
			hints.push('marque partidas de cierre y liquidacion si aplica');
		}
		if (this.usa('CUENTA_A_CERO') && !this.filtro.CUENTA_A_CERO) {
			hints.push('active "Cuenta a cero" para incluir cuentas sin movimiento');
		}
		if (this.usa('CUENTA_CONTABLE_INICIAL') && (this.filtro.CUENTA_CONTABLE_INICIAL || this.filtro.CUENTA_CONTABLE_FINAL)) {
			hints.push('pruebe dejar el rango de cuentas vacio');
		}

		const detalle = hints.length ? ` ${hints.join('; ')}.` : '';
		this.notifyFx(`No se encontraron registros con los filtros indicados.${detalle}`, NotifyType.Warning);
	}

	private buildColumnas(rows: any[]): any[] {
		if (!rows?.length) {
			return this.columnas.length ? this.columnas : this.getColumnasPorDefecto();
		}

		const keys = this.normalizeColumnKeys(
			Object.keys(rows[0]).filter((key) => !this.hiddenColumns.has(key))
		);
		const ordered = [
			...this.columnOrder.filter((key) => keys.includes(key)),
			...keys.filter((key) => !this.columnOrder.includes(key)).sort(),
		];

		return ordered.map((key) => this.buildColumn(key));
	}

	private buildColumn(key: string): any {
		const column: any = {
			dataField: key,
			caption: this.columnLabels[key] || this.formatCaption(key),
			allowResizing: true,
		};

		if (this.flexColumns.has(key)) {
			column.minWidth = 220;
		} else {
			column.width = this.getColumnWidth(key);
		}

		if (this.wrapColumns.has(key)) {
			column.cssClass = 'con-reporte-col-wrap';
		}

		if (key.startsWith('FECHA_') || key === 'FECHA_IMPRESION') {
			column.dataType = 'date';
			column.format = 'dd/MM/yyyy';
			column.alignment = 'center';
		} else if (/^(MONTO_|SALDO_|CARGO_|ABONO_)/.test(key)) {
			column.dataType = 'number';
			column.format = { type: 'fixedPoint', precision: 2 };
			column.alignment = 'right';
		} else if (key === 'CUENTA_CONTABLE') {
			column.alignment = 'left';
		} else if (key === 'NUMERO_DOCUMENTO') {
			column.alignment = 'left';
		}

		return column;
	}

	private getColumnWidth(key: string): number {
		if (this.columnWidths[key]) {
			return this.columnWidths[key];
		}

		if (/^(MONTO_|SALDO_|CARGO_|ABONO_)/.test(key)) {
			return 102;
		}

		if (key.startsWith('FECHA_')) {
			return 96;
		}

		return 120;
	}

	private formatCaption(key: string): string {
		return key
			.toLowerCase()
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	private inicializarColumnasPorDefecto(): void {
		if (!this.consultaGridDisponible()) {
			this.columnas = [];
			return;
		}

		this.columnas = this.getColumnasPorDefecto();
	}

	private getColumnasPorDefecto(): any[] {
		const keys = this.defaultColumnKeys[this.codigoReporte] || this.columnOrder;
		return keys.map((key) => this.buildColumn(key));
	}

	private normalizeColumnKeys(keys: string[]): string[] {
		let normalized = [...keys];
		if (normalized.includes('CARGO_PERIODO') && normalized.includes('MONTO_CARGO')) {
			normalized = normalized.filter((key) => key !== 'MONTO_CARGO');
		}
		if (normalized.includes('ABONO_PERIODO') && normalized.includes('MONTO_ABONO')) {
			normalized = normalized.filter((key) => key !== 'MONTO_ABONO');
		}
		return normalized;
	}

	private extractErrorMessage(error: any): string {
		if (typeof error === 'string' && error.trim()) {
			return error.trim();
		}

		if (error?.ErrorMessage) {
			return error.ErrorMessage;
		}

		if (error?.message) {
			return error.message;
		}

		return 'No fue posible completar la operacion del reporte.';
	}
}
