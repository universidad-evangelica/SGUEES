import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular';
import { take, finalize } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AcaPeriodosAcademicosService, PeriodoCatalogo } from './aca-periodos-academicos.service';

@Component({ selector: 'app-aca-periodos-academicos', templateUrl: './aca-periodos-academicos.component.html' })
export class AcaPeriodosAcademicosComponent extends CBaseComponent implements OnInit {
    protected override etiquetaRegistro = 'el período';
    protected override requiereEmpresaSesion = true;
    protected override mttoGridKeyExpr = 'CORR_PERIODO_ACADEMICO';
    protected override mttoCampoEstado = 'ACTIVO';
    protected override mttoEstadoDescribeField = 'ANIO';
    @ViewChild(DataGridMttoComponent) private grid?: DataGridMttoComponent;
    @ViewChild('fOferta') fOferta?: DxFormComponent;
    readOnly = false;
    catalogosCargados = false;
    catalogos: PeriodoCatalogo[] = [];
    private cache = new Map<string, PeriodoCatalogo[]>();
    readonly alcances = ['Área', 'Facultad', 'Carrera'];
    readonly alcanceChanged = (e: any) => { if (e.event) this.cambiarAlcance(e.value); };
    historialVisible = false;
    historial: any[] = [];
    historialId = 0;
    ofertaVisible = false;
    ofertaConsultada = false;
    oferta: any[] = [];
    ofertaFiltro: any = {};
    ofertaSedes: PeriodoCatalogo[] = [];
    ofertaAreas: PeriodoCatalogo[] = [];
    readonly ofertaColumns: any[] = [
        { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 320 },
        { dataField: 'NOMBRE_MODALIDAD', caption: 'Modalidad', width: 150 },
        { dataField: 'CODIGO_PLAN', caption: 'Plan seleccionado', width: 210 },
        { dataField: 'CORR_PERIODO_ACADEMICO', caption: 'Período aplicado', width: 150 },
        { dataField: 'FECHA_INICIO_INSCRIPCION', caption: 'Apertura inscripción', dataType: 'date', format: 'dd/MM/yyyy', width: 170 },
        { dataField: 'FECHA_FIN_INSCRIPCION', caption: 'Cierre inscripción', dataType: 'date', format: 'dd/MM/yyyy', width: 170 },
    ];
    historialColumns: any[];
    constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute,
        private service: AcaPeriodosAcademicosService) {
        super(appInfoService, router);
        this.columns = service.getColumns();
        this.summary = { totalItems: [{ column: 'CORR_PERIODO_ACADEMICO', summaryType: 'count', displayFormat: 'Cant: {0}' }] };
        this.historialColumns = [
            { dataField: 'TIPO_CAMBIO', caption: 'Cambio', width: 110 },
            { dataField: 'USUARIO_CAMBIO', caption: 'Usuario', width: 130 },
            { dataField: 'FECHA_CAMBIO', caption: 'Fecha del cambio', dataType: 'datetime', format: 'dd/MM/yyyy HH:mm:ss', width: 195 },
            ...this.columns.filter((x: any) => !['CORR_PERIODO_ACADEMICO', 'EN_USO'].includes(x.dataField)),
        ];
    }
    ngOnInit(): void { this.consultar(); this.cargarCatalogos(); }
    cargarCatalogos(): void {
        this.catalogosCargados = false;
        this.service.getCatalogos().pipe(take(1)).subscribe({ next: r => {
            if (!r.Result) { this.notifyApiResponse(r); return; }
            this.catalogos = r.Data; this.cache.clear(); this.catalogosCargados = true;
            this.ofertaSedes = this.catalogos.filter(x => x.TIPO === 'SEDE');
            this.ofertaAreas = this.catalogos.filter(x => x.TIPO === 'AREA');
        }, error: e => this.notifyApiError(e) });
    }
    private opciones(tipo: string, field: string): PeriodoCatalogo[] {
        const m = this.model ?? {};
        const key = JSON.stringify([tipo, m.CORR_SEDE, m.CORR_AREA_ACADEMICA, m[field]]);
        const found = this.cache.get(key); if (found) return found;
        const rows = this.catalogos.filter(x => x.TIPO === tipo && (x.ACTIVO || x.Key === m[field])
            && (!['FACULTAD', 'CARRERA'].includes(tipo) || x.CORR_SEDE === m.CORR_SEDE)
            && (tipo !== 'CARRERA' || x.CORR_AREA_ACADEMICA === m.CORR_AREA_ACADEMICA));
        this.cache.set(key, rows); return rows;
    }
    get sedes() { return this.opciones('SEDE', 'CORR_SEDE'); }
    get areas() { return this.opciones('AREA', 'CORR_AREA_ACADEMICA'); }
    get facultades() { return this.opciones('FACULTAD', 'CORR_FACULTAD'); }
    get carreras() { return this.opciones('CARRERA', 'CORR_CARRERA'); }
    get identidadProtegida(): boolean { return this.readOnly || !!this.model?.EN_USO; }
    get anioDifiere(): boolean {
        return !!this.model?.FECHA_INICIO && Number(String(this.model.FECHA_INICIO).slice(0, 4)) !== Number(this.model.ANIO);
    }
    protected override getMttoDataGrid(): DataGridMttoComponent | null { return this.grid ?? null; }
    override fillData(row?: any): any {
        if (!row) return { CORR_PERIODO_ACADEMICO: 0, CORR_SEDE: null, CORR_AREA_ACADEMICA: null, CORR_FACULTAD: null,
            CORR_CARRERA: null, ALCANCE: 'Área', ANIO: new Date().getFullYear(), NUMERO_PERIODO: 1,
            FECHA_INICIO: null, FECHA_FIN: null, FECHA_INICIO_INSCRIPCION: null, FECHA_FIN_INSCRIPCION: null, ACTIVO: false, EN_USO: false };
        const model = { ...row };
        model.ALCANCE = row.CORR_CARRERA ? 'Carrera' : row.CORR_FACULTAD ? 'Facultad' : 'Área';
        for (const key of ['FECHA_INICIO', 'FECHA_FIN', 'FECHA_INICIO_INSCRIPCION', 'FECHA_FIN_INSCRIPCION'])
            model[key] = row[key] ? String(row[key]).slice(0, 10) : null;
        return model;
    }
    consultar(): void { this.consultarMtto({ load: () => this.service.getAll() }); }
    cambiarAlcance(value: string): void {
        if (this.identidadProtegida) return;
        this.model.ALCANCE = value; this.model.CORR_FACULTAD = null; this.model.CORR_CARRERA = null;
    }
    cambiarSede(value: number): void {
        if (this.identidadProtegida || value === this.model.CORR_SEDE) return;
        this.model.CORR_SEDE = value; this.model.CORR_FACULTAD = null; this.model.CORR_CARRERA = null;
    }
    cambiarArea(value: number): void {
        if (this.identidadProtegida || value === this.model.CORR_AREA_ACADEMICA) return;
        this.model.CORR_AREA_ACADEMICA = value; this.model.CORR_CARRERA = null;
        if (this.model.ALCANCE === 'Carrera') this.model.CORR_FACULTAD = null;
    }
    cambiarCarrera(value: number): void {
        if (this.identidadProtegida) return;
        this.model.CORR_CARRERA = value;
        this.model.CORR_FACULTAD = this.carreras.find(x => x.Key === value)?.CORR_FACULTAD ?? null;
    }
    guardar(): void {
        this.guardarMtto({ esValido: () => this.validar(), insert: () => this.service.insert(this.model), update: () => this.service.update(this.model) });
    }
    private validar(): boolean {
        if (!this.catalogosCargados) { this.notifyFx('Cargue los catálogos antes de guardar.', NotifyType.Warning); return false; }
        if (!this.dataForm?.instance.validate().isValid) return false;
        let error = '';
        if (!this.model.CORR_SEDE || !this.model.CORR_AREA_ACADEMICA) error = 'Seleccione sede y área académica.';
        else if (this.model.ALCANCE === 'Facultad' && !this.model.CORR_FACULTAD) error = 'Seleccione una facultad.';
        else if (this.model.ALCANCE === 'Carrera' && !this.model.CORR_CARRERA) error = 'Seleccione una carrera.';
        else if (this.model.FECHA_FIN < this.model.FECHA_INICIO) error = 'El fin académico no puede ser anterior al inicio.';
        else if (this.model.FECHA_FIN_INSCRIPCION < this.model.FECHA_INICIO_INSCRIPCION) error = 'El cierre de inscripción no puede ser anterior a su apertura.';
        else if (this.model.FECHA_FIN_INSCRIPCION > this.model.FECHA_FIN) error = 'El cierre de inscripción no puede ser posterior al fin académico.';
        if (error) { this.notifyFx(error, NotifyType.Warning, { raw: true }); return false; }
        return true;
    }
    override cancelar(): void { super.cancelar((row: any) => row.CORR_PERIODO_ACADEMICO === this.modelUpdate.CORR_PERIODO_ACADEMICO); }
    activar_inactivar(): void {
        const row = this.model;
        if (!this.permiteEdit || !row?.CORR_PERIODO_ACADEMICO) return;
        const advertencia = Number(String(row.FECHA_INICIO).slice(0, 4)) !== Number(row.ANIO)
            ? 'Atención: el año del ciclo difiere del año de inicio académico. ' : '';
        this.confirmaAccion('Cambiar estado del período', advertencia + (
            row.ACTIVO ? '¿Desea desactivar este período? En V2, una excepción inactiva por carrera o facultad sigue teniendo prioridad y puede bloquear la oferta del alcance general.'
                : '¿Desea activar este período? Se validarán su calendario, sede, área y asociaciones.'),
            () => this.ejecutarActivarInactivar({ ejecutar: () => this.service.estado(row), eraActivo: row.ACTIVO }));
    }
    verHistorial(): void {
        const id = this.model?.CORR_PERIODO_ACADEMICO;
        if (!id) { this.notifyFx('Seleccione un período guardado.', NotifyType.Warning); return; }
        this.historial = []; this.historialId = id; this.historialVisible = true; this.loadingVisible = true;
        this.service.historial(id).pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({
            next: r => { if (r.Result) this.historial = r.Data; else this.notifyApiResponse(r); }, error: e => this.notifyApiError(e),
        });
    }
    abrirOferta(): void {
        const today = new Date();
        const fecha = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        this.ofertaFiltro = { CORR_SEDE: this.model?.CORR_SEDE ?? null, CORR_AREA_ACADEMICA: this.model?.CORR_AREA_ACADEMICA ?? null,
            ANIO: this.model?.ANIO || today.getFullYear(), NUMERO_PERIODO: this.model?.NUMERO_PERIODO || 1, FECHA_REFERENCIA: fecha };
        this.invalidarOferta(); this.ofertaVisible = true;
    }
    invalidarOferta(): void { this.oferta = []; this.ofertaConsultada = false; }
    consultarOferta(): void {
        if (this.loadingVisible || !this.fOferta?.instance.validate().isValid) return;
        this.loadingVisible = true; this.invalidarOferta();
        this.service.oferta({ ...this.ofertaFiltro }).pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({
            next: r => { if (r.Result) { this.oferta = r.Data; this.ofertaConsultada = true; } else this.notifyApiResponse(r); }, error: e => this.notifyApiError(e),
        });
    }
    override bloquear(): void { this.readOnly = true; }
    override habilitar(): void { this.readOnly = false; }
}
