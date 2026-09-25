import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaProspectoBecaRepository } from './aca-prospecto-beca.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBecaService {
    constructor(private repo: AcaProspectoBecaRepository) {}

    getAll(param: any): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'ANIO', Value: param.ANIO },
            { Parameter: 'NUMERO_PERIODO', Value: param.NUMERO_PERIODO },
        ];
        return this.repo.getAll(xWhere);
    }

    getRespuestas(CORR_PROSPECTO_BECA: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_BECA', Value: CORR_PROSPECTO_BECA }];
        return this.repo.getRespuestas(xWhere);
    }

    getArchivos(CORR_PROSPECTO_BECA: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_BECA', Value: CORR_PROSPECTO_BECA }];
        return this.repo.getArchivos(xWhere);
    }

    getArchivo(CORR_PROSPECTO_BECA: number, CORR_RESPUESTA_BECA: number): Observable<Blob> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_PROSPECTO_BECA', Value: CORR_PROSPECTO_BECA },
            { Parameter: 'CORR_RESPUESTA_BECA', Value: CORR_RESPUESTA_BECA },
        ];
        return this.repo.getArchivo(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CODIGO_PROSPECTO', caption: 'CIF', width: 120 },
            { dataField: 'NOMBRE_COMPLETO', caption: 'Nombre completo', width: 260 },
            { dataField: 'DUI', caption: 'DUI', width: 120 },
            { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 240 },
            { dataField: 'NOMBRE_BECA', caption: 'Beca', width: 280 },
            { dataField: 'ESTADO_BECA_TEXTO', caption: 'Estado', width: 110 },
            { dataField: 'PUNTAJE_TOTAL', caption: 'Puntaje', width: 100, dataType: 'number', format: '#,##0.00' },
            { dataField: 'PORCENTAJE_TOTAL', caption: 'Porcentaje', width: 110, dataType: 'number', format: '#,##0.00' },
            { dataField: 'RESULTADO_EVALUACION', caption: 'Resultado', width: 200 },
            { dataField: 'PRIORIDAD_EVALUACION', caption: 'Prioridad', width: 110 },
            {
                dataField: 'FECHA_SOLICITUD',
                caption: 'Fecha de solicitud',
                width: 160,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CODIGO_PROSPECTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'CODIGO_PROSPECTO', label: { text: 'CIF' }, colSpan: 2 },
            { dataField: 'NOMBRE_COMPLETO', label: { text: 'Nombre completo' }, colSpan: 4 },
            { dataField: 'DUI', label: { text: 'DUI' }, colSpan: 2 },
            { dataField: 'NOMBRE_CARRERA', label: { text: 'Carrera' }, colSpan: 4 },
            { dataField: 'NOMBRE_BECA', label: { text: 'Beca' }, colSpan: 4 },
            { dataField: 'CICLO', label: { text: 'Ciclo' }, colSpan: 2 },
            { dataField: 'ESTADO_BECA_TEXTO', label: { text: 'Estado' }, colSpan: 2 },
            {
                dataField: 'FECHA_SOLICITUD',
                label: { text: 'Fecha de solicitud' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: { readOnly: true, type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm' },
            },
            {
                dataField: 'PUNTAJE_TOTAL',
                label: { text: 'Puntaje global' },
                colSpan: 2,
                editorOptions: { readOnly: true, format: '#,##0.00' },
            },
            {
                dataField: 'PORCENTAJE_TOTAL',
                label: { text: 'Porcentaje' },
                colSpan: 2,
                editorOptions: { readOnly: true, format: '#,##0.00' },
            },
            { dataField: 'RESULTADO_EVALUACION', label: { text: 'Resultado' }, colSpan: 3 },
            { dataField: 'PRIORIDAD_EVALUACION', label: { text: 'Prioridad' }, colSpan: 1 },
        ];
    }
}
