import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { MessageService } from 'primeng/api'; //Import para usar PrimeNG Toast
import { confirm } from 'devextreme/ui/dialog';
import { DxFormComponent } from 'devextreme-angular';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AuthService } from 'src/app/shared/services/auth.service';

import { ScRequisicionPersonal } from './models/sc-requisicion-personal';
import { ScRequisicionPersonalCandidato } from './models/sc-requisicion-personal-candidato';
import { ScExpedienteEntrevista } from '../sc-expediente-candidato/sc-expediente-entrevista/models/sc-expediente-entrevista';

import { ScRequisicionPersonalService } from './sc-requisicion-personal.service';
import { ScRequisicionObservadoresService } from '../sc-requisicion-observadores/sc-requisicion-observadores.service';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sc-requisicion-personal',
  templateUrl: './sc-requisicion-personal.component.html',
  styleUrls: ['./sc-requisicion-personal.component.scss']
})
export class ScRequisicionPersonalComponent extends CBaseComponent implements OnInit {
	@ViewChild('entrevistaForm', { static: false }) entrevistaForm?: DxFormComponent;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRequisicionPersonalService,
		private observadoresService: ScRequisicionObservadoresService,
		private messageService: MessageService, //Import para usar PrimeNG Toast
		private authService: AuthService,
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();


		this.columnsObservadores = this.service.getObservadoresColumns();
		this.summaryObservadores = this.service.getObservadoresSummary();
		this.itemsObservadorModal = this.observadoresService.getItemsObservadorModal();

		this.columnsBitacora = this.service.getBitacoraColumns();
		this.summaryBitacora = this.service.getBitacoraSummary();

