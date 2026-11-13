import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { custom } from 'devextreme/ui/dialog';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { IParam } from 'src/app/FxAPI/IParam';
import { ComPago } from './models/com-pago';
import { ComPagoService } from './com-pago.service';
import { ComPagoDeta } from './com-pago-deta/models/com-pago-deta';
import { ComPagoConta } from './com-pago-conta/models/com-pago-conta';
import { ComPagoArchivo } from './com-pago-archivo/models/com-pago-archivo';

@Component({
	standalone: false,
	selector: 'app-com-pago',
	templateUrl: './com-pago.component.html',
	styleUrls: ['./com-pago.component.scss'],
})
export class ComPagoComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridDetalle', { static: false }) gridDetalle!: DxDataGridComponent;

	//#region <Declarando Variables>
	protected override etiquetaRegistro = 'el pago';
	readOnly = false;
	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
	IndexTab = 0;

	mCORR_TIPO_DOC: any[] = [];
	mCORR_PROVEEDOR: any[] = [];
	mESTADO_PAGO: any[] = [
		{ Key: 'DI', Value: 'DIGITADO' },
		{ Key: 'AP', Value: 'APLICADO' },
		{ Key: 'AN', Value: 'ANULADO' },
	];
	mCORR_CUENTA_BANCO: any[] = [];
	mCORR_TIPO_CHEQUE: any[] = [];
	mCOM_PAGO_DETA: ComPagoDeta[] = [];
	mCOM_PAGO_CONTA: ComPagoConta[] = [];
	mCOM_PAGO_PENDIENTES: any[] = [];
	mCOM_PAGO_ARCHIVO: ComPagoArchivo[] = [];

	btnAplicar = '';
	btnAnular = '';
	btnGenerarConta = '';
	btnAsignarArchivo = '';

	popupVisiblePendientes = false;
	popupVisibleArchivo = false;
	archivoSeleccionado: ComPagoArchivo | null = null;

	proveedorLookupColumns = [
		{ dataField: 'CODIGO_PROVEEDOR', caption: 'Código', width: 120 },
		{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Nombre', width: 360 },
	];
	cuentaLookupColumns = [
		{ dataField: 'CORR_CUENTA_BANCO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Cuenta', width: 280 },
	];
	tipoChequeLookupColumns = [
		{ dataField: 'CORR_TIPO_CHEQUE', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_TIPO_CHEQUE', caption: 'Tipo Cheque', width: 260 },
	];
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComPagoService
	) {
		super(appInfoService, router);
		if (!this.tituloVentana?.trim()) {
			this.tituloVentana = router.snapshot.data['titulo'] || 'Pagos';
		}
		if (!this.urlOpcion || this.urlOpcion === '/') {
			this.urlOpcion = '/com-pago';
		}
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.selectedLookUpCORR_TIPO_DOC = this.selectedLookUpCORR_TIPO_DOC.bind(this);
		this.selectedLookUpCORR_PROVEEDOR = this.selectedLookUpCORR_PROVEEDOR.bind(this);
		this.selectedLookUpCORR_CUENTA_BANCO = this.selectedLookUpCORR_CUENTA_BANCO.bind(this);
		this.selectedLookUpCORR_TIPO_CHEQUE = this.selectedLookUpCORR_TIPO_CHEQUE.bind(this);
		this.guardarPendientesPopup = this.guardarPendientesPopup.bind(this);
		this.hidePendientesPopup = this.hidePendientesPopup.bind(this);
		this.guardarArchivoPopup = this.guardarArchivoPopup.bind(this);
		this.hideArchivoPopup = this.hideArchivoPopup.bind(this);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
		this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -30);
		this.vFECHA_FINAL = this.appInfoService.getDate();
	}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_TIPO_DOC();
		this.getCORR_PROVEEDOR();
		this.getCORR_CUENTA_BANCO();
		this.getCORR_TIPO_CHEQUE();
	}

	getCORR_TIPO_DOC() {
		const xWhere: IParam[] = [{ Parameter: 'USAR_COMPRAS', Value: true }];
		this.appInfoService
			.getLookUp('COM_PAGO', 'GEN_TIPO_DOCUMENTO', 'GetCORR_TIPO_DOC', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_DOC = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_PROVEEDOR() {
		this.appInfoService
			.getLookUp('COM_PAGO', 'GEN_PROVEEDOR', 'GetCORR_PROVEEDOR', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PROVEEDOR = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_CUENTA_BANCO() {
		this.appInfoService
			.getLookUp('COM_PAGO', 'BAN_CUENTA_BANCARIA', 'GetCORR_CUENTA_BANCO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CUENTA_BANCO = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_TIPO_CHEQUE() {
		this.appInfoService
			.getLookUp('COM_PAGO', 'BAN_TIPO_CHEQUE', 'GetCORR_TIPO_CHEQUE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_CHEQUE = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}
	// #endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number, xMES_PERIODO?: number, xCORR_PAGO?: number): any {
		if (xCORR_PAGO === undefined) {
			xANIO_PERIODO = this.appInfoService.toYear(new Date());
			xMES_PERIODO = this.appInfoService.toMonth(new Date());
			xCORR_PAGO = 0;
		}
		return {
			ANIO_PERIODO: xANIO_PERIODO,
			MES_PERIODO: xMES_PERIODO,
			CORR_PAGO: xCORR_PAGO,
			FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
		};
	}

	override fillData(xModel?: ComPago): ComPago {
		if (xModel !== undefined) {
			return { ...xModel };
		}
		const today = this.appInfoService.getDate();
		return {
			CORR_EMPRESA: this.appInfoService.CORR_EMPRESA || 1,
			ANIO_PERIODO: this.appInfoService.toYear(today),
			MES_PERIODO: this.appInfoService.toMonth(today),
			CORR_PAGO: 0,
			CORR_TIPO_DOC: 0,
			FECHA_SOLICITUD: today,
			FECHA_PAGO: today,
			CORR_PROVEEDOR: 0,
			CORR_TIPO_CHEQUE: null,
			CORR_CUENTA_BANCO: null,
			NOMBRE_PARTIDA: '',
			MONTO_PAGO: 0,
			ESTADO_PAGO: 'DI',
			NOMBRE_ESTADO_PAGO: 'DIGITADO',
			PAGADO_CAJA_CHICA: false,
			CORR_TIENDA: null,
			CORR_CAJA: null,
			NOMBRE_BENEFICIARIO: '',
			CORR_ARCHIVO: null,
			GENERA_MOVIMIENTO_BANCARIO: true,
		};
	}

	private pagoEditable(estado?: string): boolean {
		return (estado || this.model?.ESTADO_PAGO) === 'DI';
	}

	private hasPagoKeys(): boolean {
		return !!this.model?.CORR_PAGO && this.model.CORR_PAGO > 0;
	}

	override nuevo(): void {
		super.nuevo();
		this.mCOM_PAGO_DETA = [];
		this.mCOM_PAGO_CONTA = [];
		this.readOnly = false;
		this.refrescarBotones();
	}

	override editarClick(e: any): void {
		this.model = e.row.data;
		super.editarClick(e);
		this.consultarDetalle();
		this.consultarConta();
		this.refrescarBotones();
		if (!this.pagoEditable()) {
			setTimeout(() => this.bloquear());
		}
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.consultarDetalle();
		this.consultarConta();
		this.refrescarBotones();
		if (!this.pagoEditable()) {
			setTimeout(() => this.bloquear());
		}
	}

	override getPermiteEditar(e: any): boolean {
		return !!(this.permiteEdit && e.row.data.ESTADO_PAGO === 'DI');
	}

	override getPermiteDele(e: any): boolean {
		return !!(this.permiteDele && e.row.data.ESTADO_PAGO === 'DI');
	}

	consultar() {
		this.loadingVisible = true;
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.models = response.Data;
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	guardar(xTieneDetalle?: Function, data?: any): void {
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						this.loadingVisible = false;
						if (response.Result && response.ErrorCode === 0) {
							this.models.push(response.Data);
							this.model = response.Data;
							if (xTieneDetalle) {
								this.AsignaStatus(UpdateType.Update);
								data.CORR_PAGO = response.Data.CORR_PAGO;
								data.ANIO_PERIODO = response.Data.ANIO_PERIODO;
								data.MES_PERIODO = response.Data.MES_PERIODO;
								xTieneDetalle(data);
							} else {
								this.AsignaStatus(UpdateType.Browse);
								this.notifyFx('Registro creado con éxito!', NotifyType.Success);
								this.refrescarBotones();
							}
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
					},
					error: (error: any) => {
						this.loadingVisible = false;
						this.notifyFx(error, NotifyType.Error);
					},
				});
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						this.loadingVisible = false;
						if (response.Result && response.ErrorCode === 0) {
							this.model = response.Data;
							const vIndex = this.models.findIndex(
								(item: any) =>
									item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
									item.MES_PERIODO === response.Data.MES_PERIODO &&
									item.CORR_PAGO === response.Data.CORR_PAGO
							);
							if (vIndex >= 0) {
								this.models[vIndex] = response.Data;
							}
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con éxito!', NotifyType.Success);
							this.refrescarBotones();
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
					},
					error: (error: any) => {
						this.loadingVisible = false;
						this.notifyFx(error, NotifyType.Error);
					},
				});
		}
	}

	private guardarEncabezadoParaDetalle(onSuccess: () => void, onCancel: () => void): void {
		if (this.hasPagoKeys()) {
			onSuccess();
			return;
		}
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
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

	refrescarBotones() {
		if (this.banderaMtto !== UpdateType.Browse) {
			const dig = this.pagoEditable();
			this.btnAplicar = dig ? 'Aplicar' : '';
			this.btnAnular = dig ? 'Anular' : '';
			this.btnGenerarConta = dig ? 'Generar Conta' : '';
			this.btnAsignarArchivo = dig ? 'Asignar Archivo' : '';
		} else {
			this.btnAplicar = '';
			this.btnAnular = '';
			this.btnGenerarConta = '';
			this.btnAsignarArchivo = '';
		}
	}

	override cancelar(): void {
		const cancelRow = () => {
			this.AsignaStatus(UpdateType.Browse);
			this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
			this.refrescarBotones();
			this.readOnly = false;
		};
		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.model = this.modelUpdate;
				const vIndex = this.models.findIndex(
					(item: any) =>
						item.ANIO_PERIODO === this.modelUpdate.ANIO_PERIODO &&
						item.MES_PERIODO === this.modelUpdate.MES_PERIODO &&
						item.CORR_PAGO === this.modelUpdate.CORR_PAGO
				);
				if (vIndex >= 0) {
					this.models[vIndex] = this.modelUpdate;
				}
				cancelRow();
			});
		} else {
			cancelRow();
		}
	}

	rowRemoving(e: any) {
		if (e.data?.ESTADO_PAGO !== 'DI') {
			e.cancel = true;
			this.notifyFx('Solo se pueden eliminar pagos en estado DIGITADO.', NotifyType.Warning);
			return;
		}
		this.service
			.delete(this.fillParam(e.data.ANIO_PERIODO, e.data.MES_PERIODO, e.data.CORR_PAGO))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con éxito!', NotifyType.Success);
						e.component.refresh();
						this.consultar();
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		const fields = [
			'CORR_PAGO',
			'ESTADO_PAGO',
			'FECHA_SOLICITUD',
			'FECHA_PAGO',
			'CORR_TIPO_DOC',
			'CORR_PROVEEDOR',
			'NOMBRE_BENEFICIARIO',
			'CORR_CUENTA_BANCO',
			'CORR_TIPO_CHEQUE',
			'MONTO_PAGO',
			'PAGADO_CAJA_CHICA',
			'CORR_TIENDA',
			'CORR_CAJA',
			'CORR_ARCHIVO',
			'NOMBRE_PARTIDA',
		];
		fields.forEach((f) => this.dataForm?.instance?.getEditor(f)?.option('readOnly', true));
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_TIPO_DOC')?.focus();
		});
	}

	override focusedRowChanged(e: any): void {
		this.model = e.row.data;
		this.modelUpdate = e.row.data;
		this.refrescarBotones();
	}

	Aplicar(): void {
		if (!this.hasPagoKeys()) {
			this.notifyFx('Debe guardar el pago antes de aplicar.', NotifyType.Warning);
			return;
		}
		const confir = custom({
			title: 'Confirmación de Aplicar',
			messageHtml: '¿Realmente quiere aplicar el pago?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.update(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									if (!response.Result) {
										this.loadingVisible = false;
										this.notifyFx(response.ErrorMessage, NotifyType.Error);
										return;
									}
									this.service
										.Aplicar(this.model)
										.pipe(take(1))
										.subscribe({
											next: (r: any) => {
												this.loadingVisible = false;
												if (r.Result) {
													this.notifyFx('Aplicado con éxito!', NotifyType.Success);
													this.aplicarRespuestaEstado(r.Data);
												} else {
													this.notifyFx(r.ErrorMessage, NotifyType.Error);
												}
											},
											error: (error: any) => {
												this.loadingVisible = false;
												this.notifyFx(error, NotifyType.Error);
											},
										});
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
		confir.show();
	}

	Anular(): void {
		if (!this.hasPagoKeys()) {
			this.notifyFx('Debe guardar el pago antes de anular.', NotifyType.Warning);
			return;
		}
		const confir = custom({
			title: 'Confirmación de Anular',
			messageHtml: '¿Realmente quiere anular el pago?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.Anular(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									this.loadingVisible = false;
									if (response.Result) {
										this.notifyFx('Anulado con éxito!', NotifyType.Success);
										this.aplicarRespuestaEstado(response.Data);
									} else {
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
		confir.show();
	}

	GenerarConta(): void {
		if (!this.hasPagoKeys()) {
			this.notifyFx('Debe guardar el pago antes de generar contabilidad.', NotifyType.Warning);
			return;
		}
		this.loadingVisible = true;
		this.service
			.GenerarConta(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.notifyFx('Contabilidad generada con éxito!', NotifyType.Success);
						if (response.Data) {
							this.aplicarRespuestaEstado(response.Data);
						}
						this.consultarConta();
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	private aplicarRespuestaEstado(data: any) {
		if (!data) {
			this.consultar();
			return;
		}
		this.model = data;
		const vIndex = this.models.findIndex(
			(item: any) =>
				item.ANIO_PERIODO === data.ANIO_PERIODO &&
				item.MES_PERIODO === data.MES_PERIODO &&
				item.CORR_PAGO === data.CORR_PAGO
		);
		if (vIndex >= 0) {
			this.models[vIndex] = data;
		}
		this.refrescarBotones();
		if (!this.pagoEditable()) {
			setTimeout(() => this.bloquear());
		}
	}

	consultarDetalle() {
		if (!this.hasPagoKeys()) {
			this.mCOM_PAGO_DETA = [];
			return;
		}
		this.service
			.getAllCOM_PAGO_DETA({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PAGO: this.model.CORR_PAGO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_PAGO_DETA = response.Data || [];
						this.recalcularMontoPago();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultarConta() {
		if (!this.hasPagoKeys()) {
			this.mCOM_PAGO_CONTA = [];
			return;
		}
		this.service
			.getAllCOM_PAGO_CONTA({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PAGO: this.model.CORR_PAGO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_PAGO_CONTA = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	private recalcularMontoPago() {
		this.model.MONTO_PAGO = (this.mCOM_PAGO_DETA || []).reduce(
			(sum, d) => sum + (Number(d.MONTO_PAGO) || 0),
			0
		);
	}

	puedeEditarDetalle(): boolean {
		return !this.readOnly && this.pagoEditable() && this.banderaMtto !== UpdateType.Browse;
	}

	MostrarPendientes(): void {
		const abrir = () => {
			this.loadingVisible = true;
			this.service
				.getAllPendientes({
					ANIO_PERIODO: this.model.ANIO_PERIODO,
					MES_PERIODO: this.model.MES_PERIODO,
					CORR_PAGO: this.model.CORR_PAGO,
				})
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						this.loadingVisible = false;
						if (response.Result) {
							this.mCOM_PAGO_PENDIENTES = (response.Data || []).map((x: any) => ({
								...x,
								SELECCION: false,
							}));
							this.popupVisiblePendientes = true;
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
					},
					error: (error: any) => {
						this.loadingVisible = false;
						this.notifyFx(error, NotifyType.Error);
					},
				});
		};

		this.guardarEncabezadoParaDetalle(abrir, () => undefined);
	}

	hidePendientesPopup() {
		this.popupVisiblePendientes = false;
	}

	guardarPendientesPopup() {
		const seleccionados = (this.mCOM_PAGO_PENDIENTES || []).filter((x) => x.SELECCION);
		if (!seleccionados.length) {
			this.notifyFx('Debe seleccionar al menos un documento.', NotifyType.Warning);
			return;
		}

		let pendientes = seleccionados.length;
		seleccionados.forEach((doc) => {
			const payload: any = {
				CORR_EMPRESA: this.model.CORR_EMPRESA,
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PAGO: this.model.CORR_PAGO,
				CORR_DETA: 0,
				ANIO_PERIODO_COM: doc.ANIO_PERIODO_COM ?? doc.ANIO_PERIODO,
				MES_PERIODO_COM: doc.MES_PERIODO_COM ?? doc.MES_PERIODO,
				CORR_DOCUMENTO_COM: doc.CORR_DOCUMENTO_COM ?? doc.CORR_DOCUMENTO,
				MONTO_DOCUMENTO: doc.TOTAL_DOCUMENTO ?? doc.MONTO_DOCUMENTO ?? 0,
				MONTO_INICIAL: doc.SALDO_DOCUMENTO ?? doc.MONTO_INICIAL ?? 0,
				MONTO_PAGO: doc.SALDO_DOCUMENTO ?? doc.MONTO_PAGO ?? 0,
				MONTO_FINAL: 0,
				GENERA_DETALLE_CONTABLE: true,
				GENERA_CONCEPTO: true,
			};
			this.service
				.insertCOM_PAGO_DETA(payload)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						pendientes--;
						if (!response.Result) {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						if (pendientes <= 0) {
							this.popupVisiblePendientes = false;
							this.consultarDetalle();
							this.cargarBeneficiario();
						}
					},
					error: (error: any) => {
						pendientes--;
						this.notifyFx(error, NotifyType.Error);
						if (pendientes <= 0) {
							this.popupVisiblePendientes = false;
							this.consultarDetalle();
						}
					},
				});
		});
	}

	detalleRowUpdating(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			return;
		}
		const data = { ...e.oldData, ...e.newData };
		e.cancel = new Promise((resolve) => {
			this.service
				.updateCOM_PAGO_DETA(data)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.consultarDetalle();
							resolve(false);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
							resolve(true);
						}
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						resolve(true);
					},
				});
		});
	}

	detalleRowRemoving(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			return;
		}
		e.cancel = new Promise((resolve) => {
			this.service
				.deleteCOM_PAGO_DETA(e.data)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.notifyFx('Línea eliminada con éxito!', NotifyType.Success);
							this.consultarDetalle();
							resolve(false);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
							resolve(true);
						}
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						resolve(true);
					},
				});
		});
	}

	BorrarTodoDetalle(): void {
		if (!this.hasPagoKeys() || !this.puedeEditarDetalle()) {
			return;
		}
		const confir = custom({
			title: 'Confirmación',
			messageHtml: '¿Desea borrar todo el detalle del pago?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.BorrarDetalle(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									this.loadingVisible = false;
									if (response.Result) {
										this.notifyFx('Detalle borrado con éxito!', NotifyType.Success);
										this.consultarDetalle();
										this.consultarConta();
									} else {
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
		confir.show();
	}

	cargarBeneficiario() {
		if (!this.hasPagoKeys()) {
			return;
		}
		this.service
			.getBeneficiario({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PAGO: this.model.CORR_PAGO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result && response.Data) {
						const data = Array.isArray(response.Data) ? response.Data[0] : response.Data;
						if (data?.NOMBRE_BENEFICIARIO) {
							this.model.NOMBRE_BENEFICIARIO = data.NOMBRE_BENEFICIARIO;
						}
					}
				},
				error: () => undefined,
			});
	}

	MostrarAsignarArchivo(): void {
		if (!this.model.CORR_CUENTA_BANCO) {
			this.notifyFx('Debe seleccionar la cuenta bancaria antes de asignar archivo.', NotifyType.Warning);
			return;
		}
		this.loadingVisible = true;
		this.service
			.getAllCOM_PAGO_ARCHIVO({ CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.mCOM_PAGO_ARCHIVO = response.Data || [];
						this.archivoSeleccionado = null;
						this.popupVisibleArchivo = true;
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	hideArchivoPopup() {
		this.popupVisibleArchivo = false;
	}

	focusedArchivoChanged(e: any) {
		this.archivoSeleccionado = e?.row?.data || null;
	}

	guardarArchivoPopup() {
		if (!this.archivoSeleccionado?.CORR_ARCHIVO) {
			this.notifyFx('Debe seleccionar un archivo.', NotifyType.Warning);
			return;
		}
		this.model.CORR_ARCHIVO = this.archivoSeleccionado.CORR_ARCHIVO;
		this.loadingVisible = true;
		this.service
			.AsignarArchivo(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.notifyFx('Archivo asignado con éxito!', NotifyType.Success);
						if (response.Data) {
							this.aplicarRespuestaEstado(response.Data);
						}
						this.popupVisibleArchivo = false;
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	ActualizarCuenta(): void {
		if (!this.hasPagoKeys() || !this.puedeEditarDetalle()) {
			return;
		}
		this.loadingVisible = true;
		this.service
			.ActualizarCuenta(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.notifyFx('Cuenta actualizada con éxito!', NotifyType.Success);
						if (response.Data) {
							this.aplicarRespuestaEstado(response.Data);
						}
						this.consultarConta();
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	contaRowUpdating(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			return;
		}
		const data = { ...e.oldData, ...e.newData };
		e.cancel = new Promise((resolve) => {
			this.service
				.updateCOM_PAGO_CONTA(data)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.consultarConta();
							resolve(false);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
							resolve(true);
						}
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						resolve(true);
					},
				});
		});
	}

	contaRowRemoving(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			return;
		}
		e.cancel = new Promise((resolve) => {
			this.service
				.deleteCOM_PAGO_CONTA(e.data)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.consultarConta();
							resolve(false);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
							resolve(true);
						}
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						resolve(true);
					},
				});
		});
	}
	// #endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCORR_TIPO_DOC(vRow: any): any {
		return vRow[0].CORR_TIPO_DOC;
	}

	selectedLookUpCORR_PROVEEDOR(vRow: any): any {
		const row = vRow?.[0];
		if (!row) {
			return null;
		}
		this.model.NOMBRE_PROVEEDOR = row.NOMBRE_PROVEEDOR ?? '';
		if (!this.model.NOMBRE_BENEFICIARIO) {
			this.model.NOMBRE_BENEFICIARIO = row.NOMBRE_PROVEEDOR ?? '';
		}
		return row.CORR_PROVEEDOR;
	}

	selectedLookUpCORR_CUENTA_BANCO(vRow: any): any {
		return vRow?.[0]?.CORR_CUENTA_BANCO;
	}

	selectedLookUpCORR_TIPO_CHEQUE(vRow: any): any {
		return vRow?.[0]?.CORR_TIPO_CHEQUE;
	}

	selectTodosPendientes() {
		this.mCOM_PAGO_PENDIENTES.forEach((x) => (x.SELECCION = true));
	}

	selectNingunoPendientes() {
		this.mCOM_PAGO_PENDIENTES.forEach((x) => (x.SELECCION = false));
	}
}
