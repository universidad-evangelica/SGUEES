import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaCiclosService } from './aca-ciclos.service';

@Component({ selector: 'app-aca-ciclos', templateUrl: './aca-ciclos.component.html', styleUrls: ['./aca-ciclos.component.scss'] })
export class AcaCiclosComponent extends CBaseComponent implements OnInit, OnDestroy {
    vista: 'areas' | 'ciclos' | 'ficha' = 'areas';
    areas: any[] = []; ciclos: any[] = []; areaElegida: any = null;
    catalogos: any[] = []; sedes: any[] = []; facultades: any[] = []; carreras: any[] = []; historial: any[] = []; periodos: any[] = [];
    planes: any[] = [];
    sedesDisponibles: any[] = []; facultadesDisponibles: any[] = []; carrerasDisponibles: any[] = [];
    sedeNueva: number | null = null; facultadNueva: number | null = null;
    sedeId = 0; facultadId = 0; sedeKeys: number[] = []; facultadKeys: number[] = [];
    facultadesSede: any[] = [];
    tab = 0; oferta: any[] = []; ofertaConsultada = false; fechaConsulta = this.hoy();
    private inicial: any = {}; private secuencia = 0;
    readonly areaColumns: any[] = [{ dataField: 'NOMBRE_AREA', caption: 'Área académica' },
        { dataField: 'CICLOS_DEFINIDOS', caption: 'Ciclos definidos', width: 150 }, { dataField: 'CICLOS_HABILITADOS', caption: 'Habilitados', width: 130 },
        { caption: 'Acción', cellTemplate: 'abrirArea', width: 150 }];
    readonly cicloColumns: any[] = [{ dataField: 'ANIO', caption: 'Año', width: 100 }, { dataField: 'NUMERO_PERIODO', caption: 'Ciclo', width: 100 },
        { dataField: 'ESTADO', caption: 'Estado', width: 125 },
        { dataField: 'NOMBRES_SEDES', caption: 'Sedes participantes', width: 220, cellTemplate: 'nombresAsignados' },
        { dataField: 'NOMBRES_FACULTADES_SEDES', caption: 'Facultades por sede', width: 360, cellTemplate: 'nombresAsignados' },
        { dataField: 'CARRERAS_SEDES', caption: 'Carreras seleccionadas', width: 140 },
        { caption: 'Para activar', calculateCellValue: (row: any) => this.pasoListado(row), width: 230 },
        { dataField: 'REQUIERE_REVISION', caption: 'Pendiente de revisión', dataType: 'boolean', visible: false },
        { caption: 'Acción', cellTemplate: 'abrirCiclo', width: 190, fixed: true, fixedPosition: 'right' }];
    readonly sedeColumns: any[] = [{ dataField: 'NOMBRE_SEDE', caption: 'Sede' }, { dataField: 'ACTIVO', caption: 'Participa', dataType: 'boolean', width: 100 }];
    readonly facultadColumns: any[] = [{ dataField: 'NOMBRE_FACULTAD', caption: 'Facultad' }, { dataField: 'ACTIVO', caption: 'Participa', dataType: 'boolean', width: 100 }];
    readonly carreraColumns: any[] = [{ dataField: 'Value', caption: 'Carrera', minWidth: 300 },
        { dataField: 'SELECCIONADA', caption: 'Seleccionada', dataType: 'boolean', width: 120 },
        { caption: 'Plan y validación para este ciclo', cellTemplate: 'planesCarrera', minWidth: 420 }, { caption: 'Acción', cellTemplate: 'seleccionarCarrera', width: 190 }];
    readonly resumenColumns: any[] = [{ dataField: 'NOMBRE_SEDE', caption: 'Sede', width: 150 }, { dataField: 'NOMBRE_FACULTAD', caption: 'Facultad', width: 180 },
        { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', minWidth: 220 }, { dataField: 'SELECCIONADA', caption: 'Incluida en apertura', dataType: 'boolean', width: 110 },
        { caption: 'Plan y validación para este ciclo', cellTemplate: 'planesResumen', minWidth: 360 }];
    readonly historialColumns: any[] = [{ dataField: 'OPERACION', caption: 'Operación', width: 160 }, { dataField: 'USUARIO', caption: 'Usuario', width: 150 },
        { dataField: 'ESTACION', caption: 'Estación', minWidth: 180 }, { dataField: 'FECHA', caption: 'Fecha', dataType: 'datetime', format: 'dd/MM/yyyy HH:mm:ss', width: 190 }];
    readonly periodoColumns: any[] = [{ dataField: 'CORR_PERIODO_ACADEMICO', caption: 'Período original', width: 130 },
        { dataField: 'NOMBRE_SEDE', caption: 'Sede', width: 220, calculateCellValue: row => this.nombrePeriodo(row, 'SEDE', 'Sin sede definida') },
        { dataField: 'NOMBRE_FACULTAD', caption: 'Facultad', width: 280, calculateCellValue: row => this.nombrePeriodo(row, 'FACULTAD', 'Sin facultad específica') },
        { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 360, calculateCellValue: row => this.nombrePeriodo(row, 'CARRERA', 'Sin carrera específica') },
        ...['FECHA_INICIO', 'FECHA_FIN', 'FECHA_INICIO_INSCRIPCION', 'FECHA_FIN_INSCRIPCION'].map((dataField, i) => ({ dataField,
            caption: ['Inicio académico', 'Fin académico', 'Apertura inscripción', 'Cierre inscripción'][i], dataType: 'date', format: 'dd/MM/yyyy', width: 165 }))];
    readonly ofertaColumns: any[] = [{ dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 330 }, { dataField: 'NOMBRE_MODALIDAD', caption: 'Modalidad', width: 170 },
        { dataField: 'CODIGO_PLAN', caption: 'Plan', width: 220 }, { dataField: 'CORR_PERIODO_ACADEMICO', caption: 'Período aplicado', width: 150 }];
    constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute, private service: AcaCiclosService) { super(appInfoService, router); }
    private nombrePeriodo(row: any, tipo: string, sinAsignacion: string): string {
        const nombre = row['NOMBRE_' + tipo]?.trim();
        return nombre || (row['CORR_' + tipo] == null ? sinAsignacion : `Referencia sin nombre (${row['CORR_' + tipo]})`);
    }
    ngOnInit(): void { this.cargarInicio(); }
    ngOnDestroy(): void { this.secuencia++; }
    override fillData(row?: any): any {
        const m = row ? { ...row } : { CORR_CICLO_ACADEMICO: 0, CORR_AREA_ACADEMICA: 0, ANIO: new Date().getFullYear(), NUMERO_PERIODO: 1,
            ESTADO: 'BORRADOR', FECHA_INICIO: null, FECHA_FIN: null, FECHA_INICIO_INSCRIPCION: null, FECHA_FIN_INSCRIPCION: null };
        for (const key of ['FECHA_INICIO', 'FECHA_FIN', 'FECHA_INICIO_INSCRIPCION', 'FECHA_FIN_INSCRIPCION']) m[key] = m[key] ? String(m[key]).slice(0, 10) : null;
        return m;
    }
    private hoy(): string { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    get cambiosPendientes(): boolean {
        return !this.model?.CORR_CICLO_ACADEMICO || ['CORR_AREA_ACADEMICA', 'ANIO', 'NUMERO_PERIODO', 'FECHA_INICIO', 'FECHA_FIN', 'FECHA_INICIO_INSCRIPCION', 'FECHA_FIN_INSCRIPCION']
            .some(k => this.model[k] !== this.inicial[k]);
    }
    get editaCabecera(): boolean { return !this.loadingVisible && this.model.ESTADO === 'BORRADOR' && (this.model.CORR_CICLO_ACADEMICO ? this.permiteEdit : this.permiteAdd); }
    get puedeAsignar(): boolean { return this.editaCabecera && this.permiteEdit && !!this.model.CORR_CICLO_ACADEMICO && !this.cambiosPendientes; }
    get sedeActual(): any { return this.sedes.find(x => x.CORR_SEDE === this.sedeId); }
    get facultadActual(): any { return this.facultades.find(x => x.CORR_SEDE === this.sedeId && x.CORR_FACULTAD === this.facultadId); }
    get anioDifiere(): boolean { return !!this.model.FECHA_INICIO && Number(this.model.FECHA_INICIO.slice(0, 4)) !== Number(this.model.ANIO); }
    planesCarrera(id: number): any[] { return this.planes.filter(p => p.CORR_CARRERA === id); }
    planesAplicables(id: number): any[] { return this.planesCarrera(id).filter(p => p.ES_APLICABLE); }
    observacionCarrera(row: any): string {
        const id = row.CORR_CARRERA ?? row.Key;
        if (this.cambiosPendientes) return 'Guarda el calendario para recalcular los planes con las nuevas fechas.';
        const planes = this.planesCarrera(id);
        if ((!row.DIAGNOSTICO || row.DIAGNOSTICO === 'Sin plan y modalidad elegibles al inicio académico' || row.DIAGNOSTICO === 'Pendiente de seleccionar') && planes.length && !this.planesAplicables(id).length)
            return planes.map(p => (p.CODIGO_PLAN ? p.CODIGO_PLAN.trim() + ': ' : '') + p.MOTIVO_PLAN).join(' ');
        return row.DIAGNOSTICO === 'Lista para apertura' ? 'Lista para apertura' : row.DIAGNOSTICO === 'Pendiente de seleccionar' && this.planesAplicables(id).length ? 'Plan compatible. Selecciona la carrera para incluirla.' : row.DIAGNOSTICO;
    }
    get carrerasIncluidas(): number { return this.carreras.filter(c => c.SELECCIONADA).length; }
    get carrerasConPendientes(): any[] { return this.carreras.filter(c => c.SELECCIONADA && c.DIAGNOSTICO !== 'Lista para apertura'); }
    irPaso(paso: number): void { if (!this.loadingVisible) this.tab = paso; }
    actualizarValidaciones(): void {
        if (this.loadingVisible || !this.model.CORR_CICLO_ACADEMICO || this.cambiosPendientes) return;
        const seq = this.secuencia; this.loadingVisible = true;
        forkJoin([this.service.detalle(this.model.CORR_CICLO_ACADEMICO), this.service.catalogos()]).pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({
            next: ([r, cat]) => { if (seq !== this.secuencia) return;
                if (!r.Result || !cat.Result) { this.notifyApiResponse(!r.Result ? r : cat); return; }
                this.catalogos = cat.Data; this.sedesDisponibles = this.catalogos.filter(x => x.TIPO === 'SEDE' && x.ACTIVO); this.aplicar(r.Data);
            }, error: e => this.notifyApiError(e),
        });
    }
    pasoListado(row: any): string {
        if (row.ESTADO === 'HABILITADO') return 'Ciclo habilitado';
        if (row.REQUIERE_REVISION) return 'Revisar y guardar calendario';
        if (!row.SEDES) return 'Seleccionar sedes';
        if (!row.FACULTADES_SEDES) return 'Seleccionar facultades';
        if (!row.CARRERAS_SEDES) return 'Seleccionar carreras';
        return 'Revisar resumen y habilitar';
    }
    get pendientesActivacion(): string[] {
        if (!this.model.CORR_CICLO_ACADEMICO) return ['Guarda primero el ciclo y su calendario.'];
        const pendientes: string[] = [];
        if (this.model.REQUIERE_REVISION) pendientes.push('Revisa y guarda el calendario común importado en Datos generales.');
        else if (this.cambiosPendientes) pendientes.push('Guarda los cambios del calendario en Datos generales.');
        const m = this.model;
        if (!m.FECHA_INICIO || !m.FECHA_FIN || !m.FECHA_INICIO_INSCRIPCION || !m.FECHA_FIN_INSCRIPCION
            || m.FECHA_FIN < m.FECHA_INICIO || m.FECHA_FIN_INSCRIPCION < m.FECHA_INICIO_INSCRIPCION || m.FECHA_FIN_INSCRIPCION > m.FECHA_FIN)
            pendientes.push('Completa y corrige las fechas del calendario común.');
        const sedes = this.sedes.filter(s => s.ACTIVO);
        if (!sedes.length) pendientes.push('Agrega y habilita al menos una sede en Sedes y oferta.');
        for (const sede of sedes) {
            const facultades = this.facultades.filter(f => f.CORR_SEDE === sede.CORR_SEDE && f.ACTIVO);
            if (!facultades.length) pendientes.push('Selecciona facultades para ' + sede.NOMBRE_SEDE + '.');
            for (const facultad of facultades) {
                const carreras = this.carreras.filter(r => r.CORR_SEDE === sede.CORR_SEDE && r.CORR_FACULTAD === facultad.CORR_FACULTAD && r.ACTIVO);
                if (!carreras.length) pendientes.push('Selecciona carreras de ' + facultad.NOMBRE_FACULTAD.trim() + ' en ' + sede.NOMBRE_SEDE + '.');
                for (const carrera of carreras) if (carrera.DIAGNOSTICO !== 'Lista para apertura')
                    pendientes.push(carrera.NOMBRE_CARRERA + ' en ' + sede.NOMBRE_SEDE + ': ' + this.observacionCarrera(carrera));
            }
        }
        return pendientes;
    }
    get puedeHabilitar(): boolean {
        return this.permiteEdit && !this.loadingVisible && !!this.model.CORR_CICLO_ACADEMICO
            && this.model.ESTADO !== 'HABILITADO' && this.pendientesActivacion.length === 0;
    }
    revisarActivacion(): void {
        this.tab = this.model.REQUIERE_REVISION || this.cambiosPendientes ? 0
            : this.pendientesActivacion.some(p => p.startsWith('Agrega') || p.startsWith('Selecciona')) ? 1 : 2;
    }
    cambiado(): void { this.permiteSalir = !this.cambiosPendientes; }
    cargarInicio(): void {
        this.loadingVisible = true;
        forkJoin([this.service.areas(), this.service.catalogos()]).pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({
            next: ([areas, cat]) => { if (!areas.Result || !cat.Result) { this.notifyApiResponse(!areas.Result ? areas : cat); return; }
                this.areas = areas.Data; this.catalogos = cat.Data; this.sedesDisponibles = this.catalogos.filter(x => x.TIPO === 'SEDE' && x.ACTIVO); }, error: e => this.notifyApiError(e),
        });
    }
    verCiclos(area: any): void {
        if (this.loadingVisible) return;
        this.areaElegida = area; this.vista = 'ciclos'; this.ciclos = []; this.loadingVisible = true;
        this.service.ciclos(area.CORR_AREA_ACADEMICA).pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({
            next: r => { if (r.Result) this.ciclos = r.Data; else this.notifyApiResponse(r); }, error: e => this.notifyApiError(e),
        });
    }
    abrirCiclo(ciclo: any, paraActivar = false): void {
        if (this.loadingVisible) return;
        const seq = ++this.secuencia; this.loadingVisible = true;
        this.service.detalle(ciclo.CORR_CICLO_ACADEMICO).pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({
            next: r => { if (seq !== this.secuencia) return; if (!r.Result) { this.notifyApiResponse(r); return; }
                this.sedeId = 0; this.facultadId = 0; this.aplicar(r.Data); this.tab = 0; this.vista = 'ficha';
                if (paraActivar) this.revisarActivacion(); }, error: e => this.notifyApiError(e),
        });
    }
    nuevoCiclo(): void {
        if (!this.permiteAdd || !this.areaElegida?.ACTIVO || this.loadingVisible) return;
        this.model = this.fillData(); this.model.CORR_AREA_ACADEMICA = this.areaElegida.CORR_AREA_ACADEMICA;
        this.model.NOMBRE_AREA = this.areaElegida.NOMBRE_AREA; this.inicial = {};
        this.sedes = []; this.facultades = []; this.carreras = []; this.historial = []; this.periodos = []; this.planes = [];
        this.sedeId = 0; this.facultadId = 0; this.recalcular(); this.tab = 0; this.vista = 'ficha'; this.permiteSalir = false;
    }
    volver(): void {
        if (this.loadingVisible) return;
        const salir = () => { this.permiteSalir = true; if (this.vista === 'ficha') this.verCiclos(this.areaElegida); else { this.vista = 'areas'; this.cargarInicio(); } };
        if (this.vista === 'ficha' && this.cambiosPendientes) this.confirmaAccion('Descartar cambios', '¿Desea volver sin guardar los cambios del calendario?', salir); else salir();
    }
    guardarCiclo(continuar = false): void {
        if (!this.editaCabecera || !this.dataForm?.instance.validate().isValid) return;
        const m = this.model;
        if (!m.FECHA_INICIO || !m.FECHA_FIN || !m.FECHA_INICIO_INSCRIPCION || !m.FECHA_FIN_INSCRIPCION || m.FECHA_FIN < m.FECHA_INICIO || m.FECHA_FIN_INSCRIPCION < m.FECHA_INICIO_INSCRIPCION || m.FECHA_FIN_INSCRIPCION > m.FECHA_FIN) {
            this.notifyFx('Complete las fechas y revise que la inscripción cierre antes del fin académico.', NotifyType.Warning); return;
        }
        this.ejecutar(this.service.guardar({ ...m }), continuar ? 1 : undefined);
    }
    private aplicar(data: any): void {
        this.model = this.fillData(data.Cabecera); this.inicial = { ...this.model }; this.permiteSalir = true;
        this.sedes = data.Sedes; this.facultades = data.Facultades; this.carreras = data.Carreras; this.historial = data.Historial; this.periodos = data.Periodos;
        this.planes = data.Planes ?? [];
        if (!this.sedes.some(x => x.CORR_SEDE === this.sedeId)) this.sedeId = this.sedes[0]?.CORR_SEDE ?? 0;
        this.recalcular(); this.oferta = []; this.ofertaConsultada = false;
    }
    private recalcular(): void {
        this.sedeKeys = this.sedeId ? [this.sedeId] : [];
        this.facultadesSede = this.facultades.filter(x => x.CORR_SEDE === this.sedeId);
        if (!this.facultadesSede.some(x => x.CORR_FACULTAD === this.facultadId)) this.facultadId = this.facultadesSede[0]?.CORR_FACULTAD ?? 0;
        this.facultadKeys = this.facultadId ? [this.facultadId] : [];
        const disponibles = this.catalogos.filter(x => x.TIPO === 'CARRERA' && x.CORR_SEDE === this.sedeId && x.CORR_AREA_ACADEMICA === this.model.CORR_AREA_ACADEMICA);
        this.facultadesDisponibles = this.catalogos.filter(x => x.TIPO === 'FACULTAD' && x.CORR_SEDE === this.sedeId && x.ACTIVO && disponibles.some(c => c.ACTIVO && c.CORR_FACULTAD === x.Key));
        const rows = disponibles.filter(x => x.CORR_FACULTAD === this.facultadId && x.ACTIVO).map(x => ({ ...x }));
        for (const r of this.carreras.filter(x => x.CORR_SEDE === this.sedeId && x.CORR_FACULTAD === this.facultadId))
            if (!rows.some(x => x.Key === r.CORR_CARRERA)) rows.push({ Key: r.CORR_CARRERA, Value: r.NOMBRE_CARRERA, ACTIVO: false });
        this.carrerasDisponibles = rows.map(x => { const actual = this.carreras.find(r => r.CORR_SEDE === this.sedeId && r.CORR_CARRERA === x.Key);
            return { ...x, SELECCIONADA: !!actual?.ACTIVO, DIAGNOSTICO: actual?.DIAGNOSTICO ?? 'Pendiente de seleccionar' }; });
    }
    seleccionarSede(e: any): void { if (!e.selectedRowsData?.length) return; this.sedeId = e.selectedRowsData[0].CORR_SEDE; this.facultadId = 0; this.recalcular(); }
    seleccionarFacultad(e: any): void { if (!e.selectedRowsData?.length) return; this.facultadId = e.selectedRowsData[0].CORR_FACULTAD; this.recalcular(); }
    agregarSede(): void { if (!this.sedeNueva) return; this.asignar('Sede', { CORR_SEDE: this.sedeNueva, ACTIVO: true }); }
    agregarFacultad(): void { if (!this.facultadNueva) return; this.asignar('Facultad', { CORR_SEDE: this.sedeId, CORR_FACULTAD: this.facultadNueva, ACTIVO: true }); }
    estadoSede(): void { if (this.sedeActual) this.asignar('Sede', { CORR_SEDE: this.sedeId, ACTIVO: !this.sedeActual.ACTIVO }); }
    estadoFacultad(): void { if (this.facultadActual) this.asignar('Facultad', { CORR_SEDE: this.sedeId, CORR_FACULTAD: this.facultadId, ACTIVO: !this.facultadActual.ACTIVO }); }
    estadoCarrera(row: any): void { this.asignar('Carrera', { CORR_SEDE: this.sedeId, CORR_FACULTAD: this.facultadId, CORR_CARRERA: row.Key, ACTIVO: !row.SELECCIONADA }); }
    todas(): void {
        if (!this.puedeAsignar || !this.facultadActual?.ACTIVO) return;
        const cantidad = this.carrerasDisponibles.filter(x => x.ACTIVO).length;
        this.confirmaAccion('Seleccionar carreras', '¿Desea seleccionar las ' + cantidad + ' carreras institucionalmente disponibles de esta facultad y sede? Revise sus planes en Resumen antes de habilitar.',
            () => this.asignar('Todas', { CORR_SEDE: this.sedeId, CORR_FACULTAD: this.facultadId, ACTIVO: true }));
    }
    private asignar(accion: string, data: any): void {
        if (!this.puedeAsignar) return;
        this.ejecutar(this.service.asignar(accion, { ...data, CORR_CICLO_ACADEMICO: this.model.CORR_CICLO_ACADEMICO }));
    }
    cambiarEstado(accion: string): void {
        if (!this.permiteEdit || this.loadingVisible || this.cambiosPendientes) return;
        if (accion === 'Habilitar' && !this.puedeHabilitar) { this.revisarActivacion(); return; }
        const id = this.model.CORR_CICLO_ACADEMICO;
        const mensaje = accion === 'Habilitar'
            ? '¿Desea habilitar el ciclo del área para las sedes, facultades y carreras seleccionadas? Se aplicará el calendario común a sus períodos específicos y se validarán los planes. La inscripción dependerá de sus fechas.'
            : accion === 'Borrador' ? '¿Desea pasar el ciclo a borrador? Su oferta quedará suspendida mientras modifica la configuración.' : '¿Desea cerrar el ciclo y suspender su oferta en todas sus sedes?';
        this.confirmaAccion('Estado del ciclo', mensaje, () => {
            if (id !== this.model.CORR_CICLO_ACADEMICO || this.loadingVisible) return;
            this.ejecutar(this.service.asignar(accion, { CORR_CICLO_ACADEMICO: id }));
        });
    }
    private ejecutar(request: Observable<IResult>, siguientePaso?: number): void {
        const seq = this.secuencia; this.loadingVisible = true;
        request.pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({ next: r => {
            if (seq !== this.secuencia) return;
            if (!r.Result) { this.notifyApiResponse(r); return; }
            this.aplicar(r.Data); this.sedeNueva = null; this.facultadNueva = null;
            if (siguientePaso !== undefined) this.tab = siguientePaso;
            this.notifyFx('Configuración del ciclo guardada.', NotifyType.Success);
        }, error: e => this.notifyApiError(e) });
    }
    consultarOferta(): void {
        if (!this.sedeId || !this.fechaConsulta || this.loadingVisible || this.cambiosPendientes) return;
        this.loadingVisible = true; this.oferta = []; this.ofertaConsultada = false;
        this.service.oferta(this.model.CORR_CICLO_ACADEMICO, this.sedeId, this.fechaConsulta).pipe(take(1), finalize(() => this.loadingVisible = false)).subscribe({
            next: r => { if (r.Result) { this.oferta = r.Data; this.ofertaConsultada = true; } else this.notifyApiResponse(r); }, error: e => this.notifyApiError(e),
        });
    }
    get motivosSinOferta(): string[] {
        const motivos: string[] = [];
        if (this.model.ESTADO === 'BORRADOR') motivos.push('El ciclo está en BORRADOR. Completa la revisión y pulsa Habilitar ciclo para que pueda ofrecer carreras.');
        if (this.model.ESTADO === 'CERRADO') motivos.push('El ciclo está CERRADO. Debe habilitarse nuevamente para ofrecer carreras.');
        if (this.model.REQUIERE_REVISION) motivos.push('Falta revisar y guardar el calendario importado en el paso 1.');
        if (this.fechaConsulta && this.fechaConsulta < this.model.FECHA_INICIO_INSCRIPCION)
            motivos.push('La fecha consultada es anterior a la apertura de inscripción.');
        if (this.fechaConsulta && this.fechaConsulta > this.model.FECHA_FIN_INSCRIPCION)
            motivos.push('La fecha consultada es posterior al cierre de inscripción.');
        if (!this.sedeActual?.ACTIVO) motivos.push('La sede elegida no participa actualmente en este ciclo.');
        const incluidas = this.carreras.filter(c => c.CORR_SEDE === this.sedeId && c.SELECCIONADA);
        if (!incluidas.length) motivos.push('No hay carreras incluidas para esta sede. Selecciónalas en el paso 2.');
        else if (incluidas.every(c => c.DIAGNOSTICO !== 'Lista para apertura')) motivos.push('Las carreras incluidas tienen observaciones. Revisa sus planes y validaciones en la tabla superior.');
        return motivos.length ? motivos : ['Actualiza las validaciones y revisa las carreras de esta sede en la tabla superior. Si están listas y el ciclo está habilitado, revisa sus períodos vinculados.'];
    }
    usarAperturaInscripcion(): void {
        if (this.loadingVisible || !this.model.FECHA_INICIO_INSCRIPCION) return;
        this.fechaConsulta = this.model.FECHA_INICIO_INSCRIPCION; this.oferta = []; this.ofertaConsultada = false;
    }
}
