import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';



import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';

import { UpdateType } from 'src/app/shared/models/UpdateType.enum';

import { ConSeccion } from './models/con-seccion';

import { ConSeccionService } from './con-seccion.service';

import { AppInfoService } from 'src/app/shared/services/app-info.service';



@Component({

	selector: 'app-con-seccion',

	templateUrl: './con-seccion.component.html',

})

export class ConSeccionComponent extends CBaseComponent implements OnInit {

	protected override etiquetaRegistro = 'la sección';

	protected override requiereEmpresaSesion = true;

	protected override mttoGridKeyExpr = 'CORR_SECCION';



	private readonly maintenanceSubtitulo = 'Mantenimiento de secciones';



	constructor(

		public override appInfoService: AppInfoService,

		public override router: ActivatedRoute,

		private service: ConSeccionService

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

		this.subTituloVentana = this.maintenanceSubtitulo;

		this.consultar();

	}

	// #endregion



	override AsignaStatus(xEstado: UpdateType): void {

		super.AsignaStatus(xEstado);

		if (xEstado === UpdateType.Browse) {

			this.subTituloVentana = this.maintenanceSubtitulo;

		}

	}



	//#region <Metodos Mtto>

	fillParam(xCORR_SECCION?: number): any {

		if (xCORR_SECCION == undefined) {

			xCORR_SECCION = 0;

		}

		return {

			CORR_SECCION: xCORR_SECCION,

		};

	}



	override fillData(xModel?: ConSeccion): ConSeccion {

		if (xModel !== undefined) {

			return {

				CORR_EMPRESA: xModel.CORR_EMPRESA,

				CORR_DIVISION: xModel.CORR_DIVISION,

				CORR_GERENCIA: xModel.CORR_GERENCIA,

				CORR_DEPARTAMENTO: xModel.CORR_DEPARTAMENTO,

				CORR_SECCION: xModel.CORR_SECCION,

				NOMBRE_SECCION: xModel.NOMBRE_SECCION,

				CODIGO_SECCION: xModel.CODIGO_SECCION,

			};

		} else {

			return {

				CORR_EMPRESA: 0,

				CORR_DIVISION: 0,

				CORR_GERENCIA: 0,

				CORR_DEPARTAMENTO: 0,

				CORR_SECCION: 0,

				NOMBRE_SECCION: '',

				CODIGO_SECCION: '',

			};

		}

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

		super.cancelar((item: any) => item.CORR_SECCION === this.modelUpdate.CORR_SECCION);

	}



	rowRemoving(e: any): void {

		this.rowRemovingMtto(e, {

			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_SECCION)),

		});

	}



	override bloquear(): void {

		this.dataForm.instance.getEditor('CORR_DIVISION')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_GERENCIA')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_DEPARTAMENTO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CORR_SECCION')?.option('readOnly', true);

		this.dataForm.instance.getEditor('NOMBRE_SECCION')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CODIGO_SECCION')?.option('readOnly', true);

		this.readOnly = true;

	}



	override habilitar(): void {

		this.readOnly = false;

		setTimeout(() => {

			this.dataForm.instance.getEditor('CORR_SECCION')?.option('readOnly', true);

		});

	}



	override setFocus() {

		setTimeout(() => {

			this.dataForm.instance.getEditor('NOMBRE_SECCION')?.focus();

		});

	}

	//#endregion

}

