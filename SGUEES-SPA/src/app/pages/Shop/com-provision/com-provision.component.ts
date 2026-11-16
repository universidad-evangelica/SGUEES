import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComProvision } from './models/com-provision';
import { ComProvisionDeta } from './models/com-provision-deta';
import { ComProvisionConta } from './models/com-provision-conta';
import { ComProvisionService } from './com-provision.service';

@Component({
	standalone: false,
	selector: 'app-com-provision',
	templateUrl: './com-provision.component.html',
	styleUrls: ['./com-provision.component.scss'],
})
export class ComProvisionComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridDetalle', { static: false }) gridDetalle!: DxDataGridComponent;
	@ViewChild('gridConta', { static: false }) gridConta!: DxDataGridComponent;

	//#region <Declarando Variables>
	readOnly = false;
	mCORR_PROVEEDOR: any;
	mESTADO_PROVISION: any;
	mMES_PERIODO: any;
	mCUENTA_CONTABLE: any[] = [];
	mCORR_CENTRO_COSTO: any[] = [];

	detalles: ComProvisionDeta[] = [];
	contabilidades: ComProvisionConta[] = [];
	mDocumentosDisponibles: any[] = [];

	btnAplicar = '';
	btnAnular = '';
	btnGenerarConta = '';
	btnImportarDocs = '';

	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
	popupVisibleDocs = false;
	IndexTab = 0;

	proveedorLookupColumns = [
		{ dataField: 'CODIGO_PROVEEDOR', caption: 'Código', width: 120 },
		{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Nombre', width: 360 },
	];
	cuentaLookupColumns = [
		{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
		{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre cuenta', width: 280 },
	];
	centroLookupColumns = [
		{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre centro', width: 280 },
	];
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComProvisionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();

		this.selectedLookUpLista = this.selectedLookUpLista.bind(this);
		this.selectedLookUpCORR_PROVEEDOR = this.selectedLookUpCORR_PROVEEDOR.bind(this);
		this.selectedLookUpCUENTA_CONTABLE = this.selectedLookUpCUENTA_CONTABLE.bind(this);
		this.selectedLookUpCORR_CENTRO_COSTO = this.selectedLookUpCORR_CENTRO_COSTO.bind(this);
		this.getPermiteEditar = this.getPermiteEditar.bind(this);
		this.getPermiteDele = this.getPermiteDele.bind(this);
		this.guardarDocsPopup = this.guardarDocsPopup.bind(this);
		this.hideDocsPopup = this.hideDocsPopup.bind(this);
		this.selectTodosDocs = this.selectTodosDocs.bind(this);
		this.selectNingunoDocs = this.selectNingunoDocs.bind(this);
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
		this.getCORR_PROVEEDOR();
		this.getESTADO_PROVISION();
		this.getMES_PERIODO();
		this.getCUENTA_CONTABLE();
		this.getCORR_CENTRO_COSTO();
	}

	getCORR_PROVEEDOR() {
		this.appInfoService
			.getLookUp('COM_PROVISION', 'GEN_PROVEEDOR', 'GetCORR_PROVEEDOR', undefined, environment.UrlGENERALAPI)
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

	getESTADO_PROVISION() {
		this.appInfoService
			.getLookUp('COM_PROVISION', 'COM_LISTA', 'GetESTADO_PROVISION', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_PROVISION = response.Data;
					} else {
						this.mESTADO_PROVISION = this.estadoProvisionLocal();
					}
				},
				error: () => {
					this.mESTADO_PROVISION = this.estadoProvisionLocal();
				},
			});
	}

	private estadoProvisionLocal(): any[] {
		return [
			{ Key: 'DI', Value: 'Digitado' },
			{ Key: 'AP', Value: 'Aplicado' },
			{ Key: 'AN', Value: 'Anulado' },
		];
	}

	getMES_PERIODO() {
		this.appInfoService
			.getLookUp('COM_PROVISION', 'GEN_LISTA', 'GetMES', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mMES_PERIODO = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCUENTA_CONTABLE() {
		this.appInfoService
			.getLookUp('COM_PROVISION', 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCUENTA_CONTABLE = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('COM_PROVISION', 'CON_CENTRO_COSTO', 'GetCORR_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CENTRO_COSTO = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCORR_PROVEEDOR(vRow: any): any {
		return vRow[0].CORR_PROVEEDOR;
	}

	selectedLookUpCUENTA_CONTABLE(vRow: any): any {
		return vRow[0].CUENTA_CONTABLE;
	}

	selectedLookUpCORR_CENTRO_COSTO(vRow: any): any {
		return vRow[0].CORR_CENTRO_COSTO;
	}
	// #endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number, xMES_PERIODO?: number, xCORR_PROVISION?: number): any {
		if (xCORR_PROVISION == undefined) {
			xANIO_PERIODO = this.appInfoService.toYear(new Date());
			xMES_PERIODO = this.appInfoService.toMonth(new Date());
			xCORR_PROVISION = 0;
		}
		return {
			ANIO_PERIODO: xANIO_PERIODO,
			MES_PERIODO: xMES_PERIODO,
			CORR_PROVISION: xCORR_PROVISION,
			FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
		};
	}

	override fillData(xModel?: ComProvision): ComProvision {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				ANIO_PERIODO: xModel.ANIO_PERIODO,
				MES_PERIODO: xModel.MES_PERIODO,
				CORR_PROVISION: xModel.CORR_PROVISION,
				FECHA_PROVISION: xModel.FECHA_PROVISION,
				CORR_PROVEEDOR: xModel.CORR_PROVEEDOR,
				NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
				NOMBRE_PARTIDA: xModel.NOMBRE_PARTIDA,
				MONTO_PAGO: xModel.MONTO_PAGO,
				ANIO_PERIODO_PARTIDA: xModel.ANIO_PERIODO_PARTIDA,
				MES_PERIODO_PARTIDA: xModel.MES_PERIODO_PARTIDA,
				CORR_CLASE_PARTIDA: xModel.CORR_CLASE_PARTIDA,
				NOMBRE_CLASE_PARTIDA: xModel.NOMBRE_CLASE_PARTIDA,
				CORR_PARTIDA: xModel.CORR_PARTIDA,
				ESTADO_PROVISION: xModel.ESTADO_PROVISION,
				NOMBRE_ESTADO_PROVISION: xModel.NOMBRE_ESTADO_PROVISION,
				FECHA_ANULACION: xModel.FECHA_ANULACION,
				ANIO_PERIODO_PARTIDA_ANULACION: xModel.ANIO_PERIODO_PARTIDA_ANULACION,
				MES_PERIODO_PARTIDA_ANULACION: xModel.MES_PERIODO_PARTIDA_ANULACION,
				CORR_CLASE_PARTIDA_ANULACION: xModel.CORR_CLASE_PARTIDA_ANULACION,
				CORR_PARTIDA_ANULACION: xModel.CORR_PARTIDA_ANULACION,
				NOMBRE_BENEFICIARIO: xModel.NOMBRE_BENEFICIARIO || '',
				NO_CONTABILIZAR: !!xModel.NO_CONTABILIZAR,
			};
		}

		const hoy = this.appInfoService.getDate();
		return {
			CORR_EMPRESA: 1,
			ANIO_PERIODO: this.appInfoService.toYear(hoy),
			MES_PERIODO: this.appInfoService.toMonth(hoy),
			CORR_PROVISION: 0,
			FECHA_PROVISION: hoy,
			CORR_PROVEEDOR: 0,
			NOMBRE_PROVEEDOR: '',
			NOMBRE_PARTIDA: '',
			MONTO_PAGO: 0,
			ANIO_PERIODO_PARTIDA: null,
			MES_PERIODO_PARTIDA: null,
			CORR_CLASE_PARTIDA: null,
			NOMBRE_CLASE_PARTIDA: '',
			CORR_PARTIDA: null,
			ESTADO_PROVISION: 'DI',
			NOMBRE_ESTADO_PROVISION: 'Digitado',
			FECHA_ANULACION: null,
			ANIO_PERIODO_PARTIDA_ANULACION: null,
			MES_PERIODO_PARTIDA_ANULACION: null,
			CORR_CLASE_PARTIDA_ANULACION: null,
			CORR_PARTIDA_ANULACION: null,
			NOMBRE_BENEFICIARIO: '',
			NO_CONTABILIZAR: false,
		};
	}

	private syncPeriodoFromFecha(): void {
		if (!this.model?.FECHA_PROVISION) {
			return;
		}
		const fecha = new Date(this.model.FECHA_PROVISION);
		this.model.ANIO_PERIODO = this.appInfoService.toYear(fecha);
		this.model.MES_PERIODO = this.appInfoService.toMonth(fecha);
	}

	private hasProvisionKeys(): boolean {
		return !!(this.model?.CORR_PROVISION && this.model.CORR_PROVISION > 0);
	}

	puedeEditarDetalle(): boolean {
		return !this.readOnly && this.model?.ESTADO_PROVISION === 'DI';
	}

	refrescarBotones() {
		if (this.banderaMtto !== UpdateType.Browse) {
			this.btnAplicar = this.model?.ESTADO_PROVISION === 'DI' ? 'Aplicar' : '';
			this.btnAnular = this.model?.ESTADO_PROVISION === 'AP' ? 'Anular' : '';
			this.btnGenerarConta = this.model?.ESTADO_PROVISION === 'DI' ? 'Generar Conta' : '';
			this.btnImportarDocs = this.model?.ESTADO_PROVISION === 'DI' ? 'Importar Docs' : '';
		} else {
			this.btnAplicar = '';
			this.btnAnular = '';
			this.btnGenerarConta = '';
			this.btnImportarDocs = '';
		}
	}

	override nuevo(): void {
		super.nuevo();
		this.detalles = [];
		this.contabilidades = [];
		this.readOnly = false;
		this.refrescarBotones();
		setTimeout(() => this.habilitar());
	}

	override editarClick(e: any): void {
		this.model = e.row.data;
		super.editarClick(e);
		this.consultarDetalles();
		this.consultarContabilidades();
		this.refrescarBotones();
		this.readOnly = this.model.ESTADO_PROVISION !== 'DI';
		if (this.readOnly) {
			setTimeout(() => this.bloquear());
		} else {
			setTimeout(() => this.habilitar());
		}
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.consultarDetalles();
		this.consultarContabilidades();
		this.refrescarBotones();
		this.readOnly = this.model.ESTADO_PROVISION !== 'DI';
		if (this.readOnly) {
			setTimeout(() => this.bloquear());
		} else {
			setTimeout(() => this.habilitar());
		}
	}

	override getPermiteEditar(e: any): boolean {
		return !!(this.permiteEdit && e.row.data.ESTADO_PROVISION === 'DI');
	}

	override getPermiteDele(e: any): boolean {
		return !!(this.permiteDele && e.row.data.ESTADO_PROVISION === 'DI');
	}

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
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
									item.MES_PERIODO === response.Data.MES_PERIODO &&
									item.CORR_PROVISION === response.Data.CORR_PROVISION
							);
							if (vIndex >= 0) {
								this.models[vIndex] = response.Data;
							}
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con éxito!', NotifyType.Success);
							this.refrescarBotones();
							this.consultar();
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

	private guardarEncabezadoParaDetalle(onSuccess: () => void, onCancel: () => void): void {
		if (this.hasProvisionKeys()) {
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
					if (response.Result && response.ErrorCode === 0) {
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
						item.CORR_PROVISION === this.modelUpdate.CORR_PROVISION
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
		this.service
			.delete(this.fillParam(e.data.ANIO_PERIODO, e.data.MES_PERIODO, e.data.CORR_PROVISION))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con éxito!', NotifyType.Success);
						e.component.refresh();
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
		this.readOnly = true;
		const campos = [
			'CORR_PROVISION',
			'ESTADO_PROVISION',
			'FECHA_PROVISION',
			'ANIO_PERIODO',
			'MES_PERIODO',
			'CORR_PROVEEDOR',
			'NOMBRE_BENEFICIARIO',
			'MONTO_PAGO',
			'NO_CONTABILIZAR',
			'FECHA_ANULACION',
			'NOMBRE_PARTIDA',
		];
		campos.forEach((c) => this.dataForm?.instance?.getEditor(c)?.option('readOnly', true));
	}

	override habilitar(): void {
		this.readOnly = this.model?.ESTADO_PROVISION !== 'DI';
		this.dataForm?.instance?.getEditor('CORR_PROVISION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('ESTADO_PROVISION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('ANIO_PERIODO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('MES_PERIODO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('MONTO_PAGO')?.option('readOnly', true);

		const editable = !this.readOnly;
		['FECHA_PROVISION', 'CORR_PROVEEDOR', 'NOMBRE_BENEFICIARIO', 'NO_CONTABILIZAR', 'NOMBRE_PARTIDA'].forEach((c) =>
			this.dataForm?.instance?.getEditor(c)?.option('readOnly', !editable)
		);
		this.dataForm?.instance?.getEditor('FECHA_ANULACION')?.option('readOnly', this.model?.ESTADO_PROVISION !== 'AP');
	}

	override setFocus(): void {
		this.dataForm?.instance?.getEditor('CORR_PROVEEDOR')?.focus();
	}

	Aplicar(): void {
		if (this.model?.ESTADO_PROVISION !== 'DI') {
			this.notifyFx('Solo se pueden aplicar provisiones digitadas', NotifyType.Warning);
			return;
		}
		const confirpreli = custom({
			title: 'Confirmación de Aplicar',
			messageHtml: '¿Realmente quiere aplicar la provisión?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.Aplicar(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									if (response.Result || response.ErrorCode === 0) {
										this.notifyFx('Aplicado con éxito!', NotifyType.Success);
										if (response.Data) {
											this.model = response.Data;
											this.actualizarModeloEnGrid(response.Data);
										}
										this.consultar();
										this.consultarDetalles();
										this.consultarContabilidades();
										this.refrescarBotones();
										this.readOnly = true;
										setTimeout(() => this.bloquear());
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
		confirpreli.show();
	}

	Anular(): void {
		if (this.model?.ESTADO_PROVISION !== 'AP') {
			this.notifyFx('Solo se pueden anular provisiones aplicadas', NotifyType.Warning);
			return;
		}
		if (!this.model.FECHA_ANULACION) {
			this.model.FECHA_ANULACION = this.appInfoService.getDate();
		}
		const confirpreli = custom({
			title: 'Confirmación de Anular',
			messageHtml: '¿Realmente quiere anular la provisión?',
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
									if (response.Result || response.ErrorCode === 0) {
										this.notifyFx('Anulado con éxito!', NotifyType.Success);
										if (response.Data) {
											this.model = response.Data;
											this.actualizarModeloEnGrid(response.Data);
										}
										this.consultar();
										this.refrescarBotones();
										this.readOnly = true;
										setTimeout(() => this.bloquear());
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
		confirpreli.show();
	}

	GenerarConta(): void {
		if (this.model?.ESTADO_PROVISION !== 'DI') {
			this.notifyFx('Solo se puede generar contabilidad en provisiones digitadas', NotifyType.Warning);
			return;
		}
		if (!this.hasProvisionKeys()) {
			this.notifyFx('Primero debe guardar el encabezado', NotifyType.Warning);
			return;
		}
		const confirpreli = custom({
			title: 'Confirmación',
			messageHtml: '¿Desea regenerar la contabilidad de la provisión?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.GenerarConta(this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									if (response.Result) {
										this.notifyFx('Contabilidad generada con éxito!', NotifyType.Success);
										this.consultarContabilidades();
										this.consultarDetalles();
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
		confirpreli.show();
	}

	private actualizarModeloEnGrid(data: any): void {
		const vIndex = this.models.findIndex(
			(item: any) =>
				item.ANIO_PERIODO === data.ANIO_PERIODO &&
				item.MES_PERIODO === data.MES_PERIODO &&
				item.CORR_PROVISION === data.CORR_PROVISION
		);
		if (vIndex >= 0) {
			this.models[vIndex] = data;
		}
	}

	consultarDetalles(): void {
		if (!this.hasProvisionKeys()) {
			this.detalles = [];
			return;
		}
		this.service
			.getAllCOM_PROVISION_DETA({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PROVISION: this.model.CORR_PROVISION,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalles = response.Data || [];
						const total = this.detalles.reduce((s, d) => s + (d.MONTO_PAGO || 0), 0);
						this.model.MONTO_PAGO = total;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultarContabilidades(): void {
		if (!this.hasProvisionKeys()) {
			this.contabilidades = [];
			return;
		}
		this.service
			.getAllCOM_PROVISION_CONTA({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PROVISION: this.model.CORR_PROVISION,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.contabilidades = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	ImportarDocumentos(): void {
		if (!this.puedeEditarDetalle()) {
			this.notifyFx('Solo se pueden importar documentos en provisiones digitadas', NotifyType.Warning);
			return;
		}
		this.guardarEncabezadoParaDetalle(
			() => {
				this.mDocumentosDisponibles = [];
				this.popupVisibleDocs = true;
				this.consultarDocumentosDisponibles();
			},
			() => undefined
		);
	}

	consultarDocumentosDisponibles(): void {
		this.loadingVisible = true;
		this.service
			.getAllDisponibles({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PROVISION: this.model.CORR_PROVISION,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.mDocumentosDisponibles = (response.Data || []).map((x: any) => ({
							...x,
							SELECCION: !!x.SELECCION,
						}));
					} else {
						this.notifyFx(response.ErrorMessage || 'No se pudieron cargar documentos disponibles', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	selectTodosDocs() {
		this.mDocumentosDisponibles.forEach((x: any) => (x.SELECCION = true));
	}

	selectNingunoDocs() {
		this.mDocumentosDisponibles.forEach((x: any) => (x.SELECCION = false));
	}

	hideDocsPopup() {
		this.popupVisibleDocs = false;
	}

	guardarDocsPopup() {
		const seleccionados = this.mDocumentosDisponibles.filter((x: any) => x.SELECCION);
		if (!seleccionados.length) {
			this.notifyFx('Seleccione al menos un documento', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		let pendientes = seleccionados.length;
		let huboError = false;

		seleccionados.forEach((doc: any) => {
			const deta = {
				CORR_EMPRESA: this.model.CORR_EMPRESA,
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_PROVISION: this.model.CORR_PROVISION,
				CORR_DETA: 0,
				ANIO_PERIODO_COM: doc.ANIO_PERIODO,
				MES_PERIODO_COM: doc.MES_PERIODO,
				CORR_DOCUMENTO_COM: doc.CORR_DOCUMENTO,
				MONTO_DOCUMENTO: doc.TOTAL_DOCUMENTO || 0,
				MONTO_INICIAL: doc.TOTAL_DOCUMENTO || 0,
				MONTO_PAGO: doc.TOTAL_DOCUMENTO || 0,
				MONTO_FINAL: 0,
				NO_CONTABILIZAR: !!this.model.NO_CONTABILIZAR,
			};

			this.service
				.insertCOM_PROVISION_DETA(deta)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (!(response.Result || response.ErrorCode === 0)) {
							huboError = true;
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						pendientes -= 1;
						if (pendientes === 0) {
							this.loadingVisible = false;
							if (!huboError) {
								this.notifyFx('Documentos importados con éxito!', NotifyType.Success);
							}
							this.popupVisibleDocs = false;
							this.consultarDetalles();
							this.consultarContabilidades();
						}
					},
					error: (error: any) => {
						huboError = true;
						this.notifyFx(error, NotifyType.Error);
						pendientes -= 1;
						if (pendientes === 0) {
							this.loadingVisible = false;
							this.consultarDetalles();
							this.consultarContabilidades();
						}
					},
				});
		});
	}

	detalleRowRemoving(e: any): void {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx('Solo se pueden eliminar líneas en provisiones digitadas', NotifyType.Warning);
			return;
		}
		e.cancel = new Promise((resolve) => {
			this.service
				.deleteCOM_PROVISION_DETA(e.data)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result || response.ErrorCode === 0) {
							this.consultarDetalles();
							this.consultarContabilidades();
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

	contaRowUpdating(e: any): void {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx('Solo se puede editar contabilidad en provisiones digitadas', NotifyType.Warning);
			return;
		}
		const data = { ...e.oldData, ...e.newData };
		e.cancel = new Promise((resolve) => {
			this.service
				.updateCOM_PROVISION_CONTA(data)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result || response.ErrorCode === 0) {
							this.consultarContabilidades();
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

	contaRowRemoving(e: any): void {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			return;
		}
		e.cancel = new Promise((resolve) => {
			this.service
				.deleteCOM_PROVISION_CONTA(e.data)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result || response.ErrorCode === 0) {
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

	getDiferenciaConta(): number {
		const cargo = this.contabilidades.reduce((s, d) => s + (d.MONTO_CARGO || 0), 0);
		const abono = this.contabilidades.reduce((s, d) => s + (d.MONTO_ABONO || 0), 0);
		return cargo - abono;
	}
	// #endregion
}
