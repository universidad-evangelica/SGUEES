import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConCatalogoPresupuesto } from './models/con-catalogo-presupuesto';
import { ConCatalogoPresupuestoService } from './con-catalogo-presupuesto.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-catalogo-presupuesto',
	templateUrl: './con-catalogo-presupuesto.component.html',
	styleUrls: ['./con-catalogo-presupuesto.component.scss'],
})
export class ConCatalogoPresupuestoComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConCatalogoPresupuestoService
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
	fillParam(xCUENTA_CONTABLE?: string): any {
		if (xCUENTA_CONTABLE == undefined) {
			xCUENTA_CONTABLE = '';
		}
		return {
			CUENTA_CONTABLE: xCUENTA_CONTABLE,
		};
	}

	override fillData(xModel?: ConCatalogoPresupuesto): ConCatalogoPresupuesto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CUENTA_CONTABLE: xModel.CUENTA_CONTABLE,
				NOMBRE_CUENTA: xModel.NOMBRE_CUENTA,
				ANIO_PERIODO: xModel.ANIO_PERIODO,
				MONTO_PRESUPUESTO_1: xModel.MONTO_PRESUPUESTO_1,
				MONTO_PRESUPUESTO_2: xModel.MONTO_PRESUPUESTO_2,
				MONTO_PRESUPUESTO_3: xModel.MONTO_PRESUPUESTO_3,
				MONTO_PRESUPUESTO_4: xModel.MONTO_PRESUPUESTO_4,
				MONTO_PRESUPUESTO_5: xModel.MONTO_PRESUPUESTO_5,
				MONTO_PRESUPUESTO_6: xModel.MONTO_PRESUPUESTO_6,
				MONTO_PRESUPUESTO_7: xModel.MONTO_PRESUPUESTO_7,
				MONTO_PRESUPUESTO_8: xModel.MONTO_PRESUPUESTO_8,
				MONTO_PRESUPUESTO_9: xModel.MONTO_PRESUPUESTO_9,
				MONTO_PRESUPUESTO_10: xModel.MONTO_PRESUPUESTO_10,
				MONTO_PRESUPUESTO_11: xModel.MONTO_PRESUPUESTO_11,
				MONTO_PRESUPUESTO_12: xModel.MONTO_PRESUPUESTO_12,
			};
		} else {
			return {
				CORR_EMPRESA: 0,
				CUENTA_CONTABLE: '',
				NOMBRE_CUENTA: '',
				ANIO_PERIODO: 0,
				MONTO_PRESUPUESTO_1: 0,
				MONTO_PRESUPUESTO_2: 0,
				MONTO_PRESUPUESTO_3: 0,
				MONTO_PRESUPUESTO_4: 0,
				MONTO_PRESUPUESTO_5: 0,
				MONTO_PRESUPUESTO_6: 0,
				MONTO_PRESUPUESTO_7: 0,
				MONTO_PRESUPUESTO_8: 0,
				MONTO_PRESUPUESTO_9: 0,
				MONTO_PRESUPUESTO_10: 0,
				MONTO_PRESUPUESTO_11: 0,
				MONTO_PRESUPUESTO_12: 0,
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
							const vIndex = this.models.findIndex((item: any) => item.CUENTA_CONTABLE === response.Data.CUENTA_CONTABLE);
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
		super.cancelar((item: any) => item.CUENTA_CONTABLE === this.modelUpdate.CUENTA_CONTABLE);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CUENTA_CONTABLE))
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
		this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CUENTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ANIO_PERIODO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_PRESUPUESTO_1')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_PRESUPUESTO_2')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_PRESUPUESTO_3')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_PRESUPUESTO_4')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_PRESUPUESTO_5')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MONTO_PRESUPUESTO_6')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			if (this.banderaMtto === UpdateType.Update) {
				this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);
			}
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.focus();
		});
	}
	//#endregion
}
