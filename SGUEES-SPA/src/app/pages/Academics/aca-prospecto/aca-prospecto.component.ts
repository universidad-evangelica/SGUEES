import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
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
import { BarraMttoCombox } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { AcaProspecto } from './models/aca-prospecto';
import { AcaProspectoCiclo } from './models/aca-prospecto-ciclo';
import { AcaProspectoService } from './aca-prospecto.service';
import { AcaProspectoPersonaService } from './aca-prospecto-persona/aca-prospecto-persona.service';
import { AcaProspectoContactoService, TIPO_CORREO } from './aca-prospecto-contacto/aca-prospecto-contacto.service';
import { AcaProspectoFamiliarService } from './aca-prospecto-familiar/aca-prospecto-familiar.service';
import { AcaProspectoLimitacionFisicaService } from './aca-prospecto-limitacion-fisica/aca-prospecto-limitacion-fisica.service';
import { AcaProspectoDeportacionService } from './aca-prospecto-deportacion/aca-prospecto-deportacion.service';
import { AcaProspectoMedioOrigenService, MEDIO_OTRO, MEDIO_REFERIDO } from './aca-prospecto-medio-origen/aca-prospecto-medio-origen.service';
import {
    AcaProspectoEstudioService,
    SECCION_MEDIA,
    SECCION_UNIVERSIDAD,
    SECCION_GRADUADO_UEES,
} from './aca-prospecto-estudio/aca-prospecto-estudio.service';
import { AcaProspectoEmpleoService } from './aca-prospecto-empleo/aca-prospecto-empleo.service';
import { AcaProspectoSocioeconomicoService } from './aca-prospecto-socioeconomico/aca-prospecto-socioeconomico.service';
import { AcaProspectoSeRespuestaService } from './aca-prospecto-se-respuesta/aca-prospecto-se-respuesta.service';
import { AcaProspectoSeRespuesta } from './aca-prospecto-se-respuesta/models/aca-prospecto-se-respuesta';

// Qué hace: consulta y edición de prospectos de pregrado por ciclo (Académico → Consultas → Prospectos).
// Cómo lo hace: listado filtrado por el combo de ciclos de la barra; un clic en la fila abre la
//               consulta (modo Not_Defined, sin Guardar) y carga las tablas hijas en tres pestañas.
//               Editar = lápiz de la grilla (editarClick, estándar) o botón "Modificar" desde la
//               consulta: los formularios se habilitan y Guardar actualiza tabla por tabla
//               (persona → empleo → socioeconómico → respuestas → prospecto), como el resto del ERP
//               (eFramework no maneja transacciones). Las grillas hijas siguen de solo lectura (fase 2).
@Component({
    selector: 'app-aca-prospecto',
    templateUrl: './aca-prospecto.component.html',
    styleUrls: ['./aca-prospecto.component.scss'],
})
export class AcaProspectoComponent extends CBaseComponent implements OnInit {
    //#region <Declarando Variables>
    @ViewChild('fPersona', { static: false }) formPersona?: DxFormComponent;
    @ViewChild('fEmpleo', { static: false }) formEmpleo?: DxFormComponent;
    @ViewChild('fSocio', { static: false }) formSocio?: DxFormComponent;
    @ViewChild('fRespuestas', { static: false }) formRespuestas?: DxFormComponent;
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
    @ViewChild('chkUniversidad', { static: false }) chkUniversidad?: DxCheckBoxComponent;
    @ViewChild('chkUees', { static: false }) chkUees?: DxCheckBoxComponent;

    protected override mttoGridKeyExpr = 'CORR_PROSPECTO';
    readOnly = true;
    // Texto del botón "Modificar" de la barra: solo en consulta y con permiso U.
    btnModificar = '';
    model: any = this.fillData();
    itemsCarrera: any[] = [];

