import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComBanco } from './models/com-banco';
import { ComBancoService } from './com-banco.service';

@Component({
	selector: 'app-com-banco',
	templateUrl: './com-banco.component.html',
	styleUrls: ['./com-banco.component.scss'],
})
export class ComBancoComponent extends CBaseComponent implements OnInit {
	//#region <Declarando Variales>
	mCLASE_BANCO: any;
	readOnly = false;
	// #endregion

  constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComBancoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

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
		this.getCLASE_BANCO();
	}

	getCLASE_BANCO() {
		this.appInfoService
			.getLookUp('COM_BANCO', 'COM_LISTA', 'GetCLASE_BANCO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_BANCO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_BANCO?: number): any {
		if (xCORR_BANCO == undefined) {
			xCORR_BANCO = 0;
		}
		return {
			CORR_BANCO: xCORR_BANCO,
		};
	}

	override fillData(xModel?: ComBanco): ComBanco {
		if (xModel !== undefined) {
			return {
				CORR_BANCO: xModel.CORR_BANCO,
				NOMBRE_BANCO: xModel.NOMBRE_BANCO,
				NOMBRE_BANCO_CORTO: xModel.NOMBRE_BANCO_CORTO,
				CLASE_BANCO: xModel.CLASE_BANCO,
				CODIGO_TRANSACION_UNI: xModel.CODIGO_TRANSACION_UNI,
			};
		} else {
			return {
				CORR_BANCO: 0,
				NOMBRE_BANCO: '',
				NOMBRE_BANCO_CORTO: '',
				CLASE_BANCO: '',
				CODIGO_TRANSACION_UNI: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_BANCO === response.Data.CORR_BANCO);
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
		super.cancelar((item: any) => item.CORR_BANCO === this.modelUpdate.CORR_BANCO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_BANCO))
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
		this.dataForm.instance.getEditor('CORR_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_BANCO_CORTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_TRANSACION_UNI')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_BANCO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
