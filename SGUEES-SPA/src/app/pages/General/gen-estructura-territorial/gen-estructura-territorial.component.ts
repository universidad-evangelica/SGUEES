// Qué hace: vista de estructura territorial (país + cascada depto/municipio/distrito).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Menu from 'devextreme/ui/menu';
import { DxFormComponent } from 'devextreme-angular';
import { custom, CustomDialogOptions } from 'devextreme/ui/dialog';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IParam } from 'src/app/FxAPI/IParam';
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
	GenEstructuraTerritorialService,
	isEmpresaFkErrorMessage,
	isEmpresaWarningResponse,
} from './gen-estructura-territorial.service';

// Qué hace: amplía CustomDialogOptions con ancho y clase del popup de confirmación.
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
// Qué hace: coordina el listado de países y la cascada territorial depto/municipio/distrito.
// Cómo: extiende CBaseComponent y usa GenEstructuraTerritorialService con popups para los niveles hijos.
export class GenEstructuraTerritorialComponent extends CBaseComponent implements OnInit {
	@ViewChild('paisGrid', { static: false }) dataGrid?: DataGridMttoComponent;
	@ViewChild('deptoGrid', { static: false }) deptoGrid?: DataGridMttoComponent;
	@ViewChild('municipioGrid', { static: false }) municipioGrid?: DataGridMttoComponent;
	@ViewChild('distritoGrid', { static: false }) distritoGrid?: DataGridMttoComponent;
	@ViewChild('popupForm', { static: false }) popupForm?: DxFormComponent;

	protected override etiquetaRegistro = 'el país';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_PAIS';
	// Qué hace: deja paginado/filtro/orden en cliente (el API entrega todos los países).
	protected override mttoRemoteOperations = false;

	readonly cascadeGridHeight = 530;
	protected override mttoParchearGridTrasGuardar = true;
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

	// Qué hace: prepara la pantalla al abrirla.
	// Cómo: resuelve permisos, columnas, toolbar y llama a consultar.
	ngOnInit(): void {
		this.urlOpcion = this.resolveUrlOpcion();
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.model = this.fillPais();
		this.modelUpdate = this.fillPais();
		this.actualizarColumnas();
		this.syncToolbarContext();
		this.consultar();
	}

	// Qué hace: entrega el grid de países al flujo base de CBaseComponent.
	// Cómo: retorna dataGrid o null.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: calcula el ancho del popup de niveles hijos.
	// Cómo: casi full-width en pantalla pequeña; 520px en el resto.
	get popupWidth(): number | string {
		return this.screen(window.innerWidth) === 'sm' ? 'calc(100vw - 24px)' : 520;
	}

