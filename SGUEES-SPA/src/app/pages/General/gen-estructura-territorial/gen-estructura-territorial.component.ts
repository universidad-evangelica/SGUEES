import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import Menu from 'devextreme/ui/menu';
import { DxFormComponent } from 'devextreme-angular';
import { custom, CustomDialogOptions } from 'devextreme/ui/dialog';
import { MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MttoPageContextService } from 'src/app/layouts/mtto-page-context.service';
import {
	cloneRemoteGridFilters,
	hasRemoteFilterRowSearch,
	parseRemoteGridFilters,
	ParsedGridFilters,
} from 'src/app/shared/utils/remote-grid-filter.util';
import {
	clearGridHeaderFilterSelections,
	getColumnHeaderFilterSelection,
	invertExcludedHeaderFilterValues,
	readGridFilterRowValues,
} from 'src/app/shared/utils/remote-header-filter.util';
import {
	GenDepto,
	GenDistrito,
	GenMunicipio,
	GenPais,
	TerritorialNivel,
} from './models/gen-estructura-territorial';
import {
	EMPRESA_REGISTRO_ETIQUETA,
	GenEstructuraTerritorialService,
	getEmpresaWarningMessage,
	isEmpresaFkErrorMessage,
	isEmpresaWarningResponse,
} from './gen-estructura-territorial.service';

const GRID_FILTER_CONFIG = { estadoField: '__NONE__' };
type TerritorialGridLevel = 'pais' | 'depto' | 'municipio' | 'distrito';

type TerritorialConfirmDialogOptions = CustomDialogOptions & {
	popupOptions?: {
		width?: number;
		wrapperAttr?: { class?: string };
	};
};

@Component({
	selector: 'app-gen-estructura-territorial',
	templateUrl: './gen-estructura-territorial.component.html',
	styleUrls: ['./gen-estructura-territorial.component.scss'],
})
export class GenEstructuraTerritorialComponent extends CBaseComponent implements OnInit {
	@ViewChild('paisGrid', { static: false }) dataGrid?: DataGridMttoComponent;
	@ViewChild('deptoGrid', { static: false }) deptoGrid?: DataGridMttoComponent;
	@ViewChild('municipioGrid', { static: false }) municipioGrid?: DataGridMttoComponent;
	@ViewChild('distritoGrid', { static: false }) distritoGrid?: DataGridMttoComponent;
	@ViewChild('popupForm', { static: false }) popupForm?: DxFormComponent;

	readonly pageSizes = [5, 10, 25, 50, 100];
	readonly cascadeGridHeight = 530;
	readonly cascadeRemoteOperations = { filtering: true, sorting: true };
	readonly popupFormColCountByScreen = { xs: 1, sm: 1, md: 2, lg: 2 };
	private readonly maintenanceSubtitulo = 'Estructura territorial';
	private readonly cascadeGridHooks = new WeakSet<object>();

	vistaDetalle = false;
	selectedPais?: GenPais;
	selectedDepto?: GenDepto;
	selectedMunicipio?: GenMunicipio;

	deptoModels: any;
	municipioModels: any;
	distritoModels: any;

	deptoColumns: any[] = [];
	municipioColumns: any[] = [];
	districtoColumns: any[] = [];
	deptoSummary: any;
	municipioSummary: any;
	distritoSummary: any;

