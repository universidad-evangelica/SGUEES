import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConCentroCosto } from './models/con-centro-costo';
import { ConCentroCostoService } from './con-centro-costo.service';

@Component({
	selector: 'app-con-centro-costo',
	templateUrl: './con-centro-costo.component.html',
	styleUrls: ['./con-centro-costo.component.scss'],
})
export class ConCentroCostoComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConCentroCostoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	mCORR_TIPO_CENTRO_COSTO: any;
	mESTADO_CENTRO_COSTO: any;
	mCORR_UNIDAD_NEGOCIO: any;
	mCORR_AREA_FUNCIONAL: any;
	mCORR_EMPLEADO_JEFE: any;
	mCORR_CLIENTE: any;
	readOnly = false;
	// #endregion

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_TIPO_CENTRO_COSTO();
		this.getESTADO_CENTRO_COSTO();
		this.getCORR_UNIDAD_NEGOCIO();
		this.getCORR_AREA_FUNCIONAL();
		this.getCORR_EMPLEADO_JEFE();
		this.getCORR_CLIENTE();
	}

	getCORR_TIPO_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('CON_CENTRO_COSTO', 'ADP_TIPO_CENTRO_COSTO', 'GetCORR_TIPO_CENTRO_COSTO', undefined, environment.UrlCONTABILIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getESTADO_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('CON_CENTRO_COSTO', 'ADP_LISTA', 'GetESTADO_CENTRO_COSTO', undefined, environment.UrlCONTABILIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_UNIDAD_NEGOCIO() {
		this.appInfoService
			.getLookUp('CON_CENTRO_COSTO', 'ADP_UNIDAD_NEGOCIO', 'GetCORR_UNIDAD_NEGOCIO', undefined, environment.UrlCONTABILIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_UNIDAD_NEGOCIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_AREA_FUNCIONAL() {
		this.appInfoService
			.getLookUp('CON_CENTRO_COSTO', 'ADP_AREA_FUNCIONAL', 'GetCORR_AREA_FUNCIONAL', undefined, environment.UrlCONTABILIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_AREA_FUNCIONAL = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_EMPLEADO_JEFE() {
		this.appInfoService
			.getLookUp('CON_CENTRO_COSTO', 'ADP_EMPLEADO_JEFE', 'GetCORR_EMPLEADO_JEFE', undefined, environment.UrlCONTABILIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_EMPLEADO_JEFE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_CLIENTE() {
		this.appInfoService
			.getLookUp('CON_CENTRO_COSTO', 'ADP_CLIENTE', 'GetCORR_CLIENTE', undefined, environment.UrlCONTABILIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CLIENTE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_CENTRO_COSTO?: number): any {
		if (xCORR_CENTRO_COSTO == undefined) {
			xCORR_CENTRO_COSTO = 0;
		}
		return {
			CORR_CENTRO_COSTO: xCORR_CENTRO_COSTO,
		};
	}

	override fillData(xModel?: ConCentroCosto): ConCentroCosto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_CENTRO_COSTO: xModel.CORR_CENTRO_COSTO,
				NOMBRE_CENTRO: xModel.NOMBRE_CENTRO,
				CUENTA_CONTABLE: xModel.CUENTA_CONTABLE,
				CODIGO_CENTRO_COSTO: xModel.CODIGO_CENTRO_COSTO,
				CORR_TIPO_CENTRO_COSTO: xModel.CORR_TIPO_CENTRO_COSTO,
				NOMBRE_TIPO_CENTRO_COSTO: xModel.NOMBRE_TIPO_CENTRO_COSTO,
				CLASE_CENTRO_COSTO: xModel.CLASE_CENTRO_COSTO,
				ESTADO_CENTRO_COSTO: xModel.ESTADO_CENTRO_COSTO,
				NOMBRE_ESTADO_CENTRO_COSTO: xModel.NOMBRE_ESTADO_CENTRO_COSTO,
				CORR_CENTRO_COSTO_REPLICADO: xModel.CORR_CENTRO_COSTO_REPLICADO,
				CORR_UNIDAD_NEGOCIO: xModel.CORR_UNIDAD_NEGOCIO,
				NOMBRE_UNIDAD_NEGOCIO: xModel.NOMBRE_UNIDAD_NEGOCIO,
				CODIGO_UNIDAD_NEGOCIO: xModel.CODIGO_UNIDAD_NEGOCIO,
				CORR_AREA_FUNCIONAL: xModel.CORR_AREA_FUNCIONAL,
				NOMBRE_AREA_FUNCIONAL: xModel.NOMBRE_AREA_FUNCIONAL,
				CODIGO_TERMINACION: xModel.CODIGO_TERMINACION,
				CORR_EMPLEADO_JEFE: xModel.CORR_EMPLEADO_JEFE,
				NOMBRE_EMPLEADO: xModel.NOMBRE_EMPLEADO,
				CORR_CLIENTE: xModel.CORR_CLIENTE,
				FECHA_INICIAL: xModel.FECHA_INICIAL,
				FECHA_FINAL: xModel.FECHA_FINAL,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_CENTRO_COSTO: 0,
				NOMBRE_CENTRO: '',
				CUENTA_CONTABLE: '',
				CODIGO_CENTRO_COSTO: '',
				CORR_TIPO_CENTRO_COSTO: 0,
				NOMBRE_TIPO_CENTRO_COSTO: '',
				CLASE_CENTRO_COSTO: '',
				ESTADO_CENTRO_COSTO: '',
				NOMBRE_ESTADO_CENTRO_COSTO: '',
				CORR_CENTRO_COSTO_REPLICADO: '',
				CORR_UNIDAD_NEGOCIO: 0,
				NOMBRE_UNIDAD_NEGOCIO: '',
				CODIGO_UNIDAD_NEGOCIO: '',
				CORR_AREA_FUNCIONAL: 0,
				NOMBRE_AREA_FUNCIONAL: '',
				CODIGO_TERMINACION: '',
				CORR_EMPLEADO_JEFE: 0,
				NOMBRE_EMPLEADO: '',
				CORR_CLIENTE: 0,
				FECHA_INICIAL: new Date(),
				FECHA_FINAL: new Date(),
			};
		}
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
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.models.push(response.Data);
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
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
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.CORR_CENTRO_COSTO === response.Data.CORR_CENTRO_COSTO);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
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
		super.cancelar((item: any) => item.CORR_CENTRO_COSTO === this.modelUpdate.CORR_CENTRO_COSTO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_CENTRO_COSTO))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
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
		this.dataForm.instance.getEditor('CORR_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CENTRO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_UNIDAD_NEGOCIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_AREA_FUNCIONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_TERMINACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_EMPLEADO_JEFE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_CLIENTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_INICIAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_FINAL')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_CENTRO_COSTO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
