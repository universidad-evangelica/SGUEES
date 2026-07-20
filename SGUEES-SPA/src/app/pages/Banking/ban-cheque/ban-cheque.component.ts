import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { IParam } from 'src/app/FxAPI/IParam';
import { environment } from 'src/environments/environment';

import { BanCheque } from './models/ban-cheque';
import { BanChequeDeta } from './models/ban-cheque-deta';
import { BanChequeService } from './ban-cheque.service';
import { BanChequeDetaService } from './ban-cheque-deta/ban-cheque-deta.service';
import { ConCatalogoCuentaCentroCostoService } from '../../Accounting/con-catalogo-cuenta-centro-costo/con-catalogo-cuenta-centro-costo.service';

@Component({
	selector: 'app-ban-cheque',
	templateUrl: './ban-cheque.component.html',
	styleUrls: ['./ban-cheque.component.scss'],
})
export class BanChequeComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridDetalle', { static: false }) gridDetalle!: DxDataGridComponent;

	protected override etiquetaRegistro = 'el cheque';
	protected override requiereEmpresaSesion = true;
	protected readonly lookupOpcion = 'BAN_CHEQUE';
	detalles: BanChequeDeta[] = [];
	readOnly = false;
	detalleEditando = false;
	private detalleEdicionExplicita = false;

	mMES_PERIODO: any;
	mCORR_TIPO_MOVIMIENTO: any[] = [];
	mCORR_CUENTA_BANCO: any[] = [];
	mCORR_TIPO_CHEQUE: any[] = [];
	mESTADO_DOCUMENTO: any;
	mCORR_PROVEEDOR: any[] = [];
	mCORR_EMPLEADO: any[] = [];
	mCORR_CLIENTE: any[] = [];
	mCUENTA_CONTABLE: any[] = [];
	mCORR_CENTRO_COSTO: any[] = [];

	cuentaLookupColumns: any[] = [
		{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
		{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre cuenta', width: 280 },
	];
	centroLookupColumns: any[] = [
		{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre centro', width: 280 },
	];
	tipoMoviLookupColumns: any[] = [
		{ dataField: 'CORR_TIPO_MOVIMIENTO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Tipo movimiento', width: 280 },
	];
	cuentaBancoLookupColumns: any[] = [
		{ dataField: 'CORR_CUENTA_BANCO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Cuenta bancaria', width: 280 },
	];
	tipoChequeLookupColumns: any[] = [
		{ dataField: 'CORR_TIPO_CHEQUE', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_TIPO_CHEQUE', caption: 'Tipo cheque', width: 280 },
	];
	proveedorLookupColumns: any[] = [
		{ dataField: 'CODIGO_PROVEEDOR', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Proveedor', width: 280 },
	];
	empleadoLookupColumns: any[] = [
		{ dataField: 'CORR_EMPLEADO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_EMPLEADO', caption: 'Empleado', width: 280 },
	];
	clienteLookupColumns: any[] = [
		{ dataField: 'CODIGO_CLIENTE', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_CLIENTE', caption: 'Cliente', width: 280 },
	];

	centrosPorCuentaCache: Record<string, any[]> = {};
	centrosPorCuentaCargando: Record<string, boolean> = {};

	vFECHA_INICIAL: Date = new Date();
	vFECHA_FINAL: Date = new Date();

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private service: BanChequeService,
		private detaService: BanChequeDetaService,
		private cuentaCentroService: ConCatalogoCuentaCentroCostoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();

		this.cuentaSetCellValue = this.cuentaSetCellValue.bind(this);
		this.centroCostoSetCellValue = this.centroCostoSetCellValue.bind(this);
		this.cuentaContableDisplay = this.cuentaContableDisplay.bind(this);
		this.codigoCentroDisplay = this.codigoCentroDisplay.bind(this);
		this.centroCostoNombreDisplay = this.centroCostoNombreDisplay.bind(this);
		this.editarDetalleClick = this.editarDetalleClick.bind(this);
		this.detalleEditButtonVisible = this.detalleEditButtonVisible.bind(this);
		this.detalleDeleteButtonVisible = this.detalleDeleteButtonVisible.bind(this);
		this.customizeItem = this.customizeItem.bind(this);
		this.selectedLookUpLista = this.selectedLookUpLista.bind(this);
		this.selectedLookUpCORR_TIPO_MOVIMIENTO = this.selectedLookUpCORR_TIPO_MOVIMIENTO.bind(this);
		this.selectedLookUpCORR_CUENTA_BANCO = this.selectedLookUpCORR_CUENTA_BANCO.bind(this);
		this.selectedLookUpCORR_TIPO_CHEQUE = this.selectedLookUpCORR_TIPO_CHEQUE.bind(this);
		this.selectedLookUpCORR_PROVEEDOR = this.selectedLookUpCORR_PROVEEDOR.bind(this);
		this.selectedLookUpCORR_EMPLEADO = this.selectedLookUpCORR_EMPLEADO.bind(this);
		this.selectedLookUpCORR_CLIENTE = this.selectedLookUpCORR_CLIENTE.bind(this);
	}

	ngOnInit(): void {
		const today = this.appInfoService.getDate();
		this.vFECHA_INICIAL = new Date(today.getFullYear(), today.getMonth(), 1);
		this.vFECHA_FINAL = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}

	llenaComboBox() {
		this.getMES_PERIODO();
		this.getCORR_TIPO_MOVIMIENTO();
		this.getCORR_CUENTA_BANCO();
		this.getCORR_TIPO_CHEQUE();
		this.getESTADO_DOCUMENTO();
		this.getCORR_PROVEEDOR();
		this.getCORR_EMPLEADO();
		this.getCORR_CLIENTE();
		this.getCUENTA_CONTABLE();
		this.getCORR_CENTRO_COSTO();
	}

	getMES_PERIODO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'GEN_LISTA', 'GetMES', undefined, environment.UrlGENERALAPI)
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

	getCORR_TIPO_MOVIMIENTO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'BAN_TIPO_MOVI_BANCARIO', 'GetCORR_TIPO_MOVIMIENTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_MOVIMIENTO = (response.Data || []).filter(
							(item: any) => item.CLASE_MOVIMIENTO === 'CHQ'
						);
						this.aplicarTipoMovimientoChequeDefault();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	private aplicarTipoMovimientoChequeDefault(forzar = false): void {
		if (!this.model || !this.mCORR_TIPO_MOVIMIENTO?.length) {
			return;
		}

		const tipoDefault =
			this.mCORR_TIPO_MOVIMIENTO.find((item: any) => item.CLASE_MOVIMIENTO === 'CHQ') ||
			this.mCORR_TIPO_MOVIMIENTO[0];

		if (!tipoDefault) {
			return;
		}

		if (this.model.CORR_TIPO_MOVIMIENTO > 0 && !forzar) {
			const tipoActual = this.mCORR_TIPO_MOVIMIENTO.find(
				(item: any) => item.CORR_TIPO_MOVIMIENTO === this.model.CORR_TIPO_MOVIMIENTO
			);
			this.model.NOMBRE_TIPO_MOVIMIENTO = tipoActual?.NOMBRE_TIPO_MOVIMIENTO || tipoDefault.NOMBRE_TIPO_MOVIMIENTO;
			this.model.CLASE_MOVIMIENTO = 'CHQ';
			return;
		}

		this.model.CORR_TIPO_MOVIMIENTO = tipoDefault.CORR_TIPO_MOVIMIENTO;
		this.model.NOMBRE_TIPO_MOVIMIENTO = tipoDefault.NOMBRE_TIPO_MOVIMIENTO || '';
		this.model.CLASE_MOVIMIENTO = 'CHQ';
	}

	private aplicarTipoChequeDefault(forzar = false): void {
		if (!this.model || !this.mCORR_TIPO_CHEQUE?.length) {
			return;
		}

		const tipoDefault =
			this.mCORR_TIPO_CHEQUE.find((item: any) => item.CLASE_TIPO_CHEQUE === 'PR') ||
			this.mCORR_TIPO_CHEQUE.find((item: any) =>
				String(item.NOMBRE_TIPO_CHEQUE || '')
					.toLowerCase()
					.includes('proveedor')
			);

		if (!tipoDefault) {
			return;
		}

		if (this.model.CORR_TIPO_CHEQUE > 0 && !forzar) {
			this.syncClaseTipoChequeFromLookup();
			return;
		}

		this.model.CORR_TIPO_CHEQUE = tipoDefault.CORR_TIPO_CHEQUE;
		this.applyTipoChequeSelection(tipoDefault);
	}

	getCORR_CUENTA_BANCO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'BAN_CUENTA_BANCARIA', 'GetCORR_CUENTA_BANCO', undefined, environment.UrlCONTAAPI)
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
			.getLookUp(this.lookupOpcion, 'BAN_TIPO_CHEQUE', 'GetCORR_TIPO_CHEQUE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_CHEQUE = response.Data;
						this.aplicarTipoChequeDefault();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getESTADO_DOCUMENTO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'BAN_LISTA', 'GetESTADO_DOCUMENTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_DOCUMENTO = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_PROVEEDOR() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'GEN_PROVEEDOR', 'GetCORR_PROVEEDOR', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PROVEEDOR = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_EMPLEADO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'GEN_EMPLEADO', 'GetCORR_EMPLEADO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_EMPLEADO = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_CLIENTE() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'GEN_CLIENTE', 'GetCORR_CLIENTE', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CLIENTE = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCUENTA_CONTABLE() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCUENTA_CONTABLE = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'CON_CENTRO_COSTO', 'GetCORR_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	fillParam(): any {
		return {
			CORR_DOCUMENTO: 0,
			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),
			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),
		};
	}

	documentoRowKey(row: BanCheque): string {
		return `${row.ANIO_PERIODO}-${row.MES_PERIODO}-${row.CORR_TIPO_MOVIMIENTO}-${row.CORR_DOCUMENTO}`;
	}

	override fillData(xModel?: BanCheque): BanCheque {
		if (xModel !== undefined) {
			return { ...xModel };
		}

		const today = this.appInfoService.getDate();
		return {
			CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
			ANIO_PERIODO: this.appInfoService.toYear(today),
			MES_PERIODO: this.appInfoService.toMonth(today),
			CORR_TIPO_MOVIMIENTO: 0,
			NOMBRE_TIPO_MOVIMIENTO: '',
			CLASE_MOVIMIENTO: '',
			CORR_DOCUMENTO: 0,
			CORR_CUENTA_BANCO: 0,
			NUMERO_DOCUMENTO: 0,
			FECHA_EMISION: today,
			NOMBRE_PARTIDA: '',
			CORR_PROVEEDOR: 0,
			CORR_EMPLEADO: 0,
			CORR_CLIENTE: 0,
			NOMBRE_BENEFICIARIO: '',
			MONTO_DOCUMENTO: 0,
			ESTADO_DOCUMENTO: 'DI',
			CORR_TIPO_CHEQUE: 0,
			CLASE_TIPO_CHEQUE: '',
			ESTA_CONTABILIZADO: false,
			CANTIDAD_LETRAS: '',
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
			!this.documentoEditablePorEstado(this.model?.ESTADO_DOCUMENTO)
		) {
			this.notifyFx(
				'Solo se pueden modificar documentos DIGITADOS. Los documentos APLICADOS o ANULADOS no se pueden modificar.',
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
				const row = data as BanCheque;
				if (!Array.isArray(this.models)) {
					this.models = [];
				}
				if (isAdd) {
					this.models.push(row);
				} else {
					const key = this.documentoRowKey(row);
					const index = this.models.findIndex((item: BanCheque) => this.documentoRowKey(item) === key);
					if (index >= 0) {
						this.models[index] = row;
					}
				}
				this.model = this.fillData(row);
				this.modelUpdate = this.fillData(row);
				if (isAdd) {
					this.AsignaStatus(UpdateType.Update);
					this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
					this.syncClaseTipoChequeFromLookup();
					this.habilitar();
					this.consultarDetalles();
				} else {
					this.volverAlListado();
				}
			},
		});
	}

	private volverAlListado(): void {
		this.detalles = [];
		this.detalleEditando = false;
		this.detalleEdicionExplicita = false;
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
	}

	override cancelar(): void {
		const finalizarCancelacion = () => {
			this.detalles = [];
			this.readOnly = false;
			this.detalleEditando = false;
			this.detalleEdicionExplicita = false;
		};

		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.model = this.modelUpdate;
				const key = this.documentoRowKey(this.modelUpdate);
				const vIndex = this.models.findIndex((item: BanCheque) => this.documentoRowKey(item) === key);
				if (vIndex >= 0) {
					this.models[vIndex] = this.modelUpdate;
				}
				this.AsignaStatus(UpdateType.Browse);
				this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
				finalizarCancelacion();
			});
		} else {
			if (this.banderaMtto === UpdateType.Not_Defined) {
				this.restaurarFilaGridConsulta(
					(item: BanCheque) => this.documentoRowKey(item) === this.documentoRowKey(this.modelUpdate)
				);
			}
			this.AsignaStatus(UpdateType.Browse);
			finalizarCancelacion();
		}
	}

	override bloquear(): void {
		this.aplicarReadOnlyFormulario(true);
	}

	override habilitar(): void {
		this.aplicarReadOnlyFormulario(!this.documentoEditablePorEstado(this.model?.ESTADO_DOCUMENTO));
	}

	private aplicarReadOnlyFormulario(soloLectura: boolean): void {
		this.readOnly = soloLectura;
		setTimeout(() => this.aplicarReadOnlyEditoresDirectos(soloLectura));
	}

	documentoEditablePorEstado(estado?: string): boolean {
		return estado === 'DI';
	}

	puedeEditarDetalle(): boolean {
		return this.isForm() && this.documentoEditablePorEstado(this.model?.ESTADO_DOCUMENTO);
	}

	override getPermiteEditar(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteEdit && this.documentoEditablePorEstado(data?.ESTADO_DOCUMENTO);
	}

	override getPermiteDele(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteDele && this.documentoEditablePorEstado(data?.ESTADO_DOCUMENTO);
	}

	hasDocumentoKeys(): boolean {
		return (
			this.model?.CORR_DOCUMENTO > 0 &&
			this.model?.ANIO_PERIODO > 0 &&
			this.model?.MES_PERIODO > 0 &&
			this.model?.CORR_TIPO_MOVIMIENTO > 0
		);
	}

	esClaseCheque(): boolean {
		return this.model?.CLASE_MOVIMIENTO === 'CHQ';
	}

	getClaseTipoChequeActiva(): string {
		if (this.model?.CLASE_TIPO_CHEQUE) {
			return this.model.CLASE_TIPO_CHEQUE;
		}
		const tipo = this.mCORR_TIPO_CHEQUE?.find(
			(item: any) => item.CORR_TIPO_CHEQUE === this.model?.CORR_TIPO_CHEQUE
		);
		return tipo?.CLASE_TIPO_CHEQUE || '';
	}

	beneficiarioAutoDesdeLookup(): boolean {
		const clase = this.getClaseTipoChequeActiva();
		return clase === 'PR' || clase === 'EM' || clase === 'CL';
	}

	private syncClaseTipoChequeFromLookup(): void {
		const tipo = this.mCORR_TIPO_CHEQUE?.find(
			(item: any) => item.CORR_TIPO_CHEQUE === this.model?.CORR_TIPO_CHEQUE
		);
		if (tipo) {
			this.model.CLASE_TIPO_CHEQUE = tipo.CLASE_TIPO_CHEQUE || '';
			this.model.NOMBRE_TIPO_CHEQUE = tipo.NOMBRE_TIPO_CHEQUE || this.model.NOMBRE_TIPO_CHEQUE || '';
		}
	}

	private actualizarVisibilidadBeneficiarioForm(): void {
		setTimeout(() => {
			const form = this.dataForm?.instance;
			if (!form) {
				return;
			}
			form.repaint();
			const soloLectura = this.isConsulta()
				? true
				: !this.documentoEditablePorEstado(this.model?.ESTADO_DOCUMENTO);
			this.readOnly = soloLectura;
			this.aplicarReadOnlyEditoresDirectos(soloLectura);
		});
	}

	private aplicarReadOnlyEditoresDirectos(soloLectura: boolean): void {
		const form = this.dataForm?.instance;
		if (!form) {
			return;
		}
		(
			[
				'MES_PERIODO',
				'CORR_CUENTA_BANCO',
				'FECHA_EMISION',
				'CORR_TIPO_CHEQUE',
				'CORR_PROVEEDOR',
				'CORR_EMPLEADO',
				'CORR_CLIENTE',
				'NOMBRE_PARTIDA',
				'MONTO_DOCUMENTO',
			] as const
		).forEach((campo) => {
			form.getEditor(campo)?.option('readOnly', soloLectura);
		});
		form
			.getEditor('NOMBRE_BENEFICIARIO')
			?.option('readOnly', soloLectura || this.beneficiarioAutoDesdeLookup());
	}

	private formUsaLookupBeneficiario(): boolean {
		const clase = this.getClaseTipoChequeActiva();
		return clase === 'PR' || clase === 'EM' || clase === 'CL';
	}

	private applyTipoChequeSelection(tipo: any): void {
		this.model.CLASE_TIPO_CHEQUE = tipo?.CLASE_TIPO_CHEQUE || '';
		this.model.NOMBRE_TIPO_CHEQUE = tipo?.NOMBRE_TIPO_CHEQUE || '';
		this.model.CORR_PROVEEDOR = 0;
		this.model.CORR_EMPLEADO = 0;
		this.model.CORR_CLIENTE = 0;
		this.model.NOMBRE_BENEFICIARIO = '';
		this.actualizarVisibilidadBeneficiarioForm();
	}

	onTipoChequeChanged(value: number): void {
		if (!value) {
			this.model.CLASE_TIPO_CHEQUE = '';
			this.model.NOMBRE_TIPO_CHEQUE = '';
			this.model.CORR_PROVEEDOR = 0;
			this.model.CORR_EMPLEADO = 0;
			this.model.CORR_CLIENTE = 0;
			this.model.NOMBRE_BENEFICIARIO = '';
			this.actualizarVisibilidadBeneficiarioForm();
			return;
		}
		const tipo = this.mCORR_TIPO_CHEQUE?.find((item: any) => item.CORR_TIPO_CHEQUE === value);
		if (tipo) {
			this.applyTipoChequeSelection(tipo);
		}
	}

	private nombreDesdeTercero(lista: any[], value: number, corrField: string, nombreField: string): string {
		if (!value) {
			return '';
		}
		const item = lista?.find((x: any) => x[corrField] === value);
		return item?.[nombreField] || '';
	}

	onProveedorChanged(value: number): void {
		this.model.NOMBRE_BENEFICIARIO = this.nombreDesdeTercero(
			this.mCORR_PROVEEDOR,
			value,
			'CORR_PROVEEDOR',
			'NOMBRE_PROVEEDOR'
		);
	}

	onEmpleadoChanged(value: number): void {
		this.model.NOMBRE_BENEFICIARIO = this.nombreDesdeTercero(
			this.mCORR_EMPLEADO,
			value,
			'CORR_EMPLEADO',
			'NOMBRE_EMPLEADO'
		);
	}

	onClienteChanged(value: number): void {
		this.model.NOMBRE_BENEFICIARIO = this.nombreDesdeTercero(
			this.mCORR_CLIENTE,
			value,
			'CORR_CLIENTE',
			'NOMBRE_CLIENTE'
		);
	}

	customizeItem(item: any): void {
		if (item?.itemType !== 'simple') {
			return;
		}

		const clase = this.getClaseTipoChequeActiva();
		const usaLookupBenef = this.formUsaLookupBeneficiario();

		if (item.dataField === 'CORR_TIPO_MOVIMIENTO') {
			item.editorOptions = {
				...(item.editorOptions || {}),
				readOnly: true,
			};
			return;
		}

		if (item.dataField === 'CORR_PROVEEDOR') {
			item.visible = clase === 'PR';
			return;
		}

		if (item.dataField === 'CORR_EMPLEADO') {
			item.visible = clase === 'EM';
			return;
		}

		if (item.dataField === 'CORR_CLIENTE') {
			item.visible = clase === 'CL';
			return;
		}

		if (item.dataField === 'NOMBRE_BENEFICIARIO') {
			item.editorOptions = {
				...(item.editorOptions || {}),
				readOnly: this.readOnly || this.beneficiarioAutoDesdeLookup(),
			};
			return;
		}

		if (
			item.dataField === 'FECHA_EMISION' ||
			item.dataField === 'MONTO_DOCUMENTO' ||
			item.dataField === 'NOMBRE_PARTIDA'
		) {
			item.editorOptions = {
				...(item.editorOptions || {}),
				readOnly: this.readOnly,
			};
		}

		if (item.dataField === 'NOMBRE_PARTIDA') {
			// Con lookup activo Monto pasa a la fila siguiente: Monto(2) + Concepto(6) = 8.
			item.colSpan = usaLookupBenef ? 6 : 8;
		}
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.syncClaseTipoChequeFromLookup();
		this.actualizarVisibilidadBeneficiarioForm();
		this.consultarDetalles();
	}

	override editarClick(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (!this.documentoEditablePorEstado(rowData?.ESTADO_DOCUMENTO)) {
			this.notifyFx(
				'Solo se pueden modificar documentos DIGITADOS. Los documentos APLICADOS o ANULADOS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}
		super.editarClick(e);
		this.syncClaseTipoChequeFromLookup();
		this.actualizarVisibilidadBeneficiarioForm();
		this.consultarDetalles();
		this.habilitar();
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.aplicarTipoMovimientoChequeDefault(true);
		this.aplicarTipoChequeDefault(true);
		this.detalles = [];
		this.detalleEditando = false;
		this.detalleEdicionExplicita = false;
		this.habilitar();
	}

	override focusedRowChanged(e: any): void {
		super.focusedRowChanged(e);
		if (this.isBrowse()) {
			this.consultarDetalles();
		}
	}

	consultarDetalles(): void {
		if (!this.hasDocumentoKeys()) {
			this.detalles = [];
			return;
		}

		this.detaService
			.getAll({
				ANIO_PERIODO: this.model.ANIO_PERIODO,
				MES_PERIODO: this.model.MES_PERIODO,
				CORR_TIPO_MOVIMIENTO: this.model.CORR_TIPO_MOVIMIENTO,
				CORR_DOCUMENTO: this.model.CORR_DOCUMENTO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalles = (response.Data || []).map((item: BanChequeDeta) => this.enriquecerDetalle(item));
						this.precargarCentrosDetalle(this.detalles);
						this.refrescarGridDetalle();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	agregarDetalle(): void {
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

	enriquecerDetalle(item: BanChequeDeta): BanChequeDeta {
		const centro = this.mCORR_CENTRO_COSTO?.find((c: any) => c.CORR_CENTRO_COSTO === item.CORR_CENTRO_COSTO);
		const cuenta = this.mCUENTA_CONTABLE?.find((c: any) => c.CUENTA_CONTABLE === item.CUENTA_CONTABLE);
		return {
			...item,
			NOMBRE_CUENTA: item.NOMBRE_CUENTA || cuenta?.NOMBRE_CUENTA || '',
			CODIGO_CENTRO_COSTO: item.CORR_CENTRO_COSTO
				? centro?.CODIGO_CENTRO_COSTO || item.CODIGO_CENTRO_COSTO || ''
				: '',
			NOMBRE_CENTRO: item.CORR_CENTRO_COSTO ? item.NOMBRE_CENTRO || centro?.NOMBRE_CENTRO || '' : 'No Definido',
		};
	}

	enriquecerDetalleData(data: any): void {
		if (data?.CUENTA_CONTABLE) {
			const cuenta = this.mCUENTA_CONTABLE.find((item: any) => item.CUENTA_CONTABLE === data.CUENTA_CONTABLE);
			data.NOMBRE_CUENTA = cuenta?.NOMBRE_CUENTA || data.NOMBRE_CUENTA || '';
		}
		if (data?.CORR_CENTRO_COSTO) {
			const centro = this.mCORR_CENTRO_COSTO.find((item: any) => item.CORR_CENTRO_COSTO === data.CORR_CENTRO_COSTO);
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

	cuentaContableDisplay(row: BanChequeDeta): string {
		return row?.CUENTA_CONTABLE || '';
	}

	codigoCentroDisplay(row: BanChequeDeta): string {
		if (!row?.CORR_CENTRO_COSTO) {
			return 'No Definido';
		}
		const centrosCuenta = row.CUENTA_CONTABLE ? this.centrosPorCuentaCache[row.CUENTA_CONTABLE] : undefined;
		const centro =
			centrosCuenta?.find((item: any) => item.CORR_CENTRO_COSTO === row.CORR_CENTRO_COSTO) ||
			this.mCORR_CENTRO_COSTO.find((item: any) => item.CORR_CENTRO_COSTO === row.CORR_CENTRO_COSTO);
		return centro?.CODIGO_CENTRO_COSTO || row.CODIGO_CENTRO_COSTO || 'No Definido';
	}

	centroCostoNombreDisplay(row: BanChequeDeta): string {
		if (!row?.CORR_CENTRO_COSTO) {
			return 'No Definido';
		}
		return row.NOMBRE_CENTRO || 'No Definido';
	}

	cuentaSetCellValue(newData: any, value: any): void {
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
		const centro = this.mCORR_CENTRO_COSTO.find((c: any) => c.CORR_CENTRO_COSTO === item.CORR_CENTRO_COSTO);
		return {
			CORR_CENTRO_COSTO: item.CORR_CENTRO_COSTO,
			CODIGO_CENTRO_COSTO: centro?.CODIGO_CENTRO_COSTO || item.CODIGO_CENTRO_COSTO || '',
			NOMBRE_CENTRO: item.NOMBRE_CENTRO || centro?.NOMBRE_CENTRO || '',
		};
	}

	private precargarCentrosDetalle(detalles: BanChequeDeta[]): void {
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

	centroCostoSetCellValue(newData: any, value: any): void {
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

	detalleInitNewRow(e: any): void {
		e.data.NOMBRE_TRAN = this.model?.NOMBRE_PARTIDA || '';
		e.data.MONTO_CARGO = 0;
		e.data.MONTO_ABONO = 0;
		e.data.CORR_CENTRO_COSTO = 0;
		e.data.NOMBRE_CENTRO = 'No Definido';
	}

	onDetalleEditingStart(e: any): void {
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

	onDetalleSaved(_e: any): void {
		this.detalleEdicionExplicita = false;
		this.detalleEditando = false;
		this.refrescarGridDetalle();
	}

	onDetalleEditCanceled(_e: any): void {
		this.detalleEdicionExplicita = false;
		this.detalleEditando = false;
		this.refrescarGridDetalle();
	}

	detalleRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		const isEmpty = !data.CUENTA_CONTABLE && !(data.MONTO_CARGO || 0) && !(data.MONTO_ABONO || 0);

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
		if (this.hasDocumentoKeys()) {
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
						this.model = this.fillData(response.Data);
						this.modelUpdate = this.fillData(this.model);
						this.AsignaStatus(UpdateType.Update);
						this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
						this.consultarDetalles();
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
				() => resolve(true)
			);
		});
	}

	private buildDetallePayload(data: any): BanChequeDeta {
		this.enriquecerDetalleData(data);
		return {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			ANIO_PERIODO: this.model.ANIO_PERIODO,
			MES_PERIODO: this.model.MES_PERIODO,
			CORR_TIPO_MOVIMIENTO: this.model.CORR_TIPO_MOVIMIENTO,
			CORR_DOCUMENTO: this.model.CORR_DOCUMENTO,
			...data,
		} as BanChequeDeta;
	}

	private guardarDetalleRemoto(data: any, esNuevo: boolean): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const deta = this.buildDetallePayload({ ...data });
			const operacion = esNuevo
				? this.detaService.insert(deta)
				: this.detaService.update(deta);

			operacion.pipe(take(1)).subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalleEditando = false;
						this.detalleEdicionExplicita = false;
						this.consultarDetalles();
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

	detalleRowInserting(e: any): void {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden modificar documentos DIGITADOS. Los documentos APLICADOS o ANULADOS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}

		if (!e.data?.CUENTA_CONTABLE && !(e.data?.MONTO_CARGO || 0) && !(e.data?.MONTO_ABONO || 0)) {
			e.cancel = true;
			return;
		}

		e.cancel = this.ejecutarDetalleConEncabezado(() => this.guardarDetalleRemoto(e.data, true));
	}

	detalleRowUpdating(e: any): void {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden modificar documentos DIGITADOS. Los documentos APLICADOS o ANULADOS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}

		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.ejecutarDetalleConEncabezado(() => this.guardarDetalleRemoto(data, false));
	}

	detalleRowRemoving(e: any): void {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden modificar documentos DIGITADOS. Los documentos APLICADOS o ANULADOS no se pueden modificar.',
				NotifyType.Warning
			);
			return;
		}

		if (!this.hasDocumentoKeys()) {
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
		if (!this.documentoEditablePorEstado(e.data?.ESTADO_DOCUMENTO)) {
			e.cancel = true;
			this.notifyFx(
				'Solo se pueden eliminar documentos DIGITADOS. Los documentos APLICADOS o ANULADOS no se pueden eliminar desde aquí.',
				NotifyType.Warning
			);
			return;
		}

		const removedKey = this.documentoRowKey(e.data);
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(e.data),
			parchearGrid: false,
			reload: () => {
				this.models = (this.models || []).filter(
					(item: BanCheque) => this.documentoRowKey(item) !== removedKey
				);
			},
		});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCORR_TIPO_MOVIMIENTO(vRow: any): any {
		const tipo = vRow[0];
		this.model.NOMBRE_TIPO_MOVIMIENTO = tipo?.NOMBRE_TIPO_MOVIMIENTO || '';
		this.model.CLASE_MOVIMIENTO = tipo?.CLASE_MOVIMIENTO || '';
		if (this.model.CLASE_MOVIMIENTO !== 'CHQ') {
			this.model.CORR_TIPO_CHEQUE = 0;
		}
		return tipo?.CORR_TIPO_MOVIMIENTO;
	}

	selectedLookUpCORR_CUENTA_BANCO(vRow: any): any {
		return vRow[0].CORR_CUENTA_BANCO;
	}

	selectedLookUpCORR_TIPO_CHEQUE(vRow: any): any {
		const tipo = vRow[0];
		this.applyTipoChequeSelection(tipo);
		return tipo?.CORR_TIPO_CHEQUE;
	}

	selectedLookUpCORR_PROVEEDOR(vRow: any): any {
		const item = vRow[0];
		this.model.NOMBRE_BENEFICIARIO = item?.NOMBRE_PROVEEDOR || '';
		return item?.CORR_PROVEEDOR ?? 0;
	}

	selectedLookUpCORR_EMPLEADO(vRow: any): any {
		const item = vRow[0];
		this.model.NOMBRE_BENEFICIARIO = item?.NOMBRE_EMPLEADO || '';
		return item?.CORR_EMPLEADO ?? 0;
	}

	selectedLookUpCORR_CLIENTE(vRow: any): any {
		const item = vRow[0];
		this.model.NOMBRE_BENEFICIARIO = item?.NOMBRE_CLIENTE || '';
		return item?.CORR_CLIENTE ?? 0;
	}

	selectedLookUpCUENTA_CONTABLE(vRow: any): any {
		return vRow[0].CUENTA_CONTABLE;
	}

	selectedLookUpCORR_CENTRO_COSTO(vRow: any): any {
		return vRow[0].CORR_CENTRO_COSTO;
	}

	onTipoMovimientoChanged(value: number): void {
		const tipo = this.mCORR_TIPO_MOVIMIENTO.find((item: any) => item.CORR_TIPO_MOVIMIENTO === value);
		this.model.NOMBRE_TIPO_MOVIMIENTO = tipo?.NOMBRE_TIPO_MOVIMIENTO || '';
		this.model.CLASE_MOVIMIENTO = tipo?.CLASE_MOVIMIENTO || '';
		if (this.model.CLASE_MOVIMIENTO !== 'CHQ') {
			this.model.CORR_TIPO_CHEQUE = 0;
		}
	}
}
