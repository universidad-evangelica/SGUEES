import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConCatalogoCuenta } from './models/con-catalogo-cuenta';
import { ConCatalogoCuentaService } from './con-catalogo-cuenta.service';
import { ConRubroService } from '../con-rubro/con-rubro.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-con-catalogo-cuenta',
	templateUrl: './con-catalogo-cuenta.component.html',
	styleUrls: ['./con-catalogo-cuenta.component.scss'],
})
export class ConCatalogoCuentaComponent extends CBaseComponent implements OnInit {
	mCLASE_RUBRO: any;
	mCLASE_VALUACION: any;
	mCODIGO_RUBRO: any[] = [];
	private rubros: any[] = [];
	readOnly = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConCatalogoCuentaService,
		private rubroService: ConRubroService
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
		this.getRUBROS();
		this.getCLASE_RUBRO();
		this.getCLASE_VALUACION();
	}

	getRUBROS() {
		this.rubroService
			.getAll({ CODIGO_RUBRO: '' })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.rubros = response.Data || [];
						this.mCODIGO_RUBRO = this.rubros.map((item: any) => ({
							Key: item.CODIGO_RUBRO,
							Value: `${item.CODIGO_RUBRO} - ${item.NOMBRE_RUBRO}`,
							NOMBRE_RUBRO: item.NOMBRE_RUBRO,
							CLASE_RUBRO: item.CLASE_RUBRO,
						}));
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCLASE_RUBRO() {
		this.appInfoService
			.getLookUp('CON_CATALOGO_CUENTA', 'CON_LISTA', 'GetCLASE_RUBRO', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_RUBRO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCLASE_VALUACION() {
		this.appInfoService
			.getLookUp('CON_CATALOGO_CUENTA', 'CON_LISTA', 'GetCLASE_VALUACION', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_VALUACION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	fillParam(xKey?: any): any {
		return { CUENTA_CONTABLE: xKey || '' };
	}

	override fillData(xModel?: ConCatalogoCuenta): ConCatalogoCuenta {
		if (xModel !== undefined) {
			return { ...xModel };
		} else {
			return {
				CORR_EMPRESA: 0,
				CUENTA_CONTABLE: '',
				NOMBRE_CUENTA: '',
				ES_DEBE: false,
				ES_HABER: false,
				ES_DETALLE: false,
				NIVEL: 0,
				CUENTA_MAYOR: '',
				CODIGO_RUBRO: '',
				NOMBRE_RUBRO: '',
				NO_HABILITADA: false,
				CLASE_RUBRO: '',
				ES_LIQUIDADORA: false,
				CLASE_VALUACION: 'SVA',
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
							const vIndex = this.models.findIndex((item: any) => item.CUENTA_CONTABLE === response.Data.CUENTA_CONTABLE);
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

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	onRubroChanged(codigoRubro: string) {
		const rubro = this.rubros.find((item: any) => item.CODIGO_RUBRO === codigoRubro);
		if (!rubro) {
			return;
		}
		this.model.NOMBRE_RUBRO = rubro.NOMBRE_RUBRO;
		if (rubro.CLASE_RUBRO) {
			this.model.CLASE_RUBRO = rubro.CLASE_RUBRO;
		}
	}
}
