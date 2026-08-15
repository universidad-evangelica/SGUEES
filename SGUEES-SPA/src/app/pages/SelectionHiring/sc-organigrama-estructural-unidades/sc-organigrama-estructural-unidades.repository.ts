import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
    providedIn: 'root',
})
export class SC_OrganigramaEstructuralUnidadesRepository {
    readonly xController = 'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES';

    constructor(private objData: CData) {}

    // ======================================================
    // MÉTODOS DE UNIDADES
    // ======================================================

    get(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    create(model: any): Observable<IResult> {
        return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
    }

    update(model: any, xWhere: IParam[]): Observable<IResult> {
        return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
    }

    delete(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
    }

    // ======================================================
    // MÉTODOS DE NIVELES (usando el mismo controlador)
    // ======================================================

    getNiveles(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetNiveles', xWhere, environment.UrlGENERALAPI);
    }

    getNivel(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetNivel', xWhere, environment.UrlGENERALAPI);
    }

    createNivel(model: any): Observable<IResult> {
        return this.objData.Post(model, this.xController, 'Nivel', environment.UrlGENERALAPI);
    }

    updateNivel(model: any, xWhere: IParam[]): Observable<IResult> {
        return this.objData.Put(model, this.xController, 'Nivel', xWhere, environment.UrlGENERALAPI);
    }

    deleteNivel(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Delete(this.xController, 'Nivel', xWhere, environment.UrlGENERALAPI);
    }

    getNivelesActivos(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetNivelesActivos', xWhere, environment.UrlGENERALAPI);
    }
}