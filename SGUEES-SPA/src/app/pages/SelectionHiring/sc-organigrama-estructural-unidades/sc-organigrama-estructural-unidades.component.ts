import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SC_OrganigramaEstructuralUnidadesService } from './sc-organigrama-estructural-unidades.service';
import { SC_OrganigramaEstructuralUnidad } from './models/sc-organigrama-estructural-unidad';
import { SC_OrganigramaEstructuralNivel } from './models/sc-organigrama-estructural-nivel';
import { SC_OrganigramaEstructuralNivelService } from '../sc-organigrama-estructural-nivel/sc-organigrama-estructural-nivel.service';
import { IParam } from 'src/app/FxAPI/IParam';
import { environment } from 'src/environments/environment';
import { confirm } from 'devextreme/ui/dialog';
import { SC_OrganigramaEstructuralJefesService } from './sc-organigrama-estructural-jefes.service';
import { SC_OrganigramaEstructuralJefe } from './models/sc-organigrama-estructural-jefe';

@Component({
    selector: 'app-sc-organigrama-estructural-unidades',
    templateUrl: './sc-organigrama-estructural-unidades.component.html',
    styleUrls: ['./sc-organigrama-estructural-unidades.component.scss'],
})
export class SC_OrganigramaEstructuralUnidadesComponent extends CBaseComponent implements OnInit {
    //#region <ViewChilds>
    @ViewChild('treeView') treeView: any;
    //#endregion

    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: SC_OrganigramaEstructuralUnidadesService,
        private nivelService: SC_OrganigramaEstructuralNivelService,
        private jefeService: SC_OrganigramaEstructuralJefesService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();

