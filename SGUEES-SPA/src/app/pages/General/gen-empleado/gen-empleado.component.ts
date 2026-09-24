// Qué hace: browse + formulario Nuevo/Editar de Empleado (Iniciar + Personales + Documentos + Familiares + Formación + Experiencia + Adicional + Referencias).
// Cómo: grilla browse; Guardar según tab; personales vía SP; documentos/familiares/hijos/formación/experiencia/UEES/referencias anidados.
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
import { GenPersonaParentescoContacto } from './gen-persona-parentesco-contacto/models/gen-persona-parentesco-contacto';
import { GenEmpleadoService } from './gen-empleado.service';
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

	/** Submodal agregar/editar domicilio. */
	submodalDomicilioVisible = false;
	submodalDomicilioEditIndex: number | null = null;
	submodalDomicilioDraft: any = {};
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

	/** Código ISO / NOMBRE_CORTO de El Salvador en GEN_PAIS. */
	private static readonly CODIGO_PAIS_EL_SALVADOR = 'SV';

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
		this.modelPersonaNaturalBase = this.fillPersonaNatural(this.modelPersonaNatural);
		this.modelEmpleadoBase = this.extraerDatosEmpleado(this.model);
		this.snapshotEdicionPendiente = true;
		this.fotoUrlNueva = '';
		this.revocarFotoLocal();
		this.popupPersonalesVisible = true;
	}

	// Qué hace: cierra el modal y restaura personales/documentos/.../referencias/foto si canceló.
	cerrarPopupPersonales(restaurar = true): void {
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
			this.fotoUrlNueva = '';
			this.revocarFotoLocal();
			this.refrescarTerritorioDesdeModelo();
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

	// Qué hace: exige formato de correo y de teléfono nacional en Datos de empleado.
	// Cómo: vacío es válido; si hay texto, correo con @ y dominio, teléfono con 8 dígitos.
	private mensajeDatosEmpleadoInvalido(): string | null {
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
					onSuccess?.();
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

	// Qué hace: tipos visibles en el selector (lista estable, no un getter).
	// Cómo: se rearma solo al abrir el submodal, al cargar el lookup o al cambiar Es extranjero.
	tiposParentescoContactoVisibles: any[] = [];

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

	/** Qué hace: alterna ACTIVO_DOMICILIO en memoria (guardado al Guardar cambios). */
	toggleActivoDomicilio(index: number, event?: Event): void {
		event?.stopPropagation();
		const row = this.domicilios[index];
		if (!row) {
			return;
		}
		this.domicilios = this.domicilios.map((d, i) =>
			i === index ? { ...d, ACTIVO_DOMICILIO: !d.ACTIVO_DOMICILIO } : d
		);
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
			ACTIVO_DOMICILIO: true,
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
		this.asegurarCatalogoPaisDomicilio(false);
		const pais = Number(this.submodalDomicilioDraft.CORR_PAIS ?? 0);
		if (this.esEmpleadoDomiciliado && pais > 0) {
			this.cargarDeptoDomicilio(pais);
			const depto = Number(this.submodalDomicilioDraft.CORR_DEPTO ?? 0);
			if (depto > 0) {
				this.cargarMunicipioDomicilio(pais, depto);
				const mun = Number(this.submodalDomicilioDraft.CORR_MUNICIPIO ?? 0);
				if (mun > 0) {
					this.cargarDistritoDomicilio(pais, depto, mun);
				}
			}
		} else {
			this.mCORR_DEPTO_DOMICILIO = [];
			this.mCORR_MUNICIPIO_DOMICILIO = [];
			this.mCORR_DISTRITO_DOMICILIO = [];
		}
		this.submodalDomicilioVisible = true;
	}

	cerrarSubmodalDomicilio(): void {
		this.submodalDomicilioVisible = false;
		this.submodalDomicilioEditIndex = null;
		this.submodalDomicilioDraft = {};
		this.mCORR_PAIS_DOMICILIO = [];
		this.mCORR_DEPTO_DOMICILIO = [];
		this.mCORR_MUNICIPIO_DOMICILIO = [];
		this.mCORR_DISTRITO_DOMICILIO = [];
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

	private cargarDeptoDomicilio(corrPais: number): void {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: corrPais }];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_DEPTO_DOMICILIO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private cargarMunicipioDomicilio(corrPais: number, corrDepto: number): void {
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
				},
			});
	}

	private cargarDistritoDomicilio(corrPais: number, corrDepto: number, corrMun: number): void {
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
				},
			});
	}

	guardarSubmodalDomicilio(): void {
		const direccion = `${this.submodalDomicilioDraft?.DIRECCION ?? ''}`.trim();
		if (!direccion) {
			this.notifyFx('Ingrese la dirección.', NotifyType.Warning);
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
}

