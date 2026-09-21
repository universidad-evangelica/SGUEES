// Qué hace: browse + formulario Nuevo/Editar de Empleado (Iniciar + Personales + Documentos).
// Cómo: grilla browse; Guardar según tab; personales vía SP; documentos en GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD.
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IParam } from 'src/app/FxAPI/IParam';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { GenEmpleado } from './models/gen-empleado';
import { GenPersonaNatural } from './models/gen-persona-natural';
import { GenPersonaTipoDocumentoIdentidad } from './gen-persona-tipo-documento-identidad/models/gen-persona-tipo-documento-identidad';
import { GenEmpleadoService } from './gen-empleado.service';
import {
	aplicarLimiteDocumentoIdentidad,
	esDocumentoSoloDigitos,
	maxLengthDocumentoIdentidad,
} from './gen-persona-tipo-documento-identidad/documentos-identidad.format';

const ESTADO_FIELD = 'ACTIVO_EMPLEADO';
const TAB_PERSONALES = 0;
const TAB_DOCUMENTOS = 1;

@Component({
	selector: 'app-gen-empleado',
	templateUrl: './gen-empleado.component.html',
	styleUrls: ['./gen-empleado.component.scss'],
})
export class GenEmpleadoComponent extends CBaseComponent implements OnInit, OnDestroy {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el empleado';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_EMPLEADO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_EMPLEADO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly browseSubtitulo = 'Consulta de Empleados';
	private readonly formSubtituloNuevo = 'Nuevo empleado';
	private readonly formSubtituloEditar = 'Datos del empleado';

	modelPersonaNatural: GenPersonaNatural = this.fillPersonaNatural();
	/** Copia para Cancelar del modal Personales. */
	private modelPersonaNaturalOriginal: GenPersonaNatural = this.fillPersonaNatural();
	documentosIdentidad: GenPersonaTipoDocumentoIdentidad[] = [];
	/** Copia para Cancelar del modal (personales + documentos). */
	private documentosIdentidadOriginal: GenPersonaTipoDocumentoIdentidad[] = [];
	/** Qué hace: modal de edición de datos personales (patrón expediente). */
	popupPersonalesVisible = false;
	/** Evita restaurar modelo al cerrar el popup tras Guardar exitoso. */
	private omitirRestaurarPopupPersonales = false;
	tabEmpleadoIndex = TAB_PERSONALES;

	/** Preview blob de la foto (panel + modal). */
	fotoPersonaUrl: string | null = null;
	/** Preview local mientras sube / tras elegir archivo. */
	fotoLocalUrl: string | null = null;
	/** FOTO_URL relativa nueva (tras SubirFoto); vacío = conservar la del modelo. */
	fotoUrlNueva = '';
	fotoSubiendo = false;

	mCORR_RELIGION: any[] = [];
	mCORR_ORIGEN_INGRESO: any[] = [];
	mCORR_TIPO_CONTRIBUYENTE: any[] = [];
	mCORR_ACTIVIDAD_ECONOMICA: any[] = [];
	mCORR_PAIS_NACIMIENTO: any[] = [];
	/** Catálogo completo de países; el lookup se filtra si es domiciliado (solo SV). */
	private paisesNacimientoCatalogo: any[] = [];
	mCORR_DEPTO_NACIMIENTO: any[] = [];
	mCORR_MUNICIPIO_NACIMIENTO: any[] = [];
	mCORR_DISTRITO_NACIMIENTO: any[] = [];

	/** Código ISO / NOMBRE_CORTO de El Salvador en GEN_PAIS. */
	private static readonly CODIGO_PAIS_EL_SALVADOR = 'SV';

