import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';



import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';

import { NotifyType } from 'src/app/shared/models/NotifyType';

import { UpdateType } from 'src/app/shared/models/UpdateType.enum';

import { ConPeriodoContable } from './models/con-periodo-contable';

import { ConPeriodoContableService } from './con-periodo-contable.service';

import { AppInfoService } from 'src/app/shared/services/app-info.service';



@Component({

	selector: 'app-con-periodo-contable',

	templateUrl: './con-periodo-contable.component.html',

	styleUrls: ['./con-periodo-contable.component.scss'],

})

export class ConPeriodoContableComponent extends CBaseComponent implements OnInit {

	protected override etiquetaRegistro = 'el período contable';

	protected override requiereEmpresaSesion = true;

	protected override mttoGridKeyExpr = 'ANIO_PERIODO';

	readonly periodoGridKeyExpr: string[] = ['ANIO_PERIODO', 'MES_PERIODO'];

	private pendingRemoveRow: ConPeriodoContable | null = null;



	//#region <Declarando Variales>

	readOnly = false;

	// #endregion



	constructor(

		public override appInfoService: AppInfoService,

		public override router: ActivatedRoute,

		private service: ConPeriodoContableService

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

	llenaComboBox() {}

	//#endregion



	//#region <Metodos Mtto>

	fillParam(xANIO_PERIODO?: number): any {

		return { ANIO_PERIODO: xANIO_PERIODO ?? 0 };

	}



	override fillData(xModel?: ConPeriodoContable): ConPeriodoContable {

		if (xModel !== undefined) {

			return { ...xModel };

		}



		const hoy = new Date();

		const ABIERTO = 'AB';

		const BLOQUEADO = 'CE';

		const N_ABIERTO = 'Abierto';

		const N_BLOQUEADO = 'Cerrado';

		return {

			CORR_EMPRESA: 0,

			ANIO_PERIODO: hoy.getFullYear(),

			MES_PERIODO: hoy.getMonth() + 1,

			NOMBRE_MES_PERIODO: '',

			ESTADO_PERIODO_CON: ABIERTO,

			NOMBRE_ESTADO_PERIODO_CON: N_ABIERTO,

			ESTADO_PERIODO_BAN: BLOQUEADO,

			NOMBRE_ESTADO_PERIODO_BAN: N_BLOQUEADO,

			ESTADO_PERIODO_VEN: BLOQUEADO,

			NOMBRE_ESTADO_PERIODO_VEN: N_BLOQUEADO,

			ESTADO_PERIODO_ACT: BLOQUEADO,

			NOMBRE_ESTADO_PERIODO_ACT: N_BLOQUEADO,

			ESTADO_PERIODO_INV: BLOQUEADO,

			NOMBRE_ESTADO_PERIODO_INV: N_BLOQUEADO,

			ESTADO_PERIODO_PLA: BLOQUEADO,

			NOMBRE_ESTADO_PERIODO_PLA: N_BLOQUEADO,

			ESTADO_PERIODO_COM: BLOQUEADO,

			NOMBRE_ESTADO_PERIODO_COM: N_BLOQUEADO,

			FECHA_CIERRE_CON: new Date(),

			FECHA_CIERRE_BAN: new Date(),

			FECHA_CIERRE_VEN: new Date(),

			FECHA_CIERRE_ACT: new Date(),

			FECHA_CIERRE_INV: new Date(),

			FECHA_CIERRE_PLA: new Date(),

			FECHA_CIERRE_COM: new Date(),

		};

	}



	override habilitar(): void {

		this.items = this.service.getItems(this.banderaMtto === UpdateType.Update);

	}



	private clavesPeriodoCoinciden(a: ConPeriodoContable, b: ConPeriodoContable): boolean {

		return Number(a.ANIO_PERIODO) === Number(b.ANIO_PERIODO) && Number(a.MES_PERIODO) === Number(b.MES_PERIODO);

	}



	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {

		if (!data || typeof data !== 'object') {

			return;

		}



		const record = this.service.enriquecer({ ...(data as ConPeriodoContable) });

		if (isAdd) {

			this.models.push(record);

			return;

		}



		const index = this.models.findIndex((item: ConPeriodoContable) => this.clavesPeriodoCoinciden(item, record));

		if (index >= 0) {

			this.models[index] = record;

		}

	}



	protected override quitarRegistroDeGrid(_keyValue: unknown): void {

		const row = this.pendingRemoveRow;

		if (!row) {

			return;

		}



		const index = this.models.findIndex((item: ConPeriodoContable) => this.clavesPeriodoCoinciden(item, row));

		if (index >= 0) {

			this.models.splice(index, 1);

		}

		this.pendingRemoveRow = null;

	}



	consultar(): void {

		this.consultarMtto({

			load: () => this.service.getAll(this.fillParam()),

			onData: (data) => {

				this.models = ((data as ConPeriodoContable[]) || []).map((row) => this.service.enriquecer(row));

			},

		});

	}



	override nuevo(): void {

		if (!this.asegurarEmpresaSesion()) {

			return;

		}

		super.nuevo();

	}



	private esPeriodoDuplicado(anio: number, mes: number): boolean {

		return this.service.existePeriodo(this.models, anio, mes);

	}



	private notificarPeriodoDuplicado(anio: number, mes: number): void {

		const nombreMes = this.service.getNombreMes(mes);

		this.notifyFx(

			`Ya existe el período ${nombreMes} ${anio}. Cada mes del año es un registro distinto; use Consultar para ver el listado completo.`,

			NotifyType.Warning,

			{ raw: true }

		);

	}



	guardar(): void {

		const { anio, mes } = this.service.normalizarClave(this.model);

		if (this.banderaMtto === UpdateType.Add && this.esPeriodoDuplicado(anio, mes)) {

			this.notificarPeriodoDuplicado(anio, mes);

			return;

		}



		this.guardarMtto({

			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),

			insert: () => this.service.insert(this.model),

			update: () => this.service.update(this.model),

		});

	}



	override cancelar(): void {

		super.cancelar(

			(item: any) =>

				item.ANIO_PERIODO === this.modelUpdate.ANIO_PERIODO && item.MES_PERIODO === this.modelUpdate.MES_PERIODO

		);

	}



	rowRemoving(e: any): void {

		this.pendingRemoveRow = e.data;

		this.rowRemovingMtto(e, {

			deleteFn: () =>

				this.service.delete({

					ANIO_PERIODO: e.data.ANIO_PERIODO,

					MES_PERIODO: e.data.MES_PERIODO,

				}),

		});

	}



	override get gridFocusedRowKey(): unknown {
		if (!this.isBrowse()) {
			return null;
		}
		const anio = this.model?.ANIO_PERIODO;
		const mes = this.model?.MES_PERIODO;
		if (this.esClaveGridInvalida(anio) || this.esClaveGridInvalida(mes)) {
			return null;
		}
		return [anio, mes];
	}



	override bloquear(): void {

		this.dataForm.instance.getEditor('ANIO_PERIODO')?.option('readOnly', true);

		this.dataForm.instance.getEditor('MES_PERIODO')?.option('readOnly', true);

		this.readOnly = true;

	}



	override setFocus() {

		setTimeout(() => {

			this.dataForm.instance.getEditor('ANIO_PERIODO')?.focus();

		});

	}

	//#endregion

}


