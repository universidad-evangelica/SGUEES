import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';



import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';

import { UpdateType } from 'src/app/shared/models/UpdateType.enum';

import { ConDivision } from './models/con-division';

import { ConDivisionService } from './con-division.service';

import { AppInfoService } from 'src/app/shared/services/app-info.service';



@Component({

	selector: 'app-con-division',

	templateUrl: './con-division.component.html',

})

export class ConDivisionComponent extends CBaseComponent implements OnInit {

	protected override etiquetaRegistro = 'la división';

	protected override requiereEmpresaSesion = true;

	protected override mttoGridKeyExpr = 'CORR_DIVISION';



	constructor(

		public override appInfoService: AppInfoService,

		public override router: ActivatedRoute,

		private service: ConDivisionService

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

		this.consultar();

	}

	// #endregion



	override AsignaStatus(xEstado: UpdateType): void {

		super.AsignaStatus(xEstado);

		if (xEstado === UpdateType.Browse) {

		}

	}



	//#region <Metodos Mtto>

	fillParam(xCORR_DIVISION?: number): any {

		if (xCORR_DIVISION == undefined) {

			xCORR_DIVISION = 0;

		}

		return {

			CORR_DIVISION: xCORR_DIVISION,

		};

	}



	override fillData(xModel?: ConDivision): ConDivision {

		if (xModel !== undefined) {

			return {

				CORR_EMPRESA: xModel.CORR_EMPRESA,

				CORR_DIVISION: xModel.CORR_DIVISION,

				NOMBRE_DIVISION: xModel.NOMBRE_DIVISION,

				CODIGO_DIVISION: xModel.CODIGO_DIVISION,

			};

		} else {

			return {

				CORR_EMPRESA: 0,

				CORR_DIVISION: 0,

				NOMBRE_DIVISION: '',

				CODIGO_DIVISION: '',

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

		super.cancelar((item: any) => item.CORR_DIVISION === this.modelUpdate.CORR_DIVISION);

	}



	rowRemoving(e: any): void {

		this.rowRemovingMtto(e, {

			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_DIVISION)),

		});

	}



	override bloquear(): void {

		this.dataForm.instance.getEditor('CORR_DIVISION')?.option('readOnly', true);

		this.dataForm.instance.getEditor('NOMBRE_DIVISION')?.option('readOnly', true);

		this.dataForm.instance.getEditor('CODIGO_DIVISION')?.option('readOnly', true);

		this.readOnly = true;

	}



	override habilitar(): void {

		this.readOnly = false;

		setTimeout(() => {

			this.dataForm.instance.getEditor('CORR_DIVISION')?.option('readOnly', true);

		});

	}



	override setFocus() {

		setTimeout(() => {

			this.dataForm.instance.getEditor('NOMBRE_DIVISION')?.focus();

		});

	}

	//#endregion

}

