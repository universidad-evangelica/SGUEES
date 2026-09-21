import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoMedioOrigenRepository } from './aca-prospecto-medio-origen.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoMedioOrigenService {
    constructor(private repo: AcaProspectoMedioOrigenRepository) {}

    // Qué hace: medios por los que el prospecto conoció la universidad (sección "Información adicional").
    getMediosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_MEDIO', caption: 'Medio', width: 200 },
            { dataField: 'DESCRIPCION', caption: 'Descripción', width: 300 },
            { dataField: 'ESTUDIANTE_REFIERE', caption: 'Estudiante que refiere', width: 220 },
            { dataField: 'CARRERA_REFIERE', caption: 'Carrera del estudiante', width: 260 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_MEDIO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    getItems(): any {
        return [
            { dataField: 'NOMBRE_MEDIO', label: { text: 'Medio' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'DESCRIPCION', label: { text: 'Descripción' }, colSpan: 6, editorOptions: { readOnly: true } },
            { dataField: 'ESTUDIANTE_REFIERE', label: { text: 'Estudiante que refiere' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'CARRERA_REFIERE', label: { text: 'Carrera del estudiante' }, colSpan: 4, editorOptions: { readOnly: true } },
        ];
    }
}