	// Qué hace: sincroniza el estado del mantenimiento con la barra.
	// Cómo: llama a AsignaStatus base y syncToolbarContext.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		this.syncToolbarContext();
	}

	// Qué hace: abre el documento país al hacer doble clic en el grid.
	// Cómo: llama a abrirDocumentoPais con la fila seleccionada.
	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.abrirDocumentoPais(rowData as GenPais);
		}
	}

	// Qué hace: abre el documento país desde el botón editar del grid.
	// Cómo: llama a abrirDocumentoPais con la fila seleccionada.
	editarPaisDesdeGrid(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (rowData) {
			this.abrirDocumentoPais(rowData as GenPais);
		}
	}

	// Qué hace: construye el modelo de país para el formulario.
	// Cómo: si recibe xModel copia sus campos; si no, devuelve valores iniciales vacíos.
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

	// Qué hace: adapta fillData del base al modelo de país.
	// Cómo: llama a fillPais.
	override fillData(xModel?: GenPais): GenPais {
		return this.fillPais(xModel);
	}

	// Qué hace: construye el modelo de departamento para el popup.
	// Cómo: toma CORR_PAIS del país seleccionado y completa el resto desde xModel.
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

	// Qué hace: construye el modelo de municipio para el popup.
	// Cómo: toma país/depto seleccionados y completa el resto desde xModel.
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

	// Qué hace: construye el modelo de distrito para el popup.
	// Cómo: toma la jerarquía seleccionada y completa el resto desde xModel.
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

	// Qué hace: carga el listado de países en el grid.
	// Cómo: llama a getAllPaises del servicio mediante consultarMtto.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAllPaises(),
			onData: () => {
				this.ordenarPaisesPorCorr();
				this.refrescarGridPaises(resetPage);
			},
		});
	}

	// Qué hace: ordena el listado de países por CORR_PAIS.
	// Cómo: crea una copia ordenada de this.models.
	private ordenarPaisesPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_PAIS) - Number(b.CORR_PAIS));
	}

	// Qué hace: refresca el grid de países.
	// Cómo: llama a refreshData del dataGrid en el siguiente tick.
	private refrescarGridPaises(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Qué hace: abre el documento país con formulario y cascada.
	// Cómo: fija Update, limpia hijos, carga departamentos y habilita el formulario.
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

	// Qué hace: regresa del documento país al listado.
	// Cómo: limpia selección, pasa a Browse y llama a consultar.
	salirAListado(): void {
		this.vistaDetalle = false;
		this.selectedPais = undefined;
		this.limpiarSeleccionHijos();
		this.model = this.fillPais();
		this.modelUpdate = this.fillPais();
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.actualizarColumnas();
		this.syncToolbarContext();
		setTimeout(() => this.consultar());
	}

	// Qué hace: inicia la creación de un país desde el listado.
	// Cómo: ignora si está en documento; si no, llama a nuevo del base.
	override nuevo(): void {
		if (this.vistaDetalle) {
			return;
		}
		super.nuevo();
	}

	// Qué hace: valida y guarda el país (creación o actualización).
	// Cómo: llama a insertPais o updatePais del servicio según banderaMtto.
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
			insert: () =>
				this.convertirDuplicadoEnWarning(
					this.service.insertPais(this.model),
					'El código de país ingresado está registrado. Escriba otro código para continuar.'
				),
			update: () =>
				this.convertirDuplicadoEnWarning(
					this.service.updatePais(this.model),
					'El código de país ingresado está registrado. Escriba otro código para continuar.'
				),
			onSuccess: (data: unknown) => {
				const savedPais = data as GenPais;
				if (isAdd) {
					this.abrirDocumentoPais(savedPais, true);
				} else {
					this.salirAListado();
				}
			},
		});
	}

	// Qué hace: cancela la edición del país y vuelve al listado o a Browse.
	// Cómo: confirma si hay cambios y llama a salirAListado o limpia el modelo.
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

	// Qué hace: elimina el país seleccionado en el grid.
	// Cómo: llama a deletePais del servicio vía rowRemovingMtto.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.deletePais(e.data)),
			successMessage: 'País eliminado con éxito.',
		});
	}

	// Qué hace: responde al foco de un departamento en la cascada.
	// Cómo: fija selectedDepto, limpia municipio y llama a getCORR_MUNICIPIO/getCORR_DISTRITO.
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

	// Qué hace: responde al foco de un municipio en la cascada.
	// Cómo: fija selectedMunicipio y llama a getCORR_DISTRITO.
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

	// Qué hace: abre el popup para crear un departamento.
	// Cómo: valida permiso y país; llama a abrirPopup con nivel depto.
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

	// Qué hace: abre el popup para crear un municipio.
	// Cómo: valida permiso y depto; llama a abrirPopup con nivel municipio.
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

	// Qué hace: abre el popup para crear un distrito.
	// Cómo: valida permiso y municipio; llama a abrirPopup con nivel distrito.
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

	// Qué hace: abre el popup para editar el departamento de la fila.
	// Cómo: llama a abrirPopup con nivel depto y la fila.
	onEditDeptoClick(e: any): void {
		if (e?.row?.data) {
			this.abrirPopup('depto', false, e.row.data);
		}
	}

	// Qué hace: confirma y elimina el departamento de la fila.
	// Cómo: llama a confirmAction y luego eliminarDepto.
	onDeleteDeptoClick(e: any): void {
		const row = e?.row?.data as GenDepto;
		if (!row) {
			return;
		}
		this.confirmAction('Eliminar departamento', `Desea eliminar "${row.NOMBRE_DEPTO}"?`, () => this.eliminarDepto(row));
	}

	// Qué hace: abre el popup para editar el municipio de la fila.
	// Cómo: llama a abrirPopup con nivel municipio y la fila.
	onEditMunicipioClick(e: any): void {
		if (e?.row?.data) {
			this.abrirPopup('municipio', false, e.row.data);
		}
	}

	// Qué hace: confirma y elimina el municipio de la fila.
	// Cómo: llama a confirmAction y luego eliminarMunicipio.
	onDeleteMunicipioClick(e: any): void {
		const row = e?.row?.data as GenMunicipio;
		if (!row) {
			return;
		}
		this.confirmAction('Eliminar municipio', `Desea eliminar "${row.NOMBRE_MUNICIPIO}"?`, () => this.eliminarMunicipio(row));
	}

	// Qué hace: abre el popup para editar el distrito de la fila.
	// Cómo: llama a abrirPopup con nivel distrito y la fila.
	onEditDistritoClick(e: any): void {
		if (e?.row?.data) {
			this.abrirPopup('distrito', false, e.row.data);
		}
	}

	// Qué hace: confirma y elimina el distrito de la fila.
	// Cómo: llama a confirmAction y luego eliminarDistrito.
	onDeleteDistritoClick(e: any): void {
		const row = e?.row?.data as GenDistrito;
		if (!row) {
			return;
		}
		this.confirmAction('Eliminar distrito', `Desea eliminar "${row.NOMBRE_DISTRITO}"?`, () => this.eliminarDistrito(row));
	}

	// Qué hace: valida y guarda el registro del popup territorial.
	// Cómo: llama a esValidoNivel del servicio y luego ejecutarGuardarPopup.
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

	// Qué hace: completa en el popup las claves de los niveles padres.
	// Cómo: copia CORR_PAIS/DEPTO/MUNICIPIO desde la selección actual.
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

	// Qué hace: cierra el estado de guardado del popup.
	// Cómo: limpia popupSaving y loadingVisible.
	private finalizarGuardadoPopup(): void {
		this.popupSaving = false;
		this.loadingVisible = false;
	}

	// Qué hace: ejecuta la creación o edición del popup y refresca el nivel territorial afectado.
	// Cómo: llama a getPopupRequest y, al terminar, refrescarNivel con popupNivel.
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

	// Qué hace: cierra el popup territorial.
	// Cómo: pone popupVisible en false.
	cerrarPopup(): void {
		this.popupVisible = false;
	}

	// Qué hace: deja los correlativos del formulario país en solo lectura.
	// Cómo: llama a bloquearCamposCorr sobre dataForm.
	override bloquear(): void {
		this.bloquearCamposCorr(this.dataForm);
	}

	// Qué hace: habilita el formulario país dejando correlativos bloqueados.
	// Cómo: llama a bloquearCamposCorr en el siguiente tick.
	override habilitar(): void {
		setTimeout(() => this.bloquearCamposCorr(this.dataForm));
	}

	// Qué hace: enfoca el campo nombre del país.
	// Cómo: llama a focus del editor NOMBRE_PAIS.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('NOMBRE_PAIS')?.focus();
		});
	}

	// Qué hace: carga los departamentos del país seleccionado.
	// Cómo: getLookUp GEN_DEPTO GetCORR_DEPTO y refresca deptoGrid.
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

	// Qué hace: carga los municipios del departamento seleccionado.
	// Cómo: getLookUp GEN_MUNICIPIO GetCORR_MUNICIPIO y refresca municipioGrid.
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

	// Qué hace: carga los distritos del municipio seleccionado.
	// Cómo: getLookUp GEN_DISTRITO GetCORR_DISTRITO y refresca distritoGrid.
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

	// Qué hace: regenera columnas de país y cascada según permisos.
	// Cómo: llama a getPaisColumns/getDeptoColumns/getMunicipioColumns/getDistritoColumns.
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

	// Qué hace: resuelve la URL de opción para permisos.
	// Cómo: recorre ActivatedRoute hasta encontrar path; fallback gen-estructura-territorial.
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

	// Qué hace: publica el contexto de la barra de acciones.
	// Cómo: llama a pageContext.updateFromBarra con add y refresh.
	private syncToolbarContext(): void {
		this.pageContext.updateFromBarra(
			{
				titulo: this.tituloVentana,
				subtitle: this.subTituloVentana,
				// Qué hace: en documento el Nuevo de país no sale (isForm); permiteAdd alimenta la cascada.
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

	// Qué hace: limpia selecciones e hijas de la cascada.
	// Cómo: vacía depto/municipio/distrito y refresca los tres grids.
	private limpiarSeleccionHijos(): void {
		this.selectedDepto = undefined;
		this.selectedMunicipio = undefined;
		this.deptoModels = [];
		this.municipioModels = [];
		this.distritoModels = [];
		this.actualizarResaltadoCascade();
		setTimeout(() => {
			this.deptoGrid?.refreshData(true);
			this.municipioGrid?.refreshData(true);
			this.distritoGrid?.refreshData(true);
		});
	}

	// Qué hace: inicializa los tres grids de la cascada.
	// Cómo: llama a vincularGridCascade para depto, municipio y distrito.
	private inicializarGridsCascade(): void {
		this.vincularGridCascade(this.deptoGrid, 'depto');
		this.vincularGridCascade(this.municipioGrid, 'municipio');
		this.vincularGridCascade(this.distritoGrid, 'distrito');
	}

	// Qué hace: configura scroll/altura y resaltado del grid hijo.
	// Cómo: ajusta opciones DevExtreme y engancha contentReady/rowPrepared.
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

	// Qué hace: ancla overlays de filtro al body para la cascada.
	// Cómo: fija container del headerFilter y de los submenús dx-filter-menu.
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

	// Qué hace: actualiza el resaltado visual de la cascada.
	// Cómo: reinicializa grids y repinta filas visibles de depto/municipio.
	private actualizarResaltadoCascade(): void {
		setTimeout(() => {
			this.inicializarGridsCascade();
			this.repintarFilasVisibles(this.deptoGrid);
			this.repintarFilasVisibles(this.municipioGrid);
		});
	}

	// Qué hace: repinta solo las filas visibles de un grid.
	// Cómo: llama a repaintRows con los índices visibles.
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

	// Qué hace: compara si dos departamentos son el mismo.
	// Cómo: iguala CORR_PAIS y CORR_DEPTO.
	private esMismoDepto(data: GenDepto, selected: GenDepto): boolean {
		return Number(data.CORR_PAIS) === Number(selected.CORR_PAIS) && Number(data.CORR_DEPTO) === Number(selected.CORR_DEPTO);
	}

	// Qué hace: compara si dos municipios son el mismo.
	// Cómo: iguala CORR_PAIS, CORR_DEPTO y CORR_MUNICIPIO.
	private esMismoMunicipio(data: GenMunicipio, selected: GenMunicipio): boolean {
		return (
			Number(data.CORR_PAIS) === Number(selected.CORR_PAIS) &&
			Number(data.CORR_DEPTO) === Number(selected.CORR_DEPTO) &&
			Number(data.CORR_MUNICIPIO) === Number(selected.CORR_MUNICIPIO)
		);
	}

	// Qué hace: abre el popup del nivel territorial indicado.
	// Cómo: arma modelo/items con fill y getItems del servicio.
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

	// Qué hace: elige la petición create/update del nivel activo del popup.
	// Cómo: llama a insert/update del servicio y convertirDuplicadoEnWarning.
	private getPopupRequest() {
		if (this.popupNivel === 'depto') {
			const model = this.popupModel as GenDepto;
			const request = this.popupIsAdd ? this.service.insertDepto(model) : this.service.updateDepto(model);
			return this.convertirDuplicadoEnWarning(
				request,
				'El código de departamento ingresado está registrado. Escriba otro código para continuar.'
			);
		}
		if (this.popupNivel === 'municipio') {
			const model = this.popupModel as GenMunicipio;
			const request = this.popupIsAdd ? this.service.insertMunicipio(model) : this.service.updateMunicipio(model);
			return this.convertirDuplicadoEnWarning(
				request,
				'El código de municipio ingresado está registrado. Escriba otro código para continuar.'
			);
		}
		const model = this.popupModel as GenDistrito;
		const request = this.popupIsAdd ? this.service.insertDistrito(model) : this.service.updateDistrito(model);
		return this.convertirDuplicadoEnWarning(
			request,
			'El identificador del distrito está registrado. Recargue los datos e intente nuevamente.'
		);
	}

	// Qué hace: recarga el nivel territorial modificado.
	// Cómo: llama a getCORR_DEPTO, getCORR_MUNICIPIO o getCORR_DISTRITO.
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

	// Qué hace: elimina un departamento.
	// Cómo: llama a deleteDepto del servicio vía eliminarNivel.
	private eliminarDepto(row: GenDepto): void {
		this.eliminarNivel(
			this.convertirErrorMttoEnWarning(this.service.deleteDepto(row)),
			'depto',
			'departamento'
		);
	}

	// Qué hace: elimina un municipio.
	// Cómo: llama a deleteMunicipio del servicio vía eliminarNivel.
	private eliminarMunicipio(row: GenMunicipio): void {
		this.eliminarNivel(
			this.convertirErrorMttoEnWarning(this.service.deleteMunicipio(row)),
			'municipio',
			'municipio'
		);
	}

	// Qué hace: elimina un distrito.
	// Cómo: llama a deleteDistrito del servicio vía eliminarNivel.
	private eliminarDistrito(row: GenDistrito): void {
		this.eliminarNivel(
			this.convertirErrorMttoEnWarning(this.service.deleteDistrito(row)),
			'distrito',
			'distrito'
		);
	}

	// Qué hace: ejecuta la eliminación de un nivel y refresca la cascada.
	// Cómo: suscribe la request, limpia hijos y llama a refrescarNivel.
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

	// Qué hace: elige Warning o Error tras una eliminación fallida.
	// Cómo: usa isEmpresaFkErrorMessage e isRelatedDeleteWarningMessage.
	private getDeleteNotifyType(message: string): NotifyType {
		if (isEmpresaFkErrorMessage(message) || this.isRelatedDeleteWarningMessage(message)) {
			return NotifyType.Warning;
		}
		return NotifyType.Error;
	}

	// Qué hace: convierte errores de duplicado en respuesta controlada.
	// Cómo: intercepta ErrorCode 2601/2627 o mensajes de duplicado.
	private convertirDuplicadoEnWarning<T>(request: Observable<T>, errorMessage: string): Observable<T> {
		return request.pipe(
			map((response: any) => {
				const message = `${response?.ErrorMessage ?? ''}`.toLowerCase();
				const errorCode = Number(response?.ErrorCode);
				if (
					response?.Result === false &&
					(errorCode === 2601 || errorCode === 2627 || this.isDuplicateWarningMessage(message))
				) {
					return {
						...response,
						ErrorCode: 2627,
						ErrorMessage: response?.ErrorMessage || errorMessage,
					} as T;
				}

				return response as T;
			}),
			catchError((error: any) => {
				const apiMessage = this.getErrorMessage(error).replace(/^error:\s*/i, '').trim();
				const message = apiMessage.toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 2601 || errorCode === 2627 || this.isDuplicateWarningMessage(message)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: apiMessage || errorMessage,
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Qué hace: convierte un error de llave foránea al eliminar en una advertencia controlada.
	// Cómo: intercepta ErrorCode 547 o mensajes de FK/relacionados (mismo patrón sc-riesgo-puesto; mantiene chequeos de empresa del dominio territorial).
	private convertirErrorMttoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.getErrorMessage(error).toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 547 || isEmpresaFkErrorMessage(message) || this.isRelatedDeleteWarningMessage(message)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: 'No se puede eliminar porque tiene registros relacionados.',
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Qué hace: detecta mensajes de registros relacionados al eliminar.
	private isRelatedDeleteWarningMessage(message: string): boolean {
		const value = `${message ?? ''}`.toLowerCase();
		return [
			'foreign key',
			'reference constraint',
			'restricción reference',
			'restriccion reference',
			'hijos',
			'relacionad',
			'asociad',
		].some((fragment) => value.includes(fragment));
	}

	// Qué hace: deja correlativos en solo lectura en el formulario.
	// Cómo: marca readOnly en CORR_PAIS/DEPTO/MUNICIPIO/DISTRITO.
	private bloquearCamposCorr(form?: DxFormComponent): void {
		const corrFields = ['CORR_PAIS', 'CORR_DEPTO', 'CORR_MUNICIPIO', 'CORR_DISTRITO'];
		corrFields.forEach((field) => {
			form?.instance?.getEditor(field)?.option('readOnly', true);
		});
	}

	// Qué hace: muestra confirmación Si/No y ejecuta la acción si acepta.
	// Cómo: usa custom de DevExtreme y luego fn.
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

	// Qué hace: obtiene un mensaje usable desde errores HTTP/API.
	// Cómo: prioriza ErrorMessage y detecta fallos de conexión.
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

		if (typeof error?.error === 'string' && error.error.trim()) {
			return error.error.trim();
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

	// Qué hace: elige el tipo de notificación para un error.
	// Cómo: usa getNotifyType o detecta empresa/duplicado.
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

	// Qué hace: detecta mensajes de registro duplicado.
	private isDuplicateWarningMessage(message: string): boolean {
		const value = `${message ?? ''}`.toLowerCase();
		return [
			'ya existe',
			'ya está registrado',
			'ya esta registrado',
			'duplicad',
			'primary key',
			'unique key',
			'mismo tiempo',
			'llave primaria',
			'clave primaria',
			'otro usuario guard',
		].some((fragment) => value.includes(fragment));
	}

	// Qué hace: elige Warning o Error según la respuesta del API.
	// Cómo: revisa ErrorCode 4100/2601/2627 y mensajes de duplicado.
	private getNotifyType(response: any): NotifyType {
		const errorCode = Number(response?.ErrorCode);
		if (isEmpresaWarningResponse(response) || errorCode === 4100) {
			return NotifyType.Warning;
		}
		const message = (response?.ErrorMessage || '').toLowerCase();
		return errorCode === 2601 || errorCode === 2627 || this.isDuplicateWarningMessage(message)
			? NotifyType.Warning
			: NotifyType.Error;
	}
}
