import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComCuadroComparativoConfigAutorizaciones } from './models/com-cuadro-comparativo-config-autorizaciones';
import { ComCuadroComparativoConfigAutorizacionesService } from './com-cuadro-comparativo-config-autorizaciones.service';

@Component({
	selector: 'app-com-cuadro-comparativo-config-autorizaciones',
	templateUrl: './com-cuadro-comparativo-config-autorizaciones.component.html',
	styleUrls: ['./com-cuadro-comparativo-config-autorizaciones.component.scss'],
})
export class ComCuadroComparativoConfigAutorizacionesComponent extends CBaseComponent implements OnInit {

  //#region <Declarando Variales>
	mCLASE_AUTORIZACION: any;
	readOnly = false;
  mSEG_USUARIO: any;
	// #endregion

  constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComCuadroComparativoConfigAutorizacionesService
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
		this.getCLASE_AUTORIZACION();
    this.getUSUARIOS();
	}

	getCLASE_AUTORIZACION() {
		this.appInfoService
			.getLookUp('COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONES', 'GEN_LISTA', 'GetCLASE_AUTORIZACION', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_AUTORIZACION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getUSUARIOS() {
		this.appInfoService
			.getLookUp('COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONES', 'SEG_USUARIO', 'GetUSUARIOS', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mSEG_USUARIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_CONFIGURACION?: number): any {
		if (xCORR_CONFIGURACION == undefined) {
			xCORR_CONFIGURACION = 0;
		}
		return {
			CORR_CONFIGURACION: xCORR_CONFIGURACION,
		};
	}

	override fillData(xModel?: ComCuadroComparativoConfigAutorizaciones): ComCuadroComparativoConfigAutorizaciones {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_CONFIGURACION: xModel.CORR_CONFIGURACION,
				LOGIN_SISTEMA: xModel.LOGIN_SISTEMA,
				NOMBRE_CARGO: xModel.NOMBRE_CARGO,
				MONTO_INICIAL: xModel.MONTO_INICIAL,
				MONTO_FINAL: xModel.MONTO_FINAL,
				CLASE_AUTORIZACION: xModel.CLASE_AUTORIZACION,
				ORDEN_REVISION: xModel.ORDEN_REVISION,
				PERMITE_MODIFICAR: xModel.PERMITE_MODIFICAR,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_CONFIGURACION: 0,
				LOGIN_SISTEMA: '',
				NOMBRE_CARGO: '',
				MONTO_INICIAL: 0,
				MONTO_FINAL: 0,
				CLASE_AUTORIZACION: '',
				ORDEN_REVISION: 0,
				PERMITE_MODIFICAR: true,
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_CONFIGURACION === response.Data.CORR_CONFIGURACION);
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
		super.cancelar((item: any) => item.CORR_CONFIGURACION === this.modelUpdate.CORR_CONFIGURACION);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_CONFIGURACION))
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
		this.dataForm.instance.getEditor('CORR_CONFIGURACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('LOGIN_SISTEMA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CARGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_INICIAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_FINAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_AUTORIZACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ORDEN_REVISION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PERMITE_MODIFICAR')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_CONFIGURACION')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
  selectedLookUpSEG_USUARIO(vRow: any): any {
		return vRow[0].LOGIN_SISTEMA;
	}
}
