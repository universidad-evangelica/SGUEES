import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanTipoMoviBancario } from './models/ban-tipo-movi-bancario';
import { BanTipoMoviBancarioService } from './ban-tipo-movi-bancario.service';

@Component({
	selector: 'app-ban-tipo-movi-bancario',
	templateUrl: './ban-tipo-movi-bancario.component.html',
})
export class BanTipoMoviBancarioComponent extends CBaseComponent implements OnInit {
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
		private service: BanTipoMoviBancarioService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {		}
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_LINEA();
		this.getCORR_CLASE_PARTIDA();
		this.getSUMA_RESTA();
		this.getCLASE_MOVIMIENTO();
		this.getCUENTA_CONTABLE();
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
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
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
}
