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

    // Qué hace: actualiza la cabecera del estudio (solo Aplica cuota máxima es editable).
    // Cómo lo hace: envía las columnas de ACA_PROSPECTO_SOCIOECONOMICO; la PK va en el query.
    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_SOCIOECONOMICO', Value: model.CORR_PROSPECTO_SOCIOECONOMICO }];
        const payload = {
            CORR_PROSPECTO_SOCIOECONOMICO: model.CORR_PROSPECTO_SOCIOECONOMICO,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            CORR_VERSION: model.CORR_VERSION,
            TERMINOS_ACEPTADOS: model.TERMINOS_ACEPTADOS ?? false,
            APLICA_CUOTA_MAXIMA: model.APLICA_CUOTA_MAXIMA ?? false,
        };
        return this.repo.update(payload, xWhere);
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
            {
                dataField: 'TERMINOS_ACEPTADOS',
                label: { text: 'Aceptó términos y condiciones' },
                colSpan: 2,
                editorType: 'dxCheckBox',
                editorOptions: { readOnly: true },
            },
            // Editable: el dx-form [readOnly] lo bloquea en consulta.
            { dataField: 'APLICA_CUOTA_MAXIMA', label: { text: 'Aplica cuota máxima' }, colSpan: 2, editorType: 'dxCheckBox' },
        ];
    }
}
