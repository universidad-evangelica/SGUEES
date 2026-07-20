import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { DxTabPanelComponent } from 'devextreme-angular/ui/tab-panel';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';

import { ScDescriptorFuncionActividad } from './sc-descriptor-funcion-actividad/models/sc-descriptor-funcion-actividad';
import { ScDescriptorFuncion } from './sc-descriptor-funcion/models/sc-descriptor-funcion';
import { ScDescriptorRelacionLaboral } from './sc-descriptor-relacion-laboral/models/sc-descriptor-relacion-laboral';
import {
	ScDescriptorKpiFuncion,
	ScFrecuenciaLookup,
} from './sc-descriptor-kpi-funcion/models/sc-descriptor-kpi-funcion';
import {
	ScDescriptorPerfilPuesto,
	ScDisponibilidadHorarioLookup,
	ScTipoModalidadLookup,
} from './sc-descriptor-perfil-puesto/models/sc-descriptor-perfil-puesto';
import { ScPerfilPuestoEducacion } from './sc-perfil-puesto-educacion/models/sc-perfil-puesto-educacion';
import { ScPerfilPuestoExperiencia } from './sc-perfil-puesto-experiencia/models/sc-perfil-puesto-experiencia';
import { ScPerfilPuestoCompetenciasTecnicas } from './sc-perfil-puesto-competencias-tecnicas/models/sc-perfil-puesto-competencias-tecnicas';
import { ScPerfilPuestoCompetenciasConductuales } from './sc-perfil-puesto-competencias-conductuales/models/sc-perfil-puesto-competencias-conductuales';
import { ScDescriptorPuestoRequerimientoOrganizacional } from './sc-descriptor-puesto-requerimiento-organizacional/models/sc-descriptor-puesto-requerimiento-organizacional';
import { ScDescriptorPuestoRiesgoPuesto } from './sc-descriptor-puesto-riesgo-puesto/models/sc-descriptor-puesto-riesgo-puesto';
import {
	IMPACTO_ECONOMICO_CLIENT_KEY,
	IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR,
	ScDescriptorPuestoResponsabilidadCargo,
} from './sc-descriptor-puesto-responsabilidad-cargo/models/sc-descriptor-puesto-responsabilidad-cargo';
import {
	FORMATO_CORTO,
	FORMATO_EXTENSO,
	MOCK_PUESTOS,
	MOCK_UNIDADES,
	MockPuesto,
	MockUnidad,
	PERFIL_PUESTO_DEFAULT,
	ScCompetenciaConductualLookupItem,
	ScCompetenciaTecnicaLookupItem,
	ScDescriptorPuesto,
	ScImpactoEconomicoLookupItem,
	ScInduccionLookupItem,
	ScRequerimientoOrganizacionalLookupItem,
	ScResponsabilidadCargoLookupItem,
	ScRiesgoPuestoLookupItem,
	TIPO_FUNCION_CLAVE,
	TIPO_FUNCION_SECUNDARIA,
	TIPO_RELACION_EXTERNA,
	TIPO_RELACION_INTERNA,
} from './models/sc-descriptor-puesto';
import { ScDescriptorPuestoService } from './sc-descriptor-puesto.service';

@Component({
	selector: 'app-sc-descriptor-puesto',
	templateUrl: './sc-descriptor-puesto.component.html',
	styleUrls: ['./sc-descriptor-puesto.component.scss'],
})
// Vista de mantenimiento del Descriptor de Puesto (encabezado + secciones por formato).
export class ScDescriptorPuestoComponent extends CBaseComponent implements OnInit, OnDestroy {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('fHeaderData', { static: false }) headerForm!: DxFormComponent;
	@ViewChild('tabPanelSecciones', { static: false }) tabPanelSecciones?: DxTabPanelComponent;
	@ViewChild('gridFuncionesClave', { static: false }) gridFuncionesClave?: DxDataGridComponent;
	@ViewChild('gridFuncionesSecundarias', { static: false }) gridFuncionesSecundarias?: DxDataGridComponent;
	@ViewChild('gridKpis', { static: false }) gridKpis?: DxDataGridComponent;
	@ViewChild('gridEducacion', { static: false }) gridEducacion?: DxDataGridComponent;
	@ViewChild('gridExperiencia', { static: false }) gridExperiencia?: DxDataGridComponent;
	@ViewChild('gridCompetenciasTecnicas', { static: false }) gridCompetenciasTecnicas?: DxDataGridComponent;
	@ViewChild('gridCompetenciasConductuales', { static: false }) gridCompetenciasConductuales?: DxDataGridComponent;
	@ViewChild('gridRequerimientosOrganizacionales', { static: false })
	gridRequerimientosOrganizacionales?: DxDataGridComponent;
	@ViewChild('gridRiesgosPuesto', { static: false }) gridRiesgosPuesto?: DxDataGridComponent;
	@ViewChild('gridResponsabilidadesCargo', { static: false })
	gridResponsabilidadesCargo?: DxDataGridComponent;
	@ViewChild('gridActividades', { static: false }) gridActividades?: DxDataGridComponent;
	@ViewChild('gridRelacionesInternas', { static: false }) gridRelacionesInternas?: DxDataGridComponent;
	@ViewChild('gridRelacionesExternas', { static: false }) gridRelacionesExternas?: DxDataGridComponent;

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
	// Lookup del editor KPI: activas + solo la frecuencia de la fila en edición (si está inactiva).
	mCORR_FRECUENCIA_KPI_EDIT: ScFrecuenciaLookup[] = [];
	mCORR_DISPONIBILIDAD_HORARIO: ScDisponibilidadHorarioLookup[] = [];
	// Lookup de perfil: activas + la disponibilidad ya asociada (si está inactiva).
	mCORR_DISPONIBILIDAD_HORARIO_EDIT: ScDisponibilidadHorarioLookup[] = [];
	mCORR_TIPO_MODALIDAD: ScTipoModalidadLookup[] = [];
	mCORR_INDUCCION: ScInduccionLookupItem[] = [];
	// Lookup de entrenamiento: activas + la inducción ya asociada al descriptor (si está inactiva).
	mCORR_INDUCCION_EDIT: ScInduccionLookupItem[] = [];
	mCORR_COMPETENCIAS_TECNICAS: ScCompetenciaTecnicaLookupItem[] = [];
	mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES: ScCompetenciaTecnicaLookupItem[] = [];
	mCORR_COMPETENCIAS_CONDUCTUALES: ScCompetenciaConductualLookupItem[] = [];
	mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES: ScCompetenciaConductualLookupItem[] = [];
	mCORR_REQUERIMIENTO_ORGANIZACIONAL: ScRequerimientoOrganizacionalLookupItem[] = [];
	mCORR_REQUERIMIENTO_ORGANIZACIONAL_DISPONIBLES: ScRequerimientoOrganizacionalLookupItem[] = [];
	mCORR_RIESGO_PUESTO: ScRiesgoPuestoLookupItem[] = [];
	mCORR_RIESGO_PUESTO_DISPONIBLES: ScRiesgoPuestoLookupItem[] = [];
	mCORR_RESPONSABILIDAD: ScResponsabilidadCargoLookupItem[] = [];
	mCORR_RESPONSABILIDAD_DISPONIBLES: ScResponsabilidadCargoLookupItem[] = [];
	mCORR_IMPACTO_ECONOMICO: ScImpactoEconomicoLookupItem[] = [];
	impactosEconomicosLookupColumns = [
		{ dataField: 'CORR_IMPACTO_ECONOMICO', caption: 'Codigo', width: 90 },
		{ dataField: 'DESCRIPCION', caption: 'Impacto economico', width: 360 },
	];
	reportaLookupColumns = [
		{ dataField: 'RESPONSABLE', caption: 'Nombre', width: 220 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 260 },
	];
	competenciasTecnicasLookupColumns = [
		/*
		{ dataField: 'GRUPO_NIV1', caption: 'Grupo NIV1', width: 180 },
		{ dataField: 'GRUPO_NIV2', caption: 'Grupo NIV2', width: 180 },*/
		{ dataField: 'CODIGO_COMPETENCIAS_TECNICAS', caption: 'Codigo', width: 120 }, // Codigo NIV3
		//{ dataField: 'NIVEL', caption: 'Nivel', width: 80 },
		{ dataField: 'NOMBRE_COMPETENCIAS_TECNICAS', caption: 'Competencia Técnica', width: 220 }, // Competencia NIV3
		//{ dataField: 'DESCRIPCION', caption: 'Definicion', width: 260 },
	];
	competenciasConductualesLookupColumns = [
		//{ dataField: 'CORR_COMPETENCIAS_CONDUCTUALES', caption: 'Corr.', width: 90 },
		{ dataField: 'CODIGO_TIPO_PUESTO', caption: 'Codigo', width: 140 }, // Cod. tipo puesto o Grupo ocupacional
		{ dataField: 'NOMBRE_COMPETENCIAS_CONDUCTUALES', caption: 'Competencia Conductual', width: 220 },
	];
	requerimientosOrganizacionalesLookupColumns = [
		{ dataField: 'CORR_REQUERIMIENTO_ORGANIZACIONAL', caption: 'Codigo', width: 90 },
		{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 320 },
	];
	riesgosPuestoLookupColumns = [
		{ dataField: 'CORR_RIESGO_PUESTO', caption: 'Codigo', width: 90 },
		{ dataField: 'NOMBRE_RIESGO_PUESTO', caption: 'Riesgo', width: 320 },
	];
	responsabilidadesCargoLookupColumns = [
		{ dataField: 'CORR_RESPONSABILIDAD', caption: 'Codigo', width: 90 },
		{ dataField: 'NOMBRE_RESPONSABILIDAD', caption: 'Responsabilidad', width: 320 },
	];

	headerItems: any[] = [];
	itemsTabBitacora: any[] = [];

	funcionesClave: ScDescriptorFuncion[] = [];
	funcionesSecundarias: ScDescriptorFuncion[] = [];
	kpis: ScDescriptorKpiFuncion[] = [];
	educaciones: ScPerfilPuestoEducacion[] = [];
	experiencias: ScPerfilPuestoExperiencia[] = [];
	competenciasTecnicas: ScPerfilPuestoCompetenciasTecnicas[] = [];
	competenciasConductuales: ScPerfilPuestoCompetenciasConductuales[] = [];
	requerimientosOrganizacionales: ScDescriptorPuestoRequerimientoOrganizacional[] = [];
	riesgosPuesto: ScDescriptorPuestoRiesgoPuesto[] = [];
	responsabilidadesCargo: ScDescriptorPuestoResponsabilidadCargo[] = [];
	relacionesInternas: ScDescriptorRelacionLaboral[] = [];
	relacionesExternas: ScDescriptorRelacionLaboral[] = [];
	funcionesClaveEditando = false;
	funcionesSecundariasEditando = false;
	kpisEditando = false;
	educacionEditando = false;
	experienciaEditando = false;
	competenciasTecnicasEditando = false;
	competenciasConductualesEditando = false;
	requerimientosOrganizacionalesEditando = false;
	requerimientosOrganizacionalesInsertando = false;
	riesgosPuestoEditando = false;
	riesgosPuestoInsertando = false;
	private riesgoPuestoPersistiendo = false;
	responsabilidadesCargoEditando = false;
	responsabilidadesCargoInsertando = false;
	private responsabilidadCargoPersistiendo = false;
	actividadesEditando = false;
	relacionesInternasEditando = false;
	relacionesExternasEditando = false;
	perfil: ScDescriptorPerfilPuesto = { ...PERFIL_PUESTO_DEFAULT };
	perfilEditando = false;
	entrenamientoEditando = false;
	induccionInvalida = false;
	perfilSubTabIndex = 0;
	competenciasSubTabIndex = 0;
	relacionesSubTabIndex = 0;
	perfilSexoOptions: Array<{ Key: any; Value: string }> = [];
	perfilEstadoFamiliarOptions: Array<{ Key: any; Value: string }> = [];
	perfilLicenciaOptions: Array<{ Key: any; Value: string }> = [];
	educacionTipoRequeridoOptions: Array<{ Key: any; Value: string }> = [];
	competenciaTecnicaNivelDominioOptions: Array<{ Key: any; Value: string }> = [];
	mFORMATO: Array<{ Key: any; Value: string }> = [];
	actividadesPopupVisible = false;
	actividadesPopupFullScreen = false;
	funcionActividadesSeleccionada: ScDescriptorFuncion | null = null;
	actividadesPopup: ScDescriptorFuncionActividad[] = [];

	private funcionesClaveLoadSeq = 0;
	private funcionesSecundariasLoadSeq = 0;
	private kpisLoadSeq = 0;
	private educacionLoadSeq = 0;
	private experienciaLoadSeq = 0;
	private competenciasTecnicasLoadSeq = 0;
	private competenciasConductualesLoadSeq = 0;
	private requerimientosOrganizacionalesLoadSeq = 0;
	private riesgosPuestoLoadSeq = 0;
	private responsabilidadesCargoLoadSeq = 0;
	private relacionesInternasLoadSeq = 0;
	private relacionesExternasLoadSeq = 0;
	private perfilLoadSeq = 0;
	private perfilExiste = false;
	private perfilOriginal: ScDescriptorPerfilPuesto = { ...PERFIL_PUESTO_DEFAULT };
	private entrenamientoOriginal = {
		CORR_INDUCCION: null as number | null,
		NOMBRE_INDUCCION: '',
		SEMANAS_INDUCCION: null as number | null,
		RESPONSABLE: '',
	};
	private sincronizandoHeader = false;
	private ultimoFormatoAplicado: string | null = null;
	private ultimoTabSeccionValido = 0;
	mostrarAvisoSeleccioneTab = false;
	readonly actividadesPopupWrapperAttr = { class: 'descriptor-actividades-popup-wrapper' };
	private actividadesPopupMediaQuery?: MediaQueryList;
	private readonly onActividadesPopupMediaChange = (event: MediaQueryListEvent): void => {
		this.actividadesPopupFullScreen = event.matches;
	};

	private readonly maintenanceSubtitulo = 'Descriptor de Puesto';

