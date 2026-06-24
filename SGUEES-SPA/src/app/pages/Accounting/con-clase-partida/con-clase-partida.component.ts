import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConClasePartida } from './models/con-clase-partida';
import { ConClasePartidaService } from './con-clase-partida.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-clase-partida',
	templateUrl: './con-clase-partida.component.html',
	styleUrls: ['./con-clase-partida.component.scss'],
})
export class ConClasePartidaComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConClasePartidaService
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
		return { CORR_CLASE_PARTIDA: xKey || 0 };
	}

	override fillData(xModel?: ConClasePartida): ConClasePartida {
		if (xModel !== undefined) {
			return { ...xModel };
		} else {
			return {
				CORR_EMPRESA: 0,
				CORR_CLASE_PARTIDA: 0,
				NOMBRE_CLASE_PARTIDA: '',
				NOMBRE_CORTO_CLASE: '',
				CORR_LINEA_AUMENTA: 0,
				NOMBRE_LINEA_AUMENTA: '',
				CORR_LINEA_DISMINUYE: 0,
				NOMBRE_LINEA_DISMINUYE: '',
				ACEPTA_MODIFICACION: false,
				PARTIDA_CIERRE: false,
				NOMBRE_REPORTE: '',
				CODIGO_ODS: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_CLASE_PARTIDA === response.Data.CORR_CLASE_PARTIDA);
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
		super.cancelar((item: any) => item.CORR_CLASE_PARTIDA === this.modelUpdate.CORR_CLASE_PARTIDA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_CLASE_PARTIDA))
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
