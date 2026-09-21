import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BarraMttoCombox } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { AcaProspecto } from './models/aca-prospecto';
import { AcaProspectoCiclo } from './models/aca-prospecto-ciclo';
import { AcaProspectoService } from './aca-prospecto.service';
import { AcaProspectoPersonaService } from './aca-prospecto-persona/aca-prospecto-persona.service';
import { AcaProspectoContactoService } from './aca-prospecto-contacto/aca-prospecto-contacto.service';
import { AcaProspectoContacto } from './aca-prospecto-contacto/models/aca-prospecto-contacto';
import { AcaProspectoFamiliarService } from './aca-prospecto-familiar/aca-prospecto-familiar.service';
import { AcaProspectoFamiliar } from './aca-prospecto-familiar/models/aca-prospecto-familiar';
import { AcaProspectoLimitacionFisicaService } from './aca-prospecto-limitacion-fisica/aca-prospecto-limitacion-fisica.service';
import { AcaProspectoLimitacionFisica } from './aca-prospecto-limitacion-fisica/models/aca-prospecto-limitacion-fisica';
import { AcaProspectoDeportacionService } from './aca-prospecto-deportacion/aca-prospecto-deportacion.service';
import { AcaProspectoDeportacion } from './aca-prospecto-deportacion/models/aca-prospecto-deportacion';
import { AcaProspectoMedioOrigenService } from './aca-prospecto-medio-origen/aca-prospecto-medio-origen.service';
import { AcaProspectoMedioOrigen } from './aca-prospecto-medio-origen/models/aca-prospecto-medio-origen';
import { AcaProspectoEstudioService } from './aca-prospecto-estudio/aca-prospecto-estudio.service';
import { AcaProspectoEstudio } from './aca-prospecto-estudio/models/aca-prospecto-estudio';
import { AcaProspectoEmpleoService } from './aca-prospecto-empleo/aca-prospecto-empleo.service';
import { AcaProspectoSocioeconomicoService } from './aca-prospecto-socioeconomico/aca-prospecto-socioeconomico.service';
import { AcaProspectoSeRespuestaService } from './aca-prospecto-se-respuesta/aca-prospecto-se-respuesta.service';
import { AcaProspectoSeRespuesta } from './aca-prospecto-se-respuesta/models/aca-prospecto-se-respuesta';

// Qué hace: consulta de prospectos de pregrado por ciclo (Académico → Consultas → Prospectos).
// Cómo lo hace: listado filtrado por el combo de ciclos de la barra; un clic en la fila abre la
//               consulta del prospecto con el modo consulta de CBaseComponent (sin Guardar) y carga
//               las tablas hijas en tres pestañas: personal, académica y económica.
@Component({
    selector: 'app-aca-prospecto',
    templateUrl: './aca-prospecto.component.html',
    styleUrls: ['./aca-prospecto.component.scss'],
})
export class AcaProspectoComponent extends CBaseComponent implements OnInit {
    //#region <Declarando Variables>
    protected override mttoGridKeyExpr = 'CORR_PROSPECTO';
    readOnly = true;
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

    // Qué hace: cuenta las consultas pendientes del detalle para apagar el load panel al terminar.
    cargasPendientes = 0;

    // Pestaña Información personal
    personaModel: any = null;
    itemsPersona: any[] = [];
    contactos: AcaProspectoContacto[] = [];
    columnsContacto: any[] = [];
    summaryContacto: any = {};
    familiares: AcaProspectoFamiliar[] = [];
    emergencias: AcaProspectoFamiliar[] = [];
    columnsFamiliar: any[] = [];
    columnsEmergencia: any[] = [];
    summaryFamiliar: any = {};
    limitaciones: AcaProspectoLimitacionFisica[] = [];
    columnsLimitacion: any[] = [];
    summaryLimitacion: any = {};
    deportaciones: AcaProspectoDeportacion[] = [];
    columnsDeportacion: any[] = [];
    summaryDeportacion: any = {};
    medios: AcaProspectoMedioOrigen[] = [];
    columnsMedio: any[] = [];
    summaryMedio: any = {};

    // Pestaña Información académica
    estudios: AcaProspectoEstudio[] = [];
    columnsEstudio: any[] = [];
    summaryEstudio: any = {};

