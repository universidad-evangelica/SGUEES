import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenPais } from './models/gen-pais';
import { GenPaisService } from './gen-pais.service';

@Component({
	selector: 'app-gen-pais',
	templateUrl: './gen-pais.component.html',
	styleUrls: ['./gen-pais.component.scss'],
})
export class GenPaisComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenPaisService
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
	fillParam(xCORR_PAIS?: number): any {
		if (xCORR_PAIS == undefined) {
			xCORR_PAIS = 0;
		}
		return {
			CORR_PAIS: xCORR_PAIS,
		};
	}

	override fillData(xModel?: GenPais): GenPais {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PAIS: xModel.CORR_PAIS,
				NOMBRE_PAIS: xModel.NOMBRE_PAIS,
				CODIGO_PAIS: xModel.CODIGO_PAIS,
				NACIONALIDAD: xModel.NACIONALIDAD,
				NOMBRE_CORTO: xModel.NOMBRE_CORTO,
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
				CORR_PAIS: 0,
				NOMBRE_PAIS: '',
				CODIGO_PAIS: '',
				NACIONALIDAD: '',
				NOMBRE_CORTO: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_PAIS === response.Data.CORR_PAIS);
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
		super.cancelar((item: any) => item.CORR_PAIS === this.modelUpdate.CORR_PAIS);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_PAIS))
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
		this.dataForm.instance.getEditor('CORR_PAIS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PAIS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_PAIS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NACIONALIDAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CORTO')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_PAIS')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
