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
    readonly xController = 'ACA_PROSPECTO';

    constructor(private objData: CData) {}

    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    get(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: oferta académica para el cambio de carrera (carreras del ciclo y sus modalidades).
    getCarreras(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetCORR_CARRERA_ACA_PROSPECTO', xWhere, environment.UrlGENERALAPI);
    }

    getModalidades(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetCORR_MODALIDAD_ACA_PROSPECTO', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: PUT estándar (body + PK en query).
    update(model: any, xWhere: IParam[]): Observable<IResult> {
        return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
    }
}
