import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { getApiErrorMessage } from 'src/app/shared/mtto/mtto-api-messages';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AcaTiposPracticaService } from './aca-tipos-practica.service';
import { TipoPractica } from './models/tipo-practica';
import { AcaAsignaturasService } from '../aca-asignaturas/aca-asignaturas.service';
import { CarreraAsignatura } from '../aca-asignaturas/models/asignatura';
import { MateriaPractica } from '../aca-asignaturas/models/asignatura-practica';
@Component({ selector: 'app-aca-tipos-practica', templateUrl: './aca-tipos-practica.component.html', styleUrls: ['./aca-tipos-practica.component.scss'] })
export class AcaTiposPracticaComponent extends CBaseComponent implements OnInit, OnDestroy {
    @Output() editorChanged = new EventEmitter<boolean>();
    @ViewChild('formulario')
    formulario?: DxFormComponent;
    rows: TipoPractica[] = [];
    tiposActivos: TipoPractica[] = [];
    draft: TipoPractica | null = null;
    busy = false;
    asignando = false;
    revisando = false;
    puedeAsignar = false;
    filtrosAsignacion: { facultad: number | null; carrera: number | null; tipo: number | null } = { facultad: null, carrera: null, tipo: null };
    carreras: CarreraAsignatura[] = [];
    facultades: { id: number; nombre: string }[] = [];
    carrerasAsignacion: CarreraAsignatura[] = [];
    materias: MateriaPractica[] = [];
    estadoConsulta: 'pendiente' | 'cargando' | 'completa' | 'error' = 'pendiente';
    seleccion: number[] = [];
    revision: MateriaPractica[] = [];
    private readonly destroy$ = new Subject<void>();
    private alive = true;
    constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute, private service: AcaTiposPracticaService, private asignaturasService: AcaAsignaturasService) { super(appInfoService, router); }
    ngOnInit(): void { this.getPermisos(this.appInfoService.getPermiso('/aca-tipos-practica') ?? ''); this.puedeAsignar = (this.appInfoService.getPermiso('/aca-asignaturas') ?? '').includes('U'); this.cargar(); }
    ngOnDestroy(): void { this.alive = false; this.destroy$.next(); this.destroy$.complete(); }
    cargar(): void {
        if (this.busy)
            return;
        this.busy = true;
        this.service.getAll().pipe(takeUntil(this.destroy$), finalize(() => this.busy = false)).subscribe({
            next: r => { if (r.Result) {
                this.rows = r.Data; this.tiposActivos = this.rows.filter(t => t.ACTIVO); }
            else
                this.error(r); }, error: e => this.error(e)
        });
    }
    nuevo(): void { if (!this.permiteAdd || this.busy)
        return; this.draft = { CORR_TIPO_PRACTICA: 0, CODIGO_TIPO: '', NOMBRE_TIPO: '', HABILITA_COBROS_ADICIONALES: true, ACTIVO: true }; this.permiteSalir = false; this.editorChanged.emit(true); }
    editar(row: TipoPractica): void { if (!this.permiteEdit || this.busy)
        return; this.draft = { ...row }; this.permiteSalir = false; this.editorChanged.emit(true); }
    cancelar(): void { if (this.busy)
        return; this.draft = null; this.permiteSalir = true; this.editorChanged.emit(false); }
    guardar(): void {
        if (!this.draft || this.busy || !(this.draft.CORR_TIPO_PRACTICA ? this.permiteEdit : this.permiteAdd))
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
                this.permiteSalir = true; this.editorChanged.emit(false);
                recargar = true;
                this.notifyFx('Tipo de práctica guardado.', NotifyType.Success);
            }, error: e => this.error(e) });
    }
    abrirAsignacion(): void {
        if (!this.puedeAsignar || this.busy || this.draft) return;
        this.asignando = true; this.revisando = false; this.filtrosAsignacion = { facultad: null, carrera: null, tipo: null };
        this.materias = []; this.seleccion = []; this.revision = []; this.carrerasAsignacion = [];
        this.estadoConsulta = 'pendiente';
        this.permiteSalir = false; this.editorChanged.emit(true); this.busy = true;
        this.asignaturasService.carreras().pipe(takeUntil(this.destroy$), finalize(() => this.busy = false)).subscribe({
            next: r => {
                if (!r.Result) { this.error(r); return; }
                this.carreras = (r.Data as CarreraAsignatura[]).filter(c => c.ACTIVO);
                this.facultades = Array.from(new Map(this.carreras.map(c => [c.CORR_FACULTAD, c.NOMBRE_FACULTAD])), ([id, nombre]) => ({ id, nombre }));
            }, error: e => this.error(e)
        });
    }
    cerrarAsignacion(): void {
        if (this.busy) return;
        this.asignando = false; this.revisando = false; this.materias = []; this.seleccion = []; this.revision = [];
        this.permiteSalir = true; this.editorChanged.emit(false);
    }
    cambiarFacultadAsignacion = (e: { value: number | null }): void => {
        this.filtrosAsignacion.facultad = e.value; this.filtrosAsignacion.carrera = null;
        this.carrerasAsignacion = this.carreras.filter(c => c.CORR_FACULTAD === e.value); this.limpiarSeleccion(); this.materias = [];
        this.estadoConsulta = 'pendiente';
    };
    cambiarCarreraAsignacion = (): void => { this.limpiarSeleccion(); this.materias = []; this.estadoConsulta = 'pendiente'; };
    cambiarTipoAsignacion = (): void => { this.limpiarSeleccion(); };
    private limpiarSeleccion(): void { this.seleccion = []; this.revision = []; this.revisando = false; }
    get tipoAsignado(): TipoPractica | undefined { return this.rows.find(t => t.CORR_TIPO_PRACTICA === this.filtrosAsignacion.tipo); }
    get reemplazos(): number { return this.revision.filter(m => m.CORR_TIPO_PRACTICA != null && m.CORR_TIPO_PRACTICA !== this.filtrosAsignacion.tipo).length; }
    get facultadAsignacionNombre(): string { return this.facultades.find(f => f.id === this.filtrosAsignacion.facultad)?.nombre ?? ''; }
    get carreraAsignacionNombre(): string { return this.carreras.find(c => c.CORR_CARRERA === this.filtrosAsignacion.carrera)?.NOMBRE_CARRERA ?? ''; }
    get materiasDisponibles(): number { return this.filtrosAsignacion.tipo ? this.materias.filter(m => m.ACTIVO && !m.EN_USO && m.CORR_TIPO_PRACTICA !== this.filtrosAsignacion.tipo).length : 0; }
    motivoMateria = (m: MateriaPractica): string => !m.ACTIVO ? 'Inactiva' : m.EN_USO ? 'Plan en uso: protegida' : m.CORR_TIPO_PRACTICA === this.filtrosAsignacion.tipo ? 'Ya tiene este tipo' : 'Disponible';
    listarMaterias(): void {
        const { facultad, carrera } = this.filtrosAsignacion;
        if (this.busy || !facultad || !carrera) return;
        this.limpiarSeleccion(); this.materias = []; this.busy = true;
        this.estadoConsulta = 'cargando';
        this.asignaturasService.materiasPractica(facultad, carrera).pipe(takeUntil(this.destroy$), finalize(() => this.busy = false)).subscribe({
            next: r => {
                if (r.Result) { this.materias = r.Data; this.estadoConsulta = 'completa'; }
                else { this.estadoConsulta = 'error'; this.error(r); }
            }, error: e => { this.estadoConsulta = 'error'; this.error(e); }
        });
    }
    seleccionarMaterias(e: { selectedRowKeys: number[] }): void {
        this.seleccion = e.selectedRowKeys.filter(id => this.materias.some(m => m.CORR_ASIGNATURA === id && m.ACTIVO && !m.EN_USO && m.CORR_TIPO_PRACTICA !== this.filtrosAsignacion.tipo));
    }
    revisarAsignacion(): void {
        if (this.busy || !this.puedeAsignar || !this.tipoAsignado?.ACTIVO || !this.seleccion.length) return;
        if (this.seleccion.length > 500) { this.notifyFx('Seleccione como máximo 500 materias por operación.', NotifyType.Warning); return; }
        this.revision = this.materias.filter(m => this.seleccion.includes(m.CORR_ASIGNATURA)).map(m => ({ ...m })); this.revisando = true;
    }
    guardarAsignacion(): void {
        const tipo = this.tipoAsignado, { facultad, carrera } = this.filtrosAsignacion;
        if (this.busy || !this.puedeAsignar || !this.revisando || !facultad || !carrera || !tipo?.VERSION || !this.revision.length) return;
        this.busy = true; let guardado = false;
        this.asignaturasService.asignarPractica({ CORR_FACULTAD: facultad, CORR_CARRERA: carrera, CORR_TIPO_PRACTICA: tipo.CORR_TIPO_PRACTICA,
            VERSION_TIPO: tipo.VERSION, CONFIRMAR_REEMPLAZOS: this.reemplazos > 0,
            ASIGNATURAS: this.revision.map(m => ({ CORR_ASIGNATURA: m.CORR_ASIGNATURA, VERSION: m.VERSION }))
        }).pipe(takeUntil(this.destroy$), finalize(() => { this.busy = false; if (guardado && this.alive) { this.cerrarAsignacion(); this.cargar(); } })).subscribe({
            next: r => { if (!r.Result) { this.error(r); return; } guardado = true; this.notifyFx(`Tipo de práctica asignado a ${r.RowsAffected} materia(s).`, NotifyType.Success); }, error: e => this.error(e)
        });
    }
    private error(e: unknown): void { this.notifyFx(getApiErrorMessage(e), NotifyType.Warning); }
}
