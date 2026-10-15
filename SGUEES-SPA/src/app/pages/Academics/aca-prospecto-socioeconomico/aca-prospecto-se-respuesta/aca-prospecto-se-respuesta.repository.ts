import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoSeRespuestaRepository {
    readonly xController = 'ACA_PROSPECTO_SE_RESPUESTA';

    constructor(private objData: CData) {}

    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    get(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: guarda en lote las respuestas del prospecto (PUT ACA_PROSPECTO_SE_RESPUESTA/Guardar).
    guardar(payload: any): Observable<IResult> {
        return this.objData.Put(payload, this.xController, 'Guardar', [], environment.UrlGENERALAPI);
    }
}
