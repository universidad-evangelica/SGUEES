import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { AcaCarrera, CatalogoCarrera } from './models/aca-carreras';
import { AcaCarrerasService } from './aca-carreras.service';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { AcaCarreraSede, SedeCarreraLookup } from './models/aca-carreras-sedes';
import { AcaCarrerasSedesService } from './sedes/aca-carreras-sedes.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { IResult } from 'src/app/FxAPI/IResult';

@Component({ selector: 'app-aca-carreras', templateUrl: './aca-carreras.component.html', styleUrls: ['./aca-carreras.component.scss'] })
export class AcaCarrerasComponent extends CBaseComponent implements OnInit {
    //#region <Declarando Variables>
    protected override etiquetaRegistro = 'la carrera';
    protected override requiereEmpresaSesion = true;
    protected override mttoGridKeyExpr = 'CORR_CARRERA';
    protected override mttoCampoEstado = 'ACTIVO';
    protected override mttoEstadoDescribeField = 'NOMBRE_CARRERA';
    readOnly = false;
    @ViewChild(DataGridMttoComponent) private grid?: DataGridMttoComponent;
    private areas: CatalogoCarrera[] = [];
    private facultades: CatalogoCarrera[] = [];
    private grados: CatalogoCarrera[] = [];
    private readonly catalogosVisibles = new Map<CatalogoCarrera[], { current: number | null; rows: CatalogoCarrera[] }>();
    tabSeleccionada = 0;
    actualizarDecano():void {this.model.NOMBRE_DECANO=this.facultades.find(f=>f.Key===this.model?.CORR_FACULTAD)?.NOMBRE_DECANO || 'Sin decano asignado';}
    sedes: AcaCarreraSede[] = [];
    sedesDisponibles: SedeCarreraLookup[] = [];
    sedeParaAsociar: number | null = null;
    sedeSeleccionada: AcaCarreraSede | null = null;
    sedesSeleccionadas: Array<{ CORR_CARRERA: number; CORR_SEDE: number }> = [];
    cargandoSedes = false;
    sedesCargadas = false;
    private solicitudSedes = 0;
    readonly sedesKey = ['CORR_CARRERA', 'CORR_SEDE'];
    sedesColumns: any[] = [];
    readonly sedeLookupColumns = [
        { dataField: 'Value', caption: 'Sede', width: 220 },
        { dataField: 'MOTIVO', caption: 'Disponibilidad', width: 390 },
    ];
    get cambiosGeneralesPendientes(): boolean {
        if (!this.isForm() || !this.model?.CORR_CARRERA) return false;
        return ['CODIGO_CARRERA', 'NOMBRE_CARRERA', 'CORR_AREA_ACADEMICA', 'CORR_FACULTAD', 'CORR_GRADO_ACADEMICO','MAX_REPETICIONES','CREDITOS_REQUERIDOS','NOTA_MINIMA']
            .some(key => this.model[key] !== this.modelUpdate?.[key]);
    }
    get puedeModificarSedes(): boolean {
        return !!this.model?.CORR_CARRERA && this.sedesCargadas && !this.cargandoSedes && !this.cambiosGeneralesPendientes;
    }
    get areasDisponibles() { return this.disponibles(this.areas, this.model?.CORR_AREA_ACADEMICA); }
    get facultadesDisponibles() { return this.disponibles(this.facultades, this.model?.CORR_FACULTAD); }
    get gradosDisponibles() { return this.disponibles(this.grados, this.model?.CORR_GRADO_ACADEMICO); }
    //#endregion

