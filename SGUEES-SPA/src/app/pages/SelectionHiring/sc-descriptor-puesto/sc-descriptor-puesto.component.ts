import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { DxTabPanelComponent } from 'devextreme-angular/ui/tab-panel';
import { take } from 'rxjs/operators';

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
import { environment } from 'src/environments/environment';

import { ScDescriptorFuncionActividad } from './sc-descriptor-funcion-actividad/models/sc-descriptor-funcion-actividad';
import { ScDescriptorFuncion } from './sc-descriptor-funcion/models/sc-descriptor-funcion';
import {
	ScDescriptorKpiFuncion,
	ScFrecuenciaLookup,
} from './sc-descriptor-kpi-funcion/models/sc-descriptor-kpi-funcion';
import {
	ScDescriptorPerfilPuesto,
	ScDisponibilidadHorarioLookup,
	ScTipoModalidadLookup,
} from './sc-descriptor-perfil-puesto/models/sc-descriptor-perfil-puesto';
import { DescriptorSubTab, MockPuesto, MockUnidad, ScDescriptorPuesto } from './models/sc-descriptor-puesto';
import {
	FORMATO_CORTA,
	FORMATO_EXTENSA,
	MOCK_PUESTOS,
	MOCK_UNIDADES,
	PERFIL_ESTADO_FAMILIAR_OPTIONS,
	PERFIL_LICENCIA_OPTIONS,
	PERFIL_PUESTO_DEFAULT,
	PERFIL_SEXO_OPTIONS,
	PERFIL_SUB_TABS,
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
export class ScDescriptorPuestoComponent extends CBaseComponent implements OnInit, OnDestroy {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('fHeaderData', { static: false }) headerForm!: DxFormComponent;
	@ViewChild('tabPanelPrincipal', { static: false }) tabPanelPrincipal?: DxTabPanelComponent;
	@ViewChild('tabPanelSecciones', { static: false }) tabPanelSecciones?: DxTabPanelComponent;
	@ViewChild('gridFuncionesClave', { static: false }) gridFuncionesClave?: DxDataGridComponent;
	@ViewChild('gridFuncionesSecundarias', { static: false }) gridFuncionesSecundarias?: DxDataGridComponent;
	@ViewChild('gridKpis', { static: false }) gridKpis?: DxDataGridComponent;

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
	mCORR_FRECUENCIA: ScFrecuenciaLookup[] = [];
	mCORR_DISPONIBILIDAD_HORARIO: ScDisponibilidadHorarioLookup[] = [];
	mCORR_TIPO_MODALIDAD: ScTipoModalidadLookup[] = [];
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
	funcionesSecundarias: ScDescriptorFuncion[] = [];
	kpis: ScDescriptorKpiFuncion[] = [];
	funcionesClaveEditando = false;
	funcionesSecundariasEditando = false;
	kpisEditando = false;
	perfil: ScDescriptorPerfilPuesto = { ...PERFIL_PUESTO_DEFAULT };
	perfilSubTabIndex = 0;
	readonly perfilSubTabs = PERFIL_SUB_TABS;
	readonly perfilSexoOptions = PERFIL_SEXO_OPTIONS;
	readonly perfilEstadoFamiliarOptions = PERFIL_ESTADO_FAMILIAR_OPTIONS;
	readonly perfilLicenciaOptions = PERFIL_LICENCIA_OPTIONS;
	actividadesPopupVisible = false;
	actividadesPopupFullScreen = false;
	funcionActividadesSeleccionada: ScDescriptorFuncion | null = null;
	actividadesPopup: ScDescriptorFuncionActividad[] = [];

	private funcionesClaveLoadSeq = 0;
	private funcionesSecundariasLoadSeq = 0;
	private kpisLoadSeq = 0;
	private perfilLoadSeq = 0;
	private perfilExiste = false;
	private funcionesTabsDirty = false;
	private sincronizandoHeader = false;
	private funcionPersistTimers = new Map<string, ReturnType<typeof setTimeout>>();
	private actividadPersistTimers = new Map<string, ReturnType<typeof setTimeout>>();
	private kpiPersistTimers = new Map<string, ReturnType<typeof setTimeout>>();
	private perfilPersistTimer: ReturnType<typeof setTimeout> | null = null;

	readonly actividadesPopupWrapperAttr = { class: 'descriptor-actividades-popup-wrapper' };
	private actividadesPopupMediaQuery?: MediaQueryList;
	private readonly onActividadesPopupMediaChange = (event: MediaQueryListEvent): void => {
		this.actividadesPopupFullScreen = event.matches;
	};

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
		this.selectedLookUpCORR_FRECUENCIA = this.selectedLookUpCORR_FRECUENCIA.bind(this);
		this.selectedLookUpCORR_DISPONIBILIDAD_HORARIO = this.selectedLookUpCORR_DISPONIBILIDAD_HORARIO.bind(this);
		this.selectedLookUpCORR_TIPO_MODALIDAD = this.selectedLookUpCORR_TIPO_MODALIDAD.bind(this);
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
		this.configurarActividadesPopupResponsive();
	}

	ngOnDestroy(): void {
		this.actividadesPopupMediaQuery?.removeEventListener('change', this.onActividadesPopupMediaChange);
	}

	private configurarActividadesPopupResponsive(): void {
		if (typeof window === 'undefined' || !window.matchMedia) {
			return;
		}

		this.actividadesPopupMediaQuery = window.matchMedia('(max-width: 991.98px)');
		this.actividadesPopupFullScreen = this.actividadesPopupMediaQuery.matches;
		this.actividadesPopupMediaQuery.addEventListener('change', this.onActividadesPopupMediaChange);
	}

	llenaComboBox(): void {
		this.mCORR_UNIDAD = [...MOCK_UNIDADES];
		this.actualizarPuestosPorUnidad(this.model?.CORR_UNIDAD ?? null);
		this.cargarFrecuenciasLookup();
		this.cargarDisponibilidadHorarioLookup();
		this.cargarTipoModalidadLookup();
	}

	private cargarFrecuenciasLookup(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_KPI_FUNCION',
				'SC_FRECUENCIA',
				'GetCORR_FRECUENCIA',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mCORR_FRECUENCIA = response.Data.map((item: ScFrecuenciaLookup) => ({
							CORR_FRECUENCIA: Number(item.CORR_FRECUENCIA),
							NOMBRE_FRECUENCIA: item.NOMBRE_FRECUENCIA ?? '',
						}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private cargarDisponibilidadHorarioLookup(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_DISPONIBILIDAD_HORARIO',
				'GetCORR_DISPONIBILIDAD_HORARIO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mCORR_DISPONIBILIDAD_HORARIO = response.Data.map(
							(item: ScDisponibilidadHorarioLookup) => ({
								CORR_DISPONIBILIDAD_HORARIO: Number(item.CORR_DISPONIBILIDAD_HORARIO),
								NOMBRE_DISPONIBILIDAD_HORARIO: item.NOMBRE_DISPONIBILIDAD_HORARIO ?? '',
							})
						);
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private cargarTipoModalidadLookup(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_TIPO_MODALIDAD',
				'GetCORR_TIPO_MODALIDAD',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mCORR_TIPO_MODALIDAD = response.Data.map((item: ScTipoModalidadLookup) => ({
							CORR_TIPO_MODALIDAD: Number(item.CORR_TIPO_MODALIDAD),
							MODALIDAD_NOMBRE: item.MODALIDAD_NOMBRE ?? '',
						}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
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

	selectedLookUpCORR_FRECUENCIA(vRow: any): number {
		return vRow[0].CORR_FRECUENCIA;
	}

	selectedLookUpCORR_DISPONIBILIDAD_HORARIO(vRow: any): number {
		return vRow[0].CORR_DISPONIBILIDAD_HORARIO;
	}

	selectedLookUpCORR_TIPO_MODALIDAD(vRow: any): number {
		return vRow[0].CORR_TIPO_MODALIDAD;
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
			this.cargarKpis();
		}
		this.cargarPerfil();
	}

	limpiarDatosTabs(): void {
		this.itemsTabBitacora = [];
		this.funcionesClave = [];
		this.funcionesSecundarias = [];
		this.kpis = [];
		this.resetearEdicionFuncionesClave();
		this.resetearEdicionFuncionesSecundarias();
		this.resetearEdicionKpis();
		this.limpiarPerfil();
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
		return this.funcionesSecundarias;
	}

	get funcionesClaveVisibles(): ScDescriptorFuncion[] {
		return this.funcionesClave;
	}

	get kpisVisibles(): ScDescriptorKpiFuncion[] {
		return this.kpis;
	}

	get puedeGestionarFunciones(): boolean {
		return !this.readOnly;
	}


	agregarFuncionClave(): void {
		if (this.readOnly || this.funcionesClaveEditando || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridFuncionesClave?.instance.addRow();
		this.funcionesClaveEditando = true;
	}

	editarFuncionClaveClick = (e: any): void => {
		if (this.readOnly || this.funcionesClaveEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.funcionesClaveEditando = true;
	};

	funcionClaveEditButtonVisible = (e: any): boolean => {
		return !this.readOnly && !this.funcionesClaveEditando && !e.row?.isEditing;
	};

	funcionClaveDeleteButtonVisible = (e: any): boolean => {
		return !this.readOnly && !this.funcionesClaveEditando && !e.row?.isEditing;
	};

	guardarFuncionClaveEditada(): void {
		const grid = this.gridFuncionesClave?.instance;
		if (!grid || !this.funcionesClaveEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarFuncionClaveEditada(): void {
		const grid = this.gridFuncionesClave?.instance;
		if (!grid?.hasEditData()) {
			this.funcionesClaveEditando = false;
			this.refrescarGridFuncionesClave();
			return;
		}
		grid.cancelEditData();
	}

	funcionClaveInitNewRow(e: any): void {
		e.data.CORR_FUNCION = 0;
		e.data.NOMBRE_FUNCION = '';
		e.data.TIPO_FUNCION = TIPO_FUNCION_CLAVE;
		e.data.CANT_ACTIVIDADES = 0;
		e.data._clientKey = this.crearClientKey('fc');
	}

	onFuncionClaveEditingStart(_e: any): void {
		this.funcionesClaveEditando = true;
	}

	onFuncionClaveSaved(_e: any): void {
		this.funcionesClaveEditando = false;
		this.refrescarGridFuncionesClave();
	}

	onFuncionClaveEditCanceled(_e: any): void {
		this.funcionesClaveEditando = false;
		this.refrescarGridFuncionesClave();
	}

	funcionClaveRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.NOMBRE_FUNCION ?? '').trim()) {
			e.isValid = false;
			e.errorText = 'Debe indicar el nombre de la funcion clave.';
		}
	}

	funcionClaveRowInserting(e: any): void {
		e.cancel = this.persistirFuncionDesdeGrid(e.data, TIPO_FUNCION_CLAVE, true);
	}

	funcionClaveRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirFuncionDesdeGrid(data, TIPO_FUNCION_CLAVE, false);
	}

	funcionClaveRowRemoving(e: any): void {
		e.cancel = this.eliminarFuncionDesdeGrid(e.data);
	}

	agregarFuncionSecundaria(): void {
		if (
			this.readOnly ||
			this.funcionesSecundariasEditando ||
			!this.esFormatoCorta ||
			!this.requiereDescriptorGuardado()
		) {
			return;
		}
		this.gridFuncionesSecundarias?.instance.addRow();
		this.funcionesSecundariasEditando = true;
	}

	editarFuncionSecundariaClick = (e: any): void => {
		if (this.readOnly || this.funcionesSecundariasEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.funcionesSecundariasEditando = true;
	};

	funcionSecundariaEditButtonVisible = (e: any): boolean => {
		return !this.readOnly && !this.funcionesSecundariasEditando && !e.row?.isEditing;
	};

	funcionSecundariaDeleteButtonVisible = (e: any): boolean => {
		return !this.readOnly && !this.funcionesSecundariasEditando && !e.row?.isEditing;
	};

	guardarFuncionSecundariaEditada(): void {
		const grid = this.gridFuncionesSecundarias?.instance;
		if (!grid || !this.funcionesSecundariasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarFuncionSecundariaEditada(): void {
		const grid = this.gridFuncionesSecundarias?.instance;
		if (!grid?.hasEditData()) {
			this.funcionesSecundariasEditando = false;
			this.refrescarGridFuncionesSecundarias();
			return;
		}
		grid.cancelEditData();
	}

	funcionSecundariaInitNewRow(e: any): void {
		e.data.CORR_FUNCION = 0;
		e.data.NOMBRE_FUNCION = '';
		e.data.TIPO_FUNCION = TIPO_FUNCION_SECUNDARIA;
		e.data._clientKey = this.crearClientKey('fs');
	}

	onFuncionSecundariaEditingStart(_e: any): void {
		this.funcionesSecundariasEditando = true;
	}

	onFuncionSecundariaSaved(_e: any): void {
		this.funcionesSecundariasEditando = false;
		this.refrescarGridFuncionesSecundarias();
	}

	onFuncionSecundariaEditCanceled(_e: any): void {
		this.funcionesSecundariasEditando = false;
		this.refrescarGridFuncionesSecundarias();
	}

	funcionSecundariaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.NOMBRE_FUNCION ?? '').trim()) {
			e.isValid = false;
			e.errorText = 'Debe indicar la descripcion de la funcion secundaria.';
		}
	}

	funcionSecundariaRowInserting(e: any): void {
		e.cancel = this.persistirFuncionDesdeGrid(e.data, TIPO_FUNCION_SECUNDARIA, true);
	}

	funcionSecundariaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirFuncionDesdeGrid(data, TIPO_FUNCION_SECUNDARIA, false);
	}

	funcionSecundariaRowRemoving(e: any): void {
		e.cancel = this.eliminarFuncionDesdeGrid(e.data);
	}

	abrirActividades(funcion: ScDescriptorFuncion): void {
		if (!this.esFormatoExtensa || this.readOnly || !funcion) {
			return;
		}

		if (!funcion.CORR_FUNCION || funcion.CORR_FUNCION <= 0) {
			this.notifyDescriptorWarning('La funcion debe estar guardada antes de registrar actividades.');
			return;
		}

		this.funcionActividadesSeleccionada = funcion;
		this.actividadesPopupVisible = true;
		this.cargarActividadesPopup(funcion);
	}

	cerrarActividadesPopup(): void {
		this.actividadesPopupVisible = false;
		this.funcionActividadesSeleccionada = null;
		this.actividadesPopup = [];
	}

	agregarActividad(): void {
		const funcion = this.funcionActividadesSeleccionada;
		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!funcion?.CORR_FUNCION || corrDescriptor <= 0) {
			return;
		}

		this.service
			.crearActividad(corrDescriptor, funcion.CORR_FUNCION)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}

					const saved = this.extraerActividadGuardada(response);
					this.actividadesPopup.push({
						CORR_FUNCION: funcion.CORR_FUNCION,
						CORR_ACTIVIDAD: saved.CORR_ACTIVIDAD,
						NOMBRE_ACTIVIDAD: saved.NOMBRE_ACTIVIDAD ?? '',
					});
					this.actualizarContadorActividades(funcion);
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	eliminarActividad(actividad: ScDescriptorFuncionActividad): void {
		const funcion = this.funcionActividadesSeleccionada;
		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!actividad || !funcion) {
			return;
		}

		if (!actividad.CORR_ACTIVIDAD || actividad.CORR_ACTIVIDAD <= 0) {
			this.actividadesPopup = this.actividadesPopup.filter((item) => item !== actividad);
			this.actualizarContadorActividades(funcion);
			return;
		}

		this.service
			.eliminarActividad(corrDescriptor, funcion.CORR_FUNCION, actividad.CORR_ACTIVIDAD)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}

					this.actividadesPopup = this.actividadesPopup.filter(
						(item) => item.CORR_ACTIVIDAD !== actividad.CORR_ACTIVIDAD
					);
					this.actualizarContadorActividades(funcion);
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	onActividadChanged(e: any, actividad: ScDescriptorFuncionActividad): void {
		const funcion = this.funcionActividadesSeleccionada;
		if (!actividad || !funcion || this.readOnly) {
			return;
		}

		actividad.NOMBRE_ACTIVIDAD = `${e?.value ?? ''}`;
		this.programarPersistirActividad(actividad, funcion);
	}

	get actividadesPopupVisibles(): ScDescriptorFuncionActividad[] {
		return this.actividadesPopup;
	}


	agregarKpi(): void {
		if (this.readOnly || this.kpisEditando || !this.esFormatoCorta || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridKpis?.instance.addRow();
		this.kpisEditando = true;
	}

	editarKpiClick = (e: any): void => {
		if (this.readOnly || this.kpisEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.kpisEditando = true;
	};

	kpiEditButtonVisible = (e: any): boolean => {
		return !this.readOnly && !this.kpisEditando && !e.row?.isEditing;
	};

	kpiDeleteButtonVisible = (e: any): boolean => {
		return !this.readOnly && !this.kpisEditando && !e.row?.isEditing;
	};

	guardarKpiEditado(): void {
		const grid = this.gridKpis?.instance;
		if (!grid || !this.kpisEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarKpiEditado(): void {
		const grid = this.gridKpis?.instance;
		if (!grid?.hasEditData()) {
			this.kpisEditando = false;
			this.refrescarGridKpis();
			return;
		}
		grid.cancelEditData();
	}

	kpiInitNewRow(e: any): void {
		e.data.CORR_KPI_FUNCION = 0;
		e.data.NOMBRE_INDICADOR = '';
		e.data.CORR_FRECUENCIA = null;
		e.data.NOMBRE_FRECUENCIA = '';
		e.data.META = null;
		e.data._clientKey = this.crearClientKey('kpi');
	}

	onKpiEditingStart(_e: any): void {
		this.kpisEditando = true;
	}

	onKpiSaved(_e: any): void {
		this.kpisEditando = false;
		this.refrescarGridKpis();
	}

	onKpiEditCanceled(_e: any): void {
		this.kpisEditando = false;
		this.refrescarGridKpis();
	}

	kpiRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.NOMBRE_INDICADOR ?? '').trim()) {
			e.isValid = false;
			e.errorText = 'Debe indicar el nombre del indicador.';
		}
	}

	kpiRowInserting(e: any): void {
		e.cancel = this.persistirKpiDesdeGrid(e.data, true);
	}

	kpiRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirKpiDesdeGrid(data, false);
	}

	kpiRowRemoving(e: any): void {
		e.cancel = this.eliminarKpiDesdeGrid(e.data);
	}

	kpiFrecuenciaDisplay = (row: ScDescriptorKpiFuncion): string => {
		return row?.NOMBRE_FRECUENCIA || '';
	};

	onKpiFrecuenciaLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		const frecuencia = this.mCORR_FRECUENCIA.find((item) => Number(item.CORR_FRECUENCIA) === Number(corr));
		cellInfo.setValue(corr);
		if (cellInfo.data) {
			cellInfo.data.CORR_FRECUENCIA = corr;
			cellInfo.data.NOMBRE_FRECUENCIA = frecuencia?.NOMBRE_FRECUENCIA ?? '';
		}
	}

	onPerfilEdadMinimaChanged(e: any): void {
		if (this.readOnly) {
			return;
		}
		this.perfil.EDAD_MINIMA = this.normalizarEdadPerfil(e?.value);
		this.programarPersistirPerfil();
	}

	onPerfilEdadMaximaChanged(e: any): void {
		if (this.readOnly) {
			return;
		}
		this.perfil.EDAD_MAXIMA = this.normalizarEdadPerfil(e?.value);
		this.programarPersistirPerfil();
	}

	onPerfilSexoChanged(e: any): void {
		if (this.readOnly) {
			return;
		}
		this.perfil.SEXO = `${e?.value ?? PERFIL_PUESTO_DEFAULT.SEXO}`.trim().toUpperCase();
		this.programarPersistirPerfil();
	}

	onPerfilEstadoFamiliarChanged(e: any): void {
		if (this.readOnly) {
			return;
		}
		this.perfil.ESTADO_FAMILIAR = `${e?.value ?? PERFIL_PUESTO_DEFAULT.ESTADO_FAMILIAR}`.trim().toUpperCase();
		this.programarPersistirPerfil();
	}

	onPerfilDisponibilidadChanged(value: number | null): void {
		if (this.readOnly) {
			return;
		}
		this.perfil.CORR_DISPONIBILIDAD_HORARIO = value != null && value > 0 ? Number(value) : null;
		const item = this.mCORR_DISPONIBILIDAD_HORARIO.find(
			(row) => Number(row.CORR_DISPONIBILIDAD_HORARIO) === Number(this.perfil.CORR_DISPONIBILIDAD_HORARIO)
		);
		this.perfil.NOMBRE_DISPONIBILIDAD_HORARIO = item?.NOMBRE_DISPONIBILIDAD_HORARIO ?? '';
		this.programarPersistirPerfil();
	}

	onPerfilModalidadChanged(value: number | null): void {
		if (this.readOnly) {
			return;
		}
		this.perfil.CORR_TIPO_MODALIDAD = value != null && value > 0 ? Number(value) : null;
		const item = this.mCORR_TIPO_MODALIDAD.find(
			(row) => Number(row.CORR_TIPO_MODALIDAD) === Number(this.perfil.CORR_TIPO_MODALIDAD)
		);
		this.perfil.MODALIDAD_NOMBRE = item?.MODALIDAD_NOMBRE ?? '';
		this.programarPersistirPerfil();
	}

	onPerfilLicenciaChanged(e: any): void {
		if (this.readOnly) {
			return;
		}
		this.perfil.LICENCIA = e?.value === true;
		this.programarPersistirPerfil();
	}

	private normalizarEdadPerfil(value: unknown): number | null {
		if (value == null || value === '') {
			return null;
		}
		const parsed = Math.trunc(Number(value));
		if (Number.isNaN(parsed)) {
			return null;
		}
		return Math.min(120, Math.max(0, parsed));
	}

	private limpiarPerfil(): void {
		if (this.perfilPersistTimer) {
			clearTimeout(this.perfilPersistTimer);
			this.perfilPersistTimer = null;
		}
		this.perfil = { ...PERFIL_PUESTO_DEFAULT };
		this.perfilExiste = false;
		this.perfilSubTabIndex = 0;
	}

	private cargarPerfil(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.limpiarPerfil();
			return;
		}

		const loadSeq = ++this.perfilLoadSeq;
		this.service
			.getPerfilLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.perfilLoadSeq) {
						return;
					}

					const row = Array.isArray(response?.Data) ? response.Data[0] : null;
					if (response?.Result && row) {
						this.perfil = {
							CORR_EMPRESA: row.CORR_EMPRESA,
							CORR_DESCRIPTOR_PUESTO: row.CORR_DESCRIPTOR_PUESTO,
							CORR_PERFIL_PUESTO: row.CORR_PERFIL_PUESTO ?? 0,
							EDAD_MINIMA: row.EDAD_MINIMA ?? PERFIL_PUESTO_DEFAULT.EDAD_MINIMA,
							EDAD_MAXIMA: row.EDAD_MAXIMA ?? PERFIL_PUESTO_DEFAULT.EDAD_MAXIMA,
							SEXO: row.SEXO ?? PERFIL_PUESTO_DEFAULT.SEXO,
							ESTADO_FAMILIAR: row.ESTADO_FAMILIAR ?? PERFIL_PUESTO_DEFAULT.ESTADO_FAMILIAR,
							CORR_DISPONIBILIDAD_HORARIO: row.CORR_DISPONIBILIDAD_HORARIO ?? null,
							NOMBRE_DISPONIBILIDAD_HORARIO: row.NOMBRE_DISPONIBILIDAD_HORARIO ?? '',
							CORR_TIPO_MODALIDAD: row.CORR_TIPO_MODALIDAD ?? null,
							MODALIDAD_NOMBRE: row.MODALIDAD_NOMBRE ?? '',
							LICENCIA: row.LICENCIA ?? PERFIL_PUESTO_DEFAULT.LICENCIA,
						};
						this.perfilExiste = true;
						return;
					}

					this.perfil = { ...PERFIL_PUESTO_DEFAULT };
					this.perfilExiste = false;
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private programarPersistirPerfil(): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || this.readOnly) {
			return;
		}

		if (this.perfilPersistTimer) {
			clearTimeout(this.perfilPersistTimer);
		}

		this.perfilPersistTimer = setTimeout(() => this.persistirPerfilEnLinea(), 500);
	}

	private persistirPerfilEnLinea(): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || this.readOnly) {
			return;
		}

		this.service
			.persistirPerfil(corrDescriptor, this.perfil, this.perfilExiste)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}

					const saved = response.Data as ScDescriptorPerfilPuesto;
					if (saved) {
						this.perfil = {
							...this.perfil,
							...saved,
						};
						this.perfilExiste = true;
					} else if (Number(response?.CodeHelper) > 0) {
						this.perfil.CORR_PERFIL_PUESTO = Number(response.CodeHelper);
						this.perfilExiste = true;
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private cargarKpis(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoCorta) {
			this.kpis = [];
			this.resetearEdicionKpis();
			return;
		}

		if (!forzar && this.funcionesTabsDirty && !this.readOnly) {
			return;
		}

		const loadSeq = ++this.kpisLoadSeq;
		this.service
			.getKpisLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.kpisLoadSeq) {
						return;
					}

					if (!forzar && this.funcionesTabsDirty && !this.readOnly) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionKpis();
						this.kpis = response.Data.map((item: ScDescriptorKpiFuncion) => ({
							CORR_KPI_FUNCION: item.CORR_KPI_FUNCION,
							NOMBRE_INDICADOR: item.NOMBRE_INDICADOR ?? '',
							CORR_FRECUENCIA: item.CORR_FRECUENCIA ?? null,
							NOMBRE_FRECUENCIA: item.NOMBRE_FRECUENCIA ?? '',
							META: item.META ?? null,
							_clientKey: item.CORR_KPI_FUNCION || this.crearClientKey('kpi'),
						}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private cargarFuncionesClave(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.funcionesClave = [];
			this.resetearEdicionFuncionesClave();
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
						this.resetearEdicionFuncionesClave();
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
								_clientKey: item.CORR_FUNCION || this.crearClientKey('fc'),
							}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private cargarActividadesPopup(funcion: ScDescriptorFuncion): void {
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
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private actualizarContadorActividades(funcion: ScDescriptorFuncion): void {
		funcion.CANT_ACTIVIDADES = this.actividadesPopupVisibles.length;
	}

	private cargarFuncionesSecundarias(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoCorta) {
			if (!corrDescriptor || corrDescriptor <= 0) {
				this.funcionesSecundarias = [];
				this.resetearEdicionFuncionesSecundarias();
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
						this.resetearEdicionFuncionesSecundarias();
						this.funcionesSecundarias = response.Data
							.filter(
								(item: ScDescriptorFuncion) =>
									(item.TIPO_FUNCION ?? '').toUpperCase() === TIPO_FUNCION_SECUNDARIA
							)
							.map((item: ScDescriptorFuncion) => ({
								CORR_FUNCION: item.CORR_FUNCION,
								NOMBRE_FUNCION: item.NOMBRE_FUNCION ?? '',
								TIPO_FUNCION: item.TIPO_FUNCION ?? TIPO_FUNCION_SECUNDARIA,
								_clientKey: item.CORR_FUNCION || this.crearClientKey('fs'),
							}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
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

		this.guardarMttoDescriptor();
	}

	private guardarMttoDescriptor(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		const isAdd = this.banderaMtto === UpdateType.Add;
		const action = isAdd ? this.service.insert(this.model) : this.service.update(this.model);

		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response?.Result) {
					const descriptor = this.fillData(response.Data as ScDescriptorPuesto);
					descriptor.NOMBRE_UNIDAD = this.getNombreUnidad(descriptor.CORR_UNIDAD);
					descriptor.NOMBRE_PUESTO =
						descriptor.NOMBRE_PUESTO || this.getNombrePuesto(descriptor.CORR_PUESTO);

					this.model = descriptor;
					this.modelUpdate = this.fillData(descriptor);
					this.aplicarRegistroEnGrid(descriptor, isAdd);
					this.limpiarEstadoValidacionHeader();
					this.limpiarDatosTabs();
					this.AsignaStatus(UpdateType.Browse);
					this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));

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

	private requiereDescriptorGuardado(): boolean {
		const corr = this.obtenerCorrDescriptor();
		if (corr > 0) {
			return true;
		}

		this.notifyDescriptorWarning(
			'Debe guardar las generalidades del descriptor antes de registrar funciones o actividades.'
		);
		return false;
	}

	private obtenerCorrDescriptor(): number {
		return Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
	}

	private resetearEdicionFuncionesClave(): void {
		this.funcionesClaveEditando = false;
	}

	private resetearEdicionFuncionesSecundarias(): void {
		this.funcionesSecundariasEditando = false;
	}

	private resetearEdicionKpis(): void {
		this.kpisEditando = false;
	}

	private crearClientKey(prefix: string): string {
		return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
	}

	private refrescarGridFuncionesClave(): void {
		setTimeout(() => this.gridFuncionesClave?.instance?.refresh());
	}

	private refrescarGridFuncionesSecundarias(): void {
		setTimeout(() => this.gridFuncionesSecundarias?.instance?.refresh());
	}

	private refrescarGridKpis(): void {
		setTimeout(() => this.gridKpis?.instance?.refresh());
	}

	private persistirFuncionDesdeGrid(
		data: ScDescriptorFuncion,
		tipoFuncion: string,
		esNuevo: boolean
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const payload: ScDescriptorFuncion = {
			...data,
			CORR_FUNCION: esNuevo ? 0 : Number(data.CORR_FUNCION) || 0,
			NOMBRE_FUNCION: (data.NOMBRE_FUNCION ?? '').trim(),
			TIPO_FUNCION: tipoFuncion,
		};

		return new Promise((resolve) => {
			this.service
				.persistirFuncion(corrDescriptor, payload, tipoFuncion)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}

						if (tipoFuncion === TIPO_FUNCION_CLAVE) {
							this.funcionesClaveEditando = false;
							this.cargarFuncionesClave(true);
						} else {
							this.funcionesSecundariasEditando = false;
							this.cargarFuncionesSecundarias(true);
						}
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
						resolve(true);
					},
				});
		});
	}

	private eliminarFuncionDesdeGrid(data: ScDescriptorFuncion): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrFuncion = Number(data?.CORR_FUNCION);
		if (!corrFuncion || corrFuncion <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarFuncion(corrDescriptor, corrFuncion)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
						resolve(true);
					},
				});
		});
	}

	private persistirKpiDesdeGrid(data: ScDescriptorKpiFuncion, esNuevo: boolean): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const payload: ScDescriptorKpiFuncion = {
			...data,
			CORR_KPI_FUNCION: esNuevo ? 0 : Number(data.CORR_KPI_FUNCION) || 0,
			NOMBRE_INDICADOR: (data.NOMBRE_INDICADOR ?? '').trim(),
			CORR_FRECUENCIA: data.CORR_FRECUENCIA ?? null,
			META: data.META ?? null,
		};

		return new Promise((resolve) => {
			this.service
				.persistirKpi(corrDescriptor, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						this.kpisEditando = false;
						this.cargarKpis(true);
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
						resolve(true);
					},
				});
		});
	}

	private eliminarKpiDesdeGrid(data: ScDescriptorKpiFuncion): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrKpi = Number(data?.CORR_KPI_FUNCION);
		if (!corrKpi || corrKpi <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarKpi(corrDescriptor, corrKpi)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
						resolve(true);
					},
				});
		});
	}

	private extraerFuncionGuardada(response: any): ScDescriptorFuncion {
		const data = response?.Data;
		if (Array.isArray(data) && data.length > 0) {
			return data[data.length - 1] as ScDescriptorFuncion;
		}

		return (data ?? {}) as ScDescriptorFuncion;
	}

	private extraerActividadGuardada(response: any): ScDescriptorFuncionActividad {
		const data = response?.Data;
		if (Array.isArray(data) && data.length > 0) {
			return data[data.length - 1] as ScDescriptorFuncionActividad;
		}

		return (data ?? {}) as ScDescriptorFuncionActividad;
	}

	private extraerKpiGuardado(response: any): ScDescriptorKpiFuncion {
		const data = response?.Data;
		if (Array.isArray(data) && data.length > 0) {
			return data[data.length - 1] as ScDescriptorKpiFuncion;
		}

		return (data ?? {}) as ScDescriptorKpiFuncion;
	}

	private programarPersistirKpi(kpi: ScDescriptorKpiFuncion): void {
		if (!kpi?.CORR_KPI_FUNCION || kpi.CORR_KPI_FUNCION <= 0) {
			return;
		}

		this.marcarFuncionesTabsDirty();
		const key = `kpi-${kpi.CORR_KPI_FUNCION}`;
		const prev = this.kpiPersistTimers.get(key);
		if (prev) {
			clearTimeout(prev);
		}

		this.kpiPersistTimers.set(
			key,
			setTimeout(() => {
				this.kpiPersistTimers.delete(key);
				this.persistirKpiEnLinea(kpi);
			}, 500)
		);
	}

	private persistirKpiEnLinea(kpi: ScDescriptorKpiFuncion): void {
		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor) {
			return;
		}

		this.service
			.persistirKpi(corrDescriptor, kpi)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					this.resetearFuncionesTabsDirty();
					if (response?.Result && response.Data) {
						const saved = this.extraerKpiGuardado(response);
						kpi.NOMBRE_FRECUENCIA = saved.NOMBRE_FRECUENCIA ?? kpi.NOMBRE_FRECUENCIA;
					} else if (!response?.Result) {
						this.notifyApiResponse(response);
					}
				},
				error: (error) => {
					this.resetearFuncionesTabsDirty();
					this.notifyApiError(error);
				},
			});
	}

	private programarPersistirFuncion(funcion: ScDescriptorFuncion, tipoFuncion: string): void {
		if (!funcion?.CORR_FUNCION || funcion.CORR_FUNCION <= 0) {
			return;
		}

		this.marcarFuncionesTabsDirty();
		const key = `${tipoFuncion}-${funcion.CORR_FUNCION}`;
		const prev = this.funcionPersistTimers.get(key);
		if (prev) {
			clearTimeout(prev);
		}

		this.funcionPersistTimers.set(
			key,
			setTimeout(() => {
				this.funcionPersistTimers.delete(key);
				this.persistirFuncionEnLinea(funcion, tipoFuncion);
			}, 500)
		);
	}

	private persistirFuncionEnLinea(funcion: ScDescriptorFuncion, tipoFuncion: string): void {
		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor) {
			return;
		}

		this.service
			.persistirFuncion(corrDescriptor, funcion, tipoFuncion)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					this.resetearFuncionesTabsDirty();
					if (!response?.Result) {
						this.notifyApiResponse(response);
					}
				},
				error: (error) => {
					this.resetearFuncionesTabsDirty();
					this.notifyApiError(error);
				},
			});
	}

	private programarPersistirActividad(
		actividad: ScDescriptorFuncionActividad,
		funcion: ScDescriptorFuncion
	): void {
		if (!actividad?.CORR_ACTIVIDAD || actividad.CORR_ACTIVIDAD <= 0 || !funcion?.CORR_FUNCION) {
			return;
		}

		const key = `${funcion.CORR_FUNCION}-${actividad.CORR_ACTIVIDAD}`;
		const prev = this.actividadPersistTimers.get(key);
		if (prev) {
			clearTimeout(prev);
		}

		this.actividadPersistTimers.set(
			key,
			setTimeout(() => {
				this.actividadPersistTimers.delete(key);
				this.persistirActividadEnLinea(actividad, funcion);
			}, 500)
		);
	}

	private persistirActividadEnLinea(
		actividad: ScDescriptorFuncionActividad,
		funcion: ScDescriptorFuncion
	): void {
		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor || !funcion?.CORR_FUNCION) {
			return;
		}

		this.service
			.persistirActividad(corrDescriptor, funcion.CORR_FUNCION, actividad)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					if (!response?.Result) {
						this.notifyApiResponse(response);
					}
				},
				error: (error) => this.notifyApiError(error),
			});
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
