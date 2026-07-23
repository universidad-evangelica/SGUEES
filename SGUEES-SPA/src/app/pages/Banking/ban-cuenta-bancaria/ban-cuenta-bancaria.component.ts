import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanCuentaBancaria } from './models/ban-cuenta-bancaria';
import { BanCuentaBancariaService } from './ban-cuenta-bancaria.service';
import { BanCuentaBancariaChequeraService } from './ban-cuenta-bancaria-chequera/ban-cuenta-bancaria-chequera.service';
import { BanCuentaBancariaChequera } from './ban-cuenta-bancaria-chequera/models/ban-cuenta-bancaria-chequera';

@Component({
	selector: 'app-ban-cuenta-bancaria',
	templateUrl: './ban-cuenta-bancaria.component.html',
	styleUrls: ['./ban-cuenta-bancaria.component.scss'],
})
export class BanCuentaBancariaComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridChequera', { static: false }) gridChequera!: DxDataGridComponent;

	protected override etiquetaRegistro = 'la cuenta bancaria';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_CUENTA_BANCO';
	protected override mttoCampoEstado = 'ESTADO_CUENTA_BANCARIA';
	protected override mttoEstadoDescribeField = 'NOMBRE_CUENTA';

	chequeras: BanCuentaBancariaChequera[] = [];
	chequeraEditando = false;
	private chequeraEdicionExplicita = false;

	mCORR_BANCO: any;
	mTIPO_CUENTA_BANCO: any;
	mCLASE_CHEQUE: any;
	mCORR_CENTRO_COSTO: any;
	mCORR_MONEDA: any;
	mESTADO_CHEQUERA: any;
	mCUENTA_CONTABLE: any[] = [];
	cuentaLookupColumns: any[] = [
		{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
		{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre cuenta', width: 280 },
	];
	bancoLookupColumns: any[] = [
		{ dataField: 'CORR_BANCO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_BANCO', caption: 'Banco', width: 280 },
	];
	centroCostoLookupColumns: any[] = [
		{ dataField: 'CORR_CENTRO_COSTO', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_CENTRO', caption: 'Centro de costo', width: 280 },
	];
	monedaLookupColumns: any[] = [
		{ dataField: 'CORR_MONEDA', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_MONEDA', caption: 'Moneda', width: 200 },
	];
	readOnly = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private service: BanCuentaBancariaService,
		private chequeraService: BanCuentaBancariaChequeraService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.editarChequeraClick = this.editarChequeraClick.bind(this);
		this.chequeraEditButtonVisible = this.chequeraEditButtonVisible.bind(this);
		this.chequeraDeleteButtonVisible = this.chequeraDeleteButtonVisible.bind(this);
	}

	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}

	puedeEditarChequera(): boolean {
		return this.isForm() && !this.readOnly && !this.model?.NO_PERMITE_MODIFICAR && this.permiteEdit;
	}

	hasCuentaKeys(): boolean {
		return (this.model?.CORR_CUENTA_BANCO ?? 0) > 0;
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.chequeras = [];
			this.chequeraEditando = false;
			this.chequeraEdicionExplicita = false;
		}
	}

	llenaComboBox() {
		this.getCORR_BANCO();
		this.getTIPO_CUENTA_BANCO();
		this.getCLASE_CHEQUE();
		this.getCORR_CENTRO_COSTO();
		this.getCORR_MONEDA();
		this.getCUENTA_CONTABLE();
		this.getESTADO_CHEQUERA();
	}

	getESTADO_CHEQUERA() {
		this.appInfoService
			.getLookUp('BAN_CUENTA_BANCARIA', 'BAN_LISTA', 'GetESTADO_CHEQUERA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_CHEQUERA = response.Data;
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getCUENTA_CONTABLE() {
		this.appInfoService
			.getLookUp('BAN_CUENTA_BANCARIA', 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCUENTA_CONTABLE = response.Data;
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getCORR_BANCO() {
		this.appInfoService
			.getLookUp('BAN_CUENTA_BANCARIA', 'GEN_BANCO', 'GetCORR_BANCO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_BANCO = response.Data;
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getTIPO_CUENTA_BANCO() {
		this.appInfoService
			.getLookUp('BAN_CUENTA_BANCARIA', 'BAN_LISTA', 'GetTIPO_CUENTA_BANCO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mTIPO_CUENTA_BANCO = response.Data;
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getCLASE_CHEQUE() {
		this.appInfoService
			.getLookUp('BAN_CUENTA_BANCARIA', 'BAN_LISTA', 'GetCLASE_CHEQUE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_CHEQUE = response.Data;
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getCORR_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('BAN_CUENTA_BANCARIA', 'CON_CENTRO_COSTO', 'GetCORR_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getCORR_MONEDA() {
		this.appInfoService
			.getLookUp('BAN_CUENTA_BANCARIA', 'CON_PARAMETRO', 'GetCORR_MONEDA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_MONEDA = response.Data;
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	fillParam(xCORR_CUENTA_BANCO?: number): any {
		return { CORR_CUENTA_BANCO: xCORR_CUENTA_BANCO ?? 0 };
	}

	override fillData(xModel?: BanCuentaBancaria): BanCuentaBancaria {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_CUENTA_BANCO: xModel.CORR_CUENTA_BANCO,
				NUMERO_CUENTA_BANCO: xModel.NUMERO_CUENTA_BANCO,
				CORR_BANCO: xModel.CORR_BANCO,
				CUENTA_CONTABLE: xModel.CUENTA_CONTABLE,
				NOMBRE_REPORTE: xModel.NOMBRE_REPORTE,
				TIPO_CUENTA_BANCO: xModel.TIPO_CUENTA_BANCO,
				CORR_CENTRO_COSTO: xModel.CORR_CENTRO_COSTO,
				CORR_MONEDA: xModel.CORR_MONEDA,
				CODIGO_EMPRESARIAL: xModel.CODIGO_EMPRESARIAL,
				CODIGO_EMPRESARIAL_PROV: xModel.CODIGO_EMPRESARIAL_PROV,
				NO_PERMITE_MODIFICAR: xModel.NO_PERMITE_MODIFICAR,
				VALIDAR_SALDO: xModel.VALIDAR_SALDO,
				PAGA_PLANILLA: xModel.PAGA_PLANILLA,
				VALIDA_FECHA: xModel.VALIDA_FECHA,
				NOMBRE_CUENTA: xModel.NOMBRE_CUENTA,
				NO_PERMITE_CHEQUES: xModel.NO_PERMITE_CHEQUES,
				ESTADO_CUENTA_BANCARIA: xModel.ESTADO_CUENTA_BANCARIA,
				USA_TRANSACIONES_UNI: xModel.USA_TRANSACIONES_UNI,
				CLASE_CHEQUE: xModel.CLASE_CHEQUE,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_CUENTA_BANCO: 0,
			NUMERO_CUENTA_BANCO: '',
			CORR_BANCO: 0,
			CUENTA_CONTABLE: '',
			NOMBRE_REPORTE: '',
			TIPO_CUENTA_BANCO: 'CO',
			CORR_CENTRO_COSTO: 0,
			CORR_MONEDA: 0,
			CODIGO_EMPRESARIAL: '',
			CODIGO_EMPRESARIAL_PROV: '',
			NO_PERMITE_MODIFICAR: false,
			VALIDAR_SALDO: false,
			PAGA_PLANILLA: false,
			VALIDA_FECHA: false,
			NOMBRE_CUENTA: '',
			NO_PERMITE_CHEQUES: false,
			ESTADO_CUENTA_BANCARIA: true,
			USA_TRANSACIONES_UNI: false,
			CLASE_CHEQUE: '',
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
		this.chequeras = [];
		this.chequeraEditando = false;
		this.chequeraEdicionExplicita = false;
		this.readOnly = false;
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.consultarChequeras();
		this.readOnly = false;
	}

	override editarClick(e: any): void {
		super.editarClick(e);
		this.consultarChequeras();
		this.readOnly = false;
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_CUENTA_BANCO === this.modelUpdate.CORR_CUENTA_BANCO);
		this.chequeras = [];
		this.chequeraEditando = false;
		this.chequeraEdicionExplicita = false;
		this.readOnly = false;
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	consultarChequeras(): void {
		if (!this.hasCuentaKeys()) {
			this.chequeras = [];
			return;
		}

		this.chequeraService
			.getAll({ CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.chequeras = response.Data ?? [];
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	agregarChequera(): void {
		if (!this.puedeEditarChequera() || this.chequeraEditando) {
			return;
		}
		this.chequeraEdicionExplicita = true;
		const grid = this.gridChequera?.instance;
		if (!grid) {
			return;
		}
		grid.addRow();
		this.sincronizarEstadoEdicionChequera(grid);
	}

	editarChequeraClick(e: any): void {
		if (!this.puedeEditarChequera() || this.chequeraEditando) {
			return;
		}
		this.chequeraEdicionExplicita = true;
		e.component.editRow(e.row.rowIndex);
		this.sincronizarEstadoEdicionChequera(e.component);
	}

	private sincronizarEstadoEdicionChequera(grid: any): void {
		setTimeout(() => {
			if (grid?.hasEditData?.()) {
				this.chequeraEditando = true;
				this.cdr.detectChanges();
			}
		});
	}

	chequeraEditButtonVisible(e: any): boolean {
		return this.puedeEditarChequera() && !e.row?.isEditing;
	}

	chequeraDeleteButtonVisible(e: any): boolean {
		return this.puedeEditarChequera() && !e.row?.isEditing;
	}

	private refrescarGridChequera(): void {
		setTimeout(() => {
			this.gridChequera?.instance?.refresh();
			this.cdr.detectChanges();
		});
	}

	guardarChequeraEditada(): void {
		const grid = this.gridChequera?.instance;
		if (!grid || !this.chequeraEditando) {
			this.notifyFx('No hay una chequera en edición', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarChequeraEditada(): void {
		const grid = this.gridChequera?.instance;
		if (!grid?.hasEditData()) {
			this.chequeraEdicionExplicita = false;
			this.chequeraEditando = false;
			this.refrescarGridChequera();
			return;
		}
		grid.cancelEditData();
	}

	chequeraInitNewRow(e: any): void {
		e.data.CORR_CHEQUERA = 0;
		e.data.NUMERO_CHEQUE_INICIAL = 1;
		e.data.NUMERO_CHEQUE_FINAL = 1;
		e.data.NUMERO_CHEQUE_ACTUAL = 1;
		e.data.SERIE_CHEQUE = '';
		e.data.ESTADO_CHEQUERA = 'AC';
	}

	onChequeraEditorPreparing(e: any): void {
		if (e.parentType === 'commandColumn' && (e.name === 'save' || e.name === 'cancel')) {
			e.visible = false;
		}
	}

	onChequeraEditingStart(e: any): void {
		if (!this.chequeraEdicionExplicita) {
			e.cancel = true;
			return;
		}
		this.chequeraEdicionExplicita = false;
		this.chequeraEditando = true;
		this.cdr.detectChanges();
	}

	onChequeraSaved(_e: any): void {
		this.chequeraEdicionExplicita = false;
		this.chequeraEditando = false;
		this.refrescarGridChequera();
	}

	onChequeraEditCanceled(_e: any): void {
		this.chequeraEdicionExplicita = false;
		this.chequeraEditando = false;
		this.refrescarGridChequera();
	}

	chequeraRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!this.chequeraService.esValido(this.buildChequeraPayload(data), this.notifyFx.bind(this))) {
			e.isValid = false;
		}
	}

	private buildChequeraPayload(data: any): BanCuentaBancariaChequera {
		return {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			CORR_CUENTA_BANCO: this.model.CORR_CUENTA_BANCO,
			CORR_CHEQUERA: data.CORR_CHEQUERA ?? 0,
			NUMERO_CHEQUE_INICIAL: data.NUMERO_CHEQUE_INICIAL,
			NUMERO_CHEQUE_FINAL: data.NUMERO_CHEQUE_FINAL,
			NUMERO_CHEQUE_ACTUAL: data.NUMERO_CHEQUE_ACTUAL,
			SERIE_CHEQUE: data.SERIE_CHEQUE ?? '',
			ESTADO_CHEQUERA: data.ESTADO_CHEQUERA ?? 'AC',
		};
	}

	private guardarEncabezadoParaDetalle(onSuccess: () => void, onCancel: () => void): void {
		if (this.hasCuentaKeys()) {
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
						onSuccess();
					} else {
						this.notifyApiResponse(response);
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

	private ejecutarChequeraConEncabezado(accion: () => Promise<boolean>): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.guardarEncabezadoParaDetalle(
				() => {
					accion().then(resolve).catch(reject);
				},
				() => resolve(true)
			);
		});
	}

	private guardarChequeraRemoto(data: any, esNuevo: boolean): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const payload = this.buildChequeraPayload({ ...data });
			const operacion = esNuevo ? this.chequeraService.insert(payload) : this.chequeraService.update(payload);

			operacion.pipe(take(1)).subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.chequeraEditando = false;
						this.chequeraEdicionExplicita = false;
						this.consultarChequeras();
						this.refrescarGridChequera();
						resolve(false);
					} else {
						this.notifyApiResponse(response);
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

	chequeraRowInserting(e: any): void {
		if (!this.puedeEditarChequera()) {
			e.cancel = true;
			this.notifyFx('No se pueden modificar chequeras en este modo', NotifyType.Warning);
			return;
		}

		const isEmpty =
			!(e.data?.NUMERO_CHEQUE_INICIAL || 0) &&
			!(e.data?.NUMERO_CHEQUE_FINAL || 0) &&
			!(e.data?.NUMERO_CHEQUE_ACTUAL || 0) &&
			!e.data?.SERIE_CHEQUE;

		if (isEmpty) {
			e.cancel = true;
			return;
		}

		e.cancel = this.ejecutarChequeraConEncabezado(() => this.guardarChequeraRemoto(e.data, true));
	}

	chequeraRowUpdating(e: any): void {
		if (!this.puedeEditarChequera()) {
			e.cancel = true;
			this.notifyFx('No se pueden modificar chequeras en este modo', NotifyType.Warning);
			return;
		}

		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.ejecutarChequeraConEncabezado(() => this.guardarChequeraRemoto(data, false));
	}

	chequeraRowRemoving(e: any): void {
		if (!this.puedeEditarChequera()) {
			e.cancel = true;
			this.notifyFx('No se pueden modificar chequeras en este modo', NotifyType.Warning);
			return;
		}

		if (!this.hasCuentaKeys()) {
			e.cancel = true;
			return;
		}

		e.cancel = new Promise((resolve, reject) => {
			this.chequeraService
				.delete(this.buildChequeraPayload(e.data))
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.refrescarGridChequera();
							this.notifyFx('Chequera eliminada con éxito!', NotifyType.Success);
							resolve(false);
						} else {
							this.notifyApiResponse(response);
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

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_CUENTA_BANCO)),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_CUENTA_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_CUENTA_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CUENTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIPO_CUENTA_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_CHEQUE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_MONEDA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_REPORTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_EMPRESARIAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_EMPRESARIAL_PROV')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NO_PERMITE_MODIFICAR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('VALIDAR_SALDO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PAGA_PLANILLA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('VALIDA_FECHA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NO_PERMITE_CHEQUES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USA_TRANSACIONES_UNI')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_CUENTA_BANCARIA')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_CUENTA_BANCO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('ESTADO_CUENTA_BANCARIA')?.option('readOnly', false);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NUMERO_CUENTA_BANCO')?.focus();
		});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCORR_BANCO(vRow: any): any {
		return vRow[0].CORR_BANCO;
	}

	selectedLookUpCORR_CENTRO_COSTO(vRow: any): any {
		return vRow[0].CORR_CENTRO_COSTO;
	}

	selectedLookUpCORR_MONEDA(vRow: any): any {
		return vRow[0].CORR_MONEDA;
	}

	selectedLookUpCUENTA_CONTABLE(vRow: any): any {
		return vRow[0].CUENTA_CONTABLE;
	}
}
