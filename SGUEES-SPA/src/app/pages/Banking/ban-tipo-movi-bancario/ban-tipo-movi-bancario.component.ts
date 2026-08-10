import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanTipoMoviBancario } from './models/ban-tipo-movi-bancario';
import { BanTipoMoviBancarioService } from './ban-tipo-movi-bancario.service';
import { BanTipoMoviSegunBanco } from './models/ban-tipo-movi-segun-banco';
import { BanTipoMoviSegunBancoService } from './ban-tipo-movi-segun-banco/ban-tipo-movi-segun-banco.service';

@Component({
	selector: 'app-ban-tipo-movi-bancario',
	templateUrl: './ban-tipo-movi-bancario.component.html',
})
export class BanTipoMoviBancarioComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridSegunBanco', { static: false }) gridSegunBanco!: DxDataGridComponent;

	protected override etiquetaRegistro = 'el tipo de movimiento';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_TIPO_MOVIMIENTO';
	protected override mttoCampoEstado = 'ESTADO_TIPO_MOVIMIENTO';
	protected override mttoEstadoDescribeField = 'NOMBRE_TIPO_MOVIMIENTO';

	//#region <Declarando Variales>
	mCORR_LINEA: any;
	mCORR_CLASE_PARTIDA: any;
	mSUMA_RESTA: any;
	mCLASE_MOVIMIENTO: any;
	mCUENTA_CONTABLE: any[] = [];
	mCORR_BANCO: any[] = [];
	segunBancoDetalle: BanTipoMoviSegunBanco[] = [];
	segunBancoEditando = false;
	segunBancoEdicionExplicita = false;
	segunBancoColumns: any[] = [];
	bancoLookupColumns: any[] = [
		{ dataField: 'CORR_BANCO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_BANCO', caption: 'Banco', width: 280 },
	];
	cuentaLookupColumns: any[] = [
		{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
		{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre cuenta', width: 280 },
	];
	lineaLookupColumns: any[] = [
		{ dataField: 'CORR_LINEA', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_LINEA_TRABAJO', caption: 'Línea', width: 280 },
	];
	clasePartidaLookupColumns: any[] = [
		{ dataField: 'CORR_CLASE_PARTIDA', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase partida', width: 280 },
	];
	readOnly = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanTipoMoviBancarioService,
		private segunBancoService: BanTipoMoviSegunBancoService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.segunBancoColumns = this.segunBancoService.getSegunBancoColumns();
		this.editarSegunBancoClick = this.editarSegunBancoClick.bind(this);
		this.segunBancoEditButtonVisible = this.segunBancoEditButtonVisible.bind(this);
		this.segunBancoDeleteButtonVisible = this.segunBancoDeleteButtonVisible.bind(this);
		this.bancoNombreDisplay = this.bancoNombreDisplay.bind(this);
		this.bancoSetCellValue = this.bancoSetCellValue.bind(this);
		this.selectedLookUpCORR_BANCO = this.selectedLookUpCORR_BANCO.bind(this);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
		}
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_LINEA();
		this.getCORR_CLASE_PARTIDA();
		this.getSUMA_RESTA();
		this.getCLASE_MOVIMIENTO();
		this.getCUENTA_CONTABLE();
		this.getCORR_BANCO();
	}

	getCORR_BANCO() {
		this.appInfoService
			.getLookUp('BAN_TIPO_MOVI_BANCARIO', 'GEN_BANCO', 'GetCORR_BANCO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_BANCO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCUENTA_CONTABLE() {
		this.appInfoService
			.getLookUp('BAN_TIPO_MOVI_BANCARIO', 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCUENTA_CONTABLE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_LINEA() {
		this.appInfoService
			.getLookUp('BAN_TIPO_MOVI_BANCARIO', 'BAN_LINEA_TRABAJO_CONCILIACION', 'GetCORR_LINEA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_LINEA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_CLASE_PARTIDA() {
		this.appInfoService
			.getLookUp('BAN_TIPO_MOVI_BANCARIO', 'CON_CLASE_PARTIDA', 'GetCORR_CLASE_PARTIDA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CLASE_PARTIDA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getSUMA_RESTA() {
		this.appInfoService
			.getLookUp('BAN_TIPO_MOVI_BANCARIO', 'BAN_LISTA', 'GetSUMA_RESTA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mSUMA_RESTA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCLASE_MOVIMIENTO() {
		this.appInfoService
			.getLookUp('BAN_TIPO_MOVI_BANCARIO', 'BAN_LISTA', 'GetCLASE_MOVIMIENTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_MOVIMIENTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_MOVIMIENTO?: number): any {
		return {
			CORR_TIPO_MOVIMIENTO: xCORR_TIPO_MOVIMIENTO ?? 0,
		};
	}

	override fillData(xModel?: BanTipoMoviBancario): BanTipoMoviBancario {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_MOVIMIENTO: xModel.CORR_TIPO_MOVIMIENTO,
				NOMBRE_TIPO_MOVIMIENTO: xModel.NOMBRE_TIPO_MOVIMIENTO,
				NOMBRE_TIPO_CORTO: xModel.NOMBRE_TIPO_CORTO,
				CORR_LINEA: xModel.CORR_LINEA,
				CORR_CLASE_PARTIDA: xModel.CORR_CLASE_PARTIDA,
				USA_CHEQUE_PROPIO: xModel.USA_CHEQUE_PROPIO,
				SUMA_RESTA: xModel.SUMA_RESTA,
				CLASE_MOVIMIENTO: xModel.CLASE_MOVIMIENTO,
				CUENTA_CONTABLE_GASTO: xModel.CUENTA_CONTABLE_GASTO,
				NOMBRE_REPORTE: xModel.NOMBRE_REPORTE,
				ESTADO_TIPO_MOVIMIENTO: xModel.ESTADO_TIPO_MOVIMIENTO,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_TIPO_MOVIMIENTO: 0,
			NOMBRE_TIPO_MOVIMIENTO: '',
			NOMBRE_TIPO_CORTO: '',
			CORR_LINEA: 0,
			CORR_CLASE_PARTIDA: 0,
			USA_CHEQUE_PROPIO: false,
			SUMA_RESTA: 1,
			CLASE_MOVIMIENTO: '',
			CUENTA_CONTABLE_GASTO: '',
			NOMBRE_REPORTE: '',
			ESTADO_TIPO_MOVIMIENTO: true,
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.segunBancoDetalle = [];
		this.segunBancoEditando = false;
		this.segunBancoEdicionExplicita = false;
	}

	override editarClick(e: any): void {
		super.editarClick(e);
		this.cargarSegunBanco();
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.cargarSegunBanco();
	}

	override focusedRowChanged(e: any): void {
		super.focusedRowChanged(e);
		if (this.isBrowse()) {
			this.cargarSegunBancoBrowse();
		}
	}

	cargarSegunBancoBrowse(): void {
		if (!this.model?.CORR_TIPO_MOVIMIENTO) {
			this.segunBancoDetalle = [];
			return;
		}
		this.segunBancoService
			.getAll(this.model.CORR_TIPO_MOVIMIENTO)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.segunBancoDetalle = response.Data || [];
					} else {
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	cargarSegunBanco(): void {
		if (!this.model?.CORR_TIPO_MOVIMIENTO) {
			this.segunBancoDetalle = [];
			return;
		}
		this.segunBancoService
			.getAll(this.model.CORR_TIPO_MOVIMIENTO)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.segunBancoDetalle = response.Data || [];
						this.gridSegunBanco?.instance?.refresh();
					} else {
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	puedeEditarSegunBanco(): boolean {
		return this.isForm() && !this.readOnly;
	}

	agregarSegunBanco(): void {
		if (!this.puedeEditarSegunBanco() || this.segunBancoEditando) {
			return;
		}
		const agregar = () => {
			this.segunBancoEdicionExplicita = true;
			const grid = this.gridSegunBanco?.instance;
			if (!grid) {
				return;
			}
			grid.addRow();
			this.sincronizarEstadoEdicionSegunBanco(grid);
		};
		if (this.model?.CORR_TIPO_MOVIMIENTO > 0) {
			agregar();
		} else {
			this.guardarEncabezadoParaSegunBanco(agregar, () => undefined);
		}
	}

	editarSegunBancoClick(e: any): void {
		if (!this.puedeEditarSegunBanco() || this.segunBancoEditando) {
			return;
		}
		this.segunBancoEdicionExplicita = true;
		e.component.editRow(e.row.rowIndex);
		this.sincronizarEstadoEdicionSegunBanco(e.component);
	}

	segunBancoEditButtonVisible(e: any): boolean {
		return this.puedeEditarSegunBanco() && !e.row?.isEditing;
	}

	segunBancoDeleteButtonVisible(e: any): boolean {
		return this.puedeEditarSegunBanco() && !e.row?.isEditing;
	}

	private sincronizarEstadoEdicionSegunBanco(grid: any): void {
		setTimeout(() => {
			if (grid?.hasEditData?.()) {
				this.segunBancoEditando = true;
				this.cdr.detectChanges();
			}
		});
	}

	private refrescarGridSegunBanco(): void {
		setTimeout(() => {
			this.gridSegunBanco?.instance?.refresh();
			this.cdr.detectChanges();
		});
	}

	guardarSegunBancoEditado(): void {
		const grid = this.gridSegunBanco?.instance;
		if (!grid || !this.segunBancoEditando) {
			this.notifyFx('No hay una línea en edición', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarSegunBancoEditado(): void {
		const grid = this.gridSegunBanco?.instance;
		if (!grid?.hasEditData()) {
			this.segunBancoEdicionExplicita = false;
			this.segunBancoEditando = false;
			this.refrescarGridSegunBanco();
			return;
		}
		grid.cancelEditData();
	}

	bancoNombreDisplay(row: BanTipoMoviSegunBanco): string {
		if (!row?.CORR_BANCO) {
			return '';
		}
		const banco = this.mCORR_BANCO?.find((item: any) => item.CORR_BANCO === row.CORR_BANCO);
		return banco?.NOMBRE_BANCO || row.NOMBRE_BANCO || '';
	}

	bancoSetCellValue(newData: any, value: any): void {
		newData.CORR_BANCO = value;
		const banco = this.mCORR_BANCO?.find((item: any) => item.CORR_BANCO === value);
		newData.NOMBRE_BANCO = banco?.NOMBRE_BANCO || '';
	}

	onSegunBancoEditingStart(e: any): void {
		if (!this.segunBancoEdicionExplicita) {
			e.cancel = true;
			return;
		}
		this.segunBancoEdicionExplicita = false;
		this.segunBancoEditando = true;
		this.cdr.detectChanges();
	}

	onSegunBancoSaved(_e: any): void {
		this.segunBancoEdicionExplicita = false;
		this.segunBancoEditando = false;
		this.refrescarGridSegunBanco();
	}

	onSegunBancoEditCanceled(_e: any): void {
		this.segunBancoEdicionExplicita = false;
		this.segunBancoEditando = false;
		this.refrescarGridSegunBanco();
	}

	private guardarEncabezadoParaSegunBanco(onSuccess: () => void, onCancel: () => void): void {
		if (this.model?.CORR_TIPO_MOVIMIENTO > 0) {
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
						this.model = this.fillData(response.Data);
						this.modelUpdate = this.fillData(this.model);
						this.AsignaStatus(UpdateType.Update);
						this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
						this.cargarSegunBanco();
						onSuccess();
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
						onCancel();
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
					onCancel();
				},
			});
	}

	private ejecutarSegunBancoConEncabezado(accion: () => Promise<boolean>): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.guardarEncabezadoParaSegunBanco(
				() => {
					accion().then(resolve).catch(reject);
				},
				() => resolve(true)
			);
		});
	}

	private guardarSegunBancoRemoto(data: any, esNuevo: boolean): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const operacion = esNuevo
				? this.segunBancoService.insert(this.buildSegunBancoPayload(data))
				: this.segunBancoService.update(this.buildSegunBancoPayload(data));

			operacion.pipe(take(1)).subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.segunBancoEditando = false;
						this.segunBancoEdicionExplicita = false;
						this.cargarSegunBanco();
						resolve(false);
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
						resolve(true);
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
					reject(error);
				},
			});
		});
	}

	segunBancoInitNewRow(e: any): void {
		e.data.CORR_EMPRESA = this.model.CORR_EMPRESA;
		e.data.CORR_TIPO_MOVIMIENTO = this.model.CORR_TIPO_MOVIMIENTO;
		e.data.CODIGO_MOVIMIENTO = '';
		e.data.NOMBRE_MOVIMIENTO_SEGUN_BANCO = '';
	}

	segunBancoRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!data.CORR_BANCO) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar el banco';
			this.notifyFx(e.errorText, NotifyType.Warning);
			return;
		}
		if (!data.CODIGO_MOVIMIENTO?.trim()) {
			e.isValid = false;
			e.errorText = 'Debe indicar el código del banco';
			this.notifyFx(e.errorText, NotifyType.Warning);
		}
	}

	private buildSegunBancoPayload(data: any): BanTipoMoviSegunBanco {
		const banco = this.mCORR_BANCO?.find((row: any) => row.CORR_BANCO === data.CORR_BANCO);
		return {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			CORR_TIPO_MOVIMIENTO: this.model.CORR_TIPO_MOVIMIENTO,
			CORR_BANCO: data.CORR_BANCO,
			NOMBRE_BANCO: banco?.NOMBRE_BANCO ?? data.NOMBRE_BANCO,
			CODIGO_MOVIMIENTO: data.CODIGO_MOVIMIENTO,
			NOMBRE_MOVIMIENTO_SEGUN_BANCO: data.NOMBRE_MOVIMIENTO_SEGUN_BANCO,
		};
	}

	segunBancoRowInserting(e: any): void {
		if (!this.puedeEditarSegunBanco()) {
			e.cancel = true;
			return;
		}
		if (!e.data?.CORR_BANCO && !e.data?.CODIGO_MOVIMIENTO?.trim()) {
			e.cancel = true;
			return;
		}
		e.cancel = this.ejecutarSegunBancoConEncabezado(() => this.guardarSegunBancoRemoto(e.data, true));
	}

	segunBancoRowUpdating(e: any): void {
		if (!this.puedeEditarSegunBanco()) {
			e.cancel = true;
			return;
		}
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.guardarSegunBancoRemoto(data, false);
	}

	segunBancoRowRemoving(e: any): void {
		if (!this.puedeEditarSegunBanco()) {
			e.cancel = true;
			return;
		}
		e.cancel = new Promise((resolve) => {
			this.segunBancoService
				.delete(this.buildSegunBancoPayload(e.data))
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.cargarSegunBanco();
							this.notifyFx('Registro eliminado con éxito.', NotifyType.Success);
							resolve(false);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
							resolve(true);
						}
					},
					error: (error: any) => {
						this.notifyApiError(error);
						resolve(true);
					},
				});
		});
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
			onSuccess: (_data: unknown, isAdd: boolean) => {
				if (isAdd) {
					this.cargarSegunBanco();
				}
			},
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_TIPO_MOVIMIENTO === this.modelUpdate.CORR_TIPO_MOVIMIENTO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_TIPO_MOVIMIENTO)),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_MOVIMIENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_MOVIMIENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_CORTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_LINEA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_CLASE_PARTIDA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USA_CHEQUE_PROPIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SUMA_RESTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_MOVIMIENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CUENTA_CONTABLE_GASTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_REPORTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_TIPO_MOVIMIENTO')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_TIPO_MOVIMIENTO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('ESTADO_TIPO_MOVIMIENTO')?.option('readOnly', false);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_MOVIMIENTO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpNumerico(vRow: any): any {
		return parseInt(vRow[0].Key, 10);
	}

	selectedLookUpCORR_LINEA(vRow: any): any {
		return vRow[0].CORR_LINEA;
	}

	selectedLookUpCORR_CLASE_PARTIDA(vRow: any): any {
		return vRow[0].CORR_CLASE_PARTIDA;
	}

	selectedLookUpCUENTA_CONTABLE(vRow: any): any {
		return vRow[0].CUENTA_CONTABLE;
	}

	selectedLookUpCORR_BANCO(vRow: any): any {
		return vRow[0].CORR_BANCO;
	}
}