        //  Inicializar columnas y items de jefes
        this.jefesColumns = this.jefeService.getColumns();
        this.jefesItems = this.jefeService.getItems();
    }

    //#region <Declarando Variables>
    // Variables para Unidades
    unidades: SC_OrganigramaEstructuralUnidad[] = [];
    unidadSeleccionada: SC_OrganigramaEstructuralUnidad | null = null;
    unidadModel: SC_OrganigramaEstructuralUnidad = this.fillUnidadData();
    unidadModelUpdate: SC_OrganigramaEstructuralUnidad = this.fillUnidadData();
    mCORR_NIVEL: any;
    mCORR_UNIDAD: any;
    readOnly = false;
    // Variables para Jefes
    jefesModels: SC_OrganigramaEstructuralJefe[] = [];
    jefeModel: SC_OrganigramaEstructuralJefe = this.fillJefeData();
    jefesColumns: any[];
    jefesItems: any[];
    jefeReadOnly = false;
    banderaMttoJefe: UpdateType = UpdateType.Browse;

    // Variables para empleados disponibles
    empleadosDisponibles: any[] = [];
    filtroUnidadJefe: number = 0;
    // Data sources para combos
    nivelesActivos: SC_OrganigramaEstructuralNivel[] = [];
    unidadesPadre: SC_OrganigramaEstructuralUnidad[] = [];

    // Estado del componente
    mostrarFormulario = false;
    //#endregion

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.consultar();
        this.llenaComboBox();
    }

    inicializaOpciones() { }
    //#endregion

    //#region <Manejo de Combos>
    llenaComboBox() {
        this.getCORR_NIVELES();
        this.getCORR_UNIDADES();
    }
    getCORR_NIVELES() {
        this.appInfoService
            .getLookUp('SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES', 'SC_ORGANIGRAMA_ESTRUCTURAL_NIVEL', 'GetCORR_NIVELES', undefined, environment.UrlGENERALAPI)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_NIVEL = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    getCORR_UNIDADES() {
        this.appInfoService
            .getLookUp(
                'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
                'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
                'GetCORR_UNIDADES',
                undefined,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_UNIDAD = (response.Data || []).map((u: any) => ({
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


    onNivelChange(value: number): void {

        let xWhere: IParam[] = [{ Parameter: 'CORR_NIVEL', Value: value }];
        this.appInfoService
            .getLookUp(
                'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
                'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
                'GetCORR_UNIDADES',
                xWhere,
                environment.UrlGENERALAPI
            )
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCORR_UNIDAD = (response.Data || []).map((u: any) => ({
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


    onTreeDeleteClick(itemData: any, e: any): void {
        e?.event?.stopPropagation();
        e?.event?.preventDefault();

        confirm('¿Está seguro que desea eliminar este registro?', 'Confirmación')
            .then((ok: boolean) => {
                if (!ok) return;

                this.rowRemoving({
                    data: itemData,
                    cancel: false,
                    component: this.treeView?.instance
                });
            });
    }

    rowRemoving(e: any) {
        this.service
            .delete(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Unidad eliminada con exito!', NotifyType.Success);
                        this.consultar();
                        this.getCORR_UNIDADES();
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

    //#region <Metodos Fill>
    fillUnidadData(xModel?: SC_OrganigramaEstructuralUnidad): SC_OrganigramaEstructuralUnidad {
        if (xModel !== undefined) {
            return { ...xModel };
        } else {
            const today = new Date();
            return {
                CORR_EMPRESA: 1,
                CORR_UNIDAD: 0,
                CODIGO_UNIDAD: '',
                NOMBRE_UNIDAD: '',
                CORR_NIVEL: 0,
                NOMBRE_NIVEL: '',
                CORR_UNIDAD_PADRE: null,
                NOMBRE_UNIDAD_PADRE: null,
                ACTIVO: true,
                USUARIO_CREA: '',
                ESTACION_CREA: '',
                FECHA_CREA: today,
                USUARIO_ACTU: '',
                ESTACION_ACTU: '',
                FECHA_ACTU: today,
                TIENE_HIJAS: 0,
                TIENE_JEFES: 0,
            };
        }
    }

    fillJefeData(xModel?: SC_OrganigramaEstructuralJefe): SC_OrganigramaEstructuralJefe {
        if (xModel !== undefined) {
            return { ...xModel };
        } else {
            const today = new Date();
            return {
                CORR_EMPRESA: 1,
                CORR_JEFE: 0,
                CORR_UNIDAD: this.unidadModel?.CORR_UNIDAD || 0,
                NOMBRE_UNIDAD: '',
                CORR_EMPLEADO: 0,
                NOMBRE_EMPLEADO: '',
                LOGIN_SISTEMA_WEB: '',
                FECHA_INICIO: today,
                FECHA_FIN: null,
                ACTIVO: true,
                CORR_PUESTO: null,
                NOMBRE_PUESTO: '',
            };
        }
    }
    //#endregion

    //#region <Metodos de Consulta>
    consultar() {
        this.cargarUnidades();
        this.cargarNivelesActivos();
    }

    cargarUnidades() {
        this.service
            .getAll({})
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.unidades = (response.Data || []).map((u: any) => ({ ...u, NOMBRE_UNIDAD_TREE: (u.CODIGO_UNIDAD ? u.CODIGO_UNIDAD + ' - ' : '') + (u.NOMBRE_UNIDAD || '') }));
                        this.cargarUnidadesPadre();
                        this.refrescarTreeView();
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    cargarNivelesActivos() {
        this.nivelService
            .getNivelesActivos({ CORR_EMPRESA: 1 })
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.nivelesActivos = response.Data;
                        this.actualizarCombos();
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    //#region <Metodos de Jefes>
    cargarJefes(corrUnidad: number) {
        if (!corrUnidad || corrUnidad === 0) {
            this.jefesModels = [];
            return;
        }

        this.jefeService
            .getByUnidad(corrUnidad)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.jefesModels = response.Data || [];
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    cargarEmpleadosDisponibles(corrUnidadOrigen: number, corrUnidadDestino: number) {
        if (!corrUnidadOrigen || corrUnidadOrigen === 0 || !corrUnidadDestino || corrUnidadDestino === 0) {
            this.empleadosDisponibles = [];
            return;
        }

        this.jefeService
            .getEmpleadosByUnidad(corrUnidadOrigen, corrUnidadDestino)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.empleadosDisponibles = response.Data || [];
                        // Actualizar combo
                        this.actualizarItemComboJefe('CORR_EMPLEADO', this.empleadosDisponibles);
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    onFiltroUnidadJefeChanged(corrUnidad: number) {
        this.filtroUnidadJefe = corrUnidad;
        this.jefeModel.CORR_EMPLEADO = 0;
        this.cargarEmpleadosDisponibles(this.unidadModel.CORR_UNIDAD,corrUnidad );
    }

    nuevoJefe(): void {
        this.jefeModel = this.fillJefeData();
        this.jefeModel.CORR_UNIDAD = this.unidadModel.CORR_UNIDAD;
        this.jefeModel.FECHA_INICIO = new Date();
        this.filtroUnidadJefe = this.unidadModel.CORR_UNIDAD;
        this.banderaMttoJefe = UpdateType.Add;
        this.jefeReadOnly = false;
        this.habilitarJefe();
        this.cargarEmpleadosDisponibles(this.filtroUnidadJefe, this.unidadModel.CORR_UNIDAD);
    }

    guardarJefe(): void {
        if (!this.jefeService.esValido(this.jefeModel, this.notifyFx)) {
            return;
        }

        this.loadingVisible = true;
        this.jefeModel.CORR_UNIDAD = this.unidadModel.CORR_UNIDAD;

        if (this.banderaMttoJefe === UpdateType.Add) {
            this.jefeService
                .insert(this.jefeModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.jefesModels.push(response.Data);
                            this.jefeModel = this.fillJefeData(response.Data);
                            this.banderaMttoJefe = UpdateType.Browse;
                            this.jefeReadOnly = false;
                            this.notifyFx('Jefe asignado con exito!', NotifyType.Success);
                            this.cargarJefes(this.unidadModel.CORR_UNIDAD);
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
        } else if (this.banderaMttoJefe === UpdateType.Update) {
            this.jefeService
                .update(this.jefeModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            const vIndex = this.jefesModels.findIndex(
                                (item: any) => item.CORR_JEFE === response.Data.CORR_JEFE
                            );
                            this.jefesModels[vIndex] = response.Data;
                            this.jefeModel = this.fillJefeData(response.Data);
                            this.banderaMttoJefe = UpdateType.Browse;
                            this.jefeReadOnly = false;
                            this.notifyFx('Jefe actualizado con exito!', NotifyType.Success);
                            this.cargarJefes(this.unidadModel.CORR_UNIDAD);
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

    editarJefe(data: any): void {
        const jefe = data?.data || data;
        if (!jefe || !jefe.CORR_JEFE) return;

        this.jefeModel = this.fillJefeData(jefe);
        this.banderaMttoJefe = UpdateType.Update;
        this.jefeReadOnly = false;
        this.habilitarJefe();
        this.filtroUnidadJefe = this.unidadModel.CORR_UNIDAD;
        this.cargarEmpleadosDisponibles(this.filtroUnidadJefe, this.unidadModel.CORR_UNIDAD);
    }

    eliminarJefe(e: any): void {
        if (!e.data) return;

        this.jefeService
            .delete(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Jefe removido con exito!', NotifyType.Success);
                        this.cargarJefes(this.unidadModel.CORR_UNIDAD);
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

    cancelarJefe(): void {
        this.banderaMttoJefe = UpdateType.Browse;
        this.jefeReadOnly = false;
        this.jefeModel = this.fillJefeData();
    }

    rowDblClickJefe(e: any): void {
        if (e && e.data) {
            this.editarJefe(e.data);
        }
    }

    isJefeBrowse(): boolean {
        return this.banderaMttoJefe === UpdateType.Browse;
    }

    isJefeForm(): boolean {
        return this.banderaMttoJefe === UpdateType.Add || this.banderaMttoJefe === UpdateType.Update;
    }

    get getPermiteAddJefe(): boolean {
        return this.permiteAdd && this.unidadModel?.CORR_UNIDAD > 0;
    }

    get getPermiteEditarJefe(): boolean {
        return this.permiteEdit;
    }

    get getPermiteDeleJefe(): boolean {
        return this.permiteDele;
    }

    bloquearJefe(): void {
        this.jefeReadOnly = true;
    }

    habilitarJefe(): void {
        this.jefeReadOnly = false;
    }

    actualizarItemComboJefe(dataField: string, dataSource: any[]) {
        const item = this.jefesItems?.find((i: any) => i.dataField === dataField);
        if (item && item.editorOptions) {
            item.editorOptions.dataSource = dataSource;
        }
    }
    //#endregion
    cargarUnidadesPadre() {
        this.unidadesPadre = this.unidades.filter(u => u.ACTIVO === true);
        this.actualizarCombos();
    }

    actualizarCombos() {
        this.actualizarItemCombo('CORR_NIVEL', this.nivelesActivos);
        this.actualizarItemCombo('CORR_UNIDAD_PADRE', this.unidadesPadre);
    }

    actualizarItemCombo(dataField: string, dataSource: any[]) {
        const item = this.items?.find((i: any) => i.dataField === dataField);
        if (item && item.editorOptions) {
            item.editorOptions.dataSource = dataSource;
        }
    }

    refrescarTreeView() {
        setTimeout(() => {
            if (this.treeView?.instance) {
                this.treeView.instance.option('dataSource', this.unidades);
                this.treeView.instance.expandAll();
            }
        });
    }
    //#endregion

    //#region <Metodos de Unidad>
    onUnidadSeleccionada(event: any) {
        if (event?.itemData) {
            this.unidadSeleccionada = event.itemData;
            this.unidadModel = this.fillUnidadData(this.unidadSeleccionada ?? undefined);
            this.unidadModelUpdate = this.fillUnidadData(this.unidadSeleccionada ?? undefined);
            this.mostrarFormulario = true;
            this.AsignaStatus(UpdateType.Update);
            this.habilitar();

            //  Cargar jefes de la unidad seleccionada
            this.cargarJefes(this.unidadModel.CORR_UNIDAD);
            this.filtroUnidadJefe = this.unidadModel.CORR_UNIDAD;

            setTimeout(() => {
                this.dataForm?.instance?.getEditor('CODIGO_UNIDAD')?.focus();
            });
        }
    }
    override nuevo(): void {
        this.unidadModel = this.fillUnidadData();
        this.unidadModel.CORR_EMPRESA = this.appInfoService.CORR_EMPRESA;
        this.mostrarFormulario = true;
        this.AsignaStatus(UpdateType.Add);
        this.habilitar();

        //  Limpiar jefes
        this.jefesModels = [];
        this.jefeModel = this.fillJefeData();
        this.banderaMttoJefe = UpdateType.Browse;
        this.empleadosDisponibles = [];

        setTimeout(() => {
            this.dataForm?.instance?.getEditor('CODIGO_UNIDAD')?.focus();
        });
    }

    override editarClick(e: any): void {
        const unidad = e?.data || e;
        if (!unidad) return;

        this.unidadModel = this.fillUnidadData(unidad);
        this.unidadModelUpdate = this.fillUnidadData(unidad);
        this.mostrarFormulario = true;
        this.AsignaStatus(UpdateType.Update);
        this.habilitar();
        setTimeout(() => {
            this.dataForm?.instance?.getEditor('CODIGO_UNIDAD')?.focus();
        });
    }

    guardar(): void {


        this.loadingVisible = true;
        if (this.banderaMtto === UpdateType.Add) {
            this.service
                .insert(this.unidadModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.unidadSeleccionada = response.Data;
                            this.unidadModel = this.fillUnidadData(response.Data);
                            this.unidadModelUpdate = this.fillUnidadData(response.Data);
                            this.mostrarFormulario = false;
                            this.cargarUnidades();
                            this.AsignaStatus(UpdateType.Browse);
                            this.notifyFx('Unidad creada con exito!', NotifyType.Success);
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
                .update(this.unidadModel)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.unidadSeleccionada = response.Data;
                            this.unidadModel = this.fillUnidadData(response.Data);
                            this.unidadModelUpdate = this.fillUnidadData(response.Data);
                            this.mostrarFormulario = false;
                            this.cargarUnidades();
                            this.AsignaStatus(UpdateType.Browse);
                            this.notifyFx('Unidad modificada con exito!', NotifyType.Success);
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
        this.cancelarUnidadGestion();
    }

    cancelarUnidadGestion(): void {
        if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
            this.confirmaCancelar(() => {
                if (this.unidadModelUpdate && this.unidadModelUpdate.CORR_UNIDAD > 0) {
                    this.unidadModel = this.fillUnidadData(this.unidadModelUpdate);
                } else {
                    this.unidadModel = this.fillUnidadData();
                }
                this.AsignaStatus(UpdateType.Browse);
                this.mostrarFormulario = false;

                //  Limpiar jefes
                this.jefesModels = [];
                this.jefeModel = this.fillJefeData();
                this.banderaMttoJefe = UpdateType.Browse;
                this.empleadosDisponibles = [];
            });
        } else {
            this.mostrarFormulario = false;
            this.jefesModels = [];
            this.jefeModel = this.fillJefeData();
            this.banderaMttoJefe = UpdateType.Browse;
            this.empleadosDisponibles = [];
        }
    }
    override bloquear(): void {
        this.dataForm?.instance?.getEditor('CODIGO_UNIDAD')?.option('readOnly', true);
        this.dataForm?.instance?.getEditor('NOMBRE_UNIDAD')?.option('readOnly', true);
        this.dataForm?.instance?.getEditor('CORR_NIVEL')?.option('readOnly', true);
        this.dataForm?.instance?.getEditor('CORR_UNIDAD_PADRE')?.option('readOnly', true);
        this.dataForm?.instance?.getEditor('ACTIVO')?.option('disabled', true);
    }

    override habilitar(): void {
        this.dataForm?.instance?.getEditor('CODIGO_UNIDAD')?.option('readOnly', false);
        this.dataForm?.instance?.getEditor('NOMBRE_UNIDAD')?.option('readOnly', false);
        this.dataForm?.instance?.getEditor('CORR_NIVEL')?.option('readOnly', false);
        this.dataForm?.instance?.getEditor('CORR_UNIDAD_PADRE')?.option('readOnly', false);
        this.dataForm?.instance?.getEditor('ACTIVO')?.option('disabled', false);
    }

    override setFocus() {
        setTimeout(() => {
            this.dataForm?.instance?.getEditor('CODIGO_UNIDAD')?.focus();
        });
    }

    selectedLookUpCORR_NIVEL(vRow: any): any {
        return vRow[0].CORR_NIVEL;
    }
    selectedLookUpCORR_UNIDAD(vRow: any): any {
        return vRow[0].CORR_UNIDAD;
    }
    selectedLookUpEMPLEADO(vRow: any): any {
    return vRow[0]?.CORR_EMPLEADO;
}
    //#endregion
}