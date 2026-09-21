import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoSocioeconomicoRepository } from './aca-prospecto-socioeconomico.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoSocioeconomicoService {
    constructor(private repo: AcaProspectoSocioeconomicoRepository) {}

    // Qué hace: cabecera del estudio socioeconómico (relación 1:1; vacío si aún no lo llena).
    getSocioeconomicoPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            {
                dataField: 'TERMINOS_ACEPTADOS',
                caption: 'Términos',
                width: 100,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            {
                dataField: 'APLICA_CUOTA_MAXIMA',
                caption: 'Cuota máxima',
                width: 120,
                dataType: 'boolean',
                customizeText: (e: any) => e.value ? 'Sí' : 'No',
            },
            { dataField: 'FECHA_REGISTRO', caption: 'Fecha', width: 150, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_SOCIOECONOMICO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario "Estudio socioeconómico" (fechas, términos, cuota máxima).
    // Cómo lo hace: la versión del cuestionario y el conteo de respondidas son datos internos: no se muestran.
    getItems(): any {
        return [
            {
                dataField: 'FECHA_REGISTRO',
                label: { text: 'Fecha de registro' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: { readOnly: true, type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm' },
            },
            {
                dataField: 'FECHA_ACTUALIZACION',
                label: { text: 'Última actualización' },
                colSpan: 2,
                editorType: 'dxDateBox',
                editorOptions: { readOnly: true, type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm' },
            },
            { dataField: 'TERMINOS_ACEPTADOS', label: { text: 'Aceptó términos y condiciones' }, colSpan: 2, editorType: 'dxCheckBox' },
            { dataField: 'APLICA_CUOTA_MAXIMA', label: { text: 'Aplica cuota máxima' }, colSpan: 2, editorType: 'dxCheckBox' },
        ];
    }
}
