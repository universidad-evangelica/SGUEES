import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';



import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';

import { NotifyType } from 'src/app/shared/models/NotifyType';

import { UpdateType } from 'src/app/shared/models/UpdateType.enum';

import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { ConCentroCosto } from './models/con-centro-costo';

import { ConCentroCostoService } from './con-centro-costo.service';

import { ConCentroCostoPresupuestoService } from '../con-centro-costo-presupuesto/con-centro-costo-presupuesto.service';

import { ConCentroCostoPresupuesto } from '../con-centro-costo-presupuesto/models/con-centro-costo-presupuesto';



@Component({

	selector: 'app-con-centro-costo',

	templateUrl: './con-centro-costo.component.html',

	styleUrls: ['./con-centro-costo.component.scss'],

})

// Qué hace: mantenimiento de centros de costo con nivel y centro mayor.

// Cómo lo hace: filtra mayor por nivel N-1; presupuesto oculto temporalmente.

export class ConCentroCostoComponent extends CBaseComponent implements OnInit {

	protected override etiquetaRegistro = 'el centro de costo';

	protected override requiereEmpresaSesion = true;

	protected override mttoGridKeyExpr = 'CORR_CENTRO_COSTO';



	@ViewChild('gridPresupuesto', { static: false }) gridPresupuesto!: DxDataGridComponent;



	constructor(

		public override appInfoService: AppInfoService,

		public override router: ActivatedRoute,

		private service: ConCentroCostoService,

		private presupuestoService: ConCentroCostoPresupuestoService

	) {

		super(appInfoService, router);

		this.columns = this.service.getColumns();

		this.summary = this.service.getSummary();

		this.items = this.service.getItems();

	}



	//#region <Declarando Variales>

	mCORR_TIPO_CENTRO_COSTO: any;

	mESTADO_CENTRO_COSTO: any;

	mCORR_UNIDAD_NEGOCIO: any;

	mCORR_AREA_FUNCIONAL: any;

	mCORR_CENTRO_COSTO_NIVEL: any;

	mCORR_CENTRO_COSTO_MAYOR: any[] = [];

	mCORR_CENTRO_COSTO_MAYOR_ALL: any[] = [];

	readOnly = false;

	/** motivo: ocultar tab Presupuesto sin borrar el código */

	mostrarTabPresupuesto = false;

	presupuestos: ConCentroCostoPresupuesto[] = [];



	tipoCentroCostoLookupColumns: any[] = [

		{ dataField: 'CORR_TIPO_CENTRO_COSTO', caption: 'Código', width: 80 },

		{ dataField: 'NOMBRE_TIPO_CENTRO_COSTO', caption: 'Tipo centro costo', width: 280 },

	];



	unidadNegocioLookupColumns: any[] = [

		{ dataField: 'CORR_UNIDAD_NEGOCIO', caption: 'Código', width: 80 },

		{ dataField: 'NOMBRE_UNIDAD_NEGOCIO', caption: 'Unidad negocio', width: 280 },

	];



	areaFuncionalLookupColumns: any[] = [

		{ dataField: 'CORR_AREA_FUNCIONAL', caption: 'Código', width: 80 },

		{ dataField: 'NOMBRE_AREA_FUNCIONAL', caption: 'Área funcional', width: 280 },

	];



	nivelLookupColumns: any[] = [

		{ dataField: 'NIVEL', caption: 'Nivel', width: 80 },

		{ dataField: 'NOMBRE_NIVEL', caption: 'Nombre', width: 280 },

	];



	centroMayorLookupColumns: any[] = [

		{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código', width: 100 },

		{ dataField: 'NOMBRE_CENTRO', caption: 'Centro', width: 280 },

		{ dataField: 'NOMBRE_NIVEL', caption: 'Nivel', width: 140 },

	];

	// #endregion



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

	}



	//#region <Manejo de Combos>

	llenaComboBox() {

		this.getCORR_TIPO_CENTRO_COSTO();

		this.getESTADO_CENTRO_COSTO();

		this.getCORR_UNIDAD_NEGOCIO();

		this.getCORR_AREA_FUNCIONAL();

		this.getCORR_CENTRO_COSTO_NIVEL();

		this.getCORR_CENTRO_COSTO_MAYOR();

	}



	getCORR_TIPO_CENTRO_COSTO() {

		this.appInfoService

			.getLookUp('CON_CENTRO_COSTO', 'CON_TIPO_CENTRO_COSTO', 'GetCORR_TIPO_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.mCORR_TIPO_CENTRO_COSTO = response.Data;

					}

				},

