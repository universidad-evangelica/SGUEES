// Qué hace: browse + formulario Nuevo/Editar de Empleado (Iniciar + Personales + Documentos + Familiares + Formación + Experiencia + Adicional + Referencias).
// Cómo: grilla browse; Guardar según tab; personales vía SP; documentos/familiares/hijos/formación/experiencia/UEES/referencias anidados.
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, take, toArray } from 'rxjs/operators';
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
import { GenPersonaContacto } from './gen-persona-contacto/models/gen-persona-contacto';
import { GenPersonaFamiliar } from './gen-persona-familiar/models/gen-persona-familiar';
import { GenPersonaHijo } from './gen-persona-hijos/models/gen-persona-hijo';
import { GenPersonaFormacionAcademica } from './gen-persona-formacion-academica/models/gen-persona-formacion-academica';
import { GenPersonaIdioma } from './gen-persona-idiomas/models/gen-persona-idioma';
import { GenPersonaCompetencia } from './gen-persona-competencia/models/gen-persona-competencia';
import { GenPersonaExperienciaLaboral } from './gen-persona-experiencia-laboral/models/gen-persona-experiencia-laboral';
import { GenPersonaFamiliarUees } from './gen-persona-familiar-uees/models/gen-persona-familiar-uees';
import { GenPersonaReferenciaPersonal } from './gen-persona-referencia-personal/models/gen-persona-referencia-personal';
import { GenPersonaReferenciaLaboral } from './gen-persona-referencia-laboral/models/gen-persona-referencia-laboral';
import { GenPersonaDomicilio } from './gen-persona-domicilio/models/gen-persona-domicilio';
import { GenEmpleadoPuesto } from './gen-empleado-puesto/models/gen-empleado-puesto';
import { ScDescriptorAsignadoEmpleado } from '../../SelectionHiring/sc-descriptor-puesto/sc-descriptor-puesto-empleado/models/sc-descriptor-puesto-empleado';
import { FORMATO_AMBOS, FORMATO_CORTO, FORMATO_EXTENSO } from '../../SelectionHiring/sc-descriptor-puesto/models/sc-descriptor-puesto';
import { GenPersonaParentescoContacto } from './gen-persona-parentesco-contacto/models/gen-persona-parentesco-contacto';
import {
	GenEmpleadoContrato,
	GenEmpleadoContratoAccion,
	GenPlantillaContratoActiva,
} from './gen-empleado-contrato/models/gen-empleado-contrato';
import { GenEmpleadoService } from './gen-empleado.service';
import { jsPDF } from 'jspdf';
import * as html2canvasLib from 'html2canvas';
import {
	aplicarLimiteDocumentoIdentidad,
	documentoVisiblePorAplicaPara,
	maxLengthDocumentoIdentidad,
	normalizarFormatoCaracteres,
	teclaPermitidaPorFormato,
} from './gen-persona-tipo-documento-identidad/documentos-identidad.format';
import {
	aplicarFormatoContacto,
	contactoVisiblePorAplicaPara,
	esEmailContacto,
	esTelefonoNacional,
	formatEmailContacto,
	formatTelefonoNacional,
	maxLengthContactoCampo,
	mensajeContactoInvalido,
	normalizarFormatoContacto,
	teclaPermitidaContacto,
} from './gen-persona-contacto/contactos.format';

const ESTADO_FIELD = 'ACTIVO_EMPLEADO';
const TAB_PERSONALES = 0;
const TAB_DOCUMENTOS = 1;

type SubmodalFamiliarTipo = 'familiar' | 'hijo';
type SubmodalFormacionTipo = 'estudio' | 'idioma' | 'competencia';

