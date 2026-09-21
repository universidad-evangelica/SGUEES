import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoContactoRepository } from './aca-prospecto-contacto.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoContactoService {
    constructor(private repo: AcaProspectoContactoRepository) {}

    // Qué hace: correos y teléfonos del prospecto (grilla "Contacto").
    getContactosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'TIPO_CONTACTO', caption: 'Tipo', width: 120 },
            { dataField: 'CONTACTO', caption: 'Contacto', width: 300 },
            {
                dataField: 'ES_PRINCIPAL',
                caption: 'Principal',
                width: 110,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            {
                dataField: 'ES_TRABAJO',
                caption: 'Trabajo',
                width: 110,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_CONTACTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'TIPO_CONTACTO', label: { text: 'Tipo' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'CONTACTO', label: { text: 'Contacto' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'ES_PRINCIPAL', label: { text: 'Principal' }, colSpan: 1, editorType: 'dxCheckBox' },
            { dataField: 'ES_TRABAJO', label: { text: 'Trabajo' }, colSpan: 1, editorType: 'dxCheckBox' },
        ];
    }
}
