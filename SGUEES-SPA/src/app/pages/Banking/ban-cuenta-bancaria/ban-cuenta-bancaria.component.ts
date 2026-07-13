import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanCuentaBancaria } from './models/ban-cuenta-bancaria';
import { BanCuentaBancariaService } from './ban-cuenta-bancaria.service';

@Component({
	selector: 'app-ban-cuenta-bancaria',
	templateUrl: './ban-cuenta-bancaria.component.html',
})
export class BanCuentaBancariaComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'la cuenta bancaria';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_CUENTA_BANCO';
	protected override mttoCampoEstado = 'ESTADO_CUENTA_BANCARIA';
	protected override mttoEstadoDescribeField = 'NOMBRE_CUENTA';

	private readonly maintenanceSubtitulo = 'Mantenimiento de Cuentas Bancarias';

	//#region <Declarando Variales>
	mCORR_BANCO: any;
	mTIPO_CUENTA_BANCO: any;
	mCLASE_CHEQUE: any;
	mCORR_CENTRO_COSTO: any;
	mCORR_MONEDA: any;
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
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanCuentaBancariaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_BANCO();
		this.getTIPO_CUENTA_BANCO();
		this.getCLASE_CHEQUE();
		this.getCORR_CENTRO_COSTO();
		this.getCORR_MONEDA();
		this.getCUENTA_CONTABLE();
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
				error: (error: any) => {
					this.notifyApiError(error);
				},
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
				error: (error: any) => {
					this.notifyApiError(error);
				},
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
				error: (error: any) => {
					this.notifyApiError(error);
				},
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
				error: (error: any) => {
					this.notifyApiError(error);
				},
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
				error: (error: any) => {
					this.notifyApiError(error);
				},
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
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_CUENTA_BANCO?: number): any {
		return {
			CORR_CUENTA_BANCO: xCORR_CUENTA_BANCO ?? 0,
		};
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
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_CUENTA_BANCO === this.modelUpdate.CORR_CUENTA_BANCO);
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
	//#endregion

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