	// Inyecta servicio, route y ChangeDetectorRef; configura el mtto base.
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScDescriptorPuestoService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_UNIDAD = this.selectedLookUpCORR_UNIDAD.bind(this);
		this.selectedLookUpCORR_PUESTO = this.selectedLookUpCORR_PUESTO.bind(this);
		this.selectedLookUpCORR_PUESTO_REPORTA = this.selectedLookUpCORR_PUESTO_REPORTA.bind(this);
		this.selectedLookUpCORR_FRECUENCIA = this.selectedLookUpCORR_FRECUENCIA.bind(this);
		this.selectedLookUpCORR_DISPONIBILIDAD_HORARIO = this.selectedLookUpCORR_DISPONIBILIDAD_HORARIO.bind(this);
		this.selectedLookUpCORR_TIPO_MODALIDAD = this.selectedLookUpCORR_TIPO_MODALIDAD.bind(this);
		this.selectedLookUpCORR_INDUCCION = this.selectedLookUpCORR_INDUCCION.bind(this);
		this.selectedLookUpCORR_COMPETENCIAS_TECNICAS = this.selectedLookUpCORR_COMPETENCIAS_TECNICAS.bind(this);
		this.selectedLookUpCORR_COMPETENCIAS_CONDUCTUALES = this.selectedLookUpCORR_COMPETENCIAS_CONDUCTUALES.bind(this);
		this.selectedLookUpCORR_REQUERIMIENTO_ORGANIZACIONAL =
			this.selectedLookUpCORR_REQUERIMIENTO_ORGANIZACIONAL.bind(this);
		this.selectedLookUpCORR_RIESGO_PUESTO = this.selectedLookUpCORR_RIESGO_PUESTO.bind(this);
		this.selectedLookUpCORR_RESPONSABILIDAD = this.selectedLookUpCORR_RESPONSABILIDAD.bind(this);
		this.selectedLookUpCORR_IMPACTO_ECONOMICO =
			this.selectedLookUpCORR_IMPACTO_ECONOMICO.bind(this);
		this.funcionClaveEditButtonVisible = this.funcionClaveEditButtonVisible.bind(this);
		this.funcionClaveDeleteButtonVisible = this.funcionClaveDeleteButtonVisible.bind(this);
		this.editarFuncionClaveClick = this.editarFuncionClaveClick.bind(this);
		this.funcionSecundariaEditButtonVisible = this.funcionSecundariaEditButtonVisible.bind(this);
		this.funcionSecundariaDeleteButtonVisible = this.funcionSecundariaDeleteButtonVisible.bind(this);
		this.editarFuncionSecundariaClick = this.editarFuncionSecundariaClick.bind(this);
		this.kpiEditButtonVisible = this.kpiEditButtonVisible.bind(this);
		this.kpiDeleteButtonVisible = this.kpiDeleteButtonVisible.bind(this);
		this.editarKpiClick = this.editarKpiClick.bind(this);
		this.educacionEditButtonVisible = this.educacionEditButtonVisible.bind(this);
		this.educacionDeleteButtonVisible = this.educacionDeleteButtonVisible.bind(this);
		this.editarEducacionClick = this.editarEducacionClick.bind(this);
		this.experienciaEditButtonVisible = this.experienciaEditButtonVisible.bind(this);
		this.experienciaDeleteButtonVisible = this.experienciaDeleteButtonVisible.bind(this);
		this.editarExperienciaClick = this.editarExperienciaClick.bind(this);
		this.competenciaTecnicaEditButtonVisible = this.competenciaTecnicaEditButtonVisible.bind(this);
		this.competenciaTecnicaDeleteButtonVisible = this.competenciaTecnicaDeleteButtonVisible.bind(this);
		this.editarCompetenciaTecnicaClick = this.editarCompetenciaTecnicaClick.bind(this);
		this.competenciaConductualEditButtonVisible = this.competenciaConductualEditButtonVisible.bind(this);
		this.competenciaConductualDeleteButtonVisible = this.competenciaConductualDeleteButtonVisible.bind(this);
		this.editarCompetenciaConductualClick = this.editarCompetenciaConductualClick.bind(this);
		this.requerimientoOrganizacionalEditButtonVisible =
			this.requerimientoOrganizacionalEditButtonVisible.bind(this);
		this.requerimientoOrganizacionalDeleteButtonVisible =
			this.requerimientoOrganizacionalDeleteButtonVisible.bind(this);
		this.editarRequerimientoOrganizacionalClick = this.editarRequerimientoOrganizacionalClick.bind(this);
		this.riesgoPuestoEditButtonVisible = this.riesgoPuestoEditButtonVisible.bind(this);
		this.riesgoPuestoDeleteButtonVisible = this.riesgoPuestoDeleteButtonVisible.bind(this);
		this.editarRiesgoPuestoClick = this.editarRiesgoPuestoClick.bind(this);
		this.responsabilidadCargoEditButtonVisible = this.responsabilidadCargoEditButtonVisible.bind(this);
		this.responsabilidadCargoDeleteButtonVisible = this.responsabilidadCargoDeleteButtonVisible.bind(this);
		this.editarResponsabilidadCargoClick = this.editarResponsabilidadCargoClick.bind(this);
		this.actividadEditButtonVisible = this.actividadEditButtonVisible.bind(this);
		this.actividadDeleteButtonVisible = this.actividadDeleteButtonVisible.bind(this);
		this.editarActividadClick = this.editarActividadClick.bind(this);
		this.relacionInternaEditButtonVisible = this.relacionInternaEditButtonVisible.bind(this);
		this.relacionInternaDeleteButtonVisible = this.relacionInternaDeleteButtonVisible.bind(this);
		this.editarRelacionInternaClick = this.editarRelacionInternaClick.bind(this);
		this.relacionExternaEditButtonVisible = this.relacionExternaEditButtonVisible.bind(this);
		this.relacionExternaDeleteButtonVisible = this.relacionExternaDeleteButtonVisible.bind(this);
		this.editarRelacionExternaClick = this.editarRelacionExternaClick.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.headerItems = this.service.getHeaderItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Inicializa mtto, combos y consulta inicial del descriptor de puesto.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.consultar();
		this.configurarActividadesPopupResponsive();
	}

	// Limpia suscripciones/timers al destruir el componente.
	ngOnDestroy(): void {
		this.actividadesPopupMediaQuery?.removeEventListener('change', this.onActividadesPopupMediaChange);
	}

	// Ajusta el popup de actividades al ancho de pantalla para mantenerlo usable en mobile.
	private configurarActividadesPopupResponsive(): void {
		if (typeof window === 'undefined' || !window.matchMedia) {
			return;
		}

		this.actividadesPopupMediaQuery = window.matchMedia('(max-width: 991.98px)');
		this.actividadesPopupFullScreen = this.actividadesPopupMediaQuery.matches;
		this.actividadesPopupMediaQuery.addEventListener('change', this.onActividadesPopupMediaChange);
	}

	// Carga los catálogos generales que alimentan el encabezado y los grids de las distintas secciones.
	// Cada lookup conserva su indicador de carga para no bloquear la vista mientras llegan respuestas paralelas.
	llenaComboBox(): void {
		this.mCORR_UNIDAD = [...MOCK_UNIDADES];
		this.actualizarPuestosPorUnidad(this.model?.CORR_UNIDAD ?? null);
		this.getCORR_FRECUENCIA();
		this.getCORR_DISPONIBILIDAD_HORARIO();
		this.getCORR_TIPO_MODALIDAD();
		this.getCORR_INDUCCION();
		this.getCORR_COMPETENCIAS_TECNICAS_NIV3();
		this.getCORR_COMPETENCIAS_CONDUCTUALES();
		this.getCORR_REQUERIMIENTO_ORGANIZACIONAL();
		this.getCORR_RIESGO_PUESTO();
		this.getCORR_RESPONSABILIDAD();
		this.getCORR_IMPACTO_ECONOMICO();
		this.getFORMATO();
		this.getNIVEL_DOMINIO();
		this.getSEXO();
		this.getESTADO_FAMILIAR();
		this.getLICENCIA();
		this.getTIPO_REQUERIDO();
	}

	getFORMATO(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_LISTA',
				'GetFORMATO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mFORMATO = response.Data;
						this.aplicarFormatoLookupAlHeader();
					}
				},
				error: (error) => {
					this.notifyApiError(error);
				},
			});
	}

	getNIVEL_DOMINIO(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_LISTA',
				'GetNIVEL_DOMINIO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.competenciaTecnicaNivelDominioOptions = response.Data;
					}
				},
				error: (error) => {
					this.notifyApiError(error);
				},
			});
	}

	getSEXO(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_LISTA',
				'GetSEXO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.perfilSexoOptions = response.Data;
					}
				},
				error: (error) => {
					this.notifyApiError(error);
				},
			});
	}

	getESTADO_FAMILIAR(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_LISTA',
				'GetESTADO_FAMILIAR',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.perfilEstadoFamiliarOptions = response.Data;
					}
				},
				error: (error) => {
					this.notifyApiError(error);
				},
			});
	}

	getLICENCIA(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_LISTA',
				'GetLICENCIA',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.perfilLicenciaOptions = response.Data;
					}
				},
				error: (error) => {
					this.notifyApiError(error);
				},
			});
	}

	getTIPO_REQUERIDO(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_LISTA',
				'GetTIPO_REQUERIDO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.educacionTipoRequeridoOptions = response.Data;
					}
				},
				error: (error) => {
					this.notifyApiError(error);
				},
			});
	}

	// Sincroniza el lookup de FORMATO del encabezado con el valor actual del modelo.
	private aplicarFormatoLookupAlHeader(): void {
		const item = this.headerItems?.find((x) => x.dataField === 'FORMATO');
		if (!item) {
			return;
		}

		item.editorOptions = {
			...(item.editorOptions || {}),
			dataSource: this.mFORMATO,
			displayExpr: 'Value',
			valueExpr: 'Key',
			placeholder: 'Seleccione...',
		};

		this.headerForm?.instance?.itemOption('FORMATO', 'editorOptions', item.editorOptions);
	}

	getCORR_FRECUENCIA(): void {
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

	getCORR_DISPONIBILIDAD_HORARIO(): void {
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
					} else {
						this.mCORR_DISPONIBILIDAD_HORARIO = [];
					}
					this.prepararDisponibilidadLookupParaPerfil();
				},
				error: (error) => {
					this.mCORR_DISPONIBILIDAD_HORARIO = [];
					this.prepararDisponibilidadLookupParaPerfil();
					this.notifyApiError(error);
				},
			});
	}

	getCORR_TIPO_MODALIDAD(): void {
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

	getCORR_INDUCCION(): void {
		this.service
			.getInduccionesLookup()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_INDUCCION = [];
						this.prepararInduccionesLookupParaEntrenamiento();
						return;
					}

					this.mCORR_INDUCCION = response.Data.map((item: ScInduccionLookupItem) => ({
						CORR_INDUCCION: Number(item.CORR_INDUCCION),
						NOMBRE_INDUCCION: (item.NOMBRE_INDUCCION ?? '').trim(),
						SEMANAS_INDUCCION:
							item.SEMANAS_INDUCCION != null ? Number(item.SEMANAS_INDUCCION) : null,
					}));
					this.prepararInduccionesLookupParaEntrenamiento();
				},
				error: (error) => {
					this.mCORR_INDUCCION = [];
					this.prepararInduccionesLookupParaEntrenamiento();
					this.notifyApiError(error);
				},
			});
	}

	getCORR_COMPETENCIAS_TECNICAS_NIV3(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_COMPETENCIAS_TECNICAS',
				'GetCORR_COMPETENCIAS_TECNICAS_NIV3',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_COMPETENCIAS_TECNICAS = [];
						this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES = [];
						return;
					}

					this.mCORR_COMPETENCIAS_TECNICAS = response.Data.map((item: any) => {
						const codigo = (item.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim();
						const nombre = (item.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim();
						const descripcion = (item.DESCRIPCION ?? nombre).trim();
						const grupoNiv1 = (item.GRUPO_NIV1 ?? item.CODIGO_NIV1 ?? 'Sin grupo NIV1').trim();
						const grupoNiv2 = (
							item.GRUPO_NIV2 ??
							item.GRUPO_PADRE ??
							item.CODIGO_PADRE ??
							'Sin grupo NIV2'
						).trim();
						const nivel = (item.NIVEL ?? 'NIV3').trim() || 'NIV3';
						const nombreDisplay =
							(item.NOMBRE_DISPLAY ?? '').trim() ||
							[codigo, nivel, nombre].filter((parte) => !!parte).join(' | ');

						return {
							CORR_COMPETENCIAS_TECNICAS: Number(item.CORR_COMPETENCIAS_TECNICAS),
							CORR_COMPETENCIAS_TECNICAS_PADRE:
								item.CORR_COMPETENCIAS_TECNICAS_PADRE != null
									? Number(item.CORR_COMPETENCIAS_TECNICAS_PADRE)
									: null,
							CODIGO_COMPETENCIAS_TECNICAS: codigo,
							NOMBRE_COMPETENCIAS_TECNICAS: nombre,
							DESCRIPCION: descripcion,
							NOMBRE_DISPLAY: nombreDisplay || codigo || '(Sin nombre)',
							GRUPO_NIV1: grupoNiv1 || 'Sin grupo NIV1',
							GRUPO_NIV2: grupoNiv2 || 'Sin grupo NIV2',
							GRUPO_PADRE: grupoNiv2 || 'Sin grupo NIV2',
							NIVEL: nivel,
						};
					});
					this.actualizarCompetenciasTecnicasLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_COMPETENCIAS_TECNICAS = [];
					this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	getCORR_COMPETENCIAS_CONDUCTUALES(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_COMPETENCIAS_CONDUCTUALES',
				'GetCORR_COMPETENCIAS_CONDUCTUALES',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_COMPETENCIAS_CONDUCTUALES = [];
						this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES = [];
						return;
					}

					this.mCORR_COMPETENCIAS_CONDUCTUALES = response.Data.map((item: any) => {
						const nombre = (item.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim();
						const descripcion = (item.DESCRIPCION ?? nombre).trim();
						const tipoPuesto = (item.NOMBRE_TIPO_PUESTO ?? '').trim();
						const codigoTipoPuesto = (item.CODIGO_TIPO_PUESTO ?? '').trim();

						return {
							CORR_COMPETENCIAS_CONDUCTUALES: Number(item.CORR_COMPETENCIAS_CONDUCTUALES),
							NOMBRE_COMPETENCIAS_CONDUCTUALES: nombre,
							DESCRIPCION: descripcion,
							NOMBRE_TIPO_PUESTO: tipoPuesto,
							CODIGO_TIPO_PUESTO: codigoTipoPuesto,
						};
					});
					this.actualizarCompetenciasConductualesLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_COMPETENCIAS_CONDUCTUALES = [];
					this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	getCORR_REQUERIMIENTO_ORGANIZACIONAL(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_REQUERIMIENTO_ORGANIZACIONAL',
				'GetCORR_REQUERIMIENTO_ORGANIZACIONAL',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_REQUERIMIENTO_ORGANIZACIONAL = [];
						this.mCORR_REQUERIMIENTO_ORGANIZACIONAL_DISPONIBLES = [];
						return;
					}

					this.mCORR_REQUERIMIENTO_ORGANIZACIONAL = response.Data.map((item: any) => ({
						CORR_REQUERIMIENTO_ORGANIZACIONAL: Number(item.CORR_REQUERIMIENTO_ORGANIZACIONAL),
						DESCRIPCION: (item.DESCRIPCION ?? '').trim(),
					}));
					this.actualizarRequerimientosOrganizacionalesLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_REQUERIMIENTO_ORGANIZACIONAL = [];
					this.mCORR_REQUERIMIENTO_ORGANIZACIONAL_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	getCORR_RIESGO_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_RIESGO_PUESTO',
				'GetCORR_RIESGO_PUESTO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_RIESGO_PUESTO = [];
						this.mCORR_RIESGO_PUESTO_DISPONIBLES = [];
						return;
					}

					this.mCORR_RIESGO_PUESTO = response.Data.map((item: any) => ({
						CORR_RIESGO_PUESTO: Number(item.CORR_RIESGO_PUESTO),
						NOMBRE_RIESGO_PUESTO: (item.NOMBRE_RIESGO_PUESTO ?? '').trim(),
					}));
					this.actualizarRiesgosPuestoLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_RIESGO_PUESTO = [];
					this.mCORR_RIESGO_PUESTO_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	getCORR_RESPONSABILIDAD(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_RESPONSABILIDAD_CARGO',
				'GetCORR_RESPONSABILIDAD',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_RESPONSABILIDAD = [];
						this.mCORR_RESPONSABILIDAD_DISPONIBLES = [];
						return;
					}

					this.mCORR_RESPONSABILIDAD = response.Data.map((item: any) => ({
						CORR_RESPONSABILIDAD: Number(item.CORR_RESPONSABILIDAD),
						NOMBRE_RESPONSABILIDAD: (item.NOMBRE_RESPONSABILIDAD ?? '').trim(),
						APLICA_DESCRIPTOR: this.normalizarAplicabilidadResponsabilidad(
							item.APLICA_DESCRIPTOR
						),
					}));
					this.actualizarResponsabilidadesCargoLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_RESPONSABILIDAD = [];
					this.mCORR_RESPONSABILIDAD_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	getCORR_IMPACTO_ECONOMICO(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO',
				'SC_IMPACTO_ECONOMICO',
				'GetCORR_IMPACTO_ECONOMICO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_IMPACTO_ECONOMICO = [];
						return;
					}

					this.mCORR_IMPACTO_ECONOMICO = response.Data.map((item: any) => ({
						CORR_IMPACTO_ECONOMICO: Number(item.CORR_IMPACTO_ECONOMICO),
						DESCRIPCION: (item.DESCRIPCION ?? '').trim(),
					}));
				},
				error: (error) => {
					this.mCORR_IMPACTO_ECONOMICO = [];
					this.notifyApiError(error);
				},
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

	selectedLookUpCORR_INDUCCION(vRow: any): number {
		return vRow[0].CORR_INDUCCION;
	}

	selectedLookUpCORR_COMPETENCIAS_TECNICAS(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_TECNICAS;
	}

	selectedLookUpCORR_COMPETENCIAS_CONDUCTUALES(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_CONDUCTUALES;
	}

	selectedLookUpCORR_REQUERIMIENTO_ORGANIZACIONAL(vRow: any): number {
		return vRow[0].CORR_REQUERIMIENTO_ORGANIZACIONAL;
	}

	selectedLookUpCORR_RIESGO_PUESTO(vRow: any): number {
		return vRow[0].CORR_RIESGO_PUESTO;
	}

	selectedLookUpCORR_RESPONSABILIDAD(vRow: any): number {
		return vRow[0].CORR_RESPONSABILIDAD;
	}

	selectedLookUpCORR_IMPACTO_ECONOMICO(vRow: any): number {
		return vRow[0].CORR_IMPACTO_ECONOMICO;
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.perfilEditando = false;
			this.entrenamientoEditando = false;
			this.induccionInvalida = false;
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.mainTabIndex = 0;
			this.subTabIndex = 0;
		}
	}

	// Arma el filtro IParam del descriptor (empresa + correlativo) para las consultas al repositorio.
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
				DESCRIPCION_IMPACTO_ECONOMICO: xModel.DESCRIPCION_IMPACTO_ECONOMICO ?? '',
				CORR_INDUCCION: xModel.CORR_INDUCCION,
				NOMBRE_INDUCCION: xModel.NOMBRE_INDUCCION ?? '',
				SEMANAS_INDUCCION: xModel.SEMANAS_INDUCCION ?? null,
				RESPONSABLE: xModel.RESPONSABLE ?? '',
				FORMATO: xModel.FORMATO ?? FORMATO_CORTO,
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
			DESCRIPCION_IMPACTO_ECONOMICO: '',
			CORR_INDUCCION: null,
			NOMBRE_INDUCCION: '',
			SEMANAS_INDUCCION: null,
			RESPONSABLE: '',
			FORMATO: FORMATO_CORTO,
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

	// Carga el listado principal del mtto y luego enriquece/ordena filas antes de refrescar el grid.
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

	// Completa nombres de unidad/puesto en filas que la API no trae resueltos.
	private enriquecerFilasConsulta(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = this.models.map((row: ScDescriptorPuesto) => ({
			...row,
			NOMBRE_UNIDAD: row.NOMBRE_UNIDAD || this.getNombreUnidad(row.CORR_UNIDAD),
			NOMBRE_PUESTO: row.NOMBRE_PUESTO || this.getNombrePuesto(row.CORR_PUESTO),
		}));
	}

	// Ordena el grid de consulta por CORR_DESCRIPTOR_PUESTO ascendente.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_DESCRIPTOR_PUESTO) - Number(b.CORR_DESCRIPTOR_PUESTO)
		);
	}

	// Repinta el data-grid-mtto tras consultar; resetPage vuelve a la primera pagina.
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
		this.entrenamientoOriginal = this.obtenerEntrenamientoActual();
		this.entrenamientoEditando = false;
		this.limpiarDatosTabs();
		this.actualizarPuestosPorUnidad(null);
		setTimeout(() => this.syncHeaderForm());
	}

	override editarClick(e: any): void {
		this.readOnly = false;
		this.limpiarEstadoValidacionHeader();
		super.editarClick(e);
		this.entrenamientoOriginal = this.obtenerEntrenamientoActual();
		this.entrenamientoEditando = false;
		this.resetearFuncionesTabsDirty();
		this.cargarDatosTabs();
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
		this.entrenamientoOriginal = this.obtenerEntrenamientoActual();
		this.entrenamientoEditando = false;
		super.rowDblClick(e);
		this.resetearFuncionesTabsDirty();
		this.cargarDatosTabs();
		this.actualizarPuestosPorUnidad(this.model.CORR_UNIDAD);
		setTimeout(() => {
			this.syncHeaderForm();
			this.bloquear();
		});
	}

	// Distribuye la carga de detalles según el formato seleccionado; las secciones no aplicables se limpian
	// para impedir que datos de una consulta anterior permanezcan visibles al cambiar de descriptor.
	cargarDatosTabs(): void {
		this.itemsTabBitacora = [];
		this.entrenamientoOriginal = this.obtenerEntrenamientoActual();
		this.entrenamientoEditando = false;
		this.prepararInduccionesLookupParaEntrenamiento();
		this.cargarFuncionesClave();
		if (this.esFormatoCorto) {
			this.cargarFuncionesSecundarias();
			this.cargarKpis();
		}
		if (this.esFormatoExtenso) {
			this.cargarRelacionesInternas();
			this.cargarRelacionesExternas();
			this.cargarRiesgosPuesto();
		}
		this.cargarPerfil();
		this.cargarRequerimientosOrganizacionales();
		this.cargarResponsabilidadesCargo();
	}

	// Vacia arrays y flags de todas las secciones al cambiar o cancelar el descriptor.
	limpiarDatosTabs(): void {
		this.itemsTabBitacora = [];
		this.funcionesClave = [];
		this.funcionesSecundarias = [];
		this.kpis = [];
		this.educaciones = [];
		this.experiencias = [];
		this.competenciasTecnicas = [];
		this.competenciasConductuales = [];
		this.requerimientosOrganizacionales = [];
		this.riesgosPuesto = [];
		this.responsabilidadesCargo = [];
		this.relacionesInternas = [];
		this.relacionesExternas = [];
		this.entrenamientoOriginal = this.obtenerEntrenamientoActual();
		this.entrenamientoEditando = false;
		this.competenciasSubTabIndex = 0;
		this.relacionesSubTabIndex = 0;
		this.resetearEdicionFuncionesClave();
		this.resetearEdicionFuncionesSecundarias();
		this.resetearEdicionKpis();
		this.resetearEdicionEducacion();
		this.resetearEdicionExperiencia();
		this.resetearEdicionCompetenciasTecnicas();
		this.resetearEdicionCompetenciasConductuales();
		this.resetearEdicionRequerimientosOrganizacionales();
		this.resetearEdicionRiesgosPuesto();
		this.resetearEdicionResponsabilidadesCargo();
		this.resetearEdicionRelacionesInternas();
		this.resetearEdicionRelacionesExternas();
		this.limpiarPerfil();
		this.resetearFuncionesTabsDirty();
		this.cerrarActividadesPopup();
	}

	get esFormatoCorto(): boolean {
		return (this.model?.FORMATO ?? '').toUpperCase() === FORMATO_CORTO;
	}

	get esFormatoExtenso(): boolean {
		return (this.model?.FORMATO ?? '').toUpperCase() === FORMATO_EXTENSO;
	}

	get mostrarSeccionesDescriptor(): boolean {
		return (
			(this.isForm() || this.isConsulta()) &&
			Number(this.model?.CORR_DESCRIPTOR_PUESTO) > 0
		);
	}

	// Gestiona en memoria la edición de funciones clave. El guardado real se delega al flujo del grid
	// para mantener sincronizadas las actividades asociadas y los indicadores de edición.
	agregarFuncionClave(): void {
		if (this.readOnly || this.funcionesClaveEditando || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridFuncionesClave?.instance.addRow();
		this.funcionesClaveEditando = true;
	}

	editarFuncionClaveClick(e: any): void {
		if (this.readOnly || this.funcionesClaveEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.funcionesClaveEditando = true;
	}

	funcionClaveEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	funcionClaveDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de funciones clave (saveEditData de DevExtreme).
	guardarFuncionClaveEditada(): void {
		const grid = this.gridFuncionesClave?.instance;
		if (!grid || !this.funcionesClaveEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de funciones clave y resetea flags locales.
	cancelarFuncionClaveEditada(): void {
		this.cancelarEdicionGrid(this.gridFuncionesClave?.instance, () => {
			this.funcionesClaveEditando = false;
		});
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

	onFuncionClaveSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesClaveEditando = false;
		});
	}

	onFuncionClaveEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesClaveEditando = false;
		});
	}

	funcionClaveRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.NOMBRE_FUNCION ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el nombre de la funcion clave.');
			return;
		}
		if ((data.NOMBRE_FUNCION ?? '').trim().length > 255) {
			this.invalidarFila(e, 'El nombre de la funcion clave no puede superar 255 caracteres.');
			return;
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

	// Gestiona funciones secundarias con el ciclo agregar-editar-validar-cancelar del grid,
	// pero sin actividades dependientes.
	agregarFuncionSecundaria(): void {
		if (
			this.readOnly ||
			this.funcionesSecundariasEditando ||
			!this.esFormatoCorto ||
			!this.requiereDescriptorGuardado()
		) {
			return;
		}
		this.gridFuncionesSecundarias?.instance.addRow();
		this.funcionesSecundariasEditando = true;
	}

	editarFuncionSecundariaClick(e: any): void {
		if (this.readOnly || this.funcionesSecundariasEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.funcionesSecundariasEditando = true;
	}

	funcionSecundariaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	funcionSecundariaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de funciones secundarias.
	guardarFuncionSecundariaEditada(): void {
		const grid = this.gridFuncionesSecundarias?.instance;
		if (!grid || !this.funcionesSecundariasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de funciones secundarias.
	cancelarFuncionSecundariaEditada(): void {
		this.cancelarEdicionGrid(this.gridFuncionesSecundarias?.instance, () => {
			this.funcionesSecundariasEditando = false;
		});
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

	onFuncionSecundariaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesSecundariasEditando = false;
		});
	}

	onFuncionSecundariaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesSecundariasEditando = false;
		});
	}

	funcionSecundariaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.NOMBRE_FUNCION ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar la descripcion de la funcion secundaria.');
			return;
		}
		if ((data.NOMBRE_FUNCION ?? '').trim().length > 255) {
			this.invalidarFila(e, 'La descripcion de la funcion secundaria no puede superar 255 caracteres.');
			return;
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

	// Mantiene separadas las relaciones internas del formato extenso y fija su tipo antes de persistir,
	// aunque ambos tipos de relación utilicen el mismo repositorio.
	agregarRelacionInterna(): void {
		if (this.readOnly || this.relacionesInternasEditando || !this.esFormatoExtenso || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridRelacionesInternas?.instance.addRow();
		this.relacionesInternasEditando = true;
	}

	editarRelacionInternaClick(e: any): void {
		if (this.readOnly || this.relacionesInternasEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.relacionesInternasEditando = true;
	}

	relacionInternaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	relacionInternaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de relaciones internas.
	guardarRelacionInternaEditada(): void {
		const grid = this.gridRelacionesInternas?.instance;
		if (!grid || !this.relacionesInternasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de relaciones internas.
	cancelarRelacionInternaEditada(): void {
		this.cancelarEdicionGrid(this.gridRelacionesInternas?.instance, () => {
			this.relacionesInternasEditando = false;
		});
	}

	relacionInternaInitNewRow(e: any): void {
		e.data.CORR_RELACION_LABORAL = 0;
		e.data.TIPO_RELACION = TIPO_RELACION_INTERNA;
		e.data.PUESTO_AREA = '';
		e.data.MOTIVO_RELACION = '';
		e.data._clientKey = this.crearClientKey('ri');
	}

	onRelacionInternaEditingStart(_e: any): void {
		this.relacionesInternasEditando = true;
	}

	onRelacionInternaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesInternasEditando = false;
		});
	}

	onRelacionInternaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesInternasEditando = false;
		});
	}

	relacionInternaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.PUESTO_AREA ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el puesto o area de la relacion interna.');
			return;
		}
		if ((data.PUESTO_AREA ?? '').trim().length > 200) {
			this.invalidarFila(e, 'El puesto o area no puede superar 200 caracteres.');
			return;
		}
		if ((data.MOTIVO_RELACION ?? '').trim().length > 255) {
			this.invalidarFila(e, 'El motivo de la relacion no puede superar 255 caracteres.');
			return;
		}
	}

	relacionInternaRowInserting(e: any): void {
		e.cancel = this.persistirRelacionDesdeGrid(e.data, TIPO_RELACION_INTERNA, true);
	}

	relacionInternaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRelacionDesdeGrid(data, TIPO_RELACION_INTERNA, false);
	}

	relacionInternaRowRemoving(e: any): void {
		e.cancel = this.eliminarRelacionDesdeGrid(e.data);
	}

	// Aplica a relaciones externas el ciclo de edición del grid y evita su uso fuera del formato extenso.
	agregarRelacionExterna(): void {
		if (this.readOnly || this.relacionesExternasEditando || !this.esFormatoExtenso || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridRelacionesExternas?.instance.addRow();
		this.relacionesExternasEditando = true;
	}

	editarRelacionExternaClick(e: any): void {
		if (this.readOnly || this.relacionesExternasEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.relacionesExternasEditando = true;
	}

	relacionExternaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	relacionExternaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de relaciones externas.
	guardarRelacionExternaEditada(): void {
		const grid = this.gridRelacionesExternas?.instance;
		if (!grid || !this.relacionesExternasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de relaciones externas.
	cancelarRelacionExternaEditada(): void {
		this.cancelarEdicionGrid(this.gridRelacionesExternas?.instance, () => {
			this.relacionesExternasEditando = false;
		});
	}

	relacionExternaInitNewRow(e: any): void {
		e.data.CORR_RELACION_LABORAL = 0;
		e.data.TIPO_RELACION = TIPO_RELACION_EXTERNA;
		e.data.PUESTO_AREA = '';
		e.data.MOTIVO_RELACION = '';
		e.data._clientKey = this.crearClientKey('re');
	}

	onRelacionExternaEditingStart(_e: any): void {
		this.relacionesExternasEditando = true;
	}

	onRelacionExternaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesExternasEditando = false;
		});
	}

	onRelacionExternaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesExternasEditando = false;
		});
	}

	relacionExternaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.PUESTO_AREA ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el puesto o area de la relacion externa.');
			return;
		}
		if ((data.PUESTO_AREA ?? '').trim().length > 200) {
			this.invalidarFila(e, 'El puesto o area no puede superar 200 caracteres.');
			return;
		}
		if ((data.MOTIVO_RELACION ?? '').trim().length > 255) {
			this.invalidarFila(e, 'El motivo de la relacion no puede superar 255 caracteres.');
			return;
		}
	}

	relacionExternaRowInserting(e: any): void {
		e.cancel = this.persistirRelacionDesdeGrid(e.data, TIPO_RELACION_EXTERNA, true);
	}

	relacionExternaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRelacionDesdeGrid(data, TIPO_RELACION_EXTERNA, false);
	}

	relacionExternaRowRemoving(e: any): void {
		e.cancel = this.eliminarRelacionDesdeGrid(e.data);
	}

	// Abre las actividades de una función clave persistida. Una función temporal no puede recibir
	// actividades porque todavía no existe su llave compuesta en el servidor.
	abrirActividades(funcion: ScDescriptorFuncion): void {
		if (!this.esFormatoExtenso || !funcion) {
			return;
		}

		if (!funcion.CORR_FUNCION || funcion.CORR_FUNCION <= 0) {
			this.notifyDescriptorWarning('La funcion debe estar guardada antes de registrar actividades.');
			return;
		}

		this.funcionActividadesSeleccionada = funcion;
		this.actividadesEditando = false;
		this.actividadesPopupVisible = true;
		this.cargarActividadesPopup(funcion);
	}

	// Cierra el popup de actividades y limpia la funcion seleccionada.
	cerrarActividadesPopup(): void {
		this.actividadesPopupVisible = false;
		this.funcionActividadesSeleccionada = null;
		this.actividadesPopup = [];
		this.actividadesEditando = false;
	}

	agregarActividad(): void {
		if (this.readOnly || this.actividadesEditando || !this.funcionActividadesSeleccionada?.CORR_FUNCION) {
			return;
		}
		this.gridActividades?.instance.addRow();
		this.actividadesEditando = true;
	}

	editarActividadClick(e: any): void {
		if (this.readOnly || this.actividadesEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.actividadesEditando = true;
	}

	actividadEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	actividadDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de actividades del popup.
	guardarActividadEditada(): void {
		const grid = this.gridActividades?.instance;
		if (!grid || !this.actividadesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de actividades.
	cancelarActividadEditada(): void {
		this.cancelarEdicionGrid(this.gridActividades?.instance, () => {
			this.actividadesEditando = false;
		});
	}

	actividadInitNewRow(e: any): void {
		const funcion = this.funcionActividadesSeleccionada;
		e.data.CORR_FUNCION = funcion?.CORR_FUNCION ?? 0;
		e.data.CORR_ACTIVIDAD = 0;
		e.data.NOMBRE_ACTIVIDAD = '';
		e.data._clientKey = this.crearClientKey('act');
	}

	onActividadEditingStart(_e: any): void {
		this.actividadesEditando = true;
	}

	onActividadSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.actividadesEditando = false;
		});
	}

	onActividadEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.actividadesEditando = false;
		});
	}

	actividadRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.NOMBRE_ACTIVIDAD ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el nombre de la actividad.');
			return;
		}
		if ((data.NOMBRE_ACTIVIDAD ?? '').trim().length > 255) {
			this.invalidarFila(e, 'El nombre de la actividad no puede superar 255 caracteres.');
			return;
		}
	}

	actividadRowInserting(e: any): void {
		e.cancel = this.persistirActividadDesdeGrid(e.data, true);
	}

	actividadRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirActividadDesdeGrid(data, false);
	}

	actividadRowRemoving(e: any): void {
		e.cancel = this.eliminarActividadDesdeGrid(e.data);
	}

	// Administra los KPI exclusivos del formato corto y conserva el texto de frecuencia junto con su llave
	// para mostrar la selección inmediatamente en la fila.
	agregarKpi(): void {
		if (this.readOnly || this.kpisEditando || !this.esFormatoCorto || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.prepararFrecuenciasLookupParaEdicionKpi(null);
		this.gridKpis?.instance.addRow();
		this.kpisEditando = true;
	}

	editarKpiClick(e: any): void {
		if (this.readOnly || this.kpisEditando) {
			return;
		}
		this.prepararFrecuenciasLookupParaEdicionKpi(e.row?.data);
		e.component.editRow(e.row.rowIndex);
		this.kpisEditando = true;
	}

	kpiEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	kpiDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de KPIs (formato corto).
	guardarKpiEditado(): void {
		const grid = this.gridKpis?.instance;
		if (!grid || !this.kpisEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de KPIs.
	cancelarKpiEditado(): void {
		this.cancelarEdicionGrid(this.gridKpis?.instance, () => {
			this.kpisEditando = false;
			this.cargarKpis(true);
		});
	}

	kpiInitNewRow(e: any): void {
		e.data.CORR_KPI_FUNCION = 0;
		e.data.NOMBRE_INDICADOR = '';
		e.data.CORR_FRECUENCIA = null;
		e.data.NOMBRE_FRECUENCIA = '';
		e.data.META = null;
		e.data._clientKey = this.crearClientKey('kpi');
	}

	onKpiEditingStart(e: any): void {
		this.kpisEditando = true;
		this.prepararFrecuenciasLookupParaEdicionKpi(e?.data);
	}

	onKpiSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.kpisEditando = false;
		});
	}

	onKpiEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.kpisEditando = false;
		});
		this.cargarKpis(true);
	}

	kpiRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.NOMBRE_INDICADOR ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el nombre del indicador.');
			return;
		}
		if ((data.NOMBRE_INDICADOR ?? '').trim().length > 255) {
			this.invalidarFila(e, 'El nombre del indicador no puede superar 255 caracteres.');
			return;
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
		cellInfo.setValue(corr);
	}

	setKpiFrecuenciaCellValue = (
		newData: ScDescriptorKpiFuncion,
		value: number | null,
		_currentRowData: ScDescriptorKpiFuncion
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const frecuencia = this.mCORR_FRECUENCIA_KPI_EDIT.find(
			(item) => Number(item.CORR_FRECUENCIA) === Number(corr)
		);
		newData.CORR_FRECUENCIA = corr;
		newData.NOMBRE_FRECUENCIA = frecuencia?.NOMBRE_FRECUENCIA ?? '';
	};

	// Los detalles de Perfil comparten CORR_PERFIL_PUESTO. Antes de agregar una fila se garantiza
	// que el registro padre exista para evitar operaciones con una llave temporal.
	agregarEducacion(): void {
		if (this.readOnly || this.educacionEditando || !this.requiereDescriptorGuardado()) {
			return;
		}

		this.asegurarPerfilParaDetalle(() => {
			this.gridEducacion?.instance.addRow();
			this.educacionEditando = true;
		});
	}

	editarEducacionClick(e: any): void {
		if (this.readOnly || this.educacionEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.educacionEditando = true;
	}

	educacionEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	educacionDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de educacion del perfil.
	guardarEducacionEditada(): void {
		const grid = this.gridEducacion?.instance;
		if (!grid || !this.educacionEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de educacion.
	cancelarEducacionEditada(): void {
		this.cancelarEdicionGrid(this.gridEducacion?.instance, () => {
			this.educacionEditando = false;
		});
	}

	educacionInitNewRow(e: any): void {
		e.data.CORR_EDUCACION = 0;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.REQUISITO = '';
		e.data.ESPECIFICACIONES = '';
		e.data.TIPO_REQUERIDO = 'SI';
		e.data._clientKey = this.crearClientKey('edu');
	}

	onEducacionEditingStart(_e: any): void {
		this.educacionEditando = true;
	}

	onEducacionSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.educacionEditando = false;
		});
	}

	onEducacionEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.educacionEditando = false;
		});
	}

	educacionRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.REQUISITO ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el requisito.');
			return;
		}
		if ((data.REQUISITO ?? '').trim().length > 255) {
			this.invalidarFila(e, 'El requisito no puede superar 255 caracteres.');
			return;
		}
		if ((data.ESPECIFICACIONES ?? '').trim().length > 255) {
			this.invalidarFila(e, 'Las especificaciones no pueden superar 255 caracteres.');
			return;
		}
	}

	educacionRowInserting(e: any): void {
		e.cancel = this.persistirEducacionDesdeGrid(e.data, true);
	}

	educacionRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirEducacionDesdeGrid(data, false);
	}

	educacionRowRemoving(e: any): void {
		e.cancel = this.eliminarEducacionDesdeGrid(e.data);
	}

	agregarExperiencia(): void {
		if (this.readOnly || this.experienciaEditando || !this.requiereDescriptorGuardado()) {
			return;
		}

		this.asegurarPerfilParaDetalle(() => {
			this.gridExperiencia?.instance.addRow();
			this.experienciaEditando = true;
		});
	}

	editarExperienciaClick(e: any): void {
		if (this.readOnly || this.experienciaEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.experienciaEditando = true;
	}

	experienciaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	experienciaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de experiencia del perfil.
	guardarExperienciaEditada(): void {
		const grid = this.gridExperiencia?.instance;
		if (!grid || !this.experienciaEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de experiencia.
	cancelarExperienciaEditada(): void {
		this.cancelarEdicionGrid(this.gridExperiencia?.instance, () => {
			this.experienciaEditando = false;
		});
	}

	experienciaInitNewRow(e: any): void {
		e.data.CORR_EXPERIENCIA = 0;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.REQUISITO = '';
		e.data.TIPO_REQUERIDO = 'SI';
		e.data._clientKey = this.crearClientKey('exp');
	}

	onExperienciaEditingStart(_e: any): void {
		this.experienciaEditando = true;
	}

	onExperienciaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.experienciaEditando = false;
		});
	}

	onExperienciaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.experienciaEditando = false;
		});
	}

	experienciaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(data.REQUISITO ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el requisito.');
			return;
		}
		if ((data.REQUISITO ?? '').trim().length > 255) {
			this.invalidarFila(e, 'El requisito no puede superar 255 caracteres.');
			return;
		}
	}

	experienciaRowInserting(e: any): void {
		e.cancel = this.persistirExperienciaDesdeGrid(e.data, true);
	}

	experienciaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirExperienciaDesdeGrid(data, false);
	}

	experienciaRowRemoving(e: any): void {
		e.cancel = this.eliminarExperienciaDesdeGrid(e.data);
	}

	// Filtra el catálogo técnico contra las selecciones actuales y valida duplicados por llave de catálogo,
	// no solo por el texto mostrado en el grid.
	agregarCompetenciaTecnica(): void {
		if (this.readOnly || this.competenciasTecnicasEditando || !this.requiereDescriptorGuardado()) {
			return;
		}

		this.asegurarPerfilParaDetalle(() => {
			this.actualizarCompetenciasTecnicasLookupDisponibles();
			this.gridCompetenciasTecnicas?.instance.addRow();
			this.competenciasTecnicasEditando = true;
		});
	}

	editarCompetenciaTecnicaClick(e: any): void {
		if (this.readOnly || this.competenciasTecnicasEditando) {
			return;
		}
		this.actualizarCompetenciasTecnicasLookupDisponibles(
			Number(e?.row?.data?.CORR_COMPETENCIAS_TECNICAS) || null
		);
		e.component.editRow(e.row.rowIndex);
		this.competenciasTecnicasEditando = true;
	}

	competenciaTecnicaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	competenciaTecnicaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de competencias tecnicas.
	guardarCompetenciaTecnicaEditada(): void {
		const grid = this.gridCompetenciasTecnicas?.instance;
		if (!grid || !this.competenciasTecnicasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de competencias tecnicas.
	cancelarCompetenciaTecnicaEditada(): void {
		this.cancelarEdicionGrid(this.gridCompetenciasTecnicas?.instance, () => {
			this.competenciasTecnicasEditando = false;
			this.cargarCompetenciasTecnicas(true);
		});
	}

	competenciaTecnicaInitNewRow(e: any): void {
		e.data.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS = 0;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.CORR_COMPETENCIAS_TECNICAS = null;
		e.data.CODIGO_COMPETENCIAS_TECNICAS = '';
		e.data.NOMBRE_COMPETENCIAS_TECNICAS = '';
		e.data.DESCRIPCION = '';
		e.data.NIVEL_DOMINIO = 'BASICO';
		e.data._clientKey = this.crearClientKey('ct');
		this.actualizarCompetenciasTecnicasLookupDisponibles();
	}

	onCompetenciaTecnicaEditingStart(e: any): void {
		this.actualizarCompetenciasTecnicasLookupDisponibles(
			Number(e?.data?.CORR_COMPETENCIAS_TECNICAS) || null
		);
		this.competenciasTecnicasEditando = true;
	}

	onCompetenciaTecnicaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasTecnicasEditando = false;
		});
	}

	onCompetenciaTecnicaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasTecnicasEditando = false;
		});
		this.cargarCompetenciasTecnicas(true);
	}

	competenciaTecnicaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_COMPETENCIAS_TECNICAS) > 0)) {
			this.invalidarFila(e, 'Debe seleccionar una competencia tecnica de nivel 3.');
			return;
		}
		if (!(data.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el nombre de la competencia.');
			return;
		}
		if ((data.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim().length > 150) {
			this.invalidarFila(e, 'El nombre de la competencia no puede superar 150 caracteres.');
			return;
		}
		if ((data.DESCRIPCION ?? '').trim().length > 500) {
			this.invalidarFila(e, 'La descripcion no puede superar 500 caracteres.');
			return;
		}
		const nivel = (data.NIVEL_DOMINIO ?? '').trim().toUpperCase();
		if (!['BASICO', 'INTERMEDIO', 'AVANZADO'].includes(nivel)) {
			this.invalidarFila(e, 'Debe indicar el nivel de dominio.');
			return;
		}

		const corrCatalogo = Number(data.CORR_COMPETENCIAS_TECNICAS);
		const clientKey = data._clientKey ?? e?.key;
		const duplicada = (this.competenciasTecnicas || []).some((row) => {
			if (!(Number(row.CORR_COMPETENCIAS_TECNICAS) > 0)) {
				return false;
			}
			if (clientKey != null && row._clientKey === clientKey) {
				return false;
			}
			return Number(row.CORR_COMPETENCIAS_TECNICAS) === corrCatalogo;
		});
		if (duplicada) {
			this.invalidarFila(e, 'Esa competencia tecnica ya esta agregada en el descriptor.');
			return;
		}
	}

	competenciaTecnicaRowInserting(e: any): void {
		e.cancel = this.persistirCompetenciaTecnicaDesdeGrid(e.data, true);
	}

	competenciaTecnicaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirCompetenciaTecnicaDesdeGrid(data, false);
	}

	competenciaTecnicaRowRemoving(e: any): void {
		e.cancel = this.eliminarCompetenciaTecnicaDesdeGrid(e.data);
	}

	competenciaTecnicaCatalogDisplay = (row: ScPerfilPuestoCompetenciasTecnicas): string => {
		const codigoFila = (row?.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim();
		if (codigoFila) {
			return codigoFila;
		}

		const corr = Number(row?.CORR_COMPETENCIAS_TECNICAS);
		const catalog =
			this.mCORR_COMPETENCIAS_TECNICAS.find(
				(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === corr
			) ??
			this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES.find(
				(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === corr
			);
		// Columna Competencia (ya seleccionado): solo codigo, nunca el nombre.
		return (catalog?.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim();
	};

	// Filtra el catalogo tecnico para ocultar competencias ya asignadas (conserva la de la fila editada).
	// Si la conservada está inactiva y no viene del catálogo, se inyecta desde la fila del perfil.
	private actualizarCompetenciasTecnicasLookupDisponibles(
		corrConservar: number | null = null
	): void {
		const usados = new Set(
			(this.competenciasTecnicas || [])
				.map((row) => Number(row.CORR_COMPETENCIAS_TECNICAS))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		const disponibles = (this.mCORR_COMPETENCIAS_TECNICAS || []).filter((item) => {
			const corr = Number(item.CORR_COMPETENCIAS_TECNICAS);
			if (!(corr > 0)) {
				return false;
			}
			if (corrConservar != null && corr === Number(corrConservar)) {
				return true;
			}
			return !usados.has(corr);
		});

		const corrAsociada = Number(corrConservar || 0);
		if (
			corrAsociada > 0 &&
			!disponibles.some((item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === corrAsociada)
		) {
			const fila = (this.competenciasTecnicas || []).find(
				(row) => Number(row.CORR_COMPETENCIAS_TECNICAS) === corrAsociada
			);
			if (fila) {
				const nombre = (fila.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim();
				const codigo = (fila.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim();
				disponibles.push({
					CORR_COMPETENCIAS_TECNICAS: corrAsociada,
					CORR_COMPETENCIAS_TECNICAS_PADRE: null,
					CODIGO_COMPETENCIAS_TECNICAS: codigo,
					NOMBRE_COMPETENCIAS_TECNICAS: nombre,
					DESCRIPCION: (fila.DESCRIPCION ?? nombre).trim(),
					NOMBRE_DISPLAY: [codigo, nombre].filter((parte) => !!parte).join(' | ') || `Competencia ${corrAsociada}`,
					GRUPO_NIV1: '',
					GRUPO_NIV2: '',
					GRUPO_PADRE: '',
					NIVEL: 'NIV3',
				});
			}
		}

		this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES = disponibles;
	}

	onCompetenciaTecnicaLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
	}

	setCompetenciaTecnicaCellValue = (
		newData: ScPerfilPuestoCompetenciasTecnicas,
		value: number | null,
		_currentRowData: ScPerfilPuestoCompetenciasTecnicas
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog =
			this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES.find(
				(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === Number(corr)
			) ??
			this.mCORR_COMPETENCIAS_TECNICAS.find(
				(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === Number(corr)
			);
		newData.CORR_COMPETENCIAS_TECNICAS = corr;
		newData.CODIGO_COMPETENCIAS_TECNICAS = catalog?.CODIGO_COMPETENCIAS_TECNICAS ?? '';
		newData.NOMBRE_COMPETENCIAS_TECNICAS = catalog?.NOMBRE_COMPETENCIAS_TECNICAS ?? '';
		newData.DESCRIPCION = catalog?.DESCRIPCION ?? '';
	};

	// Mantiene disponibles únicamente las competencias conductuales aún no asignadas al perfil,
	// conservando la opción de la fila editada para que no desaparezca del lookup.
	agregarCompetenciaConductual(): void {
		if (this.readOnly || this.competenciasConductualesEditando || !this.requiereDescriptorGuardado()) {
			return;
		}

		this.asegurarPerfilParaDetalle(() => {
			this.actualizarCompetenciasConductualesLookupDisponibles();
			this.competenciasConductualesEditando = true;
			setTimeout(() => this.gridCompetenciasConductuales?.instance.addRow());
		});
	}

	editarCompetenciaConductualClick(e: any): void {
		if (this.readOnly || this.competenciasConductualesEditando) {
			return;
		}
		this.actualizarCompetenciasConductualesLookupDisponibles(
			Number(e?.row?.data?.CORR_COMPETENCIAS_CONDUCTUALES) || null
		);
		this.competenciasConductualesEditando = true;
		const rowIndex = e.row.rowIndex;
		const grid = e.component;
		setTimeout(() => grid.editRow(rowIndex));
	}

	competenciaConductualEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	competenciaConductualDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de competencias conductuales.
	guardarCompetenciaConductualEditada(): void {
		const grid = this.gridCompetenciasConductuales?.instance;
		if (!grid || !this.competenciasConductualesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de competencias conductuales.
	cancelarCompetenciaConductualEditada(): void {
		this.cancelarEdicionGrid(this.gridCompetenciasConductuales?.instance, () => {
			this.competenciasConductualesEditando = false;
			this.cargarCompetenciasConductuales(true);
		});
	}

	competenciaConductualInitNewRow(e: any): void {
		e.data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES = 0;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.CORR_COMPETENCIAS_CONDUCTUALES = null;
		e.data.NOMBRE_COMPETENCIAS_CONDUCTUALES = '';
		e.data.DESCRIPCION = '';
		e.data._clientKey = this.crearClientKey('cc');
		this.actualizarCompetenciasConductualesLookupDisponibles();
	}

	onCompetenciaConductualEditingStart(e: any): void {
		this.actualizarCompetenciasConductualesLookupDisponibles(
			Number(e?.data?.CORR_COMPETENCIAS_CONDUCTUALES) || null
		);
		this.competenciasConductualesEditando = true;
	}

	onCompetenciaConductualSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasConductualesEditando = false;
		});
	}

	onCompetenciaConductualEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasConductualesEditando = false;
		});
		this.cargarCompetenciasConductuales(true);
	}

	competenciaConductualRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_COMPETENCIAS_CONDUCTUALES) > 0)) {
			this.invalidarFila(e, 'Debe seleccionar una competencia conductual.');
			return;
		}
		if (!(data.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el nombre de la competencia.');
			return;
		}
		if ((data.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim().length > 150) {
			this.invalidarFila(e, 'El nombre de la competencia no puede superar 150 caracteres.');
			return;
		}
		if ((data.DESCRIPCION ?? '').trim().length > 500) {
			this.invalidarFila(e, 'La descripcion no puede superar 500 caracteres.');
			return;
		}

		const corrCatalogo = Number(data.CORR_COMPETENCIAS_CONDUCTUALES);
		const clientKey = data._clientKey ?? e?.key;
		const duplicada = (this.competenciasConductuales || []).some((row) => {
			if (!(Number(row.CORR_COMPETENCIAS_CONDUCTUALES) > 0)) {
				return false;
			}
			if (clientKey != null && row._clientKey === clientKey) {
				return false;
			}
			return Number(row.CORR_COMPETENCIAS_CONDUCTUALES) === corrCatalogo;
		});
		if (duplicada) {
			this.invalidarFila(e, 'Esa competencia conductual ya esta agregada en el descriptor.');
			return;
		}
	}

	competenciaConductualRowInserting(e: any): void {
		e.cancel = this.persistirCompetenciaConductualDesdeGrid(e.data, true);
	}

	competenciaConductualRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirCompetenciaConductualDesdeGrid(data, false);
	}

	competenciaConductualRowRemoving(e: any): void {
		e.cancel = this.eliminarCompetenciaConductualDesdeGrid(e.data);
	}

	competenciaConductualCatalogDisplay = (row: ScPerfilPuestoCompetenciasConductuales): string => {
		const codigo = (row?.CODIGO_TIPO_PUESTO ?? '').trim();
		if (codigo) {
			return codigo;
		}

		const corr = Number(row?.CORR_COMPETENCIAS_CONDUCTUALES);
		if (!(corr > 0)) {
			return '';
		}

		const catalog =
			this.mCORR_COMPETENCIAS_CONDUCTUALES.find(
				(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === corr
			) ??
			this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES.find(
				(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === corr
			);
		return (catalog?.CODIGO_TIPO_PUESTO ?? '').trim();
	};

	// Filtra el catalogo conductual para evitar duplicados en el perfil.
	// Si la conservada está inactiva y no viene del catálogo, se inyecta desde la fila del perfil.
	private actualizarCompetenciasConductualesLookupDisponibles(
		corrConservar: number | null = null
	): void {
		const usados = new Set(
			(this.competenciasConductuales || [])
				.map((row) => Number(row.CORR_COMPETENCIAS_CONDUCTUALES))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		const disponibles = (this.mCORR_COMPETENCIAS_CONDUCTUALES || []).filter((item) => {
			const corr = Number(item.CORR_COMPETENCIAS_CONDUCTUALES);
			if (!(corr > 0)) {
				return false;
			}
			if (corrConservar != null && corr === Number(corrConservar)) {
				return true;
			}
			return !usados.has(corr);
		});

		const corrAsociada = Number(corrConservar || 0);
		if (
			corrAsociada > 0 &&
			!disponibles.some((item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === corrAsociada)
		) {
			const fila = (this.competenciasConductuales || []).find(
				(row) => Number(row.CORR_COMPETENCIAS_CONDUCTUALES) === corrAsociada
			);
			if (fila) {
				const nombre = (fila.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim();
				const codigoTipo = (fila.CODIGO_TIPO_PUESTO ?? '').trim();
				disponibles.push({
					CORR_COMPETENCIAS_CONDUCTUALES: corrAsociada,
					NOMBRE_COMPETENCIAS_CONDUCTUALES: nombre,
					DESCRIPCION: (fila.DESCRIPCION ?? nombre).trim(),
					NOMBRE_TIPO_PUESTO: '',
					CODIGO_TIPO_PUESTO: codigoTipo,
				});
			}
		}

		this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES = disponibles;
	}

	onCompetenciaConductualLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
	}

	setCompetenciaConductualCellValue = (
		newData: ScPerfilPuestoCompetenciasConductuales,
		value: number | null,
		_currentRowData: ScPerfilPuestoCompetenciasConductuales
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog =
			this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES.find(
				(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === Number(corr)
			) ??
			this.mCORR_COMPETENCIAS_CONDUCTUALES.find(
				(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === Number(corr)
			);
		newData.CORR_COMPETENCIAS_CONDUCTUALES = corr;
		newData.NOMBRE_COMPETENCIAS_CONDUCTUALES = catalog?.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '';
		newData.CODIGO_TIPO_PUESTO = catalog?.CODIGO_TIPO_PUESTO ?? '';
		newData.DESCRIPCION = this.esFormatoExtenso ? catalog?.DESCRIPCION ?? '' : '';
	};

	// Sincroniza requerimientos con su catálogo y descarta opciones ya utilizadas para prevenir duplicados.
	agregarRequerimientoOrganizacional(): void {
		if (this.readOnly || this.requerimientosOrganizacionalesEditando || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.actualizarRequerimientosOrganizacionalesLookupDisponibles();
		this.requerimientosOrganizacionalesInsertando = true;
		this.requerimientosOrganizacionalesEditando = true;
		setTimeout(() => {
			this.gridRequerimientosOrganizacionales?.instance.addRow();
			this.syncRequerimientoOrganizacionalColumnas();
		});
	}

	editarRequerimientoOrganizacionalClick(e: any): void {
		if (this.readOnly || this.requerimientosOrganizacionalesEditando) {
			return;
		}
		this.actualizarRequerimientosOrganizacionalesLookupDisponibles(
			Number(e?.row?.data?.CORR_REQUERIMIENTO_ORGANIZACIONAL) || null
		);
		this.requerimientosOrganizacionalesInsertando = false;
		this.requerimientosOrganizacionalesEditando = true;
		const rowIndex = e.row.rowIndex;
		const grid = e.component;
		setTimeout(() => {
			grid.editRow(rowIndex);
			this.syncRequerimientoOrganizacionalColumnas();
		});
	}

	requerimientoOrganizacionalEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	requerimientoOrganizacionalDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de requerimientos organizacionales.
	guardarRequerimientoOrganizacionalEditado(): void {
		const grid = this.gridRequerimientosOrganizacionales?.instance;
		if (!grid || !this.requerimientosOrganizacionalesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de requerimientos.
	cancelarRequerimientoOrganizacionalEditado(): void {
		this.cancelarEdicionGrid(this.gridRequerimientosOrganizacionales?.instance, () => {
			this.requerimientosOrganizacionalesEditando = false;
			this.requerimientosOrganizacionalesInsertando = false;
			this.cargarRequerimientosOrganizacionales(true);
		});
	}

	requerimientoOrganizacionalInitNewRow(e: any): void {
		this.requerimientosOrganizacionalesInsertando = true;
		e.data.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL = 0;
		e.data.CORR_DESCRIPTOR_PUESTO = Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
		e.data.CORR_REQUERIMIENTO_ORGANIZACIONAL = null;
		e.data.DESCRIPCION = '';
		e.data._clientKey = this.crearClientKey('ro');
		this.actualizarRequerimientosOrganizacionalesLookupDisponibles();
	}

	onRequerimientoOrganizacionalEditingStart(e: any): void {
		this.requerimientosOrganizacionalesInsertando = !(
			Number(e?.data?.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL) > 0
		);
		this.actualizarRequerimientosOrganizacionalesLookupDisponibles(
			Number(e?.data?.CORR_REQUERIMIENTO_ORGANIZACIONAL) || null
		);
		this.requerimientosOrganizacionalesEditando = true;
		this.syncRequerimientoOrganizacionalColumnas();
	}

	onRequerimientoOrganizacionalSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.requerimientosOrganizacionalesEditando = false;
			this.requerimientosOrganizacionalesInsertando = false;
		});
	}

	onRequerimientoOrganizacionalEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.requerimientosOrganizacionalesEditando = false;
			this.requerimientosOrganizacionalesInsertando = false;
		});
		this.cargarRequerimientosOrganizacionales(true);
	}

	requerimientoOrganizacionalRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_REQUERIMIENTO_ORGANIZACIONAL) > 0)) {
			this.invalidarFila(e, 'Debe seleccionar un requerimiento organizacional.');
			return;
		}
		if (!(data.DESCRIPCION ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar la descripcion del requerimiento.');
			return;
		}
		if ((data.DESCRIPCION ?? '').trim().length > 150) {
			this.invalidarFila(e, 'La descripcion no puede superar 150 caracteres.');
			return;
		}

		const corrCatalogo = Number(data.CORR_REQUERIMIENTO_ORGANIZACIONAL);
		const clientKey = data._clientKey ?? e?.key;
		const duplicada = (this.requerimientosOrganizacionales || []).some((row) => {
			if (!(Number(row.CORR_REQUERIMIENTO_ORGANIZACIONAL) > 0)) {
				return false;
			}
			if (clientKey != null && row._clientKey === clientKey) {
				return false;
			}
			return Number(row.CORR_REQUERIMIENTO_ORGANIZACIONAL) === corrCatalogo;
		});
		if (duplicada) {
			this.invalidarFila(e, 'Ese requerimiento organizacional ya esta agregado en el descriptor.');
			return;
		}
	}

	requerimientoOrganizacionalRowInserting(e: any): void {
		e.cancel = this.persistirRequerimientoOrganizacionalDesdeGrid(e.data, true);
	}

	requerimientoOrganizacionalRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRequerimientoOrganizacionalDesdeGrid(data, false);
	}

	requerimientoOrganizacionalRowRemoving(e: any): void {
		e.cancel = this.eliminarRequerimientoOrganizacionalDesdeGrid(e.data);
	}

	requerimientoOrganizacionalCatalogDisplay = (row: ScDescriptorPuestoRequerimientoOrganizacional): string => {
		const corr = Number(row?.CORR_REQUERIMIENTO_ORGANIZACIONAL);
		if (!(corr > 0)) {
			return '';
		}
		return String(corr);
	};

	// Quita del lookup los requerimientos ya usados en el descriptor.
	private actualizarRequerimientosOrganizacionalesLookupDisponibles(
		corrConservar: number | null = null
	): void {
		const usados = new Set(
			(this.requerimientosOrganizacionales || [])
				.map((row) => Number(row.CORR_REQUERIMIENTO_ORGANIZACIONAL))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		this.mCORR_REQUERIMIENTO_ORGANIZACIONAL_DISPONIBLES = (
			this.mCORR_REQUERIMIENTO_ORGANIZACIONAL || []
		).filter((item) => {
			const corr = Number(item.CORR_REQUERIMIENTO_ORGANIZACIONAL);
			if (!(corr > 0)) {
				return false;
			}
			if (corrConservar != null && corr === Number(corrConservar)) {
				return true;
			}
			return !usados.has(corr);
		});
	}

	onRequerimientoOrganizacionalLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
	}

	/**
	 * Aplica el catálogo en el buffer de edicion (no en el dataSource),
	 * para que Cancelar revierta CORR + DESCRIPCION.
	 */
	setRequerimientoOrganizacionalCellValue = (
		newData: ScDescriptorPuestoRequerimientoOrganizacional,
		value: number | null,
		_currentRowData: ScDescriptorPuestoRequerimientoOrganizacional
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog = this.mCORR_REQUERIMIENTO_ORGANIZACIONAL.find(
			(item) => Number(item.CORR_REQUERIMIENTO_ORGANIZACIONAL) === Number(corr)
		);
		newData.CORR_REQUERIMIENTO_ORGANIZACIONAL = corr;
		newData.DESCRIPCION = catalog?.DESCRIPCION ?? '';
	};

	// Gestiona riesgos e incluye el repintado diferido que DevExtreme necesita para reflejar
	// los valores descriptivos derivados del lookup.
	agregarRiesgoPuesto(): void {
		if (this.readOnly || this.riesgosPuestoEditando || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.actualizarRiesgosPuestoLookupDisponibles();
		this.riesgosPuestoInsertando = true;
		this.riesgosPuestoEditando = true;
		setTimeout(() => {
			this.gridRiesgosPuesto?.instance.addRow();
			this.syncRiesgoPuestoColumnas();
		});
	}

	editarRiesgoPuestoClick(e: any): void {
		if (this.readOnly || this.riesgosPuestoEditando) {
			return;
		}
		this.actualizarRiesgosPuestoLookupDisponibles(Number(e?.row?.data?.CORR_RIESGO_PUESTO) || null);
		this.riesgosPuestoInsertando = false;
		this.riesgosPuestoEditando = true;
		const rowIndex = e.row.rowIndex;
		const grid = e.component;
		setTimeout(() => {
			grid.editRow(rowIndex);
			this.syncRiesgoPuestoColumnas();
		});
	}

	riesgoPuestoEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	riesgoPuestoDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de riesgos del puesto.
	guardarRiesgoPuestoEditado(): void {
		const grid = this.gridRiesgosPuesto?.instance;
		if (!grid || !this.riesgosPuestoEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de riesgos.
	cancelarRiesgoPuestoEditado(): void {
		this.cancelarEdicionGrid(this.gridRiesgosPuesto?.instance, () => {
			this.riesgosPuestoEditando = false;
			this.riesgosPuestoInsertando = false;
			this.cargarRiesgosPuesto(true);
		});
	}

	riesgoPuestoInitNewRow(e: any): void {
		this.riesgosPuestoInsertando = true;
		e.data.CORR_DESCRIPTOR_RIESGO = 0;
		e.data.CORR_DESCRIPTOR_PUESTO = Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
		e.data.CORR_RIESGO_PUESTO = null;
		e.data.NOMBRE_RIESGO_PUESTO = '';
		e.data.INFORMACION = '';
		e.data._clientKey = this.crearClientKey('rp');
		this.actualizarRiesgosPuestoLookupDisponibles();
	}

	onRiesgoPuestoEditingStart(e: any): void {
		this.riesgosPuestoInsertando = !(Number(e?.data?.CORR_DESCRIPTOR_RIESGO) > 0);
		this.actualizarRiesgosPuestoLookupDisponibles(Number(e?.data?.CORR_RIESGO_PUESTO) || null);
		this.riesgosPuestoEditando = true;
		this.syncRiesgoPuestoColumnas();
	}

	onRiesgoPuestoSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.riesgosPuestoEditando = false;
			this.riesgosPuestoInsertando = false;
		});
	}

	onRiesgoPuestoEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.riesgosPuestoEditando = false;
			this.riesgosPuestoInsertando = false;
		});
		this.cargarRiesgosPuesto(true);
	}

	riesgoPuestoRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_RIESGO_PUESTO) > 0)) {
			this.invalidarFila(e, 'Debe seleccionar un riesgo de puesto.');
			return;
		}
		if (!(data.NOMBRE_RIESGO_PUESTO ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el nombre del riesgo.');
			return;
		}
		if ((data.NOMBRE_RIESGO_PUESTO ?? '').trim().length > 150) {
			this.invalidarFila(e, 'El nombre del riesgo no puede superar 150 caracteres.');
			return;
		}

		if ((data.INFORMACION ?? '').trim().length > 255) {
			this.invalidarFila(e, 'La informacion no puede superar 255 caracteres.');
			return;
		}

		const corrCatalogo = Number(data.CORR_RIESGO_PUESTO);
		const clientKey = data._clientKey ?? e?.key;
		const duplicada = (this.riesgosPuesto || []).some((row) => {
			if (!(Number(row.CORR_RIESGO_PUESTO) > 0)) {
				return false;
			}
			if (clientKey != null && row._clientKey === clientKey) {
				return false;
			}
			return Number(row.CORR_RIESGO_PUESTO) === corrCatalogo;
		});
		if (duplicada) {
			this.invalidarFila(e, 'Ese riesgo de puesto ya esta agregado en el descriptor.');
			return;
		}
	}

	riesgoPuestoRowInserting(e: any): void {
		e.cancel = this.persistirRiesgoPuestoDesdeGrid(e.data, true);
	}

	riesgoPuestoRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRiesgoPuestoDesdeGrid(data, false);
	}

	riesgoPuestoRowRemoving(e: any): void {
		e.cancel = this.eliminarRiesgoPuestoDesdeGrid(e.data);
	}

	riesgoPuestoCatalogDisplay = (row: ScDescriptorPuestoRiesgoPuesto): string => {
		const corr = Number(row?.CORR_RIESGO_PUESTO);
		if (!(corr > 0)) {
			return '';
		}
		return String(corr);
	};

	// Filtra riesgos del catalogo ya asignados al descriptor.
	private actualizarRiesgosPuestoLookupDisponibles(corrConservar: number | null = null): void {
		const usados = new Set(
			(this.riesgosPuesto || [])
				.map((row) => Number(row.CORR_RIESGO_PUESTO))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		this.mCORR_RIESGO_PUESTO_DISPONIBLES = (this.mCORR_RIESGO_PUESTO || []).filter((item) => {
			const corr = Number(item.CORR_RIESGO_PUESTO);
			if (!(corr > 0)) {
				return false;
			}
			if (corrConservar != null && corr === Number(corrConservar)) {
				return true;
			}
			return !usados.has(corr);
		});
	}

	onRiesgoPuestoLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
		this.repintarFilaRiesgoPuestoLookup(cellInfo);
	}

	// Fuerza repaint diferido de la fila tras cambiar el lookup (DevExtreme).
	private repintarFilaRiesgoPuestoLookup(cellInfo: any): void {
		this.cdr.detectChanges();
		setTimeout(() => {
			const grid = this.gridRiesgosPuesto?.instance ?? cellInfo?.component;
			const rowIndex = typeof cellInfo?.row?.rowIndex === 'number' ? cellInfo.row.rowIndex : null;
			if (!grid) {
				return;
			}
			grid.updateDimensions?.();
			if (rowIndex != null && rowIndex >= 0 && typeof grid.repaintRows === 'function') {
				grid.repaintRows([rowIndex]);
				return;
			}
			grid.repaint?.();
		});
	}

	setRiesgoPuestoCellValue = (
		newData: ScDescriptorPuestoRiesgoPuesto,
		value: number | null,
		_currentRowData: ScDescriptorPuestoRiesgoPuesto
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog = this.mCORR_RIESGO_PUESTO.find(
			(item) => Number(item.CORR_RIESGO_PUESTO) === Number(corr)
		);
		newData.CORR_RIESGO_PUESTO = corr;
		newData.NOMBRE_RIESGO_PUESTO = catalog?.NOMBRE_RIESGO_PUESTO ?? '';
	};

	// Combina responsabilidades de catálogo con una fila virtual de impacto económico. Esa fila se muestra
	// en el mismo grid, pero tiene reglas de edición y persistencia independientes.
	agregarResponsabilidadCargo(): void {
		if (this.readOnly || this.responsabilidadesCargoEditando || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.actualizarResponsabilidadesCargoLookupDisponibles();
		this.responsabilidadesCargoInsertando = true;
		this.responsabilidadesCargoEditando = true;
		setTimeout(() => {
			this.gridResponsabilidadesCargo?.instance.addRow();
			this.syncResponsabilidadCargoColumnas();
		});
	}

	editarResponsabilidadCargoClick(e: any): void {
		if (this.readOnly || this.responsabilidadesCargoEditando) {
			return;
		}
		if (!e?.row?.data?._esImpactoEconomico) {
			this.actualizarResponsabilidadesCargoLookupDisponibles(
				Number(e?.row?.data?.CORR_RESPONSABILIDAD) || null
			);
		}
		this.responsabilidadesCargoInsertando = false;
		this.responsabilidadesCargoEditando = true;
		const rowIndex = e.row.rowIndex;
		const grid = e.component;
		setTimeout(() => {
			grid.editRow(rowIndex);
			this.syncResponsabilidadCargoColumnas();
		});
	}

	responsabilidadCargoEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	responsabilidadCargoDeleteButtonVisible(e: any): boolean {
		if (e?.row?.data?._esImpactoEconomico) {
			return false;
		}
		return this.accionGridVisible(e);
	}

	// Confirma la fila del grid de responsabilidades (incluye impacto economico).
	guardarResponsabilidadCargoEditado(): void {
		const grid = this.gridResponsabilidadesCargo?.instance;
		if (!grid || !this.responsabilidadesCargoEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Descarta la edicion en curso de responsabilidades.
	cancelarResponsabilidadCargoEditado(): void {
		this.cancelarEdicionGrid(this.gridResponsabilidadesCargo?.instance, () => {
			this.responsabilidadesCargoEditando = false;
			this.responsabilidadesCargoInsertando = false;
			this.cargarResponsabilidadesCargo(true);
		});
	}

	responsabilidadCargoInitNewRow(e: any): void {
		this.responsabilidadesCargoInsertando = true;
		e.data.CORR_DESCRIPTOR_RESPONSABILIDAD = 0;
		e.data.CORR_DESCRIPTOR_PUESTO = Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
		e.data.CORR_RESPONSABILIDAD = null;
		e.data.NOMBRE_RESPONSABILIDAD = '';
		e.data.INFORMACION = '';
		e.data.APLICA_DESCRIPTOR = this.model?.FORMATO ?? FORMATO_CORTO;
		e.data._clientKey = this.crearClientKey('rc');
		this.actualizarResponsabilidadesCargoLookupDisponibles();
	}

	onResponsabilidadCargoEditingStart(e: any): void {
		if (e?.data?._esImpactoEconomico) {
			this.responsabilidadesCargoInsertando = false;
			e.data.NOMBRE_RESPONSABILIDAD = IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR;
			this.responsabilidadesCargoEditando = true;
			this.syncResponsabilidadCargoColumnas();
			return;
		}

		this.responsabilidadesCargoInsertando = !(Number(e?.data?.CORR_DESCRIPTOR_RESPONSABILIDAD) > 0);
		this.actualizarResponsabilidadesCargoLookupDisponibles(Number(e?.data?.CORR_RESPONSABILIDAD) || null);
		this.responsabilidadesCargoEditando = true;
		this.syncResponsabilidadCargoColumnas();
	}

	onResponsabilidadCargoEditorPreparing(e: any): void {
		if (e?.parentType !== 'dataRow' || !e?.row?.data?._esImpactoEconomico) {
			return;
		}

		if (e.dataField === 'NOMBRE_RESPONSABILIDAD' || e.dataField === 'CORR_RESPONSABILIDAD') {
			e.editorOptions = {
				...(e.editorOptions || {}),
				readOnly: true,
				disabled: true,
			};
		}
	}

	onResponsabilidadCargoSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.responsabilidadesCargoEditando = false;
			this.responsabilidadesCargoInsertando = false;
		});
	}

	onResponsabilidadCargoEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.responsabilidadesCargoEditando = false;
			this.responsabilidadesCargoInsertando = false;
		});
		this.cargarResponsabilidadesCargo(true);
	}

	responsabilidadCargoRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (data._esImpactoEconomico) {
			if ((data.INFORMACION ?? '').trim().length > 255) {
				this.invalidarFila(e, 'La informacion no puede superar 255 caracteres.');
				return;
			}
			e.newData = {
				...(e.newData || {}),
				NOMBRE_RESPONSABILIDAD: IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR,
				CORR_RESPONSABILIDAD: null,
				CORR_DESCRIPTOR_RESPONSABILIDAD: 0,
			};
			return;
		}

		if (!(Number(data.CORR_RESPONSABILIDAD) > 0)) {
			this.invalidarFila(e, 'Debe seleccionar una responsabilidad de cargo.');
			return;
		}
		if (!(data.NOMBRE_RESPONSABILIDAD ?? '').trim()) {
			this.invalidarFila(e, 'Debe indicar el nombre de la responsabilidad.');
			return;
		}
		if ((data.NOMBRE_RESPONSABILIDAD ?? '').trim().length > 150) {
			this.invalidarFila(e, 'El nombre de la responsabilidad no puede superar 150 caracteres.');
			return;
		}

		if ((data.INFORMACION ?? '').trim().length > 255) {
			this.invalidarFila(e, 'La informacion no puede superar 255 caracteres.');
			return;
		}

		const corrCatalogo = Number(data.CORR_RESPONSABILIDAD);
		const clientKey = data._clientKey ?? e?.key;
		const duplicada = (this.responsabilidadesCargo || []).some((row) => {
			if (row._esImpactoEconomico) {
				return false;
			}
			if (!(Number(row.CORR_RESPONSABILIDAD) > 0)) {
				return false;
			}
			if (clientKey != null && row._clientKey === clientKey) {
				return false;
			}
			return Number(row.CORR_RESPONSABILIDAD) === corrCatalogo;
		});
		if (duplicada) {
			this.invalidarFila(e, 'Esa responsabilidad de cargo ya esta agregada en el descriptor.');
			return;
		}
	}

	responsabilidadCargoRowInserting(e: any): void {
		if (e?.data?._esImpactoEconomico) {
			e.cancel = true;
			return;
		}
		e.cancel = this.persistirResponsabilidadCargoDesdeGrid(e.data, true);
	}

	responsabilidadCargoRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		if (data._esImpactoEconomico) {
			const live = (this.responsabilidadesCargo || []).find(
				(row) => row._esImpactoEconomico || row._clientKey === e.key
			);
			data.CORR_IMPACTO_ECONOMICO =
				live?.CORR_IMPACTO_ECONOMICO ?? data.CORR_IMPACTO_ECONOMICO ?? null;
			data.INFORMACION = (live?.INFORMACION ?? data.INFORMACION ?? '').trim();
			data.NOMBRE_RESPONSABILIDAD = IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR;
			e.cancel = this.persistirImpactoEconomicoDesdeGrid(data);
			return;
		}
		e.cancel = this.persistirResponsabilidadCargoDesdeGrid(data, false);
	}

	responsabilidadCargoRowRemoving(e: any): void {
		if (e?.data?._esImpactoEconomico) {
			e.cancel = true;
			return;
		}
		e.cancel = this.eliminarResponsabilidadCargoDesdeGrid(e.data);
	}

	responsabilidadCargoCatalogDisplay = (row: ScDescriptorPuestoResponsabilidadCargo): string => {
		if (row?._esImpactoEconomico) {
			return '';
		}
		const corr = Number(row?.CORR_RESPONSABILIDAD);
		if (!(corr > 0)) {
			return '';
		}
		return String(corr);
	};

	responsabilidadCargoCodigoDisplay = (row: ScDescriptorPuestoResponsabilidadCargo): string => {
		if (row?._esImpactoEconomico) {
			return '';
		}
		const corr = Number(row?.CORR_DESCRIPTOR_RESPONSABILIDAD);
		return corr > 0 ? String(corr) : '';
	};

	responsabilidadCargoInformacionDisplay = (row: ScDescriptorPuestoResponsabilidadCargo): string => {
		return (row?.INFORMACION ?? '').trim();
	};

	onImpactoEconomicoLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog = this.mCORR_IMPACTO_ECONOMICO.find(
			(item) => Number(item.CORR_IMPACTO_ECONOMICO) === Number(corr)
		);
		const descripcion = (catalog?.DESCRIPCION ?? '').trim();

		cellInfo.setValue(descripcion);
		if (cellInfo?.data) {
			cellInfo.data.CORR_IMPACTO_ECONOMICO = corr;
			cellInfo.data.NOMBRE_RESPONSABILIDAD = IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR;
			cellInfo.data.INFORMACION = descripcion;
		}
	}

	// Filtra responsabilidades segun formato y seleccion actual.
	private actualizarResponsabilidadesCargoLookupDisponibles(corrConservar: number | null = null): void {
		const usados = new Set(
			(this.responsabilidadesCargo || [])
				.filter((row) => !row._esImpactoEconomico)
				.map((row) => Number(row.CORR_RESPONSABILIDAD))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		this.mCORR_RESPONSABILIDAD_DISPONIBLES = (this.mCORR_RESPONSABILIDAD || []).filter((item) => {
			const corr = Number(item.CORR_RESPONSABILIDAD);
			if (!(corr > 0) || !this.responsabilidadAplicaAlFormato(item.APLICA_DESCRIPTOR)) {
				return false;
			}
			if (corrConservar != null && corr === Number(corrConservar)) {
				return true;
			}
			return !usados.has(corr);
		});
	}

	// Normaliza APLICA_DESCRIPTOR a C/E/A para comparar con el formato.
	private normalizarAplicabilidadResponsabilidad(value: string | null | undefined): string {
		const aplica = (value ?? 'AMBOS').trim().toUpperCase();
		return aplica === 'CORTO' || aplica === 'EXTENSO' || aplica === 'AMBOS' ? aplica : 'AMBOS';
	}

	private responsabilidadAplicaAlFormato(value: string | null | undefined): boolean {
		const aplica = this.normalizarAplicabilidadResponsabilidad(value);
		const formato = (this.model?.FORMATO ?? FORMATO_CORTO).trim().toUpperCase();
		return aplica === 'AMBOS' || aplica === formato;
	}

	onResponsabilidadCargoLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
		this.repintarFilaResponsabilidadCargoLookup(cellInfo);
	}

	// Repinta la fila tras lookup de responsabilidad para mostrar textos derivados.
	private repintarFilaResponsabilidadCargoLookup(cellInfo: any): void {
		this.cdr.detectChanges();
		setTimeout(() => {
			const grid = this.gridResponsabilidadesCargo?.instance ?? cellInfo?.component;
			const rowIndex = typeof cellInfo?.row?.rowIndex === 'number' ? cellInfo.row.rowIndex : null;
			if (!grid) {
				return;
			}
			grid.updateDimensions?.();
			if (rowIndex != null && rowIndex >= 0 && typeof grid.repaintRows === 'function') {
				grid.repaintRows([rowIndex]);
				return;
			}
			grid.repaint?.();
		});
	}

	setResponsabilidadCargoCellValue = (
		newData: ScDescriptorPuestoResponsabilidadCargo,
		value: number | null,
		_currentRowData: ScDescriptorPuestoResponsabilidadCargo
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog = this.mCORR_RESPONSABILIDAD.find(
			(item) => Number(item.CORR_RESPONSABILIDAD) === Number(corr)
		);
		newData.CORR_RESPONSABILIDAD = corr;
		newData.NOMBRE_RESPONSABILIDAD = catalog?.NOMBRE_RESPONSABILIDAD ?? '';
		newData.APLICA_DESCRIPTOR = this.normalizarAplicabilidadResponsabilidad(
			catalog?.APLICA_DESCRIPTOR
		);
	};

	// Perfil se edita como una unidad: normaliza edades y catálogos, persiste el padre y luego actualiza
	// la llave compartida por educación, experiencia y competencias.
	onPerfilEdadMinimaChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.EDAD_MINIMA = this.normalizarEdadPerfil(e?.value);
	}

	onPerfilEdadMaximaChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.EDAD_MAXIMA = this.normalizarEdadPerfil(e?.value);
	}

	onPerfilSexoChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.SEXO = `${e?.value ?? PERFIL_PUESTO_DEFAULT.SEXO}`.trim().toUpperCase();
	}

	onPerfilEstadoFamiliarChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.ESTADO_FAMILIAR = `${e?.value ?? PERFIL_PUESTO_DEFAULT.ESTADO_FAMILIAR}`.trim().toUpperCase();
	}

	onPerfilDisponibilidadChanged(value: number | null): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.CORR_DISPONIBILIDAD_HORARIO = value != null && value > 0 ? Number(value) : null;
		const item = this.mCORR_DISPONIBILIDAD_HORARIO_EDIT.find(
			(row) => Number(row.CORR_DISPONIBILIDAD_HORARIO) === Number(this.perfil.CORR_DISPONIBILIDAD_HORARIO)
		);
		this.perfil.NOMBRE_DISPONIBILIDAD_HORARIO = item?.NOMBRE_DISPONIBILIDAD_HORARIO ?? '';
	}

	onPerfilModalidadChanged(value: number | null): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.CORR_TIPO_MODALIDAD = value != null && value > 0 ? Number(value) : null;
		const item = this.mCORR_TIPO_MODALIDAD.find(
			(row) => Number(row.CORR_TIPO_MODALIDAD) === Number(this.perfil.CORR_TIPO_MODALIDAD)
		);
		this.perfil.MODALIDAD_NOMBRE = item?.MODALIDAD_NOMBRE ?? '';
	}

	onPerfilLicenciaChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.LICENCIA = e?.value === true;
	}

	editarPerfil(): void {
		if (this.readOnly || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.perfilOriginal = { ...this.perfil };
		this.prepararDisponibilidadLookupParaPerfil();
		this.perfilEditando = true;
	}

	// Valida y persiste el perfil padre; actualiza CORR_PERFIL_PUESTO compartido por detalles.
	guardarPerfil(): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (this.readOnly || !this.perfilEditando || !corrDescriptor || corrDescriptor <= 0) {
			return;
		}

		this.perfil.EDAD_MINIMA = this.normalizarEdadPerfil(this.perfil.EDAD_MINIMA);
		this.perfil.EDAD_MAXIMA = this.normalizarEdadPerfil(this.perfil.EDAD_MAXIMA);
		if (
			this.perfil.EDAD_MINIMA != null &&
			this.perfil.EDAD_MAXIMA != null &&
			this.perfil.EDAD_MINIMA > this.perfil.EDAD_MAXIMA
		) {
			this.notifyFx('La edad minima no puede ser mayor que la edad maxima.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.persistirPerfil(corrDescriptor, this.perfil, this.perfilExiste)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result) {
						this.notificarRespuestaOperacion(response, 'guardar');
						this.loadingVisible = false;
						return;
					}

					const saved = response.Data as ScDescriptorPerfilPuesto;
					if (saved) {
						this.perfil = { ...this.perfil, ...saved };
					} else if (Number(response?.CodeHelper) > 0) {
						this.perfil.CORR_PERFIL_PUESTO = Number(response.CodeHelper);
					}
					this.perfilExiste = Number(this.perfil.CORR_PERFIL_PUESTO) > 0;
					this.perfilOriginal = { ...this.perfil };
					this.prepararDisponibilidadLookupParaPerfil();
					this.perfilEditando = false;
					this.loadingVisible = false;
					this.notifyFx('Perfil modificado con exito!', NotifyType.Success, { raw: true });
				},
				error: (error) => {
					this.notificarErrorOperacion(error, 'guardar');
					this.loadingVisible = false;
				},
			});
	}

	// Restaura el perfil desde la copia previa sin tocar detalles hijos.
	cancelarEdicionPerfil(): void {
		if (!this.perfilEditando) {
			return;
		}
		this.perfil = { ...this.perfilOriginal };
		this.prepararDisponibilidadLookupParaPerfil();
		this.perfilEditando = false;
	}

	// Entrenamiento usa una operación específica del descriptor y conserva una copia previa
	// para poder cancelar sin recargar todas las secciones.
	editarEntrenamiento(): void {
		if (this.readOnly || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.entrenamientoOriginal = this.obtenerEntrenamientoActual();
		this.induccionInvalida = false;
		this.prepararInduccionesLookupParaEntrenamiento();
		this.entrenamientoEditando = true;
	}

	onEntrenamientoInduccionChanged(value: number | null): void {
		if (this.readOnly || !this.entrenamientoEditando) {
			return;
		}
		const corrInduccion = value != null && Number(value) > 0 ? Number(value) : null;
		if (corrInduccion) {
			this.induccionInvalida = false;
		}
		const induccion = this.mCORR_INDUCCION_EDIT.find(
			(item) => Number(item.CORR_INDUCCION) === Number(corrInduccion)
		);
		this.model.CORR_INDUCCION = corrInduccion;
		this.model.NOMBRE_INDUCCION = induccion?.NOMBRE_INDUCCION ?? '';
		this.model.SEMANAS_INDUCCION = induccion?.SEMANAS_INDUCCION ?? null;
	}

	// Persiste induccion/semanas/responsable via updateEntrenamiento del servicio.
	guardarEntrenamiento(): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		const corrInduccion = Number(this.model?.CORR_INDUCCION);
		const responsable = (this.model?.RESPONSABLE ?? '').trim();
		if (this.readOnly || !this.entrenamientoEditando || !corrDescriptor || corrDescriptor <= 0) {
			return;
		}
		if (!corrInduccion || corrInduccion <= 0) {
			this.induccionInvalida = true;
			this.notifyFx('Debe seleccionar el tipo de entrenamiento.', NotifyType.Warning);
			return;
		}
		if (!responsable) {
			this.notifyFx('Debe ingresar el responsable del entrenamiento.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.actualizarEntrenamiento(corrDescriptor, corrInduccion, responsable)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result) {
						this.notificarRespuestaOperacion(response, 'guardar');
						this.loadingVisible = false;
						return;
					}

					const induccion = this.mCORR_INDUCCION_EDIT.find(
						(item) => Number(item.CORR_INDUCCION) === corrInduccion
					);
					const data = response.Data as Partial<ScDescriptorPuesto> | null;
					const entrenamiento = {
						CORR_INDUCCION: data?.CORR_INDUCCION ?? corrInduccion,
						NOMBRE_INDUCCION: data?.NOMBRE_INDUCCION ?? induccion?.NOMBRE_INDUCCION ?? '',
						SEMANAS_INDUCCION:
							data?.SEMANAS_INDUCCION ?? induccion?.SEMANAS_INDUCCION ?? null,
						RESPONSABLE: (data?.RESPONSABLE ?? responsable).trim(),
					};
					this.sincronizarEntrenamiento(entrenamiento);
					this.entrenamientoOriginal = { ...entrenamiento };
					this.induccionInvalida = false;
					this.entrenamientoEditando = false;
					this.loadingVisible = false;
					this.notifyFx('Entrenamiento modificado con exito!', NotifyType.Success, { raw: true });
				},
				error: (error) => {
					this.notificarErrorOperacion(error, 'guardar');
					this.loadingVisible = false;
				},
			});
	}

	// Restaura entrenamiento desde la copia previa sin recargar secciones.
	cancelarEdicionEntrenamiento(): void {
		if (!this.entrenamientoEditando) {
			return;
		}
		this.sincronizarEntrenamiento(this.entrenamientoOriginal, false);
		this.induccionInvalida = false;
		this.entrenamientoEditando = false;
	}

	// Lee del modelo los campos de entrenamiento para edicion o cancelacion.
	private obtenerEntrenamientoActual(): {
		CORR_INDUCCION: number | null;
		NOMBRE_INDUCCION: string;
		SEMANAS_INDUCCION: number | null;
		RESPONSABLE: string;
	} {
		return {
			CORR_INDUCCION:
				this.model?.CORR_INDUCCION != null && Number(this.model.CORR_INDUCCION) > 0
					? Number(this.model.CORR_INDUCCION)
					: null,
			NOMBRE_INDUCCION: this.model?.NOMBRE_INDUCCION ?? '',
			SEMANAS_INDUCCION: this.model?.SEMANAS_INDUCCION ?? null,
			RESPONSABLE: this.model?.RESPONSABLE ?? '',
		};
	}

	// Replica el entrenamiento confirmado en el modelo activo y, si corresponde, en el grid principal
	// para mantener ambos contextos consistentes sin una nueva consulta.
	private sincronizarEntrenamiento(
		entrenamiento: {
			CORR_INDUCCION: number | null;
			NOMBRE_INDUCCION: string;
			SEMANAS_INDUCCION: number | null;
			RESPONSABLE: string;
		},
		actualizarGrid = true
	): void {
		Object.assign(this.model, entrenamiento);
		if (this.modelUpdate) {
			Object.assign(this.modelUpdate, entrenamiento);
		}
		this.prepararInduccionesLookupParaEntrenamiento();
		if (!actualizarGrid || !Array.isArray(this.models)) {
			return;
		}

		const corrDescriptor = Number(this.model.CORR_DESCRIPTOR_PUESTO);
		this.models = this.models.map((row: ScDescriptorPuesto) =>
			Number(row.CORR_DESCRIPTOR_PUESTO) === corrDescriptor
				? { ...row, ...entrenamiento }
				: row
		);
		this.cdr.detectChanges();
	}

	// Convierte edad del perfil a number|null descartando valores invalidos.
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

	// Limpia perfil y sus detalles al cambiar de descriptor o cancelar el formulario.
	private limpiarPerfil(): void {
		this.perfil = { ...PERFIL_PUESTO_DEFAULT };
		this.perfilOriginal = { ...this.perfil };
		this.perfilEditando = false;
		this.perfilExiste = false;
		this.perfilSubTabIndex = 0;
		this.educaciones = [];
		this.experiencias = [];
		this.competenciasTecnicas = [];
		this.competenciasConductuales = [];
		this.resetearEdicionEducacion();
		this.resetearEdicionExperiencia();
		this.resetearEdicionCompetenciasTecnicas();
		this.resetearEdicionCompetenciasConductuales();
		this.prepararDisponibilidadLookupParaPerfil();
		this.actualizarCompetenciasTecnicasLookupDisponibles();
		this.actualizarCompetenciasConductualesLookupDisponibles();
	}

	// Carga el perfil padre antes de sus detalles. La secuencia descarta respuestas antiguas
	// cuando el usuario cambia de descriptor mientras una solicitud continúa en curso.
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
						this.perfilOriginal = { ...this.perfil };
						this.perfilEditando = false;
						this.perfilExiste = true;
						this.prepararDisponibilidadLookupParaPerfil();
						this.cargarEducacion(forzar);
						this.cargarExperiencia(forzar);
						this.cargarCompetenciasTecnicas(forzar);
						this.cargarCompetenciasConductuales(forzar);
						return;
					}

					// 1 perfil por descriptor: si no existe, crearlo con valores por defecto.
					this.crearPerfilPorDefecto(corrDescriptor, loadSeq, forzar);
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Si el descriptor no tiene perfil, crea el objeto local mínimo para presentar la sección
	// sin asumir que el registro ya existe en la base de datos.
	private crearPerfilPorDefecto(corrDescriptor: number, loadSeq: number, forzar = false): void {
		this.perfil = {
			...PERFIL_PUESTO_DEFAULT,
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: 0,
		};
		this.perfilOriginal = { ...this.perfil };
		this.perfilEditando = false;
		this.perfilExiste = false;
		this.educaciones = [];
		this.experiencias = [];
		this.competenciasTecnicas = [];
		this.competenciasConductuales = [];
		this.resetearEdicionEducacion();
		this.resetearEdicionExperiencia();
		this.resetearEdicionCompetenciasTecnicas();
		this.resetearEdicionCompetenciasConductuales();

		this.service
			.persistirPerfil(corrDescriptor, this.perfil, false)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.perfilLoadSeq) {
						return;
					}

					if (!response?.Result) {
						this.notificarRespuestaOperacion(response, 'guardar');
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

					if (Number(this.perfil.CORR_PERFIL_PUESTO) > 0) {
						this.perfilOriginal = { ...this.perfil };
						this.cargarEducacion(forzar);
						this.cargarExperiencia(forzar);
						this.cargarCompetenciasTecnicas(forzar);
						this.cargarCompetenciasConductuales(forzar);
					}
					this.perfilOriginal = { ...this.perfil };
				},
				error: (error) => this.notificarErrorOperacion(error, 'guardar'),
			});
	}

	// Carga los detalles del Perfil verificando que descriptor, perfil y secuencia sigan vigentes,
	// lo que evita mezclar respuestas pertenecientes a otra selección.
	private cargarEducacion(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrPerfil || corrPerfil <= 0) {
			this.educaciones = [];
			this.resetearEdicionEducacion();
			return;
		}

		const loadSeq = ++this.educacionLoadSeq;
		this.service
			.getEducacionLookup(corrDescriptor, corrPerfil)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.educacionLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionEducacion();
						this.educaciones = response.Data.map((item: ScPerfilPuestoEducacion) => ({
							CORR_PERFIL_PUESTO: item.CORR_PERFIL_PUESTO ?? corrPerfil,
							CORR_EDUCACION: item.CORR_EDUCACION,
							REQUISITO: item.REQUISITO ?? '',
							ESPECIFICACIONES: item.ESPECIFICACIONES ?? '',
							TIPO_REQUERIDO: (item.TIPO_REQUERIDO ?? 'SI').toUpperCase(),
							_clientKey: item.CORR_EDUCACION || this.crearClientKey('edu'),
						}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Consulta experiencia del perfil; ignora respuestas de otra secuencia/seleccion.
	private cargarExperiencia(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrPerfil || corrPerfil <= 0) {
			this.experiencias = [];
			this.resetearEdicionExperiencia();
			return;
		}

		const loadSeq = ++this.experienciaLoadSeq;
		this.service
			.getExperienciaLookup(corrDescriptor, corrPerfil)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.experienciaLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionExperiencia();
						this.experiencias = response.Data.map((item: ScPerfilPuestoExperiencia) => ({
							CORR_PERFIL_PUESTO: item.CORR_PERFIL_PUESTO ?? corrPerfil,
							CORR_EXPERIENCIA: item.CORR_EXPERIENCIA,
							REQUISITO: item.REQUISITO ?? '',
							TIPO_REQUERIDO: (item.TIPO_REQUERIDO ?? 'SI').toUpperCase(),
							_clientKey: item.CORR_EXPERIENCIA || this.crearClientKey('exp'),
						}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga competencias tecnicas del perfil y refresca el lookup disponible.
	private cargarCompetenciasTecnicas(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrPerfil || corrPerfil <= 0) {
			this.competenciasTecnicas = [];
			this.resetearEdicionCompetenciasTecnicas();
			this.actualizarCompetenciasTecnicasLookupDisponibles();
			return;
		}

		const loadSeq = ++this.competenciasTecnicasLoadSeq;
		this.service
			.getCompetenciasTecnicasLookup(corrDescriptor, corrPerfil)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.competenciasTecnicasLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionCompetenciasTecnicas();
						this.competenciasTecnicas = response.Data.map(
							(item: ScPerfilPuestoCompetenciasTecnicas) => ({
								CORR_PERFIL_PUESTO: item.CORR_PERFIL_PUESTO ?? corrPerfil,
								CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS:
									item.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS,
								NOMBRE_COMPETENCIAS_TECNICAS: item.NOMBRE_COMPETENCIAS_TECNICAS ?? '',
								CODIGO_COMPETENCIAS_TECNICAS: item.CODIGO_COMPETENCIAS_TECNICAS ?? '',
								DESCRIPCION: item.DESCRIPCION ?? '',
								NIVEL_DOMINIO: (item.NIVEL_DOMINIO ?? 'BASICO').toUpperCase(),
								CORR_COMPETENCIAS_TECNICAS: item.CORR_COMPETENCIAS_TECNICAS ?? null,
								_clientKey:
									item.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS ||
									this.crearClientKey('ct'),
							})
						);
						this.actualizarCompetenciasTecnicasLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga competencias conductuales del perfil y refresca el lookup disponible.
	private cargarCompetenciasConductuales(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrPerfil || corrPerfil <= 0) {
			this.competenciasConductuales = [];
			this.resetearEdicionCompetenciasConductuales();
			this.actualizarCompetenciasConductualesLookupDisponibles();
			return;
		}

		const loadSeq = ++this.competenciasConductualesLoadSeq;
		this.service
			.getCompetenciasConductualesLookup(corrDescriptor, corrPerfil)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.competenciasConductualesLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionCompetenciasConductuales();
						this.competenciasConductuales = response.Data.map(
							(item: ScPerfilPuestoCompetenciasConductuales) => ({
								CORR_PERFIL_PUESTO: item.CORR_PERFIL_PUESTO ?? corrPerfil,
								CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES:
									item.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES,
								NOMBRE_COMPETENCIAS_CONDUCTUALES: item.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '',
								DESCRIPCION: item.DESCRIPCION ?? '',
								CORR_COMPETENCIAS_CONDUCTUALES: item.CORR_COMPETENCIAS_CONDUCTUALES ?? null,
								CODIGO_TIPO_PUESTO: item.CODIGO_TIPO_PUESTO ?? '',
								_clientKey:
									item.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES ||
									this.crearClientKey('cc'),
							})
						);
						this.actualizarCompetenciasConductualesLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga secciones propias del descriptor y, cuando corresponde, incorpora filas calculadas
	// que no provienen directamente del endpoint de detalle.
	private cargarRequerimientosOrganizacionales(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.requerimientosOrganizacionales = [];
			this.resetearEdicionRequerimientosOrganizacionales();
			this.actualizarRequerimientosOrganizacionalesLookupDisponibles();
			return;
		}

		const loadSeq = ++this.requerimientosOrganizacionalesLoadSeq;
		this.service
			.getRequerimientosOrganizacionalesLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.requerimientosOrganizacionalesLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionRequerimientosOrganizacionales();
						this.requerimientosOrganizacionales = response.Data.map(
							(item: ScDescriptorPuestoRequerimientoOrganizacional) => ({
								CORR_DESCRIPTOR_PUESTO: item.CORR_DESCRIPTOR_PUESTO ?? corrDescriptor,
								CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL:
									item.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL,
								DESCRIPCION: item.DESCRIPCION ?? '',
								CORR_REQUERIMIENTO_ORGANIZACIONAL: item.CORR_REQUERIMIENTO_ORGANIZACIONAL ?? null,
								_clientKey:
									item.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL ||
									this.crearClientKey('ro'),
							})
						);
						this.actualizarRequerimientosOrganizacionalesLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga riesgos del descriptor (formato extenso) y actualiza lookup disponible.
	private cargarRiesgosPuesto(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoExtenso) {
			this.riesgosPuesto = [];
			this.resetearEdicionRiesgosPuesto();
			this.actualizarRiesgosPuestoLookupDisponibles();
			return;
		}

		const loadSeq = ++this.riesgosPuestoLoadSeq;
		this.service
			.getRiesgosPuestoLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.riesgosPuestoLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionRiesgosPuesto();
						this.riesgosPuesto = response.Data.map((item: ScDescriptorPuestoRiesgoPuesto) => ({
							CORR_DESCRIPTOR_PUESTO: item.CORR_DESCRIPTOR_PUESTO ?? corrDescriptor,
							CORR_DESCRIPTOR_RIESGO: item.CORR_DESCRIPTOR_RIESGO,
							NOMBRE_RIESGO_PUESTO: item.NOMBRE_RIESGO_PUESTO ?? '',
							INFORMACION: item.INFORMACION ?? '',
							CORR_RIESGO_PUESTO: item.CORR_RIESGO_PUESTO ?? null,
							_clientKey: item.CORR_DESCRIPTOR_RIESGO || this.crearClientKey('rp'),
						}));
						this.actualizarRiesgosPuestoLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga responsabilidades y construye la fila virtual de impacto economico.
	private cargarResponsabilidadesCargo(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.responsabilidadesCargo = [];
			this.resetearEdicionResponsabilidadesCargo();
			this.actualizarResponsabilidadesCargoLookupDisponibles();
			return;
		}

		const loadSeq = ++this.responsabilidadesCargoLoadSeq;
		this.service
			.getResponsabilidadesCargoLookup(
				corrDescriptor,
				this.model?.FORMATO ?? FORMATO_CORTO
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.responsabilidadesCargoLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionResponsabilidadesCargo();
						const data = response.Data as ScDescriptorPuestoResponsabilidadCargo[];
						const filas = data.map(
							(item: ScDescriptorPuestoResponsabilidadCargo): ScDescriptorPuestoResponsabilidadCargo => ({
								CORR_DESCRIPTOR_PUESTO: item.CORR_DESCRIPTOR_PUESTO ?? corrDescriptor,
								CORR_DESCRIPTOR_RESPONSABILIDAD: item.CORR_DESCRIPTOR_RESPONSABILIDAD,
								NOMBRE_RESPONSABILIDAD: item.NOMBRE_RESPONSABILIDAD ?? '',
								INFORMACION: item.INFORMACION ?? '',
								APLICA_DESCRIPTOR: this.normalizarAplicabilidadResponsabilidad(
									item.APLICA_DESCRIPTOR
								),
								CORR_RESPONSABILIDAD: item.CORR_RESPONSABILIDAD ?? null,
								_clientKey: item.CORR_DESCRIPTOR_RESPONSABILIDAD || this.crearClientKey('rc'),
							})
						).filter((item) => this.responsabilidadAplicaAlFormato(item.APLICA_DESCRIPTOR));
						this.responsabilidadesCargo = [...filas, this.crearFilaImpactoEconomico()];
						this.actualizarResponsabilidadesCargoLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	private crearFilaImpactoEconomico(): ScDescriptorPuestoResponsabilidadCargo {
		return {
			CORR_DESCRIPTOR_PUESTO: Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0,
			CORR_DESCRIPTOR_RESPONSABILIDAD: 0,
			CORR_RESPONSABILIDAD: null,
			NOMBRE_RESPONSABILIDAD: IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR,
			INFORMACION: (this.model?.DESCRIPCION_IMPACTO_ECONOMICO ?? '').trim(),
			CORR_IMPACTO_ECONOMICO: this.model?.CORR_IMPACTO_ECONOMICO ?? null,
			_esImpactoEconomico: true,
			_clientKey: IMPACTO_ECONOMICO_CLIENT_KEY,
		};
	}

	// Inicia las cargas condicionadas por formato: KPI para corto; funciones, actividades y relaciones
	// para extenso. El parámetro forzar permite refrescar después de una persistencia.
	private cargarKpis(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoCorto) {
			this.kpis = [];
			this.resetearEdicionKpis();
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

	// Activas del catálogo + solo la frecuencia ya asociada a la fila KPI en edición (si está inactiva).
	private prepararFrecuenciasLookupParaEdicionKpi(row?: ScDescriptorKpiFuncion | null): void {
		const fila = this.resolverFilaKpi(row);
		const porCorr = new Map<number, ScFrecuenciaLookup>();

		for (const item of this.mCORR_FRECUENCIA ?? []) {
			const corr = Number(item.CORR_FRECUENCIA);
			if (corr > 0) {
				porCorr.set(corr, {
					CORR_FRECUENCIA: corr,
					NOMBRE_FRECUENCIA: item.NOMBRE_FRECUENCIA ?? '',
				});
			}
		}

		const corrAsociada = Number(fila?.CORR_FRECUENCIA);
		if (corrAsociada > 0 && !porCorr.has(corrAsociada)) {
			porCorr.set(corrAsociada, {
				CORR_FRECUENCIA: corrAsociada,
				NOMBRE_FRECUENCIA: (fila?.NOMBRE_FRECUENCIA ?? '').trim() || `Frecuencia ${corrAsociada}`,
			});
		}

		this.mCORR_FRECUENCIA_KPI_EDIT = Array.from(porCorr.values()).sort((a, b) =>
			(a.NOMBRE_FRECUENCIA || '').localeCompare(b.NOMBRE_FRECUENCIA || '', 'es', {
				sensitivity: 'base',
			})
		);
	}

	private resolverFilaKpi(row?: ScDescriptorKpiFuncion | null): ScDescriptorKpiFuncion | null {
		if (!row) {
			return null;
		}

		const clientKey = row._clientKey;
		const corrKpi = Number(row.CORR_KPI_FUNCION);
		const encontrada =
			this.kpis?.find(
				(item) =>
					(!!clientKey && item._clientKey === clientKey) ||
					(corrKpi > 0 && Number(item.CORR_KPI_FUNCION) === corrKpi)
			) ?? null;

		return encontrada ?? row;
	}

	// Activas del catálogo + la disponibilidad ya asociada al perfil (si está inactiva).
	private prepararDisponibilidadLookupParaPerfil(): void {
		const porCorr = new Map<number, ScDisponibilidadHorarioLookup>();

		for (const item of this.mCORR_DISPONIBILIDAD_HORARIO ?? []) {
			const corr = Number(item.CORR_DISPONIBILIDAD_HORARIO);
			if (corr > 0) {
				porCorr.set(corr, {
					CORR_DISPONIBILIDAD_HORARIO: corr,
					NOMBRE_DISPONIBILIDAD_HORARIO: item.NOMBRE_DISPONIBILIDAD_HORARIO ?? '',
				});
			}
		}

		const corrAsociada = Number(this.perfil?.CORR_DISPONIBILIDAD_HORARIO);
		if (corrAsociada > 0 && !porCorr.has(corrAsociada)) {
			porCorr.set(corrAsociada, {
				CORR_DISPONIBILIDAD_HORARIO: corrAsociada,
				NOMBRE_DISPONIBILIDAD_HORARIO:
					(this.perfil?.NOMBRE_DISPONIBILIDAD_HORARIO ?? '').trim() ||
					`Disponibilidad ${corrAsociada}`,
			});
		}

		this.mCORR_DISPONIBILIDAD_HORARIO_EDIT = Array.from(porCorr.values()).sort((a, b) =>
			(a.NOMBRE_DISPONIBILIDAD_HORARIO || '').localeCompare(
				b.NOMBRE_DISPONIBILIDAD_HORARIO || '',
				'es',
				{ sensitivity: 'base' }
			)
		);
	}

	// Activas del catálogo + la inducción ya asociada al descriptor (si está inactiva).
	private prepararInduccionesLookupParaEntrenamiento(): void {
		const porCorr = new Map<number, ScInduccionLookupItem>();

		for (const item of this.mCORR_INDUCCION ?? []) {
			const corr = Number(item.CORR_INDUCCION);
			if (corr > 0) {
				porCorr.set(corr, {
					CORR_INDUCCION: corr,
					NOMBRE_INDUCCION: item.NOMBRE_INDUCCION ?? '',
					SEMANAS_INDUCCION: item.SEMANAS_INDUCCION ?? null,
				});
			}
		}

		const corrAsociada = Number(this.model?.CORR_INDUCCION);
		if (corrAsociada > 0 && !porCorr.has(corrAsociada)) {
			porCorr.set(corrAsociada, {
				CORR_INDUCCION: corrAsociada,
				NOMBRE_INDUCCION: (this.model?.NOMBRE_INDUCCION ?? '').trim() || `Inducción ${corrAsociada}`,
				SEMANAS_INDUCCION: this.model?.SEMANAS_INDUCCION ?? null,
			});
		}

		this.mCORR_INDUCCION_EDIT = Array.from(porCorr.values()).sort((a, b) =>
			(a.NOMBRE_INDUCCION || '').localeCompare(b.NOMBRE_INDUCCION || '', 'es', {
				sensitivity: 'base',
			})
		);
	}

	// Carga funciones clave del descriptor y prepara contadores de actividades.
	private cargarFuncionesClave(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.funcionesClave = [];
			this.resetearEdicionFuncionesClave();
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

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionFuncionesClave();
						this.funcionesClave = response.Data
							.filter(
								(item: ScDescriptorFuncion) =>
									(item.TIPO_FUNCION ?? TIPO_FUNCION_CLAVE).trim().toUpperCase() ===
									TIPO_FUNCION_CLAVE
							)
							.map((item: ScDescriptorFuncion) => ({
								CORR_FUNCION: item.CORR_FUNCION,
								NOMBRE_FUNCION: item.NOMBRE_FUNCION ?? '',
								TIPO_FUNCION:
									(item.TIPO_FUNCION ?? TIPO_FUNCION_CLAVE).trim().toUpperCase() ||
									TIPO_FUNCION_CLAVE,
								CANT_ACTIVIDADES: Number(item.CANT_ACTIVIDADES ?? 0),
								_clientKey: item.CORR_FUNCION || this.crearClientKey('fc'),
							}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga actividades de la funcion clave abierta en el popup.
	private cargarActividadesPopup(funcion: ScDescriptorFuncion): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || !funcion?.CORR_FUNCION) {
			this.actividadesPopup = [];
			this.actividadesEditando = false;
			return;
		}

		this.service
			.getActividadesLookup(corrDescriptor, funcion.CORR_FUNCION)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result) {
						this.actividadesEditando = false;
						this.actividadesPopup = (response.Data ?? []).map((item: ScDescriptorFuncionActividad) => ({
							CORR_FUNCION: item.CORR_FUNCION,
							CORR_ACTIVIDAD: item.CORR_ACTIVIDAD,
							NOMBRE_ACTIVIDAD: item.NOMBRE_ACTIVIDAD ?? '',
							_clientKey: item.CORR_ACTIVIDAD || this.crearClientKey('act'),
						}));
						this.actualizarContadorActividades(funcion);
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Actualiza el contador visible de actividades en la fila de funcion clave.
	private actualizarContadorActividades(funcion: ScDescriptorFuncion): void {
		funcion.CANT_ACTIVIDADES = this.actividadesPopup.length;
	}

	// Carga funciones secundarias (solo formato corto).
	private cargarFuncionesSecundarias(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoCorto) {
			if (!corrDescriptor || corrDescriptor <= 0) {
				this.funcionesSecundarias = [];
				this.resetearEdicionFuncionesSecundarias();
			}
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

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionFuncionesSecundarias();
						this.funcionesSecundarias = response.Data
							.filter(
								(item: ScDescriptorFuncion) =>
									(item.TIPO_FUNCION ?? '').trim().toUpperCase() === TIPO_FUNCION_SECUNDARIA
							)
							.map((item: ScDescriptorFuncion) => ({
								CORR_FUNCION: item.CORR_FUNCION,
								NOMBRE_FUNCION: item.NOMBRE_FUNCION ?? '',
								TIPO_FUNCION:
									(item.TIPO_FUNCION ?? TIPO_FUNCION_SECUNDARIA).trim().toUpperCase() ||
									TIPO_FUNCION_SECUNDARIA,
								_clientKey: item.CORR_FUNCION || this.crearClientKey('fs'),
							}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga relaciones laborales internas (formato extenso).
	private cargarRelacionesInternas(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoExtenso) {
			if (!corrDescriptor || corrDescriptor <= 0) {
				this.relacionesInternas = [];
				this.resetearEdicionRelacionesInternas();
			}
			return;
		}

		const loadSeq = ++this.relacionesInternasLoadSeq;
		this.service
			.getRelacionesInternasLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.relacionesInternasLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionRelacionesInternas();
						this.relacionesInternas = response.Data
							.filter(
								(item: ScDescriptorRelacionLaboral) =>
									(item.TIPO_RELACION ?? '').trim().toUpperCase() === TIPO_RELACION_INTERNA
							)
							.map((item: ScDescriptorRelacionLaboral) => ({
								CORR_RELACION_LABORAL: item.CORR_RELACION_LABORAL,
								TIPO_RELACION: TIPO_RELACION_INTERNA,
								PUESTO_AREA: item.PUESTO_AREA ?? '',
								MOTIVO_RELACION: item.MOTIVO_RELACION ?? '',
								_clientKey: item.CORR_RELACION_LABORAL || this.crearClientKey('ri'),
							}));
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga relaciones laborales externas (formato extenso).
	private cargarRelacionesExternas(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoExtenso) {
			if (!corrDescriptor || corrDescriptor <= 0) {
				this.relacionesExternas = [];
				this.resetearEdicionRelacionesExternas();
			}
			return;
		}

		const loadSeq = ++this.relacionesExternasLoadSeq;
		this.service
			.getRelacionesExternasLookup(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.relacionesExternasLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionRelacionesExternas();
						this.relacionesExternas = response.Data
							.filter(
								(item: ScDescriptorRelacionLaboral) =>
									(item.TIPO_RELACION ?? '').trim().toUpperCase() === TIPO_RELACION_EXTERNA
							)
							.map((item: ScDescriptorRelacionLaboral) => ({
								CORR_RELACION_LABORAL: item.CORR_RELACION_LABORAL,
								TIPO_RELACION: TIPO_RELACION_EXTERNA,
								PUESTO_AREA: item.PUESTO_AREA ?? '',
								MOTIVO_RELACION: item.MOTIVO_RELACION ?? '',
								_clientKey: item.CORR_RELACION_LABORAL || this.crearClientKey('re'),
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

	// Cambiar formato puede ocultar secciones con ediciones activas. Antes de aplicarlo cancela esos estados,
	// limpia datos incompatibles y selecciona la primera pestaña válida.
	onFormatoChanged(value: string, formatoAnteriorHint?: string): void {
		const formatoNuevo = (value || FORMATO_CORTO).toUpperCase();
		// El form a veces ya escribio FORMATO en model antes del evento; previousValue puede venir vacio.
		const formatoAnterior = (
			formatoAnteriorHint ??
			this.ultimoFormatoAplicado ??
			this.model?.FORMATO ??
			''
		).toUpperCase();
		const cambioReal = formatoAnterior !== formatoNuevo;
		const tabActualIndex = this.subTabIndex >= 0 ? this.subTabIndex : this.ultimoTabSeccionValido;

		if (cambioReal) {
			const detallesEnEdicion = this.obtenerDetallesEnEdicion();
			if (detallesEnEdicion.length > 0) {
				this.restaurarFormatoAnterior(formatoAnterior);
				this.notifyFx(
					this.crearMensajeEdicionesPendientes(detallesEnEdicion, 'cambiar el formato'),
					NotifyType.Warning
				);
				return;
			}
		}

		if (cambioReal) {
			this.cancelarEdicionesNoAplicablesFormato(formatoNuevo);
		}

		this.model.FORMATO = value || FORMATO_CORTO;
		this.ultimoFormatoAplicado = formatoNuevo;
		this.actualizarResponsabilidadesCargoLookupDisponibles();
		if (cambioReal && Number(this.model?.CORR_DESCRIPTOR_PUESTO) > 0) {
			this.cargarResponsabilidadesCargo(true);
		}

		if (cambioReal) {
			if (this.esTabSeccionVisibleParaFormato(tabActualIndex, formatoNuevo)) {
				// Volvio a un formato donde el tab si aplica: restaurar y quitar card.
				this.mostrarAvisoSeleccioneTab = false;
				this.seleccionarTabSeccion(tabActualIndex);
			} else {
				if (this.subTabIndex >= 0) {
					this.ultimoTabSeccionValido = this.subTabIndex;
				}
				this.dejarSinTabSeccionSeleccionado();
				this.mostrarAvisoSeleccioneTab = true;
			}
		}

		// Solo recargar secundarias si el usuario cambió de verdad el formato (no por sync del form).
		if (cambioReal && this.esFormatoCorto && this.mostrarSeccionesDescriptor) {
			this.cargarFuncionesSecundarias();
			this.cargarKpis();
		}

		if (cambioReal && this.esFormatoExtenso && this.mostrarSeccionesDescriptor) {
			this.cargarRelacionesInternas();
			this.cargarRelacionesExternas();
			this.cargarRiesgosPuesto();
		}
	}

	// Revierte FORMATO en modelo y form cuando hay ediciones pendientes.
	private restaurarFormatoAnterior(formatoAnterior: string): void {
		const formato = formatoAnterior === FORMATO_EXTENSO ? FORMATO_EXTENSO : FORMATO_CORTO;
		this.sincronizandoHeader = true;
		this.model.FORMATO = formato;
		this.ultimoFormatoAplicado = formato;
		this.headerForm?.instance?.updateData('FORMATO', formato);
		setTimeout(() => {
			this.sincronizandoHeader = false;
		});
	}

	// Al cambiar formato, cancela grids de secciones que dejan de ser visibles.
	private cancelarEdicionesNoAplicablesFormato(formatoNuevo: string): void {
		if (formatoNuevo === FORMATO_CORTO) {
			if (this.riesgosPuestoEditando) {
				this.cancelarEdicionGrid(
					this.gridRiesgosPuesto?.instance,
					() => this.resetearEdicionRiesgosPuesto()
				);
			}
			if (this.relacionesInternasEditando) {
				this.cancelarEdicionGrid(
					this.gridRelacionesInternas?.instance,
					() => this.resetearEdicionRelacionesInternas()
				);
			}
			if (this.relacionesExternasEditando) {
				this.cancelarEdicionGrid(
					this.gridRelacionesExternas?.instance,
					() => this.resetearEdicionRelacionesExternas()
				);
			}
			return;
		}

		if (formatoNuevo === FORMATO_EXTENSO) {
			if (this.funcionesSecundariasEditando) {
				this.cancelarEdicionGrid(
					this.gridFuncionesSecundarias?.instance,
					() => this.resetearEdicionFuncionesSecundarias()
				);
			}
			if (this.kpisEditando) {
				this.cancelarEdicionGrid(
					this.gridKpis?.instance,
					() => this.resetearEdicionKpis()
				);
			}
		}
	}

	/** Orden = dxi-item del tabPanelSecciones. visibleEn: ambos | corta | extensa */
	private readonly seccionesTabsMeta: Array<{ title: string; visibleEn: 'ambos' | 'corta' | 'extensa' }> = [
		{ title: 'Objetivo', visibleEn: 'ambos' },
		{ title: 'Funciones', visibleEn: 'ambos' },
		{ title: 'Funciones Secundarias', visibleEn: 'corta' },
		{ title: 'KPIs', visibleEn: 'corta' },
		{ title: 'Perfil', visibleEn: 'ambos' },
		{ title: 'Competencias', visibleEn: 'ambos' },
		{ title: 'Relaciones', visibleEn: 'extensa' },
		{ title: 'Requerimientos', visibleEn: 'ambos' },
		{ title: 'Riesgos', visibleEn: 'extensa' },
		{ title: 'Responsabilidades', visibleEn: 'ambos' },
		{ title: 'Entrenamiento', visibleEn: 'ambos' },
		{ title: 'Resumen', visibleEn: 'ambos' },
	];

	// Indica si el indice de sub-tab aplica al formato corto/extenso.
	private esTabSeccionVisibleParaFormato(index: number, formato: string): boolean {
		const tab = this.seccionesTabsMeta[index];
		if (!tab) {
			return false;
		}
		const fmt = (formato || '').toUpperCase();
		const esCorta = fmt === FORMATO_CORTO;
		const esExtensa = fmt === FORMATO_EXTENSO;
		if (tab.visibleEn === 'ambos') {
			return true;
		}
		if (tab.visibleEn === 'corta') {
			return esCorta;
		}
		return esExtensa;
	}

	// Fija el sub-tab visible y sincroniza el TabPanel de DevExtreme.
	private seleccionarTabSeccion(index: number): void {
		this.subTabIndex = index;
		this.ultimoTabSeccionValido = index;
		setTimeout(() => {
			this.subTabIndex = index;
			this.tabPanelSecciones?.instance?.option('selectedIndex', index);
		});
	}

	// Deja selectedIndex en -1 para mostrar la card de seleccionar tab.
	private dejarSinTabSeccionSeleccionado(): void {
		this.subTabIndex = -1;
		setTimeout(() => {
			this.subTabIndex = -1;
			this.tabPanelSecciones?.instance?.option('selectedIndex', -1);
		});
	}

	// Actualiza subTabIndex y oculta el aviso al elegir un tab valido.
	onSeccionTabSelectionChanged(e: any): void {
		const index = typeof e?.component?.option === 'function'
			? e.component.option('selectedIndex')
			: this.subTabIndex;
		if (typeof index === 'number' && index >= 0) {
			this.subTabIndex = index;
			this.ultimoTabSeccionValido = index;
			this.mostrarAvisoSeleccioneTab = false;
		}
	}

	// Cambia unidad y limpia puesto/reporta para forzar nueva seleccion coherente.
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

	// Asigna puesto, deriva reporta/responsable y valida descriptor abierto.
	onPuestoChanged(value: number | null): void {
		const corrPuesto = value != null ? Number(value) : null;
		this.model.CORR_PUESTO = corrPuesto;
		if (corrPuesto != null && corrPuesto > 0) {
			this.puestoInvalido = false;
		}
		this.aplicarDatosPuestoSeleccionado(corrPuesto, true);
		this.validarDescriptorAbiertoPorPuesto(corrPuesto);
	}

	// En creación valida que el puesto no tenga otro descriptor en un estado que bloquee nuevas versiones.
	// La secuencia evita que una respuesta tardía revierta una selección posterior.
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

	// Actualiza el puesto al que reporta y limpia marca de invalidez.
	onPuestoReportaChanged(value: number | null): void {
		this.model.CORR_PUESTO_REPORTA = value;
		if (value != null && value > 0) {
			this.puestoReportaInvalido = false;
		}
	}

	// Reacciona a cambios del form de encabezado (p.ej. FORMATO) sin loops de sync.
	onHeaderFieldChanged(e: any): void {
		if (this.sincronizandoHeader) {
			return;
		}

		if (e?.dataField === 'FORMATO') {
			this.onFormatoChanged(e.value, e.previousValue);
		}
	}

	// Placeholder del boton crear puesto hasta integrar PLA_PUESTO.
	crearPuestoProximamente(): void {
		this.notifyFx('El mantenimiento de puestos (PLA_PUESTO) estara disponible proximamente.', NotifyType.Warning);
	}

	// Punto de entrada del guardado principal: bloquea detalles aún en edición, sincroniza el formulario
	// con el modelo y ejecuta validaciones visuales y reglas de negocio.
	guardar(): void {
		const detallesEnEdicion = this.obtenerDetallesEnEdicion();
		if (detallesEnEdicion.length > 0) {
			this.notifyFx(
				this.crearMensajeEdicionesPendientes(detallesEnEdicion, 'guardar el descriptor'),
				NotifyType.Warning
			);
			return;
		}

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

	// Lista nombres de secciones con edicion activa para bloquear guardar/cambio de formato.
	private obtenerDetallesEnEdicion(): string[] {
		const detalles: Array<{ editando: boolean; nombre: string; tabIndex: number }> = [
			{ editando: this.funcionesClaveEditando, nombre: 'Funciones clave', tabIndex: 1 },
			{ editando: this.funcionesSecundariasEditando, nombre: 'Funciones secundarias', tabIndex: 2 },
			{ editando: this.kpisEditando, nombre: 'Indicadores KPI', tabIndex: 3 },
			{ editando: this.educacionEditando, nombre: 'Educacion', tabIndex: 4 },
			{ editando: this.experienciaEditando, nombre: 'Experiencia', tabIndex: 4 },
			{ editando: this.competenciasTecnicasEditando, nombre: 'Competencias tecnicas', tabIndex: 5 },
			{ editando: this.competenciasConductualesEditando, nombre: 'Competencias conductuales', tabIndex: 5 },
			{ editando: this.relacionesInternasEditando, nombre: 'Relaciones internas', tabIndex: 6 },
			{ editando: this.relacionesExternasEditando, nombre: 'Relaciones externas', tabIndex: 6 },
			{ editando: this.requerimientosOrganizacionalesEditando, nombre: 'Requerimientos organizacionales', tabIndex: 7 },
			{ editando: this.riesgosPuestoEditando, nombre: 'Riesgos del puesto', tabIndex: 8 },
			{ editando: this.responsabilidadesCargoEditando, nombre: 'Responsabilidades del cargo', tabIndex: 9 },
			{ editando: this.actividadesEditando, nombre: 'Actividades', tabIndex: 1 },
			{ editando: this.perfilEditando, nombre: 'Perfil', tabIndex: 4 },
			{ editando: this.entrenamientoEditando, nombre: 'Entrenamiento', tabIndex: 10 },
		];

		const pendientes = detalles.filter((detalle) => detalle.editando);
		const tabActual = pendientes.filter((detalle) => detalle.tabIndex === this.subTabIndex);
		const otrosTabs = pendientes.filter((detalle) => detalle.tabIndex !== this.subTabIndex);
		return [...tabActual, ...otrosTabs].map((detalle) => detalle.nombre);
	}

	// Arma el warning que lista detalles en edicion antes de una accion.
	private crearMensajeEdicionesPendientes(detallesEnEdicion: string[], accion: string): string {
		const detalleActual = detallesEnEdicion[0];
		const detallesAdicionales = detallesEnEdicion.slice(1);
		const mensajeAdicional = detallesAdicionales.length > 0
			? ` Tambien hay ediciones pendientes en: ${detallesAdicionales.join(', ')}.`
			: '';
		return `Guarde o cancele la linea en edicion de ${detalleActual} antes de ${accion}.${mensajeAdicional}`;
	}

	// Ejecuta el alta o actualización del descriptor y centraliza la restauración de la vista tras la respuesta.
	private guardarMttoDescriptor(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		const isAdd = this.banderaMtto === UpdateType.Add;
		const conservarAvisoSeleccioneTab = this.mostrarAvisoSeleccioneTab;
		const action = isAdd ? this.service.insert(this.model) : this.service.update(this.model);

		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response?.Result) {
					const descriptor = this.fillData(response.Data as ScDescriptorPuesto);
					descriptor.NOMBRE_UNIDAD =
						descriptor.NOMBRE_UNIDAD || this.getNombreUnidad(descriptor.CORR_UNIDAD);
					descriptor.NOMBRE_PUESTO =
						descriptor.NOMBRE_PUESTO || this.getNombrePuesto(descriptor.CORR_PUESTO);

					this.model = descriptor;
					this.modelUpdate = this.fillData(descriptor);
					this.aplicarRegistroEnGrid(descriptor, isAdd);
					this.limpiarEstadoValidacionHeader();
					this.readOnly = false;
					this.AsignaStatus(UpdateType.Update);
					this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
					this.cargarDatosTabs();
					setTimeout(() => {
						this.syncHeaderForm();
						if (conservarAvisoSeleccioneTab) {
							this.dejarSinTabSeccionSeleccionado();
							this.mostrarAvisoSeleccioneTab = true;
						}
					});

					this.notifyFx(
						isAdd ? 'Registro creado con exito!' : 'Registro modificado con exito!',
						NotifyType.Success,
						{ raw: true }
					);

					const seedMessage = (response?.ErrorMessage ?? '').trim();
					if (seedMessage) {
						this.notifyDescriptorWarning(seedMessage);
					}
				} else if (response) {
					this.notificarRespuestaOperacion(response, 'guardar');
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				this.notificarErrorOperacion(error, 'guardar');
				this.loadingVisible = false;
			},
		});
	}

	override cancelar(): void {
		this.limpiarEstadoValidacionHeader();
		super.cancelar((item: any) => item.CORR_DESCRIPTOR_PUESTO === this.modelUpdate.CORR_DESCRIPTOR_PUESTO);
	}

	// Quita marcas visuales de campos invalidos del encabezado.
	private limpiarEstadoValidacionHeader(): void {
		this.unidadInvalido = false;
		this.puestoInvalido = false;
		this.puestoReportaInvalido = false;
	}

	// Marca unidad/puesto/reporta invalidos segun reglas de validacion.
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
			record.NOMBRE_UNIDAD = record.NOMBRE_UNIDAD || this.getNombreUnidad(record.CORR_UNIDAD);
			record.NOMBRE_PUESTO = record.NOMBRE_PUESTO || this.getNombrePuesto(record.CORR_PUESTO);
			super.aplicarRegistroEnGrid(record, isAdd);
			return;
		}

		super.aplicarRegistroEnGrid(data, isAdd);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorOperacionEnRespuesta(
					this.service.delete(this.fillParam(e.data.CORR_DESCRIPTOR_PUESTO)),
					'eliminar',
					'No se pudo eliminar el descriptor porque contiene información relacionada.'
				),
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

	// Muestra advertencia de negocio del descriptor (NotifyType.Warning).
	private notifyDescriptorWarning(message: string): void {
		this.notifyFx(message, NotifyType.Warning, { raw: true });
	}

	// Extrae mensajes de distintos formatos de respuesta y permite distinguir advertencias de negocio
	// de errores técnicos al guardar o eliminar.
	private obtenerMensajeOperacion(value: any): string {
		if (typeof value === 'string') {
			return value.trim();
		}

		const nestedError = value?.error;
		if (typeof nestedError === 'string') {
			return nestedError.trim();
		}

		return `${
			value?.ErrorMessage ??
			nestedError?.ErrorMessage ??
			nestedError?.message ??
			value?.message ??
			''
		}`.trim();
	}

	// Unifica mensajes de API/errores para notificaciones al usuario.
	private normalizarMensajeOperacion(message: string): string {
		return `${message ?? ''}`
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	}

	// Detecta si la respuesta de API es advertencia (no error fatal) por codigo/mensaje.
	private esAdvertenciaOperacion(value: any, operacion: 'guardar' | 'eliminar'): boolean {
		const errorCode = Number(value?.ErrorCode ?? value?.error?.ErrorCode);
		const message = this.normalizarMensajeOperacion(this.obtenerMensajeOperacion(value));

		// 4100 empresa / 4101 vacio-maximo-seleccion: advertencia de negocio, no error tecnico.
		if (errorCode === 4100 || errorCode === 4101) {
			return true;
		}

		if (operacion === 'guardar') {
			return (
				errorCode === 2601 ||
				errorCode === 2627 ||
				message.includes('ya existe') ||
				message.includes('duplicad') ||
				message.includes('duplicate key') ||
				message.includes('primary key') ||
				message.includes('unique key') ||
				message.includes('unique constraint') ||
				message.includes('mismo tiempo') ||
				message.includes('same time') ||
				message.includes('concurren') ||
				message.includes('llave primaria') ||
				message.includes('clave primaria') ||
				message.includes('no puede superar') ||
				message.includes('debe indicar') ||
				message.includes('debe seleccionar') ||
				message.includes('debe ingresar') ||
				message.includes('debe guardar')
			);
		}

		return (
			errorCode === 547 ||
			message.includes('hijos') ||
			message.includes('child record') ||
			message.includes('foreign key') ||
			message.includes('fk_') ||
			message.includes('clave externa') ||
			message.includes('llave externa') ||
			message.includes('reference constraint') ||
			message.includes('restriccion de referencia') ||
			message.includes('asociados') ||
			message.includes('registros relacionados')
		);
	}

	// Notifica Result/ErrorMessage de API diferenciando advertencia vs error.
	private notificarRespuestaOperacion(response: any, operacion: 'guardar' | 'eliminar'): void {
		if (this.esAdvertenciaOperacion(response, operacion)) {
			this.notifyDescriptorWarning(
				this.obtenerMensajeOperacion(response) ||
					(operacion === 'guardar'
						? 'No se pudo guardar porque otro registro utiliza la misma llave.'
						: 'No se puede eliminar porque existen registros relacionados.')
			);
			return;
		}

		this.notifyApiResponse(response);
	}

	// Notifica errores HTTP/excepciones de operaciones del descriptor.
	private notificarErrorOperacion(error: any, operacion: 'guardar' | 'eliminar'): void {
		if (this.esAdvertenciaOperacion(error, operacion)) {
			this.notifyDescriptorWarning(
				this.obtenerMensajeOperacion(error) ||
					(operacion === 'guardar'
						? 'No se pudo guardar porque otro registro utiliza la misma llave.'
						: 'No se puede eliminar porque existen registros relacionados.')
			);
			return;
		}

		this.notifyApiError(error);
	}

	private convertirErrorOperacionEnRespuesta<T>(
		request: Observable<T>,
		operacion: 'guardar' | 'eliminar',
		contextMessage: string
	): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				if (this.esAdvertenciaOperacion(error, operacion)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: contextMessage,
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Helpers compartidos por los grids: invalidación, sincronización de columnas dinámicas,
	// finalización o cancelación de edición y manejo de llaves temporales.
	private invalidarFila(e: any, message: string): void {
		e.isValid = false;
		e.errorText = message;
		this.notifyDescriptorWarning(message);
	}

	private syncHeaderForm(): void {
		this.sincronizandoHeader = true;
		this.ultimoFormatoAplicado = (this.model?.FORMATO || FORMATO_CORTO).toUpperCase();
		this.mostrarAvisoSeleccioneTab = this.subTabIndex < 0;
		this.headerForm?.instance?.option('formData', this.model);
		setTimeout(() => {
			this.sincronizandoHeader = false;
		});
	}

	private resetearFuncionesTabsDirty(): void {
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

	// Devuelve CORR_DESCRIPTOR_PUESTO del modelo activo o 0 si aun no existe.
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

	private resetearEdicionEducacion(): void {
		this.educacionEditando = false;
	}

	private resetearEdicionExperiencia(): void {
		this.experienciaEditando = false;
	}

	private resetearEdicionCompetenciasTecnicas(): void {
		this.competenciasTecnicasEditando = false;
	}

	private resetearEdicionCompetenciasConductuales(): void {
		this.competenciasConductualesEditando = false;
	}

	private resetearEdicionRequerimientosOrganizacionales(): void {
		this.requerimientosOrganizacionalesEditando = false;
		this.requerimientosOrganizacionalesInsertando = false;
	}

	private resetearEdicionRiesgosPuesto(): void {
		this.riesgosPuestoEditando = false;
		this.riesgosPuestoInsertando = false;
	}

	private resetearEdicionResponsabilidadesCargo(): void {
		this.responsabilidadesCargoEditando = false;
		this.responsabilidadesCargoInsertando = false;
	}

	private syncRequerimientoOrganizacionalColumnas(): void {
		setTimeout(() => {
			this.gridRequerimientosOrganizacionales?.instance?.columnOption(
				'CORR_REQUERIMIENTO_ORGANIZACIONAL',
				'visible',
				this.requerimientosOrganizacionalesInsertando
			);
		});
	}

	private syncRiesgoPuestoColumnas(): void {
		setTimeout(() => {
			this.gridRiesgosPuesto?.instance?.columnOption(
				'CORR_RIESGO_PUESTO',
				'visible',
				this.riesgosPuestoInsertando
			);
		});
	}

	private syncResponsabilidadCargoColumnas(): void {
		setTimeout(() => {
			this.gridResponsabilidadesCargo?.instance?.columnOption(
				'CORR_RESPONSABILIDAD',
				'visible',
				this.responsabilidadesCargoInsertando
			);
		});
	}

	private resetearEdicionRelacionesInternas(): void {
		this.relacionesInternasEditando = false;
	}

	private resetearEdicionRelacionesExternas(): void {
		this.relacionesExternasEditando = false;
	}

	/** Visibilidad Options: usa editRowKey (no e.row.isEditing, que puede quedar pegado tras Cancelar). */
	private accionGridVisible(e: any): boolean {
		if (this.readOnly) {
			return false;
		}
		const editKey = e?.component?.option?.('editing.editRowKey');
		if (editKey == null) {
			return true;
		}
		return e?.row?.key !== editKey;
	}

	/** Tras Guardar/Cancelar: limpia flag y repinta para que vuelvan los iconos Options. */
	private finalizarEdicionGrid(e: any, clearFlag: () => void): void {
		clearFlag();
		const grid = e?.component;
		const rowIndex = typeof e?.row?.rowIndex === 'number' ? e.row.rowIndex : null;
		setTimeout(() => {
			if (!grid) {
				return;
			}
			if (rowIndex != null && rowIndex >= 0 && typeof grid.repaintRows === 'function') {
				grid.repaintRows([rowIndex]);
				return;
			}
			grid.repaint?.();
		});
	}

	// Cancela edicion DevExtreme del grid y ejecuta el reset de flags locales.
	private cancelarEdicionGrid(grid: any, clearFlag: () => void): void {
		if (!grid) {
			clearFlag();
			return;
		}
		try {
			const editKey = grid.option?.('editing.editRowKey');
			if (grid.hasEditData?.() || editKey != null) {
				grid.cancelEditData();
			} else {
				grid.repaint?.();
			}
		} catch {
			// Si el grid ya se desmontó, igual liberamos el flag de edicion.
		}
		clearFlag();
	}

	// Genera llave temporal de fila (_clientKey) para filas nuevas aun sin correlativo de BD.
	private crearClientKey(prefix: string): string {
		return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
	}

	// Las persistencias de detalle convierten eventos cancelables de DevExtreme en promesas booleanas
	// y actualizan la colección local solo después de una respuesta satisfactoria.
	private persistirActividadDesdeGrid(data: ScDescriptorFuncionActividad, esNuevo: boolean): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const funcion = this.funcionActividadesSeleccionada;
		if (!funcion?.CORR_FUNCION || funcion.CORR_FUNCION <= 0) {
			this.notifyFx('Debe guardar la funcion clave antes de registrar actividades.', NotifyType.Warning);
			return Promise.resolve(true);
		}

		const payload: ScDescriptorFuncionActividad = {
			...data,
			CORR_FUNCION: funcion.CORR_FUNCION,
			CORR_ACTIVIDAD: esNuevo ? 0 : Number(data.CORR_ACTIVIDAD) || 0,
			NOMBRE_ACTIVIDAD: (data.NOMBRE_ACTIVIDAD ?? '').trim(),
		};

		return new Promise((resolve) => {
			this.service
				.persistirActividad(corrDescriptor, funcion.CORR_FUNCION, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}
						this.actividadesEditando = false;
						this.cargarActividadesPopup(funcion);
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarActividadDesdeGrid(data: ScDescriptorFuncionActividad): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const funcion = this.funcionActividadesSeleccionada;
		const corrActividad = Number(data?.CORR_ACTIVIDAD);
		if (!funcion?.CORR_FUNCION || !corrActividad || corrActividad <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarActividad(corrDescriptor, funcion.CORR_FUNCION, corrActividad)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						setTimeout(() => this.actualizarContadorActividades(funcion));
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Garantiza que el perfil padre esté persistido antes de operar sobre cualquiera de sus detalles.
	private asegurarPerfilParaDetalle(onReady: () => void): void {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (corrPerfil > 0 && this.perfilExiste) {
			onReady();
			return;
		}

		this.service
			.persistirPerfil(corrDescriptor, this.perfil, this.perfilExiste)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result) {
						this.notificarRespuestaOperacion(response, 'guardar');
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

					if (!(Number(this.perfil.CORR_PERFIL_PUESTO) > 0)) {
						this.notifyFx('No se pudo preparar el perfil.', NotifyType.Warning);
						return;
					}

					onReady();
				},
				error: (error) => this.notificarErrorOperacion(error, 'guardar'),
			});
	}

	// Las persistencias de Perfil conservan las llaves devueltas por la API y restauran los catálogos
	// disponibles tras crear, actualizar o eliminar sus detalles.
	private persistirEducacionDesdeGrid(data: ScPerfilPuestoEducacion, esNuevo: boolean): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrPerfil || corrPerfil <= 0) {
			this.notifyFx('Debe guardar el perfil antes de registrar educacion.', NotifyType.Warning);
			return Promise.resolve(true);
		}

		const payload: ScPerfilPuestoEducacion = {
			...data,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_EDUCACION: esNuevo ? 0 : Number(data.CORR_EDUCACION) || 0,
			REQUISITO: (data.REQUISITO ?? '').trim(),
			ESPECIFICACIONES: (data.ESPECIFICACIONES ?? '').trim(),
			TIPO_REQUERIDO: (data.TIPO_REQUERIDO ?? 'SI').trim().toUpperCase(),
		};

		return new Promise((resolve) => {
			this.service
				.persistirEducacion(corrDescriptor, corrPerfil, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}
						this.educacionEditando = false;
						this.cargarEducacion(true);
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarEducacionDesdeGrid(data: ScPerfilPuestoEducacion): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO) || Number(data?.CORR_PERFIL_PUESTO);
		const corrEducacion = Number(data?.CORR_EDUCACION);
		if (!corrPerfil || corrPerfil <= 0 || !corrEducacion || corrEducacion <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarEducacion(corrDescriptor, corrPerfil, corrEducacion)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Inserta o actualiza experiencia desde eventos del grid via el servicio.
	private persistirExperienciaDesdeGrid(data: ScPerfilPuestoExperiencia, esNuevo: boolean): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrPerfil || corrPerfil <= 0) {
			this.notifyFx('Debe guardar el perfil antes de registrar experiencia.', NotifyType.Warning);
			return Promise.resolve(true);
		}

		const payload: ScPerfilPuestoExperiencia = {
			...data,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_EXPERIENCIA: esNuevo ? 0 : Number(data.CORR_EXPERIENCIA) || 0,
			REQUISITO: (data.REQUISITO ?? '').trim(),
			TIPO_REQUERIDO: (data.TIPO_REQUERIDO ?? 'SI').trim().toUpperCase(),
		};

		return new Promise((resolve) => {
			this.service
				.persistirExperiencia(corrDescriptor, corrPerfil, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}
						this.experienciaEditando = false;
						this.cargarExperiencia(true);
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarExperienciaDesdeGrid(data: ScPerfilPuestoExperiencia): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO) || Number(data?.CORR_PERFIL_PUESTO);
		const corrExperiencia = Number(data?.CORR_EXPERIENCIA);
		if (!corrPerfil || corrPerfil <= 0 || !corrExperiencia || corrExperiencia <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarExperiencia(corrDescriptor, corrPerfil, corrExperiencia)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Persiste competencia tecnica y refresca lookup para evitar duplicados.
	private persistirCompetenciaTecnicaDesdeGrid(
		data: ScPerfilPuestoCompetenciasTecnicas,
		esNuevo: boolean
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrPerfil || corrPerfil <= 0) {
			this.notifyFx(
				'Debe guardar el perfil antes de registrar competencias tecnicas.',
				NotifyType.Warning
			);
			return Promise.resolve(true);
		}

		const payload: ScPerfilPuestoCompetenciasTecnicas = {
			...data,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS: esNuevo
				? 0
				: Number(data.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS) || 0,
			CORR_COMPETENCIAS_TECNICAS: Number(data.CORR_COMPETENCIAS_TECNICAS) || null,
			NOMBRE_COMPETENCIAS_TECNICAS: (data.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim(),
			DESCRIPCION: (data.DESCRIPCION ?? '').trim(),
			NIVEL_DOMINIO: (data.NIVEL_DOMINIO ?? 'BASICO').trim().toUpperCase(),
		};

		return new Promise((resolve) => {
			this.service
				.persistirCompetenciaTecnica(corrDescriptor, corrPerfil, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}
						this.competenciasTecnicasEditando = false;
						this.cargarCompetenciasTecnicas(true);
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarCompetenciaTecnicaDesdeGrid(
		data: ScPerfilPuestoCompetenciasTecnicas
	): Promise<boolean> {
		const corr = Number(data?.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS);
		if (!corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarCompetenciaTecnica(corr)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Persiste competencia conductual y refresca lookup disponible.
	private persistirCompetenciaConductualDesdeGrid(
		data: ScPerfilPuestoCompetenciasConductuales,
		esNuevo: boolean
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		if (!corrPerfil || corrPerfil <= 0) {
			this.notifyFx(
				'Debe guardar el perfil antes de registrar competencias conductuales.',
				NotifyType.Warning
			);
			return Promise.resolve(true);
		}

		const payload: ScPerfilPuestoCompetenciasConductuales = {
			...data,
			CORR_PERFIL_PUESTO: corrPerfil,
			CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES: esNuevo
				? 0
				: Number(data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES) || 0,
			CORR_COMPETENCIAS_CONDUCTUALES: Number(data.CORR_COMPETENCIAS_CONDUCTUALES) || null,
			NOMBRE_COMPETENCIAS_CONDUCTUALES: (data.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim(),
			DESCRIPCION: this.esFormatoExtenso ? (data.DESCRIPCION ?? '').trim() : '',
		};

		return new Promise((resolve) => {
			this.service
				.persistirCompetenciaConductual(corrDescriptor, corrPerfil, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}
						this.competenciasConductualesEditando = false;
						this.cargarCompetenciasConductuales(true);
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarCompetenciaConductualDesdeGrid(
		data: ScPerfilPuestoCompetenciasConductuales
	): Promise<boolean> {
		const corr = Number(data?.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES);
		if (!corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarCompetenciaConductual(corr)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Las persistencias de catálogos del descriptor mantienen filas y lookups sincronizados,
	// incluida la fila especial de impacto económico.
	private persistirRequerimientoOrganizacionalDesdeGrid(
		data: ScDescriptorPuestoRequerimientoOrganizacional,
		esNuevo: boolean
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.notifyFx(
				'Debe guardar el descriptor antes de registrar requerimientos organizacionales.',
				NotifyType.Warning
			);
			return Promise.resolve(true);
		}

		const payload: ScDescriptorPuestoRequerimientoOrganizacional = {
			...data,
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL: esNuevo
				? 0
				: Number(data.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL) || 0,
			CORR_REQUERIMIENTO_ORGANIZACIONAL: Number(data.CORR_REQUERIMIENTO_ORGANIZACIONAL) || null,
			DESCRIPCION: (data.DESCRIPCION ?? '').trim(),
		};

		return new Promise((resolve) => {
			this.service
				.persistirRequerimientoOrganizacional(corrDescriptor, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}
						this.requerimientosOrganizacionalesEditando = false;
						this.cargarRequerimientosOrganizacionales(true);
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarRequerimientoOrganizacionalDesdeGrid(
		data: ScDescriptorPuestoRequerimientoOrganizacional
	): Promise<boolean> {
		const corr = Number(data?.CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL);
		if (!corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarRequerimientoOrganizacional(corr)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Persiste riesgo del puesto; evita dobles posts con flag de persistiendo.
	private persistirRiesgoPuestoDesdeGrid(
		data: ScDescriptorPuestoRiesgoPuesto,
		esNuevo: boolean
	): Promise<boolean> {
		if (this.riesgoPuestoPersistiendo) {
			return Promise.resolve(true);
		}

		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.notifyFx(
				'Debe guardar el descriptor antes de registrar riesgos del puesto.',
				NotifyType.Warning
			);
			return Promise.resolve(true);
		}

		const payload: ScDescriptorPuestoRiesgoPuesto = {
			...data,
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_DESCRIPTOR_RIESGO: esNuevo ? 0 : Number(data.CORR_DESCRIPTOR_RIESGO) || 0,
			CORR_RIESGO_PUESTO: Number(data.CORR_RIESGO_PUESTO) || null,
			NOMBRE_RIESGO_PUESTO: (data.NOMBRE_RIESGO_PUESTO ?? '').trim(),
			INFORMACION: (data.INFORMACION ?? '').trim(),
		};

		this.riesgoPuestoPersistiendo = true;

		return new Promise((resolve) => {
			this.service
				.persistirRiesgoPuesto(corrDescriptor, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						this.riesgoPuestoPersistiendo = false;
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}

						this.riesgosPuestoEditando = false;
						try {
							this.gridRiesgosPuesto?.instance?.cancelEditData?.();
						} catch {
							// El grid puede haberse desmontado.
						}
						this.cargarRiesgosPuesto(true);
						resolve(true);
					},
					error: (error) => {
						this.riesgoPuestoPersistiendo = false;
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarRiesgoPuestoDesdeGrid(data: ScDescriptorPuestoRiesgoPuesto): Promise<boolean> {
		const corr = Number(data?.CORR_DESCRIPTOR_RIESGO);
		if (!corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarRiesgoPuesto(corr)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						this.cargarRiesgosPuesto(true);
						resolve(true);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Persiste responsabilidad de catalogo (no la fila virtual de impacto).
	private persistirResponsabilidadCargoDesdeGrid(
		data: ScDescriptorPuestoResponsabilidadCargo,
		esNuevo: boolean
	): Promise<boolean> {
		if (data?._esImpactoEconomico) {
			return Promise.resolve(true);
		}

		if (this.responsabilidadCargoPersistiendo) {
			return Promise.resolve(true);
		}

		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.notifyFx(
				'Debe guardar el descriptor antes de registrar responsabilidades del cargo.',
				NotifyType.Warning
			);
			return Promise.resolve(true);
		}

		const payload: ScDescriptorPuestoResponsabilidadCargo = {
			...data,
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_DESCRIPTOR_RESPONSABILIDAD: esNuevo ? 0 : Number(data.CORR_DESCRIPTOR_RESPONSABILIDAD) || 0,
			CORR_RESPONSABILIDAD: Number(data.CORR_RESPONSABILIDAD) || null,
			NOMBRE_RESPONSABILIDAD: (data.NOMBRE_RESPONSABILIDAD ?? '').trim(),
			INFORMACION: (data.INFORMACION ?? '').trim(),
		};

		this.responsabilidadCargoPersistiendo = true;

		return new Promise((resolve) => {
			this.service
				.persistirResponsabilidadCargo(corrDescriptor, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						this.responsabilidadCargoPersistiendo = false;
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}

						this.responsabilidadesCargoEditando = false;
						try {
							this.gridResponsabilidadesCargo?.instance?.cancelEditData?.();
						} catch {
							// El grid puede haberse desmontado.
						}
						this.cargarResponsabilidadesCargo(true);
						resolve(true);
					},
					error: (error) => {
						this.responsabilidadCargoPersistiendo = false;
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarResponsabilidadCargoDesdeGrid(
		data: ScDescriptorPuestoResponsabilidadCargo
	): Promise<boolean> {
		if (data?._esImpactoEconomico) {
			return Promise.resolve(true);
		}

		const corr = Number(data?.CORR_DESCRIPTOR_RESPONSABILIDAD);
		if (!corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarResponsabilidadCargo(corr)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						this.cargarResponsabilidadesCargo(true);
						resolve(true);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Persiste CORR_IMPACTO_ECONOMICO en el descriptor desde la fila virtual.
	private persistirImpactoEconomicoDesdeGrid(
		data: ScDescriptorPuestoResponsabilidadCargo
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.notifyFx(
				'Debe guardar el descriptor antes de registrar el impacto economico.',
				NotifyType.Warning
			);
			return Promise.resolve(true);
		}

		const corrAnterior = this.model.CORR_IMPACTO_ECONOMICO;
		const descripcionAnterior = this.model.DESCRIPCION_IMPACTO_ECONOMICO;
		const corrImpacto = Number(data?.CORR_IMPACTO_ECONOMICO);
		this.model.CORR_IMPACTO_ECONOMICO = corrImpacto > 0 ? corrImpacto : null;
		this.model.DESCRIPCION_IMPACTO_ECONOMICO = (data?.INFORMACION ?? '').trim();

		return new Promise((resolve) => {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.model.CORR_IMPACTO_ECONOMICO = corrAnterior;
							this.model.DESCRIPCION_IMPACTO_ECONOMICO = descripcionAnterior;
							this.notificarRespuestaOperacion(response, 'guardar');
							this.cargarResponsabilidadesCargo(true);
							resolve(true);
							return;
						}

						if (response.Data) {
							this.model = this.fillData(response.Data);
							this.modelUpdate = this.fillData(response.Data);
						}

						this.responsabilidadesCargoEditando = false;
						try {
							this.gridResponsabilidadesCargo?.instance?.cancelEditData?.();
						} catch {
							// El grid puede haberse desmontado.
						}
						this.cargarResponsabilidadesCargo(true);
						resolve(true);
					},
					error: (error) => {
						this.model.CORR_IMPACTO_ECONOMICO = corrAnterior;
						this.model.DESCRIPCION_IMPACTO_ECONOMICO = descripcionAnterior;
						this.notificarErrorOperacion(error, 'guardar');
						this.cargarResponsabilidadesCargo(true);
						resolve(true);
					},
				});
		});
	}

	// Funciones, relaciones y KPI comparten el contrato de cancelación del grid, pero construyen payloads
	// distintos y refrescan únicamente la sección afectada.
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
							this.notificarRespuestaOperacion(response, 'guardar');
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
						this.notificarErrorOperacion(error, 'guardar');
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
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Persiste relacion interna/externa segun TIPO_RELACION de la fila.
	private persistirRelacionDesdeGrid(
		data: ScDescriptorRelacionLaboral,
		tipoRelacion: string,
		esNuevo: boolean
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const payload: ScDescriptorRelacionLaboral = {
			...data,
			CORR_RELACION_LABORAL: esNuevo ? 0 : Number(data.CORR_RELACION_LABORAL) || 0,
			TIPO_RELACION: tipoRelacion,
			PUESTO_AREA: (data.PUESTO_AREA ?? '').trim(),
			MOTIVO_RELACION: (data.MOTIVO_RELACION ?? '').trim(),
		};

		return new Promise((resolve) => {
			this.service
				.persistirRelacionLaboral(corrDescriptor, payload, tipoRelacion)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}

						if (tipoRelacion === TIPO_RELACION_INTERNA) {
							this.relacionesInternasEditando = false;
							this.cargarRelacionesInternas(true);
						} else {
							this.relacionesExternasEditando = false;
							this.cargarRelacionesExternas(true);
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	private eliminarRelacionDesdeGrid(data: ScDescriptorRelacionLaboral): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrRelacion = Number(data?.CORR_RELACION_LABORAL);
		if (!corrRelacion || corrRelacion <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarRelacionLaboral(corrDescriptor, corrRelacion)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Persiste KPI del formato corto desde el grid.
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
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}
						this.kpisEditando = false;
						this.cargarKpis(true);
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'guardar');
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
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						resolve(false);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Filtra puestos por unidad y copia al encabezado los datos derivados del puesto seleccionado.
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

	// Copia reporta/responsable del puesto seleccionado al modelo del encabezado.
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
