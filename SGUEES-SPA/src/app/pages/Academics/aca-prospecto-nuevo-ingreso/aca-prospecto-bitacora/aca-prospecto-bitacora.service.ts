import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoBitacoraRepository } from './aca-prospecto-bitacora.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBitacoraService {
    constructor(private repo: AcaProspectoBitacoraRepository) {}

    // Qué hace: bitácora de ediciones del prospecto abierto.
    // Cómo lo hace: el API solo devuelve filas de tipo ACA_PROSPECTO.
    getPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    // Qué hace: registra el texto de los apartados y campos que cambiaron.
    registrar(CORR_PROSPECTO: number, COMENTARIO: string): Observable<IResult> {
        return this.repo.create({ CORR_PROSPECTO, COMENTARIO });
    }

    getColumns(): any[] {
        return [
            {
                name: 'btnAcciones',
                type: 'buttons',
                visible: false,
                allowFiltering: false,
                allowSorting: false,
                buttons: [],
            },
            { dataField: 'USUARIO', caption: 'Usuario', width: 160 },
            {
                dataField: 'FECHA_ACCION',
                caption: 'Fecha',
                width: 170,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
                sortOrder: 'desc',
                sortIndex: 0,
            },
            { dataField: 'COMENTARIO', caption: 'Cambios', width: 520, minWidth: 320 },
        ];
    }
}
