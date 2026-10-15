import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBecaRespuestaRepository {
    readonly xController = 'ACA_PROSPECTO_BECA_RESPUESTA';

    constructor(private objData: CData) {}

    // Qué hace: preguntas del cuestionario de la solicitud, con la respuesta guardada.
    getRespuestas(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetRespuestas', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: opciones de una pregunta de selección.
    getOpciones(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetOpciones', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: guarda las respuestas editadas del cuestionario.
    guardarRespuesta(model: unknown): Observable<IResult> {
        return this.objData.Put(model, this.xController, 'GuardarRespuesta', [], environment.UrlGENERALAPI);
    }
}
