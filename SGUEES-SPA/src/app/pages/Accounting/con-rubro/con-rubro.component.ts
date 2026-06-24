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
	@ViewChild('gridNiveles', { static: false }) gridNiveles!: DxDataGridComponent;
	niveles: ConRubroNivel[] = [];
	readOnly = false;
	mCLASE_RUBRO: any;

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

	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}

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
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	fillParam(xKey?: any): any {
		return { CODIGO_RUBRO: xKey || 0 };
	}

	override fillData(xModel?: ConRubro): ConRubro {
		if (xModel !== undefined) {
			return { ...xModel };
		} else {
			return {
				CORR_EMPRESA: 0,
				CODIGO_RUBRO: '',
				NOMBRE_RUBRO: '',
				ES_DEBE: false,
				ES_HABER: false,
				CLASE_RUBRO: '',
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
							const vIndex = this.models.findIndex((item: any) => item.CODIGO_RUBRO === response.Data.CODIGO_RUBRO);
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

	override nuevo(): void {
		super.nuevo();
		this.niveles = [];
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

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CODIGO_RUBRO))
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
}
