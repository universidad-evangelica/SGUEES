import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoFamiliarRepository } from './aca-prospecto-familiar.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoFamiliarService {
    constructor(private repo: AcaProspectoFamiliarRepository) {}

    // Qué hace: familiares y contacto de emergencia del prospecto.
    // Cómo lo hace: una sola consulta; el componente reparte las filas con ES_NUCLEO,
    //               ES_EMERGENCIA y ES_SOLO_EMERGENCIA (regla de admisiones, calculada en la vista).
    getFamiliaresPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    // Qué hace: columnas de la grilla "Familia" (padre, madre, cónyuge).
    getColumns(): any {
        return [
            { dataField: 'NOMBRE_PARENTESCO', caption: 'Parentesco', width: 120 },
            { dataField: 'NOMBRE_COMPLETO', caption: 'Nombre', width: 240 },
            { dataField: 'PROFESION', caption: 'Profesión', width: 140 },
            { dataField: 'NOMBRE_EMPRESA', caption: 'Empresa', width: 160 },
            { dataField: 'TELEFONO', caption: 'Teléfono', width: 110 },
            { dataField: 'TELEFONO_TRABAJO', caption: 'Tel. trabajo', width: 110 },
            { dataField: 'DIRECCION_CASA', caption: 'Dirección', width: 220 },
            {
                dataField: 'ES_EMERGENCIA',
                caption: 'Emergencia',
                width: 110,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
        ];
    }

    // Qué hace: columnas de la grilla "Contacto de emergencia".
    // Cómo lo hace: solo los datos de emergencia; si es del núcleo, el resto está en "Familia".
    getColumnsEmergencia(): any {
        return [
            { dataField: 'NOMBRE_PARENTESCO', caption: 'Parentesco', width: 120 },
            { dataField: 'NOMBRE_COMPLETO', caption: 'Nombre', width: 240 },
            { dataField: 'TELEFONO_EMERGENCIA', caption: 'Teléfono de emergencia', width: 170 },
            { dataField: 'DIRECCION_EMERGENCIA', caption: 'Dirección de emergencia', width: 260 },
            {
                dataField: 'ES_NUCLEO',
                caption: 'Familiar directo',
                width: 130,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_FAMILIAR',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'NOMBRE_PARENTESCO', label: { text: 'Parentesco' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_COMPLETO', label: { text: 'Nombre' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'PROFESION', label: { text: 'Profesión' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_EMPRESA', label: { text: 'Empresa' }, colSpan: 3, editorOptions: { readOnly: true } },
            { dataField: 'TELEFONO', label: { text: 'Teléfono' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'TELEFONO_TRABAJO', label: { text: 'Tel. trabajo' }, colSpan: 3, editorOptions: { readOnly: true } },
            { dataField: 'DIRECCION_CASA', label: { text: 'Dirección' }, colSpan: 8, editorOptions: { readOnly: true } },
            { dataField: 'ES_EMERGENCIA', label: { text: 'Contacto de emergencia' }, colSpan: 2, editorType: 'dxCheckBox' },
            { dataField: 'TELEFONO_EMERGENCIA', label: { text: 'Teléfono de emergencia' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'DIRECCION_EMERGENCIA', label: { text: 'Dirección de emergencia' }, colSpan: 4, editorOptions: { readOnly: true } },
        ];
    }
}
