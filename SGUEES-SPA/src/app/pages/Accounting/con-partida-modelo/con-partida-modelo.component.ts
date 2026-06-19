import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConPartidaModelo } from './models/con-partida-modelo';
import { ConPartidaModeloService } from './con-partida-modelo.service';
import { ConPartidaModeloDetaService } from '../con-partida-modelo-deta/con-partida-modelo-deta.service';
import { ConPartidaModeloDeta } from '../con-partida-modelo-deta/models/con-partida-modelo-deta';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-con-partida-modelo',
	templateUrl: './con-partida-modelo.component.html',
	styleUrls: ['./con-partida-modelo.component.scss'],
})
export class ConPartidaModeloComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridDetalle', { static: false }) gridDetalle!: DxDataGridComponent;
	detalles: ConPartidaModeloDeta[] = [];
	readOnly = false;
	mESTADO_PARTIDA: any;
	btnVolver = 'Volver a Partidas';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private routerNavigate: Router,
		private service: ConPartidaModeloService,
		private detaService: ConPartidaModeloDetaService
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
		this.getESTADO_PARTIDA();
	}

	getESTADO_PARTIDA() {
		this.appInfoService
			.getLookUp('CON_PARTIDA_MODELO', 'CON_LISTA', 'GetESTADO_PARTIDA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_PARTIDA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	fillParam(xKey?: any): any {
		return { CORR_PARTIDA: xKey || 0 };
	}

	override fillData(xModel?: ConPartidaModelo): ConPartidaModelo {
		if (xModel !== undefined) {
			return { ...xModel };
		} else {
			return {
				CORR_EMPRESA: 0,
				CORR_CLASE_PARTIDA: 0,
				NOMBRE_CLASE_PARTIDA: '',
				CORR_PARTIDA: 0,
				NUMERO_DOCUMENTO: '',
				NOMBRE_PARTIDA: '',
				ESTADO_PARTIDA: '',
				NOMBRE_ESTADO_PARTIDA: '',
				CLASE_PARTIDA: '',
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_PARTIDA === response.Data.CORR_PARTIDA);
							this.models[vIndex] = response.Data;
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
		super.cancelar((item: any) => item.CORR_PARTIDA === this.modelUpdate.CORR_PARTIDA);
		this.detalles = [];
		this.readOnly = false;
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.consultarDetalles();
		this.readOnly = false;
	}

	override editarClick(e: any): void {
		super.editarClick(e);
		this.consultarDetalles();
		this.readOnly = false;
	}

	override nuevo(): void {
		super.nuevo();
		this.detalles = [];
		this.readOnly = false;
	}

	consultarDetalles() {
		this.detaService
			.getAll({ CORR_PARTIDA: this.model.CORR_PARTIDA })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detalles = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	agregarDetalle() {
		this.gridDetalle?.instance.addRow();
	}

	getDiferencia(): number {
		const totalCargo = this.detalles.reduce((sum, d) => sum + (d.MONTO_CARGO || 0), 0);
		const totalAbono = this.detalles.reduce((sum, d) => sum + (d.MONTO_ABONO || 0), 0);
		return totalCargo - totalAbono;
	}

	detalleRowInserting(e: any) {
		const deta: any = {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			CORR_CLASE_PARTIDA: this.model.CORR_CLASE_PARTIDA,
			CORR_PARTIDA: this.model.CORR_PARTIDA,
			...e.data,
		};
		this.detaService
			.insert(deta)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response.Result) {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					} else {
						this.consultarDetalles();
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	detalleRowUpdated(e: any) {
		const deta: any = {
			CORR_EMPRESA: this.model.CORR_EMPRESA,
			CORR_CLASE_PARTIDA: this.model.CORR_CLASE_PARTIDA,
			CORR_PARTIDA: this.model.CORR_PARTIDA,
			...e.data,
		};
		this.detaService
			.update(deta)
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

	detalleRowRemoving(e: any) {
		this.detaService
			.delete({ CORR_PARTIDA_DETA: e.data.CORR_PARTIDA_DETA })
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

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_PARTIDA))
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

	volverPartidas(): void {
		this.routerNavigate.navigateByUrl('/con-partida');
	}
}
