import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { DxCheckBoxComponent } from 'devextreme-angular/ui/check-box';
import { confirm } from 'devextreme/ui/dialog';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaProspecto } from './models/aca-prospecto';
import { AcaProspectoService } from './aca-prospecto.service';
import { AcaProspectoPersonaService } from './aca-prospecto-persona/aca-prospecto-persona.service';
import { AcaProspectoContactoService, TIPO_CORREO } from './aca-prospecto-contacto/aca-prospecto-contacto.service';
import { AcaProspectoFamiliarService } from './aca-prospecto-familiar/aca-prospecto-familiar.service';
import { AcaProspectoLimitacionFisicaService } from './aca-prospecto-limitacion-fisica/aca-prospecto-limitacion-fisica.service';
import { AcaProspectoDeportacionService } from './aca-prospecto-deportacion/aca-prospecto-deportacion.service';
import { AcaProspectoMedioOrigenService, MEDIO_OTRO, MEDIO_REFERIDO } from './aca-prospecto-medio-origen/aca-prospecto-medio-origen.service';
import { AcaProspectoDocumentoService } from './aca-prospecto-documento/aca-prospecto-documento.service';
import { AcaProspectoBitacoraService } from './aca-prospecto-bitacora/aca-prospecto-bitacora.service';
import {
    AcaProspectoEstudioService,
    SECCION_MEDIA,
    SECCION_UNIVERSIDAD,
    SECCION_GRADUADO_UEES,
} from './aca-prospecto-estudio/aca-prospecto-estudio.service';
import { AcaProspectoEmpleoService } from './aca-prospecto-empleo/aca-prospecto-empleo.service';

// Qué hace: consulta y edición de prospectos de pregrado (Académico → Solicitud de nuevo ingreso).
// Cómo lo hace: el listado trae todos los ciclos y el ciclo va en la grilla; un clic en la fila abre la
//               consulta (modo Not_Defined, sin Guardar) y carga las tablas hijas en una pestaña por bloque.
//               Editar = lápiz de la grilla (editarClick, estándar) o botón "Modificar" desde la
//               consulta: los formularios se habilitan y Guardar actualiza tabla por tabla
//               (persona → empleo → socioeconómico → respuestas → prospecto), como el resto del ERP
//               (eFramework no maneja transacciones). Las grillas hijas siguen de solo lectura (fase 2).
@Component({
    selector: 'app-aca-prospecto-nuevo-ingreso',
    templateUrl: './aca-prospecto.component.html',
    styleUrls: ['./aca-prospecto.component.scss'],
})
export class AcaProspectoComponent extends CBaseComponent implements OnInit {
    //#region <Declarando Variables>
    @ViewChild('fPersona', { static: false }) formPersona?: DxFormComponent;
    @ViewChild('fEmpleo', { static: false }) formEmpleo?: DxFormComponent;
    @ViewChild('fContacto', { static: false }) formContacto?: DxFormComponent;
    @ViewChild('fMedio', { static: false }) formMedio?: DxFormComponent;
    @ViewChild('fLimitacion', { static: false }) formLimitacion?: DxFormComponent;
    @ViewChild('fDeportacion', { static: false }) formDeportacion?: DxFormComponent;
    @ViewChild('fFamiliar', { static: false }) formFamiliar?: DxFormComponent;
    @ViewChild('fEmergencia', { static: false }) formEmergencia?: DxFormComponent;
    @ViewChild('fEstudioMedia', { static: false }) formEstudioMedia?: DxFormComponent;
    @ViewChild('fEstudioUniversidad', { static: false }) formEstudioUniversidad?: DxFormComponent;
    @ViewChild('fEstudioUees', { static: false }) formEstudioUees?: DxFormComponent;
    // Interruptores de encabezado: empleo y las dos secciones opcionales de estudios.
    @ViewChild('chkTrabaja', { static: false }) chkTrabaja?: DxCheckBoxComponent;
    @ViewChild('chkDiscapacidad', { static: false }) chkDiscapacidad?: DxCheckBoxComponent;
    @ViewChild('chkDeportado', { static: false }) chkDeportado?: DxCheckBoxComponent;
    @ViewChild('chkUniversidad', { static: false }) chkUniversidad?: DxCheckBoxComponent;
    @ViewChild('chkUees', { static: false }) chkUees?: DxCheckBoxComponent;

    protected override mttoGridKeyExpr = 'CORR_PROSPECTO';
    readOnly = true;
    // Texto del botón "Modificar" de la barra: solo en consulta y con permiso U.
    btnModificar = '';
    btnAprobar = '';
    btnRechazar = '';
    btnRevertir = '';
    btnEnviar = '';
    esBorrador = false;
    modelsPendientes: any[] = [];
    modelsBorrador: any[] = [];
    popupAprobarVisible = false;
    observacionAprobar = '';
    accionFlujo: 'aprobar' | 'rechazar' | 'revertir' = 'aprobar';
    private corrAprobarConsultado = 0;
    private corrAprobarResuelto = 0;
    private filaGuardada: any = null;
    private mensajeGuardado = '';
    model: any = this.fillData();
    itemsCarrera: any[] = [];

    // Qué hace: catálogos de los lookups de edición (se cargan una vez al abrir la pantalla).
    mCORR_SEXO: any[] = [];
    mCORR_ESTADO_CIVIL: any[] = [];
    mCORR_TIPO_SANGRE: any[] = [];
    mCORR_RELIGION: any[] = [];
    mCORR_PAIS: any[] = [];
    mCORR_SECTOR_LABORAL: any[] = [];
    mCORR_CARRERA: any[] = [];
    mCORR_PARENTESCO: any[] = [];
    mCORR_LIMITACION_FISICA: any[] = [];
    // Códigos telefónicos de país ("+503 El Salvador"), del mismo SP que usa el registro del portal.
    mCODIGO_PAIS: any[] = [];
    mCORR_MEDIO_ORIGEN: any[] = [];
    // Oferta para el cambio de carrera: carreras del ciclo del prospecto y modalidades de la elegida.
    mCORR_CARRERA_CICLO: any[] = [];
    mCORR_MODALIDAD: any[] = [];
    // Ciclos a los que se puede mover el prospecto desde Datos del prospecto.
    mCICLO_CAMBIO: any[] = [];
    // Dependientes del país/departamento del registro abierto.
    mCORR_DEPTO_RESIDENCIA: any[] = [];
    mCORR_MUNICIPIO_RESIDENCIA: any[] = [];
    mCORR_DEPTO_EMPLEO: any[] = [];
    mCORR_MUNICIPIO_EMPLEO: any[] = [];
    mCORR_DEPTO_ESTUDIO: any[] = [];

    // Qué hace: cuenta las consultas pendientes del detalle para apagar el load panel al terminar.
    cargasPendientes = 0;

    // Pestaña Información personal
    personaModel: any = null;
    itemsPersona: any[] = [];
    // Contactos: N teléfonos y correos; uno principal por tipo (es el que usa el portal). Misma
    // mecánica en memoria que Familia: alta, cambio y baja se aplican al guardar.
    contactos: any[] = [];
    columnsContacto: any[] = [];
    summaryContacto: any = {};
    contactoModel: any = null;
    contactoEditando: any = null;
    itemsContacto: any[] = [];
    contactosEliminar: any[] = [];
    contactoOriginal: Record<number, string> = {};
    // Familia: N familiares por prospecto; uno de ellos es el contacto de emergencia. La grilla se
    // trabaja en memoria (alta, cambio y baja) y todo se aplica al guardar, como el resto de la pantalla.
    familiares: any[] = [];
    columnsFamiliar: any[] = [];
    summaryFamiliar: any = {};
    familiarModel: any = null;
    // Fila original que se abrió en el formulario: se reemplaza por referencia al aceptar.
    familiarEditando: any = null;
    itemsFamiliar: any[] = [];
    itemsEmergencia: any[] = [];
    emergenciaModel: any = null;
    familiaresEliminar: any[] = [];
    familiarOriginal: Record<number, string> = {};
    // Salud y Migratorio: N filas cada una, misma mecánica en memoria que Familia. Las banderas
    // POSEE_DISCAPACIDAD y HA_SIDO_DEPORTADO de la persona son espejo: las mantiene el API.
    limitaciones: any[] = [];
    columnsLimitacion: any[] = [];
    summaryLimitacion: any = {};
    limitacionModel: any = null;
    limitacionEditando: any = null;
    itemsLimitacion: any[] = [];
    limitacionesEliminar: any[] = [];
    limitacionOriginal: Record<number, string> = {};
    // Qué hace: el analista desmarcó "¿Posee discapacidad?" y la limitación se borra al guardar.
    discapacidadEliminar = false;
    private limitacionesCargadas = false;
    deportaciones: any[] = [];
    columnsDeportacion: any[] = [];
    summaryDeportacion: any = {};
    deportacionModel: any = null;
    deportacionEditando: any = null;
    itemsDeportacion: any[] = [];
    deportacionesEliminar: any[] = [];
    deportacionOriginal: Record<number, string> = {};
    // Qué hace: el analista desmarcó "¿Ha sido deportado?" y la deportación se borra al guardar.
    deportacionEliminar = false;
    private deportacionesCargadas = false;
    // Medios de origen: N, sin repetir el medio. "Otro" y "Referido amigo/familiar" llevan campos propios.
    medios: any[] = [];
    columnsMedio: any[] = [];
    summaryMedio: any = {};
    medioModel: any = null;
    medioEditando: any = null;
    itemsMedio: any[] = [];
    mediosEliminar: any[] = [];
    medioOriginal: Record<number, string> = {};

    // Pestaña Información académica: tres secciones de estudios, una fila cada una (como el portal).
    // La media siempre existe; las otras dos se gobiernan con el interruptor de su encabezado.
    estudioMedia: any = null;
    estudioUniversidad: any = null;
    estudioUees: any = null;
    itemsEstudioMedia: any[] = [];
    itemsEstudioUniversidad: any[] = [];
    itemsEstudioUees: any[] = [];
    estudioUniversidadEliminar = false;
    estudioUeesEliminar = false;
    // Qué hace: foto de cada sección tal como se cargó, para guardar solo lo que el usuario tocó.
    // Cómo lo hace: guarda el payload serializado; así una sección que nadie editó no se envía ni se
    //               valida, y un dato viejo incompleto no impide trabajar en las otras secciones.
    estudioOriginal: Record<string, string> = {};
    // Misma razón que empleoCargado: no inventar una educación media antes de saber si ya existe.
    estudiosCargados = false;

    // Pestaña Información económica
    empleoModel: any = null;
    itemsEmpleo: any[] = [];
    // Qué hace: estado del empleo según el interruptor "Trabaja" (se resuelve al guardar).
    empleoNuevo = false;
    empleoEliminar = false;
    // Qué hace: avisa que la consulta del empleo ya respondió.
    // Cómo lo hace: las consultas del detalle van en paralelo; sin esto, si la persona llega primero
    //               y declara que trabaja, se prepararía un empleo "nuevo" aunque ya tenga uno.
    empleoCargado = false;

    // Documentos que aplican a esta solicitud (tipo 104 y regla del prospecto).
    documentos: any[] = [];
    bitacoras: any[] = [];
    subiendoDocumento = false;
    columnsDocumento: any[] = [];
    columnsBitacora: any[] = [];
    summaryDocumento: any = {};
    // #endregion

    // Qué hace: esta pantalla es solo la solicitud de nuevo ingreso.
    // Cómo lo hace: deja fija la parte académica y no carga el estudio socioeconómico.
    get esAcademico(): boolean {
        return true;
    }

