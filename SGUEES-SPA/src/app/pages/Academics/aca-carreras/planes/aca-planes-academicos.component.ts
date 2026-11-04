import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { DxFormComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { forkJoin, Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { IResult } from 'src/app/FxAPI/IResult';
import { SgueesNotificationService } from 'src/app/shared/services/sguees-notification.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { cleanApiMessage, getApiErrorMessage } from 'src/app/shared/mtto/mtto-api-messages';
import { AcaPlanesAcademicosService, ModalidadPlan, PlanAcademico } from './aca-planes-academicos.service';

@Component({ selector: 'app-aca-planes-academicos', templateUrl: './aca-planes-academicos.component.html' })
export class AcaPlanesAcademicosComponent implements OnChanges, OnDestroy {
    @Input() carreraId = 0;
    @Input() bloqueado = false;
    @Input() permiteCrear = false;
    @Input() permiteEditar = false;
    @ViewChild('formPlan') formPlan?: DxFormComponent;
    planes: PlanAcademico[] = [];
    modalidades: ModalidadPlan[] = [];
    seleccionado: PlanAcademico | null = null;
    seleccion: number[] = [];
    columns: any[];
    cargando = false;
    cargado = false;
    editorVisible = false;
    draft: PlanAcademico = this.vacio();
    private solicitud = 0;
    private modalidadesCache?: { source: ModalidadPlan[]; current: number | null; rows: ModalidadPlan[] };
    constructor(private service: AcaPlanesAcademicosService, private notify: SgueesNotificationService) {
        this.columns = service.getColumns();
    }
    get puedeOperar(): boolean { return !!this.carreraId && !this.bloqueado && !this.cargando && this.cargado; }
    get modalidadesDisponibles(): ModalidadPlan[] {
        if (this.modalidadesCache?.source === this.modalidades && this.modalidadesCache.current === this.draft.CORR_MODALIDAD)
            return this.modalidadesCache.rows;
        const rows = this.modalidades.filter(x => x.ACTIVO || x.Key === this.draft.CORR_MODALIDAD);
        this.modalidadesCache = { source: this.modalidades, current: this.draft.CORR_MODALIDAD, rows };
        return rows;
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['carreraId']) { this.editorVisible = false; this.cargar(); }
    }
    ngOnDestroy(): void { this.solicitud++; }
    private vacio(): PlanAcademico {
        return { CORR_PLAN_ACADEMICO: 0, CORR_CARRERA: this.carreraId, CODIGO_PLAN: '', CORR_MODALIDAD: null,
            ANIO_PLAN: new Date().getFullYear(), FECHA_VIGENCIA_INICIO: null, FECHA_VIGENCIA_FIN: null,
            PLAN_VIGENTE: false, EN_USO: false };
    }
    cargar(): void {
        const solicitud = ++this.solicitud;
        this.planes = []; this.modalidades = []; this.seleccion = []; this.seleccionado = null; this.cargado = false;
        this.cargando = false;
        if (!this.carreraId) return;
        this.cargando = true;
        forkJoin([this.service.getAll(this.carreraId), this.service.getModalidades(this.carreraId)])
            .pipe(take(1), finalize(() => { if (solicitud === this.solicitud) this.cargando = false; }))
            .subscribe({ next: ([planes, modalidades]) => {
                if (solicitud !== this.solicitud) return;
                if (!planes.Result || !modalidades.Result) { this.error(!planes.Result ? planes : modalidades); return; }
                this.planes = planes.Data; this.modalidades = modalidades.Data; this.cargado = true;
            }, error: error => this.error(error) });
    }
    seleccionar(e: any): void { this.seleccionado = e.selectedRowsData?.[0] ?? null; this.seleccion = e.selectedRowKeys ?? []; }
    nuevo(): void {
        if (!this.puedeOperar || !this.permiteCrear) return;
        this.draft = this.vacio(); this.editorVisible = true;
    }
    editar(): void {
        if (!this.puedeOperar || !this.permiteEditar || !this.seleccionado) return;
        this.draft = { ...this.seleccionado,
            FECHA_VIGENCIA_INICIO: this.seleccionado.FECHA_VIGENCIA_INICIO?.slice(0, 10) ?? null,
            FECHA_VIGENCIA_FIN: this.seleccionado.FECHA_VIGENCIA_FIN?.slice(0, 10) ?? null };
        this.editorVisible = true;
    }
    guardar(): void {
        if (!this.puedeOperar || (this.draft.CORR_PLAN_ACADEMICO ? !this.permiteEditar : !this.permiteCrear)) return;
        if (!this.formPlan?.instance.validate().isValid) return;
        this.draft.CODIGO_PLAN = this.draft.CODIGO_PLAN.trim();
        if (!this.draft.CODIGO_PLAN) { this.notify.show('Ingrese el código del plan.', NotifyType.Warning); return; }
        if (this.draft.FECHA_VIGENCIA_FIN && this.draft.FECHA_VIGENCIA_INICIO && this.draft.FECHA_VIGENCIA_FIN < this.draft.FECHA_VIGENCIA_INICIO) {
            this.notify.show('La fecha final no puede ser anterior a la inicial.', NotifyType.Warning); return;
        }
        this.ejecutar(this.service.save({ ...this.draft }));
    }
    async cambiarVigencia(): Promise<void> {
        if (!this.puedeOperar || !this.permiteEditar || !this.seleccionado) return;
        const row = this.seleccionado, solicitud = this.solicitud;
        const mensaje = row.PLAN_VIGENTE
            ? '¿Desea quitar la condición de vigente al plan seleccionado? Se conservará su historial.'
            : '¿Desea marcar este plan como vigente? Se validarán sus fechas y no se desactivarán otros planes.';
        if (await confirm(mensaje, 'Confirmar vigencia del plan')) {
            if (solicitud === this.solicitud && this.puedeOperar && this.permiteEditar) this.ejecutar(this.service.cambiarVigencia(row));
        }
    }
    private ejecutar(request: Observable<IResult>): void {
        const solicitud = this.solicitud;
        this.cargando = true;
        request.pipe(take(1), finalize(() => { if (solicitud === this.solicitud) this.cargando = false; })).subscribe({
            next: response => {
                if (solicitud !== this.solicitud) return;
                if (!response.Result) { this.error(response); return; }
                const row = response.Data as PlanAcademico;
                if (row.CORR_CARRERA !== this.carreraId) return;
                this.planes = this.planes.some(x => x.CORR_PLAN_ACADEMICO === row.CORR_PLAN_ACADEMICO)
                    ? this.planes.map(x => x.CORR_PLAN_ACADEMICO === row.CORR_PLAN_ACADEMICO ? row : x) : [...this.planes, row];
                this.seleccionado = row; this.seleccion = [row.CORR_PLAN_ACADEMICO]; this.editorVisible = false;
                this.notify.show('Plan académico guardado.', NotifyType.Success);
            }, error: error => this.error(error),
        });
    }
    private error(error: any): void {
        this.notify.show(cleanApiMessage(error?.ErrorMessage || getApiErrorMessage(error)), NotifyType.Error);
    }
}