    // Pestaña Información económica
    empleoModel: any = null;
    itemsEmpleo: any[] = [];
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
        private serviceRespuestaSE: AcaProspectoSeRespuestaService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();
        this.itemsCarrera = this.service.getItemsCarrera();
        this.itemsPersona = this.servicePersona.getItems();
        this.columnsContacto = this.serviceContacto.getColumns();
        this.summaryContacto = this.serviceContacto.getSummary();
        this.columnsFamiliar = this.serviceFamiliar.getColumns();
        this.columnsEmergencia = this.serviceFamiliar.getColumnsEmergencia();
        this.summaryFamiliar = this.serviceFamiliar.getSummary();
        this.columnsLimitacion = this.serviceLimitacion.getColumns();
        this.summaryLimitacion = this.serviceLimitacion.getSummary();
        this.columnsDeportacion = this.serviceDeportacion.getColumns();
        this.summaryDeportacion = this.serviceDeportacion.getSummary();
        this.columnsMedio = this.serviceMedio.getColumns();
        this.summaryMedio = this.serviceMedio.getSummary();
        this.columnsEstudio = this.serviceEstudio.getColumns();
        this.summaryEstudio = this.serviceEstudio.getSummary();
        this.itemsEmpleo = this.serviceEmpleo.getItems();
        this.itemsSocioeconomico = this.serviceSocioeconomico.getItems();
        this.selectedLookUpCICLO = this.selectedLookUpCICLO.bind(this);
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
    }

    selectedLookUpCICLO(vRow: any): string {
        return vRow?.[0]?.CICLO ?? '';
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
    // Cómo lo hace: igual que flujos (fillData → cargarPasos), rowDblClick lo llama al abrir la consulta.
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

    // Qué hace: regresa al listado y descarta los datos del prospecto consultado.
    override cancelar(): void {
        super.cancelar();
        this.limpiarDetalle();
    }

    override bloquear(): void {
        this.readOnly = true;
    }

    override habilitar(): void {
        this.readOnly = false;
    }
    // #endregion

    //#region <Metodos Detalle - Carga>
    // Qué hace: carga las tablas hijas de las tres pestañas al abrir la consulta.
    // Cómo lo hace: 11 consultas en paralelo; el load panel se apaga cuando termina la última.
    cargarDetalle(CORR_PROSPECTO: number): void {
        this.limpiarDetalle();
        if (!(CORR_PROSPECTO > 0)) {
            return;
        }

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
        this.familiares = [];
        this.emergencias = [];
        this.limitaciones = [];
        this.deportaciones = [];
        this.medios = [];
        this.estudios = [];
        this.empleoModel = null;
        this.socioeconomicoModel = null;
        this.respuestasSE = [];
        this.itemsRespuestasSE = [];
        this.respuestasSEModel = {};
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
    cargarPersona(CORR_PROSPECTO: number): void {
        this.cargarLista(this.servicePersona.getPersonaPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.personaModel = data[0] ?? null;
        });
    }

    cargarContactos(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceContacto.getContactosPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.contactos = data;
        });
    }

    // Qué hace: reparte la misma consulta entre "Familia" y "Contacto de emergencia".
    // Cómo lo hace: Familia = núcleo (padre, madre, cónyuge) que no sea solo emergencia;
    //               Emergencia = cualquier fila marcada como contacto de emergencia.
    cargarFamiliares(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceFamiliar.getFamiliaresPorProspecto(CORR_PROSPECTO), (data: AcaProspectoFamiliar[]) => {
            this.familiares = data.filter((f) => f.ES_NUCLEO && !f.ES_SOLO_EMERGENCIA);
            this.emergencias = data.filter((f) => f.ES_EMERGENCIA);
        });
    }

    cargarLimitaciones(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceLimitacion.getLimitacionesPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.limitaciones = data;
        });
    }

    cargarDeportaciones(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceDeportacion.getDeportacionesPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.deportaciones = data;
        });
    }

    cargarMedios(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceMedio.getMediosPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.medios = data;
        });
    }
    // #endregion

    //#region <Metodos Información Académica - Carga>
    cargarEstudios(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceEstudio.getEstudiosPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.estudios = data;
        });
    }
    // #endregion

    //#region <Metodos Información Económica - Carga>
    cargarEmpleo(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceEmpleo.getEmpleoPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.empleoModel = data[0] ?? null;
        });
    }

    // Qué hace: cabecera del estudio socioeconómico (fechas, términos, cuota máxima).
    cargarSocioeconomico(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceSocioeconomico.getSocioeconomicoPorProspecto(CORR_PROSPECTO), (data: any[]) => {
            this.socioeconomicoModel = data[0] ?? null;
        });
    }

    // Qué hace: arma el formulario de preguntas del estudio socioeconómico del prospecto.
    // Cómo lo hace: el servicio genera los campos y el formData según el tipo de cada pregunta.
    cargarRespuestasSE(CORR_PROSPECTO: number): void {
        this.cargarLista(this.serviceRespuestaSE.getRespuestasPorProspecto(CORR_PROSPECTO), (data: AcaProspectoSeRespuesta[]) => {
            this.respuestasSE = data;
            this.itemsRespuestasSE = this.serviceRespuestaSE.getItems(data);
            this.respuestasSEModel = this.serviceRespuestaSE.getFormData(data);
        });
    }
    // #endregion
}
