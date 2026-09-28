import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBecaRepository {
    readonly xController = 'ACA_PROSPECTO_BECA';

    constructor(private objData: CData) {}

    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    getRespuestas(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetRespuestas', xWhere, environment.UrlGENERALAPI);
    }

    getArchivos(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetArchivos', xWhere, environment.UrlGENERALAPI);
    }

    getArchivo(xWhere: IParam[]): Observable<Blob> {
        return this.objData.GetBlob(this.xController, 'GetArchivo', xWhere, environment.UrlGENERALAPI);
    }

    getOpciones(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetOpciones', xWhere, environment.UrlGENERALAPI);
    }

    guardarRespuesta(model: unknown): Observable<IResult> {
        return this.objData.Put(model, this.xController, 'GuardarRespuesta', [], environment.UrlGENERALAPI);
    }

    reemplazarArchivo(model: FormData): Observable<IResult> {
        return this.objData.Post(model, this.xController, 'ReemplazarArchivo', environment.UrlGENERALAPI);
    }
}