    // Qué hace: catálogo y valor del combo de ciclos de la barra (combox1).
    mCICLO: AcaProspectoCiclo[] = [];
    filtroCiclo = '';
    barraFiltroCiclo: BarraMttoCombox | null = null;
    cicloLookupColumns = [
        { dataField: 'NOMBRE_CICLO', caption: 'Ciclo', width: 160 },
        { dataField: 'CANTIDAD_PROSPECTOS', caption: 'Prospectos', width: 110 },
    ];

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
    mOPCIONES_SE: any[] = [];
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
    deportaciones: any[] = [];
    columnsDeportacion: any[] = [];
    summaryDeportacion: any = {};
    deportacionModel: any = null;
    deportacionEditando: any = null;
    itemsDeportacion: any[] = [];
    deportacionesEliminar: any[] = [];
    deportacionOriginal: Record<number, string> = {};
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
    socioeconomicoModel: any = null;
    itemsSocioeconomico: any[] = [];
    respuestasSE: AcaProspectoSeRespuesta[] = [];
    itemsRespuestasSE: any[] = [];
    respuestasSEModel: any = {};
    // #endregion

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
        private serviceSocioeconomico: AcaProspectoSocioeconomicoService,
        private serviceRespuestaSE: AcaProspectoSeRespuestaService,
        // Qué hace: devuelve a Angular el hilo tras los diálogos de DevExtreme (su promesa resuelve fuera
        //           de la zona y la pantalla no se refrescaría sola).
        private zone: NgZone
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();
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
        this.itemsSocioeconomico = this.serviceSocioeconomico.getItems();
        this.selectedLookUpCICLO = this.selectedLookUpCICLO.bind(this);
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
        this.getCICLO();
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
        this.getOPCIONES_SE();
    }

    selectedLookUpCICLO(vRow: any): string {
        return vRow?.[0]?.CICLO ?? '';
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

    // Qué hace: carga los ciclos de pregrado y selecciona el ciclo por defecto.
    // Cómo lo hace: ES_CICLO_DEFECTO lo calcula la vista con la misma regla de admisiones;
    //               al tener ciclo, vuelve a consultar el listado.
    getCICLO() {
        this.appInfoService
            .getLookUp('ACA_PROSPECTO', 'ACA_PERIODOS_ACADEMICOS', 'GetCICLO', undefined, environment.UrlGENERALAPI)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCICLO = response.Data ?? [];
                        const cicloDefecto = this.mCICLO.find((item) => item.ES_CICLO_DEFECTO) ?? this.mCICLO[0];
                        this.filtroCiclo = cicloDefecto?.CICLO ?? '';
                        this.syncBarraFiltroCiclo();
                        this.consultar();
                    } else {
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
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

    // Qué hace: opciones activas del banco para las preguntas de opción única del cuestionario.
    // Cómo lo hace: si las respuestas ya estaban cargadas, rearma el formulario para que los combos
    //               tengan sus opciones.
    getOPCIONES_SE() {
        this.cargarLookup('ACA_SE_OPCION', 'GetCORR_OPCION', (data) => {
            this.mOPCIONES_SE = data;
            if (this.respuestasSE.length) {
                this.refrescarItemsRespuestasSE();
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

    onFiltroCicloChanged(value: any): void {
        this.filtroCiclo = value ?? '';
        this.syncBarraFiltroCiclo();
        this.consultar();
    }

    // Qué hace: arma la configuración del combox1 de la barra.
    // Cómo lo hace: sin opción "Todos" ni botón de limpiar; siempre hay un ciclo seleccionado.
    private syncBarraFiltroCiclo(): void {
        this.barraFiltroCiclo = {
            label: 'Ciclo',
            model: this.mCICLO,
            value: this.filtroCiclo,
            valueExpr: 'CICLO',
            displayExpr: 'NOMBRE_CICLO',
            lookupColumns: this.cicloLookupColumns,
            selectedRowKeys: this.selectedLookUpCICLO,
            showClearButton: false,
            dropDownWidth: 320,
            width: 220,
        };
    }

    // Qué hace: llama a un lookup Get{CAMPO}_ACA_PROSPECTO del catálogo indicado.
    // Cómo lo hace: centraliza take(1), errores y la asignación del resultado.
    private cargarLookup(controller: string, metodo: string, asignar: (data: any[]) => void, xWhere?: IParam[]): void {
        this.appInfoService
            .getLookUp('ACA_PROSPECTO', controller, metodo, xWhere, environment.UrlGENERALAPI)
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
    fillParam(): any {
        const ciclo = this.mCICLO.find((item) => item.CICLO === this.filtroCiclo);
        return {
            ANIO: ciclo?.ANIO ?? 0,
            NUMERO_PERIODO: ciclo?.NUMERO_PERIODO ?? 0,
        };
    }

    // Qué hace: modelo del encabezado; con registro, dispara la carga de las tablas hijas.
    // Cómo lo hace: igual que flujos (fillData → cargarPasos); lo llaman rowDblClick (consulta)
    //               y editarClick (edición desde la grilla).
    override fillData(xModel?: AcaProspecto): AcaProspecto {
        if (xModel !== undefined) {
            this.cargarDetalle(xModel.CORR_PROSPECTO);
            return { ...xModel };
        }
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
            FINANCIA_ESTUDIOS: '',
            FECHA_REGISTRO: null,
        };
    }

    // Qué hace: listado de prospectos del ciclo seleccionado.
    // Cómo lo hace: sin ciclo no consulta (la API lo exige); ngOnInit la llama antes de
    //               cargar el combo y getCICLO la vuelve a llamar con el ciclo por defecto.
    consultar() {
        const param = this.fillParam();
        if (!(param.ANIO > 0 && param.NUMERO_PERIODO > 0)) {
            this.models = [];
            return;
        }

        this.loadingVisible = true;
        this.service
            .getAll(param)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.models = response.Data;
                    } else {
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                    this.loadingVisible = false;
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                    this.loadingVisible = false;
                },
            });
    }

    // Qué hace: un clic en la fila abre la consulta del prospecto.
    // Cómo lo hace: reutiliza el modo consulta de CBaseComponent (rowDblClick → Not_Defined):
    //               muestra el detalle sin Guardar y Cancelar regresa al listado.
    onGridRowClick(e: any): void {
        if (!this.isBrowse() || e?.rowType !== 'data' || !e?.data) {
            return;
        }
        this.rowDblClick(e);
    }

    // Qué hace: carreras que el prospecto puede elegir en su ciclo y modalidades de la actual.
    // Cómo lo hace: la oferta depende del período del prospecto, así que se consulta al abrirlo.
    private cargarOfertaAcademica(CORR_PROSPECTO: number): void {
        this.cargarLista(this.service.getCarrerasDelCiclo(CORR_PROSPECTO), (data: any[]) => {
            this.mCORR_CARRERA_CICLO = data ?? [];
        });
        this.getCORR_MODALIDAD(this.model?.CORR_CARRERA);
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
        if (!this.permiteEdit || !this.isConsulta()) {
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
        this.btnModificar = xEstado === UpdateType.Not_Defined && this.permiteEdit ? 'Modificar' : '';
        if (xEstado === UpdateType.Browse) {
            this.limpiarDetalle();
        }
    }

    override bloquear(): void {
        this.readOnly = true;
    }

    override habilitar(): void {
        this.readOnly = false;
        this.sincronizarEmpleoConTrabaja();
        this.sincronizarEstudioMedia();
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
    aceptarLimitacion(): void {
        const resultado = this.formLimitacion?.instance?.validate();
        if (resultado && !resultado.isValid) {
            this.notifyFx('Revise los campos marcados antes de aceptar.', NotifyType.Warning, { raw: true });
            return;
        }

        const modelo = this.leerFormData(this.formLimitacion, this.limitacionModel);
        const otras = this.limitaciones.filter((l) => l !== this.limitacionEditando);
        const mensaje = this.serviceLimitacion.validar(modelo, otras);
        if (mensaje) {
            this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
            return;
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

    aceptarDeportacion(): void {
        const resultado = this.formDeportacion?.instance?.validate();
        if (resultado && !resultado.isValid) {
            this.notifyFx('Revise los campos marcados antes de aceptar.', NotifyType.Warning, { raw: true });
            return;
        }

        const modelo = this.leerFormData(this.formDeportacion, this.deportacionModel);
        const otras = this.deportaciones.filter((d) => d !== this.deportacionEditando);
        const mensaje = this.serviceDeportacion.validar(modelo, otras);
        if (mensaje) {
            this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
            return;
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

    // Qué hace: recalcula el aporte líquido cuando cambia el salario o los descuentos de un ingreso.
    // Cómo lo hace: la regla vive en el servicio (salario − descuentos, mínimo 0); updateData refresca
    //               el editor bloqueado. El líquido no dispara el cálculo, así que no hay ciclo.
    onRespuestaSEChanged(e: any): void {
        if (this.readOnly) {
            return;
        }
        const calculo = this.serviceRespuestaSE.calcularLiquido(e?.dataField, this.respuestasSEModel);
        if (calculo && this.formRespuestas?.instance) {
            this.formRespuestas.instance.updateData(calculo.campo, calculo.valor);
        }

        // Preguntas dependientes (por ejemplo las de la universidad): al responder "No" se limpian y
        // se ocultan, igual que el portal; al volver a "Sí" reaparecen vacías para llenarlas.
        const dependientes = this.serviceRespuestaSE.getDependientes(e?.dataField);
        if (!dependientes.length) {
            return;
        }
        if (e?.value !== true) {
            for (const campo of dependientes) {
                this.formRespuestas?.instance?.updateData(campo, null);
            }
        }
        this.refrescarItemsRespuestasSE();
    }

    // Qué hace: rearma las preguntas del cuestionario respetando las dependencias del formData actual.
    private refrescarItemsRespuestasSE(): void {
        this.itemsRespuestasSE = this.serviceRespuestaSE.getItems(this.respuestasSE, this.mOPCIONES_SE, this.respuestasSEModel);
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

        const pasos = this.armarPasosGuardado();
        this.loadingVisible = true;
        this.ejecutarPasos(pasos, 0);
    }

    private validarFormularios(): boolean {
        // Una ficha abierta (familiar, contacto, medio, limitación o deportación) se acepta o se cancela antes de guardar.
        if (this.medioModel) {
            this.notifyFx('Acepte o cancele el medio que está editando antes de guardar.', NotifyType.Warning, { raw: true });
            return false;
        }
        if (this.limitacionModel) {
            this.notifyFx('Acepte o cancele la limitación que está editando antes de guardar.', NotifyType.Warning, { raw: true });
            return false;
        }
        if (this.deportacionModel) {
            this.notifyFx('Acepte o cancele la deportación que está editando antes de guardar.', NotifyType.Warning, { raw: true });
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

        const estudios = [
            { seccion: SECCION_MEDIA, modelo: this.estudioMedia, form: this.formEstudioMedia, eliminar: false },
            { seccion: SECCION_UNIVERSIDAD, modelo: this.estudioUniversidad, form: this.formEstudioUniversidad, eliminar: this.estudioUniversidadEliminar },
            { seccion: SECCION_GRADUADO_UEES, modelo: this.estudioUees, form: this.formEstudioUees, eliminar: this.estudioUeesEliminar },
        ];
        // Solo se revisan las secciones de estudios que se van a guardar: una sección intacta con datos
        // viejos incompletos no debe impedir editar o eliminar otra (son independientes, como el portal).
        const estudiosAGuardar = estudios.filter((e) => !e.eliminar && this.estudioCambio(e.seccion, e.modelo, e.form));

        const formularios = [
            this.dataForm,
            this.formPersona,
            this.formEmergencia,
            this.formEmpleo,
            ...estudiosAGuardar.map((e) => e.form),
            this.formSocio,
            this.formRespuestas,
        ];
        for (const formulario of formularios) {
            const resultado = formulario?.instance?.validate();
            if (resultado && !resultado.isValid) {
                this.notifyFx('Revise los campos marcados antes de guardar.', NotifyType.Warning, { raw: true });
                return false;
            }
        }

        // Los catálogos se pintan con template, así que el dx-form no los valida: sus obligatoriedades
        // (las mismas del portal) se revisan aquí, sección por sección.
        if (this.empleoModel && !this.empleoEliminar) {
            const mensaje = this.serviceEmpleo.validar(this.leerFormData(this.formEmpleo, this.empleoModel));
            if (mensaje) {
                this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
                return false;
            }
        }

        for (const estudio of estudiosAGuardar) {
            const mensaje = this.serviceEstudio.validar(this.leerFormData(estudio.form, estudio.modelo));
            if (mensaje) {
                this.notifyFx(mensaje, NotifyType.Warning, { raw: true });
                return false;
            }
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

        if (this.socioeconomicoModel) {
            pasos.push({
                nombre: 'Estudio socioeconómico',
                accion: () => this.serviceSocioeconomico.update(this.leerFormData(this.formSocio, this.socioeconomicoModel)),
            });
            if (this.respuestasSE.length) {
                pasos.push({
                    nombre: 'Preguntas del cuestionario',
                    accion: () =>
                        this.serviceRespuestaSE.guardar(
                            this.model.CORR_PROSPECTO,
                            this.socioeconomicoModel.CORR_PROSPECTO_SOCIOECONOMICO,
                            this.respuestasSE,
                            this.leerFormData(this.formRespuestas, this.respuestasSEModel)
                        ),
                });
            }
        }
        pasos.push({
            nombre: 'Datos del prospecto',
            accion: () => this.service.update(this.leerFormData(this.dataForm, this.model)),
        });

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
            this.notifyFx('Prospecto modificado con exito!', NotifyType.Success, { raw: true });
            this.AsignaStatus(UpdateType.Browse);
            this.consultar();
            return;
        }

        const paso = pasos[indice];
        paso.accion()
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response?.Result) {
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
    // Qué hace: carga las tablas hijas de las tres pestañas al abrir la consulta o la edición.
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
        this.cargarEstudios(CORR_PROSPECTO);
        this.cargarEmpleo(CORR_PROSPECTO);
        this.cargarSocioeconomico(CORR_PROSPECTO);
        this.cargarRespuestasSE(CORR_PROSPECTO);
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
        this.deportaciones = [];
        this.deportacionModel = null;
        this.deportacionEditando = null;
        this.deportacionesEliminar = [];
        this.deportacionOriginal = {};
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
        this.empleoModel = null;
        this.empleoNuevo = false;
        this.empleoEliminar = false;
        this.empleoCargado = false;
        this.socioeconomicoModel = null;
        this.respuestasSE = [];
        this.itemsRespuestasSE = [];
        this.respuestasSEModel = {};
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
                    this.notifyFx(response.ErrorMessage, NotifyType.Error);
                }
                this.finalizarCarga();
            },
            error: (error: any) => {
                this.notifyFx(error, NotifyType.Error);
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
            this.limitacionOriginal = {};
            for (const limitacion of this.limitaciones) {
                this.limitacionOriginal[limitacion.CORR_PROSPECTO_LIMITACION_FISICA] = JSON.stringify(this.serviceLimitacion.getPayload(limitacion));
            }
        });
    }

    cargarDeportaciones(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceDeportacion.getDeportacionesPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.deportaciones = data ?? [];
            this.deportacionOriginal = {};
            for (const deportacion of this.deportaciones) {
                this.deportacionOriginal[deportacion.CORR_PROSPECTO_DEPORTACION] = JSON.stringify(this.serviceDeportacion.getPayload(deportacion));
            }
        });
    }

    // Qué hace: medios de origen con su código y su firma, para enviar al API solo los que cambien.
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

    // Qué hace: cabecera del estudio socioeconómico (fechas, términos, cuota máxima).
    cargarSocioeconomico(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceSocioeconomico.getSocioeconomicoPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.socioeconomicoModel = data[0] ?? null;
        });
    }

    // Qué hace: arma el formulario de preguntas del estudio socioeconómico del prospecto.
    // Cómo lo hace: el servicio genera los campos (con las opciones del banco para opción única)
    //               y el formData según el tipo de cada pregunta.
    cargarRespuestasSE(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceRespuestaSE.getRespuestasPorProspecto(CORR_PROSPECTO), (data: AcaProspectoSeRespuesta[]) => {
            this.respuestasSE = data;
            this.respuestasSEModel = this.serviceRespuestaSE.getFormData(data);
            this.refrescarItemsRespuestasSE();
        });
    }
    // #endregion
}
