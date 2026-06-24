import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScTipoContratacion } from './models/sc-tipo-contratacion';
import { ScTipoContratacionService } from './sc-tipo-contratacion.service';
import { confirm } from 'devextreme/ui/dialog';

@Component({
	selector: 'app-sc-tipo-contratacion',
	templateUrl: './sc-tipo-contratacion.component.html',
	styleUrls: ['./sc-tipo-contratacion.component.scss'],
})
export class ScTipoContratacionComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScTipoContratacionService,
		private messageService: MessageService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		//seccion customButtons en options
		this.customButtons = [
			{
				//Reactivar
				hint: 'Reactivar registro',
				icon: 'refresh',
				stylingMode: 'text',

				visible: (e: any) =>
					e.row?.data?.ACTIVO === false,

				onClick: this.reactivar
			},

			{
				//Desactivar
				hint: 'Inactivar registro',
				icon: 'close',
				stylingMode: 'text',

				visible: (e: any) =>
					e.row?.data?.ACTIVO === true,

				onClick: this.desactivar
			}
		];
	}

	//#region <Declarando Variales>
	// #endregion
	//this para insertar otros iconos en options de la tabla
	customButtons: any[] = [];	

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
	}

	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_CONTRATACION?: number): any {
		if (xCORR_TIPO_CONTRATACION == undefined) {
			xCORR_TIPO_CONTRATACION = 0;
		}
		return {
			CORR_TIPO_CONTRATACION: xCORR_TIPO_CONTRATACION,
		};
	}

	override fillData(xModel?: ScTipoContratacion): ScTipoContratacion {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION,
				NOMBRE_TIPO_CONTRATACION: xModel.NOMBRE_TIPO_CONTRATACION,
				ES_PERMANENTE: xModel.ES_PERMANENTE,
				AREA_APLICADA: xModel.AREA_APLICADA,
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
				CORR_TIPO_CONTRATACION: 0,
				NOMBRE_TIPO_CONTRATACION: '',
				ES_PERMANENTE: false,
				AREA_APLICADA: '',
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
					//this.notifyFx(error, NotifyType.Error);
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
					this.loadingVisible = false;
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
							this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro creado con éxito!' });
						} else {
							//this.notifyFx(response.ErrorMessage, NotifyType.Error);
							this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						//this.notifyFx(error, NotifyType.Error);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_TIPO_CONTRATACION === response.Data.CORR_TIPO_CONTRATACION);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							//this.notifyFx('Registro modificado con exito!', NotifyType.Success);
							this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro modificado con éxito!' });
						} else {
							//this.notifyFx(response.ErrorMessage, NotifyType.Error);
							this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						//this.notifyFx(error, NotifyType.Error);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_TIPO_CONTRATACION === this.modelUpdate.CORR_TIPO_CONTRATACION);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_TIPO_CONTRATACION))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						//this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado con éxito!' });
						e.component.refresh();
						this.consultar();
					} else {
						e.cancel = true;
						//this.notifyFx(response.ErrorMessage, NotifyType.Error);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
					}
				},
				error: (error: any) => {
					e.cancel = true;
					//this.notifyFx(error, NotifyType.Error);
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_CONTRATACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_CONTRATACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_PERMANENTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('AREA_APLICADA')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_CONTRATACION')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	desactivar = (e: any) => {
		confirm('¿Está seguro que desea <b>inactivar</b> este registro?', 'Confirmación')
			.then((aceptar: boolean) => {
				if (!aceptar) {
					return;
				}
		this.service
			.desactivate(this.fillParam(e.row.data.CORR_TIPO_CONTRATACION))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						//this.notifyFx('Registro inactivado!', NotifyType.Success);
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro inactivado!' });
						this.consultar();          // ← refresca para que el icono desaparezca
				} else {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
				}
			},
				error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error }),
			});
		})
	}

	reactivar = (e: any) => {
		confirm('¿Está seguro que desea <b>reactivar</b> este registro?', 'Confirmación')
			.then((aceptar: boolean) => {
				if (!aceptar) {
					return;
				}					
			this.service
			.reactivate(this.fillParam(e.row.data.CORR_TIPO_CONTRATACION))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						//this.notifyFx('Registro reactivado!', NotifyType.Success);
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro reactivado!' });
						this.consultar();          // ← refresca para que el icono desaparezca
				} else {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
				}
			},
				error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error }),
			});
		})
	}
}
