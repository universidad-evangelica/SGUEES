import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComTipoSoliCotiza } from './models/com-tipo-soli-cotiza';
import { ComTipoSoliCotizaService } from './com-tipo-soli-cotiza.service';

@Component({
	selector: 'app-com-tipo-soli-cotiza',
	templateUrl: './com-tipo-soli-cotiza.component.html',
	styleUrls: ['./com-tipo-soli-cotiza.component.scss'],
})
export class ComTipoSoliCotizaComponent extends CBaseComponent implements OnInit {

  //#region <Declarando Variales>
	mCLASE_SOLI_COTIZA: any;
	readOnly = false;
	// #endregion
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComTipoSoliCotizaService
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
		this.getCLASE_SOLI_COTIZA();
	}

	getCLASE_SOLI_COTIZA() {
		this.appInfoService
			.getLookUp('COM_TIPO_SOLI_COTIZA', 'COM_LISTA', 'GetCLASE_TIPO_SOLI_COTIZA', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_SOLI_COTIZA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_SOLI_COTIZA?: number): any {
		if (xCORR_TIPO_SOLI_COTIZA == undefined) {
			xCORR_TIPO_SOLI_COTIZA = 0;
		}
		return {
			CORR_TIPO_SOLI_COTIZA: xCORR_TIPO_SOLI_COTIZA,
		};
	}

	override fillData(xModel?: ComTipoSoliCotiza): ComTipoSoliCotiza {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_SOLI_COTIZA: xModel.CORR_TIPO_SOLI_COTIZA,
				NOMBRE_TIPO_SOLI_COTIZA: xModel.NOMBRE_TIPO_SOLI_COTIZA,
				CLASE_SOLI_COTIZA: xModel.CLASE_SOLI_COTIZA,
				NOMBRE_CLASE_SOLI_COTIZA: xModel.NOMBRE_CLASE_SOLI_COTIZA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_TIPO_SOLI_COTIZA: 0,
				NOMBRE_TIPO_SOLI_COTIZA: '',
				CLASE_SOLI_COTIZA: '',
				NOMBRE_CLASE_SOLI_COTIZA: '',
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
				USUARIO_ACTU: '',
				FECHA_ACTU: new Date(),
				ESTACION_ACTU: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_TIPO_SOLI_COTIZA === response.Data.CORR_TIPO_SOLI_COTIZA);
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
		super.cancelar((item: any) => item.CORR_TIPO_SOLI_COTIZA === this.modelUpdate.CORR_TIPO_SOLI_COTIZA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_TIPO_SOLI_COTIZA))
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
		this.dataForm.instance.getEditor('CORR_TIPO_SOLI_COTIZA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_SOLI_COTIZA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_SOLI_COTIZA')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_SOLI_COTIZA')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
