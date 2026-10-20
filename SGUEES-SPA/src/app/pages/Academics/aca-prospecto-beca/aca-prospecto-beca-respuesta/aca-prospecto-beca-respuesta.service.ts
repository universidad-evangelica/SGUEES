import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaProspectoBecaRespuestaRepository } from './aca-prospecto-beca-respuesta.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBecaRespuestaService {
    constructor(private repo: AcaProspectoBecaRespuestaRepository) {}

    // Qué hace: cuestionario de una solicitud de beca.
    // Cómo lo hace: filtra V_ACA_PROSPECTO_BECA_RESPUESTA por la solicitud abierta.
    getRespuestas(CORR_PROSPECTO_BECA: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_BECA', Value: CORR_PROSPECTO_BECA }];
        return this.repo.getRespuestas(xWhere);
    }

    // Qué hace: opciones de una pregunta para armar el combo al editar.
    getOpciones(CORR_PREGUNTA_BECA: number): Observable<IResult> {
        return this.repo.getOpciones([{ Parameter: 'CORR_PREGUNTA_BECA', Value: CORR_PREGUNTA_BECA }]);
    }

    // Qué hace: envía las respuestas corregidas y el API recalcula el puntaje.
    guardarRespuesta(model: unknown): Observable<IResult> {
        return this.repo.guardarRespuesta(model);
    }
}
