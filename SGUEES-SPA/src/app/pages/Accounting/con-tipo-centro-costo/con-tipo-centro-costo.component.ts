import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConTipoCentroCosto } from './models/con-tipo-centro-costo';
import { ConTipoCentroCostoService } from './con-tipo-centro-costo.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-con-tipo-centro-costo',
	templateUrl: './con-tipo-centro-costo.component.html',
	styleUrls: ['./con-tipo-centro-costo.component.scss'],
})
export class ConTipoCentroCostoComponent extends CBaseComponent implements OnInit {
	mCLASE_CENTRO_COSTO: any;
	readOnly = false;

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

	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}

	llenaComboBox() {
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
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	selectedLookUpLista(vRow: any) {
		return vRow[0].Key;
	}

	fillParam(xKey?: any): any {
		return { CORR_TIPO_CENTRO_COSTO: xKey || 0 };
	}

	override fillData(xModel?: ConTipoCentroCosto): ConTipoCentroCosto {
		if (xModel !== undefined) {
			return { ...xModel };
		} else {
			return {
				CORR_EMPRESA: 0,
				CORR_TIPO_CENTRO_COSTO: 0,
				NOMBRE_TIPO_CENTRO_COSTO: '',
				CLASE_CENTRO_COSTO: '',
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
							this.consultar();
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_TIPO_CENTRO_COSTO === response.Data.CORR_TIPO_CENTRO_COSTO);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.consultar();
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
		super.cancelar((item: any) => item.CORR_TIPO_CENTRO_COSTO === this.modelUpdate.CORR_TIPO_CENTRO_COSTO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_TIPO_CENTRO_COSTO))
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

}
