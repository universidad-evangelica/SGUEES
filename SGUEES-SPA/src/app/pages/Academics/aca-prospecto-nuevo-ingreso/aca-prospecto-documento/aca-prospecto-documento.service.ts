import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoDocumentoRepository } from './aca-prospecto-documento.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoDocumentoService {
    constructor(private repo: AcaProspectoDocumentoRepository) {}

    // Qué hace: documentación de un prospecto en la solicitud de nuevo ingreso.
    getDocumentosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_DOCUMENTO', caption: 'Documento', width: 280, minWidth: 180 },
            { dataField: 'OBLIGATORIO', caption: 'Obligatorio', width: 120, dataType: 'boolean' },
            { dataField: 'FORMATOS_PERMITIDOS', caption: 'Formatos', width: 140 },
            { dataField: 'TAMANO_MAXIMO_MB', caption: 'Máx. MB', width: 90 },
            { dataField: 'NOMBRE_ARCHIVO', caption: 'Archivo cargado', width: 260, minWidth: 160 },
            {
                dataField: 'FECHA_CARGA',
                caption: 'Fecha de carga',
                width: 150,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
            { dataField: 'ESTADO_REVISION', caption: 'Revisión', width: 130 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'NOMBRE_DOCUMENTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }
}