@Component({
	standalone: false,
	selector: 'app-gen-empleado',
	templateUrl: './gen-empleado.component.html',
	styleUrls: ['./gen-empleado.component.scss'],
})
export class GenEmpleadoComponent extends CBaseComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	// Qué hace: referencia al popup de descriptores de puesto asignables al empleado.
	// Cómo lo hace: captura el componente DxPopupComponent mediante la variable de plantilla #popupDescriptoresEmpleado.
	@ViewChild('popupDescriptoresEmpleado') popupDescriptoresEmpleado?: any;
	// Qué hace: referencia a la grilla de descriptores de puesto dentro del modal.
	// Cómo lo hace: captura el componente DxDataGridComponent mediante la variable de plantilla #gridDescriptoresEmpleado.
	@ViewChild('gridDescriptoresEmpleado') gridDescriptoresEmpleado?: any;
	// Qué hace: referencia al input oculto para subir el documento firmado del contrato.
	// Cómo lo hace: dispara la selección nativa de PDF o imagen sin exponer controles HTML crudos.
	@ViewChild('contratoFirmadoInput', { static: false }) contratoFirmadoInput?: ElementRef<HTMLInputElement>;

	// Qué hace: función de limpieza de listeners de arrastre horizontal (drag-to-scroll) en la grilla de contratos.
	private cleanupDragToScrollContratos?: () => void;

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
	contactos: GenPersonaContacto[] = [];
	/** Copia para Cancelar del tab Contactos. */
	private contactosOriginal: GenPersonaContacto[] = [];

	familiares: GenPersonaFamiliar[] = [];
	private familiaresOriginal: GenPersonaFamiliar[] = [];
	hijos: GenPersonaHijo[] = [];
	private hijosOriginal: GenPersonaHijo[] = [];
	/** Correlativos temporales negativos para altas en memoria antes de SaveAll. */
	private tempCorrFamiliar = -1;
	private tempCorrHijo = -1;

	/** Submodal agregar/editar familiar u hijo (estilo expediente). */
	submodalFamiliarVisible = false;
	submodalFamiliarTipo: SubmodalFamiliarTipo | null = null;
	submodalFamiliarEditIndex: number | null = null;
	submodalFamiliarDraft: any = {};

	// Qué hace: colecciones del tab Formación (estudios / idiomas / competencias) en memoria.
	formacionesAcademicas: GenPersonaFormacionAcademica[] = [];
	private formacionesAcademicasOriginal: GenPersonaFormacionAcademica[] = [];
	idiomas: GenPersonaIdioma[] = [];
	private idiomasOriginal: GenPersonaIdioma[] = [];
	competencias: GenPersonaCompetencia[] = [];
	private competenciasOriginal: GenPersonaCompetencia[] = [];
	private tempCorrFormacion = -1;
	private tempCorrIdioma = -1;
	private tempCorrCompetencia = -1;

	/** Submodal agregar/editar estudio, idioma o competencia. */
	submodalFormacionVisible = false;
	submodalFormacionTipo: SubmodalFormacionTipo | null = null;
	submodalFormacionEditIndex: number | null = null;
	submodalFormacionDraft: any = {};

	// Qué hace: colecciones del tab Experiencia laboral en memoria.
	experienciasLaborales: GenPersonaExperienciaLaboral[] = [];
	private experienciasLaboralesOriginal: GenPersonaExperienciaLaboral[] = [];
	private tempCorrExperiencia = -1;

	/** Submodal agregar/editar experiencia laboral. */
	submodalExperienciaVisible = false;
	submodalExperienciaEditIndex: number | null = null;
	submodalExperienciaDraft: any = {};

	// Qué hace: colecciones del tab Adicional (familiares que trabajan en UEES).
	familiaresUees: GenPersonaFamiliarUees[] = [];
	private familiaresUeesOriginal: GenPersonaFamiliarUees[] = [];
	private tempCorrFamiliarUees = -1;

	/** Submodal agregar/editar familiar UEES. */
	submodalFamiliarUeesVisible = false;
	submodalFamiliarUeesEditIndex: number | null = null;
	submodalFamiliarUeesDraft: any = {};

	// Qué hace: colecciones del tab Referencias (personales + laborales).
	referenciasPersonales: GenPersonaReferenciaPersonal[] = [];
	private referenciasPersonalesOriginal: GenPersonaReferenciaPersonal[] = [];
	private tempCorrReferenciaPersonal = -1;

	/** Submodal agregar/editar referencia personal. */
	submodalReferenciaPersonalVisible = false;
	submodalReferenciaPersonalEditIndex: number | null = null;
	submodalReferenciaPersonalDraft: any = {};

	referenciasLaborales: GenPersonaReferenciaLaboral[] = [];
	private referenciasLaboralesOriginal: GenPersonaReferenciaLaboral[] = [];
	private tempCorrReferenciaLaboral = -1;

	/** Submodal agregar/editar referencia laboral. */
	submodalReferenciaLaboralVisible = false;
	submodalReferenciaLaboralEditIndex: number | null = null;
	submodalReferenciaLaboralDraft: any = {};

	// Qué hace: colecciones del tab Direcciones (domicilios).
	domicilios: GenPersonaDomicilio[] = [];
	private domiciliosOriginal: GenPersonaDomicilio[] = [];
	/** Qué hace: baseline de personales/empleado tras abrir el modal (después de reglas de UI). */
	private modelPersonaNaturalBase: GenPersonaNatural = this.fillPersonaNatural();
	private modelEmpleadoBase: Partial<GenEmpleado> | null = null;
	/** Qué hace: permite fijar el baseline una sola vez al mostrar el popup. */
	private snapshotEdicionPendiente = false;
	private tempCorrDomicilio = -1;

	// Qué hace: colecciones del tab Contactos (personas a contactar, después de Direcciones).
	parentescoContactos: GenPersonaParentescoContacto[] = [];
	private parentescoContactosOriginal: GenPersonaParentescoContacto[] = [];
	private tempCorrParentescoContacto = -1;

	/** Submodal agregar/editar persona de contacto. */
	submodalParentescoContactoVisible = false;
	submodalParentescoContactoEditIndex: number | null = null;
	submodalParentescoContactoDraft: any = {};
	// Qué hace: tipos visibles en el selector de tipos de contacto (lista estable, no un getter).
	// Cómo lo hace: se rearma solo al abrir el submodal, al cargar el lookup o al cambiar Es extranjero.
	tiposParentescoContactoVisibles: any[] = [];

	// Qué hace: colecciones del tab Puestos (unidad + puesto del empleado).
	puestos: GenEmpleadoPuesto[] = [];
	private puestosOriginal: GenEmpleadoPuesto[] = [];
	submodalPuestoVisible = false;
	submodalPuestoEditIndex: number | null = null;
	submodalPuestoDraft: Partial<GenEmpleadoPuesto> = {};
	mCORR_UNIDAD: any[] = [];
	mCORR_PUESTO: any[] = [];
	mCORR_TIPO_CONTRATACION: any[] = [];
	mCORR_TIPO_MODALIDAD: any[] = [];

	/** Submodal agregar/editar domicilio. */
	submodalDomicilioVisible = false;
	submodalDomicilioEditIndex: number | null = null;
	submodalDomicilioDraft: any = {};
	// Qué hace: evita que al cerrar el combo de país vuelva a pedir departamentos.
	// Cómo: se enciende antes de limpiar el draft y se apaga al terminar el ciclo de la vista.
	private omitirLookupDomicilioAlCerrar = false;
	mCORR_PAIS_DOMICILIO: any[] = [];
	mCORR_DEPTO_DOMICILIO: any[] = [];
	mCORR_MUNICIPIO_DOMICILIO: any[] = [];
	mCORR_DISTRITO_DOMICILIO: any[] = [];

	/**
	 * Qué hace: documentos visibles según ES_EXTRANJERO y APLICA_PARA del catálogo.
	 * Cómo: extranjero → EXTRANJEROS|AMBOS; si no → NACIONALES|AMBOS (lista completa se guarda).
	 */
	get documentosIdentidadVisibles(): GenPersonaTipoDocumentoIdentidad[] {
		const esExtranjero = !!this.modelPersonaNatural?.ES_EXTRANJERO;
		return (this.documentosIdentidad ?? []).filter((d) =>
			documentoVisiblePorAplicaPara(d?.APLICA_PARA, esExtranjero)
		);
	}

	/**
	 * Qué hace: contactos visibles según ES_EXTRANJERO y APLICA_PARA del catálogo.
	 * Cómo: extranjero → EXTRANJEROS|AMBOS; si no → NACIONALES|AMBOS.
	 */
	get contactosVisibles(): GenPersonaContacto[] {
		const esExtranjero = !!this.modelPersonaNatural?.ES_EXTRANJERO;
		return (this.contactos ?? []).filter((c) => contactoVisiblePorAplicaPara(c?.APLICA_PARA, esExtranjero));
	}
	/** Qué hace: modal de edición de datos personales (patrón expediente). */
	popupPersonalesVisible = false;
	/** Evita restaurar modelo al cerrar el popup tras Guardar exitoso. */
	private omitirRestaurarPopupPersonales = false;
	// Qué hace: evita GetCORR_DEPTO al cerrar Editar datos.
	// Cómo: se enciende antes de restaurar el modelo; el combo de país dispara valueChange y ese cambio se ignora.
	private cerrandoPopupPersonales = false;
	tabEmpleadoIndex = TAB_PERSONALES;
	descriptoresAsignados: ScDescriptorAsignadoEmpleado[] = [];
	descriptoresDisponibles: ScDescriptorAsignadoEmpleado[] = [];
	descriptorImpresionKeys: number[] = [];
	popupVisiblePdfDescriptor = false;
	tituloPdfDescriptor = 'Descriptor de Puesto';
	PDFDescriptor!: SafeUrl;
	popupDescriptorEmpleadoVisible = false;
	cargandoDescriptores = false;
	descriptorModalPageSize = 50;

	/** Preview blob de la foto (panel + modal). */
	fotoPersonaUrl: string | null = null;
	/** Preview local mientras sube / tras elegir archivo. */
	fotoLocalUrl: string | null = null;
	/** FOTO_URL relativa nueva (tras SubirFoto); vacío = conservar la del modelo. */
	fotoUrlNueva = '';
	fotoSubiendo = false;

	/** Vista rápida del browse (panel lateral). */
	previewPanelVisible = false;
	previewPanelAbierto = false;
	previewEmpleado: GenEmpleado | null = null;
	previewFotoUrl: string | null = null;
	cargandoPreviewFoto = false;
	private previewPanelCloseTimer: ReturnType<typeof setTimeout> | null = null;
	private previewFotoRequestId = 0;

	mCORR_RELIGION: any[] = [];
	mCORR_ORIGEN_INGRESO: any[] = [];
	mCORR_TIPO_CONTRIBUYENTE: any[] = [];
	mCORR_ACTIVIDAD_ECONOMICA: any[] = [];
	mCORR_PAIS_NACIMIENTO: any[] = [];
	/** Catálogo completo de países; el lookup se filtra según ES_EXTRANJERO (SV / resto). */
	private paisesNacimientoCatalogo: any[] = [];
	mCORR_DEPTO_NACIMIENTO: any[] = [];
	mCORR_MUNICIPIO_NACIMIENTO: any[] = [];
	mCORR_DISTRITO_NACIMIENTO: any[] = [];
	mCORR_PARENTESCO: any[] = [];
	mCORR_TIPO_CONTACTO: any[] = [];
	/** Lookup Key/Value de nivel de dominio (idiomas y competencias). */
	mNIVEL_DOMINIO: any[] = [];
	/** Lookups GEN_LISTA Key/Value para personales / formación. */
	mSEXO: any[] = [];
	mESTADO_CIVIL: any[] = [];
	mSI_NO: any[] = [];
	mNIVEL_ACADEMICO: any[] = [];
	mESTADO_NIP: any[] = [];
	mCORR_AFP: any[] = [];
	mCORR_SEGURO_SOCIAL: any[] = [];
	mESTADO_CONTRATO: any[] = [];

	// Qué hace: estado en memoria y modales del tab Contratos (GEN_EMPLEADO_CONTRATO).
	contratos: GenEmpleadoContrato[] = [];
	contratoSeleccionadoKeys: number[] = [];
	plantillasContratoActivas: GenPlantillaContratoActiva[] = [];
	cargandoContratos = false;
	guardandoContrato = false;
	popupContratoFormVisible = false;
	contratoEditandoEsNuevo = true;
	contratoFormDraft: GenEmpleadoContratoAccion = {
		CORR_EMPLEADO_CONTRATO: 0,
		CORR_EMPLEADO: 0,
		CORR_UNIDAD: null,
		CORR_PUESTO: null,
		CORR_PLANTILLA_CONTRATO_VERSION: 0,
		FECHA_INICIO: null,
		FECHA_FIN: null,
		FECHA_FIRMA: null,
		REGENERAR_CONTENIDO: true,
		CUERPO_CONTRATO: '',
	};
	contratoPuestoSelectorKey = '';
	contratoPuestosOpciones: { key: string; label: string; CORR_UNIDAD: number | null; CORR_PUESTO: number | null; FECHA_INGRESO?: string | null; FECHA_FIN?: string | null }[] = [];
	popupContratoPreviewVisible = false;
	contratoPreviewActual: GenEmpleadoContrato | null = null;
	contratoPreviewHtml: SafeHtml = '';
	contratoPreviewPdfUrl: SafeUrl | null = null;
	private contratoPreviewPdfObjectUrl: string | null = null;
	contratoFormPreviewHtml: SafeHtml = '';
	contratoFormPreviewError = '';
	contratoParametrosFaltantes: string[] = [];
	cargandoContratoFormPreview = false;
	contratoPreviewZoom = 100;
	popupContratoAnularVisible = false;
	motivoAnulacionContrato = '';
	popupContratoFirmadoVisible = false;
	tituloContratoFirmado = 'Documento firmado';
	contratoFirmadoUrl: SafeUrl | null = null;
	contratoFirmadoEsImagen = false;
	private contratoFirmadoObjectUrl: string | null = null;
	private contratoParaSubirFirmadoId = 0;
	private contratoFormPreviewSeq = 0;
	private contratoFormPreviewTimer: ReturnType<typeof setTimeout> | null = null;

	/** Código ISO / NOMBRE_CORTO de El Salvador en GEN_PAIS. */
	private static readonly CODIGO_PAIS_EL_SALVADOR = 'SV';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEmpleadoService,
		private sanitization: DomSanitizer,
		private elRef: ElementRef
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

	// Qué hace: Inicializa listeners de interfaz luego de renderizar la vista.
	// Cómo lo hace: Activa el desplazamiento horizontal por arrastre (drag-to-scroll) para la grilla de contratos.
	ngAfterViewInit(): void {
		this.initDragToScrollContratos();
	}

	ngOnDestroy(): void {
		if (this.cleanupDragToScrollContratos) {
			this.cleanupDragToScrollContratos();
		}
		this.revocarFotoPersona();
		this.revocarFotoLocal();
		this.revocarContratoFirmadoUrl();
		this.revocarContratoPreviewPdfUrl();
		this.clearContratoFormPreviewTimer();
		this.clearPreviewPanelCloseTimer();
		this.revocarPreviewFoto();
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

	// Qué hace: indica si se pueden asignar o quitar descriptores.
	// Cómo lo hace: solo en edición del empleado y con permiso de modificar.
	get puedeAsignarDescriptores(): boolean {
		return !!this.permiteEdit && !this.readOnlyPersonales && this.tienePersonaBase;
	}

	// Qué hace: indica si el usuario puede asignar, editar, emitir, finalizar o adjuntar contratos.
	// Cómo lo hace: exige permiso de edición, empleado guardado y formulario fuera de solo lectura.
	get puedeGestionarContratos(): boolean {
		return !!this.permiteEdit && !this.readOnlyPersonales && this.tienePersonaBase;
	}

	// Qué hace: indica si el usuario puede eliminar un contrato aún en borrador.
	// Cómo lo hace: exige permiso de eliminación y modo edición del empleado.
	get puedeEliminarContratos(): boolean {
		return !!this.permiteDele && !this.readOnlyPersonales && this.tienePersonaBase;
	}

	// Qué hace: devuelve la fila de contrato actualmente seleccionada en la grilla del tab Contratos.
	// Cómo lo hace: busca por CORR_EMPLEADO_CONTRATO en el arreglo contratos en memoria.
	get contratoSeleccionado(): GenEmpleadoContrato | null {
		const id = Number(this.contratoSeleccionadoKeys?.[0] ?? 0);
		if (id <= 0) {
			return null;
		}
		return this.contratos.find((c) => Number(c.CORR_EMPLEADO_CONTRATO) === id) ?? null;
	}

	get contratoSeleccionadoEsBorrador(): boolean {
		return Number(this.contratoSeleccionado?.ESTADO_CONTRATO) === 1;
	}

	get contratoSeleccionadoEsVigente(): boolean {
		return Number(this.contratoSeleccionado?.ESTADO_CONTRATO) === 2;
	}

	get contratoSeleccionadoEsAnulado(): boolean {
		return Number(this.contratoSeleccionado?.ESTADO_CONTRATO) === 4;
	}

	// Qué hace: descriptor marcado en el tab para imprimir su reporte.
	// Cómo lo hace: toma la fila cuya llave está en descriptorImpresionKeys.
	get descriptorSeleccionado(): ScDescriptorAsignadoEmpleado | null {
		const corr = this.corrDescriptorImpresion();
		if (corr <= 0) {
			return null;
		}
		return this.descriptoresAsignados.find((item) => Number(item.CORR_DESCRIPTOR_PUESTO) === corr) ?? null;
	}

	// Qué hace: indica si ya se puede imprimir el descriptor del empleado abierto.
	// Cómo lo hace: exige permiso de impresión, descriptor Activo y carga activa.
	get puedeImprimirDescriptorEmpleado(): boolean {
		const fila = this.descriptorSeleccionado;
		return (
			!!this.permitePrint &&
			this.esEstadoDescriptorActivo(fila?.NOMBRE_ESTADO) &&
			this.esCargaAsignacionActiva(fila?.ACTIVO_DESCRIPTOR_PUESTO_EMPLEADO)
		);
	}

	// Qué hace: indica si la carga seleccionada está activa.
	// Cómo lo hace: el bit nulo se toma como activo, que es el valor por defecto de la tabla.
	esCargaAsignacionActiva(valor: boolean | number | string | null | undefined): boolean {
		return valor !== false && valor !== 0 && valor !== '0';
	}

	// Qué hace: indica si el descriptor seleccionado admite el formato corto.
	// Cómo lo hace: compara FORMATO con CORTO o AMBOS.
	get esFormatoCortoDescriptor(): boolean {
		const formato = (this.descriptorSeleccionado?.FORMATO ?? '').trim().toUpperCase();
		return formato === FORMATO_CORTO || formato === FORMATO_AMBOS;
	}

	// Qué hace: indica si el descriptor seleccionado admite el formato extenso.
	// Cómo lo hace: compara FORMATO con EXTENSO o AMBOS.
	get esFormatoExtensoDescriptor(): boolean {
		const formato = (this.descriptorSeleccionado?.FORMATO ?? '').trim().toUpperCase();
		return formato === FORMATO_EXTENSO || formato === FORMATO_AMBOS;
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

	/** Qué hace: país de nacimiento editable en el formulario personales. */
	get paisNacimientoHabilitado(): boolean {
		return this.editandoPersonalesForm;
	}

	/**
	 * Qué hace: depto/municipio/distrito solo si NO es extranjero (territorio SV).
	 * Cómo: extranjero → solo país; nacional → El Salvador + cadena completa.
	 */
	get territorioCompletoHabilitado(): boolean {
		return this.editandoPersonalesForm && !this.modelPersonaNatural?.ES_EXTRANJERO;
	}

	/** Qué hace: empleado marcado como domiciliado (DOMICILIADO=SI) → territorio SV completo en direcciones. */
	get esEmpleadoDomiciliado(): boolean {
		return `${this.modelPersonaNatural?.DOMICILIADO ?? ''}`.trim().toUpperCase() === 'SI';
	}

	/** Qué hace: indica si ya eligió SI/NO en Domiciliado (Personales) para poder registrar direcciones. */
	get tieneDomiciliadoDefinido(): boolean {
		const v = `${this.modelPersonaNatural?.DOMICILIADO ?? ''}`.trim().toUpperCase();
		return v === 'SI' || v === 'NO';
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
				CODIGO_EMPLEADO: xModel.CODIGO_EMPLEADO ?? '',
				NOMBRE_EMPLEADO: xModel.NOMBRE_EMPLEADO ?? '',
				DUI: xModel.DUI ?? '',
				NIT: xModel.NIT ?? '',
				CORR_SEGURO_SOCIAL:
					xModel.CORR_SEGURO_SOCIAL == null || Number(xModel.CORR_SEGURO_SOCIAL) <= 0
						? null
						: Number(xModel.CORR_SEGURO_SOCIAL),
				NOMBRE_SEGURO_SOCIAL: xModel.NOMBRE_SEGURO_SOCIAL ?? '',
				ESTADO_NIP: xModel.ESTADO_NIP ?? '',
				CORR_AFP:
					xModel.CORR_AFP == null || Number(xModel.CORR_AFP) <= 0 ? null : Number(xModel.CORR_AFP),
				NOMBRE_AFP: xModel.NOMBRE_AFP ?? '',
				FECHA_AFILIACION_AFP: xModel.FECHA_AFILIACION_AFP ?? null,
				FECHA_INCORPORACION_SP: xModel.FECHA_INCORPORACION_SP ?? null,
				FECHA_INGRESO: xModel.FECHA_INGRESO ?? null,
				CORREO_INSTITUCIONAL: xModel.CORREO_INSTITUCIONAL ?? (xModel as any).CORREO_ELECTRONICO ?? '',
				TELEFONO_INSTITUCIONAL: xModel.TELEFONO_INSTITUCIONAL ?? (xModel as any).TELEFONO_1 ?? '',
				LOGIN_SISTEMA_WEB: xModel.LOGIN_SISTEMA_WEB ?? '',
				ACTIVO_EMPLEADO: xModel.ACTIVO_EMPLEADO !== false,
				USUARIO_CREA: xModel.USUARIO_CREA ?? '',
				ESTACION_CREA: xModel.ESTACION_CREA ?? '',
				FECHA_CREA: xModel.FECHA_CREA ?? null,
				USUARIO_ACTU: xModel.USUARIO_ACTU ?? '',
				ESTACION_ACTU: xModel.ESTACION_ACTU ?? '',
				FECHA_ACTU: xModel.FECHA_ACTU ?? null,
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
			CORR_SEGURO_SOCIAL: null,
			NOMBRE_SEGURO_SOCIAL: '',
			ESTADO_NIP: '',
			CORR_AFP: null,
			NOMBRE_AFP: '',
			FECHA_AFILIACION_AFP: null,
			FECHA_INCORPORACION_SP: null,
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
		this.contactos = [];
		this.contactosOriginal = [];
		this.familiares = [];
		this.familiaresOriginal = [];
		this.hijos = [];
		this.hijosOriginal = [];
		this.tempCorrFamiliar = -1;
		this.tempCorrHijo = -1;
		this.formacionesAcademicas = [];
		this.formacionesAcademicasOriginal = [];
		this.idiomas = [];
		this.idiomasOriginal = [];
		this.competencias = [];
		this.competenciasOriginal = [];
		this.tempCorrFormacion = -1;
		this.tempCorrIdioma = -1;
		this.tempCorrCompetencia = -1;
		this.experienciasLaborales = [];
		this.experienciasLaboralesOriginal = [];
		this.tempCorrExperiencia = -1;
		this.familiaresUees = [];
		this.familiaresUeesOriginal = [];
		this.tempCorrFamiliarUees = -1;
		this.referenciasPersonales = [];
		this.referenciasPersonalesOriginal = [];
		this.tempCorrReferenciaPersonal = -1;
		this.referenciasLaborales = [];
		this.referenciasLaboralesOriginal = [];
		this.tempCorrReferenciaLaboral = -1;
		this.domicilios = [];
		this.domiciliosOriginal = [];
		this.tempCorrDomicilio = -1;
		this.parentescoContactos = [];
		this.parentescoContactosOriginal = [];
		this.tempCorrParentescoContacto = -1;
		this.puestos = [];
		this.puestosOriginal = [];
		this.descriptoresAsignados = [];
		this.descriptoresDisponibles = [];
		this.descriptorImpresionKeys = [];
		this.popupVisiblePdfDescriptor = false;
		this.popupDescriptorEmpleadoVisible = false;
		this.contratos = [];
		this.contratoSeleccionadoKeys = [];
		this.popupContratoFormVisible = false;
		this.popupContratoPreviewVisible = false;
		this.popupContratoAnularVisible = false;
		this.popupContratoFirmadoVisible = false;
		this.revocarContratoFirmadoUrl();
		this.fotoUrlNueva = '';
		this.revocarFotoLocal();
		this.revocarFotoPersona();
		this.cerrarPreviewPanel(false);
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
						this.guardarFamiliaresDesdeModal(() => {
							this.guardarHijosDesdeModal(() => {
								this.guardarFormacionDesdeModal(() => {
									this.guardarIdiomasDesdeModal(() => {
										this.guardarCompetenciasDesdeModal(() => {
											this.guardarExperienciasDesdeModal(() => {
												this.guardarFamiliaresUeesDesdeModal(() => {
													this.guardarReferenciasPersonalesDesdeModal(() => {
														this.guardarReferenciasLaboralesDesdeModal(() => {
															this.guardarDomiciliosDesdeModal(() => {
																this.modelPersonaNaturalOriginal = this.fillPersonaNatural(this.modelPersonaNatural);
																this.documentosIdentidadOriginal = this.clonarDocumentos(this.documentosIdentidad);
																this.contactosOriginal = this.clonarContactos(this.contactos);
																this.familiaresOriginal = this.clonarFamiliares(this.familiares);
																this.hijosOriginal = this.clonarHijos(this.hijos);
																this.formacionesAcademicasOriginal = this.clonarFormaciones(this.formacionesAcademicas);
																this.idiomasOriginal = this.clonarIdiomas(this.idiomas);
																this.competenciasOriginal = this.clonarCompetencias(this.competencias);
																this.experienciasLaboralesOriginal = this.clonarExperiencias(this.experienciasLaborales);
																this.familiaresUeesOriginal = this.clonarFamiliaresUees(this.familiaresUees);
																this.referenciasPersonalesOriginal = this.clonarReferenciasPersonales(this.referenciasPersonales);
																this.referenciasLaboralesOriginal = this.clonarReferenciasLaborales(this.referenciasLaborales);
																this.domiciliosOriginal = this.clonarDomicilios(this.domicilios);
																this.parentescoContactosOriginal = this.clonarParentescoContactos(this.parentescoContactos);
																this.puestosOriginal = this.clonarPuestos(this.puestos);
																this.fotoUrlNueva = '';
																this.volverBrowseTrasGuardar();
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
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

	// Qué hace: guarda solo los bloques del modal que cambiaron respecto al abrir.
	// Cómo: cada guardar* compara con su copia; si es igual, no llama al API.
	guardarPersonalesDesdeModal(): void {
		if (this.fotoSubiendo) {
			this.notifyFx('Espere a que termine de subir la fotografía.', NotifyType.Warning);
			return;
		}
		this.guardarPersonaNatural(
			() => {
				this.guardarDocumentosDesdeModal(() => {
					this.guardarFamiliaresDesdeModal(() => {
						this.guardarHijosDesdeModal(() => {
							this.guardarFormacionDesdeModal(() => {
								this.guardarIdiomasDesdeModal(() => {
									this.guardarCompetenciasDesdeModal(() => {
										this.guardarExperienciasDesdeModal(() => {
											this.guardarFamiliaresUeesDesdeModal(() => {
												this.guardarReferenciasPersonalesDesdeModal(() => {
													this.guardarReferenciasLaboralesDesdeModal(() => {
														this.guardarDomiciliosDesdeModal(() => {
															this.modelPersonaNaturalOriginal = this.fillPersonaNatural(this.modelPersonaNatural);
															this.documentosIdentidadOriginal = this.clonarDocumentos(this.documentosIdentidad);
															this.contactosOriginal = this.clonarContactos(this.contactos);
															this.familiaresOriginal = this.clonarFamiliares(this.familiares);
															this.hijosOriginal = this.clonarHijos(this.hijos);
															this.formacionesAcademicasOriginal = this.clonarFormaciones(this.formacionesAcademicas);
															this.idiomasOriginal = this.clonarIdiomas(this.idiomas);
															this.competenciasOriginal = this.clonarCompetencias(this.competencias);
															this.experienciasLaboralesOriginal = this.clonarExperiencias(this.experienciasLaborales);
															this.familiaresUeesOriginal = this.clonarFamiliaresUees(this.familiaresUees);
															this.referenciasPersonalesOriginal = this.clonarReferenciasPersonales(this.referenciasPersonales);
															this.referenciasLaboralesOriginal = this.clonarReferenciasLaborales(this.referenciasLaborales);
															this.domiciliosOriginal = this.clonarDomicilios(this.domicilios);
															this.parentescoContactosOriginal = this.clonarParentescoContactos(this.parentescoContactos);
															this.puestosOriginal = this.clonarPuestos(this.puestos);
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
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			},
			{ silencioso: true }
		);
	}

	// Qué hace: activa o desactiva el empleado seleccionado desde la barra.
	// Cómo: confirmación estándar y PUT ActivarInactivar; la grilla se parchea con la fila devuelta.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: al cambiar el estado, refresca también el panel lateral si está abierto.
	// Cómo: reutiliza el parche del browse y copia la misma fila al preview.
	protected override sincronizarSeleccionTrasCambioEstado(data: unknown): void {
		super.sincronizarSeleccionTrasCambioEstado(data);
		if (!data || typeof data !== 'object' || !this.previewEmpleado) {
			return;
		}
		const record = data as GenEmpleado;
		if (Number(record.CORR_EMPLEADO) === Number(this.previewEmpleado.CORR_EMPLEADO)) {
			this.previewEmpleado = this.fillData(record);
		}
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (!rowData) {
			return;
		}
		this.abrirFormulario(rowData, UpdateType.Not_Defined);
	}

	// Qué hace: clic en la fila del browse abre la vista rápida lateral.
	// Cómo: ignora lápiz, basurero y controles; el resto abre el panel con la fila.
	onGridRowClick(e: any): void {
		if (!this.isBrowse() || e?.rowType !== 'data' || !e?.data) {
			return;
		}

		const target = e?.event?.target as HTMLElement | null;
		if (
			target?.closest(
				'.dx-command-edit, .dx-link, .dx-button, button, a, .dx-checkbox, .dx-dropdowneditor-button',
			)
		) {
			return;
		}

		this.abrirPreviewPanel(e.data as GenEmpleado);
	}

	// Qué hace: muestra el panel lateral con los datos de la fila y su fotografía.
	// Cómo: pinta la fila al instante y pide GetFoto por CORR_PERSONA; si no hay imagen, iniciales.
	abrirPreviewPanel(row: GenEmpleado): void {
		const corr = Number(row?.CORR_EMPLEADO ?? 0);
		if (corr <= 0) {
			return;
		}

		this.clearPreviewPanelCloseTimer();
		this.previewEmpleado = this.fillData(row);
		this.previewPanelVisible = true;
		requestAnimationFrame(() => {
			this.previewPanelAbierto = true;
		});
		this.cargarPreviewFoto(Number(row.CORR_PERSONA ?? 0));
	}

	// Qué hace: oculta el panel lateral.
	// Cómo: con animación espera el slide; sin animación lo quita de inmediato.
	cerrarPreviewPanel(animar = true): void {
		this.clearPreviewPanelCloseTimer();

		if (!animar || !this.previewPanelVisible) {
			this.previewPanelAbierto = false;
			this.previewPanelVisible = false;
			this.limpiarPreviewEmpleado();
			return;
		}

		this.previewPanelAbierto = false;
		this.previewPanelCloseTimer = setTimeout(() => {
			this.previewPanelVisible = false;
			this.limpiarPreviewEmpleado();
			this.previewPanelCloseTimer = null;
		}, 280);
	}

	// Qué hace: el botón expandir abre el mismo detalle que el doble clic.
	abrirDetalleDesdePreview(): void {
		if (!this.previewEmpleado) {
			return;
		}
		const data = this.fillData(this.previewEmpleado);
		this.cerrarPreviewPanel(false);
		this.rowDblClick({ data, row: { data } });
	}

	get inicialesPreviewEmpleado(): string {
		const nombre = (this.previewEmpleado?.NOMBRE_EMPLEADO || '').trim();
		if (!nombre) {
			return '?';
		}
		const partes = nombre.split(/\s+/).filter(Boolean);
		const a = partes[0]?.charAt(0).toUpperCase() ?? '';
		const b = partes.length > 1 ? partes[partes.length - 1].charAt(0).toUpperCase() : '';
		return `${a}${b}` || '?';
	}

	get previewCorreoEmpleado(): string {
		return `${this.previewEmpleado?.CORREO_INSTITUCIONAL ?? ''}`.trim();
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
		this.cerrarPreviewPanel(false);
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
	// Cómo: no abre si el registro se consultó en lectura.
	abrirEditarPersonales(): void {
		if (!this.tienePersonaBase || !this.permiteEdit || this.readOnlyPersonales) {
			return;
		}
		this.modelPersonaNaturalOriginal = this.fillPersonaNatural(this.modelPersonaNatural);
		this.documentosIdentidadOriginal = this.clonarDocumentos(this.documentosIdentidad);
		this.contactosOriginal = this.clonarContactos(this.contactos);
		this.familiaresOriginal = this.clonarFamiliares(this.familiares);
		this.hijosOriginal = this.clonarHijos(this.hijos);
		this.formacionesAcademicasOriginal = this.clonarFormaciones(this.formacionesAcademicas);
		this.idiomasOriginal = this.clonarIdiomas(this.idiomas);
		this.competenciasOriginal = this.clonarCompetencias(this.competencias);
		this.experienciasLaboralesOriginal = this.clonarExperiencias(this.experienciasLaborales);
		this.familiaresUeesOriginal = this.clonarFamiliaresUees(this.familiaresUees);
		this.referenciasPersonalesOriginal = this.clonarReferenciasPersonales(this.referenciasPersonales);
		this.referenciasLaboralesOriginal = this.clonarReferenciasLaborales(this.referenciasLaborales);
		this.domiciliosOriginal = this.clonarDomicilios(this.domicilios);
		this.parentescoContactosOriginal = this.clonarParentescoContactos(this.parentescoContactos);
		this.puestosOriginal = this.clonarPuestos(this.puestos);
		this.modelPersonaNaturalBase = this.fillPersonaNatural(this.modelPersonaNatural);
		this.modelEmpleadoBase = this.extraerDatosEmpleado(this.model);
		this.snapshotEdicionPendiente = true;
		this.fotoUrlNueva = '';
		this.revocarFotoLocal();
		this.popupPersonalesVisible = true;
	}

	// Qué hace: cierra el modal y restaura personales/documentos/.../referencias/foto si canceló.
	// Cómo: no vuelve a pedir departamento; esas listas ya se cargaron al abrir.
	cerrarPopupPersonales(restaurar = true): void {
		if (this.cerrandoPopupPersonales) {
			this.popupPersonalesVisible = false;
			return;
		}
		this.cerrandoPopupPersonales = true;
		if (restaurar && !this.omitirRestaurarPopupPersonales) {
			this.modelPersonaNatural = this.fillPersonaNatural(this.modelPersonaNaturalOriginal);
			this.documentosIdentidad = this.clonarDocumentos(this.documentosIdentidadOriginal);
			this.contactos = this.clonarContactos(this.contactosOriginal);
			this.familiares = this.clonarFamiliares(this.familiaresOriginal);
			this.hijos = this.clonarHijos(this.hijosOriginal);
			this.formacionesAcademicas = this.clonarFormaciones(this.formacionesAcademicasOriginal);
			this.idiomas = this.clonarIdiomas(this.idiomasOriginal);
			this.competencias = this.clonarCompetencias(this.competenciasOriginal);
			this.experienciasLaborales = this.clonarExperiencias(this.experienciasLaboralesOriginal);
			this.familiaresUees = this.clonarFamiliaresUees(this.familiaresUeesOriginal);
			this.referenciasPersonales = this.clonarReferenciasPersonales(this.referenciasPersonalesOriginal);
			this.referenciasLaborales = this.clonarReferenciasLaborales(this.referenciasLaboralesOriginal);
			this.domicilios = this.clonarDomicilios(this.domiciliosOriginal);
			this.parentescoContactos = this.clonarParentescoContactos(this.parentescoContactosOriginal);
			this.puestos = this.clonarPuestos(this.puestosOriginal);
			this.fotoUrlNueva = '';
			this.revocarFotoLocal();
		}
		this.omitirRestaurarPopupPersonales = false;
		this.popupPersonalesVisible = false;
		this.cerrarSubmodalFamiliar();
		this.cerrarSubmodalFormacion();
		this.cerrarSubmodalExperiencia();
		this.cerrarSubmodalFamiliarUees();
		this.cerrarSubmodalReferenciaPersonal();
		this.cerrarSubmodalReferenciaLaboral();
		this.cerrarSubmodalDomicilio();
		this.cerrarSubmodalParentescoContacto();
		this.cerrarSubmodalPuesto();
	}

	// Qué hace: suelta el bloqueo de consultas cuando la modal de editar datos ya se ocultó.
	// Cómo: onHidden corre después de que los combos dejan de disparar valueChange.
	alOcultarPopupPersonales(): void {
		this.cerrandoPopupPersonales = false;
	}

	onPopupPersonalesShown(): void {
		setTimeout(() => {
			this.aplicarReglasPersonales();
			this.fijarBaselineEdicion();
		}, 0);
	}

	/**
	 * Qué hace: toma la foto de personales y datos de empleado ya con reglas de UI aplicadas.
	 * Cómo: solo la primera vez que se muestra el popup; eso es lo que se compara al guardar.
	 */
	private fijarBaselineEdicion(): void {
		if (!this.snapshotEdicionPendiente) {
			return;
		}
		this.modelPersonaNaturalBase = this.fillPersonaNatural(this.modelPersonaNatural);
		this.modelEmpleadoBase = this.extraerDatosEmpleado(this.model);
		this.snapshotEdicionPendiente = false;
	}

	/**
	 * Qué hace: indica si un bloque del modal cambió respecto a su copia al abrir.
	 * Cómo: normaliza null/fechas/texto y compara JSON; ignora auditoría.
	 */
	private cambioRespectoA(actual: any, base: any): boolean {
		return this.firmaContenido(actual) !== this.firmaContenido(base);
	}

	private firmaContenido(value: any): string {
		return JSON.stringify(this.normalizarFirma(value));
	}

	private normalizarFirma(value: any): any {
		if (value instanceof Date) {
			return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
		}
		if (Array.isArray(value)) {
			return value.map((item) => this.normalizarFirma(item));
		}
		if (value && typeof value === 'object') {
			const out: any = {};
			for (const key of Object.keys(value).sort()) {
				if (
					key === 'USUARIO_CREA' ||
					key === 'USUARIO_ACTU' ||
					key === 'ESTACION_CREA' ||
					key === 'ESTACION_ACTU' ||
					key === 'FECHA_CREA' ||
					key === 'FECHA_ACTU' ||
					key === 'NOMBRE_COMPLETO'
				) {
					continue;
				}
				out[key] = this.normalizarFirma(value[key]);
			}
			return out;
		}
		if (typeof value === 'string') {
			const texto = value.trim();
			if (!texto) {
				return null;
			}
			if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
				return texto.slice(0, 10);
			}
			return texto;
		}
		if (value === undefined || value === '') {
			return null;
		}
		return value;
	}

	/** Qué hace: campos de GEN_EMPLEADO editables en Personales. */
	private extraerDatosEmpleado(model: GenEmpleado | null | undefined): Partial<GenEmpleado> {
		return {
			CODIGO_EMPLEADO: model?.CODIGO_EMPLEADO ?? '',
			FECHA_INGRESO: model?.FECHA_INGRESO ?? null,
			FECHA_INCORPORACION_SP: model?.FECHA_INCORPORACION_SP ?? null,
			CORREO_INSTITUCIONAL: model?.CORREO_INSTITUCIONAL ?? '',
			TELEFONO_INSTITUCIONAL: model?.TELEFONO_INSTITUCIONAL ?? '',
			CORR_SEGURO_SOCIAL: model?.CORR_SEGURO_SOCIAL ?? null,
			CORR_AFP: model?.CORR_AFP ?? null,
			FECHA_AFILIACION_AFP: model?.FECHA_AFILIACION_AFP ?? null,
			ESTADO_NIP: model?.ESTADO_NIP ?? '',
			ACTIVO_EMPLEADO: model?.ACTIVO_EMPLEADO !== false,
		};
	}

	private personalesCambiaron(): boolean {
		if (`${this.fotoUrlNueva ?? ''}`.trim()) {
			return true;
		}
		return (
			this.cambioRespectoA(this.modelPersonaNatural, this.modelPersonaNaturalBase) ||
			this.cambioRespectoA(this.extraerDatosEmpleado(this.model), this.modelEmpleadoBase)
		);
	}

	/**
	 * Qué hace: persiste documentos desde el modal de edición.
	 * Cómo: SaveAll; en éxito actualiza lista en memoria y llama onSuccess.
	 */
	private guardarDocumentosDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.documentosIdentidad, this.documentosIdentidadOriginal)) {
			this.guardarContactosDesdeModal(onSuccess);
			return;
		}
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
					this.guardarContactosDesdeModal(onSuccess);
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: al cambiar sexo/estado civil/discapacidad/extranjero, aplica reglas de UI del tab Personales.
	onPersonalesFieldChanged(e: any): void {
		if (this.cerrandoPopupPersonales) {
			return;
		}
		if (e?.dataField === 'SEXO' || e?.dataField === 'ESTADO_CIVIL') {
			this.aplicarReglaApellidoCasada();
		}
		if (e?.dataField === 'POSEE_DISCAPACIDAD') {
			// Cómo: usa e.value (ya actualizado) para no depender del timing del formData.
			this.modelPersonaNatural.POSEE_DISCAPACIDAD = !!e.value;
			this.aplicarReglaTipoDiscapacidad();
		}
		if (e?.dataField === 'ES_EXTRANJERO') {
			this.modelPersonaNatural.ES_EXTRANJERO = !!e.value;
			this.aplicarReglaExtranjero();
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
		if (this.cerrandoPopupPersonales) {
			return;
		}
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
		if (this.cerrandoPopupPersonales) {
			return;
		}
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
		if (this.cerrandoPopupPersonales) {
			return;
		}
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
	selectedLookUpAfp(vRow: any): any {
		return vRow?.[0]?.CORR_AFP;
	}
	selectedLookUpSeguroSocial(vRow: any): any {
		return vRow?.[0]?.CORR_SEGURO_SOCIAL;
	}

	textoEstadoNip(valor: string | null | undefined): string {
		const key = `${valor ?? ''}`.trim();
		const item = (this.mESTADO_NIP ?? []).find((x) => `${x?.Key ?? ''}`.trim() === key);
		return item?.Value || this.textoLectura(valor);
	}

	private abrirFormulario(rowData: GenEmpleado, modo: UpdateType): void {
		this.cerrarPreviewPanel(false);
		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.AsignaStatus(modo);
		this.tabEmpleadoIndex = TAB_PERSONALES;
		this.subTituloVentana = this.formSubtituloEditar;
		this.cargarLookupsBase();
		this.cargarPersonaNatural();
		this.cargarDocumentosIdentidad();
		this.cargarContactos();
		this.cargarFamiliares();
		this.cargarHijos();
		this.cargarFormacionAcademica();
		this.cargarIdiomas();
		this.cargarCompetencias();
		this.cargarExperienciasLaborales();
		this.cargarFamiliaresUees();
		this.cargarReferenciasPersonales();
		this.cargarReferenciasLaborales();
		this.cargarDomicilios();
		this.cargarParentescoContactos();
		this.cargarPuestos();
		this.cargarDescriptoresEmpleado();
		this.cargarContratosEmpleado();
	}

	// Qué hace: crea GEN_PERSONA + GEN_EMPRESA_PERSONA + GEN_PERSONA_NATURAL + GEN_EMPLEADO (SP).
	// Cómo: POST Iniciar con payload personales+empleado; parchea model/grid y recarga naturales.
	private iniciarEmpleado(): void {
		const invalido = this.mensajeDatosEmpleadoInvalido();
		if (invalido) {
			this.notifyFx(invalido, NotifyType.Warning);
			return;
		}
		this.loadingVisible = true;
		this.service
			.iniciar(this.construirPayloadPersonalesMtto())
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
					this.cargarContactos();
					this.cargarFamiliares();
					this.cargarHijos();
					this.cargarFormacionAcademica();
					this.cargarIdiomas();
					this.cargarCompetencias();
					this.cargarExperienciasLaborales();
					this.cargarFamiliaresUees();
					this.cargarReferenciasPersonales();
					this.cargarReferenciasLaborales();
					this.cargarDomicilios();
					this.cargarParentescoContactos();
					this.cargarPuestos();
					this.cargarDescriptoresEmpleado();
					this.cargarContratosEmpleado();
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

	// Qué hace: actualiza personales + GEN_EMPLEADO (vía PRAL_MTTO_GEN_EMPLEADO).
	// Cómo: Put PersonaNatural con payload MTTO; parchea natural y campos empleado en model.
	private guardarPersonaNatural(onSuccess?: () => void, opciones?: { silencioso?: boolean }): void {
		if (!this.tienePersonaBase) {
			this.notifyFx('Primero debe iniciar el empleado (Guardar).', NotifyType.Warning);
			return;
		}

		if (!this.personalesCambiaron()) {
			onSuccess?.();
			return;
		}

		const invalido = this.mensajeDatosEmpleadoInvalido();
		if (invalido) {
			this.notifyFx(invalido, NotifyType.Warning);
			return;
		}

		const payload = this.construirPayloadPersonalesMtto();
		if (!(Number(payload.CORR_PERSONA_NATURAL) > 0)) {
			this.notifyFx('No hay persona natural vinculada. Reinicie el alta del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.updatePersonaNatural(payload)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.modelPersonaNatural = this.fillPersonaNatural(response.Data);
					this.aplicarNombresLookupEmpleadoEnModel();
					if (this.modelPersonaNatural.NOMBRE_COMPLETO) {
						this.model.NOMBRE_EMPLEADO = this.modelPersonaNatural.NOMBRE_COMPLETO;
					}
					this.aplicarRegistroEnGrid(this.fillData(this.model), false);
					if (!opciones?.silencioso) {
						this.notifyFx('Datos personales actualizados.', NotifyType.Success, { raw: true });
					}
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	/**
	 * Qué hace: arma el body del SP (natural + campos GEN_EMPLEADO del form).
	 * Cómo: sanitiza CHECK/nulls y une model + modelPersonaNatural.
	 */
	private construirPayloadPersonalesMtto(): any {
		this.aplicarFormatoDatosEmpleado();
		const natural = this.sanitizarPersonaNaturalPayload({
			...this.modelPersonaNatural,
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			FOTO_URL: `${this.fotoUrlNueva || this.modelPersonaNatural.FOTO_URL || ''}`.trim(),
		});
		const vacioANull = (v: any) => (v === '' || v === undefined ? null : v);
		const corrONull = (v: any) => {
			const n = Number(v ?? 0);
			return n > 0 ? n : null;
		};

		return {
			...natural,
			CORR_EMPLEADO: Number(this.model?.CORR_EMPLEADO ?? 0),
			CODIGO_EMPLEADO: vacioANull(`${this.model?.CODIGO_EMPLEADO ?? ''}`.trim()),
			CORR_SEGURO_SOCIAL: corrONull(this.model?.CORR_SEGURO_SOCIAL),
			ESTADO_NIP: vacioANull(`${this.model?.ESTADO_NIP ?? ''}`.trim()),
			CORR_AFP: corrONull(this.model?.CORR_AFP),
			FECHA_AFILIACION_AFP: this.model?.FECHA_AFILIACION_AFP ?? null,
			FECHA_INCORPORACION_SP: this.model?.FECHA_INCORPORACION_SP ?? null,
			FECHA_INGRESO: this.model?.FECHA_INGRESO ?? null,
			CORREO_INSTITUCIONAL: vacioANull(`${this.model?.CORREO_INSTITUCIONAL ?? ''}`.trim()),
			TELEFONO_INSTITUCIONAL: vacioANull(`${this.model?.TELEFONO_INSTITUCIONAL ?? ''}`.trim()),
			ACTIVO_EMPLEADO: this.model?.ACTIVO_EMPLEADO !== false,
		};
	}

	// Qué hace: normaliza correo y teléfono institucional antes de validar o guardar.
	// Cómo: correo sin espacios; teléfono con máscara +503 XXXX-XXXX. Vacío se deja vacío.
	private aplicarFormatoDatosEmpleado(): void {
		if (!this.model) {
			return;
		}
		this.model.CORREO_INSTITUCIONAL = formatEmailContacto(`${this.model.CORREO_INSTITUCIONAL ?? ''}`, 255);
		this.model.TELEFONO_INSTITUCIONAL = formatTelefonoNacional(`${this.model.TELEFONO_INSTITUCIONAL ?? ''}`);
	}

	// Qué hace: valida obligatoriedad de primer nombre, primer apellido y formatos de correo y teléfono institucional.
	// Cómo lo hace: primer nombre y primer apellido no pueden estar vacíos; correo con @ y dominio; teléfono con 8 dígitos.
	private mensajeDatosEmpleadoInvalido(): string | null {
		const primerNombre = `${this.modelPersonaNatural?.PRIMER_NOMBRE ?? ''}`.trim();
		if (!primerNombre) {
			return 'El primer nombre es obligatorio.';
		}

		const primerApellido = `${this.modelPersonaNatural?.PRIMER_APELLIDO ?? ''}`.trim();
		if (!primerApellido) {
			return 'El primer apellido es obligatorio.';
		}

		this.aplicarFormatoDatosEmpleado();
		const correo = `${this.model?.CORREO_INSTITUCIONAL ?? ''}`.trim();
		const telefono = `${this.model?.TELEFONO_INSTITUCIONAL ?? ''}`.trim();
		return (
			mensajeContactoInvalido('EMAIL', 'Correo institucional', correo, true, 255) ||
			mensajeContactoInvalido('TELEFONO_NACION', 'Teléfono institucional', telefono, true, 8)
		);
	}

	onCorreoInstitucionalKeyDown(e: any): void {
		const ev = e?.event as KeyboardEvent | undefined;
		if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) {
			return;
		}
		const key = ev.key || '';
		if (key.length !== 1 || key === 'Dead') {
			return;
		}
		if (!/[A-Za-z0-9@._%+\-]/.test(key)) {
			ev.preventDefault();
		}
	}

	onCorreoInstitucionalInput(e: any): void {
		this.aplicarCorreoInstitucional(e, true);
	}

	onCorreoInstitucionalChanged(e: any): void {
		this.aplicarCorreoInstitucional(e, false);
	}

	private aplicarCorreoInstitucional(e: any, desdeInput: boolean): void {
		if (!this.model) {
			return;
		}
		const input = e?.event?.target as HTMLInputElement | undefined;
		const raw = desdeInput
			? `${input?.value ?? e?.component?.option('value') ?? ''}`
			: `${e?.value ?? ''}`;
		const formateado = formatEmailContacto(raw, 255);
		this.model.CORREO_INSTITUCIONAL = formateado;
		if (input && input.value !== formateado) {
			input.value = formateado;
		}
		if (e?.component && e.component.option('value') !== formateado) {
			e.component.option('value', formateado);
		}
	}

	onTelefonoInstitucionalKeyDown(e: any): void {
		const ev = e?.event as KeyboardEvent | undefined;
		if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) {
			return;
		}
		const key = ev.key || '';
		if (key.length !== 1 || key === 'Dead') {
			return;
		}
		const input = ev.target as HTMLInputElement | undefined;
		const inicio = input?.selectionStart ?? 0;
		if (input && input.value.startsWith('+503') && inicio < 5) {
			ev.preventDefault();
			input.setSelectionRange(input.value.length, input.value.length);
			return;
		}
		if (!/[0-9]/.test(key)) {
			ev.preventDefault();
		}
	}

	onTelefonoInstitucionalInput(e: any): void {
		this.aplicarTelefonoInstitucional(e, true);
	}

	onTelefonoInstitucionalChanged(e: any): void {
		// Qué hace: formatea solo si el usuario escribió en el cuadro.
		// Cómo: al abrir el formulario DevExtreme dispara valueChanged sin tecla; eso no debe cambiar el valor guardado.
		if (!e?.event) {
			return;
		}
		this.aplicarTelefonoInstitucional(e, false);
	}

	private aplicarTelefonoInstitucional(e: any, desdeInput: boolean): void {
		if (!this.model) {
			return;
		}
		const input = e?.event?.target as HTMLInputElement | undefined;
		const raw = desdeInput
			? `${input?.value ?? e?.component?.option('value') ?? ''}`
			: `${e?.value ?? ''}`;
		const formateado = formatTelefonoNacional(raw);
		this.model.TELEFONO_INSTITUCIONAL = formateado;
		if (input && input.value !== formateado) {
			input.value = formateado;
		}
		if (e?.component && e.component.option('value') !== formateado) {
			e.component.option('value', formateado);
		}
		if (desdeInput && input) {
			const colocarAlFinal = () => {
				if ((input.selectionStart ?? 0) < 5 && input.value.startsWith('+503')) {
					input.setSelectionRange(input.value.length, input.value.length);
				}
			};
			colocarAlFinal();
			setTimeout(colocarAlFinal, 0);
		}
	}

	/** Qué hace: sincroniza nombres de AFP/Seguro desde lookups tras guardar. */
	private aplicarNombresLookupEmpleadoEnModel(): void {
		const afp = (this.mCORR_AFP ?? []).find((x) => Number(x?.CORR_AFP) === Number(this.model?.CORR_AFP));
		const ss = (this.mCORR_SEGURO_SOCIAL ?? []).find(
			(x) => Number(x?.CORR_SEGURO_SOCIAL) === Number(this.model?.CORR_SEGURO_SOCIAL)
		);
		this.model.NOMBRE_AFP = afp?.NOMBRE_AFP ?? this.model.NOMBRE_AFP ?? '';
		this.model.NOMBRE_SEGURO_SOCIAL =
			ss?.NOMBRE_SEGURO_SOCIAL ?? ss?.NOMBRE_CORTO_SEGURO ?? this.model.NOMBRE_SEGURO_SOCIAL ?? '';
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

	private clearPreviewPanelCloseTimer(): void {
		if (this.previewPanelCloseTimer) {
			clearTimeout(this.previewPanelCloseTimer);
			this.previewPanelCloseTimer = null;
		}
	}

	private limpiarPreviewEmpleado(): void {
		this.previewEmpleado = null;
		this.cargandoPreviewFoto = false;
		this.revocarPreviewFoto();
	}

	private revocarPreviewFoto(): void {
		if (this.previewFotoUrl) {
			URL.revokeObjectURL(this.previewFotoUrl);
			this.previewFotoUrl = null;
		}
	}

	// Qué hace: pide la fotografía del empleado para el panel lateral.
	// Cómo: GetFoto por CORR_PERSONA; un id de petición descarta respuestas viejas al cambiar de fila.
	private cargarPreviewFoto(corrPersona: number): void {
		this.revocarPreviewFoto();
		this.previewFotoRequestId += 1;
		const requestId = this.previewFotoRequestId;

		if (corrPersona <= 0) {
			this.cargandoPreviewFoto = false;
			return;
		}

		this.cargandoPreviewFoto = true;
		this.service
			.getFoto(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (blob) => {
					if (requestId !== this.previewFotoRequestId) {
						return;
					}
					this.cargandoPreviewFoto = false;
					if (blob && blob.size > 0 && (blob.type || '').startsWith('image/')) {
						this.previewFotoUrl = URL.createObjectURL(blob);
					}
				},
				error: () => {
					if (requestId !== this.previewFotoRequestId) {
						return;
					}
					this.cargandoPreviewFoto = false;
					this.previewFotoUrl = null;
				},
			});
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

	// Qué hace: carga catálogo activo + valores de contactos de la persona.
	// Cómo: API anidada; guarda copia para Cancelar y para no reenviar si no cambió.
	private cargarContactos(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.contactos = [];
			this.contactosOriginal = [];
			return;
		}

		this.service
			.getContactos(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? response.Data ?? [] : [];
					this.contactos = rows;
					this.contactosOriginal = this.clonarContactos(rows);
				},
				error: () => {
					this.contactos = [];
					this.contactosOriginal = [];
				},
			});
	}

	private clonarContactos(rows: GenPersonaContacto[]): GenPersonaContacto[] {
		return (rows ?? []).map((d) => ({ ...d }));
	}

	/**
	 * Qué hace: persiste contactos desde el modal de edición.
	 * Cómo: valida formato en pantalla; SaveAll; en éxito parchea la lista con response.Data.
	 */
	private guardarContactosDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.contactos, this.contactosOriginal)) {
			onSuccess?.();
			return;
		}
		const invalido = (this.contactos ?? [])
			.map((c) =>
				mensajeContactoInvalido(
					c?.NOMBRE_CORTO,
					c?.NOMBRE_TIPO_CONTACTO,
					c?.VALOR_CONTACTO,
					c?.ACTIVO_CARACTERES,
					Number(c?.NUMERO_CARACTERES ?? 0)
				)
			)
			.find((m) => !!m);
		if (invalido) {
			this.notifyFx(invalido, NotifyType.Warning);
			return;
		}

		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveContactos(corrPersona, this.contactos)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = response.Data ?? this.contactos;
					this.contactos = rows;
					this.contactosOriginal = this.clonarContactos(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	/**
	 * Qué hace: persiste familiares desde el modal de edición.
	 * Cómo: SaveAll; en éxito actualiza lista en memoria y llama onSuccess.
	 */
	private guardarFamiliaresDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.familiares, this.familiaresOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveFamiliares(corrPersona, this.familiares)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarFamiliares(response.Data ?? this.familiares);
					this.familiares = rows;
					this.familiaresOriginal = this.clonarFamiliares(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	/**
	 * Qué hace: persiste hijos desde el modal de edición.
	 * Cómo: SaveAll; en éxito actualiza lista en memoria y llama onSuccess.
	 */
	private guardarHijosDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.hijos, this.hijosOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveHijos(corrPersona, this.hijos)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarHijos(response.Data ?? this.hijos);
					this.hijos = rows;
					this.hijosOriginal = this.clonarHijos(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga familiares de la persona.
	private cargarFamiliares(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.familiares = [];
			this.familiaresOriginal = [];
			return;
		}

		this.service
			.getFamiliares(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarFamiliares(response.Data ?? []) : [];
					this.familiares = rows;
					this.familiaresOriginal = this.clonarFamiliares(rows);
				},
				error: () => {
					this.familiares = [];
					this.familiaresOriginal = [];
				},
			});
	}

	// Qué hace: carga hijos de la persona.
	private cargarHijos(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.hijos = [];
			this.hijosOriginal = [];
			return;
		}

		this.service
			.getHijos(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarHijos(response.Data ?? []) : [];
					this.hijos = rows;
					this.hijosOriginal = this.clonarHijos(rows);
				},
				error: () => {
					this.hijos = [];
					this.hijosOriginal = [];
				},
			});
	}

	private normalizarFamiliares(rows: any[]): GenPersonaFamiliar[] {
		return (rows ?? []).map((f) => ({
			...f,
			FECHA_NACIMIENTO: this.parseFecha(f?.FECHA_NACIMIENTO),
		}));
	}

	private normalizarHijos(rows: any[]): GenPersonaHijo[] {
		return (rows ?? []).map((h) => ({
			...h,
			FECHA_NACIMIENTO: this.parseFecha(h?.FECHA_NACIMIENTO),
		}));
	}

	private parseFecha(valor: any): Date | null {
		if (!valor) {
			return null;
		}
		const d = valor instanceof Date ? valor : new Date(valor);
		return Number.isNaN(d.getTime()) ? null : d;
	}

	private clonarFamiliares(rows: GenPersonaFamiliar[]): GenPersonaFamiliar[] {
		return (rows ?? []).map((f) => ({ ...f }));
	}

	private clonarHijos(rows: GenPersonaHijo[]): GenPersonaHijo[] {
		return (rows ?? []).map((h) => ({ ...h }));
	}

	/** Qué hace: resumen de card de familiar en el modal. */
	resumenFamiliar(item: GenPersonaFamiliar): string {
		const partes = [
			item?.NOMBRE_PARENTESCO || null,
			item?.OCUPACION || null,
			item?.TELEFONO || null,
			this.fechaLectura(item?.FECHA_NACIMIENTO) !== '—' ? this.fechaLectura(item?.FECHA_NACIMIENTO) : null,
		].filter((x) => !!x && `${x}`.trim() && `${x}` !== '—');
		return partes.length ? partes.join(' · ') : 'Sin detalle adicional';
	}

	/** Qué hace: resumen de card de hijo en el modal. */
	resumenHijo(item: GenPersonaHijo): string {
		const partes = [
			item?.NOMBRE_COMPLETO || null,
			item?.SEXO || null,
			item?.EDAD != null ? `Edad ${item.EDAD}` : null,
			this.fechaLectura(item?.FECHA_NACIMIENTO) !== '—' ? this.fechaLectura(item?.FECHA_NACIMIENTO) : null,
		].filter((x) => !!x && `${x}`.trim() && `${x}` !== '—');
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	get tituloSubmodalFamiliar(): string {
		const esEdicion = this.submodalFamiliarEditIndex != null;
		if (this.submodalFamiliarTipo === 'hijo') {
			return esEdicion ? 'Editar hijo' : 'Agregar hijo';
		}
		return esEdicion ? 'Editar familiar' : 'Agregar familiar';
	}

	// Qué hace: abre submodal para alta de familiar u hijo.
	abrirSubmodalFamiliarNuevo(tipo: SubmodalFamiliarTipo): void {
		this.submodalFamiliarTipo = tipo;
		this.submodalFamiliarEditIndex = null;
		if (tipo === 'hijo') {
			this.submodalFamiliarDraft = {
				NOMBRE_COMPLETO: '',
				SEXO: null,
				FECHA_NACIMIENTO: null,
				EDAD: null,
			};
		} else {
			this.submodalFamiliarDraft = {
				NOMBRE_COMPLETO: '',
				CORR_PARENTESCO: null,
				NOMBRE_PARENTESCO: '',
				TELEFONO: '',
				DOMICILIO: '',
				OCUPACION: '',
				FECHA_NACIMIENTO: null,
			};
		}
		this.submodalFamiliarVisible = true;
	}

	// Qué hace: abre submodal para editar familiar u hijo existente.
	abrirSubmodalFamiliarEditar(tipo: SubmodalFamiliarTipo, index: number): void {
		this.submodalFamiliarTipo = tipo;
		this.submodalFamiliarEditIndex = index;
		if (tipo === 'hijo') {
			const row = this.hijos[index];
			this.submodalFamiliarDraft = {
				NOMBRE_COMPLETO: row?.NOMBRE_COMPLETO ?? '',
				SEXO: row?.SEXO ?? null,
				FECHA_NACIMIENTO: this.parseFecha(row?.FECHA_NACIMIENTO),
				EDAD: row?.EDAD ?? null,
			};
		} else {
			const row = this.familiares[index];
			this.submodalFamiliarDraft = {
				NOMBRE_COMPLETO: row?.NOMBRE_COMPLETO ?? '',
				CORR_PARENTESCO: row?.CORR_PARENTESCO ?? null,
				NOMBRE_PARENTESCO: row?.NOMBRE_PARENTESCO ?? '',
				TELEFONO: row?.TELEFONO ?? '',
				DOMICILIO: row?.DOMICILIO ?? '',
				OCUPACION: row?.OCUPACION ?? '',
				FECHA_NACIMIENTO: this.parseFecha(row?.FECHA_NACIMIENTO),
			};
		}
		this.submodalFamiliarVisible = true;
	}

	cerrarSubmodalFamiliar(): void {
		this.submodalFamiliarVisible = false;
		this.submodalFamiliarTipo = null;
		this.submodalFamiliarEditIndex = null;
		this.submodalFamiliarDraft = {};
	}

	// Qué hace: al cambiar parentesco en submodal, completa el nombre para la card.
	onSubmodalParentescoChanged(e: any): void {
		const corr = e?.value ?? null;
		const found = (this.mCORR_PARENTESCO ?? []).find((p) => Number(p?.CORR_PARENTESCO) === Number(corr));
		this.submodalFamiliarDraft.NOMBRE_PARENTESCO = found?.NOMBRE_PARENTESCO ?? '';
	}

	// Qué hace: recalcula edad del hijo al cambiar fecha de nacimiento en submodal.
	onSubmodalHijoFechaChanged(valor: any): void {
		this.submodalFamiliarDraft.FECHA_NACIMIENTO = valor ?? null;
		this.submodalFamiliarDraft.EDAD = this.calcularEdad(valor);
	}

	// Qué hace: aplica alta/edición del submodal sobre la lista en memoria (sin API aún).
	guardarSubmodalFamiliar(): void {
		if (this.submodalFamiliarTipo === 'hijo') {
			const nombre = `${this.submodalFamiliarDraft?.NOMBRE_COMPLETO ?? ''}`.trim();
			if (!nombre) {
				this.notifyFx('Ingrese el nombre del hijo.', NotifyType.Warning);
				return;
			}
			const row: GenPersonaHijo = {
				CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
				CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
				CORR_HIJO:
					this.submodalFamiliarEditIndex != null
						? this.hijos[this.submodalFamiliarEditIndex].CORR_HIJO
						: this.tempCorrHijo--,
				NOMBRE_COMPLETO: nombre,
				SEXO: this.submodalFamiliarDraft?.SEXO ?? '',
				FECHA_NACIMIENTO: this.submodalFamiliarDraft?.FECHA_NACIMIENTO ?? null,
				EDAD: this.submodalFamiliarDraft?.EDAD ?? this.calcularEdad(this.submodalFamiliarDraft?.FECHA_NACIMIENTO),
			};
			if (this.submodalFamiliarEditIndex != null) {
				this.hijos = this.hijos.map((h, i) => (i === this.submodalFamiliarEditIndex ? row : h));
			} else {
				this.hijos = [...this.hijos, row];
			}
			this.cerrarSubmodalFamiliar();
			return;
		}

		const nombre = `${this.submodalFamiliarDraft?.NOMBRE_COMPLETO ?? ''}`.trim();
		if (!nombre) {
			this.notifyFx('Ingrese el nombre del familiar.', NotifyType.Warning);
			return;
		}
		const row: GenPersonaFamiliar = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			CORR_FAMILIAR:
				this.submodalFamiliarEditIndex != null
					? this.familiares[this.submodalFamiliarEditIndex].CORR_FAMILIAR
					: this.tempCorrFamiliar--,
			NOMBRE_COMPLETO: nombre,
			CORR_PARENTESCO: this.submodalFamiliarDraft?.CORR_PARENTESCO ?? null,
			NOMBRE_PARENTESCO: this.submodalFamiliarDraft?.NOMBRE_PARENTESCO ?? '',
			TELEFONO: this.submodalFamiliarDraft?.TELEFONO ?? '',
			DOMICILIO: this.submodalFamiliarDraft?.DOMICILIO ?? '',
			OCUPACION: this.submodalFamiliarDraft?.OCUPACION ?? '',
			FECHA_NACIMIENTO: this.submodalFamiliarDraft?.FECHA_NACIMIENTO ?? null,
		};
		if (this.submodalFamiliarEditIndex != null) {
			this.familiares = this.familiares.map((f, i) => (i === this.submodalFamiliarEditIndex ? row : f));
		} else {
			this.familiares = [...this.familiares, row];
		}
		this.cerrarSubmodalFamiliar();
	}

	eliminarFamiliar(index: number): void {
		this.familiares = this.familiares.filter((_, i) => i !== index);
	}

	eliminarHijo(index: number): void {
		this.hijos = this.hijos.filter((_, i) => i !== index);
	}

	// ─── Formación (estudios / idiomas / competencias) ───────────────────────

	/**
	 * Qué hace: persiste formación académica desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarFormacionDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.formacionesAcademicas, this.formacionesAcademicasOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveFormacionAcademica(corrPersona, this.formacionesAcademicas)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarFormaciones(response.Data ?? this.formacionesAcademicas);
					this.formacionesAcademicas = rows;
					this.formacionesAcademicasOriginal = this.clonarFormaciones(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	/**
	 * Qué hace: persiste idiomas desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarIdiomasDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.idiomas, this.idiomasOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveIdiomas(corrPersona, this.idiomas)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarIdiomas(response.Data ?? this.idiomas);
					this.idiomas = rows;
					this.idiomasOriginal = this.clonarIdiomas(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	/**
	 * Qué hace: persiste competencias desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarCompetenciasDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.competencias, this.competenciasOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveCompetencias(corrPersona, this.competencias)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarCompetencias(response.Data ?? this.competencias);
					this.competencias = rows;
					this.competenciasOriginal = this.clonarCompetencias(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga formación académica de la persona.
	private cargarFormacionAcademica(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.formacionesAcademicas = [];
			this.formacionesAcademicasOriginal = [];
			return;
		}

		this.service
			.getFormacionAcademica(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarFormaciones(response.Data ?? []) : [];
					this.formacionesAcademicas = rows;
					this.formacionesAcademicasOriginal = this.clonarFormaciones(rows);
				},
				error: () => {
					this.formacionesAcademicas = [];
					this.formacionesAcademicasOriginal = [];
				},
			});
	}

	// Qué hace: carga idiomas de la persona.
	private cargarIdiomas(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.idiomas = [];
			this.idiomasOriginal = [];
			return;
		}

		this.service
			.getIdiomas(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarIdiomas(response.Data ?? []) : [];
					this.idiomas = rows;
					this.idiomasOriginal = this.clonarIdiomas(rows);
				},
				error: () => {
					this.idiomas = [];
					this.idiomasOriginal = [];
				},
			});
	}

	// Qué hace: carga competencias de la persona.
	private cargarCompetencias(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.competencias = [];
			this.competenciasOriginal = [];
			return;
		}

		this.service
			.getCompetencias(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarCompetencias(response.Data ?? []) : [];
					this.competencias = rows;
					this.competenciasOriginal = this.clonarCompetencias(rows);
				},
				error: () => {
					this.competencias = [];
					this.competenciasOriginal = [];
				},
			});
	}

	private normalizarFormaciones(rows: any[]): GenPersonaFormacionAcademica[] {
		return (rows ?? []).map((f) => ({
			...f,
			DESDE: this.parseFecha(f?.DESDE),
			HASTA: this.parseFecha(f?.HASTA),
		}));
	}

	private normalizarIdiomas(rows: any[]): GenPersonaIdioma[] {
		return (rows ?? []).map((i) => ({ ...i }));
	}

	private normalizarCompetencias(rows: any[]): GenPersonaCompetencia[] {
		return (rows ?? []).map((c) => ({ ...c }));
	}

	private clonarFormaciones(rows: GenPersonaFormacionAcademica[]): GenPersonaFormacionAcademica[] {
		return (rows ?? []).map((f) => ({ ...f }));
	}

	private clonarIdiomas(rows: GenPersonaIdioma[]): GenPersonaIdioma[] {
		return (rows ?? []).map((i) => ({ ...i }));
	}

	private clonarCompetencias(rows: GenPersonaCompetencia[]): GenPersonaCompetencia[] {
		return (rows ?? []).map((c) => ({ ...c }));
	}

	/** Qué hace: mapea Key de NIVEL_DOMINIO al texto Value del lookup. */
	etiquetaNivelDominio(key: string | null | undefined): string {
		const k = `${key ?? ''}`.trim();
		if (!k) {
			return '';
		}
		const found = (this.mNIVEL_DOMINIO ?? []).find(
			(x) => `${x?.Key ?? ''}`.trim().toUpperCase() === k.toUpperCase()
		);
		return found?.Value ?? k;
	}

	/** Qué hace: resumen de card de estudio en el modal. */
	resumenEstudio(item: GenPersonaFormacionAcademica): string {
		const partes = [
			item?.NIVEL || null,
			item?.CENTRO_EDUCATIVO || null,
			item?.TITULO || null,
			this.fechaLectura(item?.DESDE) !== '—' ? `Desde ${this.fechaLectura(item?.DESDE)}` : null,
			this.fechaLectura(item?.HASTA) !== '—' ? `Hasta ${this.fechaLectura(item?.HASTA)}` : null,
		].filter((x) => !!x && `${x}`.trim() && `${x}` !== '—');
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	/** Qué hace: resumen de card de idioma en el modal. */
	resumenIdioma(item: GenPersonaIdioma): string {
		const nivel = this.etiquetaNivelDominio(item?.NIVEL_DOMINIO);
		const partes = [item?.NOMBRE_IDIOMA || null, nivel || null].filter(
			(x) => !!x && `${x}`.trim()
		);
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	/** Qué hace: resumen de card de competencia en el modal. */
	resumenCompetencia(item: GenPersonaCompetencia): string {
		const nivel = this.etiquetaNivelDominio(item?.NIVEL_DOMINIO);
		const partes = [item?.NOMBRE_COMPETENCIA || null, nivel || null].filter(
			(x) => !!x && `${x}`.trim()
		);
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	get tituloSubmodalFormacion(): string {
		const esEdicion = this.submodalFormacionEditIndex != null;
		if (this.submodalFormacionTipo === 'idioma') {
			return esEdicion ? 'Editar idioma' : 'Agregar idioma';
		}
		if (this.submodalFormacionTipo === 'competencia') {
			return esEdicion ? 'Editar competencia' : 'Agregar competencia';
		}
		return esEdicion ? 'Editar estudio' : 'Agregar estudio';
	}

	// Qué hace: abre submodal para alta de estudio, idioma o competencia.
	abrirSubmodalFormacionNuevo(tipo: SubmodalFormacionTipo): void {
		this.submodalFormacionTipo = tipo;
		this.submodalFormacionEditIndex = null;
		if (tipo === 'idioma') {
			this.submodalFormacionDraft = {
				NOMBRE_IDIOMA: '',
				NIVEL_DOMINIO: null,
			};
		} else if (tipo === 'competencia') {
			this.submodalFormacionDraft = {
				NOMBRE_COMPETENCIA: '',
				NIVEL_DOMINIO: null,
			};
		} else {
			this.submodalFormacionDraft = {
				NIVEL: null,
				CENTRO_EDUCATIVO: '',
				DESDE: null,
				HASTA: null,
				TITULO: '',
			};
		}
		this.submodalFormacionVisible = true;
	}

	// Qué hace: abre submodal para editar estudio, idioma o competencia existente.
	abrirSubmodalFormacionEditar(tipo: SubmodalFormacionTipo, index: number): void {
		this.submodalFormacionTipo = tipo;
		this.submodalFormacionEditIndex = index;
		if (tipo === 'idioma') {
			const row = this.idiomas[index];
			this.submodalFormacionDraft = {
				NOMBRE_IDIOMA: row?.NOMBRE_IDIOMA ?? '',
				NIVEL_DOMINIO: row?.NIVEL_DOMINIO ?? null,
			};
		} else if (tipo === 'competencia') {
			const row = this.competencias[index];
			this.submodalFormacionDraft = {
				NOMBRE_COMPETENCIA: row?.NOMBRE_COMPETENCIA ?? '',
				NIVEL_DOMINIO: row?.NIVEL_DOMINIO ?? null,
			};
		} else {
			const row = this.formacionesAcademicas[index];
			this.submodalFormacionDraft = {
				NIVEL: row?.NIVEL ?? null,
				CENTRO_EDUCATIVO: row?.CENTRO_EDUCATIVO ?? '',
				DESDE: this.parseFecha(row?.DESDE),
				HASTA: this.parseFecha(row?.HASTA),
				TITULO: row?.TITULO ?? '',
			};
		}
		this.submodalFormacionVisible = true;
	}

	cerrarSubmodalFormacion(): void {
		this.submodalFormacionVisible = false;
		this.submodalFormacionTipo = null;
		this.submodalFormacionEditIndex = null;
		this.submodalFormacionDraft = {};
	}

	// Qué hace: aplica alta/edición del submodal de formación sobre la lista en memoria (sin API aún).
	guardarSubmodalFormacion(): void {
		if (this.submodalFormacionTipo === 'idioma') {
			const nombre = `${this.submodalFormacionDraft?.NOMBRE_IDIOMA ?? ''}`.trim();
			if (!nombre) {
				this.notifyFx('Ingrese el nombre del idioma.', NotifyType.Warning);
				return;
			}
			const row: GenPersonaIdioma = {
				CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
				CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
				CORR_IDIOMA:
					this.submodalFormacionEditIndex != null
						? this.idiomas[this.submodalFormacionEditIndex].CORR_IDIOMA
						: this.tempCorrIdioma--,
				NOMBRE_IDIOMA: nombre,
				NIVEL_DOMINIO: this.submodalFormacionDraft?.NIVEL_DOMINIO ?? '',
			};
			if (this.submodalFormacionEditIndex != null) {
				this.idiomas = this.idiomas.map((i, idx) =>
					idx === this.submodalFormacionEditIndex ? row : i
				);
			} else {
				this.idiomas = [...this.idiomas, row];
			}
			this.cerrarSubmodalFormacion();
			return;
		}

		if (this.submodalFormacionTipo === 'competencia') {
			const nombre = `${this.submodalFormacionDraft?.NOMBRE_COMPETENCIA ?? ''}`.trim();
			if (!nombre) {
				this.notifyFx('Ingrese el nombre de la competencia.', NotifyType.Warning);
				return;
			}
			const row: GenPersonaCompetencia = {
				CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
				CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
				CORR_COMPETENCIA:
					this.submodalFormacionEditIndex != null
						? this.competencias[this.submodalFormacionEditIndex].CORR_COMPETENCIA
						: this.tempCorrCompetencia--,
				NOMBRE_COMPETENCIA: nombre,
				NIVEL_DOMINIO: this.submodalFormacionDraft?.NIVEL_DOMINIO ?? '',
			};
			if (this.submodalFormacionEditIndex != null) {
				this.competencias = this.competencias.map((c, idx) =>
					idx === this.submodalFormacionEditIndex ? row : c
				);
			} else {
				this.competencias = [...this.competencias, row];
			}
			this.cerrarSubmodalFormacion();
			return;
		}

		const centro = `${this.submodalFormacionDraft?.CENTRO_EDUCATIVO ?? ''}`.trim();
		const titulo = `${this.submodalFormacionDraft?.TITULO ?? ''}`.trim();
		if (!centro && !titulo) {
			this.notifyFx('Ingrese el centro educativo o el título.', NotifyType.Warning);
			return;
		}
		const row: GenPersonaFormacionAcademica = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			CORR_FORMACION_ACADEMICA:
				this.submodalFormacionEditIndex != null
					? this.formacionesAcademicas[this.submodalFormacionEditIndex].CORR_FORMACION_ACADEMICA
					: this.tempCorrFormacion--,
			NIVEL: this.submodalFormacionDraft?.NIVEL ?? '',
			CENTRO_EDUCATIVO: centro,
			TITULO: titulo,
			DESDE: this.submodalFormacionDraft?.DESDE ?? null,
			HASTA: this.submodalFormacionDraft?.HASTA ?? null,
		};
		if (this.submodalFormacionEditIndex != null) {
			this.formacionesAcademicas = this.formacionesAcademicas.map((f, idx) =>
				idx === this.submodalFormacionEditIndex ? row : f
			);
		} else {
			this.formacionesAcademicas = [...this.formacionesAcademicas, row];
		}
		this.cerrarSubmodalFormacion();
	}

	eliminarEstudio(index: number): void {
		this.formacionesAcademicas = this.formacionesAcademicas.filter((_, i) => i !== index);
	}

	eliminarIdioma(index: number): void {
		this.idiomas = this.idiomas.filter((_, i) => i !== index);
	}

	eliminarCompetencia(index: number): void {
		this.competencias = this.competencias.filter((_, i) => i !== index);
	}

	// ─── Experiencia laboral ─────────────────────────────────────────────────

	/**
	 * Qué hace: persiste experiencias laborales desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarExperienciasDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.experienciasLaborales, this.experienciasLaboralesOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveExperienciasLaborales(corrPersona, this.experienciasLaborales)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarExperiencias(response.Data ?? this.experienciasLaborales);
					this.experienciasLaborales = rows;
					this.experienciasLaboralesOriginal = this.clonarExperiencias(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga experiencias laborales de la persona.
	private cargarExperienciasLaborales(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.experienciasLaborales = [];
			this.experienciasLaboralesOriginal = [];
			return;
		}

		this.service
			.getExperienciasLaborales(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarExperiencias(response.Data ?? []) : [];
					this.experienciasLaborales = rows;
					this.experienciasLaboralesOriginal = this.clonarExperiencias(rows);
				},
				error: () => {
					this.experienciasLaborales = [];
					this.experienciasLaboralesOriginal = [];
				},
			});
	}

	private normalizarExperiencias(rows: any[]): GenPersonaExperienciaLaboral[] {
		return (rows ?? []).map((e) => ({
			...e,
			FECHA_INICIO: this.parseFecha(e?.FECHA_INICIO),
			FECHA_FIN: this.parseFecha(e?.FECHA_FIN),
			SALARIO_INICIAL:
				e?.SALARIO_INICIAL == null || e?.SALARIO_INICIAL === ''
					? null
					: Number(e.SALARIO_INICIAL),
			SALARIO_FINAL:
				e?.SALARIO_FINAL == null || e?.SALARIO_FINAL === ''
					? null
					: Number(e.SALARIO_FINAL),
		}));
	}

	private clonarExperiencias(rows: GenPersonaExperienciaLaboral[]): GenPersonaExperienciaLaboral[] {
		return (rows ?? []).map((e) => ({ ...e }));
	}

	/** Qué hace: formatea monto o '—' si vacío. */
	montoLectura(valor: any): string {
		if (valor == null || valor === '') {
			return '—';
		}
		const n = Number(valor);
		if (Number.isNaN(n)) {
			return '—';
		}
		return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
	}

	/** Qué hace: resumen de card de experiencia en el modal. */
	resumenExperiencia(item: GenPersonaExperienciaLaboral): string {
		const partes = [
			item?.CARGO_DESEMPENADO || null,
			this.fechaLectura(item?.FECHA_INICIO) !== '—' ? `Desde ${this.fechaLectura(item?.FECHA_INICIO)}` : null,
			this.fechaLectura(item?.FECHA_FIN) !== '—' ? `Hasta ${this.fechaLectura(item?.FECHA_FIN)}` : null,
			item?.JEFE_INMEDIATO ? `Jefe: ${item.JEFE_INMEDIATO}` : null,
		].filter((x) => !!x && `${x}`.trim() && `${x}` !== '—');
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	get tituloSubmodalExperiencia(): string {
		return this.submodalExperienciaEditIndex != null ? 'Editar experiencia' : 'Agregar experiencia';
	}

	// Qué hace: abre submodal para alta de experiencia laboral.
	abrirSubmodalExperienciaNuevo(): void {
		this.submodalExperienciaEditIndex = null;
		this.submodalExperienciaDraft = {
			LUGAR_TRABAJO: '',
			CARGO_DESEMPENADO: '',
			TELEFONO: '',
			JEFE_INMEDIATO: '',
			SALARIO_INICIAL: null,
			SALARIO_FINAL: null,
			FECHA_INICIO: null,
			FECHA_FIN: null,
			MOTIVO_SALIDA: '',
		};
		this.submodalExperienciaVisible = true;
	}

	// Qué hace: abre submodal para editar experiencia laboral existente.
	abrirSubmodalExperienciaEditar(index: number): void {
		const row = this.experienciasLaborales[index];
		this.submodalExperienciaEditIndex = index;
		this.submodalExperienciaDraft = {
			LUGAR_TRABAJO: row?.LUGAR_TRABAJO ?? '',
			CARGO_DESEMPENADO: row?.CARGO_DESEMPENADO ?? '',
			TELEFONO: row?.TELEFONO ?? '',
			JEFE_INMEDIATO: row?.JEFE_INMEDIATO ?? '',
			SALARIO_INICIAL: row?.SALARIO_INICIAL ?? null,
			SALARIO_FINAL: row?.SALARIO_FINAL ?? null,
			FECHA_INICIO: this.parseFecha(row?.FECHA_INICIO),
			FECHA_FIN: this.parseFecha(row?.FECHA_FIN),
			MOTIVO_SALIDA: row?.MOTIVO_SALIDA ?? '',
		};
		this.submodalExperienciaVisible = true;
	}

	cerrarSubmodalExperiencia(): void {
		this.submodalExperienciaVisible = false;
		this.submodalExperienciaEditIndex = null;
		this.submodalExperienciaDraft = {};
	}

	// Qué hace: aplica alta/edición del submodal de experiencia sobre la lista en memoria (sin API aún).
	guardarSubmodalExperiencia(): void {
		const lugar = `${this.submodalExperienciaDraft?.LUGAR_TRABAJO ?? ''}`.trim();
		if (!lugar) {
			this.notifyFx('Ingrese el lugar de trabajo (empresa).', NotifyType.Warning);
			return;
		}
		const row: GenPersonaExperienciaLaboral = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			CORR_EXPERIENCIA_LABORAL:
				this.submodalExperienciaEditIndex != null
					? this.experienciasLaborales[this.submodalExperienciaEditIndex].CORR_EXPERIENCIA_LABORAL
					: this.tempCorrExperiencia--,
			LUGAR_TRABAJO: lugar,
			CARGO_DESEMPENADO: `${this.submodalExperienciaDraft?.CARGO_DESEMPENADO ?? ''}`.trim(),
			TELEFONO: `${this.submodalExperienciaDraft?.TELEFONO ?? ''}`.trim(),
			JEFE_INMEDIATO: `${this.submodalExperienciaDraft?.JEFE_INMEDIATO ?? ''}`.trim(),
			SALARIO_INICIAL:
				this.submodalExperienciaDraft?.SALARIO_INICIAL == null ||
					this.submodalExperienciaDraft?.SALARIO_INICIAL === ''
					? null
					: Number(this.submodalExperienciaDraft.SALARIO_INICIAL),
			SALARIO_FINAL:
				this.submodalExperienciaDraft?.SALARIO_FINAL == null ||
					this.submodalExperienciaDraft?.SALARIO_FINAL === ''
					? null
					: Number(this.submodalExperienciaDraft.SALARIO_FINAL),
			FECHA_INICIO: this.submodalExperienciaDraft?.FECHA_INICIO ?? null,
			FECHA_FIN: this.submodalExperienciaDraft?.FECHA_FIN ?? null,
			MOTIVO_SALIDA: `${this.submodalExperienciaDraft?.MOTIVO_SALIDA ?? ''}`.trim(),
		};
		if (this.submodalExperienciaEditIndex != null) {
			this.experienciasLaborales = this.experienciasLaborales.map((e, idx) =>
				idx === this.submodalExperienciaEditIndex ? row : e
			);
		} else {
			this.experienciasLaborales = [...this.experienciasLaborales, row];
		}
		this.cerrarSubmodalExperiencia();
	}

	eliminarExperiencia(index: number): void {
		this.experienciasLaborales = this.experienciasLaborales.filter((_, i) => i !== index);
	}

	// ─── Adicional: familiares que trabajan en UEES ───────────────────────────

	/**
	 * Qué hace: persiste familiares UEES desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarFamiliaresUeesDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.familiaresUees, this.familiaresUeesOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveFamiliaresUees(corrPersona, this.familiaresUees)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarFamiliaresUees(response.Data ?? this.familiaresUees);
					this.familiaresUees = rows;
					this.familiaresUeesOriginal = this.clonarFamiliaresUees(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private cargarFamiliaresUees(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.familiaresUees = [];
			this.familiaresUeesOriginal = [];
			return;
		}

		this.service
			.getFamiliaresUees(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarFamiliaresUees(response.Data ?? []) : [];
					this.familiaresUees = rows;
					this.familiaresUeesOriginal = this.clonarFamiliaresUees(rows);
				},
				error: () => {
					this.familiaresUees = [];
					this.familiaresUeesOriginal = [];
				},
			});
	}

	private normalizarFamiliaresUees(rows: any[]): GenPersonaFamiliarUees[] {
		return (rows ?? []).map((f) => ({
			...f,
			CORR_PARENTESCO:
				f?.CORR_PARENTESCO == null || f?.CORR_PARENTESCO === '' || Number(f.CORR_PARENTESCO) <= 0
					? null
					: Number(f.CORR_PARENTESCO),
		}));
	}

	private clonarFamiliaresUees(rows: GenPersonaFamiliarUees[]): GenPersonaFamiliarUees[] {
		return (rows ?? []).map((f) => ({ ...f }));
	}

	/** Qué hace: resumen de card de familiar UEES. */
	resumenFamiliarUees(item: GenPersonaFamiliarUees): string {
		const partes = [
			item?.NOMBRE_PARENTESCO || null,
			item?.CARGO || null,
			item?.LUGAR_TRABAJO || null,
			item?.TELEFONO || null,
		].filter((x) => !!x && `${x}`.trim());
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	get tituloSubmodalFamiliarUees(): string {
		return this.submodalFamiliarUeesEditIndex != null
			? 'Editar familiar UEES'
			: 'Agregar familiar UEES';
	}

	abrirSubmodalFamiliarUeesNuevo(): void {
		this.submodalFamiliarUeesEditIndex = null;
		this.submodalFamiliarUeesDraft = {
			NOMBRE_COMPLETO: '',
			CORR_PARENTESCO: null,
			NOMBRE_PARENTESCO: '',
			TELEFONO: '',
			CARGO: '',
			LUGAR_TRABAJO: '',
		};
		this.submodalFamiliarUeesVisible = true;
	}

	abrirSubmodalFamiliarUeesEditar(index: number): void {
		const row = this.familiaresUees[index];
		this.submodalFamiliarUeesEditIndex = index;
		this.submodalFamiliarUeesDraft = {
			NOMBRE_COMPLETO: row?.NOMBRE_COMPLETO ?? '',
			CORR_PARENTESCO: row?.CORR_PARENTESCO ?? null,
			NOMBRE_PARENTESCO: row?.NOMBRE_PARENTESCO ?? '',
			TELEFONO: row?.TELEFONO ?? '',
			CARGO: row?.CARGO ?? '',
			LUGAR_TRABAJO: row?.LUGAR_TRABAJO ?? '',
		};
		this.submodalFamiliarUeesVisible = true;
	}

	cerrarSubmodalFamiliarUees(): void {
		this.submodalFamiliarUeesVisible = false;
		this.submodalFamiliarUeesEditIndex = null;
		this.submodalFamiliarUeesDraft = {};
	}

	onSubmodalFamiliarUeesParentescoChanged(e: any): void {
		const item = (this.mCORR_PARENTESCO ?? []).find(
			(p: any) => Number(p?.CORR_PARENTESCO) === Number(e?.value)
		);
		this.submodalFamiliarUeesDraft = {
			...this.submodalFamiliarUeesDraft,
			NOMBRE_PARENTESCO: item?.NOMBRE_PARENTESCO ?? '',
		};
	}

	guardarSubmodalFamiliarUees(): void {
		const nombre = `${this.submodalFamiliarUeesDraft?.NOMBRE_COMPLETO ?? ''}`.trim();
		if (!nombre) {
			this.notifyFx('Ingrese el nombre del familiar.', NotifyType.Warning);
			return;
		}
		const corrParentesco =
			this.submodalFamiliarUeesDraft?.CORR_PARENTESCO == null ||
				Number(this.submodalFamiliarUeesDraft.CORR_PARENTESCO) <= 0
				? null
				: Number(this.submodalFamiliarUeesDraft.CORR_PARENTESCO);
		const row: GenPersonaFamiliarUees = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			CORR_FAMILIAR_UEES:
				this.submodalFamiliarUeesEditIndex != null
					? this.familiaresUees[this.submodalFamiliarUeesEditIndex].CORR_FAMILIAR_UEES
					: this.tempCorrFamiliarUees--,
			NOMBRE_COMPLETO: nombre,
			CORR_PARENTESCO: corrParentesco,
			NOMBRE_PARENTESCO: `${this.submodalFamiliarUeesDraft?.NOMBRE_PARENTESCO ?? ''}`.trim(),
			TELEFONO: `${this.submodalFamiliarUeesDraft?.TELEFONO ?? ''}`.trim(),
			CARGO: `${this.submodalFamiliarUeesDraft?.CARGO ?? ''}`.trim(),
			LUGAR_TRABAJO: `${this.submodalFamiliarUeesDraft?.LUGAR_TRABAJO ?? ''}`.trim(),
		};
		if (this.submodalFamiliarUeesEditIndex != null) {
			this.familiaresUees = this.familiaresUees.map((f, idx) =>
				idx === this.submodalFamiliarUeesEditIndex ? row : f
			);
		} else {
			this.familiaresUees = [...this.familiaresUees, row];
		}
		this.cerrarSubmodalFamiliarUees();
	}

	eliminarFamiliarUees(index: number): void {
		this.familiaresUees = this.familiaresUees.filter((_, i) => i !== index);
	}

	// ─── Referencias personales ───────────────────────────────────────────────

	/**
	 * Qué hace: persiste referencias personales desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarReferenciasPersonalesDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.referenciasPersonales, this.referenciasPersonalesOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveReferenciasPersonales(corrPersona, this.referenciasPersonales)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarReferenciasPersonales(
						response.Data ?? this.referenciasPersonales
					);
					this.referenciasPersonales = rows;
					this.referenciasPersonalesOriginal = this.clonarReferenciasPersonales(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private cargarReferenciasPersonales(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.referenciasPersonales = [];
			this.referenciasPersonalesOriginal = [];
			return;
		}

		this.service
			.getReferenciasPersonales(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result
						? this.normalizarReferenciasPersonales(response.Data ?? [])
						: [];
					this.referenciasPersonales = rows;
					this.referenciasPersonalesOriginal = this.clonarReferenciasPersonales(rows);
				},
				error: () => {
					this.referenciasPersonales = [];
					this.referenciasPersonalesOriginal = [];
				},
			});
	}

	private normalizarReferenciasPersonales(rows: any[]): GenPersonaReferenciaPersonal[] {
		return (rows ?? []).map((r) => ({ ...r }));
	}

	private clonarReferenciasPersonales(
		rows: GenPersonaReferenciaPersonal[]
	): GenPersonaReferenciaPersonal[] {
		return (rows ?? []).map((r) => ({ ...r }));
	}

	resumenReferenciaPersonal(item: GenPersonaReferenciaPersonal): string {
		const partes = [item?.DIRECCION || null, item?.TELEFONO || null].filter(
			(x) => !!x && `${x}`.trim()
		);
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	get tituloSubmodalReferenciaPersonal(): string {
		return this.submodalReferenciaPersonalEditIndex != null
			? 'Editar referencia personal'
			: 'Agregar referencia personal';
	}

	abrirSubmodalReferenciaPersonalNuevo(): void {
		this.submodalReferenciaPersonalEditIndex = null;
		this.submodalReferenciaPersonalDraft = {
			NOMBRE_COMPLETO: '',
			DIRECCION: '',
			TELEFONO: '',
		};
		this.submodalReferenciaPersonalVisible = true;
	}

	abrirSubmodalReferenciaPersonalEditar(index: number): void {
		const row = this.referenciasPersonales[index];
		this.submodalReferenciaPersonalEditIndex = index;
		this.submodalReferenciaPersonalDraft = {
			NOMBRE_COMPLETO: row?.NOMBRE_COMPLETO ?? '',
			DIRECCION: row?.DIRECCION ?? '',
			TELEFONO: row?.TELEFONO ?? '',
		};
		this.submodalReferenciaPersonalVisible = true;
	}

	cerrarSubmodalReferenciaPersonal(): void {
		this.submodalReferenciaPersonalVisible = false;
		this.submodalReferenciaPersonalEditIndex = null;
		this.submodalReferenciaPersonalDraft = {};
	}

	guardarSubmodalReferenciaPersonal(): void {
		const nombre = `${this.submodalReferenciaPersonalDraft?.NOMBRE_COMPLETO ?? ''}`.trim();
		if (!nombre) {
			this.notifyFx('Ingrese el nombre de la referencia.', NotifyType.Warning);
			return;
		}
		const row: GenPersonaReferenciaPersonal = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			CORR_REFERENCIA_PERSONAL:
				this.submodalReferenciaPersonalEditIndex != null
					? this.referenciasPersonales[this.submodalReferenciaPersonalEditIndex]
						.CORR_REFERENCIA_PERSONAL
					: this.tempCorrReferenciaPersonal--,
			NOMBRE_COMPLETO: nombre,
			DIRECCION: `${this.submodalReferenciaPersonalDraft?.DIRECCION ?? ''}`.trim(),
			TELEFONO: `${this.submodalReferenciaPersonalDraft?.TELEFONO ?? ''}`.trim(),
		};
		if (this.submodalReferenciaPersonalEditIndex != null) {
			this.referenciasPersonales = this.referenciasPersonales.map((r, idx) =>
				idx === this.submodalReferenciaPersonalEditIndex ? row : r
			);
		} else {
			this.referenciasPersonales = [...this.referenciasPersonales, row];
		}
		this.cerrarSubmodalReferenciaPersonal();
	}

	eliminarReferenciaPersonal(index: number): void {
		this.referenciasPersonales = this.referenciasPersonales.filter((_, i) => i !== index);
	}

	// ─── Referencias laborales ────────────────────────────────────────────────

	/**
	 * Qué hace: persiste referencias laborales desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarReferenciasLaboralesDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.referenciasLaborales, this.referenciasLaboralesOriginal)) {
			onSuccess?.();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveReferenciasLaborales(corrPersona, this.referenciasLaborales)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarReferenciasLaborales(
						response.Data ?? this.referenciasLaborales
					);
					this.referenciasLaborales = rows;
					this.referenciasLaboralesOriginal = this.clonarReferenciasLaborales(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private cargarReferenciasLaborales(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.referenciasLaborales = [];
			this.referenciasLaboralesOriginal = [];
			return;
		}

		this.service
			.getReferenciasLaborales(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result
						? this.normalizarReferenciasLaborales(response.Data ?? [])
						: [];
					this.referenciasLaborales = rows;
					this.referenciasLaboralesOriginal = this.clonarReferenciasLaborales(rows);
				},
				error: () => {
					this.referenciasLaborales = [];
					this.referenciasLaboralesOriginal = [];
				},
			});
	}

	private normalizarReferenciasLaborales(rows: any[]): GenPersonaReferenciaLaboral[] {
		return (rows ?? []).map((r) => ({ ...r }));
	}

	private clonarReferenciasLaborales(
		rows: GenPersonaReferenciaLaboral[]
	): GenPersonaReferenciaLaboral[] {
		return (rows ?? []).map((r) => ({ ...r }));
	}

	resumenReferenciaLaboral(item: GenPersonaReferenciaLaboral): string {
		const partes = [item?.LUGAR_TRABAJO || null, item?.TELEFONO || null].filter(
			(x) => !!x && `${x}`.trim()
		);
		return partes.length ? partes.join(' · ') : 'Sin detalle';
	}

	get tituloSubmodalReferenciaLaboral(): string {
		return this.submodalReferenciaLaboralEditIndex != null
			? 'Editar referencia laboral'
			: 'Agregar referencia laboral';
	}

	abrirSubmodalReferenciaLaboralNuevo(): void {
		this.submodalReferenciaLaboralEditIndex = null;
		this.submodalReferenciaLaboralDraft = {
			NOMBRE_COMPLETO: '',
			LUGAR_TRABAJO: '',
			TELEFONO: '',
		};
		this.submodalReferenciaLaboralVisible = true;
	}

	abrirSubmodalReferenciaLaboralEditar(index: number): void {
		const row = this.referenciasLaborales[index];
		this.submodalReferenciaLaboralEditIndex = index;
		this.submodalReferenciaLaboralDraft = {
			NOMBRE_COMPLETO: row?.NOMBRE_COMPLETO ?? '',
			LUGAR_TRABAJO: row?.LUGAR_TRABAJO ?? '',
			TELEFONO: row?.TELEFONO ?? '',
		};
		this.submodalReferenciaLaboralVisible = true;
	}

	cerrarSubmodalReferenciaLaboral(): void {
		this.submodalReferenciaLaboralVisible = false;
		this.submodalReferenciaLaboralEditIndex = null;
		this.submodalReferenciaLaboralDraft = {};
	}

	guardarSubmodalReferenciaLaboral(): void {
		const nombre = `${this.submodalReferenciaLaboralDraft?.NOMBRE_COMPLETO ?? ''}`.trim();
		if (!nombre) {
			this.notifyFx('Ingrese el nombre de la referencia.', NotifyType.Warning);
			return;
		}
		const row: GenPersonaReferenciaLaboral = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			CORR_REFERENCIA_LABORAL:
				this.submodalReferenciaLaboralEditIndex != null
					? this.referenciasLaborales[this.submodalReferenciaLaboralEditIndex]
						.CORR_REFERENCIA_LABORAL
					: this.tempCorrReferenciaLaboral--,
			NOMBRE_COMPLETO: nombre,
			LUGAR_TRABAJO: `${this.submodalReferenciaLaboralDraft?.LUGAR_TRABAJO ?? ''}`.trim(),
			TELEFONO: `${this.submodalReferenciaLaboralDraft?.TELEFONO ?? ''}`.trim(),
		};
		if (this.submodalReferenciaLaboralEditIndex != null) {
			this.referenciasLaborales = this.referenciasLaborales.map((r, idx) =>
				idx === this.submodalReferenciaLaboralEditIndex ? row : r
			);
		} else {
			this.referenciasLaborales = [...this.referenciasLaborales, row];
		}
		this.cerrarSubmodalReferenciaLaboral();
	}

	eliminarReferenciaLaboral(index: number): void {
		this.referenciasLaborales = this.referenciasLaborales.filter((_, i) => i !== index);
	}

	// ─── Direcciones / domicilios ─────────────────────────────────────────────

	/**
	 * Qué hace: persiste domicilios desde el modal.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarDomiciliosDesdeModal(onSuccess?: () => void): void {
		const continuar = () => this.guardarParentescoContactosDesdeModal(onSuccess);
		if (this.cantidadDireccionesActivas() > 1) {
			this.notifyFx(
				'Solo puede haber una dirección activa. Desactive las demás antes de guardar.',
				NotifyType.Warning
			);
			return;
		}
		if (!this.cambioRespectoA(this.domicilios, this.domiciliosOriginal)) {
			continuar();
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveDomicilios(corrPersona, this.domicilios)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarDomicilios(response.Data ?? this.domicilios);
					this.domicilios = rows;
					this.domiciliosOriginal = this.clonarDomicilios(rows);
					this.guardarParentescoContactosDesdeModal(onSuccess);
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private cargarDomicilios(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.domicilios = [];
			this.domiciliosOriginal = [];
			return;
		}

		this.service
			.getDomicilios(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarDomicilios(response.Data ?? []) : [];
					this.domicilios = rows;
					this.domiciliosOriginal = this.clonarDomicilios(rows);
				},
				error: () => {
					this.domicilios = [];
					this.domiciliosOriginal = [];
				},
			});
	}

	private normalizarDomicilios(rows: any[]): GenPersonaDomicilio[] {
		return (rows ?? []).map((d) => ({
			...d,
			CORR_PAIS: d?.CORR_PAIS == null || Number(d.CORR_PAIS) <= 0 ? null : Number(d.CORR_PAIS),
			CORR_DEPTO: d?.CORR_DEPTO == null || Number(d.CORR_DEPTO) <= 0 ? null : Number(d.CORR_DEPTO),
			CORR_MUNICIPIO:
				d?.CORR_MUNICIPIO == null || Number(d.CORR_MUNICIPIO) <= 0 ? null : Number(d.CORR_MUNICIPIO),
			CORR_DISTRITO:
				d?.CORR_DISTRITO == null || Number(d.CORR_DISTRITO) <= 0 ? null : Number(d.CORR_DISTRITO),
			ACTIVO_DOMICILIO: d?.ACTIVO_DOMICILIO !== false && d?.ACTIVO_DOMICILIO !== 0,
		}));
	}

	private clonarDomicilios(rows: GenPersonaDomicilio[]): GenPersonaDomicilio[] {
		return (rows ?? []).map((d) => ({ ...d }));
	}

	// Qué hace: persiste personas de contacto (tab Contactos) si cambiaron.
	// Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	private guardarParentescoContactosDesdeModal(onSuccess?: () => void): void {
		if (!this.cambioRespectoA(this.parentescoContactos, this.parentescoContactosOriginal)) {
			this.guardarPuestosDesdeModal(onSuccess);
			return;
		}
		const corrPersona = Number(this.model.CORR_PERSONA);
		if (corrPersona <= 0) {
			this.notifyFx('No se encontró CORR_PERSONA del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.saveParentescoContactos(corrPersona, this.parentescoContactos)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarParentescoContactos(response.Data ?? this.parentescoContactos);
					this.parentescoContactos = rows;
					this.parentescoContactosOriginal = this.clonarParentescoContactos(rows);
					this.guardarPuestosDesdeModal(onSuccess);
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private cargarParentescoContactos(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.parentescoContactos = [];
			this.parentescoContactosOriginal = [];
			return;
		}

		this.service
			.getParentescoContactos(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result
						? this.normalizarParentescoContactos(response.Data ?? [])
						: [];
					this.parentescoContactos = rows;
					this.parentescoContactosOriginal = this.clonarParentescoContactos(rows);
				},
				error: () => {
					this.parentescoContactos = [];
					this.parentescoContactosOriginal = [];
				},
			});
	}

	private normalizarParentescoContactos(rows: any[]): GenPersonaParentescoContacto[] {
		return (rows ?? []).map((r) => ({
			...r,
			CORR_PARENTESCO:
				r?.CORR_PARENTESCO == null || Number(r.CORR_PARENTESCO) <= 0 ? null : Number(r.CORR_PARENTESCO),
			CORR_TIPO_CONTACTO:
				r?.CORR_TIPO_CONTACTO == null || Number(r.CORR_TIPO_CONTACTO) <= 0
					? null
					: Number(r.CORR_TIPO_CONTACTO),
			ES_EXTRANJERO: r?.ES_EXTRANJERO === true || r?.ES_EXTRANJERO === 1 || r?.ES_EXTRANJERO === '1',
			PARENTESCO_CONTACTO_EMERGENCIA:
				r?.PARENTESCO_CONTACTO_EMERGENCIA === true ||
				r?.PARENTESCO_CONTACTO_EMERGENCIA === 1 ||
				r?.PARENTESCO_CONTACTO_EMERGENCIA === '1',
			ACTIVO_PARENTESCO_CONTACTO: r?.ACTIVO_PARENTESCO_CONTACTO !== false && r?.ACTIVO_PARENTESCO_CONTACTO !== 0,
		}));
	}

	private clonarParentescoContactos(rows: GenPersonaParentescoContacto[]): GenPersonaParentescoContacto[] {
		return (rows ?? []).map((r) => ({ ...r }));
	}

	resumenParentescoContacto(item: GenPersonaParentescoContacto): string {
		const partes = [
			item?.NOMBRE_PARENTESCO || null,
			item?.NOMBRE_TIPO_CONTACTO || null,
			item?.VALOR_CONTACTO || null,
		].filter((x) => !!x && `${x}`.trim());
		const base = partes.length ? partes.join(' · ') : 'Sin detalle';
		const marcas = [
			item?.ES_EXTRANJERO ? 'Extranjero' : null,
			item?.PARENTESCO_CONTACTO_EMERGENCIA ? 'Emergencia' : null,
		].filter((x) => !!x);
		return marcas.length ? `${base} · ${marcas.join(' · ')}` : base;
	}

	get tituloSubmodalParentescoContacto(): string {
		return this.submodalParentescoContactoEditIndex != null
			? 'Editar contacto'
			: 'Agregar contacto';
	}

	abrirSubmodalParentescoContactoNuevo(): void {
		this.submodalParentescoContactoEditIndex = null;
		this.submodalParentescoContactoDraft = {
			NOMBRE_COMPLETO: '',
			CORR_PARENTESCO: null,
			CORR_TIPO_CONTACTO: null,
			VALOR_CONTACTO: '',
			DIRECCION: '',
			ES_EXTRANJERO: false,
			PARENTESCO_CONTACTO_EMERGENCIA: false,
		};
		this.sincronizarTiposParentescoContactoVisibles();
		this.submodalParentescoContactoVisible = true;
	}

	abrirSubmodalParentescoContactoEditar(index: number): void {
		const row = this.parentescoContactos[index];
		this.submodalParentescoContactoEditIndex = index;
		this.submodalParentescoContactoDraft = {
			NOMBRE_COMPLETO: row?.NOMBRE_COMPLETO ?? '',
			CORR_PARENTESCO: row?.CORR_PARENTESCO ?? null,
			CORR_TIPO_CONTACTO: row?.CORR_TIPO_CONTACTO ?? null,
			VALOR_CONTACTO: row?.VALOR_CONTACTO ?? '',
			DIRECCION: row?.DIRECCION ?? '',
			ES_EXTRANJERO: !!row?.ES_EXTRANJERO,
			PARENTESCO_CONTACTO_EMERGENCIA: !!row?.PARENTESCO_CONTACTO_EMERGENCIA,
			NOMBRE_CORTO: row?.NOMBRE_CORTO,
			NOMBRE_TIPO_CONTACTO: row?.NOMBRE_TIPO_CONTACTO,
			NOMBRE_PARENTESCO: row?.NOMBRE_PARENTESCO,
			FORMATO_CARACTERES: row?.FORMATO_CARACTERES,
			NUMERO_CARACTERES: row?.NUMERO_CARACTERES,
			ACTIVO_CARACTERES: row?.ACTIVO_CARACTERES,
		};
		this.sincronizarTiposParentescoContactoVisibles();
		this.submodalParentescoContactoVisible = true;
	}

	cerrarSubmodalParentescoContacto(): void {
		this.submodalParentescoContactoVisible = false;
		this.submodalParentescoContactoEditIndex = null;
		this.submodalParentescoContactoDraft = {};
	}

	// Qué hace: al marcar extranjero, quita el tipo si ya no aplica (teléfono nacional vs extranjero).
	// Cómo: compara APLICA_PARA del tipo elegido con el check y limpia valor si no coincide.
	onEsExtranjeroParentescoContactoChanged(): void {
		this.sincronizarTiposParentescoContactoVisibles();
		const draft = this.submodalParentescoContactoDraft;
		const tipo = this.tipoParentescoContactoSeleccionado();
		if (!draft || !tipo) {
			return;
		}
		if (contactoVisiblePorAplicaPara(tipo.APLICA_PARA, !!draft.ES_EXTRANJERO)) {
			return;
		}
		draft.CORR_TIPO_CONTACTO = null;
		draft.VALOR_CONTACTO = '';
		draft.NOMBRE_CORTO = '';
		draft.NOMBRE_TIPO_CONTACTO = '';
		draft.FORMATO_CARACTERES = '';
		draft.NUMERO_CARACTERES = 0;
		draft.ACTIVO_CARACTERES = null;
	}

	// Qué hace: arma la lista del selector según Es extranjero, sin recrearla en cada clic.
	private sincronizarTiposParentescoContactoVisibles(): void {
		const esExtranjero = !!this.submodalParentescoContactoDraft?.ES_EXTRANJERO;
		this.tiposParentescoContactoVisibles = (this.mCORR_TIPO_CONTACTO ?? []).filter((t) =>
			contactoVisiblePorAplicaPara(t?.APLICA_PARA, esExtranjero)
		);
	}

	// Qué hace: copia al draft las reglas del tipo elegido y reformatea el valor.
	// Cómo: si el selector se limpia solo (sin clic del usuario), conserva el valor anterior.
	onTipoParentescoContactoChanged(e?: any): void {
		const draft = this.submodalParentescoContactoDraft;
		if (!draft) {
			return;
		}
		if (e && (e.value == null || e.value === '') && e.previousValue != null && !e.event) {
			draft.CORR_TIPO_CONTACTO = e.previousValue;
			return;
		}
		const corr = Number(e?.value ?? draft.CORR_TIPO_CONTACTO ?? 0);
		const tipo =
			(this.mCORR_TIPO_CONTACTO ?? []).find((t) => Number(t?.CORR_TIPO_CONTACTO) === corr) ?? null;
		if (!tipo) {
			return;
		}
		draft.NOMBRE_CORTO = tipo?.NOMBRE_CORTO ?? '';
		draft.NOMBRE_TIPO_CONTACTO = tipo?.NOMBRE_TIPO_CONTACTO ?? '';
		draft.FORMATO_CARACTERES = tipo?.FORMATO_CARACTERES ?? '';
		draft.NUMERO_CARACTERES = tipo?.NUMERO_CARACTERES ?? 0;
		draft.ACTIVO_CARACTERES = tipo?.ACTIVO_CARACTERES;
		draft.VALOR_CONTACTO = aplicarFormatoContacto(
			draft.NOMBRE_CORTO,
			`${draft.VALOR_CONTACTO ?? ''}`,
			draft.ACTIVO_CARACTERES,
			Number(draft.NUMERO_CARACTERES ?? 0),
			draft.FORMATO_CARACTERES
		);
	}

	tipoParentescoContactoSeleccionado(): any {
		const corr = Number(this.submodalParentescoContactoDraft?.CORR_TIPO_CONTACTO ?? 0);
		return (this.mCORR_TIPO_CONTACTO ?? []).find((t) => Number(t?.CORR_TIPO_CONTACTO) === corr) ?? null;
	}

	maxLengthParentescoContacto(): number | null {
		const draft = this.submodalParentescoContactoDraft;
		if (!draft?.NOMBRE_CORTO && !draft?.CORR_TIPO_CONTACTO) {
			return null;
		}
		return maxLengthContactoCampo(
			draft?.NOMBRE_CORTO,
			draft?.ACTIVO_CARACTERES,
			Number(draft?.NUMERO_CARACTERES ?? 0)
		);
	}

	onParentescoContactoValorKeyDown(e: any): void {
		const draft = this.submodalParentescoContactoDraft;
		if (!draft?.NOMBRE_CORTO) {
			return;
		}
		const ev = e?.event as KeyboardEvent | undefined;
		if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) {
			return;
		}
		const key = ev.key || '';
		if (key.length !== 1 || key === 'Dead') {
			return;
		}
		if (esTelefonoNacional(draft.NOMBRE_CORTO)) {
			const input = ev.target as HTMLInputElement | undefined;
			const inicio = input?.selectionStart ?? 0;
			if (input && input.value.startsWith('+503') && inicio < 5) {
				ev.preventDefault();
				input.setSelectionRange(input.value.length, input.value.length);
				return;
			}
			if (!/[0-9]/.test(key)) {
				ev.preventDefault();
			}
			return;
		}
		if (esEmailContacto(draft.NOMBRE_CORTO)) {
			if (!/[A-Za-z0-9@._%+\-]/.test(key)) {
				ev.preventDefault();
			}
			return;
		}
		const formato = normalizarFormatoContacto(draft.FORMATO_CARACTERES);
		if (!teclaPermitidaContacto(key, formato)) {
			ev.preventDefault();
		}
	}

	onParentescoContactoValorInput(e: any): void {
		this.aplicarValorParentescoContacto(e, true);
	}

	onParentescoContactoValorChanged(e: any): void {
		this.aplicarValorParentescoContacto(e, false);
	}

	private aplicarValorParentescoContacto(e: any, desdeInput: boolean): void {
		const draft = this.submodalParentescoContactoDraft;
		if (!draft) {
			return;
		}
		const input = e?.event?.target as HTMLInputElement | undefined;
		const raw = desdeInput
			? `${input?.value ?? e?.component?.option('text') ?? e?.component?.option('value') ?? ''}`
			: `${e?.value ?? ''}`;
		const formateado = aplicarFormatoContacto(
			draft.NOMBRE_CORTO,
			raw,
			draft.ACTIVO_CARACTERES,
			Number(draft.NUMERO_CARACTERES ?? 0),
			draft.FORMATO_CARACTERES
		);
		draft.VALOR_CONTACTO = formateado;
		if (input && input.value !== formateado) {
			input.value = formateado;
		}
		if (e?.component && e.component.option('value') !== formateado) {
			e.component.option('value', formateado);
		}
		if (desdeInput && input && esTelefonoNacional(draft.NOMBRE_CORTO)) {
			const colocarAlFinal = () => {
				if ((input.selectionStart ?? 0) < 5) {
					input.setSelectionRange(input.value.length, input.value.length);
				}
			};
			colocarAlFinal();
			setTimeout(colocarAlFinal, 0);
		}
	}

	guardarSubmodalParentescoContacto(): void {
		const draft = this.submodalParentescoContactoDraft ?? {};
		const nombre = `${draft.NOMBRE_COMPLETO ?? ''}`.trim();
		if (!nombre) {
			this.notifyFx('Indique el nombre de la persona de contacto.', NotifyType.Warning);
			return;
		}
		if (nombre.length > 100) {
			this.notifyFx('El nombre no puede superar 100 caracteres.', NotifyType.Warning);
			return;
		}
		const corrParentesco = Number(draft.CORR_PARENTESCO ?? 0);
		if (corrParentesco <= 0) {
			this.notifyFx('Seleccione el parentesco.', NotifyType.Warning);
			return;
		}
		const tipo = this.tipoParentescoContactoSeleccionado();
		const corrTipo = Number(draft.CORR_TIPO_CONTACTO ?? 0);
		if (corrTipo <= 0 || !tipo) {
			this.notifyFx('Seleccione el tipo de contacto.', NotifyType.Warning);
			return;
		}
		if (!contactoVisiblePorAplicaPara(tipo.APLICA_PARA, !!draft.ES_EXTRANJERO)) {
			this.notifyFx(
				draft.ES_EXTRANJERO
					? 'El tipo de contacto no aplica para un contacto extranjero.'
					: 'El tipo de contacto no aplica para un contacto nacional.',
				NotifyType.Warning
			);
			return;
		}
		const valor = aplicarFormatoContacto(
			tipo.NOMBRE_CORTO,
			`${draft.VALOR_CONTACTO ?? ''}`,
			tipo.ACTIVO_CARACTERES,
			Number(tipo.NUMERO_CARACTERES ?? 0),
			tipo.FORMATO_CARACTERES
		);
		if (!`${valor}`.trim()) {
			this.notifyFx('Indique el valor de contacto.', NotifyType.Warning);
			return;
		}
		const invalido = mensajeContactoInvalido(
			tipo.NOMBRE_CORTO,
			tipo.NOMBRE_TIPO_CONTACTO,
			valor,
			tipo.ACTIVO_CARACTERES,
			Number(tipo.NUMERO_CARACTERES ?? 0)
		);
		if (invalido) {
			this.notifyFx(invalido, NotifyType.Warning);
			return;
		}
		const direccion = `${draft.DIRECCION ?? ''}`.trim();
		if (direccion.length > 255) {
			this.notifyFx('La dirección no puede superar 255 caracteres.', NotifyType.Warning);
			return;
		}

		const parentesco = (this.mCORR_PARENTESCO ?? []).find(
			(p) => Number(p?.CORR_PARENTESCO) === corrParentesco
		);
		const anterior =
			this.submodalParentescoContactoEditIndex != null
				? this.parentescoContactos[this.submodalParentescoContactoEditIndex]
				: null;
		const corrAnterior = Number(anterior?.CORR_PARENTESCO_CONTACTO ?? 0);
		const row: GenPersonaParentescoContacto = {
			CORR_EMPRESA: Number(anterior?.CORR_EMPRESA ?? this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(anterior?.CORR_PERSONA ?? this.model?.CORR_PERSONA ?? 0),
			CORR_PARENTESCO_CONTACTO: corrAnterior > 0 ? corrAnterior : this.tempCorrParentescoContacto--,
			NOMBRE_COMPLETO: nombre,
			CORR_PARENTESCO: corrParentesco,
			NOMBRE_PARENTESCO: parentesco?.NOMBRE_PARENTESCO ?? '',
			CORR_TIPO_CONTACTO: corrTipo,
			NOMBRE_TIPO_CONTACTO: tipo.NOMBRE_TIPO_CONTACTO ?? '',
			NOMBRE_CORTO: tipo.NOMBRE_CORTO ?? '',
			NUMERO_CARACTERES: Number(tipo.NUMERO_CARACTERES ?? 0),
			ACTIVO_CARACTERES: tipo.ACTIVO_CARACTERES,
			FORMATO_CARACTERES: tipo.FORMATO_CARACTERES ?? '',
			APLICA_PARA: tipo.APLICA_PARA ?? '',
			VALOR_CONTACTO: valor,
			DIRECCION: direccion,
			ES_EXTRANJERO: !!draft.ES_EXTRANJERO,
			PARENTESCO_CONTACTO_EMERGENCIA: !!draft.PARENTESCO_CONTACTO_EMERGENCIA,
			ACTIVO_PARENTESCO_CONTACTO: true,
		};

		if (this.submodalParentescoContactoEditIndex != null) {
			this.parentescoContactos = this.parentescoContactos.map((r, idx) =>
				idx === this.submodalParentescoContactoEditIndex ? row : r
			);
		} else {
			this.parentescoContactos = [...this.parentescoContactos, row];
		}
		this.cerrarSubmodalParentescoContacto();
	}

	eliminarParentescoContacto(index: number): void {
		this.parentescoContactos = this.parentescoContactos.filter((_, idx) => idx !== index);
	}

	// Qué hace: marca o quita el contacto de emergencia desde la tarjeta.
	// Cómo: invierte PARENTESCO_CONTACTO_EMERGENCIA en memoria; se guarda con el empleado.
	toggleParentescoContactoEmergencia(index: number, event?: Event): void {
		event?.preventDefault();
		event?.stopPropagation();
		const row = this.parentescoContactos[index];
		if (!row) {
			return;
		}
		this.parentescoContactos = this.parentescoContactos.map((r, i) =>
			i === index ? { ...r, PARENTESCO_CONTACTO_EMERGENCIA: !r.PARENTESCO_CONTACTO_EMERGENCIA } : r
		);
	}


	resumenDomicilio(item: GenPersonaDomicilio): string {
		const partes = this.esEmpleadoDomiciliado
			? [
				item?.NOMBRE_PAIS || null,
				item?.NOMBRE_DEPTO || null,
				item?.NOMBRE_MUNICIPIO || null,
				item?.NOMBRE_DISTRITO || null,
				item?.DIRECCION || null,
			]
			: [item?.NOMBRE_PAIS || null, item?.DIRECCION || null];
		return partes.filter((x) => !!x && `${x}`.trim()).join(' · ') || 'Sin detalle';
	}

	// Qué hace: alterna ACTIVO_DOMICILIO en memoria (se guarda con Guardar cambios).
	// Cómo: permite apagar siempre; si ya hay otra activa, no enciende esta y avisa.
	toggleActivoDomicilio(index: number, event?: Event): void {
		event?.stopPropagation();
		const row = this.domicilios[index];
		if (!row) {
			return;
		}
		const activar = !row.ACTIVO_DOMICILIO;
		if (activar && this.hayOtraDireccionActiva(index)) {
			this.notifyFx(
				'Ya hay una dirección activa. Desactívela antes de activar otra.',
				NotifyType.Warning
			);
			return;
		}
		this.domicilios = this.domicilios.map((d, i) =>
			i === index ? { ...d, ACTIVO_DOMICILIO: activar } : d
		);
	}

	// Qué hace: indica si otra dirección distinta de la editada ya está activa.
	private hayOtraDireccionActiva(exceptoIndex: number | null): boolean {
		return (this.domicilios ?? []).some(
			(d, i) => (exceptoIndex == null || i !== exceptoIndex) && !!d.ACTIVO_DOMICILIO
		);
	}

	private cantidadDireccionesActivas(): number {
		return (this.domicilios ?? []).filter((d) => !!d.ACTIVO_DOMICILIO).length;
	}

	get tituloSubmodalDomicilio(): string {
		return this.submodalDomicilioEditIndex != null ? 'Editar dirección' : 'Agregar dirección';
	}

	abrirSubmodalDomicilioNuevo(): void {
		if (!this.tieneDomiciliadoDefinido) {
			this.notifyFx(
				'Seleccione primero si el empleado es domiciliado o no (tab Personales).',
				NotifyType.Warning
			);
			return;
		}
		this.submodalDomicilioEditIndex = null;
		this.submodalDomicilioDraft = {
			DIRECCION: '',
			CORR_PAIS: null,
			CORR_DEPTO: null,
			CORR_MUNICIPIO: null,
			CORR_DISTRITO: null,
			ACTIVO_DOMICILIO: !this.hayOtraDireccionActiva(null),
		};
		this.mCORR_DEPTO_DOMICILIO = [];
		this.mCORR_MUNICIPIO_DOMICILIO = [];
		this.mCORR_DISTRITO_DOMICILIO = [];
		this.asegurarCatalogoPaisDomicilio(true);
		this.submodalDomicilioVisible = true;
	}

	/**
	 * Qué hace: garantiza catálogo de países antes de filtrar por DOMICILIADO.
	 * Cómo: si ya hay datos aplica filtro; si no, carga GetCORR_PAIS y luego aplica.
	 */
	private asegurarCatalogoPaisDomicilio(forzarSv: boolean): void {
		if ((this.paisesNacimientoCatalogo ?? []).length > 0) {
			this.aplicarCatalogoPaisDomicilio(forzarSv);
			return;
		}
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_PAIS', 'GetCORR_PAIS', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.paisesNacimientoCatalogo = response?.Result ? response.Data ?? [] : [];
					this.aplicarCatalogoPaisDomicilio(forzarSv);
				},
			});
	}

	abrirSubmodalDomicilioEditar(index: number): void {
		if (!this.tieneDomiciliadoDefinido) {
			this.notifyFx(
				'Seleccione primero si el empleado es domiciliado o no (tab Personales).',
				NotifyType.Warning
			);
			return;
		}
		const row = this.domicilios[index];
		this.submodalDomicilioEditIndex = index;
		this.submodalDomicilioDraft = {
			DIRECCION: row?.DIRECCION ?? '',
			CORR_PAIS: row?.CORR_PAIS ?? null,
			CORR_DEPTO: row?.CORR_DEPTO ?? null,
			CORR_MUNICIPIO: row?.CORR_MUNICIPIO ?? null,
			CORR_DISTRITO: row?.CORR_DISTRITO ?? null,
			ACTIVO_DOMICILIO: row?.ACTIVO_DOMICILIO !== false,
			NOMBRE_PAIS: row?.NOMBRE_PAIS ?? '',
			NOMBRE_DEPTO: row?.NOMBRE_DEPTO ?? '',
			NOMBRE_MUNICIPIO: row?.NOMBRE_MUNICIPIO ?? '',
			NOMBRE_DISTRITO: row?.NOMBRE_DISTRITO ?? '',
		};
		this.prepararLookupsDomicilio(() => {
			this.submodalDomicilioVisible = true;
		});
	}

	// Qué hace: carga país, departamento, municipio y distrito antes de abrir el modal.
	// Cómo: el combo solo se muestra cuando ya trae la opción guardada; si no, el valor se pierde.
	private prepararLookupsDomicilio(alTerminar: () => void): void {
		const seguir = () => {
			this.aplicarCatalogoPaisDomicilio(this.submodalDomicilioEditIndex == null);
			const pais = Number(this.submodalDomicilioDraft?.CORR_PAIS ?? 0);
			if (!this.esEmpleadoDomiciliado || pais <= 0) {
				this.mCORR_DEPTO_DOMICILIO = [];
				this.mCORR_MUNICIPIO_DOMICILIO = [];
				this.mCORR_DISTRITO_DOMICILIO = [];
				alTerminar();
				return;
			}
			this.cargarDeptoDomicilio(pais, () => {
				const depto = Number(this.submodalDomicilioDraft?.CORR_DEPTO ?? 0);
				if (depto <= 0) {
					this.mCORR_MUNICIPIO_DOMICILIO = [];
					this.mCORR_DISTRITO_DOMICILIO = [];
					alTerminar();
					return;
				}
				this.cargarMunicipioDomicilio(pais, depto, () => {
					const mun = Number(this.submodalDomicilioDraft?.CORR_MUNICIPIO ?? 0);
					if (mun <= 0) {
						this.mCORR_DISTRITO_DOMICILIO = [];
						alTerminar();
						return;
					}
					this.cargarDistritoDomicilio(pais, depto, mun, alTerminar);
				});
			});
		};

		if ((this.paisesNacimientoCatalogo ?? []).length > 0) {
			seguir();
			return;
		}
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_PAIS', 'GetCORR_PAIS', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.paisesNacimientoCatalogo = response?.Result ? response.Data ?? [] : [];
					seguir();
				},
			});
	}

	// Qué hace: cierra el submodal de dirección sin recargar departamento, municipio ni distrito.
	// Cómo: marca el cierre antes de vaciar el draft; el combo de país dispara onValueChanged y ese cambio se ignora.
	cerrarSubmodalDomicilio(): void {
		if (this.omitirLookupDomicilioAlCerrar) {
			this.submodalDomicilioVisible = false;
			return;
		}
		this.omitirLookupDomicilioAlCerrar = true;
		this.submodalDomicilioVisible = false;
		this.submodalDomicilioEditIndex = null;
		this.submodalDomicilioDraft = {};
		this.mCORR_PAIS_DOMICILIO = [];
		this.mCORR_DEPTO_DOMICILIO = [];
		this.mCORR_MUNICIPIO_DOMICILIO = [];
		this.mCORR_DISTRITO_DOMICILIO = [];
		setTimeout(() => {
			this.omitirLookupDomicilioAlCerrar = false;
		}, 0);
	}

	/**
	 * Qué hace: filtra países del submodal según DOMICILIADO del empleado.
	 * Cómo: SI → solo El Salvador (y lo selecciona); NO → todos excepto SV.
	 */
	private aplicarCatalogoPaisDomicilio(forzarSv: boolean): void {
		const catalogo = this.paisesNacimientoCatalogo ?? [];
		if (this.esEmpleadoDomiciliado) {
			const elSalvador = catalogo.filter((p) => this.esPaisElSalvador(p));
			this.mCORR_PAIS_DOMICILIO = elSalvador;
			const corrSv = Number(elSalvador[0]?.CORR_PAIS ?? 0);
			if (forzarSv && corrSv > 0) {
				this.submodalDomicilioDraft = {
					...this.submodalDomicilioDraft,
					CORR_PAIS: corrSv,
					NOMBRE_PAIS: elSalvador[0]?.NOMBRE_PAIS ?? 'El Salvador',
				};
				this.cargarDeptoDomicilio(corrSv);
			}
			return;
		}

		this.mCORR_PAIS_DOMICILIO = catalogo.filter((p) => !this.esPaisElSalvador(p));
		const corrActual = Number(this.submodalDomicilioDraft?.CORR_PAIS ?? 0);
		if (corrActual > 0) {
			const sel = catalogo.find((p) => Number(p?.CORR_PAIS) === corrActual);
			if (sel && this.esPaisElSalvador(sel)) {
				this.submodalDomicilioDraft = {
					...this.submodalDomicilioDraft,
					CORR_PAIS: null,
					CORR_DEPTO: null,
					CORR_MUNICIPIO: null,
					CORR_DISTRITO: null,
					NOMBRE_PAIS: '',
					NOMBRE_DEPTO: '',
					NOMBRE_MUNICIPIO: '',
					NOMBRE_DISTRITO: '',
				};
			}
		}
		this.mCORR_DEPTO_DOMICILIO = [];
		this.mCORR_MUNICIPIO_DOMICILIO = [];
		this.mCORR_DISTRITO_DOMICILIO = [];
	}

	onSubmodalDomicilioPaisChanged(e: any): void {
		if (this.omitirLookupDomicilioAlCerrar || !e?.event) {
			return;
		}
		const corrPais = Number(e?.value ?? 0) || null;
		const pais = (this.mCORR_PAIS_DOMICILIO ?? []).find((p) => Number(p?.CORR_PAIS) === Number(corrPais));
		this.submodalDomicilioDraft = {
			...this.submodalDomicilioDraft,
			CORR_PAIS: corrPais,
			NOMBRE_PAIS: pais?.NOMBRE_PAIS ?? '',
			CORR_DEPTO: null,
			CORR_MUNICIPIO: null,
			CORR_DISTRITO: null,
			NOMBRE_DEPTO: '',
			NOMBRE_MUNICIPIO: '',
			NOMBRE_DISTRITO: '',
		};
		this.mCORR_MUNICIPIO_DOMICILIO = [];
		this.mCORR_DISTRITO_DOMICILIO = [];
		if (this.esEmpleadoDomiciliado && corrPais) {
			this.cargarDeptoDomicilio(corrPais);
		} else {
			this.mCORR_DEPTO_DOMICILIO = [];
		}
	}

	onSubmodalDomicilioDeptoChanged(e: any): void {
		if (this.omitirLookupDomicilioAlCerrar || !e?.event) {
			return;
		}
		const corrDepto = Number(e?.value ?? 0) || null;
		const depto = (this.mCORR_DEPTO_DOMICILIO ?? []).find((d) => Number(d?.CORR_DEPTO) === Number(corrDepto));
		const pais = Number(this.submodalDomicilioDraft?.CORR_PAIS ?? 0);
		this.submodalDomicilioDraft = {
			...this.submodalDomicilioDraft,
			CORR_DEPTO: corrDepto,
			NOMBRE_DEPTO: depto?.NOMBRE_DEPTO ?? '',
			CORR_MUNICIPIO: null,
			CORR_DISTRITO: null,
			NOMBRE_MUNICIPIO: '',
			NOMBRE_DISTRITO: '',
		};
		this.mCORR_DISTRITO_DOMICILIO = [];
		if (pais && corrDepto) {
			this.cargarMunicipioDomicilio(pais, corrDepto);
		} else {
			this.mCORR_MUNICIPIO_DOMICILIO = [];
		}
	}

	onSubmodalDomicilioMunicipioChanged(e: any): void {
		if (this.omitirLookupDomicilioAlCerrar || !e?.event) {
			return;
		}
		const corrMun = Number(e?.value ?? 0) || null;
		const mun = (this.mCORR_MUNICIPIO_DOMICILIO ?? []).find(
			(m) => Number(m?.CORR_MUNICIPIO) === Number(corrMun)
		);
		const pais = Number(this.submodalDomicilioDraft?.CORR_PAIS ?? 0);
		const depto = Number(this.submodalDomicilioDraft?.CORR_DEPTO ?? 0);
		this.submodalDomicilioDraft = {
			...this.submodalDomicilioDraft,
			CORR_MUNICIPIO: corrMun,
			NOMBRE_MUNICIPIO: mun?.NOMBRE_MUNICIPIO ?? '',
			CORR_DISTRITO: null,
			NOMBRE_DISTRITO: '',
		};
		if (pais && depto && corrMun) {
			this.cargarDistritoDomicilio(pais, depto, corrMun);
		} else {
			this.mCORR_DISTRITO_DOMICILIO = [];
		}
	}

	onSubmodalDomicilioDistritoChanged(e: any): void {
		if (this.omitirLookupDomicilioAlCerrar || !e?.event) {
			return;
		}
		const corrDist = Number(e?.value ?? 0) || null;
		const dist = (this.mCORR_DISTRITO_DOMICILIO ?? []).find(
			(d) => Number(d?.CORR_DISTRITO) === Number(corrDist)
		);
		this.submodalDomicilioDraft = {
			...this.submodalDomicilioDraft,
			CORR_DISTRITO: corrDist,
			NOMBRE_DISTRITO: dist?.NOMBRE_DISTRITO ?? '',
		};
	}

	private cargarDeptoDomicilio(corrPais: number, alTerminar?: () => void): void {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: corrPais }];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_DEPTO_DOMICILIO = response?.Result ? response.Data ?? [] : [];
					alTerminar?.();
				},
				error: () => alTerminar?.(),
			});
	}

	private cargarMunicipioDomicilio(corrPais: number, corrDepto: number, alTerminar?: () => void): void {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: corrPais },
			{ Parameter: 'CORR_DEPTO', Value: corrDepto },
		];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_MUNICIPIO_DOMICILIO = response?.Result ? response.Data ?? [] : [];
					alTerminar?.();
				},
				error: () => alTerminar?.(),
			});
	}

	private cargarDistritoDomicilio(
		corrPais: number,
		corrDepto: number,
		corrMun: number,
		alTerminar?: () => void
	): void {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: corrPais },
			{ Parameter: 'CORR_DEPTO', Value: corrDepto },
			{ Parameter: 'CORR_MUNICIPIO', Value: corrMun },
		];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_DISTRITO', 'GetCORR_DISTRITO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_DISTRITO_DOMICILIO = response?.Result ? response.Data ?? [] : [];
					alTerminar?.();
				},
				error: () => alTerminar?.(),
			});
	}

	guardarSubmodalDomicilio(): void {
		const direccion = `${this.submodalDomicilioDraft?.DIRECCION ?? ''}`.trim();
		if (!direccion) {
			this.notifyFx('Ingrese la dirección.', NotifyType.Warning);
			return;
		}
		const textoDireccion = direccion.toUpperCase();
		const direccionRepetida = (this.domicilios ?? []).some((d, idx) => {
			if (this.submodalDomicilioEditIndex != null && idx === this.submodalDomicilioEditIndex) {
				return false;
			}
			return `${d?.DIRECCION ?? ''}`.trim().toUpperCase() === textoDireccion;
		});
		if (direccionRepetida) {
			this.notifyFx('Esa dirección ya está registrada. Escriba otro texto.', NotifyType.Warning);
			return;
		}
		const quedariaActiva = this.submodalDomicilioDraft?.ACTIVO_DOMICILIO !== false;
		if (quedariaActiva && this.hayOtraDireccionActiva(this.submodalDomicilioEditIndex)) {
			this.notifyFx(
				'Ya hay una dirección activa. Desactívela antes de activar otra.',
				NotifyType.Warning
			);
			return;
		}
		const corrPais = Number(this.submodalDomicilioDraft?.CORR_PAIS ?? 0) || null;
		if (!corrPais) {
			this.notifyFx('Seleccione el país.', NotifyType.Warning);
			return;
		}

		const domiciliado = this.esEmpleadoDomiciliado;
		let corrDepto: number | null = null;
		let corrMun: number | null = null;
		let corrDist: number | null = null;
		let nombreDepto = '';
		let nombreMun = '';
		let nombreDist = '';

		if (domiciliado) {
			corrDepto = Number(this.submodalDomicilioDraft?.CORR_DEPTO ?? 0) || null;
			corrMun = Number(this.submodalDomicilioDraft?.CORR_MUNICIPIO ?? 0) || null;
			corrDist = Number(this.submodalDomicilioDraft?.CORR_DISTRITO ?? 0) || null;
			if (!corrDepto || !corrMun) {
				this.notifyFx('Complete departamento y municipio.', NotifyType.Warning);
				return;
			}
			nombreDepto = `${this.submodalDomicilioDraft?.NOMBRE_DEPTO ?? ''}`.trim();
			nombreMun = `${this.submodalDomicilioDraft?.NOMBRE_MUNICIPIO ?? ''}`.trim();
			nombreDist = `${this.submodalDomicilioDraft?.NOMBRE_DISTRITO ?? ''}`.trim();
		}

		const row: GenPersonaDomicilio = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PERSONA: Number(this.model?.CORR_PERSONA ?? 0),
			CORR_DOMICILIO:
				this.submodalDomicilioEditIndex != null
					? this.domicilios[this.submodalDomicilioEditIndex].CORR_DOMICILIO
					: this.tempCorrDomicilio--,
			DIRECCION: direccion,
			CORR_PAIS: corrPais,
			NOMBRE_PAIS: `${this.submodalDomicilioDraft?.NOMBRE_PAIS ?? ''}`.trim(),
			CORR_DEPTO: corrDepto,
			NOMBRE_DEPTO: nombreDepto,
			CORR_MUNICIPIO: corrMun,
			NOMBRE_MUNICIPIO: nombreMun,
			CORR_DISTRITO: corrDist,
			NOMBRE_DISTRITO: nombreDist,
			ACTIVO_DOMICILIO: this.submodalDomicilioDraft?.ACTIVO_DOMICILIO !== false,
		};

		if (this.submodalDomicilioEditIndex != null) {
			this.domicilios = this.domicilios.map((d, idx) =>
				idx === this.submodalDomicilioEditIndex ? row : d
			);
		} else {
			this.domicilios = [...this.domicilios, row];
		}
		this.cerrarSubmodalDomicilio();
	}

	eliminarDomicilio(index: number): void {
		this.domicilios = this.domicilios.filter((_, i) => i !== index);
	}

	/**
	 * Qué hace: bloquea teclas no permitidas según FORMATO_CARACTERES del catálogo.
	 * Cómo: onKeyDown; guion de máscara DUI/NIT/NRC no lo teclea el usuario.
	 */
	onDocumentoValorKeyDown(doc: GenPersonaTipoDocumentoIdentidad, e: any): void {
		if (!doc) {
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
		if (key.length !== 1 || key === 'Dead') {
			return;
		}
		const formato = normalizarFormatoCaracteres(doc.FORMATO_CARACTERES);
		if (!teclaPermitidaPorFormato(key, formato)) {
			ev.preventDefault();
		}
	}

	// Qué hace: formatea en vivo según FORMATO_CARACTERES + máscara DUI/NIT/NRC si aplica.
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
			doc.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD,
			doc.FORMATO_CARACTERES
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
			doc.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD,
			doc.FORMATO_CARACTERES
		);
		if (doc.VALOR_DOCUMENTO !== formateado) {
			doc.VALOR_DOCUMENTO = formateado;
		}
		if (e?.component && e.component.option('value') !== formateado) {
			e.component.option('value', formateado);
		}
	}

	// Qué hace: maxLength del TextBox = cuerpo catálogo + guiones de máscara.
	maxLengthDocumento(doc: GenPersonaTipoDocumentoIdentidad): number | null {
		return maxLengthDocumentoIdentidad(
			doc?.NOMBRE_CORTO,
			doc?.ACTIVO_CARACTERES,
			Number(doc?.NUMERO_CARACTERES ?? 0),
			doc?.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD,
			doc?.FORMATO_CARACTERES
		);
	}

	etiquetaDocumento(doc: GenPersonaTipoDocumentoIdentidad): string {
		return doc?.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD || doc?.NOMBRE_CORTO || 'Documento';
	}

	// Qué hace: bloquea teclas fuera del formato. Teléfono nacional solo dígitos; email permite @ y punto.
	onContactoValorKeyDown(item: GenPersonaContacto, e: any): void {
		if (!item) {
			return;
		}
		const ev = e?.event as KeyboardEvent | undefined;
		if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) {
			return;
		}
		const key = ev.key || '';
		if (key.length !== 1 || key === 'Dead') {
			return;
		}
		if (esTelefonoNacional(item.NOMBRE_CORTO)) {
			const input = ev.target as HTMLInputElement | undefined;
			const inicio = input?.selectionStart ?? 0;
			if (input && input.value.startsWith('+503') && inicio < 5) {
				ev.preventDefault();
				input.setSelectionRange(input.value.length, input.value.length);
				return;
			}
			if (!/[0-9]/.test(key)) {
				ev.preventDefault();
			}
			return;
		}
		if (esEmailContacto(item.NOMBRE_CORTO)) {
			if (!/[A-Za-z0-9@._%+\-]/.test(key)) {
				ev.preventDefault();
			}
			return;
		}
		const formato = normalizarFormatoContacto(item.FORMATO_CARACTERES);
		if (!teclaPermitidaContacto(key, formato)) {
			ev.preventDefault();
		}
	}

	// Qué hace: aplica máscara o filtro al escribir el contacto.
	onContactoValorInput(item: GenPersonaContacto, e: any): void {
		this.aplicarValorContacto(item, e, true);
	}

	// Qué hace: sincroniza el valor al pegar, limpiar o salir del campo.
	onContactoValorChanged(item: GenPersonaContacto, e: any): void {
		this.aplicarValorContacto(item, e, false);
	}

	private aplicarValorContacto(item: GenPersonaContacto, e: any, desdeInput: boolean): void {
		if (!item) {
			return;
		}
		const input = e?.event?.target as HTMLInputElement | undefined;
		const raw = desdeInput
			? `${input?.value ?? e?.component?.option('text') ?? e?.component?.option('value') ?? ''}`
			: `${e?.value ?? ''}`;
		const formateado = aplicarFormatoContacto(
			item.NOMBRE_CORTO,
			raw,
			item.ACTIVO_CARACTERES,
			Number(item.NUMERO_CARACTERES ?? 0),
			item.FORMATO_CARACTERES
		);
		item.VALOR_CONTACTO = formateado;
		if (input && input.value !== formateado) {
			input.value = formateado;
		}
		if (e?.component && e.component.option('value') !== formateado) {
			e.component.option('value', formateado);
		}
		if (desdeInput && input && esTelefonoNacional(item.NOMBRE_CORTO)) {
			const colocarAlFinal = () => {
				if ((input.selectionStart ?? 0) < 5) {
					input.setSelectionRange(input.value.length, input.value.length);
				}
			};
			colocarAlFinal();
			setTimeout(colocarAlFinal, 0);
		}
	}

	maxLengthContacto(item: GenPersonaContacto): number | null {
		return maxLengthContactoCampo(item?.NOMBRE_CORTO, item?.ACTIVO_CARACTERES, Number(item?.NUMERO_CARACTERES ?? 0));
	}

	etiquetaContacto(item: GenPersonaContacto): string {
		return item?.NOMBRE_TIPO_CONTACTO || item?.NOMBRE_CORTO || 'Contacto';
	}

	private aplicarReglasPersonales(): void {
		this.aplicarReglaApellidoCasada();
		this.aplicarReglaTipoDiscapacidad();
		this.aplicarReglaExtranjero();
	}

	// Qué hace: convierte '' de selects/checks de dominio a null (el CHECK de BD no acepta '').
	// Cómo: clona el payload; si extranjero limpia depto/municipio/distrito (solo país).
	private sanitizarPersonaNaturalPayload(model: GenPersonaNatural | any): any {
		const vacioANull = (v: any) => (v === '' || v === undefined ? null : v);
		const payload: any = {
			...model,
			SEXO: vacioANull(model?.SEXO),
			ESTADO_CIVIL: vacioANull(model?.ESTADO_CIVIL),
			CARTA_PASTORAL: vacioANull(model?.CARTA_PASTORAL),
			DOMICILIADO: vacioANull(model?.DOMICILIADO),
			TIPO_DISCAPACIDAD: vacioANull(model?.TIPO_DISCAPACIDAD),
			APELLIDO_CASADA: vacioANull(model?.APELLIDO_CASADA),
		};

		if (!!model?.ES_EXTRANJERO) {
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

	/**
	 * Qué hace: controla lugar de nacimiento según ES_EXTRANJERO.
	 * Cómo: extranjero → países ≠ SV y solo país; nacional → solo SV + depto/municipio/distrito.
	 */
	private aplicarReglaExtranjero(): void {
		const esExtranjero = !!this.modelPersonaNatural?.ES_EXTRANJERO;

		if (esExtranjero) {
			if (this.editandoPersonalesForm) {
				this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
			}
			this.aplicarCatalogoPaisNacimiento();
			this.limpiarLookupsTerritorio();
			return;
		}

		// Nacional: solo El Salvador y cadena territorial completa.
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
	}

	/**
	 * Qué hace: arma el lookup de país según ES_EXTRANJERO.
	 * Cómo: nacional → solo SV y lo selecciona; extranjero → todos excepto SV.
	 */
	private aplicarCatalogoPaisNacimiento(forzarElSalvador = false): void {
		const catalogo = this.paisesNacimientoCatalogo ?? [];
		const esExtranjero = !!this.modelPersonaNatural?.ES_EXTRANJERO;

		if (!esExtranjero) {
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

		this.mCORR_PAIS_NACIMIENTO = catalogo.filter((p) => !this.esPaisElSalvador(p));
		const corrActual = Number(this.modelPersonaNatural.CORR_PAIS_NACIMIENTO ?? 0);
		if (corrActual > 0) {
			const seleccionado = catalogo.find((p) => Number(p?.CORR_PAIS) === corrActual);
			if (seleccionado && this.esPaisElSalvador(seleccionado) && this.editandoPersonalesForm) {
				this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = null;
			}
		}
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
		this.getCORR_PARENTESCO();
		this.getCORR_TIPO_CONTACTO();
		this.getNIVEL_DOMINIO();
		this.getSEXO();
		this.getESTADO_CIVIL();
		this.getSI_NO();
		this.getNIVEL_ACADEMICO();
		this.getESTADO_NIP();
		this.getCORR_AFP();
		this.getCORR_SEGURO_SOCIAL();
		this.getESTADO_CONTRATO();
		this.getCORR_UNIDAD_PUESTO();
		this.getCORR_TIPO_CONTRATACION_PUESTO();
		this.getCORR_TIPO_MODALIDAD_PUESTO();
	}

	private refrescarTerritorioDesdeModelo(): void {
		const pais = this.modelPersonaNatural.CORR_PAIS_NACIMIENTO;
		if (!pais || !!this.modelPersonaNatural?.ES_EXTRANJERO) {
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

	private getCORR_PARENTESCO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_PARENTESCO', 'GetCORR_PARENTESCO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? response.Data ?? [] : [];
					this.mCORR_PARENTESCO = (rows ?? []).filter(
						(p: any) => p?.ACTIVO_PARENTESCO === true || p?.ACTIVO_PARENTESCO === 1 || p?.ACTIVO_PARENTESCO == null
					);
				},
			});
	}

	// Qué hace: carga tipos de contacto activos para el tab Contactos.
	// Cómo: lookup GetCORR_TIPO_CONTACTO_GEN_EMPLEADO; el usuario ve solo el nombre del tipo.
	private getCORR_TIPO_CONTACTO(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_TIPO_CONTACTO',
				'GetCORR_TIPO_CONTACTO',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_CONTACTO = response?.Result ? response.Data ?? [] : [];
					this.sincronizarTiposParentescoContactoVisibles();
				},
			});
	}

	// Qué hace: carga niveles de dominio (Básico/Intermedio/Avanzado) para idiomas y competencias.
	// Cómo: lookup GEN_LISTA GetNIVEL_DOMINIO → items Key/Value en mNIVEL_DOMINIO.
	private getNIVEL_DOMINIO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_LISTA', 'GetNIVEL_DOMINIO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mNIVEL_DOMINIO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga sexo (MASCULINO/FEMENINO) desde GEN_LISTA.
	private getSEXO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_LISTA', 'GetSEXO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mSEXO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga estado civil desde GEN_LISTA (valores del CHECK).
	private getESTADO_CIVIL(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_LISTA', 'GetESTADO_CIVIL', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mESTADO_CIVIL = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga SI/NO desde GEN_LISTA (domiciliado, carta pastoral).
	private getSI_NO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_LISTA', 'GetSI_NO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mSI_NO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga niveles académicos para formación desde GEN_LISTA.
	private getNIVEL_ACADEMICO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_LISTA', 'GetNIVEL_ACADEMICO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mNIVEL_ACADEMICO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga ESTADO_NIP (CHECK GEN_EMPLEADO) desde GEN_LISTA.
	private getESTADO_NIP(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_LISTA', 'GetESTADO_NIP', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mESTADO_NIP = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga estados de contrato desde GEN_LISTA para badge y filtro del tab Contratos.
	// Cómo lo hace: invoca GEN_LISTA/GetESTADO_CONTRATO_GEN_EMPLEADO → Key/Value en mESTADO_CONTRATO.
	private getESTADO_CONTRATO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_LISTA', 'GetESTADO_CONTRATO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mESTADO_CONTRATO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga catálogo AFP activo para personales.
	private getCORR_AFP(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'PLA_AFP', 'GetCORR_AFP', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_AFP = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga catálogo Seguro Social activo para personales.
	private getCORR_SEGURO_SOCIAL(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'PLA_SEGURO_SOCIAL',
				'GetCORR_SEGURO_SOCIAL',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_SEGURO_SOCIAL = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga unidades del organigrama para asignar el puesto.
	// Cómo: GetLookUp GetCORR_UNIDAD_GEN_EMPLEADO.
	private getCORR_UNIDAD_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_UNIDAD = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga los puestos asociados a la unidad elegida.
	// Cómo: GetLookUp GEN_UNIDADES_PUESTO GetCORR_PUESTO con CORR_UNIDAD.
	private cargarPuestosDeUnidad(corrUnidad: number | null | undefined): void {
		const corr = Number(corrUnidad ?? 0);
		if (corr <= 0) {
			this.mCORR_PUESTO = [];
			return;
		}

		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_UNIDADES_PUESTO',
				'GetCORR_PUESTO',
				[{ Parameter: 'CORR_UNIDAD', Value: corr }],
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (Number(this.submodalPuestoDraft?.CORR_UNIDAD ?? 0) !== corr) {
						return;
					}
					const rows = response?.Result ? response.Data ?? [] : [];
					const ocupados = this.puestosYaAsignadosEnUnidad(corr);
					this.mCORR_PUESTO = rows
						.map((item: any) => ({
							CORR_PUESTO: Number(item.CORR_PUESTO),
							NOMBRE_PUESTO: `${item.NOMBRE_PUESTO ?? ''}`.trim(),
							CORR_UNIDAD: Number(item.CORR_UNIDAD ?? corr),
						}))
						.filter((item: any) => !ocupados.has(Number(item.CORR_PUESTO)));
				},
				error: () => {
					if (Number(this.submodalPuestoDraft?.CORR_UNIDAD ?? 0) === corr) {
						this.mCORR_PUESTO = [];
					}
				},
			});
	}

	// Qué hace: puestos que este empleado ya tiene en la unidad.
	// Cómo: omite la fila que se está editando para que su puesto siga en el combo.
	private puestosYaAsignadosEnUnidad(corrUnidad: number): Set<number> {
		const ocupados = new Set<number>();
		(this.puestos ?? []).forEach((p, idx) => {
			if (idx === this.submodalPuestoEditIndex) {
				return;
			}
			if (Number(p.CORR_UNIDAD) === corrUnidad) {
				ocupados.add(Number(p.CORR_PUESTO));
			}
		});
		return ocupados;
	}

	// Qué hace: al cambiar la unidad, vacía el puesto y pide los de esa unidad.
	// Cómo: ignora el mismo valor; solo limpia el puesto si había otra unidad antes.
	onUnidadPuestoChanged(e: any): void {
		const nuevo = Number(e?.value ?? 0);
		const anterior = Number(e?.previousValue ?? 0);
		if (nuevo === anterior) {
			return;
		}
		if (anterior > 0) {
			this.submodalPuestoDraft.CORR_PUESTO = null as any;
		}
		this.cargarPuestosDeUnidad(nuevo);
	}

	// Qué hace: carga tipos de contratación para el puesto del empleado.
	// Cómo: GetLookUp GetCORR_TIPO_CONTRATACION_GEN_EMPLEADO.
	private getCORR_TIPO_CONTRATACION_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'SC_TIPO_CONTRATACION',
				'GetCORR_TIPO_CONTRATACION',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_CONTRATACION = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: carga tipos de modalidad para el puesto del empleado.
	// Cómo: GetLookUp GetCORR_TIPO_MODALIDAD_GEN_EMPLEADO.
	private getCORR_TIPO_MODALIDAD_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'SC_TIPO_MODALIDAD',
				'GetCORR_TIPO_MODALIDAD',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_MODALIDAD = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	get tituloSubmodalPuesto(): string {
		return this.submodalPuestoEditIndex != null ? 'Editar puesto' : 'Asignar puesto';
	}

	// Qué hace: fecha de hoy en El Salvador para el ingreso.
	// Cómo: calendario America/El_Salvador, a mediodía local para que el date-box no reste un día.
	private fechaHoyElSalvador(): Date {
		const iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/El_Salvador' }).format(new Date());
		const [anio, mes, dia] = iso.split('-').map((n) => Number(n));
		return new Date(anio, mes - 1, dia, 12, 0, 0);
	}

	abrirSubmodalPuestoNuevo(): void {
		if (!this.tienePersonaBase) {
			this.notifyFx('Primero debe guardar el empleado.', NotifyType.Warning);
			return;
		}
		this.submodalPuestoEditIndex = null;
		this.mCORR_PUESTO = [];
		this.submodalPuestoDraft = {
			CORR_UNIDAD: null as any,
			CORR_PUESTO: null as any,
			FECHA_INGRESO: this.fechaHoyElSalvador() as any,
			SUELDO: null,
			CORR_TIPO_CONTRATACION: null,
			CORR_TIPO_MODALIDAD: null,
		};
		this.submodalPuestoVisible = true;
	}

	abrirSubmodalPuestoEditar(index: number): void {
		const actual = this.puestos[index];
		if (!actual) {
			return;
		}
		this.submodalPuestoEditIndex = index;
		const iso = this.normalizarFechaIngreso(actual.FECHA_INGRESO);
		this.submodalPuestoDraft = {
			...actual,
			FECHA_INGRESO: (iso ? this.fechaDesdeIso(iso) : this.fechaHoyElSalvador()) as any,
		};
		this.cargarPuestosDeUnidad(actual.CORR_UNIDAD);
		this.submodalPuestoVisible = true;
	}

	cerrarSubmodalPuesto(): void {
		this.submodalPuestoVisible = false;
		this.submodalPuestoEditIndex = null;
		this.submodalPuestoDraft = {};
		this.mCORR_PUESTO = [];
	}

	// Qué hace: exige los datos del puesto al agregar y al editar.
	// Cómo: unidad, puesto, fecha, sueldo y ambos tipos deben venir informados.
	private puestoCompleto(p: Partial<GenEmpleadoPuesto> | null | undefined): boolean {
		return (
			Number(p?.CORR_UNIDAD ?? 0) > 0 &&
			Number(p?.CORR_PUESTO ?? 0) > 0 &&
			!!this.normalizarFechaIngreso(p?.FECHA_INGRESO) &&
			p?.SUELDO != null &&
			!Number.isNaN(Number(p.SUELDO)) &&
			Number(p?.CORR_TIPO_CONTRATACION ?? 0) > 0 &&
			Number(p?.CORR_TIPO_MODALIDAD ?? 0) > 0
		);
	}

	// Qué hace: indica si ese tipo de contratación es permanente.
	// Cómo: usa ES_PERMANENTE del lookup SC_TIPO_CONTRATACION.
	private esTipoContratacionPermanente(corrTipo: number | null | undefined): boolean {
		const corr = Number(corrTipo ?? 0);
		if (corr <= 0) {
			return false;
		}
		const item = (this.mCORR_TIPO_CONTRATACION ?? []).find(
			(x) => Number(x?.CORR_TIPO_CONTRATACION) === corr
		);
		return item?.ES_PERMANENTE === true || item?.ES_PERMANENTE === 1;
	}

	// Qué hace: impide un segundo puesto permanente en el mismo empleado.
	// Cómo: compara el tipo elegido con los demás puestos ya cargados en memoria.
	private hayOtroPuestoPermanente(exceptoIndex: number | null, corrTipo: number | null): boolean {
		if (!this.esTipoContratacionPermanente(corrTipo)) {
			return false;
		}
		return this.puestos.some(
			(p, idx) =>
				idx !== exceptoIndex &&
				p.ACTIVO_PUESTO !== false &&
				this.esTipoContratacionPermanente(p.CORR_TIPO_CONTRATACION)
		);
	}

	guardarSubmodalPuesto(): void {
		const corrUnidad = Number(this.submodalPuestoDraft?.CORR_UNIDAD ?? 0);
		const corrPuesto = Number(this.submodalPuestoDraft?.CORR_PUESTO ?? 0);
		if (corrUnidad <= 0 || corrPuesto <= 0) {
			this.notifyFx('Seleccione la unidad y el puesto.', NotifyType.Warning);
			return;
		}
		const duplicado = this.puestos.some(
			(p, idx) =>
				idx !== this.submodalPuestoEditIndex &&
				Number(p.CORR_UNIDAD) === corrUnidad &&
				Number(p.CORR_PUESTO) === corrPuesto
		);
		if (duplicado) {
			this.notifyFx('Ese empleado ya tiene asignado ese puesto en esa unidad.', NotifyType.Warning);
			return;
		}
		const tipoContratacionPrevio = Number(this.submodalPuestoDraft?.CORR_TIPO_CONTRATACION ?? 0);
		const quedaraActivo =
			this.submodalPuestoEditIndex == null ||
			this.puestos[this.submodalPuestoEditIndex]?.ACTIVO_PUESTO !== false;
		if (quedaraActivo && this.hayOtroPuestoPermanente(this.submodalPuestoEditIndex, tipoContratacionPrevio)) {
			this.notifyFx('El empleado solo puede tener un puesto de tipo permanente.', NotifyType.Warning);
			return;
		}
		const sueldoRaw = this.submodalPuestoDraft?.SUELDO;
		const sueldo =
			sueldoRaw == null || `${sueldoRaw}` === '' || Number.isNaN(Number(sueldoRaw))
				? null
				: Number(sueldoRaw);
		const fechaIngreso = this.normalizarFechaIngreso(this.submodalPuestoDraft?.FECHA_INGRESO);
		const tipoContratacion = Number(this.submodalPuestoDraft?.CORR_TIPO_CONTRATACION ?? 0);
		const tipoModalidad = Number(this.submodalPuestoDraft?.CORR_TIPO_MODALIDAD ?? 0);
		if (!fechaIngreso) {
			this.notifyFx('Seleccione la fecha de ingreso.', NotifyType.Warning);
			return;
		}
		if (sueldo == null) {
			this.notifyFx('Ingrese el sueldo.', NotifyType.Warning);
			return;
		}
		if (sueldo < 0) {
			this.notifyFx('El sueldo no puede ser negativo.', NotifyType.Warning);
			return;
		}
		if (tipoContratacion <= 0) {
			this.notifyFx('Seleccione el tipo de contratación.', NotifyType.Warning);
			return;
		}
		if (tipoModalidad <= 0) {
			this.notifyFx('Seleccione el tipo de modalidad.', NotifyType.Warning);
			return;
		}
		const previo =
			this.submodalPuestoEditIndex != null ? this.puestos[this.submodalPuestoEditIndex] : null;
		const row: GenEmpleadoPuesto = {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_EMPLEADO: Number(this.model?.CORR_EMPLEADO ?? 0),
			ACTIVO_PUESTO: previo ? previo.ACTIVO_PUESTO !== false : true,
			FECHA_FIN: previo?.ACTIVO_PUESTO === false ? previo.FECHA_FIN ?? null : null,
			CORR_EMPLEADO_PUESTO_HISTORIAL: previo?.CORR_EMPLEADO_PUESTO_HISTORIAL ?? 0,
			CORR_UNIDAD: corrUnidad,
			NOMBRE_UNIDAD: this.nombreCatalogo(
				this.mCORR_UNIDAD,
				'CORR_UNIDAD',
				corrUnidad,
				'NOMBRE_UNIDAD'
			),
			CORR_PUESTO: corrPuesto,
			NOMBRE_PUESTO: this.nombreCatalogo(this.mCORR_PUESTO, 'CORR_PUESTO', corrPuesto, 'NOMBRE_PUESTO'),
			FECHA_INGRESO: fechaIngreso,
			SUELDO: sueldo,
			CORR_TIPO_CONTRATACION: tipoContratacion,
			NOMBRE_TIPO_CONTRATACION:
				tipoContratacion > 0
					? this.nombreCatalogo(
						this.mCORR_TIPO_CONTRATACION,
						'CORR_TIPO_CONTRATACION',
						tipoContratacion,
						'NOMBRE_TIPO_CONTRATACION'
					)
					: '',
			CORR_TIPO_MODALIDAD: tipoModalidad,
			MODALIDAD_NOMBRE:
				tipoModalidad > 0
					? this.nombreCatalogo(
						this.mCORR_TIPO_MODALIDAD,
						'CORR_TIPO_MODALIDAD',
						tipoModalidad,
						'MODALIDAD_NOMBRE'
					)
					: '',
		};
		if (this.submodalPuestoEditIndex != null) {
			this.puestos = this.puestos.map((p, idx) => (idx === this.submodalPuestoEditIndex ? row : p));
		} else {
			this.puestos = [...this.puestos, row];
		}
		this.cerrarSubmodalPuesto();
	}

	// Qué hace: quita un puesto activo agregado por error.
	// Cómo: lo saca de la lista; al guardar se borra el activo y su historial, sin dejar el card inactivo.
	eliminarPuesto(index: number): void {
		const row = this.puestos[index];
		if (!row || row.ACTIVO_PUESTO === false) {
			return;
		}
		this.puestos = this.puestos.filter((_, i) => i !== index);
	}

	// Qué hace: apaga o enciende el puesto en memoria. Se guarda con Guardar cambios.
	// Cómo: al apagar conserva el ingreso y marca el fin de hoy; al encender abre ingreso de hoy.
	toggleActivoPuesto(index: number, event?: Event): void {
		event?.stopPropagation();
		const row = this.puestos[index];
		if (!row) {
			return;
		}
		const activar = row.ACTIVO_PUESTO === false;
		if (activar && this.hayOtroPuestoPermanente(index, row.CORR_TIPO_CONTRATACION)) {
			this.notifyFx('El empleado solo puede tener un puesto de tipo permanente.', NotifyType.Warning);
			return;
		}
		const hoy = this.normalizarFechaIngreso(this.fechaHoyElSalvador());
		this.puestos = this.puestos.map((p, i) => {
			if (i !== index) {
				return p;
			}
			if (activar) {
				return { ...p, ACTIVO_PUESTO: true, FECHA_INGRESO: hoy, FECHA_FIN: null };
			}
			return { ...p, ACTIVO_PUESTO: false, FECHA_FIN: hoy };
		});
	}

	resumenPuesto(item: GenEmpleadoPuesto): string {
		const periodo =
			item?.ACTIVO_PUESTO === false && item?.FECHA_FIN
				? `${this.textoFechaIngreso(item.FECHA_INGRESO)} – ${this.textoFechaIngreso(item.FECHA_FIN)}`
				: this.textoFechaIngreso(item?.FECHA_INGRESO);
		const partes = [
			this.textoLectura(item?.NOMBRE_TIPO_CONTRATACION),
			this.textoLectura(item?.MODALIDAD_NOMBRE),
			this.textoSueldo(item?.SUELDO),
			periodo,
		].filter((t) => t && t !== '—');
		return partes.join(' · ') || '—';
	}

	textoFechaIngreso(valor: any): string {
		const iso = this.normalizarFechaIngreso(valor);
		if (!iso) {
			return '—';
		}
		const [anio, mes, dia] = iso.split('-');
		return `${dia}/${mes}/${anio}`;
	}

	textoSueldo(valor: any): string {
		if (valor == null || valor === '') {
			return '—';
		}
		const n = Number(valor);
		if (Number.isNaN(n)) {
			return '—';
		}
		return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
	}

	/**
	 * Qué hace: persiste puestos del empleado si cambiaron.
	 * Cómo: SaveAll; parchea response.Data en memoria (sin GetAll).
	 */
	private guardarPuestosDesdeModal(onSuccess?: () => void): void {
		const incompleto = (this.puestos ?? []).some((p) => !this.puestoCompleto(p));
		if (incompleto) {
			this.notifyFx(
				'Complete unidad, puesto, fecha de ingreso, sueldo, tipo de contratación y tipo de modalidad.',
				NotifyType.Warning
			);
			return;
		}
		const permanentes = (this.puestos ?? []).filter(
			(p) => p.ACTIVO_PUESTO !== false && this.esTipoContratacionPermanente(p.CORR_TIPO_CONTRATACION)
		).length;
		if (permanentes > 1) {
			this.notifyFx('El empleado solo puede tener un puesto de tipo permanente.', NotifyType.Warning);
			return;
		}
		if (!this.cambioRespectoA(this.puestos, this.puestosOriginal)) {
			onSuccess?.();
			return;
		}
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (corrEmpleado <= 0) {
			this.notifyFx('No se encontró CORR_EMPLEADO del empleado.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.savePuestos(corrEmpleado, this.puestos)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const rows = this.normalizarPuestos(response.Data ?? this.puestos);
					this.puestos = rows;
					this.puestosOriginal = this.clonarPuestos(rows);
					onSuccess?.();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private cargarPuestos(): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (corrEmpleado <= 0) {
			this.puestos = [];
			this.puestosOriginal = [];
			return;
		}

		this.service
			.getPuestos(corrEmpleado)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarPuestos(response.Data ?? []) : [];
					this.puestos = rows;
					this.puestosOriginal = this.clonarPuestos(rows);
				},
				error: () => {
					this.puestos = [];
					this.puestosOriginal = [];
				},
			});
	}

	// Qué hace: carga los descriptores ya asignados al empleado.
	// Cómo lo hace: GetPorEmpleado al abrir el detalle; no vuelve a consultar después de guardar.
	private cargarDescriptoresEmpleado(): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (corrEmpleado <= 0) {
			this.descriptoresAsignados = [];
			this.descriptorImpresionKeys = [];
			this.popupDescriptorEmpleadoVisible = false;
			return;
		}

		this.service
			.getDescriptoresEmpleado(corrEmpleado)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.descriptoresAsignados = response?.Result
						? (response.Data ?? []).map((item: ScDescriptorAsignadoEmpleado) => this.mapDescriptorAsignado(item))
						: [];
					this.conservarSeleccionDescriptorImpresion();
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	// Qué hace: abre el modal de descriptores que aplican al empleado.
	// Cómo lo hace: deja fuera los que ya están asignados a este empleado.
	abrirAsignarDescriptores(): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (!this.puedeAsignarDescriptores || this.cargandoDescriptores) {
			return;
		}
		if (corrEmpleado <= 0) {
			this.notifyFx('Guarde el empleado para asignar descriptores.', NotifyType.Warning);
			return;
		}

		this.descriptorModalPageSize = 50;
		this.cargandoDescriptores = true;
		this.service
			.getDescriptoresDisponiblesEmpleado(corrEmpleado)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.cargandoDescriptores = false;
					if (!response?.Result) {
						this.notifyFx(response?.ErrorMessage || 'No se pudieron consultar los descriptores.', NotifyType.Warning);
						return;
					}
					const asignados = new Set(this.descriptoresAsignados.map((item) => item.CORR_DESCRIPTOR_PUESTO));
					this.descriptoresDisponibles = (response.Data ?? [])
						.filter((item: ScDescriptorAsignadoEmpleado) => !asignados.has(Number(item?.CORR_DESCRIPTOR_PUESTO)))
						.map((item: ScDescriptorAsignadoEmpleado) => ({
							...this.mapDescriptorAsignado(item),
							SELECCION: false,
						}));
					this.popupDescriptorEmpleadoVisible = true;
				},
				error: (error) => {
					this.cargandoDescriptores = false;
					this.notifyFx(this.textoErrorDescriptorEmpleado(error), NotifyType.Warning);
				},
			});
	}

	// Qué hace: con 5 o 10 filas la tabla se encoge; con más, mantiene altura y scroll.
	// Cómo lo hace: deja espacio para el título, los botones y el paginador dentro de la pantalla.
	get alturaDescriptorEmpleadoModal(): string {
		return this.descriptorModalPageSize <= 10 ? 'auto' : 'calc(100vh - 300px)';
	}

	// Qué hace: actualiza la altura cuando cambia el tamaño de página del modal.
	// Cómo lo hace: reaplica la altura en la grilla para que el paginador no quede fuera.
	onDescriptorEmpleadoModalOptionChanged(e: any): void {
		if (e?.fullName !== 'paging.pageSize' || !(Number(e.value) > 0)) {
			return;
		}
		this.descriptorModalPageSize = Number(e.value);
		const altura = this.alturaDescriptorEmpleadoModal;
		setTimeout(() => {
			e.component?.option('height', altura);
			e.component?.updateDimensions?.();
			this.popupDescriptoresEmpleado?.instance?.repaint();
		});
	}

	cerrarAsignarDescriptores(): void {
		if (this.cargandoDescriptores) {
			this.popupDescriptorEmpleadoVisible = true;
			return;
		}
		this.popupDescriptorEmpleadoVisible = false;
		this.descriptoresDisponibles = [];
	}

	// Qué hace: marca o quita la marca de todos los descriptores del modal.
	selectTodosDescriptores(marcar: boolean): void {
		this.descriptoresDisponibles = (this.descriptoresDisponibles ?? []).map((item) => ({
			...item,
			SELECCION: marcar,
		}));
	}

	// Qué hace: asigna los marcados y quita los que se desmarcaron.
	// Cómo lo hace: inserta o elimina uno por uno y parchea la grilla en memoria.
	guardarDescriptoresMarcados(): void {
		if (!this.puedeAsignarDescriptores || this.cargandoDescriptores) {
			return;
		}
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		const lista = this.descriptoresDisponibles ?? [];
		if (!lista.length) {
			this.notifyFx('No hay descriptores para asignar.', NotifyType.Warning);
			return;
		}

		const asignados = new Set(this.descriptoresAsignados.map((item) => item.CORR_DESCRIPTOR_PUESTO));
		const operaciones = [
			...lista
				.filter((item) => !!item.SELECCION && !asignados.has(item.CORR_DESCRIPTOR_PUESTO))
				.map((descriptor) => ({ tipo: 'insert' as const, descriptor })),
			...lista
				.filter((item) => !item.SELECCION && asignados.has(item.CORR_DESCRIPTOR_PUESTO))
				.map((descriptor) => ({ tipo: 'delete' as const, descriptor })),
		];
		if (!operaciones.length) {
			this.notifyFx('Cambios guardados con exito!', NotifyType.Success, { raw: true });
			this.popupDescriptorEmpleadoVisible = false;
			this.descriptoresDisponibles = [];
			return;
		}

		this.cargandoDescriptores = true;
		from(operaciones)
			.pipe(
				concatMap((op) => {
					const request$ =
						op.tipo === 'insert'
							? this.service.asignarDescriptorEmpleado(op.descriptor.CORR_DESCRIPTOR_PUESTO, corrEmpleado)
							: this.service.quitarDescriptorEmpleado(op.descriptor.CORR_DESCRIPTOR_PUESTO, corrEmpleado);
					return request$.pipe(
						take(1),
						catchError((error) =>
							of({
								Result: false,
								ErrorMessage: this.textoErrorDescriptorEmpleado(
									error,
									op.tipo === 'insert'
										? 'No se pudo asignar el descriptor.'
										: 'No se pudo quitar el descriptor.'
								),
							})
						),
						map((response: any) => ({ ...response, _tipo: op.tipo, _descriptor: op.descriptor }))
					);
				}),
				toArray()
			)
			.subscribe({
				next: (responses: any[]) => {
					this.cargandoDescriptores = false;
					const ok = responses.filter((item) => item?.Result);
					const fail = responses.filter((item) => !item?.Result);
					let insertOk = 0;
					let deleteOk = 0;
					for (const response of ok) {
						if (response._tipo === 'insert') {
							const fila = this.mapDescriptorAsignado(response._descriptor);
							if (!this.descriptoresAsignados.some((item) => item.CORR_DESCRIPTOR_PUESTO === fila.CORR_DESCRIPTOR_PUESTO)) {
								this.descriptoresAsignados = [...this.descriptoresAsignados, fila].sort((a, b) =>
									(a.NOMBRE_PUESTO ?? '').localeCompare(b.NOMBRE_PUESTO ?? '')
								);
							}
							insertOk += 1;
						} else {
							const corr = Number(response._descriptor?.CORR_DESCRIPTOR_PUESTO);
							this.descriptoresAsignados = this.descriptoresAsignados.filter(
								(item) => item.CORR_DESCRIPTOR_PUESTO !== corr
							);
							deleteOk += 1;
						}
					}
					if (insertOk > 0 || deleteOk > 0) {
						const partes: string[] = [];
						if (insertOk > 0) {
							partes.push(insertOk === 1 ? '1 descriptor asignado' : `${insertOk} descriptores asignados`);
						}
						if (deleteOk > 0) {
							partes.push(deleteOk === 1 ? '1 descriptor quitado' : `${deleteOk} descriptores quitados`);
						}
						this.notifyFx(partes.join('. ') + '.', NotifyType.Success, { raw: true });
					}
					if (fail.length > 0) {
						const msg = fail
							.map((item) => item?.ErrorMessage)
							.filter((texto) => !!texto)
							.filter((texto, index, lista) => lista.indexOf(texto) === index)
							.join(' ');
						this.notifyFx(msg || 'Algunos descriptores no se pudieron actualizar.', NotifyType.Warning);
						const siguen = new Set(this.descriptoresAsignados.map((item) => item.CORR_DESCRIPTOR_PUESTO));
						this.gridDescriptoresEmpleado?.instance?.cancelEditData?.();
						this.descriptoresDisponibles = this.descriptoresDisponibles.map((item) => ({
							...item,
							SELECCION: siguen.has(item.CORR_DESCRIPTOR_PUESTO),
						}));
						setTimeout(() => this.gridDescriptoresEmpleado?.instance?.refresh?.());
						return;
					}
					this.popupDescriptorEmpleadoVisible = false;
					this.descriptoresDisponibles = [];
				},
				error: (error) => {
					this.cargandoDescriptores = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: quita un descriptor asignado desde la grilla.
	// Cómo lo hace: elimina el vínculo y lo saca de la grilla en memoria.
	// Qué hace: pinta de verde el estado Activo del descriptor.
	// Cómo lo hace: compara el nombre del estado sin distinguir mayúsculas.
	esEstadoDescriptorActivo(nombre: string | null | undefined): boolean {
		return (nombre ?? '').trim().toUpperCase() === 'ACTIVO';
	}

	// Qué hace: pinta de rojo el estado Inactivo del descriptor.
	// Cómo lo hace: compara el nombre del estado sin distinguir mayúsculas.
	esEstadoDescriptorInactivo(nombre: string | null | undefined): boolean {
		return (nombre ?? '').trim().toUpperCase() === 'INACTIVO';
	}

	// Qué hace: activa o inactiva la carga del descriptor seleccionado.
	// Cómo lo hace: actualiza el bit y parchea la fila en memoria con la respuesta.
	cambiarActivoCargaDescriptor(activo: boolean): void {
		const fila = this.descriptorSeleccionado;
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		const corrDescriptor = Number(fila?.CORR_DESCRIPTOR_PUESTO);
		if (!this.puedeAsignarDescriptores || !corrEmpleado || !corrDescriptor || this.cargandoDescriptores) {
			return;
		}
		if (activo && !this.esEstadoDescriptorActivo(fila?.NOMBRE_ESTADO)) {
			return;
		}

		this.cargandoDescriptores = true;
		this.service
			.cambiarActivoDescriptorEmpleado(corrDescriptor, corrEmpleado, activo)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.cargandoDescriptores = false;
					if (!response?.Result) {
						this.notifyFx(response?.ErrorMessage || 'No se pudo actualizar la carga.', NotifyType.Warning);
						return;
					}
					const bit = response?.Data?.ACTIVO_DESCRIPTOR_PUESTO_EMPLEADO ?? activo;
					this.descriptoresAsignados = this.descriptoresAsignados.map((item) =>
						Number(item.CORR_DESCRIPTOR_PUESTO) === corrDescriptor
							? { ...item, ACTIVO_DESCRIPTOR_PUESTO_EMPLEADO: bit }
							: item
					);
					this.notifyFx(activo ? 'Carga activada.' : 'Carga inactivada.', NotifyType.Success, { raw: true });
				},
				error: (error) => {
					this.cargandoDescriptores = false;
					this.notifyFx(this.textoErrorDescriptorEmpleado(error, 'No se pudo actualizar la carga.'), NotifyType.Warning);
				},
			});
	}

	quitarDescriptorAsignado(row: ScDescriptorAsignadoEmpleado): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		const corrDescriptor = Number(row?.CORR_DESCRIPTOR_PUESTO);
		if (!this.puedeAsignarDescriptores || !corrEmpleado || !corrDescriptor) {
			return;
		}

		this.cargandoDescriptores = true;
		this.service
			.quitarDescriptorEmpleado(corrDescriptor, corrEmpleado)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.cargandoDescriptores = false;
					if (!response?.Result) {
						this.notifyFx(response?.ErrorMessage || 'No se pudo quitar el descriptor.', NotifyType.Warning);
						return;
					}
					this.descriptoresAsignados = this.descriptoresAsignados.filter(
						(item) => item.CORR_DESCRIPTOR_PUESTO !== corrDescriptor
					);
					this.conservarSeleccionDescriptorImpresion();
				},
				error: (error) => {
					this.cargandoDescriptores = false;
					this.notifyFx(this.textoErrorDescriptorEmpleado(error, 'No se pudo quitar el descriptor.'), NotifyType.Warning);
				},
			});
	}

	private mapDescriptorAsignado(item: ScDescriptorAsignadoEmpleado): ScDescriptorAsignadoEmpleado {
		return {
			CORR_DESCRIPTOR_PUESTO: Number(item?.CORR_DESCRIPTOR_PUESTO ?? 0),
			CORR_EMPLEADO: Number(item?.CORR_EMPLEADO ?? this.model?.CORR_EMPLEADO ?? 0),
			CODIGO_DESCRIPTOR_PUESTO: item?.CODIGO_DESCRIPTOR_PUESTO ?? '',
			NOMBRE_PUESTO: item?.NOMBRE_PUESTO ?? '',
			NOMBRE_UNIDAD: item?.NOMBRE_UNIDAD ?? '',
			FECHA_EMISION: item?.FECHA_EMISION ?? null,
			CORR_ESTADO: item?.CORR_ESTADO ?? null,
			NOMBRE_ESTADO: item?.NOMBRE_ESTADO ?? '',
			FORMATO: item?.FORMATO ?? '',
			ACTIVO_DESCRIPTOR_PUESTO_EMPLEADO: item?.ACTIVO_DESCRIPTOR_PUESTO_EMPLEADO ?? null,
		};
	}

	// Qué hace: guarda el descriptor marcado en la grilla del empleado.
	// Cómo lo hace: deja una sola llave, la del CORR_DESCRIPTOR_PUESTO.
	onDescriptorImpresionSeleccionado(e: { selectedRowKeys?: number[] }): void {
		const keys = e?.selectedRowKeys ?? [];
		this.descriptorImpresionKeys = keys.length ? [Number(keys[0])] : [];
	}

	// Qué hace: abre el PDF formato corto del descriptor seleccionado.
	// Cómo lo hace: lo pide para el empleado abierto y lo muestra en el popup.
	imprimirDescriptorCorto(): void {
		this.imprimirDescriptor('corto');
	}

	// Qué hace: abre el PDF formato extenso del descriptor seleccionado.
	// Cómo lo hace: lo pide para el empleado abierto y lo muestra en el popup.
	imprimirDescriptorExtenso(): void {
		this.imprimirDescriptor('extenso');
	}

	// Qué hace: valida la selección y pide el PDF del formato indicado.
	// Cómo lo hace: usa el CORR_EMPLEADO del empleado abierto, no el de otra persona.
	private imprimirDescriptor(formato: 'corto' | 'extenso'): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		const corrDescriptor = this.corrDescriptorImpresion();
		if (corrEmpleado <= 0 || corrDescriptor <= 0) {
			this.notifyFx('Seleccione un descriptor para imprimir.', NotifyType.Warning);
			return;
		}
		if (!this.esEstadoDescriptorActivo(this.descriptorSeleccionado?.NOMBRE_ESTADO)) {
			this.notifyFx('Solo se puede imprimir cuando el descriptor esta Activo.', NotifyType.Warning);
			return;
		}
		if (!this.esCargaAsignacionActiva(this.descriptorSeleccionado?.ACTIVO_DESCRIPTOR_PUESTO_EMPLEADO)) {
			this.notifyFx('Solo se puede imprimir cuando la carga del descriptor esta activa.', NotifyType.Warning);
			return;
		}
		if (formato === 'corto' && !this.esFormatoCortoDescriptor) {
			this.notifyFx('El descriptor no esta configurado como Formato corto.', NotifyType.Warning);
			return;
		}
		if (formato === 'extenso' && !this.esFormatoExtensoDescriptor) {
			this.notifyFx('El descriptor no esta configurado como Formato extenso.', NotifyType.Warning);
			return;
		}

		this.tituloPdfDescriptor =
			formato === 'corto' ? 'Descriptor de Puesto - Formato corto' : 'Descriptor de Puesto - Formato extenso';
		const peticion =
			formato === 'corto'
				? this.service.getPDFDescriptorCorto(corrDescriptor, corrEmpleado)
				: this.service.getPDFDescriptorExtenso(corrDescriptor, corrEmpleado);
		this.mostrarPdfDescriptor(peticion);
	}

	// Qué hace: muestra el PDF del descriptor en pantalla.
	// Cómo lo hace: crea una URL del blob y abre el popup.
	private mostrarPdfDescriptor(peticion: Observable<Blob>): void {
		this.loadingVisible = true;
		peticion.pipe(take(1)).subscribe({
			next: (pdf: Blob) => {
				this.loadingVisible = false;
				if (!pdf?.size) {
					this.notifyFx('No se recibio el PDF del descriptor.', NotifyType.Error);
					return;
				}
				this.PDFDescriptor = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(pdf));
				this.popupVisiblePdfDescriptor = true;
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyFx(this.textoErrorDescriptorEmpleado(error, 'Error al generar PDF'), NotifyType.Error);
			},
		});
	}

	// Qué hace: correlativo del descriptor marcado para el PDF.
	// Cómo lo hace: lee la primera llave seleccionada.
	private corrDescriptorImpresion(): number {
		return Number(this.descriptorImpresionKeys?.[0] ?? 0);
	}

	// Qué hace: suelta la selección si ese descriptor ya no está en la grilla.
	// Cómo lo hace: compara la llave con los descriptores asignados.
	private conservarSeleccionDescriptorImpresion(): void {
		const corr = this.corrDescriptorImpresion();
		if (corr <= 0) {
			return;
		}
		if (!this.descriptoresAsignados.some((item) => Number(item.CORR_DESCRIPTOR_PUESTO) === corr)) {
			this.descriptorImpresionKeys = [];
		}
	}

	private textoErrorDescriptorEmpleado(error: any, respaldo = 'No se pudo asignar el descriptor.'): string {
		if (typeof error === 'string' && error.trim()) {
			return error.replace(/^Error:\s*/i, '').trim();
		}
		const mensaje = error?.error?.ErrorMessage || error?.ErrorMessage || error?.message || '';
		return String(mensaje).replace(/^Error:\s*/i, '').trim() || respaldo;
	}

	private normalizarPuestos(rows: any[]): GenEmpleadoPuesto[] {
		return (rows ?? []).map((r) => ({
			CORR_EMPRESA: Number(r?.CORR_EMPRESA ?? 0),
			CORR_EMPLEADO: Number(r?.CORR_EMPLEADO ?? 0),
			CORR_UNIDAD: Number(r?.CORR_UNIDAD ?? 0),
			CODIGO_UNIDAD: r?.CODIGO_UNIDAD ?? '',
			NOMBRE_UNIDAD: r?.NOMBRE_UNIDAD ?? '',
			CORR_PUESTO: Number(r?.CORR_PUESTO ?? 0),
			CODIGO_PUESTO: r?.CODIGO_PUESTO ?? '',
			NOMBRE_PUESTO: r?.NOMBRE_PUESTO ?? '',
			FECHA_INGRESO: this.normalizarFechaIngreso(r?.FECHA_INGRESO),
			FECHA_FIN: this.normalizarFechaIngreso(r?.FECHA_FIN),
			ACTIVO_PUESTO: r?.ACTIVO_PUESTO !== false && r?.ACTIVO_PUESTO !== 0,
			CORR_EMPLEADO_PUESTO_HISTORIAL:
				Number(r?.CORR_EMPLEADO_PUESTO_HISTORIAL) > 0 ? Number(r.CORR_EMPLEADO_PUESTO_HISTORIAL) : 0,
			SUELDO: r?.SUELDO == null || r?.SUELDO === '' ? null : Number(r.SUELDO),
			CORR_TIPO_CONTRATACION:
				Number(r?.CORR_TIPO_CONTRATACION) > 0 ? Number(r.CORR_TIPO_CONTRATACION) : null,
			NOMBRE_TIPO_CONTRATACION: r?.NOMBRE_TIPO_CONTRATACION ?? '',
			CORR_TIPO_MODALIDAD: Number(r?.CORR_TIPO_MODALIDAD) > 0 ? Number(r.CORR_TIPO_MODALIDAD) : null,
			MODALIDAD_NOMBRE: r?.MODALIDAD_NOMBRE ?? '',
		}));
	}

	private clonarPuestos(rows: GenEmpleadoPuesto[]): GenEmpleadoPuesto[] {
		return (rows ?? []).map((r) => ({ ...r }));
	}

	private fechaDesdeIso(iso: string): Date {
		const [anio, mes, dia] = iso.split('-').map((n) => Number(n));
		return new Date(anio, mes - 1, dia, 12, 0, 0);
	}

	private normalizarFechaIngreso(valor: any): string | null {
		if (valor == null || valor === '') {
			return null;
		}
		if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
			const y = valor.getFullYear();
			const m = `${valor.getMonth() + 1}`.padStart(2, '0');
			const d = `${valor.getDate()}`.padStart(2, '0');
			return `${y}-${m}-${d}`;
		}
		const texto = `${valor}`.trim();
		const iso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
		return iso ? iso[1] : null;
	}

	private nombreCatalogo(lista: any[], campoId: string, id: number, campoNombre: string): string {
		const item = (lista ?? []).find((x) => Number(x?.[campoId]) === id);
		return `${item?.[campoNombre] ?? ''}`.trim();
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
					this.aplicarCatalogoPaisNacimiento(!this.modelPersonaNatural?.ES_EXTRANJERO);
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

	// ============================================================================
	// Tab Contratos (GEN_EMPLEADO_CONTRATO)
	// ============================================================================

	// Qué hace: carga los contratos asignados al empleado al abrir su ficha.
	// Cómo lo hace: invoca GetAll una sola vez; altas, cambios y adjuntos parchean el arreglo en memoria.
	private cargarContratosEmpleado(): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (corrEmpleado <= 0) {
			this.contratos = [];
			this.contratoSeleccionadoKeys = [];
			return;
		}

		this.cargandoContratos = true;
		this.service
			.getContratos(corrEmpleado)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.cargandoContratos = false;
					this.contratos = response?.Result
						? (response.Data ?? []).map((item: GenEmpleadoContrato) => this.mapContratoRow(item))
						: [];
					this.conservarSeleccionContrato();
				},
				error: (error) => {
					this.cargandoContratos = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo de plantillas de contrato con versión activa.
	// Cómo lo hace: consulta GetPlantillasActivas y ejecuta el callback cuando ya están disponibles.
	private asegurarPlantillasContratoActivas(despues?: () => void): void {
		if (this.plantillasContratoActivas.length > 0) {
			despues?.();
			return;
		}

		this.cargandoContratos = true;
		this.service
			.getPlantillasContratoActivas()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.cargandoContratos = false;
					this.plantillasContratoActivas = response?.Result ? response.Data ?? [] : [];
					if (!this.plantillasContratoActivas.length) {
						this.notifyFx(
							'No hay plantillas de contrato con versión activa configuradas.',
							NotifyType.Warning
						);
						return;
					}
					despues?.();
				},
				error: (error) => {
					this.cargandoContratos = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: guarda la llave del contrato marcado en la grilla del tab Contratos.
	// Cómo lo hace: mantiene selección única para habilitar acciones de barra según el estado.
	onContratoSeleccionado(e: { selectedRowKeys?: number[] }): void {
		const keys = e?.selectedRowKeys ?? [];
		this.contratoSeleccionadoKeys = keys.length ? [Number(keys[0])] : [];
	}

	// Qué hace: devuelve la clase CSS para el badge visual de ESTADO_CONTRATO.
	// Cómo lo hace: asigna estilos según 1=BORRADOR, 2=VIGENTE, 3=FINALIZADO o 4=ANULADO (o sus equivalentes en string).
	cssEstadoContrato(estado: number | string | null | undefined): string {
		const val = typeof estado === 'number' ? estado : Number(estado);
		switch (val) {
			case 2:
				return 'contrato-badge--vigente';
			case 3:
				return 'contrato-badge--finalizado';
			case 4:
				return 'contrato-badge--anulado';
			case 1:
			default:
				const texto = String(estado ?? '').toUpperCase();
				if (texto === 'VIGENTE') return 'contrato-badge--vigente';
				if (texto === 'FINALIZADO') return 'contrato-badge--finalizado';
				if (texto === 'ANULADO') return 'contrato-badge--anulado';
				return 'contrato-badge--borrador';
		}
	}

	// Qué hace: abre el modal para asignar y generar un nuevo borrador de contrato.
	// Cómo lo hace: precarga el puesto activo del empleado y sus fechas, y carga plantillas activas disponibles.
	abrirNuevoContrato(): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (!this.puedeGestionarContratos || corrEmpleado <= 0) {
			return;
		}

		this.asegurarPlantillasContratoActivas(() => {
			this.construirOpcionesPuestoContrato(null, null, null);
			const puestoActivo = (this.puestos ?? []).find((p) => p?.ACTIVO_PUESTO !== false) ?? null;
			const opcionInicial = puestoActivo
				? this.contratoPuestosOpciones.find(
					(o) =>
						Number(o.CORR_UNIDAD) === Number(puestoActivo.CORR_UNIDAD) &&
						Number(o.CORR_PUESTO) === Number(puestoActivo.CORR_PUESTO)
				)
				: null;

			this.contratoEditandoEsNuevo = true;
			this.contratoPuestoSelectorKey = opcionInicial?.key ?? '';
			this.contratoFormDraft = {
				CORR_EMPLEADO_CONTRATO: 0,
				CORR_EMPLEADO: corrEmpleado,
				CORR_UNIDAD: opcionInicial?.CORR_UNIDAD ?? null,
				CORR_PUESTO: opcionInicial?.CORR_PUESTO ?? null,
				CORR_PLANTILLA_CONTRATO_VERSION:
					Number(this.plantillasContratoActivas[0]?.CORR_PLANTILLA_CONTRATO_VERSION ?? 0) || 0,
				FECHA_INICIO: opcionInicial?.FECHA_INGRESO ? this.normalizarFechaContrato(opcionInicial.FECHA_INGRESO) : new Date(),
				FECHA_FIN: opcionInicial?.FECHA_FIN ? this.normalizarFechaContrato(opcionInicial.FECHA_FIN) : null,
				FECHA_FIRMA: new Date(),
				REGENERAR_CONTENIDO: true,
				CUERPO_CONTRATO: '',
			};
			this.contratoPreviewZoom = 100;
			this.contratoFormPreviewHtml = '';
			this.contratoFormPreviewError = '';
			this.contratoParametrosFaltantes = [];
			this.popupContratoFormVisible = true;
			this.programarPreviewModalContrato(0);
		});
	}

	// Qué hace: determina si el botón Editar es visible para la fila de contrato en la grilla.
	// Cómo lo hace: verifica permisos de gestión y que el contrato esté en estado BORRADOR (1).
	contratoEditButtonVisible = (e: any): boolean => {
		return !!this.puedeGestionarContratos && Number(e?.row?.data?.ESTADO_CONTRATO) === 1;
	};

	// Qué hace: determina si el botón Eliminar es visible para la fila de contrato en la grilla.
	// Cómo lo hace: verifica permisos de eliminación y que el contrato esté en estado BORRADOR (1).
	contratoDeleteButtonVisible = (e: any): boolean => {
		return !!this.puedeEliminarContratos && Number(e?.row?.data?.ESTADO_CONTRATO) === 1;
	};

	// Qué hace: maneja el clic en el botón de edición nativo de la fila de contratos.
	// Cómo lo hace: extrae la fila y abre el modal de edición de contrato.
	onEditarContratoFilaClick = (e: any): void => {
		if (e?.row?.data) {
			this.abrirEditarContrato(e.row.data);
		}
	};

	// Qué hace: maneja el clic en el botón de eliminación nativo de la fila de contratos.
	// Cómo lo hace: extrae la fila y ejecuta la eliminación con confirmación.
	onEliminarContratoFilaClick = (e: any): void => {
		if (e?.row?.data) {
			this.eliminarContratoBorradorFila(e.row.data);
		}
	};

	// Qué hace: abre el modal para editar o regenerar un contrato existente en estado BORRADOR.
	// Cómo lo hace: consulta Get por llave para traer su CUERPO_CONTRATO completo antes de mostrar el editor.
	abrirEditarContrato(filaDirecta?: GenEmpleadoContrato | null): void {
		const fila = filaDirecta || this.contratoSeleccionado;
		if (!this.puedeGestionarContratos || !fila || Number(fila.ESTADO_CONTRATO) !== 1) {
			return;
		}
		this.contratoSeleccionadoKeys = [fila.CORR_EMPLEADO_CONTRATO];

		this.asegurarPlantillasContratoActivas(() => {
			this.cargandoContratos = true;
			this.service
				.getContrato(fila.CORR_EMPLEADO_CONTRATO)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						this.cargandoContratos = false;
						if (!response?.Result || !response.Data) {
							this.notifyFx(response?.ErrorMessage || 'No se pudo cargar el borrador del contrato.', NotifyType.Warning);
							return;
						}

						const detalle: GenEmpleadoContrato = response.Data;
						this.construirOpcionesPuestoContrato(
							detalle.CORR_UNIDAD ?? null,
							detalle.CORR_PUESTO ?? null,
							`${detalle.NOMBRE_PUESTO ?? ''}${detalle.NOMBRE_UNIDAD ? ' - ' + detalle.NOMBRE_UNIDAD : ''}`.trim()
						);
						this.contratoPuestoSelectorKey =
							detalle.CORR_UNIDAD && detalle.CORR_PUESTO
								? `${detalle.CORR_UNIDAD}_${detalle.CORR_PUESTO}`
								: '';
						this.contratoEditandoEsNuevo = false;
						if (
							detalle.CORR_PLANTILLA_CONTRATO_VERSION > 0 &&
							!this.plantillasContratoActivas.some(
								(p) => Number(p.CORR_PLANTILLA_CONTRATO_VERSION) === Number(detalle.CORR_PLANTILLA_CONTRATO_VERSION)
							)
						) {
							this.plantillasContratoActivas = [
								{
									CORR_PLANTILLA_CONTRATO: detalle.CORR_PLANTILLA_CONTRATO ?? 0,
									NOMBRE_PLANTILLA: detalle.NOMBRE_PLANTILLA || `Plantilla #${detalle.CORR_PLANTILLA_CONTRATO ?? 0}`,
									CORR_TIPO_CONTRATACION: detalle.CORR_TIPO_CONTRATACION ?? 0,
									NOMBRE_TIPO_CONTRATACION: detalle.NOMBRE_TIPO_CONTRATACION || '',
									CORR_PLANTILLA_CONTRATO_VERSION: detalle.CORR_PLANTILLA_CONTRATO_VERSION,
									NUMERO_VERSION: detalle.NUMERO_VERSION ?? 0,
									NOMBRE_VERSION: detalle.NOMBRE_VERSION || `Versión ${detalle.CORR_PLANTILLA_CONTRATO_VERSION}`,
								},
								...this.plantillasContratoActivas,
							];
						}
						this.contratoFormDraft = {
							CORR_EMPLEADO_CONTRATO: detalle.CORR_EMPLEADO_CONTRATO,
							CORR_EMPLEADO: detalle.CORR_EMPLEADO,
							CORR_UNIDAD: detalle.CORR_UNIDAD ?? null,
							CORR_PUESTO: detalle.CORR_PUESTO ?? null,
							CORR_PLANTILLA_CONTRATO_VERSION: detalle.CORR_PLANTILLA_CONTRATO_VERSION,
							FECHA_INICIO: this.normalizarFechaContrato(detalle.FECHA_INICIO),
							FECHA_FIN: this.normalizarFechaContrato(detalle.FECHA_FIN),
							FECHA_FIRMA: this.normalizarFechaContrato(detalle.FECHA_FIRMA),
							REGENERAR_CONTENIDO: true,
							CUERPO_CONTRATO: '',
						};
						this.contratoPreviewZoom = 100;
						this.contratoFormPreviewError = '';
						this.contratoParametrosFaltantes = [];
						this.contratoFormPreviewHtml = '';
						this.popupContratoFormVisible = true;
						this.programarPreviewModalContrato(0);
					},
					error: (error) => {
						this.cargandoContratos = false;
						this.notifyApiError(error);
					},
				});
		});
	}

	// Qué hace: actualiza unidad, puesto y fechas sugeridas cuando cambia el puesto elegido en el modal de contrato.
	// Cómo lo hace: busca la opción seleccionada y sincroniza CORR_UNIDAD y CORR_PUESTO en contratoFormDraft.
	onPuestoContratoSeleccionadoChanged(key: string | null | undefined): void {
		const opcion = this.contratoPuestosOpciones.find((o) => o.key === (key ?? '')) ?? null;
		this.contratoFormDraft.CORR_UNIDAD = opcion?.CORR_UNIDAD ?? null;
		this.contratoFormDraft.CORR_PUESTO = opcion?.CORR_PUESTO ?? null;
		if (this.contratoEditandoEsNuevo && opcion) {
			if (opcion.FECHA_INGRESO) {
				this.contratoFormDraft.FECHA_INICIO = this.normalizarFechaContrato(opcion.FECHA_INGRESO);
			}
			this.contratoFormDraft.FECHA_FIN = opcion.FECHA_FIN ? this.normalizarFechaContrato(opcion.FECHA_FIN) : null;
		}
		this.programarPreviewModalContrato(80);
	}

	// Qué hace: programa la actualización de la vista previa del contrato dentro del modal sin saturar el API.
	// Cómo lo hace: consulta Preview con debounce al cambiar cualquier parámetro.
	programarPreviewModalContrato(debounceMs = 220): void {
		this.clearContratoFormPreviewTimer();

		if (Number(this.contratoFormDraft.CORR_PLANTILLA_CONTRATO_VERSION ?? 0) <= 0) {
			this.cargandoContratoFormPreview = false;
			this.contratoFormPreviewHtml = '';
			this.contratoParametrosFaltantes = [];
			return;
		}

		this.contratoFormPreviewTimer = setTimeout(() => {
			this.contratoFormPreviewTimer = null;
			this.cargarPreviewModalContrato();
		}, Math.max(0, debounceMs));
	}

	// Qué hace: solicita al backend el HTML interpolado exacto según los parámetros actuales del modal.
	// Cómo lo hace: invoca GEN_EMPLEADO_CONTRATO/Preview descartando respuestas obsoletas por número de secuencia.
	cargarPreviewModalContrato(): void {
		const corrEmpleado = Number(this.model?.CORR_EMPLEADO ?? 0);
		const corrVersion = Number(this.contratoFormDraft.CORR_PLANTILLA_CONTRATO_VERSION ?? 0);
		if (corrEmpleado <= 0 || corrVersion <= 0) {
			return;
		}

		const seq = ++this.contratoFormPreviewSeq;
		const fechaInicio =
			this.formatearFechaApi(this.contratoFormDraft.FECHA_INICIO) ?? this.formatearFechaApi(new Date());
		const payload: GenEmpleadoContratoAccion = {
			CORR_EMPLEADO_CONTRATO: this.contratoFormDraft.CORR_EMPLEADO_CONTRATO ?? 0,
			CORR_EMPLEADO: corrEmpleado,
			CORR_UNIDAD: this.contratoFormDraft.CORR_UNIDAD || null,
			CORR_PUESTO: this.contratoFormDraft.CORR_PUESTO || null,
			CORR_PLANTILLA_CONTRATO_VERSION: corrVersion,
			FECHA_INICIO: fechaInicio,
			FECHA_FIN: this.formatearFechaApi(this.contratoFormDraft.FECHA_FIN),
			FECHA_FIRMA: this.formatearFechaApi(this.contratoFormDraft.FECHA_FIRMA),
			REGENERAR_CONTENIDO: true,
		};

		this.cargandoContratoFormPreview = true;
		this.contratoFormPreviewError = '';
		this.service
			.previewContrato(payload)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (seq !== this.contratoFormPreviewSeq) {
						return;
					}
					this.cargandoContratoFormPreview = false;
					if (response?.Result && response.Data) {
						const rawHtml = `${response.Data?.CUERPO_CONTRATO ?? ''}`;
						const html = this.normalizarHtmlContrato(rawHtml);
						const faltantes = Array.isArray(response.Data?.PARAMETROS_FALTANTES)
							? response.Data.PARAMETROS_FALTANTES.map((x: any) => `${x}`.trim()).filter(Boolean)
							: [];
						this.contratoFormPreviewError = '';
						this.contratoParametrosFaltantes = faltantes;
						this.contratoFormPreviewHtml = this.sanitization.bypassSecurityTrustHtml(html);
					} else {
						this.contratoFormPreviewHtml = '';
						this.contratoParametrosFaltantes = [];
						this.contratoFormPreviewError =
							response?.ErrorMessage || 'No se pudo generar la vista previa del contrato.';
					}
				},
				error: (error) => {
					if (seq !== this.contratoFormPreviewSeq) {
						return;
					}
					this.cargandoContratoFormPreview = false;
					this.contratoFormPreviewHtml = '';
					this.contratoParametrosFaltantes = [];
					this.contratoFormPreviewError = this.textoErrorDescriptorEmpleado(
						error,
						'No se pudo cargar la vista previa del contrato. Verifique que el API esté actualizado y en ejecución.'
					);
				},
			});
	}

	// Qué hace: ajusta el zoom visual de la hoja A4 en la vista previa del modal.
	// Cómo lo hace: restringe la escala entre 70% y 140% en pasos de 10%.
	ajustarZoomPreviewContrato(delta: number): void {
		const next = Math.min(140, Math.max(70, this.contratoPreviewZoom + delta));
		this.contratoPreviewZoom = next;
	}

	restablecerZoomPreviewContrato(): void {
		this.contratoPreviewZoom = 100;
	}

	// Qué hace: limpia timers activos cuando se oculta el modal de creación/edición de contrato.
	// Cómo lo hace: cancela el debounce de vista previa para evitar peticiones tardías tras cerrar.
	alOcultarPopupContratoForm(): void {
		this.clearContratoFormPreviewTimer();
	}

	private clearContratoFormPreviewTimer(): void {
		if (this.contratoFormPreviewTimer !== null) {
			clearTimeout(this.contratoFormPreviewTimer);
			this.contratoFormPreviewTimer = null;
		}
	}

	// Qué hace: guarda un borrador nuevo o actualiza un borrador existente y parchea la grilla sin GetAll.
	// Cómo lo hace: valida plantilla y fechas, envía fechas en formato ISO YYYY-MM-DD y reemplaza la fila en memoria.
	guardarContratoBorrador(): void {
		if (!this.puedeGestionarContratos || this.guardandoContrato) {
			return;
		}

		if (Number(this.contratoFormDraft.CORR_PLANTILLA_CONTRATO_VERSION ?? 0) <= 0) {
			this.notifyFx('Seleccione una plantilla de contrato.', NotifyType.Warning);
			return;
		}

		const fechaInicio = this.formatearFechaApi(this.contratoFormDraft.FECHA_INICIO);
		if (!fechaInicio) {
			this.notifyFx('Indique la fecha de inicio del contrato.', NotifyType.Warning);
			return;
		}

		const fechaFin = this.formatearFechaApi(this.contratoFormDraft.FECHA_FIN);
		if (fechaFin && fechaFin < fechaInicio) {
			this.notifyFx('La fecha de finalización no puede ser menor que la fecha de inicio.', NotifyType.Warning);
			return;
		}

		if (this.cargandoContratoFormPreview) {
			this.notifyFx('Espere a que termine de validarse la vista previa del contrato.', NotifyType.Warning);
			return;
		}

		if (this.contratoParametrosFaltantes.length > 0) {
			this.notifyFx(
				'Hay campos faltantes sin datos en el contrato. Complete los parámetros resaltados antes de guardar.',
				NotifyType.Warning
			);
			return;
		}

		const payload: GenEmpleadoContratoAccion = {
			CORR_EMPLEADO_CONTRATO: this.contratoEditandoEsNuevo ? 0 : this.contratoFormDraft.CORR_EMPLEADO_CONTRATO,
			CORR_EMPLEADO: Number(this.model?.CORR_EMPLEADO ?? 0),
			CORR_UNIDAD: this.contratoFormDraft.CORR_UNIDAD || null,
			CORR_PUESTO: this.contratoFormDraft.CORR_PUESTO || null,
			CORR_PLANTILLA_CONTRATO_VERSION: Number(this.contratoFormDraft.CORR_PLANTILLA_CONTRATO_VERSION),
			FECHA_INICIO: fechaInicio,
			FECHA_FIN: fechaFin,
			FECHA_FIRMA: this.formatearFechaApi(this.contratoFormDraft.FECHA_FIRMA),
			REGENERAR_CONTENIDO: true,
			CUERPO_CONTRATO: null,
		};

		this.guardandoContrato = true;
		const peticion = this.contratoEditandoEsNuevo
			? this.service.asignarContratoBorrador(payload)
			: this.service.actualizarContratoBorrador(payload);

		peticion.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.guardandoContrato = false;
				if (!response?.Result || !response.Data) {
					this.notifyFx(response?.ErrorMessage || 'No se pudo guardar el contrato.', NotifyType.Warning);
					return;
				}
				const guardado = this.mapContratoRow(response.Data);
				this.aplicarContratoEnMemoria(guardado, this.contratoEditandoEsNuevo);
				this.contratoSeleccionadoKeys = [guardado.CORR_EMPLEADO_CONTRATO];
				this.popupContratoFormVisible = false;
				this.notifyFx(
					this.contratoEditandoEsNuevo ? 'Contrato generado en borrador.' : 'Borrador actualizado.',
					NotifyType.Success,
					{ raw: true }
				);
			},
			error: (error) => {
				this.guardandoContrato = false;
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: abre el visor del contrato para ver o imprimir mostrando exactamente la misma vista previa del editor.
	// Cómo lo hace: consulta el cuerpo congelado del contrato, lo normaliza, enlaza al lienzo HTML sin distorsiones y habilita zoom e impresión nativa.
	abrirPreviewContrato(fila?: GenEmpleadoContrato | null): void {
		const objetivo = fila ?? this.contratoSeleccionado;
		if (!objetivo?.CORR_EMPLEADO_CONTRATO) {
			this.notifyFx('Seleccione un contrato para visualizar.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.getContrato(objetivo.CORR_EMPLEADO_CONTRATO)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result || !response.Data) {
						this.notifyFx(response?.ErrorMessage || 'No se pudo cargar el contenido del contrato.', NotifyType.Warning);
						return;
					}
					const detalle = this.mapContratoRow(response.Data);
					this.contratoPreviewActual = detalle;
					const html = this.normalizarHtmlContrato(detalle.CUERPO_CONTRATO || '');
					this.contratoPreviewHtml = this.sanitization.bypassSecurityTrustHtml(html);
					this.contratoPreviewZoom = 85;
					this.popupContratoPreviewVisible = true;
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

		// Qué hace: dispara la impresión nativa del contrato con la misma tipografía y distribución exacta de la vista previa.
	// Cómo lo hace: cambia temporalmente document.title al nombre del contrato para que el navegador sugiera ese nombre de archivo al guardar PDF, y lo restaura al finalizar.
	imprimirContratoHtml(): void {
		const cuerpo = this.contratoPreviewActual?.CUERPO_CONTRATO;
		if (!cuerpo) {
			this.notifyFx('No hay contenido para imprimir.', NotifyType.Warning);
			return;
		}

		// 1. Guardamos el título original de la app y asignamos el nombre del contrato
		const tituloOriginal = document.title;
		const nombreDoc = this.contratoPreviewActual?.NOMBRE_PLANTILLA?.trim() || 'Docente Hora Clase';
		document.title = nombreDoc;

		const iframe = document.createElement('iframe');
		iframe.style.position = 'fixed';
		iframe.style.right = '0';
		iframe.style.bottom = '0';
		iframe.style.width = '0';
		iframe.style.height = '0';
		iframe.style.border = '0';
		document.body.appendChild(iframe);

		const doc = iframe.contentWindow?.document;
		if (!doc) {
			document.title = tituloOriginal;
			document.body.removeChild(iframe);
			return;
		}

		doc.open();
		doc.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<title>${nombreDoc}</title>
				<style>
					@page {
						size: letter portrait;
						margin: 0;
					}
					body {
						margin: 0;
						padding: 14mm 15mm 12mm 15mm;
						font-family: 'Times New Roman', Georgia, serif;
						font-size: 11pt;
						line-height: 1.40;
						color: #111827;
						background: #fff;
					}
					p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote {
						margin: 0;
						padding: 0;
						line-height: 1.40;
					}
					ul, ol { padding-left: 1.5em; }
					table {
						width: 100% !important;
						border-collapse: collapse !important;
						table-layout: fixed !important;
						margin: 4px 0;
					}
					td, th {
						padding: 3px 5px !important;
						vertical-align: middle !important;
						word-break: break-word;
					}
					tr > td:first-child:nth-last-child(3) { width: 18% !important; }
					tr > td:nth-child(2):nth-last-child(2) { width: 64% !important; text-align: center !important; }
					tr > td:nth-child(3):last-child { width: 18% !important; text-align: right !important; }
					tr > td:nth-child(3):last-child img { max-width: 100% !important; height: auto !important; }
					tr > td:first-child:nth-last-child(2) { width: 50% !important; }
					tr > td:nth-child(2):last-child { width: 50% !important; }
					table[style*='border-style: none'], table[style*='border-style:none'],
					table[style*='border-top-style: none'], table[style*='border-top-style:none'],
					table[style*='border-width: 0px'], table[style*='border-width:0px'] {
						border: none !important;
					}
					table[style*='border-style: none'] td, table[style*='border-style:none'] td,
					table[style*='border-top-style: none'] td, table[style*='border-top-style:none'] td,
					table[style*='border-width: 0px'] td, table[style*='border-width:0px'] td {
						border: none !important;
					}
					.ql-align-center { text-align: center; }
					.ql-align-right { text-align: right; }
					.ql-align-justify { text-align: justify; }
					img { max-width: 100%; height: auto; }
				</style>
			</head>
			<body>
				${this.normalizarHtmlContrato(cuerpo)}
			</body>
			</html>
		`);
		doc.close();

		setTimeout(() => {
			iframe.contentWindow?.focus();
			iframe.contentWindow?.print();
			// 2. Restauramos el título original de la aplicación tras imprimir
			setTimeout(() => {
				document.title = tituloOriginal;
				if (document.body.contains(iframe)) {
					document.body.removeChild(iframe);
				}
			}, 1000);
		}, 300);
	}

	// Qué hace: normaliza el HTML del contrato para que tablas con anchos fijos en px no desborden la hoja A4.
	// Cómo lo hace: limpia anchos rígidos en píxeles de tablas y celdas para que las reglas CSS del Studio distribuyan los anchos porcentualmente.
	private normalizarHtmlContrato(html: string): string {
		if (!html) return '';
		return html
			.replace(/(<table\b[^>]*?)\bwidth=["']?\d+px?["']?/gi, '$1 width="100%"')
			.replace(/(<td\b[^>]*?style=["'][^"']*?)width:\s*\d+px;?/gi, '$1')
			.replace(/width:\s*190px/gi, 'width: 18%')
			.replace(/width:\s*420px/gi, 'width: 64%');
	}

	// Qué hace: compila el HTML del contrato en PDF respetando la tipografía, márgenes y distribución exacta de la vista previa del editor.
	// Cómo lo hace: monta un contenedor temporal con la misma tipografía Times New Roman, padding 40px 38px y reglas de tabla de contrato-studio__sheet;
	//              espera la carga de imágenes, renderiza mediante html2canvas y pagina en jsPDF ajustando escala si cabe en una página.
	private async generarPdfDesdeHtmlContrato(detalle: GenEmpleadoContrato): Promise<void> {
		const htmlContenido = this.normalizarHtmlContrato(detalle.CUERPO_CONTRATO || '');
		if (!htmlContenido.trim()) {
			this.loadingVisible = false;
			this.notifyFx('El contrato no tiene contenido para visualizar.', NotifyType.Warning);
			return;
		}

		// Contenedor temporal: debe estar en el DOM para que html2canvas lo dibuje,
		// replicando fielmente las dimensiones y tipografía de .contrato-studio__sheet
		const container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.left = '0';
		container.style.top = '0';
		container.style.zIndex = '-9999';
		container.style.width = '794px'; // Ancho A4 exacto a 96 DPI
		container.style.padding = '40px 38px';
		container.style.boxSizing = 'border-box';
		container.style.background = '#ffffff';
		container.style.color = '#111827';
		container.style.fontFamily = "'Times New Roman', Georgia, serif";
		container.style.fontSize = '12px';
		container.style.lineHeight = '1.42';

		container.innerHTML = `
        <style>
            p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote {
                margin: 0;
                padding: 0;
                line-height: 1.42;
            }
            ul, ol { padding-left: 1.5em; }
            table {
                width: 100% !important;
                max-width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                box-sizing: border-box !important;
                margin: 4px 0;
            }
            td, th {
                padding: 4px 6px !important;
                vertical-align: middle !important;
                word-break: break-word;
                overflow-wrap: anywhere;
                box-sizing: border-box !important;
            }
            /* Encabezado institucional de 3 columnas (espacio / título centrado / logo a la derecha) */
            tr > td:first-child:nth-last-child(3) { width: 18% !important; }
            tr > td:nth-child(2):nth-last-child(2) { width: 64% !important; text-align: center !important; }
            tr > td:nth-child(3):last-child { width: 18% !important; text-align: right !important; }
            tr > td:nth-child(3):last-child img { max-width: 100% !important; height: auto !important; display: inline-block !important; }

            /* Firmas institucionales de 2 columnas (Universidad / Empleado) */
            tr > td:first-child:nth-last-child(2) { width: 50% !important; }
            tr > td:nth-child(2):last-child { width: 50% !important; }

            /* Tablas sin bordes para encabezados y firmas */
            table[style*='border-style: none'], table[style*='border-style:none'],
            table[style*='border-top-style: none'], table[style*='border-top-style:none'],
            table[style*='border-width: 0px'], table[style*='border-width:0px'] {
                border: none !important;
            }
            table[style*='border-style: none'] td, table[style*='border-style:none'] td,
            table[style*='border-top-style: none'] td, table[style*='border-top-style:none'] td,
            table[style*='border-width: 0px'] td, table[style*='border-width:0px'] td {
                border: none !important;
            }

            .ql-align-center { text-align: center; }
            .ql-align-right { text-align: right; }
            .ql-align-justify { text-align: justify; }
            img { max-width: 100%; height: auto; }
        </style>
        ${htmlContenido}
    `;

		document.body.appendChild(container);

		// Esperar a que las imágenes (como el logo de la UEES) se carguen completamente antes de renderizar
		const imagenes = Array.from(container.querySelectorAll('img'));
		await Promise.all(
			imagenes.map((img) => {
				if (img.complete) return Promise.resolve();
				return new Promise((resolve) => {
					img.onload = () => resolve(true);
					img.onerror = () => resolve(true);
				});
			})
		);

		// Pequeño ciclo de render para que el navegador aplique los estilos CSS
		await new Promise((resolve) => setTimeout(resolve, 50));

		try {
			const h2c = (html2canvasLib as any).default ?? (html2canvasLib as any);
			const canvas = await h2c(container, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
				windowWidth: 794,
				scrollX: 0,
				scrollY: 0,
			});

			if (document.body.contains(container)) {
				document.body.removeChild(container);
			}

			const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
			const pageWidthMm = 210;
			const pageHeightMm = 297;
			const marginY = 6; // Margen superior e inferior compacto
			const printableHeightMm = pageHeightMm - marginY * 2; // 285 mm

			const imgWidthPx = canvas.width;
			const imgHeightPx = canvas.height;
			const totalHeightMm = (imgHeightPx / imgWidthPx) * pageWidthMm;

			// Si el documento entra en 1 página o se desborda por un margen mínimo (hasta 6%),
			// se ajusta para que quepa perfectamente completo en 1 sola página.
			if (totalHeightMm <= printableHeightMm * 1.06) {
				const escalaUnica = Math.min(1, printableHeightMm / totalHeightMm);
				const finalWidthMm = pageWidthMm * escalaUnica;
				const finalHeightMm = totalHeightMm * escalaUnica;
				const offsetX = (pageWidthMm - finalWidthMm) / 2;
				const pageData = canvas.toDataURL('image/jpeg', 0.95);
				pdf.addImage(pageData, 'JPEG', offsetX, marginY, finalWidthMm, finalHeightMm);
			} else {
				// Renderizado multipágina para contratos extensos
				const canvasPageHeightPx = (printableHeightMm / totalHeightMm) * imgHeightPx;
				let renderedHeightPx = 0;
				let pageNumber = 0;

				while (renderedHeightPx < imgHeightPx) {
					if (pageNumber > 0) {
						pdf.addPage();
					}

					const currentSliceHeightPx = Math.min(canvasPageHeightPx, imgHeightPx - renderedHeightPx);
					const pageCanvas = document.createElement('canvas');
					pageCanvas.width = imgWidthPx;
					pageCanvas.height = currentSliceHeightPx;
					const ctx = pageCanvas.getContext('2d');

					if (ctx) {
						ctx.fillStyle = '#ffffff';
						ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
						ctx.drawImage(
							canvas,
							0, renderedHeightPx, imgWidthPx, currentSliceHeightPx,
							0, 0, imgWidthPx, currentSliceHeightPx
						);

						const sliceHeightMm = (currentSliceHeightPx / imgWidthPx) * pageWidthMm;
						const pageData = pageCanvas.toDataURL('image/jpeg', 0.95);
						pdf.addImage(pageData, 'JPEG', 0, marginY, pageWidthMm, sliceHeightMm);
					}

					renderedHeightPx += currentSliceHeightPx;
					pageNumber++;
				}
			}

			this.loadingVisible = false;
			const nombrePlantilla = detalle.NOMBRE_PLANTILLA?.trim() || 'Contrato';
			pdf.setProperties({
				title: nombrePlantilla,
				subject: nombrePlantilla,
			});
			const blob = pdf.output('blob');
			this.revocarContratoPreviewPdfUrl();
			const archivoPdf = new File([blob], `${nombrePlantilla}.pdf`, { type: 'application/pdf' });
			const objectUrl = window.URL.createObjectURL(archivoPdf);
			this.contratoPreviewPdfObjectUrl = objectUrl;
			this.contratoPreviewPdfUrl = this.sanitization.bypassSecurityTrustResourceUrl(objectUrl);
			this.popupContratoPreviewVisible = true;
		} catch (e) {
			if (document.body.contains(container)) {
				document.body.removeChild(container);
			}
			this.loadingVisible = false;
			this.notifyFx('No se pudo generar el visor PDF del contrato.', NotifyType.Error);
		}
	}

	// Qué hace: limpia y revoca el ObjectURL del visor de vista previa al cerrarlo.
	// Cómo lo hace: llama a URL.revokeObjectURL y limpia variables de enlace.
	alOcultarPopupContratoPreview(): void {
		this.popupContratoPreviewVisible = false;
		this.revocarContratoPreviewPdfUrl();
	}

	private revocarContratoPreviewPdfUrl(): void {
		if (this.contratoPreviewPdfObjectUrl) {
			window.URL.revokeObjectURL(this.contratoPreviewPdfObjectUrl);
			this.contratoPreviewPdfObjectUrl = null;
		}
		this.contratoPreviewPdfUrl = null;
	}

	// Qué hace: emite oficialmente un contrato BORRADOR dejándolo VIGENTE e inmutable.
	// Cómo lo hace: valida documento firmado obligatorio, pide confirmación y actualiza la fila en memoria sin volver a consultar GetAll.
	emitirContratoSeleccionado(): void {
		const fila = this.contratoSeleccionado;
		if (!this.puedeGestionarContratos || !fila || !this.contratoSeleccionadoEsBorrador) {
			return;
		}

		// Qué hace: restringe la emisión si el contrato no posee su archivo firmado adjunto.
		// Cómo lo hace: evalúa TIENE_ARCHIVO_FIRMADO en la fila seleccionada y notifica advertencia.
		if (!fila.TIENE_ARCHIVO_FIRMADO) {
			this.notifyFx(
				'Debe adjuntar el documento firmado antes de emitir el contrato.',
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}

		this.confirmaAccion(
			'Emitir contrato',
			'Al emitir el contrato pasará a estado VIGENTE y su contenido quedará congelado permanentemente (no podrá editarse). ¿Desea continuar?',
			() => {
				this.cargandoContratos = true;
				this.service
					.emitirContrato(fila.CORR_EMPLEADO_CONTRATO)
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							this.cargandoContratos = false;
							if (!response?.Result || !response.Data) {
								this.notifyFx(response?.ErrorMessage || 'No se pudo emitir el contrato.', NotifyType.Warning);
								return;
							}
							this.aplicarContratoEnMemoria(this.mapContratoRow(response.Data), false);
							this.notifyFx('Contrato emitido correctamente.', NotifyType.Success, { raw: true });
						},
						error: (error) => {
							this.cargandoContratos = false;
							this.notifyApiError(error);
						},
					});
			}
		);
	}

	// Qué hace: marca como FINALIZADO un contrato VIGENTE al concluir su plazo.
	// Cómo lo hace: solicita confirmación y parchea la fila devuelta por el API en memoria.
	finalizarContratoSeleccionado(): void {
		const fila = this.contratoSeleccionado;
		if (!this.puedeGestionarContratos || !fila || !this.contratoSeleccionadoEsVigente) {
			return;
		}

		this.confirmaAccion(
			'Finalizar contrato',
			'El contrato pasará a estado FINALIZADO. ¿Desea continuar?',
			() => {
				this.cargandoContratos = true;
				this.service
					.finalizarContrato(fila.CORR_EMPLEADO_CONTRATO)
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							this.cargandoContratos = false;
							if (!response?.Result || !response.Data) {
								this.notifyFx(response?.ErrorMessage || 'No se pudo finalizar el contrato.', NotifyType.Warning);
								return;
							}
							this.aplicarContratoEnMemoria(this.mapContratoRow(response.Data), false);
							this.notifyFx('Contrato finalizado.', NotifyType.Success, { raw: true });
						},
						error: (error) => {
							this.cargandoContratos = false;
							this.notifyApiError(error);
						},
					});
			}
		);
	}

	// Qué hace: abre el modal para capturar el motivo obligatorio de anulación.
	// Cómo lo hace: verifica estado BORRADOR o VIGENTE y limpia el campo motivo antes de mostrar el popup.
	abrirAnularContrato(): void {
		const fila = this.contratoSeleccionado;
		if (!this.puedeGestionarContratos || !fila || (!this.contratoSeleccionadoEsBorrador && !this.contratoSeleccionadoEsVigente)) {
			return;
		}
		this.motivoAnulacionContrato = '';
		this.popupContratoAnularVisible = true;
	}

	// Qué hace: confirma la anulación enviando el motivo al API y actualizando la grilla en memoria.
	// Cómo lo hace: valida motivo no vacío y reemplaza la fila con response.Data.
	confirmarAnularContrato(): void {
		const fila = this.contratoSeleccionado;
		const motivo = `${this.motivoAnulacionContrato ?? ''}`.trim();
		if (!this.puedeGestionarContratos || !fila) {
			return;
		}
		if (!motivo) {
			this.notifyFx('Debe ingresar el motivo de anulación.', NotifyType.Warning);
			return;
		}

		this.guardandoContrato = true;
		this.service
			.anularContrato(fila.CORR_EMPLEADO_CONTRATO, motivo)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.guardandoContrato = false;
					if (!response?.Result || !response.Data) {
						this.notifyFx(response?.ErrorMessage || 'No se pudo anular el contrato.', NotifyType.Warning);
						return;
					}
					this.aplicarContratoEnMemoria(this.mapContratoRow(response.Data), false);
					this.popupContratoAnularVisible = false;
					this.notifyFx('Contrato anulado.', NotifyType.Success, { raw: true });
				},
				error: (error) => {
					this.guardandoContrato = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: elimina definitivamente un contrato en estado BORRADOR desde la fila o desde la selección.
	// Cómo lo hace: solicita confirmación, invoca DELETE y remueve el registro del arreglo en memoria.
	eliminarContratoBorradorFila(filaDirecta?: GenEmpleadoContrato | null): void {
		const fila = filaDirecta || this.contratoSeleccionado;
		if (!this.puedeEliminarContratos || !fila || Number(fila.ESTADO_CONTRATO) !== 1) {
			return;
		}
		this.contratoSeleccionadoKeys = [fila.CORR_EMPLEADO_CONTRATO];

		this.confirmaAccion(
			'Eliminar borrador',
			'Se eliminará definitivamente el borrador seleccionado. ¿Desea continuar?',
			() => {
				this.cargandoContratos = true;
				this.service
					.eliminarContratoBorrador(fila.CORR_EMPLEADO_CONTRATO)
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							this.cargandoContratos = false;
							if (!response?.Result) {
								this.notifyFx(response?.ErrorMessage || 'No se pudo eliminar el borrador.', NotifyType.Warning);
								return;
							}
							this.contratos = this.contratos.filter(
								(c) => Number(c.CORR_EMPLEADO_CONTRATO) !== Number(fila.CORR_EMPLEADO_CONTRATO)
							);
							this.conservarSeleccionContrato();
							this.notifyFx('Borrador eliminado.', NotifyType.Success, { raw: true });
						},
						error: (error) => {
							this.cargandoContratos = false;
							this.notifyApiError(error);
						},
					});
			}
		);
	}

	// Qué hace: mantiene compatibilidad para eliminar el borrador actualmente seleccionado.
	// Cómo lo hace: delega la ejecución a eliminarContratoBorradorFila.
	eliminarContratoBorradorSeleccionado(): void {
		this.eliminarContratoBorradorFila();
	}

	// Qué hace: abre el selector nativo de archivo para adjuntar o reemplazar el contrato firmado solo en borradores.
	// Cómo lo hace: valida que el contrato esté en estado BORRADOR y no VIGENTE/FINALIZADO/ANULADO antes de invocar el input file.
	solicitarSubirContratoFirmado(fila?: GenEmpleadoContrato | null): void {
		const objetivo = fila ?? this.contratoSeleccionado;
		const estado = Number(objetivo?.ESTADO_CONTRATO);
		if (!this.puedeGestionarContratos || !objetivo) {
			return;
		}
		if (estado !== 1) {
			this.notifyFx(
				`No se pueden subir documentos a un contrato en estado ${objetivo.NOMBRE_ESTADO_CONTRATO || estado}. Solo se permite en contratos en BORRADOR.`,
				NotifyType.Warning
			);
			return;
		}
		this.contratoParaSubirFirmadoId = Number(objetivo.CORR_EMPLEADO_CONTRATO);
		const input = this.contratoFirmadoInput?.nativeElement;
		if (input) {
			input.value = '';
			input.click();
		}
	}

	// Qué hace: valida y envía al servidor el PDF o imagen del contrato firmado seleccionado por el usuario.
	// Cómo lo hace: verifica que el contrato siga siendo BORRADOR, sube vía FormData (PostDoc) y parchea TIENE_ARCHIVO_FIRMADO / NOMBRE_ARCHIVO en memoria.
	onContratoFirmadoSeleccionado(event: Event): void {
		const input = event.target as HTMLInputElement | null;
		const file = input?.files?.[0];
		const corrContrato = this.contratoParaSubirFirmadoId;
		if (!file || corrContrato <= 0) {
			return;
		}

		const contratoActual = this.contratos.find((c) => Number(c.CORR_EMPLEADO_CONTRATO) === corrContrato);
		const estadoActual = Number(contratoActual?.ESTADO_CONTRATO);
		if (estadoActual !== 1) {
			this.notifyFx(
				`No se puede adjuntar documento firmado porque el contrato está en estado ${contratoActual?.NOMBRE_ESTADO_CONTRATO || estadoActual}.`,
				NotifyType.Warning
			);
			return;
		}

		const nombreLower = (file.name || '').toLowerCase();
		const valido = /\.(pdf|jpg|jpeg|png|webp)$/i.test(nombreLower);
		if (!valido) {
			this.notifyFx('Formato no permitido. Use PDF o imagen (JPG, PNG, WEBP).', NotifyType.Warning);
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			this.notifyFx('El archivo firmado no puede superar 10 MB.', NotifyType.Warning);
			return;
		}

		this.cargandoContratos = true;
		this.service
			.subirDocumentoFirmadoContrato(corrContrato, file)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.cargandoContratos = false;
					if (!response?.Result || !response.Data) {
						this.notifyFx(response?.ErrorMessage || 'No se pudo subir el documento firmado.', NotifyType.Warning);
						return;
					}
					const actualizado = this.mapContratoRow(response.Data);
					this.aplicarContratoEnMemoria(actualizado, false);
					this.contratoSeleccionadoKeys = [actualizado.CORR_EMPLEADO_CONTRATO];
					this.notifyFx('Documento firmado adjuntado correctamente.', NotifyType.Success, { raw: true });
				},
				error: (error) => {
					this.cargandoContratos = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: descarga y abre en visor popup el PDF o imagen firmado almacenado para el contrato.
	// Cómo lo hace: obtiene Blob desde GetDoc, genera ObjectURL segura y revoca cualquier URL anterior al cerrar.
	verDocumentoFirmadoContrato(fila?: GenEmpleadoContrato | null): void {
		const objetivo = fila ?? this.contratoSeleccionado;
		if (!objetivo?.CORR_EMPLEADO_CONTRATO || !objetivo.TIENE_ARCHIVO_FIRMADO) {
			this.notifyFx('Este contrato aún no tiene documento firmado adjunto.', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		this.service
			.getDocumentoFirmadoContrato(objetivo.CORR_EMPLEADO_CONTRATO)
			.pipe(take(1))
			.subscribe({
				next: (blob: Blob) => {
					this.loadingVisible = false;
					if (!blob?.size) {
						this.notifyFx('No se recibió el archivo del documento firmado.', NotifyType.Error);
						return;
					}
					this.revocarContratoFirmadoUrl();
					const nombreArchivo = objetivo.NOMBRE_ARCHIVO?.trim() || 'documento_firmado.pdf';
					const mimeType = blob.type || (/\.pdf$/i.test(nombreArchivo) ? 'application/pdf' : 'image/jpeg');
					const archivoFirmado = new File([blob], nombreArchivo, { type: mimeType });
					const objectUrl = window.URL.createObjectURL(archivoFirmado);
					this.contratoFirmadoObjectUrl = objectUrl;
					this.contratoFirmadoUrl = this.sanitization.bypassSecurityTrustResourceUrl(objectUrl);
					const nombre = nombreArchivo.toLowerCase();
					this.contratoFirmadoEsImagen =
						blob.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(nombre);
					this.tituloContratoFirmado = objetivo.NOMBRE_ARCHIVO
						? `Documento firmado — ${objetivo.NOMBRE_ARCHIVO}`
						: 'Documento firmado';
					this.popupContratoFirmadoVisible = true;
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: descarga directamente el archivo del documento firmado en el navegador del usuario.
	// Cómo lo hace: solicita Blob al API y dispara descarga temporal con NOMBRE_ARCHIVO original.
	descargarDocumentoFirmadoContrato(): void {
		const fila = this.contratoSeleccionado;
		if (!fila?.CORR_EMPLEADO_CONTRATO || !fila.TIENE_ARCHIVO_FIRMADO) {
			return;
		}
		this.loadingVisible = true;
		this.service
			.getDocumentoFirmadoContrato(fila.CORR_EMPLEADO_CONTRATO)
			.pipe(take(1))
			.subscribe({
				next: (blob: Blob) => {
					this.loadingVisible = false;
					const url = window.URL.createObjectURL(blob);
					const anchor = document.createElement('a');
					anchor.href = url;
					anchor.download = fila.NOMBRE_ARCHIVO || `contrato_${fila.CORR_EMPLEADO_CONTRATO}.pdf`;
					anchor.click();
					setTimeout(() => window.URL.revokeObjectURL(url), 1000);
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: revoca la URL temporal del visor cuando se cierra el popup de documento firmado.
	// Cómo lo hace: limpia objeto URL de memoria al evento onHidden del DxPopup.
	alOcultarPopupContratoFirmado(): void {
		this.revocarContratoFirmadoUrl();
	}

	private revocarContratoFirmadoUrl(): void {
		if (this.contratoFirmadoObjectUrl) {
			window.URL.revokeObjectURL(this.contratoFirmadoObjectUrl);
			this.contratoFirmadoObjectUrl = null;
		}
		this.contratoFirmadoUrl = null;
		this.contratoFirmadoEsImagen = false;
	}

	private construirOpcionesPuestoContrato(
		corrUnidadActual: number | null,
		corrPuestoActual: number | null,
		etiquetaActual: string | null
	): void {
		const opciones: {
			key: string;
			label: string;
			CORR_UNIDAD: number | null;
			CORR_PUESTO: number | null;
			FECHA_INGRESO?: string | null;
			FECHA_FIN?: string | null;
		}[] = [{ key: '', label: '(Sin puesto específico)', CORR_UNIDAD: null, CORR_PUESTO: null }];

		for (const p of this.puestos ?? []) {
			if (!p?.CORR_UNIDAD || !p?.CORR_PUESTO) {
				continue;
			}
			const key = `${p.CORR_UNIDAD}_${p.CORR_PUESTO}`;
			if (opciones.some((o) => o.key === key)) {
				continue;
			}
			const estado = p.ACTIVO_PUESTO === false ? 'Histórico' : 'Activo';
			opciones.push({
				key,
				label: `${p.NOMBRE_PUESTO || 'Puesto'} — ${p.NOMBRE_UNIDAD || 'Unidad'} (${estado})`,
				CORR_UNIDAD: Number(p.CORR_UNIDAD),
				CORR_PUESTO: Number(p.CORR_PUESTO),
				FECHA_INGRESO: p.FECHA_INGRESO ?? null,
				FECHA_FIN: p.FECHA_FIN ?? null,
			});
		}

		if (corrUnidadActual && corrPuestoActual) {
			const keyActual = `${corrUnidadActual}_${corrPuestoActual}`;
			if (!opciones.some((o) => o.key === keyActual)) {
				opciones.push({
					key: keyActual,
					label: etiquetaActual || `Unidad ${corrUnidadActual} — Puesto ${corrPuestoActual}`,
					CORR_UNIDAD: corrUnidadActual,
					CORR_PUESTO: corrPuestoActual,
				});
			}
		}

		this.contratoPuestosOpciones = opciones;
	}

	private aplicarContratoEnMemoria(row: GenEmpleadoContrato, alInicio: boolean): void {
		const idx = this.contratos.findIndex(
			(item) => Number(item.CORR_EMPLEADO_CONTRATO) === Number(row.CORR_EMPLEADO_CONTRATO)
		);
		if (idx >= 0) {
			this.contratos = this.contratos.map((item, i) => (i === idx ? row : item));
		} else {
			this.contratos = alInicio ? [row, ...this.contratos] : [...this.contratos, row];
		}
	}

	private conservarSeleccionContrato(): void {
		const id = Number(this.contratoSeleccionadoKeys?.[0] ?? 0);
		if (id <= 0) {
			return;
		}
		if (!this.contratos.some((c) => Number(c.CORR_EMPLEADO_CONTRATO) === id)) {
			this.contratoSeleccionadoKeys = [];
		}
	}

	private mapContratoRow(item: any): GenEmpleadoContrato {
		return {
			CORR_EMPRESA: Number(item?.CORR_EMPRESA ?? 0),
			CORR_EMPLEADO_CONTRATO: Number(item?.CORR_EMPLEADO_CONTRATO ?? 0),
			CORR_EMPLEADO: Number(item?.CORR_EMPLEADO ?? this.model?.CORR_EMPLEADO ?? 0),
			CODIGO_EMPLEADO: item?.CODIGO_EMPLEADO ?? '',
			NOMBRE_EMPLEADO: item?.NOMBRE_EMPLEADO ?? '',
			DUI: item?.DUI ?? '',
			CORR_UNIDAD: item?.CORR_UNIDAD != null ? Number(item.CORR_UNIDAD) : null,
			NOMBRE_UNIDAD: item?.NOMBRE_UNIDAD ?? '',
			CORR_PUESTO: item?.CORR_PUESTO != null ? Number(item.CORR_PUESTO) : null,
			NOMBRE_PUESTO: item?.NOMBRE_PUESTO ?? '',
			CORR_PLANTILLA_CONTRATO_VERSION: Number(item?.CORR_PLANTILLA_CONTRATO_VERSION ?? 0),
			CORR_PLANTILLA_CONTRATO:
				item?.CORR_PLANTILLA_CONTRATO != null ? Number(item.CORR_PLANTILLA_CONTRATO) : null,
			NOMBRE_PLANTILLA: item?.NOMBRE_PLANTILLA ?? '',
			CORR_TIPO_CONTRATACION:
				item?.CORR_TIPO_CONTRATACION != null ? Number(item.CORR_TIPO_CONTRATACION) : null,
			NOMBRE_TIPO_CONTRATACION: item?.NOMBRE_TIPO_CONTRATACION ?? '',
			NUMERO_VERSION: item?.NUMERO_VERSION != null ? Number(item.NUMERO_VERSION) : null,
			NOMBRE_VERSION: item?.NOMBRE_VERSION ?? '',
			CUERPO_CONTRATO: item?.CUERPO_CONTRATO ?? '',
			FECHA_INICIO: item?.FECHA_INICIO ?? null,
			FECHA_FIN: item?.FECHA_FIN ?? null,
			FECHA_FIRMA: item?.FECHA_FIRMA ?? null,
			ESTADO_CONTRATO: item?.ESTADO_CONTRATO != null ? Number(item.ESTADO_CONTRATO) : 1,
			NOMBRE_ESTADO_CONTRATO: item?.NOMBRE_ESTADO_CONTRATO ?? '',
			NOMBRE_ARCHIVO: item?.NOMBRE_ARCHIVO ?? null,
			RUTA_ARCHIVO: item?.RUTA_ARCHIVO ?? null,
			TIENE_ARCHIVO_FIRMADO: !!item?.TIENE_ARCHIVO_FIRMADO,
			FECHA_CARGA: item?.FECHA_CARGA ?? null,
			MOTIVO_ANULACION: item?.MOTIVO_ANULACION ?? null,
			USUARIO_CREA: item?.USUARIO_CREA ?? null,
			ESTACION_CREA: item?.ESTACION_CREA ?? null,
			FECHA_CREA: item?.FECHA_CREA ?? null,
			USUARIO_ACTU: item?.USUARIO_ACTU ?? null,
			ESTACION_ACTU: item?.ESTACION_ACTU ?? null,
			FECHA_ACTU: item?.FECHA_ACTU ?? null,
		};
	}

	private normalizarFechaContrato(valor: string | Date | null | undefined): Date | null {
		if (!valor) {
			return null;
		}
		if (valor instanceof Date) {
			return Number.isNaN(valor.getTime()) ? null : valor;
		}
		const txt = `${valor}`.trim();
		const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(txt);
		if (m) {
			return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
		}
		const parsed = new Date(txt);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	private formatearFechaApi(valor: string | Date | null | undefined): string | null {
		const date = this.normalizarFechaContrato(valor);
		if (!date) {
			return null;
		}
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	private extraerMarcadoresSinReemplazar(html: string): string[] {
		const encontrados: string[] = [];
		const regex = /\{\{\s*([A-Z0-9_]+)\s*\}\}/gi;
		let match: RegExpExecArray | null;
		while ((match = regex.exec(html ?? '')) !== null) {
			const key = `${match[1] ?? ''}`.toUpperCase();
			if (key && !encontrados.includes(key)) {
				encontrados.push(key);
			}
		}
		return encontrados;
	}

	// Qué hace: Permite hacer scroll horizontal en la grilla de contratos mediante clic y arrastre desde cualquier fila.
	// Cómo lo hace: Captura mousedown, mousemove y mouseup en .empleado-contrato-grid .dx-datagrid-rowsview y actualiza scrollLeft según el desplazamiento del ratón.
	private initDragToScrollContratos(): void {
		const host = this.elRef.nativeElement;
		let isDown = false;
		let startX = 0;
		let scrollLeft = 0;
		let hasDragged = false;
		let scrollContainer: HTMLElement | null = null;

		// Qué hace: Inicia el arrastre horizontal sobre registros sin interferir con la barra de scroll inferior ni controles.
		// Cómo lo hace: Ignora clics en la barra de scroll y controles interactivos, asegurando que el clic provenga de filas de la grilla de contratos.
		const onMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) return; // Solo botón izquierdo
			const target = e.target as HTMLElement;

			// Ignorar clics sobre la barra de desplazamiento inferior y sus deslizadores
			if (target.closest('.dx-scrollable-scrollbar, .dx-scrollable-scroll, .dx-scrollbar-horizontal, .dx-scrollbar-vertical')) {
				return;
			}

			// No activar arrastre sobre botones, inputs, links o iconos de acción
			if (target.closest('button, .dx-button, a, input, select, textarea, .dx-checkbox, .dx-link, [role="button"]')) {
				return;
			}

			// Verificar que el clic provenga de las filas/contenido de la grilla de contratos
			const rowsView = target.closest('.empleado-contrato-grid .dx-datagrid-rowsview');
			const isTableContent = !!target.closest('.dx-data-row, .dx-datagrid-content');
			if (!rowsView || !isTableContent) return;

			scrollContainer = host.querySelector('.empleado-contrato-grid .dx-datagrid-rowsview .dx-scrollable-container');
			if (!scrollContainer) return;

			isDown = true;
			hasDragged = false;
			startX = e.pageX;
			scrollLeft = scrollContainer.scrollLeft;
		};

		const onMouseMove = (e: MouseEvent) => {
			if (!isDown || !scrollContainer) return;
			const walk = e.pageX - startX;
			if (Math.abs(walk) > 4) {
				hasDragged = true;
				scrollContainer.scrollLeft = scrollLeft - walk;
				document.body.style.cursor = 'grabbing';
				document.body.style.userSelect = 'none';
			}
		};

		const onMouseUp = () => {
			if (!isDown) return;
			isDown = false;
			document.body.style.cursor = '';
			document.body.style.removeProperty('user-select');
			if (hasDragged) {
				const suppressClick = (ev: MouseEvent) => {
					ev.stopPropagation();
					ev.preventDefault();
					window.removeEventListener('click', suppressClick, true);
				};
				window.addEventListener('click', suppressClick, true);
			}
		};

		host.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		this.cleanupDragToScrollContratos = () => {
			host.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}
}

