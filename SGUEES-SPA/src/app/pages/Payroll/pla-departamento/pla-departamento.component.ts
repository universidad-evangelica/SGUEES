import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { PlaDepartamento } from './models/pla-departamento';
import { PlaDepartamentoService } from './pla-departamento.service';
import { IParam } from 'src/app/FxAPI/IParam';

@Component({
	selector: 'app-pla-departamento',
	templateUrl: './pla-departamento.component.html',
	styleUrls: ['./pla-departamento.component.scss'],
})
export class PlaDepartamentoComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: PlaDepartamentoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	mCORR_CENTRO_COSTO: any;
	mCLASE_DEPARTAMENTO: any;
	mCORR_EMPLEADO_JEFE: any;
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
		this.getCORR_CENTRO_COSTO();
		this.getCLASE_DEPARTAMENTO();
		this.getCORR_EMPLEADO_JEFE();
	}

	getCORR_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('PLA_DEPARTAMENTO'/*Nombre tabla*/ , 'CON_CENTRO_COSTO' /*Nombre controlador ire a hacer la peticion*/, 'GetCORR_CENTRO_COSTO' /*Nombre del metodo dentro del controlador*/, undefined, environment.UrlCONTAAPI /*La url que corresponde en el enviroment*/)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCLASE_DEPARTAMENTO() {
		/*
		//esto en caso quiera enviar parametros al endpoint
		let xWhere: IParam[] = [{ Parameter: 'USAR_COMPRAS', Value: true }];
      */
		this.appInfoService
			.getLookUp('PLA_DEPARTAMENTO', 'PLA_LISTA', 'GetCLASE_DEPARTAMENTO', /*xWhere*/ /*xWhere SI SE BUSCA ENVIAR DATOS AL ENDPOINT*/ undefined, environment.UrlTALENTOHUMANONAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_DEPARTAMENTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_EMPLEADO_JEFE() {
		this.appInfoService
			.getLookUp('PLA_DEPARTAMENTO', 'ADP_EMPLEADO_JEFE', 'GetCORR_EMPLEADO_JEFE', undefined, environment.UrlTALENTOHUMANONAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_EMPLEADO_JEFE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_DEPARTAMENTO?: number): any {
		if (xCORR_DEPARTAMENTO == undefined) {
			xCORR_DEPARTAMENTO = 0;
		}
		return {
			CORR_DEPARTAMENTO: xCORR_DEPARTAMENTO,
		};
	}

	override fillData(xModel?: PlaDepartamento): PlaDepartamento {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_DEPARTAMENTO: xModel.CORR_DEPARTAMENTO,
				NOMBRE_DEPARTAMENTO: xModel.NOMBRE_DEPARTAMENTO,
				CORR_CENTRO_COSTO: xModel.CORR_CENTRO_COSTO,
				NOMBRE_CENTRO: xModel.NOMBRE_CENTRO,
				CODIGO_DEPARTAMENTO: xModel.CODIGO_DEPARTAMENTO,
				CLASE_DEPARTAMENTO: xModel.CLASE_DEPARTAMENTO,
				NOMBRE_CLASE_DEPARTAMENTO: xModel.NOMBRE_CLASE_DEPARTAMENTO,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_DEPARTAMENTO: 0,
				NOMBRE_DEPARTAMENTO: '',
				CORR_CENTRO_COSTO: 0,
				NOMBRE_CENTRO: '',
				CODIGO_DEPARTAMENTO: '',
				CLASE_DEPARTAMENTO: '',
				NOMBRE_CLASE_DEPARTAMENTO: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_DEPARTAMENTO === response.Data.CORR_DEPARTAMENTO);
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
		super.cancelar((item: any) => item.CORR_DEPARTAMENTO === this.modelUpdate.CORR_DEPARTAMENTO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_DEPARTAMENTO))
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
		this.dataForm.instance.getEditor('CORR_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_EMPLEADO_JEFE')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_DEPARTAMENTO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
