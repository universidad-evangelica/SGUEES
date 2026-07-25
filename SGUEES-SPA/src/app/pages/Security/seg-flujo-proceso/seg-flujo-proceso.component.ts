import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegFlujoProceso } from './models/seg-flujo-proceso';
import { SegFlujoProcesoService } from './seg-flujo-proceso.service';
import { SegFlujoPasoService } from './seg-flujo-paso.service';
import { SegFlujoPaso } from './models/seg-flujo-paso';
import { IParam } from 'src/app/FxAPI/IParam';
import { SegFlujoPasoAccionEstadoService } from './seg-flujo-paso-accion-estado.service';
import { SegFlujoPasoAccionEstado } from './models/seg-flujo-paso-accion-estado';
import { SegFlujoEstadoMensajeService } from './seg-flujo-estado-mensaje.service';
import { SegFlujoEstadoMensaje } from './models/seg-flujo-estado-mensaje';
import { SegFlujoPasoActorDestinoService } from './seg-flujo-paso-actor-destino.service';
import { SegFlujoPasoActorDestino } from './models/seg-flujo-paso-actor-destino';
@Component({
    selector: 'app-seg-flujo-proceso',
    templateUrl: './seg-flujo-proceso.component.html',
    styleUrls: ['./seg-flujo-proceso.component.scss'],
})
export class SegFlujoProcesoComponent extends CBaseComponent implements OnInit {
    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: SegFlujoProcesoService,
        private servicePaso: SegFlujoPasoService,
        private serviceAccionEstado: SegFlujoPasoAccionEstadoService,
        private serviceEstadoMensaje: SegFlujoEstadoMensajeService,
        private serviceActorDestino: SegFlujoPasoActorDestinoService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();
        this.columnsPasos = this.servicePaso.getColumns();
        this.summaryPasos = this.servicePaso.getSummary();
        this.itemsPasos = this.servicePaso.getItems();
        this.columnsAccionEstado = this.serviceAccionEstado.getColumns();
        this.summaryAccionEstado = this.serviceAccionEstado.getSummary();
        this.itemsAccionEstado = this.serviceAccionEstado.getItems();
        this.columnsEstadoMensaje = this.serviceEstadoMensaje.getColumns();
        this.summaryEstadoMensaje = this.serviceEstadoMensaje.getSummary();
        this.itemsEstadoMensaje = this.serviceEstadoMensaje.getItems();
        this.columnsActorDestino = this.serviceActorDestino.getColumns();
        this.summaryActorDestino = this.serviceActorDestino.getSummary();
        this.itemsActorDestino = this.serviceActorDestino.getItems();
        this.actualizarVisibilidadLabelUnidad();
        this.actualizarVisibilidadEstadoOrigenPaso();
        this.actualizarVisibilidadLabelUnidad();
    }

    //#region <Declarando Variables>
    readOnly = false;
    model: any = this.fillData();
    mCORR_TIPO_DOCUMENTO: any;
    mCORR_ACTOR_ORIGEN: any;
    mCORR_ACTOR_DESTINO: any;
    mCORR_ESTADO_ORIGEN: any;
    mCORR_TIPO_MOVIMIENTO: any;
    mCORR_TIPO_NOTIFICACION: any;
    mCORR_PASO_DESTINO: any[] = [];
    unidadesPaso: any[] = [];
    mostrarUnidadDestino: boolean = false;
    mostrarEstadoOrigenPaso: boolean = false;

    // Modal acciones de paso
    modalAccionesVisible = false;
    pasoSeleccionadoAcciones: any = null;

    // Variables AccionEstado (dentro del modal)
    accionesEstado: SegFlujoPasoAccionEstado[] = [];
    accionEstadoModel: SegFlujoPasoAccionEstado | null = null;
    columnsAccionEstado: any[] = [];
    summaryAccionEstado: any = {};
    itemsAccionEstado: any[] = [];
    accionEstadoReadOnly = false;
    banderaAccionEstado: UpdateType = UpdateType.Browse;
    customButtonsPasos = [
        {
            icon: 'overflow',
            hint: 'Ver acciones del paso',
            stylingMode: 'text',
            onClick: (e: any) => this.abrirModalAcciones(e),
        },
        {
            icon: 'bell',
            hint: 'Agregar notificaciones',
            stylingMode: 'text',
            onClick: (e: any) => this.abrirModalNotificaciones(e),
        },
        {
            icon: 'accountbox',
            hint: 'Agregar actores',
            stylingMode: 'text',
            onClick: (e: any) => this.abrirModalActores(e),
        },
    ];

    // Modal actores destino
    modalActoresVisible = false;
    pasoSeleccionadoActores: any = null;
    actoresDestino: SegFlujoPasoActorDestino[] = [];
    actorDestinoModel: SegFlujoPasoActorDestino | null = null;
    columnsActorDestino: any[] = [];
    summaryActorDestino: any = {};
    itemsActorDestino: any[] = [];
    actorDestinoReadOnly = false;
    banderaActorDestino: UpdateType = UpdateType.Browse;
    mostrarUnidadActorModal: boolean = false;

    // Modal notificaciones (estado mensaje)
    modalNotificacionesVisible = false;
    pasoSeleccionadoNotificaciones: any = null;
    estadosMensaje: SegFlujoEstadoMensaje[] = [];
    estadoMensajeModel: SegFlujoEstadoMensaje | null = null;
    columnsEstadoMensaje: any[] = [];
    summaryEstadoMensaje: any = {};
    itemsEstadoMensaje: any[] = [];
    estadoMensajeReadOnly = false;
    banderaEstadoMensaje: UpdateType = UpdateType.Browse;

    // Variables para Pasos
    pasos: SegFlujoPaso[] = [];
    pasoModel: SegFlujoPaso | null = null;
    columnsPasos: any[] = [];
    summaryPasos: any = {};
    itemsPasos: any[] = [];
    pasoReadOnly = false;
    banderaMttoPaso: UpdateType = UpdateType.Browse;

    selectedLookUpCORR_TIPO_DOCUMENTO(vRow: any): any {
        return vRow[0].CORR_TIPO_DOCUMENTO;
    }
    selectedLookUpCORR_ESTADO_ORIGEN(vRow: any): any {
        return vRow[0].CORR_ESTADO;
    }
    selectedLookUpCORR_ESTADO_DESTINO(vRow: any): any {
        return vRow[0]?.CORR_ESTADO;
    }
    selectedLookUpCORR_TIPO_MOVIMIENTO(vRow: any): any {
        return vRow[0]?.CORR_TIPO_MOVIMIENTO;
    }
    selectedLookUpCORR_TIPO_NOTIFICACION(vRow: any): any {
        return vRow[0]?.CORR_TIPO_NOTIFICACION;
    }
    selectedLookUpCORR_PASO_DESTINO(vRow: any): any {
        return vRow[0]?.CORR_PASO;
    }
    // #endregion

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.getCORR_TIPO_DOCUMENTO();
        this.getCORR_ACTOR_ORIGEN();
        this.getCORR_ACTOR_DESTINO();
        this.getCORR_TIPO_MOVIMIENTO();
        this.getCORR_TIPO_NOTIFICACION();
        this.cargarUnidadesPaso();
        this.cargarEstadosPaso(this.model.CORR_TIPO_DOCUMENTO);
        this.consultar();
    }

    inicializaOpciones() { }
    // #endregion

    //#region <Carga de Combos>
    getCORR_TIPO_DOCUMENTO() {
        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_PROCESO',
                'SEG_FLUJO_TIPO_DOCUMENTO',
                'GetCORR_FLUJO_TIPO_DOCUMENTO',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_TIPO_DOCUMENTO = response.Data;
                        this.cargarEstadosPasoDesdeModelo();
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    cargarEstadosPasoDesdeModelo() {
        this.cargarEstadosPaso(this.model?.CORR_TIPO_DOCUMENTO ?? 0);
    }

    actualizarVisibilidadLabelUnidad() {
        this.itemsPasos = (this.itemsPasos || []).map((item: any) => {
            if (item?.dataField !== 'CORR_UNIDAD_DESTINO') {
                return item;
            }

            return {
                ...item,
                label: {
                    ...(item.label || {}),
                    visible: this.mostrarUnidadDestino,
                },
            };
        });
    }

    actualizarVisibilidadEstadoOrigenPaso() {
        this.itemsPasos = (this.itemsPasos || []).map((item: any) => {
            if (item?.dataField !== 'CORR_ESTADO_ORIGEN') {
                return item;
            }

            return {
                ...item,
                visible: this.mostrarEstadoOrigenPaso,
                label: {
                    ...(item.label || {}),
                    visible: this.mostrarEstadoOrigenPaso,
                },
            };
        });
    }

    getCORR_ACTOR_ORIGEN() {

        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_PROCESO',
                'SEG_FLUJO_ACTOR',
                'GetCORR_FLUJO_ACTOR',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_ACTOR_ORIGEN = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    getCORR_TIPO_MOVIMIENTO() {
        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_PROCESO',
                'SEG_FLUJO_TIPO_MOVIMIENTO',
                'GetCORR_TIPO_MOVIMIENTO',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_TIPO_MOVIMIENTO = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    getCORR_TIPO_NOTIFICACION() {
        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_PROCESO',
                'SEG_FLUJO_TIPO_NOTIFICACION',
                'GetCORR_TIPO_NOTIFICACION',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_TIPO_NOTIFICACION = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

      getCORR_ACTOR_DESTINO() {

        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_PROCESO',
                'SEG_FLUJO_ACTOR',
                'GetCORR_FLUJO_ACTOR',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_ACTOR_DESTINO = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    cargarUnidadesPaso() {
        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_PROCESO',
                'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
                'GetCORR_UNIDADES',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.unidadesPaso = (response.Data || []).map((u: any) => ({
                            ...u,
                            NOMBRE_UNIDAD_TREE: (u.CODIGO_UNIDAD ? u.CODIGO_UNIDAD + ' - ' : '') + (u.NOMBRE_UNIDAD || ''),
                        }));
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    cargarEstadosPaso(corrTipoDocumento: number) {
        if (!corrTipoDocumento || corrTipoDocumento <= 0) {
            this.mCORR_ESTADO_ORIGEN = [];
            return;
        }

        const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: corrTipoDocumento }];
        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_PROCESO',
                'SEG_FLUJO_ESTADO',
                'GetCORR_ESTADO',
                xWhere,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                 next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_ESTADO_ORIGEN = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    onActorDestinoChanged(corrActor: number) {
        this.mostrarUnidadDestino =  corrActor <=3 && corrActor !==1;
        this.actualizarVisibilidadLabelUnidad();
        if (!this.mostrarUnidadDestino && this.pasoModel) {
            this.pasoModel.CORR_UNIDAD_DESTINO = null;
        }
    }

    selectedLookUpCORR_ACTOR_ORIGEN(vRow: any): any {
        return vRow[0]?.CORR_ACTOR;
    }

    selectedLookUpCORR_ACTOR_DESTINO(vRow: any): any {
        return vRow[0]?.CORR_ACTOR;
    }

    cargarPasos() {
        if (this.model.CORR_FLUJO_PROCESO > 0) {
            this.servicePaso
                .getPasosPorFlujo(this.model.CORR_FLUJO_PROCESO)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.pasos = response.Data;
                            if (this.modalAccionesVisible) {
                                this.cargarPasosDestinoLookup();
                            }
                        }
                    },
                    error: (error: any) => {
                        this.notifyFx(error, NotifyType.Error);
                    },
                });
        }
    }

    cargarPasosDestinoLookup() {
        if (!this.pasoSeleccionadoAcciones) {
            this.mCORR_PASO_DESTINO = [];
            return;
        }

        const pasoActual = this.pasoSeleccionadoAcciones.CORR_PASO;
        const mapPasos = (source: any[]) =>
            (source || [])
                .filter((p: any) => p.CORR_PASO !== pasoActual)
                .map((p: any) => ({
                    ...p,
                    NOMBRE_PASO_DESTINO:
                        'Paso ' + (p.ORDEN ?? p.NUMERO_PASO ?? p.CORR_PASO) +
                        ' - ' +
                        (p.NOMBRE_PASO || ''),
                }));

        if (this.pasos?.length) {
            this.mCORR_PASO_DESTINO = mapPasos(this.pasos);
            return;
        }

        this.servicePaso
            .getPasosPorFlujo(this.pasoSeleccionadoAcciones.CORR_FLUJO_PROCESO)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_PASO_DESTINO = mapPasos(response.Data);
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

        override focusedRowChanged(e: any): void {
            super.focusedRowChanged(e);
            this.cargarEstadosPasoDesdeModelo();
        }
    // #endregion

    //#region <Metodos Mtto>
    fillParam(xCORR_FLUJO_PROCESO?: number): any {
        if (xCORR_FLUJO_PROCESO == undefined) {
            xCORR_FLUJO_PROCESO = 0;
        }
        return {
            CORR_FLUJO_PROCESO: xCORR_FLUJO_PROCESO,
        };
    }

    override fillData(xModel?: SegFlujoProceso): SegFlujoProceso {
        if (xModel !== undefined) {
            this.cargarPasos();
            return {
                
                CORR_EMPRESA: xModel.CORR_EMPRESA,
                CORR_FLUJO_PROCESO: xModel.CORR_FLUJO_PROCESO,
                CORR_TIPO_DOCUMENTO: xModel.CORR_TIPO_DOCUMENTO,
                NOMBRE_FLUJO: xModel.NOMBRE_FLUJO,
                DESCRIPCION: xModel.DESCRIPCION,
                ES_DEFECTO: xModel.ES_DEFECTO,
                ACTIVO: xModel.ACTIVO,
                USUARIO_CREA: xModel.USUARIO_CREA,
                ESTACION_CREA: xModel.ESTACION_CREA,
                FECHA_CREA: xModel.FECHA_CREA,
                USUARIO_ACTU: xModel.USUARIO_ACTU,
                ESTACION_ACTU: xModel.ESTACION_ACTU,
                FECHA_ACTU: xModel.FECHA_ACTU,
                NOMBRE_TIPO_DOCUMENTO: xModel.NOMBRE_TIPO_DOCUMENTO,
            };
             
        } else {
            return {
                CORR_EMPRESA: 1,
                CORR_FLUJO_PROCESO: 0,
                CORR_TIPO_DOCUMENTO: 0,
                NOMBRE_FLUJO: '',
                DESCRIPCION: '',
                ES_DEFECTO: false,
                ACTIVO: true,
                USUARIO_CREA: '',
                ESTACION_CREA: '',
                FECHA_CREA: new Date(),
                USUARIO_ACTU: '',
                ESTACION_ACTU: '',
                FECHA_ACTU: new Date(),
                NOMBRE_TIPO_DOCUMENTO: '',
            };
        }
        
    }

    consultar() {
        this.service
            .getAll(this.fillParam())
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.models = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    guardar(): void {
        if (!this.service.esValido(this.model, this.notifyFx)) {
            return;
        }

        this.loadingVisible = true;
        if (this.banderaMtto === UpdateType.Add) {
            this.service
                .insert(this.model)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.models.push(response.Data);
                            this.model = response.Data;
                            this.AsignaStatus(UpdateType.Browse);
                            this.notifyFx('Flujo creado con exito!', NotifyType.Success);
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
        } else if (this.banderaMtto === UpdateType.Update) {
            this.service
                .update(this.model)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.model = response.Data;
                            const vIndex = this.models.findIndex(
                                (item: any) => item.CORR_FLUJO_PROCESO === response.Data.CORR_FLUJO_PROCESO
                            );
                            this.models[vIndex] = response.Data;
                            this.AsignaStatus(UpdateType.Browse);
                            this.notifyFx('Flujo modificado con exito!', NotifyType.Success);
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
    }

    override cancelar(): void {
        const finalizarCancelacion = () => {
            this.pasos = [];
            this.pasoModel = null;
            this.banderaMttoPaso = UpdateType.Browse;
            this.pasoReadOnly = false;
            this.readOnly = false;
        };

        if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
            this.confirmaCancelar(() => {
                this.model = this.modelUpdate;
                const vIndex = this.models.findIndex(
                    (item: any) => item.CORR_FLUJO_PROCESO === this.modelUpdate.CORR_FLUJO_PROCESO
                );
                if (vIndex >= 0) {
                    this.models[vIndex] = this.modelUpdate;
                }
                this.AsignaStatus(UpdateType.Browse);
                this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
                finalizarCancelacion();
            });
        } else {
            this.AsignaStatus(UpdateType.Browse);
            finalizarCancelacion();
        }
    }

    override AsignaStatus(updateType: any): void {
        super.AsignaStatus(updateType);
        if (this.banderaMtto === UpdateType.Browse && this.model?.CORR_FLUJO_PROCESO > 0) {
            this.cargarPasos();
        }
    }

    rowRemoving(e: any) {
        this.service
            .delete(this.fillParam(e.data.CORR_FLUJO_PROCESO))
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Flujo eliminado con exito!', NotifyType.Success);
                        e.component.refresh();
                    } else {
                        e.cancel = true;
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => {
                    e.cancel = true;
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    override bloquear(): void {
        this.dataForm.instance.getEditor('CORR_TIPO_DOCUMENTO')?.option('readOnly', true);
        this.dataForm.instance.getEditor('NOMBRE_FLUJO')?.option('readOnly', true);
        this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
        this.dataForm.instance.getEditor('ES_DEFECTO')?.option('disabled', true);
        this.dataForm.instance.getEditor('ACTIVO')?.option('disabled', true);
        this.readOnly = true;
    }

    override habilitar(): void {
        this.readOnly = false;
    }

    override setFocus() {
        setTimeout(() => {
            this.dataForm.instance.getEditor('NOMBRE_FLUJO')?.focus();
        });
    }

    //#region <Metodos Pasos - Estado y Control>
    /**
     * Verifica si el grid de pasos está en modo Browse
     */
    isPasoBrowse(): boolean {
        return this.banderaMttoPaso === UpdateType.Browse;
    }

    /**
     * Verifica si el grid de pasos está en modo Form (Add o Update)
     */
    isPasoForm(): boolean {
        return this.banderaMttoPaso === UpdateType.Add || this.banderaMttoPaso === UpdateType.Update;
    }

    /**
     * Permite agregar nuevos pasos
     */
    get getPermiteAddPaso(): boolean {
        return this.permiteAdd && this.model?.CORR_FLUJO_PROCESO > 0;
    }

    /**
     * Permite editar pasos
     */
    get getPermiteEditarPaso(): boolean {
        return this.permiteEdit;
    }

    /**
     * Permite eliminar pasos
     */
    get getPermiteDelePaso(): boolean {
        return this.permiteDele;
    }
    //#endregion

    //#region <Metodos Pasos - CRUD>
    /**
     * Nuevo paso
     */
    nuevoPaso(): void {
        if (!this.model || !this.model.CORR_FLUJO_PROCESO || this.model.CORR_FLUJO_PROCESO === 0) {
            this.notifyFx('Primero debe guardar el flujo de proceso', NotifyType.Warning);
            return;
        }

        const esPrimerPaso = (this.pasos?.length ?? 0) === 0;
        this.mostrarEstadoOrigenPaso = esPrimerPaso;
        this.actualizarVisibilidadEstadoOrigenPaso();

        const today = new Date();
        this.pasoModel = {
            CORR_EMPRESA: 1,
            CORR_FLUJO_PROCESO: this.model.CORR_FLUJO_PROCESO,
            CORR_PASO: 0,
            CORR_ESTADO_ORIGEN: esPrimerPaso ? 0 : null,
            CORR_ACTOR_ORIGEN: 0,
            CORR_ACTOR_DESTINO: 0,
            CORR_UNIDAD_DESTINO: null,
            NUMERO_PASO: 0,
            NOMBRE_PASO: '',
            DESCRIPCION_PASO: '',
            ACTIVO: true,
            USUARIO_CREA: '',
            ESTACION_CREA: '',
            FECHA_CREA: today,
            USUARIO_ACTU: '',
            ESTACION_ACTU: '',
            FECHA_ACTU: today,
        };
        this.banderaMttoPaso = UpdateType.Add;
        this.pasoReadOnly = false;
        this.mostrarUnidadDestino = false;
        this.actualizarVisibilidadLabelUnidad();
        this.habilitarPaso();
    }

    /**
     * Guardar paso (CREATE o UPDATE)
     */
    guardarPaso(): void {
        if (!this.pasoModel) return;

        if (!this.mostrarEstadoOrigenPaso) {
            this.pasoModel.CORR_ESTADO_ORIGEN = null;
        }

        if (!this.servicePaso.esValido(this.pasoModel, this.notifyFx.bind(this))) {
            return;
        }

        this.loadingVisible = true;
        this.pasoModel.CORR_FLUJO_PROCESO = this.model.CORR_FLUJO_PROCESO;

        if (this.banderaMttoPaso === UpdateType.Add) {
            const payloadPaso: SegFlujoPaso = {
                ...this.pasoModel,
                CORR_ESTADO_ORIGEN: this.mostrarEstadoOrigenPaso
                    ? this.pasoModel.CORR_ESTADO_ORIGEN
                    : null,
            };

            this.servicePaso
                .create(payloadPaso)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.pasos.push(response.Data);
                            this.pasoModel = null;
                            this.banderaMttoPaso = UpdateType.Browse;
                            this.pasoReadOnly = false;
                            this.notifyFx('Paso creado con éxito!', NotifyType.Success);
                            this.cargarPasos();
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
        } else if (this.banderaMttoPaso === UpdateType.Update) {
            this.servicePaso
                .update(this.pasoModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            const vIndex = this.pasos.findIndex(
                                (item: any) => item.CORR_PASO === response.Data.CORR_PASO
                            );
                            this.pasos[vIndex] = response.Data;
                            this.pasoModel = null;
                            this.banderaMttoPaso = UpdateType.Browse;
                            this.pasoReadOnly = false;
                            this.notifyFx('Paso modificado con éxito!', NotifyType.Success);
                            this.cargarPasos();
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
    }

    /**
     * Cancelar edición de paso
     */
    cancelarPaso(): void {
        this.banderaMttoPaso = UpdateType.Browse;
        this.pasoReadOnly = false;
        this.mostrarEstadoOrigenPaso = false;
        this.actualizarVisibilidadEstadoOrigenPaso();
        this.mostrarUnidadDestino = false;
        this.actualizarVisibilidadLabelUnidad();
        if (this.pasoModel && this.pasoModel.CORR_PASO > 0) {
            const original = this.pasos.find(p => p.CORR_PASO === this.pasoModel?.CORR_PASO);
            if (original) {
                this.pasoModel = { ...original };
            }
        } else {
            this.pasoModel = null;
        }
    }

    /**
     * Editar paso
     */
    editarPaso(event: any): void {
        const paso = event?.row?.data || event;

        if (!paso || !paso.CORR_PASO) {
            console.warn('⚠️ Datos de paso no válidos:', paso);
            return;
        }

        this.pasoModel = { ...paso };
        this.banderaMttoPaso = UpdateType.Update;
        this.pasoReadOnly = false;
        this.mostrarEstadoOrigenPaso = (paso.ORDEN ?? 0) === 1;
        if (!this.mostrarEstadoOrigenPaso) {
            this.pasoModel.CORR_ESTADO_ORIGEN = null;
        }
        this.actualizarVisibilidadEstadoOrigenPaso();
        
        this.mostrarUnidadDestino = paso.CORR_ACTOR_DESTINO <= 3 && paso.CORR_ACTOR_DESTINO !== 1
        this.actualizarVisibilidadLabelUnidad();
        this.habilitarPaso();
    }
    //#endregion

    //#region <Metodos Pasos - Eventos>
    /**
     * Evento cuando se hace doble click en un paso
     */
    rowDblClickPaso(e: any): void {
        if (e && e.data) {
            this.editarPaso(e.data);
        }
    }

    /**
     * Evento cuando se hace click en editar de un paso
     */
    editarClickPaso(e: any): void {
        this.editarPaso(e);
    }

    /**
     * Evento cuando cambia la fila enfocada
     */
    focusedRowChangedPaso(e: any): void {
        if (e.row) {
            this.pasoModel = { ...e.row.data };
        }
    }

    /**
     * Evento de eliminación de paso
     */
    rowRemovingPaso(e: any): void {
        if (!e.data) return;

        this.servicePaso
            .delete(e.data.CORR_PASO)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Paso eliminado con éxito!', NotifyType.Success);
                        this.cargarPasos();
                        e.component.refresh();
                    } else {
                        e.cancel = true;
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => {
                    e.cancel = true;
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }
    //#endregion

    //#region <Metodos Pasos - Bloqueo y Habilitación>
    /**
     * Bloquear edición de campos de paso
     */
    bloquearPaso(): void {
        this.pasoReadOnly = true;
    }

    /**
     * Habilitar edición de campos de paso
     */
    habilitarPaso(): void {
        this.pasoReadOnly = false;
    }
    //#endregion

    //#region <Modal Acciones de Paso>
    abrirModalAcciones(e: any): void {
        this.pasoSeleccionadoAcciones = e.row?.data || null;
        this.accionEstadoModel = null;
        this.banderaAccionEstado = UpdateType.Browse;
        this.modalAccionesVisible = true;
        if (this.pasoSeleccionadoAcciones) {
            this.cargarPasosDestinoLookup();
            this.cargarAccionesEstado();
        }
    }

    cerrarModalAcciones(): void {
        this.modalAccionesVisible = false;
        this.pasoSeleccionadoAcciones = null;
        this.accionesEstado = [];
        this.mCORR_PASO_DESTINO = [];
        this.accionEstadoModel = null;
        this.banderaAccionEstado = UpdateType.Browse;
    }

    cargarAccionesEstado(): void {
        if (!this.pasoSeleccionadoAcciones) return;
        this.serviceAccionEstado
            .getByPaso(
                this.pasoSeleccionadoAcciones.CORR_FLUJO_PROCESO,
                this.pasoSeleccionadoAcciones.CORR_PASO
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.accionesEstado = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    isAccionEstadoBrowse(): boolean {
        return this.banderaAccionEstado === UpdateType.Browse;
    }

    isAccionEstadoForm(): boolean {
        return this.banderaAccionEstado === UpdateType.Add || this.banderaAccionEstado === UpdateType.Update;
    }

    nuevoAccionEstado(): void {
        const today = new Date();
        this.accionEstadoModel = {
            CORR_EMPRESA: 1,
            CORR_FLUJO_PROCESO: this.pasoSeleccionadoAcciones?.CORR_FLUJO_PROCESO ?? 0,
            CORR_PASO: this.pasoSeleccionadoAcciones?.CORR_PASO ?? 0,
            CORR_ACCION: 0,
            CORR_ESTADO_DESTINO: 0,
            NOMBRE_ESTADO: '',
            PERMITIDO: true,
            CORR_TIPO_MOVIMIENTO: 0,
            TIPO_MOVIMIENTO: '',
            CORR_TIPO_NOTIFICACION: 0,
            TIPO_NOTIFICACION: '',
            CORR_PASO_DESTINO: null,
            ACTIVO: true,
            USUARIO_CREA: '',
            ESTACION_CREA: '',
            FECHA_CREA: today,
            USUARIO_ACTU: '',
            ESTACION_ACTU: '',
            FECHA_ACTU: today,
        };
        this.banderaAccionEstado = UpdateType.Add;
        this.accionEstadoReadOnly = false;
    }

    guardarAccionEstado(): void {
        if (!this.accionEstadoModel) return;
        if (!this.serviceAccionEstado.esValido(this.accionEstadoModel, this.notifyFx.bind(this))) return;

        this.loadingVisible = true;
        if (this.banderaAccionEstado === UpdateType.Add) {
            this.serviceAccionEstado
                .create(this.accionEstadoModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.notifyFx('Acción creada con éxito!', NotifyType.Success);
                            this.accionEstadoModel = null;
                            this.banderaAccionEstado = UpdateType.Browse;
                            this.cargarAccionesEstado();
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
        } else if (this.banderaAccionEstado === UpdateType.Update) {
            this.serviceAccionEstado
                .update(this.accionEstadoModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.notifyFx('Acción modificada con éxito!', NotifyType.Success);
                            this.accionEstadoModel = null;
                            this.banderaAccionEstado = UpdateType.Browse;
                            this.cargarAccionesEstado();
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
    }

    cancelarAccionEstado(): void {
        this.accionEstadoModel = null;
        this.banderaAccionEstado = UpdateType.Browse;
        this.accionEstadoReadOnly = false;
    }

    editarAccionEstado(e: any): void {
        const accion = e?.row?.data || e;
        if (!accion || !accion.CORR_ACCION) return;
        this.accionEstadoModel = { ...accion };
        this.banderaAccionEstado = UpdateType.Update;
        this.accionEstadoReadOnly = false;
    }

    rowRemovingAccionEstado(e: any): void {
        if (!e.data) return;
        this.serviceAccionEstado
            .delete(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Acción eliminada con éxito!', NotifyType.Success);
                        this.cargarAccionesEstado();
                        e.component.refresh();
                    } else {
                        e.cancel = true;
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => {
                    e.cancel = true;
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    focusedRowChangedAccionEstado(e: any): void {
        if (e.row) {
            this.accionEstadoModel = { ...e.row.data };
        }
    }
    //#endregion

    //#region <Modal Notificaciones (Estado Mensaje)>
    abrirModalNotificaciones(e: any): void {
        this.pasoSeleccionadoNotificaciones = e.row?.data || null;
        this.estadoMensajeModel = null;
        this.banderaEstadoMensaje = UpdateType.Browse;
        this.modalNotificacionesVisible = true;
        if (this.pasoSeleccionadoNotificaciones) {
            this.cargarEstadosMensaje();
        }
    }

    cerrarModalNotificaciones(): void {
        this.modalNotificacionesVisible = false;
        this.pasoSeleccionadoNotificaciones = null;
        this.estadosMensaje = [];
        this.estadoMensajeModel = null;
        this.banderaEstadoMensaje = UpdateType.Browse;
    }

    cargarEstadosMensaje(): void {
        if (!this.pasoSeleccionadoNotificaciones) return;
        this.serviceEstadoMensaje
            .getByPaso(
                this.pasoSeleccionadoNotificaciones.CORR_FLUJO_PROCESO,
                this.pasoSeleccionadoNotificaciones.CORR_PASO
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.estadosMensaje = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    isEstadoMensajeBrowse(): boolean {
        return this.banderaEstadoMensaje === UpdateType.Browse;
    }

    isEstadoMensajeForm(): boolean {
        return this.banderaEstadoMensaje === UpdateType.Add || this.banderaEstadoMensaje === UpdateType.Update;
    }

    nuevoEstadoMensaje(): void {
        const today = new Date();
        this.estadoMensajeModel = {
            CORR_EMPRESA: 1,
            CORR_ESTADO_MENSAJE: 0,
            CORR_FLUJO_PROCESO: this.pasoSeleccionadoNotificaciones?.CORR_FLUJO_PROCESO ?? 0,
            CORR_PASO: this.pasoSeleccionadoNotificaciones?.CORR_PASO ?? 0,
            CORR_ESTADO: 0,
            CORR_ACTOR: null,
            LOGIN_SISTEMA: null,
            MENSAJE: '',
            ACTIVO: true,
            USUARIO_CREA: '',
            ESTACION_CREA: '',
            FECHA_CREA: today,
            USUARIO_ACTU: '',
            ESTACION_ACTU: '',
            FECHA_ACTU: today,
        };
        this.banderaEstadoMensaje = UpdateType.Add;
        this.estadoMensajeReadOnly = false;
    }

    guardarEstadoMensaje(): void {
        if (!this.estadoMensajeModel) return;
        if (!this.serviceEstadoMensaje.esValido(this.estadoMensajeModel, this.notifyFx.bind(this))) return;

        this.loadingVisible = true;
        if (this.banderaEstadoMensaje === UpdateType.Add) {
            this.serviceEstadoMensaje
                .create(this.estadoMensajeModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.notifyFx('Mensaje creado con éxito!', NotifyType.Success);
                            this.estadoMensajeModel = null;
                            this.banderaEstadoMensaje = UpdateType.Browse;
                            this.cargarEstadosMensaje();
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
        } else if (this.banderaEstadoMensaje === UpdateType.Update) {
            this.serviceEstadoMensaje
                .update(this.estadoMensajeModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.notifyFx('Mensaje modificado con éxito!', NotifyType.Success);
                            this.estadoMensajeModel = null;
                            this.banderaEstadoMensaje = UpdateType.Browse;
                            this.cargarEstadosMensaje();
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
    }

    cancelarEstadoMensaje(): void {
        this.estadoMensajeModel = null;
        this.banderaEstadoMensaje = UpdateType.Browse;
        this.estadoMensajeReadOnly = false;
    }

    editarEstadoMensaje(e: any): void {
        const mensaje = e?.row?.data || e;
        if (!mensaje || !mensaje.CORR_ESTADO_MENSAJE) return;
        this.estadoMensajeModel = { ...mensaje };
        this.banderaEstadoMensaje = UpdateType.Update;
        this.estadoMensajeReadOnly = false;
    }

    rowRemovingEstadoMensaje(e: any): void {
        if (!e.data) return;
        this.serviceEstadoMensaje
            .delete(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Mensaje eliminado con éxito!', NotifyType.Success);
                        this.cargarEstadosMensaje();
                        e.component.refresh();
                    } else {
                        e.cancel = true;
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => {
                    e.cancel = true;
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    focusedRowChangedEstadoMensaje(e: any): void {
        if (e.row) {
            this.estadoMensajeModel = { ...e.row.data };
        }
    }

    selectedLookUpCORR_ESTADO_MENSAJE(vRow: any): any {
        return vRow[0]?.CORR_ESTADO;
    }

    selectedLookUpCORR_ACTOR_MENSAJE(vRow: any): any {
        return vRow[0]?.CORR_ACTOR;
    }
    //#endregion

    //#region <Modal Actores Destino>
    abrirModalActores(e: any): void {
        this.pasoSeleccionadoActores = e.row?.data || null;
        this.actorDestinoModel = null;
        this.banderaActorDestino = UpdateType.Browse;
        this.mostrarUnidadActorModal = false;
        this.modalActoresVisible = true;
        if (this.pasoSeleccionadoActores) {
            this.cargarActoresDestino();
        }
    }

    cerrarModalActores(): void {
        this.modalActoresVisible = false;
        this.pasoSeleccionadoActores = null;
        this.actoresDestino = [];
        this.actorDestinoModel = null;
        this.banderaActorDestino = UpdateType.Browse;
        this.mostrarUnidadActorModal = false;
    }

    cargarActoresDestino(): void {
        if (!this.pasoSeleccionadoActores) return;
        this.serviceActorDestino
            .getByPaso(this.pasoSeleccionadoActores.CORR_PASO)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.actoresDestino = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    isActorDestinoBrowse(): boolean {
        return this.banderaActorDestino === UpdateType.Browse;
    }

    isActorDestinoForm(): boolean {
        return this.banderaActorDestino === UpdateType.Add || this.banderaActorDestino === UpdateType.Update;
    }

    onActorDestinoModalChanged(corrActor: number): void {
        this.mostrarUnidadActorModal = this.serviceActorDestino.requiereUnidad(corrActor);
        if (!this.mostrarUnidadActorModal && this.actorDestinoModel) {
            this.actorDestinoModel.CORR_UNIDAD = null;
        }
    }

    selectedLookUpCORR_ACTOR_ACTOR_DESTINO(vRow: any): any {
        return vRow[0]?.CORR_ACTOR;
    }

    nuevoActorDestino(): void {
        const today = new Date();
        this.actorDestinoModel = {
            CORR_EMPRESA: 1,
            CORR_PASO_ACTOR_DESTINO: 0,
            CORR_PASO: this.pasoSeleccionadoActores?.CORR_PASO ?? 0,
            CORR_ACTOR: 0,
            CORR_UNIDAD: null,
            ORDEN: this.pasoSeleccionadoActores?.ORDEN ?? 1,
            ACTIVO: true,
            USUARIO_CREA: '',
            ESTACION_CREA: '',
            FECHA_CREA: today,
            USUARIO_ACTU: '',
            ESTACION_ACTU: '',
            FECHA_ACTU: today,
        };
        this.mostrarUnidadActorModal = false;
        this.banderaActorDestino = UpdateType.Add;
        this.actorDestinoReadOnly = false;
    }

    guardarActorDestino(): void {
        if (!this.actorDestinoModel) return;
        if (!this.serviceActorDestino.esValido(this.actorDestinoModel, this.notifyFx.bind(this))) return;

        if (this.mostrarUnidadActorModal && (!this.actorDestinoModel.CORR_UNIDAD || this.actorDestinoModel.CORR_UNIDAD <= 0)) {
            this.notifyFx('Debe seleccionar una unidad destino para el actor seleccionado', NotifyType.Error);
            return;
        }

        if (!this.mostrarUnidadActorModal) {
            this.actorDestinoModel.CORR_UNIDAD = null;
        }

        this.loadingVisible = true;
        if (this.banderaActorDestino === UpdateType.Add) {
            this.serviceActorDestino
                .create(this.actorDestinoModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.notifyFx('Actor creado con éxito!', NotifyType.Success);
                            this.actorDestinoModel = null;
                            this.banderaActorDestino = UpdateType.Browse;
                            this.mostrarUnidadActorModal = false;
                            this.cargarActoresDestino();
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
        } else if (this.banderaActorDestino === UpdateType.Update) {
            this.serviceActorDestino
                .update(this.actorDestinoModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.notifyFx('Actor modificado con éxito!', NotifyType.Success);
                            this.actorDestinoModel = null;
                            this.banderaActorDestino = UpdateType.Browse;
                            this.mostrarUnidadActorModal = false;
                            this.cargarActoresDestino();
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
    }

    cancelarActorDestino(): void {
        this.actorDestinoModel = null;
        this.banderaActorDestino = UpdateType.Browse;
        this.actorDestinoReadOnly = false;
        this.mostrarUnidadActorModal = false;
    }

    editarActorDestino(e: any): void {
        const actor = e?.row?.data || e;
        if (!actor || !actor.CORR_PASO_ACTOR_DESTINO) return;
        this.actorDestinoModel = { ...actor };
        this.banderaActorDestino = UpdateType.Update;
        this.actorDestinoReadOnly = false;
        this.mostrarUnidadActorModal = this.serviceActorDestino.requiereUnidad(actor.CORR_ACTOR);
    }

    rowRemovingActorDestino(e: any): void {
        if (!e.data) return;
        this.serviceActorDestino
            .delete(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Actor eliminado con éxito!', NotifyType.Success);
                        this.cargarActoresDestino();
                        e.component.refresh();
                    } else {
                        e.cancel = true;
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => {
                    e.cancel = true;
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    focusedRowChangedActorDestino(e: any): void {
        if (e.row) {
            this.actorDestinoModel = { ...e.row.data };
        }
    }
    //#endregion
}