import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConParametro } from './models/con-parametro';
import { ConParametroService } from './con-parametro.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-parametro',
	templateUrl: './con-parametro.component.html',
	styleUrls: ['./con-parametro.component.scss'],
})
export class ConParametroComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConParametroService
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
	fillParam(xCORR_EMPRESA?: number): any {
		if (xCORR_EMPRESA == undefined) {
			xCORR_EMPRESA = 0;
		}
		return {
			CORR_EMPRESA: xCORR_EMPRESA,
		};
	}

	override fillData(xModel?: ConParametro): ConParametro {
		if (xModel !== undefined) {
			return { ...xModel };
		} else {
			return {
				CORR_EMPRESA: 0,
				NOMBRE_PUESTO1: '',
				DESCRIPCION_PUESTO1: '',
				NOMBRE_PUESTO2: '',
				DESCRIPCION_PUESTO2: '',
				NOMBRE_PUESTO3: '',
				DESCRIPCION_PUESTO3: '',
				NIVEL_CUENTA_MAYOR: 0,
				CORR_CENTRO_COSTO_DEF: 0,
				CORR_MONEDA: 0,
				CUENTA_CONTABLE_PERDIDA: '',
				CUENTA_CONTABLE_GANANCIA: '',
				CUENTA_CONTABLE_IVA_DEBITO: '',
				CUENTA_CONTABLE_IVA_CREDITO: '',
				CUENTA_CONTABLE_IVA_RETENIDO: '',
				CUENTA_CONTABLE_IVA_PERCIBIDO: '',
				CUENTA_CONTABLE_RENTA: '',
				CUENTA_CONTABLE_CAJA: '',
				CUENTA_CONTABLE_CAJA_CHICA: '',
				APLICAR_DOC_CONTA: false,
				PERIODO_MOSTRAR: '',
				CARACTER_SEPARADOR: '',
				CUENTA_CONTABLE_CAMBIO_DIFERENCIAL: '',
				CORR_CLASE_PARTIDA_DEFAULT: 0,
				OCULTA_CLASE_PARTIDA_BANCOS: false,
				INCLUIR_PARTIDA_LIQUIDACION: false,
				INCLUIR_PARTIDA_CIERRE: false,
				USA_AUXILIARES: false,
				MOSTRAR_FECHA_IMPRESION: false,
				PREFIJO: '',
				CUENTA_CONTABLE_CAMBIO_DIF_GASTO: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_EMPRESA === response.Data.CORR_EMPRESA);
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
		super.cancelar((item: any) => item.CORR_EMPRESA === this.modelUpdate.CORR_EMPRESA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_EMPRESA))
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
		this.dataForm.instance.getEditor('NOMBRE_PUESTO1')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION_PUESTO1')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PUESTO2')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION_PUESTO2')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PUESTO3')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION_PUESTO3')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NIVEL_CUENTA_MAYOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_MONEDA')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_PUESTO1')?.focus();
		});
	}
	//#endregion
}
