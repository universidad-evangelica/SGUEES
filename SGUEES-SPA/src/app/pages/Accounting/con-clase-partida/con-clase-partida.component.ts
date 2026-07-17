import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConClasePartida } from './models/con-clase-partida';
import { ConClasePartidaService } from './con-clase-partida.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-clase-partida',
	templateUrl: './con-clase-partida.component.html',
})
export class ConClasePartidaComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'la clase de partida';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_CLASE_PARTIDA';
	//#region <Declarando Variales>
	mLINEA_AUMENTA: any[] = [];
	mLINEA_DISMINUYE: any[] = [];
	lineaLookupColumns: any[] = [
		{ dataField: 'CORR_LINEA', caption: 'Código', width: 80 },
		{ dataField: 'NOMBRE_LINEA_TRABAJO', caption: 'Línea', width: 280 },
	];
	readOnly = false;
	// #endregion

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

	//#region <Inicializando Opciones>
	ngOnInit(): void {		this.llenaComboBox();
		this.consultar();
	}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {		}
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getLINEA_AUMENTA();
		this.getLINEA_DISMINUYE();
	}

	getLINEA_AUMENTA() {
		this.appInfoService
			.getLookUp('CON_CLASE_PARTIDA', 'BAN_LINEA_TRABAJO_CONCILIACION', 'GetCORR_LINEA_AUMENTA', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mLINEA_AUMENTA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getLINEA_DISMINUYE() {
		this.appInfoService
			.getLookUp('CON_CLASE_PARTIDA', 'BAN_LINEA_TRABAJO_CONCILIACION', 'GetCORR_LINEA_DISMINUYE', undefined, environment.UrlCONTAAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mLINEA_DISMINUYE = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_CLASE_PARTIDA?: number): any {
		return {
			CORR_CLASE_PARTIDA: xCORR_CLASE_PARTIDA ?? 0,
		};
	}

	override fillData(xModel?: ConClasePartida): ConClasePartida {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_CLASE_PARTIDA: xModel.CORR_CLASE_PARTIDA,
				NOMBRE_CLASE_PARTIDA: xModel.NOMBRE_CLASE_PARTIDA,
				NOMBRE_CORTO_CLASE: xModel.NOMBRE_CORTO_CLASE,
				CORR_LINEA_AUMENTA: xModel.CORR_LINEA_AUMENTA,
				NOMBRE_LINEA_AUMENTA: xModel.NOMBRE_LINEA_AUMENTA,
				CORR_LINEA_DISMINUYE: xModel.CORR_LINEA_DISMINUYE,
				NOMBRE_LINEA_DISMINUYE: xModel.NOMBRE_LINEA_DISMINUYE,
				ACEPTA_MODIFICACION: xModel.ACEPTA_MODIFICACION,
				PARTIDA_CIERRE: xModel.PARTIDA_CIERRE,
				NOMBRE_REPORTE: xModel.NOMBRE_REPORTE,
				CODIGO_ODS: xModel.CODIGO_ODS,
			};
		}

		return {
			CORR_EMPRESA: 1,
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
		super.cancelar((item: any) => item.CORR_CLASE_PARTIDA === this.modelUpdate.CORR_CLASE_PARTIDA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_CLASE_PARTIDA)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_CLASE_PARTIDA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CLASE_PARTIDA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CORTO_CLASE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_REPORTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_ODS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACEPTA_MODIFICACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PARTIDA_CIERRE')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_CLASE_PARTIDA')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_CLASE_PARTIDA')?.focus();
		});
	}
	//#endregion

	selectedLookUpCORR_LINEA(vRow: any): any {
		return vRow[0].CORR_LINEA;
	}

	onLineaAumentaChanged(corrLinea: number): void {
		const linea = this.mLINEA_AUMENTA?.find((item: any) => item.CORR_LINEA === corrLinea);
		this.model.NOMBRE_LINEA_AUMENTA = linea?.NOMBRE_LINEA_TRABAJO ?? '';
	}

	onLineaDisminuyeChanged(corrLinea: number): void {
		const linea = this.mLINEA_DISMINUYE?.find((item: any) => item.CORR_LINEA === corrLinea);
		this.model.NOMBRE_LINEA_DISMINUYE = linea?.NOMBRE_LINEA_TRABAJO ?? '';
	}
}
