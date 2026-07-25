import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoActorRepository {
    readonly xController = 'SEG_FLUJO_ACTOR';

    constructor(private objData: CData) {}

    get(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    create(model: any): Observable<IResult> {
        return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
    }

    getEmpleados(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetEmpleadosByUnidad', xWhere, environment.UrlGENERALAPI);
    }
    update(model: any, xWhere: IParam[]): Observable<IResult> {
        return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
    }

    delete(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
    }
}