import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { MessageService } from 'primeng/api'; //Import para usar PrimeNG Toast
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { ScRequisicionPersonal } from './models/sc-requisicion-personal';

import { ScRequisicionPersonalService } from './sc-requisicion-personal.service';
import { ScRequisicionObservadoresService } from '../sc-requisicion-observadores/sc-requisicion-observadores.service';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sc-requisicion-personal',
  templateUrl: './sc-requisicion-personal.component.html',
  styleUrls: ['./sc-requisicion-personal.component.scss']
})
export class ScRequisicionPersonalComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRequisicionPersonalService,
		private observadoresService: ScRequisicionObservadoresService,
		//private messageService: MessageService, //Import para usar PrimeNG Toast

	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();


		this.columnsObservadores = this.service.getObservadoresColumns();
		this.summaryObservadores = this.service.getObservadoresSummary();
	}

	//Variables
	readOnly = false;
	mCORR_TIPO_MODALIDAD: any[] = [];
	mCORR_TIPO_CONTRATACION: any[] = [];
	mCORR_TIPO_VACANTE: any[] = [];

	/** Columnas del grid del tab (definidas en service.getTabDetalleColumns). */
	columnsTabDetalle: any[] = [];
	/** Summary del grid del tab. */
	summaryTabDetalle: any;

	/** Observadores (solo lectura) — data del endpoint GetLOGIN_SISTEMA_SC_REQUISICION_PERSONAL. */
	modelsObservadores: any[] = [];
	columnsObservadores: any[] = [];
	summaryObservadores: any;


	tipoModalidadLookupColumns: any[] = [
		{ dataField: 'CORR_TIPO_MODALIDAD', caption: 'Modalidad', width: 120 },
		{ dataField: 'MODALIDAD_NOMBRE', caption: 'Tipo Modalidad', width: 280 },
	];

	tipoContratacionLookupColumns: any[] = [
		{ dataField: 'CORR_TIPO_CONTRATACION', caption: 'Contratacion', width: 120 },
		{ dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Tipo Contratacion', width: 280 },
	];

	tipoVacanteLookupColumns: any[] = [
		{ dataField: 'CORR_TIPO_VACANTE', caption: 'Vacante', width: 120 },
		{ dataField: 'NOMBRE_TIPO_VACANTE', caption: 'Tipo Vacante', width: 280 },
	];

	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
		this.subTituloVentana = 'Proceso y control de requisiciones de personal';
	}

	//#region <Tabs dx-tab-panel — carga de datos>

	/**
	 * Carga la data de cada tab al entrar en edición.
	 * Invocar desde editarClick (override) o rowDblClick cuando banderaMtto = Update.
	 *
	 * Ejemplo con API:
	 *   this.service.getBitacora(this.fillParam(this.model.CORR_REQUISICION_PERSONAL))
	 *     .pipe(take(1))
	 *     .subscribe({ next: (r) => { if (r.Result) this.itemsTabDetalle = r.Data ?? []; } });
	 */
	cargarDatosTabs(): void {
		this.cargarObservadores();
	}

	/** Vacía los arrays de los tabs (útil al presionar Nuevo). */
	limpiarDatosTabs(): void {
		this.modelsObservadores = [];
	}

	/** Carga observadores desde SC_REQUISICION_OBSERVADORES (informativo). */
	cargarObservadores(): void {
		this.observadoresService
			.getForRequisicionPersonal(this.fillParam(this.model?.CORR_REQUISICION_PERSONAL))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.modelsObservadores = response.Data ?? [];
					} else {
						this.modelsObservadores = [];
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.modelsObservadores = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	/** Al crear registro nuevo, limpiar tabs (cuando se conecte API). */
	override nuevo(): void {
		super.nuevo();
		this.limpiarDatosTabs();
	}

	/** Al editar, cargar data de cada tab según CORR_REQUISICION_PERSONAL. */
	override editarClick(e: any): void {
		super.editarClick(e);
		this.cargarDatosTabs();
	}

	/** Al consultar (doble clic), también cargar observadores (patrón con-partida). */
	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.cargarDatosTabs();
	}

	//#endregion

	inicializaOpciones() {}

	llenaComboBox() {
		//this.getAllDepartamento();
		this.getCORR_TIPO_MODALIDAD();
		this.getCORR_TIPO_CONTRATACION();
		this.getCORR_TIPO_VACANTE();
	}	

	//listado de catalogos
	getCORR_TIPO_MODALIDAD(){
		this.appInfoService
		.getLookUp('SC_REQUISICION_PERSONAL', 'SC_TIPO_MODALIDAD', 'GetCORR_TIPO_MODALIDAD', undefined, environment.UrlSELECCIONCONTRATACIONAPI)
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.mCORR_TIPO_MODALIDAD = response.Data;
				}
			},
			error: (error: any) => {
				this.notifyFx(error, NotifyType.Error);
				//this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}

	getCORR_TIPO_CONTRATACION(){
		this.appInfoService
		.getLookUp('SC_REQUISICION_PERSONAL', 'SC_TIPO_CONTRATACION', 'GetCORR_TIPO_CONTRATACION', undefined, environment.UrlSELECCIONCONTRATACIONAPI)
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.mCORR_TIPO_CONTRATACION = response.Data;
				}
			},
			error: (error: any) => {
				this.notifyFx(error, NotifyType.Error);
				//this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}

	getCORR_TIPO_VACANTE(){
		this.appInfoService
		.getLookUp('SC_REQUISICION_PERSONAL', 'SC_TIPO_VACANTE', 'GetCORR_TIPO_VACANTE', undefined, environment.UrlSELECCIONCONTRATACIONAPI)
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.mCORR_TIPO_VACANTE = response.Data;
				}
			},
			error: (error: any) => {
				this.notifyFx(error, NotifyType.Error);
				//this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}


	fillParam(xCORR_REQUISICION?: number): any {
		if (xCORR_REQUISICION == undefined) {
			xCORR_REQUISICION = 0;
		}
		return {
			CORR_REQUISICION_PERSONAL: xCORR_REQUISICION,
		};
	}

	override fillData(xModel?: ScRequisicionPersonal): ScRequisicionPersonal {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_REQUISICION_PERSONAL: xModel.CORR_REQUISICION_PERSONAL,
				CORR_DESCRIPTOR: xModel.CORR_DESCRIPTOR,
				CORR_DEPARTAMENTO: xModel.CORR_DEPARTAMENTO,
				CORR_PUESTO: xModel.CORR_PUESTO,
				CORR_TIPO_MODALIDAD: xModel.CORR_TIPO_MODALIDAD,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION,
				CORR_TIPO_VACANTE: xModel.CORR_TIPO_VACANTE,
				CANTIDAD_PLAZAS: xModel.CANTIDAD_PLAZAS,
				PLAZAS_CUBIERTAS: xModel.PLAZAS_CUBIERTAS,
				FECHA_REQUISICION: xModel.FECHA_REQUISICION,
				JUSTIFICACION: xModel.JUSTIFICACION,
				CORR_EMPLEADO_SUSTITUTO: xModel.CORR_EMPLEADO_SUSTITUTO,
				SALARIO_MINIMO: xModel.SALARIO_MINIMO,
				SALARIO_MAXIMO: xModel.SALARIO_MAXIMO,
				CORR_ESTADO_REQUISICION: xModel.CORR_ESTADO_REQUISICION,
				FECHA_APROBACION: xModel.FECHA_APROBACION,
				FECHA_CIERRE: xModel.FECHA_CIERRE,
				TIEMPO_CONTRATO: xModel.TIEMPO_CONTRATO,
				HORARIO: xModel.HORARIO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_REQUISICION_PERSONAL: 0,
			CORR_DESCRIPTOR: 0,
			CORR_DEPARTAMENTO: 0,
			CORR_PUESTO: 0,
			CORR_TIPO_MODALIDAD: 0,
			CORR_TIPO_CONTRATACION: 0,
			CORR_TIPO_VACANTE: 0,
			CANTIDAD_PLAZAS: 0,
			PLAZAS_CUBIERTAS: 0,
			FECHA_REQUISICION: new Date(),
			JUSTIFICACION: '',
			CORR_EMPLEADO_SUSTITUTO: '',
			SALARIO_MINIMO: 0,
			SALARIO_MAXIMO: 0,
			CORR_ESTADO_REQUISICION: 0,
			FECHA_APROBACION: null,
			FECHA_CIERRE: null,
			TIEMPO_CONTRATO: 0,
			HORARIO: '',
			USUARIO_CREA: '',
			FECHA_CREA: new Date(),
			ESTACION_CREA: '',
			USUARIO_ACTU: '',
			FECHA_ACTU: new Date(),
			ESTACION_ACTU: '',
		};
	}

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data ?? [];
						console.log('Datos consultados:', this.models);
					} else {
						//this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
					}
				},
				error: (error: any) => {
					//this.messageService.add({ severity: 'error', summary: 'Error', detail: error?.message ?? error });
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_REQUISICION_PERSONAL === response.Data.CORR_REQUISICION_PERSONAL);
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
		super.cancelar((item: any) => item.CORR_REQUISICION_PERSONAL === this.modelUpdate.CORR_REQUISICION_PERSONAL);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_REQUISICION_PERSONAL))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = this.models.filter(
							(item: any) => item.CORR_REQUISICION_PERSONAL !== e.data.CORR_REQUISICION_PERSONAL
						);
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error?.message ?? error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_REQUISICION_PERSONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_REQUISICION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DESCRIPTOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_MODALIDAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_CONTRATACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_VACANTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIEMPO_CONTRATO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('HORARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_CIERRE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_APROBACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CANTIDAD_PLAZAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PLAZAS_CUBIERTAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SALARIO_MINIMO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SALARIO_MAXIMO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_ESTADO_REQUISICION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('JUSTIFICACION')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('MODALIDAD_NOMBRE')?.focus();
		});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	selectedLookUpNumerico(vRow: any): any {
		return parseInt(vRow[0].Key, 10);
	}

	selectedLookUpCORR_TIPO_MODALIDAD(vRow: any): any {
		return vRow[0].CORR_TIPO_MODALIDAD;
	}

	selectedLookUpCORR_TIPO_CONTRATACION(vRow: any): any {
		return vRow[0].CORR_TIPO_CONTRATACION;
	}

	selectedLookUpCORR_TIPO_VACANTE(vRow: any): any {
		return vRow[0].CORR_TIPO_VACANTE;
	}


}
