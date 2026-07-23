import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConTipoCentroCosto } from './models/con-tipo-centro-costo';
import { ConTipoCentroCostoService } from './con-tipo-centro-costo.service';

@Component({
	selector: 'app-con-tipo-centro-costo',
	templateUrl: './con-tipo-centro-costo.component.html',
})
export class ConTipoCentroCostoComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el tipo de centro de costo';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_TIPO_CENTRO_COSTO';

	//#region <Declarando Variales>
	mCLASE_CENTRO_COSTO: any;
	readOnly = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConTipoCentroCostoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
		}
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCLASE_CENTRO_COSTO();
	}

	getCLASE_CENTRO_COSTO() {
		this.appInfoService
			.getLookUp('CON_TIPO_CENTRO_COSTO', 'CON_LISTA', 'GetCLASE_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_CENTRO_COSTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_CENTRO_COSTO?: number): any {
		return {
			CORR_TIPO_CENTRO_COSTO: xCORR_TIPO_CENTRO_COSTO ?? 0,
		};
	}

	override fillData(xModel?: ConTipoCentroCosto): ConTipoCentroCosto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_CENTRO_COSTO: xModel.CORR_TIPO_CENTRO_COSTO,
				NOMBRE_TIPO_CENTRO_COSTO: xModel.NOMBRE_TIPO_CENTRO_COSTO,
				CLASE_CENTRO_COSTO: xModel.CLASE_CENTRO_COSTO,
			};
		}

		return {
			CORR_EMPRESA: 0,
			CORR_TIPO_CENTRO_COSTO: 0,
			NOMBRE_TIPO_CENTRO_COSTO: '',
			CLASE_CENTRO_COSTO: '',
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_TIPO_CENTRO_COSTO === this.modelUpdate.CORR_TIPO_CENTRO_COSTO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_TIPO_CENTRO_COSTO)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_CENTRO_COSTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_CENTRO_COSTO')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_TIPO_CENTRO_COSTO')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_CENTRO_COSTO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
