import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConGerencia } from './models/con-gerencia';
import { ConGerenciaService } from './con-gerencia.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-gerencia',
	templateUrl: './con-gerencia.component.html',
	styleUrls: ['./con-gerencia.component.scss'],
})
export class ConGerenciaComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConGerenciaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
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
	llenaComboBox() {}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_GERENCIA?: number): any {
		if (xCORR_GERENCIA == undefined) {
			xCORR_GERENCIA = 0;
		}
		return {
			CORR_GERENCIA: xCORR_GERENCIA,
		};
	}

	override fillData(xModel?: ConGerencia): ConGerencia {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_DIVISION: xModel.CORR_DIVISION,
				CORR_GERENCIA: xModel.CORR_GERENCIA,
				NOMBRE_GERENCIA: xModel.NOMBRE_GERENCIA,
				CODIGO_GERENCIA: xModel.CODIGO_GERENCIA,
			};
		} else {
			return {
				CORR_EMPRESA: 0,
				CORR_DIVISION: 0,
				CORR_GERENCIA: 0,
				NOMBRE_GERENCIA: '',
				CODIGO_GERENCIA: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_GERENCIA === response.Data.CORR_GERENCIA);
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
		super.cancelar((item: any) => item.CORR_GERENCIA === this.modelUpdate.CORR_GERENCIA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_GERENCIA))
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
		this.dataForm.instance.getEditor('CORR_DIVISION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_GERENCIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_GERENCIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_GERENCIA')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_GERENCIA')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_GERENCIA')?.focus();
		});
	}
	//#endregion
}
