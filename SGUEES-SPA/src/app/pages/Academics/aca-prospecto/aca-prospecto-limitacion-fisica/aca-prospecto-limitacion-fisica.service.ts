import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoLimitacionFisicaRepository } from './aca-prospecto-limitacion-fisica.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoLimitacionFisicaService {
    constructor(private repo: AcaProspectoLimitacionFisicaRepository) {}

    // Qué hace: limitaciones físicas declaradas (sección "Salud").
    getLimitacionesPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_LIMITACION', caption: 'Limitación', width: 260 },
            { dataField: 'ESPECIFIQUE', caption: 'Especifique', width: 400 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_LIMITACION_FISICA',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'NOMBRE_LIMITACION', label: { text: 'Limitación' }, colSpan: 3, editorOptions: { readOnly: true } },
            { dataField: 'ESPECIFIQUE', label: { text: 'Especifique' }, colSpan: 5, editorOptions: { readOnly: true } },
        ];
    }
}
