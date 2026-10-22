import { AcaTiposPracticaService } from '../aca-tipos-practica/aca-tipos-practica.service';
import { TipoPractica } from '../aca-tipos-practica/models/tipo-practica';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { getApiErrorMessage } from 'src/app/shared/mtto/mtto-api-messages';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AcaAsignaturasService } from './aca-asignaturas.service';
import { AcaPeriodosCursoService } from '../aca-periodos-curso/aca-periodos-curso.service';
import { PeriodoCurso } from '../aca-periodos-curso/models/periodo-curso';
import { Asignatura, CarreraAsignatura, PlanAsignatura } from './models/asignatura';
@Component({ selector: 'app-aca-asignaturas', templateUrl: './aca-asignaturas.component.html', styleUrls: ['./aca-asignaturas.component.scss'] })
export class AcaAsignaturasComponent extends CBaseComponent implements OnInit, OnDestroy {
    @ViewChild('formulario')
    formulario?: DxFormComponent;
    tab = 0;
    catalogoEditando = false;
    catalogo: 'periodos' | 'practicas' = 'periodos';
    filtroFacultad: number | null = null;
    filtroCarrera: number | null = null;
    facultadesFiltro: { id: number; nombre: string }[] = [];
    carrerasFiltro: CarreraAsignatura[] = [];
    conPlanCount = 0;
    tiposPractica: TipoPractica[] = [];
    tiposDisponibles: TipoPractica[] = [];
    rows: Asignatura[] = [];
    visibles: Asignatura[] = [];
    carreras: CarreraAsignatura[] = [];
    carrerasDisponibles: CarreraAsignatura[] = [];
    facultades: {
        id: number;
        nombre: string;
    }[] = [];
    periodos: PeriodoCurso[] = [];
    periodosDisponibles: PeriodoCurso[] = [];
    draft: Asignatura | null = null;
    busy = false;
    catalogosListos = false;
    filtro = 'TODAS';
    filtros = [{ id: 'TODAS', nombre: 'Todas' }, { id: 'CON', nombre: 'Con plan' }, { id: 'SIN', nombre: 'Sin plan' }];
    planes: PlanAsignatura[] = [];
    asignaturaPlanes: Asignatura | null = null;
    planesVisible = false;
    private readonly destroy$ = new Subject<void>();
    private alive = true;
    constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute, private service: AcaAsignaturasService, private periodosService: AcaPeriodosCursoService, private tiposService: AcaTiposPracticaService) { super(appInfoService, router); }
    ngOnInit(): void {
        const catalogo = this.router.snapshot.queryParamMap.get('catalogo');
        this.tab = catalogo === 'periodos' || catalogo === 'practicas' ? 1 : 0;
        this.catalogo = catalogo === 'practicas' ? 'practicas' : 'periodos';
        this.cargar();
    }
    ngOnDestroy(): void { this.alive = false; this.destroy$.next(); this.destroy$.complete(); }
    cargar(): void {
        if (this.busy)
            return;
        this.busy = true;
        this.catalogosListos = false;
        forkJoin([this.service.getAll(), this.service.carreras(), this.periodosService.getAll(), this.tiposService.getAll()]).pipe(takeUntil(this.destroy$), finalize(() => this.busy = false)).subscribe({ next: ([a, c, p, t]) => {
                const error = [a, c, p, t].find(r => !r.Result);
                if (error) {
                    this.error(error);
                    return;
                }
                this.rows = a.Data;
                this.carreras = c.Data;
                this.facultadesFiltro = Array.from(new Map(this.carreras.map(carrera => [carrera.CORR_FACULTAD, carrera.NOMBRE_FACULTAD])), ([id, nombre]) => ({ id, nombre }));
                this.carrerasFiltro = this.carreras.filter(carrera => !this.filtroFacultad || carrera.CORR_FACULTAD === this.filtroFacultad);
                this.conPlanCount = this.rows.filter(row => (row.CANTIDAD_PLANES ?? 0) > 0).length;
                this.periodos = p.Data;
                this.tiposPractica = t.Data;
                this.catalogosListos = true;
                this.filtrar();
            }, error: e => this.error(e) });
    }
    filtrar(): void {
        this.visibles = this.rows.filter(r => (!this.filtroFacultad || r.CORR_FACULTAD === this.filtroFacultad)
            && (!this.filtroCarrera || r.CORR_CARRERA === this.filtroCarrera)
            && (this.filtro === 'TODAS' || (this.filtro === 'CON' ? (r.CANTIDAD_PLANES ?? 0) > 0 : (r.CANTIDAD_PLANES ?? 0) === 0)));
    }
    filtrarFacultad(): void {
        this.filtroCarrera = null;
        this.carrerasFiltro = this.carreras.filter(carrera => !this.filtroFacultad || carrera.CORR_FACULTAD === this.filtroFacultad);
        this.filtrar();
    }
    limpiarFiltros(): void { this.filtroFacultad = null; this.filtroCarrera = null; this.filtro = 'TODAS'; this.carrerasFiltro = this.carreras; this.filtrar(); }
    nuevo(): void {
        if (!this.permiteAdd || this.busy || !this.catalogosListos)
            return;
        const d = new Date();
        const fecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        this.draft = { CORR_ASIGNATURA: 0, CORR_CARRERA: null, CORR_FACULTAD: null, CODIGO_ASIGNATURA: '', ALIAS: null, NOMBRE_ASIGNATURA: '', UNIDADES_VALORATIVAS: null, FECHA_APERTURA: fecha, CORR_PERIODO_CURSO: null, ACTIVO: true };
        this.prepararEditor();
    }
    editar(row: Asignatura): void { if (!this.permiteEdit || this.busy || !this.catalogosListos)
        return; this.draft = { ...row }; this.prepararEditor(); }
    private prepararEditor(): void {
        if (!this.draft)
            return;
        this.permiteSalir = false;
        const mapa = new Map<number, string>();
        this.carreras.filter(c => c.ACTIVO || c.CORR_CARRERA === this.draft!.CORR_CARRERA).forEach(c => mapa.set(c.CORR_FACULTAD, c.NOMBRE_FACULTAD));
        this.facultades = Array.from(mapa, ([id, nombre]) => ({ id, nombre }));
        this.periodosDisponibles = this.periodos.filter(p => p.ACTIVO || p.CORR_PERIODO_CURSO === this.draft!.CORR_PERIODO_CURSO);
        this.tiposDisponibles=this.tiposPractica.filter(t=>t.ACTIVO||t.CORR_TIPO_PRACTICA===this.draft!.CORR_TIPO_PRACTICA);
        this.actualizarCarreras();
    }
    cambioFacultad = (e: {
        value: number | null;
    }): void => {
        if (!this.draft)
            return;
        this.draft.CORR_FACULTAD = e.value;
        if (this.carreras.find(c => c.CORR_CARRERA === this.draft!.CORR_CARRERA)?.CORR_FACULTAD !== e.value)
            this.draft.CORR_CARRERA = null;
        this.actualizarCarreras();
    };
    private actualizarCarreras(): void { this.carrerasDisponibles = this.carreras.filter(c => c.CORR_FACULTAD === this.draft?.CORR_FACULTAD && (c.ACTIVO || c.CORR_CARRERA === this.draft?.CORR_CARRERA)); }
    cancelar(): void { if (this.busy)
        return; this.draft = null; this.permiteSalir = true; }
    guardar(): void {
        if (!this.draft || this.busy || !(this.draft.CORR_ASIGNATURA ? this.permiteEdit : this.permiteAdd))
            return;
        if (!this.formulario?.instance.validate().isValid)
            return;
        const data = this.service.normalizar(this.draft), error = this.service.validar(data);
        if (error) {
            this.notifyFx(error, NotifyType.Warning);
            return;
        }
        let recargar = false;
        this.busy = true;
        this.service.guardar(data).pipe(takeUntil(this.destroy$), finalize(() => { this.busy = false; if (recargar && this.alive)
            this.cargar(); })).subscribe({ next: r => {
                if (!r.Result) {
                    this.error(r);
                    return;
                }
                this.draft = null;
                this.permiteSalir = true;
                recargar = true;
                this.notifyFx('Asignatura guardada. Puede asociarla a un plan cuando corresponda.', NotifyType.Success);
            }, error: e => this.error(e) });
    }
    verPlanes(row: Asignatura): void {
        if (this.busy || this.draft)
            return;
        this.asignaturaPlanes = row;
        this.planes = [];
        this.planesVisible = true; this.permiteSalir = false;
        this.cargarPlanes();
    }
    private cargarPlanes(): void {
        if (!this.asignaturaPlanes)
            return;
        this.busy = true;
        this.service.planes(this.asignaturaPlanes.CORR_ASIGNATURA).pipe(takeUntil(this.destroy$), finalize(() => this.busy = false)).subscribe({ next: r => { if (r.Result)
                this.planes = r.Data;
            else
                this.error(r); }, error: e => this.error(e) });
    }
    async cambiarPlan(row: PlanAsignatura): Promise<void> {
        if (!this.permiteEdit || this.busy || !this.asignaturaPlanes || row.EN_USO)
            return;
        const asignatura = this.asignaturaPlanes;
        if (!await confirm(`${row.ASOCIADO ? 'Retirar del' : 'Asociar al'} plan ${row.CODIGO_PLAN}?`, 'Planes de la asignatura'))
            return;
        if (!this.alive || this.busy || !this.planesVisible || this.asignaturaPlanes !== asignatura)
            return;
        let recargar = false;
        this.busy = true;
        this.service.guardarPlan({ CORR_ASIGNATURA: asignatura.CORR_ASIGNATURA, CORR_PLAN_ACADEMICO: row.CORR_PLAN_ACADEMICO, ACTIVO: !row.ASOCIADO, VERSION: row.VERSION })
            .pipe(takeUntil(this.destroy$), finalize(() => { this.busy = false; if (recargar && this.alive)
            this.cargarPlanes(); })).subscribe({ next: r => { if (!r.Result) {
                this.error(r);
                return;
            } recargar = true; this.notifyFx('Asociación actualizada.', NotifyType.Success); }, error: e => this.error(e) });
    }
    cerrarPlanes(): void { if (!this.busy) this.planesVisible = false; }
    ocultarPlanes(e: { cancel: boolean }): void {
        if (this.busy) { e.cancel = true; return; }
        this.planesVisible = false; this.asignaturaPlanes = null; this.permiteSalir = true; this.cargar();
    }
    cambiarSeccion(next: number): void {
        if (this.busy || this.draft || this.catalogoEditando || this.planesVisible || this.tab === next) return;
        this.tab = next;
        if (next === 0) this.cargar();
    }
    cambiarCatalogo(next: 'periodos' | 'practicas'): void {
        if (!this.catalogoEditando && !this.busy) this.catalogo = next;
    }
    estadoCatalogo(editando:boolean):void {this.catalogoEditando=editando;this.permiteSalir=!editando;}
    get cobroPractica():string {return this.tiposPractica.find(t=>t.CORR_TIPO_PRACTICA===this.draft?.CORR_TIPO_PRACTICA)?.HABILITA_COBROS_ADICIONALES?'Esta clasificación habilita cobros adicionales. Los importes se configuran por separado.':'Sin cobros adicionales por clasificación de práctica.';}
    private error(e: unknown): void { this.notifyFx(getApiErrorMessage(e), NotifyType.Warning); }
}
