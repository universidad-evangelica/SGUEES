import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { FirmasDocumentoRepository } from './firmas-documento.repository';

@Injectable({
    providedIn: 'root',
})
export class FirmasDocumentoService {
    constructor(private repo: FirmasDocumentoRepository) {}

    getFirmas(tipoDocumento: number, idDocumento: number): Observable<IResult> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_TIPO_DOCUMENTO', Value: tipoDocumento },
            { Parameter: 'CORR_DOCUMENTO', Value: idDocumento },
        ];
        return this.repo.getFirmas(xWhere);
    }

    getColumns(): any[] {
        return [
           // { dataField: 'ORDEN_FIRMA', caption: '#', width: 60 },
            { dataField: 'LOGIN_SISTEMA', caption: 'Usuario', width: 160 },
            { dataField: 'ESTADO_DESTINO', caption: 'Estado', width: 160 },
            //{ dataField: 'NOMBRE_PASO', caption: 'Paso', width: 200 },
            // Qué hace: Observaciones sin truncar (...); el grid usa wordWrapEnabled.
            {
                dataField: 'COMENTARIO',
                caption: 'Observaciones',
                minWidth: 280,
            },
            // Qué hace: define la columna Fecha ordenada de la más reciente a la más antigua para la bitácora de firmas.
            // Cómo lo hace: agrega sortOrder: 'desc' y sortIndex: 0 en la configuración de columna DevExtreme.
            {
                dataField: 'FECHA_ACCION',
                caption: 'Fecha',
                width: 170,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
                sortOrder: 'desc',
                sortIndex: 0,
            },
            //{ dataField: 'ESTADO_ORIGEN', caption: 'Estado Anterior', width: 180 },
        ];
    }
}