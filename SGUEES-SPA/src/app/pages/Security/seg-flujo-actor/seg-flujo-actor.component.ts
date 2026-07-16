import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegFlujoActor } from './models/seg-flujo-actor';
import { SegFlujoActorService } from './seg-flujo-actor.service';
import { SegFlujoActorAsignacionService } from './seg-flujo-actor-asignacion.service';
import { SegFlujoActorAsignacion } from './models/seg-flujo-actor-asignacion';
import { MttoPageContextService } from 'src/app/layouts/mtto-page-context.service';
import { IParam } from 'src/app/FxAPI/IParam';

@Component({
    selector: 'app-seg-flujo-actor',
    templateUrl: './seg-flujo-actor.component.html',
    styleUrls: ['./seg-flujo-actor.component.scss'],
})
export class SegFlujoActorComponent extends CBaseComponent implements OnInit {
    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: SegFlujoActorService,
        private asignacionService: SegFlujoActorAsignacionService,
        private pageContext: MttoPageContextService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();

        // Inicializar columnas y items de asignaciones
        this.asignacionColumns = this.asignacionService.getColumns();
        this.asignacionItems = this.asignacionService.getItems();
    }

    //#region <Declarando Variales>
    readOnly = false;

    // Variables para asignaciones
    asignacionModels: SegFlujoActorAsignacion[] = [];
    asignacionModel: SegFlujoActorAsignacion = this.fillAsignacionData();
    asignacionColumns: any[];
    asignacionItems: any[];
    asignacionReadOnly = false;
    banderaMttoAsignacion: UpdateType = UpdateType.Browse;
    unidades: any[] = [];
    empleadosDisponibles: any[] = [];
    filtroUnidadEmpleado: number = 0;
    // #endregion

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.consultar();
        this.cargarUnidades();
    }

    inicializaOpciones() {
        const acciones = this.columns.find((c: any) => c.name === 'btnAcciones');
        if (acciones?.buttons) {
            const editBtn = acciones.buttons.find((b: any) => b.icon === 'edit');
            if (editBtn) editBtn.onClick = (e: any) => this.editarClick(e);
        }
    }

    cargarUnidades() {
        this.appInfoService
            .getLookUp(
                'SEG_FLUJO_ACTOR',
                'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
                'GetCORR_UNIDADES',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.unidades = (response.Data || []).map((u: any) => ({
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

    cargarEmpleadosDisponibles(corrUnidadEmpleado: number) {
        if (!corrUnidadEmpleado || corrUnidadEmpleado === 0) {
            this.empleadosDisponibles = [];
            return;
        }

        this.service
            .getEmpleadosByUnidad(corrUnidadEmpleado,this.model?.CORR_ACTOR || 0)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.empleadosDisponibles = response.Data || [];
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    onFiltroUnidadEmpleadoChanged(corrUnidadEmpleado: number) {
        this.filtroUnidadEmpleado = corrUnidadEmpleado || 0;
        this.asignacionModel.CORR_UNIDAD = corrUnidadEmpleado || 0;
        this.asignacionModel.LOGIN_SISTEMA = '';
        this.cargarEmpleadosDisponibles(this.filtroUnidadEmpleado);
    }



    // #endregion

    //#region <Metodos Mtto>
    fillParam(xCORR_ACTOR?: number): any {
        if (xCORR_ACTOR == undefined) {
            xCORR_ACTOR = 0;
        }
        return {
            CORR_ACTOR: xCORR_ACTOR,
        };
    }

    override fillData(xModel?: SegFlujoActor): SegFlujoActor {
        if (xModel !== undefined) {
            return {
                CORR_EMPRESA: xModel.CORR_EMPRESA,
                CORR_ACTOR: xModel.CORR_ACTOR,
                NOMBRE_ACTOR: xModel.NOMBRE_ACTOR,
                DESCRIPCION: xModel.DESCRIPCION,
                REQUIERE_UNIDAD: xModel.REQUIERE_UNIDAD,
                CORR_UNIDAD_EMPLEADO: xModel.CORR_UNIDAD_EMPLEADO,
                RESOLUCION_AUTOMATICA: xModel.RESOLUCION_AUTOMATICA,
                ACTIVO: xModel.ACTIVO,
                USUARIO_CREA: xModel.USUARIO_CREA,
                ESTACION_CREA: xModel.ESTACION_CREA,
                FECHA_CREA: xModel.FECHA_CREA,
                USUARIO_ACTU: xModel.USUARIO_ACTU,
                ESTACION_ACTU: xModel.ESTACION_ACTU,
                FECHA_ACTU: xModel.FECHA_ACTU,
            };
        } else {
            return {
                CORR_EMPRESA: 1,
                CORR_ACTOR: 0,
                NOMBRE_ACTOR: '',
                DESCRIPCION: '',
                CORR_UNIDAD_EMPLEADO: 0,
                REQUIERE_UNIDAD: false,
                RESOLUCION_AUTOMATICA: false,
                ACTIVO: true,
                USUARIO_CREA: '',
                ESTACION_CREA: '',
                FECHA_CREA: new Date(),
                USUARIO_ACTU: '',
                ESTACION_ACTU: '',
                FECHA_ACTU: new Date(),
            };
        }
    }

    // Método para llenar datos de Asignación
    fillAsignacionData(xModel?: SegFlujoActorAsignacion): SegFlujoActorAsignacion {
        if (xModel !== undefined && xModel.CORR_ASIGNACION > 0) {
            return xModel;
        } else {
            const today = new Date();
            return {
                CORR_EMPRESA: 1,
                CORR_ASIGNACION: 0,
                LOGIN_SISTEMA: '',
                CORR_ACTOR: this.model?.CORR_ACTOR || 0,
                CORR_UNIDAD: 0,
                ACTIVO: true,
                USUARIO_CREA: '',
                ESTACION_CREA: '',
                FECHA_CREA: today,
                USUARIO_ACTU: '',
                ESTACION_ACTU: '',
                FECHA_ACTU: today,
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

    // Consultar asignaciones por actor
    consultarAsignaciones(corrActor: number) {
        if (!corrActor || corrActor === 0) {
            this.asignacionModels = [];
            return;
        }

        let xWhere: any = {
            CORR_ACTOR: corrActor,
        };

        this.asignacionService
            .getAll(xWhere)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.asignacionModels = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    guardar(): void {
        if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
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
                            this.notifyFx('Registro creado con exito!', NotifyType.Success);
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
                                (item: any) => item.CORR_ACTOR === response.Data.CORR_ACTOR
                            );
                            this.models[vIndex] = response.Data;
                            this.AsignaStatus(UpdateType.Browse);
                            this.notifyFx('Registro modificado con exito!', NotifyType.Success);
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
            this.asignacionModels = [];
            this.asignacionModel = this.fillAsignacionData();
            this.banderaMttoAsignacion = UpdateType.Browse;
        };

        if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
            this.confirmaCancelar(() => {
                this.model = this.modelUpdate;
                const vIndex = this.models.findIndex(
                    (item: any) => item.CORR_ACTOR === this.modelUpdate.CORR_ACTOR
                );
                if (vIndex >= 0) {
                    this.models[vIndex] = this.modelUpdate;
                }
                this.AsignaStatus(UpdateType.Browse);
                this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
                finalizarCancelacion();
                // setTimeout DENTRO del callback: corre DESPUÉS de ngOnDestroy de la barra
                // hija, que llama reset(). Así se restauran permiteAdd y unifiedToolbar.
                setTimeout(() => {
                    this.pageContext.updateFromBarra(
                        { permiteAdd: this.permiteAdd, unifiedToolbar: true },
                        { add: () => this.nuevo() }
                    );
                });
            });
        } else {
            this.AsignaStatus(UpdateType.Browse);
            finalizarCancelacion();
            setTimeout(() => {
                this.pageContext.updateFromBarra(
                    { permiteAdd: this.permiteAdd, unifiedToolbar: true },
                    { add: () => this.nuevo() }
                );
            });
        }
    }

    rowRemoving(e: any) {
        this.service
            .delete(this.fillParam(e.data.CORR_ACTOR))
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
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
        this.dataForm.instance.getEditor('NOMBRE_ACTOR')?.option('readOnly', true);
        this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
        this.dataForm.instance.getEditor('REQUIERE_UNIDAD')?.option('disabled', true);
        this.dataForm.instance.getEditor('ACTIVO')?.option('disabled', true);
        this.readOnly = true;
    }

    override habilitar(): void {
        this.readOnly = false;
    }

    override setFocus() {
        setTimeout(() => {
            this.dataForm.instance.getEditor('NOMBRE_ACTOR')?.focus();
        });
    }

    // Evento cuando se selecciona un registro en el grid principal
    override focusedRowChanged(e: any): void {
        super.focusedRowChanged(e);
        if (this.isBrowse() && e.row && e.row.data) {
            this.consultarAsignaciones(e.row.data.CORR_ACTOR);
        }
    }

    // Cuando se hace doble click o editar, cargar asignaciones
    override rowDblClick(e: any): void {
        super.rowDblClick(e);
        this.consultarAsignaciones(this.model.CORR_ACTOR);
    }

    override editarClick(e: any): void {
        super.editarClick(e);
        this.consultarAsignaciones(this.model.CORR_ACTOR);
    }

    override nuevo(): void {
        super.nuevo();
        this.asignacionModels = [];
        this.asignacionModel = this.fillAsignacionData();
    }

    // Métodos para manejo de asignaciones
    isAsignacionBrowse(): boolean {
        return this.banderaMttoAsignacion === UpdateType.Browse;
    }

    isAsignacionForm(): boolean {
        return !this.isAsignacionBrowse();
    }

    get getPermiteAddAsignacion() {
        return this.permiteAdd;
    }

    get getPermiteEditarAsignacion() {
        return this.permiteEdit;
    }

    get getPermiteDeleAsignacion() {
        return this.permiteDele;
    }

    nuevoAsignacion() {
        this.banderaMttoAsignacion = UpdateType.Add;
        this.asignacionModel = this.fillAsignacionData();
        this.filtroUnidadEmpleado = this.asignacionModel.CORR_UNIDAD;
        this.cargarEmpleadosDisponibles(this.filtroUnidadEmpleado);
        this.asignacionReadOnly = false;
    }

    guardarAsignacion(): void {
        if (!this.asignacionService.esValido(this.asignacionModel, this.notifyFx.bind(this))) {
            return;
        }

        this.loadingVisible = true;
        this.asignacionModel.CORR_ACTOR = this.model.CORR_ACTOR;

        if (this.banderaMttoAsignacion === UpdateType.Add) {
            this.asignacionService
                .insert(this.asignacionModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.asignacionModels.push(response.Data);
                            this.asignacionModel = this.fillAsignacionData(response.Data);
                            this.banderaMttoAsignacion = UpdateType.Browse;
                            this.asignacionReadOnly = false;
                            this.notifyFx('Asignación creada con exito!', NotifyType.Success);
                            this.consultarAsignaciones(this.model.CORR_ACTOR);
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
        } else if (this.banderaMttoAsignacion === UpdateType.Update) {
            this.asignacionService
                .update(this.asignacionModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            const vIndex = this.asignacionModels.findIndex(
                                (item: any) => item.CORR_ASIGNACION === response.Data.CORR_ASIGNACION
                            );
                            this.asignacionModels[vIndex] = response.Data;
                            this.asignacionModel = this.fillAsignacionData(response.Data);
                            this.banderaMttoAsignacion = UpdateType.Browse;
                            this.asignacionReadOnly = false;
                            this.notifyFx('Asignación modificada con exito!', NotifyType.Success);
                            this.consultarAsignaciones(this.model.CORR_ACTOR);
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

    cancelarAsignacion() {
        this.banderaMttoAsignacion = UpdateType.Browse;
        this.asignacionReadOnly = false;
        this.asignacionModel = this.fillAsignacionData();
        this.filtroUnidadEmpleado = 0;
        this.empleadosDisponibles = [];
    }

    rowDblClickAsignacion(e: any): void {
        this.editarAsignacion(e);
    }

    editarAsignacion(e: any) {
        const asignacion = e?.row?.data || e?.data || e;   // ← cubre editClick Y rowDblClick
        this.asignacionModel = this.fillAsignacionData(asignacion);
        this.banderaMttoAsignacion = UpdateType.Update;
        this.filtroUnidadEmpleado = this.asignacionModel.CORR_UNIDAD;
        this.cargarEmpleadosDisponibles(this.filtroUnidadEmpleado);
        this.asignacionReadOnly = false;
    }

    selectedLookUpLOGIN_SISTEMA(vRow: any): any {
        return vRow[0]?.LOGIN_SISTEMA_WEB;
    }

    rowRemovingAsignacion(e: any) {
        if (!e.data) return;

        this.asignacionService
            .delete(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Asignación eliminada con exito!', NotifyType.Success);
                        this.consultarAsignaciones(this.model.CORR_ACTOR);
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
}