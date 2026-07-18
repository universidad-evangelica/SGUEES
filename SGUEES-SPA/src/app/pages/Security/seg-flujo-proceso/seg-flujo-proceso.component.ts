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
        private servicePaso: SegFlujoPasoService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();
        this.columnsPasos = this.servicePaso.getColumns();
        this.summaryPasos = this.servicePaso.getSummary();
        this.itemsPasos = this.servicePaso.getItems();
    }

    //#region <Declarando Variables>
    readOnly = false;
    model: any = this.fillData();
    mCORR_TIPO_DOCUMENTO: any;
    mCORR_ACTOR_ORIGEN: any;
    mCORR_ACTOR_DESTINO: any;
    unidadesPaso: any[] = [];
    mostrarUnidadDestino: boolean = false;

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
    // #endregion

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.getCORR_TIPO_DOCUMENTO();
        this.getCORR_ACTOR_ORIGEN();
        this.getCORR_ACTOR_DESTINO();
        this.cargarUnidadesPaso();
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
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
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

    onActorDestinoChanged(corrActor: number) {
        this.mostrarUnidadDestino = corrActor !== 1 && corrActor !== 2 && corrActor !== 3;
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
                        }
                    },
                    error: (error: any) => {
                        this.notifyFx(error, NotifyType.Error);
                    },
                });
        }
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

        const today = new Date();
        this.pasoModel = {
            CORR_EMPRESA: 1,
            CORR_FLUJO_PROCESO: this.model.CORR_FLUJO_PROCESO,
            CORR_FLUJO_PASO: 0,
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
        this.habilitarPaso();
    }

    /**
     * Guardar paso (CREATE o UPDATE)
     */
    guardarPaso(): void {
        if (!this.pasoModel) return;

        if (!this.servicePaso.esValido(this.pasoModel, this.notifyFx.bind(this))) {
            return;
        }

        this.loadingVisible = true;
        this.pasoModel.CORR_FLUJO_PROCESO = this.model.CORR_FLUJO_PROCESO;

        if (this.banderaMttoPaso === UpdateType.Add) {
            this.servicePaso
                .create(this.pasoModel)
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
                                (item: any) => item.CORR_FLUJO_PASO === response.Data.CORR_FLUJO_PASO
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
        this.mostrarUnidadDestino = false;
        if (this.pasoModel && this.pasoModel.CORR_FLUJO_PASO > 0) {
            const original = this.pasos.find(p => p.CORR_FLUJO_PASO === this.pasoModel?.CORR_FLUJO_PASO);
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

        if (!paso || !paso.CORR_FLUJO_PASO) {
            console.warn('⚠️ Datos de paso no válidos:', paso);
            return;
        }

        this.pasoModel = { ...paso };
        this.banderaMttoPaso = UpdateType.Update;
        this.pasoReadOnly = false;
        this.mostrarUnidadDestino = paso.CORR_ACTOR_DESTINO !== 1 && paso.CORR_ACTOR_DESTINO !== 2 && paso.CORR_ACTOR_DESTINO !== 3;
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
            .delete(e.data.CORR_FLUJO_PASO)
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
}