import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScTipoModalidad } from './models/sc-tipo-modalidad';
import { ScTipoModalidadService } from './sc-tipo-modalidad.service';

@Component({
	selector: 'app-sc-tipo-modalidad',
	templateUrl: './sc-tipo-modalidad.component.html',
	styleUrls: ['./sc-tipo-modalidad.component.scss'],
})
export class ScTipoModalidadComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScTipoModalidadService,
		private messageService: MessageService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	// #endregion

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
		this.subTituloVentana = 'Mantenimiento de Tipo Modalidad'; //Esto es quemado por componente, ya que no existe en la tabla
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
	}

	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_MODALIDAD?: number): any {
		if (xCORR_TIPO_MODALIDAD == undefined) {
			xCORR_TIPO_MODALIDAD = 0;
		}
		return {
			CORR_TIPO_MODALIDAD: xCORR_TIPO_MODALIDAD,
		};
	}

	override fillData(xModel?: ScTipoModalidad): ScTipoModalidad {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_MODALIDAD: xModel.CORR_TIPO_MODALIDAD,
				MODALIDAD_NOMBRE: xModel.MODALIDAD_NOMBRE,
				MODALIDAD_DESCRIPCION: xModel.MODALIDAD_DESCRIPCION,
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
				CORR_TIPO_MODALIDAD: 0,
				MODALIDAD_NOMBRE: '',
				MODALIDAD_DESCRIPCION: '',
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
}
