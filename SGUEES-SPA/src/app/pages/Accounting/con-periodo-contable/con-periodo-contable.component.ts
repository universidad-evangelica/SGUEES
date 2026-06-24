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

	ngOnInit(): void {
		this.inicializaOpciones();
		this.consultar();
	}

	inicializaOpciones() {}

	fillParam(xKey?: any): any {
		return { ANIO_PERIODO: xKey || 0 };
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
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = (response.Data || []).map((r: any) => this.service.enriquecer(r));
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

		if (this.banderaMtto === UpdateType.Add) {
			const duplicado = (this.models || []).some(
				(m: any) => m.ANIO_PERIODO === this.model.ANIO_PERIODO && m.MES_PERIODO === this.model.MES_PERIODO
			);
			if (duplicado) {
				this.notifyFx('Ya existe un período registrado para ese Año y Mes', NotifyType.Warning);
				return;
			}
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = this.service.enriquecer(response.Data);
							this.models.push(this.model);
							this.AsignaStatus(UpdateType.Browse);
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
							this.model = this.service.enriquecer(response.Data);
							const vIndex = this.models.findIndex(
								(item: any) =>
									item.ANIO_PERIODO === response.Data.ANIO_PERIODO && item.MES_PERIODO === response.Data.MES_PERIODO
							);
							this.models[vIndex] = this.model;
							this.AsignaStatus(UpdateType.Browse);
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
		super.cancelar((item: any) => item.ANIO_PERIODO === this.modelUpdate.ANIO_PERIODO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.ANIO_PERIODO))
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
