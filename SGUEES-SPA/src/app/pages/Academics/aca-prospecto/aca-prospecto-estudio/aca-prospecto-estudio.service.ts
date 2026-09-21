import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoEstudioRepository } from './aca-prospecto-estudio.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoEstudioService {
    constructor(private repo: AcaProspectoEstudioRepository) {}

    // Qué hace: estudios previos del prospecto (pestaña Información académica).
    // Cómo lo hace: la API los devuelve ordenados por sección (media, universidad, graduado UEES).
    getEstudiosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'SECCION_TEXTO', caption: 'Sección', width: 210 },
            { dataField: 'NOMBRE_INSTITUCION', caption: 'Institución', width: 220 },
            { dataField: 'TIPO_EDUCACION', caption: 'Tipo', width: 90 },
            { dataField: 'TITULO_OBTENIDO', caption: 'Título obtenido', width: 160 },
            { dataField: 'NOMBRE_GRADO', caption: 'Grado académico', width: 130 },
            {
                caption: 'Carrera',
                width: 240,
                // Qué hace: carrera UEES (catálogo) o carrera escrita a mano, según la fila.
                calculateCellValue: (row: any) => row.NOMBRE_CARRERA || row.CARRERA_TEXTO || '',
            },
            { dataField: 'ANIO_TITULACION', caption: 'Año', width: 80 },
            { dataField: 'FECHA_GRADUACION', caption: 'Graduación', width: 110, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'CUOTA', caption: 'Cuota ($)', width: 100, dataType: 'number', format: '#,##0.00' },
            { dataField: 'QUIEN_PAGO_CUOTA', caption: 'Quién pagó', width: 140 },
            {
                dataField: 'GRADUADO',
                caption: 'Graduado',
                width: 100,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_ESTUDIO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'SECCION_TEXTO', label: { text: 'Sección' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_INSTITUCION', label: { text: 'Institución' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'TIPO_EDUCACION', label: { text: 'Tipo' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'TITULO_OBTENIDO', label: { text: 'Título obtenido' }, colSpan: 3, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_GRADO', label: { text: 'Grado académico' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'ANIO_TITULACION', label: { text: 'Año de titulación' }, colSpan: 1, editorOptions: { readOnly: true } },
            {
                dataField: 'FECHA_GRADUACION',
                label: { text: 'Fecha de graduación' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: { readOnly: true, type: 'date', displayFormat: 'dd/MM/yyyy' },
            },
            { dataField: 'CUOTA', label: { text: 'Cuota ($)' }, colSpan: 2, editorType: 'dxNumberBox', editorOptions: { readOnly: true, format: '#,##0.00' } },
            { dataField: 'QUIEN_PAGO_CUOTA', label: { text: 'Quién pagó la cuota' }, colSpan: 3, editorOptions: { readOnly: true } },
            { dataField: 'GRADUADO', label: { text: 'Graduado' }, colSpan: 1, editorType: 'dxCheckBox' },
        ];
    }
}
