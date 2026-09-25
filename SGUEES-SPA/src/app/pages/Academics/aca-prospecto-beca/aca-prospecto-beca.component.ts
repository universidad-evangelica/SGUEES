import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

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
            this.cargarDetalle(xModel.CORR_PROSPECTO_BECA);
            return { ...xModel };
        }
        this.respuestas = [];
        this.archivos = [];
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

    onGridRowClick(e: any): void {
        if (!this.isBrowse() || e?.rowType !== 'data' || !e?.data) {
            return;
        }
        this.rowDblClick(e);
    }

    private cargarDetalle(corrProspectoBeca: number): void {
        this.respuestas = [];
        this.archivos = [];
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
