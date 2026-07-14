import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegFlujoTipoDocumento } from './models/seg-flujo-tipo-documento';
import { SegFlujoTipoDocumentoService } from './seg-flujo-tipo-documento.service';
import { SegFlujoEstadoService } from './seg-flujo-estado.service';
import { SegFlujoEstado } from './models/seg-flujo-estado';

@Component({
    selector: 'app-seg-flujo-tipo-documento',
    templateUrl: './seg-flujo-tipo-documento.component.html',
    styleUrls: ['./seg-flujo-tipo-documento.component.scss'],
})
export class SegFlujoTipoDocumentoComponent extends CBaseComponent implements OnInit {
    //#region <ViewChilds>
    @ViewChild('fDataEstado') fDataEstado: any;
    //#endregion

    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: SegFlujoTipoDocumentoService,
        private estadoService: SegFlujoEstadoService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();

        // Inicializar columnas y items de estados
        this.estadoColumns = this.service.getEstadoColumns();
        this.estadoItems = this.service.getEstadoItems();
    }

    //#region <Declarando Variables>
    readOnly = false;

    // Variables para estados
    estadoModels: SegFlujoEstado[] = [];
    estadoModel: SegFlujoEstado = this.fillEstadoData();
    estadoColumns: any[];
    estadoItems: any[];
    estadoReadOnly = false;
    banderaMttoEstado: UpdateType = UpdateType.Browse;
    //#endregion

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.consultar();
    }

    inicializaOpciones() {}
    //#endregion

    //#region <Metodos Mtto Tipo Documento>
    fillParam(xCORR_TIPO_DOCUMENTO?: number): any {
        if (xCORR_TIPO_DOCUMENTO == undefined) {
            xCORR_TIPO_DOCUMENTO = 0;
        }
        return {
            CORR_TIPO_DOCUMENTO: xCORR_TIPO_DOCUMENTO,
        };
    }

    override fillData(xModel?: SegFlujoTipoDocumento): SegFlujoTipoDocumento {
        if (xModel !== undefined) {
            return { ...xModel };
        } else {
            const today = new Date();
            return {
                CORR_EMPRESA: 1,
                CORR_TIPO_DOCUMENTO: 0,
                NOMBRE_TIPO: '',
                DESCRIPCION: '',
                CODIGO_OPCION: '',
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

    // Método para llenar datos de Estado
    
    fillEstadoData(xModel?: SegFlujoEstado): SegFlujoEstado {
        if (xModel !== undefined && xModel.CORR_ESTADO > 0) {
            // ✅ Si hay datos, retornarlos tal cual (sin spread)
            return xModel;
        } else {
            // ✅ Si no hay datos, crear un objeto vacío
            const today = new Date();
            return {
                CORR_EMPRESA: 1,
                CORR_ESTADO: 0,
                CORR_TIPO_DOCUMENTO: this.model?.CORR_TIPO_DOCUMENTO || 0,
                NOMBRE_ESTADO: '',
                DESCRIPCION: '',
                ES_INICIAL: false,
                ES_FINAL: false,
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

    // Consultar estados por tipo de documento
    consultarEstados(corrTipoDocumento: number) {
        if (!corrTipoDocumento || corrTipoDocumento === 0) {
            this.estadoModels = [];
            return;
        }

        let xWhere: any = {
            CORR_TIPO_DOCUMENTO: corrTipoDocumento,
           
        };

        this.estadoService
            .getAll(xWhere)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.estadoModels = response.Data;
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
                            this.modelUpdate = this.fillData(this.model);
                            this.volverAlListado();
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
                                (item: any) => item.CORR_TIPO_DOCUMENTO === response.Data.CORR_TIPO_DOCUMENTO
                            );
                            this.models[vIndex] = response.Data;
                            this.modelUpdate = this.fillData(this.model);
                            this.volverAlListado();
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

     // Guardar estado
    guardarEstado(): void {
        if (!this.estadoService.esValido(this.estadoModel, this.notifyFx)) {
            return;
        }

        this.loadingVisible = true;
        this.estadoModel.CORR_TIPO_DOCUMENTO = this.model.CORR_TIPO_DOCUMENTO;

        if (this.banderaMttoEstado === UpdateType.Add) {
            this.estadoService
                .insert(this.estadoModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.estadoModels.push(response.Data);
                            this.estadoModel = this.fillEstadoData(response.Data);
                            this.banderaMttoEstado = UpdateType.Browse;
                            this.estadoReadOnly = false;
                            this.notifyFx('Estado creado con exito!', NotifyType.Success);
                            this.consultarEstados(this.model.CORR_TIPO_DOCUMENTO);
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
        } else if (this.banderaMttoEstado === UpdateType.Update) {
            this.estadoService
                .update(this.estadoModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            const vIndex = this.estadoModels.findIndex(
                                (item: any) => item.CORR_ESTADO === response.Data.CORR_ESTADO
                            );
                            this.estadoModels[vIndex] = response.Data;
                            this.estadoModel = this.fillEstadoData(response.Data);
                            this.banderaMttoEstado = UpdateType.Browse;
                            this.estadoReadOnly = false;
                            this.notifyFx('Estado modificado con exito!', NotifyType.Success);
                            this.consultarEstados(this.model.CORR_TIPO_DOCUMENTO);
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


    private volverAlListado(): void {
        this.estadoModels = [];
        this.estadoModel = this.fillEstadoData();
        this.banderaMttoEstado = UpdateType.Browse;
        this.AsignaStatus(UpdateType.Browse);
        this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
    }

    override cancelar(): void {
        const finalizarCancelacion = () => {
            this.estadoModels = [];
            this.estadoModel = this.fillEstadoData();
            this.banderaMttoEstado = UpdateType.Browse;
            this.estadoReadOnly = false;
            this.readOnly = false;
        };

        if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
            this.confirmaCancelar(() => {
                this.model = this.modelUpdate;
                const vIndex = this.models.findIndex(
                    (item: any) => item.CORR_TIPO_DOCUMENTO === this.modelUpdate.CORR_TIPO_DOCUMENTO
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

    override bloquear(): void {
        this.dataForm.instance.getEditor('CORR_TIPO_DOCUMENTO')?.option('readOnly', true);
        this.dataForm.instance.getEditor('NOMBRE_TIPO')?.option('readOnly', true);
        this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
        this.dataForm.instance.getEditor('CODIGO_OPCION')?.option('readOnly', true);
        this.dataForm.instance.getEditor('ACTIVO')?.option('disabled', true);
        this.readOnly = true;
    }

    override habilitar(): void {
        this.readOnly = false;
    }

    override setFocus() {
        setTimeout(() => {
            this.dataForm.instance.getEditor('NOMBRE_TIPO')?.focus();
        });
    }

    // Evento cuando se selecciona un registro en el grid principal
    override focusedRowChanged(e: any): void {
        super.focusedRowChanged(e);
        if (this.isBrowse() && e.row && e.row.data) {
            this.consultarEstados(e.row.data.CORR_TIPO_DOCUMENTO);
        }
    }

    // Cuando se hace doble click o editar, cargar estados
    override rowDblClick(e: any): void {
        super.rowDblClick(e);
        this.consultarEstados(this.model.CORR_TIPO_DOCUMENTO);
    }

    override editarClick(e: any): void {
        super.editarClick(e);
        this.consultarEstados(this.model.CORR_TIPO_DOCUMENTO);
    }

    override nuevo(): void {
        super.nuevo();
        this.estadoModels = [];
        this.estadoModel = this.fillEstadoData();
        this.banderaMttoEstado = UpdateType.Browse;
    }
    
    // Nuevo estado
    nuevoEstado(): void {
        if (!this.model || !this.model.CORR_TIPO_DOCUMENTO || this.model.CORR_TIPO_DOCUMENTO === 0) {
            this.notifyFx('Primero debe guardar el tipo de documento', NotifyType.Warning);
            return;
        }

        this.estadoModel = this.fillEstadoData();
        this.estadoModel.CORR_TIPO_DOCUMENTO = this.model.CORR_TIPO_DOCUMENTO;
        this.banderaMttoEstado = UpdateType.Add;
        this.estadoReadOnly = false;
        this.habilitarEstado();
        setTimeout(() => {
            this.fDataEstado?.instance?.getEditor('NOMBRE_ESTADO')?.focus();
        });
    }

    rowRemoving(e: any) {
        this.service
            .delete(this.fillParam(e.data.CORR_TIPO_DOCUMENTO))
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
       // Eliminar estado
    rowRemovingEstado(e: any): void {
        if (!e.data) return;

        this.estadoService
            .delete(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Estado eliminado con exito!', NotifyType.Success);
                        this.consultarEstados(this.model.CORR_TIPO_DOCUMENTO);
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

    //#region <Metodos de Estado - Status y Permisos>
    /**
     * Verifica si el grid de estados está en modo Browse
     */
    isEstadoBrowse(): boolean {
        return this.banderaMttoEstado === UpdateType.Browse;
    }

    /**
     * Verifica si el grid de estados está en modo Form (Add o Update)
     */
    isEstadoForm(): boolean {
        return this.banderaMttoEstado === UpdateType.Add || this.banderaMttoEstado === UpdateType.Update;
    }

    /**
     * Permite agregar nuevos estados
     */
    get getPermiteAddEstado(): boolean {
        return this.permiteAdd && this.model?.CORR_TIPO_DOCUMENTO > 0;
    }

    /**
     * Permite editar estados
     */
    get getPermiteEditarEstado(): boolean {
        return this.permiteEdit;
    }

    /**
     * Permite eliminar estados
     */
    get getPermiteDeleEstado(): boolean {
        return this.permiteDele;
    }

    

   
    // Cancelar edición de estado
    cancelarEstado(): void {
        this.banderaMttoEstado = UpdateType.Browse;
        this.estadoReadOnly = false;
        if (this.estadoModel.CORR_ESTADO > 0) {
            const original = this.estadoModels.find(e => e.CORR_ESTADO === this.estadoModel.CORR_ESTADO);
            if (original) {
                this.estadoModel = this.fillEstadoData(original);
            }
        } else {
            this.estadoModel = this.fillEstadoData();
        }
    }

     // Editar estado
    editarEstado(event: any): void {
        // Extraer los datos reales del evento (están dentro de 'row.data')
        const estado = event?.row?.data || event;
        
        // Verificar que tenemos datos válidos
        if (!estado || !estado.CORR_ESTADO) {
            console.warn('Datos de estado no válidos:', estado);
            return;
        }
        
        this.estadoModel = this.fillEstadoData(estado);
        this.banderaMttoEstado = UpdateType.Update;
        this.estadoReadOnly = false;
        this.habilitarEstado();
        setTimeout(() => {
            this.fDataEstado?.instance?.getEditor('NOMBRE_ESTADO')?.focus();
        });
    }
 

    rowDblClickEstado(e: any): void {
        if (e && e.data) {
            this.editarEstado(e.data);
        }
    }

    // Bloquear edición de estado
    bloquearEstado(): void {
        this.fDataEstado?.instance?.getEditor('NOMBRE_ESTADO')?.option('readOnly', true);
        this.fDataEstado?.instance?.getEditor('DESCRIPCION')?.option('readOnly', true);
        this.fDataEstado?.instance?.getEditor('ES_INICIAL')?.option('disabled', true);
        this.fDataEstado?.instance?.getEditor('ES_FINAL')?.option('disabled', true);
        this.fDataEstado?.instance?.getEditor('ACTIVO')?.option('disabled', true);
        this.estadoReadOnly = true;
    }

    // Habilitar edición de estado
    habilitarEstado(): void {
        this.estadoReadOnly = false;
    }
    //#endregion
}