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
import { ScPerfilPuestoEducacion } from './sc-perfil-puesto-educacion/models/sc-perfil-puesto-educacion';
import { ScPerfilPuestoExperiencia } from './sc-perfil-puesto-experiencia/models/sc-perfil-puesto-experiencia';
import { ScPerfilPuestoCompetenciasTecnicas } from './sc-perfil-puesto-competencias-tecnicas/models/sc-perfil-puesto-competencias-tecnicas';
import { ScPerfilPuestoCompetenciasConductuales } from './sc-perfil-puesto-competencias-conductuales/models/sc-perfil-puesto-competencias-conductuales';
import {
	MockPuesto,
	MockUnidad,
	ScCompetenciaConductualLookupItem,
	ScCompetenciaTecnicaLookupItem,
	ScDescriptorPuesto,
} from './models/sc-descriptor-puesto';
import {
	FORMATO_CORTA,
	FORMATO_EXTENSA,
	MOCK_PUESTOS,
	MOCK_UNIDADES,
	PERFIL_PUESTO_DEFAULT,
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
	@ViewChild('tabPanelSecciones', { static: false }) tabPanelSecciones?: DxTabPanelComponent;
	@ViewChild('gridFuncionesClave', { static: false }) gridFuncionesClave?: DxDataGridComponent;
	@ViewChild('gridFuncionesSecundarias', { static: false }) gridFuncionesSecundarias?: DxDataGridComponent;
	@ViewChild('gridKpis', { static: false }) gridKpis?: DxDataGridComponent;
	@ViewChild('gridEducacion', { static: false }) gridEducacion?: DxDataGridComponent;
	@ViewChild('gridExperiencia', { static: false }) gridExperiencia?: DxDataGridComponent;
	@ViewChild('gridCompetenciasTecnicas', { static: false }) gridCompetenciasTecnicas?: DxDataGridComponent;
	@ViewChild('gridCompetenciasConductuales', { static: false }) gridCompetenciasConductuales?: DxDataGridComponent;
	@ViewChild('gridActividades', { static: false }) gridActividades?: DxDataGridComponent;

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
	mCORR_COMPETENCIAS_TECNICAS: ScCompetenciaTecnicaLookupItem[] = [];
	mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES: ScCompetenciaTecnicaLookupItem[] = [];
	mCORR_COMPETENCIAS_CONDUCTUALES: ScCompetenciaConductualLookupItem[] = [];
	mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES: ScCompetenciaConductualLookupItem[] = [];
	reportaLookupColumns = [
		{ dataField: 'RESPONSABLE', caption: 'Nombre', width: 220 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 260 },
	];
	competenciasTecnicasLookupColumns = [
		{ dataField: 'GRUPO_NIV1', caption: 'Grupo NIV1', width: 180 },
		{ dataField: 'GRUPO_NIV2', caption: 'Grupo NIV2', width: 180 },
		{ dataField: 'CODIGO_COMPETENCIAS_TECNICAS', caption: 'Codigo NIV3', width: 120 },
		{ dataField: 'NIVEL', caption: 'Nivel', width: 80 },
		{ dataField: 'NOMBRE_COMPETENCIAS_TECNICAS', caption: 'Competencia NIV3', width: 220 },
		{ dataField: 'DESCRIPCION', caption: 'Definicion', width: 260 },
	];
	competenciasConductualesLookupColumns = [
		{ dataField: 'CORR_COMPETENCIAS_CONDUCTUALES', caption: 'Codigo', width: 90 },
		{ dataField: 'NOMBRE_COMPETENCIAS_CONDUCTUALES', caption: 'Competencia', width: 220 },
		{ dataField: 'NOMBRE_TIPO_PUESTO', caption: 'Tipo puesto', width: 180 },
		{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 260 },
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
	funcionesClaveEditando = false;
	funcionesSecundariasEditando = false;
	kpisEditando = false;
	educacionEditando = false;
	experienciaEditando = false;
	competenciasTecnicasEditando = false;
	competenciasConductualesEditando = false;
	actividadesEditando = false;
	perfil: ScDescriptorPerfilPuesto = { ...PERFIL_PUESTO_DEFAULT };
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
	private perfilLoadSeq = 0;
	private perfilExiste = false;
	private sincronizandoHeader = false;
	private ultimoFormatoAplicado: string | null = null;
	private ultimoTabSeccionValido = 0;
	mostrarAvisoSeleccioneTab = false;
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
		this.selectedLookUpCORR_COMPETENCIAS_TECNICAS = this.selectedLookUpCORR_COMPETENCIAS_TECNICAS.bind(this);
		this.selectedLookUpCORR_COMPETENCIAS_CONDUCTUALES = this.selectedLookUpCORR_COMPETENCIAS_CONDUCTUALES.bind(this);
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
		this.actividadEditButtonVisible = this.actividadEditButtonVisible.bind(this);
		this.actividadDeleteButtonVisible = this.actividadDeleteButtonVisible.bind(this);
		this.editarActividadClick = this.editarActividadClick.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.headerItems = this.service.getHeaderItems();
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
		if (this.perfilPersistTimer) {
			clearTimeout(this.perfilPersistTimer);
			this.perfilPersistTimer = null;
		}
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
		this.getCORR_FRECUENCIA();
		this.getCORR_DISPONIBILIDAD_HORARIO();
		this.getCORR_TIPO_MODALIDAD();
		this.getCORR_COMPETENCIAS_TECNICAS_NIV3();
		this.getCORR_COMPETENCIAS_CONDUCTUALES();
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
					}
				},
				error: (error) => this.notifyApiError(error),
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

						return {
							CORR_COMPETENCIAS_CONDUCTUALES: Number(item.CORR_COMPETENCIAS_CONDUCTUALES),
							NOMBRE_COMPETENCIAS_CONDUCTUALES: nombre,
							DESCRIPCION: descripcion,
							NOMBRE_TIPO_PUESTO: tipoPuesto,
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

	selectedLookUpCORR_COMPETENCIAS_TECNICAS(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_TECNICAS;
	}

	selectedLookUpCORR_COMPETENCIAS_CONDUCTUALES(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_CONDUCTUALES;
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
		this.actualizarPuestosPorUnidad(null);
		setTimeout(() => this.syncHeaderForm());
	}

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
		this.educaciones = [];
		this.experiencias = [];
		this.competenciasTecnicas = [];
		this.competenciasConductuales = [];
		this.competenciasSubTabIndex = 0;
		this.relacionesSubTabIndex = 0;
		this.resetearEdicionFuncionesClave();
		this.resetearEdicionFuncionesSecundarias();
		this.resetearEdicionKpis();
		this.resetearEdicionEducacion();
		this.resetearEdicionExperiencia();
		this.resetearEdicionCompetenciasTecnicas();
		this.resetearEdicionCompetenciasConductuales();
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

	guardarFuncionClaveEditada(): void {
		const grid = this.gridFuncionesClave?.instance;
		if (!grid || !this.funcionesClaveEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

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

	guardarFuncionSecundariaEditada(): void {
		const grid = this.gridFuncionesSecundarias?.instance;
		if (!grid || !this.funcionesSecundariasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

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
		if (!this.esFormatoExtensa || !funcion) {
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

	guardarActividadEditada(): void {
		const grid = this.gridActividades?.instance;
		if (!grid || !this.actividadesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

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
			e.isValid = false;
			e.errorText = 'Debe indicar el nombre de la actividad.';
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

	agregarKpi(): void {
		if (this.readOnly || this.kpisEditando || !this.esFormatoCorta || !this.requiereDescriptorGuardado()) {
			return;
		}
		this.gridKpis?.instance.addRow();
		this.kpisEditando = true;
	}

	editarKpiClick(e: any): void {
		if (this.readOnly || this.kpisEditando) {
			return;
		}
		e.component.editRow(e.row.rowIndex);
		this.kpisEditando = true;
	}

	kpiEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	kpiDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	guardarKpiEditado(): void {
		const grid = this.gridKpis?.instance;
		if (!grid || !this.kpisEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarKpiEditado(): void {
		this.cancelarEdicionGrid(this.gridKpis?.instance, () => {
			this.kpisEditando = false;
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

	onKpiEditingStart(_e: any): void {
		this.kpisEditando = true;
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

	guardarEducacionEditada(): void {
		const grid = this.gridEducacion?.instance;
		if (!grid || !this.educacionEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

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
			e.isValid = false;
			e.errorText = 'Debe indicar el requisito.';
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

	guardarExperienciaEditada(): void {
		const grid = this.gridExperiencia?.instance;
		if (!grid || !this.experienciaEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

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
			e.isValid = false;
			e.errorText = 'Debe indicar el requisito.';
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

	guardarCompetenciaTecnicaEditada(): void {
		const grid = this.gridCompetenciasTecnicas?.instance;
		if (!grid || !this.competenciasTecnicasEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarCompetenciaTecnicaEditada(): void {
		this.cancelarEdicionGrid(this.gridCompetenciasTecnicas?.instance, () => {
			this.competenciasTecnicasEditando = false;
		});
	}

	competenciaTecnicaInitNewRow(e: any): void {
		e.data.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS = 0;
		e.data.CORR_PERFIL_PUESTO = Number(this.perfil?.CORR_PERFIL_PUESTO) || 0;
		e.data.CORR_COMPETENCIAS_TECNICAS = null;
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
	}

	competenciaTecnicaRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_COMPETENCIAS_TECNICAS) > 0)) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar una competencia tecnica de nivel 3.';
			return;
		}
		if (!(data.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim()) {
			e.isValid = false;
			e.errorText = 'Debe indicar el nombre de la competencia.';
			return;
		}
		const nivel = (data.NIVEL_DOMINIO ?? '').trim().toUpperCase();
		if (!['BASICO', 'INTERMEDIO', 'AVANZADO'].includes(nivel)) {
			e.isValid = false;
			e.errorText = 'Debe indicar el nivel de dominio.';
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
			e.isValid = false;
			e.errorText = 'Esa competencia tecnica ya esta agregada en el descriptor.';
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
		const corr = Number(row?.CORR_COMPETENCIAS_TECNICAS);
		const catalog = this.mCORR_COMPETENCIAS_TECNICAS.find(
			(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === corr
		);
		return catalog?.CODIGO_COMPETENCIAS_TECNICAS || '';
	};

	private actualizarCompetenciasTecnicasLookupDisponibles(
		corrConservar: number | null = null
	): void {
		const usados = new Set(
			(this.competenciasTecnicas || [])
				.map((row) => Number(row.CORR_COMPETENCIAS_TECNICAS))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		this.mCORR_COMPETENCIAS_TECNICAS_DISPONIBLES = (this.mCORR_COMPETENCIAS_TECNICAS || []).filter(
			(item) => {
				const corr = Number(item.CORR_COMPETENCIAS_TECNICAS);
				if (!(corr > 0)) {
					return false;
				}
				if (corrConservar != null && corr === Number(corrConservar)) {
					return true;
				}
				return !usados.has(corr);
			}
		);
	}

	onCompetenciaTecnicaLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		const catalog = this.mCORR_COMPETENCIAS_TECNICAS.find(
			(item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === Number(corr)
		);
		cellInfo.setValue(corr);

		const nombre = catalog?.NOMBRE_COMPETENCIAS_TECNICAS ?? '';
		const descripcion = catalog?.DESCRIPCION ?? '';
		if (cellInfo.data) {
			cellInfo.data.CORR_COMPETENCIAS_TECNICAS = corr;
			cellInfo.data.NOMBRE_COMPETENCIAS_TECNICAS = nombre;
			cellInfo.data.DESCRIPCION = descripcion;
		}

		const grid = cellInfo.component;
		const rowIndex = cellInfo.rowIndex;
		if (grid != null && typeof rowIndex === 'number') {
			grid.cellValue(rowIndex, 'NOMBRE_COMPETENCIAS_TECNICAS', nombre);
			grid.cellValue(rowIndex, 'DESCRIPCION', descripcion);
		}
	}

	agregarCompetenciaConductual(): void {
		if (this.readOnly || this.competenciasConductualesEditando || !this.requiereDescriptorGuardado()) {
			return;
		}

		this.asegurarPerfilParaDetalle(() => {
			this.actualizarCompetenciasConductualesLookupDisponibles();
			this.gridCompetenciasConductuales?.instance.addRow();
			this.competenciasConductualesEditando = true;
		});
	}

	editarCompetenciaConductualClick(e: any): void {
		if (this.readOnly || this.competenciasConductualesEditando) {
			return;
		}
		this.actualizarCompetenciasConductualesLookupDisponibles(
			Number(e?.row?.data?.CORR_COMPETENCIAS_CONDUCTUALES) || null
		);
		e.component.editRow(e.row.rowIndex);
		this.competenciasConductualesEditando = true;
	}

	competenciaConductualEditButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	competenciaConductualDeleteButtonVisible(e: any): boolean {
		return this.accionGridVisible(e);
	}

	guardarCompetenciaConductualEditada(): void {
		const grid = this.gridCompetenciasConductuales?.instance;
		if (!grid || !this.competenciasConductualesEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	cancelarCompetenciaConductualEditada(): void {
		this.cancelarEdicionGrid(this.gridCompetenciasConductuales?.instance, () => {
			this.competenciasConductualesEditando = false;
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
	}

	competenciaConductualRowValidating(e: any): void {
		const data = { ...(e.oldData || {}), ...(e.newData || {}) };
		if (!(Number(data.CORR_COMPETENCIAS_CONDUCTUALES) > 0)) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar una competencia conductual.';
			return;
		}
		if (!(data.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '').trim()) {
			e.isValid = false;
			e.errorText = 'Debe indicar el nombre de la competencia.';
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
			e.isValid = false;
			e.errorText = 'Esa competencia conductual ya esta agregada en el descriptor.';
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
		const corr = Number(row?.CORR_COMPETENCIAS_CONDUCTUALES);
		if (!(corr > 0)) {
			return '';
		}
		return String(corr);
	};

	private actualizarCompetenciasConductualesLookupDisponibles(
		corrConservar: number | null = null
	): void {
		const usados = new Set(
			(this.competenciasConductuales || [])
				.map((row) => Number(row.CORR_COMPETENCIAS_CONDUCTUALES))
				.filter((corr) => corr > 0 && corr !== Number(corrConservar || 0))
		);

		this.mCORR_COMPETENCIAS_CONDUCTUALES_DISPONIBLES = (
			this.mCORR_COMPETENCIAS_CONDUCTUALES || []
		).filter((item) => {
			const corr = Number(item.CORR_COMPETENCIAS_CONDUCTUALES);
			if (!(corr > 0)) {
				return false;
			}
			if (corrConservar != null && corr === Number(corrConservar)) {
				return true;
			}
			return !usados.has(corr);
		});
	}

	onCompetenciaConductualLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		const catalog = this.mCORR_COMPETENCIAS_CONDUCTUALES.find(
			(item) => Number(item.CORR_COMPETENCIAS_CONDUCTUALES) === Number(corr)
		);
		cellInfo.setValue(corr);

		const nombre = catalog?.NOMBRE_COMPETENCIAS_CONDUCTUALES ?? '';
		const descripcion = catalog?.DESCRIPCION ?? '';
		if (cellInfo.data) {
			cellInfo.data.CORR_COMPETENCIAS_CONDUCTUALES = corr;
			cellInfo.data.NOMBRE_COMPETENCIAS_CONDUCTUALES = nombre;
			cellInfo.data.DESCRIPCION = descripcion;
		}

		const grid = cellInfo.component;
		const rowIndex = cellInfo.rowIndex;
		if (grid != null && typeof rowIndex === 'number') {
			grid.cellValue(rowIndex, 'NOMBRE_COMPETENCIAS_CONDUCTUALES', nombre);
			grid.cellValue(rowIndex, 'DESCRIPCION', descripcion);
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
		this.educaciones = [];
		this.experiencias = [];
		this.competenciasTecnicas = [];
		this.competenciasConductuales = [];
		this.resetearEdicionEducacion();
		this.resetearEdicionExperiencia();
		this.resetearEdicionCompetenciasTecnicas();
		this.resetearEdicionCompetenciasConductuales();
		this.actualizarCompetenciasTecnicasLookupDisponibles();
		this.actualizarCompetenciasConductualesLookupDisponibles();
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

	private crearPerfilPorDefecto(corrDescriptor: number, loadSeq: number, forzar = false): void {
		this.perfil = {
			...PERFIL_PUESTO_DEFAULT,
			CORR_DESCRIPTOR_PUESTO: corrDescriptor,
			CORR_PERFIL_PUESTO: 0,
		};
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

					if (Number(this.perfil.CORR_PERFIL_PUESTO) > 0) {
						this.cargarEducacion(forzar);
						this.cargarExperiencia(forzar);
						this.cargarCompetenciasTecnicas(forzar);
						this.cargarCompetenciasConductuales(forzar);
					}
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

		const esCreacion = !this.perfilExiste;
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

					// Solo en la creación inicial: ahí recién existe CORR_PERFIL_PUESTO.
					if (esCreacion && Number(this.perfil.CORR_PERFIL_PUESTO) > 0) {
						this.cargarEducacion(true);
						this.cargarExperiencia(true);
						this.cargarCompetenciasTecnicas(true);
						this.cargarCompetenciasConductuales(true);
					}
				},
				error: (error) => this.notifyApiError(error),
			});
	}

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

	private cargarKpis(forzar = false): void {
		const corrDescriptor = Number(this.model?.CORR_DESCRIPTOR_PUESTO);
		if (!corrDescriptor || corrDescriptor <= 0 || !this.esFormatoCorta) {
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

	private actualizarContadorActividades(funcion: ScDescriptorFuncion): void {
		funcion.CANT_ACTIVIDADES = this.actividadesPopup.length;
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

	get tieneBitacora(): boolean {
		return Array.isArray(this.itemsTabBitacora) && this.itemsTabBitacora.length > 0;
	}

	get mensajeBitacoraVacia(): string {
		if (!this.model?.CORR_DESCRIPTOR_PUESTO) {
			return 'La bitácora estará disponible después de guardar el descriptor.';
		}

		return 'No hay registros en la bitácora por el momento.';
	}

	onFormatoChanged(value: string, formatoAnteriorHint?: string): void {
		const formatoNuevo = (value || FORMATO_CORTA).toUpperCase();
		// El form a veces ya escribio FORMATO en model antes del evento; previousValue puede venir vacio.
		const formatoAnterior = (
			formatoAnteriorHint ??
			this.ultimoFormatoAplicado ??
			this.model?.FORMATO ??
			''
		).toUpperCase();
		const cambioReal = formatoAnterior !== formatoNuevo;
		const tabActualIndex = this.subTabIndex >= 0 ? this.subTabIndex : this.ultimoTabSeccionValido;

		this.model.FORMATO = value || FORMATO_CORTA;
		this.ultimoFormatoAplicado = formatoNuevo;

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
		if (cambioReal && this.esFormatoCorta && this.mostrarSeccionesDescriptor) {
			this.cargarFuncionesSecundarias();
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

	private esTabSeccionVisibleParaFormato(index: number, formato: string): boolean {
		const tab = this.seccionesTabsMeta[index];
		if (!tab) {
			return false;
		}
		const fmt = (formato || '').toUpperCase();
		const esCorta = fmt === FORMATO_CORTA || fmt === 'CORTA';
		const esExtensa = fmt === FORMATO_EXTENSA || fmt === 'EXTENSA';
		if (tab.visibleEn === 'ambos') {
			return true;
		}
		if (tab.visibleEn === 'corta') {
			return esCorta;
		}
		return esExtensa;
	}

	private seleccionarTabSeccion(index: number): void {
		this.subTabIndex = index;
		this.ultimoTabSeccionValido = index;
		setTimeout(() => {
			this.subTabIndex = index;
			this.tabPanelSecciones?.instance?.option('selectedIndex', index);
		});
	}

	private dejarSinTabSeccionSeleccionado(): void {
		this.subTabIndex = -1;
		setTimeout(() => {
			this.subTabIndex = -1;
			this.tabPanelSecciones?.instance?.option('selectedIndex', -1);
		});
	}

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
			this.onFormatoChanged(e.value, e.previousValue);
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

	private syncHeaderForm(): void {
		this.sincronizandoHeader = true;
		this.ultimoFormatoAplicado = (this.model?.FORMATO || FORMATO_CORTA).toUpperCase();
		this.mostrarAvisoSeleccioneTab = false;
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

	private crearClientKey(prefix: string): string {
		return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
	}

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
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						this.actividadesEditando = false;
						this.cargarActividadesPopup(funcion);
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
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
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						setTimeout(() => this.actualizarContadorActividades(funcion));
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
						resolve(true);
					},
				});
		});
	}

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

					if (!(Number(this.perfil.CORR_PERFIL_PUESTO) > 0)) {
						this.notifyFx('No se pudo preparar el perfil.', NotifyType.Warning);
						return;
					}

					onReady();
				},
				error: (error) => this.notifyApiError(error),
			});
	}

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
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						this.educacionEditando = false;
						this.cargarEducacion(true);
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
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
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						this.experienciaEditando = false;
						this.cargarExperiencia(true);
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
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
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						this.competenciasTecnicasEditando = false;
						this.cargarCompetenciasTecnicas(true);
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
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
			DESCRIPCION: (data.DESCRIPCION ?? '').trim(),
		};

		return new Promise((resolve) => {
			this.service
				.persistirCompetenciaConductual(corrDescriptor, corrPerfil, payload)
				.pipe(take(1))
				.subscribe({
					next: (response) => {
						if (!response?.Result) {
							this.notifyApiResponse(response);
							resolve(true);
							return;
						}
						this.competenciasConductualesEditando = false;
						this.cargarCompetenciasConductuales(true);
						resolve(false);
					},
					error: (error) => {
						this.notifyApiError(error);
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
