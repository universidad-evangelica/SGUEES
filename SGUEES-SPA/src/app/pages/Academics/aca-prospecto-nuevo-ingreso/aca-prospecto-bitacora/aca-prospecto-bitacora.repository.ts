import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBitacoraRepository {
    readonly xController = 'ACA_PROSPECTO_BITACORA';

    constructor(private objData: CData) {}

    // Qué hace: cambios registrados al editar la solicitud.
    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: guarda el comentario de lo que cambió en esta edición.
    create(model: any): Observable<IResult> {
        return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
    }
}
