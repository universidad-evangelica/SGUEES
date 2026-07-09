import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

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

	//#region <Manejo de Combos>
	llenaComboBox() {}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number): any {
		if (xANIO_PERIODO == undefined) {
			xANIO_PERIODO = 0;
		}
		return { ANIO_PERIODO: xANIO_PERIODO };
	}

	override fillData(xModel?: ConPeriodoContable): ConPeriodoContable {
		if (xModel !== undefined) {
			return { ...xModel };
		} else {
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
	}

	override habilitar(): void {
		this.items = this.service.getItems(this.banderaMtto === UpdateType.Update);
	}

	consultar() {
		this.loadingVisible = true;
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = (response.Data || []).map((r: any) => this.service.enriquecer(r));
					} else {
						this.models = [];
						this.notifyFx(response.ErrorMessage || 'No se pudo consultar los períodos', NotifyType.Error);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.models = [];
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
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

	private manejarErrorGuardar(error: any, anio: number, mes: number): void {
		const mensaje =
			typeof error === 'string'
				? error
				: error?.ErrorMessage || error?.error?.ErrorMessage || '';
		const errorCode = typeof error === 'object' ? error?.ErrorCode ?? error?.error?.ErrorCode : undefined;
		const texto = `${mensaje}`.toLowerCase();
		const esDuplicado =
			errorCode === 2627 ||
			texto.includes('ya existe el período') ||
			texto.includes('ya existe un período') ||
			texto.includes('duplicad');

		if (esDuplicado) {
			this.consultar();
			this.notificarPeriodoDuplicado(anio, mes);
			return;
		}

		if (typeof error === 'string') {
			this.notifyFx(error, NotifyType.Error);
			return;
		}

		this.notifyApiResponse(error);
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		const { anio, mes } = this.service.normalizarClave(this.model);

		if (this.banderaMtto === UpdateType.Add && this.esPeriodoDuplicado(anio, mes)) {
			this.notificarPeriodoDuplicado(anio, mes);
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
							this.consultar();
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
						} else {
							this.manejarErrorGuardar(response, anio, mes);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.manejarErrorGuardar(error, anio, mes);
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
							this.consultar();
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
						} else {
							this.manejarErrorGuardar(response, anio, mes);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.manejarErrorGuardar(error, anio, mes);
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar(
			(item: any) =>
				item.ANIO_PERIODO === this.modelUpdate.ANIO_PERIODO && item.MES_PERIODO === this.modelUpdate.MES_PERIODO
		);
	}

	rowRemoving(e: any) {
		this.service
			.delete({
				ANIO_PERIODO: e.data.ANIO_PERIODO,
				MES_PERIODO: e.data.MES_PERIODO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						this.consultar();
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
