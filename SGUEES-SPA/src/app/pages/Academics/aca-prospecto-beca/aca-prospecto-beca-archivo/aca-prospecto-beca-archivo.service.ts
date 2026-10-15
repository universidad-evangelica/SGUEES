import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaProspectoBecaArchivoRepository } from './aca-prospecto-beca-archivo.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBecaArchivoService {
    constructor(private repo: AcaProspectoBecaArchivoRepository) {}

    // Qué hace: archivos de una solicitud de beca.
    // Cómo lo hace: lee V_ACA_PROSPECTO_BECA_ARCHIVO filtrada por la solicitud.
    getArchivos(CORR_PROSPECTO_BECA: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_BECA', Value: CORR_PROSPECTO_BECA }];
        return this.repo.getArchivos(xWhere);
    }

    // Qué hace: pide el archivo al API para mostrarlo o descargarlo.
    getArchivo(CORR_PROSPECTO_BECA: number, CORR_RESPUESTA_BECA: number): Observable<Blob> {
        const xWhere: IParam[] = [
            { Parameter: 'CORR_PROSPECTO_BECA', Value: CORR_PROSPECTO_BECA },
            { Parameter: 'CORR_RESPUESTA_BECA', Value: CORR_RESPUESTA_BECA },
        ];
        return this.repo.getArchivo(xWhere);
    }

    // Qué hace: manda el archivo nuevo de una respuesta tipo documento.
    reemplazarArchivo(CORR_PROSPECTO_BECA: number, CORR_RESPUESTA_BECA: number, archivo: File): Observable<IResult> {
        const data = new FormData();
        data.append('CORR_PROSPECTO_BECA', String(CORR_PROSPECTO_BECA));
        data.append('CORR_RESPUESTA_BECA', String(CORR_RESPUESTA_BECA));
        data.append('Archivo', archivo, archivo.name);
        return this.repo.reemplazarArchivo(data);
    }
}