    get esEconomico(): boolean {
        return false;
    }

    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: AcaProspectoService,
        private servicePersona: AcaProspectoPersonaService,
        private serviceContacto: AcaProspectoContactoService,
        private serviceFamiliar: AcaProspectoFamiliarService,
        private serviceLimitacion: AcaProspectoLimitacionFisicaService,
        private serviceDeportacion: AcaProspectoDeportacionService,
        private serviceMedio: AcaProspectoMedioOrigenService,
        private serviceEstudio: AcaProspectoEstudioService,
        private serviceEmpleo: AcaProspectoEmpleoService,
        private serviceDocumento: AcaProspectoDocumentoService,
        private serviceBitacora: AcaProspectoBitacoraService,
        // Qué hace: devuelve a Angular el hilo tras los diálogos de DevExtreme (su promesa resuelve fuera
        //           de la zona y la pantalla no se refrescaría sola).
        private zone: NgZone
    ) {
        super(appInfoService, router);
        this.aplicarColumnasLista();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();
        this.prepararColumnasDocumento();
        this.columnsBitacora = this.serviceBitacora.getColumns();
        this.summaryDocumento = this.serviceDocumento.getSummary();
        this.itemsCarrera = this.service.getItemsCarrera();
        this.itemsPersona = this.servicePersona.getItems();
        this.columnsContacto = this.serviceContacto.getColumns();
        this.summaryContacto = this.serviceContacto.getSummary();
        this.itemsContacto = this.serviceContacto.getItems();
        this.columnsFamiliar = this.serviceFamiliar.getColumns();
        this.summaryFamiliar = this.serviceFamiliar.getSummary();
        this.itemsFamiliar = this.serviceFamiliar.getItems();
        this.itemsEmergencia = this.serviceFamiliar.getItemsEmergencia();
        this.columnsLimitacion = this.serviceLimitacion.getColumns();
        this.summaryLimitacion = this.serviceLimitacion.getSummary();
        this.itemsLimitacion = this.serviceLimitacion.getItems();
        this.columnsDeportacion = this.serviceDeportacion.getColumns();
        this.summaryDeportacion = this.serviceDeportacion.getSummary();
        this.itemsDeportacion = this.serviceDeportacion.getItems();
        this.columnsMedio = this.serviceMedio.getColumns();
        this.summaryMedio = this.serviceMedio.getSummary();
        this.itemsMedio = this.serviceMedio.getItems();
        this.itemsEstudioMedia = this.serviceEstudio.getItemsMedia();
        this.itemsEstudioUniversidad = this.serviceEstudio.getItemsUniversidad();
        this.itemsEstudioUees = this.serviceEstudio.getItemsUees();
        this.itemsEmpleo = this.serviceEmpleo.getItems();
        this.selectedLookUpCORR_SEXO = this.selectedLookUpCORR_SEXO.bind(this);
        this.selectedLookUpCORR_ESTADO_CIVIL = this.selectedLookUpCORR_ESTADO_CIVIL.bind(this);
        this.selectedLookUpCORR_TIPO_SANGRE = this.selectedLookUpCORR_TIPO_SANGRE.bind(this);
        this.selectedLookUpCORR_RELIGION = this.selectedLookUpCORR_RELIGION.bind(this);
        this.selectedLookUpCORR_PAIS = this.selectedLookUpCORR_PAIS.bind(this);
        this.selectedLookUpCORR_DEPTO = this.selectedLookUpCORR_DEPTO.bind(this);
        this.selectedLookUpCORR_MUNICIPIO = this.selectedLookUpCORR_MUNICIPIO.bind(this);
        this.selectedLookUpCORR_SECTOR_LABORAL = this.selectedLookUpCORR_SECTOR_LABORAL.bind(this);
        this.selectedLookUpCORR_CARRERA = this.selectedLookUpCORR_CARRERA.bind(this);
        this.selectedLookUpCORR_PARENTESCO = this.selectedLookUpCORR_PARENTESCO.bind(this);
        this.puedeEliminarContacto = this.puedeEliminarContacto.bind(this);
        this.selectedLookUpCORR_LIMITACION_FISICA = this.selectedLookUpCORR_LIMITACION_FISICA.bind(this);
        this.selectedLookUpCORR_MEDIO_ORIGEN = this.selectedLookUpCORR_MEDIO_ORIGEN.bind(this);
        this.selectedLookUpCORR = this.selectedLookUpCORR.bind(this);
        this.selectedLookUpCICLO_CAMBIO = this.selectedLookUpCICLO_CAMBIO.bind(this);
    }

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.llenaComboBox();
        this.consultar();
    }

    inicializaOpciones() {}
    // #endregion

    //#region <Manejo de Combos>
    llenaComboBox() {
        this.getCORR_SEXO();
        this.getCORR_ESTADO_CIVIL();
        this.getCORR_TIPO_SANGRE();
        this.getCORR_RELIGION();
        this.getCORR_PAIS();
        this.getCORR_SECTOR_LABORAL();
        this.getCORR_CARRERA();
        this.getCORR_PARENTESCO();
        this.getCORR_LIMITACION_FISICA();
        this.getCODIGO_PAIS();
        this.getCORR_MEDIO_ORIGEN();
    }

    // Qué hace: llave seleccionada de cada lookup de edición (app-data-lookup exige la función).
    selectedLookUpCORR_SEXO(vRow: any): any {
        return vRow?.[0]?.CORR_SEXO;
    }

    selectedLookUpCORR_ESTADO_CIVIL(vRow: any): any {
        return vRow?.[0]?.CORR_ESTADO_CIVIL;
    }

    selectedLookUpCORR_TIPO_SANGRE(vRow: any): any {
        return vRow?.[0]?.CORR_TIPO_SANGRE;
    }

    selectedLookUpCORR_RELIGION(vRow: any): any {
        return vRow?.[0]?.CORR_RELIGION;
    }

    selectedLookUpCORR_PAIS(vRow: any): any {
        return vRow?.[0]?.CORR_PAIS;
    }

    selectedLookUpCORR_DEPTO(vRow: any): any {
        return vRow?.[0]?.CORR_DEPTO;
    }

    selectedLookUpCORR_MUNICIPIO(vRow: any): any {
        return vRow?.[0]?.CORR_MUNICIPIO;
    }

    selectedLookUpCORR_SECTOR_LABORAL(vRow: any): any {
        return vRow?.[0]?.CORR_SECTOR_LABORAL;
    }

    selectedLookUpCORR_CARRERA(vRow: any): any {
        return vRow?.[0]?.CORR_CARRERA;
    }

    selectedLookUpCORR_PARENTESCO(vRow: any): any {
        return vRow?.[0]?.CORR_PARENTESCO;
    }

    selectedLookUpCORR_LIMITACION_FISICA(vRow: any): any {
        return vRow?.[0]?.CORR_LIMITACION_FISICA;
    }

    selectedLookUpCORR_MEDIO_ORIGEN(vRow: any): any {
        return vRow?.[0]?.CORR_MEDIO_ORIGEN;
    }

    // Qué hace: llave de los catálogos de la oferta académica (carreras y modalidades), que la
    //           devuelven en la columna CORR.
    selectedLookUpCORR(vRow: any): any {
        return vRow?.[0]?.CORR;
    }

    selectedLookUpCICLO_CAMBIO(vRow: any): any {
        return vRow?.[0]?.CICLO;
    }

    getCORR_SEXO() {
        this.cargarLookup('GEN_SEXO', 'GetCORR_SEXO', (data) => (this.mCORR_SEXO = data));
    }

    getCORR_ESTADO_CIVIL() {
        this.cargarLookup('GEN_ESTADO_CIVIL', 'GetCORR_ESTADO_CIVIL', (data) => (this.mCORR_ESTADO_CIVIL = data));
    }

    getCORR_TIPO_SANGRE() {
        this.cargarLookup('GEN_TIPO_SANGRE', 'GetCORR_TIPO_SANGRE', (data) => (this.mCORR_TIPO_SANGRE = data));
    }

    getCORR_RELIGION() {
        this.cargarLookup('GEN_RELIGION', 'GetCORR_RELIGION', (data) => (this.mCORR_RELIGION = data));
    }

    // Qué hace: un solo catálogo de países para nacionalidad, procedencia, residencia y empleo.
    getCORR_PAIS() {
        this.cargarLookup('GEN_PAIS', 'GetCORR_PAIS', (data) => (this.mCORR_PAIS = data));
    }

    getCORR_SECTOR_LABORAL() {
        this.cargarLookup('GEN_SECTOR_LABORAL', 'GetCORR_SECTOR_LABORAL', (data) => (this.mCORR_SECTOR_LABORAL = data));
    }

    // Qué hace: carreras activas de la empresa, para el bloque "Graduado UEES" de los estudios.
    getCORR_CARRERA() {
        this.cargarLookup('ACA_CARRERAS', 'GetCORR_CARRERA', (data) => (this.mCORR_CARRERA = data));
    }

    // Qué hace: parentescos activos, para los familiares del prospecto.
    getCORR_PARENTESCO() {
        this.cargarLookup('GEN_PARENTESCO', 'GetCORR_PARENTESCO', (data) => (this.mCORR_PARENTESCO = data));
    }

    // Qué hace: limitaciones físicas activas, para la sección Salud.
    getCORR_LIMITACION_FISICA() {
        this.cargarLookup('GEN_LIMITACIONES_FISICA', 'GetCORR_LIMITACION_FISICA', (data) => (this.mCORR_LIMITACION_FISICA = data));
    }

    // Qué hace: medios de origen activos, para "¿cómo se enteró de la universidad?".
    getCORR_MEDIO_ORIGEN() {
        this.cargarLookup('GEN_MEDIO_ORIGEN', 'GetCORR_MEDIO_ORIGEN', (data) => (this.mCORR_MEDIO_ORIGEN = data));
    }

    // Qué hace: códigos de país para los teléfonos, leídos del SP del registro a través del API.
    // Cómo lo hace: si la ficha de un contacto ya estaba abierta, rearma sus campos con la lista.
    getCODIGO_PAIS() {
        this.cargarLookup('ACA_PROSPECTO_CONTACTO', 'GetCODIGO_PAIS', (data) => {
            this.mCODIGO_PAIS = this.serviceContacto.getCodigosPais(data);
            if (this.contactoModel) {
                this.refrescarItemsContacto();
            }
        });
    }

    // Qué hace: departamentos y municipios del país/departamento de residencia.
    // Cómo lo hace: mismo patrón que gen-empresa (filtro por país y departamento en el lookup).
    getCORR_DEPTO_RESIDENCIA(corrPais?: number | null) {
        if (!corrPais) {
            this.mCORR_DEPTO_RESIDENCIA = [];
            return;
        }
        const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: corrPais }];
        this.cargarLookup('GEN_DEPTO', 'GetCORR_DEPTO', (data) => (this.mCORR_DEPTO_RESIDENCIA = data), xWhere);
    }

    getCORR_MUNICIPIO_RESIDENCIA(corrPais?: number | null, corrDepto?: number | null) {
        if (!corrPais || !corrDepto) {
            this.mCORR_MUNICIPIO_RESIDENCIA = [];
            return;
        }
        const xWhere: IParam[] = [
            { Parameter: 'CORR_PAIS', Value: corrPais },
            { Parameter: 'CORR_DEPTO', Value: corrDepto },
        ];
        this.cargarLookup('GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', (data) => (this.mCORR_MUNICIPIO_RESIDENCIA = data), xWhere);
    }

    getCORR_DEPTO_EMPLEO(corrPais?: number | null) {
        if (!corrPais) {
            this.mCORR_DEPTO_EMPLEO = [];
            return;
        }
        const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: corrPais }];
        this.cargarLookup('GEN_DEPTO', 'GetCORR_DEPTO', (data) => (this.mCORR_DEPTO_EMPLEO = data), xWhere);
    }

    getCORR_MUNICIPIO_EMPLEO(corrPais?: number | null, corrDepto?: number | null) {
        if (!corrPais || !corrDepto) {
            this.mCORR_MUNICIPIO_EMPLEO = [];
            return;
        }
        const xWhere: IParam[] = [
            { Parameter: 'CORR_PAIS', Value: corrPais },
            { Parameter: 'CORR_DEPTO', Value: corrDepto },
        ];
        this.cargarLookup('GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', (data) => (this.mCORR_MUNICIPIO_EMPLEO = data), xWhere);
    }

    // Qué hace: departamentos del país de la institución de educación media.
    getCORR_DEPTO_ESTUDIO(corrPais?: number | null) {
        if (!corrPais) {
            this.mCORR_DEPTO_ESTUDIO = [];
            return;
        }
        const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: corrPais }];
        this.cargarLookup('GEN_DEPTO', 'GetCORR_DEPTO', (data) => (this.mCORR_DEPTO_ESTUDIO = data), xWhere);
    }

    // Qué hace: al cambiar el país/departamento se limpian los dependientes y se recargan sus catálogos.
    onPaisResidenciaChange(value: number): void {
        if (!this.personaModel) {
            return;
        }
        this.personaModel.CORR_DEPTO_RESIDENCIA = null;
        this.personaModel.CORR_MUNICIPIO_RESIDENCIA = null;
        this.mCORR_MUNICIPIO_RESIDENCIA = [];
        this.getCORR_DEPTO_RESIDENCIA(value);
    }

    onDeptoResidenciaChange(value: number): void {
        if (!this.personaModel) {
            return;
        }
        this.personaModel.CORR_MUNICIPIO_RESIDENCIA = null;
        this.getCORR_MUNICIPIO_RESIDENCIA(this.personaModel.CORR_PAIS_RESIDENCIA, value);
    }

    onPaisEmpleoChange(value: number): void {
        if (!this.empleoModel) {
            return;
        }
        this.empleoModel.CORR_DEPTO = null;
        this.empleoModel.CORR_MUNICIPIO = null;
        this.mCORR_MUNICIPIO_EMPLEO = [];
        this.getCORR_DEPTO_EMPLEO(value);
    }

    onDeptoEmpleoChange(value: number): void {
        if (!this.empleoModel) {
            return;
        }
        this.empleoModel.CORR_MUNICIPIO = null;
        this.getCORR_MUNICIPIO_EMPLEO(this.empleoModel.CORR_PAIS, value);
    }

    onPaisEstudioChange(value: number): void {
        if (!this.estudioMedia) {
            return;
        }
        this.estudioMedia.CORR_DEPTO = null;
        this.getCORR_DEPTO_ESTUDIO(value);
    }

    // Qué hace: llama a un lookup Get{CAMPO}_ACA_PROSPECTO del catálogo indicado.
    // Cómo lo hace: centraliza take(1), errores y la asignación del resultado.
    private cargarLookup(controller: string, metodo: string, asignar: (data: any[]) => void, xWhere?: IParam[]): void {
        this.appInfoService
            .getLookUp('ACA_PROSPECTO_NUEVO_INGRESO', controller, metodo, xWhere, environment.UrlGENERALAPI)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        asignar(response.Data ?? []);
                    } else {
                        this.notifyApiResponse(response);
                    }
                },
                error: (error: any) => {
                    this.notifyApiError(error);
                },
            });
    }
    // #endregion

    //#region <Metodos Mtto>
    // Qué hace: modelo del encabezado; con registro, dispara la carga de las tablas hijas.
    // Cómo lo hace: igual que flujos (fillData → cargarPasos); lo llaman rowDblClick (consulta)
    //               y editarClick (edición desde la grilla).
    override fillData(xModel?: AcaProspecto): AcaProspecto {
        if (xModel !== undefined) {
            this.cargarDetalle(xModel.CORR_PROSPECTO);
            const fila = { ...xModel, ESTADO_SOLICITUD: this.service.textoEstadoSolicitud(xModel) };
            this.model = fila;
            this.evaluarPuedeAprobar(xModel.CORR_PROSPECTO);
            return fila;
        }
        this.btnAprobar = '';
        this.btnRechazar = '';
        this.btnRevertir = '';
        return {
            CORR_EMPRESA: 0,
            CORR_PROSPECTO: 0,
            CODIGO_PROSPECTO: '',
            ACTIVO_PROSPECTO: true,
            CORR_PROSPECTO_PERSONA: null,
            NOMBRES: '',
            APELLIDO1: '',
            APELLIDO2: '',
            NOMBRE_COMPLETO: '',
            DUI: '',
            CORR_PERIODO_ACADEMICO: 0,
            ANIO: 0,
            NUMERO_PERIODO: null,
            CICLO: '',
            CORR_PLAN_ACADEMICO: 0,
            CODIGO_PLAN: '',
            CORR_CARRERA: null,
            CODIGO_CARRERA: '',
            NOMBRE_CARRERA: '',
            CORR_MODALIDAD: null,
            NOMBRE_MODALIDAD: '',
            CORR_FACULTAD: null,
            NOMBRE_FACULTAD: '',
            FORMA_INGRESO: '',
            FORMA_INGRESO_TEXTO: '',
            ESTADO: '',
            ESTADO_TEXTO: '',
            CORR_ESTADO: null,
            NOMBRE_ESTADO: '',
            ESTADO_SOLICITUD: '',
            FINANCIA_ESTUDIOS: '',
            FECHA_REGISTRO: null,
        };
    }

    // Qué hace: texto del aviso de plazo en el panel del flujo.
    textoPlazoInscripcion(): string {
        return this.service.textoPlazo(this.model);
    }

    // Qué hace: color del aviso según los días que faltan para cerrar la inscripción.
    clasePlazoInscripcion(): string {
        return this.service.claseVence(this.model?.DIAS_VENCE);
    }

    // Qué hace: color del badge del flujo según el estado 104.
    // Cómo lo hace: 38 azul, 39 verde y 46 rojo, la misma regla de la grilla.
    claseEstadoSolicitud(): string {
        return this.service.claseEstadoSolicitud(this.model?.CORR_ESTADO);
    }

    // Qué hace: oculta Vence y el plazo cuando la solicitud ya fue aprobada.
    solicitudAprobada(): boolean {
        return this.service.solicitudAprobada(this.model);
    }

    // Qué hace: el paso Aprobación del analista es el actual mientras sigue Ingresada.
    enPasoAnalista(): boolean {
        return Number(this.model?.CORR_ESTADO) === 38;
    }

    // Qué hace: el paso Solicitud aprobada es el actual cuando ya se aprobó.
    enPasoAprobado(): boolean {
        return Number(this.model?.CORR_ESTADO) === 39;
    }

    // Qué hace: la solicitud cerró en rechazo. No se edita y el flujo muestra Rechazada.
    solicitudRechazada(): boolean {
        return Number(this.model?.CORR_ESTADO) === 46;
    }

    // Qué hace: el último lugar del flujo. Rechazada ocupa el de Solicitud aprobada, que no se alcanzó.
    tituloPasoCierre(): string {
        return this.solicitudRechazada() ? 'Rechazada' : 'Solicitud aprobada';
    }

    // Qué hace: verde si ya se aprobó, rojo si se rechazó y gris si todavía no llega.
    clasePasoCierre(): string {
        if (this.enPasoAprobado()) {
            return 'aca-prospecto-paso--hecho aca-prospecto-paso--aprobado';
        }
        if (this.solicitudRechazada()) {
            return 'aca-prospecto-paso--hecho aca-prospecto-paso--rechazado';
        }
        return 'aca-prospecto-paso--pendiente';
    }

    // Qué hace: la marca del último paso. Rechazada no muestra P3.
    marcaPasoCierre(): string {
        if (this.enPasoAprobado()) {
            return 'aca-prospecto-paso-marca--hecho';
        }
        if (this.solicitudRechazada()) {
            return 'aca-prospecto-paso-marca--rechazado';
        }
        return '';
    }

    // Qué hace: la inscripción del ciclo ya cerró, así que no hay acciones de flujo.
    // Cómo lo hace: el mismo corte de Vence: días negativos frente a FECHA_FIN_INSCRIPCION.
    inscripcionVencida(): boolean {
        return this.filaVencida(this.model);
    }

    // Qué hace: dice si esa fila ya pasó la fecha de fin de inscripción.
    // Cómo lo hace: DIAS_VENCE negativo. El día 0 todavía se puede enviar.
    filaVencida(fila: any): boolean {
        const dias = fila?.DIAS_VENCE;
        return dias !== null && dias !== undefined && !Number.isNaN(Number(dias)) && Number(dias) < 0;
    }

    // Qué hace: texto del botón Enviar, o vacío si no aplica.
    // Cómo lo hace: solo un borrador ya guardado, con permiso de editar y ciclo todavía abierto.
    textoBtnEnviar(corrProspecto: number): string {
        return this.esBorrador && this.permiteEdit && corrProspecto > 0 && !this.esAlta() && !this.inscripcionVencida()
            ? 'Enviar solicitud'
            : '';
    }

    // Qué hace: listado de prospectos de todos los ciclos.
    // Cómo lo hace: el ciclo va en cada fila; la barra ya no lo filtra.
    consultar() {
        this.loadingVisible = true;
        forkJoin({
            pendientes: this.service.getAll().pipe(take(1)),
            borradores: this.service.getBorradores().pipe(take(1)),
        }).subscribe({
            next: ({ pendientes, borradores }: any) => {
                if (pendientes?.Result) {
                    this.modelsPendientes = pendientes.Data || [];
                } else {
                    this.notifyApiResponse(pendientes);
                }
                if (borradores?.Result) {
                    this.modelsBorrador = borradores.Data || [];
                } else {
                    this.notifyApiResponse(borradores);
                }
                this.aplicarLista();
                this.loadingVisible = false;
            },
            error: (error: any) => {
                this.notifyApiError(error);
                this.loadingVisible = false;
            },
        });
    }

    // Qué hace: el número del círculo de cada pestaña de la lista.
    conteoTabLista(data: any): number {
        const total = data?.icon === 'edit' ? this.modelsBorrador : this.modelsPendientes;
        return total?.length || 0;
    }

    // Qué hace: el listado visible es el de la pestaña abierta.
    aplicarLista(): void {
        this.models = this.esBorrador ? this.modelsBorrador : this.modelsPendientes;
    }

    mostrarPendientes(): void {
        if (!this.esBorrador) {
            return;
        }
        this.esBorrador = false;
        this.btnEnviar = '';
        this.corrAprobarResuelto = 0;
        this.aplicarColumnasLista();
        this.aplicarLista();
    }

    mostrarBorrador(): void {
        if (this.esBorrador) {
            return;
        }
        this.esBorrador = true;
        this.btnAprobar = '';
        this.btnRechazar = '';
        this.btnRevertir = '';
        this.corrAprobarResuelto = 0;
        this.aplicarColumnasLista();
        this.aplicarLista();
    }

    // Qué hace: En el paso y Paso actual solo se pintan en Solicitudes pendientes.
    private aplicarColumnasLista(): void {
        this.columns = this.service.getColumns(!this.esBorrador);
    }

    // Qué hace: cambia la lista al pulsar la pestaña, igual que Datos personales y Contacto.
    onTabListaChanged(e: any): void {
        const indice = Number(e?.component?.option('selectedIndex'));
        if (indice === 1) {
            this.mostrarBorrador();
            return;
        }
        this.mostrarPendientes();
    }

    // Qué hace: abre el formulario para crear una solicitud y dejarla en borrador.
    // Cómo lo hace: no genera el CIF hasta Guardar y no llama al flujo. Enviar sigue siendo otro botón.
    override nuevo(): void {
        if (!this.permiteAdd || !this.esBorrador) {
            return;
        }
        this.btnEnviar = '';
        this.limpiarDetalle();
        this.model = this.fillData();
        this.model.ESTADO = 'P';
        this.model.ESTADO_SOLICITUD = 'Borrador';
        this.model.FORMA_INGRESO = 'NI';
        this.modelUpdate = { ...this.model };
        this.personaModel = this.personaVacia();
        this.AsignaStatus(UpdateType.Add);
        this.habilitar();
        this.cargarOfertaAcademica(0);
    }

    // Qué hace: el formulario está creando una solicitud que todavía no tiene CIF.
    esAlta(): boolean {
        return this.banderaMtto === UpdateType.Add;
    }

    // Qué hace: explica el encabezado según si se está creando o editando.
    textoSubtituloCabecera(): string {
        if (this.esAlta()) {
            return 'Alta: al guardar se genera el CIF y queda en Solicitudes borrador, sin enviar';
        }
        if (this.isForm() && this.esAcademico) {
            return 'Edición: ciclo, carrera, modalidad, forma de ingreso y financia estudios';
        }
        return this.isForm() ? 'Solo lectura: se edita desde Prospectos Académica' : 'Consulta de solo lectura';
    }

    // Qué hace: persona en blanco para llenar el alta antes de que exista el prospecto.
    private personaVacia(): any {
        return {
            CORR_EMPRESA: 0,
            CORR_PROSPECTO: 0,
            CORR_PROSPECTO_PERSONA: 0,
            NOMBRES: '',
            APELLIDO1: '',
            APELLIDO2: '',
            NOMBRE_COMPLETO: '',
            DUI: '',
            NIE: '',
            CARNET_RESIDENCIA: '',
            NIT: '',
            FECHA_NACIMIENTO: null,
            EDAD: null,
            LUGAR_NACIMIENTO: '',
            CORR_SEXO: null,
            SEXO: '',
            CORR_ESTADO_CIVIL: null,
            ESTADO_CIVIL: '',
            CORR_TIPO_SANGRE: null,
            TIPO_SANGRE: '',
            CORR_PAIS_NACIONALIDAD: null,
            NACIONALIDAD: '',
            CORR_PAIS_PROCEDENCIA: null,
            PAIS_PROCEDENCIA: '',
            CORR_PAIS_RESIDENCIA: null,
            PAIS_RESIDENCIA: '',
            CORR_DEPTO_RESIDENCIA: null,
            DEPTO_RESIDENCIA: '',
            CORR_MUNICIPIO_RESIDENCIA: null,
            MUNICIPIO_RESIDENCIA: '',
            DIRECCION_ACTUAL: '',
            CORR_RELIGION: null,
            RELIGION: '',
            IGLESIA_ACTUAL: '',
            TRABAJA: false,
            HA_SIDO_DEPORTADO: false,
            POSEE_DISCAPACIDAD: false,
        };
    }

    // Qué hace: ciclos a los que se puede mover el prospecto, carreras de su ciclo y modalidades de la actual.
    // Cómo lo hace: se consulta al abrirlo; las carreras se vuelven a pedir cada vez que cambia el ciclo.
    private cargarOfertaAcademica(CORR_PROSPECTO: number): void {
        this.cargarLista(this.service.getCiclosCambio(CORR_PROSPECTO), (data: any[]) => {
            this.mCICLO_CAMBIO = data ?? [];
        });
        if (this.model?.ANIO && this.model?.NUMERO_PERIODO) {
            this.cargarLista(this.service.getCarrerasDelCiclo(CORR_PROSPECTO, this.model.ANIO, this.model.NUMERO_PERIODO), (data: any[]) => {
                this.mCORR_CARRERA_CICLO = data ?? [];
            });
        }
        this.getCORR_MODALIDAD(this.model?.CORR_CARRERA);
    }

    // Qué hace: al cambiar el ciclo se recargan las carreras de ese ciclo; la carrera elegida se conserva
    //           si sigue ofertada y, si no, se limpia junto con la modalidad para que se elija otra.
    // Cómo lo hace: misma regla que ACA_SP_CAMBIAR_CICLO_PROSPECTO, que la vuelve a validar al guardar.
    onCicloChange(value: string): void {
        if (!this.model || this.readOnly) {
            return;
        }
        const ciclo = this.mCICLO_CAMBIO.find((c: any) => c.CICLO === value);
        if (!ciclo) {
            return;
        }
        this.model.ANIO = ciclo.ANIO;
        this.model.NUMERO_PERIODO = ciclo.NUMERO_PERIODO;

        this.cargarLista(this.service.getCarrerasDelCiclo(this.model.CORR_PROSPECTO, ciclo.ANIO, ciclo.NUMERO_PERIODO), (data: any[]) => {
            this.mCORR_CARRERA_CICLO = data ?? [];
            const sigueOfertada = this.mCORR_CARRERA_CICLO.some((c: any) => c.CORR === this.model.CORR_CARRERA);
            if (this.model.CORR_CARRERA && !sigueOfertada) {
                this.notifyFx(
                    `${this.model.NOMBRE_CARRERA || 'La carrera'} no se oferta en el ciclo ${value}. Seleccione otra carrera.`,
                    NotifyType.Warning,
                    { raw: true }
                );
                this.model.CORR_CARRERA = null;
                this.model.CORR_MODALIDAD = null;
                this.mCORR_MODALIDAD = [];
            }
        });
    }

    // Qué hace: modalidades con plan vigente de una carrera.
    getCORR_MODALIDAD(corrCarrera?: number | null): void {
        if (!corrCarrera) {
            this.mCORR_MODALIDAD = [];
            return;
        }
        this.cargarLista(this.service.getModalidadesDeCarrera(corrCarrera), (data: any[]) => {
            this.mCORR_MODALIDAD = data ?? [];
        });
    }

    // Qué hace: al cambiar la carrera se recargan sus modalidades y se limpia la elegida.
    // Cómo lo hace: misma regla del portal; el plan y el período los resuelve el API al guardar.
    onCarreraChange(value: number): void {
        if (!this.model) {
            return;
        }
        this.model.CORR_MODALIDAD = null;
        this.getCORR_MODALIDAD(value);
    }

    // Qué hace: pasa de consulta a edición (botón "Modificar" de la barra).
    // Cómo lo hace: guarda copia del encabezado para Cancelar y habilita los editores; el detalle
    //               ya está cargado, no se vuelve a consultar.
    modificar(): void {
        if (!this.permiteEdit || !this.isConsulta() || this.solicitudAprobada() || this.solicitudRechazada() || this.inscripcionVencida()) {
            if (this.solicitudAprobada()) {
                this.notifyFx('La solicitud ya está aprobada y no se puede modificar.', NotifyType.Warning);
            } else if (this.solicitudRechazada()) {
                this.notifyFx('La solicitud está rechazada y no se puede modificar.', NotifyType.Warning);
            } else if (this.inscripcionVencida()) {
                this.notifyFx('No se puede modificar. La inscripción de este ciclo ya venció.', NotifyType.Warning);
            }
            return;
        }
        this.modelUpdate = { ...this.model };
        this.AsignaStatus(UpdateType.Update);
        this.habilitar();
    }

    // Qué hace: mantiene el botón "Modificar" y limpia el detalle al volver al listado.
    // Cómo lo hace: Cancelar (con confirmación) y Guardar terminan en Browse; ahí se descarta el detalle.
    override AsignaStatus(xEstado: UpdateType): void {
        super.AsignaStatus(xEstado);
        this.btnModificar = xEstado === UpdateType.Not_Defined && this.permiteEdit && !this.solicitudAprobada() && !this.solicitudRechazada() && !this.inscripcionVencida() ? 'Modificar' : '';
        if (xEstado === UpdateType.Browse) {
            this.limpiarDetalle();
            this.evaluarPuedeAprobar(Number(this.model?.CORR_PROSPECTO));
        }
    }

    // Qué hace: al elegir una fila del listado, muestra Aprobar solo si este usuario ejecuta el paso.
    override focusedRowChanged(e: any): void {
        super.focusedRowChanged(e);
        const corr = Number(e?.row?.data?.CORR_PROSPECTO);
        if (this.esBorrador) {
            this.btnAprobar = '';
            this.btnRechazar = '';
            this.btnRevertir = '';
            this.btnEnviar = this.textoBtnEnviar(corr);
            this.corrAprobarResuelto = 0;
            return;
        }
        this.btnEnviar = '';
        this.evaluarPuedeAprobar(corr);
    }

    // Qué hace: envía el borrador enfocado al flujo, sin ventana de comentario.
    // Cómo lo hace: el comentario queda fijo y la fila pasa a Solicitudes pendientes en memoria.
    enviarSolicitud(): void {
        const corr = Number(this.model?.CORR_PROSPECTO);
        if (!this.esBorrador || !(corr > 0) || !this.btnEnviar || this.inscripcionVencida()) {
            if (this.inscripcionVencida()) {
                this.notifyFx('No se puede enviar. La inscripción de este ciclo ya venció.', NotifyType.Warning);
            }
            return;
        }
        this.loadingVisible = true;
        this.service
            .enviar(corr, 'Envío de la solicitud de nuevo ingreso.')
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    this.loadingVisible = false;
                    if (response?.Result && response.ErrorCode === 0) {
                        const fila = (this.modelsBorrador || []).find((item: any) => Number(item.CORR_PROSPECTO) === corr);
                        this.modelsBorrador = (this.modelsBorrador || []).filter((item: any) => Number(item.CORR_PROSPECTO) !== corr);
                        if (fila) {
                            this.modelsPendientes = [
                                {
                                    ...fila,
                                    CORR_ESTADO: 38,
                                    NOMBRE_ESTADO: 'Ingresado',
                                    ESTADO: 'C',
                                    ESTADO_TEXTO: 'Completado',
                                    NOMBRE_PASO: 'Aprobación del analista',
                                    ORDEN_PASO: 2,
                                    NOMBRE_ACTOR_PASO: 'Analista de Nuevo Ingreso',
                                    DIAS_EN_PASO: 0,
                                },
                                ...this.modelsPendientes,
                            ];
                        }
                        this.aplicarLista();
                        this.btnEnviar = '';
                        if (!this.isBrowse()) {
                            this.AsignaStatus(UpdateType.Browse);
                            this.mostrarPendientes();
                            this.btnEnviar = '';
                        }
                        this.notifyFx('La solicitud de nuevo ingreso fue enviada.', NotifyType.Success);
                    } else {
                        this.notifyFx(response?.ErrorMessage || 'No se pudo enviar la solicitud.', NotifyType.Warning, { raw: true });
                    }
                },
                error: (error: any) => {
                    this.loadingVisible = false;
                    this.notifyApiError(error);
                },
            });
    }

    // Qué hace: oculta el lápiz cuando la solicitud ya fue aprobada, rechazada o el ciclo ya venció.
    // Cómo lo hace: el permiso U sigue aplicando; los estados 39 y 46, y DIAS_VENCE negativo, no se editan.
    override getPermiteEditar(e: any): boolean {
        const fila = e?.row?.data ?? e?.data;
        const estado = Number(fila?.CORR_ESTADO);
        if (estado === 39 || estado === 46 || this.filaVencida(fila)) {
            return false;
        }
        return super.getPermiteEditar(e);
    }

    // Qué hace: impide abrir la edición de una solicitud aprobada, rechazada o con la inscripción vencida.
    override editarClick(e: any): void {
        const fila = e?.row?.data ?? e?.data;
        const estado = Number(fila?.CORR_ESTADO);
        if (estado === 39) {
            this.notifyFx('La solicitud ya está aprobada y no se puede modificar.', NotifyType.Warning);
            return;
        }
        if (estado === 46) {
            this.notifyFx('La solicitud está rechazada y no se puede modificar.', NotifyType.Warning);
            return;
        }
        if (this.filaVencida(fila)) {
            this.notifyFx('No se puede modificar. La inscripción de este ciclo ya venció.', NotifyType.Warning);
            return;
        }
        super.editarClick(e);
    }

    // Qué hace: enciende Aprobar, Rechazar o Revertir según el ejecutor del paso.
    // Cómo lo hace: el API compara el login con el actor origen. La misma fila no se vuelve a consultar.
    evaluarPuedeAprobar(corrProspecto: number): void {
        if (!(corrProspecto > 0)) {
            this.btnAprobar = '';
            this.btnRechazar = '';
            this.btnRevertir = '';
            this.btnEnviar = '';
            this.corrAprobarResuelto = 0;
            return;
        }
        if (this.esBorrador) {
            this.btnAprobar = '';
            this.btnRechazar = '';
            this.btnRevertir = '';
            this.btnEnviar = this.textoBtnEnviar(corrProspecto);
            return;
        }
        this.btnEnviar = '';
        if (this.corrAprobarResuelto === corrProspecto) {
            return;
        }
        this.corrAprobarResuelto = corrProspecto;
        this.corrAprobarConsultado = corrProspecto;
        this.service
            .getPuedeAprobar(corrProspecto)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (this.corrAprobarConsultado !== corrProspecto) {
                        return;
                    }
                    const data = response?.Result ? response.Data : null;
                    this.btnAprobar = data?.PUEDE_APROBAR ? 'Aprobar' : '';
                    this.btnRechazar = data?.PUEDE_RECHAZAR ? 'Rechazar' : '';
                    this.btnRevertir = data?.PUEDE_REVERTIR ? 'Reaperturar solicitud' : '';
                },
                error: () => {
                    if (this.corrAprobarConsultado === corrProspecto) {
                        this.btnAprobar = '';
                        this.btnRechazar = '';
                        this.btnRevertir = '';
                        this.corrAprobarResuelto = 0;
                    }
                },
            });
    }

    // Qué hace: aprueba sin pedir comentario. El texto de la bitácora queda fijo.
    // Cómo lo hace: igual que Aprobar del descriptor cuando el popup está apagado: arma la observación y ejecuta.
    abrirAprobar(): void {
        if (!this.btnAprobar || !(Number(this.model?.CORR_PROSPECTO) > 0)) {
            return;
        }
        this.accionFlujo = 'aprobar';
        this.observacionAprobar = 'Aprobación de la solicitud de nuevo ingreso.';
        this.confirmarAprobar();
    }

    abrirRechazar(): void {
        this.abrirAccion('rechazar', this.btnRechazar, 'Rechazo de la solicitud de nuevo ingreso.');
    }

    abrirRevertir(): void {
        this.abrirAccion('revertir', this.btnRevertir, 'Reversión de la aprobación de la solicitud de nuevo ingreso.');
    }

    private abrirAccion(accion: 'aprobar' | 'rechazar' | 'revertir', boton: string, comentario: string): void {
        if (!boton || !(Number(this.model?.CORR_PROSPECTO) > 0)) {
            return;
        }
        this.accionFlujo = accion;
        this.observacionAprobar = comentario;
        this.popupAprobarVisible = true;
    }

    tituloPopupAccion(): string {
        if (this.accionFlujo === 'rechazar') {
            return 'Rechazar solicitud';
        }
        if (this.accionFlujo === 'revertir') {
            return 'Revertir aprobación';
        }
        return 'Aprobar solicitud';
    }

    textoPopupAccion(): string {
        if (this.accionFlujo === 'rechazar') {
            return 'La solicitud pasará a Rechazada y saldrá del listado. El comentario queda en la bitácora con su usuario.';
        }
        if (this.accionFlujo === 'revertir') {
            return 'La solicitud vuelve a Ingresado en el mismo flujo, para poder editarla. El comentario queda en la bitácora.';
        }
        return 'La solicitud pasará a Aprobado. El comentario queda en la bitácora con su usuario.';
    }

    textoBotonAccion(): string {
        if (this.accionFlujo === 'rechazar') {
            return 'Rechazar';
        }
        if (this.accionFlujo === 'revertir') {
            return 'Reaperturar solicitud';
        }
        return 'Aprobar';
    }

    cancelarAprobar(): void {
        this.popupAprobarVisible = false;
    }

    // Qué hace: ejecuta Aprobar, Rechazar o Revertir y actualiza la fila en memoria.
    // Cómo lo hace: el API corre la acción del paso; no vuelve a consultar todo el listado.
    confirmarAprobar(): void {
        const corr = Number(this.model?.CORR_PROSPECTO);
        const observacion = (this.observacionAprobar ?? '').trim();
        const accion = this.accionFlujo;
        if (!corr) {
            return;
        }
        if (!observacion) {
            this.notifyFx('Debe ingresar un comentario.', NotifyType.Warning);
            return;
        }
        this.popupAprobarVisible = false;
        this.loadingVisible = true;
        const llamada =
            accion === 'rechazar'
                ? this.service.rechazar(corr, observacion)
                : accion === 'revertir'
                  ? this.service.revertir(corr, observacion)
                  : this.service.aprobar(corr, observacion);
        llamada.pipe(take(1)).subscribe({
            next: (response: any) => {
                this.loadingVisible = false;
                if (response?.Result && response.ErrorCode === 0) {
                    if (accion === 'rechazar') {
                        this.models = (this.models || []).map((fila: any) => {
                            if (Number(fila.CORR_PROSPECTO) !== corr) {
                                return fila;
                            }
                            return {
                                ...fila,
                                CORR_ESTADO: 46,
                                NOMBRE_ESTADO: 'Rechazada',
                                DIAS_EN_PASO: 0,
                            };
                        });
                        this.modelsPendientes = this.models;
                    } else {
                        this.models = (this.models || []).map((fila: any) => {
                            if (Number(fila.CORR_PROSPECTO) !== corr) {
                                return fila;
                            }
                            if (accion === 'revertir') {
                                return {
                                    ...fila,
                                    CORR_ESTADO: 38,
                                    NOMBRE_ESTADO: 'Ingresado',
                                    NOMBRE_PASO: 'Aprobación del analista',
                                    ORDEN_PASO: 2,
                                    DIAS_EN_PASO: 0,
                                };
                            }
                            return {
                                ...fila,
                                CORR_ESTADO: 39,
                                NOMBRE_ESTADO: 'Aprobado',
                                NOMBRE_PASO: 'Solicitud aprobada',
                                ORDEN_PASO: 3,
                                NOMBRE_ACTOR_PASO: 'Analista de Nuevo Ingreso',
                                DIAS_EN_PASO: 0,
                            };
                        });
                        this.modelsPendientes = this.models;
                    }
                    this.btnAprobar = '';
                    this.btnRechazar = '';
                    this.btnRevertir = '';
                    this.corrAprobarResuelto = 0;
                    const aviso =
                        accion === 'rechazar'
                            ? 'Solicitud rechazada.'
                            : accion === 'revertir'
                              ? 'La solicitud volvió a Ingresado.'
                              : 'La solicitud de nuevo ingreso fue aprobada.';
                    this.notifyFx(aviso, NotifyType.Success);
                    this.AsignaStatus(UpdateType.Browse);
                } else {
                    this.notifyFx(response?.ErrorMessage || 'No se pudo completar la acción.', NotifyType.Warning, { raw: true });
                }
            },
            error: (error: any) => {
                this.loadingVisible = false;
                this.notifyApiError(error);
            },
        });
    }

    override bloquear(): void {
        this.readOnly = true;
    }

    override habilitar(): void {
        this.readOnly = false;
        this.sincronizarEmpleoConTrabaja();
        this.sincronizarEstudioMedia();
        this.sincronizarDiscapacidad();
        this.sincronizarDeportado();
    }

    // Qué hace: concilia la declaración "trabaja" con la existencia del empleo al entrar a edición.
    // Cómo lo hace: si declara que trabaja y no hay empleo, abre el formulario vacío; si hay empleo y
    //               la bandera está apagada, la enciende (el empleo es la evidencia). Son datos
    //               heredados: el portal borra y recrea el empleo en cada guardado y pudo quedar
    //               desalineado. En consulta no se toca nada.
    private sincronizarEmpleoConTrabaja(): void {
        if (this.readOnly || !this.personaModel || !this.empleoCargado) {
            return;
        }
        if (this.empleoModel) {
            if (this.personaModel.TRABAJA !== true && !this.empleoEliminar) {
                this.setTrabaja(true);
            }
            return;
        }
        if (this.personaModel.TRABAJA === true && !this.empleoEliminar) {
            this.prepararEmpleoNuevo();
        }
    }

    // Qué hace: "¿Está trabajando actualmente?" (encabezado de Información laboral) gobierna el empleo,
    //           igual que en el portal, donde el check vive en esa misma sección.
    // Cómo lo hace: desmarcar con empleo registrado → confirma y lo marca para eliminarlo al guardar
    //               (si no acepta, devuelve el check a marcado); marcar sin empleo → abre el formulario
    //               vacío que se creará al guardar. Todo se resuelve en guardar(), nada se borra al
    //               instante. El check de "Condiciones declaradas" es solo espejo y se refresca aquí.
    onTrabajaChanged(e: any): void {
        // Sin e.event el cambio lo hizo el código (carga del registro o restauración): no se procesa.
        if (!e?.event || this.readOnly || !this.personaModel) {
            return;
        }

        if (e.value !== true) {
            if (this.empleoNuevo) {
                this.setTrabaja(false);
                this.descartarEmpleoNuevo();
                return;
            }
            if (!this.empleoModel) {
                this.setTrabaja(false);
                return;
            }
            // Igual que en estudios: se marca de una vez y la confirmación permite deshacer.
            this.setTrabaja(false);
            this.empleoEliminar = true;
            confirm(
                '<div class="sguees-confirm-message">Al guardar se eliminará la información laboral registrada. ¿Desea continuar?</div>',
                'Información laboral'
            ).then((acepta: boolean) => {
                this.zone.run(() => {
                    if (acepta) {
                        return;
                    }
                    this.setTrabaja(true);
                    this.empleoEliminar = false;
                    this.chkTrabaja?.instance?.option('value', true);
                });
            });
            return;
        }

        this.setTrabaja(true);
        if (this.empleoEliminar) {
            this.empleoEliminar = false;
            return;
        }
        if (!this.empleoModel) {
            this.prepararEmpleoNuevo();
        }
    }

    // Qué hace: "¿Posee discapacidad?" abre la limitación, como en el portal.
    // Cómo lo hace: marcar sin fila prepara el formulario; desmarcar una ya guardada pide confirmación
    //               y la deja para borrar al guardar. El clic del usuario trae e.event; la carga no.
    get discapacidadActiva(): boolean {
        if (this.discapacidadEliminar) {
            return false;
        }
        return !!this.limitacionModel || this.limitaciones.length > 0 || this.personaModel?.POSEE_DISCAPACIDAD === true;
    }

    onDiscapacidadChanged(e: any): void {
        if (!e?.event || this.readOnly || !this.personaModel) {
            return;
        }
        if (e.value === true) {
            this.abrirDiscapacidad();
            return;
        }
        const guardada = this.limitaciones.some((l) => l.CORR_PROSPECTO_LIMITACION_FISICA > 0)
            || (this.limitacionModel?.CORR_PROSPECTO_LIMITACION_FISICA > 0);
        if (!guardada) {
            this.cancelarLimitacion();
            this.discapacidadEliminar = false;
            this.personaModel.POSEE_DISCAPACIDAD = false;
            return;
        }
        this.discapacidadEliminar = true;
        confirm(
            '<div class="sguees-confirm-message">Al guardar se eliminará la limitación registrada. ¿Desea continuar?</div>',
            'Salud'
        ).then((acepta: boolean) => {
            this.zone.run(() => {
                if (acepta) {
                    return;
                }
                this.discapacidadEliminar = false;
                this.chkDiscapacidad?.instance?.option('value', true);
                this.abrirDiscapacidad();
            });
        });
    }

    // Qué hace: "¿Ha sido deportado?" abre el país, como en el portal.
    // Cómo lo hace: misma mecánica que la discapacidad: una fila vigente, y desmarcar la deja para borrar.
    get deportadoActivo(): boolean {
        if (this.deportacionEliminar) {
            return false;
        }
        return !!this.deportacionModel || this.deportaciones.length > 0 || this.personaModel?.HA_SIDO_DEPORTADO === true;
    }

    onDeportadoChanged(e: any): void {
        if (!e?.event || this.readOnly || !this.personaModel) {
            return;
        }
        if (e.value === true) {
            this.abrirDeportacion();
            return;
        }
        const guardada = this.deportaciones.some((d) => d.CORR_PROSPECTO_DEPORTACION > 0)
            || (this.deportacionModel?.CORR_PROSPECTO_DEPORTACION > 0);
        if (!guardada) {
            this.cancelarDeportacion();
            this.deportacionEliminar = false;
            this.personaModel.HA_SIDO_DEPORTADO = false;
            return;
        }
        this.deportacionEliminar = true;
        confirm(
            '<div class="sguees-confirm-message">Al guardar se eliminará la deportación registrada. ¿Desea continuar?</div>',
            'Deportación'
        ).then((acepta: boolean) => {
            this.zone.run(() => {
                if (acepta) {
                    return;
                }
                this.deportacionEliminar = false;
                this.chkDeportado?.instance?.option('value', true);
                this.abrirDeportacion();
            });
        });
    }

    private sincronizarDiscapacidad(): void {
        if (!this.limitacionesCargadas || this.discapacidadEliminar || this.limitacionModel) {
            return;
        }
        if (this.limitaciones.length > 0 || this.personaModel?.POSEE_DISCAPACIDAD === true) {
            this.abrirDiscapacidad();
        }
    }

    private sincronizarDeportado(): void {
        if (!this.deportacionesCargadas || this.deportacionEliminar || this.deportacionModel) {
            return;
        }
        if (this.deportaciones.length > 0 || this.personaModel?.HA_SIDO_DEPORTADO === true) {
            this.abrirDeportacion();
        }
    }

    private abrirDiscapacidad(): void {
        this.discapacidadEliminar = false;
        if (this.limitacionModel) {
            return;
        }
        if (this.limitaciones.length > 0) {
            this.limitacionEditando = this.limitaciones[0];
            this.limitacionModel = { ...this.limitaciones[0] };
            return;
        }
        if (this.readOnly || !this.personaModel) {
            return;
        }
        this.personaModel.POSEE_DISCAPACIDAD = true;
        this.nuevaLimitacion();
    }

    private abrirDeportacion(): void {
        this.deportacionEliminar = false;
        if (this.deportacionModel) {
            return;
        }
        const vigente = this.deportaciones.find((d) => d.ES_VIGENTE === true || d.ES_VIGENTE === 1) ?? this.deportaciones[0];
        if (vigente) {
            this.deportacionEditando = vigente;
            this.deportacionModel = { ...vigente };
            return;
        }
        if (this.readOnly || !this.personaModel) {
            return;
        }
        this.personaModel.HA_SIDO_DEPORTADO = true;
        this.nuevaDeportacion();
    }

    private descartarDiscapacidad(): void {
        this.cancelarLimitacion();
        for (const fila of this.limitaciones) {
            if (fila.CORR_PROSPECTO_LIMITACION_FISICA > 0) {
                this.limitacionesEliminar.push(fila);
            }
        }
        this.limitaciones = [];
        this.discapacidadEliminar = false;
    }

    private descartarDeportacion(): void {
        this.cancelarDeportacion();
        for (const fila of this.deportaciones) {
            if (fila.CORR_PROSPECTO_DEPORTACION > 0) {
                this.deportacionesEliminar.push(fila);
            }
        }
        this.deportaciones = [];
        this.deportacionEliminar = false;
    }

    // Qué hace: aplica la regla del portal para el empleo en el extranjero.
    // Cómo lo hace: al marcarlo se limpian país, departamento y municipio (y la plantilla los bloquea),
    //               porque de un empleo fuera del país no se registra la ubicación; al desmarcarlo
    //               quedan vacíos y habilitados para volver a elegirlos.
    onEmpleoChanged(e: any): void {
        if (this.readOnly || e?.dataField !== 'TIENE_EMPLEO_FUERA' || !this.empleoModel) {
            return;
        }

        this.empleoModel.CORR_PAIS = null;
        this.empleoModel.CORR_DEPTO = null;
        this.empleoModel.CORR_MUNICIPIO = null;
        this.mCORR_DEPTO_EMPLEO = [];
        this.mCORR_MUNICIPIO_EMPLEO = [];
    }

    // ---- Información adicional: medios de origen (grilla en memoria, se aplica al guardar) ----
    nuevoMedio(): void {
        if (this.readOnly || !this.personaModel) {
            return;
        }
        this.medioEditando = null;
        this.medioModel = this.serviceMedio.getModeloNuevo(this.personaModel);
        this.refrescarItemsMedio();
    }

    editarMedio(e: any): void {
        e?.event?.preventDefault?.();
        const fila = e?.row?.data ?? e?.data;
        if (this.readOnly || !fila) {
            return;
        }
        this.medioEditando = fila;
        this.medioModel = { ...fila };
        this.refrescarItemsMedio();
    }

    eliminarMedio(e: any): void {
        const fila = e?.data ?? e;
        if (e) {
            e.cancel = true;
        }
        if (this.readOnly || !fila) {
            return;
        }
        if (fila.CORR_PROSPECTO_MEDIO > 0) {
            this.mediosEliminar.push(fila);
        }
        this.medios = this.medios.filter((m) => m !== fila);
        if (this.medioEditando === fila) {
            this.cancelarMedio();
        }
    }

    // Qué hace: al cambiar el medio, el formulario muestra los campos propios de ese medio.
    // Cómo lo hace: el medio se pinta con app-data-lookup (template), que no pasa por el formData del
    //               dx-form: por eso escucha su valueChange, igual que país y departamento. "Otro" pide
    //               el detalle y "Referido amigo/familiar" el nombre y la carrera; al salir de un medio
    //               se limpian los campos que ya no aplican.
    onMedioChanged(valor: number): void {
        if (!this.medioModel) {
            return;
        }
        const codigo = this.codigoMedio(valor);
        if (codigo !== MEDIO_OTRO) {
            this.medioModel.DESCRIPCION = null;
        }
        if (codigo !== MEDIO_REFERIDO) {
            this.medioModel.ESTUDIANTE_REFIERE = null;
            this.medioModel.CORR_CARRERA_REFIERE = null;
        }
        this.refrescarItemsMedio();
    }

    // Qué hace: acepta el medio del formulario; no se puede repetir el mismo medio.
    aceptarMedio(): void {
        const resultado = this.formMedio?.instance?.validate();
        if (resultado && !resultado.isValid) {
            this.notifyFx('Revise los campos marcados antes de aceptar.', NotifyType.Warning, { raw: true });
            return;
        }

        const modelo = this.leerFormData(this.formMedio, this.medioModel);
        const codigo = this.codigoMedio(modelo.CORR_MEDIO_ORIGEN);
        const otros = this.medios.filter((m) => m !== this.medioEditando);
        const mensaje = this.serviceMedio.validar(modelo, otros, codigo);
        if (mensaje) {
            this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
            return;
        }

        const medio = this.mCORR_MEDIO_ORIGEN.find((m) => m.CORR_MEDIO_ORIGEN === modelo.CORR_MEDIO_ORIGEN);
        modelo.CODIGO_MEDIO = codigo;
        modelo.NOMBRE_MEDIO = medio?.NOMBRE ?? '';
        modelo.CARRERA_REFIERE = this.mCORR_CARRERA.find((c) => c.CORR_CARRERA === modelo.CORR_CARRERA_REFIERE)?.NOMBRE_CARRERA ?? '';

        const indice = this.medioEditando ? this.medios.indexOf(this.medioEditando) : -1;
        if (indice >= 0) {
            this.medios[indice] = modelo;
        } else {
            this.medios.push(modelo);
        }
        this.medios = [...this.medios];
        this.medioModel = null;
        this.medioEditando = null;
    }

    cancelarMedio(): void {
        this.medioModel = null;
        this.medioEditando = null;
    }

    // Qué hace: código del medio ('OTRO', 'REF', ...) para saber qué campos propios mostrar.
    private codigoMedio(corrMedio: number): string {
        return (this.mCORR_MEDIO_ORIGEN.find((m) => m.CORR_MEDIO_ORIGEN === corrMedio)?.CODIGO ?? '').trim().toUpperCase();
    }

    private refrescarItemsMedio(): void {
        this.itemsMedio = this.serviceMedio.getItems(this.codigoMedio(this.medioModel?.CORR_MEDIO_ORIGEN));
    }

    // ---- Salud: limitaciones físicas (grilla en memoria, se aplica al guardar) ----
    nuevaLimitacion(): void {
        if (this.readOnly || !this.personaModel) {
            return;
        }
        this.limitacionEditando = null;
        this.limitacionModel = this.serviceLimitacion.getModeloNuevo(this.personaModel);
    }

    editarLimitacion(e: any): void {
        e?.event?.preventDefault?.();
        const fila = e?.row?.data ?? e?.data;
        if (this.readOnly || !fila) {
            return;
        }
        this.limitacionEditando = fila;
        this.limitacionModel = { ...fila };
    }

    eliminarLimitacion(e: any): void {
        const fila = e?.data ?? e;
        if (e) {
            e.cancel = true;
        }
        if (this.readOnly || !fila) {
            return;
        }
        if (fila.CORR_PROSPECTO_LIMITACION_FISICA > 0) {
            this.limitacionesEliminar.push(fila);
        }
        this.limitaciones = this.limitaciones.filter((l) => l !== fila);
        if (this.limitacionEditando === fila) {
            this.cancelarLimitacion();
        }
    }

    // Qué hace: acepta la limitación del formulario; no se puede repetir la misma limitación.
    aceptarLimitacion(): boolean {
        const resultado = this.formLimitacion?.instance?.validate();
        if (resultado && !resultado.isValid) {
            this.notifyFx('Revise los campos marcados antes de aceptar.', NotifyType.Warning, { raw: true });
            return false;
        }

        const modelo = this.leerFormData(this.formLimitacion, this.limitacionModel);
        const otras = this.limitaciones.filter((l) => l !== this.limitacionEditando);
        const mensaje = this.serviceLimitacion.validar(modelo, otras);
        if (mensaje) {
            this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
            return false;
        }

        modelo.NOMBRE_LIMITACION = this.mCORR_LIMITACION_FISICA.find((l) => l.CORR_LIMITACION_FISICA === modelo.CORR_LIMITACION_FISICA)?.NOMBRE ?? '';
        const indice = this.limitacionEditando ? this.limitaciones.indexOf(this.limitacionEditando) : -1;
        if (indice >= 0) {
            this.limitaciones[indice] = modelo;
        } else {
            this.limitaciones.push(modelo);
        }
        this.limitaciones = [...this.limitaciones];
        this.limitacionModel = null;
        this.limitacionEditando = null;
        return true;
    }

    cancelarLimitacion(): void {
        this.limitacionModel = null;
        this.limitacionEditando = null;
    }

    // ---- Migratorio: deportaciones (grilla en memoria, se aplica al guardar) ----
    nuevaDeportacion(): void {
        if (this.readOnly || !this.personaModel) {
            return;
        }
        this.deportacionEditando = null;
        this.deportacionModel = this.serviceDeportacion.getModeloNuevo(this.personaModel);
    }

    editarDeportacion(e: any): void {
        e?.event?.preventDefault?.();
        const fila = e?.row?.data ?? e?.data;
        if (this.readOnly || !fila) {
            return;
        }
        this.deportacionEditando = fila;
        this.deportacionModel = { ...fila };
    }

    eliminarDeportacion(e: any): void {
        const fila = e?.data ?? e;
        if (e) {
            e.cancel = true;
        }
        if (this.readOnly || !fila) {
            return;
        }
        if (fila.CORR_PROSPECTO_DEPORTACION > 0) {
            this.deportacionesEliminar.push(fila);
        }
        this.deportaciones = this.deportaciones.filter((d) => d !== fila);
        if (this.deportacionEditando === fila) {
            this.cancelarDeportacion();
        }
    }

    aceptarDeportacion(): boolean {
        const resultado = this.formDeportacion?.instance?.validate();
        if (resultado && !resultado.isValid) {
            this.notifyFx('Revise los campos marcados antes de aceptar.', NotifyType.Warning, { raw: true });
            return false;
        }

        const modelo = this.leerFormData(this.formDeportacion, this.deportacionModel);
        const otras = this.deportaciones.filter((d) => d !== this.deportacionEditando);
        const mensaje = this.serviceDeportacion.validar(modelo, otras);
        if (mensaje) {
            this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
            return false;
        }

        modelo.NOMBRE_PAIS = this.mCORR_PAIS.find((p) => p.CORR_PAIS === modelo.CORR_PAIS)?.NOMBRE_PAIS ?? '';
        const indice = this.deportacionEditando ? this.deportaciones.indexOf(this.deportacionEditando) : -1;
        if (indice >= 0) {
            this.deportaciones[indice] = modelo;
        } else {
            this.deportaciones.push(modelo);
        }
        this.deportaciones = [...this.deportaciones];
        this.deportacionModel = null;
        this.deportacionEditando = null;
        return true;
    }

    cancelarDeportacion(): void {
        this.deportacionModel = null;
        this.deportacionEditando = null;
    }

    // Qué hace: abre el formulario de un contacto nuevo (el formulario reemplaza a la grilla).
    nuevoContacto(): void {
        if (this.readOnly || !this.personaModel) {
            return;
        }
        this.contactoEditando = null;
        this.contactoModel = this.serviceContacto.getModeloNuevo(this.personaModel);
        this.refrescarItemsContacto();
    }

    // Qué hace: abre el formulario con una copia del contacto elegido (la fila viene en e.row.data).
    editarContacto(e: any): void {
        e?.event?.preventDefault?.();
        const fila = e?.row?.data ?? e?.data;
        if (this.readOnly || !fila) {
            return;
        }
        this.contactoEditando = fila;
        this.contactoModel = { ...fila };
        this.refrescarItemsContacto();
    }

    // Qué hace: la papelera se ofrece salvo en el último contacto de su tipo (el portal lo necesita).
    // Cómo lo hace: la grilla llama a esta función por fila con el evento del botón (e.row.data).
    puedeEliminarContacto(e: any): boolean {
        const fila = e?.row?.data ?? e?.data ?? e;
        if (this.readOnly || !fila) {
            return false;
        }
        return this.contactos.some((c) => c !== fila && c.TIPO === fila.TIPO);
    }

    // Qué hace: quita el contacto de la grilla; si ya existía en la base, se elimina al guardar.
    // Cómo lo hace: si era el principal de su tipo, el más antiguo que queda hereda la marca (igual
    //               que hace el API), así nunca queda un tipo sin principal.
    eliminarContacto(e: any): void {
        const fila = e?.data ?? e;
        if (e) {
            e.cancel = true;
        }
        if (this.readOnly || !fila || !this.puedeEliminarContacto(fila)) {
            return;
        }
        if (fila.CORR_PROSPECTO_CONTACTO > 0) {
            this.contactosEliminar.push(fila);
        }
        this.contactos = this.contactos.filter((c) => c !== fila);
        if (fila.ES_PRINCIPAL === true) {
            this.heredarPrincipal(fila.TIPO);
        }
        if (this.contactoEditando === fila) {
            this.cancelarContacto();
        }
    }

    // Qué hace: acepta el contacto del formulario y vuelve a la grilla (sin guardar aún en la base).
    // Cómo lo hace: valida por tipo y mantiene un principal por tipo: el único de su tipo es principal;
    //               si se marca uno, se desmarca al resto; el principal no se desmarca desde su ficha;
    //               y si cambia de tipo siendo principal, el tipo anterior hereda la marca.
    aceptarContacto(): void {
        const resultado = this.formContacto?.instance?.validate();
        if (resultado && !resultado.isValid) {
            this.notifyFx('Revise los campos marcados antes de aceptar.', NotifyType.Warning, { raw: true });
            return;
        }

        const modelo = this.serviceContacto.normalizar(this.leerFormData(this.formContacto, this.contactoModel));
        const mensaje = this.serviceContacto.validar(modelo);
        if (mensaje) {
            this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
            return;
        }

        const anterior = this.contactoEditando;
        const cambiaTipo = !!anterior && anterior.TIPO !== modelo.TIPO;
        const otrosDelTipo = this.contactos.filter((c) => c !== anterior && c.TIPO === modelo.TIPO);
        if (otrosDelTipo.length === 0) {
            modelo.ES_PRINCIPAL = true;
        } else if (!cambiaTipo && anterior?.ES_PRINCIPAL === true && modelo.ES_PRINCIPAL !== true) {
            modelo.ES_PRINCIPAL = true;
            this.notifyFx('Sigue siendo el principal de su tipo: para cambiarlo, marque otro contacto como principal.', NotifyType.Warning, { raw: true });
        }

        const indice = anterior ? this.contactos.indexOf(anterior) : -1;
        if (indice >= 0) {
            this.contactos[indice] = modelo;
        } else {
            this.contactos.push(modelo);
        }
        if (modelo.ES_PRINCIPAL === true) {
            for (const contacto of otrosDelTipo) {
                contacto.ES_PRINCIPAL = false;
            }
        }
        if (cambiaTipo && anterior.ES_PRINCIPAL === true) {
            this.heredarPrincipal(anterior.TIPO);
        }
        this.contactos = [...this.contactos];
        this.contactoModel = null;
        this.contactoEditando = null;
    }

    cancelarContacto(): void {
        this.contactoModel = null;
        this.contactoEditando = null;
    }

    // Qué hace: si un tipo se quedó sin principal, el primero que quede de ese tipo hereda la marca.
    private heredarPrincipal(tipo: string): void {
        const delTipo = this.contactos.filter((c) => c.TIPO === tipo);
        if (delTipo.length && !delTipo.some((c) => c.ES_PRINCIPAL === true)) {
            delTipo[0].ES_PRINCIPAL = true;
        }
    }

    // Qué hace: al cambiar el tipo, el formulario pasa de código + número (teléfono) a correo, y viceversa.
    // Cómo lo hace: el servicio traslada lo escrito al campo del nuevo tipo para no perderlo.
    onContactoChanged(e: any): void {
        if (e?.dataField !== 'TIPO' || !this.contactoModel) {
            return;
        }
        this.serviceContacto.cambiarTipo(this.contactoModel, e.value);
        this.refrescarItemsContacto();
    }

    // Qué hace: arma el formulario del contacto según el tipo elegido y la marca de principal.
    private refrescarItemsContacto(): void {
        const esTelefono = this.contactoModel?.TIPO !== TIPO_CORREO;
        this.itemsContacto = this.serviceContacto.getItems(this.contactoEditando?.ES_PRINCIPAL === true, esTelefono, this.mCODIGO_PAIS);
    }

    // Qué hace: abre el formulario de un familiar nuevo (el formulario reemplaza a la grilla).
    nuevoFamiliar(): void {
        if (this.readOnly || !this.personaModel) {
            return;
        }
        this.familiarEditando = null;
        this.familiarModel = this.serviceFamiliar.getModeloNuevo(this.personaModel);
        this.refrescarItemsFamiliar();
    }

    // Qué hace: abre el formulario con una copia del familiar elegido (Cancelar descarta los cambios).
    // Cómo lo hace: el lápiz de la grilla es un botón de columna de DevExtreme, así que la fila viene
    //               en e.row.data (mismo criterio que editarClick de CBaseComponent). Guarda además la
    //               fila original: es la referencia con la que se reemplaza al aceptar, porque un
    //               familiar recién agregado todavía no tiene llave para reconocerlo.
    editarFamiliar(e: any): void {
        e?.event?.preventDefault?.();
        const fila = e?.row?.data ?? e?.data;
        if (this.readOnly || !fila) {
            return;
        }
        this.familiarEditando = fila;
        this.familiarModel = { ...fila };
        this.refrescarItemsFamiliar();
    }

    // Qué hace: los datos laborales del familiar solo se piden si trabaja (y se limpian si deja de
    //           trabajar, como hace el portal con sus bloques condicionados).
    onFamiliarChanged(e: any): void {
        if (e?.dataField !== 'TRABAJA' || !this.familiarModel) {
            return;
        }
        if (e.value !== true) {
            this.familiarModel.PROFESION = null;
            this.familiarModel.OCUPACION = null;
            this.familiarModel.NOMBRE_EMPRESA = null;
            this.familiarModel.TELEFONO_TRABAJO = null;
            this.familiarModel.DIRECCION_TRABAJO = null;
        }
        this.refrescarItemsFamiliar();
    }

    // Qué hace: arma el formulario del familiar según la marca de emergencia y si trabaja.
    // Cómo lo hace: solo se admite un contacto de emergencia: si ya lo tiene otro familiar, la marca
    //               no se muestra en esta ficha (para quitarla hay que entrar a la ficha que la tiene).
    private refrescarItemsFamiliar(): void {
        const libre = !this.familiares.some((f) => f !== this.familiarEditando && f.ES_EMERGENCIA === true);
        this.itemsFamiliar = this.serviceFamiliar.getItems(libre, this.familiarModel?.TRABAJA === true);
    }

    // Qué hace: quita el familiar de la grilla; si ya existía en la base, se elimina al guardar.
    // Cómo lo hace: cancela el borrado propio de la grilla (patrón del ERP) y actualiza la lista en
    //               memoria; nada se toca en la base hasta Guardar.
    eliminarFamiliar(e: any): void {
        const fila = e?.data ?? e;
        if (e) {
            e.cancel = true;
        }
        if (this.readOnly || !fila) {
            return;
        }
        if (fila.CORR_PROSPECTO_FAMILIAR > 0) {
            this.familiaresEliminar.push(fila);
        }
        this.familiares = this.familiares.filter((f) => f !== fila);
        if (this.familiarEditando === fila) {
            this.cancelarFamiliar();
        }
        this.recalcularEmergencia();
    }

    // Qué hace: acepta el familiar del formulario y vuelve a la grilla (todavía sin guardar en la base).
    // Cómo lo hace: valida el formulario y el parentesco, arma el nombre completo para la grilla y
    //               reemplaza o agrega la fila según tenga llave.
    aceptarFamiliar(): void {
        const resultado = this.formFamiliar?.instance?.validate();
        if (resultado && !resultado.isValid) {
            this.notifyFx('Revise los campos marcados antes de aceptar.', NotifyType.Warning, { raw: true });
            return;
        }

        const modelo = this.leerFormData(this.formFamiliar, this.familiarModel);
        const mensaje = this.serviceFamiliar.validar(modelo);
        if (mensaje) {
            this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
            return;
        }

        modelo.NOMBRE_COMPLETO = this.serviceFamiliar.getNombreCompleto(modelo);
        modelo.NOMBRE_PARENTESCO = this.nombreParentesco(modelo.CORR_PARENTESCO);

        // Se reemplaza por referencia a la fila que se abrió: sirve igual para un familiar guardado
        // que para uno recién agregado, que todavía no tiene llave.
        const indice = this.familiarEditando ? this.familiares.indexOf(this.familiarEditando) : -1;
        if (indice >= 0) {
            this.familiares[indice] = modelo;
        } else {
            this.familiares.push(modelo);
        }
        // Un solo contacto de emergencia: al marcar a uno se lo quita a los demás (el API hace lo mismo).
        if (modelo.ES_EMERGENCIA === true) {
            for (const familiar of this.familiares) {
                if (familiar !== modelo) {
                    familiar.ES_EMERGENCIA = false;
                    familiar.TELEFONO_EMERGENCIA = null;
                    familiar.DIRECCION_EMERGENCIA = null;
                }
            }
        }
        this.familiares = [...this.familiares];
        this.familiarModel = null;
        this.familiarEditando = null;
        this.recalcularEmergencia();
    }

    cancelarFamiliar(): void {
        this.familiarModel = null;
        this.familiarEditando = null;
    }

    // Qué hace: deja en emergenciaModel el familiar marcado como contacto de emergencia.
    private recalcularEmergencia(): void {
        this.emergenciaModel = this.familiares.find((f) => f.ES_EMERGENCIA === true) ?? null;
    }

    private nombreParentesco(corrParentesco: number): string {
        return this.mCORR_PARENTESCO.find((p) => p.CORR_PARENTESCO === corrParentesco)?.NOMBRE_PARENTESCO ?? '';
    }

    // Qué hace: interruptor "¿Posee estudios de educación superior?" (estudios universitarios).
    // Cómo lo hace: solo actúa si el valor del check difiere de lo que hay en pantalla, así no se
    //               reprocesan los refrescos que hace el propio código (carga, deshacer).
    onUniversidadChanged(e: any): void {
        if (this.readOnly || e?.value === this.seccionActiva(SECCION_UNIVERSIDAD)) {
            return;
        }
        this.cambiarSeccionEstudio(SECCION_UNIVERSIDAD, e?.value === true);
    }

    // Qué hace: interruptor "¿Es graduado de la UEES?".
    onUeesChanged(e: any): void {
        if (this.readOnly || e?.value === this.seccionActiva(SECCION_GRADUADO_UEES)) {
            return;
        }
        this.cambiarSeccionEstudio(SECCION_GRADUADO_UEES, e?.value === true);
    }

    // Qué hace: ser graduado universitario habilita los datos de la universidad de procedencia y hace
    //           obligatorios el título y la cuota (regla del portal).
    onEstudioUniversidadChanged(e: any): void {
        if (this.readOnly || e?.dataField !== 'GRADUADO') {
            return;
        }
        this.refrescarItemsUniversidad();
    }

    // Qué hace: la forma de ingreso también manda sobre la universidad de procedencia.
    // Cómo lo hace: con nuevo ingreso (NI) los datos solo se habilitan si es graduado universitario.
    onCabeceraChanged(e: any): void {
        if (this.readOnly || e?.dataField !== 'FORMA_INGRESO') {
            return;
        }
        this.refrescarItemsUniversidad();
    }

    // Qué hace: rearma el formulario de estudios universitarios según graduado y forma de ingreso.
    private refrescarItemsUniversidad(): void {
        const graduado = this.estudioUniversidad?.GRADUADO === true;
        const habilitado = this.serviceEstudio.universidadHabilitada(this.model?.FORMA_INGRESO, graduado);
        this.itemsEstudioUniversidad = this.serviceEstudio.getItemsUniversidad(graduado, habilitado);
    }

    // Qué hace: enciende o apaga una sección opcional de estudios, con las mismas reglas del empleo.
    // Cómo lo hace: apagar con datos guardados pide confirmación y deja la fila marcada para eliminar
    //               al guardar; si la sección era nueva y no se ha guardado, simplemente se descarta.
    //               Encender sin fila abre el formulario vacío que se creará al guardar.
    private cambiarSeccionEstudio(seccion: string, activa: boolean): void {
        const esUees = seccion === SECCION_GRADUADO_UEES;
        const modelo = esUees ? this.estudioUees : this.estudioUniversidad;
        const check = esUees ? this.chkUees : this.chkUniversidad;
        const titulo = esUees ? 'Graduado UEES' : 'Estudios universitarios';

        if (!activa) {
            if (!modelo) {
                return;
            }
            if (!(modelo.CORR_PROSPECTO_ESTUDIO > 0)) {
                this.asignarEstudio(seccion, null);
                return;
            }
            // Se marca de una vez para que la pantalla reaccione al instante; la confirmación queda
            // como oportunidad de deshacer. Nada se borra hasta Guardar.
            this.marcarEliminarEstudio(seccion, true);
            confirm(
                `<div class="sguees-confirm-message">Al guardar se eliminará la información de ${titulo.toLowerCase()}. ¿Desea continuar?</div>`,
                titulo
            ).then((acepta: boolean) => {
                this.zone.run(() => {
                    if (acepta) {
                        return;
                    }
                    this.marcarEliminarEstudio(seccion, false);
                    check?.instance?.option('value', true);
                });
            });
            return;
        }

        this.marcarEliminarEstudio(seccion, false);
        if (!modelo) {
            this.asignarEstudio(seccion, this.serviceEstudio.getModeloNuevo(seccion, this.personaModel));
        }
        if (!esUees) {
            this.refrescarItemsUniversidad();
        }
    }

    // Qué hace: dice si la sección está visible con datos (lo que debe mostrar su interruptor).
    private seccionActiva(seccion: string): boolean {
        return seccion === SECCION_GRADUADO_UEES
            ? !!this.estudioUees && !this.estudioUeesEliminar
            : !!this.estudioUniversidad && !this.estudioUniversidadEliminar;
    }

    private marcarEliminarEstudio(seccion: string, eliminar: boolean): void {
        if (seccion === SECCION_GRADUADO_UEES) {
            this.estudioUeesEliminar = eliminar;
            return;
        }
        this.estudioUniversidadEliminar = eliminar;
    }

    private asignarEstudio(seccion: string, modelo: any): void {
        if (seccion === SECCION_GRADUADO_UEES) {
            this.estudioUees = modelo;
            return;
        }
        this.estudioUniversidad = modelo;
    }

    // Qué hace: deja TRABAJA en el modelo y refresca el espejo de "Condiciones declaradas".
    private setTrabaja(valor: boolean): void {
        if (this.formPersona?.instance) {
            this.formPersona.instance.updateData('TRABAJA', valor);
            return;
        }
        if (this.personaModel) {
            this.personaModel.TRABAJA = valor;
        }
    }

    private prepararEmpleoNuevo(): void {
        this.empleoModel = this.serviceEmpleo.getModeloNuevo(this.personaModel);
        this.empleoNuevo = true;
        this.empleoEliminar = false;
        this.mCORR_DEPTO_EMPLEO = [];
        this.mCORR_MUNICIPIO_EMPLEO = [];
    }

    private descartarEmpleoNuevo(): void {
        this.empleoModel = null;
        this.empleoNuevo = false;
    }

    // Qué hace: guarda los formularios editables del prospecto.
    // Cómo lo hace: valida los dx-form visibles y actualiza en orden persona → empleo →
    //               socioeconómico → respuestas → prospecto; se detiene en el primer error e indica
    //               la sección. Al terminar regresa al listado y lo refresca.
    guardar(): void {
        if (!this.validarFormularios()) {
            return;
        }
        if (this.esAlta()) {
            this.crearBorrador();
            return;
        }

        const original: any = this.modelUpdate ?? {};
        const cambiaOferta =
            this.model.CICLO !== original.CICLO ||
            this.model.CORR_CARRERA !== original.CORR_CARRERA ||
            this.model.CORR_MODALIDAD !== original.CORR_MODALIDAD;
        if (cambiaOferta && (!this.model?.CORR_CARRERA || !this.model?.CORR_MODALIDAD)) {
            this.notifyFx('Seleccione la carrera y la modalidad del prospecto.', NotifyType.Warning, { raw: true });
            return;
        }
        if (!cambiaOferta) {
            this.iniciarGuardado();
            return;
        }

        // Antes de guardar se pregunta al procedimiento qué pasará (sin escribir): así el aviso de beca
        // y de reapertura es el mismo que verá el portal, y un cambio inválido se detiene aquí.
        this.loadingVisible = true;
        this.service
            .validarCambio(this.model)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    this.loadingVisible = false;
                    const r = response?.Result ? response.Data?.[0] : null;
                    if (!r) {
                        this.notifyFx(response?.ErrorMessage ?? 'No se pudo validar el cambio de ciclo.', NotifyType.Error, { raw: true });
                        return;
                    }
                    if (r.RESULTADO !== 0) {
                        this.notifyFx(r.MENSAJE, NotifyType.Warning, { raw: true });
                        return;
                    }
                    const avisos: string[] = [];
                    if (r.BECA_RESTAURADA) {
                        const puntaje = r.PUNTAJE_RESTAURADO != null ? `, ${r.PUNTAJE_RESTAURADO} puntos` : '';
                        avisos.push(
                            `Se restaurará la solicitud de beca que el prospecto tenía en el ciclo ${this.model.CICLO} ` +
                                `(${r.ESTADO_BECA_RESTAURADA}${puntaje}), tal como quedó.` +
                                (r.BECAS_DEPURADAS > 0 ? ` Lo registrado en el ciclo ${original.CICLO} queda en el historial.` : '')
                        );
                    } else if (r.BECAS_DEPURADAS > 0) {
                        avisos.push(
                            r.BECAS_CLONADAS > 0
                                ? `La solicitud de beca del ciclo ${original.CICLO} (${r.ESTADO_BECA}) quedará como historial y se copiará al ciclo ${this.model.CICLO} en borrador: el aspirante deberá revisarla y volver a enviarla.`
                                : `La solicitud de beca del ciclo ${original.CICLO} (${r.ESTADO_BECA}) quedará como historial. Ese tipo de beca ya no está vigente, así que no se copiará al ciclo nuevo.`
                        );
                    }
                    if (r.REABRE_POSTULACION) {
                        avisos.push('El prospecto ya había enviado su documentación: la postulación se reabrirá para que la envíe de nuevo en el ciclo nuevo.');
                    }
                    if (!avisos.length) {
                        this.iniciarGuardado();
                        return;
                    }
                    confirm(
                        `<div class="sguees-confirm-message">${avisos.join('<br><br>')}<br><br>¿Desea continuar?</div>`,
                        'Cambio de ciclo'
                    ).then((acepta: boolean) => {
                        this.zone.run(() => {
                            if (acepta) {
                                this.iniciarGuardado();
                            }
                        });
                    });
                },
                error: (error: any) => {
                    this.loadingVisible = false;
                    this.notifyFx(`Cambio de ciclo: ${this.mensajeError(error)}`, NotifyType.Error, { raw: true });
                },
            });
    }

    // Qué hace: crea el CIF y deja la solicitud en borrador, y después guarda el resto de la ficha.
    // Cómo lo hace: el registro genera prospecto, persona, correo y teléfono. Esos contactos no se vuelven a insertar.
    private crearBorrador(): void {
        const alta = this.datosAlta();
        if (!alta) {
            return;
        }
        this.loadingVisible = true;
        this.service
            .registrar(alta)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    this.loadingVisible = false;
                    if (!response?.Result || !(Number(response?.Data?.CORR_PROSPECTO) > 0)) {
                        this.avisarNoCreada(response?.ErrorMessage ?? 'No se pudo crear la solicitud.');
                        return;
                    }
                    this.aplicarAltaCreada(response.Data, alta.CORREO, alta.TELEFONO);
                    this.iniciarGuardado(true);
                },
                error: (error: any) => {
                    this.loadingVisible = false;
                    this.avisarNoCreada(this.mensajeError(error));
                },
            });
    }

    // Qué hace: si el nombre y la fecha, o el correo, ya están en otra solicitud, lo avisa en amarillo.
    // Cómo lo hace: reconoce el texto que devuelve el registro y lo cambia por un mensaje que el usuario entienda.
    private avisarNoCreada(mensaje: string): void {
        const texto = mensaje || 'No se pudo crear la solicitud.';
        if (/nombre y .*fecha de nacimiento/i.test(texto)) {
            this.notifyFx(
                'Ya existe una solicitud con este nombre y esta fecha de nacimiento. Búsquela en el listado o cambie el nombre o la fecha para crear otra.',
                NotifyType.Warning,
                { raw: true }
            );
            return;
        }
        if (/correo/i.test(texto) && /registrad|otra solicitud/i.test(texto)) {
            this.notifyFx(
                'Este correo ya está en otra solicitud. Use otro correo o abra la solicitud que ya existe.',
                NotifyType.Warning,
                { raw: true }
            );
            return;
        }
        this.notifyFx(texto, NotifyType.Error, { raw: true });
    }

    // Qué hace: junta los datos que pide el registro de admisión.
    // Cómo lo hace: nombres y nacimiento salen de Datos personales; correo y teléfono, de Contacto.
    private datosAlta(): any | null {
        const persona = this.leerFormData(this.formPersona, this.personaModel);
        const cabecera = this.leerFormData(this.dataForm, this.model);
        const ciclo = this.cicloAlta(cabecera);
        const correo = this.contactoAlta(true);
        const telefono = this.contactoAlta(false);
        if (!persona?.NOMBRES?.trim() || !persona?.APELLIDO1?.trim()) {
            this.notifyFx('Ingrese los nombres y el primer apellido.', NotifyType.Warning, { raw: true });
            return null;
        }
        if (!persona?.FECHA_NACIMIENTO) {
            this.notifyFx('Ingrese la fecha de nacimiento.', NotifyType.Warning, { raw: true });
            return null;
        }
        if (!ciclo) {
            this.notifyFx('Seleccione el ciclo.', NotifyType.Warning, { raw: true });
            return null;
        }
        if (!(Number(cabecera?.CORR_CARRERA) > 0) || !(Number(cabecera?.CORR_MODALIDAD) > 0)) {
            this.notifyFx('Seleccione la carrera y la modalidad.', NotifyType.Warning, { raw: true });
            return null;
        }
        if (!cabecera?.FORMA_INGRESO) {
            this.notifyFx('Seleccione la forma de ingreso.', NotifyType.Warning, { raw: true });
            return null;
        }
        if (!correo || !telefono) {
            this.notifyFx('Agregue un correo y un teléfono en la pestaña Contacto antes de guardar.', NotifyType.Warning, { raw: true });
            return null;
        }
        return {
            NOMBRES: persona.NOMBRES,
            APELLIDO1: persona.APELLIDO1,
            APELLIDO2: persona.APELLIDO2,
            FECHA_NACIMIENTO: persona.FECHA_NACIMIENTO,
            ANIO: ciclo.ANIO,
            NUMERO_PERIODO: ciclo.NUMERO_PERIODO,
            CORR_CARRERA: cabecera.CORR_CARRERA,
            CORR_MODALIDAD: cabecera.CORR_MODALIDAD,
            FORMA_INGRESO: cabecera.FORMA_INGRESO,
            CORREO: correo,
            TELEFONO: telefono,
        };
    }

    private cicloAlta(cabecera: any): { ANIO: number; NUMERO_PERIODO: number } | null {
        let anio = Number(cabecera?.ANIO);
        let periodo = Number(cabecera?.NUMERO_PERIODO);
        if (!(anio > 0) || !(periodo > 0)) {
            const partes = String(cabecera?.CICLO || '').split('-');
            anio = Number(partes[0]);
            periodo = Number(partes[1]);
        }
        return anio > 0 && periodo > 0 ? { ANIO: anio, NUMERO_PERIODO: periodo } : null;
    }

    private contactoAlta(esCorreo: boolean): string {
        const lista = (this.contactos || []).filter((contacto: any) => !!contacto?.ES_CORREO === esCorreo);
        const elegido = lista.find((contacto: any) => contacto?.ES_PRINCIPAL) || lista[0];
        return (elegido?.CONTACTO || '').trim();
    }

    // Qué hace: pasa el formulario de alta a edición del prospecto recién creado.
    // Cómo lo hace: copia el CIF y la persona, quita el correo y el teléfono que ya guardó el registro
    //               y deja la fila en Solicitudes borrador sin volver a consultar.
    private aplicarAltaCreada(fila: any, correo: string, telefono: string): void {
        const financia = this.model.FINANCIA_ESTUDIOS;
        const forma = this.model.FORMA_INGRESO;
        Object.assign(this.model, fila, {
            FINANCIA_ESTUDIOS: financia,
            FORMA_INGRESO: forma,
            ESTADO: 'P',
            ESTADO_SOLICITUD: 'Borrador',
        });
        this.dataForm?.instance?.option('formData', this.model);
        this.model.DIAS_VENCE = fila?.DIAS_VENCE;
        this.model.FECHA_FIN_INSCRIPCION = fila?.FECHA_FIN_INSCRIPCION;
        this.quitarContactosRegistrados(correo, telefono);
        this.propagarLlaveAlta(Number(fila.CORR_PROSPECTO), Number(fila.CORR_PROSPECTO_PERSONA));
        this.modelUpdate = { ...this.model };
        this.filaGuardada = { ...this.model };
        this.mensajeGuardado = `La solicitud quedó en borrador. CIF ${fila.CODIGO_PROSPECTO}. La clave inicial del aspirante es ese CIF.`;
        this.insertarBorradorEnLista(this.filaGuardada);
        this.AsignaStatus(UpdateType.Update);
    }

    private quitarContactosRegistrados(correo: string, telefono: string): void {
        const correoClave = correo.trim().toLowerCase();
        const telefonoClave = telefono.trim();
        this.contactos = (this.contactos || []).filter((contacto: any) => {
            if (Number(contacto?.CORR_PROSPECTO_CONTACTO) > 0) {
                return true;
            }
            const valor = (contacto?.CONTACTO || '').trim();
            if (contacto?.ES_CORREO && valor.toLowerCase() === correoClave) {
                return false;
            }
            return !(contacto?.ES_TELEFONO && valor === telefonoClave);
        });
    }

    private propagarLlaveAlta(corr: number, persona: number): void {
        const marcar = (fila: any) => {
            if (!fila) {
                return;
            }
            fila.CORR_PROSPECTO = corr;
            fila.CORR_PROSPECTO_PERSONA = persona;
        };
        marcar(this.personaModel);
        marcar(this.empleoModel);
        marcar(this.estudioMedia);
        marcar(this.estudioUniversidad);
        marcar(this.estudioUees);
        (this.contactos || []).forEach(marcar);
        (this.familiares || []).forEach(marcar);
        (this.limitaciones || []).forEach(marcar);
        (this.deportaciones || []).forEach(marcar);
        (this.medios || []).forEach(marcar);
        (this.documentos || []).forEach(marcar);
    }

    private insertarBorradorEnLista(fila: any): void {
        const corr = Number(fila?.CORR_PROSPECTO);
        const actual = this.modelsBorrador || [];
        const indice = actual.findIndex((item: any) => Number(item?.CORR_PROSPECTO) === corr);
        if (indice >= 0) {
            actual[indice] = this.unirFila(fila, actual[indice]);
            this.modelsBorrador = actual;
        } else {
            this.modelsBorrador = [fila, ...actual];
        }
        this.aplicarLista();
    }

    private iniciarGuardado(conservarFila = false): void {
        const pasos = this.armarPasosGuardado();
        if (!conservarFila) {
            this.filaGuardada = this.filaListadoActual();
            this.mensajeGuardado = '';
        }
        this.loadingVisible = true;
        this.ejecutarPasos(pasos, 0);
    }

    // Qué hace: deja guardar una solicitud ingresada aunque los formularios no estén al 100 %.
    // Cómo lo hace: el 100 % se exige solo al aprobar. Aquí solo se evita guardar con una ficha a medias.
    private validarFormularios(): boolean {
        // Una ficha abierta (familiar, contacto, medio, limitación o deportación) se acepta o se cancela antes de guardar.
        if (this.medioModel) {
            this.notifyFx('Acepte o cancele el medio que está editando antes de guardar.', NotifyType.Warning, { raw: true });
            return false;
        }
        if (this.discapacidadEliminar) {
            this.descartarDiscapacidad();
        } else if (this.limitacionModel && !this.aceptarLimitacion()) {
            return false;
        }
        if (this.deportacionEliminar) {
            this.descartarDeportacion();
        } else if (this.deportacionModel && !this.aceptarDeportacion()) {
            return false;
        }
        if (this.contactoModel) {
            this.notifyFx('Acepte o cancele el contacto que está editando antes de guardar.', NotifyType.Warning, { raw: true });
            return false;
        }
        if (this.familiarModel) {
            this.notifyFx('Acepte o cancele el familiar que está editando antes de guardar.', NotifyType.Warning, { raw: true });
            return false;
        }

        return true;
    }

    // Qué hace: agrega el paso de guardado de una sección de estudios.
    // Cómo lo hace: eliminar si se apagó el interruptor y la fila existía; crear si no tiene llave;
    //               actualizar solo si cambió. Sin modelo o sin cambios, la sección no participa: así
    //               trabajar en una sección nunca obliga a tocar las otras.
    private agregarPasoEstudio(
        pasos: { nombre: string; accion: () => Observable<IResult> }[],
        nombre: string,
        seccion: string,
        modelo: any,
        form: DxFormComponent | undefined,
        eliminar: boolean
    ): void {
        if (!modelo) {
            return;
        }
        if (eliminar) {
            if (modelo.CORR_PROSPECTO_ESTUDIO > 0) {
                pasos.push({ nombre: `${nombre} (eliminar)`, accion: () => this.serviceEstudio.delete(modelo) });
            }
            return;
        }
        if (!this.estudioCambio(seccion, modelo, form)) {
            return;
        }
        if (!(modelo.CORR_PROSPECTO_ESTUDIO > 0)) {
            pasos.push({ nombre: `${nombre} (nuevo)`, accion: () => this.serviceEstudio.insert(this.leerFormData(form, modelo)) });
            return;
        }
        pasos.push({ nombre, accion: () => this.serviceEstudio.update(this.leerFormData(form, modelo)) });
    }

    private armarPasosGuardado(): { nombre: string; accion: () => Observable<IResult> }[] {
        const pasos: { nombre: string; accion: () => Observable<IResult> }[] = [];

        if (this.personaModel) {
            this.personaModel.TRABAJA = !!this.empleoModel && !this.empleoEliminar;
            this.personaModel.POSEE_DISCAPACIDAD = this.limitaciones.length > 0;
            this.personaModel.HA_SIDO_DEPORTADO = this.deportaciones.length > 0;
            pasos.push({
                nombre: 'Datos personales',
                accion: () => this.servicePersona.update(this.leerFormData(this.formPersona, this.personaModel)),
            });
        }
        // Empleo según el interruptor "Trabaja": eliminar, crear o actualizar (después de la persona,
        // que ya lleva el valor de TRABAJA; el API deja la bandera coherente en ambos casos).
        if (this.empleoEliminar && this.empleoModel?.CORR_PROSPECTO_EMPLEO > 0) {
            pasos.push({
                nombre: 'Información laboral (eliminar)',
                accion: () => this.serviceEmpleo.delete(this.empleoModel),
            });
        } else if (this.empleoNuevo && this.empleoModel) {
            pasos.push({
                nombre: 'Información laboral (nuevo)',
                accion: () => this.serviceEmpleo.insert(this.leerFormData(this.formEmpleo, this.empleoModel)),
            });
        } else if (this.empleoModel) {
            pasos.push({
                nombre: 'Información laboral',
                accion: () => this.serviceEmpleo.update(this.leerFormData(this.formEmpleo, this.empleoModel)),
            });
        }
        // Información adicional: bajas, altas y cambios de los medios de origen (solo lo que cambió).
        for (const medio of this.mediosEliminar) {
            pasos.push({ nombre: `Medio ${medio.NOMBRE_MEDIO || ''} (eliminar)`.trim(), accion: () => this.serviceMedio.delete(medio) });
        }
        for (const medio of this.medios) {
            const actual = JSON.stringify(this.serviceMedio.getPayload(medio));
            if (!(medio.CORR_PROSPECTO_MEDIO > 0)) {
                pasos.push({ nombre: `Medio ${medio.NOMBRE_MEDIO || ''} (nuevo)`.trim(), accion: () => this.serviceMedio.insert(medio) });
            } else if (actual !== (this.medioOriginal[medio.CORR_PROSPECTO_MEDIO] ?? '')) {
                pasos.push({ nombre: `Medio ${medio.NOMBRE_MEDIO || ''}`.trim(), accion: () => this.serviceMedio.update(medio) });
            }
        }

        // Salud y Migratorio: bajas, altas y cambios (solo lo que cambió). El API deja las banderas
        // POSEE_DISCAPACIDAD / HA_SIDO_DEPORTADO de la persona iguales a "tiene al menos una fila".
        for (const limitacion of this.limitacionesEliminar) {
            pasos.push({ nombre: `Limitación ${limitacion.NOMBRE_LIMITACION || ''} (eliminar)`.trim(), accion: () => this.serviceLimitacion.delete(limitacion) });
        }
        for (const limitacion of this.limitaciones) {
            const actual = JSON.stringify(this.serviceLimitacion.getPayload(limitacion));
            if (!(limitacion.CORR_PROSPECTO_LIMITACION_FISICA > 0)) {
                pasos.push({ nombre: `Limitación ${limitacion.NOMBRE_LIMITACION || ''} (nueva)`.trim(), accion: () => this.serviceLimitacion.insert(limitacion) });
            } else if (actual !== (this.limitacionOriginal[limitacion.CORR_PROSPECTO_LIMITACION_FISICA] ?? '')) {
                pasos.push({ nombre: `Limitación ${limitacion.NOMBRE_LIMITACION || ''}`.trim(), accion: () => this.serviceLimitacion.update(limitacion) });
            }
        }
        for (const deportacion of this.deportacionesEliminar) {
            pasos.push({ nombre: `Deportación ${deportacion.NOMBRE_PAIS || ''} (eliminar)`.trim(), accion: () => this.serviceDeportacion.delete(deportacion) });
        }
        for (const deportacion of this.deportaciones) {
            const actual = JSON.stringify(this.serviceDeportacion.getPayload(deportacion));
            if (!(deportacion.CORR_PROSPECTO_DEPORTACION > 0)) {
                pasos.push({ nombre: `Deportación ${deportacion.NOMBRE_PAIS || ''} (nueva)`.trim(), accion: () => this.serviceDeportacion.insert(deportacion) });
            } else if (actual !== (this.deportacionOriginal[deportacion.CORR_PROSPECTO_DEPORTACION] ?? '')) {
                pasos.push({ nombre: `Deportación ${deportacion.NOMBRE_PAIS || ''}`.trim(), accion: () => this.serviceDeportacion.update(deportacion) });
            }
        }

        // Contactos: bajas, altas y cambios (solo los que cambiaron). Los principales nuevos van antes
        // que las bajas para que el API nunca vea un tipo sin principal.
        for (const contacto of this.contactos) {
            const actual = JSON.stringify(this.serviceContacto.getPayload(contacto));
            if (!(contacto.CORR_PROSPECTO_CONTACTO > 0)) {
                pasos.push({ nombre: `Contacto ${contacto.CONTACTO} (nuevo)`, accion: () => this.serviceContacto.insert(contacto) });
            } else if (actual !== (this.contactoOriginal[contacto.CORR_PROSPECTO_CONTACTO] ?? '')) {
                pasos.push({ nombre: `Contacto ${contacto.CONTACTO}`, accion: () => this.serviceContacto.update(contacto) });
            }
        }
        for (const contacto of this.contactosEliminar) {
            pasos.push({ nombre: `Contacto ${contacto.CONTACTO} (eliminar)`, accion: () => this.serviceContacto.delete(contacto) });
        }

        // Familia: primero las bajas y luego las altas y los cambios (solo los familiares que cambiaron).
        for (const familiar of this.familiaresEliminar) {
            pasos.push({
                nombre: `Familiar ${familiar.NOMBRE_COMPLETO || ''} (eliminar)`.trim(),
                accion: () => this.serviceFamiliar.delete(familiar),
            });
        }
        for (const familiar of this.familiares) {
            const actual = JSON.stringify(this.serviceFamiliar.getPayload(familiar));
            if (!(familiar.CORR_PROSPECTO_FAMILIAR > 0)) {
                pasos.push({
                    nombre: `Familiar ${familiar.NOMBRE_COMPLETO || ''} (nuevo)`.trim(),
                    accion: () => this.serviceFamiliar.insert(familiar),
                });
                continue;
            }
            if (actual !== (this.familiarOriginal[familiar.CORR_PROSPECTO_FAMILIAR] ?? '')) {
                pasos.push({
                    nombre: `Familiar ${familiar.NOMBRE_COMPLETO || ''}`.trim(),
                    accion: () => this.serviceFamiliar.update(familiar),
                });
            }
        }

        // Estudios: una fila por sección, con las mismas reglas del empleo (eliminar, crear o actualizar).
        this.agregarPasoEstudio(pasos, 'Educación media', SECCION_MEDIA, this.estudioMedia, this.formEstudioMedia, false);
        this.agregarPasoEstudio(pasos, 'Estudios universitarios', SECCION_UNIVERSIDAD, this.estudioUniversidad, this.formEstudioUniversidad, this.estudioUniversidadEliminar);
        this.agregarPasoEstudio(pasos, 'Graduado UEES', SECCION_GRADUADO_UEES, this.estudioUees, this.formEstudioUees, this.estudioUeesEliminar);

        // El encabezado (carrera, ciclo, forma de ingreso) solo se edita desde la solicitud de nuevo ingreso.
        if (this.esAcademico) {
            pasos.push({
                nombre: 'Datos del prospecto',
                accion: () => this.service.update(this.leerFormData(this.dataForm, this.model)),
            });
        }

        return pasos;
    }

    // Qué hace: combina el modelo con lo que el dx-form tiene en pantalla (mismo criterio que guardarMtto).
    // Qué hace: saca el motivo real del fallo para mostrarlo en el aviso.
    // Cómo lo hace: el interceptor de errores del ERP ya convierte la respuesta del API en un texto
    //               ("Error: ..."), así que ese caso se toma tal cual; el resto son respuestas crudas.
    private mensajeError(error: any): string {
        if (typeof error === 'string') {
            return error.replace(/^Error:\s*/, '').trim() || 'no se pudo guardar';
        }
        return error?.error?.ErrorMessage ?? error?.ErrorMessage ?? error?.message ?? 'no se pudo guardar';
    }

    private leerFormData(formulario: DxFormComponent | undefined, modelo: any): any {
        const formData = formulario?.instance?.option('formData');
        return formData ? { ...modelo, ...formData } : modelo;
    }

    private ejecutarPasos(pasos: { nombre: string; accion: () => Observable<IResult> }[], indice: number): void {
        if (indice >= pasos.length) {
            this.loadingVisible = false;
            this.notifyFx(this.mensajeGuardado || 'Prospecto modificado con exito!', NotifyType.Success, { raw: true });
            this.mensajeGuardado = '';
            this.aplicarFilaEnListado(this.filaGuardada);
            this.filaGuardada = null;
            this.corrAprobarResuelto = 0;
            this.AsignaStatus(UpdateType.Browse);
            return;
        }

        const paso = pasos[indice];
        paso.accion()
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response?.Result) {
                        if (response?.Data?.CODIGO_PROSPECTO) {
                            this.filaGuardada = this.unirFila(response.Data, this.filaGuardada || this.model);
                            if (this.valorDeListado(this.filaGuardada?.DIAS_VENCE) || this.filaGuardada?.DIAS_VENCE === 0) {
                                this.model.DIAS_VENCE = this.filaGuardada.DIAS_VENCE;
                                this.model.FECHA_FIN_INSCRIPCION = this.filaGuardada.FECHA_FIN_INSCRIPCION;
                            }
                        }
                        this.ejecutarPasos(pasos, indice + 1);
                    } else {
                        this.loadingVisible = false;
                        this.notifyFx(`${paso.nombre}: ${response?.ErrorMessage ?? 'no se pudo guardar'}`, NotifyType.Error, { raw: true });
                    }
                },
                error: (error: any) => {
                    this.loadingVisible = false;
                    this.notifyFx(`${paso.nombre}: ${this.mensajeError(error)}`, NotifyType.Error, { raw: true });
                },
            });
    }
    // #endregion

    //#region <Metodos Detalle - Carga>
    // Qué hace: la fila que ya está en la grilla, para no perder Vence al empezar a editar.
    // Cómo lo hace: busca el mismo CORR_PROSPECTO en borradores o pendientes.
    private filaListadoActual(): any | null {
        const corr = Number(this.model?.CORR_PROSPECTO);
        const lista = this.esBorrador ? this.modelsBorrador : this.modelsPendientes;
        const fila = (lista || []).find((item: any) => Number(item?.CORR_PROSPECTO) === corr);
        return fila ? { ...fila } : null;
    }

    // Qué hace: un dato de la grilla sirve si viene con valor. El cero de Vence también cuenta.
    private valorDeListado(valor: any): boolean {
        return valor !== null && valor !== undefined && valor !== '';
    }

    // Qué hace: junta la fila guardada con la que ya se veía, sin borrar Vence ni el paso.
    // Cómo lo hace: el encabezado no devuelve esas columnas. Si el dato nuevo viene vacío, se queda el anterior.
    private unirFila(nueva: any, previa: any): any {
        const campos = [
            'DIAS_VENCE',
            'FECHA_FIN_INSCRIPCION',
            'DIAS_EN_PASO',
            'NOMBRE_PASO',
            'ORDEN_PASO',
            'NOMBRE_ACTOR_PASO',
            'NOMBRE_PASO_INICIAL',
            'NOMBRE_ACTOR_INICIAL',
            'CORR_INSTANCIA',
            'CORR_PASO_ACTUAL',
            'CORR_ESTADO',
            'NOMBRE_ESTADO',
        ];
        const unida = { ...(previa || {}), ...(nueva || {}) };
        campos.forEach((campo) => {
            if (!this.valorDeListado(nueva?.[campo]) && this.valorDeListado(previa?.[campo])) {
                unida[campo] = previa[campo];
            }
        });
        return unida;
    }

    // Qué hace: deja en la grilla la fila que devolvió el guardado, sin volver a consultar el listado.
    private aplicarFilaEnListado(fila: any): void {
        const corr = Number(fila?.CORR_PROSPECTO);
        if (!(corr > 0)) {
            return;
        }
        const lista = this.esBorrador ? this.modelsBorrador || [] : this.modelsPendientes || [];
        const indice = lista.findIndex((actual: any) => Number(actual?.CORR_PROSPECTO) === corr);
        if (indice >= 0) {
            lista[indice] = this.unirFila(fila, lista[indice]);
        } else if (fila?.ESTADO === 'P' || fila?.ESTADO === 'p') {
            this.modelsBorrador = [{ ...fila }, ...(this.modelsBorrador || [])];
        }
        if (this.esBorrador) {
            this.modelsBorrador = indice >= 0 ? lista : this.modelsBorrador;
        } else if (indice >= 0) {
            this.modelsPendientes = lista;
        }
        this.aplicarLista();
    }

    // Qué hace: carga las tablas hijas de las pestañas al abrir la consulta o la edición.
    // Cómo lo hace: 11 consultas en paralelo; el load panel se apaga cuando termina la última.
    cargarDetalle(CORR_PROSPECTO: number): void {
        this.limpiarDetalle();
        if (!(CORR_PROSPECTO > 0)) {
            return;
        }

        this.cargarOfertaAcademica(CORR_PROSPECTO);
        this.cargarPersona(CORR_PROSPECTO);
        this.cargarContactos(CORR_PROSPECTO);
        this.cargarFamiliares(CORR_PROSPECTO);
        this.cargarLimitaciones(CORR_PROSPECTO);
        this.cargarDeportaciones(CORR_PROSPECTO);
        this.cargarMedios(CORR_PROSPECTO);
        this.cargarDocumentos(CORR_PROSPECTO);
        this.cargarBitacora(CORR_PROSPECTO);
        // Solo lo de la vista abierta: lo que no se carga no tiene modelo, así que tampoco entra al guardado.
        if (this.esAcademico) {
            this.cargarEstudios(CORR_PROSPECTO);
        }
    }

    limpiarDetalle(): void {
        this.personaModel = null;
        this.contactos = [];
        this.contactoModel = null;
        this.contactoEditando = null;
        this.contactosEliminar = [];
        this.contactoOriginal = {};
        this.familiares = [];
        this.familiarModel = null;
        this.familiarEditando = null;
        this.emergenciaModel = null;
        this.familiaresEliminar = [];
        this.familiarOriginal = {};
        this.limitaciones = [];
        this.limitacionModel = null;
        this.limitacionEditando = null;
        this.limitacionesEliminar = [];
        this.limitacionOriginal = {};
        this.discapacidadEliminar = false;
        this.limitacionesCargadas = false;
        this.deportaciones = [];
        this.deportacionModel = null;
        this.deportacionEditando = null;
        this.deportacionesEliminar = [];
        this.deportacionOriginal = {};
        this.deportacionEliminar = false;
        this.deportacionesCargadas = false;
        this.medios = [];
        this.medioModel = null;
        this.medioEditando = null;
        this.mediosEliminar = [];
        this.medioOriginal = {};
        this.estudioMedia = null;
        this.estudioUniversidad = null;
        this.estudioUees = null;
        this.estudioUniversidadEliminar = false;
        this.estudioUeesEliminar = false;
        this.estudioOriginal = {};
        this.estudiosCargados = false;
        this.itemsEstudioUniversidad = this.serviceEstudio.getItemsUniversidad();
        this.mCORR_DEPTO_ESTUDIO = [];
        this.mCORR_CARRERA_CICLO = [];
        this.mCORR_MODALIDAD = [];
        this.mCICLO_CAMBIO = [];
        this.empleoModel = null;
        this.empleoNuevo = false;
        this.empleoEliminar = false;
        this.empleoCargado = false;
        this.documentos = [];
        this.bitacoras = [];
        this.mCORR_DEPTO_RESIDENCIA = [];
        this.mCORR_MUNICIPIO_RESIDENCIA = [];
        this.mCORR_DEPTO_EMPLEO = [];
        this.mCORR_MUNICIPIO_EMPLEO = [];
        this.cargasPendientes = 0;
        this.loadingVisible = false;
    }

    // Qué hace: ejecuta una consulta del detalle y entrega response.Data al callback.
    // Cómo lo hace: centraliza take(1), errores y el contador del load panel.
    private cargarLista(consulta: Observable<IResult>, asignar: (data: any) => void): void {
        this.cargasPendientes++;
        this.loadingVisible = true;
        consulta.pipe(take(1)).subscribe({
            next: (response: any) => {
                if (response.Result) {
                    asignar(response.Data ?? []);
                } else {
                    this.notifyApiResponse(response);
                }
                this.finalizarCarga();
            },
            error: (error: any) => {
                this.notifyApiError(error);
                this.finalizarCarga();
            },
        });
    }

    private finalizarCarga(): void {
        this.cargasPendientes = Math.max(0, this.cargasPendientes - 1);
        if (this.cargasPendientes === 0) {
            this.loadingVisible = false;
        }
    }
    // #endregion

    //#region <Metodos Información Personal - Carga>
    // Qué hace: datos personales; además carga departamentos y municipios de la residencia
    //           para que los lookups muestren el nombre.
    cargarPersona(CORR_PROSPECTO: number): void {
        this.cargarLista(this.servicePersona.getPersonaPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.personaModel = data[0] ?? null;
            this.sincronizarDiscapacidad();
            this.sincronizarDeportado();
            this.getCORR_DEPTO_RESIDENCIA(this.personaModel?.CORR_PAIS_RESIDENCIA);
            this.getCORR_MUNICIPIO_RESIDENCIA(this.personaModel?.CORR_PAIS_RESIDENCIA, this.personaModel?.CORR_DEPTO_RESIDENCIA);
            this.sincronizarEmpleoConTrabaja();
            this.sincronizarEstudioMedia();
        });
    }

    // Qué hace: contactos del prospecto con su firma, para enviar al API solo los que cambien.
    cargarContactos(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceContacto.getContactosPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.contactos = (data ?? []).map((c) => this.serviceContacto.normalizar(c));
            this.contactoOriginal = {};
            for (const contacto of this.contactos) {
                this.contactoOriginal[contacto.CORR_PROSPECTO_CONTACTO] = JSON.stringify(this.serviceContacto.getPayload(contacto));
            }
        });
    }

    // Qué hace: familiares del prospecto y su contacto de emergencia.
    // Cómo lo hace: la grilla muestra todos; el de emergencia es la fila marcada. Guarda además una
    //               firma de cada uno para enviar al API solo los que cambien.
    cargarFamiliares(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceFamiliar.getFamiliaresPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.familiares = data ?? [];
            this.familiarOriginal = {};
            for (const familiar of this.familiares) {
                this.familiarOriginal[familiar.CORR_PROSPECTO_FAMILIAR] = JSON.stringify(this.serviceFamiliar.getPayload(familiar));
            }
            this.recalcularEmergencia();
        });
    }

    // Qué hace: limitaciones y deportaciones con su firma, para enviar al API solo las que cambien.
    cargarLimitaciones(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceLimitacion.getLimitacionesPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.limitaciones = data ?? [];
            this.limitacionesCargadas = true;
            this.limitacionOriginal = {};
            for (const limitacion of this.limitaciones) {
                this.limitacionOriginal[limitacion.CORR_PROSPECTO_LIMITACION_FISICA] = JSON.stringify(this.serviceLimitacion.getPayload(limitacion));
            }
            this.sincronizarDiscapacidad();
        });
    }

    cargarDeportaciones(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceDeportacion.getDeportacionesPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.deportaciones = data ?? [];
            this.deportacionesCargadas = true;
            this.deportacionOriginal = {};
            for (const deportacion of this.deportaciones) {
                this.deportacionOriginal[deportacion.CORR_PROSPECTO_DEPORTACION] = JSON.stringify(this.serviceDeportacion.getPayload(deportacion));
            }
            this.sincronizarDeportado();
        });
    }

    // Qué hace: medios de origen con su código y su firma, para enviar al API solo los que cambien.
    // Qué hace: documentos de esta solicitud según el tipo 104 y la regla del prospecto.
    cargarDocumentos(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceDocumento.getDocumentosPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.documentos = data ?? [];
        });
    }

    // Qué hace: historial del flujo de esta solicitud.
    // Cómo lo hace: la grilla muestra el CIF cuando el paso lo ejecutó el portal.
    cargarBitacora(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceBitacora.getPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.bitacoras = data ?? [];
        });
    }

    // Qué hace: Options lleva subir, eliminar y ver. El nombre del archivo va en su columna.
    // Cómo lo hace: el botón Subir es la etiqueta del input, así el selector no se cierra solo.
    private prepararColumnasDocumento(): void {
        const columnas = this.serviceDocumento.getColumns().map((columna: any) => {
            if (columna?.dataField !== 'NOMBRE_ARCHIVO') {
                return columna;
            }
            return {
                ...columna,
                calculateCellValue: (fila: any) => fila?.NOMBRE_ARCHIVO || 'Sin archivo',
            };
        });
        columnas.unshift({
            name: 'btnAcciones',
            caption: 'Options',
            width: 140,
            minWidth: 130,
            allowFiltering: false,
            allowHeaderFiltering: false,
            allowSorting: false,
            alignment: 'center',
            cellTemplate: (celda: HTMLElement, info: any) => this.pintarOpcionesDocumento(celda, info?.data),
        });
        this.columnsDocumento = columnas;
    }

    private pintarOpcionesDocumento(celda: HTMLElement, fila: any): void {
        const acciones = document.createElement('div');
        acciones.className = 'aca-prospecto-doc-acciones';
        const hayArchivo = !!fila?.NOMBRE_ARCHIVO;

        if (!this.readOnly) {
            acciones.appendChild(this.botonSubirDocumento(fila));
            acciones.appendChild(this.botonDocumento('dx-icon-trash', 'Eliminar archivo', (evento) => {
                evento.preventDefault();
                this.zone.run(() => this.quitarDocumento(fila));
            }));
        }
        if (hayArchivo) {
            acciones.appendChild(this.botonDocumento('dx-icon-eyeopen', 'Ver archivo', (evento) => {
                evento.preventDefault();
                this.zone.run(() => this.verDocumento(fila));
            }));
        }
        celda.appendChild(acciones);
    }

    private botonDocumento(icono: string, titulo: string, alClick: (evento: Event) => void): HTMLButtonElement {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'aca-prospecto-doc-ver';
        boton.title = titulo;
        const marca = document.createElement('span');
        marca.className = icono;
        boton.appendChild(marca);
        boton.addEventListener('click', (evento: Event) => {
            evento.stopPropagation();
            alClick(evento);
        });
        return boton;
    }

    private botonSubirDocumento(fila: any): HTMLLabelElement {
        const etiqueta = document.createElement('label');
        etiqueta.className = 'aca-prospecto-doc-ver';
        etiqueta.title = 'Subir archivo';
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = this.serviceDocumento.acepta(fila);
        input.className = 'aca-prospecto-doc-input';
        input.addEventListener('click', (evento: Event) => evento.stopPropagation());
        input.addEventListener('change', () => {
            const archivo = input.files?.[0];
            input.value = '';
            if (archivo) {
                this.zone.run(() => this.subirDocumento(fila, archivo));
            }
        });
        etiqueta.addEventListener('click', (evento: Event) => evento.stopPropagation());
        const icono = document.createElement('span');
        icono.className = 'dx-icon-upload';
        etiqueta.append(input, icono);
        return etiqueta;
    }

    private quitarDocumento(fila: any): void {
        const corr = Number(this.model?.CORR_PROSPECTO);
        const documento = Number(fila?.CORR_DOCUMENTO_ADMISION);
        if (this.readOnly || !(corr > 0) || !(documento > 0) || this.subiendoDocumento) {
            return;
        }
        if (!fila?.NOMBRE_ARCHIVO) {
            this.notifyFx('Este documento no tiene un archivo cargado.', NotifyType.Warning, { raw: true });
            return;
        }
        confirm('¿Eliminar el archivo de este documento?', 'Eliminar archivo').then((acepta: boolean) => {
            this.zone.run(() => {
                if (!acepta) {
                    return;
                }
                this.subiendoDocumento = true;
                this.serviceDocumento.quitarArchivo(corr, documento).pipe(take(1)).subscribe({
                    next: (response: any) => {
                        this.subiendoDocumento = false;
                        if (!response?.Result) {
                            this.notifyApiResponse(response);
                            return;
                        }
                        const data = response.Data || {};
                        this.documentos = this.documentos.map((d) =>
                            d.CORR_DOCUMENTO_ADMISION === documento
                                ? {
                                      ...d,
                                      ...data,
                                      NOMBRE_ARCHIVO: data.NOMBRE_ARCHIVO || null,
                                      FECHA_CARGA: data.FECHA_CARGA || null,
                                      ESTADO_REVISION: data.ESTADO_REVISION || null,
                                      CORR_PROSPECTO_DOCUMENTO: data.CORR_PROSPECTO_DOCUMENTO || null,
                                  }
                                : d
                        );
                        this.notifyFx('Archivo eliminado', NotifyType.Success);
                    },
                    error: (error: any) => {
                        this.subiendoDocumento = false;
                        this.notifyApiError(error);
                    },
                });
            });
        });
    }

    private subirDocumento(fila: any, file: File): void {
        const corr = this.model?.CORR_PROSPECTO;
        if (this.readOnly || !file || !fila || !corr || this.subiendoDocumento) {
            return;
        }
        const aviso = this.serviceDocumento.validarArchivo(fila, file);
        if (aviso) {
            this.notifyFx(aviso, NotifyType.Warning, { raw: true });
            return;
        }
        this.subiendoDocumento = true;
        this.serviceDocumento.cargarArchivo(corr, fila.CORR_DOCUMENTO_ADMISION, file).pipe(take(1)).subscribe({
            next: (response: any) => {
                this.subiendoDocumento = false;
                if (!response?.Result || !response?.Data) {
                    this.notifyApiResponse(response);
                    return;
                }
                this.documentos = this.documentos.map((d) =>
                    d.CORR_DOCUMENTO_ADMISION === response.Data.CORR_DOCUMENTO_ADMISION ? { ...d, ...response.Data } : d
                );
                this.notifyFx(response.ErrorMessage || 'Documento cargado', NotifyType.Success);
            },
            error: (error: any) => {
                this.subiendoDocumento = false;
                this.notifyApiError(error);
            },
        });
    }

    private verDocumento(fila: any): void {
        const corr = Number(this.model?.CORR_PROSPECTO);
        const documento = Number(fila?.CORR_DOCUMENTO_ADMISION);
        if (!(corr > 0) || !(documento > 0) || !fila?.NOMBRE_ARCHIVO) {
            return;
        }
        this.serviceDocumento.getArchivo(corr, documento).pipe(take(1)).subscribe({
            next: (blob: Blob) => {
                const tipo = blob?.type && blob.type !== 'application/octet-stream' ? blob.type : this.tipoDocumento(fila.NOMBRE_ARCHIVO);
                const archivo = new Blob([blob], { type: tipo });
                const url = window.URL.createObjectURL(archivo);
                const ventana = window.open(url, '_blank');
                if (!ventana) {
                    this.appInfoService.downloadFile(archivo, fila.NOMBRE_ARCHIVO);
                }
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
            },
            error: () => this.notifyFx('No se pudo abrir el archivo.', NotifyType.Warning, { raw: true }),
        });
    }

    private tipoDocumento(nombre: string): string {
        const extension = (nombre || '').split('.').pop()?.toLowerCase();
        if (extension === 'pdf') return 'application/pdf';
        if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
        if (extension === 'png') return 'image/png';
        return 'application/octet-stream';
    }

    cargarMedios(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceMedio.getMediosPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.medios = (data ?? []).map((m) => ({ ...m, CODIGO_MEDIO: this.codigoMedio(m.CORR_MEDIO_ORIGEN) }));
            this.medioOriginal = {};
            for (const medio of this.medios) {
                this.medioOriginal[medio.CORR_PROSPECTO_MEDIO] = JSON.stringify(this.serviceMedio.getPayload(medio));
            }
        });
    }
    // #endregion

    //#region <Metodos Información Académica - Carga>
    // Qué hace: reparte los estudios en sus tres secciones (la vista ya los clasifica).
    // Cómo lo hace: educación media siempre se muestra (si no existe, se crea al guardar); las otras
    //               dos solo si tienen fila. Además carga los departamentos del país de la media.
    cargarEstudios(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceEstudio.getEstudiosPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.estudioMedia = data.find((e) => e.SECCION === SECCION_MEDIA) ?? null;
            this.estudioUniversidad = data.find((e) => e.SECCION === SECCION_UNIVERSIDAD) ?? null;
            this.estudioUees = data.find((e) => e.SECCION === SECCION_GRADUADO_UEES) ?? null;
            this.refrescarItemsUniversidad();
            this.getCORR_DEPTO_ESTUDIO(this.estudioMedia?.CORR_PAIS);
            this.estudioOriginal = {
                [SECCION_MEDIA]: this.huellaEstudio(this.estudioMedia),
                [SECCION_UNIVERSIDAD]: this.huellaEstudio(this.estudioUniversidad),
                [SECCION_GRADUADO_UEES]: this.huellaEstudio(this.estudioUees),
            };
            this.estudiosCargados = true;
            this.sincronizarEstudioMedia();
        });
    }

    // Qué hace: firma del contenido de una sección (lo que se enviaría al API).
    private huellaEstudio(modelo: any): string {
        return modelo ? JSON.stringify(this.serviceEstudio.getPayload(modelo)) : '';
    }

    // Qué hace: dice si una sección debe guardarse.
    // Cómo lo hace: es nueva (sin llave) o su contenido cambió respecto de como se cargó. Las secciones
    //               intactas no se envían ni se validan: cada bloque es independiente de los otros.
    private estudioCambio(seccion: string, modelo: any, form: DxFormComponent | undefined): boolean {
        if (!modelo) {
            return false;
        }
        if (!(modelo.CORR_PROSPECTO_ESTUDIO > 0)) {
            return true;
        }
        return this.huellaEstudio(this.leerFormData(form, modelo)) !== (this.estudioOriginal[seccion] ?? '');
    }

    // Qué hace: la educación media siempre debe existir; si el prospecto no la tiene, abre el
    //           formulario vacío para crearla al guardar (solo en edición).
    private sincronizarEstudioMedia(): void {
        if (this.readOnly || !this.personaModel || !this.estudiosCargados || this.estudioMedia) {
            return;
        }
        this.estudioMedia = this.serviceEstudio.getModeloNuevo(SECCION_MEDIA, this.personaModel);
    }
    // #endregion

    //#region <Metodos Información Económica - Carga>
    // Qué hace: empleo (máximo uno); además carga departamentos y municipios del empleo.
    cargarEmpleo(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceEmpleo.getEmpleoPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.empleoModel = data[0] ?? null;
            this.empleoCargado = true;
            if (this.empleoModel) {
                // Llegó el empleo real: cualquier "nuevo" preparado mientras se cargaba deja de aplicar.
                this.empleoNuevo = false;
                this.empleoEliminar = false;
            }
            this.getCORR_DEPTO_EMPLEO(this.empleoModel?.CORR_PAIS);
            this.getCORR_MUNICIPIO_EMPLEO(this.empleoModel?.CORR_PAIS, this.empleoModel?.CORR_DEPTO);
            this.sincronizarEmpleoConTrabaja();
        });
    }

    // #endregion
}
