import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBecaArchivoRepository {
    readonly xController = 'ACA_PROSPECTO_BECA_ARCHIVO';

    constructor(private objData: CData) {}

    // Qué hace: documentos cargados en las preguntas tipo archivo de la solicitud.
    getArchivos(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetArchivos', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: descarga el archivo para abrirlo en el navegador.
    getArchivo(xWhere: IParam[]): Observable<Blob> {
        return this.objData.GetBlob(this.xController, 'GetArchivo', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: sustituye el archivo de una respuesta tipo documento.
    reemplazarArchivo(model: FormData): Observable<IResult> {
        return this.objData.Post(model, this.xController, 'ReemplazarArchivo', environment.UrlGENERALAPI);
    }
}
