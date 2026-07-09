import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { DxTabPanelComponent } from 'devextreme-angular/ui/tab-panel';
import { take, concatMap, map } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import {
	cleanApiMessage,
	getApiErrorMessage,
	isEmpresaFkErrorMessage,
	isEmpresaWarningResponse,
	mapApiErrorMessage,
} from 'src/app/shared/mtto/mtto-api-messages';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { ScDescriptorFuncionActividad } from './sc-descriptor-funcion-actividad/models/sc-descriptor-funcion-actividad';
import { ScDescriptorFuncion } from './sc-descriptor-funcion/models/sc-descriptor-funcion';
import { DescriptorSubTab, MockPuesto, MockUnidad, ScDescriptorPuesto } from './models/sc-descriptor-puesto';
import {
	FORMATO_CORTA,
	FORMATO_EXTENSA,
	MOCK_PUESTOS,
	MOCK_UNIDADES,
	SUB_TABS_CORTA,
	SUB_TABS_EXTENSA,
	TIPO_FUNCION_CLAVE,
	TIPO_FUNCION_SECUNDARIA,
} from './sc-descriptor-puesto.mock-data';
import { ScDescriptorPuestoService } from './sc-descriptor-puesto.service';

@Component({
	selector: 'app-sc-descriptor-puesto',
	templateUrl: './sc-descriptor-puesto.component.html',
	styleUrls: ['./sc-descriptor-puesto.component.scss'],
})
export class ScDescriptorPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('fHeaderData', { static: false }) headerForm!: DxFormComponent;
	@ViewChild('tabPanelPrincipal', { static: false }) tabPanelPrincipal?: DxTabPanelComponent;
	@ViewChild('tabPanelSecciones', { static: false }) tabPanelSecciones?: DxTabPanelComponent;

	protected override etiquetaRegistro = 'el descriptor de puesto';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_DESCRIPTOR_PUESTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	readOnly = false;
	mainTabIndex = 0;
	subTabIndex = 0;
	unidadInvalido = false;
	puestoInvalido = false;
	puestoReportaInvalido = false;

	mCORR_UNIDAD: MockUnidad[] = [];
	mCORR_PUESTO: MockPuesto[] = [];
	mCORR_PUESTO_REPORTA: MockPuesto[] = [];
	reportaLookupColumns = [
		{ dataField: 'RESPONSABLE', caption: 'Nombre', width: 220 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 260 },
	];
	subTabsVisibles: DescriptorSubTab[] = [...SUB_TABS_CORTA];

	headerItems: any[] = [];
	columnsTabBitacora: any[] = [];
	summaryTabBitacora: any;
	itemsTabBitacora: any[] = [];

	funcionesClave: ScDescriptorFuncion[] = [];
	funcionesClaveEliminadas: number[] = [];
	funcionesSecundarias: ScDescriptorFuncion[] = [];
	funcionesSecundariasEliminadas: number[] = [];
	actividadesPopupVisible = false;
	funcionActividadesSeleccionada: ScDescriptorFuncion | null = null;
	actividadesPopup: ScDescriptorFuncionActividad[] = [];
	actividadesEliminadas: number[] = [];

	private funcionesClaveLoadSeq = 0;
	private funcionesSecundariasLoadSeq = 0;
	private funcionesTabsDirty = false;
	private sincronizandoHeader = false;

	private readonly maintenanceSubtitulo = 'Descriptor de Puesto';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScDescriptorPuestoService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_UNIDAD = this.selectedLookUpCORR_UNIDAD.bind(this);
		this.selectedLookUpCORR_PUESTO = this.selectedLookUpCORR_PUESTO.bind(this);
		this.selectedLookUpCORR_PUESTO_REPORTA = this.selectedLookUpCORR_PUESTO_REPORTA.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.headerItems = this.service.getHeaderItems();
		this.columnsTabBitacora = this.service.getBitacoraColumns();
		this.summaryTabBitacora = this.service.getBitacoraSummary();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.consultar();
	}

	llenaComboBox(): void {
		this.mCORR_UNIDAD = [...MOCK_UNIDADES];
		this.actualizarPuestosPorUnidad(this.model?.CORR_UNIDAD ?? null);
	}

	selectedLookUpCORR_UNIDAD(vRow: any): number {
		return vRow[0].CORR_UNIDAD;
	}

	selectedLookUpCORR_PUESTO(vRow: any): number {
		return vRow[0].CORR_PUESTO;
	}

	selectedLookUpCORR_PUESTO_REPORTA(vRow: any): number {
		return vRow[0].CORR_PUESTO;
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.mainTabIndex = 0;
			this.subTabIndex = 0;
		}
	}

	fillParam(xCORR_DESCRIPTOR_PUESTO?: number): any {
		return {
			CORR_DESCRIPTOR_PUESTO: xCORR_DESCRIPTOR_PUESTO ?? 0,
		};
	}

	override fillData(xModel?: ScDescriptorPuesto): ScDescriptorPuesto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_DESCRIPTOR_PUESTO: xModel.CORR_DESCRIPTOR_PUESTO,
				CORR_PUESTO: xModel.CORR_PUESTO,
				CORR_UNIDAD: xModel.CORR_UNIDAD,
				FECHA_EMISION: xModel.FECHA_EMISION,
				CORR_PUESTO_REPORTA: xModel.CORR_PUESTO_REPORTA,
				FECHA_REVISION: xModel.FECHA_REVISION,
				NUM_PERSONAL_CARGO: xModel.NUM_PERSONAL_CARGO,
				OBJETIVO_PUESTO: xModel.OBJETIVO_PUESTO ?? '',
				CORR_IMPACTO_ECONOMICO: xModel.CORR_IMPACTO_ECONOMICO,
				CORR_INDUCCION: xModel.CORR_INDUCCION,
				RESPONSABLE: xModel.RESPONSABLE ?? '',
				FORMATO: xModel.FORMATO ?? FORMATO_CORTA,
				VERSION: xModel.VERSION ?? 1,
				ESTADO_DESCRIPTOR: xModel.ESTADO_DESCRIPTOR ?? 'BORRADOR',
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				NOMBRE_PUESTO: xModel.NOMBRE_PUESTO,
				NOMBRE_UNIDAD: xModel.NOMBRE_UNIDAD,
			};
		}

		const hoy = new Date();
		return {
			CORR_EMPRESA: 1,
			CORR_DESCRIPTOR_PUESTO: 0,
			CORR_PUESTO: null,
			CORR_UNIDAD: null,
			FECHA_EMISION: hoy,
			CORR_PUESTO_REPORTA: null,
			FECHA_REVISION: null,
			NUM_PERSONAL_CARGO: null,
			OBJETIVO_PUESTO: '',
			CORR_IMPACTO_ECONOMICO: null,
			CORR_INDUCCION: null,
			RESPONSABLE: '',
			FORMATO: FORMATO_CORTA,
			VERSION: 1,
			ESTADO_DESCRIPTOR: 'BORRADOR',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: hoy,
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: hoy,
			NOMBRE_PUESTO: '',
			NOMBRE_UNIDAD: '',
		};
	}

	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.enriquecerFilasConsulta();
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	private enriquecerFilasConsulta(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = this.models.map((row: ScDescriptorPuesto) => ({
			...row,
			NOMBRE_UNIDAD: this.getNombreUnidad(row.CORR_UNIDAD),
			NOMBRE_PUESTO: row.NOMBRE_PUESTO || this.getNombrePuesto(row.CORR_PUESTO),
		}));
	}

	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_DESCRIPTOR_PUESTO) - Number(b.CORR_DESCRIPTOR_PUESTO)
		);
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.readOnly = false;
		this.mainTabIndex = 0;
		this.subTabIndex = 0;
		this.limpiarEstadoValidacionHeader();
		super.nuevo();
		this.limpiarDatosTabs();
		this.actualizarSubTabs();
		this.actualizarPuestosPorUnidad(null);
		setTimeout(() => this.syncHeaderForm());
	}

	override editarClick(e: any): void {
		this.readOnly = false;
		this.limpiarEstadoValidacionHeader();
		super.editarClick(e);
		this.resetearFuncionesTabsDirty();
		this.cargarDatosTabs();
		this.actualizarSubTabs();
		this.actualizarPuestosPorUnidad(this.model.CORR_UNIDAD);
		if (this.model.CORR_PUESTO) {
			this.aplicarDatosPuestoSeleccionado(this.model.CORR_PUESTO, false);
		}
		setTimeout(() => this.syncHeaderForm());
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		this.readOnly = true;
		super.rowDblClick(e);
		this.resetearFuncionesTabsDirty();
		this.cargarDatosTabs();
		this.actualizarSubTabs();
		this.actualizarPuestosPorUnidad(this.model.CORR_UNIDAD);
		setTimeout(() => {
			this.syncHeaderForm();
			this.bloquear();
		});
	}

	cargarDatosTabs(): void {
		this.itemsTabBitacora = [];
		this.cargarFuncionesClave();
		if (this.esFormatoCorta) {
			this.cargarFuncionesSecundarias();
		}
	}

	limpiarDatosTabs(): void {
		this.itemsTabBitacora = [];
		this.funcionesClave = [];
		this.funcionesClaveEliminadas = [];
		this.funcionesSecundarias = [];
		this.funcionesSecundariasEliminadas = [];
		this.resetearFuncionesTabsDirty();
		this.cerrarActividadesPopup();
	}

	get esFormatoCorta(): boolean {
		const formato = (this.model?.FORMATO ?? '').toUpperCase();
		return formato === FORMATO_CORTA || formato === 'CORTA';
	}

	get esFormatoExtensa(): boolean {
		return (this.model?.FORMATO ?? '').toUpperCase() === FORMATO_EXTENSA;
	}

	get mostrarSeccionesDescriptor(): boolean {
		return Number(this.model?.CORR_DESCRIPTOR_PUESTO) > 0;
	}

	get funcionesSecundariasVisibles(): ScDescriptorFuncion[] {
		return this.funcionesSecundarias.filter((item) => !item._marcadaEliminar);
	}

	get funcionesClaveVisibles(): ScDescriptorFuncion[] {
		return this.funcionesClave.filter((item) => !item._marcadaEliminar);
	}

	get puedeGestionarFunciones(): boolean {
		return !this.readOnly;
	}

	agregarFuncionClave(): void {
		if (this.readOnly) {
			return;
		}

		this.funcionesClave.push({
			CORR_FUNCION: 0,
			NOMBRE_FUNCION: '',
			TIPO_FUNCION: TIPO_FUNCION_CLAVE,
			CANT_ACTIVIDADES: 0,
		});
		this.marcarFuncionesTabsDirty();
	}

	eliminarFuncionClave(funcion: ScDescriptorFuncion): void {
		if (this.readOnly || !funcion) {
			return;
		}

		if (funcion.CORR_FUNCION > 0) {
			this.funcionesClaveEliminadas.push(funcion.CORR_FUNCION);
		}

		funcion._marcadaEliminar = true;
		this.marcarFuncionesTabsDirty();
	}

	agregarFuncionSecundaria(): void {
		if (this.readOnly || !this.esFormatoCorta) {
			return;
		}

		this.funcionesSecundarias.push({
			CORR_FUNCION: 0,
			NOMBRE_FUNCION: '',
			TIPO_FUNCION: TIPO_FUNCION_SECUNDARIA,
		});
		this.marcarFuncionesTabsDirty();
	}

	eliminarFuncionSecundaria(funcion: ScDescriptorFuncion): void {
		if (this.readOnly || !funcion) {
			return;
		}

		if (funcion.CORR_FUNCION > 0) {
			this.funcionesSecundariasEliminadas.push(funcion.CORR_FUNCION);
		}

		funcion._marcadaEliminar = true;
		this.marcarFuncionesTabsDirty();
	}

	onFuncionClaveChanged(e: any, funcion: ScDescriptorFuncion): void {
		if (!funcion || this.readOnly) {
			return;
		}

		funcion.NOMBRE_FUNCION = `${e?.value ?? ''}`;
		this.marcarFuncionesTabsDirty();
	}

	onFuncionSecundariaChanged(e: any, funcion: ScDescriptorFuncion): void {
		if (!funcion || this.readOnly) {
			return;
		}

		funcion.NOMBRE_FUNCION = `${e?.value ?? ''}`;
		this.marcarFuncionesTabsDirty();
	}

	abrirActividades(funcion: ScDescriptorFuncion): void {
		if (!this.esFormatoExtensa || this.readOnly || !funcion) {
			return;
		}

		this.funcionActividadesSeleccionada = funcion;
		this.actividadesEliminadas = [];
		this.actividadesPopupVisible = true;

		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (funcion.CORR_FUNCION > 0 && corrDescriptor > 0) {
			this.cargarActividadesPopup(funcion);
			return;
		}

		this.actividadesPopup = (funcion.actividadesPendientes ?? []).map((item) => ({
			CORR_FUNCION: funcion.CORR_FUNCION,
			CORR_ACTIVIDAD: item.CORR_ACTIVIDAD ?? 0,
			NOMBRE_ACTIVIDAD: item.NOMBRE_ACTIVIDAD ?? '',
		}));
	}

	cerrarActividadesPopup(): void {
		this.actividadesPopupVisible = false;
		this.funcionActividadesSeleccionada = null;
		this.actividadesPopup = [];
		this.actividadesEliminadas = [];
	}

	agregarActividad(): void {
		if (!this.funcionActividadesSeleccionada) {
			return;
		}

		this.actividadesPopup.push({
			CORR_FUNCION: this.funcionActividadesSeleccionada.CORR_FUNCION,
			CORR_ACTIVIDAD: 0,
			NOMBRE_ACTIVIDAD: '',
		});
	}

	eliminarActividad(actividad: ScDescriptorFuncionActividad): void {
		if (!actividad) {
			return;
		}

		if (actividad.CORR_ACTIVIDAD > 0) {
			this.actividadesEliminadas.push(actividad.CORR_ACTIVIDAD);
		}

		actividad._marcadaEliminar = true;
	}

	get actividadesPopupVisibles(): ScDescriptorFuncionActividad[] {
		return this.actividadesPopup.filter((item) => !item._marcadaEliminar);
	}

	guardarActividadesPopup(): void {
		const funcion = this.funcionActividadesSeleccionada;
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!funcion || !corrDescriptor || corrDescriptor <= 0) {
			return;
		}

		if (!funcion.CORR_FUNCION || funcion.CORR_FUNCION <= 0 || corrDescriptor <= 0) {
			funcion.actividadesPendientes = this.actividadesPopupVisibles.map((item) => ({
				CORR_FUNCION: 0,
				CORR_ACTIVIDAD: item.CORR_ACTIVIDAD ?? 0,
				NOMBRE_ACTIVIDAD: item.NOMBRE_ACTIVIDAD ?? '',
			}));
			funcion.CANT_ACTIVIDADES = funcion.actividadesPendientes.length;
			this.cerrarActividadesPopup();
			this.notifyFx('Actividades registradas. Se guardaran al guardar el descriptor.', NotifyType.Success);
			return;
		}

		this.loadingVisible = true;
		this.service
			.guardarActividadesFuncion(corrDescriptor, funcion.CORR_FUNCION, this.actividadesPopup, this.actividadesEliminadas)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					if (response.Result) {
						this.notifyFx('Actividades guardadas con exito.', NotifyType.Success);
						this.cargarActividadesPopup(funcion, true);
						this.actualizarContadorActividades(funcion);
					} else {
						this.notifyApiResponse(response);
					}
					this.loadingVisible = false;
				},
				error: (error) => {
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}

	private cargarFuncionesClave(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.funcionesClave = [];
			this.funcionesClaveEliminadas = [];
			return;
		}

		if (!forzar && this.funcionesTabsDirty && !this.readOnly) {
			return;
		}

		const loadSeq = ++this.funcionesClaveLoadSeq;
		this.service
			.getFuncionesClaveLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.funcionesClaveLoadSeq) {
						return;
					}

					if (!forzar && this.funcionesTabsDirty && !this.readOnly) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.funcionesClave = response.Data
							.filter(
								(item: ScDescriptorFuncion) =>
									(item.TIPO_FUNCION ?? TIPO_FUNCION_CLAVE).toUpperCase() === TIPO_FUNCION_CLAVE
							)
							.map((item: ScDescriptorFuncion) => ({
								CORR_FUNCION: item.CORR_FUNCION,
								NOMBRE_FUNCION: item.NOMBRE_FUNCION ?? '',
								TIPO_FUNCION: item.TIPO_FUNCION ?? TIPO_FUNCION_CLAVE,
								CANT_ACTIVIDADES: Number(item.CANT_ACTIVIDADES ?? 0),
							}));
						this.funcionesClaveEliminadas = [];
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private cargarActividadesPopup(funcion: ScDescriptorFuncion, resetEliminadas = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || !funcion?.CORR_FUNCION) {
			this.actividadesPopup = [];
			return;
		}

		this.service
			.getActividadesLookup(corrDescriptor, funcion.CORR_FUNCION)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result) {
						this.actividadesPopup = (response.Data ?? []).map((item: ScDescriptorFuncionActividad) => ({
							CORR_FUNCION: item.CORR_FUNCION,
							CORR_ACTIVIDAD: item.CORR_ACTIVIDAD,
							NOMBRE_ACTIVIDAD: item.NOMBRE_ACTIVIDAD ?? '',
						}));
						if (resetEliminadas) {
							this.actividadesEliminadas = [];
						}
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private actualizarContadorActividades(funcion: ScDescriptorFuncion): void {
		funcion.CANT_ACTIVIDADES = this.actividadesPopupVisibles.length;
	}

	private persistirFuncionesDescriptor(
		corrDescriptorPuesto: number,
		contexto?: {
			funcionesClave: ScDescriptorFuncion[];
			funcionesSecundarias: ScDescriptorFuncion[];
			funcionesClaveEliminadas: number[];
			funcionesSecundariasEliminadas: number[];
			guardarSecundarias: boolean;
		}
	): Observable<boolean> {
		const corrDescriptor = Number(corrDescriptorPuesto);
		if (!corrDescriptor || corrDescriptor <= 0) {
			return of(true);
		}

		const funcionesClave = contexto?.funcionesClave ?? this.funcionesClave;
		const funcionesSecundarias = contexto?.funcionesSecundarias ?? this.funcionesSecundarias;
		const funcionesClaveEliminadas = contexto?.funcionesClaveEliminadas ?? this.funcionesClaveEliminadas;
		const funcionesSecundariasEliminadas =
			contexto?.funcionesSecundariasEliminadas ?? this.funcionesSecundariasEliminadas;
		const guardarSecundarias = contexto?.guardarSecundarias ?? this.esFormatoCorta;

		const operaciones = [
			this.service.guardarFuncionesClave(corrDescriptor, funcionesClave, funcionesClaveEliminadas),
		];

		if (guardarSecundarias) {
			operaciones.push(
				this.service.guardarFuncionesSecundarias(
					corrDescriptor,
					funcionesSecundarias,
					funcionesSecundariasEliminadas
				)
			);
		}

		return forkJoin(operaciones).pipe(
			map((responses) => {
				const failed = responses.find((response) => !response?.Result);
				if (failed) {
					this.notifyApiResponse(failed);
					return false;
				}

				this.aplicarFuncionesLocalesTrasGuardar(funcionesClave, responses[0], TIPO_FUNCION_CLAVE);
				if (guardarSecundarias && responses.length > 1) {
					this.aplicarFuncionesLocalesTrasGuardar(
						funcionesSecundarias,
						responses[1],
						TIPO_FUNCION_SECUNDARIA
					);
				}

				this.funcionesClave = funcionesClave.filter((item) => !item._marcadaEliminar);
				this.funcionesSecundarias = funcionesSecundarias.filter((item) => !item._marcadaEliminar);
				this.funcionesClaveEliminadas = [];
				this.funcionesSecundariasEliminadas = [];
				this.resetearFuncionesTabsDirty();
				return true;
			})
		);
	}

	private aplicarFuncionesLocalesTrasGuardar(
		funciones: ScDescriptorFuncion[],
		response: any,
		tipoFuncion: string
	): void {
		if (!response?.Result) {
			return;
		}

		const activas = funciones.filter((item) => !item._marcadaEliminar);
		const guardadas: ScDescriptorFuncion[] = Array.isArray(response.Data)
			? (response.Data as ScDescriptorFuncion[])
			: response.Data
				? [response.Data as ScDescriptorFuncion]
				: [];

		activas.forEach((funcion, index) => {
			const saved = guardadas[index];
			if (!saved) {
				return;
			}

			funcion.CORR_FUNCION = Number(saved.CORR_FUNCION) || funcion.CORR_FUNCION;
			funcion.NOMBRE_FUNCION = saved.NOMBRE_FUNCION ?? funcion.NOMBRE_FUNCION;
			funcion.TIPO_FUNCION = saved.TIPO_FUNCION ?? tipoFuncion;
			if (saved.CANT_ACTIVIDADES != null) {
				funcion.CANT_ACTIVIDADES = Number(saved.CANT_ACTIVIDADES);
			}
		});
	}

	private cargarFuncionesSecundarias(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoCorta) {
			if (!corrDescriptor || corrDescriptor <= 0) {
				this.funcionesSecundarias = [];
				this.funcionesSecundariasEliminadas = [];
			}
			return;
		}

		if (!forzar && this.funcionesTabsDirty && !this.readOnly) {
			return;
		}

		const loadSeq = ++this.funcionesSecundariasLoadSeq;
		this.service
			.getFuncionesSecundariasLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.funcionesSecundariasLoadSeq) {
						return;
					}

					if (!forzar && this.funcionesTabsDirty && !this.readOnly) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.funcionesSecundarias = response.Data
							.filter(
								(item: ScDescriptorFuncion) =>
									(item.TIPO_FUNCION ?? '').toUpperCase() === TIPO_FUNCION_SECUNDARIA
							)
							.map((item: ScDescriptorFuncion) => ({
								CORR_FUNCION: item.CORR_FUNCION,
								NOMBRE_FUNCION: item.NOMBRE_FUNCION ?? '',
								TIPO_FUNCION: item.TIPO_FUNCION ?? TIPO_FUNCION_SECUNDARIA,
							}));
						this.funcionesSecundariasEliminadas = [];
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private persistirFuncionesClave(corrDescriptorPuesto: number): Observable<boolean> {
		return this.persistirFuncionesDescriptor(corrDescriptorPuesto);
	}

	get tieneBitacora(): boolean {
		return Array.isArray(this.itemsTabBitacora) && this.itemsTabBitacora.length > 0;
	}

	get mensajeBitacoraVacia(): string {
		if (!this.model?.CORR_DESCRIPTOR_PUESTO) {
			return 'La bitácora estará disponible después de guardar el descriptor.';
		}

		return 'No hay registros en la bitácora por el momento.';
	}

	onFormatoChanged(value: string): void {
		const formatoAnterior = (this.model?.FORMATO ?? '').toUpperCase();
		const formatoNuevo = (value || FORMATO_CORTA).toUpperCase();
		const cambioReal = formatoAnterior !== formatoNuevo;

		const tabActualId = this.subTabsVisibles[this.subTabIndex]?.id;
		this.model.FORMATO = value || FORMATO_CORTA;
		this.actualizarSubTabs();
		if (tabActualId) {
			const nuevoIndex = this.subTabsVisibles.findIndex((tab) => tab.id === tabActualId);
			this.subTabIndex = nuevoIndex >= 0 ? nuevoIndex : 0;
		}

		// Solo recargar secundarias si el usuario cambió de verdad el formato (no por sync del form).
		if (
			cambioReal &&
			this.esFormatoCorta &&
			this.mostrarSeccionesDescriptor &&
			!this.funcionesTabsDirty
		) {
			this.cargarFuncionesSecundarias();
		}
	}

	onUnidadChanged(value: number | null): void {
		this.model.CORR_UNIDAD = value;
		this.model.CORR_PUESTO = null;
		this.model.CORR_PUESTO_REPORTA = null;
		this.model.RESPONSABLE = '';
		if (value != null && value > 0) {
			this.unidadInvalido = false;
		}
		this.actualizarPuestosPorUnidad(value);
	}

	onPuestoChanged(value: number | null): void {
		const corrPuesto = value != null ? Number(value) : null;
		this.model.CORR_PUESTO = corrPuesto;
		if (corrPuesto != null && corrPuesto > 0) {
			this.puestoInvalido = false;
		}
		this.aplicarDatosPuestoSeleccionado(corrPuesto, true);
		this.validarDescriptorAbiertoPorPuesto(corrPuesto);
	}

	private validarDescriptorAbiertoPorPuesto(corrPuesto: number | null): void {
		if (!this.isForm() || this.banderaMtto !== UpdateType.Add || !corrPuesto || corrPuesto <= 0) {
			return;
		}

		this.model.NOMBRE_PUESTO = this.getNombrePuesto(corrPuesto);
		if (
			!this.service.validarDescriptorUnicoPorPuesto(
				this.model,
				this.models,
				true,
				this.notifyDescriptorWarning.bind(this)
			)
		) {
			this.model.CORR_PUESTO = null;
			this.model.CORR_PUESTO_REPORTA = null;
			this.model.RESPONSABLE = '';
			this.puestoInvalido = true;
			this.mCORR_PUESTO_REPORTA = [];
			this.syncHeaderForm();
		}
	}

	onPuestoReportaChanged(value: number | null): void {
		this.model.CORR_PUESTO_REPORTA = value;
		if (value != null && value > 0) {
			this.puestoReportaInvalido = false;
		}
	}

	onHeaderFieldChanged(e: any): void {
		if (this.sincronizandoHeader) {
			return;
		}

		if (e?.dataField === 'FORMATO') {
			this.onFormatoChanged(e.value);
		}
	}

	crearPuestoProximamente(): void {
		this.notifyFx('El mantenimiento de puestos (PLA_PUESTO) estara disponible proximamente.', NotifyType.Warning);
	}

	guardar(): void {
		const formData = this.headerForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		this.model.NOMBRE_UNIDAD = this.getNombreUnidad(this.model.CORR_UNIDAD);
		this.model.NOMBRE_PUESTO = this.getNombrePuesto(this.model.CORR_PUESTO);

		this.actualizarEstadoValidacionHeader();
		const formValidation = this.headerForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.actualizarEstadoValidacionHeader();
			this.service.esValido(this.model, this.notifyDescriptorWarning.bind(this));
			return;
		}

		const isAdd = this.banderaMtto === UpdateType.Add;
		if (
			!this.service.validarDescriptorUnicoPorPuesto(
				this.model,
				this.models,
				isAdd,
				this.notifyDescriptorWarning.bind(this)
			)
		) {
			return;
		}

		if (!this.service.esValido(this.model, this.notifyDescriptorWarning.bind(this))) {
			return;
		}

		this.guardarMttoDescriptor(this.buildContextoFunciones());
	}

	private buildContextoFunciones(): {
		funcionesClave: ScDescriptorFuncion[];
		funcionesSecundarias: ScDescriptorFuncion[];
		funcionesClaveEliminadas: number[];
		funcionesSecundariasEliminadas: number[];
		guardarSecundarias: boolean;
	} {
		return {
			funcionesClave: this.funcionesClave.map((item) => ({
				...item,
				TIPO_FUNCION: TIPO_FUNCION_CLAVE,
				actividadesPendientes: item.actividadesPendientes
					? item.actividadesPendientes.map((actividad) => ({ ...actividad }))
					: undefined,
			})),
			funcionesSecundarias: this.funcionesSecundarias.map((item) => ({
				...item,
				TIPO_FUNCION: TIPO_FUNCION_SECUNDARIA,
			})),
			funcionesClaveEliminadas: [...this.funcionesClaveEliminadas],
			funcionesSecundariasEliminadas: [...this.funcionesSecundariasEliminadas],
			guardarSecundarias: this.esFormatoCorta,
		};
	}

	private guardarMttoDescriptor(contextoFunciones: {
		funcionesClave: ScDescriptorFuncion[];
		funcionesSecundarias: ScDescriptorFuncion[];
		funcionesClaveEliminadas: number[];
		funcionesSecundariasEliminadas: number[];
		guardarSecundarias: boolean;
	}): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		const isAdd = this.banderaMtto === UpdateType.Add;
		const action = isAdd ? this.service.insert(this.model) : this.service.update(this.model);

		this.loadingVisible = true;
		action
			.pipe(
				concatMap((response: any) => {
					if (!response?.Result) {
						return of(response);
					}

					const descriptor = this.fillData(response.Data as ScDescriptorPuesto);
					descriptor.NOMBRE_UNIDAD = this.getNombreUnidad(descriptor.CORR_UNIDAD);
					descriptor.NOMBRE_PUESTO =
						descriptor.NOMBRE_PUESTO || this.getNombrePuesto(descriptor.CORR_PUESTO);

					this.model = descriptor;
					this.modelUpdate = this.fillData(descriptor);
					this.AsignaStatus(UpdateType.Update);
					this.readOnly = false;
					this.actualizarSubTabs();
					this.aplicarRegistroEnGrid(descriptor, isAdd);

					return this.persistirFuncionesDescriptor(
						Number(descriptor.CORR_DESCRIPTOR_PUESTO),
						contextoFunciones
					).pipe(
						concatMap((funcionesGuardadas) => {
							if (!funcionesGuardadas) {
								return of({
									Result: false,
									ErrorCode: 1,
									ErrorMessage:
										'El descriptor se guardó, pero no se pudieron guardar las funciones. Revise e intente de nuevo.',
									Data: null,
									RowsAffected: 0,
								});
							}

							this.recargarFuncionesTrasGuardar(contextoFunciones.guardarSecundarias);
							return of(response);
						})
					);
				}),
				take(1)
			)
			.subscribe({
				next: (response: any) => {
					if (response?.Result) {
						this.habilitar();
						setTimeout(() => this.syncHeaderForm());

						this.notifyFx(
							isAdd ? 'Registro creado con exito!' : 'Registro modificado con exito!',
							NotifyType.Success,
							{ raw: true }
						);
					} else if (response) {
						this.notifyApiResponse(response);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}

	override cancelar(): void {
		this.limpiarEstadoValidacionHeader();
		super.cancelar((item: any) => item.CORR_DESCRIPTOR_PUESTO === this.modelUpdate.CORR_DESCRIPTOR_PUESTO);
	}

	private limpiarEstadoValidacionHeader(): void {
		this.unidadInvalido = false;
		this.puestoInvalido = false;
		this.puestoReportaInvalido = false;
	}

	private actualizarEstadoValidacionHeader(): void {
		const unidad = Number(this.model?.CORR_UNIDAD);
		const puesto = Number(this.model?.CORR_PUESTO);
		const reporta = Number(this.model?.CORR_PUESTO_REPORTA);

		this.unidadInvalido = Number.isNaN(unidad) || unidad <= 0;
		this.puestoInvalido = Number.isNaN(puesto) || puesto <= 0;
		this.puestoReportaInvalido = Number.isNaN(reporta) || reporta <= 0;
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (data && typeof data === 'object') {
			const record = this.fillData(data as ScDescriptorPuesto);
			record.NOMBRE_UNIDAD = this.getNombreUnidad(record.CORR_UNIDAD);
			record.NOMBRE_PUESTO = record.NOMBRE_PUESTO || this.getNombrePuesto(record.CORR_PUESTO);
			super.aplicarRegistroEnGrid(record, isAdd);
			return;
		}

		super.aplicarRegistroEnGrid(data, isAdd);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_DESCRIPTOR_PUESTO)),
		});
	}

	override bloquear(): void {
		this.readOnly = true;
		this.headerForm?.instance?.option('readOnly', true);
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.headerForm?.instance?.option('readOnly', false);
			this.headerForm?.instance?.getEditor('CORR_DESCRIPTOR_PUESTO')?.option('readOnly', true);
			this.headerForm?.instance?.getEditor('VERSION')?.option('readOnly', true);
			this.headerForm?.instance?.getEditor('ESTADO_DESCRIPTOR')?.option('readOnly', true);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.headerForm?.instance?.getEditor('FORMATO')?.focus();
		});
	}

	getNombreUnidad(corrUnidad: number | null | undefined): string {
		const corr = Number(corrUnidad);
		return MOCK_UNIDADES.find((item) => Number(item.CORR_UNIDAD) === corr)?.NOMBRE_UNIDAD ?? '';
	}

	getNombrePuesto(corrPuesto: number | null | undefined): string {
		const corr = Number(corrPuesto);
		return MOCK_PUESTOS.find((item) => Number(item.CORR_PUESTO) === corr)?.NOMBRE_PUESTO ?? '';
	}

	getNombrePuestoReporta(corr: number | null | undefined): string {
		const corrReporta = Number(corr);
		return MOCK_PUESTOS.find((item) => Number(item.CORR_PUESTO) === corrReporta)?.RESPONSABLE ?? '';
	}

	private notifyDescriptorWarning(message: string): void {
		this.notifyFx(message, NotifyType.Warning, { raw: true });
	}

	/** Solo en esta pantalla: validaciones de negocio (hijos, vacíos, etc.) como Warning. */
	override notifyApiResponse(response: any): void {
		const message = mapApiErrorMessage(
			response?.ErrorMessage || 'Ocurrió un error al procesar la solicitud.',
			this.etiquetaRegistro
		);
		const type = this.getDescriptorNotifyTypeFromResponse(response);
		this.notifyFx(message, type, { raw: true });
	}

	override notifyApiError(error: any): void {
		const body = error?.error;
		if (body && typeof body === 'object' && body.ErrorMessage != null) {
			this.notifyApiResponse(body);
			return;
		}

		const rawMessage = getApiErrorMessage(error);
		const message = mapApiErrorMessage(rawMessage, this.etiquetaRegistro);
		const type = this.isDescriptorBusinessWarning(rawMessage) ? NotifyType.Warning : NotifyType.Error;
		this.notifyFx(message, type, { raw: true });
	}

	private getDescriptorNotifyTypeFromResponse(response: any): NotifyType {
		if (isEmpresaWarningResponse(response) || response?.ErrorCode === 2627) {
			return NotifyType.Warning;
		}

		return this.isDescriptorBusinessWarning(response?.ErrorMessage) ? NotifyType.Warning : NotifyType.Error;
	}

	private isDescriptorBusinessWarning(message: string): boolean {
		const value = cleanApiMessage(message).toLowerCase();
		if (isEmpresaFkErrorMessage(message) || value.includes('no tiene una empresa asignada')) {
			return true;
		}

		return (
			value.includes('ya existe') ||
			value.includes('duplicad') ||
			value.includes('hijos asociados') ||
			value.includes('registros asociados') ||
			value.includes('asociados') ||
			value.includes('no se puede eliminar') ||
			value.includes('debe seleccionar') ||
			value.includes('debe ingresar') ||
			value.includes('debe indicar') ||
			value.includes('obligatorio') ||
			value.includes('no se pudieron guardar las funciones')
		);
	}

	isSubTabActivo(tabId: string): boolean {
		return this.subTabsVisibles[this.subTabIndex]?.id === tabId;
	}

	private syncHeaderForm(): void {
		this.sincronizandoHeader = true;
		this.headerForm?.instance?.option('formData', this.model);
		setTimeout(() => {
			this.sincronizandoHeader = false;
		});
	}

	private actualizarSubTabs(): void {
		this.subTabsVisibles =
			this.model.FORMATO === FORMATO_EXTENSA ? [...SUB_TABS_EXTENSA] : [...SUB_TABS_CORTA];
	}

	private marcarFuncionesTabsDirty(): void {
		this.funcionesTabsDirty = true;
		this.funcionesClaveLoadSeq++;
		this.funcionesSecundariasLoadSeq++;
	}

	private resetearFuncionesTabsDirty(): void {
		this.funcionesTabsDirty = false;
		this.funcionesClaveLoadSeq++;
		this.funcionesSecundariasLoadSeq++;
	}

	private recargarFuncionesTrasGuardar(guardarSecundarias: boolean): void {
		this.resetearFuncionesTabsDirty();
		this.cargarFuncionesClave(true);
		if (guardarSecundarias) {
			this.cargarFuncionesSecundarias(true);
		} else {
			this.funcionesSecundarias = [];
			this.funcionesSecundariasEliminadas = [];
		}
	}

	private actualizarPuestosPorUnidad(corrUnidad: number | null | undefined): void {
		const corr = corrUnidad != null ? Number(corrUnidad) : null;
		if (!corr || corr <= 0) {
			this.mCORR_PUESTO = [];
			this.mCORR_PUESTO_REPORTA = [];
			return;
		}

		this.mCORR_PUESTO = MOCK_PUESTOS.filter((item) => Number(item.CORR_UNIDAD) === corr);
		const reportaIds = new Set(this.mCORR_PUESTO.map((item) => Number(item.CORR_PUESTO_REPORTA)));
		this.mCORR_PUESTO_REPORTA = MOCK_PUESTOS.filter((item) => reportaIds.has(Number(item.CORR_PUESTO)));
	}

	private aplicarDatosPuestoSeleccionado(corrPuesto: number | null, limpiarSiNoExiste: boolean): void {
		const corr = corrPuesto != null ? Number(corrPuesto) : null;
		const puesto = MOCK_PUESTOS.find((item) => Number(item.CORR_PUESTO) === corr);
		if (!puesto) {
			if (limpiarSiNoExiste) {
				this.model.CORR_PUESTO_REPORTA = null;
				this.model.RESPONSABLE = '';
			}
			return;
		}

		this.model.CORR_PUESTO_REPORTA = puesto.CORR_PUESTO_REPORTA;
		this.model.RESPONSABLE = puesto.RESPONSABLE;
		this.mCORR_PUESTO_REPORTA = MOCK_PUESTOS.filter(
			(item) => Number(item.CORR_PUESTO) === Number(puesto.CORR_PUESTO_REPORTA)
		);
		this.syncHeaderForm();
	}
}