    //#region <Inicializando Opciones>
    constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute,
        private service: AcaCarrerasService, private sedesService: AcaCarrerasSedesService) {
        super(appInfoService, router);
        this.columns = service.getColumns();
        this.summary = service.getSummary();
        this.items = service.getItems();
        this.sedesColumns = sedesService.getColumns();
    }
    ngOnInit(): void {
        this.subTituloVentana = 'Catálogo de carreras';
        this.llenaComboBox();
        this.consultar();
    }
    //#endregion

    //#region <Manejo de Combos>
    llenaComboBox(): void {
        const lookup = (controller: string, field: string) => this.appInfoService.getLookUp(
            'ACA_CARRERAS', controller, 'Get' + field, undefined, environment.UrlGENERALAPI);
        forkJoin([
            lookup('ACA_AREAS_ACADEMICAS', 'CORR_AREA_ACADEMICA'),
            lookup('ACA_FACULTADES', 'CORR_FACULTAD'),
            lookup('ACA_GRADOS_ACADEMICOS', 'CORR_GRADO_ACADEMICO'),
        ]).pipe(take(1)).subscribe({
            next: ([areas, facultades, grados]) => {
                if (!areas.Result || !facultades.Result || !grados.Result) {
                    this.notifyApiResponse([areas, facultades, grados].find(x => !x.Result));
                    return;
                }
                this.areas = areas.Data as CatalogoCarrera[];
                this.facultades = facultades.Data as CatalogoCarrera[];
                this.actualizarDecano();
                this.grados = grados.Data as CatalogoCarrera[];
            },
            error: error => this.notifyApiError(error),
        });
    }
    private disponibles(rows: CatalogoCarrera[], current: number | null): CatalogoCarrera[] {
        const cached = this.catalogosVisibles.get(rows);
        if (cached?.current === current) return cached.rows;
        const visible = rows.filter(x => x.ACTIVO || x.Key === current);
        this.catalogosVisibles.set(rows, { current, rows: visible });
        return visible;
    }
    //#endregion

    //#region <Metodos Mtto>
    protected override getMttoDataGrid(): DataGridMttoComponent | null {
        return this.grid ?? null;
    }
    override fillData(row?: AcaCarrera): AcaCarrera {
        return row ? { ...row } : {
            CORR_CARRERA: 0, CORR_EMPRESA: 0, CODIGO_CARRERA: '', NOMBRE_CARRERA: '',
            CORR_AREA_ACADEMICA: null, CORR_FACULTAD: null, CORR_GRADO_ACADEMICO: null, ACTIVO: true,
            MAX_REPETICIONES:3,CREDITOS_REQUERIDOS:null,NOTA_MINIMA:6,NOMBRE_DECANO:'Sin decano asignado',
        };
    }
    consultar(): void {
        const carrera = Number(this.router.snapshot.queryParamMap.get('carrera'));
        this.consultarMtto({ load: () => this.service.getAll(), onData: (data: AcaCarrera[]) => {
            if(!this.enlaceAtendido && this.router.snapshot.queryParamMap.get('nueva')==='1') {
                this.enlaceAtendido=true;
                if(this.permiteAdd){this.nuevo();this.model.CORR_FACULTAD=Number(this.router.snapshot.queryParamMap.get('facultad'))||null;this.actualizarDecano();}
                return;
            }
            if (!this.enlaceAtendido && Number.isInteger(carrera) && carrera > 0) {
                this.enlaceAtendido = true;
                const row = data.find(c => c.CORR_CARRERA === carrera);
                if (!row) { this.notifyFx('La carrera solicitada no está disponible en su empresa.', NotifyType.Warning); return; }
                this.rowDblClick({ data: row });
                this.tabSeleccionada = this.router.snapshot.queryParamMap.get('seccion') === 'planes' ? 2 : 0;
            }
        } });
    }
    private enlaceAtendido = false;
    override nuevo(): void {
        if (!this.asegurarEmpresaSesion()) return;
        super.nuevo();
        this.reiniciarSedes();
    }
    override editarClick(e: any): void {
        super.editarClick(e);
        this.tabSeleccionada = 0;
        this.cargarSedes();
    }
    override rowDblClick(e: any): void {
        super.rowDblClick(e);
        this.tabSeleccionada = 0;
        this.cargarSedes();
    }
    private reiniciarSedes(): void {
        this.solicitudSedes++;
        this.tabSeleccionada = 0;
        this.sedes = [];
        this.sedesDisponibles = [];
        this.sedeSeleccionada = null;
        this.sedesSeleccionadas = [];
        this.sedeParaAsociar = null;
        this.cargandoSedes = false;
        this.sedesCargadas = false;
    }
    cargarSedes(): void {
        const carrera = Number(this.model?.CORR_CARRERA);
        const tab = this.tabSeleccionada;
        this.reiniciarSedes();
        this.tabSeleccionada = tab;
        if (!carrera) return;
        const solicitud = this.solicitudSedes;
        this.cargandoSedes = true;
        forkJoin([
            this.sedesService.getAll(carrera),
            this.appInfoService.getLookUp('ACA_CARRERAS', 'GEN_SEDES', 'GetCORR_SEDE',
                [{ Parameter: 'CORR_CARRERA', Value: carrera }], environment.UrlGENERALAPI),
        ]).pipe(take(1), finalize(() => {
            if (solicitud === this.solicitudSedes) this.cargandoSedes = false;
        })).subscribe({
            next: ([asociaciones, opciones]) => {
                if (solicitud !== this.solicitudSedes || carrera !== this.model?.CORR_CARRERA) return;
                if (!asociaciones.Result || !opciones.Result) {
                    this.notifyApiResponse(!asociaciones.Result ? asociaciones : opciones);
                    return;
                }
                this.sedes = asociaciones.Data as AcaCarreraSede[];
                this.actualizarResumenSedes();
                this.sedesDisponibles = opciones.Data as SedeCarreraLookup[];
                this.sedesCargadas = true;
            },
            error: error => this.notifyApiError(error),
        });
    }
    seleccionarSede(e: any): void {
        this.sedeSeleccionada = e.selectedRowsData?.[0] ?? null;
        this.sedesSeleccionadas = e.selectedRowKeys ?? [];
    }
    asociarSede(): void {
        if (!this.puedeModificarSedes || !this.permiteAdd) return;
        const sede = Number(this.sedeParaAsociar);
        const opcion = this.sedesDisponibles.find(x => x.Key === sede);
        if (!opcion) {
            this.notifyFx('Seleccione una sede.', NotifyType.Warning);
            return;
        }
        const existente = this.sedes.find(x => x.CORR_SEDE === sede);
        if (existente) {
            if (existente.ACTIVO) this.notifyFx('La sede ya está asociada a esta carrera.', NotifyType.Warning);
            else this.cambiarEstadoSede(existente);
            return;
        }
        if (!opcion.HABILITADA) {
            this.notifyFx(opcion.MOTIVO, NotifyType.Warning, { raw: true });
            return;
        }
        this.ejecutarSede(this.sedesService.create(this.model.CORR_CARRERA, sede));
    }
    cambiarEstadoSede(row: AcaCarreraSede | null = this.sedeSeleccionada): void {
        if (!row || !this.puedeModificarSedes || !this.permiteEdit) return;
        const accion = row.ACTIVO ? 'desactivar' : 'activar';
        this.confirmaAccion('Confirmar cambio de estado',
            '¿Desea ' + accion + ' la sede seleccionada para esta carrera?', () => {
                // Volver a verificar: el usuario pudo cambiar de carrera con el diálogo abierto.
                if (!this.puedeModificarSedes || this.model.CORR_CARRERA !== row.CORR_CARRERA) return;
                this.ejecutarSede(this.sedesService.activarInactivar(row.CORR_CARRERA, row.CORR_SEDE));
            });
    }
    private ejecutarSede(request: Observable<IResult>): void {
        const solicitud = this.solicitudSedes;
        this.cargandoSedes = true;
        request.pipe(take(1), finalize(() => {
            if (solicitud === this.solicitudSedes) this.cargandoSedes = false;
        })).subscribe({
            next: response => {
                if (solicitud !== this.solicitudSedes) return;
                if (!response.Result) { this.notifyApiResponse(response); return; }
                const row = response.Data as AcaCarreraSede;
                if (row.CORR_CARRERA !== this.model.CORR_CARRERA) return;
                const existe = this.sedes.some(x => x.CORR_CARRERA === row.CORR_CARRERA && x.CORR_SEDE === row.CORR_SEDE);
                this.sedes = existe ? this.sedes.map(x => x.CORR_SEDE === row.CORR_SEDE ? row : x) : [...this.sedes, row];
                this.actualizarResumenSedes();
                this.sedeSeleccionada = row;
                this.sedesSeleccionadas = [{ CORR_CARRERA: row.CORR_CARRERA, CORR_SEDE: row.CORR_SEDE }];
                this.sedeParaAsociar = null;
                this.notifyFx('Asociación de sede guardada.', NotifyType.Success);
            },
            error: error => this.notifyApiError(error),
        });
    }
    private actualizarResumenSedes(): void {
        const resumen = this.sedes.filter(x => x.ACTIVO && x.ESTADO_SEDE === 'A')
            .sort((a, b) => a.NOMBRE_SEDE.localeCompare(b.NOMBRE_SEDE, 'es') || a.CORR_SEDE - b.CORR_SEDE)
            .map(x => x.NOMBRE_SEDE).join(', ') || 'Sin sedes activas';
        this.model.SEDES_ACTIVAS = resumen;
        // La asociacion ya se guardo: conservar el resumen al cerrar la ficha sin guardar el encabezado.
        this.modelUpdate.SEDES_ACTIVAS = resumen;
        if (Array.isArray(this.models)) {
            this.models = this.models.map((x: AcaCarrera) => x.CORR_CARRERA === this.model.CORR_CARRERA
                ? { ...x, SEDES_ACTIVAS: resumen } : x);
        }
    }
    guardar(): void {
        this.model.CODIGO_CARRERA = this.model.CODIGO_CARRERA?.trim();
        this.model.NOMBRE_CARRERA = this.model.NOMBRE_CARRERA?.trim();
        this.guardarMtto({
            esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
            insert: () => this.service.insert(this.model),
            update: () => this.service.update(this.model),
        });
    }
    override cancelar(): void {
        super.cancelar((row: AcaCarrera) => row.CORR_CARRERA === this.modelUpdate.CORR_CARRERA);
    }
    rowRemoving(e: any): void {
        this.rowRemovingMtto(e, { deleteFn: () => this.service.delete(e.data.CORR_CARRERA) });
    }
    activar_inactivar(): void {
        this.invocarActivarInactivar(row => this.service.activarInactivar(row));
    }
    override bloquear(): void {
        this.readOnly = true;
        setTimeout(() => this.setEditorsReadOnly(true));
    }
    override habilitar(): void {
        this.readOnly = false;
        setTimeout(() => this.setEditorsReadOnly(false));
    }
    private setEditorsReadOnly(readOnly: boolean): void {
        for(const field of ['MAX_REPETICIONES','CREDITOS_REQUERIDOS','NOTA_MINIMA'])this.dataForm?.instance?.getEditor(field)?.option('readOnly',readOnly);
        this.dataForm?.instance?.getEditor('CODIGO_CARRERA')?.option('readOnly', readOnly);
        this.dataForm?.instance?.getEditor('NOMBRE_CARRERA')?.option('readOnly', readOnly);
        this.dataForm?.instance?.getEditor('CORR_CARRERA')?.option('readOnly', true);
        this.dataForm?.instance?.getEditor('ACTIVO')?.option('readOnly', true);
    }
    override setFocus(): void {
        setTimeout(() => this.dataForm?.instance?.getEditor('CODIGO_CARRERA')?.focus());
    }
    //#endregion
}

