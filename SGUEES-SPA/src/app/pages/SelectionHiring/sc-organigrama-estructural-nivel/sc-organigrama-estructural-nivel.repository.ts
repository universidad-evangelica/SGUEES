import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class SC_OrganigramaEstructuralNivelRepository {
    readonly xController = 'SC_ORGANIGRAMA_ESTRUCTURAL_NIVEL';

    constructor(private objData: CData) {}

    getNiveles(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    getNivel(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
    }

    createNivel(model: any): Observable<IResult> {
        return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
    }

    updateNivel(model: any, xWhere: IParam[]): Observable<IResult> {
        return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
    }

    deleteNivel(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
    }

    getNivelesActivos(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }
}
