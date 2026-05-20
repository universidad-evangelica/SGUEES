import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenDistrito } from './models/gen-distrito';
import { GenDistritoService } from './gen-distrito.service';
import { IParam } from 'src/app/FxAPI/IParam';

@Component({
	selector: 'app-gen-distrito',
	templateUrl: './gen-distrito.component.html',
	styleUrls: ['./gen-distrito.component.scss'],
})
export class GenDistritoComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenDistritoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	mCORR_PAIS: any;
	mCORR_DEPTO: any;
	mCORR_MUNICIPIO: any;
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
		this.getCORR_PAIS();
		this.getCORR_DEPTO();
		this.getCORR_MUNICIPIO();
	}

	onPaisChange(value: number): void {
			console.log('Pais seleccionado:', value);
	
		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: value }];
		this.appInfoService
			.getLookUp('GEN_DISTRITO', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DEPTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
		});
	}

	onDeptoChange(value: number): void {
			console.log('departamento seleccionado:', value);
	
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: value }];
		this.appInfoService
			.getLookUp('GEN_DISTRITO', 'GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_MUNICIPIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
		});
	}
	
	
	getCORR_PAIS() {
		
		this.appInfoService
			.getLookUp('GEN_DISTRITO', 'GEN_PAIS', 'GetCORR_PAIS', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PAIS = response.Data;
		
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});

		
	}
	getCORR_DEPTO() {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: 1 }];
		this.appInfoService
			.getLookUp('GEN_DISTRITO', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DEPTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_MUNICIPIO() {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: 1 }];
		this.appInfoService
			.getLookUp('GEN_DISTRITO', 'GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_MUNICIPIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_DISTRITO?: number): any {
		if (xCORR_DISTRITO == undefined) {
			xCORR_DISTRITO = 0;
		}
		return {
			CORR_DISTRITO: xCORR_DISTRITO,
		};
	}

	override fillData(xModel?: GenDistrito): GenDistrito {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PAIS: xModel.CORR_PAIS,
				CORR_DEPTO: xModel.CORR_DEPTO,
				CORR_MUNICIPIO: xModel.CORR_MUNICIPIO,
				CORR_DISTRITO: xModel.CORR_DISTRITO,
				NOMBRE_DISTRITO: xModel.NOMBRE_DISTRITO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				NOMBRE_PAIS: xModel.NOMBRE_PAIS,
				NOMBRE_DEPTO: xModel.NOMBRE_DEPTO,
				NOMBRE_MUNICIPIO: xModel.NOMBRE_MUNICIPIO,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_PAIS: 0,
				CORR_DEPTO: 0,
				CORR_MUNICIPIO: 0,
				CORR_DISTRITO: 0,
				NOMBRE_DISTRITO: '',
				USUARIO_CREA: '',
				ESTACION_CREA: '',
				FECHA_CREA: new Date(),
				USUARIO_ACTU: '',
				ESTACION_ACTU: '',
				FECHA_ACTU: new Date(),
				NOMBRE_PAIS: '',
				NOMBRE_DEPTO: '',
				NOMBRE_MUNICIPIO: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_DISTRITO === response.Data.CORR_DISTRITO);
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
		super.cancelar((item: any) => item.CORR_DISTRITO === this.modelUpdate.CORR_DISTRITO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_DISTRITO))
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
		this.dataForm.instance.getEditor('CORR_DEPTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_MUNICIPIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DISTRITO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_DISTRITO')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_DISTRITO')?.focus();
		});
	}
	//#endregion

	selectedLookUpCORR_PAIS(vRow: any): any {
		return vRow[0].CORR_PAIS;
	}
	selectedLookUpCORR_DEPTO(vRow: any): any {
		return vRow[0].CORR_DEPTO;
	}
	selectedLookUpCORR_MUNICIPIO(vRow: any): any {
		return vRow[0].CORR_MUNICIPIO;
	}
}
