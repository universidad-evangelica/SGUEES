import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConTipoCentroCosto } from './models/con-tipo-centro-costo';
import { ConTipoCentroCostoService } from './con-tipo-centro-costo.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-tipo-centro-costo',
	templateUrl: './con-tipo-centro-costo.component.html',
	styleUrls: ['./con-tipo-centro-costo.component.scss'],
})
export class ConTipoCentroCostoComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConTipoCentroCostoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	mCLASE_CENTRO_COSTO: any;
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
		this.getCLASE_CENTRO_COSTO();
	}

	getCLASE_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('CON_TIPO_CENTRO_COSTO', 'CON_LISTA', 'GetCLASE_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_CENTRO_COSTO?: number): any {
		if (xCORR_TIPO_CENTRO_COSTO == undefined) {
			xCORR_TIPO_CENTRO_COSTO = 0;
		}
		return {
			CORR_TIPO_CENTRO_COSTO: xCORR_TIPO_CENTRO_COSTO,
		};
	}

	override fillData(xModel?: ConTipoCentroCosto): ConTipoCentroCosto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_CENTRO_COSTO: xModel.CORR_TIPO_CENTRO_COSTO,
				NOMBRE_TIPO_CENTRO_COSTO: xModel.NOMBRE_TIPO_CENTRO_COSTO,
				CLASE_CENTRO_COSTO: xModel.CLASE_CENTRO_COSTO,
			};
		} else {
			return {
				CORR_EMPRESA: 0,
				CORR_TIPO_CENTRO_COSTO: 0,
				NOMBRE_TIPO_CENTRO_COSTO: '',
				CLASE_CENTRO_COSTO: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_TIPO_CENTRO_COSTO === response.Data.CORR_TIPO_CENTRO_COSTO);
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
		super.cancelar((item: any) => item.CORR_TIPO_CENTRO_COSTO === this.modelUpdate.CORR_TIPO_CENTRO_COSTO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_TIPO_CENTRO_COSTO))
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
		this.dataForm.instance.getEditor('CORR_TIPO_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_CENTRO_COSTO')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_TIPO_CENTRO_COSTO')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_CENTRO_COSTO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
