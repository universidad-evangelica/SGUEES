import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoRepository {
    // Qué hace: cliente del encabezado ACA_PROSPECTO de la solicitud de beca.
    // Cómo lo hace: la ruta no es ACA_PROSPECTO; esa ya la usa nuevo ingreso.
    readonly xController = 'ACA_PROSPECTO_BECA_PROSPECTO';

    constructor(private objData: CData) {}

    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    get(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
    }
}
