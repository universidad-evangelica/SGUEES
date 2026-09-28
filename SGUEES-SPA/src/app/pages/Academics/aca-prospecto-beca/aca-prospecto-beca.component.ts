import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, from, of, throwError } from 'rxjs';
import { concatMap, last, map, take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BarraMttoCombox } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { environment } from 'src/environments/environment';
import { AcaProspectoCiclo } from '../aca-prospecto/models/aca-prospecto-ciclo';
import { AcaProspectoBeca } from './models/aca-prospecto-beca';
import { AcaProspectoBecaRespuesta } from './models/aca-prospecto-beca-respuesta';
import { AcaProspectoBecaArchivo } from './models/aca-prospecto-beca-archivo';
import { AcaProspectoBecaService } from './aca-prospecto-beca.service';

// Qué hace: consulta de solicitudes de beca por ciclo (Académico → Consultas → Solicitudes de beca).
// Cómo lo hace: el listado muestra prospecto, beca, puntaje, resultado y prioridad cuando el
//               estado es Borrador o Enviada. Un clic abre las respuestas del cuestionario.
@Component({
    selector: 'app-aca-prospecto-beca',
    templateUrl: './aca-prospecto-beca.component.html',
    styleUrls: ['./aca-prospecto-beca.component.scss'],
})
export class AcaProspectoBecaComponent extends CBaseComponent implements OnInit {
    protected override mttoGridKeyExpr = 'CORR_PROSPECTO_BECA';

    model: any = this.fillData();
    items: any[] = [];
    respuestas: AcaProspectoBecaRespuesta[] = [];
    archivos: AcaProspectoBecaArchivo[] = [];
    seccionesCuestionario: SeccionCuestionario[] = [];
    seccionesArchivo: SeccionArchivo[] = [];
    pestanaDetalle = 0;
    modoEdicion = false;
    guardandoEdicion = false;
    borrador: Record<number, BorradorPregunta> = {};
    opcionesPorPregunta: Record<number, OpcionEdicion[]> = {};

