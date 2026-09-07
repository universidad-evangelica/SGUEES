import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScTipoEntrevista } from './models/sc-tipo-entrevista';
import { ScTipoEntrevistaService } from './sc-tipo-entrevista.service';

@Component({
	selector: 'app-sc-tipo-entrevista',
	templateUrl: './sc-tipo-entrevista.component.html',
	styleUrls: ['./sc-tipo-entrevista.component.scss'],
})
export class ScTipoEntrevistaComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScTipoEntrevistaService,
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
		this.subTituloVentana = 'Mantenimiento de Tipo Entrevista';
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
	}

	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_ENTREVISTA?: number): any {
		if (xCORR_TIPO_ENTREVISTA == undefined) {
			xCORR_TIPO_ENTREVISTA = 0;
		}
		return {
			CORR_TIPO_ENTREVISTA: xCORR_TIPO_ENTREVISTA,
		};
	}

	override fillData(xModel?: ScTipoEntrevista): ScTipoEntrevista {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_ENTREVISTA: xModel.CORR_TIPO_ENTREVISTA,
				TIPO_ENTREVISTA: xModel.TIPO_ENTREVISTA,
				DESCRIPCION_ENTREVISTA: xModel.DESCRIPCION_ENTREVISTA,
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
				CORR_TIPO_ENTREVISTA: 0,
				TIPO_ENTREVISTA: '',
				DESCRIPCION_ENTREVISTA: '',
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
					console.log(error);
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
							this.messageService.add({
								severity: 'success',
								summary: 'Éxito',
								detail: 'Registro creado con éxito!'
							});
						} else {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: response.ErrorMessage
							});
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_TIPO_ENTREVISTA === response.Data.CORR_TIPO_ENTREVISTA);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.messageService.add({
								severity: 'success',
								summary: 'Éxito',
								detail: 'Registro modificado con éxito!'
							});
						} else {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: response.ErrorMessage
							});
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
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
		super.cancelar((item: any) => item.CORR_TIPO_ENTREVISTA === this.modelUpdate.CORR_TIPO_ENTREVISTA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_TIPO_ENTREVISTA))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.messageService.add({
							severity: 'success',
							summary: 'Éxito',
							detail: 'Registro eliminado con éxito!'
						});
						e.component.refresh();
					} else {
						e.cancel = true;
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: response.ErrorMessage
						});
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error
					});
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_ENTREVISTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIPO_ENTREVISTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION_ENTREVISTA')?.option('readOnly', true);
	}

	override habilitar(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_ENTREVISTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIPO_ENTREVISTA')?.option('readOnly', false);
		this.dataForm.instance.getEditor('DESCRIPCION_ENTREVISTA')?.option('readOnly', false);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('TIPO_ENTREVISTA')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
