import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs/operators';

import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';



import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';

import { NotifyType } from 'src/app/shared/models/NotifyType';

import { UpdateType } from 'src/app/shared/models/UpdateType.enum';

import { ConRubro } from './models/con-rubro';

import { ConRubroService } from './con-rubro.service';

import { ConRubroNivelService } from '../con-rubro-nivel/con-rubro-nivel.service';

import { ConRubroNivel } from '../con-rubro-nivel/models/con-rubro-nivel';

import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { environment } from 'src/environments/environment';



@Component({

	selector: 'app-con-rubro',

	templateUrl: './con-rubro.component.html',

	styleUrls: ['./con-rubro.component.scss'],

})

export class ConRubroComponent extends CBaseComponent implements OnInit {

	protected override etiquetaRegistro = 'el rubro';

	protected override requiereEmpresaSesion = true;

	protected override mttoGridKeyExpr = 'CODIGO_RUBRO';



	private readonly maintenanceSubtitulo = 'Mantenimiento de rubros contables';



	@ViewChild('gridNiveles', { static: false }) gridNiveles!: DxDataGridComponent;



	//#region <Declarando Variales>

	niveles: ConRubroNivel[] = [];

	readOnly = false;

	mCLASE_RUBRO: any;

	// #endregion



	constructor(

		public override appInfoService: AppInfoService,

		public override router: ActivatedRoute,

		private service: ConRubroService,

		private nivelService: ConRubroNivelService

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

		this.getCLASE_RUBRO();

	}



	getCLASE_RUBRO() {

		this.appInfoService

			.getLookUp('CON_RUBRO', 'CON_LISTA', 'GetCLASE_RUBRO', undefined, environment.UrlCONTAAPI)

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

	//#endregion



	//#region <Metodos Mtto>

	fillParam(xCODIGO_RUBRO?: string): any {

		return { CODIGO_RUBRO: xCODIGO_RUBRO ?? '' };

	}



	override fillData(xModel?: ConRubro): ConRubro {

		if (xModel !== undefined) {

			return { ...xModel };

		}



		return {

			CORR_EMPRESA: 0,

			CODIGO_RUBRO: '',

			NOMBRE_RUBRO: '',

			ES_DEBE: false,

			ES_HABER: false,

			CLASE_RUBRO: '',

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

		this.niveles = [];

		this.readOnly = false;

	}



	guardar(): void {

		this.guardarMtto({

			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),

			insert: () => this.service.insert(this.model),

			update: () => this.service.update(this.model),

		});

	}



	override cancelar(): void {

		super.cancelar((item: any) => item.CODIGO_RUBRO === this.modelUpdate.CODIGO_RUBRO);

		this.niveles = [];

		this.readOnly = false;

	}



	override rowDblClick(e: any): void {

		super.rowDblClick(e);

		this.consultarNiveles();

		this.readOnly = false;

	}



	override editarClick(e: any): void {

		super.editarClick(e);

		this.consultarNiveles();

		this.readOnly = false;

	}



	consultarNiveles() {

		this.nivelService

			.getAll({ CODIGO_RUBRO: this.model.CODIGO_RUBRO })

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.niveles = response.Data;

					}

				},

				error: (error: any) => {

					this.notifyFx(error, NotifyType.Error);

				},

			});

	}



	agregarNivel() {

		this.gridNiveles?.instance.addRow();

	}



	nivelRowInserting(e: any) {

		const nivel: ConRubroNivel = {

			CORR_EMPRESA: this.model.CORR_EMPRESA,

			CODIGO_RUBRO: this.model.CODIGO_RUBRO,

			NOMBRE_RUBRO: this.model.NOMBRE_RUBRO,

			NIVEL: e.data.NIVEL,

			NUMERO_CARACTERES: e.data.NUMERO_CARACTERES,

		};

		this.nivelService

			.insert(nivel)

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



	nivelRowUpdated(e: any) {

		const nivel: ConRubroNivel = {

			CORR_EMPRESA: this.model.CORR_EMPRESA,

			CODIGO_RUBRO: this.model.CODIGO_RUBRO,

			NOMBRE_RUBRO: this.model.NOMBRE_RUBRO,

			NIVEL: e.data.NIVEL,

			NUMERO_CARACTERES: e.data.NUMERO_CARACTERES,

		};

		this.nivelService

			.update(nivel)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (!response.Result) {

						this.notifyFx(response.ErrorMessage, NotifyType.Error);

					}

				},

				error: (error: any) => {

					this.notifyFx(error, NotifyType.Error);

				},

			});

	}



	nivelRowRemoving(e: any) {

		this.nivelService

			.delete({ CODIGO_RUBRO: this.model.CODIGO_RUBRO, NIVEL: e.data.NIVEL })

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

			deleteFn: () => this.service.delete(this.fillParam(e.data.CODIGO_RUBRO)),

		});

	}



	override bloquear(): void {

		this.dataForm.instance.getEditor('CODIGO_RUBRO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('ES_DEBE')?.option('readOnly', true);

		this.dataForm.instance.getEditor('ES_HABER')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CLASE_RUBRO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('NOMBRE_RUBRO')?.option('readOnly', true);

		this.readOnly = true;

	}



	override habilitar(): void {

		this.readOnly = false;

	}



	override setFocus() {

		setTimeout(() => {

			this.dataForm.instance.getEditor('CODIGO_RUBRO')?.focus();

		});

	}

	//#endregion



	selectedLookUpLista(vRow: any): any {

		return vRow[0].Key;

	}

}


