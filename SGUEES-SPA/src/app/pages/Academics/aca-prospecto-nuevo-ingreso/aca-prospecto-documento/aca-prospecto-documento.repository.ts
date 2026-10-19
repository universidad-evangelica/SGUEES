import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoDocumentoRepository {
    readonly xController = 'ACA_PROSPECTO_DOCUMENTO';

    constructor(private objData: CData) {}

    // Qué hace: documentos que aplican a la solicitud de nuevo ingreso.
    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: descarga el archivo para abrirlo en el navegador.
    getArchivo(xWhere: IParam[]): Observable<Blob> {
        return this.objData.GetBlob(this.xController, 'GetArchivo', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: quita el archivo cargado y deja el documento sin archivo.
    quitarArchivo(CORR_PROSPECTO: number, CORR_DOCUMENTO_ADMISION: number): Observable<IResult> {
        const data = new FormData();
        data.append('CORR_PROSPECTO', String(CORR_PROSPECTO));
        data.append('CORR_DOCUMENTO_ADMISION', String(CORR_DOCUMENTO_ADMISION));
        return this.objData.Post(data, this.xController, 'QuitarArchivo', environment.UrlGENERALAPI);
    }

    // Qué hace: envía el archivo del documento seleccionado.
    cargarArchivo(model: FormData): Observable<IResult> {
        return this.objData.Post(model, this.xController, 'CargarArchivo', environment.UrlGENERALAPI);
    }
}
