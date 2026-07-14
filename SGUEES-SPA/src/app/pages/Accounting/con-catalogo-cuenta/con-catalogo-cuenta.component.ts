import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs/operators';



import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';

import { UpdateType } from 'src/app/shared/models/UpdateType.enum';

import { ConCatalogoCuenta } from './models/con-catalogo-cuenta';

import { ConCatalogoCuentaService } from './con-catalogo-cuenta.service';

import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { environment } from 'src/environments/environment';



@Component({

	selector: 'app-con-catalogo-cuenta',

	templateUrl: './con-catalogo-cuenta.component.html',

})

export class ConCatalogoCuentaComponent extends CBaseComponent implements OnInit {

	protected override etiquetaRegistro = 'la cuenta contable';

	protected override requiereEmpresaSesion = true;

	protected override mttoGridKeyExpr = 'CUENTA_CONTABLE';



	private readonly maintenanceSubtitulo = 'Mantenimiento de catálogo de cuentas';



	//#region <Declarando Variales>

	mCLASE_RUBRO: any;

	mCLASE_VALUACION: any;

	mCODIGO_RUBRO: any[] = [];

	rubroLookupColumns: any[] = [

		{ dataField: 'CODIGO_RUBRO', caption: 'Código', width: 100 },

		{ dataField: 'NOMBRE_RUBRO', caption: 'Rubro', width: 280 },

	];

	private rubros: any[] = [];

	readOnly = false;

	// #endregion



	constructor(

		public override appInfoService: AppInfoService,

		public override router: ActivatedRoute,

		private service: ConCatalogoCuentaService

	) {

		super(appInfoService, router);

		this.columns = this.service.getColumns();

		this.summary = this.service.getSummary();

		this.items = this.service.getItems();

	}



	//#region <Inicializando Opciones>

	ngOnInit(): void {

		this.subTituloVentana = this.maintenanceSubtitulo;

		this.inicializaOpciones();

		this.llenaComboBox();

		this.consultar();

	}



	inicializaOpciones() {}

	// #endregion



	override AsignaStatus(xEstado: UpdateType): void {

		super.AsignaStatus(xEstado);

		if (xEstado === UpdateType.Browse) {

			this.subTituloVentana = this.maintenanceSubtitulo;

		}

	}



	//#region <Manejo de Combos>

	llenaComboBox() {

		this.getRUBROS();

		this.getCLASE_RUBRO();

		this.getCLASE_VALUACION();

	}



	getRUBROS() {

		this.appInfoService

			.getLookUp('CON_CATALOGO_CUENTA', 'CON_RUBRO', 'GetCODIGO_RUBRO', undefined, environment.UrlCONTAAPI)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.rubros = response.Data || [];

						this.mCODIGO_RUBRO = this.rubros;

					}

				},

				error: (error: any) => {

					this.notifyApiError(error);

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

					this.notifyApiError(error);

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

					this.notifyApiError(error);

				},

			});

	}

	//#endregion



	//#region <Metodos Mtto>

	fillParam(xCUENTA_CONTABLE?: string): any {

		return { CUENTA_CONTABLE: xCUENTA_CONTABLE ?? '' };

	}



	override fillData(xModel?: ConCatalogoCuenta): ConCatalogoCuenta {

		if (xModel !== undefined) {

			return { ...xModel };

		}



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

		super.cancelar((item: any) => item.CUENTA_CONTABLE === this.modelUpdate.CUENTA_CONTABLE);

	}



	rowRemoving(e: any): void {

		this.rowRemovingMtto(e, {

			deleteFn: () => this.service.delete(this.fillParam(e.data.CUENTA_CONTABLE)),

		});

	}



	override bloquear(): void {

		this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CODIGO_RUBRO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CLASE_RUBRO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('NOMBRE_CUENTA')?.option('readOnly', true);

		this.dataForm.instance.getEditor('ES_DEBE')?.option('readOnly', true);

		this.dataForm.instance.getEditor('ES_HABER')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CUENTA_MAYOR')?.option('readOnly', true);

		this.dataForm.instance.getEditor('NIVEL')?.option('readOnly', true);

		this.dataForm.instance.getEditor('ES_DETALLE')?.option('readOnly', true);

		this.dataForm.instance.getEditor('NO_HABILITADA')?.option('readOnly', true);

		this.dataForm.instance.getEditor('ES_LIQUIDADORA')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CLASE_VALUACION')?.option('readOnly', true);

		this.readOnly = true;

	}



	override habilitar(): void {

		this.readOnly = false;

		setTimeout(() => {

			this.dataForm.instance.getEditor('NIVEL')?.option('readOnly', true);

		});

	}



	override setFocus() {

		setTimeout(() => {

			this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.focus();

		});

	}

	//#endregion



	selectedLookUpLista(vRow: any): any {

		return vRow[0].Key;

	}



	selectedLookUpCODIGO_RUBRO(vRow: any): any {

		return vRow[0].CODIGO_RUBRO;

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

