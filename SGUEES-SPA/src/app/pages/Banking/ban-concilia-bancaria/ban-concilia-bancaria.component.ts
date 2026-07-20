import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';

import {
	BanConciliaBancaria,
	BanConciliaBancariaMovi,
	BanConciliaBancariaPendiente,
	BanConciliaBancariaResumen,
} from './models/ban-concilia-bancaria';
import { BanConciliaBancariaDeta } from './models/ban-concilia-bancaria-deta';
import { BanConciliaBancariaService } from './ban-concilia-bancaria.service';
import { BanConciliaBancariaDetaService } from './ban-concilia-bancaria-deta/ban-concilia-bancaria-deta.service';
import { parseBanConciliaExcel } from './ban-concilia-excel.parser';

@Component({
	selector: 'app-ban-concilia-bancaria',
	templateUrl: './ban-concilia-bancaria.component.html',
	styleUrls: ['./ban-concilia-bancaria.component.scss'],
})
export class BanConciliaBancariaComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridDetalleBanco', { static: false }) gridDetalleBanco!: DxDataGridComponent;
	@ViewChild('gridPendientes', { static: false }) gridPendientes!: DxDataGridComponent;
	@ViewChild('excelInput', { static: false }) excelInput!: ElementRef<HTMLInputElement>;

	protected override etiquetaRegistro = 'la conciliación bancaria';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_CONCILIACION';
	protected readonly lookupOpcion = 'BAN_CONCILIA_BANCARIA';

	readOnly = false;
	detalles: BanConciliaBancariaDeta[] = [];
	pendientes: BanConciliaBancariaPendiente[] = [];
	resumen: BanConciliaBancariaResumen[] = [];
	movimientos: BanConciliaBancariaMovi[] = [];
	detalleEditando = false;
	private detalleEdicionExplicita = false;

	btnAplicar = '';
	btnDesAplicar = '';
	btnGenerar = '';
	btnReconstruir = '';
	btnImportar = '';

	mCORR_CUENTA_BANCO: any[] = [];
	mCORR_TIPO_MOVIMIENTO: any[] = [];
	mESTADO_CONCILIACION: any[] = [];

	cuentaBancoLookupColumns: any[] = [
		{ dataField: 'CORR_CUENTA_BANCO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_CUENTA_BANCO', caption: 'Cuenta bancaria', width: 280 },
	];
	tipoMoviLookupColumns: any[] = [
		{ dataField: 'CORR_TIPO_MOVIMIENTO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Tipo movimiento', width: 280 },
	];

	resumenColumns: any[] = [];
	detaColumns: any[] = [];
	pendienteColumns: any[] = [];
	moviColumns: any[] = [];

	vFECHA_INICIAL: Date = new Date();
	vFECHA_FINAL: Date = new Date();

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private service: BanConciliaBancariaService,
		private detaService: BanConciliaBancariaDetaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.resumenColumns = this.service.getResumenColumns();
		this.detaColumns = this.service.getDetaColumns();
		this.pendienteColumns = this.service.getPendienteColumns();
		this.moviColumns = this.service.getMoviColumns();

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
	}

	inicializaOpciones() {}

	llenaComboBox() {
		this.getCORR_CUENTA_BANCO();
		this.getCORR_TIPO_MOVIMIENTO();
		this.getESTADO_CONCILIACION();
	}

	getCORR_CUENTA_BANCO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'BAN_CUENTA_BANCARIA', 'GetCORR_CUENTA_BANCO_BAN_CONCILIA_BANCARIA', undefined, environment.UrlCONTAAPI)
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

	getCORR_TIPO_MOVIMIENTO() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'BAN_TIPO_MOVI_BANCARIO', 'GetCORR_TIPO_MOVIMIENTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_MOVIMIENTO = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getESTADO_CONCILIACION() {
		this.appInfoService
			.getLookUp(this.lookupOpcion, 'BAN_LISTA', 'GetESTADO_CONCILIACION_BAN_CONCILIA_BANCARIA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_CONCILIACION = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	fillParam(): any {
		return {
			CORR_CONCILIACION: 0,
			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),
			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),
		};
	}

	conciliaRowKey(row: BanConciliaBancaria): string {
		return `${row.CORR_CUENTA_BANCO}-${row.CORR_CONCILIACION}`;
	}

	override fillData(xModel?: BanConciliaBancaria): BanConciliaBancaria {
		if (xModel !== undefined) {
			return { ...xModel };
		}

		const today = this.appInfoService.getDate();
		return {
			CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
			CORR_CUENTA_BANCO: 0,
			CORR_CONCILIACION: 0,
			FECHA_CONCILIACION: today,
			SALDO_CUENTA_BANCO: 0,
			SALDO_CUENTA_CONTA: 0,
			ESTADO_CONCILIACION: 'DI',
			MONTO_AUMENTA: 0,
			MONTO_DISMINUYE: 0,
			SEGUN_LIBROS: 0,
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	guardar(): void {
		if (this.banderaMtto === UpdateType.Update && !this.editablePorEstado(this.model?.ESTADO_CONCILIACION)) {
			this.notifyFx('Solo se pueden modificar conciliaciones DIGITADAS.', NotifyType.Warning);
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
			parchearGrid: false,
			onSuccess: (data: unknown, isAdd: boolean) => {
				const row = data as BanConciliaBancaria;
				if (!Array.isArray(this.models)) {
					this.models = [];
				}
				if (isAdd) {
					this.models.push(row);
				} else {
					const key = this.conciliaRowKey(row);
					const index = this.models.findIndex((item: BanConciliaBancaria) => this.conciliaRowKey(item) === key);
					if (index >= 0) {
						this.models[index] = row;
					}
				}
				this.model = this.fillData(row);
				this.modelUpdate = this.fillData(row);
				if (isAdd) {
					this.AsignaStatus(UpdateType.Update);
					this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
					this.habilitar();
					this.cargarDetalleTabs();
				} else {
					this.volverAlListado();
				}
			},
		});
	}

	private volverAlListado(): void {
		this.limpiarTabs();
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.refrescarBotones();
	}

	override cancelar(): void {
		const finalizar = () => {
			this.limpiarTabs();
			this.readOnly = false;
			this.detalleEditando = false;
			this.detalleEdicionExplicita = false;
			this.refrescarBotones();
		};

		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.model = this.modelUpdate;
				const key = this.conciliaRowKey(this.modelUpdate);
				const vIndex = this.models.findIndex((item: BanConciliaBancaria) => this.conciliaRowKey(item) === key);
				if (vIndex >= 0) {
					this.models[vIndex] = this.modelUpdate;
				}
				this.AsignaStatus(UpdateType.Browse);
				this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
				finalizar();
			});
		} else {
			if (this.banderaMtto === UpdateType.Not_Defined) {
				this.restaurarFilaGridConsulta(
					(item: BanConciliaBancaria) => this.conciliaRowKey(item) === this.conciliaRowKey(this.modelUpdate)
				);
			}
			this.AsignaStatus(UpdateType.Browse);
			finalizar();
		}
	}

	override bloquear(): void {
		this.aplicarReadOnlyFormulario(true);
	}

	override habilitar(): void {
		this.aplicarReadOnlyFormulario(!this.editablePorEstado(this.model?.ESTADO_CONCILIACION));
		this.refrescarBotones();
	}

	private aplicarReadOnlyFormulario(soloLectura: boolean): void {
		this.readOnly = soloLectura;
		setTimeout(() => {
			const form = this.dataForm?.instance;
			if (!form) {
				return;
			}
			(['CORR_CUENTA_BANCO', 'FECHA_CONCILIACION', 'SALDO_CUENTA_BANCO', 'SALDO_CUENTA_CONTA'] as const).forEach((campo) => {
				form.getEditor(campo)?.option('readOnly', soloLectura);
			});
		});
	}

	editablePorEstado(estado?: string): boolean {
		return estado === 'DI';
	}

	puedeEditarDetalle(): boolean {
		return this.isForm() && this.editablePorEstado(this.model?.ESTADO_CONCILIACION);
	}

	override getPermiteEditar(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteEdit && this.editablePorEstado(data?.ESTADO_CONCILIACION);
	}

	override getPermiteDele(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteDele && this.editablePorEstado(data?.ESTADO_CONCILIACION);
	}

	hasConciliaKeys(): boolean {
		return this.model?.CORR_CONCILIACION > 0 && this.model?.CORR_CUENTA_BANCO > 0;
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.cargarDetalleTabs();
	}

	override editarClick(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (!this.editablePorEstado(rowData?.ESTADO_CONCILIACION)) {
			this.notifyFx('Solo se pueden modificar conciliaciones DIGITADAS.', NotifyType.Warning);
			return;
		}
		super.editarClick(e);
		this.cargarDetalleTabs();
		this.habilitar();
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.limpiarTabs();
		this.habilitar();
	}

	override focusedRowChanged(e: any): void {
		super.focusedRowChanged(e);
		if (this.isBrowse()) {
			this.cargarDetalleTabs();
		}
	}

	limpiarTabs(): void {
		this.detalles = [];
		this.pendientes = [];
		this.resumen = [];
		this.movimientos = [];
		this.detalleEditando = false;
		this.detalleEdicionExplicita = false;
	}

	cargarDetalleTabs(): void {
		if (!this.hasConciliaKeys()) {
			this.limpiarTabs();
			return;
		}

		this.consultarDetalles();
		this.consultarPendientes();
		this.consultarResumen();
		this.consultarMovi();
	}

	consultarDetalles(): void {
		this.detaService
			.getAll({
				CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO,
				CORR_CONCILIACION: this.model.CORR_CONCILIACION,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalles = response.Data || [];
						this.gridDetalleBanco?.instance?.refresh();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultarPendientes(): void {
		this.service
			.getPendientes(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.pendientes = response.Data || [];
						this.gridPendientes?.instance?.refresh();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultarResumen(): void {
		forkJoin({
			aumenta: this.service.getResumen(this.model, 1),
			disminuye: this.service.getResumen(this.model, -1),
		})
			.pipe(take(1))
			.subscribe({
				next: ({ aumenta, disminuye }: any) => {
					const rowsAumenta = (aumenta.Result ? aumenta.Data || [] : []).map((row: BanConciliaBancariaResumen) => ({
						...row,
						TIPO_RESUMEN: 'Aumenta',
					}));
					const rowsDisminuye = (disminuye.Result ? disminuye.Data || [] : []).map((row: BanConciliaBancariaResumen) => ({
						...row,
						TIPO_RESUMEN: 'Disminuye',
					}));
					this.resumen = [...rowsAumenta, ...rowsDisminuye];
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	consultarMovi(): void {
		this.service
			.getMovi(this.model)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.movimientos = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	refrescarBotones(): void {
		if (this.banderaMtto !== UpdateType.Browse && this.hasConciliaKeys()) {
			this.btnAplicar = this.model.ESTADO_CONCILIACION === 'DI' ? 'Aplicar' : '';
			this.btnDesAplicar = this.model.ESTADO_CONCILIACION === 'AP' ? 'Des-Aplicar' : '';
			this.btnGenerar = this.model.ESTADO_CONCILIACION === 'DI' ? 'Generar' : '';
			this.btnReconstruir = this.model.ESTADO_CONCILIACION === 'DI' ? 'Reconstruir' : '';
			this.btnImportar = this.model.ESTADO_CONCILIACION === 'DI' ? 'Importar Excel' : '';
		} else {
			this.btnAplicar = '';
			this.btnDesAplicar = '';
			this.btnGenerar = '';
			this.btnReconstruir = '';
			this.btnImportar = '';
		}
	}

	importarExcelClick(): void {
		if (!this.puedeEditarDetalle()) {
			this.notifyFx('Solo se puede importar en conciliaciones DIGITADAS.', NotifyType.Warning);
			return;
		}
		this.excelInput?.nativeElement?.click();
	}

	async onExcelSelected(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) {
			return;
		}

		const cuenta = this.mCORR_CUENTA_BANCO?.find(
			(row: any) => row.CORR_CUENTA_BANCO === this.model?.CORR_CUENTA_BANCO
		);
		const claseBanco = cuenta?.CLASE_BANCO ?? '';
		const corrBanco = cuenta?.CORR_BANCO ?? 0;
		if (!claseBanco || !corrBanco) {
			this.notifyFx('No se pudo determinar el banco de la cuenta seleccionada.', NotifyType.Error);
			return;
		}

		this.loadingVisible = true;
		try {
			const rows = await parseBanConciliaExcel(file, claseBanco);
			if (!rows.length) {
				this.notifyFx('El archivo no contiene movimientos válidos.', NotifyType.Warning);
				return;
			}

			const importar = () => {
				this.service
					.importarExcel({
						CORR_EMPRESA: this.model.CORR_EMPRESA,
						CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO,
						CORR_CONCILIACION: this.model.CORR_CONCILIACION,
						CORR_BANCO: corrBanco,
						Rows: rows,
					})
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							this.loadingVisible = false;
							if (response.Result) {
								this.notifyFx('Movimientos importados con éxito.', NotifyType.Success);
								this.cargarDetalleTabs();
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

			if (this.hasConciliaKeys()) {
				importar();
			} else {
				this.guardarEncabezadoParaDetalle(importar, () => {
					this.loadingVisible = false;
				});
			}
		} catch (error: any) {
			this.loadingVisible = false;
			this.notifyFx(error?.message ?? error, NotifyType.Error);
		}
	}

	ejecutarProceso(accion: () => any, mensajeOk: string): void {
		if (!this.hasConciliaKeys()) {
			this.notifyFx('Debe guardar la conciliación antes de ejecutar este proceso.', NotifyType.Warning);
			return;
		}
		this.loadingVisible = true;
		accion()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						if (response.Data?.ESTADO_CONCILIACION) {
							this.model = this.fillData(response.Data);
							this.modelUpdate = this.fillData(this.model);
						}
						this.notifyFx(mensajeOk, NotifyType.Success);
						this.cargarDetalleTabs();
						this.habilitar();
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

	aplicarConciliacion(): void {
		this.ejecutarProceso(() => this.service.aplicar(this.model), 'Conciliación aplicada con éxito.');
	}

	desAplicarConciliacion(): void {
		this.ejecutarProceso(() => this.service.desAplicar(this.model), 'Conciliación des-aplicada con éxito.');
	}

	generarConciliacion(): void {
		this.ejecutarProceso(() => this.service.generarConciliacion(this.model), 'Conciliación generada con éxito.');
	}

	reconstruirMovimientos(): void {
		this.ejecutarProceso(() => this.service.reconstruirMovimientos(this.model), 'Movimientos reconstruidos con éxito.');
	}

	conciliarSeleccion(): void {
		const detaSel = this.gridDetalleBanco?.instance?.getSelectedRowsData()?.[0] as BanConciliaBancariaDeta;
		const pendSel = this.gridPendientes?.instance?.getSelectedRowsData()?.[0] as BanConciliaBancariaPendiente;
		if (!detaSel || !pendSel) {
			this.notifyFx('Seleccione un movimiento bancario y un pendiente contable.', NotifyType.Warning);
			return;
		}
		if (detaSel.ANIO_PERIODO) {
			this.notifyFx('El movimiento bancario seleccionado ya está conciliado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.forzarConciliacion({
				CORR_EMPRESA: this.model.CORR_EMPRESA,
				CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO,
				CORR_CONCILIACION: this.model.CORR_CONCILIACION,
				CORR_CONCILIACION_DETA: detaSel.CORR_CONCILIACION_DETA,
				ANIO_PERIODO: pendSel.ANIO_PERIODO,
				MES_PERIODO: pendSel.MES_PERIODO,
				CORR_CLASE_PARTIDA: pendSel.CORR_CLASE_PARTIDA,
				CORR_PARTIDA: pendSel.CORR_PARTIDA,
				CORR_PARTIDA_DETA: pendSel.CORR_PARTIDA_DETA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.notifyFx('Conciliación forzada con éxito.', NotifyType.Success);
						this.cargarDetalleTabs();
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

	revertirSeleccion(): void {
		const detaSel = this.gridDetalleBanco?.instance?.getSelectedRowsData()?.[0] as BanConciliaBancariaDeta;
		if (!detaSel) {
			this.notifyFx('Seleccione un movimiento bancario conciliado.', NotifyType.Warning);
			return;
		}
		if (!detaSel.ANIO_PERIODO) {
			this.notifyFx('El movimiento seleccionado no está conciliado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.revertirConciliacion({
				CORR_EMPRESA: this.model.CORR_EMPRESA,
				CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO,
				CORR_CONCILIACION: this.model.CORR_CONCILIACION,
				CORR_CONCILIACION_DETA: detaSel.CORR_CONCILIACION_DETA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.notifyFx('Conciliación revertida con éxito.', NotifyType.Success);
						this.cargarDetalleTabs();
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

	marcarSeleccion(): void {
		const pendSel = this.gridPendientes?.instance?.getSelectedRowsData()?.[0] as BanConciliaBancariaPendiente;
		if (!pendSel) {
			this.notifyFx('Seleccione un pendiente contable.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.marcarConciliado({
				CORR_EMPRESA: this.model.CORR_EMPRESA,
				ANIO_PERIODO: pendSel.ANIO_PERIODO,
				MES_PERIODO: pendSel.MES_PERIODO,
				CORR_CLASE_PARTIDA: pendSel.CORR_CLASE_PARTIDA,
				CORR_PARTIDA: pendSel.CORR_PARTIDA,
				CORR_PARTIDA_DETA: pendSel.CORR_PARTIDA_DETA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.notifyFx('Pendiente marcado como conciliado.', NotifyType.Success);
						this.cargarDetalleTabs();
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

	detalleEditable(row: BanConciliaBancariaDeta): boolean {
		return this.puedeEditarDetalle() && !row?.ANIO_PERIODO;
	}

	agregarDetalle(): void {
		if (!this.puedeEditarDetalle() || this.detalleEditando) {
			return;
		}
		this.detalleEdicionExplicita = true;
		this.gridDetalleBanco?.instance?.addRow();
	}

	editarDetalleClick(e: any): void {
		if (!this.detalleEditable(e.row?.data) || this.detalleEditando) {
			return;
		}
		this.detalleEdicionExplicita = true;
		e.component.editRow(e.row.rowIndex);
	}

	detalleEditButtonVisible(e: any): boolean {
		return this.detalleEditable(e.row?.data) && !e.row?.isEditing;
	}

	detalleDeleteButtonVisible(e: any): boolean {
		return this.detalleEditable(e.row?.data) && !e.row?.isEditing;
	}

	guardarDetalleEditado(): void {
		this.gridDetalleBanco?.instance?.saveEditData();
	}

	cancelarDetalleEditado(): void {
		const grid = this.gridDetalleBanco?.instance;
		if (!grid?.hasEditData()) {
			this.detalleEdicionExplicita = false;
			this.detalleEditando = false;
			return;
		}
		grid.cancelEditData();
	}

	detalleInitNewRow(e: any): void {
		e.data.FECHA_MOVIMIENTO = this.model?.FECHA_CONCILIACION || this.appInfoService.getDate();
		e.data.MONTO_CARGO = 0;
		e.data.MONTO_ABONO = 0;
		e.data.NUMERO_REFERENCIA_BANCO = '';
	}

	onDetalleEditingStart(e: any): void {
		if (!this.detalleEdicionExplicita) {
			e.cancel = true;
			return;
		}
		this.detalleEdicionExplicita = false;
		this.detalleEditando = true;
	}

	onDetalleSaved(_e: any): void {
		this.detalleEdicionExplicita = false;
		this.detalleEditando = false;
	}

	onDetalleEditCanceled(_e: any): void {
		this.detalleEdicionExplicita = false;
		this.detalleEditando = false;
	}

	detalleRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!data.CORR_TIPO_MOVIMIENTO) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar el tipo de movimiento';
			this.notifyFx(e.errorText, NotifyType.Warning);
			return;
		}
		const cargo = data.MONTO_CARGO || 0;
		const abono = data.MONTO_ABONO || 0;
		if (cargo <= 0 && abono <= 0) {
			e.isValid = false;
			e.errorText = 'Debe ingresar cargo o abono';
			this.notifyFx(e.errorText, NotifyType.Warning);
		}
	}

	private guardarEncabezadoParaDetalle(onSuccess: () => void, onCancel: () => void): void {
		if (this.hasConciliaKeys()) {
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
				() => accion().then(resolve).catch(reject),
				() => resolve(true)
			);
		});
	}

	private buildDetallePayload(data: any): BanConciliaBancariaDeta {
		return {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO,
			CORR_CONCILIACION: this.model.CORR_CONCILIACION,
			...data,
		} as BanConciliaBancariaDeta;
	}

	private guardarDetalleRemoto(data: any, esNuevo: boolean): Promise<boolean> {
		return new Promise((resolve) => {
			const deta = this.buildDetallePayload({ ...data });
			const operacion = esNuevo ? this.detaService.insert(deta) : this.detaService.update(deta);
			operacion.pipe(take(1)).subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalleEditando = false;
						this.detalleEdicionExplicita = false;
						this.consultarDetalles();
						this.consultarMovi();
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

	detalleRowInserting(e: any): void {
		if (!this.puedeEditarDetalle()) {
			e.cancel = true;
			return;
		}
		e.cancel = this.ejecutarDetalleConEncabezado(() => this.guardarDetalleRemoto(e.data, true));
	}

	detalleRowUpdating(e: any): void {
		if (!this.detalleEditable({ ...e.oldData, ...e.newData })) {
			e.cancel = true;
			return;
		}
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.guardarDetalleRemoto(data, false);
	}

	detalleRowRemoving(e: any): void {
		if (!this.detalleEditable(e.data)) {
			e.cancel = true;
			return;
		}
		e.cancel = new Promise((resolve) => {
			this.detaService
				.delete(this.buildDetallePayload(e.data))
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.consultarDetalles();
							this.consultarMovi();
							this.notifyFx('Línea eliminada con éxito.', NotifyType.Success);
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

	rowRemoving(e: any): void {
		if (!this.editablePorEstado(e.data?.ESTADO_CONCILIACION)) {
			e.cancel = true;
			this.notifyFx('Solo se pueden eliminar conciliaciones DIGITADAS.', NotifyType.Warning);
			return;
		}
		const removedKey = this.conciliaRowKey(e.data);
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(e.data),
			parchearGrid: false,
			reload: () => {
				this.models = (this.models || []).filter(
					(item: BanConciliaBancaria) => this.conciliaRowKey(item) !== removedKey
				);
			},
		});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCORR_CUENTA_BANCO(vRow: any): any {
		return vRow[0].CORR_CUENTA_BANCO;
	}

	selectedLookUpCORR_TIPO_MOVIMIENTO(vRow: any): any {
		return vRow[0].CORR_TIPO_MOVIMIENTO;
	}
}
