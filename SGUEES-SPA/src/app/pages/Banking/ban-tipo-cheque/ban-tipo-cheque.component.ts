import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanTipoCheque } from './models/ban-tipo-cheque';
import { BanTipoChequeService } from './ban-tipo-cheque.service';

@Component({
	selector: 'app-ban-tipo-cheque',
	templateUrl: './ban-tipo-cheque.component.html',
})
export class BanTipoChequeComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el tipo de cheque';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_TIPO_CHEQUE';
	protected override mttoCampoEstado = 'ESTADO_TIPO_CHEQUE';
	protected override mttoEstadoDescribeField = 'NOMBRE_TIPO_CHEQUE';

	private readonly maintenanceSubtitulo = 'Mantenimiento de Tipos de Cheque';

	//#region <Declarando Variales>
	mCLASE_TIPO_CHEQUE: any;
	mCUENTA_CONTABLE: any[] = [];
	cuentaLookupColumns: any[] = [
		{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
		{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre cuenta', width: 280 },
	];
	readOnly = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanTipoChequeService
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
		this.getCLASE_TIPO_CHEQUE();
		this.getCUENTA_CONTABLE();
	}

	getCLASE_TIPO_CHEQUE() {
		this.appInfoService
			.getLookUp('BAN_TIPO_CHEQUE', 'BAN_LISTA', 'GetCLASE_TIPO_CHEQUE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_TIPO_CHEQUE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCUENTA_CONTABLE() {
		this.appInfoService
			.getLookUp('BAN_TIPO_CHEQUE', 'CON_CATALOGO_CUENTA', 'GetCUENTA_CONTABLE', undefined, environment.UrlCONTAAPI)
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
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_CHEQUE?: number): any {
		return {
			CORR_TIPO_CHEQUE: xCORR_TIPO_CHEQUE ?? 0,
		};
	}

	override fillData(xModel?: BanTipoCheque): BanTipoCheque {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_CHEQUE: xModel.CORR_TIPO_CHEQUE,
				NOMBRE_TIPO_CHEQUE: xModel.NOMBRE_TIPO_CHEQUE,
				CUENTA_CONTABLE: xModel.CUENTA_CONTABLE,
				CLASE_TIPO_CHEQUE: xModel.CLASE_TIPO_CHEQUE,
				CONTABILIZAR_LUEGO_DE_IMPRIMIR: xModel.CONTABILIZAR_LUEGO_DE_IMPRIMIR,
				ESTADO_TIPO_CHEQUE: xModel.ESTADO_TIPO_CHEQUE,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_TIPO_CHEQUE: 0,
			NOMBRE_TIPO_CHEQUE: '',
			CUENTA_CONTABLE: '',
			CLASE_TIPO_CHEQUE: '',
			CONTABILIZAR_LUEGO_DE_IMPRIMIR: true,
			ESTADO_TIPO_CHEQUE: true,
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
		super.cancelar((item: any) => item.CORR_TIPO_CHEQUE === this.modelUpdate.CORR_TIPO_CHEQUE);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_TIPO_CHEQUE)),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_CHEQUE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_CHEQUE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_TIPO_CHEQUE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CONTABILIZAR_LUEGO_DE_IMPRIMIR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_TIPO_CHEQUE')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_TIPO_CHEQUE')?.option('readOnly', true);
			this.dataForm.instance.getEditor('ESTADO_TIPO_CHEQUE')?.option('readOnly', false);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_CHEQUE')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpCUENTA_CONTABLE(vRow: any): any {
		return vRow[0].CUENTA_CONTABLE;
	}
}
