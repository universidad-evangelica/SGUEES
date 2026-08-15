import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConPartida } from './models/con-partida';
import { ConPartidaService } from './con-partida.service';
import { ConPartidaDetaService } from './con-partida-deta/con-partida-deta.service';
import { ConPartidaDeta } from './con-partida-deta/models/con-partida-deta';
import { ConPartidaDocService } from './con-partida-doc/con-partida-doc.service';
import { ConPartidaDoc } from './con-partida-doc/models/con-partida-doc';
import { ConCatalogoCuentaCentroCostoService } from '../con-catalogo-cuenta-centro-costo/con-catalogo-cuenta-centro-costo.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { custom } from 'devextreme/ui/dialog';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-con-partida',
	templateUrl: './con-partida.component.html',
	styleUrls: ['./con-partida.component.scss'],
})
export class ConPartidaComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridDetalle', { static: false }) gridDetalle!: DxDataGridComponent;
	protected override etiquetaRegistro = 'la partida';

	detalles: ConPartidaDeta[] = [];
	documentos: ConPartidaDoc[] = [];
	docColumns: any[] = [];
	readOnly = false;
	mESTADO_PARTIDA: any;
	mMES_PERIODO: any;
	mCORR_CLASE_PARTIDA: any[] = [];
	mCUENTA_CONTABLE: any[] = [];
	mCORR_CENTRO_COSTO: any[] = [];
	cuentaLookupColumns: any[] = [
		{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
		{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre Cuenta', width: 280 },
	];
	centroLookupColumns: any[] = [
		{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre Centro', width: 280 },
	];
	centrosPorCuentaCache: Record<string, any[]> = {};
	centrosPorCuentaCargando: Record<string, boolean> = {};
	detalleEditando = false;
	/** Solo true cuando edición viene de Agregar o botón Editar del detalle (no doble clic). */
	private detalleEdicionExplicita = false;
	btnCrearModelo = '';
	btnImportarExcel = '';
	btnGenerarDesdeModelo = '';
	btnImprimir = '';
	btnPartidaLiquidacion = '';
	btnPartidaCierre = '';
	btnPartidaApertura = '';
	vANIO_PERIODO_CIERRE = new Date().getFullYear();
	vMES_PERIODO_CIERRE = new Date().getMonth() + 1;
	popupVisiblePdf = false;
	vPDF: Blob | null = null;
	PDF!: SafeUrl;
	importExcelVisible = false;
	vFECHA_INICIAL: Date = new Date();
	vFECHA_FINAL: Date = new Date();

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private routerNavigate: Router,
		private service: ConPartidaService,
		private detaService: ConPartidaDetaService,
		private docService: ConPartidaDocService,
		private cuentaCentroService: ConCatalogoCuentaCentroCostoService,
		private cdr: ChangeDetectorRef,
		private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.docColumns = this.docService.getColumns();
		this.cuentaSetCellValue = this.cuentaSetCellValue.bind(this);
		this.centroCostoSetCellValue = this.centroCostoSetCellValue.bind(this);
		this.cuentaContableDisplay = this.cuentaContableDisplay.bind(this);
		this.codigoCentroDisplay = this.codigoCentroDisplay.bind(this);
		this.centroCostoNombreDisplay = this.centroCostoNombreDisplay.bind(this);
		this.editarDetalleClick = this.editarDetalleClick.bind(this);
		this.detalleEditButtonVisible = this.detalleEditButtonVisible.bind(this);
		this.detalleDeleteButtonVisible = this.detalleDeleteButtonVisible.bind(this);
	}

	ngOnInit(): void {
		const today = this.appInfoService.getDate();
		this.vFECHA_INICIAL = new Date(today.getFullYear(), today.getMonth(), 1);
		this.vFECHA_FINAL = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
		this.refrescarBotones();
	}

	inicializaOpciones() {}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
		}
	}

	llenaComboBox() {
		this.getESTADO_PARTIDA();
		this.getMES_PERIODO();
		this.getCORR_CLASE_PARTIDA();
		this.getCUENTA_CONTABLE();
		this.getCORR_CENTRO_COSTO();
	}

	getMES_PERIODO() {
		this.appInfoService
			.getLookUp('CON_PARTIDA', 'GEN_LISTA', 'GetMES', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mMES_PERIODO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCORR_CLASE_PARTIDA() {
		this.appInfoService
			.getLookUp('CON_PARTIDA', 'CON_CLASE_PARTIDA', 'GetCORR_CLASE_PARTIDA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CLASE_PARTIDA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCUENTA_CONTABLE() {
		this.appInfoService
			.getLookUp('CON_PARTIDA', 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCUENTA_CONTABLE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCORR_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('CON_PARTIDA', 'CON_CENTRO_COSTO', 'GetCORR_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getESTADO_PARTIDA() {
		this.appInfoService
			.getLookUp('CON_PARTIDA', 'CON_LISTA', 'GetESTADO_PARTIDA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_PARTIDA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	fillParam(xKey?: any): any {
		return {
			CORR_PARTIDA: xKey || 0,
			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),
			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),
		};
	}

	buildDeletePayload(row: ConPartida): ConPartida {
		return {
			CORR_EMPRESA: row.CORR_EMPRESA ?? this.appInfoService.CORR_EMPRESA,
			ANIO_PERIODO: row.ANIO_PERIODO,
			MES_PERIODO: row.MES_PERIODO,
			CORR_CLASE_PARTIDA: row.CORR_CLASE_PARTIDA,
			CORR_PARTIDA: row.CORR_PARTIDA,
		} as ConPartida;
	}

	partidaRowKey(row: ConPartida): string {
		return `${row.ANIO_PERIODO}-${row.MES_PERIODO}-${row.CORR_CLASE_PARTIDA}-${row.CORR_PARTIDA}`;
	}

	override fillData(xModel?: ConPartida): ConPartida {
		if (xModel !== undefined) {
			return { ...xModel };
		}

		const today = this.appInfoService.getDate();
		return {
			CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
			ANIO_PERIODO: this.appInfoService.toYear(today),
			MES_PERIODO: this.appInfoService.toMonth(today),
			CORR_CLASE_PARTIDA: 0,
			NOMBRE_CLASE_PARTIDA: '',
			CORR_PARTIDA: 0,
			FECHA_PARTIDA: today,
			NUMERO_DOCUMENTO: '',
			NOMBRE_PARTIDA: '',
			ESTADO_PARTIDA: 'DI',
			CLASE_PARTIDA: 'NOR',
			CORR_MONEDA: 0,
			FACTOR_CAMBIO: 0,
			OPERADOR: '',
			USUARIO_CREA: '',
			FECHA_CREA: today,
			ESTACION_CREA: '',
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	guardar(): void {
		if (
			this.banderaMtto === UpdateType.Update &&
			!this.partidaEditablePorEstado(this.model?.ESTADO_PARTIDA)
		) {
			this.notifyFx(
				'Solo se pueden modificar partidas DIGITADAS. Las partidas APLICADAS o ANULADAS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
			parchearGrid: false,
			onSuccess: (data: unknown, isAdd: boolean) => {
				const row = data as ConPartida;
				if (!Array.isArray(this.models)) {
					this.models = [];
				}
				if (isAdd) {
					this.models.push(row);
				} else {
					const key = this.partidaRowKey(row);
					const index = this.models.findIndex((item: ConPartida) => this.partidaRowKey(item) === key);
					if (index >= 0) {
						this.models[index] = row;
					}
				}
				this.modelUpdate = this.fillData(row);
				this.volverAlListado();
			},
		});
	}

	private volverAlListado(): void {
		this.detalles = [];
		this.documentos = [];
		this.detalleEditando = false;
		this.detalleEdicionExplicita = false;
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.refrescarBotones();
	}

	override cancelar(): void {
		const finalizarCancelacion = () => {
			this.detalles = [];
			this.documentos = [];
			this.readOnly = false;
			this.detalleEditando = false;
			this.detalleEdicionExplicita = false;
			this.refrescarBotones();
		};

		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.model = this.modelUpdate;
				const vIndex = this.models.findIndex(
					(item: any) => item.CORR_PARTIDA === this.modelUpdate.CORR_PARTIDA
				);
				if (vIndex >= 0) {
					this.models[vIndex] = this.modelUpdate;
				}
				this.AsignaStatus(UpdateType.Browse);
				this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
				finalizarCancelacion();
			});
		} else {
			if (this.banderaMtto === UpdateType.Not_Defined) {
				this.restaurarFilaGridConsulta((item: any) => item.CORR_PARTIDA === this.modelUpdate.CORR_PARTIDA);
			}
			this.AsignaStatus(UpdateType.Browse);
			finalizarCancelacion();
		}
	}

	override bloquear(): void {
		this.aplicarReadOnlyFormulario(true);
	}

	override habilitar(): void {
		this.aplicarReadOnlyFormulario(
			!this.partidaEditablePorEstado(this.model?.ESTADO_PARTIDA)
		);
	}

	/** Bloquea/desbloquea encabezado — el padre llama esto en rowDblClick (consulta) y editarClick vía habilitar(). */
	private aplicarReadOnlyFormulario(soloLectura: boolean): void {
		this.readOnly = soloLectura;
		setTimeout(() => {
			const form = this.dataForm?.instance;
			if (!form) {
				return;
			}
			(['FECHA_PARTIDA', 'NUMERO_DOCUMENTO', 'NOMBRE_PARTIDA'] as const).forEach((campo) => {
				form.getEditor(campo)?.option('readOnly', soloLectura);
			});
		});
	}

	partidaEditablePorEstado(estado?: string): boolean {
		return estado === 'DI';
	}

	puedeEditarDetalle(): boolean {
		return this.isForm() && this.partidaEditablePorEstado(this.model?.ESTADO_PARTIDA);
	}

	override getPermiteEditar(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return (
			this.permiteEdit &&
			this.partidaEditablePorEstado(data?.ESTADO_PARTIDA)
		);
	}

	override getPermiteDele(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return (
			this.permiteDele &&
			this.partidaEditablePorEstado(data?.ESTADO_PARTIDA)
		);
	}

	hasPartidaKeys(): boolean {
		return (
			this.model?.CORR_PARTIDA > 0 &&
			this.model?.ANIO_PERIODO > 0 &&
			this.model?.MES_PERIODO > 0 &&
			this.model?.CORR_CLASE_PARTIDA > 0
		);
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.consultarDetalles();
		this.consultarDocumentos();
		this.refrescarBotones();
	}

	override editarClick(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (!this.partidaEditablePorEstado(rowData?.ESTADO_PARTIDA)) {
			this.notifyFx(
				'Solo se pueden modificar partidas DIGITADAS. Las partidas APLICADAS o ANULADAS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}
		super.editarClick(e);
		this.consultarDetalles();
		this.consultarDocumentos();
		this.habilitar();
		this.refrescarBotones();
	}

	override nuevo(): void {
		super.nuevo();
		this.detalles = [];
		this.documentos = [];
		this.detalleEditando = false;
		this.detalleEdicionExplicita = false;
		this.habilitar();
		this.refrescarBotones();
	}

	puedeCrearModelo(): boolean {
		return (
			this.model?.ESTADO_PARTIDA === 'DI' &&
			this.hasPartidaKeys() &&
			this.detalles?.length > 0
		);
	}

	refrescarBotones() {
		if (this.isBrowse()) {
			this.btnImportarExcel = this.permiteAdd ? 'Importar Excel' : '';
			this.btnGenerarDesdeModelo = this.permiteEdit ? 'Generar Partida' : '';
			this.btnCrearModelo = this.permiteEdit ? 'Crear Modelo' : '';
			this.btnImprimir = this.permitePrint ? 'Imprimir' : '';
			this.btnPartidaLiquidacion = this.permiteEdit ? 'Part. Liquidación' : '';
			this.btnPartidaCierre = this.permiteEdit ? 'Part. Cierre' : '';
			this.btnPartidaApertura = this.permiteEdit ? 'Part. Apertura' : '';
			return;
		}

		this.btnImportarExcel = '';
		this.btnGenerarDesdeModelo = '';
		this.btnImprimir =
			this.permitePrint && this.banderaMtto === UpdateType.Update && this.hasPartidaSeleccionada()
				? 'Imprimir'
				: '';
		this.btnPartidaLiquidacion = '';
		this.btnPartidaCierre = '';
		this.btnPartidaApertura = '';
		this.btnCrearModelo = this.puedeCrearModelo() ? 'Crear Modelo' : '';
	}

	get showProcesosEnGrid(): boolean {
		return !!(this.btnPartidaApertura || this.btnPartidaLiquidacion || this.btnPartidaCierre);
	}

	hasPartidaSeleccionada(): boolean {
		return !!(
			this.model?.CORR_PARTIDA &&
			this.model?.ANIO_PERIODO &&
			this.model?.MES_PERIODO &&
			this.model?.CORR_CLASE_PARTIDA
		);
	}

	imprimirPartida(): void {
		if (!this.hasPartidaSeleccionada()) {
			this.notifyFx('Seleccione una partida para imprimir', NotifyType.Warning);
			return;
		}
		const fechaPartida = this.model.FECHA_PARTIDA || this.vFECHA_INICIAL;
		this.loadingVisible = true;
		this.service
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

	ejecutarPartidaEspecial(tipo: 'LIQ' | 'CIE' | 'APE'): void {
		if (!this.vANIO_PERIODO_CIERRE || !this.vMES_PERIODO_CIERRE) {
			this.notifyFx('Indique año y mes del periodo', NotifyType.Warning);
			return;
		}
		const labels = { LIQ: 'liquidación', CIE: 'cierre', APE: 'apertura' };
		const confirma = custom({
			title: 'Confirmar',
			messageHtml: `¿Generar partida de ${labels[tipo]} para ${this.vMES_PERIODO_CIERRE}/${this.vANIO_PERIODO_CIERRE}?`,
			buttons: [
				{ text: 'Sí', onClick: () => true },
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show().then((result) => {
			if (!result) return;
			this.loadingVisible = true;
			const call =
				tipo === 'LIQ'
					? this.service.generarPartidaLiquidacion(this.vANIO_PERIODO_CIERRE, this.vMES_PERIODO_CIERRE)
					: tipo === 'CIE'
						? this.service.generarPartidaCierre(this.vANIO_PERIODO_CIERRE, this.vMES_PERIODO_CIERRE)
						: this.service.generarPartidaApertura(this.vANIO_PERIODO_CIERRE, this.vMES_PERIODO_CIERRE);
			call.pipe(take(1)).subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response?.ErrorCode === 0) {
						this.notifyFx(`Partida de ${labels[tipo]} generada`, NotifyType.Success);
						this.consultar();
					} else {
						this.notifyFx(response?.ErrorMessage || 'Error al generar partida', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
		});
	}

	irImportarExcel(): void {
		this.importExcelVisible = true;
	}

	onImportExcelSuccess(): void {
		this.importExcelVisible = false;
		this.consultar();
	}

	irGenerarDesdeModelo(): void {
		this.routerNavigate.navigateByUrl('/con-partida-modelo-seleccion');
	}

	override focusedRowChanged(e: any): void {
		super.focusedRowChanged(e);
		if (this.isBrowse()) {
			this.consultarDetalles(true);
		} else {
			this.refrescarBotones();
		}
	}

	CrearModelo(): void {
		if (!this.puedeCrearModelo()) {
			this.notifyFx(
				'Seleccione una partida digitada con detalle para crear el modelo',
				NotifyType.Warning
			);
			return;
		}

		const confirma = custom({
			title: 'Confirmación de Crear Modelo',
			messageHtml: '¿Realmente quiere crear un modelo desde esta partida?',
			buttons: [
				{
					text: 'Si',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.crearModelo(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									if (response.Result && response.ErrorCode === 0) {
										this.notifyFx('Modelo creado con éxito', NotifyType.Success);
									} else {
										this.notifyFx(response.ErrorMessage, NotifyType.Error);
									}
									this.loadingVisible = false;
								},
								error: (error: any) => {
									this.notifyFx(error, NotifyType.Error);
									this.loadingVisible = false;
								},
							});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}

	Aplicar(): void {
		const confirma = custom({
			title: 'Confirmación de Aplicar',
			messageHtml: '¿Realmente quiere aplicar la partida?',
			buttons: [
				{
					text: 'Si',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.aplicar(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									if (response.Result && response.ErrorCode === 0) {
										this.model = response.Data;
										const vIndex = this.models.findIndex(
											(item: any) => item.CORR_PARTIDA === response.Data.CORR_PARTIDA
										);
										if (vIndex >= 0) {
											this.models[vIndex] = response.Data;
										}
										this.refrescarBotones();
										this.notifyFx('Partida aplicada con éxito', NotifyType.Success);
									} else {
										this.notifyFx(response.ErrorMessage, NotifyType.Error);
									}
									this.loadingVisible = false;
								},
								error: (error: any) => {
									this.notifyFx(error, NotifyType.Error);
									this.loadingVisible = false;
								},
							});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}

	consultarDetalles(refrescarBotones = false) {
		if (!this.hasPartidaKeys()) {
			this.detalles = [];
			return;
		}

		this.detaService
			.getAll({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_CLASE_PARTIDA: this.model.CORR_CLASE_PARTIDA,
				CORR_PARTIDA: this.model.CORR_PARTIDA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalles = (response.Data || []).map((item: ConPartidaDeta) => this.enriquecerDetalle(item));
						this.precargarCentrosDetalle(this.detalles);
						this.refrescarGridDetalle();
					}
					if (refrescarBotones) {
						this.refrescarBotones();
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
					if (refrescarBotones) {
						this.refrescarBotones();
					}
				},
			});
	}

	consultarDocumentos() {
		if (!this.hasPartidaKeys()) {
			this.documentos = [];
			return;
		}

		this.docService
			.getAllDetaDoc({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_CLASE_PARTIDA: this.model.CORR_CLASE_PARTIDA,
				CORR_PARTIDA: this.model.CORR_PARTIDA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.documentos = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	agregarDetalle() {
		if (!this.puedeEditarDetalle() || this.detalleEditando) {
			return;
		}
		this.detalleEdicionExplicita = true;
		const grid = this.gridDetalle?.instance;
		if (!grid) {
			return;
		}
		grid.addRow();
		this.sincronizarEstadoEdicionDetalle(grid);
	}

	editarDetalleClick(e: any): void {
		if (!this.puedeEditarDetalle() || this.detalleEditando) {
			return;
		}
		this.detalleEdicionExplicita = true;
		e.component.editRow(e.row.rowIndex);
		this.sincronizarEstadoEdicionDetalle(e.component);
	}

	/** Activa toolbar Guardar/Cancelar cuando el grid entra en edición explícita. */
	private sincronizarEstadoEdicionDetalle(grid: any): void {
		setTimeout(() => {
			if (grid?.hasEditData?.()) {
				this.detalleEditando = true;
				this.cdr.detectChanges();
			}
		});
	}

	detalleEditButtonVisible(e: any): boolean {
		return this.puedeEditarDetalle() && !e.row?.isEditing;
	}

	detalleDeleteButtonVisible(e: any): boolean {
		return this.puedeEditarDetalle() && !e.row?.isEditing;
	}

	private refrescarGridDetalle(): void {
		setTimeout(() => {
			this.gridDetalle?.instance?.refresh();
			this.cdr.detectChanges();
		});
	}

	guardarDetalleEditado(): void {
		const grid = this.gridDetalle?.instance;
		if (!grid || !this.detalleEditando) {
			this.notifyFx('No hay una línea en edición', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarDetalleEditado(): void {
		const grid = this.gridDetalle?.instance;
		if (!grid?.hasEditData()) {
			this.detalleEdicionExplicita = false;
			this.detalleEditando = false;
			this.refrescarGridDetalle();
			return;
		}
		grid.cancelEditData();
	}

	enriquecerDetalle(item: ConPartidaDeta): ConPartidaDeta {
		const centro = this.mCORR_CENTRO_COSTO?.find(
			(c: any) => c.CORR_CENTRO_COSTO === item.CORR_CENTRO_COSTO
		);
		const cuenta = this.mCUENTA_CONTABLE?.find(
			(c: any) => c.CUENTA_CONTABLE === item.CUENTA_CONTABLE
		);
		return {
			...item,
			NOMBRE_CUENTA: item.NOMBRE_CUENTA || cuenta?.NOMBRE_CUENTA || '',
			CODIGO_CENTRO_COSTO: item.CORR_CENTRO_COSTO
				? centro?.CODIGO_CENTRO_COSTO || item.CODIGO_CENTRO_COSTO || ''
				: '',
			NOMBRE_CENTRO: item.CORR_CENTRO_COSTO
				? item.NOMBRE_CENTRO || centro?.NOMBRE_CENTRO || ''
				: 'No Definido',
		};
	}

	enriquecerDetalleData(data: any): void {
		if (data?.CUENTA_CONTABLE) {
			const cuenta = this.mCUENTA_CONTABLE.find(
				(item: any) => item.CUENTA_CONTABLE === data.CUENTA_CONTABLE
			);
			data.NOMBRE_CUENTA = cuenta?.NOMBRE_CUENTA || data.NOMBRE_CUENTA || '';
		}
		if (data?.CORR_CENTRO_COSTO) {
			const centro = this.mCORR_CENTRO_COSTO.find(
				(item: any) => item.CORR_CENTRO_COSTO === data.CORR_CENTRO_COSTO
			);
			data.NOMBRE_CENTRO = centro?.NOMBRE_CENTRO || data.NOMBRE_CENTRO || '';
		} else {
			data.CORR_CENTRO_COSTO = 0;
			data.NOMBRE_CENTRO = 'No Definido';
		}
		if (!data.NOMBRE_TRAN) {
			data.NOMBRE_TRAN = this.model?.NOMBRE_PARTIDA || '';
		}
		data.MONTO_CARGO = data.MONTO_CARGO || 0;
		data.MONTO_ABONO = data.MONTO_ABONO || 0;
	}

	cuentaContableDisplay(row: ConPartidaDeta): string {
		return row?.CUENTA_CONTABLE || '';
	}

	codigoCentroDisplay(row: ConPartidaDeta): string {
		if (!row?.CORR_CENTRO_COSTO) {
			return 'No Definido';
		}
		const centrosCuenta = row.CUENTA_CONTABLE
			? this.centrosPorCuentaCache[row.CUENTA_CONTABLE]
			: undefined;
		const centro =
			centrosCuenta?.find((item: any) => item.CORR_CENTRO_COSTO === row.CORR_CENTRO_COSTO) ||
			this.mCORR_CENTRO_COSTO.find((item: any) => item.CORR_CENTRO_COSTO === row.CORR_CENTRO_COSTO);
		return centro?.CODIGO_CENTRO_COSTO || row.CODIGO_CENTRO_COSTO || 'No Definido';
	}

	centroCostoNombreDisplay(row: ConPartidaDeta): string {
		if (!row?.CORR_CENTRO_COSTO) {
			return 'No Definido';
		}
		return row.NOMBRE_CENTRO || 'No Definido';
	}

	cuentaSetCellValue(newData: any, value: any) {
		newData.CUENTA_CONTABLE = value;
		const cuenta = this.mCUENTA_CONTABLE.find((item: any) => item.CUENTA_CONTABLE === value);
		newData.NOMBRE_CUENTA = cuenta?.NOMBRE_CUENTA || '';
		newData.CORR_CENTRO_COSTO = 0;
		newData.CODIGO_CENTRO_COSTO = '';
		newData.NOMBRE_CENTRO = 'No Definido';
		this.cargarCentrosPorCuenta(value, true);
	}

	getCentrosPorCuenta(cuentaContable: string): any[] {
		if (!cuentaContable) {
			return [];
		}
		this.cargarCentrosPorCuenta(cuentaContable);
		return this.centrosPorCuentaCache[cuentaContable] || [];
	}

	tieneCentrosAsignados(cuentaContable: string): boolean {
		return this.getCentrosPorCuenta(cuentaContable).length > 0;
	}

	cargarCentrosPorCuenta(cuentaContable: string, forzar = false): void {
		if (!cuentaContable) {
			return;
		}
		if (!forzar && (this.centrosPorCuentaCache[cuentaContable] || this.centrosPorCuentaCargando[cuentaContable])) {
			return;
		}

		this.centrosPorCuentaCargando[cuentaContable] = true;
		this.cuentaCentroService
			.getAll(cuentaContable)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const centros = (response.Result ? response.Data || [] : []).map((item: any) =>
						this.mapCentroAsignado(item)
					);
					this.centrosPorCuentaCache = {
						...this.centrosPorCuentaCache,
						[cuentaContable]: centros,
					};
					this.centrosPorCuentaCargando[cuentaContable] = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.centrosPorCuentaCache = {
						...this.centrosPorCuentaCache,
						[cuentaContable]: [],
					};
					this.centrosPorCuentaCargando[cuentaContable] = false;
					this.cdr.markForCheck();
				},
			});
	}

	private mapCentroAsignado(item: any): any {
		const centro = this.mCORR_CENTRO_COSTO.find(
			(c: any) => c.CORR_CENTRO_COSTO === item.CORR_CENTRO_COSTO
		);
		return {
			CORR_CENTRO_COSTO: item.CORR_CENTRO_COSTO,
			CODIGO_CENTRO_COSTO: centro?.CODIGO_CENTRO_COSTO || item.CODIGO_CENTRO_COSTO || '',
			NOMBRE_CENTRO: item.NOMBRE_CENTRO || centro?.NOMBRE_CENTRO || '',
		};
	}

	private precargarCentrosDetalle(detalles: ConPartidaDeta[]): void {
		const cuentas = [...new Set(detalles.map((d) => d.CUENTA_CONTABLE).filter(Boolean))];
		cuentas.forEach((cuenta) => this.cargarCentrosPorCuenta(cuenta));
	}

	onDetalleEditorPreparing(e: any): void {
		if (e.parentType === 'commandColumn' && (e.name === 'save' || e.name === 'cancel')) {
			e.visible = false;
			return;
		}

		if (e.parentType !== 'dataRow') {
			return;
		}

		const prevOnKeyDown = e.editorOptions?.onKeyDown;
		e.editorOptions.onKeyDown = (args: any) => {
			if (args.event?.key === 'Enter') {
				args.event.preventDefault();
				args.event.stopPropagation();
				return;
			}
			prevOnKeyDown?.(args);
		};

		if (e.dataField === 'CUENTA_CONTABLE' && e.row?.data?.CUENTA_CONTABLE) {
			this.cargarCentrosPorCuenta(e.row.data.CUENTA_CONTABLE);
		}

		if (e.dataField === 'CORR_CENTRO_COSTO') {
			const cuenta = e.row?.data?.CUENTA_CONTABLE;
			this.cargarCentrosPorCuenta(cuenta);
			if (!cuenta || !this.tieneCentrosAsignados(cuenta)) {
				e.editorOptions.readOnly = true;
			}
		}
	}

	centroCostoSetCellValue(newData: any, value: any) {
		newData.CORR_CENTRO_COSTO = value || 0;
		if (newData.CORR_CENTRO_COSTO) {
			const centros = this.centrosPorCuentaCache[newData.CUENTA_CONTABLE] || this.mCORR_CENTRO_COSTO;
			const centro = centros.find((item: any) => item.CORR_CENTRO_COSTO === newData.CORR_CENTRO_COSTO);
			newData.NOMBRE_CENTRO = centro?.NOMBRE_CENTRO || '';
			newData.CODIGO_CENTRO_COSTO = centro?.CODIGO_CENTRO_COSTO || '';
		} else {
			newData.NOMBRE_CENTRO = 'No Definido';
			newData.CODIGO_CENTRO_COSTO = '';
		}
	}

	detalleInitNewRow(e: any) {
		e.data.NOMBRE_TRAN = this.model?.NOMBRE_PARTIDA || '';
		e.data.MONTO_CARGO = 0;
		e.data.MONTO_ABONO = 0;
		e.data.CORR_CENTRO_COSTO = 0;
		e.data.NOMBRE_CENTRO = 'No Definido';
	}

	onDetalleEditingStart(e: any) {
		if (!this.detalleEdicionExplicita) {
			e.cancel = true;
			return;
		}
		this.detalleEdicionExplicita = false;
		this.detalleEditando = true;
		this.cdr.detectChanges();
		if (e.data?.CUENTA_CONTABLE) {
			this.cargarCentrosPorCuenta(e.data.CUENTA_CONTABLE);
		}
	}

	onDetalleSaved(_e: any) {
		this.detalleEdicionExplicita = false;
		this.detalleEditando = false;
		this.refrescarGridDetalle();
	}

	onDetalleEditCanceled(_e: any) {
		this.detalleEdicionExplicita = false;
		this.detalleEditando = false;
		this.refrescarGridDetalle();
	}

	detalleRowValidating(e: any) {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		const isEmpty =
			!data.CUENTA_CONTABLE &&
			!(data.MONTO_CARGO || 0) &&
			!(data.MONTO_ABONO || 0);

		if (isEmpty) {
			e.isValid = false;
			e.errorText = 'Complete la cuenta y el cargo o abono antes de guardar la línea';
			this.notifyFx(e.errorText, NotifyType.Warning);
			return;
		}

		if (!data.CUENTA_CONTABLE) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar una cuenta contable';
			this.notifyFx(e.errorText, NotifyType.Warning);
			return;
		}

		const cargo = data.MONTO_CARGO || 0;
		const abono = data.MONTO_ABONO || 0;
		if (cargo <= 0 && abono <= 0) {
			e.isValid = false;
			e.errorText = 'Debe ingresar cargo o abono';
			this.notifyFx(e.errorText, NotifyType.Warning);
			return;
		}
		if (cargo > 0 && abono > 0) {
			e.isValid = false;
			e.errorText = 'Ingrese solo cargo o abono, no ambos';
			this.notifyFx(e.errorText, NotifyType.Warning);
			return;
		}

		const centrosAsignados = this.centrosPorCuentaCache[data.CUENTA_CONTABLE];
		if (centrosAsignados !== undefined && centrosAsignados.length > 0 && !data.CORR_CENTRO_COSTO) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar un centro de costo asignado a la cuenta';
			this.notifyFx(e.errorText, NotifyType.Warning);
		}
	}

	private guardarEncabezadoParaDetalle(onSuccess: () => void, onCancel: () => void): void {
		if (this.hasPartidaKeys()) {
			onSuccess();
			return;
		}

		if (!this.service.esValido(this.model, this.notifyFx)) {
			onCancel();
			return;
		}

		this.loadingVisible = true;
		this.service
			.insert(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.models.push(response.Data);
						this.model = response.Data;
						this.modelUpdate = this.fillData(this.model);
						this.AsignaStatus(UpdateType.Update);
						this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
						this.refrescarBotones();
						onSuccess();
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
						onCancel();
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
					onCancel();
				},
			});
	}

	private ejecutarDetalleConEncabezado(
		accion: () => Promise<boolean>
	): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.guardarEncabezadoParaDetalle(
				() => {
					accion().then(resolve).catch(reject);
				},
				() => resolve(true)
			);
		});
	}

	private buildDetallePayload(data: any): any {
		this.enriquecerDetalleData(data);
		return {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			ANIO_PERIODO: this.model.ANIO_PERIODO,
			MES_PERIODO: this.model.MES_PERIODO,
			CORR_CLASE_PARTIDA: this.model.CORR_CLASE_PARTIDA,
			CORR_PARTIDA: this.model.CORR_PARTIDA,
			...data,
		};
	}

	private guardarDetalleRemoto(data: any, esNuevo: boolean): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const deta = this.buildDetallePayload({ ...data });
			const operacion = esNuevo ? this.detaService.insert(deta) : this.detaService.update(deta);

			operacion.pipe(take(1)).subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalleEditando = false;
						this.detalleEdicionExplicita = false;
						this.consultarDetalles();
						this.refrescarBotones();
						resolve(false);
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
						resolve(true);
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
					reject(error);
				},
			});
		});
	}

	getDiferencia(): number {
		const totalCargo = this.detalles.reduce((sum, d) => sum + (d.MONTO_CARGO || 0), 0);
		const totalAbono = this.detalles.reduce((sum, d) => sum + (d.MONTO_ABONO || 0), 0);
		return totalCargo - totalAbono;
	}

	detalleRowInserting(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden modificar partidas DIGITADAS. Las partidas APLICADAS o ANULADAS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}

		if (
			!e.data?.CUENTA_CONTABLE &&
			!(e.data?.MONTO_CARGO || 0) &&
			!(e.data?.MONTO_ABONO || 0)
		) {
			e.cancel = true;
			return;
		}

		e.cancel = this.ejecutarDetalleConEncabezado(() => this.guardarDetalleRemoto(e.data, true));
	}

	detalleRowUpdating(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden modificar partidas DIGITADAS. Las partidas APLICADAS o ANULADAS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}

		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.ejecutarDetalleConEncabezado(() => this.guardarDetalleRemoto(data, false));
	}

	detalleRowRemoving(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden modificar partidas DIGITADAS. Las partidas APLICADAS o ANULADAS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}

		if (!this.hasPartidaKeys()) {
			e.cancel = true;
			return;
		}

		e.cancel = new Promise((resolve, reject) => {
			this.detaService
				.delete(this.buildDetallePayload(e.data))
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.refrescarBotones();
							this.refrescarGridDetalle();
							this.notifyFx('Línea eliminada con éxito!', NotifyType.Success);
							resolve(false);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
							resolve(true);
						}
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						reject(error);
					},
				});
		});
	}

	rowRemoving(e: any): void {
		if (!this.partidaEditablePorEstado(e.data?.ESTADO_PARTIDA)) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden eliminar partidas DIGITADAS. Las partidas APLICADAS o ANULADAS no se pueden eliminar desde aquí.',
				NotifyType.Warning
			);
			return;
		}

		const removedKey = this.partidaRowKey(e.data);
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.buildDeletePayload(e.data)),
			parchearGrid: false,
			reload: () => {
				this.models = (this.models || []).filter(
					(item: ConPartida) => this.partidaRowKey(item) !== removedKey
				);
			},
		});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCORR_CLASE_PARTIDA(vRow: any): any {
		const clase = vRow[0];
		this.model.NOMBRE_CLASE_PARTIDA = clase?.NOMBRE_CLASE_PARTIDA || '';
		return clase?.CORR_CLASE_PARTIDA;
	}

	selectedLookUpCUENTA_CONTABLE(vRow: any): any {
		return vRow[0].CUENTA_CONTABLE;
	}

	selectedLookUpCORR_CENTRO_COSTO(vRow: any): any {
		return vRow[0].CORR_CENTRO_COSTO;
	}

	onClasePartidaChanged(value: number) {
		const clase = this.mCORR_CLASE_PARTIDA.find((item: any) => item.CORR_CLASE_PARTIDA === value);
		this.model.NOMBRE_CLASE_PARTIDA = clase?.NOMBRE_CLASE_PARTIDA || '';
	}
}