    mCICLO: AcaProspectoCiclo[] = [];
    filtroCiclo = '';
    barraFiltroCiclo: BarraMttoCombox | null = null;
    cicloLookupColumns = [
        { dataField: 'NOMBRE_CICLO', caption: 'Ciclo', width: 160 },
        { dataField: 'CANTIDAD_PROSPECTOS', caption: 'Prospectos', width: 110 },
    ];

    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: AcaProspectoBecaService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();
        this.selectedLookUpCICLO = this.selectedLookUpCICLO.bind(this);
        this.sinEdicion = this.sinEdicion.bind(this);
    }

    ngOnInit(): void {
        this.inicializaOpciones();
        this.llenaComboBox();
        this.consultar();
    }

    inicializaOpciones() {}

    llenaComboBox() {
        this.appInfoService
            .getLookUp('ACA_PROSPECTO_BECA', 'ACA_PERIODOS_ACADEMICOS', 'GetCICLO', undefined, environment.UrlGENERALAPI)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.mCICLO = response.Data ?? [];
                        const cicloDefecto = this.mCICLO.find((item) => item.ES_CICLO_DEFECTO) ?? this.mCICLO[0];
                        this.filtroCiclo = cicloDefecto?.CICLO ?? '';
                        this.syncBarraFiltroCiclo();
                        this.consultar();
                    } else {
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => this.notifyFx(error, NotifyType.Error),
            });
    }

    selectedLookUpCICLO(vRow: any): string {
        return vRow?.[0]?.CICLO ?? '';
    }

    sinEdicion(): boolean {
        return false;
    }

    onFiltroCicloChanged(value: string): void {
        this.filtroCiclo = value ?? '';
        this.syncBarraFiltroCiclo();
        this.consultar();
    }

    private syncBarraFiltroCiclo(): void {
        this.barraFiltroCiclo = {
            label: 'Ciclo',
            model: this.mCICLO,
            value: this.filtroCiclo,
            valueExpr: 'CICLO',
            displayExpr: 'NOMBRE_CICLO',
            lookupColumns: this.cicloLookupColumns,
            selectedRowKeys: this.selectedLookUpCICLO,
            showClearButton: false,
            dropDownWidth: 320,
            width: 220,
        };
    }

    fillParam(): any {
        const ciclo = this.mCICLO.find((item) => item.CICLO === this.filtroCiclo);
        return {
            ANIO: ciclo?.ANIO ?? 0,
            NUMERO_PERIODO: ciclo?.NUMERO_PERIODO ?? 0,
        };
    }

    override fillData(xModel?: AcaProspectoBeca): AcaProspectoBeca {
        if (xModel !== undefined) {
            this.limpiarEdicion();
            this.pestanaDetalle = 0;
            this.cargarDetalle(xModel.CORR_PROSPECTO_BECA);
            return { ...xModel };
        }
        this.respuestas = [];
        this.archivos = [];
        this.armarSecciones();
        this.limpiarEdicion();
        this.pestanaDetalle = 0;
        return {
            CORR_EMPRESA: 0,
            CORR_PROSPECTO_BECA: 0,
            CORR_PROSPECTO: 0,
            CODIGO_PROSPECTO: '',
            NOMBRE_COMPLETO: '',
            DUI: '',
            NOMBRE_CARRERA: '',
            CORR_BECA: 0,
            CODIGO_BECA: '',
            NOMBRE_BECA: '',
            CORR_PERIODO_ACADEMICO: 0,
            ANIO: 0,
            NUMERO_PERIODO: null,
            CICLO: '',
            ESTADO_BECA: '',
            ESTADO_BECA_TEXTO: '',
            PUNTAJE_TOTAL: null,
            PORCENTAJE_TOTAL: null,
            RESULTADO_EVALUACION: '',
            PRIORIDAD_EVALUACION: '',
            FECHA_SOLICITUD: null,
        };
    }

    consultar() {
        const param = this.fillParam();
        if (!(param.ANIO > 0 && param.NUMERO_PERIODO > 0)) {
            this.models = [];
            return;
        }

        this.loadingVisible = true;
        this.service
            .getAll(param)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.models = response.Data;
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

    private armarSecciones(): void {
        const secciones = new Map<number, { orden: number; nombre: string; preguntas: Map<string, PreguntaCuestionario> }>();
        for (const fila of this.respuestas ?? []) {
            if (esDocumento(fila)) continue;
            let seccion = secciones.get(fila.ORDEN_SECCION);
            if (!seccion) {
                seccion = { orden: fila.ORDEN_SECCION, nombre: fila.NOMBRE_SECCION, preguntas: new Map() };
                secciones.set(fila.ORDEN_SECCION, seccion);
            }
            const clave = `${fila.ORDEN_PREGUNTA}|${fila.TEXTO_PREGUNTA}`;
            let pregunta = seccion.preguntas.get(clave);
            if (!pregunta) {
                pregunta = {
                    orden: fila.ORDEN_PREGUNTA,
                    texto: fila.TEXTO_PREGUNTA,
                    tipo: fila.TIPO_RESPUESTA,
                    corrPregunta: fila.CORR_PREGUNTA_BECA,
                    respuestas: [],
                    puntaje: 0,
                    filas: [],
                };
                seccion.preguntas.set(clave, pregunta);
            }
            if (fila.RESPUESTA) {
                pregunta.respuestas.push(fila.RESPUESTA);
            }
            pregunta.filas.push(fila);
            pregunta.puntaje += Number(fila.PUNTAJE_OBTENIDO) || 0;
        }
        this.seccionesCuestionario = [...secciones.values()]
            .sort((a, b) => a.orden - b.orden)
            .map((seccion) => {
                const preguntas = [...seccion.preguntas.values()].sort((a, b) => a.orden - b.orden);
                return {
                    nombre: seccion.nombre,
                    puntaje: preguntas.reduce((total, pregunta) => total + pregunta.puntaje, 0),
                    preguntas,
                };
            })
            .filter((seccion) => seccion.preguntas.length > 0);

        const seccionesArchivo = new Map<number, { orden: number; nombre: string; archivos: AcaProspectoBecaArchivo[] }>();
        for (const archivo of this.archivos ?? []) {
            let seccion = seccionesArchivo.get(archivo.ORDEN_SECCION);
            if (!seccion) {
                seccion = { orden: archivo.ORDEN_SECCION, nombre: archivo.NOMBRE_SECCION, archivos: [] };
                seccionesArchivo.set(archivo.ORDEN_SECCION, seccion);
            }
            seccion.archivos.push(archivo);
        }
        this.seccionesArchivo = [...seccionesArchivo.values()]
            .sort((a, b) => a.orden - b.orden)
            .map((seccion) => ({
                nombre: seccion.nombre,
                archivos: seccion.archivos.sort((a, b) => a.ORDEN_PREGUNTA - b.ORDEN_PREGUNTA),
            }));
    }

    trackPregunta(_indice: number, pregunta: PreguntaCuestionario): number {
        return pregunta.corrPregunta;
    }

    onPestanaDetalleChanged(e: { component?: { option: (name: string) => number } }): void {
        const index = e?.component?.option('selectedIndex');
        this.pestanaDetalle = typeof index === 'number' ? index : 0;
    }

    onGridRowClick(e: any): void {
        if (!this.isBrowse() || e?.rowType !== 'data' || !e?.data) {
            return;
        }
        this.rowDblClick(e);
    }

    private cargarDetalle(corrProspectoBeca: number): void {
        this.respuestas = [];
        this.archivos = [];
        this.armarSecciones();
        this.loadingVisible = true;
        let pendientes = 2;
        const terminar = () => {
            pendientes -= 1;
            if (pendientes <= 0) {
                this.loadingVisible = false;
            }
        };

        this.service
            .getRespuestas(corrProspectoBeca)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.respuestas = response.Data ?? [];
                        this.armarSecciones();
                    } else {
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                    terminar();
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                    terminar();
                },
            });

        this.service
            .getArchivos(corrProspectoBeca)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.archivos = response.Data ?? [];
                        this.armarSecciones();
                    } else {
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                    terminar();
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                    terminar();
                },
            });
    }

    iniciarEdicion(): void {
        if (!this.permiteEdit) {
            this.notifyFx('No tiene permiso para modificar la solicitud. Cierre sesión y vuelva a entrar.', NotifyType.Warning);
            return;
        }

        const preguntas = this.seccionesCuestionario.flatMap((seccion) => seccion.preguntas).filter((pregunta) => pregunta.tipo !== 'DOCUMENTO');
        const borrador: Record<number, BorradorPregunta> = {};
        for (const pregunta of preguntas) {
            borrador[pregunta.corrPregunta] = {
                tipo: pregunta.tipo,
                filas: pregunta.filas.map((fila) => ({
                    CORR_RESPUESTA_BECA: fila.CORR_RESPUESTA_BECA,
                    CORR_OPCION_BECA: fila.CORR_OPCION_BECA || 0,
                    texto: fila.RESPUESTA ?? '',
                    numero: this.esNumero(pregunta.tipo) ? this.leerNumero(fila.RESPUESTA) : null,
                })),
            };
        }

        const ids = [...new Set(preguntas.filter((pregunta) => this.esOpcion(pregunta.tipo)).map((pregunta) => pregunta.corrPregunta))];
        if (!ids.length) {
            this.borrador = borrador;
            this.opcionesPorPregunta = {};
            this.modoEdicion = true;
            return;
        }

        this.loadingVisible = true;
        forkJoin(
            ids.map((id) =>
                this.service.getOpciones(id).pipe(
                    take(1),
                    map((response: any) => ({ id, response }))
                )
            )
        ).subscribe({
            next: (lista) => {
                const opciones: Record<number, OpcionEdicion[]> = {};
                for (const item of lista) {
                    if (!item.response?.Result) {
                        this.loadingVisible = false;
                        this.notifyFx(item.response?.ErrorMessage || 'No se pudieron cargar las opciones.', NotifyType.Error);
                        return;
                    }
                    opciones[item.id] = item.response.Data ?? [];
                }
                this.borrador = borrador;
                this.opcionesPorPregunta = opciones;
                this.modoEdicion = true;
                this.loadingVisible = false;
            },
            error: (error: any) => {
                this.loadingVisible = false;
                this.notifyFx(error, NotifyType.Error);
            },
        });
    }

    cancelarEdicion(): void {
        if (this.guardandoEdicion) return;
        const corr = this.model?.CORR_PROSPECTO_BECA;
        this.limpiarEdicion();
        if (corr) this.cargarDetalle(corr);
    }

    guardarFormulario(): void {
        if (this.guardandoEdicion) return;
        const corr = this.model?.CORR_PROSPECTO_BECA;
        if (!corr) return;

        const cambios = this.preguntasCambiadas();
        if (!cambios.length) {
            this.limpiarEdicion();
            return;
        }

        this.guardandoEdicion = true;
        from(cambios)
            .pipe(
                concatMap((cambio) =>
                    this.service.guardarRespuesta({
                        CORR_PROSPECTO_BECA: corr,
                        CORR_PREGUNTA_BECA: cambio.corrPregunta,
                        Filas: cambio.filas.map((fila) => ({
                            CORR_RESPUESTA_BECA: fila.CORR_RESPUESTA_BECA,
                            CORR_OPCION_BECA: fila.CORR_OPCION_BECA || 0,
                            RESPUESTA_TEXTO: fila.texto,
                            RESPUESTA_NUMERO: fila.numero,
                        })),
                    }).pipe(
                        concatMap((response: any) =>
                            response?.Result
                                ? of(response)
                                : throwError(() => new Error(response?.ErrorMessage || 'No se pudo guardar el cambio.'))
                        )
                    )
                ),
                last()
            )
            .subscribe({
                next: (response: any) => {
                    this.guardandoEdicion = false;
                    this.aplicarTotales(response?.Data);
                    this.limpiarEdicion();
                    this.notifyFx('Respuestas guardadas', NotifyType.Success);
                    this.cargarDetalle(corr);
                },
                error: (error: any) => {
                    this.guardandoEdicion = false;
                    this.notifyFx(error?.message || error, NotifyType.Error);
                },
            });
    }

    onArchivoFila(event: Event, archivo: AcaProspectoBecaArchivo): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        const corr = this.model?.CORR_PROSPECTO_BECA;
        if (!file || !corr || this.guardandoEdicion) return;

        this.guardandoEdicion = true;
        this.service.reemplazarArchivo(corr, archivo.CORR_RESPUESTA_BECA, file).pipe(take(1)).subscribe({
            next: (response: any) => {
                this.guardandoEdicion = false;
                if (!response?.Result) {
                    this.notifyFx(response?.ErrorMessage || 'No se pudo cambiar el archivo.', NotifyType.Error);
                    return;
                }
                archivo.ARCHIVO_NOMBRE = response.Data || file.name;
                this.notifyFx(response.ErrorMessage || 'Archivo actualizado', NotifyType.Success);
            },
            error: (error: any) => {
                this.guardandoEdicion = false;
                this.notifyFx(error, NotifyType.Error);
            },
        });
    }

    marcarAceptacion(fila: { texto: string }, event: Event): void {
        fila.texto = (event.target as HTMLInputElement).checked ? 'Acepto' : '';
    }

    esOpcion(tipo: string): boolean {
        return filaEsOpcion(tipo);
    }

    esNumero(tipo: string): boolean {
        return tipo === 'NUMERO' || tipo === 'DECIMAL';
    }

    private preguntasCambiadas(): { corrPregunta: number; filas: FilaBorrador[] }[] {
        const cambios: { corrPregunta: number; filas: FilaBorrador[] }[] = [];
        for (const seccion of this.seccionesCuestionario) {
            for (const pregunta of seccion.preguntas) {
                const edicion = this.borrador[pregunta.corrPregunta];
                if (!edicion || pregunta.tipo === 'DOCUMENTO') continue;
                const cambio = pregunta.filas.some((fila, indice) => {
                    const filaEdicion = edicion.filas[indice];
                    if (!filaEdicion) return false;
                    if (this.esOpcion(pregunta.tipo)) return (fila.CORR_OPCION_BECA || 0) !== (filaEdicion.CORR_OPCION_BECA || 0);
                    if (this.esNumero(pregunta.tipo)) return this.leerNumero(fila.RESPUESTA) !== filaEdicion.numero;
                    return (fila.RESPUESTA || '') !== (filaEdicion.texto || '');
                });
                if (cambio) cambios.push({ corrPregunta: pregunta.corrPregunta, filas: edicion.filas });
            }
        }
        return cambios;
    }

    private aplicarTotales(data: any): void {
        if (!data || data.PUNTAJE_TOTAL === undefined) return;
        this.model = {
            ...this.model,
            PUNTAJE_TOTAL: data.PUNTAJE_TOTAL,
            PORCENTAJE_TOTAL: data.PORCENTAJE_TOTAL,
            RESULTADO_EVALUACION: data.RESULTADO_EVALUACION,
            PRIORIDAD_EVALUACION: data.PRIORIDAD_EVALUACION,
        };
        const fila = (this.models ?? []).find((item: AcaProspectoBeca) => item.CORR_PROSPECTO_BECA === this.model.CORR_PROSPECTO_BECA);
        if (fila) {
            fila.PUNTAJE_TOTAL = data.PUNTAJE_TOTAL;
            fila.PORCENTAJE_TOTAL = data.PORCENTAJE_TOTAL;
            fila.RESULTADO_EVALUACION = data.RESULTADO_EVALUACION;
            fila.PRIORIDAD_EVALUACION = data.PRIORIDAD_EVALUACION;
        }
    }

    private limpiarEdicion(): void {
        this.modoEdicion = false;
        this.borrador = {};
        this.opcionesPorPregunta = {};
    }

    private leerNumero(valor: string): number | null {
        if (valor === null || valor === undefined || valor === '') return null;
        const numero = Number(String(valor).replace(',', '.'));
        return Number.isFinite(numero) ? numero : null;
    }

    // Qué hace: abre el archivo en una pestaña del navegador.
    // Cómo lo hace: la API lo lee de Documentacion Becas\{ciclo}_{solicitud} y lo devuelve.
    abrirArchivo(row: AcaProspectoBecaArchivo): void {
        if (!row?.CORR_PROSPECTO_BECA || !row?.CORR_RESPUESTA_BECA) {
            return;
        }

        this.service
            .getArchivo(row.CORR_PROSPECTO_BECA, row.CORR_RESPUESTA_BECA)
            .pipe(take(1))
            .subscribe({
                next: (blob: Blob) => {
                    const tipo = blob?.type && blob.type !== 'application/octet-stream' ? blob.type : this.tipoArchivo(row.ARCHIVO_NOMBRE);
                    const archivo = new Blob([blob], { type: tipo });
                    const url = window.URL.createObjectURL(archivo);
                    const ventana = window.open(url, '_blank');
                    if (!ventana) {
                        this.appInfoService.downloadFile(archivo, row.ARCHIVO_NOMBRE);
                    }
                    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                },
                error: () => this.notifyFx('No se pudo abrir el archivo.', NotifyType.Error),
            });
    }

    private tipoArchivo(nombre: string): string {
        const ext = (nombre || '').split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'application/pdf';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'webp': return 'image/webp';
            case 'gif': return 'image/gif';
            default: return 'application/octet-stream';
        }
    }

    override bloquear(): void {}
    override habilitar(): void {}
    setFocus() {}
}

