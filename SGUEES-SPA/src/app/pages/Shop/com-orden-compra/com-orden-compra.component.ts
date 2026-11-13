import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { ComOrdenCompra } from './models/com-orden-compra';
import { ComOrdenCompraService } from './com-orden-compra.service';

@Component({
	standalone: false,
	selector: 'app-com-orden-compra',
	templateUrl: './com-orden-compra.component.html',
	styleUrls: ['./com-orden-compra.component.scss'],
})
export class ComOrdenCompraComponent extends CBaseComponent implements OnInit {
	//#region <Declarando Variables>
	mESTADO_ORDEN_COMPRA: any;
	mCORR_PROVEEDOR: any;
	mCORR_CONDICION_PAGO: any;
	mCORR_FORMA_PAGO: any;
	mCORR_UNIDAD_MEDIDA: any;
	readOnly = true;
	mCOM_ORDEN_COMPRA_DETA: any[] = [];
	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
	popupVisiblePdf = false;
	vPDF: any;
	PDF!: SafeUrl;
	mCOM_ORDEN_COMPRA_AUTORIZACIONES: any[] = [];
	FilterValue: any = null;
	btnAplicar = '';
	btnAnular = '';
	btnDesAplicar = '';
	btnVistaPrevia = '';
	proveedorLookupColumns = [
		{ dataField: 'CODIGO_PROVEEDOR', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 280 },
	];
	unidadLookupColumns = [
		{ dataField: 'CORR_UNIDAD_MEDIDA', caption: 'Corr.', width: 80 },
		{ dataField: 'NOMBRE_UNIDAD_MEDIDA', caption: 'Unidad', width: 180 },
	];
	@ViewChild('DataOrdenCompraDetalle', { static: false }) gridDetalle!: DxDataGridComponent;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComOrdenCompraService,
		private sanitization: DomSanitizer,
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
		this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -7);
		this.vFECHA_FINAL = this.appInfoService.getDate();
	}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getESTADO_ORDEN_COMPRA();
		this.getCORR_PROVEEDOR();
		this.getCORR_CONDICION_PAGO();
		this.getCORR_FORMA_PAGO();
		this.getCORR_UNIDAD_MEDIDA();
	}

	getESTADO_ORDEN_COMPRA() {
		this.appInfoService
			.getLookUp('COM_ORDEN_COMPRA', 'COM_LISTA', 'GetESTADO_ORDEN', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_ORDEN_COMPRA = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_PROVEEDOR() {
		this.appInfoService
			.getLookUp('COM_ORDEN_COMPRA', 'GEN_PROVEEDOR', 'GetCORR_PROVEEDOR', undefined, environment.UrlGENERALAPI)
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

	getCORR_CONDICION_PAGO() {
		this.appInfoService
			.getLookUp('COM_ORDEN_COMPRA', 'COM_CONDICION_PAGO', 'GetCORR_CONDICION_PAGO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CONDICION_PAGO = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_FORMA_PAGO() {
		this.appInfoService
			.getLookUp('COM_ORDEN_COMPRA', 'GEN_FORMA_PAGO', 'GetCORR_FORMA_PAGO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_FORMA_PAGO = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_UNIDAD_MEDIDA() {
		this.appInfoService
			.getLookUp('COM_ORDEN_COMPRA', 'COM_UNIDAD_MEDIDA', 'GetCORR_UNIDAD_MEDIDA', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_UNIDAD_MEDIDA = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCORR_PROVEEDOR(vRow: any): any {
		const row = vRow[0];
		this.model.NOMBRE_PROVEEDOR = row.NOMBRE_PROVEEDOR;
		this.model.CODIGO_PROVEEDOR = row.CODIGO_PROVEEDOR;
		this.model.NOMBRE_CONTACTO = row.NOMBRE_CONTACTO;
		this.model.CORREO_ELECTRONICO_PROVEEDOR = row.CORREO_ELECTRONICO_1 || row.CORREO_ELECTRONICO_PROVEEDOR;
		this.model.TELEFONO_PROVEEDOR = row.TELEFONO_FIJO || row.TELEFONO_PROVEEDOR;
		this.model.DIRECCION_PROVEEDOR = row.DIRECCION_PROVEEDOR;
		return row.CORR_PROVEEDOR;
	}

	selectedLookUpCORR_CONDICION_PAGO(vRow: any): any {
		this.model.NOMBRE_CONDICION_PAGO = vRow[0].NOMBRE_CONDICION_PAGO;
		return vRow[0].CORR_CONDICION_PAGO;
	}

	selectedLookUpCORR_FORMA_PAGO(vRow: any): any {
		this.model.NOMBRE_FORMA_PAGO = vRow[0].NOMBRE_FORMA_PAGO;
		return vRow[0].CORR_FORMA_PAGO;
	}

	selectedLookUpCORR_UNIDAD_MEDIDA(vRow: any): any {
		return vRow[0].CORR_UNIDAD_MEDIDA;
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number, xCORR_ORDEN_COMPRA?: number): any {
		if (xCORR_ORDEN_COMPRA == undefined) {
			xANIO_PERIODO = 0;
			xCORR_ORDEN_COMPRA = 0;
		}
		return {
			ANIO_PERIODO: xANIO_PERIODO,
			CORR_ORDEN_COMPRA: xCORR_ORDEN_COMPRA,
			FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
			OPCION_CONSULTA: this.appInfoService.getTipoUsuario() == 6 ? 1 : 0,
		};
	}

	override fillData(xModel?: ComOrdenCompra): ComOrdenCompra {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				ANIO_PERIODO: xModel.ANIO_PERIODO,
				CORR_ORDEN_COMPRA: xModel.CORR_ORDEN_COMPRA,
				CORR_TIPO_DOC: xModel.CORR_TIPO_DOC,
				NOMBRE_TIPO_DOC: xModel.NOMBRE_TIPO_DOC,
				CORR_PROVEEDOR: xModel.CORR_PROVEEDOR,
				CODIGO_PROVEEDOR: xModel.CODIGO_PROVEEDOR,
				NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
				DIRECCION_PROVEEDOR: xModel.DIRECCION_PROVEEDOR,
				NOMBRE_COMERCIAL: xModel.NOMBRE_COMERCIAL,
				ACTIVIDAD_ECONOMICA: xModel.ACTIVIDAD_ECONOMICA,
				NOMBRE_CONTACTO: xModel.NOMBRE_CONTACTO,
				CORREO_ELECTRONICO_PROVEEDOR: xModel.CORREO_ELECTRONICO_PROVEEDOR,
				TELEFONO_PROVEEDOR: xModel.TELEFONO_PROVEEDOR,
				ATENCION_A: xModel.ATENCION_A,
				FECHA_ORDEN_COMPRA: xModel.FECHA_ORDEN_COMPRA,
				ESTADO_ORDEN_COMPRA: xModel.ESTADO_ORDEN_COMPRA,
				NOMBRE_ESTADO_ORDEN_COMPRA: xModel.NOMBRE_ESTADO_ORDEN_COMPRA,
				USUARIO_AUTORIZA: xModel.USUARIO_AUTORIZA,
				FECHA_AUTORIZA: xModel.FECHA_AUTORIZA,
				OBSERVACIONES: xModel.OBSERVACIONES,
				TOTAL_ORDEN: xModel.TOTAL_ORDEN,
				SUB_TOTAL: xModel.SUB_TOTAL,
				TOTAL_IMPUESTO: xModel.TOTAL_IMPUESTO,
				TOTAL_EN_LETRAS: xModel.TOTAL_EN_LETRAS,
				NUMERO_ORDEN_COMPRA: xModel.NUMERO_ORDEN_COMPRA,
				CORR_CONDICION_PAGO: xModel.CORR_CONDICION_PAGO,
				NOMBRE_CONDICION_PAGO: xModel.NOMBRE_CONDICION_PAGO,
				CORR_FORMA_PAGO: xModel.CORR_FORMA_PAGO,
				NOMBRE_FORMA_PAGO: xModel.NOMBRE_FORMA_PAGO,
				DETALLE_FORMA_PAGO: xModel.DETALLE_FORMA_PAGO,
				CORR_CUADRO_COMPARATIVO: xModel.CORR_CUADRO_COMPARATIVO,
				NUMERO_ORDEN: xModel.NUMERO_ORDEN,
				AUTORIZACIONES_REALIZADAS: xModel.AUTORIZACIONES_REALIZADAS,
				NUMERO_SOLI_COTIZACION: xModel.NUMERO_SOLI_COTIZACION,
				NOMBRE_DEPARTAMENTO: xModel.NOMBRE_DEPARTAMENTO,
				USUARIO_CREA_SOLI: xModel.USUARIO_CREA_SOLI,
				USUARIO_CREA: xModel.USUARIO_CREA,
			};
		}

		const hoy = this.appInfoService.getDate();
		return {
			CORR_EMPRESA: 0,
			ANIO_PERIODO: this.appInfoService.toYear(hoy),
			CORR_ORDEN_COMPRA: 0,
			CORR_TIPO_DOC: null,
			CORR_PROVEEDOR: 0,
			NOMBRE_PROVEEDOR: '',
			ATENCION_A: '',
			FECHA_ORDEN_COMPRA: hoy,
			ESTADO_ORDEN_COMPRA: 'DI',
			NOMBRE_ESTADO_ORDEN_COMPRA: 'Digitada',
			OBSERVACIONES: '',
			TOTAL_ORDEN: 0,
			SUB_TOTAL: 0,
			TOTAL_IMPUESTO: 0,
			NUMERO_ORDEN_COMPRA: 0,
			CORR_CONDICION_PAGO: null,
			CORR_FORMA_PAGO: null,
			DETALLE_FORMA_PAGO: '',
			CORR_CUADRO_COMPARATIVO: null,
			NUMERO_ORDEN: null,
			AUTORIZACIONES_REALIZADAS: '',
			NUMERO_SOLI_COTIZACION: '',
			NOMBRE_DEPARTAMENTO: '',
		};
	}

	private syncPeriodoFromFecha(): void {
		if (!this.model?.FECHA_ORDEN_COMPRA) {
			return;
		}
		if (!this.model.CORR_ORDEN_COMPRA) {
			this.model.ANIO_PERIODO = this.appInfoService.toYear(new Date(this.model.FECHA_ORDEN_COMPRA));
		}
	}

	private hasOrdenKeys(): boolean {
		return !!(this.model?.CORR_ORDEN_COMPRA && this.model.CORR_ORDEN_COMPRA > 0);
	}

	puedeEditarDetalle(): boolean {
		return !this.readOnly && this.model?.ESTADO_ORDEN_COMPRA === 'DI';
	}

	tieneCuadroComparativo(): boolean {
		return !!(this.model?.CORR_CUADRO_COMPARATIVO && this.model.CORR_CUADRO_COMPARATIVO > 0);
	}

	refrescarBotones() {
		if (this.banderaMtto !== UpdateType.Browse) {
			const estado = this.model?.ESTADO_ORDEN_COMPRA;
			this.btnAplicar = estado === 'DI' || estado === 'SO' ? 'Aplicar' : '';
			this.btnAnular = estado === 'DI' || estado === 'SO' || estado === 'AP' ? 'Anular' : '';
			this.btnDesAplicar = estado === 'AP' || estado === 'SO' ? 'Desaplicar' : '';
			this.btnVistaPrevia = this.tieneCuadroComparativo() ? 'Vista Previa' : '';
		} else {
			this.btnAplicar = '';
			this.btnAnular = '';
			this.btnDesAplicar = '';
			this.btnVistaPrevia = '';
		}
	}

	override nuevo(): void {
		super.nuevo();
		this.mCOM_ORDEN_COMPRA_DETA = [];
		this.mCOM_ORDEN_COMPRA_AUTORIZACIONES = [];
		this.readOnly = false;
		this.refrescarBotones();
		setTimeout(() => this.habilitar());
	}

	override focusedRowChanged(e: any) {
		this.model = e.row.data;
	}

	override editarClick(e: any) {
		this.model = e.row.data;
		super.editarClick(e);
		this.consultarCOM_ORDEN_COMPRA_DETA();
		this.consultarCOM_ORDEN_COMPRA_AUTORIZACIONES();
		this.refrescarBotones();
		this.readOnly = this.model.ESTADO_ORDEN_COMPRA !== 'DI';
		setTimeout(() => (this.readOnly ? this.bloquear() : this.habilitar()));
	}

	override rowDblClick(e: any) {
		super.rowDblClick(e);
		this.consultarCOM_ORDEN_COMPRA_DETA();
		this.consultarCOM_ORDEN_COMPRA_AUTORIZACIONES();
		this.refrescarBotones();
		this.readOnly = this.model.ESTADO_ORDEN_COMPRA !== 'DI';
		setTimeout(() => (this.readOnly ? this.bloquear() : this.habilitar()));
	}

	override getPermiteEditar(e: any): boolean {
		return !!(this.permiteEdit && e.row.data.ESTADO_ORDEN_COMPRA === 'DI');
	}

	override getPermiteDele(e: any): boolean {
		return !!(this.permiteDele && e.row.data.ESTADO_ORDEN_COMPRA === 'DI');
	}

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
						if (this.appInfoService.getTipoUsuario() != 6) {
							this.FilterValue = ['USUARIO_CREA_SOLI', '=', this.appInfoService.getUsuario()];
						}
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultarCOM_ORDEN_COMPRA_DETA() {
		if (!this.hasOrdenKeys()) {
			this.mCOM_ORDEN_COMPRA_DETA = [];
			return;
		}
		this.service
			.getAllCOM_ORDEN_COMPRA_DETA({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				CORR_ORDEN_COMPRA: this.model.CORR_ORDEN_COMPRA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_ORDEN_COMPRA_DETA = response.Data;
						this.model.TOTAL_ORDEN = (response.Data || []).reduce(
							(sum: number, r: any) => sum + (r.MONTO_SUBTOTAL || 0),
							0,
						);
						this.model.SUB_TOTAL = this.model.TOTAL_ORDEN;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultarCOM_ORDEN_COMPRA_AUTORIZACIONES() {
		if (!this.tieneCuadroComparativo()) {
			this.mCOM_ORDEN_COMPRA_AUTORIZACIONES = [];
			return;
		}
		this.service
			.getAllCOM_ORDEN_COMPRA_AUTORIZACIONES({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_ORDEN_COMPRA_AUTORIZACIONES = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
			return;
		}
		this.syncPeriodoFromFecha();
		this.loadingVisible = true;

		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result && response.ErrorCode === 0) {
							this.models.push(response.Data);
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro creado con éxito!', NotifyType.Success);
							this.refrescarBotones();
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
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result && response.ErrorCode === 0) {
							this.model = response.Data;
							const vIndex = this.models.findIndex(
								(item: any) =>
									item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
									item.CORR_ORDEN_COMPRA === response.Data.CORR_ORDEN_COMPRA,
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
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar(
			(item: any) =>
				item.CORR_ORDEN_COMPRA === this.modelUpdate.CORR_ORDEN_COMPRA &&
				item.ANIO_PERIODO === this.modelUpdate.ANIO_PERIODO,
		);
		this.refrescarBotones();
	}

	rowRemoving(e: any): void {
		if (e.data.ESTADO_ORDEN_COMPRA !== 'DI') {
			e.cancel = true;
			this.notifyFx('Solo se pueden eliminar órdenes digitadas.', NotifyType.Warning);
			return;
		}
		this.service
			.delete(this.fillParam(e.data.ANIO_PERIODO, e.data.CORR_ORDEN_COMPRA))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con éxito!', NotifyType.Success);
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
		const eds = [
			'FECHA_ORDEN_COMPRA',
			'NUMERO_ORDEN_COMPRA',
			'CORR_CUADRO_COMPARATIVO',
			'CORR_PROVEEDOR',
			'ATENCION_A',
			'CORR_CONDICION_PAGO',
			'CORR_FORMA_PAGO',
			'DETALLE_FORMA_PAGO',
			'TELEFONO_PROVEEDOR',
			'NOMBRE_CONTACTO',
			'CORREO_ELECTRONICO_PROVEEDOR',
			'NUMERO_SOLI_COTIZACION',
			'NOMBRE_DEPARTAMENTO',
			'OBSERVACIONES',
			'TOTAL_ORDEN',
		];
		eds.forEach((f) => this.dataForm?.instance?.getEditor(f)?.option('readOnly', true));
		this.readOnly = true;
	}

	override habilitar(): void {
		this.dataForm?.instance?.getEditor('FECHA_ORDEN_COMPRA')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('NUMERO_ORDEN_COMPRA')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CORR_CUADRO_COMPARATIVO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CORR_PROVEEDOR')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('ATENCION_A')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('CORR_CONDICION_PAGO')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('CORR_FORMA_PAGO')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('DETALLE_FORMA_PAGO')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('TELEFONO_PROVEEDOR')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_CONTACTO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CORREO_ELECTRONICO_PROVEEDOR')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NUMERO_SOLI_COTIZACION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('OBSERVACIONES')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('TOTAL_ORDEN')?.option('readOnly', true);
		this.readOnly = false;
	}

	override setFocus() {
		this.dataForm?.instance?.getEditor('CORR_PROVEEDOR')?.focus();
	}
	//#endregion

	//#region <Detalle>
	private guardarEncabezadoParaDetalle(onSuccess: () => void, onCancel: () => void): void {
		if (this.hasOrdenKeys()) {
			onSuccess();
			return;
		}
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
			onCancel();
			return;
		}
		this.syncPeriodoFromFecha();
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

	private ejecutarDetalleConEncabezado(accion: () => Promise<boolean>): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.guardarEncabezadoParaDetalle(
				() => {
					accion().then(resolve).catch(reject);
				},
				() => resolve(true),
			);
		});
	}

	private buildDetallePayload(data: any): any {
		return {
			ANIO_PERIODO: this.model.ANIO_PERIODO,
			CORR_ORDEN_COMPRA: this.model.CORR_ORDEN_COMPRA,
			...data,
		};
	}

	private guardarDetalleRemoto(data: any, esNuevo: boolean): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const deta = this.buildDetallePayload({ ...data });
			const operacion = esNuevo ? this.service.insertDETA(deta) : this.service.updateDETA(deta);
			operacion.pipe(take(1)).subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.consultarCOM_ORDEN_COMPRA_DETA();
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

	detalleRowInserting(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx('Solo se puede modificar el detalle de una orden digitada.', NotifyType.Warning);
			return;
		}
		if (!e.data?.CODIGO_ITEM && !(e.data?.CANTIDAD || 0) && !(e.data?.PRECIO_UNITARIO || 0)) {
			e.cancel = true;
			return;
		}
		e.cancel = this.ejecutarDetalleConEncabezado(() => this.guardarDetalleRemoto(e.data, true));
	}

	detalleRowUpdating(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx('Solo se puede modificar el detalle de una orden digitada.', NotifyType.Warning);
			return;
		}
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.ejecutarDetalleConEncabezado(() => this.guardarDetalleRemoto(data, false));
	}

	detalleRowRemoving(e: any) {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx('Solo se puede modificar el detalle de una orden digitada.', NotifyType.Warning);
			return;
		}
		if (!this.hasOrdenKeys()) {
			e.cancel = true;
			return;
		}
		e.cancel = new Promise((resolve, reject) => {
			this.service
				.deleteDETA(this.buildDetallePayload(e.data))
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.consultarCOM_ORDEN_COMPRA_DETA();
							this.refrescarBotones();
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

	calcularSubtotalDetalle(row: any): void {
		const cant = Number(row?.CANTIDAD || 0);
		const precio = Number(row?.PRECIO_UNITARIO || 0);
		row.MONTO_SUBTOTAL = cant * precio;
	}

	onDetalleEditorPreparing(e: any): void {
		if (e.parentType !== 'dataRow') {
			return;
		}
		if (e.dataField === 'CANTIDAD' || e.dataField === 'PRECIO_UNITARIO') {
			e.editorOptions.onValueChanged = (args: any) => {
				e.setValue(args.value);
				this.calcularSubtotalDetalle(e.row?.data);
			};
		}
	}
	//#endregion

	//#region <Procesos>
	private aplicarEstadoRespuesta(response: any, okMsg: string) {
		if (response.ErrorCode === 0 && response.Result) {
			this.model = response.Data;
			const vIndex = this.models.findIndex(
				(item: any) =>
					item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
					item.CORR_ORDEN_COMPRA === response.Data.CORR_ORDEN_COMPRA,
			);
			if (vIndex >= 0) {
				this.models[vIndex] = response.Data;
			}
			this.readOnly = this.model.ESTADO_ORDEN_COMPRA !== 'DI';
			this.refrescarBotones();
			setTimeout(() => (this.readOnly ? this.bloquear() : this.habilitar()));
			this.notifyFx(okMsg, NotifyType.Success);
		} else {
			this.notifyFx(response.ErrorMessage || 'No se pudo completar la operación', NotifyType.Error);
		}
	}

	Aplicar(): void {
		this.loadingVisible = true;
		this.service
			.Aplicar(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.aplicarEstadoRespuesta(response, 'Orden aplicada con éxito!');
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
					this.loadingVisible = false;
				},
			});
	}

	Anular(): void {
		this.loadingVisible = true;
		this.service
			.Anular(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.aplicarEstadoRespuesta(response, 'Orden anulada con éxito!');
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
					this.loadingVisible = false;
				},
			});
	}

	DesAplicar(): void {
		this.loadingVisible = true;
		this.service
			.DesAplicar(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.aplicarEstadoRespuesta(response, 'Orden desaplicada con éxito!');
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
					this.loadingVisible = false;
				},
			});
	}
	//#endregion

	//#region <Visualizar Pdf>
	obtenerPDF() {
		if (!this.tieneCuadroComparativo()) {
			this.notifyFx('La orden no tiene cuadro comparativo para vista previa.', NotifyType.Warning);
			return;
		}
		this.loadingVisible = true;
		this.service
			.getPDF({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO,
				NUMERO_ORDEN: this.model.NUMERO_ORDEN ?? this.model.NUMERO_ORDEN_COMPRA,
				NUMERO_ORDEN_COMPRA: this.model.NUMERO_ORDEN_COMPRA,
			})
			.pipe(take(1))
			.subscribe({
				next: (vPDF: any) => {
					if (vPDF != undefined) {
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
					this.notifyFx(error, NotifyType.Error);
					this.loadingVisible = false;
				},
			});
	}

	descargarPDF() {
		this.loadingVisible = true;
		this.appInfoService.downloadFile(
			this.vPDF,
			'OrdenCompraNo.' +
				this.model.ANIO_PERIODO.toString() +
				'-' +
				(this.model.NUMERO_ORDEN_COMPRA || this.model.CORR_ORDEN_COMPRA).toString() +
				'.pdf',
		);
		this.popupVisiblePdf = false;
		this.loadingVisible = false;
	}

	hidePdfPopup() {
		this.popupVisiblePdf = false;
		this.LimpiarPdf();
	}

	LimpiarPdf() {
		this.PDF = null as any;
	}
	//#endregion
}