				error: (error: any) => this.notifyApiError(error),

			});

	}



	getESTADO_CENTRO_COSTO() {

		this.appInfoService

			.getLookUp('CON_CENTRO_COSTO', 'CON_LISTA', 'GetESTADO_CENTRO_COSTO', undefined, environment.UrlCONTAAPI)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.mESTADO_CENTRO_COSTO = response.Data;

					}

				},

				error: (error: any) => this.notifyApiError(error),

			});

	}



	getCORR_UNIDAD_NEGOCIO() {

		this.appInfoService

			.getLookUp('CON_CENTRO_COSTO', 'CON_UNIDAD_NEGOCIO', 'GetCORR_UNIDAD_NEGOCIO', undefined, environment.UrlCONTAAPI)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.mCORR_UNIDAD_NEGOCIO = response.Data;

					}

				},

				error: (error: any) => this.notifyApiError(error),

			});

	}



	getCORR_AREA_FUNCIONAL() {

		this.appInfoService

			.getLookUp('CON_CENTRO_COSTO', 'CON_AREA_FUNCIONAL', 'GetCORR_AREA_FUNCIONAL', undefined, environment.UrlCONTAAPI)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.mCORR_AREA_FUNCIONAL = response.Data;

					}

				},

				error: (error: any) => this.notifyApiError(error),

			});

	}



	// Qué hace: carga el catálogo de niveles para el lookup del formulario.

	// Cómo lo hace: getLookUp arma GetCORR_CENTRO_COSTO_NIVEL_CON_CENTRO_COSTO.

	getCORR_CENTRO_COSTO_NIVEL() {

		this.appInfoService

			.getLookUp(

				'CON_CENTRO_COSTO',

				'CON_CENTRO_COSTO_NIVEL',

				'GetCORR_CENTRO_COSTO_NIVEL',

				undefined,

				environment.UrlCONTAAPI

			)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.mCORR_CENTRO_COSTO_NIVEL = response.Data;

						this.filtrarCentrosMayorPorNivel();

					}

				},

				error: (error: any) => this.notifyApiError(error),

			});

	}



	// Qué hace: carga todos los centros y deja filtrados los del nivel padre.

	// Cómo lo hace: getLookUp arma GetCORR_CENTRO_COSTO_MAYOR_CON_CENTRO_COSTO.

	getCORR_CENTRO_COSTO_MAYOR() {

		this.appInfoService

			.getLookUp(

				'CON_CENTRO_COSTO',

				'CON_CENTRO_COSTO',

				'GetCORR_CENTRO_COSTO_MAYOR',

				undefined,

				environment.UrlCONTAAPI

			)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.mCORR_CENTRO_COSTO_MAYOR_ALL = response.Data ?? [];

						this.filtrarCentrosMayorPorNivel();

					}

				},

				error: (error: any) => this.notifyApiError(error),

			});

	}



	// Qué hace: reacciona al cambio de nivel en el formulario.

	// Cómo lo hace: filtra centros mayor del nivel N-1 y limpia si ya no aplica.

	onNivelCentroChanged(_corrNivel: any): void {

		this.filtrarCentrosMayorPorNivel(true);

	}



	// Qué hace: deja en el lookup solo centros del nivel inmediato superior (N-1).

	// Cómo lo hace: usa NIVEL del catálogo seleccionado; nivel 1 no admite mayor.

	filtrarCentrosMayorPorNivel(limpiarSiNoAplica = false): void {

		const nivelRow = (this.mCORR_CENTRO_COSTO_NIVEL ?? []).find(

			(x: any) => Number(x.CORR_CENTRO_COSTO_NIVEL) === Number(this.model?.CORR_CENTRO_COSTO_NIVEL)

		);

		const nivelNum = Number(nivelRow?.NIVEL) || 0;

		const nivelPadre = nivelNum - 1;

		const selfCorr = Number(this.model?.CORR_CENTRO_COSTO) || 0;



		if (nivelPadre < 1) {

			this.mCORR_CENTRO_COSTO_MAYOR = [];

			if (limpiarSiNoAplica || nivelNum <= 1) {

				this.model.CORR_CENTRO_COSTO_MAYOR = 0;

			}

			return;

		}



		this.mCORR_CENTRO_COSTO_MAYOR = (this.mCORR_CENTRO_COSTO_MAYOR_ALL ?? []).filter(

			(x: any) => Number(x.NIVEL) === nivelPadre && Number(x.CORR_CENTRO_COSTO) !== selfCorr

		);



		if (limpiarSiNoAplica) {

			const ok = this.mCORR_CENTRO_COSTO_MAYOR.some(

				(x: any) => Number(x.CORR_CENTRO_COSTO) === Number(this.model.CORR_CENTRO_COSTO_MAYOR)

			);

			if (!ok) {

				this.model.CORR_CENTRO_COSTO_MAYOR = 0;

			}

		}

	}

	//#endregion



	//#region <Metodos Mtto>

	fillParam(xCORR_CENTRO_COSTO?: number): any {

		return {

			CORR_CENTRO_COSTO: xCORR_CENTRO_COSTO ?? 0,

		};

	}



	override fillData(xModel?: ConCentroCosto): ConCentroCosto {

		if (xModel !== undefined) {

			return {

				CORR_EMPRESA: xModel.CORR_EMPRESA,

				CORR_CENTRO_COSTO: xModel.CORR_CENTRO_COSTO,

				NOMBRE_CENTRO: xModel.NOMBRE_CENTRO,

				CUENTA_CONTABLE: xModel.CUENTA_CONTABLE,

				CODIGO_CENTRO_COSTO: xModel.CODIGO_CENTRO_COSTO,

				CORR_CENTRO_COSTO_MAYOR: xModel.CORR_CENTRO_COSTO_MAYOR ?? 0,

				NOMBRE_CENTRO_COSTO_MAYOR: xModel.NOMBRE_CENTRO_COSTO_MAYOR ?? '',

				CODIGO_CENTRO_COSTO_MAYOR: xModel.CODIGO_CENTRO_COSTO_MAYOR ?? '',

				CORR_CENTRO_COSTO_NIVEL: xModel.CORR_CENTRO_COSTO_NIVEL ?? 0,

				NOMBRE_NIVEL: xModel.NOMBRE_NIVEL ?? '',

				NIVEL: xModel.NIVEL ?? 0,

				CORR_TIPO_CENTRO_COSTO: xModel.CORR_TIPO_CENTRO_COSTO,

				NOMBRE_TIPO_CENTRO_COSTO: xModel.NOMBRE_TIPO_CENTRO_COSTO,

				CLASE_CENTRO_COSTO: xModel.CLASE_CENTRO_COSTO,

				ESTADO_CENTRO_COSTO: xModel.ESTADO_CENTRO_COSTO,

				NOMBRE_ESTADO_CENTRO_COSTO: xModel.NOMBRE_ESTADO_CENTRO_COSTO,

				CORR_CENTRO_COSTO_REPLICADO: xModel.CORR_CENTRO_COSTO_REPLICADO,

				CORR_UNIDAD_NEGOCIO: xModel.CORR_UNIDAD_NEGOCIO,

				NOMBRE_UNIDAD_NEGOCIO: xModel.NOMBRE_UNIDAD_NEGOCIO,

				CODIGO_UNIDAD_NEGOCIO: xModel.CODIGO_UNIDAD_NEGOCIO,

				CORR_AREA_FUNCIONAL: xModel.CORR_AREA_FUNCIONAL,

				NOMBRE_AREA_FUNCIONAL: xModel.NOMBRE_AREA_FUNCIONAL,

				CODIGO_TERMINACION: xModel.CODIGO_TERMINACION,

				CORR_EMPLEADO_JEFE: xModel.CORR_EMPLEADO_JEFE,

				NOMBRE_EMPLEADO: xModel.NOMBRE_EMPLEADO,

				CORR_CLIENTE: xModel.CORR_CLIENTE,

				FECHA_INICIAL: xModel.FECHA_INICIAL,

				FECHA_FINAL: xModel.FECHA_FINAL,

			};

		}



		return {

			CORR_EMPRESA: 1,

			CORR_CENTRO_COSTO: 0,

			NOMBRE_CENTRO: '',

			CUENTA_CONTABLE: '',

			CODIGO_CENTRO_COSTO: '',

			CORR_CENTRO_COSTO_MAYOR: 0,

			NOMBRE_CENTRO_COSTO_MAYOR: '',

			CODIGO_CENTRO_COSTO_MAYOR: '',

			CORR_CENTRO_COSTO_NIVEL: 0,

			NOMBRE_NIVEL: '',

			NIVEL: 0,

			CORR_TIPO_CENTRO_COSTO: 0,

			NOMBRE_TIPO_CENTRO_COSTO: '',

			CLASE_CENTRO_COSTO: '',

			ESTADO_CENTRO_COSTO: '',

			NOMBRE_ESTADO_CENTRO_COSTO: '',

			CORR_CENTRO_COSTO_REPLICADO: '',

			CORR_UNIDAD_NEGOCIO: 0,

			NOMBRE_UNIDAD_NEGOCIO: '',

			CODIGO_UNIDAD_NEGOCIO: '',

			CORR_AREA_FUNCIONAL: 0,

			NOMBRE_AREA_FUNCIONAL: '',

			CODIGO_TERMINACION: '',

			CORR_EMPLEADO_JEFE: 0,

			NOMBRE_EMPLEADO: '',

			CORR_CLIENTE: 0,

			FECHA_INICIAL: new Date(),

			FECHA_FINAL: new Date(),

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

		this.presupuestos = [];

		this.filtrarCentrosMayorPorNivel(true);

	}



	guardar(): void {

		this.guardarMtto({

			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),

			insert: () => this.service.insert(this.model),

			update: () => this.service.update(this.model),

			onSuccess: () => {
				this.models = this.service.ordenarJerarquia(this.models);
				this.getCORR_CENTRO_COSTO_MAYOR();
			},

		});

	}



	override cancelar(): void {

		super.cancelar((item: any) => item.CORR_CENTRO_COSTO === this.modelUpdate.CORR_CENTRO_COSTO);

		this.presupuestos = [];

	}



	override rowDblClick(e: any): void {

		super.rowDblClick(e);

		this.filtrarCentrosMayorPorNivel();

		if (this.mostrarTabPresupuesto) {

			this.consultarPresupuestos();

		}

	}



	override editarClick(e: any): void {

		super.editarClick(e);

		this.filtrarCentrosMayorPorNivel();

		if (this.mostrarTabPresupuesto) {

			this.consultarPresupuestos();

		}

	}



	consultarPresupuestos() {

		this.presupuestoService

			.getAll({ CORR_CENTRO_COSTO: this.model.CORR_CENTRO_COSTO })

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.presupuestos = response.Data;

					}

				},

				error: (error: any) => this.notifyFx(error, NotifyType.Error),

			});

	}



	agregarPresupuesto() {

		this.gridPresupuesto?.instance.addRow();

	}



	presupuestoRowInserting(e: any) {

		const pres: any = {

			CORR_EMPRESA: this.model.CORR_EMPRESA,

			CORR_CENTRO_COSTO: this.model.CORR_CENTRO_COSTO,

			NOMBRE_CENTRO: this.model.NOMBRE_CENTRO,

			...e.data,

		};



		this.presupuestoService

			.insert(pres)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (!response.Result) {

						e.cancel = true;

						this.notifyFx(response.ErrorMessage, NotifyType.Error);

					} else {

						this.consultarPresupuestos();

					}

				},

				error: (error: any) => {

					e.cancel = true;

					this.notifyFx(error, NotifyType.Error);

				},

			});

	}



	presupuestoRowUpdated(e: any) {

		const pres: any = {

			CORR_EMPRESA: this.model.CORR_EMPRESA,

			CORR_CENTRO_COSTO: this.model.CORR_CENTRO_COSTO,

			NOMBRE_CENTRO: this.model.NOMBRE_CENTRO,

			...e.data,

		};



		this.presupuestoService

			.update(pres)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (!response.Result) {

						this.notifyFx(response.ErrorMessage, NotifyType.Error);

					}

				},

				error: (error: any) => this.notifyFx(error, NotifyType.Error),

			});

	}



	presupuestoRowRemoving(e: any) {

		this.presupuestoService

			.delete({

				CORR_CENTRO_COSTO: this.model.CORR_CENTRO_COSTO,

				ANIO_PERIODO: e.data.ANIO_PERIODO,

				MES_PERIODO: e.data.MES_PERIODO,

			})

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (!response.Result) {

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



	rowRemoving(e: any): void {

		this.rowRemovingMtto(e, {

			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_CENTRO_COSTO)),

		});

	}



	override bloquear(): void {

		this.dataForm.instance.getEditor('CORR_CENTRO_COSTO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('NOMBRE_CENTRO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CODIGO_CENTRO_COSTO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_TIPO_CENTRO_COSTO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('ESTADO_CENTRO_COSTO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_CENTRO_COSTO_NIVEL')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_CENTRO_COSTO_MAYOR')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_UNIDAD_NEGOCIO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_AREA_FUNCIONAL')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CODIGO_TERMINACION')?.option('readOnly', true);

		this.readOnly = true;

	}



	override habilitar(): void {

		this.readOnly = false;

		setTimeout(() => {

			this.dataForm.instance.getEditor('CORR_CENTRO_COSTO')?.option('readOnly', true);

		});

	}



	override setFocus() {

		setTimeout(() => {

			this.dataForm.instance.getEditor('NOMBRE_CENTRO')?.focus();

		});

	}

	//#endregion



	selectedLookUpLista(vRow: any): any {

		return vRow[0].Key;

	}



	selectedLookUpCORR_TIPO_CENTRO_COSTO(vRow: any): any {

		return vRow[0].CORR_TIPO_CENTRO_COSTO;

	}



	selectedLookUpCORR_UNIDAD_NEGOCIO(vRow: any): any {

		return vRow[0].CORR_UNIDAD_NEGOCIO;

	}



	selectedLookUpCORR_AREA_FUNCIONAL(vRow: any): any {

		return vRow[0].CORR_AREA_FUNCIONAL;

	}



	selectedLookUpCORR_CENTRO_COSTO_NIVEL(vRow: any): any {

		return vRow[0].CORR_CENTRO_COSTO_NIVEL;

	}



	selectedLookUpCORR_CENTRO_COSTO_MAYOR(vRow: any): any {

		return vRow[0].CORR_CENTRO_COSTO;

	}

}