interface FilaBorrador {
    CORR_RESPUESTA_BECA: number;
    CORR_OPCION_BECA: number;
    texto: string;
    numero: number | null;
}

interface BorradorPregunta {
    tipo: string;
    filas: FilaBorrador[];
}

interface OpcionEdicion {
    CORR_OPCION_BECA: number;
    TEXTO_OPCION: string;
}

interface PreguntaCuestionario {
    orden: number;
    texto: string;
    tipo: string;
    corrPregunta: number;
    respuestas: string[];
    puntaje: number;
    filas: AcaProspectoBecaRespuesta[];
}

interface SeccionCuestionario {
    nombre: string;
    puntaje: number;
    preguntas: PreguntaCuestionario[];
}

interface SeccionArchivo {
    nombre: string;
    archivos: AcaProspectoBecaArchivo[];
}

function esDocumento(fila: { TIPO_RESPUESTA?: string; RESPUESTA?: string }): boolean {
    const tipo = (fila.TIPO_RESPUESTA || '').trim().toUpperCase();
    if (tipo === 'DOCUMENTO') return true;
    return /\.(pdf|png|jpe?g|webp|gif)$/i.test((fila.RESPUESTA || '').trim());
}

function filaEsOpcion(tipo: string): boolean {
    return tipo === 'OPCION_UNICA' || tipo === 'OPCION_MULTIPLE' || tipo === 'SI_NO';
}
