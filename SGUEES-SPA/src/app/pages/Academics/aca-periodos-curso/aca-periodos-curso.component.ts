import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { getApiErrorMessage } from 'src/app/shared/mtto/mtto-api-messages';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AcaPeriodosCursoService } from './aca-periodos-curso.service';
import { PeriodoCurso } from './models/periodo-curso';
@Component({ selector: 'app-aca-periodos-curso', templateUrl: './aca-periodos-curso.component.html', styleUrls: ['./aca-periodos-curso.component.scss'] })
export class AcaPeriodosCursoComponent extends CBaseComponent implements OnInit, OnDestroy {
    @Output() editorChanged = new EventEmitter<boolean>();
    @ViewChild('formulario')
    formulario?: DxFormComponent;
    rows: PeriodoCurso[] = [];
    draft: PeriodoCurso | null = null;
    busy = false;
    private readonly destroy$ = new Subject<void>();
    private alive = true;
    constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute, private service: AcaPeriodosCursoService) { super(appInfoService, router); }
    ngOnInit(): void { this.getPermisos(this.appInfoService.getPermiso('/aca-periodos-curso') ?? ''); this.cargar(); }
    ngOnDestroy(): void { this.alive = false; this.destroy$.next(); this.destroy$.complete(); }
    cargar(): void {
        if (this.busy)
            return;
        this.busy = true;
        this.service.getAll().pipe(takeUntil(this.destroy$), finalize(() => this.busy = false)).subscribe({
            next: r => { if (r.Result)
                this.rows = r.Data;
            else
                this.error(r); }, error: e => this.error(e)
        });
    }
    nuevo(): void { if (!this.permiteAdd || this.busy)
        return; this.draft = { CORR_PERIODO_CURSO: 0, CODIGO_PERIODO: '', NOMBRE_PERIODO: '', DURACION_MESES: 1, ACTIVO: true }; this.permiteSalir = false; this.editorChanged.emit(true); }
    editar(row: PeriodoCurso): void { if (!this.permiteEdit || this.busy)
        return; this.draft = { ...row }; this.permiteSalir = false; this.editorChanged.emit(true); }
    cancelar(): void { if (this.busy)
        return; this.draft = null; this.permiteSalir = true; this.editorChanged.emit(false); }
    guardar(): void {
        if (!this.draft || this.busy || !(this.draft.CORR_PERIODO_CURSO ? this.permiteEdit : this.permiteAdd))
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
                this.notifyFx('Período guardado.', NotifyType.Success);
            }, error: e => this.error(e) });
    }
    private error(e: unknown): void { this.notifyFx(getApiErrorMessage(e), NotifyType.Warning); }
}
