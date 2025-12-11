import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConAreaFuncional } from './models/con-area-funcional';
import { ConAreaFuncionalService } from './con-area-funcional.service';

@Component({
	selector: 'app-con-area-funcional',
	templateUrl: './con-area-funcional.component.html',
	styleUrls: ['./con-area-funcional.component.scss'],
})
export class ConAreaFuncionalComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConAreaFuncionalService
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
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
	}

	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_AREA_FUNCIONAL?: number): any {
		if (xCORR_AREA_FUNCIONAL == undefined) {
			xCORR_AREA_FUNCIONAL = 0;
		}
		return {
			CORR_AREA_FUNCIONAL: xCORR_AREA_FUNCIONAL,
		};
	}

	override fillData(xModel?: ConAreaFuncional): ConAreaFuncional {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_AREA_FUNCIONAL: xModel.CORR_AREA_FUNCIONAL,
				NOMBRE_AREA_FUNCIONAL: xModel.NOMBRE_AREA_FUNCIONAL,
				CODIGO_AREA_FUNCIONAL: xModel.CODIGO_AREA_FUNCIONAL,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_AREA_FUNCIONAL: 0,
				NOMBRE_AREA_FUNCIONAL: '',
				CODIGO_AREA_FUNCIONAL: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_AREA_FUNCIONAL === response.Data.CORR_AREA_FUNCIONAL);
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
		super.cancelar((item: any) => item.CORR_AREA_FUNCIONAL === this.modelUpdate.CORR_AREA_FUNCIONAL);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_AREA_FUNCIONAL))
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
		this.dataForm.instance.getEditor('CORR_AREA_FUNCIONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_AREA_FUNCIONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_AREA_FUNCIONAL')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_AREA_FUNCIONAL')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
