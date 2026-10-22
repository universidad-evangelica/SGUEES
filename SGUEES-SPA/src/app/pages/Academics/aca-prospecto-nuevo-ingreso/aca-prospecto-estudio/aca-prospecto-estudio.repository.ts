import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoEstudioRepository {
    readonly xController = 'ACA_PROSPECTO_ESTUDIO';

    constructor(private objData: CData) {}

    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    get(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: PUT estándar (body + PK en query).
    update(model: any, xWhere: IParam[]): Observable<IResult> {
        return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: POST estándar (body completo).
    create(model: any): Observable<IResult> {
        return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
    }

    // Qué hace: DELETE estándar (solo PK en query).
    delete(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
    }
}
