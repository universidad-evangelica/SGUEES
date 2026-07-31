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

import { ScDescriptorPuestoFuncionActividad } from './sc-descriptor-puesto-funcion-actividad/models/sc-descriptor-puesto-funcion-actividad';
import { ScDescriptorPuestoFuncion } from './sc-descriptor-puesto-funcion/models/sc-descriptor-puesto-funcion';
import { ScDescriptorPuestoRelacionLaboral } from './sc-descriptor-puesto-relacion-laboral/models/sc-descriptor-puesto-relacion-laboral';
import {
	ScDescriptorPuestoKpiFuncion,
	ScFrecuenciaLookup,
} from './sc-descriptor-puesto-kpi-funcion/models/sc-descriptor-puesto-kpi-funcion';
import {
	ScPerfilPuesto,
	ScDisponibilidadHorarioLookup,
	ScTipoModalidadLookup,
} from './sc-perfil-puesto/models/sc-perfil-puesto';
import { ScPerfilPuestoEducacion } from './sc-perfil-puesto-educacion/models/sc-perfil-puesto-educacion';
import { ScPerfilPuestoExperiencia } from './sc-perfil-puesto-experiencia/models/sc-perfil-puesto-experiencia';
import { ScPerfilPuestoCompetenciasTecnicas } from './sc-perfil-puesto-competencias-tecnicas/models/sc-perfil-puesto-competencias-tecnicas';
import { ScPerfilPuestoCompetenciasConductuales } from './sc-perfil-puesto-competencias-conductuales/models/sc-perfil-puesto-competencias-conductuales';
import { ScDescriptorPuestoRequerimientoOrganizacional } from './sc-descriptor-puesto-requerimiento-organizacional/models/sc-descriptor-puesto-requerimiento-organizacional';
import { ScDescriptorPuestoRiesgoPuesto } from './sc-descriptor-puesto-riesgo-puesto/models/sc-descriptor-puesto-riesgo-puesto';
import { ScDescriptorPuestoInduccion } from './sc-descriptor-puesto-induccion/models/sc-descriptor-puesto-induccion';
import {
	IMPACTO_ECONOMICO_CLIENT_KEY,
	IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR,
	ScDescriptorPuestoResponsabilidadCargo,
} from './sc-descriptor-puesto-responsabilidad-cargo/models/sc-descriptor-puesto-responsabilidad-cargo';
import {
	FORMATO_AMBOS,
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
// Pantalla para crear y editar descriptores de puesto: encabezado y secciones según el formato.
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
	@ViewChild('gridInducciones', { static: false }) gridInducciones?: DxDataGridComponent;
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
	// Al editar un KPI: frecuencias activas del catálogo más la ya guardada en la fila (aunque esté inactiva).
	mCORR_FRECUENCIA_KPI_EDIT: ScFrecuenciaLookup[] = [];
	frecuenciasKpiLookupColumns = [
		{ dataField: 'CORR_FRECUENCIA', caption: 'Codigo', width: 90 },
		{ dataField: 'NOMBRE_FRECUENCIA_CATALOGO', caption: 'Frecuencia', width: 280 },
	];
	mCORR_DISPONIBILIDAD_HORARIO: ScDisponibilidadHorarioLookup[] = [];
	// Al editar el perfil: disponibilidades activas más la ya asociada (aunque esté inactiva).
	mCORR_DISPONIBILIDAD_HORARIO_EDIT: ScDisponibilidadHorarioLookup[] = [];
	disponibilidadHorarioLookupColumns = [
		{ dataField: 'CORR_DISPONIBILIDAD_HORARIO', caption: 'Codigo', width: 90 },
		{ dataField: 'NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO', caption: 'Disponibilidad', width: 280 },
	];
	mCORR_TIPO_MODALIDAD: ScTipoModalidadLookup[] = [];
	mCORR_TIPO_MODALIDAD_EDIT: ScTipoModalidadLookup[] = [];
	tipoModalidadLookupColumns = [
		{ dataField: 'CORR_TIPO_MODALIDAD', caption: 'Codigo', width: 90 },
		{ dataField: 'MODALIDAD_NOMBRE_CATALOGO', caption: 'Modalidad', width: 280 },
	];
	mCORR_INDUCCION: ScInduccionLookupItem[] = [];
	mCORR_INDUCCION_DISPONIBLES: ScInduccionLookupItem[] = [];
	induccionesLookupColumns = [
		{ dataField: 'CORR_INDUCCION', caption: 'Codigo', width: 90 },
		{ dataField: 'NOMBRE_INDUCCION_CATALOGO', caption: 'Induccion', width: 280 },
		{ dataField: 'DURACION_DISPLAY', caption: 'Duracion', width: 120 },
	];
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
	// Al editar impacto económico: activos del catálogo más el ya guardado; DESCRIPCION puede ser el valor cerrado del descriptor.
	mCORR_IMPACTO_ECONOMICO_EDIT: ScImpactoEconomicoLookupItem[] = [];
	impactosEconomicosLookupColumns = [
		{ dataField: 'CORR_IMPACTO_ECONOMICO', caption: 'Codigo', width: 90 },
		{ dataField: 'DESCRIPCION_CATALOGO', caption: 'Impacto economico', width: 360 },
	];
	reportaLookupColumns = [
		{ dataField: 'RESPONSABLE', caption: 'Nombre', width: 220 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 260 },
	];
	competenciasTecnicasLookupColumns = [
		/*
		{ dataField: 'GRUPO_NIV1', caption: 'Grupo NIV1', width: 180 },
		{ dataField: 'GRUPO_NIV2', caption: 'Grupo NIV2', width: 180 },*/
		{ dataField: 'CODIGO_COMPETENCIAS_TECNICAS_CATALOGO', caption: 'Codigo', width: 120 }, // Código del nivel 3 del catálogo
		//{ dataField: 'NIVEL', caption: 'Nivel', width: 80 },
		{ dataField: 'NOMBRE_COMPETENCIAS_TECNICAS', caption: 'Competencia Técnica', width: 220 }, // Nombre de la competencia (nivel 3)
		//{ dataField: 'DESCRIPCION', caption: 'Definicion', width: 260 },
	];
	competenciasConductualesLookupColumns = [
		//{ dataField: 'CORR_COMPETENCIAS_CONDUCTUALES', caption: 'Corr.', width: 90 },
		{ dataField: 'CODIGO_TIPO_PUESTO_CATALOGO', caption: 'Codigo', width: 140 }, // Código de tipo de puesto o grupo ocupacional
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

	funcionesClave: ScDescriptorPuestoFuncion[] = [];
	funcionesSecundarias: ScDescriptorPuestoFuncion[] = [];
	kpis: ScDescriptorPuestoKpiFuncion[] = [];
	educaciones: ScPerfilPuestoEducacion[] = [];
	experiencias: ScPerfilPuestoExperiencia[] = [];
	competenciasTecnicas: ScPerfilPuestoCompetenciasTecnicas[] = [];
	competenciasConductuales: ScPerfilPuestoCompetenciasConductuales[] = [];
	requerimientosOrganizacionales: ScDescriptorPuestoRequerimientoOrganizacional[] = [];
	riesgosPuesto: ScDescriptorPuestoRiesgoPuesto[] = [];
	induccionesDescriptor: ScDescriptorPuestoInduccion[] = [];
	responsabilidadesCargo: ScDescriptorPuestoResponsabilidadCargo[] = [];
	relacionesInternas: ScDescriptorPuestoRelacionLaboral[] = [];
	relacionesExternas: ScDescriptorPuestoRelacionLaboral[] = [];
	funcionesClaveEditando = false;
	funcionesSecundariasEditando = false;
	kpisEditando = false;
	educacionEditando = false;
	experienciaEditando = false;
	competenciasTecnicasEditando = false;
	competenciasTecnicasInsertando = false;
	competenciasConductualesEditando = false;
	competenciasConductualesInsertando = false;
	requerimientosOrganizacionalesEditando = false;
	requerimientosOrganizacionalesInsertando = false;
	riesgosPuestoEditando = false;
	riesgosPuestoInsertando = false;
	private riesgoPuestoPersistiendo = false;
	induccionesEditando = false;
	induccionesInsertando = false;
	private induccionPersistiendo = false;
	responsabilidadesCargoEditando = false;
	responsabilidadesCargoInsertando = false;
	private responsabilidadCargoPersistiendo = false;
	actividadesEditando = false;
	relacionesInternasEditando = false;
	relacionesExternasEditando = false;
	perfil: ScPerfilPuesto = { ...PERFIL_PUESTO_DEFAULT };
	perfilEditando = false;
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
	funcionActividadesSeleccionada: ScDescriptorPuestoFuncion | null = null;
	actividadesPopup: ScDescriptorPuestoFuncionActividad[] = [];

	private funcionesClaveLoadSeq = 0;
	private funcionesSecundariasLoadSeq = 0;
	private kpisLoadSeq = 0;
	private educacionLoadSeq = 0;
	private experienciaLoadSeq = 0;
	private competenciasTecnicasLoadSeq = 0;
	private competenciasConductualesLoadSeq = 0;
	private requerimientosOrganizacionalesLoadSeq = 0;
	private riesgosPuestoLoadSeq = 0;
	private induccionesLoadSeq = 0;
	private responsabilidadesCargoLoadSeq = 0;
	private relacionesInternasLoadSeq = 0;
	private relacionesExternasLoadSeq = 0;
	private perfilLoadSeq = 0;
	private perfilExiste = false;
	private perfilOriginal: ScPerfilPuesto = { ...PERFIL_PUESTO_DEFAULT };
	private sincronizandoHeader = false;
	// Evita procesar dos veces el mismo cambio de puesto: app-data-lookup emite valueChange
	// en selectionChanged y otra vez en onValueChanged del DropDownBox.
	private omitirProximoCambioPuesto = false;
	private ultimoFormatoAplicado: string | null = null;
	private ultimoTabSeccionValido = 0;
	mostrarAvisoSeleccioneTab = false;
	readonly actividadesPopupWrapperAttr = { class: 'descriptor-actividades-popup-wrapper' };
	private actividadesPopupMediaQuery?: MediaQueryList;
	// Qué hace: mantiene el popup de actividades a pantalla completa acorde al tamaño de la ventana.
	// Cómo: se ejecuta cuando cambia el media query registrado y copia su resultado (matches) a actividadesPopupFullScreen.
	private readonly onActividadesPopupMediaChange = (event: MediaQueryListEvent): void => {
		this.actividadesPopupFullScreen = event.matches;
	};

	private readonly maintenanceSubtitulo = 'Descriptor de Puesto';

	// Recibe servicios en el constructor y deja listas columnas, resumen y campos del encabezado.
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
		this.induccionEditButtonVisible = this.induccionEditButtonVisible.bind(this);
		this.induccionDeleteButtonVisible = this.induccionDeleteButtonVisible.bind(this);
		this.editarInduccionClick = this.editarInduccionClick.bind(this);
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

	// Qué hace: expone al framework base la referencia del grid principal de mantenimiento.
	// Cómo: devuelve la instancia de dataGrid enlazada con @ViewChild, o null si aún no está disponible.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Al abrir la vista: carga combos, consulta el listado y configura el popup de actividades.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.consultar();
		this.configurarActividadesPopupResponsive();
	}

	// Al salir de la vista: quita el listener que ajusta el popup de actividades.
	ngOnDestroy(): void {
		this.actividadesPopupMediaQuery?.removeEventListener('change', this.onActividadesPopupMediaChange);
	}

	// En pantallas pequeñas abre el popup de actividades a pantalla completa.
	private configurarActividadesPopupResponsive(): void {
		if (typeof window === 'undefined' || !window.matchMedia) {
			return;
		}

		this.actividadesPopupMediaQuery = window.matchMedia('(max-width: 991.98px)');
		this.actividadesPopupFullScreen = this.actividadesPopupMediaQuery.matches;
		this.actividadesPopupMediaQuery.addEventListener('change', this.onActividadesPopupMediaChange);
	}

	// Pide a la API los catálogos del encabezado y de cada sección.
	// Cada combo carga por separado para no bloquear la pantalla mientras llegan los datos.
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

	// Qué hace: carga el catálogo de formatos disponibles para el descriptor (corto/extenso).
	// Cómo: llama a getLookUp GetFORMATO, guarda el resultado en mFORMATO y aplica el combo al encabezado.
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

	// Qué hace: carga el catálogo de niveles de dominio para las competencias técnicas del perfil.
	// Cómo: llama a getLookUp GetNIVEL_DOMINIO y guarda el resultado en competenciaTecnicaNivelDominioOptions.
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

	// Qué hace: carga el catálogo de sexo para el perfil del puesto.
	// Cómo: llama a getLookUp GetSEXO y guarda el resultado en perfilSexoOptions.
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

	// Qué hace: carga el catálogo de estado familiar para el perfil del puesto.
	// Cómo: llama a getLookUp GetESTADO_FAMILIAR y guarda el resultado en perfilEstadoFamiliarOptions.
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

	// Qué hace: carga el catálogo de licencias para el perfil del puesto.
	// Cómo: llama a getLookUp GetLICENCIA y guarda el resultado en perfilLicenciaOptions.
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

	// Qué hace: carga el catálogo de tipo requerido para la educación del perfil.
	// Cómo: llama a getLookUp GetTIPO_REQUERIDO y guarda el resultado en educacionTipoRequeridoOptions.
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

	// Actualiza las opciones del campo FORMATO en el formulario con el catálogo cargado.
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

	// Qué hace: carga el catálogo de frecuencias usado por los KPIs de las funciones.
	// Cómo: llama a getLookUp GetCORR_FRECUENCIA y guarda el resultado normalizado en mCORR_FRECUENCIA.
	getCORR_FRECUENCIA(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO_KPI_FUNCION',
				'SC_FRECUENCIA',
				'GetCORR_FRECUENCIA',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mCORR_FRECUENCIA = response.Data.map((item: ScFrecuenciaLookup) => {
							const nombre = (item.NOMBRE_FRECUENCIA ?? '').trim();
							return {
								CORR_FRECUENCIA: Number(item.CORR_FRECUENCIA),
								NOMBRE_FRECUENCIA: nombre,
								NOMBRE_FRECUENCIA_CATALOGO: nombre,
							};
						});
					} else {
						this.mCORR_FRECUENCIA = [];
					}
				},
				error: (error) => {
					this.mCORR_FRECUENCIA = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo de disponibilidad horaria usado por el perfil del puesto.
	// Cómo: llama a getLookUp GetCORR_DISPONIBILIDAD_HORARIO, guarda el resultado en mCORR_DISPONIBILIDAD_HORARIO
	// y luego prepara la lista de edición con prepararDisponibilidadLookupParaPerfil.
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
							(item: ScDisponibilidadHorarioLookup) => {
								const nombre = (item.NOMBRE_DISPONIBILIDAD_HORARIO ?? '').trim();
								return {
									CORR_DISPONIBILIDAD_HORARIO: Number(item.CORR_DISPONIBILIDAD_HORARIO),
									NOMBRE_DISPONIBILIDAD_HORARIO: nombre,
									NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO: nombre,
								};
							}
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

	// Qué hace: carga el catálogo de tipos de modalidad usado por el perfil del puesto.
	// Cómo: llama a getLookUp GetCORR_TIPO_MODALIDAD, guarda el resultado en mCORR_TIPO_MODALIDAD
	// y luego prepara la lista de edición con prepararModalidadLookupParaPerfil.
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
						this.mCORR_TIPO_MODALIDAD = response.Data.map((item: ScTipoModalidadLookup) => {
							const nombre = (item.MODALIDAD_NOMBRE ?? '').trim();
							return {
								CORR_TIPO_MODALIDAD: Number(item.CORR_TIPO_MODALIDAD),
								MODALIDAD_NOMBRE: nombre,
								MODALIDAD_NOMBRE_CATALOGO: nombre,
							};
						});
					} else {
						this.mCORR_TIPO_MODALIDAD = [];
					}
					this.prepararModalidadLookupParaPerfil();
				},
				error: (error) => {
					this.mCORR_TIPO_MODALIDAD = [];
					this.prepararModalidadLookupParaPerfil();
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo de inducciones activas para el grid de entrenamiento del descriptor.
	// Cómo: llama a getLookUp GetCORR_INDUCCION, guarda el resultado en mCORR_INDUCCION
	// y refresca las disponibles con actualizarInduccionesLookupDisponibles.
	getCORR_INDUCCION(): void {
		this.appInfoService
			.getLookUp(
				'SC_DESCRIPTOR_PUESTO_INDUCCION',
				'SC_INDUCCION',
				'GetCORR_INDUCCION',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_INDUCCION = [];
						this.mCORR_INDUCCION_DISPONIBLES = [];
						return;
					}

					this.mCORR_INDUCCION = response.Data.map((item: ScInduccionLookupItem) => {
						const nombre = (item.NOMBRE_INDUCCION ?? '').trim();
						const tiempo =
							item.TIEMPO_INDUCCION != null ? Number(item.TIEMPO_INDUCCION) : null;
						const unidad = (item.UNIDAD_TIEMPO ?? '').trim() || null;
						const duracion =
							tiempo == null ? '' : `${tiempo} ${unidad ?? ''}`.trim();
						return {
							CORR_INDUCCION: Number(item.CORR_INDUCCION),
							NOMBRE_INDUCCION: nombre,
							NOMBRE_INDUCCION_CATALOGO: nombre,
							TIEMPO_INDUCCION: tiempo,
							UNIDAD_TIEMPO: unidad,
							DURACION_DISPLAY: duracion,
						};
					});
					this.actualizarInduccionesLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_INDUCCION = [];
					this.mCORR_INDUCCION_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo de competencias técnicas (nivel 3) para la sección de perfil.
	// Cómo: llama a getLookUp GetCORR_COMPETENCIAS_TECNICAS_NIV3, normaliza cada elemento en mCORR_COMPETENCIAS_TECNICAS
	// y refresca las disponibles con actualizarCompetenciasTecnicasLookupDisponibles.
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
							CODIGO_COMPETENCIAS_TECNICAS_CATALOGO: codigo,
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

	// Qué hace: carga el catálogo de competencias conductuales para la sección de perfil.
	// Cómo: llama a getLookUp GetCORR_COMPETENCIAS_CONDUCTUALES, normaliza cada elemento en mCORR_COMPETENCIAS_CONDUCTUALES
	// y refresca las disponibles con actualizarCompetenciasConductualesLookupDisponibles.
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
							CODIGO_TIPO_PUESTO_CATALOGO: codigoTipoPuesto,
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

	// Qué hace: carga el catálogo de requerimientos organizacionales.
	// Cómo: llama a getLookUp GetCORR_REQUERIMIENTO_ORGANIZACIONAL, guarda el resultado en mCORR_REQUERIMIENTO_ORGANIZACIONAL
	// y refresca las disponibles con actualizarRequerimientosOrganizacionalesLookupDisponibles.
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

	// Qué hace: carga el catálogo de riesgos de puesto.
	// Cómo: llama a getLookUp GetCORR_RIESGO_PUESTO, guarda el resultado en mCORR_RIESGO_PUESTO
	// y refresca las disponibles con actualizarRiesgosPuestoLookupDisponibles.
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

	// Qué hace: carga el catálogo de responsabilidades de cargo.
	// Cómo: llama a getLookUp GetCORR_RESPONSABILIDAD, normaliza cada elemento (incluye APLICA_DESCRIPTOR) en
	// mCORR_RESPONSABILIDAD y refresca las disponibles con actualizarResponsabilidadesCargoLookupDisponibles.
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

	// Qué hace: carga el catálogo de impacto económico.
	// Cómo: llama a getLookUp GetCORR_IMPACTO_ECONOMICO, guarda el resultado en mCORR_IMPACTO_ECONOMICO
	// y luego prepara la lista de edición con prepararImpactosLookupParaEdicion.
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
						this.prepararImpactosLookupParaEdicion();
						return;
					}

					this.mCORR_IMPACTO_ECONOMICO = response.Data.map((item: any) => {
						const descripcion = (item.DESCRIPCION ?? '').trim();
						return {
							CORR_IMPACTO_ECONOMICO: Number(item.CORR_IMPACTO_ECONOMICO),
							DESCRIPCION: descripcion,
							DESCRIPCION_CATALOGO: descripcion,
						};
					});
					this.prepararImpactosLookupParaEdicion();
				},
				error: (error) => {
					this.mCORR_IMPACTO_ECONOMICO = [];
					this.prepararImpactosLookupParaEdicion();
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: obtiene el correlativo de la unidad elegida en el lookup del encabezado.
	// Cómo: lee CORR_UNIDAD de la primera fila seleccionada del lookup.
	selectedLookUpCORR_UNIDAD(vRow: any): number {
		return vRow[0].CORR_UNIDAD;
	}

	// Qué hace: obtiene el correlativo del puesto elegido en el lookup del encabezado.
	// Cómo: lee CORR_PUESTO de la primera fila seleccionada del lookup.
	selectedLookUpCORR_PUESTO(vRow: any): number {
		return vRow[0].CORR_PUESTO;
	}

	// Qué hace: obtiene el correlativo del puesto al que reporta, elegido en el lookup del encabezado.
	// Cómo: lee CORR_PUESTO de la primera fila seleccionada del lookup.
	selectedLookUpCORR_PUESTO_REPORTA(vRow: any): number {
		return vRow[0].CORR_PUESTO;
	}

	// Qué hace: obtiene el correlativo de la frecuencia elegida en el lookup de KPIs.
	// Cómo: lee CORR_FRECUENCIA de la primera fila seleccionada del lookup.
	selectedLookUpCORR_FRECUENCIA(vRow: any): number {
		return vRow[0].CORR_FRECUENCIA;
	}

	// Qué hace: obtiene el correlativo de la disponibilidad horaria elegida en el lookup del perfil.
	// Cómo: lee CORR_DISPONIBILIDAD_HORARIO de la primera fila seleccionada del lookup.
	selectedLookUpCORR_DISPONIBILIDAD_HORARIO(vRow: any): number {
		return vRow[0].CORR_DISPONIBILIDAD_HORARIO;
	}

	// Qué hace: obtiene el correlativo de la modalidad elegida en el lookup del perfil.
	// Cómo: lee CORR_TIPO_MODALIDAD de la primera fila seleccionada del lookup.
	selectedLookUpCORR_TIPO_MODALIDAD(vRow: any): number {
		return vRow[0].CORR_TIPO_MODALIDAD;
	}

	// Qué hace: obtiene el correlativo de la inducción elegida en el lookup de entrenamiento.
	// Cómo: lee CORR_INDUCCION de la primera fila seleccionada del lookup.
	selectedLookUpCORR_INDUCCION(vRow: any): number {
		return vRow[0].CORR_INDUCCION;
	}

	// Qué hace: obtiene el correlativo de la competencia técnica elegida en el lookup del perfil.
	// Cómo: lee CORR_COMPETENCIAS_TECNICAS de la primera fila seleccionada del lookup.
	selectedLookUpCORR_COMPETENCIAS_TECNICAS(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_TECNICAS;
	}

	// Qué hace: obtiene el correlativo de la competencia conductual elegida en el lookup del perfil.
	// Cómo: lee CORR_COMPETENCIAS_CONDUCTUALES de la primera fila seleccionada del lookup.
	selectedLookUpCORR_COMPETENCIAS_CONDUCTUALES(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_CONDUCTUALES;
	}

	// Qué hace: obtiene el correlativo del requerimiento organizacional elegido en el lookup.
	// Cómo: lee CORR_REQUERIMIENTO_ORGANIZACIONAL de la primera fila seleccionada del lookup.
	selectedLookUpCORR_REQUERIMIENTO_ORGANIZACIONAL(vRow: any): number {
		return vRow[0].CORR_REQUERIMIENTO_ORGANIZACIONAL;
	}

	// Qué hace: obtiene el correlativo del riesgo de puesto elegido en el lookup.
	// Cómo: lee CORR_RIESGO_PUESTO de la primera fila seleccionada del lookup.
	selectedLookUpCORR_RIESGO_PUESTO(vRow: any): number {
		return vRow[0].CORR_RIESGO_PUESTO;
	}

	// Qué hace: obtiene el correlativo de la responsabilidad de cargo elegida en el lookup.
	// Cómo: lee CORR_RESPONSABILIDAD de la primera fila seleccionada del lookup.
	selectedLookUpCORR_RESPONSABILIDAD(vRow: any): number {
		return vRow[0].CORR_RESPONSABILIDAD;
	}

	// Qué hace: obtiene el correlativo del impacto económico elegido en el lookup.
	// Cómo: lee CORR_IMPACTO_ECONOMICO de la primera fila seleccionada del lookup.
	selectedLookUpCORR_IMPACTO_ECONOMICO(vRow: any): number {
		return vRow[0].CORR_IMPACTO_ECONOMICO;
	}

	// Qué hace: reacciona a los cambios de estado del formulario (nuevo, editar, ver, browse).
	// Cómo: llama al AsignaStatus base y, al volver a modo Browse (listado), limpia banderas de edición
	// (perfil) y regresa el título y las pestañas a su estado inicial.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.perfilEditando = false;
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.mainTabIndex = 0;
			this.subTabIndex = 0;
		}
	}

	// Arma el objeto de filtro (empresa + correlativo) que se envía en las consultas a la API.
	fillParam(xCORR_DESCRIPTOR_PUESTO?: number): any {
		return {
			CORR_DESCRIPTOR_PUESTO: xCORR_DESCRIPTOR_PUESTO ?? 0,
		};
	}

	// Qué hace: construye el modelo del encabezado del descriptor para el formulario.
	// Cómo: si recibe xModel, copia sus campos (con valores por defecto para los opcionales);
	// si no recibe nada, devuelve un modelo vacío con los valores iniciales para un registro nuevo.
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
			RESPONSABLE: '',
			//FORMATO: FORMATO_CORTO,
			FORMATO: FORMATO_AMBOS,
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

	// Consulta el listado de descriptores, completa nombres faltantes, ordena y refresca el grid.
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

	// Rellena NOMBRE_UNIDAD y NOMBRE_PUESTO cuando la API no los devuelve.
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

	// Ordena el listado por correlativo de descriptor, de menor a mayor.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_DESCRIPTOR_PUESTO) - Number(b.CORR_DESCRIPTOR_PUESTO)
		);
	}

	// Refresca el grid principal; si resetPage es true, vuelve a la primera página.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Qué hace: prepara la pantalla para crear un nuevo descriptor de puesto.
	// Cómo: valida que haya empresa en sesión, limpia validaciones y pestañas, llama al nuevo base,
	// y sincroniza el formulario del encabezado.
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
		this.actualizarPuestosPorUnidad(null);
		setTimeout(() => this.syncHeaderForm());
	}

	// Qué hace: prepara la pantalla para editar el descriptor de puesto seleccionado.
	// Cómo: habilita edición, llama al editarClick base, carga los datos
	// de las pestañas (cargarDatosTabs) y actualiza los combos de unidad/puesto según el registro.
	override editarClick(e: any): void {
		this.readOnly = false;
		this.limpiarEstadoValidacionHeader();
		super.editarClick(e);
		this.resetearFuncionesTabsDirty();
		this.cargarDatosTabs();
		this.actualizarPuestosPorUnidad(this.model.CORR_UNIDAD);
		if (this.model.CORR_PUESTO) {
			this.aplicarDatosPuestoSeleccionado(this.model.CORR_PUESTO, false);
		}
		setTimeout(() => this.syncHeaderForm());
	}

	// Qué hace: abre el descriptor de puesto en modo solo lectura al hacer doble clic en una fila del grid.
	// Cómo: toma los datos de la fila, carga el modelo, llama al rowDblClick base, carga los datos
	// de las pestañas y bloquea el formulario.
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
		this.actualizarPuestosPorUnidad(this.model.CORR_UNIDAD);
		setTimeout(() => {
			this.syncHeaderForm();
			this.bloquear();
		});
	}

	// Carga las secciones que aplican según formato corto o extenso.
	// Las secciones que no aplican se vacían para no mostrar datos del descriptor anterior.
	cargarDatosTabs(): void {
		this.itemsTabBitacora = [];
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
		this.cargarInduccionesDescriptor();
	}

	// Limpia listas y flags de edición de todas las secciones al cambiar o cancelar.
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
		this.induccionesDescriptor = [];
		this.responsabilidadesCargo = [];
		this.relacionesInternas = [];
		this.relacionesExternas = [];
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
		this.resetearEdicionInducciones();
		this.resetearEdicionResponsabilidadesCargo();
		this.resetearEdicionRelacionesInternas();
		this.resetearEdicionRelacionesExternas();
		this.limpiarPerfil();
		this.resetearFuncionesTabsDirty();
		this.cerrarActividadesPopup();
	}

	// Qué hace: indica si el descriptor actual muestra las secciones del formato corto.
	// Cómo: compara en mayúsculas el FORMATO del modelo contra FORMATO_CORTO o FORMATO_AMBOS
	// (AMBOS muestra las secciones de ambos formatos a la vez).
	get esFormatoCorto(): boolean {
		const formato = (this.model?.FORMATO ?? '').toUpperCase();
		return formato === FORMATO_CORTO || formato === FORMATO_AMBOS;
	}

	// Qué hace: indica si el descriptor actual muestra las secciones del formato extenso.
	// Cómo: compara en mayúsculas el FORMATO del modelo contra FORMATO_EXTENSO o FORMATO_AMBOS
	// (AMBOS muestra las secciones de ambos formatos a la vez).
	get esFormatoExtenso(): boolean {
		const formato = (this.model?.FORMATO ?? '').toUpperCase();
		return formato === FORMATO_EXTENSO || formato === FORMATO_AMBOS;
	}

	// Qué hace: indica si deben mostrarse las secciones del descriptor (funciones, perfil, etc.).
	// Cómo: solo se muestran cuando la pantalla está en modo formulario o consulta y el descriptor ya tiene correlativo.
	get mostrarSeccionesDescriptor(): boolean {
		return (
			(this.isForm() || this.isConsulta()) &&
			Number(this.model?.CORR_DESCRIPTOR_PUESTO) > 0
		);
	}

	// Controla agregar, editar y cancelar funciones clave en el grid.
	// El guardado llama a la API y recarga la lista para mantener actividades e indicadores al día.
	agregarFuncionClave(): void {
		if (this.readOnly || this.funcionesClaveEditando || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridFuncionesClave?.instance.addRow();
		this.funcionesClaveEditando = true;
	}

	// Qué hace: pone en modo edición la fila de función clave que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, llama a editRow del grid y marca funcionesClaveEditando en true.
	editarFuncionClaveClick(e: any): void {
		if (this.readOnly || this.funcionesClaveEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.funcionesClaveEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de función clave.
	// Cómo: delega en accionGridVisible.
	funcionClaveEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de función clave.
	// Cómo: delega en accionGridVisible.
	funcionClaveDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de funciones clave.
	guardarFuncionClaveEditada(): void {
		const grid = this.gridFuncionesClave?.instance;
		if (!grid || !this.funcionesClaveEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de funciones clave y limpia los flags locales.
	cancelarFuncionClaveEditada(): void {
		this.cancelarEdicionGrid(this.gridFuncionesClave?.instance, () => {
			this.funcionesClaveEditando = false;
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de función clave.
	// Cómo: pone el correlativo en 0, limpia el nombre, fija el tipo en TIPO_FUNCION_CLAVE, el contador
	// de actividades en 0 y genera una clave temporal de cliente con crearClientKey.
	funcionClaveInitNewRow(e: any): void {
		e.data.CORR_FUNCION = 0;
		e.data.NOMBRE_FUNCION = '';
		e.data.TIPO_FUNCION = TIPO_FUNCION_CLAVE;
		e.data.CANT_ACTIVIDADES = 0;
		e.data._clientKey = this.crearClientKey('fc');
	}

	// Qué hace: marca que el grid de funciones clave entró en edición.
	// Cómo: pone funcionesClaveEditando en true.
	onFuncionClaveEditingStart(_e: any): void {
		this.funcionesClaveEditando = true;
	}

	// Qué hace: reacciona a que el grid de funciones clave terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag funcionesClaveEditando.
	onFuncionClaveSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesClaveEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de funciones clave.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag funcionesClaveEditando.
	onFuncionClaveEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesClaveEditando = false;
		});
	}

	// Qué hace: valida los datos de la fila de función clave antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el nombre no esté vacío ni supere 255 caracteres,
	// invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta una nueva función clave desde el grid.
	// Cómo: llama a persistirFuncionDesdeGrid (create) con TIPO_FUNCION_CLAVE y esNuevo en true.
	funcionClaveRowInserting(e: any): void {
		e.cancel = this.persistirFuncionDesdeGrid(e.data, TIPO_FUNCION_CLAVE, true);
	}

	// Qué hace: actualiza una función clave existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirFuncionDesdeGrid (update) con esNuevo en false.
	funcionClaveRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirFuncionDesdeGrid(data, TIPO_FUNCION_CLAVE, false);
	}

	// Qué hace: elimina una función clave desde el grid.
	// Cómo: llama a eliminarFuncionDesdeGrid (delete) con los datos de la fila.
	funcionClaveRowRemoving(e: any): void {
		e.cancel = this.eliminarFuncionDesdeGrid(e.data);
	}

	// Controla agregar, editar y cancelar funciones secundarias en el grid (sin actividades asociadas).
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

	// Qué hace: pone en modo edición la fila de función secundaria que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, llama a editRow del grid y marca funcionesSecundariasEditando en true.
	editarFuncionSecundariaClick(e: any): void {
		if (this.readOnly || this.funcionesSecundariasEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.funcionesSecundariasEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de función secundaria.
	// Cómo: delega en accionGridVisible.
	funcionSecundariaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de función secundaria.
	// Cómo: delega en accionGridVisible.
	funcionSecundariaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de funciones secundarias.
	guardarFuncionSecundariaEditada(): void {
		const grid = this.gridFuncionesSecundarias?.instance;
		if (!grid || !this.funcionesSecundariasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de funciones secundarias y limpia los flags locales.
	cancelarFuncionSecundariaEditada(): void {
		this.cancelarEdicionGrid(this.gridFuncionesSecundarias?.instance, () => {
			this.funcionesSecundariasEditando = false;
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de función secundaria.
	// Cómo: pone el correlativo en 0, limpia el nombre, fija el tipo en TIPO_FUNCION_SECUNDARIA
	// y genera una clave temporal de cliente con crearClientKey.
	funcionSecundariaInitNewRow(e: any): void {
		e.data.CORR_FUNCION = 0;
		e.data.NOMBRE_FUNCION = '';
		e.data.TIPO_FUNCION = TIPO_FUNCION_SECUNDARIA;
		e.data._clientKey = this.crearClientKey('fs');
	}

	// Qué hace: marca que el grid de funciones secundarias entró en edición.
	// Cómo: pone funcionesSecundariasEditando en true.
	onFuncionSecundariaEditingStart(_e: any): void {
		this.funcionesSecundariasEditando = true;
	}

	// Qué hace: reacciona a que el grid de funciones secundarias terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag funcionesSecundariasEditando.
	onFuncionSecundariaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesSecundariasEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de funciones secundarias.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag funcionesSecundariasEditando.
	onFuncionSecundariaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.funcionesSecundariasEditando = false;
		});
	}

	// Qué hace: valida los datos de la fila de función secundaria antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el nombre no esté vacío ni supere 255 caracteres,
	// invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta una nueva función secundaria desde el grid.
	// Cómo: llama a persistirFuncionDesdeGrid (create) con TIPO_FUNCION_SECUNDARIA y esNuevo en true.
	funcionSecundariaRowInserting(e: any): void {
		e.cancel = this.persistirFuncionDesdeGrid(e.data, TIPO_FUNCION_SECUNDARIA, true);
	}

	// Qué hace: actualiza una función secundaria existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirFuncionDesdeGrid (update) con esNuevo en false.
	funcionSecundariaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirFuncionDesdeGrid(data, TIPO_FUNCION_SECUNDARIA, false);
	}

	// Qué hace: elimina una función secundaria desde el grid.
	// Cómo: llama a eliminarFuncionDesdeGrid (delete) con los datos de la fila.
	funcionSecundariaRowRemoving(e: any): void {
		e.cancel = this.eliminarFuncionDesdeGrid(e.data);
	}

	// Administra relaciones internas (solo formato extenso) y asigna TIPO_RELACION antes de guardar.
	// Qué hace: abre una nueva fila para registrar una relación interna.
	// Cómo: si no está bloqueado, ya en edición, fuera de formato extenso o sin descriptor guardado, sale;
	// si no, llama a addRow del grid y marca relacionesInternasEditando en true.
	agregarRelacionInterna(): void {
		if (this.readOnly || this.relacionesInternasEditando || !this.esFormatoExtenso || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridRelacionesInternas?.instance.addRow();
		this.relacionesInternasEditando = true;
	}

	// Qué hace: pone en modo edición la fila de relación interna que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, llama a editRow del grid y marca relacionesInternasEditando en true.
	editarRelacionInternaClick(e: any): void {
		if (this.readOnly || this.relacionesInternasEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.relacionesInternasEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de relación interna.
	// Cómo: delega en accionGridVisible.
	relacionInternaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de relación interna.
	// Cómo: delega en accionGridVisible.
	relacionInternaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de relaciones internas.
	guardarRelacionInternaEditada(): void {
		const grid = this.gridRelacionesInternas?.instance;
		if (!grid || !this.relacionesInternasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de relaciones internas y limpia los flags locales.
	cancelarRelacionInternaEditada(): void {
		this.cancelarEdicionGrid(this.gridRelacionesInternas?.instance, () => {
			this.relacionesInternasEditando = false;
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de relación interna.
	// Cómo: pone el correlativo en 0, fija el tipo en TIPO_RELACION_INTERNA, limpia puesto/área y motivo,
	// y genera una clave temporal de cliente con crearClientKey.
	relacionInternaInitNewRow(e: any): void {
		e.data.CORR_RELACION_LABORAL = 0;
		e.data.TIPO_RELACION = TIPO_RELACION_INTERNA;
		e.data.PUESTO_AREA = '';
		e.data.MOTIVO_RELACION = '';
		e.data._clientKey = this.crearClientKey('ri');
	}

	// Qué hace: marca que el grid de relaciones internas entró en edición.
	// Cómo: pone relacionesInternasEditando en true.
	onRelacionInternaEditingStart(_e: any): void {
		this.relacionesInternasEditando = true;
	}

	// Qué hace: reacciona a que el grid de relaciones internas terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag relacionesInternasEditando.
	onRelacionInternaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesInternasEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de relaciones internas.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag relacionesInternasEditando.
	onRelacionInternaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesInternasEditando = false;
		});
	}

	// Qué hace: valida los datos de la fila de relación interna antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el puesto/área no esté vacío ni supere 200 caracteres,
	// y que el motivo no supere 255 caracteres, invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta una nueva relación interna desde el grid.
	// Cómo: llama a persistirRelacionDesdeGrid (create) con TIPO_RELACION_INTERNA y esNuevo en true.
	relacionInternaRowInserting(e: any): void {
		e.cancel = this.persistirRelacionDesdeGrid(e.data, TIPO_RELACION_INTERNA, true);
	}

	// Qué hace: actualiza una relación interna existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirRelacionDesdeGrid (update) con esNuevo en false.
	relacionInternaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRelacionDesdeGrid(data, TIPO_RELACION_INTERNA, false);
	}

	// Qué hace: elimina una relación interna desde el grid.
	// Cómo: llama a eliminarRelacionDesdeGrid (delete) con los datos de la fila.
	relacionInternaRowRemoving(e: any): void {
		e.cancel = this.eliminarRelacionDesdeGrid(e.data);
	}

	// Administra relaciones externas en el grid; solo disponible en formato extenso.
	// Qué hace: abre una nueva fila para registrar una relación externa.
	// Cómo: si no está bloqueado, ya en edición, fuera de formato extenso o sin descriptor guardado, sale;
	// si no, llama a addRow del grid y marca relacionesExternasEditando en true.
	agregarRelacionExterna(): void {
		if (this.readOnly || this.relacionesExternasEditando || !this.esFormatoExtenso || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridRelacionesExternas?.instance.addRow();
		this.relacionesExternasEditando = true;
	}

	// Qué hace: pone en modo edición la fila de relación externa que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, llama a editRow del grid y marca relacionesExternasEditando en true.
	editarRelacionExternaClick(e: any): void {
		if (this.readOnly || this.relacionesExternasEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.relacionesExternasEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de relación externa.
	// Cómo: delega en accionGridVisible.
	relacionExternaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de relación externa.
	// Cómo: delega en accionGridVisible.
	relacionExternaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de relaciones externas.
	guardarRelacionExternaEditada(): void {
		const grid = this.gridRelacionesExternas?.instance;
		if (!grid || !this.relacionesExternasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de relaciones externas y limpia los flags locales.
	cancelarRelacionExternaEditada(): void {
		this.cancelarEdicionGrid(this.gridRelacionesExternas?.instance, () => {
			this.relacionesExternasEditando = false;
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de relación externa.
	// Cómo: pone el correlativo en 0, fija el tipo en TIPO_RELACION_EXTERNA, limpia puesto/área y motivo,
	// y genera una clave temporal de cliente con crearClientKey.
	relacionExternaInitNewRow(e: any): void {
		e.data.CORR_RELACION_LABORAL = 0;
		e.data.TIPO_RELACION = TIPO_RELACION_EXTERNA;
		e.data.PUESTO_AREA = '';
		e.data.MOTIVO_RELACION = '';
		e.data._clientKey = this.crearClientKey('re');
	}

	// Qué hace: marca que el grid de relaciones externas entró en edición.
	// Cómo: pone relacionesExternasEditando en true.
	onRelacionExternaEditingStart(_e: any): void {
		this.relacionesExternasEditando = true;
	}

	// Qué hace: reacciona a que el grid de relaciones externas terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag relacionesExternasEditando.
	onRelacionExternaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesExternasEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de relaciones externas.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag relacionesExternasEditando.
	onRelacionExternaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.relacionesExternasEditando = false;
		});
	}

	// Qué hace: valida los datos de la fila de relación externa antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el puesto/área no esté vacío ni supere 200 caracteres,
	// y que el motivo no supere 255 caracteres, invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta una nueva relación externa desde el grid.
	// Cómo: llama a persistirRelacionDesdeGrid (create) con TIPO_RELACION_EXTERNA y esNuevo en true.
	relacionExternaRowInserting(e: any): void {
		e.cancel = this.persistirRelacionDesdeGrid(e.data, TIPO_RELACION_EXTERNA, true);
	}

	// Qué hace: actualiza una relación externa existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirRelacionDesdeGrid (update) con esNuevo en false.
	relacionExternaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRelacionDesdeGrid(data, TIPO_RELACION_EXTERNA, false);
	}

	// Qué hace: elimina una relación externa desde el grid.
	// Cómo: llama a eliminarRelacionDesdeGrid (delete) con los datos de la fila.
	relacionExternaRowRemoving(e: any): void {
		e.cancel = this.eliminarRelacionDesdeGrid(e.data);
	}

	// Qué hace: abre el popup de actividades para la función clave indicada.
	// Cómo: valida formato extenso y que la función tenga correlativo (avisa con notifyDescriptorWarning si no),
	// guarda la función seleccionada, resetea el flag de edición y carga sus actividades con cargarActividadesPopup.
	abrirActividades(funcion: ScDescriptorPuestoFuncion): void {
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

	// Cierra el popup de actividades y quita la función seleccionada.
	cerrarActividadesPopup(): void {
		this.actividadesPopupVisible = false;
		this.funcionActividadesSeleccionada = null;
		this.actividadesPopup = [];
		this.actividadesEditando = false;
	}

	// Qué hace: abre una nueva fila para registrar una actividad de la función seleccionada.
	// Cómo: si no está bloqueado, ya en edición o sin función seleccionada, sale; si no, llama a addRow
	// del grid de actividades y marca actividadesEditando en true.
	agregarActividad(): void {
		if (this.readOnly || this.actividadesEditando || !this.funcionActividadesSeleccionada?.CORR_FUNCION) {
			return;
		}
		this.gridActividades?.instance.addRow();
		this.actividadesEditando = true;
	}

	// Qué hace: pone en modo edición la fila de actividad que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, llama a editRow del grid y marca actividadesEditando en true.
	editarActividadClick(e: any): void {
		if (this.readOnly || this.actividadesEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.actividadesEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de actividad.
	// Cómo: delega en accionGridVisible.
	actividadEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de actividad.
	// Cómo: delega en accionGridVisible.
	actividadDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de actividades del popup.
	guardarActividadEditada(): void {
		const grid = this.gridActividades?.instance;
		if (!grid || !this.actividadesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de actividades y limpia los flags locales.
	cancelarActividadEditada(): void {
		this.cancelarEdicionGrid(this.gridActividades?.instance, () => {
			this.actividadesEditando = false;
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de actividad.
	// Cómo: toma el correlativo de la función seleccionada, limpia el correlativo y nombre de actividad,
	// y genera una clave temporal de cliente con crearClientKey.
	actividadInitNewRow(e: any): void {
		const funcion = this.funcionActividadesSeleccionada;
		e.data.CORR_FUNCION = funcion?.CORR_FUNCION ?? 0;
		e.data.CORR_ACTIVIDAD = 0;
		e.data.NOMBRE_ACTIVIDAD = '';
		e.data._clientKey = this.crearClientKey('act');
	}

	// Qué hace: marca que el grid de actividades entró en edición.
	// Cómo: pone actividadesEditando en true.
	onActividadEditingStart(_e: any): void {
		this.actividadesEditando = true;
	}

	// Qué hace: reacciona a que el grid de actividades terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag actividadesEditando.
	onActividadSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.actividadesEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de actividades.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag actividadesEditando.
	onActividadEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.actividadesEditando = false;
		});
	}

	// Qué hace: valida los datos de la fila de actividad antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el nombre no esté vacío ni supere 255 caracteres,
	// invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta una nueva actividad desde el grid.
	// Cómo: llama a persistirActividadDesdeGrid (create) con esNuevo en true.
	actividadRowInserting(e: any): void {
		e.cancel = this.persistirActividadDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza una actividad existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirActividadDesdeGrid (update) con esNuevo en false.
	actividadRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirActividadDesdeGrid(data, false);
	}

	// Qué hace: elimina una actividad desde el grid.
	// Cómo: llama a eliminarActividadDesdeGrid (delete) con los datos de la fila.
	actividadRowRemoving(e: any): void {
		e.cancel = this.eliminarActividadDesdeGrid(e.data);
	}

	// Administra KPIs (solo formato corto) en el grid.
	// Al elegir frecuencia, guarda código y nombre en la fila para mostrarlos de inmediato.
	// Qué hace: abre una nueva fila para registrar un KPI de la función.
	// Cómo: si no está bloqueado, ya en edición, fuera de formato corto o sin descriptor guardado, sale;
	// si no, prepara el lookup de frecuencias, llama a addRow del grid y marca kpisEditando en true.
	agregarKpi(): void {
		if (this.readOnly || this.kpisEditando || !this.esFormatoCorto || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.prepararFrecuenciasLookupParaEdicionKpi(null);
		this.gridKpis?.instance.addRow();
		this.kpisEditando = true;
	}

	// Qué hace: pone en modo edición la fila de KPI que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, prepara el lookup de frecuencias para esa fila,
	// llama a editRow del grid y marca kpisEditando en true.
	editarKpiClick(e: any): void {
		if (this.readOnly || this.kpisEditando) {
			return;
		}
		this.prepararFrecuenciasLookupParaEdicionKpi(e.row?.data);
		e.component.editRow(e.row.rowIndex);
		this.kpisEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de KPI.
	// Cómo: delega en accionGridVisible.
	kpiEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de KPI.
	// Cómo: delega en accionGridVisible.
	kpiDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de KPIs.
	guardarKpiEditado(): void {
		const grid = this.gridKpis?.instance;
		if (!grid || !this.kpisEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de KPIs y limpia los flags locales.
	cancelarKpiEditado(): void {
		this.cancelarEdicionGrid(this.gridKpis?.instance, () => {
			this.kpisEditando = false;
			this.cargarKpis(true);
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de KPI.
	// Cómo: pone el correlativo en 0, limpia nombre del indicador, frecuencia y meta,
	// y genera una clave temporal de cliente con crearClientKey.
	kpiInitNewRow(e: any): void {
		e.data.CORR_KPI_FUNCION = 0;
		e.data.NOMBRE_INDICADOR = '';
		e.data.CORR_FRECUENCIA = null;
		e.data.NOMBRE_FRECUENCIA = '';
		e.data.META = null;
		e.data._clientKey = this.crearClientKey('kpi');
	}

	// Qué hace: marca que el grid de KPIs entró en edición y prepara el lookup de frecuencias.
	// Cómo: pone kpisEditando en true y llama a prepararFrecuenciasLookupParaEdicionKpi con la fila en edición.
	onKpiEditingStart(e: any): void {
		this.kpisEditando = true;
		this.prepararFrecuenciasLookupParaEdicionKpi(e?.data);
	}

	// Qué hace: reacciona a que el grid de KPIs terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag kpisEditando.
	onKpiSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.kpisEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de KPIs.
	// Cómo: delega en finalizarEdicionGrid para limpiar el flag kpisEditando y recarga los KPIs con cargarKpis.
	onKpiEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.kpisEditando = false;
		});
		this.cargarKpis(true);
	}

	// Qué hace: valida los datos de la fila de KPI antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el nombre del indicador no esté vacío ni supere
	// 255 caracteres, invalidando la fila con invalidarFila cuando corresponde.
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

		// Alineado con la API: META opcional, pero si viene debe estar entre 0 y 100.
		if (data.META != null && data.META !== '') {
			const meta = Number(data.META);
			if (!Number.isFinite(meta) || meta < 0 || meta > 100) {
				this.invalidarFila(e, 'La meta debe estar entre 0 y 100.');
				return;
			}
		}
	}

	// Qué hace: inserta un nuevo KPI desde el grid.
	// Cómo: llama a persistirKpiDesdeGrid (create) con esNuevo en true.
	kpiRowInserting(e: any): void {
		e.cancel = this.persistirKpiDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza un KPI existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirKpiDesdeGrid (update) con esNuevo en false.
	kpiRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirKpiDesdeGrid(data, false);
	}

	// Qué hace: elimina un KPI desde el grid.
	// Cómo: llama a eliminarKpiDesdeGrid (delete) con los datos de la fila.
	kpiRowRemoving(e: any): void {
		e.cancel = this.eliminarKpiDesdeGrid(e.data);
	}

	// Qué hace: define el texto que se muestra en la columna de frecuencia del grid de KPIs.
	// Cómo: devuelve el NOMBRE_FRECUENCIA de la fila, o cadena vacía si no hay dato.
	kpiFrecuenciaDisplay = (row: ScDescriptorPuestoKpiFuncion): string => {
		return row?.NOMBRE_FRECUENCIA || '';
	};

	// Qué hace: aplica el cambio de frecuencia elegida en el lookup de la fila de KPI.
	// Cómo: busca el nombre en el catálogo (o en la lista de edición), actualiza la celda y la fila
	// en memoria, fija el valor en la celda y vuelve a preparar el lookup de frecuencias.
	onKpiFrecuenciaLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_FRECUENCIA.find(
			(item) => Number(item.CORR_FRECUENCIA) === Number(corr)
		);
		const fromEdit = this.mCORR_FRECUENCIA_KPI_EDIT.find(
			(item) => Number(item.CORR_FRECUENCIA) === Number(corr)
		);
		const nombre = (
			fromCatalog?.NOMBRE_FRECUENCIA_CATALOGO ??
			fromCatalog?.NOMBRE_FRECUENCIA ??
			fromEdit?.NOMBRE_FRECUENCIA_CATALOGO ??
			''
		).trim();

		// Aunque no cambie el código, actualiza el nombre desde el catálogo (por si se renombró).
		if (cellInfo?.data) {
			cellInfo.data.CORR_FRECUENCIA = corr;
			cellInfo.data.NOMBRE_FRECUENCIA = nombre;
		}

		const live = this.resolverFilaKpi(cellInfo?.data);
		if (live) {
			live.CORR_FRECUENCIA = corr;
			live.NOMBRE_FRECUENCIA = nombre;
		}

		cellInfo.setValue(corr);
		this.prepararFrecuenciasLookupParaEdicionKpi(cellInfo?.data);
	}

	// Qué hace: fija el valor de frecuencia y su nombre al editar la celda directamente en el grid de KPIs.
	// Cómo: busca el nombre en el catálogo (o en la lista de edición) y actualiza CORR_FRECUENCIA y NOMBRE_FRECUENCIA
	// en los nuevos datos de la fila.
	setKpiFrecuenciaCellValue = (
		newData: ScDescriptorPuestoKpiFuncion,
		value: number | null,
		_currentRowData: ScDescriptorPuestoKpiFuncion
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_FRECUENCIA.find(
			(item) => Number(item.CORR_FRECUENCIA) === Number(corr)
		);
		const fromEdit = this.mCORR_FRECUENCIA_KPI_EDIT.find(
			(item) => Number(item.CORR_FRECUENCIA) === Number(corr)
		);
		newData.CORR_FRECUENCIA = corr;
		newData.NOMBRE_FRECUENCIA = (
			fromCatalog?.NOMBRE_FRECUENCIA_CATALOGO ??
			fromCatalog?.NOMBRE_FRECUENCIA ??
			fromEdit?.NOMBRE_FRECUENCIA_CATALOGO ??
			''
		).trim();
	};

	// Educación, experiencia y competencias comparten el mismo perfil.
	// Antes de agregar un detalle, guarda el perfil padre si aún no existe en la base de datos.
	// Qué hace: abre una nueva fila para registrar un requisito de educación del perfil.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, asegura que el
	// perfil exista (asegurarPerfilParaDetalle) y luego llama a addRow del grid y marca educacionEditando en true.
	agregarEducacion(): void {
		if (this.readOnly || this.educacionEditando || !this.requiereDescriptorGuardado()) {
			return;
		}

		this.asegurarPerfilParaDetalle(() => {
			this.gridEducacion?.instance.addRow();
			this.educacionEditando = true;
		});
	}

	// Qué hace: pone en modo edición la fila de educación que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, llama a editRow del grid y marca educacionEditando en true.
	editarEducacionClick(e: any): void {
		if (this.readOnly || this.educacionEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.educacionEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de educación.
	// Cómo: delega en accionGridVisible.
	educacionEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de educación.
	// Cómo: delega en accionGridVisible.
	educacionDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de educación del perfil.
	guardarEducacionEditada(): void {
		const grid = this.gridEducacion?.instance;
		if (!grid || !this.educacionEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de educación y limpia los flags locales.
	cancelarEducacionEditada(): void {
		this.cancelarEdicionGrid(this.gridEducacion?.instance, () => {
			this.educacionEditando = false;
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de educación.
	// Cómo: pone el correlativo en 0, asocia el CORR_PERFIL_PUESTO actual, limpia requisito y
	// especificaciones, fija TIPO_REQUERIDO en 'SI' y genera una clave temporal de cliente con crearClientKey.
	educacionInitNewRow(e: any): void {
		e.data.CORR_EDUCACION = 0;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.REQUISITO = '';
		e.data.ESPECIFICACIONES = '';
		e.data.TIPO_REQUERIDO = 'SI';
		e.data._clientKey = this.crearClientKey('edu');
	}

	// Qué hace: marca que el grid de educación entró en edición.
	// Cómo: pone educacionEditando en true.
	onEducacionEditingStart(_e: any): void {
		this.educacionEditando = true;
	}

	// Qué hace: reacciona a que el grid de educación terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag educacionEditando.
	onEducacionSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.educacionEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de educación.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag educacionEditando.
	onEducacionEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.educacionEditando = false;
		});
	}

	// Qué hace: valida los datos de la fila de educación antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el requisito no esté vacío ni supere 255 caracteres,
	// y que las especificaciones no superen 255 caracteres, invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta un nuevo requisito de educación desde el grid.
	// Cómo: llama a persistirEducacionDesdeGrid (create) con esNuevo en true.
	educacionRowInserting(e: any): void {
		e.cancel = this.persistirEducacionDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza un requisito de educación existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirEducacionDesdeGrid (update) con esNuevo en false.
	educacionRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirEducacionDesdeGrid(data, false);
	}

	// Qué hace: elimina un requisito de educación desde el grid.
	// Cómo: llama a eliminarEducacionDesdeGrid (delete) con los datos de la fila.
	educacionRowRemoving(e: any): void {
		e.cancel = this.eliminarEducacionDesdeGrid(e.data);
	}

	// Qué hace: abre una nueva fila para registrar un requisito de experiencia del perfil.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, asegura que el
	// perfil exista (asegurarPerfilParaDetalle) y luego llama a addRow del grid y marca experienciaEditando en true.
	agregarExperiencia(): void {
		if (this.readOnly || this.experienciaEditando || !this.requiereDescriptorGuardado()) {
			return;
		}

		this.asegurarPerfilParaDetalle(() => {
			this.gridExperiencia?.instance.addRow();
			this.experienciaEditando = true;
		});
	}

	// Qué hace: pone en modo edición la fila de experiencia que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, llama a editRow del grid y marca experienciaEditando en true.
	editarExperienciaClick(e: any): void {
		if (this.readOnly || this.experienciaEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.experienciaEditando = true;
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de experiencia.
	// Cómo: delega en accionGridVisible.
	experienciaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de experiencia.
	// Cómo: delega en accionGridVisible.
	experienciaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de experiencia del perfil.
	guardarExperienciaEditada(): void {
		const grid = this.gridExperiencia?.instance;
		if (!grid || !this.experienciaEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de experiencia y limpia los flags locales.
	cancelarExperienciaEditada(): void {
		this.cancelarEdicionGrid(this.gridExperiencia?.instance, () => {
			this.experienciaEditando = false;
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de experiencia.
	// Cómo: pone el correlativo en 0, asocia el CORR_PERFIL_PUESTO actual, limpia el requisito,
	// fija TIPO_REQUERIDO en 'SI' y genera una clave temporal de cliente con crearClientKey.
	experienciaInitNewRow(e: any): void {
		e.data.CORR_EXPERIENCIA = 0;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.REQUISITO = '';
		e.data.TIPO_REQUERIDO = 'SI';
		e.data._clientKey = this.crearClientKey('exp');
	}

	// Qué hace: marca que el grid de experiencia entró en edición.
	// Cómo: pone experienciaEditando en true.
	onExperienciaEditingStart(_e: any): void {
		this.experienciaEditando = true;
	}

	// Qué hace: reacciona a que el grid de experiencia terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag experienciaEditando.
	onExperienciaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.experienciaEditando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de experiencia.
	// Cómo: delega en finalizarEdicionGrid, que limpia el flag experienciaEditando.
	onExperienciaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.experienciaEditando = false;
		});
	}

	// Qué hace: valida los datos de la fila de experiencia antes de guardarla.
	// Cómo: combina datos viejos y nuevos y verifica que el requisito no esté vacío ni supere 255 caracteres,
	// invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta un nuevo requisito de experiencia desde el grid.
	// Cómo: llama a persistirExperienciaDesdeGrid (create) con esNuevo en true.
	experienciaRowInserting(e: any): void {
		e.cancel = this.persistirExperienciaDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza un requisito de experiencia existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirExperienciaDesdeGrid (update) con esNuevo en false.
	experienciaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirExperienciaDesdeGrid(data, false);
	}

	// Qué hace: elimina un requisito de experiencia desde el grid.
	// Cómo: llama a eliminarExperienciaDesdeGrid (delete) con los datos de la fila.
	experienciaRowRemoving(e: any): void {
		e.cancel = this.eliminarExperienciaDesdeGrid(e.data);
	}

	// Oculta competencias técnicas ya asignadas y valida que no se repita el mismo código de catálogo.
	// Qué hace: abre una nueva fila para registrar una competencia técnica del perfil.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, asegura que el
	// perfil exista, refresca las competencias disponibles y llama a addRow del grid marcando el flag de edición.
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

	// Qué hace: pone en modo edición la fila de competencia técnica que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, refresca las disponibles conservando la actual,
	// llama a editRow del grid y marca competenciasTecnicasEditando en true.
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

	// Qué hace: decide si el botón de editar debe verse en la fila de competencia técnica.
	// Cómo: delega en accionGridVisible.
	competenciaTecnicaEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de competencia técnica.
	// Cómo: delega en accionGridVisible.
	competenciaTecnicaDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de competencias técnicas.
	guardarCompetenciaTecnicaEditada(): void {
		const grid = this.gridCompetenciasTecnicas?.instance;
		if (!grid || !this.competenciasTecnicasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de competencias técnicas y limpia los flags locales.
	cancelarCompetenciaTecnicaEditada(): void {
		this.cancelarEdicionGrid(this.gridCompetenciasTecnicas?.instance, () => {
			this.competenciasTecnicasEditando = false;
			this.cargarCompetenciasTecnicas(true);
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de competencia técnica.
	// Cómo: marca modo inserción, limpia catálogo, código, nombre y descripción, fija NIVEL_DOMINIO en
	// 'BASICO', genera una clave temporal de cliente con crearClientKey y refresca las competencias
	// disponibles del lookup.
	competenciaTecnicaInitNewRow(e: any): void {
		this.competenciasTecnicasInsertando = true;
		e.data._esNuevo = true;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.CORR_COMPETENCIAS_TECNICAS = null;
		e.data.CODIGO_COMPETENCIAS_TECNICAS = '';
		e.data.NOMBRE_COMPETENCIAS_TECNICAS = '';
		e.data.DESCRIPCION = '';
		e.data.NIVEL_DOMINIO = 'BASICO';
		e.data._clientKey = this.crearClientKey('ct');
		this.actualizarCompetenciasTecnicasLookupDisponibles();
	}

	// Qué hace: marca que el grid de competencias técnicas entró en edición y refresca el lookup disponible.
	// Cómo: determina si es inserción según _esNuevo de la fila, llama a
	// actualizarCompetenciasTecnicasLookupDisponibles conservando la competencia actual, marca el flag de
	// edición y sincroniza las columnas visibles con syncCompetenciaTecnicaColumnas.
	onCompetenciaTecnicaEditingStart(e: any): void {
		this.competenciasTecnicasInsertando = !!e?.data?._esNuevo;
		this.actualizarCompetenciasTecnicasLookupDisponibles(
			Number(e?.data?.CORR_COMPETENCIAS_TECNICAS) || null
		);
		this.competenciasTecnicasEditando = true;
		this.syncCompetenciaTecnicaColumnas();
	}

	// Qué hace: reacciona a que el grid de competencias técnicas terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia los flags de edición e inserción.
	onCompetenciaTecnicaSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasTecnicasEditando = false;
			this.competenciasTecnicasInsertando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de competencias técnicas.
	// Cómo: delega en finalizarEdicionGrid para limpiar los flags y recarga las competencias con
	// cargarCompetenciasTecnicas.
	onCompetenciaTecnicaEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasTecnicasEditando = false;
			this.competenciasTecnicasInsertando = false;
		});
		this.cargarCompetenciasTecnicas(true);
	}

	// Qué hace: valida los datos de la fila de competencia técnica antes de guardarla.
	// Cómo: verifica que haya competencia seleccionada, nombre no vacío (máx. 150 caracteres), descripción
	// (máx. 500), nivel de dominio válido y que no esté duplicada en el descriptor, invalidando con invalidarFila.
	competenciaTecnicaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_COMPETENCIAS_TECNICAS) > 0)) {
			this.invalidarFila(e, 'Debe seleccionar una competencia tecnica.');
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

	// Qué hace: inserta una nueva competencia técnica desde el grid.
	// Cómo: llama a persistirCompetenciaTecnicaDesdeGrid (create) con esNuevo en true.
	competenciaTecnicaRowInserting(e: any): void {
		e.cancel = this.persistirCompetenciaTecnicaDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza una competencia técnica existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirCompetenciaTecnicaDesdeGrid (update) con esNuevo en false.
	competenciaTecnicaRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirCompetenciaTecnicaDesdeGrid(data, false);
	}

	// Qué hace: elimina una competencia técnica desde el grid.
	// Cómo: llama a eliminarCompetenciaTecnicaDesdeGrid (delete) con los datos de la fila.
	competenciaTecnicaRowRemoving(e: any): void {
		e.cancel = this.eliminarCompetenciaTecnicaDesdeGrid(e.data);
	}

	// Qué hace: define el texto que se muestra en la columna de catálogo de competencia técnica.
	// Cómo: usa el código guardado en la fila; si no hay, lo busca por correlativo en el catálogo
	// (activo o disponible) y devuelve solo el código.
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
		// En la columna Competencia (solo lectura): mostrar solo el código, no el nombre.
		return (catalog?.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim();
	};

	// Arma el lookup de competencias técnicas: quita las ya usadas y deja la de la fila en edición.
	// Si esa competencia está inactiva, la agrega al lookup con los datos guardados en la fila.
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
		}).map((item) => {
			const codigoCatalogo = (
				item.CODIGO_COMPETENCIAS_TECNICAS_CATALOGO ??
				item.CODIGO_COMPETENCIAS_TECNICAS ??
				''
			).trim();
			return {
				...item,
				CODIGO_COMPETENCIAS_TECNICAS: codigoCatalogo,
				CODIGO_COMPETENCIAS_TECNICAS_CATALOGO: codigoCatalogo,
			};
		});

		const corrAsociada = Number(corrConservar || 0);
		const fila = corrAsociada
			? (this.competenciasTecnicas || []).find(
					(row) => Number(row.CORR_COMPETENCIAS_TECNICAS) === corrAsociada
			  )
			: null;
		const codigoDescriptor = (fila?.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim();

		if (corrAsociada > 0) {
			const idx = disponibles.findIndex(
				(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === corrAsociada
			);
			if (idx >= 0) {
				const existente = disponibles[idx];
				disponibles[idx] = {
					...existente,
					CODIGO_COMPETENCIAS_TECNICAS:
						codigoDescriptor || existente.CODIGO_COMPETENCIAS_TECNICAS,
					CODIGO_COMPETENCIAS_TECNICAS_CATALOGO:
						existente.CODIGO_COMPETENCIAS_TECNICAS_CATALOGO ||
						existente.CODIGO_COMPETENCIAS_TECNICAS,
				};
			} else if (fila) {
				const nombre = (fila.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim();
				disponibles.push({
					CORR_COMPETENCIAS_TECNICAS: corrAsociada,
					CORR_COMPETENCIAS_TECNICAS_PADRE: null,
					CODIGO_COMPETENCIAS_TECNICAS: codigoDescriptor,
					CODIGO_COMPETENCIAS_TECNICAS_CATALOGO: codigoDescriptor,
					NOMBRE_COMPETENCIAS_TECNICAS: nombre,
					DESCRIPCION: (fila.DESCRIPCION ?? nombre).trim(),
					NOMBRE_DISPLAY:
						[codigoDescriptor, nombre].filter((parte) => !!parte).join(' | ') ||
						`Competencia ${corrAsociada}`,
					GRUPO_NIV1: '',
					GRUPO_NIV2: '',
					GRUPO_PADRE: '',
					NIVEL: 'NIV3',
				});
			}
		}

		this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES = disponibles;
	}

	// Qué hace: aplica el cambio de competencia técnica elegida en el lookup de la fila.
	// Cómo: busca código y nombre en el catálogo (o en la lista disponible), actualiza la celda y la fila
	// en memoria, fija el valor en la celda y vuelve a preparar el lookup de competencias disponibles.
	onCompetenciaTecnicaLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_COMPETENCIAS_TECNICAS.find(
			(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === Number(corr)
		);
		const fromEdit = this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES.find(
			(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === Number(corr)
		);
		const codigo = (
			fromCatalog?.CODIGO_COMPETENCIAS_TECNICAS_CATALOGO ??
			fromCatalog?.CODIGO_COMPETENCIAS_TECNICAS ??
			fromEdit?.CODIGO_COMPETENCIAS_TECNICAS_CATALOGO ??
			''
		).trim();
		const nombre = (
			fromCatalog?.NOMBRE_COMPETENCIAS_TECNICAS ??
			fromEdit?.NOMBRE_COMPETENCIAS_TECNICAS ??
			''
		).trim();
		const descripcion = (fromCatalog?.DESCRIPCION ?? fromEdit?.DESCRIPCION ?? '').trim();

		// Aunque no cambie el código, actualiza código y nombre desde el catálogo (por si se renombró).
		if (cellInfo?.data) {
			cellInfo.data.CORR_COMPETENCIAS_TECNICAS = corr;
			cellInfo.data.CODIGO_COMPETENCIAS_TECNICAS = codigo;
			cellInfo.data.NOMBRE_COMPETENCIAS_TECNICAS = nombre;
			cellInfo.data.DESCRIPCION = descripcion;
		}

		const live = this.resolverFilaCompetenciaTecnica(cellInfo?.data);
		if (live) {
			live.CORR_COMPETENCIAS_TECNICAS = corr;
			live.CODIGO_COMPETENCIAS_TECNICAS = codigo;
			live.NOMBRE_COMPETENCIAS_TECNICAS = nombre;
			live.DESCRIPCION = descripcion;
		}

		cellInfo.setValue(corr);
		this.actualizarCompetenciasTecnicasLookupDisponibles(corr);
	}

	// Qué hace: fija el valor de competencia técnica y sus datos al editar la celda directamente en el grid.
	// Cómo: busca código, nombre y descripción en el catálogo (o en la lista disponible) y actualiza
	// esos campos en los nuevos datos de la fila.
	setCompetenciaTecnicaCellValue = (
		newData: ScPerfilPuestoCompetenciasTecnicas,
		value: number | null,
		_currentRowData: ScPerfilPuestoCompetenciasTecnicas
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_COMPETENCIAS_TECNICAS.find(
			(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === Number(corr)
		);
		const fromEdit = this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES.find(
			(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === Number(corr)
		);
		newData.CORR_COMPETENCIAS_TECNICAS = corr;
		// Al elegir en el select, copia código y nombre actuales del catálogo a la fila.
		newData.CODIGO_COMPETENCIAS_TECNICAS = (
			fromCatalog?.CODIGO_COMPETENCIAS_TECNICAS_CATALOGO ??
			fromCatalog?.CODIGO_COMPETENCIAS_TECNICAS ??
			fromEdit?.CODIGO_COMPETENCIAS_TECNICAS_CATALOGO ??
			''
		).trim();
		newData.NOMBRE_COMPETENCIAS_TECNICAS = (
			fromCatalog?.NOMBRE_COMPETENCIAS_TECNICAS ??
			fromEdit?.NOMBRE_COMPETENCIAS_TECNICAS ??
			''
		).trim();
		newData.DESCRIPCION = (fromCatalog?.DESCRIPCION ?? fromEdit?.DESCRIPCION ?? '').trim();
	};

	// Qué hace: localiza en memoria la fila real de competencia técnica que corresponde a una fila del grid.
	// Cómo: busca en competenciasTecnicas por _clientKey (fila nueva) o por CORR_COMPETENCIAS_TECNICAS
	// (fila existente, parte de la llave natural); devuelve null si no hay coincidencia.
	private resolverFilaCompetenciaTecnica(
		row?: ScPerfilPuestoCompetenciasTecnicas | null
	): ScPerfilPuestoCompetenciasTecnicas | null {
		if (!row) {
			return null;
		}
		const clientKey = row._clientKey;
		const corrCatalogo = Number(row.CORR_COMPETENCIAS_TECNICAS);
		return (
			(this.competenciasTecnicas || []).find(
				(item) =>
					(!!clientKey && item._clientKey === clientKey) ||
					(!row._esNuevo &&
						corrCatalogo > 0 &&
						Number(item.CORR_COMPETENCIAS_TECNICAS) === corrCatalogo)
			) ?? null
		);
	}

	// Oculta competencias conductuales ya asignadas al perfil, excepto la de la fila que se está editando.
	// Qué hace: abre una nueva fila para registrar una competencia conductual del perfil.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, asegura que el
	// perfil exista, refresca las disponibles y marca el flag antes de llamar a addRow del grid.
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

	// Qué hace: pone en modo edición la fila de competencia conductual que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, refresca las disponibles conservando la actual,
	// marca el flag de edición y llama a editRow del grid.
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

	// Qué hace: decide si el botón de editar debe verse en la fila de competencia conductual.
	// Cómo: delega en accionGridVisible.
	competenciaConductualEditButtonVisible(e: any): boolean {
		//return this.accionGridVisible(e);
		return false;
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de competencia conductual.
	// Cómo: delega en accionGridVisible.
	competenciaConductualDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de competencias conductuales.
	guardarCompetenciaConductualEditada(): void {
		const grid = this.gridCompetenciasConductuales?.instance;
		if (!grid || !this.competenciasConductualesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de competencias conductuales y limpia los flags locales.
	cancelarCompetenciaConductualEditada(): void {
		this.cancelarEdicionGrid(this.gridCompetenciasConductuales?.instance, () => {
			this.competenciasConductualesEditando = false;
			this.cargarCompetenciasConductuales(true);
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de competencia conductual.
	// Cómo: marca modo inserción, limpia catálogo, nombre y descripción, genera una clave temporal de
	// cliente con crearClientKey y refresca las competencias conductuales disponibles del lookup.
	competenciaConductualInitNewRow(e: any): void {
		this.competenciasConductualesInsertando = true;
		e.data._esNuevo = true;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.CORR_COMPETENCIAS_CONDUCTUALES = null;
		e.data.NOMBRE_COMPETENCIAS_CONDUCTUALES = '';
		e.data.DESCRIPCION = '';
		e.data._clientKey = this.crearClientKey('cc');
		this.actualizarCompetenciasConductualesLookupDisponibles();
	}

	// Qué hace: marca que el grid de competencias conductuales entró en edición y refresca el lookup disponible.
	// Cómo: determina si es inserción según _esNuevo de la fila, llama a
	// actualizarCompetenciasConductualesLookupDisponibles conservando la competencia actual, marca el flag
	// de edición y sincroniza las columnas visibles con syncCompetenciaConductualColumnas.
	onCompetenciaConductualEditingStart(e: any): void {
		this.competenciasConductualesInsertando = !!e?.data?._esNuevo;
		this.actualizarCompetenciasConductualesLookupDisponibles(
			Number(e?.data?.CORR_COMPETENCIAS_CONDUCTUALES) || null
		);
		this.competenciasConductualesEditando = true;
		this.syncCompetenciaConductualColumnas();
	}

	// Qué hace: reacciona a que el grid de competencias conductuales terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia los flags de edición e inserción.
	onCompetenciaConductualSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasConductualesEditando = false;
			this.competenciasConductualesInsertando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de competencias conductuales.
	// Cómo: delega en finalizarEdicionGrid para limpiar los flags y recarga las competencias con
	// cargarCompetenciasConductuales.
	onCompetenciaConductualEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.competenciasConductualesEditando = false;
			this.competenciasConductualesInsertando = false;
		});
		this.cargarCompetenciasConductuales(true);
	}

	// Qué hace: valida los datos de la fila de competencia conductual antes de guardarla.
	// Cómo: verifica que haya competencia seleccionada, nombre no vacío (máx. 150 caracteres), descripción
	// (máx. 500) y que no esté duplicada en el descriptor, invalidando la fila con invalidarFila.
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

	// Qué hace: inserta una nueva competencia conductual desde el grid.
	// Cómo: llama a persistirCompetenciaConductualDesdeGrid (create) con esNuevo en true.
	competenciaConductualRowInserting(e: any): void {
		e.cancel = this.persistirCompetenciaConductualDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza una competencia conductual existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirCompetenciaConductualDesdeGrid (update) con esNuevo en false.
	competenciaConductualRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirCompetenciaConductualDesdeGrid(data, false);
	}

	// Qué hace: elimina una competencia conductual desde el grid.
	// Cómo: llama a eliminarCompetenciaConductualDesdeGrid (delete) con los datos de la fila.
	competenciaConductualRowRemoving(e: any): void {
		e.cancel = this.eliminarCompetenciaConductualDesdeGrid(e.data);
	}

	// Qué hace: define el texto que se muestra en la columna de catálogo de competencia conductual.
	// Cómo: usa el código de tipo de puesto guardado en la fila; si no hay, lo busca por correlativo
	// en el catálogo (activo o disponible) y devuelve solo ese código.
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

	// Arma el lookup conductual: quita las ya usadas y deja la de la fila en edición.
	// Si esa competencia está inactiva, la agrega al lookup con los datos guardados en la fila.
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
		}).map((item) => {
			const codigoCatalogo = (item.CODIGO_TIPO_PUESTO_CATALOGO ?? item.CODIGO_TIPO_PUESTO ?? '').trim();
			return {
				...item,
				CODIGO_TIPO_PUESTO: codigoCatalogo,
				CODIGO_TIPO_PUESTO_CATALOGO: codigoCatalogo,
			};
		});

		const corrAsociada = Number(corrConservar || 0);
		const fila = corrAsociada
			? (this.competenciasConductuales || []).find(
					(row) => Number(row.CORR_COMPETENCIAS_CONDUCTUALES) === corrAsociada
			  )
			: null;
		const codigoDescriptor = (fila?.CODIGO_TIPO_PUESTO ?? '').trim();

		if (corrAsociada > 0) {
			const idx = disponibles.findIndex(
				(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === corrAsociada
			);
			if (idx >= 0) {
				const existente = disponibles[idx];
				disponibles[idx] = {
					...existente,
					CODIGO_TIPO_PUESTO: codigoDescriptor || existente.CODIGO_TIPO_PUESTO,
					CODIGO_TIPO_PUESTO_CATALOGO:
						existente.CODIGO_TIPO_PUESTO_CATALOGO || existente.CODIGO_TIPO_PUESTO,
				};
			} else if (fila) {
				const nombre = (fila.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim();
				disponibles.push({
					CORR_COMPETENCIAS_CONDUCTUALES: corrAsociada,
					NOMBRE_COMPETENCIAS_CONDUCTUALES: nombre,
					DESCRIPCION: (fila.DESCRIPCION ?? nombre).trim(),
					NOMBRE_TIPO_PUESTO: '',
					CODIGO_TIPO_PUESTO: codigoDescriptor,
					CODIGO_TIPO_PUESTO_CATALOGO: codigoDescriptor,
				});
			}
		}

		this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES = disponibles;
	}

	// Qué hace: aplica el cambio de competencia conductual elegida en el lookup de la fila.
	// Cómo: busca código y nombre en el catálogo (o en la lista disponible), actualiza la celda y la fila
	// en memoria, fija el valor en la celda y vuelve a preparar el lookup de competencias disponibles.
	onCompetenciaConductualLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_COMPETENCIAS_CONDUCTUALES.find(
			(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === Number(corr)
		);
		const fromEdit = this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES.find(
			(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === Number(corr)
		);
		const codigo = (
			fromCatalog?.CODIGO_TIPO_PUESTO_CATALOGO ??
			fromCatalog?.CODIGO_TIPO_PUESTO ??
			fromEdit?.CODIGO_TIPO_PUESTO_CATALOGO ??
			''
		).trim();
		const nombre = (
			fromCatalog?.NOMBRE_COMPETENCIAS_CONDUCTUALES ??
			fromEdit?.NOMBRE_COMPETENCIAS_CONDUCTUALES ??
			''
		).trim();
		const descripcion = this.esFormatoExtenso
			? (fromCatalog?.DESCRIPCION ?? fromEdit?.DESCRIPCION ?? '').trim()
			: '';

		// Aunque no cambie el código, actualiza código y nombre desde el catálogo (por si se renombró).
		if (cellInfo?.data) {
			cellInfo.data.CORR_COMPETENCIAS_CONDUCTUALES = corr;
			cellInfo.data.CODIGO_TIPO_PUESTO = codigo;
			cellInfo.data.NOMBRE_COMPETENCIAS_CONDUCTUALES = nombre;
			cellInfo.data.DESCRIPCION = descripcion;
		}

		const live = this.resolverFilaCompetenciaConductual(cellInfo?.data);
		if (live) {
			live.CORR_COMPETENCIAS_CONDUCTUALES = corr;
			live.CODIGO_TIPO_PUESTO = codigo;
			live.NOMBRE_COMPETENCIAS_CONDUCTUALES = nombre;
			live.DESCRIPCION = descripcion;
		}

		cellInfo.setValue(corr);
		this.actualizarCompetenciasConductualesLookupDisponibles(corr);
	}

	// Qué hace: fija el valor de competencia conductual y sus datos al editar la celda directamente en el grid.
	// Cómo: busca código, nombre y descripción en el catálogo (o en la lista disponible) y actualiza
	// esos campos en los nuevos datos de la fila.
	setCompetenciaConductualCellValue = (
		newData: ScPerfilPuestoCompetenciasConductuales,
		value: number | null,
		_currentRowData: ScPerfilPuestoCompetenciasConductuales
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_COMPETENCIAS_CONDUCTUALES.find(
			(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === Number(corr)
		);
		const fromEdit = this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES.find(
			(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === Number(corr)
		);
		newData.CORR_COMPETENCIAS_CONDUCTUALES = corr;
		newData.NOMBRE_COMPETENCIAS_CONDUCTUALES = (
			fromCatalog?.NOMBRE_COMPETENCIAS_CONDUCTUALES ??
			fromEdit?.NOMBRE_COMPETENCIAS_CONDUCTUALES ??
			''
		).trim();
		newData.CODIGO_TIPO_PUESTO = (
			fromCatalog?.CODIGO_TIPO_PUESTO_CATALOGO ??
			fromCatalog?.CODIGO_TIPO_PUESTO ??
			fromEdit?.CODIGO_TIPO_PUESTO_CATALOGO ??
			''
		).trim();
		newData.DESCRIPCION = this.esFormatoExtenso
			? (fromCatalog?.DESCRIPCION ?? fromEdit?.DESCRIPCION ?? '').trim()
			: '';
	};

	// Qué hace: localiza en memoria la fila real de competencia conductual que corresponde a una fila del grid.
	// Cómo: busca en competenciasConductuales por _clientKey (fila nueva) o por CORR_COMPETENCIAS_CONDUCTUALES
	// (fila existente, parte de la llave natural); devuelve null si no hay coincidencia.
	private resolverFilaCompetenciaConductual(
		row?: ScPerfilPuestoCompetenciasConductuales | null
	): ScPerfilPuestoCompetenciasConductuales | null {
		if (!row) {
			return null;
		}
		const clientKey = row._clientKey;
		const corrCatalogo = Number(row.CORR_COMPETENCIAS_CONDUCTUALES);
		return (
			(this.competenciasConductuales || []).find(
				(item) =>
					(!!clientKey && item._clientKey === clientKey) ||
					(!row._esNuevo &&
						corrCatalogo > 0 &&
						Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === corrCatalogo)
			) ?? null
		);
	}

	// Al editar requerimientos: actualiza textos desde el catálogo y oculta opciones ya usadas.
	// Qué hace: abre una nueva fila para registrar un requerimiento organizacional.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, refresca el lookup
	// disponible, marca los flags de inserción/edición y llama a addRow del grid.
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

	// Qué hace: pone en modo edición la fila de requerimiento organizacional que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, refresca el lookup disponible conservando el actual,
	// marca los flags de edición (sin inserción) y llama a editRow del grid.
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

	// Qué hace: decide si el botón de editar debe verse en la fila de requerimiento organizacional.
	// Cómo: delega en accionGridVisible.
	requerimientoOrganizacionalEditButtonVisible(e: any): boolean {
		//return this.accionGridVisible(e);
		return false;
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de requerimiento organizacional.
	// Cómo: delega en accionGridVisible.
	requerimientoOrganizacionalDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de requerimientos organizacionales.
	guardarRequerimientoOrganizacionalEditado(): void {
		const grid = this.gridRequerimientosOrganizacionales?.instance;
		if (!grid || !this.requerimientosOrganizacionalesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de requerimientos y limpia los flags locales.
	cancelarRequerimientoOrganizacionalEditado(): void {
		this.cancelarEdicionGrid(this.gridRequerimientosOrganizacionales?.instance, () => {
			this.requerimientosOrganizacionalesEditando = false;
			this.requerimientosOrganizacionalesInsertando = false;
			this.cargarRequerimientosOrganizacionales(true);
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de requerimiento organizacional.
	// Cómo: marca modo inserción, limpia catálogo y descripción, genera una clave temporal de cliente
	// con crearClientKey y refresca el lookup de requerimientos disponibles.
	requerimientoOrganizacionalInitNewRow(e: any): void {
		this.requerimientosOrganizacionalesInsertando = true;
		e.data._esNuevo = true;
		e.data.CORR_DESCRIPTOR_PUESTO = Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
		e.data.CORR_REQUERIMIENTO_ORGANIZACIONAL = null;
		e.data.DESCRIPCION = '';
		e.data._clientKey = this.crearClientKey('ro');
		this.actualizarRequerimientosOrganizacionalesLookupDisponibles();
	}

	// Qué hace: marca que el grid de requerimientos organizacionales entró en edición y refresca el lookup disponible.
	// Cómo: determina si es inserción según _esNuevo de la fila, llama a
	// actualizarRequerimientosOrganizacionalesLookupDisponibles conservando el actual, marca el flag de edición
	// y sincroniza las columnas visibles con syncRequerimientoOrganizacionalColumnas.
	onRequerimientoOrganizacionalEditingStart(e: any): void {
		this.requerimientosOrganizacionalesInsertando = !!e?.data?._esNuevo;
		this.actualizarRequerimientosOrganizacionalesLookupDisponibles(
			Number(e?.data?.CORR_REQUERIMIENTO_ORGANIZACIONAL) || null
		);
		this.requerimientosOrganizacionalesEditando = true;
		this.syncRequerimientoOrganizacionalColumnas();
	}

	// Qué hace: reacciona a que el grid de requerimientos organizacionales terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia los flags de edición e inserción.
	onRequerimientoOrganizacionalSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.requerimientosOrganizacionalesEditando = false;
			this.requerimientosOrganizacionalesInsertando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de requerimientos organizacionales.
	// Cómo: delega en finalizarEdicionGrid para limpiar los flags y recarga los requerimientos con
	// cargarRequerimientosOrganizacionales.
	onRequerimientoOrganizacionalEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.requerimientosOrganizacionalesEditando = false;
			this.requerimientosOrganizacionalesInsertando = false;
		});
		this.cargarRequerimientosOrganizacionales(true);
	}

	// Qué hace: valida los datos de la fila de requerimiento organizacional antes de guardarla.
	// Cómo: verifica que haya requerimiento seleccionado, descripción no vacía (máx. 150 caracteres) y que
	// no esté duplicado en el descriptor, invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta un nuevo requerimiento organizacional desde el grid.
	// Cómo: llama a persistirRequerimientoOrganizacionalDesdeGrid (create) con esNuevo en true.
	requerimientoOrganizacionalRowInserting(e: any): void {
		e.cancel = this.persistirRequerimientoOrganizacionalDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza un requerimiento organizacional existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirRequerimientoOrganizacionalDesdeGrid (update)
	// con esNuevo en false.
	requerimientoOrganizacionalRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRequerimientoOrganizacionalDesdeGrid(data, false);
	}

	// Qué hace: elimina un requerimiento organizacional desde el grid.
	// Cómo: llama a eliminarRequerimientoOrganizacionalDesdeGrid (delete) con los datos de la fila.
	requerimientoOrganizacionalRowRemoving(e: any): void {
		e.cancel = this.eliminarRequerimientoOrganizacionalDesdeGrid(e.data);
	}

	// Qué hace: define el texto que se muestra en la columna de catálogo del requerimiento organizacional.
	// Cómo: devuelve el correlativo como texto, o cadena vacía si no es válido.
	requerimientoOrganizacionalCatalogDisplay = (row: ScDescriptorPuestoRequerimientoOrganizacional): string => {
		const corr = Number(row?.CORR_REQUERIMIENTO_ORGANIZACIONAL);
		if (!(corr > 0)) {
			return '';
		}
		return String(corr);
	};

	// Arma el lookup de requerimientos dejando solo los que aún no están en el descriptor.
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

	// Qué hace: aplica el cambio de requerimiento organizacional elegido en el lookup de la fila.
	// Cómo: normaliza el valor a número (o null) y lo fija en la celda con setValue.
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

	// Administra riesgos del puesto en el grid.
	// Tras cambiar el lookup, vuelve a dibujar la fila para mostrar nombre e información actualizados.
	// Qué hace: abre una nueva fila para registrar un riesgo del puesto.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, refresca el lookup
	// disponible, marca los flags de inserción/edición y llama a addRow del grid.
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

	// Qué hace: pone en modo edición la fila de riesgo de puesto que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, refresca el lookup disponible conservando el actual,
	// marca los flags de edición (sin inserción) y llama a editRow del grid.
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

	// Qué hace: decide si el botón de editar debe verse en la fila de riesgo de puesto.
	// Cómo: delega en accionGridVisible.
	riesgoPuestoEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de riesgo de puesto.
	// Cómo: delega en accionGridVisible.
	riesgoPuestoDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de riesgos del puesto.
	guardarRiesgoPuestoEditado(): void {
		const grid = this.gridRiesgosPuesto?.instance;
		if (!grid || !this.riesgosPuestoEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de riesgos y limpia los flags locales.
	cancelarRiesgoPuestoEditado(): void {
		this.cancelarEdicionGrid(this.gridRiesgosPuesto?.instance, () => {
			this.riesgosPuestoEditando = false;
			this.riesgosPuestoInsertando = false;
			this.cargarRiesgosPuesto(true);
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de riesgo de puesto.
	// Cómo: marca modo inserción, limpia catálogo, nombre e información, genera una clave temporal
	// de cliente con crearClientKey y refresca el lookup de riesgos disponibles.
	riesgoPuestoInitNewRow(e: any): void {
		this.riesgosPuestoInsertando = true;
		e.data._esNuevo = true;
		e.data.CORR_DESCRIPTOR_PUESTO = Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
		e.data.CORR_RIESGO_PUESTO = null;
		e.data.NOMBRE_RIESGO_PUESTO = '';
		e.data.INFORMACION = '';
		e.data._clientKey = this.crearClientKey('rp');
		this.actualizarRiesgosPuestoLookupDisponibles();
	}

	// Qué hace: marca que el grid de riesgos de puesto entró en edición y refresca el lookup disponible.
	// Cómo: determina si es inserción según _esNuevo de la fila, llama a
	// actualizarRiesgosPuestoLookupDisponibles conservando el actual, marca el flag de edición y
	// sincroniza las columnas visibles con syncRiesgoPuestoColumnas.
	onRiesgoPuestoEditingStart(e: any): void {
		this.riesgosPuestoInsertando = !!e?.data?._esNuevo;
		this.actualizarRiesgosPuestoLookupDisponibles(Number(e?.data?.CORR_RIESGO_PUESTO) || null);
		this.riesgosPuestoEditando = true;
		this.syncRiesgoPuestoColumnas();
	}

	// Qué hace: reacciona a que el grid de riesgos de puesto terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia los flags de edición e inserción.
	onRiesgoPuestoSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.riesgosPuestoEditando = false;
			this.riesgosPuestoInsertando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de riesgos de puesto.
	// Cómo: delega en finalizarEdicionGrid para limpiar los flags y recarga los riesgos con cargarRiesgosPuesto.
	onRiesgoPuestoEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.riesgosPuestoEditando = false;
			this.riesgosPuestoInsertando = false;
		});
		this.cargarRiesgosPuesto(true);
	}

	// Qué hace: valida los datos de la fila de riesgo de puesto antes de guardarla.
	// Cómo: verifica que haya riesgo seleccionado, nombre no vacío (máx. 150 caracteres) y que no esté
	// duplicado en el descriptor, invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta un nuevo riesgo de puesto desde el grid.
	// Cómo: llama a persistirRiesgoPuestoDesdeGrid (create) con esNuevo en true.
	riesgoPuestoRowInserting(e: any): void {
		e.cancel = this.persistirRiesgoPuestoDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza un riesgo de puesto existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirRiesgoPuestoDesdeGrid (update) con esNuevo en false.
	riesgoPuestoRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirRiesgoPuestoDesdeGrid(data, false);
	}

	// Qué hace: elimina un riesgo de puesto desde el grid.
	// Cómo: llama a eliminarRiesgoPuestoDesdeGrid (delete) con los datos de la fila.
	riesgoPuestoRowRemoving(e: any): void {
		e.cancel = this.eliminarRiesgoPuestoDesdeGrid(e.data);
	}

	// Qué hace: define el texto que se muestra en la columna de catálogo del riesgo de puesto.
	// Cómo: devuelve el correlativo como texto, o cadena vacía si no es válido.
	riesgoPuestoCatalogDisplay = (row: ScDescriptorPuestoRiesgoPuesto): string => {
		const corr = Number(row?.CORR_RIESGO_PUESTO);
		if (!(corr > 0)) {
			return '';
		}
		return String(corr);
	};

	// Arma el lookup de riesgos dejando solo los que aún no están en el descriptor.
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

	// Qué hace: aplica el cambio de riesgo de puesto elegido en el lookup de la fila.
	// Cómo: normaliza el valor, lo fija en la celda con setValue y repinta la fila con repintarFilaRiesgoPuestoLookup.
	onRiesgoPuestoLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
		this.repintarFilaRiesgoPuestoLookup(cellInfo);
	}

	// Tras cambiar el riesgo en el lookup, vuelve a dibujar la fila en el grid.
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

	// Qué hace: fija el valor de riesgo de puesto y su nombre al editar la celda directamente en el grid.
	// Cómo: busca el nombre en el catálogo y actualiza CORR_RIESGO_PUESTO y NOMBRE_RIESGO_PUESTO en los
	// nuevos datos de la fila.
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

	// Administra inducciones (entrenamiento) del puesto en el grid.
	// Nombre y duración son snapshot del catálogo SC_INDUCCION; solo son editables al elegir la inducción.
	// Qué hace: abre una nueva fila para registrar una inducción del descriptor.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, refresca el lookup
	// disponible, marca los flags de inserción/edición y llama a addRow del grid.
	agregarInduccion(): void {
		if (this.readOnly || this.induccionesEditando || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.actualizarInduccionesLookupDisponibles();
		this.induccionesInsertando = true;
		this.induccionesEditando = true;
		setTimeout(() => {
			this.gridInducciones?.instance.addRow();
			this.syncInduccionColumnas();
		});
	}

	// Qué hace: pone en modo edición la fila de inducción que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, refresca el lookup disponible conservando el actual,
	// marca los flags de edición (sin inserción) y llama a editRow del grid.
	editarInduccionClick(e: any): void {
		if (this.readOnly || this.induccionesEditando) {
			return;
		}
		this.actualizarInduccionesLookupDisponibles(Number(e?.row?.data?.CORR_INDUCCION) || null);
		this.induccionesInsertando = false;
		this.induccionesEditando = true;
		const rowIndex = e.row.rowIndex;
		const grid = e.component;
		setTimeout(() => {
			grid.editRow(rowIndex);
			this.syncInduccionColumnas();
		});
	}

	// Qué hace: decide si el botón de editar debe verse en la fila de inducción.
	// Cómo: delega en accionGridVisible.
	induccionEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de inducción.
	// Cómo: delega en accionGridVisible.
	induccionDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de inducciones.
	guardarInduccionEditada(): void {
		const grid = this.gridInducciones?.instance;
		if (!grid || !this.induccionesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de inducciones y limpia los flags locales.
	cancelarInduccionEditada(): void {
		this.cancelarEdicionGrid(this.gridInducciones?.instance, () => {
			this.induccionesEditando = false;
			this.induccionesInsertando = false;
			this.cargarInduccionesDescriptor(true);
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de inducción.
	// Cómo: marca modo inserción, limpia catálogo, nombre y duración, genera una clave temporal
	// de cliente con crearClientKey y refresca el lookup de inducciones disponibles.
	induccionInitNewRow(e: any): void {
		this.induccionesInsertando = true;
		e.data._esNuevo = true;
		e.data.CORR_DESCRIPTOR_PUESTO = Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
		e.data.CORR_INDUCCION = null;
		e.data.NOMBRE_INDUCCION = '';
		e.data.TIEMPO_INDUCCION = null;
		e.data.UNIDAD_TIEMPO = null;
		e.data._clientKey = this.crearClientKey('ind');
		this.actualizarInduccionesLookupDisponibles();
	}

	// Qué hace: marca que el grid de inducciones entró en edición y refresca el lookup disponible.
	// Cómo: determina si es inserción según _esNuevo de la fila, llama a
	// actualizarInduccionesLookupDisponibles conservando la actual, marca el flag de edición y
	// sincroniza las columnas visibles con syncInduccionColumnas.
	onInduccionEditingStart(e: any): void {
		this.induccionesInsertando = !!e?.data?._esNuevo;
		this.actualizarInduccionesLookupDisponibles(Number(e?.data?.CORR_INDUCCION) || null);
		this.induccionesEditando = true;
		this.syncInduccionColumnas();
	}

	// Qué hace: reacciona a que el grid de inducciones terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia los flags de edición e inserción.
	onInduccionSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.induccionesEditando = false;
			this.induccionesInsertando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de inducciones.
	// Cómo: delega en finalizarEdicionGrid para limpiar los flags y recarga las inducciones con cargarInduccionesDescriptor.
	onInduccionEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.induccionesEditando = false;
			this.induccionesInsertando = false;
		});
		this.cargarInduccionesDescriptor(true);
	}

	// Qué hace: valida los datos de la fila de inducción antes de guardarla.
	// Cómo: verifica que haya inducción seleccionada y que no esté duplicada en el descriptor,
	// invalidando la fila con invalidarFila cuando corresponde.
	induccionRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_INDUCCION) > 0)) {
			this.invalidarFila(e, 'Debe seleccionar una induccion.');
			return;
		}

		const corrCatalogo = Number(data.CORR_INDUCCION);
		const clientKey = data._clientKey ?? e?.key;
		const duplicada = (this.induccionesDescriptor || []).some((row) => {
			if (!(Number(row.CORR_INDUCCION) > 0)) {
				return false;
			}
			if (clientKey != null && row._clientKey === clientKey) {
				return false;
			}
			return Number(row.CORR_INDUCCION) === corrCatalogo;
		});
		if (duplicada) {
			this.invalidarFila(e, 'Esa induccion ya esta agregada en el descriptor.');
			return;
		}
	}

	// Qué hace: inserta una nueva inducción desde el grid.
	// Cómo: llama a persistirInduccionDesdeGrid (create) con esNuevo en true.
	induccionRowInserting(e: any): void {
		e.cancel = this.persistirInduccionDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza una inducción existente desde el grid.
	// Cómo: combina datos viejos y nuevos y llama a persistirInduccionDesdeGrid (update) con esNuevo en false.
	induccionRowUpdating(e: any): void {
		const data = { ...e.oldData, ...e.newData };
		e.cancel = this.persistirInduccionDesdeGrid(data, false);
	}

	// Qué hace: elimina una inducción desde el grid.
	// Cómo: llama a eliminarInduccionDesdeGrid (delete) con los datos de la fila.
	induccionRowRemoving(e: any): void {
		e.cancel = this.eliminarInduccionDesdeGrid(e.data);
	}

	// Qué hace: define el texto que se muestra en la columna de catálogo de la inducción.
	// Cómo: devuelve el correlativo como texto, o cadena vacía si no es válido.
	induccionCatalogDisplay = (row: ScDescriptorPuestoInduccion): string => {
		const corr = Number(row?.CORR_INDUCCION);
		if (!(corr > 0)) {
			return '';
		}
		return String(corr);
	};

	// Qué hace: calcula el texto de duración (tiempo + unidad) para la columna de solo lectura.
	induccionDuracionDisplay = (row: ScDescriptorPuestoInduccion): string => {
		if (row?.TIEMPO_INDUCCION == null) {
			return '';
		}
		return `${row.TIEMPO_INDUCCION} ${row.UNIDAD_TIEMPO || ''}`.trim();
	};

	// Qué hace: aplica el cambio de inducción elegida en el lookup de la fila.
	// Cómo: normaliza el valor, lo fija en la celda con setValue y repinta la fila con repintarFilaInduccionLookup.
	onInduccionLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
		this.repintarFilaInduccionLookup(cellInfo);
	}

	// Tras cambiar la inducción en el lookup, vuelve a dibujar la fila en el grid.
	private repintarFilaInduccionLookup(cellInfo: any): void {
		this.cdr.detectChanges();
		setTimeout(() => {
			const grid = this.gridInducciones?.instance ?? cellInfo?.component;
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

	// Qué hace: fija el valor de inducción, nombre y duración al editar la celda directamente en el grid.
	// Cómo: busca el snapshot en el catálogo y actualiza CORR_INDUCCION, NOMBRE_INDUCCION, TIEMPO_INDUCCION
	// y UNIDAD_TIEMPO en los nuevos datos de la fila.
	setInduccionCellValue = (
		newData: ScDescriptorPuestoInduccion,
		value: number | null,
		_currentRowData: ScDescriptorPuestoInduccion
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog = this.mCORR_INDUCCION.find(
			(item) => Number(item.CORR_INDUCCION) === Number(corr)
		);
		newData.CORR_INDUCCION = corr;
		newData.NOMBRE_INDUCCION = catalog?.NOMBRE_INDUCCION ?? '';
		newData.TIEMPO_INDUCCION = catalog?.TIEMPO_INDUCCION ?? null;
		newData.UNIDAD_TIEMPO = catalog?.UNIDAD_TIEMPO ?? null;
	};

	// Muestra responsabilidades del catálogo y una fila extra de impacto económico en el mismo grid.
	// La fila de impacto se edita y guarda por separado, en el encabezado del descriptor.
	// Qué hace: abre una nueva fila para registrar una responsabilidad de cargo.
	// Cómo: si no está bloqueado, ya en edición o sin descriptor guardado, sale; si no, refresca el lookup
	// disponible, marca los flags de inserción/edición y llama a addRow del grid.
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

	// Qué hace: pone en modo edición la fila de responsabilidad de cargo (o impacto económico) que el usuario seleccionó.
	// Cómo: si no está bloqueado ni ya en edición, prepara el lookup correspondiente (impacto económico o
	// responsabilidades) y llama a editRow del grid marcando los flags de edición.
	editarResponsabilidadCargoClick(e: any): void {
		if (this.readOnly || this.responsabilidadesCargoEditando) {
			return;
		}
		if (e?.row?.data?._esImpactoEconomico) {
			this.prepararImpactosLookupParaEdicion();
		} else {
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

	// Qué hace: decide si el botón de editar debe verse en la fila de responsabilidad de cargo.
	// Cómo: delega en accionGridVisible.
	responsabilidadCargoEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	// Qué hace: decide si el botón de eliminar debe verse en la fila de responsabilidad de cargo.
	// Cómo: oculta el botón para la fila de impacto económico (no se elimina); para el resto, delega en accionGridVisible.
	responsabilidadCargoDeleteButtonVisible(e: any): boolean {
		if (e?.row?.data?._esImpactoEconomico) {
			return false;
		}
		return this.accionGridVisible(e);
	}

	// Guarda la fila en edición del grid de responsabilidades (catálogo o impacto económico).
	guardarResponsabilidadCargoEditado(): void {
		const grid = this.gridResponsabilidadesCargo?.instance;
		if (!grid || !this.responsabilidadesCargoEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Cancela la edición de responsabilidades y limpia los flags locales.
	cancelarResponsabilidadCargoEditado(): void {
		this.cancelarEdicionGrid(this.gridResponsabilidadesCargo?.instance, () => {
			this.responsabilidadesCargoEditando = false;
			this.responsabilidadesCargoInsertando = false;
			this.cargarResponsabilidadesCargo(true);
		});
	}

	// Qué hace: inicializa los valores por defecto de una nueva fila de responsabilidad de cargo.
	// Cómo: marca modo inserción, limpia catálogo, nombre e información, fija APLICA_DESCRIPTOR según
	// el formato actual (AMBOS si el descriptor es AMBOS, o el formato normalizado CORTO/EXTENSO),
	// genera una clave temporal de cliente con crearClientKey y refresca el lookup disponible.
	responsabilidadCargoInitNewRow(e: any): void {
		this.responsabilidadesCargoInsertando = true;
		e.data._esNuevo = true;
		e.data.CORR_DESCRIPTOR_PUESTO = Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
		e.data.CORR_RESPONSABILIDAD = null;
		e.data.NOMBRE_RESPONSABILIDAD = '';
		e.data.INFORMACION = '';
		const formatoActual = (this.model?.FORMATO ?? FORMATO_CORTO).trim().toUpperCase();
		e.data.APLICA_DESCRIPTOR = formatoActual === FORMATO_AMBOS ? FORMATO_AMBOS : formatoActual;
		e.data._clientKey = this.crearClientKey('rc');
		this.actualizarResponsabilidadesCargoLookupDisponibles();
	}

	// Qué hace: marca que el grid de responsabilidades entró en edición y prepara el lookup correspondiente.
	// Cómo: si la fila es la de impacto económico, fija su nombre fijo, conserva la información ya guardada
	// y prepara ese lookup; si no, refresca el lookup de responsabilidades conservando la actual. En ambos
	// casos marca el flag de edición y sincroniza columnas con syncResponsabilidadCargoColumnas.
	onResponsabilidadCargoEditingStart(e: any): void {
		if (e?.data?._esImpactoEconomico) {
			this.responsabilidadesCargoInsertando = false;
			e.data.NOMBRE_RESPONSABILIDAD = IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR;
			// Al entrar a editar, conserva INFORMACION ya guardada; no la sobrescribe con el catálogo.
			e.data.INFORMACION = (
				e.data.INFORMACION ??
				this.model?.DESCRIPCION_IMPACTO_ECONOMICO ??
				''
			).trim();
			this.prepararImpactosLookupParaEdicion();
			this.responsabilidadesCargoEditando = true;
			this.syncResponsabilidadCargoColumnas();
			return;
		}

		this.responsabilidadesCargoInsertando = !!e?.data?._esNuevo;
		this.actualizarResponsabilidadesCargoLookupDisponibles(Number(e?.data?.CORR_RESPONSABILIDAD) || null);
		this.responsabilidadesCargoEditando = true;
		this.syncResponsabilidadCargoColumnas();
	}

	// Qué hace: bloquea la edición de nombre y correlativo de responsabilidad en la fila de impacto económico.
	// Cómo: si la celda pertenece a la fila de impacto económico y es NOMBRE_RESPONSABILIDAD o
	// CORR_RESPONSABILIDAD, fija el editor como readOnly y disabled.
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

	// Qué hace: reacciona a que el grid de responsabilidades terminó de guardar una fila.
	// Cómo: delega en finalizarEdicionGrid, que limpia los flags de edición e inserción.
	onResponsabilidadCargoSaved(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.responsabilidadesCargoEditando = false;
			this.responsabilidadesCargoInsertando = false;
		});
	}

	// Qué hace: reacciona a que se canceló la edición del grid de responsabilidades.
	// Cómo: delega en finalizarEdicionGrid para limpiar los flags y recarga las responsabilidades con
	// cargarResponsabilidadesCargo.
	onResponsabilidadCargoEditCanceled(e: any): void {
		this.finalizarEdicionGrid(e, () => {
			this.responsabilidadesCargoEditando = false;
			this.responsabilidadesCargoInsertando = false;
		});
		this.cargarResponsabilidadesCargo(true);
	}

	// Qué hace: valida los datos de la fila de responsabilidad de cargo (o impacto económico) antes de guardarla.
	// Cómo: si es la fila de impacto económico, solo valida la longitud de la información y normaliza sus
	// campos; si no, verifica que haya responsabilidad seleccionada, nombre no vacío (máx. 150 caracteres),
	// información (máx. 255) y que no esté duplicada, invalidando la fila con invalidarFila cuando corresponde.
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

	// Qué hace: inserta una nueva responsabilidad de cargo desde el grid.
	// Cómo: si la fila es la de impacto económico, cancela (esa fila no se inserta); si no, llama a
	// persistirResponsabilidadCargoDesdeGrid (create) con esNuevo en true.
	responsabilidadCargoRowInserting(e: any): void {
		if (e?.data?._esImpactoEconomico) {
			e.cancel = true;
			return;
		}
		e.cancel = this.persistirResponsabilidadCargoDesdeGrid(e.data, true);
	}

	// Qué hace: actualiza una responsabilidad de cargo o la fila de impacto económico desde el grid.
	// Cómo: si es la fila de impacto económico, completa sus datos y llama a persistirImpactoEconomicoDesdeGrid
	// (update); si no, combina datos viejos y nuevos y llama a persistirResponsabilidadCargoDesdeGrid (update)
	// con esNuevo en false.
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

	// Qué hace: elimina una responsabilidad de cargo desde el grid.
	// Cómo: si la fila es la de impacto económico, cancela (esa fila no se elimina); si no, llama a
	// eliminarResponsabilidadCargoDesdeGrid (delete) con los datos de la fila.
	responsabilidadCargoRowRemoving(e: any): void {
		if (e?.data?._esImpactoEconomico) {
			e.cancel = true;
			return;
		}
		e.cancel = this.eliminarResponsabilidadCargoDesdeGrid(e.data);
	}

	// Qué hace: define el texto que se muestra en la columna de catálogo de responsabilidad de cargo.
	// Cómo: devuelve vacío para la fila de impacto económico; para el resto, el correlativo como texto.
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

	// Qué hace: define el texto que se muestra en la columna de código del detalle de responsabilidad.
	// Cómo: devuelve vacío para la fila de impacto económico; para el resto, el correlativo del catálogo
	// (parte de la llave natural) como texto.
	responsabilidadCargoCodigoDisplay = (row: ScDescriptorPuestoResponsabilidadCargo): string => {
		if (row?._esImpactoEconomico) {
			return '';
		}
		const corr = Number(row?.CORR_RESPONSABILIDAD);
		return corr > 0 ? String(corr) : '';
	};

	// Qué hace: define el texto que se muestra en la columna de información de la responsabilidad.
	// Cómo: devuelve el campo INFORMACION de la fila, recortado de espacios.
	responsabilidadCargoInformacionDisplay = (row: ScDescriptorPuestoResponsabilidadCargo): string => {
		return (row?.INFORMACION ?? '').trim();
	};

	// Qué hace: aplica el cambio de impacto económico elegido en el lookup de la fila especial de impacto.
	// Cómo: busca la descripción en el catálogo (o en la lista de edición) para actualizar la fila.
	onImpactoEconomicoLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_IMPACTO_ECONOMICO.find(
			(item) => Number(item.CORR_IMPACTO_ECONOMICO) === Number(corr)
		);
		const fromEdit = this.mCORR_IMPACTO_ECONOMICO_EDIT.find(
			(item) => Number(item.CORR_IMPACTO_ECONOMICO) === Number(corr)
		);

		// Al elegir impacto económico, copia el nombre actual del catálogo a la fila.
		// No usar el texto viejo guardado en el descriptor si el catálogo cambió.
		const descripcion =
			corr == null
				? ''
				: (
						fromCatalog?.DESCRIPCION_CATALOGO ??
						fromCatalog?.DESCRIPCION ??
						fromEdit?.DESCRIPCION_CATALOGO ??
						''
				  ).trim();

		const live = (this.responsabilidadesCargo || []).find((row) => row._esImpactoEconomico);
		if (live) {
			live.CORR_IMPACTO_ECONOMICO = corr;
			live.NOMBRE_RESPONSABILIDAD = IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR;
			live.INFORMACION = descripcion;
		}

		if (cellInfo?.data) {
			cellInfo.data.CORR_IMPACTO_ECONOMICO = corr;
			cellInfo.data.NOMBRE_RESPONSABILIDAD = IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR;
			cellInfo.data.INFORMACION = descripcion;
		}
		cellInfo.setValue(descripcion);
		this.prepararImpactosLookupParaEdicion();
	}

	// Arma el lookup de responsabilidades según formato del descriptor y las ya asignadas.
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

	// Convierte APLICA_DESCRIPTOR a C, E o A para saber si aplica al formato actual.
	private normalizarAplicabilidadResponsabilidad(value: string | null | undefined): string {
		const aplica = (value ?? 'AMBOS').trim().toUpperCase();
		return aplica === 'CORTO' || aplica === 'EXTENSO' || aplica === 'AMBOS' ? aplica : 'AMBOS';
	}

	// Qué hace: indica si una responsabilidad del catálogo aplica al formato actual del descriptor (corto/extenso/ambos).
	// Cómo: si el descriptor está en formato AMBOS, todas aplican; si no, normaliza el valor con
	// normalizarAplicabilidadResponsabilidad y lo compara contra 'AMBOS' o el formato actual.
	private responsabilidadAplicaAlFormato(value: string | null | undefined): boolean {
		const formato = (this.model?.FORMATO ?? FORMATO_CORTO).trim().toUpperCase();
		if (formato === FORMATO_AMBOS) {
			return true;
		}
		const aplica = this.normalizarAplicabilidadResponsabilidad(value);
		return aplica === 'AMBOS' || aplica === formato;
	}

	// Qué hace: aplica el cambio de responsabilidad de cargo elegida en el lookup de la fila.
	// Cómo: normaliza el valor, lo fija en la celda con setValue y repinta la fila con repintarFilaResponsabilidadCargoLookup.
	onResponsabilidadCargoLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
		this.repintarFilaResponsabilidadCargoLookup(cellInfo);
	}

	// Tras elegir responsabilidad, vuelve a dibujar la fila para mostrar nombre e información.
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

	// Qué hace: fija el valor de responsabilidad de cargo y sus datos al editar la celda directamente en el grid.
	// Cómo: busca el nombre y la aplicabilidad en el catálogo y actualiza CORR_RESPONSABILIDAD,
	// NOMBRE_RESPONSABILIDAD y APLICA_DESCRIPTOR en los nuevos datos de la fila.
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

	// Qué hace: aplica el cambio de edad mínima del perfil.
	// Cómo: si no está bloqueado y el perfil está en edición, normaliza el valor con normalizarEdadPerfil
	// y lo guarda en perfil.EDAD_MINIMA.
	onPerfilEdadMinimaChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.EDAD_MINIMA = this.normalizarEdadPerfil(e?.value);
	}

	// Qué hace: aplica el cambio de edad máxima del perfil.
	// Cómo: si no está bloqueado y el perfil está en edición, normaliza el valor con normalizarEdadPerfil
	// y lo guarda en perfil.EDAD_MAXIMA.
	onPerfilEdadMaximaChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.EDAD_MAXIMA = this.normalizarEdadPerfil(e?.value);
	}

	// Qué hace: aplica el cambio de sexo requerido en el perfil.
	// Cómo: si no está bloqueado y el perfil está en edición, guarda el valor recibido en mayúsculas
	// (o el valor por defecto) en perfil.SEXO.
	onPerfilSexoChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.SEXO = `${e?.value ?? PERFIL_PUESTO_DEFAULT.SEXO}`.trim().toUpperCase();
	}

	// Qué hace: aplica el cambio de estado familiar requerido en el perfil.
	// Cómo: si no está bloqueado y el perfil está en edición, guarda el valor recibido en mayúsculas
	// (o el valor por defecto) en perfil.ESTADO_FAMILIAR.
	onPerfilEstadoFamiliarChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.ESTADO_FAMILIAR = `${e?.value ?? PERFIL_PUESTO_DEFAULT.ESTADO_FAMILIAR}`.trim().toUpperCase();
	}

	// Qué hace: aplica el cambio de disponibilidad horaria elegida en el lookup del perfil.
	// Cómo: si no está bloqueado y el perfil está en edición, busca el nombre en el catálogo (o en la
	// lista de edición), lo guarda junto al correlativo en el perfil y refresca el lookup de disponibilidad.
	onPerfilDisponibilidadChanged(value: number | null): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		const corr = value != null && value > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_DISPONIBILIDAD_HORARIO.find(
			(row) => Number(row.CORR_DISPONIBILIDAD_HORARIO) === Number(corr)
		);
		const fromEdit = this.mCORR_DISPONIBILIDAD_HORARIO_EDIT.find(
			(row) => Number(row.CORR_DISPONIBILIDAD_HORARIO) === Number(corr)
		);
		this.perfil.CORR_DISPONIBILIDAD_HORARIO = corr;
		// Al elegir en el select, copia el nombre actual del catálogo a la fila del perfil.
		this.perfil.NOMBRE_DISPONIBILIDAD_HORARIO =
			corr == null
				? ''
				: (
						fromCatalog?.NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO ??
						fromCatalog?.NOMBRE_DISPONIBILIDAD_HORARIO ??
						fromEdit?.NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO ??
						''
				  ).trim();
		this.prepararDisponibilidadLookupParaPerfil();
	}

	// Qué hace: aplica el cambio de modalidad elegida en el lookup del perfil.
	// Cómo: si no está bloqueado y el perfil está en edición, busca el nombre en el catálogo (o en la
	// lista de edición), lo guarda junto al correlativo en el perfil y refresca el lookup de modalidad.
	onPerfilModalidadChanged(value: number | null): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		const corr = value != null && value > 0 ? Number(value) : null;
		const fromCatalog = this.mCORR_TIPO_MODALIDAD.find(
			(row) => Number(row.CORR_TIPO_MODALIDAD) === Number(corr)
		);
		const fromEdit = this.mCORR_TIPO_MODALIDAD_EDIT.find(
			(row) => Number(row.CORR_TIPO_MODALIDAD) === Number(corr)
		);
		this.perfil.CORR_TIPO_MODALIDAD = corr;
		this.perfil.NOMBRE_MODALIDAD =
			corr == null
				? ''
				: (
						fromCatalog?.MODALIDAD_NOMBRE_CATALOGO ??
						fromCatalog?.MODALIDAD_NOMBRE ??
						fromEdit?.MODALIDAD_NOMBRE_CATALOGO ??
						''
				  ).trim();
		this.prepararModalidadLookupParaPerfil();
	}

	// Qué hace: aplica el cambio de la casilla de licencia requerida en el perfil.
	// Cómo: si no está bloqueado y el perfil está en edición, guarda en perfil.LICENCIA si el valor es exactamente true.
	onPerfilLicenciaChanged(e: any): void {
		if (this.readOnly || !this.perfilEditando) {
			return;
		}
		this.perfil.LICENCIA = e?.value === true;
	}

	// Qué hace: habilita la edición del perfil del puesto.
	// Cómo: si no está bloqueado y el descriptor ya está guardado, respalda el perfil original, prepara
	// los lookups de disponibilidad y modalidad, y marca perfilEditando en true.
	editarPerfil(): void {
		if (this.readOnly || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.perfilOriginal = { ...this.perfil };
		this.prepararDisponibilidadLookupParaPerfil();
		this.prepararModalidadLookupParaPerfil();
		this.perfilEditando = true;
	}

	// Valida el perfil, lo guarda en la API y actualiza el correlativo que usan educación, experiencia y competencias.
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

					const saved = response.Data as ScPerfilPuesto;
					if (saved) {
						this.perfil = { ...this.perfil, ...saved };
					} else if (Number(response?.CodeHelper) > 0) {
						this.perfil.CORR_PERFIL_PUESTO = Number(response.CodeHelper);
					}
					this.perfilExiste = Number(this.perfil.CORR_PERFIL_PUESTO) > 0;
					this.perfilOriginal = { ...this.perfil };
					this.prepararDisponibilidadLookupParaPerfil();
					this.prepararModalidadLookupParaPerfil();
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

	// Cancela cambios del perfil restaurando la copia guardada al iniciar la edición.
	cancelarEdicionPerfil(): void {
		if (!this.perfilEditando) {
			return;
		}
		this.perfil = { ...this.perfilOriginal };
		this.prepararDisponibilidadLookupParaPerfil();
		this.prepararModalidadLookupParaPerfil();
		this.perfilEditando = false;
	}

	// Convierte la edad del perfil a número; si no es válida, devuelve null.
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

	// Vacía perfil, educación, experiencia y competencias al cambiar de descriptor o cancelar.
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
		this.prepararModalidadLookupParaPerfil();
		this.actualizarCompetenciasTecnicasLookupDisponibles();
		this.actualizarCompetenciasConductualesLookupDisponibles();
	}

	// Consulta el perfil del descriptor y luego sus detalles.
	// Ignora respuestas tardías si el usuario ya seleccionó otro descriptor.
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
							NOMBRE_MODALIDAD: row.NOMBRE_MODALIDAD ?? '',
							LICENCIA: row.LICENCIA ?? PERFIL_PUESTO_DEFAULT.LICENCIA,
						};
						this.perfilOriginal = { ...this.perfil };
						this.perfilEditando = false;
						this.perfilExiste = true;
						this.prepararDisponibilidadLookupParaPerfil();
						this.prepararModalidadLookupParaPerfil();
						this.cargarEducacion(forzar);
						this.cargarExperiencia(forzar);
						this.cargarCompetenciasTecnicas(forzar);
						this.cargarCompetenciasConductuales(forzar);
						return;
					}

					// Cada descriptor tiene un perfil: si no existe, prepara uno local con valores por defecto.
					this.crearPerfilPorDefecto(corrDescriptor, loadSeq, forzar);
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Si no hay perfil en la base de datos, crea un objeto local vacío para mostrar la sección.
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

					const saved = response.Data as ScPerfilPuesto;
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

	// Carga educación del perfil; ignora la respuesta si el usuario ya cambió de descriptor.
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

	// Carga experiencia del perfil; ignora la respuesta si el usuario ya cambió de descriptor.
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

	// Consulta competencias técnicas del perfil y actualiza el lookup de opciones disponibles.
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
								NOMBRE_COMPETENCIAS_TECNICAS: item.NOMBRE_COMPETENCIAS_TECNICAS ?? '',
								CODIGO_COMPETENCIAS_TECNICAS: item.CODIGO_COMPETENCIAS_TECNICAS ?? '',
								DESCRIPCION: item.DESCRIPCION ?? '',
								NIVEL_DOMINIO: (item.NIVEL_DOMINIO ?? 'BASICO').toUpperCase(),
								CORR_COMPETENCIAS_TECNICAS: item.CORR_COMPETENCIAS_TECNICAS ?? null,
								_esNuevo: false,
								_clientKey: item.CORR_COMPETENCIAS_TECNICAS || this.crearClientKey('ct'),
							})
						);
						this.actualizarCompetenciasTecnicasLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Consulta competencias conductuales del perfil y actualiza el lookup de opciones disponibles.
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
								NOMBRE_COMPETENCIAS_CONDUCTUALES: item.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '',
								DESCRIPCION: item.DESCRIPCION ?? '',
								CORR_COMPETENCIAS_CONDUCTUALES: item.CORR_COMPETENCIAS_CONDUCTUALES ?? null,
								CODIGO_TIPO_PUESTO: item.CODIGO_TIPO_PUESTO ?? '',
								_esNuevo: false,
								_clientKey: item.CORR_COMPETENCIAS_CONDUCTUALES || this.crearClientKey('cc'),
							})
						);
						this.actualizarCompetenciasConductualesLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Carga requerimientos del descriptor y actualiza el lookup; algunas filas se arman en pantalla.
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
								DESCRIPCION: item.DESCRIPCION ?? '',
								CORR_REQUERIMIENTO_ORGANIZACIONAL: item.CORR_REQUERIMIENTO_ORGANIZACIONAL ?? null,
								_esNuevo: false,
								_clientKey:
									item.CORR_REQUERIMIENTO_ORGANIZACIONAL || this.crearClientKey('ro'),
							})
						);
						this.actualizarRequerimientosOrganizacionalesLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Consulta riesgos del descriptor (formato extenso) y actualiza el lookup disponible.
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
							NOMBRE_RIESGO_PUESTO: item.NOMBRE_RIESGO_PUESTO ?? '',
							INFORMACION: item.INFORMACION ?? '',
							CORR_RIESGO_PUESTO: item.CORR_RIESGO_PUESTO ?? null,
							_esNuevo: false,
							_clientKey: item.CORR_RIESGO_PUESTO || this.crearClientKey('rp'),
						}));
					this.actualizarRiesgosPuestoLookupDisponibles();
				}
			},
			error: (error) => this.notifyApiError(error),
		});
	}

	// Consulta las inducciones (entrenamiento) del descriptor y actualiza el lookup disponible.
	private cargarInduccionesDescriptor(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.induccionesDescriptor = [];
			this.resetearEdicionInducciones();
			this.actualizarInduccionesLookupDisponibles();
			return;
		}

		const loadSeq = ++this.induccionesLoadSeq;
		this.service
			.getInduccionesDescriptor(corrDescriptor)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (loadSeq !== this.induccionesLoadSeq) {
						return;
					}

					if (response?.Result && Array.isArray(response.Data)) {
						this.resetearEdicionInducciones();
						this.induccionesDescriptor = response.Data.map((item: ScDescriptorPuestoInduccion) => ({
							CORR_DESCRIPTOR_PUESTO: item.CORR_DESCRIPTOR_PUESTO ?? corrDescriptor,
							CORR_INDUCCION: item.CORR_INDUCCION ?? null,
							NOMBRE_INDUCCION: item.NOMBRE_INDUCCION ?? '',
							TIEMPO_INDUCCION: item.TIEMPO_INDUCCION ?? null,
							UNIDAD_TIEMPO: item.UNIDAD_TIEMPO ?? null,
							_esNuevo: false,
							_clientKey: item.CORR_INDUCCION || this.crearClientKey('ind'),
						}));
						this.actualizarInduccionesLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Consulta responsabilidades y agrega la fila de impacto económico al grid.
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
								NOMBRE_RESPONSABILIDAD: item.NOMBRE_RESPONSABILIDAD ?? '',
								INFORMACION: item.INFORMACION ?? '',
								APLICA_DESCRIPTOR: this.normalizarAplicabilidadResponsabilidad(
									item.APLICA_DESCRIPTOR
								),
								CORR_RESPONSABILIDAD: item.CORR_RESPONSABILIDAD ?? null,
								_esNuevo: false,
								_clientKey: item.CORR_RESPONSABILIDAD || this.crearClientKey('rc'),
							})
						).filter((item) => this.responsabilidadAplicaAlFormato(item.APLICA_DESCRIPTOR));
						this.responsabilidadesCargo = [...filas, this.crearFilaImpactoEconomico()];
						this.prepararImpactosLookupParaEdicion();
						this.actualizarResponsabilidadesCargoLookupDisponibles();
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Qué hace: construye la fila especial de impacto económico que se agrega al grid de responsabilidades.
	// Cómo: arma un objeto con los datos de impacto económico tomados del modelo del descriptor y la
	// marca con _esImpactoEconomico y una clave de cliente fija (IMPACTO_ECONOMICO_CLIENT_KEY).
	private crearFilaImpactoEconomico(): ScDescriptorPuestoResponsabilidadCargo {
		return {
			CORR_DESCRIPTOR_PUESTO: Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0,
			CORR_RESPONSABILIDAD: null,
			NOMBRE_RESPONSABILIDAD: IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR,
			INFORMACION: (this.model?.DESCRIPCION_IMPACTO_ECONOMICO ?? '').trim(),
			CORR_IMPACTO_ECONOMICO: this.model?.CORR_IMPACTO_ECONOMICO ?? null,
			_esImpactoEconomico: true,
			_clientKey: IMPACTO_ECONOMICO_CLIENT_KEY,
		};
	}

	// Impactos activos del catálogo más el ya guardado (aunque esté inactivo).
	// DESCRIPCION en la fila puede ser el texto cerrado del descriptor; DESCRIPCION_CATALOGO es el del popup.
	private prepararImpactosLookupParaEdicion(): void {
		const porCorr = new Map<number, ScImpactoEconomicoLookupItem>();

		for (const item of this.mCORR_IMPACTO_ECONOMICO ?? []) {
			const corr = Number(item.CORR_IMPACTO_ECONOMICO);
			if (corr > 0) {
				const descripcionCatalogo = (item.DESCRIPCION_CATALOGO ?? item.DESCRIPCION ?? '').trim();
				porCorr.set(corr, {
					CORR_IMPACTO_ECONOMICO: corr,
					DESCRIPCION: descripcionCatalogo,
					DESCRIPCION_CATALOGO: descripcionCatalogo,
				});
			}
		}

		const filaImpacto = (this.responsabilidadesCargo || []).find((row) => row._esImpactoEconomico);
		const corrAsociada = Number(
			filaImpacto?.CORR_IMPACTO_ECONOMICO ?? this.model?.CORR_IMPACTO_ECONOMICO
		);
		const descDescriptor = (
			filaImpacto?.INFORMACION ??
			this.model?.DESCRIPCION_IMPACTO_ECONOMICO ??
			''
		).trim();

		if (corrAsociada > 0) {
			const existente = porCorr.get(corrAsociada);
			if (existente) {
				porCorr.set(corrAsociada, {
					CORR_IMPACTO_ECONOMICO: corrAsociada,
					DESCRIPCION: descDescriptor || existente.DESCRIPCION,
					DESCRIPCION_CATALOGO: existente.DESCRIPCION_CATALOGO || existente.DESCRIPCION,
				});
			} else {
				porCorr.set(corrAsociada, {
					CORR_IMPACTO_ECONOMICO: corrAsociada,
					DESCRIPCION: descDescriptor || `Impacto ${corrAsociada}`,
					DESCRIPCION_CATALOGO: descDescriptor || `Impacto ${corrAsociada}`,
				});
			}
		}

		this.mCORR_IMPACTO_ECONOMICO_EDIT = Array.from(porCorr.values()).sort(
			(a, b) => Number(a.CORR_IMPACTO_ECONOMICO) - Number(b.CORR_IMPACTO_ECONOMICO)
		);
	}

	// Recarga secciones según formato: KPI en corto; funciones y relaciones en extenso.
	// Con forzar=true vuelve a consultar tras guardar una fila.
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
						this.kpis = response.Data.map((item: ScDescriptorPuestoKpiFuncion) => ({
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

	// Frecuencias activas más la de la fila KPI en edición (aunque esté inactiva).
	// NOMBRE_FRECUENCIA en la fila puede ser el texto cerrado del KPI; NOMBRE_FRECUENCIA_CATALOGO es el del popup.
	private prepararFrecuenciasLookupParaEdicionKpi(row?: ScDescriptorPuestoKpiFuncion | null): void {
		const fila = this.resolverFilaKpi(row);
		const porCorr = new Map<number, ScFrecuenciaLookup>();

		for (const item of this.mCORR_FRECUENCIA ?? []) {
			const corr = Number(item.CORR_FRECUENCIA);
			if (corr > 0) {
				const nombreCatalogo = (
					item.NOMBRE_FRECUENCIA_CATALOGO ??
					item.NOMBRE_FRECUENCIA ??
					''
				).trim();
				porCorr.set(corr, {
					CORR_FRECUENCIA: corr,
					NOMBRE_FRECUENCIA: nombreCatalogo,
					NOMBRE_FRECUENCIA_CATALOGO: nombreCatalogo,
				});
			}
		}

		const corrAsociada = Number(fila?.CORR_FRECUENCIA);
		const nombreDescriptor = (fila?.NOMBRE_FRECUENCIA ?? '').trim();
		if (corrAsociada > 0) {
			const existente = porCorr.get(corrAsociada);
			if (existente) {
				porCorr.set(corrAsociada, {
					CORR_FRECUENCIA: corrAsociada,
					NOMBRE_FRECUENCIA: nombreDescriptor || existente.NOMBRE_FRECUENCIA,
					NOMBRE_FRECUENCIA_CATALOGO:
						existente.NOMBRE_FRECUENCIA_CATALOGO || existente.NOMBRE_FRECUENCIA,
				});
			} else {
				porCorr.set(corrAsociada, {
					CORR_FRECUENCIA: corrAsociada,
					NOMBRE_FRECUENCIA: nombreDescriptor || `Frecuencia ${corrAsociada}`,
					NOMBRE_FRECUENCIA_CATALOGO: nombreDescriptor || `Frecuencia ${corrAsociada}`,
				});
			}
		}

		this.mCORR_FRECUENCIA_KPI_EDIT = Array.from(porCorr.values()).sort(
			(a, b) => Number(a.CORR_FRECUENCIA) - Number(b.CORR_FRECUENCIA)
		);
	}

	// Qué hace: localiza en memoria el KPI real que corresponde a una fila del grid, si existe.
	// Cómo: busca en this.kpis por _clientKey (fila nueva) o por CORR_KPI_FUNCION (fila existente);
	// si no lo encuentra, devuelve la misma fila recibida.
	private resolverFilaKpi(row?: ScDescriptorPuestoKpiFuncion | null): ScDescriptorPuestoKpiFuncion | null {
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

	// Disponibilidades activas más la ya asociada al perfil (aunque esté inactiva).
	// NOMBRE en la fila puede ser el texto cerrado del perfil; NOMBRE_..._CATALOGO es el del popup.
	private prepararDisponibilidadLookupParaPerfil(): void {
		const porCorr = new Map<number, ScDisponibilidadHorarioLookup>();

		for (const item of this.mCORR_DISPONIBILIDAD_HORARIO ?? []) {
			const corr = Number(item.CORR_DISPONIBILIDAD_HORARIO);
			if (corr > 0) {
				const nombreCatalogo = (
					item.NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO ??
					item.NOMBRE_DISPONIBILIDAD_HORARIO ??
					''
				).trim();
				porCorr.set(corr, {
					CORR_DISPONIBILIDAD_HORARIO: corr,
					NOMBRE_DISPONIBILIDAD_HORARIO: nombreCatalogo,
					NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO: nombreCatalogo,
				});
			}
		}

		const corrAsociada = Number(this.perfil?.CORR_DISPONIBILIDAD_HORARIO);
		const nombreDescriptor = (this.perfil?.NOMBRE_DISPONIBILIDAD_HORARIO ?? '').trim();
		if (corrAsociada > 0) {
			const existente = porCorr.get(corrAsociada);
			if (existente) {
				porCorr.set(corrAsociada, {
					CORR_DISPONIBILIDAD_HORARIO: corrAsociada,
					NOMBRE_DISPONIBILIDAD_HORARIO: nombreDescriptor || existente.NOMBRE_DISPONIBILIDAD_HORARIO,
					NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO:
						existente.NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO ||
						existente.NOMBRE_DISPONIBILIDAD_HORARIO,
				});
			} else {
				porCorr.set(corrAsociada, {
					CORR_DISPONIBILIDAD_HORARIO: corrAsociada,
					NOMBRE_DISPONIBILIDAD_HORARIO: nombreDescriptor || `Disponibilidad ${corrAsociada}`,
					NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO:
						nombreDescriptor || `Disponibilidad ${corrAsociada}`,
				});
			}
		}

		this.mCORR_DISPONIBILIDAD_HORARIO_EDIT = Array.from(porCorr.values()).sort(
			(a, b) => Number(a.CORR_DISPONIBILIDAD_HORARIO) - Number(b.CORR_DISPONIBILIDAD_HORARIO)
		);
	}

	// Modalidades activas más la ya asociada al perfil (aunque esté inactiva).
	private prepararModalidadLookupParaPerfil(): void {
		const porCorr = new Map<number, ScTipoModalidadLookup>();

		for (const item of this.mCORR_TIPO_MODALIDAD ?? []) {
			const corr = Number(item.CORR_TIPO_MODALIDAD);
			if (corr > 0) {
				const nombreCatalogo = (item.MODALIDAD_NOMBRE_CATALOGO ?? item.MODALIDAD_NOMBRE ?? '').trim();
				porCorr.set(corr, {
					CORR_TIPO_MODALIDAD: corr,
					MODALIDAD_NOMBRE: nombreCatalogo,
					MODALIDAD_NOMBRE_CATALOGO: nombreCatalogo,
				});
			}
		}

		const corrAsociada = Number(this.perfil?.CORR_TIPO_MODALIDAD);
		const nombreDescriptor = (this.perfil?.NOMBRE_MODALIDAD ?? '').trim();
		if (corrAsociada > 0) {
			const existente = porCorr.get(corrAsociada);
			if (existente) {
				porCorr.set(corrAsociada, {
					CORR_TIPO_MODALIDAD: corrAsociada,
					MODALIDAD_NOMBRE: nombreDescriptor || existente.MODALIDAD_NOMBRE,
					MODALIDAD_NOMBRE_CATALOGO:
						existente.MODALIDAD_NOMBRE_CATALOGO || existente.MODALIDAD_NOMBRE,
				});
			} else {
				porCorr.set(corrAsociada, {
					CORR_TIPO_MODALIDAD: corrAsociada,
					MODALIDAD_NOMBRE: nombreDescriptor || `Modalidad ${corrAsociada}`,
					MODALIDAD_NOMBRE_CATALOGO: nombreDescriptor || `Modalidad ${corrAsociada}`,
				});
			}
		}

		this.mCORR_TIPO_MODALIDAD_EDIT = Array.from(porCorr.values()).sort(
			(a, b) => Number(a.CORR_TIPO_MODALIDAD) - Number(b.CORR_TIPO_MODALIDAD)
		);
	}

	// Arma el lookup de inducciones dejando solo las que aún no están en el descriptor.
	private actualizarInduccionesLookupDisponibles(corrConservar: number | null = null): void {
		const usadas = new Set(
			(this.induccionesDescriptor || [])
				.map((row) => Number(row.CORR_INDUCCION))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		this.mCORR_INDUCCION_DISPONIBLES = (this.mCORR_INDUCCION || []).filter((item) => {
			const corr = Number(item.CORR_INDUCCION);
			if (!(corr > 0)) {
				return false;
			}
			if (corrConservar != null && corr === Number(corrConservar)) {
				return true;
			}
			return !usadas.has(corr);
		});
	}

	// Consulta funciones clave y calcula cuántas actividades tiene cada una.
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
								(item: ScDescriptorPuestoFuncion) =>
									(item.TIPO_FUNCION ?? TIPO_FUNCION_CLAVE).trim().toUpperCase() ===
									TIPO_FUNCION_CLAVE
							)
							.map((item: ScDescriptorPuestoFuncion) => ({
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

	// Consulta las actividades de la función clave seleccionada en el popup.
	private cargarActividadesPopup(funcion: ScDescriptorPuestoFuncion): void {
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
						this.actividadesPopup = (response.Data ?? []).map((item: ScDescriptorPuestoFuncionActividad) => ({
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

	// Actualiza en el grid cuántas actividades tiene la función clave.
	private actualizarContadorActividades(funcion: ScDescriptorPuestoFuncion): void {
		funcion.CANT_ACTIVIDADES = this.actividadesPopup.length;
	}

	// Consulta funciones secundarias; solo aplica en formato corto.
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
								(item: ScDescriptorPuestoFuncion) =>
									(item.TIPO_FUNCION ?? '').trim().toUpperCase() === TIPO_FUNCION_SECUNDARIA
							)
							.map((item: ScDescriptorPuestoFuncion) => ({
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

	// Consulta relaciones laborales internas; solo aplica en formato extenso.
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
								(item: ScDescriptorPuestoRelacionLaboral) =>
									(item.TIPO_RELACION ?? '').trim().toUpperCase() === TIPO_RELACION_INTERNA
							)
							.map((item: ScDescriptorPuestoRelacionLaboral) => ({
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

	// Consulta relaciones laborales externas; solo aplica en formato extenso.
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
								(item: ScDescriptorPuestoRelacionLaboral) =>
									(item.TIPO_RELACION ?? '').trim().toUpperCase() === TIPO_RELACION_EXTERNA
							)
							.map((item: ScDescriptorPuestoRelacionLaboral) => ({
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

	// Qué hace: indica si la pestaña de bitácora tiene registros para mostrar.
	// Cómo: verifica que itemsTabBitacora sea un arreglo con al menos un elemento.
	get tieneBitacora(): boolean {
		return Array.isArray(this.itemsTabBitacora) && this.itemsTabBitacora.length > 0;
	}

	// Qué hace: define el mensaje a mostrar cuando la bitácora está vacía.
	// Cómo: si el descriptor aún no tiene correlativo, indica que debe guardarse primero; si ya existe,
	// indica que no hay registros por el momento.
	get mensajeBitacoraVacia(): string {
		if (!this.model?.CORR_DESCRIPTOR_PUESTO) {
			return 'La bitácora estará disponible después de guardar el descriptor.';
		}

		return 'No hay registros en la bitácora por el momento.';
	}

	// Al cambiar formato: cancela ediciones abiertas, limpia secciones que ya no aplican y elige la primera pestaña válida.
	onFormatoChanged(value: string, formatoAnteriorHint?: string): void {
		const formatoNuevo = (value || FORMATO_CORTO).toUpperCase();
		// El formulario a veces ya actualizó FORMATO en el modelo; previousValue puede venir vacío.
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
				// Si el formato vuelve a mostrar la pestaña actual, restáurala y oculta el aviso.
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

		// Recarga funciones secundarias solo si el usuario cambió el formato, no por sincronización del formulario.
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

	// Si hay ediciones abiertas, revierte FORMATO en modelo y formulario al valor anterior.
	// Cómo: conserva EXTENSO o AMBOS tal cual; cualquier otro valor cae a CORTO por defecto.
	private restaurarFormatoAnterior(formatoAnterior: string): void {
		const formato =
			formatoAnterior === FORMATO_EXTENSO || formatoAnterior === FORMATO_AMBOS
				? formatoAnterior
				: FORMATO_CORTO;
		this.sincronizandoHeader = true;
		this.model.FORMATO = formato;
		this.ultimoFormatoAplicado = formato;
		this.headerForm?.instance?.updateData('FORMATO', formato);
		setTimeout(() => {
			this.sincronizandoHeader = false;
		});
	}

	// Al cambiar formato, cancela la edición en grids de secciones que se ocultan.
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
	];

	// Devuelve si la pestaña de sección aplica al formato corto, extenso o ambos actual.
	// Cómo: en formato AMBOS se muestran las pestañas de ambos formatos a la vez.
	private esTabSeccionVisibleParaFormato(index: number, formato: string): boolean {
		const tab = this.seccionesTabsMeta[index];
		if (!tab) {
			return false;
		}
		const fmt = (formato || '').toUpperCase();
		const esAmbos = fmt === FORMATO_AMBOS;
		const esCorta = fmt === FORMATO_CORTO || esAmbos;
		const esExtensa = fmt === FORMATO_EXTENSO || esAmbos;
		if (tab.visibleEn === 'ambos') {
			return true;
		}
		if (tab.visibleEn === 'corta') {
			return esCorta;
		}
		return esExtensa;
	}

	// Muestra la pestaña de sección indicada y actualiza el TabPanel.
	private seleccionarTabSeccion(index: number): void {
		this.subTabIndex = index;
		this.ultimoTabSeccionValido = index;
		setTimeout(() => {
			this.subTabIndex = index;
			this.tabPanelSecciones?.instance?.option('selectedIndex', index);
		});
	}

	// Oculta pestañas de sección y muestra el aviso de seleccionar una pestaña.
	private dejarSinTabSeccionSeleccionado(): void {
		this.subTabIndex = -1;
		setTimeout(() => {
			this.subTabIndex = -1;
			this.tabPanelSecciones?.instance?.option('selectedIndex', -1);
		});
	}

	// Al elegir una pestaña válida, actualiza el índice y oculta el aviso.
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

	// Al cambiar unidad, limpia puesto y reporta para obligar a elegirlos de nuevo.
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

	// Al elegir puesto, copia reporta y responsable y valida que no haya otro descriptor abierto.
	// Cómo: ignora el segundo valueChange duplicado del lookup (selectionChanged + onValueChanged)
	// para no mostrar dos veces el aviso de descriptor existente.
	onPuestoChanged(value: number | null): void {
		if (this.omitirProximoCambioPuesto) {
			this.omitirProximoCambioPuesto = false;
			return;
		}
		// El lookup suele emitir dos valueChange seguidos al seleccionar una fila.
		this.omitirProximoCambioPuesto = true;
		setTimeout(() => {
			this.omitirProximoCambioPuesto = false;
		}, 0);

		const corrPuesto = value != null ? Number(value) : null;
		this.model.CORR_PUESTO = corrPuesto;
		if (corrPuesto != null && corrPuesto > 0) {
			this.puestoInvalido = false;
		}
		this.aplicarDatosPuestoSeleccionado(corrPuesto, true);
		this.validarDescriptorAbiertoPorPuesto(corrPuesto);
	}

	// Al crear, verifica que el puesto no tenga otro descriptor que impida una nueva versión.
	// Ignora respuestas tardías si el usuario ya eligió otro puesto.
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

	// Al elegir puesto reporta, actualiza el modelo y quita la marca de inválido.
	onPuestoReportaChanged(value: number | null): void {
		this.model.CORR_PUESTO_REPORTA = value;
		if (value != null && value > 0) {
			this.puestoReportaInvalido = false;
		}
	}

	// Reacciona a cambios del formulario de encabezado (por ejemplo FORMATO) sin bucles de sincronización.
	onHeaderFieldChanged(e: any): void {
		if (this.sincronizandoHeader) {
			return;
		}

		if (e?.dataField === 'FORMATO') {
			this.onFormatoChanged(e.value, e.previousValue);
		}
	}

	// Acción temporal del botón crear puesto hasta integrar el mantenimiento PLA_PUESTO.
	crearPuestoProximamente(): void {
		this.notifyFx('El mantenimiento de puestos (PLA_PUESTO) estara disponible proximamente.', NotifyType.Warning);
	}

	// Guarda el descriptor: bloquea si hay secciones en edición, copia datos del formulario y valida.
	// Luego llama a insert o update según corresponda.
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

	// Devuelve los nombres de secciones con una fila en edición (para bloquear guardar o cambiar formato).
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
			{ editando: this.induccionesEditando, nombre: 'Entrenamiento', tabIndex: 10 },
		];

		const pendientes = detalles.filter((detalle) => detalle.editando);
		const tabActual = pendientes.filter((detalle) => detalle.tabIndex === this.subTabIndex);
		const otrosTabs = pendientes.filter((detalle) => detalle.tabIndex !== this.subTabIndex);
		return [...tabActual, ...otrosTabs].map((detalle) => detalle.nombre);
	}

	// Arma el mensaje de aviso que indica qué secciones tienen edición pendiente.
	private crearMensajeEdicionesPendientes(detallesEnEdicion: string[], accion: string): string {
		const detalleActual = detallesEnEdicion[0];
		const detallesAdicionales = detallesEnEdicion.slice(1);
		const mensajeAdicional = detallesAdicionales.length > 0
			? ` Tambien hay ediciones pendientes en: ${detallesAdicionales.join(', ')}.`
			: '';
		return `Guarde o cancele la linea en edicion de ${detalleActual} antes de ${accion}.${mensajeAdicional}`;
	}

	// Qué hace: llama a insert o update del descriptor; al crear permanece en el formulario con tabs,
	// al editar vuelve a la tabla de descriptores.
	// Cómo: si isAdd, pasa a Update, carga tabs y sincroniza el encabezado; si no, pasa a Browse.
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

					if (isAdd) {
						// Crear: se queda en el descriptor en modo edición y muestra los tabs.
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
					} else {
						// Editar: vuelve a la tabla de descriptores.
						this.AsignaStatus(UpdateType.Browse);
					}

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

	// Qué hace: cancela la edición o creación del descriptor y restaura el registro previo en el grid.
	// Cómo: limpia el resaltado de validación del encabezado y llama al cancelar base, comparando por
	// CORR_DESCRIPTOR_PUESTO para ubicar la fila original.
	override cancelar(): void {
		this.limpiarEstadoValidacionHeader();
		super.cancelar((item: any) => item.CORR_DESCRIPTOR_PUESTO === this.modelUpdate.CORR_DESCRIPTOR_PUESTO);
	}

	// Quita el resaltado rojo de unidad, puesto y reporta en el encabezado.
	private limpiarEstadoValidacionHeader(): void {
		this.unidadInvalido = false;
		this.puestoInvalido = false;
		this.puestoReportaInvalido = false;
	}

	// Marca en rojo unidad, puesto o reporta cuando no cumplen la validación.
	private actualizarEstadoValidacionHeader(): void {
		const unidad = Number(this.model?.CORR_UNIDAD);
		const puesto = Number(this.model?.CORR_PUESTO);
		const reporta = Number(this.model?.CORR_PUESTO_REPORTA);

		this.unidadInvalido = Number.isNaN(unidad) || unidad <= 0;
		this.puestoInvalido = Number.isNaN(puesto) || puesto <= 0;
		this.puestoReportaInvalido = Number.isNaN(reporta) || reporta <= 0;
	}

	// Qué hace: aplica el registro del descriptor (agregado o actualizado) en el grid principal.
	// Cómo: si el dato recibido es un objeto, lo normaliza con fillData y completa NOMBRE_UNIDAD/NOMBRE_PUESTO
	// si faltan, antes de delegar en aplicarRegistroEnGrid del framework base; si no, delega directamente.
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

	// Qué hace: elimina el descriptor de puesto seleccionado en el grid.
	// Cómo: delega en rowRemovingMtto del framework base, indicando como deleteFn una llamada a
	// service.delete convertida a respuesta homogénea con convertirErrorOperacionEnRespuesta (delete).
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

	// Qué hace: pone la pantalla en modo solo lectura.
	// Cómo: marca readOnly en true y deshabilita la edición del formulario del encabezado.
	override bloquear(): void {
		this.readOnly = true;
		this.headerForm?.instance?.option('readOnly', true);
	}

	// Qué hace: habilita la edición del formulario del encabezado.
	// Cómo: marca readOnly en false y habilita el formulario, dejando como solo lectura los campos
	// CORR_DESCRIPTOR_PUESTO, VERSION y ESTADO_DESCRIPTOR que no deben modificarse manualmente.
	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.headerForm?.instance?.option('readOnly', false);
			this.headerForm?.instance?.getEditor('CORR_DESCRIPTOR_PUESTO')?.option('readOnly', true);
			this.headerForm?.instance?.getEditor('VERSION')?.option('readOnly', true);
			this.headerForm?.instance?.getEditor('ESTADO_DESCRIPTOR')?.option('readOnly', true);
		});
	}

	// Qué hace: pone el foco inicial en el campo FORMATO del encabezado.
	// Cómo: llama a focus sobre el editor de FORMATO del formulario.
	override setFocus(): void {
		setTimeout(() => {
			this.headerForm?.instance?.getEditor('FORMATO')?.focus();
		});
	}

	// Qué hace: obtiene el nombre de la unidad a partir de su correlativo.
	// Cómo: busca en el catálogo local MOCK_UNIDADES y devuelve NOMBRE_UNIDAD, o cadena vacía si no la encuentra.
	getNombreUnidad(corrUnidad: number | null | undefined): string {
		const corr = Number(corrUnidad);
		return MOCK_UNIDADES.find((item) => Number(item.CORR_UNIDAD) === corr)?.NOMBRE_UNIDAD ?? '';
	}

	// Qué hace: obtiene el nombre del puesto a partir de su correlativo.
	// Cómo: busca en el catálogo local MOCK_PUESTOS y devuelve NOMBRE_PUESTO, o cadena vacía si no lo encuentra.
	getNombrePuesto(corrPuesto: number | null | undefined): string {
		const corr = Number(corrPuesto);
		return MOCK_PUESTOS.find((item) => Number(item.CORR_PUESTO) === corr)?.NOMBRE_PUESTO ?? '';
	}

	// Muestra al usuario un aviso de regla de negocio (no error técnico).
	private notifyDescriptorWarning(message: string): void {
		this.notifyFx(message, NotifyType.Warning, { raw: true });
	}

	// Lee el mensaje de error de la respuesta de la API (varios formatos posibles).
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

	// Normaliza el texto del mensaje (minúsculas, sin acentos) para comparar reglas.
	private normalizarMensajeOperacion(message: string): string {
		return `${message ?? ''}`
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	}

	// Indica si la respuesta es aviso de negocio (duplicado, validación) y no error del servidor.
	private esAdvertenciaOperacion(value: any, operacion: 'guardar' | 'eliminar'): boolean {
		const errorCode = Number(value?.ErrorCode ?? value?.error?.ErrorCode);
		const message = this.normalizarMensajeOperacion(this.obtenerMensajeOperacion(value));

		// Códigos 4100 y 4101: aviso de negocio, no fallo técnico.
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

	// Muestra el mensaje de la API como aviso o como error según el tipo de respuesta.
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

	// Muestra errores de red o excepciones al guardar o eliminar.
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

	// Qué hace: convierte un error de red de guardar/eliminar en una respuesta homogénea cuando es un aviso de negocio.
	// Cómo: intercepta el error con catchError; si esAdvertenciaOperacion lo reconoce como aviso, devuelve un
	// observable con Result en false y el mensaje de contexto; si no, propaga el error original con throwError.
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

	// Utilidades comunes de los grids: marcar fila inválida, sincronizar formulario y cancelar edición.
	private invalidarFila(e: any, message: string): void {
		e.isValid = false;
		e.errorText = message;
		this.notifyDescriptorWarning(message);
	}

	// Qué hace: sincroniza el formulario del encabezado con el modelo actual sin disparar eventos de cambio.
	// Cómo: activa la bandera sincronizandoHeader, actualiza el último formato aplicado y la visibilidad del
	// aviso de pestaña, aplica el modelo como formData del formulario y libera la bandera tras un setTimeout.
	private syncHeaderForm(): void {
		this.sincronizandoHeader = true;
		this.ultimoFormatoAplicado = (this.model?.FORMATO || FORMATO_CORTO).toUpperCase();
		this.mostrarAvisoSeleccioneTab = this.subTabIndex < 0;
		this.headerForm?.instance?.option('formData', this.model);
		setTimeout(() => {
			this.sincronizandoHeader = false;
		});
	}

	// Qué hace: fuerza que las funciones clave y secundarias se recarguen la próxima vez que se consulten.
	// Cómo: incrementa los contadores de secuencia (funcionesClaveLoadSeq, funcionesSecundariasLoadSeq).
	private resetearFuncionesTabsDirty(): void {
		this.funcionesClaveLoadSeq++;
		this.funcionesSecundariasLoadSeq++;
	}

	// Qué hace: valida que el descriptor ya esté guardado antes de permitir editar sus secciones.
	// Cómo: si obtenerCorrDescriptor devuelve un correlativo válido, permite continuar; si no, avisa con
	// notifyDescriptorWarning y devuelve false.
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

	// Devuelve el correlativo del descriptor en edición, o 0 si es registro nuevo.
	private obtenerCorrDescriptor(): number {
		return Number(this.model?.CORR_DESCRIPTOR_PUESTO) || 0;
	}

	// Qué hace: limpia el flag de edición del grid de funciones clave.
	// Cómo: pone funcionesClaveEditando en false.
	private resetearEdicionFuncionesClave(): void {
		this.funcionesClaveEditando = false;
	}

	// Qué hace: limpia el flag de edición del grid de funciones secundarias.
	// Cómo: pone funcionesSecundariasEditando en false.
	private resetearEdicionFuncionesSecundarias(): void {
		this.funcionesSecundariasEditando = false;
	}

	// Qué hace: limpia el flag de edición del grid de KPIs.
	// Cómo: pone kpisEditando en false.
	private resetearEdicionKpis(): void {
		this.kpisEditando = false;
	}

	// Qué hace: limpia el flag de edición del grid de educación.
	// Cómo: pone educacionEditando en false.
	private resetearEdicionEducacion(): void {
		this.educacionEditando = false;
	}

	// Qué hace: limpia el flag de edición del grid de experiencia.
	// Cómo: pone experienciaEditando en false.
	private resetearEdicionExperiencia(): void {
		this.experienciaEditando = false;
	}

	// Qué hace: limpia los flags de edición e inserción del grid de competencias técnicas.
	// Cómo: pone competenciasTecnicasEditando y competenciasTecnicasInsertando en false.
	private resetearEdicionCompetenciasTecnicas(): void {
		this.competenciasTecnicasEditando = false;
		this.competenciasTecnicasInsertando = false;
	}

	// Qué hace: limpia los flags de edición e inserción del grid de competencias conductuales.
	// Cómo: pone competenciasConductualesEditando y competenciasConductualesInsertando en false.
	private resetearEdicionCompetenciasConductuales(): void {
		this.competenciasConductualesEditando = false;
		this.competenciasConductualesInsertando = false;
	}

	// Qué hace: limpia los flags de edición e inserción del grid de requerimientos organizacionales.
	// Cómo: pone requerimientosOrganizacionalesEditando y requerimientosOrganizacionalesInsertando en false.
	private resetearEdicionRequerimientosOrganizacionales(): void {
		this.requerimientosOrganizacionalesEditando = false;
		this.requerimientosOrganizacionalesInsertando = false;
	}

	// Qué hace: limpia los flags de edición e inserción del grid de riesgos de puesto.
	// Cómo: pone riesgosPuestoEditando y riesgosPuestoInsertando en false.
	private resetearEdicionRiesgosPuesto(): void {
		this.riesgosPuestoEditando = false;
		this.riesgosPuestoInsertando = false;
	}

	// Qué hace: limpia los flags de edición e inserción del grid de inducciones.
	// Cómo: pone induccionesEditando e induccionesInsertando en false.
	private resetearEdicionInducciones(): void {
		this.induccionesEditando = false;
		this.induccionesInsertando = false;
	}

	// Qué hace: limpia los flags de edición e inserción del grid de responsabilidades de cargo.
	// Cómo: pone responsabilidadesCargoEditando y responsabilidadesCargoInsertando en false.
	private resetearEdicionResponsabilidadesCargo(): void {
		this.responsabilidadesCargoEditando = false;
		this.responsabilidadesCargoInsertando = false;
	}

	// Qué hace: muestra u oculta la columna de catálogo del grid de competencias técnicas.
	// Cómo: fija la visibilidad de la columna lookupCompetenciaTecnica según competenciasTecnicasInsertando.
	private syncCompetenciaTecnicaColumnas(): void {
		setTimeout(() => {
			this.gridCompetenciasTecnicas?.instance?.columnOption(
				'lookupCompetenciaTecnica',
				'visible',
				this.competenciasTecnicasInsertando
			);
		});
	}

	// Qué hace: muestra u oculta la columna de catálogo del grid de competencias conductuales.
	// Cómo: fija la visibilidad de la columna lookupCompetenciaConductual según competenciasConductualesInsertando.
	private syncCompetenciaConductualColumnas(): void {
		setTimeout(() => {
			this.gridCompetenciasConductuales?.instance?.columnOption(
				'lookupCompetenciaConductual',
				'visible',
				this.competenciasConductualesInsertando
			);
		});
	}

	// Qué hace: muestra u oculta la columna de catálogo del grid de requerimientos organizacionales.
	// Cómo: fija la visibilidad de la columna lookupRequerimientoOrganizacional según requerimientosOrganizacionalesInsertando.
	private syncRequerimientoOrganizacionalColumnas(): void {
		setTimeout(() => {
			this.gridRequerimientosOrganizacionales?.instance?.columnOption(
				'lookupRequerimientoOrganizacional',
				'visible',
				this.requerimientosOrganizacionalesInsertando
			);
		});
	}

	// Qué hace: muestra u oculta la columna de catálogo del grid de riesgos de puesto.
	// Cómo: fija la visibilidad de la columna lookupRiesgoPuesto según riesgosPuestoInsertando.
	private syncRiesgoPuestoColumnas(): void {
		setTimeout(() => {
			this.gridRiesgosPuesto?.instance?.columnOption(
				'lookupRiesgoPuesto',
				'visible',
				this.riesgosPuestoInsertando
			);
		});
	}

	// Qué hace: muestra u oculta la columna de catálogo del grid de inducciones.
	// Cómo: fija la visibilidad de la columna lookupInduccion según induccionesInsertando.
	private syncInduccionColumnas(): void {
		setTimeout(() => {
			this.gridInducciones?.instance?.columnOption(
				'lookupInduccion',
				'visible',
				this.induccionesInsertando
			);
		});
	}

	// Qué hace: muestra u oculta la columna de catálogo del grid de responsabilidades de cargo.
	// Cómo: fija la visibilidad de la columna lookupResponsabilidadCargo según responsabilidadesCargoInsertando.
	private syncResponsabilidadCargoColumnas(): void {
		setTimeout(() => {
			this.gridResponsabilidadesCargo?.instance?.columnOption(
				'lookupResponsabilidadCargo',
				'visible',
				this.responsabilidadesCargoInsertando
			);
		});
	}

	// Qué hace: limpia el flag de edición del grid de relaciones internas.
	// Cómo: pone relacionesInternasEditando en false.
	private resetearEdicionRelacionesInternas(): void {
		this.relacionesInternasEditando = false;
	}

	// Qué hace: limpia el flag de edición del grid de relaciones externas.
	// Cómo: pone relacionesExternasEditando en false.
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

	// Cancela la edición en el grid y limpia los flags locales de la sección.
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
			// Si el grid ya no está en pantalla, igual limpia el flag de edición.
		}
		clearFlag();
	}

	// Crea una clave temporal (_clientKey) para filas nuevas que aún no tienen correlativo.
	private crearClientKey(prefix: string): string {
		return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
	}

	// Guarda una actividad desde el grid: llama a la API y recarga la lista si la respuesta es OK.
	private persistirActividadDesdeGrid(data: ScDescriptorPuestoFuncionActividad, esNuevo: boolean): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const funcion = this.funcionActividadesSeleccionada;
		if (!funcion?.CORR_FUNCION || funcion.CORR_FUNCION <= 0) {
			this.notifyFx('Debe guardar la funcion clave antes de registrar actividades.', NotifyType.Warning);
			return Promise.resolve(true);
		}

		const payload: ScDescriptorPuestoFuncionActividad = {
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

	// Qué hace: elimina una actividad desde el grid llamando a la API.
	// Cómo: valida que haya función y actividad válidas, llama a service.eliminarActividad (delete) y,
	// si sale bien, actualiza el contador de actividades de la función; resuelve true si hubo error.
	private eliminarActividadDesdeGrid(data: ScDescriptorPuestoFuncionActividad): Promise<boolean> {
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

	// Si el perfil aún no está guardado, lo persiste antes de agregar o editar un detalle.
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

					const saved = response.Data as ScPerfilPuesto;
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

	// Guarda una fila de educación: llama a la API y recarga la lista si la respuesta es OK.
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

	// Qué hace: elimina un requisito de educación desde el grid llamando a la API.
	// Cómo: valida que haya perfil y educación válidos, llama a service.eliminarEducacion (delete)
	// y resuelve true si hubo error.
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

	// Guarda una fila de experiencia: llama a la API y recarga la lista si la respuesta es OK.
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

	// Qué hace: elimina un requisito de experiencia desde el grid llamando a la API.
	// Cómo: valida que haya perfil y experiencia válidos, llama a service.eliminarExperiencia (delete)
	// y resuelve true si hubo error.
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

	// Guarda una competencia técnica: llama a la API y actualiza el lookup disponible.
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
			CORR_COMPETENCIAS_TECNICAS: Number(data.CORR_COMPETENCIAS_TECNICAS) || null,
			CODIGO_COMPETENCIAS_TECNICAS: (data.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim(),
			NOMBRE_COMPETENCIAS_TECNICAS: (data.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim(),
			DESCRIPCION: (data.DESCRIPCION ?? '').trim(),
			NIVEL_DOMINIO: (data.NIVEL_DOMINIO ?? 'BASICO').trim().toUpperCase(),
			_esNuevo: esNuevo,
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
						this.competenciasTecnicasInsertando = false;
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

	// Qué hace: elimina una competencia técnica desde el grid llamando a la API.
	// Cómo: valida la llave natural (descriptor, perfil y catálogo), llama a
	// service.eliminarCompetenciaTecnica (delete) y resuelve true si hubo error.
	private eliminarCompetenciaTecnicaDesdeGrid(
		data: ScPerfilPuestoCompetenciasTecnicas
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		const corr = Number(data?.CORR_COMPETENCIAS_TECNICAS);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrPerfil || corrPerfil <= 0 || !corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarCompetenciaTecnica(corrDescriptor, corrPerfil, corr)
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

	// Guarda una competencia conductual: llama a la API y actualiza el lookup disponible.
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
			CORR_COMPETENCIAS_CONDUCTUALES: Number(data.CORR_COMPETENCIAS_CONDUCTUALES) || null,
			CODIGO_TIPO_PUESTO: (data.CODIGO_TIPO_PUESTO ?? '').trim(),
			NOMBRE_COMPETENCIAS_CONDUCTUALES: (data.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim(),
			DESCRIPCION: this.esFormatoExtenso ? (data.DESCRIPCION ?? '').trim() : '',
			_esNuevo: esNuevo,
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
						this.competenciasConductualesInsertando = false;
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

	// Qué hace: elimina una competencia conductual desde el grid llamando a la API.
	// Cómo: valida la llave natural (descriptor, perfil y catálogo), llama a
	// service.eliminarCompetenciaConductual (delete) y resuelve true si hubo error.
	private eliminarCompetenciaConductualDesdeGrid(
		data: ScPerfilPuestoCompetenciasConductuales
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corrPerfil = Number(this.perfil?.CORR_PERFIL_PUESTO);
		const corr = Number(data?.CORR_COMPETENCIAS_CONDUCTUALES);
		if (!corrDescriptor || corrDescriptor <= 0 || !corrPerfil || corrPerfil <= 0 || !corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarCompetenciaConductual(corrDescriptor, corrPerfil, corr)
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

	// Guarda un requerimiento organizacional: llama a la API y recarga la lista.
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
			CORR_REQUERIMIENTO_ORGANIZACIONAL: Number(data.CORR_REQUERIMIENTO_ORGANIZACIONAL) || null,
			DESCRIPCION: (data.DESCRIPCION ?? '').trim(),
			_esNuevo: esNuevo,
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

	// Qué hace: elimina un requerimiento organizacional desde el grid llamando a la API.
	// Cómo: valida la llave natural (descriptor y catálogo), llama a
	// service.eliminarRequerimientoOrganizacional (delete) y resuelve true si hubo error.
	private eliminarRequerimientoOrganizacionalDesdeGrid(
		data: ScDescriptorPuestoRequerimientoOrganizacional
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corr = Number(data?.CORR_REQUERIMIENTO_ORGANIZACIONAL);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarRequerimientoOrganizacional(corrDescriptor, corr)
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

	// Guarda un riesgo del puesto; usa un flag para no enviar dos guardados a la vez.
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
			CORR_RIESGO_PUESTO: Number(data.CORR_RIESGO_PUESTO) || null,
			NOMBRE_RIESGO_PUESTO: (data.NOMBRE_RIESGO_PUESTO ?? '').trim(),
			INFORMACION: (data.INFORMACION ?? '').trim(),
			_esNuevo: esNuevo,
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
							// El grid puede ya no estar en pantalla; se ignora el error.
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

	// Qué hace: elimina un riesgo de puesto desde el grid llamando a la API.
	// Cómo: valida la llave natural (descriptor y catálogo), llama a service.eliminarRiesgoPuesto
	// (delete) y, si sale bien, recarga la lista con cargarRiesgosPuesto; resuelve true si hubo error.
	private eliminarRiesgoPuestoDesdeGrid(data: ScDescriptorPuestoRiesgoPuesto): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corr = Number(data?.CORR_RIESGO_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarRiesgoPuesto(corrDescriptor, corr)
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

	// Guarda una inducción del descriptor; usa un flag para no enviar dos guardados a la vez.
	private persistirInduccionDesdeGrid(
		data: ScDescriptorPuestoInduccion,
		esNuevo: boolean
	): Promise<boolean> {
		if (this.induccionPersistiendo) {
			return Promise.resolve(true);
		}

		const corrDescriptor = this.obtenerCorrDescriptor();
		if (!corrDescriptor || corrDescriptor <= 0) {
			this.notifyFx(
				'Debe guardar el descriptor antes de registrar inducciones.',
				NotifyType.Warning
			);
			return Promise.resolve(true);
		}

		const payload: ScDescriptorPuestoInduccion = {
			...data,
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_INDUCCION: Number(data.CORR_INDUCCION) || null,
			NOMBRE_INDUCCION: (data.NOMBRE_INDUCCION ?? '').trim(),
			TIEMPO_INDUCCION: data.TIEMPO_INDUCCION ?? null,
			UNIDAD_TIEMPO: data.UNIDAD_TIEMPO ?? null,
			_esNuevo: esNuevo,
		};

		this.induccionPersistiendo = true;

		return new Promise((resolve) => {
			this.service
				.persistirInduccionDescriptor(corrDescriptor, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						this.induccionPersistiendo = false;
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'guardar');
							resolve(true);
							return;
						}

						this.induccionesEditando = false;
						try {
							this.gridInducciones?.instance?.cancelEditData?.();
						} catch {
							// El grid puede ya no estar en pantalla; se ignora el error.
						}
						this.cargarInduccionesDescriptor(true);
						resolve(true);
					},
					error: (error) => {
						this.induccionPersistiendo = false;
						this.notificarErrorOperacion(error, 'guardar');
						resolve(true);
					},
				});
		});
	}

	// Qué hace: elimina una inducción del descriptor desde el grid llamando a la API.
	// Cómo: valida la llave natural (descriptor y catálogo), llama a service.eliminarInduccionDescriptor
	// (delete) y, si sale bien, recarga la lista con cargarInduccionesDescriptor; resuelve true si hubo error.
	private eliminarInduccionDesdeGrid(data: ScDescriptorPuestoInduccion): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const corr = Number(data?.CORR_INDUCCION);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarInduccionDescriptor(corrDescriptor, corr)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notificarRespuestaOperacion(response, 'eliminar');
							resolve(true);
							return;
						}
						this.cargarInduccionesDescriptor(true);
						resolve(true);
					},
					error: (error) => {
						this.notificarErrorOperacion(error, 'eliminar');
						resolve(true);
					},
				});
		});
	}

	// Guarda una responsabilidad del catálogo (no la fila de impacto económico).
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
			CORR_RESPONSABILIDAD: Number(data.CORR_RESPONSABILIDAD) || null,
			NOMBRE_RESPONSABILIDAD: (data.NOMBRE_RESPONSABILIDAD ?? '').trim(),
			INFORMACION: (data.INFORMACION ?? '').trim(),
			_esNuevo: esNuevo,
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
							// El grid puede ya no estar en pantalla; se ignora el error.
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

	// Qué hace: elimina una responsabilidad de cargo desde el grid llamando a la API.
	// Cómo: no permite eliminar la fila de impacto económico; valida la llave natural (descriptor y
	// catálogo), llama a service.eliminarResponsabilidadCargo (delete) y, si sale bien, recarga la lista.
	private eliminarResponsabilidadCargoDesdeGrid(
		data: ScDescriptorPuestoResponsabilidadCargo
	): Promise<boolean> {
		if (data?._esImpactoEconomico) {
			return Promise.resolve(true);
		}

		const corrDescriptor = this.obtenerCorrDescriptor();
		const corr = Number(data?.CORR_RESPONSABILIDAD);
		if (!corrDescriptor || corrDescriptor <= 0 || !corr || corr <= 0) {
			return Promise.resolve(false);
		}

		return new Promise((resolve) => {
			this.service
				.eliminarResponsabilidadCargo(corrDescriptor, corr)
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

	// Guarda impacto económico actualizando el encabezado del descriptor desde la fila virtual.
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
							// El grid puede ya no estar en pantalla; se ignora el error.
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

	// Guarda una función clave o secundaria: arma el payload, llama a la API y recarga esa sección.
	private persistirFuncionDesdeGrid(
		data: ScDescriptorPuestoFuncion,
		tipoFuncion: string,
		esNuevo: boolean
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const payload: ScDescriptorPuestoFuncion = {
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

	// Qué hace: elimina una función clave o secundaria desde el grid llamando a la API.
	// Cómo: valida que la función tenga correlativo, llama a service.eliminarFuncion (delete) y resuelve
	// true si hubo error.
	private eliminarFuncionDesdeGrid(data: ScDescriptorPuestoFuncion): Promise<boolean> {
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

	// Guarda una relación laboral interna o externa según el tipo de la fila.
	private persistirRelacionDesdeGrid(
		data: ScDescriptorPuestoRelacionLaboral,
		tipoRelacion: string,
		esNuevo: boolean
	): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const payload: ScDescriptorPuestoRelacionLaboral = {
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

	// Qué hace: elimina una relación laboral (interna o externa) desde el grid llamando a la API.
	// Cómo: valida que la relación tenga correlativo, llama a service.eliminarRelacionLaboral (delete)
	// y resuelve true si hubo error.
	private eliminarRelacionDesdeGrid(data: ScDescriptorPuestoRelacionLaboral): Promise<boolean> {
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

	// Guarda un KPI del formato corto desde el grid.
	private persistirKpiDesdeGrid(data: ScDescriptorPuestoKpiFuncion, esNuevo: boolean): Promise<boolean> {
		const corrDescriptor = this.obtenerCorrDescriptor();
		const payload: ScDescriptorPuestoKpiFuncion = {
			...data,
			CORR_KPI_FUNCION: esNuevo ? 0 : Number(data.CORR_KPI_FUNCION) || 0,
			NOMBRE_INDICADOR: (data.NOMBRE_INDICADOR ?? '').trim(),
			CORR_FRECUENCIA: data.CORR_FRECUENCIA ?? null,
			NOMBRE_FRECUENCIA: (data.NOMBRE_FRECUENCIA ?? '').trim(),
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

	// Qué hace: elimina un KPI desde el grid llamando a la API.
	// Cómo: valida que el KPI tenga correlativo, llama a service.eliminarKpi (delete) y resuelve
	// true si hubo error.
	private eliminarKpiDesdeGrid(data: ScDescriptorPuestoKpiFuncion): Promise<boolean> {
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

	// Filtra puestos de la unidad elegida y prepara la lista de puestos a los que puede reportar.
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

	// Al elegir puesto, copia reporta, responsable y opciones de reporta al encabezado.
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
