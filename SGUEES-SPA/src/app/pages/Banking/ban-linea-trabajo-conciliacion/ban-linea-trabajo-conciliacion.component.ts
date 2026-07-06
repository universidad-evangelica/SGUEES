import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanLineaTrabajoConciliacion } from './models/ban-linea-trabajo-conciliacion';
import { BanLineaTrabajoConciliacionService } from './ban-linea-trabajo-conciliacion.service';

@Component({
	selector: 'app-ban-linea-trabajo-conciliacion',
	templateUrl: './ban-linea-trabajo-conciliacion.component.html',
	styleUrls: ['./ban-linea-trabajo-conciliacion.component.scss'],
})
export class BanLineaTrabajoConciliacionComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanLineaTrabajoConciliacionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	mAUMENTA_DISMINUYE: any;
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
		this.getAUMENTA_DISMINUYE();
	}

	getAUMENTA_DISMINUYE() {
		this.appInfoService
			.getLookUp('BAN_LINEA_TRABAJO_CONCILIACION', 'BAN_LISTA', 'GetAUMENTA_DISMINUYE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mAUMENTA_DISMINUYE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_LINEA?: number): any {
		if (xCORR_LINEA == undefined) {
			xCORR_LINEA = 0;
		}
		return {
			CORR_LINEA: xCORR_LINEA,
		};
	}

	override fillData(xModel?: BanLineaTrabajoConciliacion): BanLineaTrabajoConciliacion {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_LINEA: xModel.CORR_LINEA,
				NOMBRE_LINEA_TRABAJO: xModel.NOMBRE_LINEA_TRABAJO,
				AUMENTA_DISMINUYE: xModel.AUMENTA_DISMINUYE,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_LINEA: 0,
				NOMBRE_LINEA_TRABAJO: '',
				AUMENTA_DISMINUYE: 1,
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_LINEA === response.Data.CORR_LINEA);
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
		super.cancelar((item: any) => item.CORR_LINEA === this.modelUpdate.CORR_LINEA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_LINEA))
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
		this.dataForm.instance.getEditor('CORR_LINEA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_LINEA_TRABAJO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('AUMENTA_DISMINUYE')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_LINEA')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_LINEA_TRABAJO')?.focus();
		});
	}
	//#endregion

	selectedLookUpNumerico(vRow: any): any {
		return parseInt(vRow[0].Key, 10);
	}
}
