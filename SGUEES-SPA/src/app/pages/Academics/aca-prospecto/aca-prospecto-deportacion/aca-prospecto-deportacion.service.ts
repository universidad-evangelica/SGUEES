import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoDeportacionRepository } from './aca-prospecto-deportacion.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoDeportacionService {
    constructor(private repo: AcaProspectoDeportacionRepository) {}

    // Qué hace: deportaciones declaradas (sección "Migratorio").
    getDeportacionesPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_PAIS', caption: 'País', width: 200 },
            {
                dataField: 'ES_VIGENTE',
                caption: 'Vigente',
                width: 100,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            { dataField: 'OBSERVACION', caption: 'Observación', width: 400 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_DEPORTACION',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'NOMBRE_PAIS', label: { text: 'País' }, colSpan: 3, editorOptions: { readOnly: true } },
            { dataField: 'ES_VIGENTE', label: { text: 'Vigente' }, colSpan: 1, editorType: 'dxCheckBox' },
            { dataField: 'OBSERVACION', label: { text: 'Observación' }, colSpan: 4, editorOptions: { readOnly: true } },
        ];
    }
}
