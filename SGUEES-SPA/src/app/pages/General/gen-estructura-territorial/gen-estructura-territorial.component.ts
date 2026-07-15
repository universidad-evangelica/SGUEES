import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Menu from 'devextreme/ui/menu';
import { DxFormComponent } from 'devextreme-angular';
import { custom, CustomDialogOptions } from 'devextreme/ui/dialog';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { MttoPageContextService } from 'src/app/layouts/mtto-page-context.service';
import { GenDepto } from './gen-depto/models/gen-depto';
import { GenDistrito } from './gen-distrito/models/gen-distrito';
import { GenMunicipio } from './gen-municipio/models/gen-municipio';
import { GenPais, TerritorialNivel } from './models/gen-pais';
import {
	EMPRESA_REGISTRO_ETIQUETA,
	GenEstructuraTerritorialService,
	getEmpresaWarningMessage,
	isEmpresaFkErrorMessage,
	isEmpresaWarningResponse,
} from './gen-estructura-territorial.service';

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

	protected override etiquetaRegistro = 'el país';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_PAIS';
	/** A+: paginado / filtro / orden en cliente (API devuelve todos los países). */
	protected override mttoRemoteOperations = false;

	readonly cascadeGridHeight = 530;
	protected override mttoParchearGridTrasGuardar = true;
	private readonly maintenanceSubtitulo = 'Estructura territorial';
	private readonly cascadeGridHooks = new WeakSet<object>();

	vistaDetalle = false;
	selectedPais?: GenPais;
	selectedDepto?: GenDepto;
	selectedMunicipio?: GenMunicipio;

	deptoModels: GenDepto[] = [];
	municipioModels: GenMunicipio[] = [];
	distritoModels: GenDistrito[] = [];

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

	readonly popupFormColCountByScreen = { xs: 1, sm: 1, md: 2, lg: 2 };

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEstructuraTerritorialService,
		private pageContext: MttoPageContextService
	) {
		super(appInfoService, router);
		this.onEditDeptoClick = this.onEditDeptoClick.bind(this);
		this.onDeleteDeptoClick = this.onDeleteDeptoClick.bind(this);
		this.onEditMunicipioClick = this.onEditMunicipioClick.bind(this);
		this.onDeleteMunicipioClick = this.onDeleteMunicipioClick.bind(this);
		this.onEditDistritoClick = this.onEditDistritoClick.bind(this);
		this.onDeleteDistritoClick = this.onDeleteDistritoClick.bind(this);

		this.columns = this.service.getPaisColumns();
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
		this.consultar();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
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
			this.abrirDocumentoPais(rowData as GenPais);
		}
	}

	/** Edit del grid → documento país (form editable + cascada), Guardar/Cancelar del padre. */
	editarPaisDesdeGrid(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (rowData) {
			this.abrirDocumentoPais(rowData as GenPais);
		}
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

	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAllPaises(),
			onData: () => {
				this.ordenarPaisesPorCorr();
				this.refrescarGridPaises(resetPage);
			},
		});
	}

	private ordenarPaisesPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_PAIS) - Number(b.CORR_PAIS));
	}

	private refrescarGridPaises(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	/**
	 * Abre el documento país (como partida): form habilitado + cascada.
	 * Barra = Guardar / Cancelar del padre.
	 */
	abrirDocumentoPais(pais: GenPais, desdeAlta = false): void {
		if (!desdeAlta && !this.permiteEdit) {
			this.notifyFx('No tiene permiso para editar registros.', NotifyType.Warning);
			return;
		}
		this.vistaDetalle = true;
		this.selectedPais = this.fillPais(pais);
		this.model = this.fillPais(pais);
		this.modelUpdate = this.fillPais(pais);
		this.AsignaStatus(UpdateType.Update);
		this.limpiarSeleccionHijos();
		this.getCORR_DEPTO();
		setTimeout(() => {
			this.habilitar();
			this.setFocus();
			this.inicializarGridsCascade();
		});
	}

	/** Sale del documento al listado (Cancelar / tras eliminar). */
	salirAListado(): void {
		this.vistaDetalle = false;
		this.selectedPais = undefined;
		this.limpiarSeleccionHijos();
		this.model = this.fillPais();
		this.modelUpdate = this.fillPais();
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.actualizarColumnas();
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.syncToolbarContext();
		setTimeout(() => this.consultar());
	}

	override nuevo(): void {
		if (this.vistaDetalle) {
			return;
		}
		super.nuevo();
	}

	guardar(): void {
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

		this.guardarMtto({
			esValido: () => this.service.esValidoPais(this.model, this.notifyFx.bind(this), !isAdd),
			insert: () => this.service.insertPais(this.model),
			update: () => this.service.updatePais(this.model),
			onSuccess: (response: IResult) => {
				const savedPais = response.Data as GenPais;
				if (isAdd) {
					this.abrirDocumentoPais(savedPais, true);
				} else {
					this.salirAListado();
				}
			},
		});
	}

	override cancelar(): void {
		const finalizar = () => {
			if (this.vistaDetalle) {
				this.salirAListado();
				return;
			}
			this.AsignaStatus(UpdateType.Browse);
			this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
			this.actualizarColumnas();
			this.syncToolbarContext();
			this.model = this.fillPais();
			this.modelUpdate = this.fillPais();
		};

		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(finalizar);
			return;
		}
		finalizar();
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.deletePais(e.data),
			successMessage: 'País eliminado con éxito.',
		});
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
		this.getCORR_MUNICIPIO();
		this.getCORR_DISTRITO();
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
		this.getCORR_DISTRITO();
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

		if (!this.asegurarEmpresaSesion()) {
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
						this.notifyFx(this.popupIsAdd ? 'Registro creado con éxito.' : 'Registro modificado con éxito.', NotifyType.Success);
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

	getCORR_DEPTO(corrPais?: number): void {
		const pais = corrPais ?? this.selectedPais?.CORR_PAIS;
		if (!pais) {
			this.deptoModels = [];
			return;
		}

		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: pais }];
		this.loadingVisible = true;
		this.appInfoService
			.getLookUp(
				'GEN_ESTRUCTURA_TERRITORIAL',
				'GEN_DEPTO',
				'GetCORR_DEPTO',
				xWhere,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.deptoModels = response.Data;
					} else {
						this.deptoModels = [];
						if (!response?.Result) {
							this.notifyApiResponse(response);
						}
					}
					setTimeout(() => {
						this.deptoGrid?.refreshData(true);
						this.inicializarGridsCascade();
					});
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}

	getCORR_MUNICIPIO(corrPais?: number, corrDepto?: number): void {
		const pais = corrPais ?? this.selectedPais?.CORR_PAIS;
		const depto = corrDepto ?? this.selectedDepto?.CORR_DEPTO;
		if (!pais || !depto) {
			this.municipioModels = [];
			return;
		}

		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: pais },
			{ Parameter: 'CORR_DEPTO', Value: depto },
		];
		this.loadingVisible = true;
		this.appInfoService
			.getLookUp(
				'GEN_ESTRUCTURA_TERRITORIAL',
				'GEN_MUNICIPIO',
				'GetCORR_MUNICIPIO',
				xWhere,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.municipioModels = response.Data;
					} else {
						this.municipioModels = [];
						if (!response?.Result) {
							this.notifyApiResponse(response);
						}
					}
					setTimeout(() => {
						this.municipioGrid?.refreshData(true);
						this.inicializarGridsCascade();
					});
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}

	getCORR_DISTRITO(corrPais?: number, corrDepto?: number, corrMunicipio?: number): void {
		const pais = corrPais ?? this.selectedPais?.CORR_PAIS;
		const depto = corrDepto ?? this.selectedDepto?.CORR_DEPTO;
		const municipio = corrMunicipio ?? this.selectedMunicipio?.CORR_MUNICIPIO;
		if (!pais || !depto || !municipio) {
			this.distritoModels = [];
			return;
		}

		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: pais },
			{ Parameter: 'CORR_DEPTO', Value: depto },
			{ Parameter: 'CORR_MUNICIPIO', Value: municipio },
		];
		this.loadingVisible = true;
		this.appInfoService
			.getLookUp(
				'GEN_ESTRUCTURA_TERRITORIAL',
				'GEN_DISTRITO',
				'GetCORR_DISTRITO',
				xWhere,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.distritoModels = response.Data;
					} else {
						this.distritoModels = [];
						if (!response?.Result) {
							this.notifyApiResponse(response);
						}
					}
					setTimeout(() => {
						this.distritoGrid?.refreshData(true);
						this.inicializarGridsCascade();
					});
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}

	private actualizarColumnas(): void {
		this.columns = this.service.getPaisColumns();
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
				// En documento el Nuevo de país no sale (isForm); permiteAdd real alimenta la cascada.
				permiteAdd: this.permiteAdd,
				showRefresh: !this.vistaDetalle,
				unifiedToolbar: !this.vistaDetalle,
				embedTitleInGrid: false,
				isBrowse: this.isBrowse(),
			},
			{
				add: () => this.nuevo(),
				refresh: () => this.consultar(),
			}
		);
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
			this.getCORR_DEPTO();
			return;
		}
		if (nivel === 'municipio') {
			this.getCORR_MUNICIPIO();
			return;
		}
		this.getCORR_DISTRITO();
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
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		this.loadingVisible = true;
		request.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) {
					if (nivel === 'depto') {
						this.selectedDepto = undefined;
						this.selectedMunicipio = undefined;
						this.municipioModels = [];
						this.distritoModels = [];
						this.actualizarResaltadoCascade();
					} else if (nivel === 'municipio') {
						this.selectedMunicipio = undefined;
						this.distritoModels = [];
						this.actualizarResaltadoCascade();
					}
					this.refrescarNivel(nivel);
					this.notifyFx(`${etiqueta} eliminado con éxito.`, NotifyType.Success);
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
		const connectionMessage =
			'No se pudo comunicar con el servidor. Verifique que la API esté en ejecución e intente nuevamente.';

		if (typeof error === 'string') {
			const trimmed = error.trim();
			if (!trimmed || trimmed === '[object ProgressEvent]' || trimmed.toLowerCase().includes('http failure')) {
				return connectionMessage;
			}
			return trimmed;
		}

		if (error instanceof ProgressEvent || Object.prototype.toString.call(error) === '[object ProgressEvent]') {
			return connectionMessage;
		}

		if (error?.error instanceof ProgressEvent) {
			return connectionMessage;
		}

		const apiMessage = error?.error?.ErrorMessage || error?.error?.message || error?.message;
		if (typeof apiMessage === 'string' && apiMessage.trim()) {
			if (apiMessage === '[object ProgressEvent]' || apiMessage.toLowerCase().includes('http failure')) {
				return connectionMessage;
			}
			return apiMessage;
		}

		const coerced = `${error ?? ''}`.trim();
		if (coerced === '[object ProgressEvent]' || coerced === '[object Object]') {
			return connectionMessage;
		}

		return coerced || 'Ocurrio un error al procesar la solicitud.';
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
