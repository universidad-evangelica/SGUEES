import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanLineaTrabajoConciliacion } from './models/ban-linea-trabajo-conciliacion';
import { BanLineaTrabajoConciliacionService } from './ban-linea-trabajo-conciliacion.service';

@Component({
	selector: 'app-ban-linea-trabajo-conciliacion',
	templateUrl: './ban-linea-trabajo-conciliacion.component.html',
})
export class BanLineaTrabajoConciliacionComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'la línea de trabajo';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_LINEA';
	protected override mttoCampoEstado = 'ESTADO_LINEA';
	protected override mttoEstadoDescribeField = 'NOMBRE_LINEA_TRABAJO';

	private readonly maintenanceSubtitulo = 'Mantenimiento de Líneas de Trabajo - Conciliación';

	//#region <Declarando Variales>
	mAUMENTA_DISMINUYE: any;
	readOnly = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanLineaTrabajoConciliacionService
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
		this.getAUMENTA_DISMINUYE();
	}

	getAUMENTA_DISMINUYE() {
		this.appInfoService
			.getLookUp('BAN_LINEA_TRABAJO_CONCILIACION', 'BAN_LISTA', 'GetAUMENTA_DISMINUYE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mAUMENTA_DISMINUYE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_LINEA?: number): any {
		return {
			CORR_LINEA: xCORR_LINEA ?? 0,
		};
	}

	override fillData(xModel?: BanLineaTrabajoConciliacion): BanLineaTrabajoConciliacion {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_LINEA: xModel.CORR_LINEA,
				NOMBRE_LINEA_TRABAJO: xModel.NOMBRE_LINEA_TRABAJO,
				AUMENTA_DISMINUYE: xModel.AUMENTA_DISMINUYE,
				ESTADO_LINEA: xModel.ESTADO_LINEA,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_LINEA: 0,
			NOMBRE_LINEA_TRABAJO: '',
			AUMENTA_DISMINUYE: 1,
			ESTADO_LINEA: true,
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
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_LINEA === this.modelUpdate.CORR_LINEA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_LINEA)),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_LINEA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_LINEA_TRABAJO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('AUMENTA_DISMINUYE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_LINEA')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_LINEA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('ESTADO_LINEA')?.option('readOnly', false);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_LINEA_TRABAJO')?.focus();
		});
	}
	//#endregion

	selectedLookUpNumerico(vRow: any): any {
		return parseInt(vRow[0].Key, 10);
	}
}