	popupVisible = false;
	popupNivel: TerritorialNivel = 'depto';
	popupIsAdd = true;
	popupModel: GenDepto | GenMunicipio | GenDistrito = this.fillDepto();
	popupItems: any[] = [];
	popupTitle = '';
	private popupSaving = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEstructuraTerritorialService,
		private messageService: MessageService,
		private authService: AuthService,
		private pageContext: MttoPageContextService
	) {
		super(appInfoService, router);
		this.onEditPaisClick = this.onEditPaisClick.bind(this);
		this.onDeletePaisClick = this.onDeletePaisClick.bind(this);
		this.onEditDeptoClick = this.onEditDeptoClick.bind(this);
		this.onDeleteDeptoClick = this.onDeleteDeptoClick.bind(this);
		this.onEditMunicipioClick = this.onEditMunicipioClick.bind(this);
		this.onDeleteMunicipioClick = this.onDeleteMunicipioClick.bind(this);
		this.onEditDistritoClick = this.onEditDistritoClick.bind(this);
		this.onDeleteDistritoClick = this.onDeleteDistritoClick.bind(this);

		this.columns = this.service.getPaisColumns(this.onEditPaisClick, this.onDeletePaisClick, this.permiteEdit, this.permiteDele);
		this.items = this.service.getPaisItems();
		this.summary = this.service.getPaisListSummary();
		this.deptoSummary = this.service.getChildSummary('NOMBRE_DEPTO');
		this.municipioSummary = this.service.getChildSummary('NOMBRE_MUNICIPIO');
		this.distritoSummary = this.service.getChildSummary('NOMBRE_DISTRITO');
	}

	ngOnInit(): void {
		this.urlOpcion = this.resolveUrlOpcion();
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.model = this.fillPais();
		this.modelUpdate = this.fillPais();
		this.actualizarColumnas();
		this.syncToolbarContext();
		this.configurarDataSourcePaises();
	}

	get popupWidth(): number | string {
		return this.screen(window.innerWidth) === 'sm' ? 'calc(100vw - 24px)' : 520;
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		this.syncToolbarContext();
		if (xEstado === UpdateType.Browse && !this.vistaDetalle) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.entrarDetalle(rowData as GenPais);
		}
	}

	onEditPaisClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}
		this.entrarDetalle(e.row.data as GenPais);
	}

	onDeletePaisClick(e: any): void {
		const row = e?.row?.data as GenPais;
		if (!row) {
			return;
		}
		this.confirmAction('Eliminar país', `Desea eliminar el país "${row.NOMBRE_PAIS}"?`, () => this.eliminarPais(row, false));
	}

	fillPais(xModel?: GenPais): GenPais {
		if (xModel) {
			return { ...xModel };
		}
		return {
			CORR_PAIS: 0,
			NOMBRE_PAIS: '',
			CODIGO_PAIS: '',
			NACIONALIDAD: '',
			NOMBRE_CORTO: '',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	override fillData(xModel?: GenPais): GenPais {
		return this.fillPais(xModel);
	}

	fillDepto(xModel?: GenDepto): GenDepto {
		return {
			CORR_PAIS: this.selectedPais?.CORR_PAIS ?? 0,
			CORR_DEPTO: xModel?.CORR_DEPTO ?? 0,
			NOMBRE_DEPTO: xModel?.NOMBRE_DEPTO ?? '',
			CODIGO_DEPTO: xModel?.CODIGO_DEPTO ?? '',
			USUARIO_CREA: xModel?.USUARIO_CREA ?? '',
			ESTACION_CREA: xModel?.ESTACION_CREA ?? '',
			FECHA_CREA: xModel?.FECHA_CREA ?? new Date(),
			USUARIO_ACTU: xModel?.USUARIO_ACTU ?? '',
			ESTACION_ACTU: xModel?.ESTACION_ACTU ?? '',
			FECHA_ACTU: xModel?.FECHA_ACTU ?? new Date(),
		};
	}

	fillMunicipio(xModel?: GenMunicipio): GenMunicipio {
		return {
			CORR_PAIS: this.selectedPais?.CORR_PAIS ?? 0,
			CORR_DEPTO: this.selectedDepto?.CORR_DEPTO ?? 0,
			CORR_MUNICIPIO: xModel?.CORR_MUNICIPIO ?? 0,
			NOMBRE_MUNICIPIO: xModel?.NOMBRE_MUNICIPIO ?? '',
			CODIGO_MUNICIPIO: xModel?.CODIGO_MUNICIPIO ?? '',
			USUARIO_CREA: xModel?.USUARIO_CREA ?? '',
			ESTACION_CREA: xModel?.ESTACION_CREA ?? '',
			FECHA_CREA: xModel?.FECHA_CREA ?? new Date(),
			USUARIO_ACTU: xModel?.USUARIO_ACTU ?? '',
			ESTACION_ACTU: xModel?.ESTACION_ACTU ?? '',
			FECHA_ACTU: xModel?.FECHA_ACTU ?? new Date(),
		};
	}

	fillDistrito(xModel?: GenDistrito): GenDistrito {
		return {
			CORR_PAIS: this.selectedPais?.CORR_PAIS ?? xModel?.CORR_PAIS ?? 0,
			CORR_DEPTO: this.selectedDepto?.CORR_DEPTO ?? xModel?.CORR_DEPTO ?? 0,
			CORR_MUNICIPIO: this.selectedMunicipio?.CORR_MUNICIPIO ?? xModel?.CORR_MUNICIPIO ?? 0,
			CORR_DISTRITO: xModel?.CORR_DISTRITO ?? 0,
			NOMBRE_DISTRITO: xModel?.NOMBRE_DISTRITO ?? '',
			USUARIO_CREA: xModel?.USUARIO_CREA ?? '',
			ESTACION_CREA: xModel?.ESTACION_CREA ?? '',
			FECHA_CREA: xModel?.FECHA_CREA ?? new Date(),
			USUARIO_ACTU: xModel?.USUARIO_ACTU ?? '',
			ESTACION_ACTU: xModel?.ESTACION_ACTU ?? '',
			FECHA_ACTU: xModel?.FECHA_ACTU ?? new Date(),
		};
	}

	fillParam(
		page = 1,
		pageSize = 5,
		busqueda = '',
		gridFilters: ParsedGridFilters = { estado: null, filterRow: {}, filterRowExact: {}, headerAnyOf: {} },
		distinctField = '',
		headerFilterSearch = '',
		sortField = '',
		sortDesc = false,
		extra: Record<string, any> = {}
	): any {
		return {
			BUSQUEDA: busqueda,
			PAGE: page,
			PAGE_SIZE: pageSize,
			DISTINCT_FIELD: distinctField,
			HEADER_FILTER_SEARCH: headerFilterSearch,
			SORT_FIELD: sortField,
			SORT_DESC: sortDesc,
			gridFilters,
			...extra,
		};
	}

	fillCascadeParam(
		busqueda = '',
		gridFilters: ParsedGridFilters = { estado: null, filterRow: {}, filterRowExact: {}, headerAnyOf: {} },
		distinctField = '',
		headerFilterSearch = '',
		sortField = '',
		sortDesc = false,
		extra: Record<string, any> = {}
	): any {
		return {
			BUSQUEDA: busqueda,
			DISTINCT_FIELD: distinctField,
			HEADER_FILTER_SEARCH: headerFilterSearch,
			SORT_FIELD: sortField,
			SORT_DESC: sortDesc,
			gridFilters,
			...extra,
		};
	}

	loadHeaderFilterValuesPaises = (field: string, searchValue?: string): Promise<unknown[]> =>
		this.loadHeaderFilterValues('pais', field, searchValue);

	loadHeaderFilterValuesDeptos = (field: string, searchValue?: string): Promise<unknown[]> =>
		this.loadHeaderFilterValues('depto', field, searchValue);

	loadHeaderFilterValuesMunicipios = (field: string, searchValue?: string): Promise<unknown[]> =>
		this.loadHeaderFilterValues('municipio', field, searchValue);

	loadHeaderFilterValuesDistritos = (field: string, searchValue?: string): Promise<unknown[]> =>
		this.loadHeaderFilterValues('distrito', field, searchValue);

	private loadHeaderFilterValues(level: TerritorialGridLevel, field: string, searchValue?: string): Promise<unknown[]> {
		const grid = this.getGridByLevel(level)?.gData?.instance;
		const combinedFilter = grid?.getCombinedFilter?.(false);
		const gridFilters = parseRemoteGridFilters(combinedFilter, grid, GRID_FILTER_CONFIG);
		const hasFilterRowSearch = hasRemoteFilterRowSearch(gridFilters);
		const filtersForDistinct: ParsedGridFilters = {
			estado: null,
			filterRow: hasFilterRowSearch ? gridFilters.filterRow : {},
			filterRowExact: hasFilterRowSearch ? gridFilters.filterRowExact : {},
			headerAnyOf: {},
		};

		const scope = this.getScopeForLevel(level);
		const request = this.fillCascadeParam('', filtersForDistinct, field, searchValue ?? '', '', false, scope);
		const distinctCall =
			level === 'pais'
				? this.service.getDistinctValuesPaises({ ...request, PAGE: 1, PAGE_SIZE: 0 })
				: level === 'depto'
					? this.service.getDistinctValuesDeptos(request)
					: level === 'municipio'
						? this.service.getDistinctValuesMunicipios(request)
						: this.service.getDistinctValuesDistritos(request);

		return lastValueFrom(distinctCall).then((response) => {
			if (!response.Result) {
				throw new Error(response.ErrorMessage || 'No se pudieron cargar los valores del filtro.');
			}

			return response.Data ?? [];
		});
	}

	consultar(): void {
		this.dataGrid?.refreshData(true);
	}

	entrarDetalle(pais: GenPais): void {
		this.vistaDetalle = true;
		this.selectedPais = this.fillPais(pais);
		this.model = this.fillPais(pais);
		this.modelUpdate = this.fillPais(pais);
		this.subTituloVentana = pais.NOMBRE_PAIS;
		this.AsignaStatus(UpdateType.Browse);
		this.syncToolbarContext();
		this.limpiarSeleccionHijos();
		this.configurarDataSourceHijos();
		setTimeout(() => {
			this.refrescarDeptos(true);
			this.inicializarGridsCascade();
		});
	}

	volverAlListado(): void {
		this.vistaDetalle = false;
		this.selectedPais = undefined;
		this.limpiarSeleccionHijos();
		this.model = this.fillPais();
		this.modelUpdate = this.fillPais();
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.AsignaStatus(UpdateType.Browse);
		this.actualizarColumnas();
		this.syncToolbarContext();
		setTimeout(() => this.consultar());
	}

	private refrescarDetallePais(pais: GenPais): void {
		const deptoSel = this.selectedDepto;
		const municipioSel = this.selectedMunicipio;

		this.AsignaStatus(UpdateType.Browse);
		this.selectedPais = this.fillPais(pais);
		this.model = this.fillPais(pais);
		this.modelUpdate = this.fillPais(pais);
		this.subTituloVentana = pais.NOMBRE_PAIS;
		this.syncToolbarContext();

		if (deptoSel && Number(deptoSel.CORR_PAIS) === Number(pais.CORR_PAIS)) {
			this.selectedDepto = { ...deptoSel, CORR_PAIS: pais.CORR_PAIS };
		} else {
			this.limpiarSeleccionHijos();
		}

		if (this.selectedDepto && municipioSel && Number(municipioSel.CORR_DEPTO) === Number(this.selectedDepto.CORR_DEPTO)) {
			this.selectedMunicipio = {
				...municipioSel,
				CORR_PAIS: pais.CORR_PAIS,
				CORR_DEPTO: this.selectedDepto.CORR_DEPTO,
			};
		} else if (this.selectedDepto) {
			this.selectedMunicipio = undefined;
		}

		this.configurarDataSourceHijos();
		setTimeout(() => {
			this.refrescarDeptos(true);
			if (this.selectedDepto) {
				this.refrescarMunicipios(true);
			}
			if (this.selectedMunicipio) {
				this.refrescarDistritos(true);
			}
			this.inicializarGridsCascade();
			this.actualizarResaltadoCascade();
		});
	}

	override nuevo(): void {
		if (this.vistaDetalle) {
			return;
		}
		super.nuevo();
	}

	editarPais(): void {
		if (!this.selectedPais) {
			return;
		}
		if (!this.permiteEdit) {
			this.notifyFx('No tiene permiso para editar registros.', NotifyType.Warning);
			return;
		}
		this.model = this.fillPais(this.selectedPais);
		this.editarClick({ event: { preventDefault: () => undefined } });
		setTimeout(() => this.dataForm?.instance?.option('formData', this.model));
	}

	eliminarPaisActual(): void {
		if (!this.selectedPais) {
			return;
		}
		if (!this.permiteDele) {
			this.notifyFx('No tiene permiso para eliminar registros.', NotifyType.Warning);
			return;
		}
		this.confirmAction('Eliminar país', `Desea eliminar el país "${this.selectedPais.NOMBRE_PAIS}"?`, () =>
			this.eliminarPais(this.selectedPais!, true)
		);
	}

	override notifyFx(xMessage: string, xType: NotifyType): void {
		const cleanMessage = `${xMessage ?? ''}`.replace(/^error:\s*/i, '').trim();
		const warningDetail = this.getWarningMessage(xMessage);
		const isWarning = xType === NotifyType.Warning || warningDetail !== cleanMessage;
		const severity = xType === NotifyType.Success ? 'success' : isWarning ? 'warn' : 'error';
		const summary = xType === NotifyType.Success ? 'Éxito' : isWarning ? 'Advertencia' : 'Error';
		const detail = isWarning ? warningDetail : cleanMessage;
		this.messageService.add({ severity, summary, detail });
	}

	guardar(): void {
		if (!this.validarEmpresaSesion()) {
			return;
		}

		if (this.loadingVisible) {
			return;
		}

		const formData = this.dataForm?.instance?.option('formData') as GenPais | undefined;
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const isAdd = this.banderaMtto === UpdateType.Add;
		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValidoPais(this.model, this.notifyFx.bind(this), !isAdd);
			return;
		}

		if (!this.service.esValidoPais(this.model, this.notifyFx.bind(this), !isAdd)) {
			return;
		}

		this.loadingVisible = true;
		this.ejecutarGuardarPais(isAdd);
	}

	private ejecutarGuardarPais(isAdd: boolean): void {
		const request = isAdd ? this.service.insertPais(this.model) : this.service.updatePais(this.model);

		request.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) {
					const savedPais = response.Data as GenPais;
					if (isAdd) {
						this.entrarDetalle(savedPais);
						this.notifyFx('País creado con exito!', NotifyType.Success);
					} else if (this.vistaDetalle) {
						this.refrescarDetallePais(savedPais);
						this.notifyFx('País modificado con exito!', NotifyType.Success);
					} else {
						this.AsignaStatus(UpdateType.Browse);
						this.consultar();
						this.notifyFx('País modificado con exito!', NotifyType.Success);
					}
				} else {
					this.notifyFx(response.ErrorMessage, this.getNotifyType(response));
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				this.notifyFx(this.getErrorMessage(error), this.getErrorNotifyType(error));
				this.loadingVisible = false;
			},
		});
	}

	override cancelar(): void {
		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.AsignaStatus(UpdateType.Browse);
				this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
				this.actualizarColumnas();
				this.syncToolbarContext();
				if (this.vistaDetalle && this.selectedPais) {
					this.model = this.fillPais(this.selectedPais);
					this.modelUpdate = this.fillPais(this.selectedPais);
					this.subTituloVentana = this.selectedPais.NOMBRE_PAIS;
				} else {
					this.model = this.fillPais();
					this.modelUpdate = this.fillPais();
				}
			});
			return;
		}
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.actualizarColumnas();
		this.syncToolbarContext();
	}

	rowRemoving(e: any): void {
		e.cancel = true;
		this.onDeletePaisClick({ row: { data: e.data } });
	}

	onDeptoFocused(e: any): void {
		const row = (e?.row?.data ?? e?.data) as GenDepto;
		if (!row?.CORR_DEPTO) {
			return;
		}
		if (this.selectedDepto?.CORR_PAIS === row.CORR_PAIS && this.selectedDepto?.CORR_DEPTO === row.CORR_DEPTO) {
			this.actualizarResaltadoCascade();
			return;
		}
		this.selectedDepto = row;
		this.selectedMunicipio = undefined;
		this.inicializarGridsCascade();
		this.actualizarResaltadoCascade();
		this.configurarDataSourceMunicipios();
		this.refrescarMunicipios(true);
		this.refrescarDistritos(true);
	}

	onMunicipioFocused(e: any): void {
		const row = (e?.row?.data ?? e?.data) as GenMunicipio;
		if (!row?.CORR_MUNICIPIO) {
			return;
		}
		if (
			this.selectedMunicipio?.CORR_PAIS === row.CORR_PAIS &&
			this.selectedMunicipio?.CORR_DEPTO === row.CORR_DEPTO &&
			this.selectedMunicipio?.CORR_MUNICIPIO === row.CORR_MUNICIPIO
		) {
			this.actualizarResaltadoCascade();
			return;
		}
		this.selectedMunicipio = row;
		this.inicializarGridsCascade();
		this.actualizarResaltadoCascade();
		this.configurarDataSourceDistritos();
		this.refrescarDistritos(true);
	}

	nuevoDepto(): void {
		if (!this.permiteAdd) {
			this.notifyFx('No tiene permiso para crear registros.', NotifyType.Warning);
			return;
		}
		if (!this.selectedPais) {
			this.notifyFx('Seleccione un país para agregar departamentos.', NotifyType.Warning);
			return;
		}
		this.abrirPopup('depto', true);
	}

	nuevoMunicipio(): void {
		if (!this.permiteAdd) {
			this.notifyFx('No tiene permiso para crear registros.', NotifyType.Warning);
			return;
		}
		if (!this.selectedDepto) {
			this.notifyFx('Seleccione un departamento para agregar municipios.', NotifyType.Warning);
			return;
		}
		this.abrirPopup('municipio', true);
	}

	nuevoDistrito(): void {
		if (!this.permiteAdd) {
			this.notifyFx('No tiene permiso para crear registros.', NotifyType.Warning);
			return;
		}
		if (!this.selectedMunicipio) {
			this.notifyFx('Seleccione un municipio para agregar distritos.', NotifyType.Warning);
			return;
		}
		this.abrirPopup('distrito', true);
	}

	onEditDeptoClick(e: any): void {
		if (e?.row?.data) {
			this.abrirPopup('depto', false, e.row.data);
		}
	}

	onDeleteDeptoClick(e: any): void {
		const row = e?.row?.data as GenDepto;
		if (!row) {
			return;
		}
		this.confirmAction('Eliminar departamento', `Desea eliminar "${row.NOMBRE_DEPTO}"?`, () => this.eliminarDepto(row));
	}

	onEditMunicipioClick(e: any): void {
		if (e?.row?.data) {
			this.abrirPopup('municipio', false, e.row.data);
		}
	}

	onDeleteMunicipioClick(e: any): void {
		const row = e?.row?.data as GenMunicipio;
		if (!row) {
			return;
		}
		this.confirmAction('Eliminar municipio', `Desea eliminar "${row.NOMBRE_MUNICIPIO}"?`, () => this.eliminarMunicipio(row));
	}

	onEditDistritoClick(e: any): void {
		if (e?.row?.data) {
			this.abrirPopup('distrito', false, e.row.data);
		}
	}

	onDeleteDistritoClick(e: any): void {
		const row = e?.row?.data as GenDistrito;
		if (!row) {
			return;
		}
		this.confirmAction('Eliminar distrito', `Desea eliminar "${row.NOMBRE_DISTRITO}"?`, () => this.eliminarDistrito(row));
	}

	guardarPopup(): void {
		if (this.popupSaving) {
			return;
		}
		this.popupSaving = true;

		if (!this.validarEmpresaSesion()) {
			this.popupSaving = false;
			return;
		}

		const formData = this.popupForm?.instance?.option('formData') as GenDepto | GenMunicipio | GenDistrito | undefined;
		if (formData) {
			this.popupModel = { ...this.popupModel, ...formData };
		}

		this.popupModel = this.reforzarContextoPopup(this.popupModel);

		const formValidation = this.popupForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValidoNivel(this.popupNivel, this.popupModel, this.notifyFx.bind(this), !this.popupIsAdd);
			this.popupSaving = false;
			return;
		}

		if (!this.service.esValidoNivel(this.popupNivel, this.popupModel, this.notifyFx.bind(this), !this.popupIsAdd)) {
			this.popupSaving = false;
			return;
		}

		this.loadingVisible = true;
		this.ejecutarGuardarPopup();
	}

	private reforzarContextoPopup(model: GenDepto | GenMunicipio | GenDistrito): GenDepto | GenMunicipio | GenDistrito {
		if (this.popupNivel === 'depto') {
			return {
				...(model as GenDepto),
				CORR_PAIS: this.selectedPais?.CORR_PAIS ?? (model as GenDepto).CORR_PAIS ?? 0,
			};
		}

		if (this.popupNivel === 'municipio') {
			return {
				...(model as GenMunicipio),
				CORR_PAIS: this.selectedPais?.CORR_PAIS ?? (model as GenMunicipio).CORR_PAIS ?? 0,
				CORR_DEPTO: this.selectedDepto?.CORR_DEPTO ?? (model as GenMunicipio).CORR_DEPTO ?? 0,
			};
		}

		return {
			...(model as GenDistrito),
			CORR_PAIS: this.selectedPais?.CORR_PAIS ?? (model as GenDistrito).CORR_PAIS ?? 0,
			CORR_DEPTO: this.selectedDepto?.CORR_DEPTO ?? (model as GenDistrito).CORR_DEPTO ?? 0,
			CORR_MUNICIPIO: this.selectedMunicipio?.CORR_MUNICIPIO ?? (model as GenDistrito).CORR_MUNICIPIO ?? 0,
		};
	}

	private finalizarGuardadoPopup(): void {
		this.popupSaving = false;
		this.loadingVisible = false;
	}

	private ejecutarGuardarPopup(): void {
		this.getPopupRequest()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.popupVisible = false;
						this.refrescarNivel(this.popupNivel);
						this.notifyFx(this.popupIsAdd ? 'Registro creado con exito!' : 'Registro modificado con exito!', NotifyType.Success);
					} else {
						this.notifyFx(response.ErrorMessage, this.getNotifyType(response));
					}
					this.finalizarGuardadoPopup();
				},
				error: (error: any) => {
					this.notifyFx(this.getErrorMessage(error), this.getErrorNotifyType(error));
					this.finalizarGuardadoPopup();
				},
			});
	}

	cerrarPopup(): void {
		this.popupVisible = false;
	}

	override bloquear(): void {
		this.bloquearCamposCorr(this.dataForm);
	}

	override habilitar(): void {
		setTimeout(() => this.bloquearCamposCorr(this.dataForm));
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('NOMBRE_PAIS')?.focus();
		});
	}

	refrescarDeptos(force = false): void {
		this.deptoGrid?.refreshData(force);
		setTimeout(() => this.inicializarGridsCascade());
	}

	refrescarMunicipios(force = false): void {
		this.municipioGrid?.refreshData(force);
		setTimeout(() => this.inicializarGridsCascade());
	}

	refrescarDistritos(force = false): void {
		this.distritoGrid?.refreshData(force);
		setTimeout(() => this.inicializarGridsCascade());
	}

	private actualizarColumnas(): void {
		this.columns = this.service.getPaisColumns(this.onEditPaisClick, this.onDeletePaisClick, this.permiteEdit, this.permiteDele);
		this.deptoColumns = this.service.getDeptoColumns(this.onEditDeptoClick, this.onDeleteDeptoClick, this.permiteEdit, this.permiteDele);
		this.municipioColumns = this.service.getMunicipioColumns(
			this.onEditMunicipioClick,
			this.onDeleteMunicipioClick,
			this.permiteEdit,
			this.permiteDele
		);
		this.districtoColumns = this.service.getDistritoColumns(
			this.onEditDistritoClick,
			this.onDeleteDistritoClick,
			this.permiteEdit,
			this.permiteDele
		);
	}

	private resolveUrlOpcion(): string {
		let route: ActivatedRoute | null = this.router;
		while (route) {
			const path = route.snapshot.routeConfig?.path;
			if (path) {
				return `/${path}`;
			}
			route = route.parent;
		}
		return '/gen-estructura-territorial';
	}

	private syncToolbarContext(): void {
		this.pageContext.updateFromBarra(
			{
				titulo: this.tituloVentana,
				subtitle: this.subTituloVentana,
				permiteAdd: this.permiteAdd,
				showRefresh: true,
				unifiedToolbar: true,
				isBrowse: this.isBrowse(),
			},
			{
				add: () => this.nuevo(),
				refresh: () => this.consultar(),
			}
		);
	}

	private configurarDataSourcePaises(): void {
		this.models = new CustomStore({
			key: 'CORR_PAIS',
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => {
				const takeRows = loadOptions.take || 5;
				const skipRows = loadOptions.skip || 0;
				const page = Math.floor(skipRows / takeRows) + 1;
				const grid = this.dataGrid?.gData?.instance;

				if (grid) {
					const filterRowValues = readGridFilterRowValues(grid);
					const hasFilterRow =
						Object.keys(filterRowValues.filterRow).length > 0 ||
						Object.keys(filterRowValues.filterRowExact).length > 0;
					if (hasFilterRow) {
						clearGridHeaderFilterSelections(grid);
					}
				}

				const gridFilters = parseRemoteGridFilters(loadOptions.filter, grid, GRID_FILTER_CONFIG);
				if (!hasRemoteFilterRowSearch(gridFilters)) {
					await this.resolveExcludeHeaderFilters(grid, gridFilters, 'pais');
				}

				const sort = this.getGridSort(loadOptions.sort);
				const response = await lastValueFrom(
					this.service.getAllPaises(
						this.fillParam(page, takeRows, '', gridFilters, '', '', sort?.field ?? '', sort?.desc ?? false)
					)
				);

				if (!response.Result) {
					throw new Error(response.ErrorMessage || 'No se pudo cargar los países.');
				}

				return {
					data: response.Data || [],
					totalCount: response.RowsAffected || 0,
				};
			},
		});
	}

	private configurarDataSourceHijos(): void {
		this.configurarDataSourceDeptos();
		this.configurarDataSourceMunicipios();
		this.configurarDataSourceDistritos();
	}

	private configurarDataSourceDeptos(): void {
		this.deptoModels = new CustomStore({
			key: ['CORR_PAIS', 'CORR_DEPTO'],
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => this.loadCascadeLevel('depto', loadOptions),
		});
	}

	private configurarDataSourceMunicipios(): void {
		this.municipioModels = new CustomStore({
			key: ['CORR_PAIS', 'CORR_DEPTO', 'CORR_MUNICIPIO'],
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => this.loadCascadeLevel('municipio', loadOptions),
		});
	}

	private configurarDataSourceDistritos(): void {
		this.distritoModels = new CustomStore({
			key: ['CORR_PAIS', 'CORR_DEPTO', 'CORR_MUNICIPIO', 'CORR_DISTRITO'],
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => this.loadCascadeLevel('distrito', loadOptions),
		});
	}

	private async loadCascadeLevel(level: TerritorialGridLevel, loadOptions: any): Promise<{ data: unknown[]; totalCount: number }> {
		const scope = this.getScopeForLevel(level);
		if (!scope.CORR_PAIS) {
			return { data: [], totalCount: 0 };
		}
		if (level === 'municipio' && !scope.CORR_DEPTO) {
			return { data: [], totalCount: 0 };
		}
		if (level === 'distrito' && !scope.CORR_MUNICIPIO) {
			return { data: [], totalCount: 0 };
		}

		const grid = this.getGridByLevel(level)?.gData?.instance;
		if (grid) {
			const filterRowValues = readGridFilterRowValues(grid);
			const hasFilterRow =
				Object.keys(filterRowValues.filterRow).length > 0 ||
				Object.keys(filterRowValues.filterRowExact).length > 0;
			if (hasFilterRow) {
				clearGridHeaderFilterSelections(grid);
			}
		}

		const gridFilters = parseRemoteGridFilters(loadOptions.filter, grid, GRID_FILTER_CONFIG);
		if (!hasRemoteFilterRowSearch(gridFilters)) {
			await this.resolveExcludeHeaderFilters(grid, gridFilters, level);
		}

		const sort = this.getGridSort(loadOptions.sort);
		const request = this.fillCascadeParam('', gridFilters, '', '', sort?.field ?? '', sort?.desc ?? false, scope);
		const response = await lastValueFrom(
			level === 'depto'
				? this.service.getAllDeptos(request)
				: level === 'municipio'
					? this.service.getAllMunicipios(request)
					: this.service.getAllDistritos(request)
		);

		if (!response.Result) {
			const labels = { depto: 'departamentos', municipio: 'municipios', distrito: 'distritos' };
			throw new Error(response.ErrorMessage || `No se pudo cargar los ${labels[level]}.`);
		}

		const data = response.Data || [];
		return { data, totalCount: data.length };
	}

	private limpiarSeleccionHijos(): void {
		this.selectedDepto = undefined;
		this.selectedMunicipio = undefined;
		this.actualizarResaltadoCascade();
	}

	private inicializarGridsCascade(): void {
		this.vincularGridCascade(this.deptoGrid, 'depto');
		this.vincularGridCascade(this.municipioGrid, 'municipio');
		this.vincularGridCascade(this.distritoGrid, 'distrito');
	}

	private vincularGridCascade(
		grid: DataGridMttoComponent | undefined,
		tipo: 'depto' | 'municipio' | 'distrito'
	): void {
		const instance = grid?.gData?.instance;
		if (!instance) {
			return;
		}

		instance.option('paging.enabled', false);
		instance.option('pager.visible', false);
		instance.option('scrolling.mode', 'standard');
		instance.option('scrolling.useNative', false);
		instance.option('scrolling.showScrollbar', 'always');
		instance.option('height', this.cascadeGridHeight);
		instance.updateDimensions();

		if (this.cascadeGridHooks.has(instance)) {
			return;
		}

		instance.on('contentReady', () => {
			this.parchearOverlaysFiltroCascade(instance);
		});

		instance.on('rowPrepared', (event: any) => {
			if (tipo === 'distrito' || event.rowType !== 'data' || !event.rowElement) {
				return;
			}

			event.rowElement.classList.remove('territorial-row-selected');

			if (tipo === 'depto' && this.selectedDepto && this.esMismoDepto(event.data, this.selectedDepto)) {
				event.rowElement.classList.add('territorial-row-selected');
			}

			if (tipo === 'municipio' && this.selectedMunicipio && this.esMismoMunicipio(event.data, this.selectedMunicipio)) {
				event.rowElement.classList.add('territorial-row-selected');
			}
		});

		this.cascadeGridHooks.add(instance);
	}

	private parchearOverlaysFiltroCascade(instance: any): void {
		const headerFilterView = instance.getView?.('headerFilterView');
		const headerFilterPopup = headerFilterView?.getPopupContainer?.();
		if (headerFilterPopup) {
			headerFilterPopup.option('container', document.body);
		}

		const gridElement = instance.element?.()?.get?.(0) as HTMLElement | undefined;
		if (!gridElement) {
			return;
		}

		gridElement.querySelectorAll('.dx-filter-menu').forEach((node) => {
			const menu = Menu.getInstance(node);
			if (!menu) {
				return;
			}

			if (!(menu as any).__territorialCascadePatched) {
				(menu as any).__territorialCascadePatched = true;
				menu.on('submenuShowing', (event: any) => {
					event.submenu?.option?.('container', document.body);
				});
			}

			((menu as any)._submenus || []).forEach((submenu: any) => {
				submenu.option('container', document.body);
			});
		});
	}

	private actualizarResaltadoCascade(): void {
		setTimeout(() => {
			this.inicializarGridsCascade();
			this.repintarFilasVisibles(this.deptoGrid);
			this.repintarFilasVisibles(this.municipioGrid);
		});
	}

	private repintarFilasVisibles(grid: DataGridMttoComponent | undefined): void {
		const instance = grid?.gData?.instance;
		if (!instance) {
			return;
		}

		const rowIndexes = instance
			.getVisibleRows()
			.filter((row) => row.rowType === 'data')
			.map((row) => row.rowIndex);

		if (rowIndexes.length) {
			instance.repaintRows(rowIndexes);
		}
	}

	private esMismoDepto(data: GenDepto, selected: GenDepto): boolean {
		return Number(data.CORR_PAIS) === Number(selected.CORR_PAIS) && Number(data.CORR_DEPTO) === Number(selected.CORR_DEPTO);
	}

	private esMismoMunicipio(data: GenMunicipio, selected: GenMunicipio): boolean {
		return (
			Number(data.CORR_PAIS) === Number(selected.CORR_PAIS) &&
			Number(data.CORR_DEPTO) === Number(selected.CORR_DEPTO) &&
			Number(data.CORR_MUNICIPIO) === Number(selected.CORR_MUNICIPIO)
		);
	}

	private abrirPopup(nivel: TerritorialNivel, isAdd: boolean, row?: GenDepto | GenMunicipio | GenDistrito): void {
		this.popupNivel = nivel;
		this.popupIsAdd = isAdd;
		this.popupTitle = this.service.getPopupTitle(nivel, isAdd);

		if (nivel === 'depto') {
			this.popupModel = this.fillDepto(isAdd ? undefined : (row as GenDepto));
			this.popupItems = this.service.getDeptoItems();
		} else if (nivel === 'municipio') {
			this.popupModel = this.fillMunicipio(isAdd ? undefined : (row as GenMunicipio));
			this.popupItems = this.service.getMunicipioItems();
		} else {
			this.popupModel = this.fillDistrito(isAdd ? undefined : (row as GenDistrito));
			this.popupItems = this.service.getDistritoItems();
		}

		this.popupVisible = true;
		setTimeout(() => {
			this.popupForm?.instance?.option('formData', this.popupModel);
			this.bloquearCamposCorr(this.popupForm);
		});
	}

	private getGridByLevel(level: TerritorialGridLevel): DataGridMttoComponent | undefined {
		switch (level) {
			case 'pais':
				return this.dataGrid;
			case 'depto':
				return this.deptoGrid;
			case 'municipio':
				return this.municipioGrid;
			case 'distrito':
				return this.distritoGrid;
		}
	}

	private getScopeForLevel(level: TerritorialGridLevel): Record<string, number> {
		const scope: Record<string, number> = {};
		if (this.selectedPais?.CORR_PAIS) {
			scope.CORR_PAIS = this.selectedPais.CORR_PAIS;
		}
		if (level !== 'depto' && this.selectedDepto?.CORR_DEPTO) {
			scope.CORR_DEPTO = this.selectedDepto.CORR_DEPTO;
		}
		if (level === 'distrito' && this.selectedMunicipio?.CORR_MUNICIPIO) {
			scope.CORR_MUNICIPIO = this.selectedMunicipio.CORR_MUNICIPIO;
		}
		return scope;
	}

	private getGridSort(sort: any): { field: string; desc: boolean } | null {
		if (!Array.isArray(sort) || !sort.length) {
			return null;
		}

		const first = sort[0];
		if (!first?.selector) {
			return null;
		}

		return {
			field: `${first.selector}`,
			desc: !!first.desc,
		};
	}

	private async resolveExcludeHeaderFilters(grid: any, result: ParsedGridFilters, level: TerritorialGridLevel): Promise<void> {
		if (!grid?.getVisibleColumns) {
			return;
		}

		for (const column of grid.getVisibleColumns()) {
			const dataField = column?.dataField;
			if (!dataField || column.allowHeaderFiltering === false) {
				continue;
			}

			const selection = getColumnHeaderFilterSelection(grid, dataField);
			if (!selection || selection.filterType !== 'exclude' || !selection.values.length) {
				continue;
			}

			const filtersForDistinct = cloneRemoteGridFilters(result);
			delete filtersForDistinct.headerAnyOf[dataField];
			delete filtersForDistinct.filterRow[dataField];
			delete filtersForDistinct.filterRowExact[dataField];

			const scope = this.getScopeForLevel(level);
			const request = this.fillCascadeParam('', filtersForDistinct, dataField, '', '', false, scope);
			const distinctCall =
				level === 'pais'
					? this.service.getDistinctValuesPaises({ ...request, PAGE: 1, PAGE_SIZE: 0 })
					: level === 'depto'
						? this.service.getDistinctValuesDeptos(request)
						: level === 'municipio'
							? this.service.getDistinctValuesMunicipios(request)
							: this.service.getDistinctValuesDistritos(request);

			const response = await lastValueFrom(distinctCall);
			if (!response.Result) {
				continue;
			}

			const included = invertExcludedHeaderFilterValues(selection.values, response.Data ?? []);
			result.headerAnyOf[dataField] = included.length ? included : ['__NO_MATCH__'];
		}
	}

	private getPopupRequest() {
		if (this.popupNivel === 'depto') {
			const model = this.popupModel as GenDepto;
			return this.popupIsAdd ? this.service.insertDepto(model) : this.service.updateDepto(model);
		}
		if (this.popupNivel === 'municipio') {
			const model = this.popupModel as GenMunicipio;
			return this.popupIsAdd ? this.service.insertMunicipio(model) : this.service.updateMunicipio(model);
		}
		const model = this.popupModel as GenDistrito;
		return this.popupIsAdd ? this.service.insertDistrito(model) : this.service.updateDistrito(model);
	}

	private refrescarNivel(nivel: TerritorialNivel): void {
		if (nivel === 'depto') {
			this.refrescarDeptos(true);
			return;
		}
		if (nivel === 'municipio') {
			this.refrescarMunicipios(true);
			return;
		}
		this.refrescarDistritos(true);
	}

	private eliminarPais(row: GenPais, desdeDetalle: boolean): void {
		if (!this.validarEmpresaSesion()) {
			return;
		}

		this.loadingVisible = true;
		this.service
			.deletePais(row)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						if (desdeDetalle) {
							this.volverAlListado();
						} else {
							this.consultar();
						}
						this.notifyFx('País eliminado con exito!', NotifyType.Success);
					} else {
						this.notifyFx(
							response.ErrorMessage || 'No se puede eliminar el país porque tiene registros relacionados.',
							this.getDeleteNotifyType(response.ErrorMessage)
						);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyFx(this.getErrorMessage(error), this.getErrorNotifyType(error));
					this.loadingVisible = false;
				},
			});
	}

	private eliminarDepto(row: GenDepto): void {
		this.eliminarNivel(this.service.deleteDepto(row), 'depto', 'departamento');
	}

	private eliminarMunicipio(row: GenMunicipio): void {
		this.eliminarNivel(this.service.deleteMunicipio(row), 'municipio', 'municipio');
	}

	private eliminarDistrito(row: GenDistrito): void {
		this.eliminarNivel(this.service.deleteDistrito(row), 'distrito', 'distrito');
	}

	private eliminarNivel(request: any, nivel: TerritorialNivel, etiqueta: string): void {
		if (!this.validarEmpresaSesion()) {
			return;
		}

		this.loadingVisible = true;
		request.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) {
					if (nivel === 'depto') {
						this.selectedDepto = undefined;
						this.selectedMunicipio = undefined;
						this.configurarDataSourceMunicipios();
						this.configurarDataSourceDistritos();
						this.actualizarResaltadoCascade();
					} else if (nivel === 'municipio') {
						this.selectedMunicipio = undefined;
						this.configurarDataSourceDistritos();
						this.actualizarResaltadoCascade();
					}
					this.refrescarNivel(nivel);
					this.notifyFx(`${etiqueta} eliminado con exito!`, NotifyType.Success);
				} else {
					this.notifyFx(
						response.ErrorMessage || `No se puede eliminar el ${etiqueta} porque tiene registros relacionados.`,
						this.getDeleteNotifyType(response.ErrorMessage)
					);
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				const message = this.getErrorMessage(error);
				this.notifyFx(message, this.getDeleteNotifyType(message));
				this.loadingVisible = false;
			},
		});
	}

	private getDeleteNotifyType(message: string): NotifyType {
		const value = `${message ?? ''}`.toLowerCase();
		if (
			isEmpresaFkErrorMessage(message) ||
			value.includes('relacionados') ||
			value.includes('asociados') ||
			value.includes('registros asociados') ||
			value.includes('hijos asociados')
		) {
			return NotifyType.Warning;
		}
		return NotifyType.Error;
	}

	private bloquearCamposCorr(form?: DxFormComponent): void {
		const corrFields = ['CORR_PAIS', 'CORR_DEPTO', 'CORR_MUNICIPIO', 'CORR_DISTRITO'];
		corrFields.forEach((field) => {
			form?.instance?.getEditor(field)?.option('readOnly', true);
		});
	}

	private confirmAction(title: string, message: string, fn: () => void): void {
		const dialog = custom({
			title,
			messageHtml: `<div class="territorial-confirm-message">${message}</div>`,
			popupOptions: {
				width: 420,
				wrapperAttr: { class: 'territorial-confirm-dialog' },
			},
			buttons: [
				{ text: 'Si', type: 'default', onClick: () => true },
				{ text: 'No', onClick: () => false },
			],
		} as TerritorialConfirmDialogOptions);

		dialog.show().then((accepted: boolean) => {
			if (accepted) {
				fn();
			}
		});
	}

	private getErrorMessage(error: any): string {
		if (typeof error === 'string' && error.trim()) {
			return error;
		}
		return error?.error?.ErrorMessage || error?.error?.message || error?.message || 'Ocurrio un error al procesar la solicitud.';
	}

	private getErrorNotifyType(error: any): NotifyType {
		const body = error?.error;
		if (body && typeof body === 'object' && body.ErrorCode !== undefined) {
			return this.getNotifyType(body);
		}

		const message = this.getErrorMessage(error);
		if (isEmpresaFkErrorMessage(message) || this.isDuplicateWarningMessage(message)) {
			return NotifyType.Warning;
		}

		return NotifyType.Error;
	}

	private isDuplicateWarningMessage(message: string): boolean {
		const value = `${message ?? ''}`.toLowerCase();
		return (
			value.includes('ya existe') ||
			value.includes('duplicad') ||
			value.includes('registrad') ||
			value.includes('otro usuario guard') ||
			value.includes('mismo tiempo')
		);
	}

	private getCorrEmpresaSesion(): number {
		const value = Number(this.authService.decodedToken?.CORR_EMPRESA ?? 0);
		return Number.isFinite(value) ? value : 0;
	}

	private validarEmpresaSesion(): boolean {
		if (this.getCorrEmpresaSesion() > 0) {
			return true;
		}
		this.notifyFx(getEmpresaWarningMessage(EMPRESA_REGISTRO_ETIQUETA), NotifyType.Warning);
		return false;
	}

	private getNotifyType(response: any): NotifyType {
		if (isEmpresaWarningResponse(response)) {
			return NotifyType.Warning;
		}
		const message = (response?.ErrorMessage || '').toLowerCase();
		return response?.ErrorCode === 2627 || this.isDuplicateWarningMessage(message)
			? NotifyType.Warning
			: NotifyType.Error;
	}

	private getWarningMessage(message: string): string {
		const cleanMessage = `${message ?? ''}`.replace(/^error:\s*/i, '').trim();
		const value = cleanMessage.toLowerCase();
		if (isEmpresaFkErrorMessage(cleanMessage) || value.includes('no tiene una empresa asignada')) {
			return getEmpresaWarningMessage(EMPRESA_REGISTRO_ETIQUETA);
		}
		if (this.isDuplicateWarningMessage(cleanMessage)) {
			return cleanMessage;
		}
		if (value.includes('hijos asociados') || value.includes('registros asociados') || value.includes('asociados') || value.includes('relacionados')) {
			return 'No se puede eliminar porque tiene registros relacionados. Revise los datos asociados antes de continuar.';
		}
		return cleanMessage;
	}
}