	readonly opcionesSexo = [
		{ value: 'MASCULINO', text: 'Masculino' },
		{ value: 'FEMENINO', text: 'Femenino' },
	];
	readonly opcionesEstadoCivil = [
		{ value: 'SOLTERO(A)', text: 'Soltero(a)' },
		{ value: 'CASADO(A)', text: 'Casado(a)' },
		{ value: 'ACOMPAÑADO(A)', text: 'Acompañado(a)' },
		{ value: 'DIVORCIADO(A)', text: 'Divorciado(a)' },
		{ value: 'VIUDO(A)', text: 'Viudo(a)' },
	];
	readonly opcionesSiNo = [
		{ value: 'SI', text: 'Sí' },
		{ value: 'NO', text: 'No' },
	];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEmpleadoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = [];
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.browseSubtitulo;
		this.consultar();
	}

	ngOnDestroy(): void {
		this.revocarFotoPersona();
		this.revocarFotoLocal();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.browseSubtitulo;
			return;
		}
		if (xEstado === UpdateType.Add) {
			this.subTituloVentana = this.formSubtituloNuevo;
			return;
		}
		if (xEstado === UpdateType.Update || xEstado === UpdateType.Not_Defined) {
			this.subTituloVentana = this.formSubtituloEditar;
		}
	}

	get esNuevo(): boolean {
		return this.banderaMtto === UpdateType.Add;
	}

	get tienePersonaBase(): boolean {
		return Number(this.model?.CORR_PERSONA ?? 0) > 0 && Number(this.model?.CORR_EMPLEADO ?? 0) > 0;
	}

	get readOnlyPersonales(): boolean {
		return this.banderaMtto === UpdateType.Not_Defined || this.banderaMtto === UpdateType.Browse;
	}

	/** Qué hace: el form de personales es editable en alta o dentro del modal. */
	get editandoPersonalesForm(): boolean {
		return !this.tienePersonaBase || this.popupPersonalesVisible;
	}

	/** Qué hace: apellido de casada solo aplica a mujer casada o viuda. */
	get apellidoCasadaHabilitado(): boolean {
		const estado = this.modelPersonaNatural?.ESTADO_CIVIL;
		return (
			this.editandoPersonalesForm &&
			this.modelPersonaNatural?.SEXO === 'FEMENINO' &&
			(estado === 'CASADO(A)' || estado === 'VIUDO(A)')
		);
	}

	/** Qué hace: indica si el registro está marcado como domiciliado. */
	get esDomiciliado(): boolean {
		return this.modelPersonaNatural?.DOMICILIADO === 'SI';
	}

	/** Qué hace: SI o NO ya elegido en Domiciliado (no "Seleccionar..."). */
	get tieneDomiciliadoSeleccionado(): boolean {
		const v = this.modelPersonaNatural?.DOMICILIADO;
		return v === 'SI' || v === 'NO';
	}

	/** Qué hace: país editable solo si ya eligió Domiciliado. */
	get paisNacimientoHabilitado(): boolean {
		return this.editandoPersonalesForm && this.tieneDomiciliadoSeleccionado;
	}

	/** Qué hace: depto/municipio/distrito editables solo si está domiciliado y el form es editable. */
	get territorioCompletoHabilitado(): boolean {
		return this.editandoPersonalesForm && this.esDomiciliado;
	}

	fillParam(xCORR_EMPLEADO?: number): any {
		return { CORR_EMPLEADO: xCORR_EMPLEADO ?? 0 };
	}

	override fillData(xModel?: GenEmpleado): GenEmpleado {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_EMPLEADO: xModel.CORR_EMPLEADO,
				CORR_PERSONA: xModel.CORR_PERSONA,
				CODIGO_EMPLEADO: xModel.CODIGO_EMPLEADO,
				NOMBRE_EMPLEADO: xModel.NOMBRE_EMPLEADO,
				DUI: xModel.DUI,
				NIT: xModel.NIT,
				FECHA_INGRESO: xModel.FECHA_INGRESO,
				CORREO_INSTITUCIONAL: xModel.CORREO_INSTITUCIONAL ?? (xModel as any).CORREO_ELECTRONICO ?? '',
				TELEFONO_INSTITUCIONAL: xModel.TELEFONO_INSTITUCIONAL ?? (xModel as any).TELEFONO_1 ?? '',
				LOGIN_SISTEMA_WEB: xModel.LOGIN_SISTEMA_WEB,
				ACTIVO_EMPLEADO: xModel.ACTIVO_EMPLEADO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 0,
			CORR_EMPLEADO: 0,
			CORR_PERSONA: 0,
			CODIGO_EMPLEADO: '',
			NOMBRE_EMPLEADO: '',
			DUI: '',
			NIT: '',
			FECHA_INGRESO: null,
			CORREO_INSTITUCIONAL: '',
			TELEFONO_INSTITUCIONAL: '',
			LOGIN_SISTEMA_WEB: '',
			ACTIVO_EMPLEADO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: null,
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: null,
		};
	}

	fillPersonaNatural(xModel?: GenPersonaNatural): GenPersonaNatural {
		if (xModel) {
			return {
				CORR_PERSONA: Number(xModel.CORR_PERSONA ?? 0),
				CORR_PERSONA_NATURAL: Number(xModel.CORR_PERSONA_NATURAL ?? 0),
				PRIMER_NOMBRE: xModel.PRIMER_NOMBRE ?? '',
				SEGUNDO_NOMBRE: xModel.SEGUNDO_NOMBRE ?? '',
				PRIMER_APELLIDO: xModel.PRIMER_APELLIDO ?? '',
				SEGUNDO_APELLIDO: xModel.SEGUNDO_APELLIDO ?? '',
				APELLIDO_CASADA: xModel.APELLIDO_CASADA ?? '',
				NOMBRE_COMPLETO: xModel.NOMBRE_COMPLETO ?? '',
				FOTO_URL: xModel.FOTO_URL ?? '',
				SEXO: xModel.SEXO ?? '',
				ESTADO_CIVIL: xModel.ESTADO_CIVIL ?? '',
				NACIONALIDAD: xModel.NACIONALIDAD ?? '',
				EDAD: xModel.EDAD ?? null,
				FECHA_NACIMIENTO: xModel.FECHA_NACIMIENTO ?? null,
				ES_JUBILADO: !!xModel.ES_JUBILADO,
				POSEE_DISCAPACIDAD: !!xModel.POSEE_DISCAPACIDAD,
				TIPO_DISCAPACIDAD: xModel.TIPO_DISCAPACIDAD ?? '',
				CORR_RELIGION: xModel.CORR_RELIGION ?? null,
				NOMBRE_RELIGION: xModel.NOMBRE_RELIGION,
				IGLESIA_CONGREGA: xModel.IGLESIA_CONGREGA ?? '',
				CARTA_PASTORAL: xModel.CARTA_PASTORAL ?? '',
				ES_EXTRANJERO: !!xModel.ES_EXTRANJERO,
				DOMICILIADO: xModel.DOMICILIADO ?? '',
				CORR_PAIS_NACIMIENTO: xModel.CORR_PAIS_NACIMIENTO ?? null,
				NOMBRE_PAIS_NACIMIENTO: xModel.NOMBRE_PAIS_NACIMIENTO,
				CORR_DEPTO_NACIMIENTO: xModel.CORR_DEPTO_NACIMIENTO ?? null,
				NOMBRE_DEPTO_NACIMIENTO: xModel.NOMBRE_DEPTO_NACIMIENTO,
				CORR_MUNICIPIO_NACIMIENTO: xModel.CORR_MUNICIPIO_NACIMIENTO ?? null,
				NOMBRE_MUNICIPIO_NACIMIENTO: xModel.NOMBRE_MUNICIPIO_NACIMIENTO,
				CORR_DISTRITO_NACIMIENTO: xModel.CORR_DISTRITO_NACIMIENTO ?? null,
				NOMBRE_DISTRITO_NACIMIENTO: xModel.NOMBRE_DISTRITO_NACIMIENTO,
				CORR_ORIGEN_INGRESO: xModel.CORR_ORIGEN_INGRESO ?? null,
				NOMBRE_ORIGEN_INGRESO: xModel.NOMBRE_ORIGEN_INGRESO,
				CORR_TIPO_CONTRIBUYENTE: xModel.CORR_TIPO_CONTRIBUYENTE ?? null,
				NOMBRE_TIPO_CONTRIBUYENTE: xModel.NOMBRE_TIPO_CONTRIBUYENTE,
				CORR_ACTIVIDAD_ECONOMICA: xModel.CORR_ACTIVIDAD_ECONOMICA ?? null,
				NOMBRE_ACTIVIDAD_ECONOMICA: xModel.NOMBRE_ACTIVIDAD_ECONOMICA,
				USUARIO_CREA: xModel.USUARIO_CREA ?? '',
				ESTACION_CREA: xModel.ESTACION_CREA ?? '',
				FECHA_CREA: xModel.FECHA_CREA ?? null,
				USUARIO_ACTU: xModel.USUARIO_ACTU ?? '',
				ESTACION_ACTU: xModel.ESTACION_ACTU ?? '',
				FECHA_ACTU: xModel.FECHA_ACTU ?? null,
			};
		}

		return {
			CORR_PERSONA: 0,
			CORR_PERSONA_NATURAL: 0,
			PRIMER_NOMBRE: '',
			SEGUNDO_NOMBRE: '',
			PRIMER_APELLIDO: '',
			SEGUNDO_APELLIDO: '',
			APELLIDO_CASADA: '',
			NOMBRE_COMPLETO: '',
			FOTO_URL: '',
			SEXO: '',
			ESTADO_CIVIL: '',
			NACIONALIDAD: '',
			EDAD: null,
			FECHA_NACIMIENTO: null,
			ES_JUBILADO: false,
			POSEE_DISCAPACIDAD: false,
			TIPO_DISCAPACIDAD: '',
			CORR_RELIGION: null,
			IGLESIA_CONGREGA: '',
			CARTA_PASTORAL: '',
			ES_EXTRANJERO: false,
			DOMICILIADO: '',
			CORR_PAIS_NACIMIENTO: null,
			CORR_DEPTO_NACIMIENTO: null,
			CORR_MUNICIPIO_NACIMIENTO: null,
			CORR_DISTRITO_NACIMIENTO: null,
			CORR_ORIGEN_INGRESO: null,
			CORR_TIPO_CONTRIBUYENTE: null,
			CORR_ACTIVIDAD_ECONOMICA: null,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: null,
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: null,
		};
	}

	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				if (Array.isArray(this.models)) {
					this.models = this.models.map((row) => this.fillData(row));
					this.models = [...this.models].sort(
						(a, b) => Number(a.CORR_EMPLEADO) - Number(b.CORR_EMPLEADO)
					);
				}
				setTimeout(() => this.dataGrid?.refreshData(resetPage), 0);
			},
		});
	}

	/** Qué hace: abre el formulario de alta con panel + tabs. */
	override nuevo(): void {
		super.nuevo();
		this.model = this.fillData();
		this.modelUpdate = this.fillData();
		this.modelPersonaNatural = this.fillPersonaNatural();
		this.documentosIdentidad = [];
		this.documentosIdentidadOriginal = [];
		this.fotoUrlNueva = '';
		this.revocarFotoLocal();
		this.revocarFotoPersona();
		this.tabEmpleadoIndex = TAB_PERSONALES;
		this.limpiarLookupsTerritorio();
		this.subTituloVentana = this.formSubtituloNuevo;
		this.cargarLookupsBase();
		setTimeout(() => this.aplicarReglasPersonales(), 0);
	}

	// Qué hace: Guardar del ribbon — alta (Iniciar); si ya existe, vuelve al browse con mensaje (sin abrir modal).
	guardar(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		if (!this.tienePersonaBase) {
			this.iniciarEmpleado();
			return;
		}

		if (this.popupPersonalesVisible) {
			if (this.fotoSubiendo) {
				this.notifyFx('Espere a que termine de subir la fotografía.', NotifyType.Warning);
				return;
			}
			this.guardarPersonaNatural(
				() => {
					this.guardarDocumentosDesdeModal(() => {
						this.modelPersonaNaturalOriginal = this.fillPersonaNatural(this.modelPersonaNatural);
						this.documentosIdentidadOriginal = this.clonarDocumentos(this.documentosIdentidad);
						this.fotoUrlNueva = '';
						this.volverBrowseTrasGuardar();
					});
				},
				{ silencioso: true }
			);
			return;
		}

		this.volverBrowseTrasGuardar();
	}

	/**
	 * Qué hace: cierra el formulario y regresa a la grilla con mensaje de éxito.
	 * Cómo: parchea la fila en memoria, AsignaStatus(Browse) y notifyFx (mismo patrón mtto).
	 */
	private volverBrowseTrasGuardar(): void {
		if (this.popupPersonalesVisible) {
			this.omitirRestaurarPopupPersonales = true;
			this.popupPersonalesVisible = false;
		}
		if (this.modelPersonaNatural?.NOMBRE_COMPLETO) {
			this.model.NOMBRE_EMPLEADO = this.modelPersonaNatural.NOMBRE_COMPLETO;
		}
		this.aplicarRegistroEnGrid(this.fillData(this.model), false);
		this.AsignaStatus(UpdateType.Browse);
		this.subTituloVentana = this.browseSubtitulo;
		this.notifyFx('Registro modificado con exito!', NotifyType.Success, { raw: true });
	}

	// Qué hace: guarda personales + documentos desde el modal y cierra el popup (se queda en el formulario).
	guardarPersonalesDesdeModal(): void {
		if (this.fotoSubiendo) {
			this.notifyFx('Espere a que termine de subir la fotografía.', NotifyType.Warning);
			return;
		}
		this.guardarPersonaNatural(
			() => {
				this.guardarDocumentosDesdeModal(() => {
					this.modelPersonaNaturalOriginal = this.fillPersonaNatural(this.modelPersonaNatural);
					this.documentosIdentidadOriginal = this.clonarDocumentos(this.documentosIdentidad);
					this.fotoUrlNueva = '';
					this.omitirRestaurarPopupPersonales = true;
					this.popupPersonalesVisible = false;
					this.cargarFotoPersona(
						Number(this.model.CORR_PERSONA),
						this.modelPersonaNatural.FOTO_URL
					);
					if (this.modelPersonaNatural.NOMBRE_COMPLETO) {
						this.model.NOMBRE_EMPLEADO = this.modelPersonaNatural.NOMBRE_COMPLETO;
						this.aplicarRegistroEnGrid(this.fillData(this.model), false);
					}
					this.notifyFx('Datos del empleado actualizados.', NotifyType.Success, { raw: true });
				});
			},
			{ silencioso: true }
		);
	}

	activar_inactivar(): void {
		this.notifyFx('Activar/Inactivar se implementará en la siguiente fase.', NotifyType.Warning);
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (!rowData) {
			return;
		}
		this.abrirFormulario(rowData, UpdateType.Not_Defined);
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}
		this.abrirFormulario(e.row.data, UpdateType.Update);
	}

	// Qué hace: elimina empleado desde la grilla (confirmación nativa DevExtreme).
	// Cómo: rowRemovingMtto + DELETE API; quita la fila en memoria sin GetAll.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_EMPLEADO)),
		});
	}

	override getPermiteEditar(_e?: any): boolean {
		return !!this.permiteEdit;
	}

	override getPermiteDele(_e?: any): boolean {
		return !!this.permiteDele;
	}

	get inicialesPersona(): string {
		const nombre = (this.model?.NOMBRE_EMPLEADO || this.modelPersonaNatural?.NOMBRE_COMPLETO || '').trim();
		if (!nombre) {
			return 'NE';
		}
		const partes = nombre.split(/\s+/).filter(Boolean);
		if (partes.length === 1) {
			return partes[0].substring(0, 2).toUpperCase();
		}
		return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
	}

	get tituloPersonaPanel(): string {
		const nombre = (this.model?.NOMBRE_EMPLEADO || this.modelPersonaNatural?.NOMBRE_COMPLETO || '').trim();
		if (nombre) {
			return nombre;
		}
		return this.esNuevo || !this.tienePersonaBase ? 'Nuevo empleado' : 'Empleado sin nombre';
	}

	get badgeEmpleadoId(): string {
		const corr = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (corr > 0) {
			return `Corr. ${corr}`;
		}
		return 'Nuevo';
	}

	/** Qué hace: URL a mostrar en avatar (local > blob cargado). */
	get fotoMostrada(): string | null {
		return this.fotoLocalUrl || this.fotoPersonaUrl || null;
	}

	textoLectura(valor: any): string {
		const t = `${valor ?? ''}`.trim();
		return t || '—';
	}

	/** Qué hace: muestra Sí/No para flags booleanos en la tarjeta. */
	textoSiNo(valor: any): string {
		if (valor === true || valor === 1 || valor === '1' || valor === 'SI') {
			return 'Sí';
		}
		if (valor === false || valor === 0 || valor === '0' || valor === 'NO') {
			return 'No';
		}
		return '—';
	}

	fechaLectura(valor: any): string {
		if (!valor) {
			return '—';
		}
		const d = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(d.getTime())) {
			return '—';
		}
		const dd = `${d.getDate()}`.padStart(2, '0');
		const mm = `${d.getMonth() + 1}`.padStart(2, '0');
		const yyyy = d.getFullYear();
		return `${dd}/${mm}/${yyyy}`;
	}

	fechaHoraLectura(valor: any): string {
		if (!valor) {
			return '—';
		}
		const d = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(d.getTime())) {
			return '—';
		}
		const dd = `${d.getDate()}`.padStart(2, '0');
		const mm = `${d.getMonth() + 1}`.padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh = `${d.getHours()}`.padStart(2, '0');
		const mi = `${d.getMinutes()}`.padStart(2, '0');
		return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
	}

	abrirEditarSeccion(): void {
		this.abrirEditarPersonales();
	}

	// Qué hace: abre el modal de edición de datos personales (como expediente).
	abrirEditarPersonales(): void {
		if (!this.tienePersonaBase || !this.permiteEdit) {
			return;
		}
		this.modelPersonaNaturalOriginal = this.fillPersonaNatural(this.modelPersonaNatural);
		this.documentosIdentidadOriginal = this.clonarDocumentos(this.documentosIdentidad);
		this.fotoUrlNueva = '';
		this.revocarFotoLocal();
		this.popupPersonalesVisible = true;
		setTimeout(() => this.aplicarReglasPersonales(), 0);
	}

	// Qué hace: cierra el modal y restaura personales/documentos/foto si canceló.
	cerrarPopupPersonales(restaurar = true): void {
		if (restaurar && !this.omitirRestaurarPopupPersonales) {
			this.modelPersonaNatural = this.fillPersonaNatural(this.modelPersonaNaturalOriginal);
			this.documentosIdentidad = this.clonarDocumentos(this.documentosIdentidadOriginal);
			this.fotoUrlNueva = '';
			this.revocarFotoLocal();
			this.refrescarTerritorioDesdeModelo();
		}
		this.omitirRestaurarPopupPersonales = false;
		this.popupPersonalesVisible = false;
	}

	onPopupPersonalesShown(): void {
		setTimeout(() => this.aplicarReglasPersonales(), 0);
	}

	/**
	 * Qué hace: persiste documentos desde el modal de edición.
	 * Cómo: SaveAll; en éxito actualiza lista en memoria y llama onSuccess.
	 */
	private guardarDocumentosDesdeModal(onSuccess?: () => void): void {
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveDocumentosIdentidad(corrPersona, this.documentosIdentidad)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = response.Data ?? this.documentosIdentidad;
					this.documentosIdentidad = rows;
					this.documentosIdentidadOriginal = this.clonarDocumentos(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: al cambiar sexo/estado civil/discapacidad/domiciliado, aplica reglas de UI del tab Personales.
	onPersonalesFieldChanged(e: any): void {
		if (e?.dataField === 'SEXO' || e?.dataField === 'ESTADO_CIVIL') {
			this.aplicarReglaApellidoCasada();
		}
		if (e?.dataField === 'POSEE_DISCAPACIDAD') {
			// Cómo: usa e.value (ya actualizado) para no depender del timing del formData.
			this.modelPersonaNatural.POSEE_DISCAPACIDAD = !!e.value;
			this.aplicarReglaTipoDiscapacidad();
		}
		if (e?.dataField === 'DOMICILIADO') {
			this.modelPersonaNatural.DOMICILIADO = e.value ?? '';
			this.aplicarReglaDomiciliado();
		}
	}

	// Qué hace: aplica las mismas reglas desde selects/checks del modal ep-*.
	onPersonalesSelectChanged(campo: string, e: any): void {
		this.onPersonalesFieldChanged({ dataField: campo, value: e?.value });
	}

	// Qué hace: recalcula edad al cambiar fecha de nacimiento en el modal.
	onFechaNacimientoChanged(e: any): void {
		const fecha = e?.value ?? this.modelPersonaNatural?.FECHA_NACIMIENTO;
		this.modelPersonaNatural.FECHA_NACIMIENTO = fecha ?? null;
		this.modelPersonaNatural.EDAD = this.calcularEdad(fecha);
	}

	private calcularEdad(fecha: Date | string | null | undefined): number | null {
		if (!fecha) {
			return null;
		}
		const d = fecha instanceof Date ? fecha : new Date(fecha);
		if (Number.isNaN(d.getTime())) {
			return null;
		}
		const hoy = new Date();
		let edad = hoy.getFullYear() - d.getFullYear();
		const m = hoy.getMonth() - d.getMonth();
		if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) {
			edad -= 1;
		}
		return edad >= 0 ? edad : null;
	}

	onPaisNacimientoChange(value: number): void {
		if (!this.paisNacimientoHabilitado) {
			this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = null;
			return;
		}
		this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = value || null;
		this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.mCORR_MUNICIPIO_NACIMIENTO = [];
		this.mCORR_DISTRITO_NACIMIENTO = [];
		if (this.territorioCompletoHabilitado) {
			this.getCORR_DEPTO_NACIMIENTO(value);
		} else {
			this.mCORR_DEPTO_NACIMIENTO = [];
		}
	}

	onDeptoNacimientoChange(value: number): void {
		if (!this.territorioCompletoHabilitado) {
			this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
			return;
		}
		this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = value || null;
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.mCORR_DISTRITO_NACIMIENTO = [];
		this.getCORR_MUNICIPIO_NACIMIENTO(this.modelPersonaNatural.CORR_PAIS_NACIMIENTO, value);
	}

	onMunicipioNacimientoChange(value: number): void {
		if (!this.territorioCompletoHabilitado) {
			this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
			return;
		}
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = value || null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.getCORR_DISTRITO_NACIMIENTO(
			this.modelPersonaNatural.CORR_PAIS_NACIMIENTO,
			this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO,
			value
		);
	}

	selectedLookUpReligion(vRow: any): any {
		return vRow?.[0]?.CORR_RELIGION;
	}
	selectedLookUpOrigenIngreso(vRow: any): any {
		return vRow?.[0]?.CORR_ORIGEN_INGRESO;
	}
	selectedLookUpTipoContribuyente(vRow: any): any {
		return vRow?.[0]?.CORR_TIPO_CONTRIBUYENTE;
	}
	selectedLookUpActividadEconomica(vRow: any): any {
		return vRow?.[0]?.CORR_ACTIVIDAD_ECONOMICA;
	}
	selectedLookUpPaisNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_PAIS;
	}
	selectedLookUpDeptoNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_DEPTO;
	}
	selectedLookUpMunicipioNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_MUNICIPIO;
	}
	selectedLookUpDistritoNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_DISTRITO;
	}

	private abrirFormulario(rowData: GenEmpleado, modo: UpdateType): void {
		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.AsignaStatus(modo);
		this.tabEmpleadoIndex = TAB_PERSONALES;
		this.subTituloVentana = this.formSubtituloEditar;
		this.cargarLookupsBase();
		this.cargarPersonaNatural();
		this.cargarDocumentosIdentidad();
	}

	// Qué hace: crea GEN_PERSONA + GEN_EMPRESA_PERSONA + GEN_PERSONA_NATURAL (SP) + GEN_EMPLEADO.
	// Cómo: POST Iniciar con datos del tab Personales; parchea model/grid y recarga naturales.
	private iniciarEmpleado(): void {
		this.loadingVisible = true;
		this.service
			.iniciar(this.sanitizarPersonaNaturalPayload(this.modelPersonaNatural))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const row = this.fillData(response.Data);
					this.model = row;
					this.modelUpdate = this.fillData(row);
					this.aplicarRegistroEnGrid(row, true);
					this.AsignaStatus(UpdateType.Update);
					this.subTituloVentana = this.formSubtituloEditar;
					this.cargarPersonaNatural();
					this.cargarDocumentosIdentidad();
					this.notifyFx('Empleado creado. Puede seguir editando los datos personales.', NotifyType.Success, {
						raw: true,
					});
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: actualiza GEN_PERSONA_NATURAL del empleado (vía SP en GEN_EMPLEADO).
	// Cómo: Put PersonaNatural; si aún no hay corr (caso raro), Post; parchea nombre en panel.
	private guardarPersonaNatural(onSuccess?: () => void, opciones?: { silencioso?: boolean }): void {
		if (!this.tienePersonaBase) {
			this.notifyFx('Primero debe iniciar el empleado (Guardar).', NotifyType.Warning);
			return;
		}

		const payload = this.sanitizarPersonaNaturalPayload({
			...this.modelPersonaNatural,
			CORR_PERSONA: Number(this.model.CORR_PERSONA),
			FOTO_URL: `${this.fotoUrlNueva || this.modelPersonaNatural.FOTO_URL || ''}`.trim(),
		});

		const esAltaNatural = !(Number(payload.CORR_PERSONA_NATURAL) > 0);
		const action = esAltaNatural
			? this.service.createPersonaNatural(payload)
			: this.service.updatePersonaNatural(payload);

		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.loadingVisible = false;
				if (!response?.Result) {
					this.notifyApiResponse(response);
					return;
				}
				this.modelPersonaNatural = this.fillPersonaNatural(response.Data);
				if (this.modelPersonaNatural.NOMBRE_COMPLETO) {
					this.model.NOMBRE_EMPLEADO = this.modelPersonaNatural.NOMBRE_COMPLETO;
					this.aplicarRegistroEnGrid(this.fillData(this.model), false);
				}
				if (!opciones?.silencioso) {
					this.notifyFx(
						esAltaNatural ? 'Datos personales creados.' : 'Datos personales actualizados.',
						NotifyType.Success,
						{ raw: true }
					);
				}
				onSuccess?.();
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyApiError(error);
			},
		});
	}

	private cargarPersonaNatural(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.modelPersonaNatural = this.fillPersonaNatural();
			this.revocarFotoPersona();
			setTimeout(() => this.aplicarReglasPersonales(), 0);
			return;
		}

		this.service
			.getPersonaNatural(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && response.Data) {
						this.modelPersonaNatural = this.fillPersonaNatural(response.Data);
						this.refrescarTerritorioDesdeModelo();
						this.cargarFotoPersona(corrPersona, this.modelPersonaNatural.FOTO_URL);
						setTimeout(() => this.aplicarReglasPersonales(), 0);
						return;
					}
					this.modelPersonaNatural = this.fillPersonaNatural({
						...this.fillPersonaNatural(),
						CORR_PERSONA: corrPersona,
					});
					this.revocarFotoPersona();
					setTimeout(() => this.aplicarReglasPersonales(), 0);
				},
				error: () => {
					this.modelPersonaNatural = this.fillPersonaNatural({
						...this.fillPersonaNatural(),
						CORR_PERSONA: corrPersona,
					});
					this.revocarFotoPersona();
					setTimeout(() => this.aplicarReglasPersonales(), 0);
				},
			});
	}

	/**
	 * Qué hace: selección de archivo → sube de inmediato a uploads/gen-empleado y actualiza preview.
	 * Cómo: SubirFoto; guarda FOTO_URL relativa en fotoUrlNueva (se persiste al Guardar cambios).
	 */
	async onFotoFileChange(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		const errorArchivo = this.validarArchivoFoto(file);
		if (errorArchivo) {
			input.value = '';
			this.notifyFx(errorArchivo, NotifyType.Warning);
			return;
		}

		const corr = Number(this.model?.CORR_PERSONA ?? 0);
		if (corr <= 0) {
			input.value = '';
			this.notifyFx('No hay persona asociada para subir la fotografía.', NotifyType.Warning);
			return;
		}

		this.revocarFotoLocal();
		this.fotoLocalUrl = URL.createObjectURL(file);
		this.fotoSubiendo = true;

		try {
			const response: any = await firstValueFrom(this.service.subirFoto(corr, file));
			if (!response?.Result) {
				this.revocarFotoLocal();
				this.fotoUrlNueva = '';
				input.value = '';
				this.notifyApiResponse(response);
				return;
			}
			this.fotoUrlNueva = `${response?.Data?.FOTO_URL ?? ''}`.trim();
			this.modelPersonaNatural.FOTO_URL = this.fotoUrlNueva;
			this.notifyFx('Fotografía actualizada.', NotifyType.Success, { raw: true });
		} catch (error: any) {
			this.revocarFotoLocal();
			this.fotoUrlNueva = '';
			input.value = '';
			this.notifyApiError(error);
		} finally {
			this.fotoSubiendo = false;
		}
	}

	private cargarFotoPersona(corrPersona: number, fotoUrl?: string): void {
		this.revocarFotoPersona();
		this.revocarFotoLocal();
		if (corrPersona <= 0 || !`${fotoUrl ?? ''}`.trim()) {
			return;
		}

		this.service
			.getFoto(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (blob) => {
					if (blob && blob.size > 0 && (blob.type || '').startsWith('image/')) {
						this.fotoPersonaUrl = URL.createObjectURL(blob);
					}
				},
				error: () => {
					this.fotoPersonaUrl = null;
				},
			});
	}

	private validarArchivoFoto(file: File): string | null {
		const maxBytes = 5 * 1024 * 1024;
		const allowed = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowed.includes((file.type || '').toLowerCase())) {
			return 'Formato no permitido. Use JPG, PNG o WEBP.';
		}
		if (file.size > maxBytes) {
			return 'La fotografía no debe superar 5 MB.';
		}
		return null;
	}

	private revocarFotoPersona(): void {
		if (this.fotoPersonaUrl) {
			URL.revokeObjectURL(this.fotoPersonaUrl);
			this.fotoPersonaUrl = null;
		}
	}

	private revocarFotoLocal(): void {
		if (this.fotoLocalUrl) {
			URL.revokeObjectURL(this.fotoLocalUrl);
			this.fotoLocalUrl = null;
		}
	}

	// Qué hace: carga catálogo activo + valores de documentos de la persona.
	// Cómo: API anidada vía GenEmpleadoService; guarda copia para Cancelar.
	private cargarDocumentosIdentidad(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.documentosIdentidad = [];
			this.documentosIdentidadOriginal = [];
			return;
		}

		this.service
			.getDocumentosIdentidad(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? response.Data ?? [] : [];
					this.documentosIdentidad = rows;
					this.documentosIdentidadOriginal = this.clonarDocumentos(rows);
				},
				error: () => {
					this.documentosIdentidad = [];
					this.documentosIdentidadOriginal = [];
				},
			});
	}

	private clonarDocumentos(rows: GenPersonaTipoDocumentoIdentidad[]): GenPersonaTipoDocumentoIdentidad[] {
		return (rows ?? []).map((d) => ({ ...d }));
	}

	/**
	 * Qué hace: bloquea letras en DUI/NIT/NRC al teclear (permite dígitos, borrar y atajos).
	 * Cómo: onKeyDown; el guion lo pone la máscara, no el usuario.
	 */
	onDocumentoValorKeyDown(doc: GenPersonaTipoDocumentoIdentidad, e: any): void {
		if (!doc || !esDocumentoSoloDigitos(doc.NOMBRE_CORTO, doc.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD)) {
			return;
		}
		const ev = e?.event as KeyboardEvent | undefined;
		if (!ev) {
			return;
		}
		if (ev.ctrlKey || ev.metaKey || ev.altKey) {
			return;
		}
		const key = ev.key || '';
		if (
			key.length === 1 &&
			!/[0-9]/.test(key) &&
			key !== 'Dead'
		) {
			ev.preventDefault();
		}
	}

	// Qué hace: formatea DUI/NIT/NRC en vivo al teclear (máscara + tope; sin letras).
	// Cómo: limpia el valor del input nativo y sincroniza el TextBox.
	onDocumentoValorInput(doc: GenPersonaTipoDocumentoIdentidad, e: any): void {
		if (!doc) {
			return;
		}
		const input = e?.event?.target as HTMLInputElement | undefined;
		const raw = `${input?.value ?? e?.component?.option('text') ?? e?.component?.option('value') ?? ''}`;
		const formateado = aplicarLimiteDocumentoIdentidad(
			doc.NOMBRE_CORTO,
			raw,
			doc.ACTIVO_CARACTERES,
			Number(doc.NUMERO_CARACTERES ?? 0),
			doc.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD
		);
		doc.VALOR_DOCUMENTO = formateado;
		if (input && input.value !== formateado) {
			input.value = formateado;
		}
		if (e?.component) {
			e.component.option('value', formateado);
		}
	}

	// Qué hace: sincroniza valor al pegar/limpiar/blur cuando no pasó por onInput.
	onDocumentoValorChanged(doc: GenPersonaTipoDocumentoIdentidad, e: any): void {
		if (!doc) {
			return;
		}
		const raw = `${e?.value ?? ''}`;
		const formateado = aplicarLimiteDocumentoIdentidad(
			doc.NOMBRE_CORTO,
			raw,
			doc.ACTIVO_CARACTERES,
			Number(doc.NUMERO_CARACTERES ?? 0),
			doc.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD
		);
		if (doc.VALOR_DOCUMENTO !== formateado) {
			doc.VALOR_DOCUMENTO = formateado;
		}
		if (e?.component && e.component.option('value') !== formateado) {
			e.component.option('value', formateado);
		}
	}

	// Qué hace: maxLength del TextBox = dígitos + guiones de la máscara.
	maxLengthDocumento(doc: GenPersonaTipoDocumentoIdentidad): number | null {
		return maxLengthDocumentoIdentidad(
			doc?.NOMBRE_CORTO,
			doc?.ACTIVO_CARACTERES,
			Number(doc?.NUMERO_CARACTERES ?? 0),
			doc?.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD
		);
	}

	etiquetaDocumento(doc: GenPersonaTipoDocumentoIdentidad): string {
		return doc?.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD || doc?.NOMBRE_CORTO || 'Documento';
	}

	private aplicarReglasPersonales(): void {
		this.aplicarReglaApellidoCasada();
		this.aplicarReglaTipoDiscapacidad();
		this.aplicarReglaDomiciliado();
	}

	// Qué hace: convierte '' de selects/checks de dominio a null (el CHECK de BD no acepta '').
	// Cómo: clona el payload; sin Domiciliado no guarda territorio; si NO, solo país; si SI, completo.
	private sanitizarPersonaNaturalPayload(model: GenPersonaNatural | any): any {
		const vacioANull = (v: any) => (v === '' || v === undefined ? null : v);
		const domiciliado = vacioANull(model?.DOMICILIADO);
		const payload: any = {
			...model,
			SEXO: vacioANull(model?.SEXO),
			ESTADO_CIVIL: vacioANull(model?.ESTADO_CIVIL),
			CARTA_PASTORAL: vacioANull(model?.CARTA_PASTORAL),
			DOMICILIADO: domiciliado,
			TIPO_DISCAPACIDAD: vacioANull(model?.TIPO_DISCAPACIDAD),
			APELLIDO_CASADA: vacioANull(model?.APELLIDO_CASADA),
		};

		if (domiciliado !== 'SI' && domiciliado !== 'NO') {
			payload.CORR_PAIS_NACIMIENTO = null;
			payload.CORR_DEPTO_NACIMIENTO = null;
			payload.CORR_MUNICIPIO_NACIMIENTO = null;
			payload.CORR_DISTRITO_NACIMIENTO = null;
		} else if (domiciliado !== 'SI') {
			payload.CORR_DEPTO_NACIMIENTO = null;
			payload.CORR_MUNICIPIO_NACIMIENTO = null;
			payload.CORR_DISTRITO_NACIMIENTO = null;
		}

		return payload;
	}

	// Qué hace: habilita apellido de casada solo si es FEMENINO y CASADO(A) o VIUDO(A).
	// Cómo: limpia el valor si no aplica; el template usa [readOnly]="!apellidoCasadaHabilitado".
	private aplicarReglaApellidoCasada(): void {
		const habilitado = this.apellidoCasadaHabilitado;
		if (!habilitado && this.editandoPersonalesForm) {
			this.modelPersonaNatural.APELLIDO_CASADA = '';
		}
	}

	// Qué hace: controla territorio según Domiciliado (null / NO / SI).
	// Cómo: sin selección limpia todo; NO solo países distintos de SV; SI solo El Salvador + cadena completa.
	private aplicarReglaDomiciliado(): void {
		if (!this.tieneDomiciliadoSeleccionado) {
			if (this.editandoPersonalesForm) {
				this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
			}
			this.aplicarCatalogoPaisNacimiento();
			this.limpiarLookupsTerritorio();
			return;
		}

		if (this.esDomiciliado) {
			if (!this.editandoPersonalesForm) {
				this.aplicarCatalogoPaisNacimiento();
				return;
			}
			this.aplicarCatalogoPaisNacimiento(true);
			const pais = this.modelPersonaNatural?.CORR_PAIS_NACIMIENTO;
			if (pais) {
				this.getCORR_DEPTO_NACIMIENTO(pais);
				const depto = this.modelPersonaNatural?.CORR_DEPTO_NACIMIENTO;
				if (depto) {
					this.getCORR_MUNICIPIO_NACIMIENTO(pais, depto);
					const municipio = this.modelPersonaNatural?.CORR_MUNICIPIO_NACIMIENTO;
					if (municipio) {
						this.getCORR_DISTRITO_NACIMIENTO(pais, depto, municipio);
					}
				}
			}
			return;
		}

		// DOMICILIADO = NO: países sin El Salvador; limpia depto/municipio/distrito.
		this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.aplicarCatalogoPaisNacimiento();
		this.limpiarLookupsTerritorio();
	}

	/**
	 * Qué hace: arma el lookup de país según Domiciliado.
	 * Cómo: SI → solo SV (El Salvador) y lo selecciona;
	 *       NO → todos excepto SV; si tenía SV seleccionado lo limpia;
	 *       vacío → catálogo completo.
	 */
	private aplicarCatalogoPaisNacimiento(forzarElSalvador = false): void {
		const catalogo = this.paisesNacimientoCatalogo ?? [];
		if (this.esDomiciliado) {
			const elSalvador = catalogo.filter((p) => this.esPaisElSalvador(p));
			this.mCORR_PAIS_NACIMIENTO = elSalvador;
			if (forzarElSalvador || this.editandoPersonalesForm) {
				const corrSv = Number(elSalvador[0]?.CORR_PAIS ?? 0);
				if (corrSv > 0 && Number(this.modelPersonaNatural.CORR_PAIS_NACIMIENTO) !== corrSv) {
					const paisAnterior = Number(this.modelPersonaNatural.CORR_PAIS_NACIMIENTO ?? 0);
					this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = corrSv;
					if (paisAnterior !== corrSv) {
						this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
						this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
						this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
						this.mCORR_MUNICIPIO_NACIMIENTO = [];
						this.mCORR_DISTRITO_NACIMIENTO = [];
					}
				}
			}
			return;
		}

		if (this.modelPersonaNatural?.DOMICILIADO === 'NO') {
			this.mCORR_PAIS_NACIMIENTO = catalogo.filter((p) => !this.esPaisElSalvador(p));
			const corrActual = Number(this.modelPersonaNatural.CORR_PAIS_NACIMIENTO ?? 0);
			if (corrActual > 0) {
				const seleccionado = catalogo.find((p) => Number(p?.CORR_PAIS) === corrActual);
				if (seleccionado && this.esPaisElSalvador(seleccionado) && this.editandoPersonalesForm) {
					this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = null;
				}
			}
			return;
		}

		this.mCORR_PAIS_NACIMIENTO = [...catalogo];
	}

	/** Qué hace: identifica El Salvador por NOMBRE_CORTO o CODIGO_PAIS (= SV). */
	private esPaisElSalvador(pais: any): boolean {
		const codigo = `${pais?.NOMBRE_CORTO ?? ''}`.trim().toUpperCase();
		const codigoAlt = `${pais?.CODIGO_PAIS ?? ''}`.trim().toUpperCase();
		return (
			codigo === GenEmpleadoComponent.CODIGO_PAIS_EL_SALVADOR ||
			codigoAlt === GenEmpleadoComponent.CODIGO_PAIS_EL_SALVADOR
		);
	}

	// Qué hace: limpia tipo discapacidad si no posee discapacidad.
	// Cómo: el template muestra el campo con *ngIf="POSEE_DISCAPACIDAD".
	private aplicarReglaTipoDiscapacidad(): void {
		const posee = !!this.modelPersonaNatural?.POSEE_DISCAPACIDAD;
		if (!posee) {
			this.modelPersonaNatural.TIPO_DISCAPACIDAD = '';
		}
	}

	private cargarLookupsBase(): void {
		this.getCORR_RELIGION();
		this.getCORR_ORIGEN_INGRESO();
		this.getCORR_TIPO_CONTRIBUYENTE();
		this.getCORR_ACTIVIDAD_ECONOMICA();
		this.getCORR_PAIS_NACIMIENTO();
	}

	private refrescarTerritorioDesdeModelo(): void {
		if (!this.tieneDomiciliadoSeleccionado) {
			this.limpiarLookupsTerritorio();
			return;
		}

		const pais = this.modelPersonaNatural.CORR_PAIS_NACIMIENTO;
		if (!pais) {
			this.limpiarLookupsTerritorio();
			return;
		}

		if (!this.esDomiciliado) {
			this.limpiarLookupsTerritorio();
			return;
		}

		const depto = this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO;
		const municipio = this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO;
		this.getCORR_DEPTO_NACIMIENTO(pais);
		if (depto) {
			this.getCORR_MUNICIPIO_NACIMIENTO(pais, depto);
		}
		if (depto && municipio) {
			this.getCORR_DISTRITO_NACIMIENTO(pais, depto, municipio);
		}
	}

	private limpiarLookupsTerritorio(): void {
		this.mCORR_DEPTO_NACIMIENTO = [];
		this.mCORR_MUNICIPIO_NACIMIENTO = [];
		this.mCORR_DISTRITO_NACIMIENTO = [];
	}

	private getCORR_RELIGION(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_RELIGION', 'GetCORR_RELIGION', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_RELIGION = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_ORIGEN_INGRESO(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_ORIGEN_INGRESO',
				'GetCORR_ORIGEN_INGRESO',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_ORIGEN_INGRESO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_TIPO_CONTRIBUYENTE(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_TIPO_CONTRIBUYENTE',
				'GetCORR_TIPO_CONTRIBUYENTE',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_CONTRIBUYENTE = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_ACTIVIDAD_ECONOMICA(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_ACTIVIDAD_ECONOMICA',
				'GetCORR_ACTIVIDAD_ECONOMICA',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_ACTIVIDAD_ECONOMICA = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_PAIS_NACIMIENTO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_PAIS', 'GetCORR_PAIS', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.paisesNacimientoCatalogo = response?.Result ? response.Data ?? [] : [];
					this.aplicarCatalogoPaisNacimiento(this.esDomiciliado);
				},
			});
	}

	private getCORR_DEPTO_NACIMIENTO(corrPais?: number | null): void {
		if (!corrPais) {
			this.mCORR_DEPTO_NACIMIENTO = [];
			return;
		}
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: corrPais }];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_DEPTO_NACIMIENTO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_MUNICIPIO_NACIMIENTO(corrPais?: number | null, corrDepto?: number | null): void {
		if (!corrPais || !corrDepto) {
			this.mCORR_MUNICIPIO_NACIMIENTO = [];
			return;
		}
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: corrPais },
			{ Parameter: 'CORR_DEPTO', Value: corrDepto },
		];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_MUNICIPIO_NACIMIENTO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_DISTRITO_NACIMIENTO(
		corrPais?: number | null,
		corrDepto?: number | null,
		corrMunicipio?: number | null
	): void {
		if (!corrPais || !corrDepto || !corrMunicipio) {
			this.mCORR_DISTRITO_NACIMIENTO = [];
			return;
		}
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: corrPais },
			{ Parameter: 'CORR_DEPTO', Value: corrDepto },
			{ Parameter: 'CORR_MUNICIPIO', Value: corrMunicipio },
		];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_DISTRITO', 'GetCORR_DISTRITO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_DISTRITO_NACIMIENTO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}
}

