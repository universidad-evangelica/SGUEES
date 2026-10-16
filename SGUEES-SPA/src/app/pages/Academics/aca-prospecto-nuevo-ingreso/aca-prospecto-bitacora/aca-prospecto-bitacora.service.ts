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

    // Qué hace: bitácora del prospecto abierto.
    // Cómo lo hace: el API sustituye PORTAL_ADMISION por el CIF antes de pintar la grilla.
    getPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any[] {
        return [
            { dataField: 'USUARIO', caption: 'Usuario', width: 160 },
            { dataField: 'NOMBRE_PASO', caption: 'Paso', width: 240 },
            { dataField: 'ESTADO_DESTINO', caption: 'Estado', width: 180 },
            { dataField: 'COMENTARIO', caption: 'Observaciones', minWidth: 280 },
            {
                dataField: 'FECHA_ACCION',
                caption: 'Fecha',
                width: 170,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
                sortOrder: 'desc',
                sortIndex: 0,
            },
        ];
    }
}
