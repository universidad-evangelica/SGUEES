import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';
import { BecaResolucion } from './models/beca-flujo';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoBecaRepository {
    readonly xController = 'ACA_PROSPECTO_BECA';

    constructor(private objData: CData) {}

    // Qué hace: listado de solicitudes de beca del ciclo.
    getAll(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
    }

    getFlujo(id:number):Observable<IResult> { return this.objData.Get(this.xController,'GetFlujo',[{Parameter:'CORR_PROSPECTO_BECA',Value:id}],environment.UrlGENERALAPI); }
    getBitacoraFlujo(id:number):Observable<IResult> { return this.objData.Get(this.xController,'GetBitacoraFlujo',[{Parameter:'CORR_PROSPECTO_BECA',Value:id}],environment.UrlGENERALAPI); }
    getBitacora(id:number):Observable<IResult> { return this.objData.Get(this.xController,'GetBitacora',[{Parameter:'CORR_PROSPECTO_BECA',Value:id}],environment.UrlGENERALAPI); }
    resolver(accion:'IniciarRevision'|'Otorgar'|'NoOtorgar',data:BecaResolucion):Observable<IResult> { return this.objData.Post(data,this.xController,accion,environment.UrlGENERALAPI); }
}
