import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScRequisicionObservadores } from './models/sc-requisicion-observadores';
import { ScRequisicionObservadoresService } from './sc-requisicion-observadores.service';

@Component({
	selector: 'app-sc-requisicion-observadores',
	templateUrl: './sc-requisicion-observadores.component.html',
	styleUrls: ['./sc-requisicion-observadores.component.scss'],
})
export class ScRequisicionObservadoresComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRequisicionObservadoresService,
		private messageService: MessageService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	readOnly = false;
	mLOGIN_SISTEMA: any[] = [];

	loginSistemaLookupColumns: any[] = [
		{ dataField: 'LOGIN_SISTEMA', caption: 'Login Sistema', width: 120 },
		{ dataField: 'NOMBRE_USUARIO', caption: 'Nombre Usuario', width: 250 },
	];
	// #endregion

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
		this.subTituloVentana = 'Mantenimiento de Requisicion Observadores'; //Esto es quemado por componente, ya que no existe en la tabla
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getLOGIN_SISTEMA();
	}

	//#endregion

	//listado de catalogos
	getLOGIN_SISTEMA(){
		this.appInfoService
		.getLookUp('SC_REQUISICION_OBSERVADORES', 'SEG_USUARIO', 'GetLOGIN_SISTEMA', undefined, environment.UrlSEGURIDADAPI)
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.mLOGIN_SISTEMA = response.Data;
				}
			},
			error: (error: any) => {
				console.log(error);
				this.notifyFx(error, NotifyType.Error);
				//this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}

	//#region <Metodos Mtto>
	fillParam(xCORR_REQUISICION_OBSERVADORES?: number): any {
		if (xCORR_REQUISICION_OBSERVADORES == undefined) {
			xCORR_REQUISICION_OBSERVADORES = 0;
		}
		return {
			CORR_REQUISICION_OBSERVADORES: xCORR_REQUISICION_OBSERVADORES,
		};
	}

	override fillData(xModel?: ScRequisicionObservadores): ScRequisicionObservadores {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_REQUISICION_PERSONAL: xModel.CORR_REQUISICION_PERSONAL,
				CORR_REQUISICION_OBSERVADORES: xModel.CORR_REQUISICION_OBSERVADORES,
				LOGIN_SISTEMA: xModel.LOGIN_SISTEMA,
				TIPO_OBSERVADOR: xModel.TIPO_OBSERVADOR,
				FECHA_ASIGNACION: xModel.FECHA_ASIGNACION,
				ACTIVO: xModel.ACTIVO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_REQUISICION_PERSONAL: 0,
				CORR_REQUISICION_OBSERVADORES: 0,
				LOGIN_SISTEMA: '',
				TIPO_OBSERVADOR: '',
				FECHA_ASIGNACION: new Date(),
				ACTIVO: true,
				USUARIO_CREA: '',
				ESTACION_CREA: '',
				FECHA_CREA: new Date(),
				USUARIO_ACTU: '',
				ESTACION_ACTU: '',
				FECHA_ACTU: new Date(),
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
					console.log(error)
					//this.notifyFx(error, NotifyType.Error);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error
					});
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
							//this.notifyFx('Registro creado con exito!', NotifyType.Success);
							this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: 'Registro creado con exito!'
					});
						} else {
							//this.notifyFx(response.ErrorMessage, NotifyType.Error);
							this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: response.ErrorMessage
					});
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						//this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
						this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error
					});
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_TIPO_MODALIDAD === response.Data.CORR_TIPO_MODALIDAD);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							//this.notifyFx('Registro modificado con exito!', NotifyType.Success);
							this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: 'Registro modificado con exito!'
					});
						} else {
							//this.notifyFx(response.ErrorMessage, NotifyType.Error);
							this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: response.ErrorMessage
					});
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						//this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
						this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error
					});
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_TIPO_MODALIDAD === this.modelUpdate.CORR_TIPO_MODALIDAD);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_TIPO_MODALIDAD))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						//this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: 'Registro eliminado con exito!'
					});
						e.component.refresh();
					} else {
						e.cancel = true;
						//this.notifyFx(response.ErrorMessage, NotifyType.Error);
						this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: response.ErrorMessage
					});
					}
				},
				error: (error: any) => {
					e.cancel = true;
					//this.notifyFx(error, NotifyType.Error);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error
					});
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_MODALIDAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MODALIDAD_NOMBRE')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('MODALIDAD_NOMBRE')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpLOGIN_SISTEMA(vRow: any): any {
		return vRow[0].LOGIN_SISTEMA;
	}
}
