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
        return this.objData.Get(this.xController, 'GetCORR_CARRERA_ACA_PROSPECTO_NUEVO_INGRESO', xWhere, environment.UrlGENERALAPI);
    }

    getModalidades(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetCORR_MODALIDAD_ACA_PROSPECTO_NUEVO_INGRESO', xWhere, environment.UrlGENERALAPI);
    }

    getCiclos(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetCICLO_ACA_PROSPECTO_NUEVO_INGRESO', xWhere, environment.UrlGENERALAPI);
    }

    validarCambio(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetVALIDAR_CAMBIO_ACA_PROSPECTO_NUEVO_INGRESO', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: PUT estándar (body + PK en query).
    update(model: any, xWhere: IParam[]): Observable<IResult> {
        return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: consulta si el usuario de la sesión es el ejecutor del paso actual.
    getPuedeAprobar(xWhere: IParam[]): Observable<IResult> {
        return this.objData.Get(this.xController, 'GetPuedeAprobar', xWhere, environment.UrlGENERALAPI);
    }

    // Qué hace: aprueba la solicitud y deja el comentario en la bitácora.
    aprobar(model: any): Observable<IResult> {
        return this.objData.Put(model, this.xController, 'Aprobar', [], environment.UrlGENERALAPI);
    }
}