		this.columnsCandidatos = this.service.getCandidatosColumns();
		this.summaryCandidatos = this.service.getCandidatosSummary();
		this.entrevistaColumns = this.service.getEntrevistaColumns();
		this.entrevistaItems = this.service.getEntrevistaItems();
	}

	//Variables
	readOnly = false;
	mCORR_TIPO_MODALIDAD: any[] = [];
	mCORR_TIPO_CONTRATACION: any[] = [];
	mCORR_TIPO_VACANTE: any[] = [];
	mLOGIN_SISTEMA: any[] = [];
	mCORR_UNIDAD: any[] = [];
	mCORR_DESCRIPTOR_PUESTO: any[] = [];

	/** Columnas del grid del tab (definidas en service.getTabDetalleColumns). */
	columnsTabDetalle: any[] = [];
	/** Summary del grid del tab. */
	summaryTabDetalle: any;

	/** Observadores — data del endpoint GetLOGIN_SISTEMA_SC_REQUISICION_PERSONAL. */
	modelsObservadores: any[] = [];
	columnsObservadores: any[] = [];
	summaryObservadores: any;

	/** Bitácora — data del endpoint GetCORR_BITACORA_SC_REQUISICION_PERSONAL. */
	modelsBitacora: any[] = [];
	columnsBitacora: any[] = [];
	summaryBitacora: any;

	/** Candidatos activos en proceso de selección asociados a la requisición. */
	modelsCandidatos: ScRequisicionPersonalCandidato[] = [];
	columnsCandidatos: any[] = [];
	summaryCandidatos: any;

	/** Workspace entrevistas (slide-over derecha) desde tab Candidatos. */
	workspaceEntrevistasVisible = false;
	workspaceEntrevistasAbierto = false;
	private workspaceEntrevistasCloseTimer: ReturnType<typeof setTimeout> | null = null;
	candidatoEntrevistaSeleccionado: ScRequisicionPersonalCandidato | null = null;
	entrevistas: ScExpedienteEntrevista[] = [];
	entrevistaColumns: any[] = [];
	entrevistaItems: any[] = [];
	entrevistaModel: ScExpedienteEntrevista = this.fillEntrevistaData();
	entrevistaReadOnly = false;
	guardandoEntrevista = false;

	get editandoEntrevista(): boolean {
		return (this.entrevistaModel?.CORR_EXPEDIENTE_ENTREVISTA ?? 0) > 0;
	}

	/** Modal agregar observador */
	popupObservadorVisible = false;
	modelObservador: any = { LOGIN_SISTEMA: '' };
	itemsObservadorModal: any[] = [];

	loginSistemaLookupColumns: any[] = [
		{ dataField: 'LOGIN_SISTEMA', caption: 'Login Sistema', width: 120 },
		{ dataField: 'NOMBRE_USUARIO', caption: 'Nombre Usuario', width: 250 },
	];

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

	unidadLookupColumns: any[] = [
		{ dataField: 'CORR_UNIDAD', caption: 'Unidad', width: 120 },
		{ dataField: 'NOMBRE_UNIDAD', caption: 'Nombre Unidad', width: 250 },
	];

	descriptorPuestoLookupColumns: any[] = [
		{ dataField: 'CORR_DESCRIPTOR_PUESTO', caption: 'Descriptor Puesto', width: 120 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Nombre Puesto', width: 250 },
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
	 */
	cargarDatosTabs(): void {
		this.cargarObservadores();
		this.cargarBitacora();
		this.cargarCandidatos();
	}

	/** Vacía los arrays de los tabs (útil al presionar Nuevo). */
	limpiarDatosTabs(): void {
		this.modelsObservadores = [];
		this.modelsBitacora = [];
		this.modelsCandidatos = [];
		this.cerrarWorkspaceEntrevistas(false);
	}

	/** Carga observadores desde SC_REQUISICION_OBSERVADORES. */
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

	/** Carga bitácora desde SC_REQUISICION_PERSONAL/GetCORR_BITACORA_SC_REQUISICION_PERSONAL. */
	cargarBitacora(): void {
		if (!this.model?.CORR_REQUISICION_PERSONAL || this.model.CORR_REQUISICION_PERSONAL <= 0) {
			this.modelsBitacora = [];
			return;
		}

		this.service
			.getBitacora(this.fillParam(this.model.CORR_REQUISICION_PERSONAL))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.modelsBitacora = response.Data ?? [];
					} else {
						this.modelsBitacora = [];
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.modelsBitacora = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	/** Carga los candidatos activos cuyo expediente ya está en proceso de selección. */
	cargarCandidatos(): void {
		if (!this.model?.CORR_REQUISICION_PERSONAL || this.model.CORR_REQUISICION_PERSONAL <= 0) {
			this.modelsCandidatos = [];
			return;
		}

		this.service
			.getCandidatos(this.fillParam(this.model.CORR_REQUISICION_PERSONAL))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.modelsCandidatos = response.Data ?? [];
					} else {
						this.modelsCandidatos = [];
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.modelsCandidatos = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	abrirModalObservador(): void {
		if (!this.model?.CORR_REQUISICION_PERSONAL || this.model.CORR_REQUISICION_PERSONAL <= 0) {
			this.notifyFx('Debe guardar la requisición antes de agregar observadores.', NotifyType.Warning);
			return;
		}
		this.modelObservador = { LOGIN_SISTEMA: '' };
		if (!this.mLOGIN_SISTEMA?.length) {
			this.getLOGIN_SISTEMA();
		}
		this.popupObservadorVisible = true;
	}

	cerrarModalObservador(): void {
		this.popupObservadorVisible = false;
		this.modelObservador = { LOGIN_SISTEMA: '' };
	}

	/** Alta de observador ligado a la requisición actual (mismo CreateAsync del API). */
	guardarObservadorRequisicion(): void {
		if (!this.modelObservador?.LOGIN_SISTEMA) {
			this.notifyFx('Debe seleccionar un usuario.', NotifyType.Warning);
			return;
		}
		if (!this.model?.CORR_REQUISICION_PERSONAL || this.model.CORR_REQUISICION_PERSONAL <= 0) {
			this.notifyFx('Debe guardar la requisición antes de agregar observadores.', NotifyType.Warning);
			return;
		}

		const payload = {
			CORR_REQUISICION_OBSERVADORES: 0,
			CORR_REQUISICION_PERSONAL: this.model.CORR_REQUISICION_PERSONAL,
			LOGIN_SISTEMA: this.modelObservador.LOGIN_SISTEMA,
			TIPO_OBSERVADOR: '',
			FECHA_ASIGNACION: new Date(),
			ACTIVO: true,
		};

		this.loadingVisible = true;
		this.observadoresService
			.guardarObservadorRequisicion(payload)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						//this.notifyFx('Observador agregado con éxito!', NotifyType.Success);
						this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: 'Observador agregado con éxito a su requisición'
					});
						this.cerrarModalObservador();
						this.cargarObservadores();
					} else {
						//this.notifyFx(response.ErrorMessage, NotifyType.Error);
						this.messageService.add({
							severity: 'warn',
							summary: 'Validacion',
							detail: response.ErrorMessage
						});
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					//this.notifyFx(error, NotifyType.Error);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error
					});
					this.loadingVisible = false;
				},
			});
	}

	/** Al crear registro nuevo, limpiar tabs (cuando se conecte API). */
	override nuevo(): void {
		super.nuevo();
		this.limpiarDatosTabs();
		this.cerrarModalObservador();
		this.mCORR_DESCRIPTOR_PUESTO = []; // Sin unidad aún → sin listado de descriptores
		// Ocultar campos condicionales al iniciar un registro nuevo
		this.model.ES_PERMANENTE = true;
		this.model.REQUIERE_SUSTITUCION = false;
		setTimeout(() => {
			this.aplicarVisibilidadTiempoContrato(true); // ES_PERMANENTE=true → ocultar TIEMPO_CONTRATO
			this.aplicarVisibilidadEmpleadoSustituto(false); // REQUIERE_SUSTITUCION=false → ocultar sustituto
		}, 0);
	}

	/** Al editar, cargar data de cada tab según CORR_REQUISICION_PERSONAL. */
	override editarClick(e: any): void {
		super.editarClick(e);
		this.cargarDatosTabs();
		// Precargar descriptores de la unidad del registro + visibilidad de campos condicionales
		setTimeout(() => {
			this.getCORR_DESCRIPTOR_PUESTO();
			this.sincronizarVisibilidadTiempoContrato();
			this.sincronizarVisibilidadEmpleadoSustituto();
		}, 0);
	}

	/** Al consultar (doble clic), también cargar observadores (patrón con-partida). */
	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.cargarDatosTabs();
		// Precargar descriptores de la unidad del registro + visibilidad de campos condicionales
		setTimeout(() => {
			this.getCORR_DESCRIPTOR_PUESTO();
			this.sincronizarVisibilidadTiempoContrato();
			this.sincronizarVisibilidadEmpleadoSustituto();
		}, 0);
	}

	//#endregion

	inicializaOpciones() {}

	llenaComboBox() {
		//this.getAllDepartamento();
		this.getCORR_TIPO_MODALIDAD();
		this.getCORR_TIPO_CONTRATACION();
		this.getCORR_TIPO_VACANTE();
		this.getLOGIN_SISTEMA();
		this.getCORR_UNIDAD();
	}	

	//listado de catalogos
	getLOGIN_SISTEMA() {
		this.appInfoService
			.getLookUp('SC_REQUISICION_PERSONAL', 'SEG_USUARIO', 'GetLOGIN_SISTEMA', undefined, environment.UrlSEGURIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mLOGIN_SISTEMA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

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

	getCORR_UNIDAD(){
		this.appInfoService
		.getLookUp('SC_REQUISICION_PERSONAL', 'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES', 'GetCORR_UNIDAD', undefined, environment.UrlSELECCIONCONTRATACIONAPI)
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.mCORR_UNIDAD = response.Data;
				}
			},
			error: (error: any) => {
				this.notifyFx(error, NotifyType.Error);
				//this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}

	getCORR_DESCRIPTOR_PUESTO(corrUnidad?: number): void {
		const unidad = corrUnidad ?? this.model?.CORR_UNIDAD;
		if (!unidad || unidad <= 0) {
			this.mCORR_DESCRIPTOR_PUESTO = [];
			return;
		}

		this.service
			.getDescriptorPuesto({ CORR_UNIDAD: unidad })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DESCRIPTOR_PUESTO = response.Data ?? [];
					} else {
						this.mCORR_DESCRIPTOR_PUESTO = [];
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.mCORR_DESCRIPTOR_PUESTO = [];
					this.notifyFx(error, NotifyType.Error);
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
				CORR_DESCRIPTOR_PUESTO: xModel.CORR_DESCRIPTOR_PUESTO,
				CORR_UNIDAD: xModel.CORR_UNIDAD,
				NOMBRE_PUESTO_SOLICITADO: xModel.NOMBRE_PUESTO_SOLICITADO,
				CORR_TIPO_MODALIDAD: xModel.CORR_TIPO_MODALIDAD,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION,
				CORR_TIPO_VACANTE: xModel.CORR_TIPO_VACANTE,
				CANTIDAD_PLAZAS: xModel.CANTIDAD_PLAZAS,
				PLAZAS_CUBIERTAS: xModel.PLAZAS_CUBIERTAS,
				FECHA_REQUISICION: xModel.FECHA_REQUISICION,
				JUSTIFICACION: xModel.JUSTIFICACION,
				CORR_EMPLEADO_SUSTITUTO: xModel.CORR_EMPLEADO_SUSTITUTO,
				SALARIO: xModel.SALARIO,
				CORR_ESTADO_REQUISICION: xModel.CORR_ESTADO_REQUISICION,
				FECHA_APROBACION: xModel.FECHA_APROBACION,
				FECHA_CIERRE: xModel.FECHA_CIERRE,
				TIEMPO_CONTRATO: xModel.TIEMPO_CONTRATO,
				HORARIO: xModel.HORARIO,
				ES_PERMANENTE: xModel.ES_PERMANENTE,
				REQUIERE_SUSTITUCION: xModel.REQUIERE_SUSTITUCION,
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
			CORR_DESCRIPTOR_PUESTO: 0,
			CORR_UNIDAD: 0,
			NOMBRE_PUESTO_SOLICITADO: '',
			CORR_TIPO_MODALIDAD: 0,
			CORR_TIPO_CONTRATACION: 0,
			CORR_TIPO_VACANTE: 0,
			CANTIDAD_PLAZAS: 0,
			PLAZAS_CUBIERTAS: 0,
			FECHA_REQUISICION: new Date(),
			JUSTIFICACION: '',
			CORR_EMPLEADO_SUSTITUTO: '',
			SALARIO: 0,
			CORR_ESTADO_REQUISICION: 1, // Default: Borrador
			FECHA_APROBACION: null,
			FECHA_CIERRE: null,
			TIEMPO_CONTRATO: 0,
			HORARIO: '',
			ES_PERMANENTE: true, // Nuevo: ocultar TIEMPO_CONTRATO hasta elegir contratación
			REQUIERE_SUSTITUCION: false, // Nuevo: ocultar sustituto hasta elegir vacante
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
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
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

	/**
	 * Eliminar un observador de la requisición.
	 * Valida que no sea de TIPO_OBSERVADOR = 'DEFECTO'; si lo es, no permite eliminar.
	 * Solo requiere CORR_REQUISICION_OBSERVADORES para eliminar y luego refresca el grid.
	 */
	rowRemovingObservador(data: any): void {
		if (!data) {
			return;
		}

		if ((data.TIPO_OBSERVADOR || '').trim().toUpperCase() === 'DEFECTO') {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validación',
				detail: 'No se puede eliminar porque es un observador por defecto.',
			});
			return;
		}

		this.confirmaAccion('Confirmación', '¿Está seguro de eliminar el observador seleccionado?', () => {
			this.loadingVisible = true;
			this.observadoresService
				.delete({ CORR_REQUISICION_OBSERVADORES: data.CORR_REQUISICION_OBSERVADORES })
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.messageService.add({
								severity: 'success',
								summary: 'Éxito',
								detail: 'Observador eliminado con éxito.',
							});
							this.cargarObservadores();
						} else {
							this.messageService.add({
								severity: 'warn',
								summary: 'Validación',
								detail: response.ErrorMessage,
							});
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error,
						});
						this.loadingVisible = false;
					},
				});
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
		this.dataForm.instance.getEditor('CORR_EMPLEADO_SUSTITUTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_CIERRE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_APROBACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CANTIDAD_PLAZAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PLAZAS_CUBIERTAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SALARIO_MINIMO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SALARIO_MAXIMO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('JUSTIFICACION')?.option('readOnly', true);
	}

	/** Label del chip de estado (solo lectura). */
	getEstadoRequisicionLabel(corrEstado?: number): string {
		return this.service.getEstadoRequisicionLabel(corrEstado ?? this.model?.CORR_ESTADO_REQUISICION);
	}

	/** Clase CSS del chip de estado (solo lectura). */
	getEstadoRequisicionBadgeClass(corrEstado?: number): string {
		return this.service.getEstadoRequisicionBadgeClass(corrEstado ?? this.model?.CORR_ESTADO_REQUISICION);
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

	selectedLookUpLOGIN_SISTEMA(vRow: any): any {
		return vRow[0].LOGIN_SISTEMA;
	}

	/**
	 * Al elegir unidad: limpia el descriptor dependiente y recarga el listado
	 * vía GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL (filtrado por CORR_UNIDAD).
	 * Arrow function para conservar this (se pasa a app-data-lookup).
	 */
	selectedLookUpCORR_UNIDAD = (vRow: any): any => {
		const corrUnidad = vRow[0].CORR_UNIDAD;
		// Cambió la unidad → el descriptor anterior ya no aplica
		this.model.CORR_DESCRIPTOR_PUESTO = 0;
		this.model.NOMBRE_PUESTO = '';
		this.mCORR_DESCRIPTOR_PUESTO = [];
		// Diferir la carga para no remontar el lookup de unidad a mitad de la selección
		setTimeout(() => this.getCORR_DESCRIPTOR_PUESTO(corrUnidad), 0);
		return corrUnidad;
	};

	/**
	 * Al elegir descriptor: guarda también NOMBRE_PUESTO (snapshot del lookup).
	 */
	selectedLookUpCORR_DESCRIPTOR_PUESTO = (vRow: any): any => {
		this.model.NOMBRE_PUESTO = vRow?.[0]?.NOMBRE_PUESTO ?? '';
		return vRow[0].CORR_DESCRIPTOR_PUESTO;
	};

	/**
	 * Arrow function para conservar el contexto del componente (this),
	 * ya que se pasa como referencia a app-data-lookup [selectedRowKeys].
	 * Además de retornar el valor, alterna la visibilidad de TIEMPO_CONTRATO.
	 */
	selectedLookUpCORR_TIPO_CONTRATACION = (vRow: any): any => {
		const corr = vRow[0].CORR_TIPO_CONTRATACION;
		const esPermanente = vRow?.[0]?.ES_PERMANENTE;
		this.model.ES_PERMANENTE = esPermanente === true;
		// Si pasa a permanente, limpiar meses que ya no aplican.
		if (this.model.ES_PERMANENTE) {
			this.model.TIEMPO_CONTRATO = 0;
		}
		// Diferir itemOption: si se ejecuta aquí, el form remonta el template
		// del lookup y el drop-down queda sin texto aunque el model sí tenga valor.
		setTimeout(() => this.aplicarVisibilidadTiempoContrato(esPermanente), 0);
		return corr;
	};

	/**
	 * Muestra TIEMPO_CONTRATO cuando ES_PERMANENTE es distinto de true
	 * (contrato no permanente). Si es permanente, lo oculta.
	 * También ajusta el colSpan de HORARIO para que la fila siempre sume 8
	 * (sin huecos: si queda espacio libre, CORR_EMPLEADO_SUSTITUTO / JUSTIFICACION se encogen).
	 */
	aplicarVisibilidadTiempoContrato(esPermanente: boolean | null | undefined): void {
		const mostrarTiempoContrato = esPermanente !== true;
		const form = this.dataForm?.instance;
		if (!form) {
			return;
		}

		form.itemOption('TIEMPO_CONTRATO', 'visible', mostrarTiempoContrato);
		// Visible: TIEMPO(2)+HORARIO(6)=8
		// Oculto:  HORARIO(8)=8  → filas siguientes (sustituto / justificación) arrancan a colSpan 8
		form.itemOption('HORARIO', 'colSpan', mostrarTiempoContrato ? 5 : 7);
	}

	/**
	 * Sincroniza la visibilidad de TIEMPO_CONTRATO a partir del modelo cargado
	 * (edición/consulta), resolviendo ES_PERMANENTE del tipo de contratación por su código.
	 */
	sincronizarVisibilidadTiempoContrato(): void {
		const corr = this.model?.CORR_TIPO_CONTRATACION;
		const item = (this.mCORR_TIPO_CONTRATACION || []).find(
			(x: any) => Number(x.CORR_TIPO_CONTRATACION) === Number(corr)
		);
		// Sin tipo seleccionado → tratar como permanente (ocultar TIEMPO_CONTRATO)
		const esPermanente = item ? item.ES_PERMANENTE : true;
		this.model.ES_PERMANENTE = esPermanente === true;
		this.aplicarVisibilidadTiempoContrato(esPermanente);
	}

		/**
	 * Arrow function para conservar this (mismo patrón que CORR_TIPO_CONTRATACION).
	 * Evalúa REQUIERE_SUSTITUCION del lookup y muestra/oculta CORR_EMPLEADO_SUSTITUTO.
	 */
	selectedLookUpCORR_TIPO_VACANTE = (vRow: any): any => {
		const corr = vRow[0].CORR_TIPO_VACANTE;
		const requiereSustitucion = vRow?.[0]?.REQUIERE_SUSTITUCION;
		this.model.REQUIERE_SUSTITUCION = requiereSustitucion === true;
		// Si ya no requiere sustitución, limpiar el empleado seleccionado.
		if (!this.model.REQUIERE_SUSTITUCION) {
			this.model.CORR_EMPLEADO_SUSTITUTO = '';
		}
		// Diferir itemOption para no remontar el lookup a mitad de la selección
		setTimeout(() => this.aplicarVisibilidadEmpleadoSustituto(requiereSustitucion), 0);
		return corr;
	};

	/**
	 * Muestra CORR_EMPLEADO_SUSTITUTO (colSpan 8) solo cuando REQUIERE_SUSTITUCION === true.
	 * En cualquier otro caso lo oculta.
	 */
	aplicarVisibilidadEmpleadoSustituto(requiereSustitucion: boolean | null | undefined): void {
		const mostrarSustituto = requiereSustitucion === true;
		const form = this.dataForm?.instance;
		if (!form) {
			return;
		}

		form.itemOption('CORR_EMPLEADO_SUSTITUTO', 'visible', mostrarSustituto);
		// Reforzar ancho completo al mostrarse (antes de JUSTIFICACION)
		if (mostrarSustituto) {
			form.itemOption('CORR_EMPLEADO_SUSTITUTO', 'colSpan', 8);
		}
	}

	/**
	 * Sincroniza la visibilidad de CORR_EMPLEADO_SUSTITUTO al editar/consultar,
	 * resolviendo REQUIERE_SUSTITUCION del tipo de vacante por su código.
	 */
	sincronizarVisibilidadEmpleadoSustituto(): void {
		const corr = this.model?.CORR_TIPO_VACANTE;
		const item = (this.mCORR_TIPO_VACANTE || []).find(
			(x: any) => Number(x.CORR_TIPO_VACANTE) === Number(corr)
		);
		// Sin vacante seleccionada → ocultar sustituto
		const requiereSustitucion = item ? item.REQUIERE_SUSTITUCION : false;
		this.model.REQUIERE_SUSTITUCION = requiereSustitucion === true;
		this.aplicarVisibilidadEmpleadoSustituto(requiereSustitucion);
	}

	//#region <Workspace Entrevistas — tab Candidatos>

	/** Login de sesión (nameid del token). */
	private getLoginSesion(): string {
		return `${this.appInfoService.getUsuario() ?? ''}`.trim();
	}

	/** Nombre visible del usuario logueado (unique_name del token). */
	private getNombreUsuarioSesion(): string {
		const nombre = `${this.authService.decodedToken?.unique_name ?? ''}`.trim();
		return nombre || this.getLoginSesion();
	}

	/**
	 * Desde requisición solo se edita/elimina si:
	 * - la entrevista la creó el usuario de sesión, y
	 * - el estado actual es PROGRAMADA.
	 */
	puedeGestionarEntrevista(row?: ScExpedienteEntrevista | null): boolean {
		if (!row || (row.CORR_EXPEDIENTE_ENTREVISTA ?? 0) <= 0) {
			return true; // alta nueva
		}
		const esMia =
			`${row.USUARIO_CREA ?? ''}`.trim().toLowerCase() === this.getLoginSesion().toLowerCase();
		const esProgramada =
			`${row.ESTADO_ENTREVISTA ?? ''}`.trim().toUpperCase() === 'PROGRAMADA';
		return esMia && esProgramada;
	}

	abrirWorkspaceEntrevistas(candidato: ScRequisicionPersonalCandidato): void {
		if (!candidato?.CORR_EXPEDIENTE_CANDIDATO || !candidato?.CORR_SOLICITUD_EMPLEO) {
			this.notifyFx(
				'El candidato no tiene expediente/solicitud válidos para registrar entrevistas.',
				NotifyType.Warning
			);
			return;
		}

		this.candidatoEntrevistaSeleccionado = candidato;
		this.entrevistas = [];
		this.nuevaEntrevista();
		this.workspaceEntrevistasVisible = true;
		setTimeout(() => {
			this.workspaceEntrevistasAbierto = true;
		}, 20);
		this.consultarEntrevistas();
	}

	cerrarWorkspaceEntrevistas(animar = true): void {
		if (this.workspaceEntrevistasCloseTimer) {
			clearTimeout(this.workspaceEntrevistasCloseTimer);
			this.workspaceEntrevistasCloseTimer = null;
		}

		if (!animar || !this.workspaceEntrevistasVisible) {
			this.workspaceEntrevistasAbierto = false;
			this.workspaceEntrevistasVisible = false;
			this.candidatoEntrevistaSeleccionado = null;
			this.entrevistas = [];
			this.entrevistaReadOnly = false;
			return;
		}

		this.workspaceEntrevistasAbierto = false;
		this.workspaceEntrevistasCloseTimer = setTimeout(() => {
			this.workspaceEntrevistasVisible = false;
			this.candidatoEntrevistaSeleccionado = null;
			this.entrevistas = [];
			this.entrevistaReadOnly = false;
			this.workspaceEntrevistasCloseTimer = null;
		}, 280);
	}

	consultarEntrevistas(): void {
		const corrExpediente = this.candidatoEntrevistaSeleccionado?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		const corrSolicitud = this.candidatoEntrevistaSeleccionado?.CORR_SOLICITUD_EMPLEO ?? 0;
		if (corrExpediente <= 0 || corrSolicitud <= 0) {
			this.entrevistas = [];
			return;
		}

		this.service
			.getEntrevistasCandidato(corrExpediente, corrSolicitud)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.entrevistas = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => {
					this.entrevistas = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	fillEntrevistaData(xModel?: ScExpedienteEntrevista): ScExpedienteEntrevista {
		if (xModel) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO: xModel.CORR_EXPEDIENTE_CANDIDATO,
				CORR_EXPEDIENTE_ENTREVISTA: xModel.CORR_EXPEDIENTE_ENTREVISTA,
				CORR_SOLICITUD_EMPLEO: xModel.CORR_SOLICITUD_EMPLEO,
				TIPO_ENTREVISTA: xModel.TIPO_ENTREVISTA,
				FECHA_ENTREVISTA: xModel.FECHA_ENTREVISTA,
				ENTREVISTADOR: xModel.ENTREVISTADOR,
				ESTADO_ENTREVISTA: xModel.ESTADO_ENTREVISTA,
				RESULTADO_ENTREVISTA: xModel.RESULTADO_ENTREVISTA ?? '',
				RESUMEN_ENTREVISTA: xModel.RESUMEN_ENTREVISTA ?? '',
				USUARIO_CREA: xModel.USUARIO_CREA,
			};
		}

		return {
			CORR_EMPRESA: this.model?.CORR_EMPRESA ?? 1,
			CORR_EXPEDIENTE_CANDIDATO: this.candidatoEntrevistaSeleccionado?.CORR_EXPEDIENTE_CANDIDATO ?? 0,
			CORR_EXPEDIENTE_ENTREVISTA: 0,
			CORR_SOLICITUD_EMPLEO: this.candidatoEntrevistaSeleccionado?.CORR_SOLICITUD_EMPLEO ?? 0,
			TIPO_ENTREVISTA: '',
			FECHA_ENTREVISTA: new Date(),
			ENTREVISTADOR: this.getNombreUsuarioSesion(),
			ESTADO_ENTREVISTA: 'PROGRAMADA',
			RESULTADO_ENTREVISTA: '',
			RESUMEN_ENTREVISTA: '',
			USUARIO_CREA: this.getLoginSesion(),
		};
	}

	nuevaEntrevista(): void {
		this.entrevistaReadOnly = false;
		this.entrevistaModel = this.fillEntrevistaData();
		this.syncEntrevistaForm();
	}

	editarEntrevista(row: ScExpedienteEntrevista): void {
		if (!row) {
			return;
		}
		this.entrevistaReadOnly = !this.puedeGestionarEntrevista(row);
		this.entrevistaModel = this.fillEntrevistaData(row);
		this.syncEntrevistaForm();
	}

	onEntrevistaRowClick(e: any): void {
		if (e?.rowType && e.rowType !== 'data') {
			return;
		}
		this.editarEntrevista(e?.data);
	}

	guardarEntrevista(): void {
		if (this.guardandoEntrevista || this.entrevistaReadOnly) {
			return;
		}

		if (!this.puedeGestionarEntrevista(this.entrevistaModel)) {
			this.notifyFx(
				'Solo puede editar entrevistas propias en estado Programada.',
				NotifyType.Warning
			);
			return;
		}

		this.entrevistaModel.CORR_EXPEDIENTE_CANDIDATO =
			this.candidatoEntrevistaSeleccionado?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		this.entrevistaModel.CORR_SOLICITUD_EMPLEO =
			this.candidatoEntrevistaSeleccionado?.CORR_SOLICITUD_EMPLEO ?? 0;

		if (!this.service.esValidoEntrevista(this.entrevistaModel, this.notifyFx.bind(this))) {
			return;
		}

		const esNuevo = (this.entrevistaModel.CORR_EXPEDIENTE_ENTREVISTA ?? 0) <= 0;
		this.guardandoEntrevista = true;
		const req = esNuevo
			? this.service.insertEntrevistaFromRequisicion(this.entrevistaModel)
			: this.service.updateEntrevistaFromRequisicion(this.entrevistaModel);

		req.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.guardandoEntrevista = false;
				if (!response?.Result) {
					this.notifyFx(
						response?.ErrorMessage || 'No se pudo guardar la entrevista.',
						NotifyType.Error
					);
					return;
				}
				this.notifyFx(
					esNuevo ? 'Entrevista registrada.' : 'Entrevista actualizada.',
					NotifyType.Success
				);
				this.nuevaEntrevista();
				this.consultarEntrevistas();
			},
			error: (err: any) => {
				this.guardandoEntrevista = false;
				this.notifyFx(
					err?.error?.ErrorMessage || err?.message || 'Error al guardar la entrevista.',
					NotifyType.Error
				);
			},
		});
	}

	async eliminarEntrevista(row: ScExpedienteEntrevista): Promise<void> {
		if (!this.puedeGestionarEntrevista(row)) {
			this.notifyFx(
				'Solo puede eliminar entrevistas propias en estado Programada.',
				NotifyType.Warning
			);
			return;
		}

		const corr = Number(row?.CORR_EXPEDIENTE_ENTREVISTA ?? 0);
		const corrExpediente = this.candidatoEntrevistaSeleccionado?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		if (corr <= 0 || corrExpediente <= 0) {
			return;
		}

		const ok = await confirm(`¿Eliminar la entrevista #${corr}?`, 'Confirmar eliminación');
		if (!ok) {
			return;
		}

		this.service
			.deleteEntrevistaFromRequisicion(corrExpediente, corr)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result) {
						this.notifyFx(
							response?.ErrorMessage || 'No se pudo eliminar la entrevista.',
							NotifyType.Error
						);
						return;
					}
					this.notifyFx('Entrevista eliminada.', NotifyType.Success);
					if (this.entrevistaModel.CORR_EXPEDIENTE_ENTREVISTA === corr) {
						this.nuevaEntrevista();
					}
					this.consultarEntrevistas();
				},
				error: (err: any) => {
					this.notifyFx(
						err?.error?.ErrorMessage || err?.message || 'Error al eliminar la entrevista.',
						NotifyType.Error
					);
				},
			});
	}

	private syncEntrevistaForm(): void {
		setTimeout(() => this.entrevistaForm?.instance?.option('formData', this.entrevistaModel));
	}

	//#endregion

}
